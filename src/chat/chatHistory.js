const fs = require("fs");
const path = require("path");
const { summarizeChatHistory, saveChatSummary } = require("./summarizeChat"); // Import summarization function

const chatHistoryDir = path.join(__dirname, "../../chat_History"); // TODO currectly only accesses chat_History folder instead of a file
const TOKEN_LIMIT = 4000; // Set a limit for when summarization should happen

// Ensure base directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function fileForChannel(channelId) {
  ensureDir(chatHistoryDir);
  return path.join(chatHistoryDir, `chatHistory_${channelId}.json`);
}

// Initialize (lazy) — creates an empty file for this channel if missing
function initializeChatHistory(channelId) {
  const filePath = fileForChannel(channelId);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
  }
}

// Fetch chat history for a specific channel
function getChatHistory(channelId) {
  try {
    const filePath = fileForChannel(channelId);
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`[${channelId}] Error reading chat history:`, error);
    return [];
  }
}


// // Ensure chat history file exists
// function initializeChatHistory() {
//   fs.writeFileSync(chatHistoryFile, JSON.stringify([], null, 2), "utf8");
// }

// // Fetch chat history
// function getChatHistory() {
//   try {
//     if (!fs.existsSync(chatHistoryFile)) return [];
//     const data = fs.readFileSync(chatHistoryFile, "utf8");
//     return JSON.parse(data);;
//   } catch (error) {
//     console.error("Error reading chat history:", error);
//     return [];
//   }
// }

// Append a new message to chat history
async function addMessageToHistory(channelId, user, message, pairID = null) {
  try {
    // Fetch current history
    const filePath = fileForChannel(channelId);
    let history = [];
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      history = JSON.parse(data);
    }

    const entry = {
      user,
      message,
      timestamp: new Date().toISOString(),
      channelId
    };

    history.push(entry);

    // If serialized history exceeds the limit, summarize per channel
    if (JSON.stringify(history).length > TOKEN_LIMIT) {
      const summarized = await summarizeChatHistory(history);

      if (pairID) {
        const fullSummaryText = summarized[0]?.message || null;
        if (fullSummaryText) {
          saveChatSummary(fullSummaryText, pairID, channelId);
        }      
      }

      history = summarized;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf8");

    // append to external per-pair, per-channel raw log (line-delimited JSON)
    const fullLogPath = pairID ? path.join(__dirname, "..", "..", `chat_Log/${pairID}/${channelId}_ChatLog.json`) : null;
    // if (pairID) {
    //   const fullLogPath = path.join(__dirname, "..", "..", `chat_Log/${pairID}/${channelId}_ChatLog.json`);
    // }
    // log to external study file
    appendToStudyLog(entry, fullLogPath);
  } catch (error) {
    console.error(`[${channelId}] Error saving chat history:`, error);
  }
}

const appendToStudyLog = (entry, filePath) => {
  // if (!filePath) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const logLine = JSON.stringify(entry) + "\n"; // Each line = 1 message
  fs.appendFileSync(filePath, logLine, "utf8");
};

module.exports = { initializeChatHistory, getChatHistory, addMessageToHistory };