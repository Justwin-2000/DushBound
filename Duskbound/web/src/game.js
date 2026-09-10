import { VERSION, PLAYER, COMBO, ENEMIES, BOSS_MOVES, ROOMS, TOWN, QUESTS, ENDINGS, DEFAULT_SETTINGS } from './data.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function damage(attack,mult=1,defense=0,roll=.5,critical=false) {const n=Math.max(1,Math.floor(attack*mult*(.95+roll*.1)-defense));return critical?Math.floor(n*1.5):n;}
const freshRun=()=>({room:0,wave:0,corruption:0,startIron:0,rewarded:[],campUsed:false,chestUsed:false,won:false,clear:false,replay:false,salveUsed:false,signState:0,bypassUsed:false,doorOpened:false});
export function newState(settings={}) {return {
  saveVersion:VERSION,scene:'town',stage:1,playTime:0,ending:null,
  player:{x:180,y:350,hp:100,maxHp:100,stamina:100,weapon:0,potions:2,facing:1},
  inventory:{coins:0,iron:0,leaf:0,salve:0},
  flags:{cloak:false,miloGift:false,leafTaken:false,memory:false,log:false,core:false,tag:false,letter:false,letterGiven:false},
  tutorial:{active:false,hits:0,combo:0,dodges:0,blocks:0,parries:0,attempts:0},
  settings:{...DEFAULT_SETTINGS,...settings},run:freshRun(),enemies:[],logs:[]
};}
export class Game {
  constructor(state=newState(), random=Math.random) {
    this.s=structuredClone(state); this.random=random;this.events=[];this.paused=false;this.dialog=null;this.time=0;this.autoSave=0;this.id=100;
    this.effects=[];this.projectiles=[];this.fields=[];this.input={x:0,y:0,block:false};this.trainingClock=1.5;this.trainingTell=0;
    this.p={action:'idle',timer:0,elapsed:0,combo:0,lastCombo:-10,queue:false,hit:[],staminaDelay:0,invincible:0,blockAge:0,dodgeCooldown:0,dx:0,dy:0,hitDone:false};
    this.s.enemies.forEach(e=>{this.id=Math.max(this.id,e.id+1);if(!e.move)e.move='sweep';if(!e.history)e.history=[];
      if(e.kind==='boss'&&e.state==='windup'&&e.move==='field')this.fields=[{x:e.tx,y:e.ty,r:72,t:e.timer+.1},{x:clamp(e.tx-205,150,1390),y:clamp(e.ty+65,240,420),r:72,t:e.timer+.1},{x:clamp(e.tx+205,150,1390),y:clamp(e.ty-65,240,420),r:72,t:e.timer+.1}];
    });
    // Restore at a safe reaction boundary. Existing attacks remain telegraphed.
    if(this.s.scene==='dungeon')this.p.invincible=.8;
    if(this.s.player.hp<=0)this.fail();
  }
  get player(){return this.s.player;} get worldWidth(){return this.s.scene==='town'?7300:1520;}
  // 小镇的路面在 y=344..426、地平面自 310 起；原先 205 的下限会让角色走到山峦与天空里。
  bounds(){return this.s.scene==='town'?{minY:325,maxY:450}:{minY:205,maxY:440};}
  emit(type,data={}){this.events.push({type,...data});}
  toast(text){this.emit('toast',{text});}
  sound(name){this.emit('sound',{name});}
  save(){this.emit('save');}
  drain(){return this.events.splice(0);}
  log(speaker,line){this.s.logs.push(`${speaker}：${line}`);this.s.logs=this.s.logs.slice(-30);}
  talk(speaker,lines,choices=[{text:'继续',action:'close'}]){this.dialog={speaker,lines,choices};lines.forEach(l=>this.log(speaker,l));this.emit('dialog',{dialog:this.dialog});}
  setStage(n){if(this.s.stage<n){this.s.stage=n;this.toast(QUESTS[n]);this.sound('quest');this.save();}}
  resetMotion(){this.input={x:0,y:0,block:false};this.p.action='idle';this.p.queue=false;this.p.timer=0;}
  pause(){this.paused=true;this.resetMotion();this.save();}
  resume(){this.paused=false;}
  startIntro(){this.talk('记忆的碎片',['我记得风。','然后，是灯熄灭的声音。','有人把一盏灯放在你身旁。窗外，是尚未入夜的小镇。'],[{text:'睁开眼睛',action:'intro'}]);}
  choose(action){
    this.dialog=null;this.emit('close-dialog');
    switch(action){
      case 'intro':this.toast('拖动左下摇杆移动。靠近人物后，点「交谈」。');break;
      case 'idaGift':this.s.flags.cloak=true;this.player.maxHp=110;this.player.hp=110;this.player.potions=Math.max(2,this.player.potions);this.setStage(2);this.toast('获得旧巡界斗篷 · 生命上限 +10');break;
      case 'rest':this.rest();break;
      case 'train':this.s.tutorial.active=true;this.player.x=1800;this.player.y=350;this.player.stamina=100;this.trainingClock=1.2;this.setStage(3);this.toast('向右靠近木桩，点击攻击，连续衔接三段。');break;
      case 'deliverLetter':this.s.flags.letterGiven=true;this.sound('quest');this.talk('伊妲',['……是他写的。','放在柜台下面吧。等他自己来取。'],[{text:'离开',action:'close'}]);break;
      case 'bypass':this.bypassRoom();break;
      case 'accept':this.setStage(5);break;
      case 'miloGift':if(!this.s.flags.miloGift){this.s.flags.miloGift=true;this.addPotion(1,true);this.save();}this.emit('menu',{name:'shop'});break;
      case 'shop':this.emit('menu',{name:'shop'});break;
      case 'forge':this.emit('menu',{name:'equipment'});break;
      case 'enter':this.enterDungeon();break;
      case 'next':this.nextRoom();break;
      case 'healCamp':this.useCamp('heal');break;
      case 'cleanseCamp':this.useCamp('cleanse');break;
      case 'return':this.returnTown();break;
      case 'retreat':this.retreat();break;
      case 'honesty':case 'silence':this.finishEnding(action);break;
      case 'endingDone':this.emit('ending',{ending:this.s.ending});break;
    }
    this.save();
  }
  interactables(){
    if(this.s.scene==='town')return [...TOWN.map(n=>({...n,label:`交谈 · ${n.name}`})),
      {id:'bed',x:150,y:270,label:'休息'}, {id:'board',x:470,y:300,label:'留言板'}, {id:'lamp',x:3160,y:300,label:'查看界灯'},
      {id:'herbs',x:4650,y:280,label:'药草架'}, {id:'gate',x:7040,y:340,label:'进入原野'}];
    const r=this.s.run,points=[];
    // 房间 1 的「调查遗迹」换成可以转动的路牌：转对方向会露出绕行的旧车辙。
    if(r.room===0)points.push({id:'sign',x:350,y:270,label:r.signState>=2?'路牌已指向东方':'转动路牌'});
    else points.push({id:'lore',x:350,y:270,label:r.room===5?'调查破碎提灯':r.room===3?'阅读日志':'调查遗迹'});
    if(r.room===1){
      points.push({id:'letter',x:690,y:320,label:this.s.flags.letter?'抽屉已经空了':'翻找农舍的抽屉'});
      if(r.clear)points.push({id:'door',x:980,y:300,label:r.doorOpened?'板墙后的近路已打开':'推开松动的板墙'});
    }
    if(r.room===0&&r.signState>=2)points.push({id:'bypass',x:250,y:410,label:'沿旧车辙绕行'});
    if(r.room===3)points.push({id:'camp',x:710,y:330,label:r.campUsed?'营火已熄':'使用营火'});
    if(r.room===5&&r.clear)points.push({id:'chest',x:1080,y:310,label:r.chestUsed?'空补给箱':'开启补给箱'});
    if(r.clear)points.push({id:'exit',x:1400,y:350,label:r.room===6?'返回暮边镇':'前往下一区域'});
    return points;
  }
  nearby(){return this.interactables().map(v=>({...v,d:distance(v,this.player)})).filter(v=>v.d<155).sort((a,b)=>a.d-b.d)[0]||null;}
  interact(){if(this.paused||this.dialog)return;const n=this.nearby();if(!n){this.toast('靠近人物或发光的交互标记。');return;}this.interactWith(n.id);}
  interactWith(id){
    const s=this.s;
    if(id==='ida'){
      if(!s.flags.cloak)this.talk('伊妲',['别急着想起一切。先确认自己的脚还听使唤。','斗篷给你留着了。格伦就在东边的铁匠铺，他会教你怎么握剑。'],[{text:'披上斗篷',action:'idaGift'}]);
      else if(s.flags.letter&&!s.flags.letterGiven)this.talk('伊妲',['你身上有别的味道——纸，还有灰。','（你把农舍抽屉里那封信递了过去。）','「老王麦的字。」她看了很久，「他去年说，等风车的灯再亮些就回来。」'],[{text:'把信交给她',action:'deliverLetter'},{text:'先自己留着',action:'close'}]);
      else this.talk('伊妲',s.ending?['灯亮起来以后，客人也多了。你的房间还给你留着。']:s.flags.letterGiven?['那封信我放在柜台下面了。等他来取。','累了就回来。这里不用你付房钱。']:['从雾里带回来的东西，不一定都该立刻示人。','累了就回来。这里不用你付房钱。'],[{text:'休息，恢复生命与药剂',action:'rest'},{text:'再聊',action:'close'}]);
    }else if(id==='glen'){
      if(!s.flags.cloak)this.talk('格伦',['先回去见伊妲。你连斗篷都没穿好。']);
      else if(s.stage<4)this.talk('格伦',['剑不是用来挥得好看。看准，再出手。','先打木桩，接着练闪避。最后，我用木剑陪你练格挡。'],[{text:s.tutorial.active?'继续训练':'开始训练',action:'train'},{text:'稍后再来',action:'close'}]);
      else this.talk('格伦',['雾里的东西也会犹豫。那一瞬间就是你的路。','带来六块灰铁，我替你把剑刃再磨亮些。'],[{text:'查看装备与强化',action:'forge'},{text:'离开',action:'close'}]);
    }else if(id==='lorn'){
      if(s.stage<4)this.talk('洛恩',['先去格伦那儿。原野不会等你慢慢学会拿剑。']);
      else if(s.stage===4)this.talk('洛恩',['风车哨站还有一枚备用核心。把它带回来，别追别的影子。','三天前？你受了伤。我把你带回来。现在不是回忆的时候。'],[{text:'接下「余烬初巡」',action:'accept'},{text:'再准备一下',action:'close'}]);
      else if(s.stage===9)this.talk('洛恩',['你带回来了。界灯终于可以……','风车里，有没有和艾琳有关的东西？'],[{text:'把军牌交给洛恩',action:'honesty'},{text:'先托伊妲保管军牌',action:'silence'}]);
      else this.talk('洛恩',s.ending?['今晚的雾退了些。路上小心，巡界者。']:['沿着旧商道走。经过营火，再向风车去。']);
    }else if(id==='milo'){
      if(!s.flags.miloGift)this.talk('米洛',['你那盏灯……可以借我看看吗？不，先别熄灭它！','这瓶药送你。原野会慢慢侵蚀提灯，营火能帮你缓一缓。'],[{text:'收下药剂，查看补给',action:'miloGift'}]);
      else if(s.flags.letter&&!s.flags.letterGiven)this.talk('米洛',['你去了废弃农舍？那边的人……搬走很久了。','要是翻到什么写了字的纸，别急着扔。雾最会先吃掉的就是这种东西。'],[{text:'购买补给',action:'shop'},{text:'离开',action:'close'}]);
      else this.talk('米洛',['药要在伤口变糟以前用。带满三瓶，就别再往包里塞啦。'],[{text:'购买补给',action:'shop'},{text:'离开',action:'close'}]);
    }else if(id==='bed')this.talk('晚灯旅店',['床铺仍有余温。休息会恢复全部生命，并补至两瓶药剂。'],[{text:'休息片刻',action:'rest'},{text:'先不休息',action:'close'}]);
    else if(id==='board')this.emit('menu',{name:'journal'});
    else if(id==='lamp')this.talk('旧界灯',[s.ending?'火焰向上舒展开来。你终于听见，广场另一边有人在笑。':'灯火很弱。灯座上，有一道新近留下的划痕。']);
    else if(id==='herbs'){if(!s.flags.leafTaken){s.flags.leafTaken=true;s.inventory.leaf=clamp(s.inventory.leaf+1,0,999);this.toast('获得苦叶 ×1 · 可在药草屋制成苦叶膏');this.save();}else this.toast('药草架上只剩晾晒中的叶片。');}
    else if(id==='gate'){if(s.stage<5)this.talk('东门',['先完成格伦的训练，再去界灯广场见洛恩。']);else this.talk('灰风原野',['远征中会自动保存。若倒下，界灯会带你回到旅店。','携带 '+this.player.potions+' 瓶药剂 · 长剑攻击 '+(this.player.weapon?15:12)], [{text:s.ending?'再次远征':'踏入灰风原野',action:'enter'},{text:'继续准备',action:'close'}]);}
    else if(id==='lore'){const r=s.run.room;if(r===3)s.flags.log=true;if(r===5)s.flags.memory=true;this.talk(r===5?'记忆的裂隙':'巡界手记',[ROOMS[r].lore]);this.save();}
    else if(id==='sign'){
      const r=s.run;
      if(r.signState>=2){this.talk('歪倒的路牌',[ROOMS[0].lore,'路牌已经指向东方，草丛里的旧车辙清清楚楚。']);return;}
      r.signState+=1;this.sound('ui');
      if(r.signState>=2)this.talk('歪倒的路牌',[ROOMS[0].lore,'你把路牌扶正，转向东方——风车哨站的方向。','路牌旁边的草丛里，一条旧车辙露了出来。'],[{text:'记下这条车辙',action:'close'}]);
      else this.talk('歪倒的路牌',[ROOMS[0].lore,'你把路牌转向北方。那边只有更浓的雾。']);
      this.save();
    }
    else if(id==='bypass')this.talk('旧车辙',['车辙绕过坡地，直接通向废弃农舍的方向。','走这条路会错过路牌一带散落的东西，但也不必把这一片清干净。'],[{text:'沿车辙绕行',action:'bypass'},{text:'还是先清完这一段',action:'close'}]);
    else if(id==='letter'){
      if(s.flags.letter){this.toast('抽屉里只剩下灰。');return;}
      s.flags.letter=true;this.sound('quest');
      this.talk('褪色的信',['抽屉最里面压着一封信，信封上写着「晚灯旅店 · 伊妲收」。','「今年的麦子长得不好。等风车的灯再亮些，我就回镇上看你。」','信没有寄出去。'],[{text:'收好这封信',action:'close'}]);
      this.save();
    }
    else if(id==='door'){
      if(s.run.doorOpened){this.toast('板墙后的近路已经打开了。');return;}
      s.run.doorOpened=true;this.sound('quest');
      this.talk('农舍后墙',['你把松动的板墙推开，墙后是一条直下河谷的兽径。','从这里走，能少绕一段雾最浓的路。'],[{text:'记住这条近路',action:'close'}]);
      this.save();
    }
    else if(id==='camp'){if(s.run.campUsed)this.toast('余温还在，但已经不能再为提灯添火。');else this.talk('旧营火',['火还没有熄。你可以让身体暖起来，或为提灯净去灰雾。'],[{text:'休憩 · 恢复 40 生命',action:'healCamp'},{text:'净化 · 侵蚀降低 15',action:'cleanseCamp'}]);}
    else if(id==='chest'){if(s.run.chestUsed)this.toast('补给箱已经空了。');else {s.run.chestUsed=true;this.addPotion(1,true);s.inventory.iron=clamp(s.inventory.iron+2,0,999);this.toast('补给箱 · 灰铁 +2');this.save();}}
    else if(id==='exit'){if(s.run.room===6)this.returnTown();else this.nextRoom();}
  }
  rest(){this.player.hp=this.player.maxHp;this.player.potions=Math.max(2,this.player.potions);this.player.stamina=100;this.sound('heal');this.toast('休息完毕 · 生命恢复，药剂已补给');this.save();}
  addPotion(n,convert=false){const added=Math.min(3-this.player.potions,n),extra=n-added;this.player.potions+=added;if(extra&&convert){this.s.inventory.coins=clamp(this.s.inventory.coins+extra*8,0,999);this.toast('药剂已满 · 多余药剂转为 '+extra*8+' 旧币');}else if(added)this.toast('恢复药剂 +'+added);}
  buy(item){
    const s=this.s;if(s.scene!=='town')return false;
    if(item==='potion'){if(this.player.potions>=3){this.toast('最多携带 3 瓶药剂');return false;}if(s.inventory.coins<8){this.toast('旧币不足');return false;}s.inventory.coins-=8;this.player.potions++;}
    else if(item==='salve'){if(s.inventory.salve){this.toast('已有一份苦叶膏');return false;}if(s.inventory.coins<5){this.toast('旧币不足');return false;}s.inventory.coins-=5;s.inventory.salve=1;}
    else if(item==='craft'){if(!s.inventory.leaf||s.inventory.salve){this.toast('需要苦叶，且只能携带一份苦叶膏');return false;}s.inventory.leaf--;s.inventory.salve=1;}
    else return false;
    this.sound('item');this.toast(item==='potion'?'药剂已放入行囊':'苦叶膏已放入行囊');this.save();return true;
  }
  upgrade(){if(this.s.scene!=='town'||this.player.weapon||this.s.inventory.iron<6){this.toast(this.player.weapon?'长剑已完成强化':'强化需要 6 块灰铁');return false;}this.s.inventory.iron-=6;this.player.weapon=1;this.sound('quest');this.toast('长剑强化完成 · 攻击 12 → 15');this.save();return true;}
  useSalve(){if(!this.s.inventory.salve){this.toast('没有苦叶膏');return false;}if(this.s.run.salveUsed){this.toast('苦叶膏已涂抹，会在下一次侵蚀增长时生效');return false;}this.s.inventory.salve--;this.s.run.salveUsed=true;this.toast('提灯已涂抹苦叶膏 · 下次侵蚀增长 −10');this.save();return true;}
  useCamp(kind){if(this.s.scene!=='dungeon'||this.s.run.room!==3||this.s.run.campUsed)return false;this.s.run.campUsed=true;if(kind==='heal'){this.player.hp=Math.min(this.player.maxHp,this.player.hp+40);this.toast('营火休憩 · 生命 +40');}else{this.s.run.corruption=Math.max(0,this.s.run.corruption-15);this.toast('提灯净化 · 侵蚀 −15');}this.sound('heal');this.save();return true;}
  enterDungeon(){if(this.s.stage<5||this.s.scene!=='town')return false;const salve=this.s.run.salveUsed;this.s.run=freshRun();this.s.run.startIron=this.s.inventory.iron;this.s.run.replay=!!this.s.ending;this.s.run.salveUsed=salve;this.s.scene='dungeon';this.s.tutorial.active=false;this.setStage(6);this.loadRoom(0);return true;}
  spawn(kind,x=880,y=320,hp=null){const cfg=ENEMIES[kind];const e={id:this.id++,kind,x,y,hp:hp??cfg.hp,maxHp:hp??cfg.hp,state:'chase',timer:0,facing:-1,move:'sweep',history:[],phase:1,transitioned:false,summoned:false,parries:0,attackCount:0,tx:0,ty:0,flash:0,chargeStep:0};this.s.enemies.push(e);return e;}
  loadRoom(i){
    const r=this.s.run,cfg=ROOMS[i];r.room=i;r.wave=0;r.clear=cfg.waves.length===0;r.won=false;
    // 苦叶膏减 10；从农舍板墙后的兽径下来能少绕一段雾最浓的路，断桥那一房再减 5。
    const relief=(r.salveUsed?10:0)+(i===2&&r.doorOpened?5:0);
    r.corruption=clamp(r.corruption+Math.max(0,cfg.corruption-relief),0,100);if(cfg.corruption&&r.salveUsed)r.salveUsed=false;
    this.s.enemies=[];this.projectiles=[];this.fields=[];this.effects=[];this.resetMotion();this.player.x=160;this.player.y=350;this.player.stamina=100;this.p.invincible=1;
    this.spawnWave();if(i===6)this.setStage(7);this.toast(cfg.name+' · '+cfg.hint);this.emit('region',{name:cfg.name,subtitle:cfg.subtitle});this.save();
  }
  spawnWave(){const r=this.s.run,w=ROOMS[r.room].waves[r.wave]||[];w.forEach((kind,i)=>this.spawn(kind,880+i*240,300+i*80));}
  nextRoom(){if(this.s.scene!=='dungeon'||!this.s.run.clear||this.s.run.room>=6)return false;this.loadRoom(this.s.run.room+1);return true;}
  // 转对路牌后可以沿旧车辙绕过第一个房间：不清场也能前进，但拿不到这一段的物资。
  bypassRoom(){const r=this.s.run;if(this.s.scene!=='dungeon'||r.room!==0||r.signState<2)return false;r.bypassUsed=true;this.sound('dodge');this.toast('沿旧车辙绕行 · 这一段没有取到物资');this.loadRoom(1);return true;}
  clearRoom(){const r=this.s.run;if(r.clear)return;const cfg=ROOMS[r.room];if(r.wave+1<cfg.waves.length){r.wave++;this.spawnWave();this.toast('下一波敌人出现');return;}
    r.clear=true;this.sound('quest');
    if(!r.rewarded.includes(r.room)){r.rewarded.push(r.room);for(const[k,n]of Object.entries(cfg.reward)){if(k==='potions')this.addPotion(n,true);else this.s.inventory[k]=clamp(this.s.inventory[k]+n,0,999);}if(Object.keys(cfg.reward).length)this.toast('区域肃清 · '+Object.entries(cfg.reward).map(([k,n])=>({coins:'旧币',iron:'灰铁',potions:'药剂'}[k]+' +'+n)).join(' / '));}
    this.toast('道路已开启 → 靠近右侧出口继续');this.save();
  }
  bossVictory(){
    if(this.s.run.won)return;this.s.run.won=true;this.s.run.clear=true;this.s.enemies=[];this.projectiles=[];this.fields=[];this.resetMotion();
    if(!this.s.flags.core&&!this.s.ending){this.s.flags.core=true;this.s.flags.tag=true;this.s.inventory.coins=clamp(this.s.inventory.coins+20,0,999);this.setStage(8);this.talk('失灯守卫',['换岗的人……终于来了。','守卫跪下，将灯笼轻轻放在地上。灰雾散去，留下黯淡核心与艾琳的军牌。','获得：黯淡核心、艾琳军牌、20 枚旧币。'],[{text:'带他们回家',action:'return'}]);}
    else {this.s.inventory.coins=clamp(this.s.inventory.coins+5,0,999);this.s.inventory.iron=clamp(this.s.inventory.iron+4,0,999);this.talk('余烬再燃',['守卫的残影随风散去。你的灯仍然亮着。','重复远征奖励：5 枚旧币、4 块灰铁。'],[{text:'返回暮边镇',action:'return'}]);}
    this.sound('victory');this.save();
  }
  returnTown(){if(this.s.scene!=='dungeon')return;this.s.scene='town';this.s.enemies=[];this.projectiles=[];this.fields=[];this.player.x=3420;this.player.y=350;this.resetMotion();this.player.stamina=100;if(this.s.stage===8)this.setStage(9);this.toast('暮边镇 · 界灯在等你');this.emit('region',{name:'暮边镇',subtitle:'灯火仍在，归人有处'});this.save();}
  retreat(){if(this.s.scene!=='dungeon')return;this.returnTown();this.player.x=6800;this.toast('安全撤回 · 本次物资全部保留，下次从原野入口出发');this.save();}
  fail(){
    const s=this.s,earned=Math.max(0,s.inventory.iron-s.run.startIron),lost=Math.ceil(earned/2);
    if(s.scene==='dungeon')s.inventory.iron-=lost;
    s.scene='town';s.enemies=[];this.projectiles=[];this.fields=[];this.player.x=240;this.player.y=350;this.player.hp=this.player.maxHp;this.player.potions=Math.max(2,this.player.potions);this.player.stamina=100;this.resetMotion();
    if(s.stage===8)this.setStage(9);
    this.talk('伊妲',['界灯将你从雾中唤回。','你回来了。这就够了。剩下的，我们明天再算。',`本次灰铁损失 ${lost} 块。旧币、原有材料与任务物品全部保留。`]);this.sound('death');this.save();
  }
  finishEnding(kind){if(this.s.stage!==9||this.s.ending||!ENDINGS[kind])return false;this.s.ending=kind;this.s.stage=10;this.s.flags.tag=false;this.s.flags.core=false;this.talk(kind==='honesty'?'洛恩':'伊妲',ENDINGS[kind].lines,[{text:'灯火长明',action:'endingDone'}]);this.sound('victory');this.save();return true;}
  travel(x){if(this.s.scene!=='town'||this.s.tutorial.active)return false;this.player.x=clamp(x,100,7150);this.player.y=360;this.resetMotion();this.save();return true;}
  canAct(){return !this.paused&&!this.dialog&&this.player.hp>0;}
  spend(n){if(this.player.stamina<n){this.toast('体力不足，稍作喘息');return false;}this.player.stamina-=n;this.p.staminaDelay=.6;return true;}
  attack(){
    if(!this.canAct())return false;
    if(this.p.action==='attack'){this.p.queue=true;return true;}
    if(!['idle','block'].includes(this.p.action))return false;
    const combo=this.time-this.p.lastCombo<=.35?(this.p.combo+1)%3:0,cfg=COMBO[combo];if(!this.spend(cfg.cost))return false;
    this.p.action='attack';this.p.combo=combo;this.p.timer=cfg.duration;this.p.elapsed=0;this.p.hit=[];this.p.hitDone=false;this.p.queue=false;
    if(Math.hypot(this.input.x,this.input.y)<.15){const near=this.s.enemies.filter(e=>distance(e,this.player)<160).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];if(near)this.player.facing=near.x>=this.player.x?1:-1;}
    this.sound('swing'+combo);return true;
  }
  dodge(){if(!this.canAct()||this.p.dodgeCooldown>0)return false;const a=this.p.action;if(!['idle','block','attack','potion'].includes(a)||(a==='attack'&&this.p.elapsed<COMBO[this.p.combo].impact))return false;if(!this.spend(24))return false;
    let {x,y}=this.input,n=Math.hypot(x,y);if(n<.1){x=-this.player.facing;y=0;n=1;}this.p.dx=x/n;this.p.dy=y/n;this.p.action='dodge';this.p.elapsed=0;this.p.timer=.42;this.p.dodgeCooldown=.67;this.p.invincible=Math.max(.22,this.p.invincible);this.p.queue=false;
    if(this.s.tutorial.active){this.s.tutorial.dodges++;this.checkTutorial();}this.sound('dodge');return true;
  }
  block(down){this.input.block=down;if(!down){if(this.p.action==='block')this.p.action='idle';return;}
    // 攻击命中之后即可举盾：允许用格挡取消收招，而不是被钉在原地。
    const recovering=this.p.action==='attack'&&this.p.elapsed>=COMBO[this.p.combo].impact;
    if(!this.canAct()||(!recovering&&!['idle','block'].includes(this.p.action))||this.player.stamina<=0)return;
    if(this.p.action!=='block'){this.p.action='block';this.p.blockAge=0;} }
  potion(){if(!this.canAct()||!['idle','block'].includes(this.p.action))return false;if(this.player.potions<=0){this.toast('药剂用完了');return false;}if(this.player.hp>=this.player.maxHp){this.toast('生命已满，无需使用药剂');return false;}this.p.action='potion';this.p.timer=.4;this.p.elapsed=0;this.p.queue=false;return true;}
  hitPlayer(raw,blockable=true,source=null,projectile=false,training=false){
    if(!training&&(this.p.invincible>0||this.player.hp<=0||this.s.run.won))return 'immune';
    if(this.p.action==='block'&&blockable){
      const window=training&&this.s.tutorial.attempts>=3?.32:.18;
      if(this.p.blockAge<=window){this.p.invincible=Math.max(this.p.invincible,.18);this.sound('parry');this.emit('flash',{color:'gold'});this.float(this.player,'完美格挡','#f8dea0');
        if(training){this.s.tutorial.parries++;this.checkTutorial();}
        else if(source){if(projectile)this.hitEnemy(source,24,true);else if(source.kind==='boss'){source.parries++;if(source.parries>=2){source.state='stunned';source.timer=2;source.parries=0;this.float(source,'架势崩解','#f8dea0');}}else {source.state='stunned';source.timer=1.2;}}
        return 'parry';
      }
      if(source?.kind==='boss')source.parries=0;
      const cost=raw*1.5;
      if(this.player.stamina>=cost){this.player.stamina-=cost;this.p.staminaDelay=.6;this.sound('block');if(training){this.s.tutorial.blocks++;this.checkTutorial();return 'block';}raw*=.3;}
      else{this.player.stamina=0;this.p.action='stunned';this.p.timer=1;this.input.block=false;this.float(this.player,'破防','#ed9693');}
    }
    if(source?.kind==='boss')source.parries=0;
    if(training){this.s.tutorial.attempts++;this.float(this.player,'木剑轻触','#c5cbc5');return 'practice';}
    if(this.s.settings.assist)raw*=.7;
    if(this.s.run.corruption>=100)raw*=1.2;
    const dealt=Math.max(1,Math.floor(raw-PLAYER.defense));this.player.hp=Math.max(0,this.player.hp-dealt);this.p.invincible=.5;
    if(this.p.action!=='stunned'){this.p.action='hurt';this.p.timer=raw>=20?.8:.25;if(raw>=20)this.p.invincible=.8;}
    this.p.queue=false;this.sound('hurt');this.emit('shake',{strength:7});this.emit('vibrate',{duration:35});this.float(this.player,'−'+dealt,'#f29d96');
    if(source){const bounds=this.bounds(),dx=this.player.x-source.x,dy=this.player.y-source.y,d=Math.hypot(dx,dy)||1;this.player.x=clamp(this.player.x+dx/d*22,45,this.worldWidth-45);this.player.y=clamp(this.player.y+dy/d*16,bounds.minY,bounds.maxY);}
    if(this.player.hp<=0)this.fail();return 'hit';
  }
  float(at,text,color){this.effects.push({type:'text',x:at.x,y:at.y-60,text,color,t:1.1});}
  hitEnemy(e,n,reflect=false){if(e.hp<=0||e.state==='transition')return;e.hp=Math.max(0,e.hp-n);e.flash=.1;this.float(e,String(n),reflect?'#ffe3a1':'#f7eee0');this.sound('hit');this.effects.push({type:'spark',x:e.x,y:e.y-27,t:.24,color:'#ffdab1'});
    if(e.kind==='boss'&&e.hp<=310&&!e.transitioned&&e.hp>0){e.transitioned=true;e.phase=2;e.state='transition';e.timer=2;e.chargeStep=0;this.fields=[];this.projectiles=[];this.s.run.corruption=clamp(this.s.run.corruption+20,0,100);this.toast('界灯熄灭 · 失灯守卫进入第二阶段');this.sound('boss');this.save();}
    if(e.hp<=0){this.effects.push({type:'death',x:e.x,y:e.y,t:.6,color:ENEMIES[e.kind].color});if(e.kind==='boss')this.bossVictory();else this.sound('enemyDeath');}
  }
  attackImpact(){
    const p=this.player,cfg=COMBO[this.p.combo];
    for(const e of [...this.s.enemies]){if(e.hp<=0||this.p.hit.includes(e.id))continue;const dx=e.x-p.x,dy=e.y-p.y;if(dx*p.facing>=-25&&dx*p.facing<115+(e.kind==='boss'?25:0)&&Math.abs(dy)<76){this.p.hit.push(e.id);this.hitEnemy(e,damage(p.weapon?15:12,cfg.damage,ENEMIES[e.kind].defense||0,this.random(),this.random()<.05));}}
    if(this.s.scene==='town'&&Math.abs(p.x-1870)<125&&Math.abs(p.y-340)<80&&p.facing*(1870-p.x)>-25){this.float({x:1870,y:330},String(damage(p.weapon?15:12,cfg.damage,0,this.random())),'#f0d69d');this.sound('hit');if(this.s.tutorial.active){this.s.tutorial.hits++;if(this.p.combo===2)this.s.tutorial.combo++;this.checkTutorial();}}
  }
  tutorialHint(){const t=this.s.tutorial;if(t.hits<3||t.combo<1)return `练剑 · 命中 ${Math.min(t.hits,3)}/3 · 三段连击 ${Math.min(t.combo,1)}/1`;if(t.dodges<2)return `闪避 · ${t.dodges}/2 · 点击「闪避」，留意体力`;if(t.blocks<1)return '普通格挡 · 木剑举起时开始按住「格挡」';if(t.parries<1)return '完美格挡 · 在木剑即将落下时按住「格挡」';return '';}
  checkTutorial(){const t=this.s.tutorial;t.hits=Math.min(t.hits,9999);t.combo=Math.min(t.combo,9999);t.dodges=Math.min(t.dodges,9999);t.blocks=Math.min(t.blocks,9999);t.parries=Math.min(t.parries,9999);t.attempts=Math.min(t.attempts,9999);
    if(t.hits>=3&&t.combo>=1&&t.dodges>=2&&t.blocks>=1&&t.parries>=1){t.active=false;this.player.stamina=100;this.player.hp=this.player.maxHp;this.setStage(4);this.talk('格伦',['雾里的东西也会犹豫。那一瞬间就是你的路。','你准备好了。去广场找洛恩吧。']);}this.save();}
  pickBossMove(e){const pool=e.phase===1?['sweep','thrust','slam']:['sweep','thrust','slam','charge','field'];if(e.phase===2&&!e.summoned)pool.push('summon');const last=e.history.at(-1),twice=e.history.at(-2)===last;
    const eligible=pool.filter(m=>!(twice&&m===last)&&!(['charge','field'].includes(last)&&['charge','field'].includes(m)));
    const m=eligible[Math.floor(this.random()*eligible.length)%eligible.length];e.history.push(m);e.history=e.history.slice(-3);return m;
  }
  prepareEnemy(e){
    const cfg=ENEMIES[e.kind];e.state='windup';e.tx=this.player.x;e.ty=this.player.y;e.facing=e.tx>=e.x?1:-1;
    if(e.kind==='boss'){e.move=this.pickBossMove(e);e.timer=BOSS_MOVES[e.move].windup;if(e.move==='field')this.fields=[{x:e.tx,y:e.ty,r:72,t:e.timer+.1},{x:clamp(e.tx-205,150,1390),y:clamp(e.ty+65,240,420),r:72,t:e.timer+.1},{x:clamp(e.tx+205,150,1390),y:clamp(e.ty-65,240,420),r:72,t:e.timer+.1}];this.sound('warning');}
    else {e.move=(e.kind==='dog'||e.kind==='elite')&&e.attackCount%2===1?'charge':'strike';e.timer=cfg.windup;}
  }
  executeEnemy(e){
    const p=this.player,cfg=ENEMIES[e.kind];
    if(e.kind==='archer'){let dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy)||1;this.projectiles.push({x:e.x,y:e.y,vx:dx/d*410,vy:dy/d*410,t:3,source:e.id});this.sound('arrow');}
    else if(e.kind==='boss'){
      const m=BOSS_MOVES[e.move];
      if(e.move==='summon'){if(!e.summoned){e.summoned=true;this.spawn('rat',clamp(e.x-230,120,1350),260,16);this.spawn('rat',clamp(e.x+230,120,1350),410,16);}}
      else if(e.move==='field'){for(const f of this.fields){if(distance(p,f)<=f.r)this.hitPlayer(m.damage,false,e);}this.fields=[];this.emit('shake',{strength:5});}
      else {if(m.dash)this.enemyDash(e,m.dash,m.damage,m.blockable);else if(distance(e,p)<m.radius)this.hitPlayer(m.damage,m.blockable,e);this.effects.push({type:'ring',x:e.x,y:e.y,r:m.radius,t:.3,color:m.blockable?'#f2cd78':'#d37c98'});}
      if(e.state==='stunned'||e.state==='transition'){e.chargeStep=0;return;}
      if(e.move==='charge'&&e.chargeStep===0){e.chargeStep=1;e.tx=p.x;e.ty=p.y;e.state='windup';e.timer=.65;return;}e.chargeStep=0;
    }else if(e.move==='charge')this.enemyDash(e,240,20,true);
    else if(distance(e,p)<cfg.range+30)this.hitPlayer(cfg.damage,true,e);
    if(e.state==='stunned'||e.state==='transition')return;e.state='recover';e.timer=cfg.recovery||.85;e.attackCount++;
  }
  enemyDash(e,length,n,blockable){const ox=e.x,oy=e.y,dx=e.tx-ox,dy=e.ty-oy,d=Math.hypot(dx,dy)||1;e.x=clamp(ox+dx/d*Math.min(length,d+40),60,1460);e.y=clamp(oy+dy/d*Math.min(length,d+40),205,440);
    const vx=e.x-ox,vy=e.y-oy,den=vx*vx+vy*vy,u=clamp(((this.player.x-ox)*vx+(this.player.y-oy)*vy)/(den||1),0,1);
    if(Math.hypot(this.player.x-(ox+u*vx),this.player.y-(oy+u*vy))<50)this.hitPlayer(n,blockable,e);
    this.effects.push({type:'dash',x:ox,y:oy,x2:e.x,y2:e.y,t:.24,color:'#d7bec6'});
  }
  updateEnemy(e,dt){if(e.hp<=0)return;const cfg=ENEMIES[e.kind];e.flash=Math.max(0,e.flash-dt);
    if(e.state!=='chase'){e.timer=Math.max(0,e.timer-dt);if(e.timer<=0){if(e.state==='windup')this.executeEnemy(e);else {e.state='chase';e.timer=0;}}return;}
    const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy)||1;e.facing=dx>0?1:-1;
    const range=e.kind==='boss'?220:e.kind==='archer'?450:e.move==='charge'?240:cfg.range;
    if(e.kind==='archer'&&d<240){e.x=clamp(e.x-dx/d*cfg.speed*dt,70,1450);e.y=clamp(e.y-dy/d*cfg.speed*dt,205,440);}
    if(d<=range){this.prepareEnemy(e);return;}
    // Room-sized perception prevents an enemy outside the camera from permanently locking an exit.
    if(d<1400){e.x=clamp(e.x+dx/d*cfg.speed*dt,70,1450);e.y=clamp(e.y+dy/d*cfg.speed*dt,205,440);}
  }
  update(dt){
    if(this.paused||this.dialog)return;dt=clamp(dt,0,.05);this.time+=dt;this.s.playTime+=dt;this.autoSave+=dt;
    const p=this.player,a=this.p;
    a.invincible=Math.max(0,a.invincible-dt);a.dodgeCooldown=Math.max(0,a.dodgeCooldown-dt);a.staminaDelay=Math.max(0,a.staminaDelay-dt);
    if(a.action==='block'){a.blockAge+=dt;p.stamina=Math.max(0,p.stamina-12*dt);a.staminaDelay=.6;if(p.stamina<=0){a.action='stunned';a.timer=1;this.input.block=false;this.float(p,'体力耗尽','#ecaca1');}}
    if(a.staminaDelay<=0&&a.action!=='block')p.stamina=Math.min(100,p.stamina+35*dt);
    if(['attack','dodge','hurt','stunned','potion'].includes(a.action)){
      a.timer-=dt;a.elapsed+=dt;
      if(a.action==='attack'&&!a.hitDone&&a.elapsed>=COMBO[a.combo].impact){a.hitDone=true;this.attackImpact();}
      if(a.action==='dodge'){p.x+=a.dx*490*dt;p.y+=a.dy*310*dt;}
      if(a.timer<=0){const old=a.action,queued=a.queue;a.action='idle';a.queue=false;if(old==='attack'){a.lastCombo=this.time;if(queued)this.attack();}if(old==='potion'&&p.potions>0){p.potions--;p.hp=Math.min(p.maxHp,p.hp+35);this.sound('heal');this.float(p,'+35','#a9d7b3');this.save();}}
    }
    if(a.action==='idle'&&this.input.block)this.block(true);
    // 攻击命中后与喝药期间保留部分机动力：不再把人完全钉住，只降低移动速度。
    const recovering=a.action==='attack'&&a.elapsed>=COMBO[a.combo].impact;
    if(['idle','block','potion'].includes(a.action)||recovering){let {x,y}=this.input,d=Math.hypot(x,y);if(d>1){x/=d;y/=d;}if(Math.abs(x)>.05&&!recovering)p.facing=x>0?1:-1;const mobility=a.action==='block'?.35:a.action==='potion'?.45:recovering?.5:1;const speed=mobility*PLAYER.speed;p.x+=x*speed*dt;p.y+=y*speed*.75*dt;}
    const bounds=this.bounds();p.x=clamp(p.x,45,this.worldWidth-45);p.y=clamp(p.y,bounds.minY,bounds.maxY);
    if(this.s.scene==='dungeon'){
      for(const e of [...this.s.enemies]){this.updateEnemy(e,dt);if(this.dialog||this.s.scene!=='dungeon')break;}
      if(this.s.scene==='dungeon'&&!this.dialog){
        for(const b of this.projectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;if(distance(b,p)<26){const source=this.s.enemies.find(e=>e.id===b.source);this.hitPlayer(12,true,source,true);b.t=0;}}
        this.projectiles=this.projectiles.filter(b=>b.t>0&&b.x>0&&b.x<1520&&b.y>150&&b.y<490);
        this.s.enemies=this.s.enemies.filter(e=>e.hp>0);
        if(!this.s.enemies.length&&!this.s.run.clear)this.clearRoom();
        // Soft separation uses collision radii, independent of the visual sprite.
        for(const e of this.s.enemies){if(e.state==='windup'||a.action==='dodge')continue;const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),min=e.kind==='boss'?45:30;if(d<min){const nx=d>0?dx/d:p.facing,ny=d>0?dy/d:0;p.x=clamp(p.x+nx*(min-d)*.5,45,this.worldWidth-45);p.y=clamp(p.y+ny*(min-d)*.5,bounds.minY,bounds.maxY);}}
      }
    }else if(this.s.tutorial.active){
      const t=this.s.tutorial;if(t.hits>=3&&t.combo>=1&&t.dodges>=2){this.trainingClock-=dt;if(this.trainingClock<=1.2&&this.trainingClock>0)this.trainingTell=this.trainingClock;else this.trainingTell=0;
        if(this.trainingClock<=0){this.trainingClock=2.6;if(Math.abs(p.x-1840)<230){this.hitPlayer(8,true,null,false,true);}else this.toast('回到木桩旁边，格伦正在等你练格挡。');}}
    }
    this.effects.forEach(e=>e.t-=dt);this.effects=this.effects.filter(e=>e.t>0).slice(-70);this.fields.forEach(f=>f.t=Math.max(0,f.t-dt));
    if(this.autoSave>4){this.autoSave=0;this.save();}
  }
}
