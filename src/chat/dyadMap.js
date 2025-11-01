// src/chat/dyadMap.js
const fs = require("fs");
const path = require("path");

const MAP_DIR = path.join(__dirname, "../../config");
const MAP_FILE = path.join(MAP_DIR, "dyad_map.json");

function loadMap() {
  if (!fs.existsSync(MAP_DIR)) fs.mkdirSync(MAP_DIR, { recursive: true });
  if (!fs.existsSync(MAP_FILE)) {
    const init = { lastIndex: -1, channels: {} }; // so first assign becomes index 0 => "a"
    fs.writeFileSync(MAP_FILE, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
  try {
    const raw = fs.readFileSync(MAP_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    const fallback = { lastIndex: -1, channels: {} };
    fs.writeFileSync(MAP_FILE, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

function saveMap(map) {
  if (!fs.existsSync(MAP_DIR)) fs.mkdirSync(MAP_DIR, { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
}

/**
 * Get he condition for a channel.
 * - If channel already exists, returns stored condition.
 * - Otherwise throws an error.
 */
function getConditionForChannel(channelId) {
  const map = loadMap();

  if (map.channels[channelId]?.condition) {
    return map.channels[channelId].condition;
  } else {
    throw new Error(`Channel ${channelId} not found in dyad map`);
  }
}

/**
 * Set the condition for a channel based on the condition parameter.
 */
function setConditionForChannel(channelId, condition, sessionID) {
  const map = loadMap();

  map.channels[channelId] = {
    condition,
    sessionID,
    assignedAt: new Date().toISOString()
  };
  saveMap(map);
}

module.exports = { getConditionForChannel, setConditionForChannel };