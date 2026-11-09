# NodeMind 🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-llama3.2-blue.svg)](https://ollama.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A local, autonomous AI Developer Agent built with Node.js, Express, and Ollama (`llama3.2`).

NodeMind operates directly in your software development workspace with autonomous tool execution, strict directory boundary safety guards, multi-turn session memory, and an interactive CLI.

---

## Features

- **ReAct Execution Loop**: Reason + Act autonomous multi-step reasoning.
- **Autonomous Developer Tools**:
  - `read_file` (with context truncation protection)
  - `write_file` (with automatic recursive directory creation)
  - `list_directory` (directory mapping with file sizes and emojis)
  - `search_codebase` (fast text and symbol search across workspace files, automatically filtering `node_modules` and binary files)
  - `git_status` (inspect working tree status of staged/untracked files)
  - `git_diff` (line-by-line diff review of code changes)
  - `run_command` (terminal command execution with dangerous command safety blocklist and 30s timeout)
- **Path Guard Security**: Automatic full permissions inside the workspace directory; interactive approval with 120s timeout for paths outside the workspace.
- **Multi-Turn Session Memory**: Stateful conversation memory across HTTP requests via session IDs with 1-hour auto-expiration.
- **Interactive CLI**: Terminal REPL mode for chatting with NodeMind directly in your console.
- **Docker Ready**: Complete `Dockerfile` and `docker-compose.yml` pre-configured to communicate with host Ollama.
- **100% Local & Private**: Powered by local Ollama models with zero cloud API costs.

---

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Ollama](https://ollama.com/) with `llama3.2`:
  ```bash
  ollama run llama3.2
  ```

### 2. Installation
```bash
git clone https://github.com/omBagade1/NodeMind.git
cd NodeMind
npm install
cp .env.example .env
```

### 3. Interactive CLI Mode
Chat with NodeMind directly in your terminal:
```bash
npm run cli
```

### 4. Run the HTTP Server
```bash
npm run dev
```
Server will start at `http://localhost:3000`.

### 5. Run Automated Tests
```bash
npm test
```

---

## Docker Deployment 🐳

Run NodeMind in a lightweight Docker container connected to your host machine's Ollama instance:

```bash
docker compose up -d --build
```

The container connects automatically to your host Ollama via `http://host.docker.internal:11434`.

To stop the container:
```bash
docker compose down
```

---

## API Reference

### Run Agent Task: `POST /agent`

```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Inspect the workspace and search for express usage."
  }'
```

**Response**:
```json
{
  "sessionId": "e13fd9c7-25e3-49d9-88a8-5fd751ea4705",
  "reply": "The project uses Express 5.3.0 mounted in src/app.js...",
  "steps": [
    {
      "iteration": 1,
      "tool": "search_codebase",
      "args": { "query": "express" },
      "result": "..."
    }
  ],
  "iterations": 2
}
```

### Multi-Turn Conversation
Pass the returned `sessionId` to continue a conversation:
```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "e13fd9c7-25e3-49d9-88a8-5fd751ea4705",
    "prompt": "Now create a unit test for that endpoint."
  }'
```

### Reset Session: `DELETE /agent/:sessionId`
```bash
curl -X DELETE http://localhost:3000/agent/e13fd9c7-25e3-49d9-88a8-5fd751ea4705
```

---

## Architecture

```
NodeMind/
├── src/
│   ├── agent/
│   │   ├── agent.service.js       # ReAct execution loop & working memory
│   │   ├── session.store.js       # Stateful conversation sessions & TTL cleanup
│   │   └── prompts.js             # System prompt & engineering guidelines
│   ├── tools/
│   │   ├── fileSystem.tools.js    # read_file, write_file, list_directory, search_codebase
│   │   ├── git.tools.js           # git_status, git_diff
│   │   ├── terminal.tools.js      # run_command with security guards
│   │   └── index.js               # Central tool registry
│   ├── controllers/
│   │   ├── agent.controller.js    # Agent run & session endpoints
│   │   └── chat.controller.js     # Direct LLM chat endpoint
│   ├── routes/
│   │   ├── agent.routes.js        # /agent routing
│   │   └── chat.routes.js         # /chat routing
│   ├── utils/
│   │   └── pathGuard.js           # Directory isolation & interactive approvals
│   ├── cli.js                     # Interactive terminal REPL
│   ├── server.js                  # Express server entry point
│   └── app.js                     # Express app configuration
├── Dockerfile                     # Production container spec
├── docker-compose.yml             # Container orchestration
├── CONTRIBUTING.md                # Open source contribution guide
└── LICENSE                        # MIT License
```

---

## Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to report issues or submit pull requests.

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
