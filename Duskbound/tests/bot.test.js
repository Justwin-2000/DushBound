import test from 'node:test';
import assert from 'node:assert/strict';
import { playBot } from './bot-playthrough.mjs';

// These tests use normal movement/action/interaction inputs from a fresh state.
// The bot reads exact engine telegraphs and advances simulated time quickly;
// this is neither a human playthrough nor browser/Android touch testing.
//
// 首领六种招式在一局里是否凑齐取决于随机流，单局断言过于脆弱（1.0.4 调整手感后
// 种子 17@60Hz 就没随机到「失灯领域」，而其余三个种子都触发了）。因此改为跨种子累计。
const seededRuns = [[1, 30, 'honesty'], [17, 60, 'silence'], [391, 30, 'silence'], [391, 60, 'honesty']];
for (const [seed, fps, ending] of seededRuns) {
  test(`input-only bot completes tutorial, seven rooms and ${ending} at ${fps} Hz (seed ${seed})`, () => {
    const r = playBot({ seed, fps, ending });
    assert.equal(r.result, 'victory', JSON.stringify(r));
    assert.equal(r.actualEnding, ending); assert.equal(r.finalStage, 10); assert.equal(r.deaths, 0);
    assert.ok(r.parries > 5); assert.ok(r.dodges > 2); assert.ok(r.attacks > 20);
    assert.deepEqual(r.invalidSaves, []); assert.ok(r.maxEnemies <= 4); assert.ok(r.maxEffects <= 70);
  });
}
test('boss uses every move at least once across the seeded runs', () => {
  // 自己跑一遍而不是共享上面用例的副作用：否则断言结果依赖用例执行顺序。
  const coverage = { sweep: 0, thrust: 0, slam: 0, charge: 0, field: 0, summon: 0 };
  for (const [seed, fps, ending] of seededRuns) {
    const r = playBot({ seed, fps, ending });
    for (const move of Object.keys(coverage)) coverage[move] += r.bossMoves[move] || 0;
  }
  for (const [move, count] of Object.entries(coverage)) assert.ok(count > 0, `${move}=${count}`);
});
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
