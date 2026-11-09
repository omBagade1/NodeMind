import readline from 'node:readline/promises';
import { runAgent } from './agent/agent.service.js';
import { config } from './config/index.js';

async function startCli() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n======================================================');
  console.log('🧠 NodeMind CLI - Interactive Developer AI Agent');
  console.log(`🤖 Model: ${config.ollama.model} | 📂 Workspace: ${process.cwd()}`);
  console.log("💡 Commands: 'exit' to quit, 'clear' to reset conversation");
  console.log('======================================================\n');

  let history = [];

  while (true) {
    let input;
    try {
      input = await rl.question('nodemind > ');
    } catch {
      break; // Handle EOF or Ctrl+C
    }

    const trimmed = input.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!\n');
      break;
    }

    if (trimmed.toLowerCase() === 'clear' || trimmed.toLowerCase() === 'reset') {
      history = [];
      console.log('🧹 Conversation history cleared.\n');
      continue;
    }

    try {
      const startTime = Date.now();
      process.stdout.write('⏳ Thinking...\r');

      const result = await runAgent(trimmed, { history });
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      // Clear the "Thinking..." line
      process.stdout.write('                     \r');

      // Update session history with the new messages from this turn
      if (result.newMessages) {
        history.push(...result.newMessages);
      }

      console.log(`\n🤖 NodeMind (${duration}s, ${result.iterations} iter):`);
      console.log(result.reply);
      console.log('');
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
  }

  rl.close();
}

startCli().catch(console.error);
