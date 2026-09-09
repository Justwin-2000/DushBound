import { VERSION, DEFAULT_SETTINGS, ENEMIES, BOSS_MOVES } from './data.js';
const KEY = 'duskbound.save.v1';
const num = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
export function validateSave(s) {
  if (!s || s.saveVersion !== VERSION || !['town', 'dungeon'].includes(s.scene) || !Number.isInteger(s.stage) || !num(s.stage, 1, 10)) return false;
  const p = s.player, inv = s.inventory, r = s.run, t = s.tutorial;
  if (!p || ![100,110].includes(p.maxHp) || !num(p.hp, 0, p.maxHp) || !num(p.stamina, 0, 100) || !num(p.x, 0, 7300) || !num(p.y, 170, 460) || ![-1,1].includes(p.facing) || ![0,1].includes(p.weapon) || !Number.isInteger(p.potions) || !num(p.potions,0,3)) return false;
  if (!inv || !['coins','iron','leaf','salve'].every(k => Number.isInteger(inv[k]) && num(inv[k],0,k==='salve'?1:999))) return false;
  if (!s.flags || !['cloak','miloGift','leafTaken','memory','log','core','tag'].every(k=>typeof s.flags[k]==='boolean') || ![null,'honesty','silence'].includes(s.ending)) return false;
  if ((s.stage === 10) !== Boolean(s.ending) || (s.stage >= 8 && s.stage < 10 && (!s.flags.core || !s.flags.tag))) return false;
  if (!t || !['hits','combo','dodges','blocks','parries','attempts'].every(k=>Number.isInteger(t[k])&&num(t[k],0,9999)) || typeof t.active!=='boolean') return false;
  if (!r || !Number.isInteger(r.room) || !num(r.room,0,6) || !Number.isInteger(r.wave) || !num(r.wave,0,2) || !num(r.corruption,0,100) || !num(r.startIron,0,999) || !Array.isArray(r.rewarded) || !r.rewarded.every(v=>Number.isInteger(v)&&num(v,0,6)) || !['campUsed','chestUsed','won','clear','replay','salveUsed'].every(k=>typeof r[k]==='boolean')) return false;
  if (!Array.isArray(s.enemies) || s.enemies.length>5 || s.enemies.some(e=>!ENEMIES[e.kind] || !num(e.hp,0,ENEMIES[e.kind].hp) || !num(e.maxHp,1,ENEMIES[e.kind].hp) || e.hp>e.maxHp || !num(e.x,0,1600) || !num(e.y,170,460) || !Number.isInteger(e.id) || !num(e.id,0,1e9) || !['chase','windup','recover','stunned','transition'].includes(e.state) || !num(e.timer,0,10) || ![1,-1].includes(e.facing) || ![1,2].includes(e.phase) || !['transitioned','summoned'].every(k=>typeof e[k]==='boolean') || !['parries','attackCount'].every(k=>Number.isInteger(e[k])&&num(e[k],0,1e9)) || ![0,1].includes(e.chargeStep) || !num(e.tx,0,1600) || !num(e.ty,0,460) || !num(e.flash,0,1) || !Array.isArray(e.history) || e.history.length>3 || !e.history.every(m=>Object.hasOwn(BOSS_MOVES,m)) || ![...Object.keys(BOSS_MOVES),'strike'].includes(e.move))) return false;
  if (s.scene==='dungeon' && (p.x>1600 || s.stage<6)) return false;
  if (!num(s.playTime,0,1e9) || !Array.isArray(s.logs) || s.logs.length>30 || s.logs.some(v=>typeof v!=='string'||v.length>1000)) return false;
  if (!s.settings || !Object.entries(DEFAULT_SETTINGS).every(([k,v])=>typeof s.settings[k]===typeof v)) return false;
  if (!['master','music','sfx','controls'].every(k=>num(s.settings[k],0,1)) || ![30,60].includes(s.settings.fps)) return false;
  return true;
}
function checksum(s) { let h=2166136261; for (let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619); return (h>>>0).toString(16); }
export function encodeSave(s) { const payload=JSON.stringify(s); return JSON.stringify({checksum:checksum(payload),payload}); }
export function decodeSave(raw) { const e=JSON.parse(raw); if(typeof e.payload!=='string'||checksum(e.payload)!==e.checksum)throw Error('存档校验失败'); const s=JSON.parse(e.payload); if(!validateSave(s))throw Error('存档版本或内容无效'); return s; }
export class SaveStore {
  constructor(storage) { this.storage=storage; this.error=''; this.recovered=false; this.blocked=false; }
  load() {
    this.error=''; this.recovered=false; let main,backup;
    try {main=this.storage.getItem(KEY); backup=this.storage.getItem(KEY+'.backup');} catch {this.error='此设备暂时无法读取存档。进度仍可在本次游玩中保留。'; return null;}
    if(!main&&!backup)return null;
    for(const [i,raw]of [main,backup].entries()) { if(!raw)continue;try {const s=decodeSave(raw); this.recovered=i===1; this.blocked=false; return s;}catch{} }
    this.blocked=true;this.error='存档损坏，备份也无法恢复。原始数据已保留；可导入备份，或确认开始新旅程。';return null;
  }
  save(s) {
    if(this.blocked)return false;
    try {
      if(!validateSave(s))throw Error('存档字段验证失败');
      const next=encodeSave(s), prev=this.storage.getItem(KEY);
      this.storage.setItem(KEY+'.pending',next); decodeSave(this.storage.getItem(KEY+'.pending'));
      if(prev){try{decodeSave(prev);this.storage.setItem(KEY+'.backup',prev);}catch{}}
      this.storage.setItem(KEY,next); this.storage.removeItem(KEY+'.pending');this.error='';return true;
    } catch {this.error='自动保存暂时失败，当前进度仍在。可从设置导出备份。';return false;}
  }
  reset() { this.blocked=false; }
  export(s) {return encodeSave(s);}
  import(raw) {const s=decodeSave(raw);this.blocked=false; if(!this.save(s))throw Error(this.error);return s;}
}
