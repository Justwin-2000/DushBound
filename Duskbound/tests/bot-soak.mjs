import { playBot } from './bot-playthrough.mjs';

const failures = [];
let victories = 0, seconds = 0;
for (let n = 1; n <= 100; n++) {
  const r = playBot({ seed: n * 37, fps: n % 2 ? 30 : 60 });
  seconds += r.seconds;
  if (r.result === 'victory' && r.invalidSaves.length === 0) victories++;
  else failures.push(r);
}
const repeated = playBot({ seed: 17, fps: 30, journeys: 10, maxDeaths: 20, limit: 6000 });
const recovery = playBot({ seed: 17, fps: 60, strategy: 'recover', maxDeaths: 1 });
const concise = ({ rooms, ...report }) => report;
console.log(JSON.stringify({
  environment: `Node ${process.version}; accelerated engine simulation; no browser or device evidence`,
  testedAt: new Date().toISOString(),
  seededRuns: { count: 100, victories, simulatedSeconds: +seconds.toFixed(2), failures },
  repeated: concise(repeated), recovery: concise(recovery),
}, null, 2));
if (victories !== 100 || repeated.result !== 'victory' || recovery.result !== 'victory' || recovery.deaths !== 1) process.exitCode = 1;
