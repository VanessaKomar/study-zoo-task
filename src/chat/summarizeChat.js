const getAIResponse = require("../ai/openai"); // Import AI function
const path = require("path");
const fs = require("fs");

const SUMMARY_TARGET = 1000; // Target size for summarized history

// Summarize chat history using AI
async function summarizeChatHistory(history) {
  try {
    // If chat history is already small, no need to summarize
    if (history.length <= 3) return history;

    // Extract last 3 messages
    const lastMessages = history.slice(-3);
    const conversationText = history.map(entry => `${entry.user}: ${entry.message}`).join("\n");

    const summaryPrompt = `
      Summarize this conversation to retain important details and context, keeping the summary under ${SUMMARY_TARGET} tokens.
      Focus on key information, decisions, and overall discussion, while omitting unnecessary details. 
      Key information and decisions include which two animals they have decided to feed for morning, midday, afternoon, and evening.
      Omit stating that the ai did not answer something 

      Conversation:
      ${conversationText}
    `;

    const summary = await getAIResponse(summaryPrompt, "You are an assistant summarizing Slack conversations.");

    // Store summary and last 3 messages
    const newHistory = [{ user: "AI", message: summary, timestamp: new Date().toISOString() }, ...lastMessages];
    return newHistory;
  } catch (error) {
    console.error("Error summarizing chat history:", error);
    return history; // If summarization fails, return full history to prevent data loss.
  }
}

function saveChatSummary(summaryText, pairID, channelId) {
  if (!pairID || !channelId) return;

  const filePath = path.join(__dirname, "..", "..", `chat_Log_Summary/${pairID}/chatSummary_${channelId}.json`);
  const summaryDir = path.dirname(filePath);
  if (!fs.existsSync(summaryDir)) {
    fs.mkdirSync(summaryDir, { recursive: true });
  }

  const entry = {
    timestamp: new Date().toISOString(),
    channelId,
    summary: summaryText,
  };

  const logLine = JSON.stringify(entry) + "\n"; // Each line = 1 message
  fs.appendFileSync(filePath, logLine, "utf8");
}

module.exports = { summarizeChatHistory, saveChatSummary };