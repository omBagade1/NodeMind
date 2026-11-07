import path from 'node:path';
import readline from 'node:readline/promises';
import { ApiError } from '../errors/ApiError.js';

// Holds directories approved by the user during this running session
const sessionApprovedPaths = new Set();

/**
 * Checks if target is inside or equal to parent directory.
 */
function isInside(parent, target) {
  const rel = path.relative(parent, target);
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Asks the user for explicit permission via the terminal.
 * Times out and denies after 120 seconds.
 */
async function promptUserForPermission(targetPath, operation) {
  if (!process.stdin.isTTY) {
    throw new ApiError(403, `Cannot request permission in non-interactive environment for path: "${targetPath}"`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.log(`\n⏳ Permission request timed out after 120s. Defaulting to DENIED.\n`);
      resolve(false);
    }, 120000);
  });

  const promptPromise = (async () => {
    try {
      const answer = await rl.question(
        `\n⚠️  [PERMISSION REQUIRED]\n` +
        `   Operation : ${operation.toUpperCase()}\n` +
        `   Target    : ${targetPath}\n` +
        `   This path is outside the current working directory (${process.cwd()}).\n` +
        `   Grant permission for this folder for this session? [y/N]: `
      );
      return answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
    } finally {
      rl.close();
    }
  })();

  try {
    const approved = await Promise.race([promptPromise, timeoutPromise]);
    return approved;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Validates and safely resolves paths.
 * Auto-allows current directory; prompts user for anything outside.
 * 
 * @param {string} targetPath - Path requested by agent
 * @param {'read' | 'write' | 'execute'} [operation='read'] - Intended operation
 * @returns {Promise<string>} - Safely resolved absolute path
 */
export async function resolveSafePath(targetPath, operation = 'read') {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new ApiError(400, 'Invalid path provided: path must be a non-empty string.');
  }

  const cwd = process.cwd();
  const resolvedPath = path.resolve(cwd, targetPath);

  // 1. Check if inside Current Working Directory
  if (isInside(cwd, resolvedPath)) {
    return resolvedPath;
  }

  // 2. Check if already approved in this session
  for (const approvedDir of sessionApprovedPaths) {
    if (isInside(approvedDir, resolvedPath)) {
      return resolvedPath;
    }
  }

  // 3. Path is outside cwd and not in session cache -> Ask User
  const isApproved = await promptUserForPermission(resolvedPath, operation);

  if (!isApproved) {
    throw new ApiError(
      403,
      `Permission denied by user: ${operation.toUpperCase()} access was rejected for "${targetPath}".`
    );
  }

  // Remember the folder in session cache so future requests don't re-prompt
  const approvedFolder = path.extname(resolvedPath) ? path.dirname(resolvedPath) : resolvedPath;
  sessionApprovedPaths.add(approvedFolder);
  console.log(`✅ Permission granted and cached for: ${approvedFolder}\n`);

  return resolvedPath;
}
