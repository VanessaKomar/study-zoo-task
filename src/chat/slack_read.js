// ngrok http --url=strictly-sacred-mayfly.ngrok-free.app 80
// node src/chat/slack_read.js <mode> <pairID>

require('dotenv').config();
const { createEventAdapter } = require('@slack/events-api');
const { sendMessage } = require('./slack_write'); // Import sendMessage function
const { initializeChatHistory, getChatHistory, addMessageToHistory } = require('./chatHistory'); // Import chat history functions
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

const mode = process.argv[2]; // Mode for the task
console.log(`AI Mode Selected: ${mode}`); // "a" | "c" | "m" | "x"

const pairID = process.argv[3]; // id of the participant group
console.log(`Group Id: ${pairID}`);

// // Global object to track pending debounce timers per channel
// let pendingResponseTimer = null;
// let lastAiTimestamp = 0; // timestamp (ms) of the last AI response per channel
// const defaultThreshold = 10000; // threshold of 10 seconds (adjust as needed)

// let doneMessageSent = null;

// initializeChatHistory();


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

  try {
    // Ensure per-channel history exists
    initializeChatHistory(channel);

    // Read the messages from this channel's history
    let chatHistory = getChatHistory(channel);
    const systemPrompt = generateSystemPrompt(chatHistory, mode);
    let aiResponse = null; // Initialize response as null

    // If this is a brand-new channel history, send the welcome (per mode)
    if (chatHistory.length === 0) {
      let welcomeMessage = "";
      if (mode === "a") {
        welcomeMessage = getAssistantWelcomeMessage();
      } else if (mode === "c") {
        welcomeMessage = getColleagueWelcomeMessage();
      } else if (mode === "m") {
        welcomeMessage = getModeratorWelcomeMessage();
      } else if (mode === "x") {
        welcomeMessage = getControlWelcomeMessage();
      }

      if (welcomeMessage) {
        await sendMessage(channel, welcomeMessage);
        await addMessageToHistory(channel, "AI", welcomeMessage, pairID);
        // lastAiTimestamp = Date.now();
        lastAiTimestamp.set(channel, Date.now());
      } return;
    }
    // } else if (!doneMessageSent) {
      // Always log user messages
    await addMessageToHistory(channel, getUserLabel(user), text, pairID);

    // If finalization triggered
    if (text.trim().toLowerCase() === "done" && !doneMessageSent.has(channel)) {
      const finalMessage = getFinalMessage();

      await sendMessage(channel, finalMessage);
      await addMessageToHistory(channel, "AI", finalMessage, pairID);
      // doneMessageSent = true;
      doneMessageSent.add(channel);
      return; // Don't process further
    }

    // If control mode -> no AI responses, just logging
    if (mode === "x") return;

    if (mode === "c") { // Colleague Mode
      // Colleague mode with debounce based on average human delay in this channel
      const avgDelay = calculateAverageDelay(chatHistory);

      // Reset any existing timer for this channel
      const existing = pendingResponseTimers.get(channel);
      if (existing) clearTimeout(existing);

      const handle = setTimeout(async () => {
        // Refresh latest history at fire time
        const latestHistory = getChatHistory(channel);
        const lastAi = lastAiTimestamp.get(channel) || 0;
        const recentMessages = latestHistory.filter(
          (msg) => new Date(msg.timestamp).getTime() > lastAi
        );
        const recentChatHistory = recentMessages.map((m) => m.message).join("\n");

        const response = await handleColleague(
          recentChatHistory,
          systemPrompt,
          channel,
          latestHistory
        );
        if (response) {
          await addMessageToHistory(channel, "AI", response, pairID);
          await sendMessage(channel, response);
          lastAiTimestamp.set(channel, Date.now());
        }
        pendingResponseTimers.delete(channel);
      }, avgDelay);

      pendingResponseTimers.set(channel, handle);
    } else {
      // Assistant replies only when @mentioned; Moderator replies on every message
      if (mode === "a" && text.includes(botID)) {
        aiResponse = await handleAssistant(text, systemPrompt, channel);
      } else if (mode === "m") {
        // aiResponse = await handleModeratorMode(text, systemPrompt);
        aiResponse = await handleModeratorMode_Basic(text);
      }

      if (aiResponse) {
        await addMessageToHistory(channel, "AI", aiResponse, pairID);
        await sendMessage(channel, aiResponse);
        lastAiTimestamp.set(channel, Date.now());
      }
    }




    //     // Always clear the existing timer so we reset the countdown with every new message.
    //     if (pendingResponseTimer) {
    //       clearTimeout(pendingResponseTimer);
    //     }

    //     // Set a new timer with the updated delay.
    //     pendingResponseTimer = setTimeout(async () => {
    //       // Refresh chat history before generating a response.
    //       chatHistory = getChatHistory();
    //       // Filter the chat history to only include messages that were sent after the last AI response.
    //       const recentMessages = chatHistory.filter(
    //         msg => new Date(msg.timestamp).getTime() > lastAiTimestamp
    //       );

    //       // Convert these messages to a single string, joining their text.
    //       const recentChatHistory = recentMessages.map(msg => msg.message).join("\n");

    //       aiResponse = await handleColleague(recentChatHistory, systemPrompt, channel, chatHistory);
    //       if (aiResponse) {
    //         await addMessageToHistory("AI", aiResponse, pairID);
    //         await sendMessage(channel, aiResponse);
    //         lastAiTimestamp = Date.now();
    //       }
    //       pendingResponseTimer = null;
    //     }, avgDelay);
    //   } else {
    //     if (text.includes(botID) & mode === "a") {
    //       aiResponse = await handleAssistant(text, systemPrompt, channel);
    //     } else if (mode === "m") {
    //       // aiResponse = await handleModeratorMode(text, systemPrompt);
    //       aiResponse = await handleModeratorMode_Basic(text);
    //     }

    //     if (aiResponse) { // Only store and send AI response if it was generated
    //       await addMessageToHistory("AI", aiResponse, pairID);
    //       await sendMessage(channel, aiResponse);
    //     }
    //   }
    // } else {
    //   // Always log user messages
    //   await addMessageToHistory(getUserLabel(user), text, pairID);
    // }
  } catch (error) {
    console.error(`[${event.channel}] Error processing AI response:`, error);
  }
});

(async () => {  
  // const server = await slackEvents.start(port); // Start the built-in server
  await slackEvents.start(port);
})();

// Function to return "Done" message
function getFinalMessage() {
  doneMessageSent = true;
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