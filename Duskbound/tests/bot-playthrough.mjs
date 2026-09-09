import { pathToFileURL } from 'node:url';
import { Game, newState, distance } from '../web/src/game.js';
import { BOSS_MOVES, COMBO, ENEMIES } from '../web/src/data.js';
import { validateSave } from '../web/src/store.js';

// This bot reads exact telegraph timers, so results demonstrate engine-level
// reachability rather than human reaction difficulty or real device operation.
// All progression and damage use ordinary game inputs. No HP, enemy, quest,
// inventory, position, or cooldown writes are used to complete the journey.
export function playBot({ seed = 1, fps = 60, strategy = 'reactive', ending = 'honesty', limit = 1800, journeys = 1, maxDeaths = 0 } = {}) {
  let rng = seed;
  const g = new Game(newState(), () => ((rng = rng * 16807 % 2147483647) - 1) / 2147483646);
  const report = { seed, fps, strategy, requestedEnding: ending, journeys, victories: 0, result: 'timeout', seconds: 0, deaths: 0, attacks: 0, dodges: 0, parries: 0, potions: 0, rooms: [], bossMoves: {}, invalidSaves: [], maxProjectiles: 0, maxEffects: 0, maxEnemies: 0 };
  let lastArea = '', lastHp = g.player.hp, lastPotions = g.player.potions, lastBossState = '', totalDamage = 0, recordedWon = false;
  const dt = 1 / fps;
  function moveTo(x, y, threshold = 12) {
    const dx = x - g.player.x, dy = y - g.player.y, d = Math.hypot(dx, dy);
    if (d < threshold) { g.input.x = 0; g.input.y = 0; return true; }
    g.input.x = dx / d; g.input.y = dy / d; return false;
  }
  function interactAt(id) {
    const point = g.interactables().find(p => p.id === id);
    if (!point) throw Error(`Missing interactable ${id} in ${g.s.scene}/${g.s.run.room}`);
    if (moveTo(point.x, point.y, 22)) g.interact();
  }
  function awayFrom(target) {
    let dx = g.player.x - target.x, dy = g.player.y - target.y;
    if (g.player.x < 140) dx = 1;
    if (g.player.x > g.worldWidth - 140) dx = -1;
    const d = Math.hypot(dx, dy) || 1; g.input.x = dx / d; g.input.y = dy / d;
  }
  function sword() { const old = g.p.action; if (g.attack() && old !== 'attack') report.attacks++; }
  function dodge() { if (g.dodge()) report.dodges++; }
  function town() {
    if (!g.s.flags.cloak) return interactAt('ida');
    if (g.s.stage < 4) {
      if (!g.s.tutorial.active) return interactAt('glen');
      const t = g.s.tutorial;
      if (t.hits < 3 || t.combo < 1) { if (moveTo(1800, 340, 8)) sword(); return; }
      if (g.p.action === 'attack') return;
      if (t.dodges < 2) { g.input.x = t.dodges ? -1 : 1; dodge(); return; }
      if (!moveTo(1800, 340, 8) || g.p.action === 'dodge') return;
      if (t.blocks < 1) g.block(true);
      else if (t.parries < 1) {
        if (g.trainingClock > .12) g.block(false);
        else g.block(true);
      }
      return;
    }
    g.block(false);
    if (g.s.stage === 4 || g.s.stage === 9) return interactAt('lorn');
    if (!g.s.flags.miloGift) return interactAt('milo');
    if (g.s.ending && report.victories >= journeys) { report.result = 'victory'; return; }
    if (g.player.hp < g.player.maxHp || g.player.potions < 2) return interactAt('ida');
    return interactAt('gate');
  }
  function combat() {
    const enemies = g.s.enemies.filter(e => e.hp > 0);
    if (!enemies.length) return;
    const nearest = [...enemies].sort((a, b) => distance(a, g.player) - distance(b, g.player))[0];
    if (strategy === 'aggressive' || (strategy === 'recover' && report.deaths === 0)) {
      g.block(false);
      if (g.player.hp <= g.player.maxHp - 35 && g.player.potions > 0 && g.p.action === 'idle') { g.potion(); return; }
      if (Math.abs(nearest.x - g.player.x) < 95 && Math.abs(nearest.y - g.player.y) < 55) sword();
      else moveTo(nearest.x - Math.sign(nearest.x - g.player.x) * 65, nearest.y, 10);
      return;
    }
    const threats = [];
    for (const e of enemies) if (e.state === 'windup') {
      const cfg = e.kind === 'boss' ? BOSS_MOVES[e.move] : ENEMIES[e.kind];
      const d = distance(e, g.player);
      if (e.kind === 'archer' || e.move === 'summon') continue;
      const inRange = e.kind === 'boss'
        ? e.move === 'field' ? g.fields.some(f => distance(f, g.player) < f.r + 12) : d < (cfg.dash ? cfg.dash + 70 : cfg.radius + 12)
        : d < (e.move === 'charge' ? 290 : cfg.range + 35);
      if (inRange) threats.push({ e, time: e.timer, blockable: e.kind !== 'boss' || cfg.blockable });
    }
    for (const b of g.projectiles) {
      const dx = g.player.x - b.x, dy = g.player.y - b.y;
      if (dx * b.vx + dy * b.vy > 0) threats.push({ e: b, time: Math.max(0, (distance(b, g.player) - 26) / 410), blockable: true });
    }
    threats.sort((a, b) => a.time - b.time);
    const imminent = threats.find(t => t.time <= .12);
    const red = threats.find(t => !t.blockable);
    if (imminent) {
      if (imminent.blockable && ['idle', 'block'].includes(g.p.action)) { g.block(true); return; }
      if (g.p.action === 'attack' || !imminent.blockable) { g.block(false); awayFrom(imminent.e); dodge(); return; }
    }
    g.block(false);
    if (red) { awayFrom(red.e); if (red.time < .4 && g.player.stamina >= 35) dodge(); return; }
    if (g.p.action === 'potion' || g.p.action === 'hurt' || g.p.action === 'stunned' || g.p.action === 'dodge') return;
    const healing = g.player.hp <= g.player.maxHp - 35 && g.player.potions > 0;
    if (healing) {
      const safe = enemies.every(e => distance(e, g.player) > 300 || ['transition', 'stunned'].includes(e.state) || (e.state === 'recover' && e.timer > .6));
      if (safe && !g.projectiles.some(b => distance(b, g.player) < 350)) { g.potion(); return; }
      if (g.player.hp < 45) { awayFrom(nearest); return; }
    }
    if (g.player.stamina < 28) { awayFrom(nearest); return; }
    const dx = nearest.x - g.player.x, dy = nearest.y - g.player.y;
    const duration = COMBO[(g.time - g.p.lastCombo <= .35 ? g.p.combo + 1 : 0) % 3].duration;
    const attackSafe = !threats.some(t => t.time < duration + .14);
    if (Math.abs(dx) < 100 && Math.abs(dy) < 55) {
      if (attackSafe && nearest.state !== 'transition') sword();
    } else moveTo(nearest.x - Math.sign(dx || 1) * 70, nearest.y, 10);
  }
  g.startIntro();
  for (let tick = 0; tick < limit * fps; tick++) {
    if (g.dialog) {
      const choices = g.dialog.choices.map(c => c.action);
      if (g.dialog.speaker === '伊妲' && g.dialog.lines.some(l => l.includes('界灯将你'))) {
        report.deaths++;
        if (report.deaths > maxDeaths) { report.result = 'death'; break; }
      }
      const choice = choices.includes(ending) ? ending : choices.includes('healCamp') ? 'healCamp' : choices[0];
      g.choose(choice);
    }
    g.input.x = 0; g.input.y = 0;
    const area = `${g.s.scene}:${g.s.run.room}:${g.s.run.wave}`;
    if (area !== lastArea) { report.rooms.push({ area, seconds: +g.time.toFixed(2), hp: g.player.hp, potions: g.player.potions }); lastArea = area; }
    if (g.s.scene === 'town') town();
    else if (g.s.run.clear) {
      g.block(false);
      if (g.player.hp <= g.player.maxHp - 35 && g.player.potions && g.p.action === 'idle') g.potion();
      else if (g.p.action === 'potion') { /* let the effect happen before switching room */ }
      else if (g.s.run.room === 3 && !g.s.run.campUsed) interactAt('camp');
      else if (g.s.run.room === 5 && !g.s.run.chestUsed) interactAt('chest');
      else interactAt('exit');
    } else combat();
    if (report.result === 'victory') break;
    g.update(dt);
    if (g.s.run.won && !recordedWon) { report.victories++; recordedWon = true; }
    if (!g.s.run.won) recordedWon = false;
    if (g.player.hp < lastHp) totalDamage += lastHp - g.player.hp;
    if (g.player.potions < lastPotions) report.potions += lastPotions - g.player.potions;
    lastHp = g.player.hp; lastPotions = g.player.potions;
    const boss = g.s.enemies.find(e => e.kind === 'boss');
    const bossState = boss ? `${boss.state}:${boss.move}:${boss.chargeStep}` : '';
    if (boss && boss.state === 'windup' && bossState !== lastBossState) report.bossMoves[boss.move] = (report.bossMoves[boss.move] || 0) + 1;
    lastBossState = bossState;
    report.maxProjectiles = Math.max(report.maxProjectiles, g.projectiles.length); report.maxEffects = Math.max(report.maxEffects, g.effects.length); report.maxEnemies = Math.max(report.maxEnemies, g.s.enemies.length);
    for (const event of g.drain()) {
      if (event.type === 'sound' && event.name === 'parry') report.parries++;
      if (event.type === 'save' && !validateSave(g.s) && report.invalidSaves.length < 10) report.invalidSaves.push({ area, seconds: g.time });
    }
  }
  Object.assign(report, { seconds: +g.time.toFixed(2), damageTaken: totalDamage, finalHp: g.player.hp, finalStage: g.s.stage, actualEnding: g.s.ending, finalRoom: g.s.run.room + 1, finalEnemies: g.s.enemies.map(e => ({ kind: e.kind, hp: e.hp, state: e.state, move: e.move, x: +e.x.toFixed(1), y: +e.y.toFixed(1) })), finalPlayer: { x: +g.player.x.toFixed(1), y: +g.player.y.toFixed(1), action: g.p.action, stamina: +g.player.stamina.toFixed(1) } });
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const reports = [];
  for (const strategy of ['reactive', 'aggressive']) for (const seed of [1, 17, 391]) for (const fps of [30, 60]) {
    const report = playBot({ seed, fps, strategy, ending: seed === 17 ? 'silence' : 'honesty' }); reports.push(report);
    console.log(JSON.stringify({ ...report, rooms: report.rooms.map(r => `${r.area}@${r.seconds}s HP${r.hp}`) }));
  }
  console.log(JSON.stringify({ summary: { environment: `Node ${process.version}; deterministic input automation; no UI/device proof`, testedAt: new Date().toISOString(), total: reports.length, victories: reports.filter(r => r.result === 'victory').length, deaths: reports.filter(r => r.result === 'death').length, timeouts: reports.filter(r => r.result === 'timeout').length } }));
}
