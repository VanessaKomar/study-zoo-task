const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

async function sendMessage(channel, text) {
  try {
    await web.chat.postMessage({ channel, text });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

module.exports = { sendMessage };
