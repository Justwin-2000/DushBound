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
test('attack can only cancel into dodge once the hit has landed, and dodge keeps its cooldown', () => {
  const g = makeGame();
  assert.equal(g.attack(), true);
  advance(g, COMBO[0].impact * .5);
  assert.equal(g.dodge(), false, '命中生效之前不应该能取消');
  advance(g, COMBO[0].impact);
  assert.equal(g.dodge(), true, '命中生效之后应该能取消');
  advance(g, .44); assert.equal(g.dodge(), false, '闪避仍在冷却中');
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

// —— 1.0.4 手感修复的回归测试 ——
test('输入层：单击只挥一次，按住才衔接连击', async () => {
  const savedDocument = globalThis.document, savedWindow = globalThis.window;
  try {
    const handlers = new Map();
    const element = (id) => ({
      style: {}, classList: { add() {}, remove() {} },
      addEventListener: (type, fn) => handlers.set(`${id}:${type}`, fn),
      setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 120 })
    });
    globalThis.document = { getElementById: element, querySelectorAll: () => [] };
    globalThis.window = { addEventListener() {} };
    const { Input } = await import('../web/src/input.js');
    let attacks = 0;
    const game = { input: { x: 0, y: 0 }, attack() { attacks++; }, dodge() {}, potion() {}, block() {} };
    const input = new Input(() => game, () => {}, () => {}, { unlock() {} });
    handlers.get('attack:pointerdown')({ preventDefault() {}, pointerId: 1 });
    assert.equal(attacks, 1, '按下即攻击一次');
    for (let i = 0; i < 10; i++) input.update(1 / 60);   // 约 0.17 秒的轻点
    assert.equal(attacks, 1, '一次轻点不应该挥出第二刀（曾经按住连发的初始计时为 0，下一帧立刻补一刀）');
    for (let i = 0; i < 40; i++) input.update(1 / 60);   // 继续按住约 0.67 秒
    assert.ok(attacks >= 2, '一直按住时应该衔接连击');
  } finally {
    globalThis.document = savedDocument; globalThis.window = savedWindow;
  }
});
test('小镇里角色被限制在路面范围内，不会走进山峦或走出地面', () => {
  const g = makeGame();
  g.input = { x: 0, y: -1, block: false };
  advance(g, 10);
  assert.ok(g.player.y >= 325, `向上不应该越过地平面：y=${g.player.y}`);
  g.input = { x: 0, y: 1, block: false };
  advance(g, 10);
  assert.ok(g.player.y <= 450, `向下不应该走出地面：y=${g.player.y}`);
  assert.equal(g.s.scene, 'town');
});
test('攻击命中后可以用闪避或格挡取消收招，命中前不可以', () => {
  const early = expedition(); early.s.enemies = [];
  assert.equal(early.attack(), true); assert.equal(early.p.action, 'attack');
  assert.equal(early.dodge(), false, '命中生效之前不应该能取消');
  advance(early, COMBO[0].impact + 1 / 60);
  assert.equal(early.dodge(), true, '命中之后应该可以用闪避取消');
  const late = expedition(); late.s.enemies = [];
  assert.equal(late.attack(), true); late.block(true);
  assert.equal(late.p.action, 'attack', '命中之前举盾不应该取消攻击');
  advance(late, COMBO[0].impact + 1 / 60);
  late.block(true);
  assert.equal(late.p.action, 'block', '命中之后应该可以用格挡取消收招');
});
test('喝药期间保留部分机动力，完成时才扣药并回血', () => {
  const g = makeGame();
  g.player.hp = 40; g.player.potions = 2;
  assert.equal(g.potion(), true); assert.equal(g.p.action, 'potion');
  const startX = g.player.x;
  g.input = { x: 1, y: 0, block: false };
  advance(g, .2);
  assert.ok(g.player.x > startX, '喝药期间应该可以缓慢移动');
  assert.equal(g.player.potions, 2, '动作完成前不扣药剂');
  advance(g, .3);
  assert.equal(g.player.potions, 1, '完成时扣除药剂');
  assert.equal(g.player.hp, 75, '完成时恢复 35 点生命');
});

