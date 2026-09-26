import path from 'node:path';

const BLOCKED_COMMANDS = [
  /\brm\s+-[a-z]*r[a-z]*f\b/i,
  /\bsudo\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bshutdown\b|\breboot\b/i,
  /\bgit\s+push\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bcurl\b[^\n]*\|\s*(?:ba)?sh\b/i,
];

export class PolicyEngine {
  #workspace;
  #networkEnabled;

  constructor({ workspace, networkEnabled = false }) {
    this.#workspace = path.resolve(workspace);
    this.#networkEnabled = networkEnabled;
  }

  evaluate(name, args) {
    if (name === 'web_fetch' && !this.#networkEnabled) {
      return reject('network_disabled', 'Web access is disabled. Continue with repository evidence or enable it explicitly.');
    }
    if (name === 'web_fetch' && !isPublicHttpsUrl(args.url)) {
      return reject('invalid_web_url', 'Only public HTTPS URLs are allowed.');
    }
    if (name === 'shell_exec' && BLOCKED_COMMANDS.some(pattern => pattern.test(args.command ?? ''))) {
      return reject('dangerous_command', 'This command is blocked by the harness safety policy. Choose a narrower, non-destructive action.');
    }
    if (['repo_list', 'repo_search', 'file_read', 'file_write', 'file_replace'].includes(name)) {
      const target = path.resolve(this.#workspace, args.path ?? '.');
      if (!isWithinWorkspace(this.#workspace, target)) {
        return reject('path_escape', 'Tool paths must stay inside the configured workspace.');
      }
    }
    return { allowed: true, reason: 'allowed' };
  }
}

function reject(code, message) {
  return { allowed: false, reason: code, message };
}

function isWithinWorkspace(workspace, candidate) {
  return candidate === workspace || candidate.startsWith(`${workspace}${path.sep}`);
}

function isPublicHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname !== 'localhost' && !parsed.hostname.endsWith('.local');
  } catch {
    return false;
  }
}
