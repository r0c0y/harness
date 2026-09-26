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

          const controlPlane = new ControlPlane({
            provider,
            tools: new WorkspaceTools({ workspace: targetWs }),
            policy: new PolicyEngine({ workspace: targetWs, networkEnabled: process.env.HARNESS_ENABLE_NETWORK === '1' }),
            ledger,
            workspace: targetWs,
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

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  });

  server.listen(serverPort, () => {
    process.stdout.write(`Kuro AI Harness Web Interface running at http://localhost:${serverPort}/\n`);
  });

  return server;
}

