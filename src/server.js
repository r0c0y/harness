import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { ControlPlane } from './control-plane.js';
import { EvidenceLedger, createRunId } from './ledger.js';
import { createDecisionOracle } from './oracles.js';
import { PolicyEngine } from './policy.js';
import { inspectWorkspace } from './preflight.js';
import { OpenAICompatibleProvider } from './provider.js';
import { WorkspaceTools } from './tools.js';
import { CodebaseNavigator } from './navigation.js';
import { SkillRegistry } from './skills.js';

const workspace = process.env.HARNESS_WORKSPACE ?? process.cwd();
const port = parseInt(process.env.PORT || '3000', 10);

export function startServer({ port: serverPort = port, workspace: defaultWorkspace = workspace } = {}) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // 1. Workspace Preflight API
    if (url.pathname === '/api/preflight' && req.method === 'GET') {
      try {
        const targetWs = url.searchParams.get('workspace') || defaultWorkspace;
        const info = await inspectWorkspace(targetWs);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(info));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // 2. Provider Probe API
    if (url.pathname === '/api/probe' && req.method === 'GET') {
      try {
        const baseUrl = url.searchParams.get('baseUrl') || process.env.AI_BASE_URL;
        const apiKey = url.searchParams.get('apiKey') || process.env.AI_API_KEY;
        const model = url.searchParams.get('model') || process.env.AI_MODEL;
        const provider = new OpenAICompatibleProvider({ baseUrl, apiKey, model });
        const result = await provider.probe();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    }

    // 2.5 Local Models (Ollama proxy)
    if ((url.pathname === '/api/models' || url.pathname === '/v1/models' || url.pathname === '/api/local-models') && req.method === 'GET') {
      try {
        const ollamaHost = process.env.AI_BASE_URL ? process.env.AI_BASE_URL.replace('/v1', '') : 'http://127.0.0.1:11434';
        const ollamaUrl = `${ollamaHost}/api/tags`;
        const response = await fetch(ollamaUrl);
        const data = await response.json();
        
        // Map Ollama tags to OpenAI format
        const openAiModels = {
          object: "list",
          data: (data.models || []).map(m => ({
            id: m.name,
            object: "model",
            created: Math.floor(new Date(m.modified_at).getTime() / 1000),
            owned_by: "ollama"
          }))
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(openAiModels));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ object: "list", data: [] }));
      }
    }

    // 2.6 Proxy for Chat Completions (UI -> Node -> Ollama)
    if (url.pathname === '/v1/chat/completions' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const ollamaHost = process.env.AI_BASE_URL ? process.env.AI_BASE_URL.replace('/v1', '') : 'http://127.0.0.1:11434';
          const targetUrl = `${ollamaHost}/v1/chat/completions`;
          
          const proxyRes = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers['authorization'] || ''
            },
            body: body
          });

          res.writeHead(proxyRes.status, {
            'Content-Type': proxyRes.headers.get('content-type') || 'application/json',
            'Transfer-Encoding': 'chunked'
          });

          if (proxyRes.body) {
            const reader = proxyRes.body.getReader();
            const pump = async () => {
              const { done, value } = await reader.read();
              if (done) {
                res.end();
                return;
              }
              res.write(value);
              await pump();
            };
            await pump();
          } else {
            res.end(await proxyRes.text());
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 2.7 Proxy DeepSeek (Anthropic) -> Local Ollama (OpenAI)
    if (url.pathname.startsWith('/api/deepseek-proxy') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const anthropicReq = JSON.parse(body || '{}');
          
          // Translate Anthropic format to OpenAI format
          const openAiReq = {
            model: process.env.AI_MODEL || 'qwen3:1.7b',
            messages: [],
            stream: true,
            max_tokens: anthropicReq.max_tokens,
            temperature: anthropicReq.temperature
          };

          if (anthropicReq.system) {
            openAiReq.messages.push({ role: 'system', content: typeof anthropicReq.system === 'string' ? anthropicReq.system : JSON.stringify(anthropicReq.system) });
          }

          if (Array.isArray(anthropicReq.messages)) {
            for (const msg of anthropicReq.messages) {
              let content = msg.content;
              if (Array.isArray(content)) {
                content = content.map(c => typeof c === 'string' ? c : (c.text || JSON.stringify(c))).join('\n');
              }
              openAiReq.messages.push({ role: msg.role, content: content || '' });
            }
          }

          const ollamaHost = process.env.AI_BASE_URL ? process.env.AI_BASE_URL.replace('/v1', '') : 'http://127.0.0.1:11434';
          const targetUrl = `${ollamaHost}/v1/chat/completions`;

          const proxyRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(openAiReq)
          });

          res.writeHead(proxyRes.status, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });

          // Send message_start with full usage object
          res.write(`event: message_start\ndata: ${JSON.stringify({
            type: "message_start",
            message: {
              id: "msg_" + Date.now(),
              type: "message",
              role: "assistant",
              content: [],
              model: anthropicReq.model || "qwen3:1.7b",
              usage: { input_tokens: 10, output_tokens: 0 }
            }
          })}\n\n`);

          // Send content_block_start
          res.write(`event: content_block_start\ndata: ${JSON.stringify({
            type: "content_block_start",
            index: 0,
            content_block: { type: "text", text: "" }
          })}\n\n`);

          let tokenCount = 0;
          const reader = proxyRes.body.getReader();
          const decoder = new TextDecoder();

          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              // Finish content block
              res.write(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`);
              // Send message_delta with stop_reason
              res.write(`event: message_delta\ndata: ${JSON.stringify({
                type: "message_delta",
                delta: { stop_reason: "end_turn" },
                usage: { output_tokens: Math.max(1, tokenCount) }
              })}\n\n`);
              // Terminate stream
              res.write(`event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`);
              res.end();
              return;
            }
            const chunkText = decoder.decode(value, { stream: true });
            const lines = chunkText.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const delta = data.choices?.[0]?.delta?.content;
                  if (delta) {
                    tokenCount++;
                    res.write(`event: content_block_delta\ndata: ${JSON.stringify({
                      type: "content_block_delta",
                      index: 0,
                      delta: { type: "text_delta", text: delta }
                    })}\n\n`);
                  }
                } catch (e) {}
              }
            }
            await pump();
          };
          await pump();
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    
    // 2.8 Dynamic Skills API
    if (url.pathname === '/api/skills' && req.method === 'GET') {
      try {
        const skillsDir = path.join(defaultWorkspace, 'skills');
        const entries = await fs.readdir(skillsDir, { withFileTypes: true });
        const skills = [];
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
            try {
              const content = await fs.readFile(skillFile, 'utf8');
              const match = /^---\n([\s\S]*?)\n---/.exec(content);
              let description = '';
              if (match) {
                for (const line of match[1].split('\n')) {
                  if (line.startsWith('description:')) description = line.replace('description:', '').trim();
                }
              }
              skills.push({
                name: entry.name,
                description: description || 'Autonomous engineering capability',
                content: content,
                path: 'skills/' + entry.name + '/SKILL.md'
              });
            } catch {}
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(skills));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    if (url.pathname === '/api/skills' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { name, description, content } = JSON.parse(body || '{}');
          if (!name) throw new Error('Skill name is required');
          const skillDir = path.join(defaultWorkspace, 'skills', name);
          await fs.mkdir(skillDir, { recursive: true });
          const skillContent = content || `---\nname: ${name}\ndescription: ${description || name}\n---\n\n# ${name}\n\nDescribe skill instructions here.\n`;
          await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: true, name }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 2.9 Dynamic Connectors API (GitHub Only)
    const connectorsFile = path.join(defaultWorkspace, '.ai-harness', 'connectors.json');
    const loadConnectors = async () => {
      try {
        const raw = await fs.readFile(connectorsFile, 'utf8');
        return JSON.parse(raw);
      } catch {
        const token = process.env.GITHUB_TOKEN;
        return {
          github: token ? [{ id: 'gh-main', label: 'priyanshutomar', token, isPrimary: true }] : []
        };
      }
    };

    const saveConnectors = async (data) => {
      await fs.mkdir(path.join(defaultWorkspace, '.ai-harness'), { recursive: true });
      await fs.writeFile(connectorsFile, JSON.stringify(data, null, 2));
      const primary = data.github.find(a => a.isPrimary) || data.github[0];
      if (primary && primary.token) {
        process.env.GITHUB_TOKEN = primary.token;
      }
    };

    if (url.pathname === '/api/connectors' && req.method === 'GET') {
      const data = await loadConnectors();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    if (url.pathname === '/api/connectors/primary' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { id } = JSON.parse(body || '{}');
          const data = await loadConnectors();
          data.github = data.github.map(a => ({ ...a, isPrimary: a.id === id }));
          await saveConnectors(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (url.pathname === '/api/connectors/delete' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { id } = JSON.parse(body || '{}');
          const data = await loadConnectors();
          data.github = data.github.filter(a => a.id !== id);
          if (data.github.length > 0 && !data.github.some(a => a.isPrimary)) {
            data.github[0].isPrimary = true;
          }
          await saveConnectors(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (url.pathname === '/auth/github' && req.method === 'GET') {
      // Automatic seamless auth via local environment / gh CLI if available
      try {
        const { execSync } = await import('node:child_process');
        let autoToken = '';
        try { autoToken = execSync('gh auth token', { encoding: 'utf8' }).trim(); } catch {}
        if (!autoToken && process.env.GITHUB_TOKEN) autoToken = process.env.GITHUB_TOKEN;

        if (autoToken) {
          const data = await loadConnectors();
          const username = 'priyanshutomar';
          if (!data.github.some(a => a.token === autoToken)) {
            data.github.push({ id: 'gh-' + Date.now(), label: username, token: autoToken, isPrimary: data.github.length === 0 });
            await saveConnectors(data);
          }
          res.writeHead(302, { 'Location': '/' });
          return res.end();
        }
      } catch {}

      // Fallback one-click authorization screen
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorize GitHub</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: #161b22; padding: 36px; border-radius: 12px; border: 1px solid #30363d; width: 100%; max-width: 420px; text-align: center; }
            .btn { display: inline-block; background-color: #238636; color: #fff; padding: 12px 20px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; text-decoration: none; cursor: pointer; width: 100%; box-sizing: border-box; margin-top: 18px; }
            .btn:hover { background-color: #2ea043; }
            input { width: 100%; padding: 10px 14px; font-size: 14px; border: 1px solid #30363d; background: #0d1117; color: #fff; border-radius: 6px; box-sizing: border-box; margin-top: 14px; }
            svg { fill: #fff; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            <h2 style="margin: 0 0 8px; color: #fff;">Connect GitHub</h2>
            <p style="font-size: 13px; color: #8b949e; margin: 0 0 20px;">Grant autonomous access to repositories, PRs, issues, and code changes.</p>
            <form action="/auth/github/callback" method="POST">
              <input type="password" name="token" placeholder="GitHub Access Token / PAT" required autocomplete="off">
              <button type="submit" class="btn">Authorize & Connect</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }

    if (url.pathname === '/auth/github/callback' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const token = new URLSearchParams(body).get('token');
          if (token) {
            const data = await loadConnectors();
            data.github.push({ id: 'gh-' + Date.now(), label: 'user-' + Date.now().toString().slice(-4), token, isPrimary: data.github.length === 0 });
            await saveConnectors(data);
          }
          res.writeHead(302, { 'Location': '/' });
          return res.end();
        } catch (err) {
          res.writeHead(500);
          return res.end(err.message);
        }
      });
      return;
    }


    // 2.95 Binary File Upload API (Supports all formats: images, docs, pdf, zip, xlsx, csv, etc.)
    if (url.pathname === '/api/session/uploadFileBinary' && req.method === 'POST') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const sessionId = url.searchParams.get('sessionId') || 'default-session';
          const originalName = url.searchParams.get('name') || `upload-${Date.now()}`;
          const uploadsDir = path.join(defaultWorkspace, '.ai-harness', 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          
          const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = path.join(uploadsDir, `${Date.now()}-${safeName}`);
          await fs.writeFile(filePath, buffer);

          const attachmentId = 'att-' + Math.random().toString(36).slice(2, 10);
          const receiptId = 'rcpt-' + Math.random().toString(36).slice(2, 10);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            ok: true,
            value: {
              receiptId,
              file: {
                attachmentId,
                name: originalName,
                bytes: buffer.length
              }
            }
          }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            ok: false,
            error: {
              code: 'UPLOAD_FAILED',
              message: err.message,
              details: {}
            }
          }));
        }
      });
      return;
    }

    // 2.96 Session Export API (Supports HEAD check and GET ZIP/Log download)
    if (url.pathname === '/api/session.export') {
      const sessionId = url.searchParams.get('sessionId') || 'current';
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="dsh-session-${sessionId}.zip"`
        });
        return res.end();
      }
      if (req.method === 'GET') {
        try {
          const runsDir = path.join(defaultWorkspace, '.ai-harness', 'runs');
          let exportContent = `# Session Export: ${sessionId}\n\nExported at: ${new Date().toISOString()}\n\n`;
          try {
            const entries = await fs.readdir(runsDir);
            for (const entry of entries) {
              if (entry.endsWith('.jsonl') || entry.endsWith('.md')) {
                const c = await fs.readFile(path.join(runsDir, entry), 'utf8');
                exportContent += `\n--- File: ${entry} ---\n` + c;
              }
            }
          } catch {}

          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="dsh-session-${sessionId}.txt"`
          });
          return res.end(Buffer.from(exportContent, 'utf8'));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
      }
    }

    // 3. List Sessions / Evidence Ledger Runs
    if (url.pathname === '/api/sessions' && req.method === 'GET') {
      try {
        const runsDir = path.join(defaultWorkspace, '.ai-harness', 'runs');
        let files = [];
        try {
          const entries = await fs.readdir(runsDir);
          files = entries.filter(e => e.endsWith('-summary.md')).map(name => ({
            id: name.replace('-summary.md', ''),
            name: name,
          }));
        } catch {
          // Empty if directory doesn't exist yet
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ sessions: files }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // 4. Task Execution Stream API (SSE)
    if (url.pathname === '/api/run' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          console.log('[API RUN PAYLOAD]', JSON.stringify(payload));
          
          const taskText = payload.task;
          const targetWs = payload.workspace || defaultWorkspace;
          const customModel = payload.model || process.env.AI_MODEL;
          const customBaseUrl = payload.baseUrl || process.env.AI_BASE_URL;

          if (!taskText) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing task description.' }));
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          const sendSSE = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
          };

          const provider = new OpenAICompatibleProvider({
            baseUrl: customBaseUrl,
            apiKey: process.env.AI_API_KEY,
            model: customModel,
          });

          createDecisionOracle(process.env);
          const runId = createRunId();
          const ledger = new EvidenceLedger({ workspace: targetWs, runId });

          const navigator = new CodebaseNavigator({ workspace: targetWs });
          const skillRegistry = new SkillRegistry({ workspace: targetWs });
          await skillRegistry.loadSkills();

          const controlPlane = new ControlPlane({
            provider,
            tools: new WorkspaceTools({ workspace: targetWs, navigator, skillRegistry }),
            policy: new PolicyEngine({ workspace: targetWs, networkEnabled: process.env.HARNESS_ENABLE_NETWORK === '1' }),
            ledger,
            workspace: targetWs,
            skillRegistry,
            onEvent: (type, data) => {
              sendSSE('agent_event', { type, data, runId });
            },
          });

          sendSSE('status', { state: 'started', runId, task: taskText });
          const result = await controlPlane.run(taskText);
          sendSSE('status', { state: 'finished', runId, result });
          res.end();
        } catch (err) {
          res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        }
      });
      return;
    }

    // 5. Serve HTML Interface / Static Assets
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const safePath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.join(publicDir, safePath === '/' ? 'index.html' : safePath);
      
      let stat = null;
      try { stat = await fs.stat(filePath); } catch (e) {}
      
      // Fallback for client-side routing
      if (!stat && !safePath.includes('.')) {
         filePath = path.join(publicDir, 'index.html');
         try { stat = await fs.stat(filePath); } catch (e) {}
      }

      if (stat && stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff2': 'font/woff2'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        const data = await fs.readFile(filePath);
        return res.end(data);
      }
    } catch (e) {
      console.error('Static serve error:', e);
    }

    console.log(`[404] ${req.method} ${url.pathname}`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  });

  server.listen(serverPort, () => {
    process.stdout.write(`Kuro AI Harness Web Interface running at http://localhost:${serverPort}/\n`);
  });

  return server;
}

