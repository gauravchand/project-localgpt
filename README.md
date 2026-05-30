# Local Chat Application

A modern, full-featured chat application that integrates with Ollama and the Gemma 1B model for local AI conversations.

last updated 30th May

**_NOTE: I've made use of a different model (mistral:7b-instruct-q4_0) due to facing errors in gemma:1b model. I found mistral more compatible with my specs: 8gb ram and rtx 3050H. So, make choice only after trying it yourself. That's the point of experimenting anyway :)_**

**Note2- Fixed some issues:**

_1. Fixed the two new chat appearing bug (due to bugs, two new chats appeared at the app boot up)._

_2. Fixed the context error (when trying to switch between chats, neither the previous nor the newer chat were accessible)._

_3. Fixed the storage bug (context: after clicking new chat, the old chat's content disappeared and wouldn't be accessed)._

# The current version gives output in decent speed (as the difficulty of the question increases, the time taken to be answered increases too).
## Features

- **Real-time Streaming**: Live streaming responses from the LLM
- **Chat Sessions**: Create, manage, and organize multiple chat sessions
- **Message Interruption**: Stop generation mid-stream when needed
- **Persistent Storage**: PostgreSQL database for storing conversations locally
- **Modern UI**: Clean, responsive interface inspired by ChatGPT
- **Local & Private**: All data stays on your machine

## Tech Stack

- **Frontend**: Next.js 13+ with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with Node.js
- **Database**: PostgreSQL
- **LLM**: Ollama with Gemma 1B model
- **UI Components**: shadcn/ui with Radix UI primitives

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Ollama** installed and running locally
3. **Gemma 1B model** downloaded in Ollama

### Installing Ollama and Gemma 1B

1. Install Ollama from [ollama.ai](https://ollama.ai)

2. Download the Gemma 1B model:
   ```bash
   ollama pull gemma3:1b
   ```

3. Start Ollama (it usually runs automatically):
   ```bash
   ollama serve
   ```

4. Verify the model is available:
   ```bash
   ollama list
   ```

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

The application is configured to connect to Ollama at `http://localhost:11434` by default. You can modify this in `lib/llm-client.ts` if needed.

## Usage

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Send Messages**: Type your message and press Enter or click the send button
3. **Stop Generation**: Click the stop button to interrupt the AI response
4. **Manage Sessions**: Rename or delete chat sessions from the sidebar
5. **View History**: All your conversations are saved and accessible from the sidebar

## API Endpoints

- `GET /api/sessions` - List all chat sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/[id]` - Get session details and messages
- `PATCH /api/sessions/[id]` - Update session title
- `DELETE /api/sessions/[id]` - Delete a session
- `POST /api/chat` - Send message and stream response

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Ollama Connection Issues

1. Ensure Ollama is running: `ollama serve`
2. Check if the model is available: `ollama list`
3. Test the connection: `curl http://localhost:11434/api/tags`

### Performance Tips

1. The Gemma 1B model is lightweight but may be slow on older hardware
2. Consider using larger models (gemma:7b) for better responses if you have sufficient RAM
3. The application works best with at least 8GB RAM

## License

This project is open source and available under the MIT License.
