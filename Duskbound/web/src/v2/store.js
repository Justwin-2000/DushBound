import { decodeSave as decodeLegacy } from '../store.js';
import { SAMPLE, DEFAULT_KEYS } from './data.js';
import { newSession } from './game.js';
export const KEY='duskbound.save.v2', LEGACY='duskbound.save.v1';
const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const integer=(v,a,b)=>Number.isInteger(v)&&finite(v,a,b);
const short=(v,n=120)=>typeof v==='string'&&v.length<=n;
export function freshProfile(ending=null){return {schemaVersion:2,legacy:{ending,stage:1,flags:{},logs:[],coins:0,iron:0,leaf:0,salve:0,potions:1,warehousePotions:0,memorial:false,migrated:false},settings:{sound:.65,shake:true,fps:60,keys:{...DEFAULT_KEYS}},session:newSession(),tutorial:{targets:[],dash:false,skill:false},trialWins:0};}
export function validateProfile(v){
 if(!v||v.schemaVersion!==2||!v.legacy||!v.settings||!v.session||!v.tutorial||!integer(v.trialWins,0,1e6))return false;
 const l=v.legacy,o=v.settings,s=v.session,p=s.player;
 if(![null,'honesty','silence'].includes(l.ending)||!integer(l.stage,1,10)||!['coins','iron','leaf','salve','warehousePotions'].every(k=>integer(l[k],0,9999))||!integer(l.potions,0,2)||typeof l.migrated!=='boolean'||typeof l.memorial!=='boolean'||!l.flags||typeof l.flags!=='object'||Array.isArray(l.flags)||!Object.values(l.flags).every(x=>typeof x==='boolean')||!Array.isArray(l.logs)||l.logs.length>30||!l.logs.every(x=>short(x,1000)))return false;
 if(!finite(o.sound,0,1)||typeof o.shake!=='boolean'||![30,60].includes(o.fps)||!o.keys||!Object.keys(DEFAULT_KEYS).every(k=>short(o.keys[k],1)&&o.keys[k].length===1)||new Set(Object.values(o.keys)).size!==8)return false;
 if(!Array.isArray(v.tutorial.targets)||v.tutorial.targets.length>4||!v.tutorial.targets.every(x=>['static','strafe','orbit','cover'].includes(x))||typeof v.tutorial.dash!=='boolean'||typeof v.tutorial.skill!=='boolean')return false;
 if(!['practice','trial'].includes(s.mode)||!finite(s.clock,0,1e9)||![0,1].includes(s.wave)||!finite(s.preview,0,2)||!['done','dead'].every(k=>typeof s[k]==='boolean')||!Array.isArray(s.rewarded)||s.rewarded.length>2||new Set(s.rewarded).size!==s.rewarded.length||!s.rewarded.every(i=>[0,1].includes(i))||!['copper','nextId','shots','hits','damageTaken','dashes','cleared'].every(k=>finite(s[k],0,1e9))||s.copper!==s.rewarded.length*10||!finite(s.targetDelay,0,.13)||!['number','object'].includes(typeof s.targetId)||typeof s.usedSkill!=='boolean'||!Array.isArray(s.targetsHit)||s.targetsHit.length>4||!s.targetsHit.every(x=>['static','strafe','orbit','cover'].includes(x)))return false;
 if(!p||!finite(p.x,31,609)||!finite(p.y,61,321)||!finite(p.hp,0,6)||!finite(p.shield,0,6)||!finite(p.energy,0,120)||!integer(p.potions,0,2)||!finite(p.angle,-Math.PI*2,Math.PI*2)||![0,1].includes(p.active)||!Array.isArray(p.weapons)||p.weapons.length!==2||p.weapons[0]===p.weapons[1]||!p.weapons.every(x=>SAMPLE.includes(x))||!Array.isArray(p.cooldowns)||p.cooldowns.length!==2||!p.cooldowns.every(x=>finite(x,0,2)))return false;
 if(!integer(p.dashCharges,0,2)||!['switchTime','dashRecharge','dashTime','invulnerable','shieldTick','skillCooldown','ring','breakBoost'].every(k=>finite(p[k],0,15))||!finite(p.lastHurt,-10,s.clock)||!finite(p.dashX,-1,1)||!finite(p.dashY,-1,1))return false;
 if(p.melee&&(!finite(p.melee.time,0,.25)||!finite(p.melee.angle,-7,7)||!Array.isArray(p.melee.hit)||p.melee.hit.length>6||!p.melee.hit.every(x=>integer(x,0,1e9))))return false;
 if(!Array.isArray(s.enemies)||s.enemies.length>6||s.enemies.some(e=>!['target','rat','dog','archer'].includes(e.kind)||!integer(e.id,0,1e9)||!['x','y','ox','oy','tx','ty'].every(k=>finite(e[k],0,640))||!finite(e.hp,0,45)||!finite(e.maxHp,1,45)||e.hp>e.maxHp||!finite(e.r,5,12)||!['idle','spawn','chase','windup','charge','recover'].includes(e.state)||!finite(e.timer,-1e9,3)||!finite(e.angle,-7,7)||!finite(e.flash,0,1)||!finite(e.stun,-1,1)||!finite(e.vx,-1000,1000)||!finite(e.vy,-1000,1000)||e.kind==='target'&&!['static','strafe','orbit','cover'].includes(e.motion)))return false;
 if(!Array.isArray(s.bullets)||s.bullets.length>150||s.bullets.some(b=>!integer(b.id,0,1e9)||!integer(b.group,0,1e9)||!['enemy','friend'].includes(b.team)||!['round','needle'].includes(b.kind)||!finite(b.x,0,640)||!finite(b.y,0,360)||!finite(b.vx,-1000,1000)||!finite(b.vy,-1000,1000)||!finite(b.damage,0,50)||!finite(b.r,1,4)||!finite(b.remaining,0,500)||!integer(b.pierce,0,4)||!Array.isArray(b.hit)||b.hit.length>6||!b.hit.every(x=>integer(x,0,1e9))||!['P01','S01','W01','archer'].includes(b.source)))return false;
 return s.dead===(p.hp===0)&&(!s.done||s.rewarded.length===2);
}
function hash(text){let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return(n>>>0).toString(16);}
export function encode(v){if(!validateProfile(v))throw Error('第二版存档字段无效');const payload=JSON.stringify(v);return JSON.stringify({checksum:hash(payload),payload});}
export function decode(raw){if(typeof raw!=='string'||raw.length>1048576)throw Error('存档过大或格式无效');const e=JSON.parse(raw);if(typeof e.payload!=='string'||hash(e.payload)!==e.checksum)throw Error('存档校验失败');const v=JSON.parse(e.payload);if(!validateProfile(v))throw Error('不是有效的第二版存档');return v;}
export class ProfileStore {
 constructor(storage){this.storage=storage;this.error='';this.blocked=false;this.recovered=false;}
 write(v){if(this.blocked)return false;try{const raw=encode(v),prev=this.storage.getItem(KEY);this.storage.setItem(KEY+'.pending',raw);decode(this.storage.getItem(KEY+'.pending'));if(prev){try{decode(prev);this.storage.setItem(KEY+'.backup',prev);}catch{}}this.storage.setItem(KEY,raw);this.storage.removeItem(KEY+'.pending');this.error='';return true;}catch{this.error='本机保存失败，请在设置导出旅程。';return false;}}
 load(){try{const main=this.storage.getItem(KEY),backup=this.storage.getItem(KEY+'.backup');for(const [i,raw]of [main,backup].entries()){if(!raw)continue;try{const v=decode(raw);this.recovered=i===1;if(i===1&&main){const damagedKey=KEY+'.damaged.'+hash(main);this.storage.setItem(damagedKey,main);if(this.storage.getItem(damagedKey)!==main)throw Error('无法保存损坏源档');}return v;}catch{}}if(main||backup){this.blocked=true;this.error='第二版存档损坏，原始数据已保留。请导入备份，或在设置明确新建。';return freshProfile();}
   const old=this.storage.getItem(LEGACY),oldBackup=this.storage.getItem(LEGACY+'.backup');if(!old&&!oldBackup)return freshProfile();let legacy=null;for(const raw of [old,oldBackup]){if(!raw)continue;try{legacy=decodeLegacy(raw);break;}catch{}}
   if(!legacy){this.blocked=true;this.error='旧存档损坏，未迁移、未覆盖。可先回序章恢复，或在设置新建第二版。';return freshProfile();}
   // Back up exact source bytes before creating schema 2, including a corrupt main.
   for(const [suffix,raw]of [['',old],['.backup',oldBackup]])if(raw){let key=LEGACY+'.before-v2'+suffix;const prior=this.storage.getItem(key);if(prior&&prior!==raw)key+='.'+hash(raw);this.storage.setItem(key,raw);if(this.storage.getItem(key)!==raw)throw Error('备份写入失败');}
   const v=freshProfile(legacy.ending);v.legacy={ending:legacy.ending,stage:legacy.stage,flags:{...legacy.flags},logs:[...legacy.logs],coins:legacy.inventory.coins,iron:legacy.inventory.iron+(legacy.player.weapon?6:0),leaf:legacy.inventory.leaf,salve:legacy.inventory.salve,potions:Math.min(2,legacy.player.potions),warehousePotions:Math.max(0,legacy.player.potions-2),memorial:!!legacy.player.weapon,migrated:true};v.session.player.potions=v.legacy.potions;
   if(!this.write(v))throw Error('旧档备份后，新存档未能写入');return v;
  }catch{this.blocked=true;this.error='无法安全备份或迁移存档，原档未覆盖；可暂时试用，再导出进度。';return freshProfile();}}
 import(raw){const v=decode(raw),wasBlocked=this.blocked;this.blocked=false;if(!this.write(v)){this.blocked=wasBlocked;throw Error(this.error);}return v;}
 reset(){this.blocked=false;const v=freshProfile();if(!this.write(v))throw Error(this.error);return v;}
}
