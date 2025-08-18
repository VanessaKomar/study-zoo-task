const getAIResponse = require("../ai/openai"); // AI function
const moderatorPrompts = require("../system/moderatorPrompts");

// Function to introduce a delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let currentPhase = "INTRO";
let promptIndex = 0;

// Helper to get current prompt
function getCurrentPrompt() {
  return moderatorPrompts[currentPhase]?.[promptIndex] || null;
}

function getNextPhase() {
  const phases = Object.keys(moderatorPrompts);
  const nextIndex = phases.indexOf(currentPhase) + 1;
  return phases[nextIndex] || null;
}

function getNextPrompt() {
  const phasePrompts = moderatorPrompts[currentPhase] || [];
  const next = phasePrompts[promptIndex + 1];

  // If no next in current phase, preview the first from the next phase
  if (!next) {
    const nextPhase = getNextPhase();
    return moderatorPrompts[nextPhase]?.[0] || null;
  }

  return next;
}

function advancePhase() {
  const nextPhase = getNextPhase();
  if (nextPhase) {
    currentPhase = nextPhase;
    promptIndex = 0;
  } else {
    console.log("Moderator prompts complete.");
  }
}

// Main function: Move forward when user types "NEXT"
async function handleModeratorMode_Basic(text) {
  const normalized = text.trim().toLowerCase();
  const currentPrompt = getCurrentPrompt();

  if (!currentPrompt) return null;

  // If user types "NEXT", go to the next prompt
  if (normalized === "next") {
    promptIndex += 1;
    const nextPrompt = getCurrentPrompt();

    if (!nextPrompt) {
      advancePhase();
      return getCurrentPrompt();
    }

    return nextPrompt;
  }

  // If not "NEXT", don’t do anything
  return null;
}

// Function to send the next prompt for the current phase
async function handleModeratorMode(text, prompt) {  
  const currentPrompt = getCurrentPrompt();
  const nextPrompt = getNextPrompt();
  
  if (!currentPrompt || !nextPrompt) return null;

  const systemPrompt = `
  Here is the most recent message sent by a user: ${text}
  
  ${prompt}

  -- --CURRENT PROMPT START-- --
  "${currentPrompt}"
  -- --CURRENT PROMPT END-- --
  -- --NEXT PROMPT START-- --
  "${nextPrompt}"
  -- --NEXT PROMPT END-- --
  `;

  const decision = await getAIResponse("Should I send the next moderator prompt?", systemPrompt);

  if (decision.trim().toLowerCase() === "next") {
    promptIndex += 1;
    const nextPrompt = getCurrentPrompt();

    // If that phase is complete, move to the next phase
    if (!nextPrompt) {
      advancePhase();
      return getCurrentPrompt();
    }

    return nextPrompt;
  }

  // Otherwise, don't send anything new
  return null;
}

// Function to return the Moderator welcome message
function getModeratorWelcomeMessage() {
  return `
    *WELCOME TO THE ZOO TASK*

I’m your *AI moderator*. I’ll guide you through the task step by step.

Your goal is to create a *public feeding schedule* that attracts visitors but doesn’t overly stress the animals.

When you are done with discussing the prompt and are ready to move on send "next" as a separate message.

Let me know when you're ready to begin!
  `;
}

module.exports = { handleModeratorMode, handleModeratorMode_Basic, getModeratorWelcomeMessage };