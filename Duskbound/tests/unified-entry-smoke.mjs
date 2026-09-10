import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {newState} from '../web/src/game.js';
import {encodeSave,decodeSave} from '../web/src/store.js';
import {freshProfile,encode} from '../web/src/v2/store.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const root=path.resolve(fileURLToPath(new URL('../web/',import.meta.url))),out=fileURLToPath(new URL('./output/',import.meta.url));mkdirSync(out,{recursive:true});
const origin='https://appassets.androidplatform.net',sample=encode(freshProfile());
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const report={version:'1.1.1',environment:'Edge touch + HTTPS assets + bridge fixture; not Android hardware',cases:[]};
try{for(const ending of ['honesty','silence',null]){
 const old=newState();old.stage=10;old.ending=ending;old.flags.core=true;old.flags.tag=true;old.inventory.coins=37;old.inventory.iron=12;
 const raw=ending?encodeSave(old):null;
 const ctx=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 await ctx.route(origin+'/**',async route=>{const rel=decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/assets\//,'');const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep))return route.abort();try{const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'};await route.fulfill({body:readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}});
 await ctx.addInitScript(({raw,sample})=>{if(!sessionStorage.getItem('seeded')){if(raw)localStorage.setItem('duskbound.save.v1',raw);localStorage.setItem('duskbound.save.v2',sample);localStorage.setItem('duskbound.save.v1.before-v2','original backup bytes');sessionStorage.setItem('seeded','yes');}window.readyCalls=0;window.AndroidBridge={gameReady(){window.readyCalls++;},vibrate(){},startupError(m){throw Error(m);}};},{raw,sample});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/assets/index.html');await page.waitForFunction(()=>window.readyCalls===1);
 assert.equal(await page.locator('#v2-home').count(),0);assert.equal(await page.getByText('返回七灯余响').count(),0);
 assert.match(await page.locator('.title-footer').textContent(),/1\.1\.1/);
 assert.equal(await page.locator('#continue-game').isDisabled(),!ending);
 if(ending){await page.locator('#continue-game').tap();await page.locator('#pause').tap();const saved=decodeSave(await page.evaluate(()=>localStorage.getItem('duskbound.save.v1')));assert.equal(saved.ending,ending);assert.equal(saved.stage,10);assert.deepEqual(saved.inventory,old.inventory);}
 else{await page.locator('#new-game').tap();assert.equal(await page.locator('#dialog-layer').isVisible(),true);}
 assert.equal(await page.evaluate(()=>localStorage.getItem('duskbound.save.v2')),sample);assert.equal(await page.evaluate(()=>localStorage.getItem('duskbound.save.v1.before-v2')),'original backup bytes');
 await page.goto(origin+'/assets/prologue.html');await page.waitForURL('**/assets/index.html');await page.waitForFunction(()=>window.readyCalls===1);
 assert.deepEqual(errors,[]);await page.screenshot({path:out+`unified-${ending||'new'}.png`});
 report.cases.push({name:ending?`preserve ${ending} story and resources; legacy URL redirects`:'sample-only player can start story; sample bytes preserved',passed:true});await ctx.close();
}}catch(e){report.error=e.stack;process.exitCode=1;}finally{await browser.close();writeFileSync(out+'unified-entry-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
