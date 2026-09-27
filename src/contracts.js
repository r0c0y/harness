/** @typedef {'read' | 'write' | 'execute' | 'network' | 'skill'} Capability */

export const TOOL_CAPABILITIES = Object.freeze({
  repo_list: 'read',
  repo_search: 'read',
  file_read: 'read',
  file_write: 'write',
  file_replace: 'write',
  project_verify: 'execute',
  shell_exec: 'execute',
  web_fetch: 'network',
  read_skill: 'skill',
  find_symbols: 'read',
  memory_store: 'write',
  memory_recall: 'read',
  github_read: 'network',
  github_write: 'network',
  mail_read: 'network',
  mail_send: 'network'
});

export const TOOL_DEFINITIONS = Object.freeze([
  {
    type: 'function',
    function: {
      name: 'repo_list',
      description: 'List a directory inside the workspace. Use to discover project structure before reading files.',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string', description: 'Workspace-relative directory path. Defaults to the root.' } },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'memory_store',
      description: 'Persist a crucial fact, architectural decision, or user preference into harness long-term memory.',
      parameters: {
        type: 'object',
        required: ['topic', 'fact'],
        properties: {
          topic: { type: 'string', description: 'Subject or category name (e.g. tech_stack, conventions, preferences).' },
          fact: { type: 'string', description: 'The exact knowledge or decision to remember.' },
          category: { type: 'string', enum: ['static', 'dynamic'], description: 'Static profile (permanent) or dynamic context.' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'memory_recall',
      description: 'Retrieve long-term memory, past decisions, or user preferences matching a search query.',
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Keywords or concept to search for in memory.' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_read',
      description: 'Query GitHub API to read issues, PRs, commits, user details, or repositories (e.g. "repos/owner/repo/pulls", "user", "repos/owner/repo/issues").',
      parameters: {
        type: 'object',
        required: ['target'],
        properties: {
          target: { type: 'string', description: 'GitHub API path (e.g. "repos/owner/repo/pulls", "user", "issues").' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_symbols',
      description: 'Search the entire repository for function, class, or type definitions using a regex or partial name. Use this to quickly navigate large codebases.',
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Search term or regex pattern.' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_skill',
      description: 'Fetch the full instructions for an on-demand skill listed in your system prompt.',
      parameters: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Exact name of the skill to read.' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'file_replace',
      description: 'Make one exact, scoped replacement in a file already read during this run. The old text must occur exactly once; this prevents accidental broad overwrites.',
      parameters: {
        type: 'object',
        required: ['path', 'old_text', 'new_text'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path that has already been read.' },
          old_text: { type: 'string', description: 'Exact existing text. It must appear exactly once.' },
          new_text: { type: 'string', description: 'Replacement text.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'repo_search',
      description: 'Search workspace file contents using a literal or regular-expression pattern. Search before reading unknown files.',
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Search term or JavaScript regular expression source.' },
          path: { type: 'string', description: 'Workspace-relative directory to search.' },
          max_results: { type: 'integer', minimum: 1, maximum: 100, description: 'Maximum matching lines to return.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'project_verify',
      description: 'Run the harness verification contract after edits. It always checks whitespace/diff integrity and then runs the most relevant declared project checks.',
      parameters: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['quick', 'standard'], description: 'quick checks the diff; standard also runs one declared test command when detected.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'file_read',
      description: 'Read numbered lines from one workspace file. Use after repository search or when the task names a file.',
      parameters: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path.' },
          offset: { type: 'integer', minimum: 1, description: 'First line, one-indexed.' },
          limit: { type: 'integer', minimum: 1, maximum: 500, description: 'Maximum lines to return.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'file_write',
      description: 'Replace the full contents of one workspace file. Use only after inspecting relevant code and describing the smallest correct change.',
      parameters: {
        type: 'object',
        required: ['path', 'content'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path.' },
          content: { type: 'string', description: 'Complete replacement content.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'shell_exec',
      description: 'Run a bounded command in the workspace. Use for tests, type checks, builds, and focused diagnostics. Do not use for reading files or broad recursive listings.',
      parameters: {
        type: 'object',
        required: ['command'],
        properties: {
          command: { type: 'string', description: 'Shell command executed from the workspace.' },
          timeout_ms: { type: 'integer', minimum: 100, maximum: 120000, description: 'Execution timeout.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_fetch',
      description: 'Fetch a public web page as untrusted reference material. This tool is disabled unless explicitly enabled by runtime configuration.',
      parameters: {
        type: 'object',
        required: ['url'],
        properties: { url: { type: 'string', format: 'uri', description: 'Public HTTPS URL.' } },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_read',
      description: 'Read a GitHub PR, issue, or repository using the native GitHub REST API. Requires GITHUB_TOKEN environment variable. E.g., target="repos/owner/repo/issues/123".',
      parameters: {
        type: 'object',
        required: ['target'],
        properties: {
          target: { type: 'string', description: 'GitHub API path relative to api.github.com (e.g., "repos/owner/repo/issues/123")' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_write',
      description: 'Create a PR, issue, or comment using the native GitHub REST API. Requires GITHUB_TOKEN. E.g., target="repos/owner/repo/issues/123/comments", method="POST", body={"body":"Looks good!"}.',
      parameters: {
        type: 'object',
        required: ['target', 'method'],
        properties: {
          target: { type: 'string', description: 'GitHub API path (e.g. "repos/owner/repo/issues/123/comments")' },
          method: { type: 'string', description: 'HTTP method (POST, PATCH, PUT)' },
          body: { type: 'string', description: 'JSON string of the request body' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mail_read',
      description: 'Read recent emails using the Gmail REST API. Requires GMAIL_TOKEN. Provide a search query (e.g., "is:unread").',
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Gmail search query' }
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mail_send',
      description: 'Send an email using the Gmail REST API. Requires GMAIL_TOKEN.',
      parameters: {
        type: 'object',
        required: ['to', 'subject', 'body'],
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' }
        },
        additionalProperties: false,
      },
    },
  }
]);

export function toolResultMessage(callId, name, result) {
  return {
    role: 'tool',
    tool_call_id: callId,
    name,
    content: JSON.stringify(result),
  };
}
