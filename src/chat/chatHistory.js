const fs = require("fs");
const path = require("path");
const { summarizeChatHistory, saveChatSummary } = require("./summarizeChat"); // Import summarization function

const chatHistoryFile = path.join(__dirname, "../../public/chatHistory.json");
const TOKEN_LIMIT = 4000; // Set a limit for when summarization should happen

// Ensure chat history file exists
function initializeChatHistory() {
  // fs.writeFileSync(chatHistoryFile, JSON.stringify({}), "utf8");
  fs.writeFileSync(chatHistoryFile, JSON.stringify([], null, 2), "utf8");
}

// Fetch chat history
function getChatHistory() {
  try {
    if (!fs.existsSync(chatHistoryFile)) return [];
    const data = fs.readFileSync(chatHistoryFile, "utf8");
    // const chatHistories = JSON.parse(data);
    return JSON.parse(data);;
  } catch (error) {
    console.error("Error reading chat history:", error);
    return [];
  }
}

// Append a new message to chat history
async function addMessageToHistory(user, message, pairID = null) {
  try {
    // Fetch current history
    let history = [];
    if (fs.existsSync(chatHistoryFile)) {
      const data = fs.readFileSync(chatHistoryFile, "utf8");
      history = JSON.parse(data);
    }

    const entry = {
      user,
      message,
      timestamp: new Date().toISOString()
    };

    history.push(entry);

    if (JSON.stringify(history).length > TOKEN_LIMIT) {
      const summarized = await summarizeChatHistory(history);

      // const pairID = extractPairIDFromPath(logFilePath);
      if (pairID) {
        const fullSummaryText = summarized[0]?.message || null;
        if (fullSummaryText) {
          saveChatSummary(fullSummaryText, pairID);
        }      
      }

      history = summarized;
    }
    
    fs.writeFileSync(chatHistoryFile, JSON.stringify(history, null, 2), "utf8");

    const fullLogPath = pairID ? path.join(__dirname, "..", "..", `chat_Log/${pairID}_ChatLog.json`) : null;

    // log to external study file
    appendToStudyLog(entry, fullLogPath);
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
}

const appendToStudyLog = (entry, filePath) => {
  if (!filePath) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  const logLine = JSON.stringify(entry) + "\n"; // Each line = 1 message
  fs.appendFileSync(filePath, logLine, "utf8");
};

module.exports = { initializeChatHistory, getChatHistory, addMessageToHistory };