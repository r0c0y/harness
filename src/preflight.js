import fs from 'node:fs/promises';
import path from 'node:path';

const INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md'];
const MANIFESTS = ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'Makefile'];

export async function inspectWorkspace(workspace) {
  const root = path.resolve(workspace);
  const entries = await fs.readdir(root, { withFileTypes: true });
  const names = new Set(entries.map(entry => entry.name));
  const instructions = await Promise.all(INSTRUCTION_FILES.filter(name => names.has(name)).map(name => readSnippet(root, name, 4000)));
  const packageInfo = names.has('package.json') ? await readPackage(root) : null;
  return {
    root,
    is_git_repository: names.has('.git'),
    top_level: entries.filter(entry => !['.git', 'node_modules', '.ai-harness'].includes(entry.name)).slice(0, 100).map(entry => ({ name: entry.name, type: entry.isDirectory() ? 'directory' : 'file' })),
    manifests: MANIFESTS.filter(name => names.has(name)),
    package_scripts: packageInfo?.scripts ?? {},
    instructions: instructions.filter(Boolean),
    suggested_verification: suggestedVerification(names, packageInfo?.scripts ?? {}),
  };
}

async function readPackage(root) {
  try {
    return JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

async function readSnippet(root, filename, limit) {
  try {
    const content = await fs.readFile(path.join(root, filename), 'utf8');
    return { path: filename, content: content.slice(0, limit), truncated: content.length > limit };
  } catch {
    return null;
  }
}

function suggestedVerification(names, scripts) {
  if (scripts.test) return 'npm test';
  if (names.has('Makefile')) return 'make test';
  if (names.has('pyproject.toml')) return 'python -m pytest';
  if (names.has('Cargo.toml')) return 'cargo test';
  if (names.has('go.mod')) return 'go test ./...';
  return null;
}
