import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, newState } from '../web/src/game.js';
import { VERSION } from '../web/src/data.js';
import { SaveStore, validateSave, encodeSave, decodeSave, migrateSave, SAVE_MIGRATIONS } from '../web/src/store.js';

const KEY = 'duskbound.save.v1';
function memoryStorage() {
  const data = new Map();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}
test('new state validates and encoded saves round trip without mutation', () => {
  const s = newState(); assert.equal(validateSave(s), true); assert.deepEqual(decodeSave(encodeSave(s)), s);
});
test('checksum rejects changed payload and malformed or absent envelope', () => {
  const envelope = JSON.parse(encodeSave(newState())); envelope.payload = envelope.payload.replace('town', 'dungeon');
  for (const raw of [JSON.stringify(envelope), '{oops', '{}', 'null', '42']) assert.throws(() => decodeSave(raw));
});
test('missing required fields, wrong types, invalid ranges and version reject', () => {
  const cases = [
    s => delete s.player, s => delete s.player.hp, s => s.player.hp = -1, s => s.player.hp = 101,
    s => s.player.potions = 4, s => s.player.potions = 1.5, s => s.player.weapon = 2,
    s => s.inventory.iron = 1000, s => s.inventory.coins = -1, s => s.inventory.salve = 2,
    s => s.flags.memory = 'yes', s => s.settings.master = 2, s => s.settings.music = '1',
    s => s.settings.fps = 59, s => s.run.room = 7, s => s.run.corruption = 101,
    s => s.stage = 9, s => s.ending = 'honesty', s => s.saveVersion = 999,
    s => s.logs = Array(31).fill('line'), s => s.player.hp = NaN, s => s.playTime = Infinity,
  ];
  for (const mutate of cases) { const s = newState(); mutate(s); assert.equal(validateSave(s), false, mutate.toString()); assert.throws(() => decodeSave(encodeSave(s))); }
});
test('normal saving retains previous valid backup and cleans pending data', () => {
  const storage = memoryStorage(); const store = new SaveStore(storage); const s = newState();
  assert.equal(store.load(), null); assert.equal(store.save(s), true); s.inventory.coins = 9; assert.equal(store.save(s), true);
  assert.equal(decodeSave(storage.getItem(KEY)).inventory.coins, 9); assert.equal(decodeSave(storage.getItem(KEY + '.backup')).inventory.coins, 0);
  assert.equal(storage.getItem(KEY + '.pending'), null); assert.equal(store.load().inventory.coins, 9);
});
test('damaged main recovers backup without rewriting the damaged original during load', () => {
  const storage = memoryStorage(); const store = new SaveStore(storage); const s = newState(); store.save(s); s.inventory.coins = 5; store.save(s);
  storage.setItem(KEY, 'corrupt'); assert.equal(store.load().inventory.coins, 0); assert.equal(store.recovered, true); assert.equal(store.blocked, false);
  assert.equal(storage.getItem(KEY), 'corrupt'); assert.equal(store.save(s), true); assert.equal(store.load().inventory.coins, 5);
});
test('irrecoverable save stays preserved and blocks implicit overwrite until explicit reset/import', () => {
  const storage = memoryStorage(); storage.setItem(KEY, 'broken main'); storage.setItem(KEY + '.backup', 'broken backup'); const store = new SaveStore(storage);
  assert.equal(store.load(), null); assert.equal(store.blocked, true); assert.ok(store.error.includes('损坏'));
  assert.equal(store.save(newState()), false); assert.equal(storage.getItem(KEY), 'broken main');
  store.import(encodeSave(newState())); assert.equal(store.blocked, false); assert.equal(validateSave(store.load()), true);
});
test('storage write failure returns false, retains in-memory progress and valid old save', () => {
  const storage = memoryStorage(); const store = new SaveStore(storage); const s = newState(); store.save(s); const prev = storage.getItem(KEY);
  s.inventory.coins = 17; const set = storage.setItem; storage.setItem = () => { throw Error('quota'); };
  assert.equal(store.save(s), false); assert.equal(s.inventory.coins, 17); assert.equal(storage.getItem(KEY), prev); assert.ok(store.error);
  storage.setItem = set; assert.equal(store.save(s), true); assert.equal(store.load().inventory.coins, 17);
});
test('failure during main replacement leaves old main and valid backup recoverable', () => {
  const storage = memoryStorage(); const store = new SaveStore(storage); const s = newState(); store.save(s); const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === KEY) throw Error('write failure'); set(key, value); };
  s.inventory.coins = 27; assert.equal(store.save(s), false); assert.equal(decodeSave(storage.getItem(KEY)).inventory.coins, 0);
  assert.equal(decodeSave(storage.getItem(KEY + '.backup')).inventory.coins, 0);
});
test('storage read failure is reported and does not crash', () => {
  const store = new SaveStore({ getItem() { throw Error('privacy blocked'); } }); assert.equal(store.load(), null); assert.ok(store.error);
});
test('invalid import is rejected before changing a valid saved game', () => {
  const storage = memoryStorage(); const store = new SaveStore(storage); store.save(newState()); const before = storage.getItem(KEY);
  assert.throws(() => store.import('garbage')); assert.equal(storage.getItem(KEY), before);
});
test('mid-room entity state including phase transition survives normal serialization', () => {
  const g = new Game(); g.s.stage = 5; g.enterDungeon(); g.loadRoom(6); g.hitEnemy(g.s.enemies[0], 310);
  assert.equal(validateSave(g.s), true); const restored = new Game(decodeSave(encodeSave(g.s)));
  assert.equal(restored.s.enemies[0].state, 'transition'); assert.equal(restored.s.enemies[0].phase, 2); assert.equal(restored.s.enemies[0].timer, 2);
});
test('corrupt enemy history and missing attack coordinates are rejected before runtime', () => {
  for (const corrupt of [e => e.history = {}, e => delete e.tx, e => delete e.ty, e => e.phase = 99, e => e.move = 'invalid', e => delete e.maxHp]) {
    const g = new Game(); g.s.stage = 5; g.enterDungeon(); g.loadRoom(6); corrupt(g.s.enemies[0]);
    assert.equal(validateSave(g.s), false, corrupt.toString());
    assert.throws(() => decodeSave(encodeSave(g.s)));
  }
});

