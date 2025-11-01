const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

async function sendMessage(channel, text) {
  try {
    await web.chat.postMessage({ channel, text });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function joinChannel(channelId, channelName) {
  try {
    await web.conversations.join({ channel: channelId });
  } catch (error) {
    console.error(`[${channelId}] Error joining channel ${channelName}:`, error);
  }
}

module.exports = { sendMessage, joinChannel };
