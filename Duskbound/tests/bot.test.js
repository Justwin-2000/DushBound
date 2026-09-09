import test from 'node:test';
import assert from 'node:assert/strict';
import { playBot } from './bot-playthrough.mjs';

// These tests use normal movement/action/interaction inputs from a fresh state.
// The bot reads exact engine telegraphs and advances simulated time quickly;
// this is neither a human playthrough nor browser/Android touch testing.
for (const [seed, fps, ending] of [[1, 30, 'honesty'], [17, 60, 'silence'], [391, 30, 'silence'], [391, 60, 'honesty']]) {
  test(`input-only bot completes tutorial, seven rooms and ${ending} at ${fps} Hz (seed ${seed})`, () => {
    const r = playBot({ seed, fps, ending });
    assert.equal(r.result, 'victory', JSON.stringify(r));
    assert.equal(r.actualEnding, ending); assert.equal(r.finalStage, 10); assert.equal(r.deaths, 0);
    assert.ok(r.parries > 5); assert.ok(r.dodges > 2); assert.ok(r.attacks > 20);
    assert.deepEqual(r.invalidSaves, []); assert.ok(r.maxEnemies <= 4); assert.ok(r.maxEffects <= 70);
    for (const move of ['sweep', 'thrust', 'slam', 'charge', 'field', 'summon']) assert.ok(r.bossMoves[move] > 0, move);
  });
}
test('input-only ten repeated expeditions remain completable with bounded entities', () => {
  const r = playBot({ seed: 17, fps: 30, journeys: 10, maxDeaths: 20, limit: 6000 });
  assert.equal(r.result, 'victory', JSON.stringify(r)); assert.equal(r.victories, 10);
  assert.deepEqual(r.invalidSaves, []); assert.ok(r.maxEnemies <= 4); assert.ok(r.maxProjectiles <= 4); assert.ok(r.maxEffects <= 70);
});
test('input-only reckless combat death returns to town and a new attempt can finish', () => {
  const r = playBot({ seed: 17, fps: 60, strategy: 'recover', maxDeaths: 1 });
  assert.equal(r.result, 'victory', JSON.stringify(r)); assert.equal(r.deaths, 1); assert.equal(r.victories, 1);
  assert.equal(r.finalStage, 10); assert.deepEqual(r.invalidSaves, []);
});
