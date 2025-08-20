// src/chat/dyadMap.js
const fs = require("fs");
const path = require("path");

const MAP_DIR = path.join(__dirname, "../../config");
const MAP_FILE = path.join(MAP_DIR, "dyad_map.json");
const CONDITIONS = ["a", "c", "m", "x"]; // 0=a,1=c,2=m,3=x (cycles)

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
 * Get (or assign) the condition for a channel.
 * - If channel already exists, returns stored condition.
 * - Otherwise assigns next condition in the cycle, stores sessionID + timestamp, and persists.
 */
function getConditionForChannel(channelId, sessionID) {
  const map = loadMap();

  if (map.channels[channelId]?.condition) {
    return map.channels[channelId].condition;
  }

  // Assign next
  const nextIndex = ((map.lastIndex ?? -1) + 1) % CONDITIONS.length;
  const condition = CONDITIONS[nextIndex];
  map.channels[channelId] = {
    condition,
    sessionID,                 // session that first saw this channel
    assignedAt: new Date().toISOString()
  };
  map.lastIndex = nextIndex;

  saveMap(map);
  return condition;
}

module.exports = { getConditionForChannel };