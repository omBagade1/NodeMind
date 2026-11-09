# Contributing to NodeMind 🧠

Thank you for your interest in contributing to NodeMind! We welcome contributions of all kinds—bug reports, documentation improvements, new developer tools, and feature pull requests.

## Code of Conduct
Please be polite, respectful, and collaborative.

## Getting Started

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/NodeMind.git
   cd NodeMind
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

4. **Ensure Ollama is Running**:
   Make sure you have [Ollama](https://ollama.com/) running locally with `llama3.2`:
   ```bash
   ollama run llama3.2
   ```

5. **Run the Test Suite**:
   ```bash
   npm test
   ```

## Development Guidelines

- **ES Modules**: This project uses native ES Modules (`"type": "module"`). Use `import` / `export` syntax.
- **Safety First**: All tools interacting with the filesystem or terminal must respect `resolveSafePath` from `src/utils/pathGuard.js`.
- **System Prompt Integrity**: Preserve the core operating guidelines in `src/agent/prompts.js`.
- **Keep It Lean**: Minimize external dependencies; leverage Node.js built-ins wherever possible.

## Submitting Pull Requests

1. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add docker healthcheck"
   ```
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request on GitHub describing your changes and testing performed.
