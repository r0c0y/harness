import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Harness-level Memory Substrate.
 * Implements:
 * 1. Pushed Profile (Static & Dynamic) in .ai-harness/profile.md
 * 2. Explicit Memory Tools (memory_store, memory_recall)
 * 3. Out-of-band Observer & Fact Consolidation
 */
export class MemorySubstrate {
  #workspace;
  #memoryDir;
  #profileFile;

  constructor(workspace) {
    this.#workspace = path.resolve(workspace);
    this.#memoryDir = path.join(this.#workspace, '.ai-harness', 'memory');
    this.#profileFile = path.join(this.#workspace, '.ai-harness', 'profile.md');
  }

  async init() {
    await fs.mkdir(this.#memoryDir, { recursive: true });
    try {
      await fs.access(this.#profileFile);
    } catch {
      const initialProfile = `# User & Workspace Memory Profile

## Static Profile
- Agent: Kuro Autonomous Engineering Agent
- Platform: Zero-dependency Node.js ESM harness with bounded tool execution
- Principles: Evidence-based verification, exact replacements, minimal code footprint

## Dynamic Profile & Context
- Active Tasks: None currently pending.
- Learned Patterns: None recorded yet.
`;
      await fs.writeFile(this.#profileFile, initialProfile, 'utf8');
    }
  }

  async getProfile() {
    await this.init();
    try {
      return await fs.readFile(this.#profileFile, 'utf8');
    } catch {
      return '';
    }
  }

  async storeFact({ topic, fact, category = 'dynamic' }) {
    await this.init();
    const cleanTopic = (topic || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const filePath = path.join(this.#memoryDir, `${cleanTopic}.md`);
    
    let existing = '';
    try {
      existing = await fs.readFile(filePath, 'utf8');
    } catch {}

    const timestamp = new Date().toISOString().split('T')[0];
    const updatedContent = existing
      ? `${existing}\n- [${timestamp}] ${fact}`
      : `# Topic: ${cleanTopic}\n\n- [${timestamp}] ${fact}\n`;

    await fs.writeFile(filePath, updatedContent, 'utf8');

    // Update the consolidated profile in-place
    await this.#syncProfileWithTopic(cleanTopic, fact, category);

    return {
      ok: true,
      topic: cleanTopic,
      stored_in: path.relative(this.#workspace, filePath)
    };
  }

  async recall({ query }) {
    await this.init();
    const results = [];
    const lowerQuery = (query || '').toLowerCase();
    
    try {
      const files = await fs.readdir(this.#memoryDir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const fullPath = path.join(this.#memoryDir, file);
        const content = await fs.readFile(fullPath, 'utf8');
        if (content.toLowerCase().includes(lowerQuery) || file.toLowerCase().includes(lowerQuery)) {
          results.push({
            topic: file.replace('.md', ''),
            content: content.trim()
          });
        }
      }
    } catch {}

    // Also check profile
    const profile = await this.getProfile();
    if (profile.toLowerCase().includes(lowerQuery)) {
      results.unshift({
        topic: 'active_profile',
        content: profile.trim()
      });
    }

    return {
      ok: true,
      query,
      count: results.length,
      memories: results
    };
  }

  async #syncProfileWithTopic(topic, fact, category) {
    try {
      let profile = await this.getProfile();
      const bullet = `- ${fact}`;
      if (!profile.includes(fact)) {
        if (category === 'static') {
          profile = profile.replace('## Static Profile', `## Static Profile\n${bullet}`);
        } else {
          profile = profile.replace('## Dynamic Profile & Context', `## Dynamic Profile & Context\n${bullet}`);
        }
        await fs.writeFile(this.#profileFile, profile, 'utf8');
      }
    } catch {}
  }

  async observeAndConsolidate({ task, answer, verified }) {
    if (!task || !answer) return;
    await this.init();
    const shortFact = `Task "${task.slice(0, 80)}" -> Status: ${verified ? 'Verified' : 'Completed'}. Resolution: ${answer.slice(0, 120)}`;
    await this.storeFact({ topic: 'tasks_history', fact: shortFact, category: 'dynamic' });
  }
}
