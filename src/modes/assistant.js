const getAIResponse = require('../ai/openai'); // AI function
const { sendMessage } = require("../chat/slack_write"); // Slack message sender

// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const thinkingMessages = [
  "Thinking...",
  "That's a good question, give me a second to think about it.",
  "Hmm...",
  "Let me consider that for a moment.",
  "Interesting... give me a second.",
  "Let me look into that..."
];

async function handleAssistant(text, systemPrompt, channel) {
  const thinkingMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
  await sendMessage(channel, thinkingMessage);
  
  const aiResponse = await getAIResponse(text, systemPrompt);
  return aiResponse;
}

// Function to return the Assistant welcome message
function getAssistantWelcomeMessage() {
  return `
    *WELCOME TO THE ZOO TASK*

I’m your *AI assistant*. I will listen to your conversation and only respond if you mention "@AI".

Your goal is to create a *public feeding schedule* that attracts visitors but doesn’t overly stress the animals.

If you need help, just type "@AI" and I’ll assist!

Begin when you 're ready!
  `;
}

module.exports = { handleAssistant, getAssistantWelcomeMessage };
