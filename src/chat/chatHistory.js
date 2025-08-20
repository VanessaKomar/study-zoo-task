const fs = require("fs");
const path = require("path");
const { summarizeChatHistory, saveChatSummary } = require("./summarizeChat"); // Import summarization function

const chatHistoryRoot = path.join(__dirname, "../../chat_History"); // TODO currectly only accesses chat_History folder instead of a file
const TOKEN_LIMIT = 4000; // Set a limit for when summarization should happen

// Ensure base directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function fileForChannel(channelId, sessionID = null) {
  // If sessionID is provided, write under chat_History/<sessionID>/
  const baseDir = sessionID
    ? path.join(chatHistoryRoot, String(sessionID))
    : chatHistoryRoot;
  ensureDir(baseDir);
  return path.join(baseDir, `chatHistory_${channelId}.json`);
}

// Initialize — creates an empty file for this channel if missing
function initializeChatHistory(channelId, sessionID = null) {
  const filePath = fileForChannel(channelId, sessionID);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
  }
}

// Fetch chat history for a specific channel
function getChatHistory(channelId, sessionID = null) {
  try {
    const filePath = fileForChannel(channelId, sessionID);
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`[${channelId}] Error reading chat history:`, error);
    return [];
  }
}

// Append a new message to chat history
async function addMessageToHistory(channelId, user, message, condition = null, sessionID = null) {
  try {
    // Fetch current history
    const filePath = fileForChannel(channelId, sessionID);
    let history = [];
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      history = JSON.parse(data);
    }

    const entry = { user, message, timestamp: new Date().toISOString(), channelId };

    history.push(entry);

    // If serialized history exceeds the limit, summarize per channel
    if (JSON.stringify(history).length > TOKEN_LIMIT) {
      const summarized = await summarizeChatHistory(history);

      if (condition) {
        const fullSummaryText = summarized[0]?.message || null;
        if (fullSummaryText) {
          saveChatSummary(fullSummaryText, condition, channelId);
        }      
      }

      history = summarized;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf8");

    // append to external per-pair, per-channel raw log (line-delimited JSON)
    const fullLogPath = condition ? path.join(__dirname, "..", "..", `chat_Log/${condition}/${channelId}_ChatLog.json`) : null;

    // log to external study file
    appendToStudyLog(entry, fullLogPath);
  } catch (error) {
    console.error(`[${channelId}] Error saving chat history:`, error);
  }
}

const appendToStudyLog = (entry, filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const logLine = JSON.stringify(entry) + "\n"; // Each line = 1 message
  fs.appendFileSync(filePath, logLine, "utf8");
};

// Delete all chatHistory files for a given session (fresh start per session)
function resetChatHistoryForSession(sessionID) {
  if (!sessionID) return;
  const dir = path.join(chatHistoryRoot, String(sessionID));
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { initializeChatHistory, getChatHistory, addMessageToHistory, resetChatHistoryForSession };