// —— 1.2.0 第一段远征的探索、事件与场景变化 ——
test('房间 1：转正路牌才露出旧车辙，绕行可以不清场前进但拿不到物资', () => {
  const g = expedition();
  assert.equal(g.s.run.room, 0);
  assert.equal(g.interactables().some(p => p.id === 'bypass'), false, '没转正路牌时不该有绕行点');
  g.interactWith('sign'); g.dialog = null;
  assert.equal(g.s.run.signState, 1);
  assert.equal(g.bypassRoom(), false, '只转一次还不足以绕行');
  g.interactWith('sign'); g.dialog = null;
  assert.equal(g.s.run.signState, 2);
  assert.equal(g.interactables().some(p => p.id === 'bypass'), true, '转正之后应当露出旧车辙');
  assert.equal(g.s.run.clear, false, '此时尚未清场');
  assert.equal(g.bypassRoom(), true, '不清场也能沿车辙前进');
  assert.equal(g.s.run.room, 1);
  assert.equal(g.s.run.bypassUsed, true);
  assert.equal(g.s.inventory.coins, 0, '绕行拿不到房间 1 的奖励');
  assert.equal(g.s.run.rewarded.includes(0), false, '绕过就不该标记为已领取');
});
test('房间 2：家书只能捡一次，带回镇后改变伊妲与米洛的对白', () => {
  const g = expedition(); killRoom(g);
  assert.equal(g.nextRoom(), true); assert.equal(g.s.run.room, 1);
  g.interactWith('letter'); g.dialog = null;
  assert.equal(g.s.flags.letter, true, '应当拿到家书');
  const logs = g.s.logs.length;
  g.interactWith('letter'); g.dialog = null;
  assert.equal(g.s.logs.length, logs, '第二次翻抽屉不该再触发剧情');
  g.returnTown();
  g.s.flags.cloak = true;       // 实际流程里拿到斗篷早于进入原野
  g.s.flags.miloGift = true;    // 米洛的赠药也是入野前就会发生的
  g.interactWith('ida');
  assert.ok(g.dialog.lines.some(line => line.includes('老王麦')), '伊妲应当认出这封信');
  assert.ok(g.dialog.choices.some(choice => choice.action === 'deliverLetter'));
  g.choose('deliverLetter');
  assert.equal(g.s.flags.letterGiven, true);
  g.interactWith('ida');
  assert.ok(g.dialog.lines.some(line => line.includes('柜台下面')), '交信之后她的对白应当留下变化');
  g.interactWith('milo');
  assert.ok(g.dialog.choices.some(choice => choice.action === 'shop'), '交完信米洛仍然能进商店');
});
test('房间 2：清场后推开板墙，断桥那一房的侵蚀增长减半', () => {
  const g = expedition(); killRoom(g); g.nextRoom();
  assert.equal(g.s.run.clear, false);
  assert.equal(g.interactables().some(p => p.id === 'door'), false, '没清场就没有板墙交互点');
  killRoom(g);
  assert.equal(g.s.run.clear, true);
  assert.equal(g.interactables().some(p => p.id === 'door'), true, '清场后才出现板墙');
  g.interactWith('door'); g.dialog = null;
  assert.equal(g.s.run.doorOpened, true);
  const before = g.s.run.corruption;
  assert.equal(g.nextRoom(), true); assert.equal(g.s.run.room, 2);
  assert.equal(g.s.run.corruption, before + 5, '走过兽径，断桥只加 5');
  const control = expedition(); killRoom(control); control.nextRoom(); killRoom(control);
  const plain = control.s.run.corruption;
  control.nextRoom();
  assert.equal(control.s.run.corruption, plain + 10, '没开板墙就是原本的 +10');
});

// —— 1.2.2 把探索与事件铺到房间 3-5 ——
test('断桥：沿断口下到河床只能拿一次灰铁', () => {
  const g = expedition();
  for (let room = 0; room < 2; room++) { killRoom(g); assert.equal(g.nextRoom(), true); }
  assert.equal(g.s.run.room, 2);
  const before = g.s.inventory.iron;
  g.interactWith('ledge'); g.dialog = null;
  assert.equal(g.s.run.ledgeSeen, true);
  assert.equal(g.s.inventory.iron, before + 2);
  g.interactWith('ledge'); g.dialog = null;
  assert.equal(g.s.inventory.iron, before + 2, '第二次只应给提示，不再给物资');
});
test('营火房：士兵的背囊只能翻一次，满药时折算旧币', () => {
  const g = expedition();
  for (let room = 0; room < 3; room++) { killRoom(g); assert.equal(g.nextRoom(), true); }
  assert.equal(g.s.run.room, 3);
  const potions = g.player.potions, coins = g.s.inventory.coins;
  g.interactWith('pack'); g.dialog = null;
  assert.equal(g.s.run.packSearched, true);
  assert.ok(g.player.potions > potions || g.s.inventory.coins > coins, '应当给药剂，满了则折算旧币');
  const after = g.player.potions;
  g.interactWith('pack'); g.dialog = null;
  assert.equal(g.player.potions, after, '第二次不该再给');
});
test('麦田：清场后扶起稻草人，风车下层侵蚀增长减 5', () => {
  const g = expedition();
  for (let room = 0; room < 4; room++) { killRoom(g); assert.equal(g.nextRoom(), true); }
  assert.equal(g.s.run.room, 4);
  assert.equal(g.interactables().some(p => p.id === 'scarecrow'), false, '没清场就没有稻草人交互点');
  killRoom(g);
  assert.equal(g.interactables().some(p => p.id === 'scarecrow'), true);
  g.interactWith('scarecrow'); g.dialog = null;
  assert.equal(g.s.run.scarecrowUp, true);
  const before = g.s.run.corruption;
  assert.equal(g.nextRoom(), true); assert.equal(g.s.run.room, 5);
  assert.equal(g.s.run.corruption, before + 15, '风车下层本应 +20，走过麦茬减 5');
});
