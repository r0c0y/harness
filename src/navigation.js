import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Fast zero-dependency repository scanner and symbol indexer.
 * Inspired by oh-my-pi prewalk and fs-scan cache architecture.
 */
export class CodebaseNavigator {
  #workspace;

  constructor({ workspace } = {}) {
    this.#workspace = workspace ?? process.cwd();
  }

  /**
   * Scan repository tree excluding common ignored folders.
   */
  async scanTree(dir = this.#workspace, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return [];
    const entries = [];
    try {
      const dirEntries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of dirEntries) {
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'preview' ||
          entry.name === 'runs'
        ) continue;
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(this.#workspace, fullPath);
        if (entry.isDirectory()) {
          entries.push({ path: relPath, type: 'directory' });
          const children = await this.scanTree(fullPath, depth + 1, maxDepth);
          entries.push(...children);
        } else {
          entries.push({ path: relPath, type: 'file' });
        }
      }
    } catch {
      // Skip unreadable directories
    }
    return entries;
  }

  /**
   * Fast symbol search for function, class, and export definitions across JavaScript/TypeScript files.
   */
  async findSymbols(query, dir = this.#workspace) {
    const symbols = [];
    const tree = await this.scanTree(dir);
    const codeFiles = tree.filter(e => e.type === 'file' && /\.(js|ts|jsx|tsx|mjs|cjs)$/.test(e.path));

    const symbolRegex = new RegExp(`(?:export\\s+)?(?:class|function|const|let|var|type|interface)\\s+([a-zA-Z0-9_$]*${query}[a-zA-Z0-9_$]*)`, 'g');

    for (const file of codeFiles) {
      try {
        const fullPath = path.join(this.#workspace, file.path);
        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          let match;
          symbolRegex.lastIndex = 0;
          while ((match = symbolRegex.exec(line)) !== null) {
            symbols.push({
              name: match[1],
              file: file.path,
              line: index + 1,
              snippet: line.trim(),
            });
          }
        });
      } catch {
        // Skip unreadable files
      }
    }
    return symbols;
  }
}
