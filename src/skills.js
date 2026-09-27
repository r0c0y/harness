import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Skill discovery and trigger matching engine.
 */
export class SkillRegistry {
  #workspace;
  #skills;

  constructor({ workspace } = {}) {
    this.#workspace = workspace ?? process.cwd();
    this.#skills = new Map();
  }

  /**
   * Discover skills across global and project skills directories.
   */
  async loadSkills() {
    this.#skills.clear();
    const skillsDirs = [
      path.join(this.#workspace, 'skills'),
      path.join(this.#workspace, '.omp', 'skills'),
    ];

    for (const baseDir of skillsDirs) {
      try {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillFile = path.join(baseDir, entry.name, 'SKILL.md');
            try {
              const content = await fs.readFile(skillFile, 'utf8');
              const metadata = this.#parseFrontmatter(content);
              this.#skills.set(entry.name, {
                id: entry.name,
                path: skillFile,
                name: metadata.name || entry.name,
                description: metadata.description || '',
                content,
              });
            } catch {
              // Skill file absent or unreadable
            }
          }
        }
      } catch {
        // Directory absent
      }
    }
    return Array.from(this.#skills.values());
  }

  /**
   * Match relevant skills for a given query/intent.
   */
  matchSkills(intentText) {
    const query = (intentText || '').toLowerCase();
    const matches = [];
    for (const skill of this.#skills.values()) {
      if (
        query.includes(skill.id.toLowerCase()) ||
        query.includes(skill.name.toLowerCase()) ||
        skill.description.toLowerCase().split(' ').some(word => word.length > 3 && query.includes(word))
      ) {
        matches.push(skill);
      }
    }
    return matches;
  }

  getSkill(name) {
    return this.#skills.get(name);
  }

  #parseFrontmatter(content) {
    const frontmatter = {};
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (match) {
      const lines = match[1].split('\n');
      for (const line of lines) {
        const [key, ...val] = line.split(':');
        if (key && val.length) {
          frontmatter[key.trim()] = val.join(':').trim();
        }
      }
    }
    return frontmatter;
  }
}
