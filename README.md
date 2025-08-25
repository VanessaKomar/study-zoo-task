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

## Prerequisites
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Slack app already created with:
  - **Signing Secret**
  - **Bot Token**
  - Bot added to your workspace and channels
- Ngrok account + **authtoken**
  - Optional: reserved domain (e.g. `my-study.ngrok-free.app`) so URLs don’t change
- OpenAI API key

## One-time setup
1. Clone this repo.

2. Create a `.env` file next to `docker-compose.yml`:
   ```env
   SLACK_SIGNING_SECRET=xxx
   SLACK_BOT_TOKEN=xoxb-xxx
   BOT_USER_ID=UXXXXXXXX
   OPENAI_API_KEY=sk-...
   NGROK_AUTHTOKEN=your-ngrok-authtoken
   NGROK_DOMAIN=your-reserved-subdomain.ngrok-free.app

3. Build the image:
   `docker compose build`

## Running
1. Start ngrok
   `docker compose up -d ngrok`

2. Start a new session (foreground):
   `docker compose run --rm --service-ports zoo-task <sessionID>`

## Directory Structure

   ```bash
   study-zoo-task/
   ├── chat_History/
   │   └── chatHistory_<sessionID>.json  # chatHistory of channel
   ├── chat_Log/                         # chatLog of each condition
   │   ├── a/              
   │   ├── c/
   │   ├── m/
   │   └── x/
   ├── chat_Log_Summary/                # chatLog Summary of each condition
   │   ├── a/              
   │   ├── c/
   │   ├── m/
   │   └── x/
   ├── config/
   │   └── dyad_map.json                # Mapping of each dyad channel with "condition", "sessionID", and "assignedAt"
   ├── docker/
   │   └── entrypoint.sh                # 
   ├── public/
   │   └── boardDetails.json             # Data on the zoo task map
   ├── src/
   │   ├── ai/
   │   │   ├── openai.js                 # LLM API integration (for generating responses)
   │   │   └── systemPrompt.js           # Builds system prompt from chat history, mode and board info   
   │   ├── chat/
   │   │   ├── chatHistory.js            # Logging and retrieving chat history
   │   │   ├── dyadMap.js                # Logic for dyad mapping
   │   │   ├── slack_read.js             # Slack event handling and main logic
   │   │   ├── slack_write.js            # Functions to send messages to Slack
   │   │   └── summarizeChat.js          # Summarizing chat using llm
   │   ├── modes/
   │   │   ├── moderator.js              # Moderator mode logic
   │   │   ├── assistant.js              # Assistant mode logic
   │   │   └── colleague.js              # Colleague mode logic
   │   ├── system/
   │   │   ├── moderator.js              # System prompt for Moderator mode
   │   │   ├── moderatorPrompts.js       # Structured moderator prompt script
   │   │   ├── assistant.js              # System prompt for assistant mode
   │   └   └── colleague.js              # System prompt for Proactive colleague mode
   ├── .env                              # Environment variables (do not commit)
   ├── docker-compose.yml                # 
   ├── dockerfile                        # 
   ├── package.json                      # Project dependencies and scripts
   └── README.md                         # This file
   ```

Author: Vanessa Komar