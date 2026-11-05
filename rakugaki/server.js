// ローカル確認用サーバー(追加インストール不要)。Node.js 18以上が必要です。
// 使い方: node server.js  →  http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');

// .env があれば読み込む(KEY=VALUE 形式)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !l.trim().startsWith('#') && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) {}

const API = { judge: require('./api/judge.js'), fetch: require('./api/fetch.js') };
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.md': 'text/plain; charset=utf-8'
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const am = url.pathname.match(/^\/api\/(judge|fetch)$/);
  if (am) {
    let body = '';
    for await (const c of req) { body += c; if (body.length > 3e6) { res.statusCode = 413; return res.end(); } }
    try { req.body = body ? JSON.parse(body) : {}; } catch (e) { req.body = {}; }
    req.query = Object.fromEntries(url.searchParams);
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
    return API[am[1]](req, res);
  }
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.join(__dirname, path.normalize(rel));
  const hidden = /(^|[\\/])(\.env|server\.js|start\.bat|api)([\\/]|$)/.test(path.relative(__dirname, file));
  if (!file.startsWith(__dirname) || hidden) { res.statusCode = 404; return res.end('not found'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('らくがきAIバトル を起動しました');
  console.log('  このPC     : http://localhost:' + PORT);
  Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal)
    .forEach(i => console.log('  同じWi-Fiのスマホ : http://' + i.address + ':' + PORT));
  console.log(process.env.ANTHROPIC_API_KEY ? '  APIキー    : 設定済み' : '  APIキー    : 未設定(AI判定はランダムになります)');
  console.log('終了するには Ctrl+C を押してください');
});
