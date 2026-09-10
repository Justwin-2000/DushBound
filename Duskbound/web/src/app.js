import { Game, newState } from './game.js';
import { SaveStore, decodeSave } from './store.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Sound } from './audio.js';
import { DEFAULT_SETTINGS, QUESTS, PLACES, ROOMS, ENDINGS, PRICES } from './data.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
  sword:'M5 19 17 7m-5-2 7-2-2 7M3 17l4 4m-4 0 4-4m2-2 3 3',
  shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8 12l3 3 5-6',
  dodge:'m14 3-5 8h6l-5 10M3 8h4M2 13h4M4 18h3',
  potion:'M9 3h6M10 3v5l-5 9c-1 3 1 4 3 4h8c2 0 4-1 3-4l-5-9V3M7 14h10',
  bag:'M7 8V6a5 5 0 0 1 10 0v2M5 8h14l2 13H3ZM9 12v2m6-2v2',
  map:'m3 5 6-2 6 3 6-2v16l-6 2-6-3-6 2ZM9 3v16m6-13v16',
  lamp:'M7 9h10v11H7ZM6 20h12M5 9l7-6 7 6M12 12v5M10 2h4',
  book:'M3 4h7c1 0 2 1 2 2 0-1 1-2 2-2h7v16h-7c-1 0-2 1-2 1s-1-1-2-1H3ZM12 6v15M6 8h3m6 0h3',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  home:'m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8',
  leaf:'M20 3C5 1 1 10 6 16s16 3 14-13ZM5 21 16 8M8 14h6',
  iron:'m7 4 10 1 5 9-6 6-12-1-2-8ZM7 4l2 8 8-7M9 12l7 8M2 11l7 1',
  coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 8h6v8H9Z',
  cloak:'M9 3h6l6 17-9 1-9-1ZM9 3l3 7 3-7M12 10v11',
  gate:'M3 21V6h5v15M16 21V6h5v15M2 6l3-3 4 3m6 0 4-3 3 3M8 9h8M11 9v12m3-12v12',
  inn:'m3 9 9-6 9 6M5 8v13h14V8M8 12h3v3H8m5-3h3v3h-3M10 21v-3h4v3',
  play:'m8 4 12 8-12 8Z',
  tag:'M8 3h8l4 5v12H4V8ZM12 6v1M8 12h8m-8 4h6',
  forge:'M3 6h18l-5 6H7ZM9 12v7m6-7v7M6 20h12',
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.lamp}"/></svg>`;
$('map-button').innerHTML=icon('map');$('bag-button').innerHTML=icon('bag');$('potion-icon').innerHTML=icon('potion');
for(const [id,name]of [['attack','sword'],['block','shield'],['dodge','dodge']])$(id).querySelector('.action-icon').innerHTML=icon(name);
let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){}};}
const store=new SaveStore(storage),sound=new Sound(),renderer=new Renderer($('world'));
let saved=store.load(),game=null,onTitle=true,menu=null,dialogIndex=0,currentDialog=null,regionTimer=null,hudLast='',lastFrame=0,accumulator=0,settings={...DEFAULT_SETTINGS,...saved?.settings},saveErrorShown=false,restoreFocus=null,lastBackExit=-1e9;
try{const raw=JSON.parse(storage.getItem('duskbound.settings')||'null');if(raw)for(const k in DEFAULT_SETTINGS){const v=raw[k];if(typeof v!==typeof DEFAULT_SETTINGS[k])continue;if(typeof v==='boolean')settings[k]=v;else if(k==='fps'&&[30,60].includes(v))settings[k]=v;else if(k!=='fps'&&Number.isFinite(v)&&v>=(k==='controls'?.2:0)&&v<=1)settings[k]=v;}}catch{}
const input=new Input(()=>onTitle?null:game,togglePause,()=>{if(currentDialog){advanceDialog();}else if(!menu)game?.interact();},sound);
function applySettings(){sound.settings=settings;document.documentElement.style.setProperty('--control-opacity',settings.controls);if(game)game.s.settings={...settings};}
applySettings();
function showToast(text,duration=3600){const nodes=$('toasts');if([...nodes.children].some(n=>n.textContent===text))return;while(nodes.children.length)nodes.firstChild.remove();const n=document.createElement('div');n.className='toast';n.textContent=text;nodes.appendChild(n);setTimeout(()=>n.remove(),duration);}
function saveGame(){if(!game)return;const ok=store.save(game.s);if(ok){saved=structuredClone(game.s);$('save-indicator').textContent='已自动保存';saveErrorShown=false;}else if(!saveErrorShown){showToast(store.error,7000);saveErrorShown=true;}}
function refreshTitle(){const b=$('continue-game');b.disabled=!saved;b.className=saved?'primary':'secondary';b.style.order=saved?'0':'1';$('new-game').className=saved?'secondary':'primary';b.querySelector('span').textContent='继续旅程';$('title-ending').classList.toggle('hidden',!saved?.ending);if(saved?.ending)$('title-ending').textContent='◇ 余烬已燃 · '+ENDINGS[saved.ending].title;
  $('save-info').textContent=saved?`${saved.scene==='town'?'暮边镇':ROOMS[saved.run.room].name} · ${Math.floor(saved.playTime/60)} 分钟 · 自动存档`:store.error||'提灯已备好，等你出发。';
}
function begin(state,isNew=false){input.clear();onTitle=false;game=new Game(state);settings={...game.s.settings};applySettings();$('title-screen').classList.add('hidden');$('hud').classList.remove('hidden');$('touch-controls').classList.remove('hidden');hideModal(false);renderer.camera=Math.max(0,game.player.x-renderer.w*.4);currentDialog=null;$('dialog-layer').classList.add('hidden');lastFrame=performance.now();accumulator=0;hudLast='';if(isNew)game.startIntro();else showToast('旅程已恢复 · 前方的灯还亮着');requestFullscreen(false);processEvents();refreshHud();saveGame();}
function requestNew(){if(saved||store.blocked){showModal('confirm','新的旅程',`<p>当前旅程将被新存档替换。你可以先到设置里导出备份。</p><div class="button-row"><button class="secondary" data-ui="close">保留当前旅程</button><button class="primary" data-ui="confirm-new">开始新旅程</button></div>`);}else startNew();}
function startNew(){store.reset();begin(newState(settings),true);}
function backToTitle(){input.clear();if(game){game.pause();processEvents();saveGame();}onTitle=true;hideModal(false);currentDialog=null;$('dialog-layer').classList.add('hidden');$('hud').classList.add('hidden');$('touch-controls').classList.add('hidden');$('title-screen').classList.remove('hidden');refreshTitle();}
function showModal(name,title,html,kicker='D U S K B O U N D'){restoreFocus=document.activeElement;input.clear();menu=name;if(game&&!onTitle)game.pause();$('modal-title').textContent=title;$('modal-kicker').textContent=kicker;$('modal-body').innerHTML=html;$('modal-layer').classList.remove('hidden');$('close-modal').focus({preventScroll:true});processSavesOnly();}
function hideModal(resume=true){menu=null;$('modal-layer').classList.add('hidden');if(game&&!onTitle&&resume)game.resume();input.clear();if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});}
function togglePause(){if(currentDialog&&!menu){openMenu('pause');return;}if(menu){hideModal();return;}if(onTitle)return;openMenu('pause');}
function openMenu(name){const s=game?.s||saved,p=s?.player;let html='',title='';
  if(name==='pause'){
    title='片刻歇息';const items=[['resume','play','继续旅程','Esc'],['journal','book','主线与手记',''],['inventory','bag','行囊',''],['equipment','sword','装备',''],['map','map','地图',''],['records','book','对话记录',''],['settings','settings','设置',''],['confirm-title','home','返回标题','']];
    html=`<div class="menu-grid">${items.map(([n,i,t,k])=>`<button data-ui="${n}">${icon(i)}<span>${t}</span><small>${k}</small></button>`).join('')}${s.scene==='dungeon'?`<button class="wide" data-ui="confirm-retreat">${icon('gate')}安全撤回小镇<small>保留已得物资</small></button>`:''}</div><div class="menu-meta"><span>${s.scene==='town'?'暮边镇':ROOMS[s.run.room].name}</span><span>旅程 ${Math.floor(s.playTime/60)} 分钟</span><span>单人 · 自动保存</span></div>`;
  }else if(name==='inventory'){
    title='巡界者的行囊';html=`<span class="section-label">消耗品</span>${item('potion','恢复药剂','恢复 35 生命；饮用过程中受击会打断，药剂保留。',`×${p.potions}`,p.potions&&p.hp<p.maxHp?'<button class="small-button" data-ui="use-potion">使用</button>':'')}${item('leaf','苦叶膏','涂抹后，下一次房间侵蚀增长减少 10。',`×${s.inventory.salve}`,s.inventory.salve&&!s.run.salveUsed?'<button class="small-button" data-ui="use-salve">涂抹</button>':'')}
      <span class="section-label" style="margin-top:25px">材料与货币</span>${item('coin','旧币','原野里的旧时代货币。',s.inventory.coins)}${item('iron','灰铁',`收集 ${PRICES.upgradeIron} 块可请格伦强化长剑一次。`,s.inventory.iron)}${item('leaf','苦叶','药草屋可免费将一份苦叶制成苦叶膏。',s.inventory.leaf)}
      ${s.flags.core||s.flags.tag||s.flags.log?'<span class="section-label" style="margin-top:25px">关键物品 · 永久保留</span>':''}${s.flags.core?item('lamp','黯淡核心','尚有余温。界灯正在等待它。',''):''}${s.flags.tag?item('tag','艾琳的军牌','一个名字，和一个尚未被说出的故事。',''):''}${s.flags.log?item('book','士兵日志','艾琳说，风车的灯昨晚自己亮了。',''):''}`;
  }else if(name==='equipment'){
    title='剑与提灯';html=`${item('sword',p.weapon?'巡界长剑 · 已强化':'巡界长剑','旧刃仍有分量。三段攻击，最后一击最重。',p.weapon?'Ⅰ':'')}${item('cloak',s.flags.cloak?'旧巡界斗篷':'旧皮甲',s.flags.cloak?'伊妲替你缝好了领口。生命上限 +10。':'去旅店找伊妲，取回她保管的斗篷。','')}<div class="stat-grid"><div><small>攻击</small><b>${p.weapon?15:12}</b></div><div><small>防御</small><b>2</b></div><div><small>生命上限</small><b>${p.maxHp}</b></div></div><p>装备随身携带，无需反复装卸。</p>${!p.weapon?`<div class="notice">格伦的锻造 · 需要灰铁 6 块，现有 ${s.inventory.iron} 块。强化后攻击提升至 15。</div><button class="primary" data-ui="upgrade" ${s.scene!=='town'||s.inventory.iron<6?'disabled':''}>${s.scene!=='town'?'返回小镇后可强化':'请格伦强化长剑'} <span>6 灰铁</span></button>`:'<div class="notice">这把剑已经磨得足够锋利。剩下的，要靠握剑的人。</div>'}`;
  }else if(name==='shop'){
    title='米洛的补给';html=`<div class="menu-meta" style="margin:0 0 21px"><span>出发前，把背包再检查一遍。</span><span>旧币 ${s.inventory.coins}</span></div>${item('potion','恢复药剂','每瓶恢复 35 生命，最多携带 3 瓶。',`${p.potions}/3`,`<button class="small-button" data-buy="potion" ${p.potions>=3||s.inventory.coins<PRICES.potion?'disabled':''}>${PRICES.potion} 旧币</button>`)}${item('leaf','苦叶膏','下一个产生侵蚀的房间，增长减少 10。',`${s.inventory.salve}/1`,`<button class="small-button" data-buy="salve" ${s.inventory.salve||s.inventory.coins<PRICES.salve?'disabled':''}>${PRICES.salve} 旧币</button>`)}${item('leaf','调制苦叶膏','用一份苦叶，请米洛免费调制。',`${s.inventory.leaf} 叶`,`<button class="small-button" data-buy="craft" ${!s.inventory.leaf||s.inventory.salve?'disabled':''}>调制</button>`)}<div class="notice">旅店可免费恢复生命，并将药剂补至两瓶。米洛首次见面还会赠送一瓶。</div>`;
  }else if(name==='map'){
    title=s.scene==='town'?'暮边镇街道':'灰风原野';if(s.scene==='town'){html=`<p>从西向东，一条被灯火照亮的街道。</p><div class="map-list">${PLACES.map((v,i)=>`<div class="map-stop"><span>0${i+1}</span>${icon(v.icon)}<strong>${v.name}</strong><small>${Math.abs(p.x-v.x)<400?'当前附近':''}</small><button class="small-button" data-travel="${v.x}" ${s.tutorial.active?'disabled':''}>前往</button></div>`).join('')}</div>${s.tutorial.active?'<div class="notice">训练中请先留在木桩旁。完成训练后可使用街道导航。</div>':'<div class="notice">可步行探索，也可点「前往」快速到达。东门会检查你的远征准备。</div>'}`;}else{html=`<div class="map-list">${ROOMS.map((v,i)=>`<div class="map-stop"><span>0${i+1}</span>${icon(i===3?'lamp':i===6?'shield':'map')}<strong>${v.name}</strong><small>${i<s.run.room?'已通过':i===s.run.room?(s.run.clear?'道路已开启':'所在区域'):'尚未抵达'}</small></div>`).join('')}</div><p>清除当前区域全部敌人，右侧道路才会开放。旧营火可以休息一次。</p>`;}
  }else if(name==='journal'){
    title='余烬初巡';html=`<span class="section-label">当前目标</span><div class="quest-detail">${QUESTS[s.stage]}</div><p>${s.stage<4?'小镇的人们记得你。先学会如何重新上路。':s.stage<8?'带回旧风车的备用核心，为暮边镇重新点亮界灯。':s.stage<10?'你带回了核心，也带回了一个沉甸甸的名字。':ENDINGS[s.ending].lines.at(-1)}</p><ol class="quest-steps">${QUESTS.slice(1).map((q,i)=>`<li class="${i+1<s.stage?'done':i+1===s.stage?'active':''}"><i>${i+1<s.stage?'✓':i+1===s.stage?'◇':'·'}</i>${q}</li>`).join('')}</ol>${s.flags.memory?'<div class="notice">记忆闪回：洛恩从界灯上取下碎片。血沿着指缝滴落，他没有松手。</div>':''}<button class="secondary" data-ui="help">重新查看操作说明 <span>→</span></button>`;
  }else if(name==='records'){
    title='灯下的对话';html=s.logs.length?s.logs.slice().reverse().map(v=>`<div class="log-entry">${esc(v)}</div>`).join(''):'<p>暂时没有记录。去和镇上的人说说话吧。</p>';
  }else if(name==='settings'){
    title='设置';html=`${range('master','主音量')}${range('music','音乐')}${range('sfx','音效')}${range('controls','触控按钮透明度')}${toggle('shake','屏幕震动')}${toggle('vibration','设备振动')}${toggle('numbers','伤害数字')}${toggle('assist','援助模式','受到的伤害减少 30%，不改变剧情和奖励。')}<div class="setting-row"><label for="fps-setting">画面帧率<small>战斗逻辑始终按固定时间运行。</small></label><select id="fps-setting" data-setting="fps"><option value="60" ${settings.fps===60?'selected':''}>60 FPS</option><option value="30" ${settings.fps===30?'selected':''}>30 FPS · 省电</option></select></div><div class="setting-row"><label>语言</label><span>简体中文</span></div><div class="button-row"><button class="secondary" data-ui="export" ${!s?'disabled':''}>导出存档备份</button><button class="secondary" data-ui="import">导入存档</button></div><div class="button-row"><button class="secondary" data-ui="help">操作说明</button>${window.AndroidBridge?'<button class="secondary" data-ui="exit">保存并退出</button>':''}</div><p style="margin-top:15px;font-size:11px">存档保存在本机。卸载应用前，请先导出备份。</p>`;
  }else if(name==='help'){
    title='巡界者须知';html=`<div class="help-grid"><div><strong>移动</strong>左下摇杆<br><span>键盘 WASD / 方向键</span></div><div><strong>三段连击</strong>连续点击或按住攻击<br><span>键盘 J / 空格</span></div><div><strong>闪避</strong>向摇杆方向闪避；静止时后撤<br><span>键盘 K · 消耗 24 体力</span></div><div><strong>格挡与反击</strong>按住格挡，减伤；迎击瞬间按下可完美格挡<br><span>键盘 L · 持续消耗体力</span></div><div><strong>药剂</strong>右上角饮用药剂<br><span>键盘 H · 恢复 35 生命</span></div><div><strong>交谈 / 暂停</strong>靠近发光标记，点击交互<br><span>键盘 E / Esc 暂停</span></div></div><div class="notice">黄色「!」攻击可格挡；红色「× 破盾」必须闪避。完美格挡可以反弹弩箭，连续两次完美格挡能打破首领架势。体力在停止消耗 0.6 秒后恢复。</div><p>房间切换、剧情推进、物品变动都会自动保存。进入后台会暂停。倒下时保留全部旧币和关键物品，只损失本次获得的半数灰铁。</p>`;
  }else if(name==='credits'){
    title='灯火长明';html='<div class="credits"><div class="eyebrow">D U S K B O U N D</div><h3>暮边镇 · 余烬初巡</h3><p>谨献给每一个在黄昏出发，<br>也愿意为别人留一盏灯的人。</p><p>世界与故事 · 《暮边镇》原始设定<br>游戏实现 · Codex 协作开发<br>主视觉 · AI 原创像素插画<br>场景、角色与声音 · 程序绘制与合成</p><p>第一版 · 完全离线 · 无广告 · 无内购</p></div>';
  }else return;
  showModal(name,title,html);
}
function item(art,name,description,amount,action=''){return `<div class="item-row"><div class="item-art">${icon(art)}</div><div class="item-copy"><strong>${name}</strong><p>${description}</p></div><b>${amount}</b>${action}</div>`;}
function range(key,label){return `<div class="setting-row"><label for="setting-${key}">${label}</label><input id="setting-${key}" data-setting="${key}" type="range" min="${key==='controls'?20:0}" max="100" value="${Math.round(settings[key]*100)}" aria-label="${label}"></div>`;}
function toggle(key,label,desc=''){return `<div class="setting-row"><label for="setting-${key}">${label}${desc?`<small>${desc}</small>`:''}</label><input id="setting-${key}" data-setting="${key}" type="checkbox" ${settings[key]?'checked':''}></div>`;}
function showDialog(d){input.clear();currentDialog=d;dialogIndex=0;$('dialog-layer').classList.remove('hidden');renderDialog();}
function renderDialog(){const d=currentDialog;if(!d)return;$('dialog-speaker').textContent=d.speaker;$('dialog-text').textContent=d.lines[dialogIndex];$('dialog-index').textContent=`${dialogIndex+1} / ${d.lines.length}`;$('dialog-portrait').textContent=d.speaker.length<=3?d.speaker[0]:'◇';$('dialog-choices').innerHTML=dialogIndex<d.lines.length-1?'<button data-dialog-next>继续 <span aria-hidden="true">›</span></button>':d.choices.map(ch=>`<button data-choice="${esc(ch.action)}">${esc(ch.text)}</button>`).join('');}
function advanceDialog(){if(!currentDialog)return;if(dialogIndex<currentDialog.lines.length-1){dialogIndex++;renderDialog();sound.play('ui');}}
function showEnding(kind){const e=ENDINGS[kind];showModal('ending',e.title,`<div class="credits"><div class="eyebrow">余 烬 已 燃</div><h3>${e.title}</h3><p>${e.lines.at(-1)}</p><p>第一章 · 余烬初巡 · 完</p><div class="notice">界灯重新燃起，小镇的人们开始走出家门。<br>你仍可以回到街道，交谈、强化长剑，或再次远征。</div><p style="font-size:12px">世界与故事 · 原始设定<br>游戏实现 · Codex 协作开发<br>美术 · AI 主视觉与程序像素绘制<br>音乐与音效 · 程序合成</p><button class="primary" data-ui="resume">回到灯火中的小镇</button></div>`,'第一章 · 余烬初巡');}
function processSavesOnly(){if(game)saveGame();}
function processEvents(){if(!game)return;let save=false;for(const e of game.drain()){
  if(e.type==='save')save=true;else if(e.type==='toast')showToast(e.text);else if(e.type==='sound')sound.play(e.name);else if(e.type==='dialog')showDialog(e.dialog);else if(e.type==='close-dialog'){currentDialog=null;$('dialog-layer').classList.add('hidden');input.clear();}else if(e.type==='menu')openMenu(e.name);else if(e.type==='ending')showEnding(e.ending);else if(e.type==='shake')renderer.shake=Math.max(renderer.shake,e.strength);else if(e.type==='vibrate'&&settings.vibration){try{if(window.AndroidBridge)window.AndroidBridge.vibrate(e.duration);else navigator.vibrate?.(e.duration);}catch{}}else if(e.type==='region'){
    $('region-title').textContent=e.name;$('region-subtitle').textContent=e.subtitle;$('region').classList.add('hidden');void $('region').offsetWidth;$('region').classList.remove('hidden');clearTimeout(regionTimer);regionTimer=setTimeout(()=>$('region').classList.add('hidden'),3400);
  }}if(save)saveGame();
}
// HUD 每帧都会刷新，但绝大多数值并不变。这里按值缓存，只在真正变化时才写 DOM，
// 避免每帧十几次 textContent / style 赋值带来的无谓重排。
const hudCache={};
const hudText=(id,value)=>{if(hudCache[id]===value)return;hudCache[id]=value;$(id).textContent=value;};
const hudWidth=(id,value)=>{if(hudCache[id]===value)return;hudCache[id]=value;$(id).style.width=value;};
const hudFlag=(id,value)=>{if(hudCache[id]===value)return;hudCache[id]=value;$(id).classList.toggle('hidden',value);};
const hudStyle=(id,prop,value)=>{const k=id+'.'+prop;if(hudCache[k]===value)return;hudCache[k]=value;$(id).style[prop]=value;};
function refreshHud(){if(!game||onTitle)return;const s=game.s,p=s.player,r=s.run,boss=s.enemies.find(e=>e.kind==='boss'),near=game.nearby();
  hudText('hp-text',`${Math.ceil(p.hp)} / ${p.maxHp}`);hudWidth('hp-fill',p.hp/p.maxHp*100+'%');hudWidth('stamina-fill',p.stamina+'%');hudWidth('corruption-fill',r.corruption+'%');hudText('corruption-text',r.corruption);hudText('potion-count',p.potions);hudFlag('corruption-row',s.scene!=='dungeon');hudFlag('boss-hud',!boss);
  // 首领血量上限取自实例（spawn 时由 ENEMIES.boss.hp 写入），不再硬编码 620。
  if(boss){const max=boss.maxHp;hudWidth('boss-fill',boss.hp/max*100+'%');hudText('boss-value',Math.ceil(boss.hp)+' / '+max);hudText('boss-phase',boss.phase===2?'Ⅱ · 灯灭之时':'Ⅰ · 最后的命令');}
  const key=[s.scene,r.room,s.stage,s.ending,Math.floor(p.x/500)].join(':');if(key!==hudLast){hudLast=key;hudText('quest-text',QUESTS[s.stage]);hudText('place-name',s.scene==='town'?'暮边镇':ROOMS[r.room].name);hudText('place-subtitle',s.scene==='town'?(s.ending?'余烬已燃':'黄昏 · 界灯尚明'):`灰风原野 · ${r.room+1} / 7`);if(hudCache['room-dots']!==key){hudCache['room-dots']=key;$('room-dots').innerHTML=s.scene==='dungeon'?ROOMS.map((_,i)=>`<i class="${i<=r.room?'done':''}"></i>`).join(''):'';}}
  hudText('coins-text','旧币 '+s.inventory.coins);hudText('iron-text','灰铁 '+s.inventory.iron);hudFlag('tutorial',!s.tutorial.active);if(s.tutorial.active)hudText('tutorial-text',game.tutorialHint());
  hudFlag('interact',!near||!!menu||!!currentDialog);if(near)hudText('interact-label',near.label);
  hudStyle('attack','opacity',p.stamina<8?.5:1);hudStyle('dodge','opacity',p.stamina<24||game.p.dodgeCooldown>0?.5:1);
  hudStyle('touch-controls','visibility',!onTitle&&!currentDialog&&!menu?'visible':'hidden');
}
function importSave(raw){if(raw.length>1024*1024){showToast('存档文件过大，未导入');return;}let parsed;try{parsed=decodeSave(raw);}catch{showToast('存档无效或校验失败，当前旅程未改变',6000);return;}
  const buttonId='confirm-import';showModal('import-confirm','恢复备份',`<p>将恢复这份旅程：${esc(QUESTS[parsed.stage])}<br>所在位置：${parsed.scene==='town'?'暮边镇':ROOMS[parsed.run.room].name}<br>旅程时间：${Math.floor(parsed.playTime/60)} 分钟</p><div class="notice">确认后替换本机当前存档。</div><div class="button-row"><button class="secondary" data-ui="close">取消</button><button id="${buttonId}" class="primary">恢复这份旅程</button></div>`);
  $(buttonId).addEventListener('click',()=>{try{const s=store.import(raw);saved=s;begin(s);showToast('存档已恢复');}catch(e){showToast(e.message,6000);}});
}
function exportSave(){const s=game?.s||saved;if(!s)return;const raw=store.export(s);try{if(window.AndroidBridge?.exportSave){window.AndroidBridge.exportSave(raw);return;}const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='暮边镇-存档-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);showToast('存档备份已导出');}catch{showToast('无法导出，请检查设备的文件保存权限');}}
function importPicker(){if(window.AndroidBridge?.importSave)window.AndroidBridge.importSave();else $('import-file').click();}
async function requestFullscreen(explicit=true){if(window.AndroidBridge)return;try{if(explicit&&!document.fullscreenElement)await document.documentElement.requestFullscreen?.();if(document.fullscreenElement&&screen.orientation?.lock)await screen.orientation.lock('landscape');}catch{if(explicit)showToast('请将手机横过来；也可用浏览器菜单开启全屏。');}}
$('new-game').addEventListener('click',()=>{sound.unlock();requestNew();});$('continue-game').addEventListener('click',()=>{sound.unlock();if(saved)begin(saved);});
$('title-settings').addEventListener('click',()=>openMenu('settings'));$('title-help').addEventListener('click',()=>openMenu('help'));$('title-credits').addEventListener('click',()=>openMenu('credits'));
$('pause').addEventListener('click',togglePause);$('bag-button').addEventListener('click',()=>openMenu('inventory'));$('map-button').addEventListener('click',()=>openMenu('map'));$('quest-button').addEventListener('click',()=>openMenu('journal'));$('interact').addEventListener('click',()=>{game?.interact();processEvents();});$('close-modal').addEventListener('click',()=>hideModal());$('dialog-text').addEventListener('click',advanceDialog);$('fullscreen-button').addEventListener('click',()=>requestFullscreen(true));
$('dialog-layer').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.hasAttribute('data-choice')){const action=b.dataset.choice;game?.choose(action);processEvents();}else if(b?.hasAttribute('data-dialog-next')||!b)advanceDialog();});
$('modal-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;sound.unlock();sound.play('ui');if(b.dataset.buy){game.buy(b.dataset.buy);processEvents();openMenu('shop');return;}if(b.dataset.travel){game.travel(Number(b.dataset.travel));hideModal();processEvents();return;}const action=b.dataset.ui;if(!action)return;
  if(action==='close'||action==='resume'){hideModal();return;}if(action==='confirm-new'){startNew();return;}if(action==='use-potion'){hideModal();game.potion();return;}if(action==='use-salve'){game.useSalve();processEvents();openMenu('inventory');return;}if(action==='upgrade'){game.upgrade();processEvents();openMenu('equipment');return;}
  if(action==='confirm-title'){showModal('confirm','返回标题',`<p>当前旅程会自动保存。下次从标题选择「继续旅程」，即可接着游玩。</p><div class="button-row"><button class="secondary" data-ui="close">留在这里</button><button class="primary" data-ui="title">保存并返回</button></div>`);return;}if(action==='title'){backToTitle();return;}
  if(action==='confirm-retreat'){showModal('confirm','撤回灯火之中',`<p>你会带着已经获得的物资返回小镇。下次远征从第一间房重新出发。</p><div class="button-row"><button class="secondary" data-ui="close">继续远征</button><button class="primary" data-ui="retreat">安全撤回</button></div>`);return;}if(action==='retreat'){hideModal();game.retreat();processEvents();return;}
  if(action==='export'){exportSave();return;}if(action==='import'){importPicker();return;}if(action==='exit'){if(game)saveGame();window.AndroidBridge?.exitApp();return;}openMenu(action);
});
$('modal-body').addEventListener('input',e=>{const k=e.target.dataset.setting;if(!k)return;settings[k]=e.target.type==='checkbox'?e.target.checked:k==='fps'?Number(e.target.value):Number(e.target.value)/100;applySettings();try{storage.setItem('duskbound.settings',JSON.stringify(settings));}catch{}if(game)saveGame();else if(saved){saved.settings={...settings};store.save(saved);}});
$('import-file').addEventListener('change',async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(f.size>1024*1024){showToast('存档文件过大，未导入');return;}try{importSave(await f.text());}catch{showToast('无法读取这个文件');}});
window.addEventListener('native-import',e=>{if(typeof e.detail==='string')importSave(e.detail);});window.addEventListener('native-message',e=>{if(typeof e.detail==='string')showToast(e.detail);});window.addEventListener('native-back',()=>{
  // 标题页不再把返回键吞掉：连按两次退出应用，符合安卓用户的习惯。
  if(onTitle&&!menu){
    const now=performance.now();
    if(now-lastBackExit<1800){if(window.AndroidBridge?.exitApp)window.AndroidBridge.exitApp();else showToast('浏览器中请用标签页关闭');return;}
    lastBackExit=now;showToast('再按一次返回键退出',2000);return;
  }
  togglePause();});