// —— 存档版本迁移：这是整个项目里唯一会毁掉玩家数据的路径 ——
test('版本迁移机制可用：缺步骤必须拒绝，补齐步骤即可升级', () => {
  const legacy = { ...newState(), saveVersion: 0 };
  assert.equal(validateSave(legacy), false, '旧版本存档本身通不过校验');
  assert.equal(migrateSave(legacy), null, '缺少 0->1 迁移步骤时必须拒绝，而不是静默接受');
  SAVE_MIGRATIONS[0] = s => ({ ...s, saveVersion: 1 });
  try {
    const migrated = migrateSave(legacy);
    assert.equal(migrated.saveVersion, VERSION, '应当逐级迁移到当前版本');
    assert.equal(validateSave(migrated), true, '迁移之后应当能通过校验');
  } finally { delete SAVE_MIGRATIONS[0]; }
});
test('迁移过程中拒绝倒退或无效版本号，避免死循环', () => {
  SAVE_MIGRATIONS[0] = s => ({ ...s, saveVersion: 0 });
  try { assert.equal(migrateSave({ ...newState(), saveVersion: 0 }), null); }
  finally { delete SAVE_MIGRATIONS[0]; }
  SAVE_MIGRATIONS[0] = s => ({ ...s, saveVersion: 'two' });
  try { assert.equal(migrateSave({ ...newState(), saveVersion: 0 }), null); }
  finally { delete SAVE_MIGRATIONS[0]; }
});
test('来自更新版本的存档既不当作损坏，也绝不允许被覆盖', () => {
  const storage = memoryStorage(), store = new SaveStore(storage);
  const future = encodeSave({ ...newState(), saveVersion: 99 });
  storage.setItem(KEY, future);
  assert.equal(store.load(), null);
  assert.equal(store.blocked, true, '不认识的新版本存档不能被覆盖');
  assert.match(store.error, /更新的游戏版本/);
  assert.equal(storage.getItem(KEY), future, '原始字节必须原样保留');
  assert.equal(store.save(newState()), false, 'blocked 之后不允许写入');
});
test('主档与备份都损坏时，用中断写入残留的 .pending 恢复', () => {
  const storage = memoryStorage(), store = new SaveStore(storage);
  storage.setItem(KEY, '{oops');
  storage.setItem(KEY + '.backup', '{"checksum":"deadbeef","payload":"{}"}');
  storage.setItem(KEY + '.pending', encodeSave(newState()));
  const loaded = store.load();
  assert.equal(loaded.saveVersion, VERSION);
  assert.equal(store.recovered, true, '应当标记为从非主档恢复');
  assert.equal(store.blocked, false);
});
test('首次保存也写备份，且成功后不残留 .pending', () => {
  const storage = memoryStorage(), store = new SaveStore(storage);
  assert.equal(store.save(newState()), true);
  assert.equal(typeof storage.getItem(KEY + '.backup'), 'string', '首次保存必须写备份，否则主档一坏无从回退');
  assert.equal(storage.getItem(KEY + '.pending'), null);
  storage.setItem(KEY, 'corrupted');
  assert.equal(store.load().saveVersion, VERSION);
  assert.equal(store.recovered, true);
});

