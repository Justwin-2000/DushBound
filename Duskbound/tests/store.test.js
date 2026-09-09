import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, newState } from '../web/src/game.js';
import { SaveStore, validateSave, encodeSave, decodeSave } from '../web/src/store.js';

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
