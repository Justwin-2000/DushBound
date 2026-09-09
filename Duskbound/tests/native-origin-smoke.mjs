// Browser-side contract simulation only. This does not execute Android or WebView.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeSave } from '../web/src/store.js';

const webRoot = fileURLToPath(new URL('../web/', import.meta.url));
const output = fileURLToPath(new URL('./output/', import.meta.url));
const origin = 'https://appassets.androidplatform.net';
const entry = origin + '/assets/index.html';
mkdirSync(output, { recursive: true });
const report = {
  testedAt: new Date().toISOString(),
  environment: 'Microsoft Edge headless / Playwright; HTTPS asset-origin and AndroidBridge contract simulation',
  limitation: 'Not an Android runtime test. Does not execute Java, real WebView, native lifecycle, or the Android document picker.',
  entry, viewport: { width: 844, height: 390 }, scenarios: [], errors: [], requests: [], rejectedRequests: [], bridge: null,
};
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const context = await browser.newContext({ viewport: report.viewport, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  const relative = decodeURIComponent(url.pathname).slice('/assets/'.length) || 'index.html';
  const target = path.resolve(webRoot, relative);
  if (url.origin !== origin || !url.pathname.startsWith('/assets/') || relative.includes('..') || relative.includes('\\') || relative.startsWith('/') || !target.startsWith(webRoot)) {
    report.rejectedRequests.push(url.href);
    await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Forbidden' });
    return;
  }
  try {
    const body = readFileSync(target);
    const contentType = mime[path.extname(target).toLowerCase()] || 'application/octet-stream';
    report.requests.push({ url: url.href, contentType, bytes: body.length });
    await route.fulfill({ status: 200, headers: { 'Content-Type': contentType + '; charset=UTF-8', 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' }, body });
  } catch (error) {
    report.errors.push({ type: 'asset-read', url: url.href, message: error.message });
    await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found' });
  }
});
await context.addInitScript(() => {
  const calls = window.__nativeContract = { gameReady: 0, startupError: [], exports: [], imports: 0, vibrate: [], exit: 0 };
  window.AndroidBridge = {
    gameReady() { calls.gameReady++; },
    startupError(message) { calls.startupError.push(String(message)); },
    exportSave(content) { calls.exports.push(content); },
    importSave() { calls.imports++; },
    vibrate(duration) { calls.vibrate.push(duration); },
    exitApp() { calls.exit++; },
  };
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.on('pageerror', error => report.errors.push({ type: 'pageerror', message: error.message }));
page.on('console', message => { if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() }); });
page.on('requestfailed', request => report.errors.push({ type: 'requestfailed', url: request.url(), message: request.failure()?.errorText }));
page.on('response', response => { if (response.status() >= 400) report.errors.push({ type: 'http', url: response.url(), status: response.status() }); });
async function scenario(name, check) {
  try { await check(); report.scenarios.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { report.scenarios.push({ name, passed: false, message: error.message }); throw error; }
}
async function readSave() {
  const raw = await page.evaluate(() => localStorage.getItem('duskbound.save.v1'));
  assert.equal(typeof raw, 'string');
  return decodeSave(raw);
}
async function choose(action) {
  for (let i = 0; i < 12; i++) {
    const choice = page.locator(`[data-choice="${action}"]`);
    if (await choice.isVisible()) { await choice.tap(); return; }
    await page.locator('[data-dialog-next]').tap();
  }
  throw Error('Intro choice not found: ' + action);
}
let exported, exportedState;
try {
  await scenario('HTTPS offline asset origin initializes and acknowledges ready', async () => {
    await page.goto(entry, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.gameReady === 'true');
    assert.equal(await page.evaluate(() => location.origin), origin);
    assert.equal(await page.evaluate(() => window.__nativeContract.gameReady), 1);
    assert.equal(await page.locator('#fatal').isVisible(), false);
    await page.screenshot({ path: output + 'native-origin-title.png' });
  });
  await scenario('touch taps open title settings, help and a new journey', async () => {
    await page.locator('#title-settings').tap();
    assert.match(await page.locator('#modal-title').textContent(), /设置/);
    await page.locator('#close-modal').tap();
    await page.locator('#title-help').tap();
    assert.match(await page.locator('#modal-title').textContent(), /巡界者须知/);
    await page.locator('#close-modal').tap();
    await page.locator('#new-game').tap();
    await choose('intro');
    assert.equal(await page.locator('#hud').isVisible(), true);
  });
  await scenario('touch taps operate pause and inventory menus', async () => {
    await page.locator('#pause').tap();
    assert.match(await page.locator('#modal-title').textContent(), /片刻歇息/);
    await page.locator('[data-ui="resume"]').tap();
    await page.locator('#bag-button').tap();
    assert.match(await page.locator('#modal-title').textContent(), /行囊/);
    await page.locator('#close-modal').tap();
  });
  await scenario('native-pause contract saves touch movement and retains the pause menu on resume', async () => {
    const before = await readSave();
    const stick = await page.locator('#joystick').boundingBox();
    assert.ok(stick);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: stick.x + stick.width * .8, y: stick.y + stick.height / 2, id: 1 }] });
    await page.waitForTimeout(350);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await page.evaluate(() => window.dispatchEvent(new Event('native-pause')));
    const paused = await readSave();
    assert.ok(paused.player.x > before.player.x + 10, 'Touch movement was not persisted by the pause handler');
    assert.match(await page.locator('#modal-title').textContent(), /片刻歇息/);
    await page.evaluate(() => window.dispatchEvent(new Event('native-resume')));
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#modal-layer').isVisible(), true);
    assert.equal((await readSave()).playTime, paused.playTime);
    await page.locator('[data-ui="resume"]').tap();
  });
  await scenario('exportSave bridge receives a valid checksummed JSON save', async () => {
    await page.locator('#pause').tap();
    await page.locator('[data-ui="settings"]').tap();
    await page.locator('[data-ui="export"]').tap();
    exported = await page.evaluate(() => window.__nativeContract.exports.at(-1));
    assert.equal(typeof exported, 'string');
    const envelope = JSON.parse(exported);
    assert.equal(typeof envelope.payload, 'string');
    assert.equal(typeof envelope.checksum, 'string');
    exportedState = decodeSave(exported);
    assert.deepEqual(exportedState, await readSave());
    await page.locator('#close-modal').tap();
  });
  await scenario('native-import contract waits for confirmation and restores the exported journey', async () => {
    await page.locator('#map-button').tap();
    await page.locator('[data-travel="1710"]').tap();
    assert.equal((await readSave()).player.x, 1710);
    assert.notEqual(exportedState.player.x, 1710);
    await page.locator('#pause').tap();
    await page.locator('[data-ui="settings"]').tap();
    await page.locator('[data-ui="import"]').tap();
    assert.equal(await page.evaluate(() => window.__nativeContract.imports), 1);
    await page.evaluate(raw => window.dispatchEvent(new CustomEvent('native-import', { detail: raw })), exported);
    assert.match(await page.locator('#modal-title').textContent(), /恢复备份/);
    assert.equal((await readSave()).player.x, 1710, 'Import changed the journey before confirmation');
    await page.locator('#confirm-import').tap();
    const restored = await readSave();
    assert.equal(restored.player.x, exportedState.player.x);
    assert.equal(restored.stage, exportedState.stage);
    assert.deepEqual(restored.inventory, exportedState.inventory);
    assert.deepEqual(restored.settings, exportedState.settings);
    assert.equal(await page.locator('#modal-layer').isVisible(), false);
    assert.equal(await page.locator('#hud').isVisible(), true);
    await page.screenshot({ path: output + 'native-origin-restored.png' });
  });
  await scenario('all requests stay local and no startup or runtime error is recorded', async () => {
    const calls = await page.evaluate(() => window.__nativeContract);
    report.bridge = { gameReady: calls.gameReady, startupError: calls.startupError, exports: calls.exports.length, imports: calls.imports, exportedBytes: Buffer.byteLength(exported, 'utf8') };
    assert.equal(calls.gameReady, 1);
    assert.deepEqual(calls.startupError, []);
    assert.deepEqual(report.rejectedRequests, []);
    assert.deepEqual(report.errors, []);
    assert.equal(await page.locator('#fatal').isVisible(), false);
    for (const asset of ['index.html', 'style.css', 'compat.js', 'app.bundle.js', 'assets/title.webp', 'assets/world.webp']) assert.ok(report.requests.some(request => request.url === origin + '/assets/' + asset), 'Expected packaged resource not requested: ' + asset);
  });
} catch (error) {
  process.exitCode = 1;
  console.error(error.stack);
  await page.screenshot({ path: output + 'native-origin-failed.png' }).catch(() => {});
} finally {
  await browser.close();
  writeFileSync(output + 'native-origin-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
