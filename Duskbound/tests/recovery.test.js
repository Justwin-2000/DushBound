import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,newState} from '../web/src/game.js';
import {encodeSave,decodeSave,validateSave} from '../web/src/store.js';

test('reloading a boss field restores three hazards and a bounded reaction window',()=>{
  const s=newState();s.stage=5;const g=new Game(s,()=>.5);g.enterDungeon();g.loadRoom(6);
  const boss=g.s.enemies[0];boss.move='field';boss.state='windup';boss.phase=2;boss.transitioned=true;boss.timer=.95;boss.tx=600;boss.ty=350;
  const restored=new Game(decodeSave(encodeSave(g.s)));
  assert.equal(restored.fields.length,3);assert.equal(restored.fields[0].x,600);assert.equal(restored.fields[0].y,350);assert.equal(restored.p.invincible,.8);
  for(let i=0;i<49;i++)restored.update(1/60);
  assert.equal(restored.p.invincible,0);assert.equal(restored.s.enemies[0].state,'windup');
});
test('invalid facing values cannot make a restored hero invisible or non-interactive',()=>{
  for(const bad of [0,null,{},'right',NaN]){const s=newState();s.player.facing=bad;assert.equal(validateSave(s),false);}
});
