const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const base=process.env.DUSKBOUND_TEST_ORIGIN||'http://localhost:4173/index.html';
const output=fileURLToPath(new URL('./output/',import.meta.url));mkdirSync(output,{recursive:true});
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(m=>m[1]);
const entry=scripts.at(-1),entryUrl=new URL(entry,base).href;
const report={testedAt:new Date().toISOString(),environment:'Latest Edge with missing API fixtures; does NOT emulate Chrome 58 parsing or Android WebView',entry,cases:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
async function scenario(name,setup,check,viewport={width:844,height:390}){
 const context=await browser.newContext({viewport,hasTouch:true});const page=await context.newPage(),errors=[];page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push({type:'pageerror',message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({type:'console',message:m.text()});});page.on('requestfailed',r=>errors.push({type:'resource',message:r.failure()?.errorText,url:r.url()}));
 try{if(setup)await setup(context,page);await page.goto(base,{waitUntil:'networkidle'});await check(page,errors);report.cases.push({name,passed:true,errors});console.log('PASS '+name);}
 catch(e){report.cases.push({name,passed:false,message:e.message,errors});console.log('FAIL '+name+': '+e.message);await page.screenshot({path:output+'compat-'+report.cases.length+'-failed.png'}).catch(()=>{});}
 finally{await context.close();}
}
async function choice(page,action){for(let i=0;i<10;i++){if(await page.locator(`[data-choice="${action}"]`).isVisible())return page.locator(`[data-choice="${action}"]`).click();await page.locator('[data-dialog-next]').click();}throw Error('Missing choice '+action);}
await scenario('classic entry and real title controls initialize',null,async(page,errors)=>{
 assert.ok(!/type\s*=\s*["']module["']/.test(html),'Release entry still requires module loading');
 await page.locator('#title-settings').click();assert.match(await page.locator('#modal-title').textContent(),/设置/);await page.locator('#close-modal').click();await page.locator('#new-game').click();await choice(page,'intro');assert.equal(await page.locator('#hud').isVisible(),true);assert.equal(await page.locator('#fatal').isVisible(),false);assert.deepEqual(errors,[]);
});
await scenario('missing globalThis/clone/Array.at/String.at/hasOwn permits actual gameplay',async context=>{
 await context.addInitScript(function(){delete window.globalThis;delete window.structuredClone;delete Array.prototype.at;delete String.prototype.at;delete Object.hasOwn;});
},async(page,errors)=>{
 const caps=await page.evaluate(()=>({root:typeof window.globalThis,clone:typeof window.structuredClone,arrayAt:typeof Array.prototype.at,stringAt:typeof String.prototype.at,own:typeof Object.hasOwn}));assert.deepEqual(caps,{root:'object',clone:'function',arrayAt:'function',stringAt:'function',own:'function'});
 await page.locator('#title-settings').click();await page.locator('#close-modal').click();await page.locator('#new-game').click();await choice(page,'intro');await page.keyboard.down('j');await page.waitForTimeout(600);await page.keyboard.up('j');await page.waitForTimeout(200);
 await page.locator('#map-button').click();await page.locator('[data-travel="1710"]').click();await page.waitForFunction(()=>document.querySelector('#interact-label').textContent.includes('格伦'));await page.locator('#bag-button').click();assert.match(await page.locator('#modal-title').textContent(),/行囊/);await page.locator('#close-modal').click();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#continue-game').isDisabled(),false);await page.locator('#continue-game').click();assert.equal(await page.locator('#hud').isVisible(),true);assert.equal(await page.locator('#fatal').isVisible(),false);assert.deepEqual(errors,[]);await page.screenshot({path:output+'compat-missing-api-gameplay.png'});
});
for(const mode of ['syntax-error','network-error','never-initializes'])await scenario('startup '+mode+' displays visible diagnosis',async(_context,page)=>{
 await page.route(entryUrl,async route=>{if(mode==='network-error')return route.abort('failed');await route.fulfill({status:200,contentType:'text/javascript',body:mode==='syntax-error'?'function broken syntax {':'/* Intentionally omit boot ready(). */'});});
},async page=>{await page.locator('#fatal').waitFor({state:'visible',timeout:15000});assert.ok((await page.locator('#fatal').textContent()).trim().length>=8);await page.screenshot({path:output+'compat-'+mode+'.png'});});
for(const viewport of [{width:915,height:360},{width:960,height:320},{width:740,height:300},{width:926,height:428},{width:900,height:450},{width:960,height:540}])await scenario(`landscape ${viewport.width}x${viewport.height} title/game/menu buttons remain clickable`,null,async(page,errors)=>{
 const layout=await page.evaluate(()=>{
  const selectors=['.title-top','.title-content>.eyebrow','.title-content>h1','.title-rule','.title-poem','#new-game','#continue-game','.title-links','#save-info','.title-footer'];
  const boxes=selectors.map(selector=>({selector,e:document.querySelector(selector)})).filter(({e})=>e&&getComputedStyle(e).display!=='none').map(({selector,e})=>({selector,r:e.getBoundingClientRect()}));
  const overlap=[];
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>1&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>1)overlap.push([a.selector,b.selector]);}
  return {overlap,outside:boxes.filter(({r})=>r.x<0||r.y<0||r.right>innerWidth+.5||r.bottom>innerHeight+.5).map(b=>b.selector)};
 });
 await page.screenshot({path:output+`title-${viewport.width}x${viewport.height}.png`});
 assert.deepEqual(layout,{overlap:[],outside:[]},'title text or controls overlap');
 const bounds=await page.locator('#new-game').boundingBox();assert.ok(bounds&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width&&bounds.y+bounds.height<=viewport.height,'new-game button outside viewport');
 await page.locator('#title-settings').tap();await page.locator('#close-modal').tap();await page.locator('#new-game').tap();await choice(page,'intro');
 const out=await page.evaluate(()=>Array.from(document.querySelectorAll('#hud button,#touch-controls button')).filter(e=>!e.closest('.hidden')&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,r:e.getBoundingClientRect()})).filter(o=>o.r.width>0&&(o.r.x<0||o.r.y<0||o.r.right>innerWidth+.5||o.r.bottom>innerHeight+.5)).map(o=>o.id));assert.deepEqual(out,[]);await page.locator('#pause').tap();await page.locator('[data-ui="settings"]').tap();await page.locator('#close-modal').tap();assert.deepEqual(errors,[]);await page.screenshot({path:output+`landscape-${viewport.width}x${viewport.height}.png`});
},viewport);
await browser.close();writeFileSync(output+'compat-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.cases.some(c=>!c.passed))process.exitCode=1;
