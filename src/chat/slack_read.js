// ngrok http --url=strictly-sacred-mayfly.ngrok-free.app 80
// node src/chat/slack_read.js <sessionID>

require('dotenv').config();
const { createEventAdapter } = require('@slack/events-api');
const { sendMessage, joinChannel } = require('./slack_write'); // Import sendMessage function
const { getConditionForChannel, setConditionForChannel } = require("./dyadMap");
const { initializeChatHistory, getChatHistory, addMessageToHistory, resetChatHistoryForSession } = require('./chatHistory'); // Import chat history functions
const { generateSystemPrompt } = require('../ai/systemPrompt');
const { handleAssistant, getAssistantWelcomeMessage } = require('../modes/assistant');
const { handleColleague, getColleagueWelcomeMessage, calculateAverageDelay } = require('../modes/colleague');
const { handleModeratorMode, handleModeratorMode_Basic, getModeratorWelcomeMessage } = require("../modes/moderator");
const path = require("path");

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const botID = process.env.BOT_USER_ID;
const userA = process.env.USER_A_ID;
const userB = process.env.USER_B_ID;
const slackEvents = createEventAdapter(slackSigningSecret); // Initialize
const port = 80; // port default 80

const sessionID = process.argv[2]; // id of the session
console.log(`Session Id: ${sessionID}`);

// Optional: allow a fresh start with "--reset"
const shouldReset = process.argv.includes("--reset");
if (shouldReset) {
  resetChatHistoryForSession(sessionID);
  console.log(`[init] Cleared chat history for session ${sessionID}`);
}

// Per-channel state
// Timers for colleague debounce
const pendingResponseTimers = new Map(); // channelId -> timeout handle
// Last AI message timestamp per channel (ms)
const lastAiTimestamp = new Map(); // channelId -> number
// Whether "Done" message (final form) has already been sent per channel
const doneMessageSent = new Set(); // contains channelId


slackEvents.on('message', async (event) => {
  const { text, channel, user } = event;
  if (!channel) return;
  if (user === botID) return; // Ignore bot messages to prevent infinite loops

  if (doneMessageSent.has(channel)) {
    console.log(`[${channel}] Done message already sent, ignoring further messages.`);
    return;
  }

  try {
    // Ensure per-channel history exists
    initializeChatHistory(channel, sessionID);

    // Derive condition for this channel from persistent map
    const condition = getConditionForChannel(channel);

    // Read the messages from this channel's history
    let chatHistory = getChatHistory(channel, sessionID);
    const systemPrompt = generateSystemPrompt(chatHistory, condition);
    let aiResponse = null; // Initialize response as null

    // If this is a brand-new channel history, send the welcome (per condition)
    if (chatHistory.length === 0) {
      let welcomeMessage = "";
      if (condition === "a") {
        welcomeMessage = getAssistantWelcomeMessage();
      } else if (condition === "c") {
        welcomeMessage = getColleagueWelcomeMessage();
      } else if (condition === "m") {
        welcomeMessage = getModeratorWelcomeMessage();
      } else if (condition === "x") {
        welcomeMessage = getControlWelcomeMessage();
      }

      if (welcomeMessage) {
        await sendMessage(channel, welcomeMessage);
        await addMessageToHistory(channel, "AI", welcomeMessage, condition, sessionID);
        lastAiTimestamp.set(channel, Date.now());
      } return;
    }
    // Always log user messages
    await addMessageToHistory(channel, getUserLabel(user), text, condition, sessionID);

    // If finalization triggered
    if (text.trim().toLowerCase() === "done" && !doneMessageSent.has(channel)) {
      const finalMessage = getFinalMessage();

      await sendMessage(channel, finalMessage);
      await addMessageToHistory(channel, "AI", finalMessage, condition, sessionID);
      doneMessageSent.add(channel);
      return; // Don't process further
    }

    if (condition === "x") return;  // If control condition -> no AI responses, just logging

    if (condition === "c") { // Colleague condition
      // Colleague condition with debounce based on average human delay in this channel
      const avgDelay = calculateAverageDelay(chatHistory);

      // Reset any existing timer for this channel
      const existing = pendingResponseTimers.get(channel);
      if (existing) clearTimeout(existing);

      const handle = setTimeout(async () => {
        // Refresh latest history at fire time
        const latestHistory = getChatHistory(channel, sessionID);
        const lastAi = lastAiTimestamp.get(channel) || 0;
        const recentMessages = latestHistory.filter(
          (msg) => new Date(msg.timestamp).getTime() > lastAi
        );
        const recentChatHistory = recentMessages.map((m) => m.message).join("\n");

        const response = await handleColleague( recentChatHistory, systemPrompt, channel, latestHistory );
        if (response) {
          await addMessageToHistory(channel, "AI", response, condition, sessionID);
          await sendMessage(channel, response);
          lastAiTimestamp.set(channel, Date.now());
        }
        pendingResponseTimers.delete(channel);
      }, avgDelay);

      pendingResponseTimers.set(channel, handle);
    } else {
      // Assistant replies only when @mentioned; Moderator replies on every message
      if (condition === "a" && text.includes(botID)) {
        aiResponse = await handleAssistant(text, systemPrompt, channel);
      } else if (condition === "m") {
        // aiResponse = await handleModeratorMode(text, systemPrompt);
        aiResponse = await handleModeratorMode_Basic(text);
      }

      if (aiResponse) {
        await addMessageToHistory(channel, "AI", aiResponse, condition, sessionID);
        await sendMessage(channel, aiResponse);
        lastAiTimestamp.set(channel, Date.now());
      }
    }
  } catch (error) {
    console.error(`[${event.channel}] Error processing AI response:`, error);
  }
});

slackEvents.on('channel_created', async (event) => {
  const channelId = event.channel.id;
  const channelName = event.channel.name;  
  const channelPattern = /^[acmx]\d{1,3}$/;

  if(channelPattern.test(channelName)) {
    await joinChannel(channelId, channelName);
    setConditionForChannel(channelId, channelName.charAt(0), sessionID);
  } else {
    console.log(`Channel name ${channelName} does not match pattern, not joining.`);
  }
});

(async () => {  
  await slackEvents.start(port); // Start the built-in server
})();

// Function to return "Done" message
function getFinalMessage() {
  // doneMessageSent = true;
  return `
    *END OF THE TASK*, please use this format to *SUBMIT YOUR FINAL SOLUTION* (feeding route + explanation) in the Slack chat.
    You have 5 minutes to complete this. I will notify you when the time is up

Morning
Animal 1: _____
Animal 2: _____
Explanation: ______

Midday
Animal 1: _____
Animal 2: _____
Explanation: ______

Afternoon
Animal 1: _____
Animal 2: _____
Explanation: ______

Evening
Animal 1: _____
Animal 2: _____
Explanation: ______
  `;
}

// Function to return the Control welcome message
function getControlWelcomeMessage() {

  return `
    *WELCOME TO THE ZOO TASK*

Your goal is to create a *public feeding schedule* that attracts visitors but doesn’t overly stress the animals.

Begin when you're ready!
  `;
}

function getUserLabel(userId) {
  if (userId === userA) return "Participant A";
  if (userId === userB) return "Participant B";
  if (userId === botID) return "AI";
  return userId; // fallback, just in case
}