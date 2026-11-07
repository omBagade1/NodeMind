# NodeMind 🧠

A local, autonomous AI Developer Agent built with Node.js, Express, and Ollama (`llama3.2`).

## Features
- **ReAct Execution Loop**: Reason + Act multi-step reasoning.
- **Autonomous Developer Tools**:
  - `read_file` (with context truncation protection)
  - `write_file` (with automatic directory creation)
  - `list_directory` (directory mapping with file sizes)
  - `run_command` (terminal execution with security blocklist and 30s timeout)
- **Path Guard Security**: Automatic full permissions inside the workspace directory; interactive approval with 120s timeout for paths outside the workspace.
- **Local & Private**: Powered by local Ollama models with zero cloud API costs.

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Ollama](https://ollama.com/) with `llama3.2`:
  ```bash
  ollama run llama3.2
  ```

### 2. Setup
```bash
npm install
cp .env.example .env
```

### 3. Run Test
```bash
npm test
```

### 4. Start Server
```bash
npm run dev
```

## Architecture
```
src/
├── agent/
│   ├── agent.service.js       # ReAct execution loop & working memory
│   └── prompts.js             # System prompt & engineering guidelines
├── tools/
│   ├── fileSystem.tools.js    # read_file, write_file, list_directory
│   ├── terminal.tools.js      # run_command with security guards
│   └── index.js               # Central tool registry
├── utils/
│   └── pathGuard.js           # Directory isolation & interactive approvals
├── config/                    # Environment & runtime config
├── errors/                    # Custom ApiError mapping
└── server.js                  # Entry point
```

## License
ISC
