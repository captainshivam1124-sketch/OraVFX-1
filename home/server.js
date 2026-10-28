'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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

function selectCompression(req, contentType) {
  if (!/^(text\/|application\/(javascript|json|xml)|image\/svg\+xml)/i.test(contentType)) return null;

  const encodings = new Map();
  (req.headers['accept-encoding'] || '').split(',').forEach(value => {
    const [name, ...parameters] = value.trim().toLowerCase().split(';');
    if (!name) return;
    const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
    encodings.set(name, quality ? Number(quality.trim().slice(2)) : 1);
  });
  const accepts = name => encodings.has(name) ? encodings.get(name) > 0 : (encodings.get('*') || 0) > 0;

  if (accepts('br')) return 'br';
  if (accepts('gzip')) return 'gzip';
  return null;
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
    const contentType = MIME[ext] || 'application/octet-stream';
    const encoding = selectCompression(req, contentType);
    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': cache,
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Frame-Options': 'SAMEORIGIN'
    };
    if (/^(text\/|application\/(javascript|json|xml)|image\/svg\+xml)/i.test(contentType)) {
      headers.Vary = 'Accept-Encoding';
    }
    if (encoding) headers['Content-Encoding'] = encoding;

    res.writeHead(200, {
      ...headers
    });
    const stream = fs.createReadStream(filePath);
    if (encoding === 'br') return stream.pipe(zlib.createBrotliCompress()).pipe(res);
    if (encoding === 'gzip') return stream.pipe(zlib.createGzip()).pipe(res);
    stream.pipe(res);
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

