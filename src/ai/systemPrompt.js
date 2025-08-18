const fs = require("fs");
const path = require("path");
const prompt_a = require("../system/assistant"); // Task instructions for Assistant mode
const prompt_c = require("../system/colleague"); // Task instructions for Colleague mode
const prompt_m = require("../system/moderator"); // Task instructions for Moderator mode

// Generate system prompt dynamically
function generateSystemPrompt(chatHistory, mode) {
  const boardData = readJSON("boardData.json");
  const boardDetails = readJSON("boardDetails.json");
  let prompt = "";

  // Load the correct system prompt for the selected mode
  if (mode === "a") {
    prompt = prompt_a;
  } else if (mode === "c") {
    prompt = prompt_c;
  } else if (mode === "m") {
    prompt = prompt_m;
    
    return `
      ${prompt}
      Conversation History (Summarized if long):
      ${JSON.stringify(chatHistory, null, 2)}
    `;
  }

  return `
    ${prompt}

    <BOARD DETAILS>
    ${JSON.stringify(boardDetails, null, 2)}

    -- -- -- -- --INFORMATION END-- -- -- -- --
    
    Conversation History (Summarized if long):
    ${JSON.stringify(chatHistory, null, 2)}
    `;
}

// Helper function to read JSON from a file
const readJSON = (relativePath) => {
  const filePath = path.join(__dirname, "../../public", relativePath);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

module.exports = { generateSystemPrompt };