function backgroundPause(){input.clear();if(game&&!onTitle){game.pause();processEvents();saveGame();if(!menu)openMenu('pause');}sound.suspend();accumulator=0;lastFrame=performance.now();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();else{sound.unlock();lastFrame=performance.now();accumulator=0;}});window.addEventListener('native-pause',backgroundPause);window.addEventListener('native-resume',()=>{sound.unlock();lastFrame=performance.now();accumulator=0;});window.addEventListener('pagehide',backgroundPause);window.addEventListener('resize',()=>{renderer.resize();renderElapsed=1e9;if(window.innerWidth<window.innerHeight&&!onTitle)backgroundPause();});
window.addEventListener('keydown',e=>{if(e.key==='Tab'&&menu){const focusable=[...$('modal-layer').querySelectorAll('button:not(:disabled),input,select')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
let renderElapsed=0;
function frame(now){const dt=lastFrame?Math.min(.1,(now-lastFrame)/1000):0;lastFrame=now;renderElapsed+=dt;
  if(game&&!onTitle){input.update(dt);accumulator+=dt;let steps=0;while(accumulator>=1/60&&steps<6){game.update(1/60);accumulator-=1/60;steps++;}processEvents();
    // 暂停、对话或菜单期间画面是静态的，把重绘降到 2 FPS：省掉空跑整帧的开销（菜单层
    // 还带 backdrop-filter 模糊），同时保留自愈能力——画布被 resize 或切后台清空后能自己画回来。
    const frozen=game.paused||!!game.dialog||!!menu;
    if(renderElapsed>=(frozen?.5:1/settings.fps)){renderer.draw(game,frozen?1/60:renderElapsed);refreshHud();renderElapsed=0;}
    sound.tick(game.s.scene==='town'?'town':game.s.run.room===6?'boss':'dungeon',game.paused||!!game.dialog);}
  else{sound.tick('title',!!menu);accumulator=0;}
  requestAnimationFrame(frame);
}
refreshTitle();if(store.recovered)setTimeout(()=>showToast('主存档损坏，已从上一份备份恢复旅程。',6500),500);if(store.error)setTimeout(()=>showToast(store.error,7500),500);requestAnimationFrame(frame);window.__duskboundBoot?.ready();
// The release exposes no gameplay mutation or debug interface.
