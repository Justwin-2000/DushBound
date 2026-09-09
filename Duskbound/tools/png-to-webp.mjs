// PNG -> WebP 转换工具。
//
// 用途：把 web/assets 下的主视觉图换成 WebP，显著缩小 APK 体积
// （两张 1672x941 的 PNG 曾占 APK 的 97%）。
//
// 实现：不依赖任何图像库，用本机已安装的 Chromium 内核浏览器（Chrome / Edge）
// 的 canvas.toDataURL('image/webp', q) 做编码。浏览器路径可用 CHROME_PATH 覆盖。
//
// 用法：
//   node tools/png-to-webp.mjs web/assets/title.png web/assets/title.webp 86
//
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [input, output, qualityArg] = process.argv.slice(2);
if (!input || !output) {
  console.error('用法: node tools/png-to-webp.mjs <输入.png> <输出.webp> [质量 0-100]');
  process.exit(2);
}
const quality = Math.min(100, Math.max(1, Number(qualityArg) || 86));

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);
const browser = CANDIDATES.find((candidate) => existsSync(candidate));
if (!browser) {
  console.error('找不到 Chromium 内核浏览器。请设置 CHROME_PATH 指向 chrome.exe 或 msedge.exe。');
  process.exit(3);
}

const source = await readFile(input);
const page = `<!doctype html><meta charset="utf-8"><title>working</title><body><script>
(async () => {
  const q = Number(new URLSearchParams(location.search).get('q')) || 0.86;
  const image = new Image();
  image.src = '/in';
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const dataUrl = canvas.toDataURL('image/webp', q);
  const response = await fetch('/save', { method: 'POST', body: dataUrl.slice(dataUrl.indexOf(',') + 1) });
  document.title = (await response.text()) === 'ok' ? 'DONE' : 'FAILED';
})().catch((error) => { document.title = 'ERROR ' + error.message; });
</script>`;

let settle;
const finished = new Promise((resolve) => { settle = resolve; });
const server = http.createServer(async (request, response) => {
  try {
    if (request.url.startsWith('/in')) {
      response.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': source.length });
      response.end(source);
      return;
    }
    if (request.url.startsWith('/page')) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(page);
      return;
    }
    if (request.url.startsWith('/save')) {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const encoded = Buffer.concat(chunks).toString('ascii');
      if (!encoded) throw Error('浏览器没有回传图像数据');
      const bytes = Buffer.from(encoded, 'base64');
      // WebP 容器魔数：RIFF....WEBP
      if (bytes.length < 16 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
        throw Error('回传数据不是有效的 WebP');
      }
      await writeFile(output, bytes);
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('ok');
      settle({ bytes });
      return;
    }
    response.writeHead(404).end('not found');
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(String(error.message));
    settle({ error });
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const profile = path.join(os.tmpdir(), 'duskbound-webp-' + process.pid);
const child = spawn(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--disable-background-networking',
  '--user-data-dir=' + profile,
  `http://127.0.0.1:${port}/page?q=${(quality / 100).toFixed(2)}`
], { stdio: 'ignore' });

const timeout = setTimeout(() => settle({ error: Error('浏览器 60 秒内没有返回结果') }), 60000);
const outcome = await finished;
clearTimeout(timeout);
child.kill();
server.close();

if (outcome.error) {
  console.error('转换失败：' + outcome.error.message);
  process.exit(1);
}
const before = (await stat(input)).size;
const after = outcome.bytes.length;
console.log(
  `${path.basename(input)} -> ${path.basename(output)}  q=${quality}  ` +
  `${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB  ` +
  `节省 ${(100 - after / before * 100).toFixed(1)}%`
);