// —— 真实的 1.1.x -> 1.2.0 迁移：老存档必须能继续玩 ——
function legacyV1Save() {
  const s = newState();
  s.saveVersion = 1;
  delete s.flags.letter; delete s.flags.letterGiven;
  delete s.run.signState; delete s.run.bypassUsed; delete s.run.doorOpened;
  delete s.run.ledgeSeen; delete s.run.packSearched; delete s.run.scarecrowUp;
  return s;
}
test('1.1.x 老存档（无家书与路牌字段）能迁移到当前版本，且不改动既有进度', () => {
  const legacy = legacyV1Save();
  legacy.player.hp = 63; legacy.inventory.coins = 17; legacy.stage = 7; legacy.scene = 'dungeon'; legacy.run.room = 2;
  assert.equal(validateSave(legacy), false, '缺字段的老存档本身通不过校验');
  const restored = decodeSave(encodeSave(legacy));
  assert.equal(restored.saveVersion, VERSION);
  assert.equal(restored.flags.letter, false);
  assert.equal(restored.flags.letterGiven, false);
  assert.equal(restored.run.signState, 0);
  assert.equal(restored.run.bypassUsed, false);
  assert.equal(restored.run.doorOpened, false);
  assert.equal(restored.run.ledgeSeen, false);
  assert.equal(restored.run.packSearched, false);
  assert.equal(restored.run.scarecrowUp, false);
  assert.equal(restored.player.hp, 63, '迁移不得改动既有进度');
  assert.equal(restored.inventory.coins, 17);
  assert.equal(restored.stage, 7);
  assert.equal(validateSave(restored), true);
});
test('老存档经 SaveStore 载入后不被判为损坏，且可以继续保存', () => {
  const storage = memoryStorage(), store = new SaveStore(storage);
  storage.setItem(KEY, encodeSave(legacyV1Save()));
  const loaded = store.load();
  assert.equal(loaded.saveVersion, VERSION);
  assert.equal(store.blocked, false, '老存档绝不能让保存被锁死');
  assert.equal(store.error, '');
  assert.equal(store.save(loaded), true, '迁移之后必须还能继续保存');
  assert.equal(validateSave(decodeSave(storage.getItem(KEY))), true);
});
