// Public inputs only. This is a precise bot, not a human playability measurement.
import {Arena,newSession} from '../web/src/v2/game.js';
import {freshProfile,validateProfile,encode,decode} from '../web/src/v2/store.js';
import {visible,distance,nextWaypoint} from '../web/src/v2/geometry.js';
import {ROOM} from '../web/src/v2/data.js';
import assert from 'node:assert/strict';
const results=[];
for(const hz of [30,60,120]){
 const profile=freshProfile();let g=new Arena(newSession('trial',['M01','P01']));g.pressAttack();let last={x:g.p.x,y:g.p.y},stuck=0,reloaded=false;
 for(let step=0;step<hz*120&&!g.s.done&&!g.s.dead;step++){
  const enemies=g.s.enemies.filter(e=>e.hp>0&&e.state!=='spawn').sort((a,b)=>distance(a,g.p)-distance(b,g.p));const e=enemies[0];
  if(e){const d=distance(e,g.p),a=Math.atan2(e.y-g.p.y,e.x-g.p.x),clear=visible(g.p,e,ROOM.walls,4);let heading=d<60?a+Math.PI:d>115?a:a+Math.PI/2;if(!clear){const point=nextWaypoint(g.p,e,ROOM.walls,8);heading=Math.atan2(point.y-g.p.y,point.x-g.p.x);}else if(stuck>hz/3)heading=a+Math.PI/2;
   g.input={x:Math.cos(heading),y:Math.sin(heading)};
   if((e.state==='windup'&&d<105||g.s.bullets.some(b=>b.team==='enemy'&&distance(b,g.p)<28))&&g.p.dashCharges>0)g.dash();
   if(d<75&&g.p.skillCooldown<=0)g.skill();if(!g.attackHeld)g.pressAttack();
  }
  const chunks=hz===30?2:1;for(let i=0;i<chunks;i++)g.update(1/(hz===30?60:hz));
  if(distance(last,g.p)<.02)stuck++;else stuck=0;last={x:g.p.x,y:g.p.y};
  profile.session=g.s;assert.equal(validateProfile(profile),true,`snapshot ${hz} ${step}`);
  if(g.s.rewarded.length===1&&!reloaded){g=new Arena(decode(encode(profile)).session);g.pressAttack();reloaded=true;}
 }
 results.push({hz,won:g.s.done,dead:g.s.dead,seconds:g.s.clock,shots:g.s.shots,hits:g.s.hits,hp:g.p.hp,shield:g.p.shield,copper:g.s.copper,reloaded,...(!g.s.done?{player:{x:g.p.x,y:g.p.y},enemies:g.s.enemies.filter(e=>e.hp>0).map(e=>({kind:e.kind,hp:e.hp,x:e.x,y:e.y,state:e.state}))}:{})});
}
console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.won&&r.copper===20&&r.reloaded),'A public-input run failed');
