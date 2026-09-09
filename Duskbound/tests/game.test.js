import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, newState, damage } from '../web/src/game.js';
import { COMBO, ROOMS } from '../web/src/data.js';
import { validateSave, encodeSave, decodeSave } from '../web/src/store.js';

// Deterministic engine tests. Direct damage/setup below is intentionally NOT a
// claim that a human played either ending or that mobile controls were tested.
const makeGame = () => new Game(newState(), () => .5);
function advance(g, seconds, step = 1 / 60) {
  let left = seconds;
  while (left > 1e-9) { const dt = Math.min(step, left); g.update(dt); left -= dt; }
}
function expedition() { const g = makeGame(); g.s.stage = 5; assert.equal(g.enterDungeon(), true); g.p.invincible = 0; return g; }
function killRoom(g) {
  for (let wave = 0; wave < 4 && !g.s.run.clear; wave++) {
    for (const e of [...g.s.enemies]) {
      if (e.kind === 'boss') {
        g.hitEnemy(e, 310); assert.equal(e.state, 'transition');
        advance(g, 2.05); g.hitEnemy(e, 10000);
      } else g.hitEnemy(e, 10000);
    }
    advance(g, 1 / 60);
  }
  assert.equal(g.s.run.clear, true);
}
function doTraining(g) {
  g.interactWith('ida'); g.choose('idaGift');
  g.interactWith('glen'); g.choose('train');
  g.player.x = 1800; g.player.y = 340; g.player.facing = 1;
  g.attack(); g.attack(); advance(g, .4); g.attack(); advance(g, 1.1);
  assert.equal(g.s.tutorial.combo, 1);
  g.input.x = 1; g.dodge(); advance(g, .8); g.input.x = -1; g.dodge(); advance(g, .8);
  g.input.x = 0; g.player.x = 1800; g.block(true); advance(g, .3);
  assert.equal(g.hitPlayer(8, true, null, false, true), 'block');
  g.block(false); g.block(true);
  assert.equal(g.hitPlayer(8, true, null, false, true), 'parry');
  assert.equal(g.s.stage, 4); assert.equal(g.s.tutorial.active, false);
  g.choose('close'); g.interactWith('lorn'); g.choose('accept');
  assert.equal(g.s.stage, 5);
}

