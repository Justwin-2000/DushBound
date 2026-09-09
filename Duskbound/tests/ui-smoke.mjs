const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(output, { recursive: true });
const report = { testedAt: new Date().toISOString(), browser: 'Microsoft Edge headless / Playwright', origin: 'http://localhost:4173', scenarios: [], errors: [], layouts: [], warnings: [] };
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
function monitor(page, name) {
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => report.errors.push({ page: name, type: 'pageerror', message: error.message }));
  page.on('console', msg => { if (msg.type() === 'error') report.errors.push({ page: name, type: 'console.error', message: msg.text() }); });
  page.on('requestfailed', request => report.errors.push({ page: name, type: 'resource', url: request.url(), message: request.failure()?.errorText }));
  page.on('response', response => { if (response.status() >= 400) report.errors.push({ page: name, type: 'http', status: response.status(), url: response.url() }); });
}
async function readSave(page) { return page.evaluate(() => { const raw = localStorage.getItem('duskbound.save.v1'); return raw ? JSON.parse(JSON.parse(raw).payload) : null; }); }
async function choice(page, action) {
  for (let i = 0; i < 15; i++) {
    if (await page.locator(`[data-choice="${action}"]`).isVisible()) { await page.locator(`[data-choice="${action}"]`).click(); return; }
    if (await page.locator('[data-dialog-next]').isVisible()) await page.locator('[data-dialog-next]').click();
    else throw Error(`Dialog choice ${action} absent: ${await page.locator('#dialog-layer').textContent()}`);
  }
  throw Error(`Dialog choice ${action} not reached`);
}
async function startAndMeetIda(page) {
  await page.goto(report.origin, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#continue-game').isDisabled(), true);
  await page.locator('#new-game').click(); await choice(page, 'intro');
  await page.keyboard.down('d'); await page.waitForTimeout(560); await page.keyboard.up('d');
  await page.waitForFunction(() => document.querySelector('#interact-label').textContent.includes('伊妲'));
  await page.locator('#interact').click(); await choice(page, 'idaGift');
  await page.waitForFunction(() => document.querySelector('#hp-text').textContent.includes('110 / 110'));
}
async function auditLayout(page, name, selectors) {
  const measured = await page.evaluate(selectors => {
    const failures = [], smallTouchTargets = [], all = [];
    for (const selector of selectors) for (const el of document.querySelectorAll(selector)) {
      const style = getComputedStyle(el), r = el.getBoundingClientRect();
      if (!r.width || !r.height || style.visibility === 'hidden' || el.closest('.hidden')) continue;
      const item = { selector: el.id ? `#${el.id}` : selector, text: el.textContent.trim().slice(0, 40), x: +r.x.toFixed(1), y: +r.y.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) };
      all.push(item);
      if (r.x < -.5 || r.y < -.5 || r.right > innerWidth + .5 || r.bottom > innerHeight + .5) failures.push(item);
      if (el.tagName === 'BUTTON' && Math.min(r.width, r.height) < 44) smallTouchTargets.push(item);
    }
    return { viewport: { width: innerWidth, height: innerHeight }, failures, smallTouchTargets, all, horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
  }, selectors);
  report.layouts.push({ name, ...measured });
  assert.equal(measured.horizontalOverflow, false, `${name} page overflow`);
  assert.deepEqual(measured.failures, [], `${name} controls outside viewport`);
  return measured;
}
async function scenario(name, fn) {
  try { await fn(); report.scenarios.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { report.scenarios.push({ name, passed: false, message: error.message, stack: error.stack }); console.log(`FAIL ${name}: ${error.message}`); }
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await desktop.newPage(); monitor(page, 'desktop');
await scenario('desktop title and real introduction / Ida interaction', async () => {
  await page.goto(report.origin, { waitUntil: 'networkidle' }); await page.screenshot({ path: output + 'title.png' });
  await auditLayout(page, 'desktop title', ['#title-screen button']);
  await startAndMeetIda(page); await page.screenshot({ path: output + 'town.png' });
  const s = await readSave(page); assert.equal(s.stage, 2); assert.equal(s.flags.cloak, true);
});
await scenario('map travel to smith and actual attack/dodge/guard training', async () => {
  await page.locator('#map-button').click(); await page.locator('[data-travel="1710"]').click();
  await page.waitForFunction(() => document.querySelector('#interact-label').textContent.includes('格伦'));
  await page.locator('#interact').click(); await choice(page, 'train');
  await page.keyboard.down('j'); await page.waitForTimeout(1750); await page.keyboard.up('j');
  await page.waitForTimeout(750);
  assert.match(await page.locator('#tutorial-text').textContent(), /闪避/);
  await page.keyboard.down('d'); await page.waitForTimeout(50); await page.keyboard.press('k'); await page.waitForTimeout(440); await page.keyboard.up('d');
  await page.waitForTimeout(300);
  await page.keyboard.down('a'); await page.waitForTimeout(50); await page.keyboard.press('k'); await page.waitForTimeout(440); await page.keyboard.up('a');
  await page.waitForTimeout(300); await page.keyboard.down('l');
  await page.waitForFunction(() => document.querySelector('#tutorial-text').textContent.includes('完美格挡'));
  await page.keyboard.up('l');
  // Normal key presses only. Vary the rhythm to avoid aliasing exactly with the
  // trainer period when the OS/browser scheduler delays a frame.
  for (let i = 0; i < 180 && !(await page.locator('#dialog-layer').isVisible()); i++) {
    await page.keyboard.down('l'); await page.waitForTimeout(100 + i % 5 * 13); await page.keyboard.up('l'); await page.waitForTimeout(20 + i % 7 * 19);
  }
  await page.waitForFunction(() => !document.querySelector('#dialog-layer').classList.contains('hidden'));
  await choice(page, 'close');
  const s = await readSave(page); assert.equal(s.stage, 4); assert.equal(s.tutorial.active, false); assert.ok(s.tutorial.hits >= 3 && s.tutorial.combo >= 1 && s.tutorial.dodges >= 2 && s.tutorial.blocks >= 1 && s.tutorial.parries >= 1);
});
await scenario('pause, settings, inventory and save reload / continue', async () => {
  await page.locator('#pause').click(); await page.screenshot({ path: output + 'menu.png' });
  await page.locator('[data-ui="settings"]').click(); await page.locator('#setting-shake').uncheck(); await page.locator('#setting-assist').check();
  await page.locator('#fps-setting').selectOption('30');
  await page.locator('#setting-master').fill('33'); await page.locator('#setting-master').dispatchEvent('input');
  await page.locator('#close-modal').click(); await page.locator('#bag-button').click(); assert.match(await page.locator('#modal-title').textContent(), /行囊/);
  await page.locator('#close-modal').click(); const before = await readSave(page);
  await page.reload({ waitUntil: 'networkidle' }); assert.equal(await page.locator('#continue-game').isDisabled(), false); await page.locator('#continue-game').click();
  const after = await readSave(page); assert.equal(after.stage, before.stage); assert.deepEqual(after.inventory, before.inventory); assert.equal(after.settings.shake, false); assert.equal(after.settings.assist, true); assert.equal(after.settings.fps, 30); assert.equal(after.settings.master, .33);
  await page.locator('#pause').click(); await page.locator('[data-ui="confirm-title"]').click(); await page.locator('[data-ui="close"]').click(); assert.equal(await page.locator('#title-screen').isVisible(), false);
});

const phone = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
const mobile = await phone.newPage(); monitor(mobile, 'android-emulated-844x390');
await scenario('844x390 Android touch layout, joystick movement and action buttons', async () => {
  await mobile.goto(report.origin, { waitUntil: 'networkidle' }); await auditLayout(mobile, 'phone title', ['#title-screen button']);
  await mobile.locator('#new-game').tap(); await choice(mobile, 'intro');
  await auditLayout(mobile, 'phone controls', ['#hud button', '#touch-controls button', '#joystick']);
  const before = await readSave(mobile), stick = await mobile.locator('#joystick').boundingBox(), attack = await mobile.locator('#attack').boundingBox();
  const cdp = await phone.newCDPSession(mobile);
  const finger = { x: stick.x + stick.width * .78, y: stick.y + stick.height / 2, id: 1, radiusX: 4, radiusY: 4 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [finger] });
  await mobile.waitForTimeout(350);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [finger, { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 2, radiusX: 4, radiusY: 4 }] });
  await mobile.waitForTimeout(700); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(400); await mobile.locator('#pause').tap(); const after = await readSave(mobile); assert.ok(after.player.x > before.player.x + 20, 'touch stick moves player'); assert.ok(after.player.stamina < before.player.stamina, 'simultaneous touch attack consumes stamina');
  await mobile.locator('#close-modal').tap(); await mobile.locator('#dodge').tap(); await mobile.waitForTimeout(450); await mobile.locator('#block').tap();
  await mobile.screenshot({ path: output + 'mobile.png' });
  await mobile.locator('#pause').tap(); await auditLayout(mobile, 'phone modal shell', ['#modal-layer header', '#close-modal']);
  await mobile.locator('[data-ui="settings"]').tap(); await mobile.locator('#setting-shake').uncheck();
  // The modal body must remain scrollable so lower settings can be reached.
  await mobile.locator('[data-ui="help"]').scrollIntoViewIfNeeded(); await mobile.locator('[data-ui="help"]').tap(); assert.match(await mobile.locator('#modal-title').textContent(), /须知/);
});
const tablet = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, hasTouch: true });
const tabletPage = await tablet.newPage(); monitor(tabletPage, 'tablet-1024x768');
await scenario('1024x768 tablet title, controls and menu stay in bounds', async () => {
  await tabletPage.goto(report.origin, { waitUntil: 'networkidle' }); await auditLayout(tabletPage, 'tablet title', ['#title-screen button']);
  await tabletPage.locator('#new-game').tap(); await choice(tabletPage, 'intro');
  await auditLayout(tabletPage, 'tablet controls', ['#hud button', '#touch-controls button', '#joystick']);
  await tabletPage.locator('#pause').tap(); await auditLayout(tabletPage, 'tablet pause menu', ['#modal-layer header', '#close-modal', '#modal-body button']);
  await tabletPage.screenshot({ path: output + 'tablet.png' });
});

