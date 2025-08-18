const getAIResponse = require("../ai/openai"); // AI function

// Function to introduce a delay before AI responds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleColleague(text, systemPrompt) {
  const aiResponse = await getAIResponse(text, systemPrompt);
  
  if (aiResponse === "..." || !aiResponse ) {
    return null;
  }

  // add typing delay
  const averageTypingSpeed = 40;
  const typingDelay = Math.min(3000, (aiResponse.length / averageTypingSpeed) * 1000);
  await new Promise(resolve => setTimeout(resolve, typingDelay));

  return aiResponse;
}

// Function to return the Assistant welcome message
function getColleagueWelcomeMessage() {
  return `
    *WELCOME TO THE ZOO TASK*

I’m your *AI colleague*. I am AI but also a participant on this task.

Your goal is to create a *public feeding schedule* that attracts visitors but doesn’t overly stress the animals.

Begin when you 're ready!
`;
}

// Helper: Calculate average delay from the last 3 participant messages
function calculateAverageDelay(chatHistory) {
  if (chatHistory.length < 2) return 10000; // Default to 10 seconds if not enough data
  // Use the last three messages, or as many as available.
  const recentMessages = chatHistory.slice(-3);
  let intervals = [];
  for (let i = 1; i < recentMessages.length; i++) {
    const diff = new Date(recentMessages[i].timestamp).getTime() -
                 new Date(recentMessages[i - 1].timestamp).getTime();
    intervals.push(diff);
  }
  if (intervals.length === 0) return 10000;
  const avgDelay = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  return avgDelay;
}

module.exports = { handleColleague, getColleagueWelcomeMessage, calculateAverageDelay };