# Advanced Zoo Task

## Overview

The Advanced Zoo Task is a complex problem-solving task using a Miro Board and Slack. Participants to work together on creating an optimal public feeding schedule for a zoo. The slack bot serves as a moderator, Colleague, and assistant to interact with the participants on the task. Participants interact via Slack while the bot leverages an LLM (OpenAI API) to provide context-aware responses, suggestions, and facilitate conversation flow during the task.

## Features

- **Multiple Modes:**  
  - **Assistant ("a")**: AI Assistant, responds only when explicitly mentioned with @AI.
  - **Colleague ("c")**: AI Computer Colleague, offers suggestions based on recent conversation activity.
  - **Moderator ("m")**: AI Moderator, guides the conversation through structured moderator prompts.

## Architecture

- **Backend:** Built in Node.js using the Slack Events API.
- **LLM Integration:** Uses OpenAI’s API (via a custom module, e.g., `openai.js`) for generating AI responses.
- **Chat Management:** Maintains conversation history and state (moderator mode, etc.) through custom modules.
- **Modes:** Each mode (assistant, Colleague, moderator) is implemented in its own module under `src/modes`.

## Dependencies

- Node.js (v14+ recommended)
- npm

## Node Modules

The project uses the following npm packages:

- @slack/events-api – For receiving Slack events.
- @slack/web-api – For sending messages to Slack.
- dotenv – For managing environment variables.
- Other dependencies may include custom modules for working with the OpenAI API (or another LLM API).

To install the dependencies, run:

  ```bash
  npm install
  ```

## Node Modules

1. **Clone the repository:**

   ```bash
   git clone https://github.com/VanessaKomar/Masterarbeit.git
   ```

2. **Create a .env File:**

  Create a .env file in the project root with the following environment variables (replace the placeholder values with your actual keys):

   ```dotenv
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   SLACK_BOT_TOKEN=your_slack_bot_token
   BOT_USER_ID=your_bot_user_id
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Configure Your Slack App:**

- Create and configure your Slack app at https://api.slack.com/apps.
- Ensure that the app is installed in your workspace and that you have set the proper scopes for both the Events API and Web API.

## Running the Bot
Run ngrok

Start the Slack bot with the desired mode using one of the following commands:

- Assistant Mode (responds only when explicitly mentioned):

   ```bash
   node slack_read.js a a##
   ```

- Colleague Mode (responds based on conversation pauses):

   ```bash
   node slack_read.js c c##
   ```

- Moderator Mode (guides conversation with a structured script):

   ```bash
   node slack_read.js m m##
   ```

## Directory Structure

   ```bash
   zoo-task-slack-bot/
   ├── components/                       # Components of MiroBoard App
   │   ├── Button.jsx                    
   │   ├── ChatMessage.jsx               
   │   └── PromptInput.jsx               
   ├── pages/                            # MiroBoad App
   │   ├── api/                          # Code to save board information to files
   │   │   ├── saveBoardData.js           
   │   │   └── saveBoardDetails.js           
   │   ├── assets/                        
   │   │   └── style.css           
   │   └── index.js                      # Main handler for Miro App
   ├── public/
   │   ├── boardData.json                # Data on interactions on the board
   │   ├── boardDetails.json             # Data on the zoo task map
   │   └── chatHistory.json              # chatHistory of current conversation
   ├── src/
   │   ├── ai/
   │   │   ├── llamaai.js                # LLM API integration (for generating responses) NOT USED
   │   │   ├── openai.js                 # LLM API integration (for generating responses) USED
   │   │   └── systemPrompt.js           # Builds system prompt from chat history, mode and board info   
   │   ├── chat/
   │   │   ├── chatHistory.js            # Logging and retrieving chat history
   │   │   ├── slack_read.js             # Slack event handling and main logic
   │   │   ├── slack_write.js            # Functions to send messages to Slack
   │   │   └── summarizeChat.js          # Summarizing chat using llm
   │   ├── modes/
   │   │   ├── moderator.js              # Moderator mode logic
   │   │   ├── assistant.js              # Assistant mode logic
   │   │   └── colleague.js              # Colleague mode logic
   │   ├── scores/
   │   │   ├── optimize_strategy.py      # Finding the optimal strategy for the zoo task
   │   │   └── score_animals.py          # Get score based on chosen animals
   │   ├── system/
   │   │   ├── moderator.js              # System prompt for Moderator mode
   │   │   ├── moderatorPrompts.js       # Structured moderator prompt script
   │   │   ├── assistant.js              # System prompt for assistant mode
   │   │   └── colleague.js              # System prompt for Proactive colleague mode
   │   ├── utils/
   │   │   ├── fetchBoardData.js         # Collect board data
   │   └   └── utils.js                  # Helper functions to organize board data
   ├── .env                              # Environment variables (do not commit)
   ├── package.json                      # Project dependencies and scripts
   └── README.md                         # This file
   ```

Author: Vanessa Komar