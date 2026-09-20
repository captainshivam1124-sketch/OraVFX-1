'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 10000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8' });
}

function serveStatic(req, res) {
  let requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (requestPath === '/') requestPath = '/index.html';
  if (requestPath.includes('..')) return send(res, 400, 'Bad request');

  const filePath = path.join(ROOT, requestPath);
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const ext = path.extname(filePath).toLowerCase();
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': cache,
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ORA VFX server listening on port ${PORT}`);
});