test('damage applies roll bounds, defense floor and critical after rounding', () => {
  assert.equal(damage(12, 1, 2, 0), 9);
  assert.equal(damage(12, 1, 2, 1), 10);
  assert.equal(damage(12, 1.5, 2, .5), 16);
  assert.equal(damage(12, 1, 2, .5, true), 15);
  assert.equal(damage(1, 1, 999, .5), 1);
});
test('locked gate cannot start expedition and optional Milo is unnecessary', () => {
  const g = makeGame(); assert.equal(g.enterDungeon(), false);
  doTraining(g); assert.equal(g.s.flags.miloGift, false); assert.equal(g.enterDungeon(), true);
});
test('tutorial requires complete combo, two dodges and distinct guard results', () => {
  const g = makeGame(); doTraining(g);
  assert.ok(g.s.tutorial.hits >= 3); assert.equal(g.s.tutorial.combo, 1);
  assert.equal(g.s.tutorial.dodges, 2); assert.ok(g.s.tutorial.blocks >= 1); assert.ok(g.s.tutorial.parries >= 1);
  assert.equal(g.player.maxHp, 110); assert.equal(validateSave(g.s), true);
});
test('single strikes separated outside combo window do not complete combo tutorial', () => {
  const g = makeGame(); g.s.tutorial.active = true; g.player.x = 1800; g.player.y = 340;
  for (let i = 0; i < 3; i++) { g.attack(); advance(g, 1); }
  assert.equal(g.s.tutorial.hits, 3); assert.equal(g.s.tutorial.combo, 0); assert.equal(g.s.tutorial.active, true);
});
test('one attack damages each enemy once and does not hit a distant/backward target', () => {
  const g = makeGame(); g.player.x = 500; g.player.y = 330;
  const front = g.spawn('dog', 560, 330), second = g.spawn('dog', 570, 335), back = g.spawn('dog', 420, 330), far = g.spawn('dog', 750, 330);
  g.attack(); advance(g, .2); const hp = front.hp; g.attackImpact(); g.attackImpact();
  assert.equal(hp, 53); assert.equal(front.hp, hp); assert.equal(second.hp, 53); assert.equal(back.hp, 65); assert.equal(far.hp, 65);
});
test('attack stamina cost, insufficient stamina rejection and delayed recovery', () => {
  const g = makeGame(); assert.equal(g.attack(), true); assert.equal(g.player.stamina, 92);
  advance(g, .55); assert.equal(g.player.stamina, 92); advance(g, .25); assert.ok(g.player.stamina > 98);
  const low = makeGame(); low.player.stamina = 7; assert.equal(low.attack(), false); assert.equal(low.player.stamina, 7);
  low.player.stamina = 23; assert.equal(low.dodge(), false); assert.equal(low.player.stamina, 23);
});
test('dodge moves backward without input and protects only initial window', () => {
  const g = makeGame(); g.player.x = 500; g.player.facing = 1;
  assert.equal(g.dodge(), true); assert.equal(g.player.stamina, 76); advance(g, .2);
  assert.ok(g.player.x < 500); assert.equal(g.hitPlayer(10), 'immune'); advance(g, .04);
  assert.equal(g.hitPlayer(10), 'hit'); assert.equal(g.player.hp, 92);
});
test('attack can only cancel into dodge after first half and has a cooldown', () => {
  const g = makeGame(); g.attack(); advance(g, .1); assert.equal(g.dodge(), false);
  advance(g, .12); assert.equal(g.dodge(), true); advance(g, .44); assert.equal(g.dodge(), false);
  advance(g, .25); assert.equal(g.dodge(), true);
});
test('ordinary block takes stamina impact; perfect guard does not', () => {
  const g = makeGame(); g.block(true); advance(g, .19); const before = g.player.stamina;
  assert.equal(g.hitPlayer(20), 'hit'); assert.equal(g.player.hp, 96); assert.ok(Math.abs(g.player.stamina - (before - 30)) < 1e-6);
  const p = makeGame(); p.block(true); advance(p, .17); const stamina = p.player.stamina;
  assert.equal(p.hitPlayer(20), 'parry'); assert.equal(p.player.hp, 100); assert.equal(p.player.stamina, stamina);
});
test('guard exhaustion causes a one second break and disallows attacks', () => {
  const g = makeGame(); g.block(true); advance(g, .2); g.player.stamina = 3; g.hitPlayer(20);
  assert.equal(g.p.action, 'stunned'); assert.equal(g.attack(), false); assert.equal(g.player.stamina, 0);
  advance(g, .8); assert.equal(g.p.action, 'stunned'); advance(g, .25); assert.equal(g.p.action, 'idle');
});
test('unblockable hit ignores perfect guard and repeated hit respects immunity', () => {
  const g = makeGame(); g.block(true); assert.equal(g.hitPlayer(20, false), 'hit'); assert.equal(g.player.hp, 82);
  assert.equal(g.hitPlayer(20, false), 'immune'); advance(g, .49); assert.equal(g.hitPlayer(20, false), 'immune');
  advance(g, .34); assert.equal(g.hitPlayer(20, false), 'hit');
});
test('potion deducts at effect, restores 35 and is not consumed on interruption', () => {
  const g = makeGame(); g.player.hp = 30; assert.equal(g.potion(), true); advance(g, .3); assert.equal(g.player.potions, 2);
  g.hitPlayer(8); advance(g, .8); assert.equal(g.player.potions, 2); assert.equal(g.player.hp, 24);
  assert.equal(g.potion(), true); advance(g, .56); assert.equal(g.player.potions, 1); assert.equal(g.player.hp, 59);
  g.player.hp = 99; g.potion(); advance(g, .56); assert.equal(g.player.hp, 100); assert.equal(g.player.potions, 0);
  assert.equal(g.potion(), false);
});
test('full health and absent potion are non-consuming no-ops', () => {
  const g = makeGame(); assert.equal(g.potion(), false); assert.equal(g.player.potions, 2);
  g.player.hp = 50; g.player.potions = 0; assert.equal(g.potion(), false); assert.equal(g.player.hp, 50);
});
test('dog parry stuns; bolt parry applies exactly 24 reflected damage', () => {
  const g = makeGame(); const dog = g.spawn('dog', 300, 330); g.block(true); assert.equal(g.hitPlayer(20, true, dog), 'parry');
  assert.equal(dog.state, 'stunned'); assert.equal(dog.timer, 1.2);
  const a = makeGame(); const archer = a.spawn('archer', 400, 330); a.block(true); a.hitPlayer(12, true, archer, true); assert.equal(archer.hp, 18);
});
test('boss phase transition lasts two seconds and increments corruption only once', () => {
  const g = expedition(); g.loadRoom(6); const boss = g.s.enemies[0]; const initial = g.s.run.corruption;
  g.hitEnemy(boss, 310); assert.equal(boss.phase, 2); assert.equal(boss.state, 'transition'); assert.equal(g.s.run.corruption, initial + 20);
  g.hitEnemy(boss, 100); assert.equal(boss.hp, 310); advance(g, 1.95); assert.equal(boss.state, 'transition');
  advance(g, .1); g.hitEnemy(boss, 1); assert.equal(boss.hp, 309); assert.equal(g.s.run.corruption, initial + 20);
});
test('boss victory immediately removes entities, projectiles and damaging fields', () => {
  const g = expedition(); g.loadRoom(6); const boss = g.s.enemies[0];
  g.spawn('rat', 400, 330, 16); g.projectiles.push({ t: 10 }); g.fields.push({ t: 10 });
  g.hitEnemy(boss, 1000); assert.equal(g.s.run.won, true); assert.deepEqual(g.s.enemies, []); assert.deepEqual(g.projectiles, []); assert.deepEqual(g.fields, []);
  const hp = g.player.hp; assert.equal(g.hitPlayer(999), 'immune'); assert.equal(g.player.hp, hp);
});
test('boss move sequence avoids third repeat and charge/field adjacency', () => {
  const g = makeGame(); let seed = 3; g.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const boss = g.spawn('boss'); boss.phase = 2; boss.summoned = true; const history = [];
  for (let i = 0; i < 1000; i++) {
    const move = g.pickBossMove(boss); history.push(move);
    if (i >= 2) assert.ok(!(move === history[i - 1] && move === history[i - 2]));
    if (i >= 1) assert.ok(!(['charge', 'field'].includes(move) && ['charge', 'field'].includes(history[i - 1])));
  }
});
test('boss summons only two low-health rats once', () => {
  const g = expedition(); g.loadRoom(6); const boss = g.s.enemies[0]; boss.move = 'summon';
  g.executeEnemy(boss); g.executeEnemy(boss); assert.equal(g.s.enemies.length, 3);
  assert.deepEqual(g.s.enemies.filter(e => e.kind === 'rat').map(e => e.hp), [16, 16]);
});
test('boss parry chain resets when an intervening boss hit is not perfectly guarded', () => {
  const g = expedition(); g.loadRoom(6); g.p.invincible = 0; const boss = g.s.enemies[0];
  g.block(true); g.hitPlayer(18, true, boss); assert.equal(boss.parries, 1);
  g.block(false); g.p.invincible = 0; g.hitPlayer(18, true, boss);
  assert.equal(boss.parries, 0, 'a non-parried hit interrupts the consecutive parry chain');
});
test('second perfect guard interrupts the first dash of boss double-charge', () => {
  const g = expedition(); g.loadRoom(6); const boss = g.s.enemies[0]; g.p.invincible = 0;
  boss.x = 600; boss.y = 330; boss.tx = 750; boss.ty = 330; boss.move = 'charge'; boss.chargeStep = 0; boss.parries = 1; boss.state = 'windup';
  g.player.x = 750; g.player.y = 330; g.block(true); g.executeEnemy(boss);
  assert.equal(boss.state, 'stunned'); assert.equal(boss.timer, 2);
  assert.equal(boss.chargeStep, 0, 'a parry stagger cancels the pending second dash');
});
test('failure preserves old materials, all coins and key items, halves only new iron', () => {
  const g = makeGame(); g.s.stage = 5; g.s.inventory.iron = 10; g.s.inventory.coins = 30; g.enterDungeon();
  g.s.inventory.iron += 5; g.s.inventory.coins += 4; g.s.flags.memory = true; g.s.flags.core = true; g.s.flags.tag = true; g.s.stage = 8; g.player.potions = 0;
  g.p.invincible = 0; g.hitPlayer(1000, false); assert.equal(g.s.scene, 'town'); assert.equal(g.s.inventory.iron, 12); assert.equal(g.s.inventory.coins, 34);
  assert.equal(g.s.flags.core, true); assert.equal(g.s.flags.tag, true); assert.equal(g.s.flags.memory, true); assert.equal(g.s.stage, 9);
  assert.equal(g.player.hp, g.player.maxHp); assert.equal(g.player.potions, 2); assert.equal(validateSave(g.s), true);
});
test('rest, free gift, herb rack, chest and room reward do not duplicate', () => {
  const g = makeGame(); g.player.potions = 3;
  for (let i = 0; i < 5; i++) { g.rest(); g.choose('miloGift'); g.interactWith('herbs'); }
  assert.equal(g.s.inventory.coins, 8); assert.equal(g.player.potions, 3); assert.equal(g.s.inventory.leaf, 1);
  g.s.stage = 5; g.enterDungeon(); killRoom(g); const c = g.s.inventory.coins; g.clearRoom(); g.clearRoom(); assert.equal(g.s.inventory.coins, c);
  g.loadRoom(5); killRoom(g); g.interactWith('chest'); const snap = structuredClone(g.s.inventory); g.interactWith('chest'); assert.deepEqual(g.s.inventory, snap);
});
test('shop and one-time upgrade are atomic at price/cap boundaries', () => {
  const g = makeGame(); g.s.inventory.coins = 7; assert.equal(g.buy('potion'), false); assert.equal(g.s.inventory.coins, 7);
  g.s.inventory.coins = 8; assert.equal(g.buy('potion'), true); assert.equal(g.player.potions, 3); assert.equal(g.s.inventory.coins, 0);
  g.s.inventory.coins = 20; assert.equal(g.buy('potion'), false); assert.equal(g.s.inventory.coins, 20);
  g.s.inventory.iron = 5; assert.equal(g.upgrade(), false); assert.equal(g.s.inventory.iron, 5);
  g.s.inventory.iron = 6; assert.equal(g.upgrade(), true); assert.equal(g.s.inventory.iron, 0); assert.equal(g.player.weapon, 1);
  g.s.inventory.iron = 10; assert.equal(g.upgrade(), false); assert.equal(g.s.inventory.iron, 10);
});
test('camp is exclusive once per run; salve applies to one nonzero room increment', () => {
  const g = expedition(); g.loadRoom(3); g.player.hp = 20; g.s.run.corruption = 25;
  assert.equal(g.useCamp('heal'), true); assert.equal(g.player.hp, 60); assert.equal(g.useCamp('cleanse'), false); assert.equal(g.s.run.corruption, 25);
  g.s.inventory.salve = 1; assert.equal(g.useSalve(), true); g.loadRoom(4); assert.equal(g.s.run.corruption, 30); assert.equal(g.s.run.salveUsed, false);
  g.loadRoom(5); assert.equal(g.s.run.corruption, 50); g.returnTown(); g.enterDungeon(); g.loadRoom(3); assert.equal(g.s.run.campUsed, false);
});
test('dialogue and pause freeze game time, AI and resources; pause releases inputs', () => {
  const g = expedition(); g.input.x = 1; const before = structuredClone(g.s); g.talk('测试', ['暂停战斗']); advance(g, 3);
  assert.equal(g.time, 0); assert.equal(g.player.x, before.player.x); assert.equal(g.s.enemies[0].x, before.enemies[0].x);
  g.choose('close'); g.block(true); g.pause(); advance(g, 3); assert.equal(g.time, 0); assert.deepEqual(g.input, { x: 0, y: 0, block: false });
  g.resume(); advance(g, .1); assert.ok(g.time > 0);
});
test('30/60/120 Hz preserve attack, dodge and guard durations within one tick', () => {
  function timeline(fps) {
    const g = makeGame(); g.player.x = 1000; g.attack(); let attackEnd = 0;
    while (g.p.action === 'attack') { g.update(1 / fps); attackEnd += 1 / fps; }
    g.dodge(); let dodgeEnd = 0; while (g.p.action === 'dodge') { g.update(1 / fps); dodgeEnd += 1 / fps; }
    return { attackEnd, dodgeEnd, x: g.player.x };
  }
  const results = [30, 60, 120].map(timeline);
  for (const r of results) { assert.ok(Math.abs(r.attackEnd - COMBO[0].duration) <= 1 / 30); assert.ok(Math.abs(r.dodgeEnd - .42) <= 1 / 30); }
  assert.ok(Math.max(...results.map(r => r.x)) - Math.min(...results.map(r => r.x)) < 17);
});
for (const ending of ['honesty', 'silence']) test(`simulated narrative flow reaches ${ending}, reloads and allows replay (not human playthrough)`, () => {
  let g = makeGame(); doTraining(g); assert.equal(g.enterDungeon(), true);
  for (let room = 0; room < 7; room++) {
    assert.equal(g.s.run.room, room); killRoom(g);
    if (room === 5) g.interactWith('chest');
    assert.equal(validateSave(g.s), true, `room ${room + 1} must save`);
    if (room < 6) {
      g = new Game(decodeSave(encodeSave(g.s)), () => .5);
      assert.equal(g.nextRoom(), true);
    }
  }
  assert.equal(g.s.run.corruption, 95); assert.equal(g.s.flags.core, true); assert.equal(g.s.flags.tag, true); assert.equal(g.s.stage, 8);
  g.choose('return'); assert.equal(g.s.stage, 9); g.interactWith('lorn'); g.choose(ending); assert.equal(g.s.stage, 10); assert.equal(g.s.ending, ending);
  assert.equal(g.finishEnding(ending === 'honesty' ? 'silence' : 'honesty'), false); assert.equal(g.s.ending, ending);
  g = new Game(decodeSave(encodeSave(g.s)), () => .5); assert.equal(g.s.ending, ending); assert.equal(g.enterDungeon(), true); assert.equal(g.s.run.replay, true);
  const iron = g.s.inventory.iron; g.loadRoom(6); killRoom(g); assert.equal(g.s.inventory.iron, iron + 4); assert.equal(g.s.flags.core, false);
  const coins = g.s.inventory.coins; g.bossVictory(); assert.equal(g.s.inventory.coins, coins);
  assert.equal(validateSave(g.s), true);
});