const lifecycle = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const lifecyclePage = await lifecycle.newPage(); monitor(lifecyclePage, 'native-lifecycle');
await scenario('native pause/resume during dialogue leaves an explicit path to resume gameplay', async () => {
  await lifecyclePage.goto(report.origin, { waitUntil: 'networkidle' }); await lifecyclePage.locator('#new-game').click();
  const before = await readSave(lifecyclePage);
  // These are the public events emitted by the Android wrapper, not game state edits.
  await lifecyclePage.evaluate(() => window.dispatchEvent(new Event('native-pause')));
  await lifecyclePage.evaluate(() => window.dispatchEvent(new Event('native-resume')));
  if (await lifecyclePage.locator('#modal-layer').isVisible()) await lifecyclePage.locator('#close-modal').click();
  await choice(lifecyclePage, 'intro');
  await lifecyclePage.keyboard.down('d'); await lifecyclePage.waitForTimeout(600); await lifecyclePage.keyboard.up('d');
  await lifecyclePage.locator('#pause').click(); const after = await readSave(lifecyclePage);
  assert.ok(after.player.x > before.player.x + 30, `After backgrounding during intro, controls should work after closing the dialogue; x remained ${after.player.x}`);
});

await browser.close();
writeFileSync(output + 'ui-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ scenarios: report.scenarios, errors: report.errors, layouts: report.layouts.map(({ name, viewport, failures, smallTouchTargets }) => ({ name, viewport, failures, smallTouchTargets })) }, null, 2));
if (report.scenarios.some(s => !s.passed) || report.errors.length) process.exitCode = 1;
