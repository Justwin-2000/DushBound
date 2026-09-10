import { TOWN, ROOMS, ENEMIES, BOSS_MOVES, COMBO } from './data.js';
import { clamp } from './game.js';
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});if(!this.c)throw Error('此设备无法创建游戏画布');this.w=960;this.h=540;this.camera=0;this.shake=0;this.artCache=new Map();this.gradients=new Map();this.glowCache=new Map();this.shadeCache=null;this.scenery=new Image();this.scenery.src='./assets/world.webp';this.resize();}
  resize(){const rect=this.canvas.getBoundingClientRect();this.w=Math.max(640,Math.round(540*rect.width/Math.max(1,rect.height)));this.canvas.width=this.w;this.canvas.height=540;this.c.imageSmoothingEnabled=false;this.gradients.clear();}
  rect(x,y,w,h,color){this.c.fillStyle=color;this.c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
  poly(points,color){const c=this.c;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  text(text,x,y,size=13,color='#e8dfc5',align='center'){const c=this.c;c.font=`${size}px "Microsoft YaHei", sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(text,Math.round(x),Math.round(y));}
  // 每帧重建渐变是这里最大的固定开销：渐变对象按 (场景/画布宽) 缓存复用；
  // 光晕则预渲染成离屏精灵，用 drawImage 贴图取代「新建径向渐变 + 整块 alpha 填充」。
  // 角色身后的柔和暗色：浅色墙面（旅店外墙、农舍）会把方块角色吃掉，
  // 压一层柔光轮廓就立住了。做成缓存精灵，每次只花一次 drawImage。
  shadeSprite(){if(!this.shadeCache){const s=document.createElement('canvas');s.width=96;s.height=96;const g=s.getContext('2d'),rg=g.createRadialGradient(48,48,3,48,48,46);rg.addColorStop(0,'rgba(9,14,24,.34)');rg.addColorStop(.55,'rgba(9,14,24,.16)');rg.addColorStop(1,'rgba(9,14,24,0)');g.fillStyle=rg;g.fillRect(0,0,96,96);this.shadeCache=s;}return this.shadeCache;}
  shade(x,y){this.c.drawImage(this.shadeSprite(),Math.round(x-48),Math.round(y-48));}
  grad(key,build){let g=this.gradients.get(key);if(!g){g=build();this.gradients.set(key,g);}return g;}
  glowSprite(radius,color){const key=radius+'|'+color;let sprite=this.glowCache.get(key);if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=radius*2;const g=sprite.getContext('2d'),rg=g.createRadialGradient(radius,radius,0,radius,radius,radius);rg.addColorStop(0,color);rg.addColorStop(1,'rgba(255,178,90,0)');g.fillStyle=rg;g.fillRect(0,0,radius*2,radius*2);this.glowCache.set(key,sprite);}return sprite;}
  glow(x,y,r,color){const radius=Math.max(1,Math.round(r));this.c.drawImage(this.glowSprite(radius,color),Math.round(x-radius),Math.round(y-radius));}
  line(x1,y1,x2,y2,color,width=2){const c=this.c;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
  draw(g,dt=1/60){
    const c=this.c,s=g.s,p=g.player,t=g.time;
    this.camera+=(clamp(p.x-this.w*.4,0,Math.max(0,g.worldWidth-this.w))-this.camera)*Math.min(1,dt*9);
    if(Math.abs(p.x-this.camera-this.w*.4)>this.w)this.camera=clamp(p.x-this.w*.4,0,Math.max(0,g.worldWidth-this.w));
    c.save();if(this.shake>0&&s.settings.shake){c.translate((hash(t*71)-.5)*this.shake,(hash(t*89)-.5)*this.shake);this.shake=Math.max(0,this.shake-dt*30);}
    this.background(g);
    c.save();c.translate(-Math.round(this.camera),0);
    if(s.scene==='town')this.town(g);else this.dungeon(g);
    for(const f of g.fields){c.fillStyle='rgba(174,90,151,.2)';c.strokeStyle='#e594bb';c.lineWidth=2;c.beginPath();c.ellipse(f.x,f.y,f.r,f.r*.7,0,0,Math.PI*2);c.fill();c.stroke();this.text('× 破盾',f.x,f.y,15,'#f7c3d8');}
    let actors=s.enemies.filter(e=>e.hp>0).map(e=>({y:e.y,draw:()=>this.enemy(e,g)}));
    if(s.scene==='town')for(const npc of TOWN)actors.push({y:npc.y,draw:()=>{this.human(npc.x,npc.y,npc.color,t,false,npc.id);this.label(npc.name,npc.x,npc.y-84,g.nearby()?.id===npc.id);}});
    actors.push({y:p.y,draw:()=>this.hero(g)});actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
    for(const b of g.projectiles){this.line(b.x-b.vx*.04,b.y-b.vy*.04-25,b.x,b.y-25,'#eddab1',3);this.rect(b.x-2,b.y-27,4,4,'#ffecbd');}
    for(const n of g.interactables()){if(n.x<this.camera-100||n.x>this.camera+this.w+100)continue;const near=g.nearby()?.id===n.id;const npc=TOWN.some(x=>x.id===n.id);if(!npc){this.diamond(n.x,n.y-74+Math.sin(t*2)*3,near?'#fff0b9':'#cdb776',near?6:4);if(near)this.label(n.label,n.x,n.y-98,true);}else if(near)this.diamond(n.x,n.y-103+Math.sin(t*2)*3,'#fff0b9',5);}
    this.effects(g);
    c.restore();
    // A small vignette keeps the warm lamps and readable silhouettes at the center.
    c.fillStyle=this.grad('vignette',()=>{const g=c.createRadialGradient(this.w/2,268,190,this.w/2,268,this.w*.7);g.addColorStop(0,'#050a1a00');g.addColorStop(1,'#050a1a5c');return g;});c.fillRect(0,0,this.w,540);
    // 冷暖分级：高光偏暖、暗部偏冷。散落的颜色因此在观感上归到同一套光照里。
    c.fillStyle=this.grad('grade',()=>{const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,'#ffd9a60d');g.addColorStop(.42,'#00000000');g.addColorStop(1,'#0b17300f');return g;});c.fillRect(0,0,this.w,540);
    this.particles(t,s.scene==='town'?'#ffcb89':'#b5aec5');c.restore();
  }
  background(g){const c=this.c,t=g.time,town=g.s.scene==='town',boss=!town&&g.s.run.room===6,phase=g.s.enemies.some(e=>e.kind==='boss'&&e.phase===2),lit=!!g.s.ending;
    c.fillStyle=this.grad('sky|'+(town?'town':'field')+'|'+(boss&&phase?'phase2':'phase1'),()=>{
      const g=c.createLinearGradient(0,0,0,370);
      // 六段渐层：三段会在天空上留下明显色带，六段才够顺，黄昏也更耐看。
      const stops=boss&&phase
        ?[[0,'#100f1a'],[.3,'#191726'],[.55,'#262038'],[.78,'#342a46'],[.92,'#3b2f4c'],[1,'#443553']]
        :town?[[0,'#1d2438'],[.25,'#2f3350'],[.48,'#57496a'],[.68,'#8a6472'],[.84,'#b58378'],[1,'#d09a7c']]
        :[[0,'#1b2130'],[.3,'#2b3243'],[.55,'#404353'],[.78,'#565363'],[.92,'#6c6273'],[1,'#7d6f78']];
      for(const [at,color] of stops)g.addColorStop(at,color);
      return g;});c.fillRect(0,0,this.w,540);
    this.glow(this.w*.7,145,120,town?'#e6b49e24':'#c9bade18');
    for(let i=0;i<25;i++){const x=(i*153-this.camera*.05)%(this.w+100);this.rect(x,30+hash(i)*130,hash(i+8)>.8?2:1,1,'#cfc8c170');}
    for(let layer=0;layer<3;layer++){const scale=[.08,.16,.3][layer],base=[210,245,290][layer],color=['#4a4a63','#39415a','#2b3644'][layer];let points=[[-100,400]];for(let x=-100;x<this.w+150;x+=55){const xx=x+this.camera*scale;points.push([x,base-hash(Math.floor(xx/55)+layer*13)*(layer===2?65:85)]);}points.push([this.w+200,400]);this.poly(points,color);}
    // 空气透视：越靠近地平线越亮越雾，一层渐变就把三层远山的纵深拉开。
    c.fillStyle=this.grad('haze|'+(town?'town':'field')+'|'+(boss&&phase?'p2':'p1'),()=>{const g=c.createLinearGradient(0,170,0,332);g.addColorStop(0,(town?'#c99a8a':'#9aa0b5')+'00');g.addColorStop(1,(town?'#d8a894':'#a8aec2')+'3d');return g;});c.fillRect(0,170,this.w,162);
    if(this.scenery.complete&&this.scenery.naturalWidth){
      const width=this.w+240,offset=clamp(this.camera/Math.max(1,g.worldWidth-this.w),0,1)*240;
      c.drawImage(this.scenery,-offset,0,width,330);
      this.rect(0,0,this.w,330,town?'#17233528':boss&&phase?'#1b102c9c':'#17233270');
      c.fillStyle=this.grad('fade|'+(town?'town':'field'),()=>{const g=c.createLinearGradient(0,265,0,335);g.addColorStop(0,'#26343d00');g.addColorStop(1,town?'#343d3e':'#32363c');return g;});c.fillRect(0,265,this.w,70);
    }
    // Distant windmill follows the far parallax layer.
    const millx=(town?this.w*.78:1050)-this.camera*.08;this.windmill(millx,250,.6,t*.18,'#383847',false);
    this.rect(0,310,this.w,230,town?'#343d3e':boss?'#34303e':'#32363c');
    // 地面用纵向渐变替代整块平涂，近处压暗、远处抬亮，画面不再是几块色板拼起来。
    c.fillStyle=this.grad('ground|'+(town?'town':boss&&phase?'p2':'field'),()=>{const g=c.createLinearGradient(0,308,0,540);g.addColorStop(0,town?'#3b4448':boss?'#3c3844':'#3a3a41');g.addColorStop(.34,town?'#343d3e':boss?'#34303e':'#32363c');g.addColorStop(1,town?'#2c3437':boss?'#2c2831':'#2b3034');return g;});c.fillRect(0,308,this.w,232);
    if(town){
      c.fillStyle=this.grad('road|'+(lit?'lit':'dim'),()=>{const g=c.createLinearGradient(0,344,0,426);g.addColorStop(0,lit?'#7d7d74':'#64635f');g.addColorStop(.45,lit?'#727269':'#5c5b58');g.addColorStop(1,lit?'#5b5b53':'#494846');return g;});c.fillRect(0,344,this.w,82);
      this.rect(0,347,this.w,3,'#8c80704d');this.rect(0,424,this.w,4,'#242e33');
      // 贴地的薄雾：让远处地面和路面之间不再是一条硬边。
      for(let i=0;i<3;i++){const y=306+i*24;c.fillStyle=this.grad('mist|'+i,()=>{const g=c.createLinearGradient(0,y-15,0,y+15);g.addColorStop(0,'#cfd8d200');g.addColorStop(.5,'#cfd8d212');g.addColorStop(1,'#cfd8d200');return g;});c.fillRect(0,y-15,this.w,30);}
    }
    else {this.rect(0,210,this.w,275,boss?'#45414c':'#44444a');if(g.s.run.room===2){this.rect(0,445,this.w,95,'#202b36');this.rect(0,205,this.w,35,'#253039');}}
    for(let i=0;i<150;i++){const x=((i*73-Math.floor(this.camera))%(this.w+90)+this.w+90)%(this.w+90)-30,y=330+hash(i+90)*180;if(y>344&&y<425&&town){this.rect(x,y,12+hash(i)*12,2,'#363d3e40');this.rect(x+12,y-8,1,9,'#353b3b25');}else this.rect(x,y,3+hash(i)*5,2,town?'#89906b35':'#9e97902a');}
  }
  visible(x,margin=300){return x>this.camera-margin&&x<this.camera+this.w+margin;}
  town(g){const t=g.time,lit=!!g.s.ending;
    for(let x=0;x<7350;x+=150){if(!this.visible(x,150))continue;if(x%600===0){this.tree(x+70,315,1+hash(x)*.5);this.fence(x-90,330,90);}if(x%450===0)this.lamp(x+55,345,t,lit||x%900===0);
      for(let k=0;k<6;k++){const xx=x+k*23,yy=445+hash(xx)*28;this.rect(xx,yy,2,8,'#596c56');this.rect(xx+2,yy+4,3,2,k%3===0?'#b8a47b':'#6f8060');}}
    this.house(240,312,285,188,'inn',lit,t);this.house(1680,313,305,165,'forge',lit,t);this.house(4770,312,255,165,'herbs',lit,t);
    // Plaza and the old boundary light.
    if(this.visible(3180,450)){this.poly([[2920,420],[2910,345],[3170,275],[3450,345],[3440,420]],'#696865');for(let i=0;i<7;i++)this.line(2950+i*70,339,2930+i*70,419,'#4e5355',2);
      this.rect(3116,321,88,15,'#333b45');this.rect(3124,305,72,16,'#6e7274');this.rect(3137,249,46,58,'#66717a');this.rect(3143,242,34,52,'#323c4a');this.rect(3126,233,70,11,'#82858a');this.rect(3137,200,46,35,'#233340');this.rect(3146,208,28,26,'#f7c36d');this.rect(3132,191,58,10,'#6f737d');this.poly([[3125,191],[3159,164],[3193,191]],'#4a535f');this.glow(3160,222,lit?155:85,lit?'#ffb95e60':'#eec58035');this.flame(3160,221,lit?1.6:.8,t);
      if(lit){this.human(3040,367,'#9a8794',t,false,'resident');this.human(3390,390,'#8d9c88',t,false,'resident');}}
    if(this.visible(1870)){this.rect(1865,301,10,48,'#715e4e');this.rect(1847,294,44,20,'#a18f71');this.rect(1848,315,43,6,'#5a5046');this.rect(1861,281,18,14,'#a99676');this.rect(1853,346,38,5,'#393b35');
      if(g.s.tutorial.active&&g.trainingTell>0){this.line(1730,304,1800,315,'#eed080',5);this.label('木剑 '+g.trainingTell.toFixed(1)+'s',1800,264,true);this.diamond(1800,283,'#f2cd78',7);}}
    if(this.visible(470)){this.rect(453,271,6,50,'#6a5142');this.rect(491,271,6,50,'#6a5142');this.rect(445,259,60,38,'#a48b64');this.rect(450,264,50,25,'#453b35');for(let k=0;k<3;k++)this.rect(458+k*13,269,9,16,'#c8b993');}
    if(this.visible(4650)){this.rect(4620,294,68,9,'#84745e');this.rect(4625,303,5,20,'#5c5549');this.rect(4676,303,5,20,'#5c5549');for(let k=0;k<6;k++){this.rect(4625+k*10,277,6,18,'#72866d');this.rect(4620+k*10,280,9,5,'#a5b38a');}}
    if(this.visible(6990,400)){for(const x of [6860,7130]){this.rect(x,191,65,155,'#555864');for(let i=0;i<8;i++){this.rect(x+3,194+i*18,58,2,'#343f49');this.rect(x+28+(i%2)*15,197+i*18,2,13,'#343f49');}this.poly([[x-15,193],[x+32,133],[x+80,193]],'#343947');}this.rect(6915,221,232,18,'#7e7163');this.rect(6920,242,220,7,'#554f49');this.label('灰风原野',7030,215,false);this.glow(7040,320,100,'#c3beee19');this.lamp(6910,310,t,true);}
    this.fence(140,328,85);
  }
  house(x,y,w,h,kind,lit,t){if(!this.visible(x,w))return;const c=this.c,left=x-w/2,roof=kind==='inn'?'#674d54':kind==='forge'?'#4f5662':'#5a645e';
    this.rect(left+8,y-h+48,w-16,h-45,'#64605c');this.rect(left+14,y-h+54,w-28,h-60,kind==='inn'?'#887b6a':kind==='forge'?'#6b6a66':'#7b7c69');
    this.poly([[left-20,y-h+54],[left+w*.36,y-h-16],[left+w*.66,y-h-16],[left+w+20,y-h+54]],roof);this.line(left-20,y-h+54,left+w+20,y-h+54,'#a5927a',5);
    for(let i=0;i<6;i++){const yy=y-h+4+i*9;this.line(left+60-i*12,yy,left+w-50+i*10,yy,'#282e3c55',2);for(let k=0;k<8;k++){const xx=left+62-i*10+k*(w-105+i*18)/8;this.rect(xx,yy+2,11,2,'#b3938335');this.rect(xx+4,yy+3,1,5,'#272d3940');}}
    for(let i=0;i<6;i++){const yy=y-h+64+i*17;this.line(left+22,yy,left+w-22,yy,'#403f3930',1);for(let k=0;k<7;k++)this.rect(left+28+k*34+(i%2)*10,yy-8,2,8,'#514c4220');}
    this.rect(left+w*.72,y-h-15,25,52,'#655f64');this.rect(left+w*.72-4,y-h-20,34,8,'#8e8080');for(let i=0;i<4;i++){this.rect(left+w*.76+Math.sin(t*.5+i)*12,y-h-40-i*15,20-i*3,13,'#a29aa515');}
    this.rect(left+12,y-h+54,9,h-52,'#494942');this.rect(left+w-21,y-h+54,9,h-52,'#494942');this.rect(x-5,y-h+54,10,h-52,'#514b43');this.rect(left+15,y-50,w-30,8,'#534f44');
    this.rect(x-25,y-72,48,74,'#413f3b');this.rect(x-19,y-67,36,67,'#605444');this.line(x-1,y-63,x-1,y-4,'#403e36',2);this.rect(x+8,y-37,4,4,'#c2a367');
    for(const xx of [left+48,left+w-83]){this.rect(xx-6,y-100,47,59,'#3e4545');this.rect(xx,y-95,35,43,(lit||kind!=='forge')?'#e8ae6e':'#b4845a');this.rect(xx+16,y-95,4,44,'#715748');this.rect(xx,y-75,35,4,'#715748');this.rect(xx-9,y-49,52,6,'#4c4944');this.glow(xx+18,y-76,50,'#ecb07118');}
    if(kind==='forge'){this.rect(left+w-70,y-55,48,52,'#2c3438');this.rect(left+w-62,y-47,32,32,'#a06543');this.flame(left+w-46,y-22,.9,t);this.rect(x+130,y+13,65,12,'#353e43');this.poly([[x+115,y+1],[x+198,y+1],[x+179,y+17],[x+136,y+17]],'#899090');this.rect(x+151,y+15,20,15,'#566069');}
    for(let k=0;k<5;k++){this.rect(left+39+k*9,y-43,3,12,'#586b51');this.rect(left+36+k*9,y-46,7,4,k%2?'#c5ad86':'#af8185');}this.rect(left+30,y-34,59,9,'#705b49');
    this.label(kind==='inn'?'晚灯旅店':kind==='forge'?'炉火与铁':'药草屋',x,y-h+71,false);
  }
  tree(x,y,scale=1){const w=35*scale;this.rect(x-5,y-70*scale,10,75*scale,'#424d45');this.poly([[x-w,y-44*scale],[x,y-130*scale],[x+w,y-44*scale]],'#314842');this.poly([[x-w*.8,y-72*scale],[x,y-153*scale],[x+w*.8,y-72*scale]],'#3d5149');this.poly([[x-w*.5,y-111*scale],[x,y-167*scale],[x+w*.5,y-111*scale]],'#4b5a50');}
  fence(x,y,w){for(let i=0;i<w;i+=23)this.rect(x+i,y-27,5,29,'#676452');this.rect(x,y-20,w,5,'#807763');this.rect(x,y-9,w,5,'#676652');}
  lamp(x,y,t,lit=true){this.rect(x-3,y-93,6,94,'#303943');this.rect(x-15,y-96,30,6,'#252f3b');this.rect(x-10,y-93,20,23,lit?'#e8bc77':'#62635b');this.rect(x-13,y-73,26,5,'#343943');this.rect(x-2,y-92,4,21,'#7a7157');if(lit)this.glow(x,y-83,65+Math.sin(t*3+x)*4,'#fac7842d');}
  flame(x,y,scale,t){const flicker=Math.sin(t*8+x)*3;this.poly([[x-10*scale,y],[x-7*scale,y-17*scale],[x+flicker,y-34*scale],[x+4*scale,y-20*scale],[x+10*scale,y-11*scale],[x+7*scale,y]],'#cc8256');this.poly([[x-5*scale,y],[x-4*scale,y-15*scale],[x+2*scale,y-23*scale],[x+5*scale,y]],'#f7d493');}
  windmill(x,y,scale,t,color,active){this.poly([[x-24*scale,y],[x-16*scale,y-108*scale],[x+15*scale,y-108*scale],[x+27*scale,y]],color);this.poly([[x-24*scale,y-104*scale],[x,y-140*scale],[x+24*scale,y-104*scale]],color);const c=this.c;c.save();c.translate(x,y-105*scale);c.rotate(t);for(let k=0;k<4;k++){c.rotate(Math.PI/2);this.rect(-4*scale,-110*scale,8*scale,110*scale,color);this.rect(4*scale,-105*scale,16*scale,70*scale,color);for(let j=0;j<6;j++)this.line(5*scale,(-102+j*11)*scale,18*scale,(-102+j*11)*scale,active?'#9e929330':'#98869920',2);}c.restore();}
  dungeon(g){const r=g.s.run,theme=ROOMS[r.room].theme,t=g.time;
    if(theme==='boss'){this.windmill(760,294,2.1,t*.7,'#292733',true);this.poly([[100,460],[40,300],[220,216],[1320,216],[1480,300],[1430,460]],'#4a4651');for(let k=0;k<15;k++)this.line(90+k*90,245,110+k*90,453,'#5a535e',2);this.rect(90,238,1350,12,'#777075');this.rect(70,454,1390,20,'#2f2e39');for(let i=0;i<18;i++)this.rect(100+i*77,204,8,46,'#47414d');}
    else if(theme==='bridge'){this.rect(70,236,1370,209,'#56535a');for(let i=0;i<26;i++)this.rect(75+i*53,241,3,200,'#343842');this.fence(85,242,1290);this.fence(80,444,1270);}
    else if(theme==='farm'){
      this.house(690,294,350,172,'herbs',false,t);
      // 清场后推开板墙：墙上真的多出一个洞，近路看得见。
      if(r.doorOpened){
        this.rect(715,200,46,52,'#161d27');this.rect(711,196,54,5,'#9a8f7c');
        this.poly([[707,252],[769,252],[779,262],[697,262]],'#6b6355');this.glow(738,226,46,'#cfe0d322');
      }
    }
    else if(theme==='mill'){this.rect(510,110,500,180,'#484650');for(let k=0;k<7;k++)this.rect(520,120+k*23,480,3,'#383b46');this.rect(710,191,130,105,'#252b34');this.rect(740,216,8,63,'#777079');this.rect(789,216,8,63,'#777079');}
    else {for(let i=0;i<12;i++){const x=i*127;if(this.visible(x,100))this.tree(x,285,.8+hash(i)*.9);}if(theme==='wheat'){for(let i=0;i<100;i++){const x=hash(i)*1500,y=235+hash(i+9)*55;this.rect(x,y,2,30,'#797464');this.rect(x-3,y,8,12,'#99907b');}}}
    if(theme==='road'){
      // 路牌：没转正之前是歪倒在草丛里的一块牌子，转正后才立起来，并露出旧车辙。
      if(r.signState>=2){
        this.rect(332,255,8,65,'#827564');this.poly([[312,257],[384,257],[393,265],[380,274],[312,274]],'#a5977a');this.text('王都 67 里',351,270,9,'#413d3e');
        this.glow(351,300,58,'#e8d7a01f');
        for(let i=0;i<6;i++)this.rect(190+i*24,404+Math.sin(i)*3,16,3,'#5c5548');
      }else{
        this.line(338,318,366,262,'#827564',8);
        this.poly([[300,300],[372,288],[380,302],[306,314]],'#8a7f6d');this.text('王都 67 里',340,304,9,'#3b3833');
      }
    }
    else if(theme==='camp'){this.rect(688,343,47,9,'#575459');this.line(689,338,734,324,'#867665',8);this.line(695,323,728,339,'#7a6759',7);if(!r.campUsed){this.flame(711,333,1.1,t);this.glow(711,315,110,'#edb4743d');}this.rect(332,290,38,9,'#b4a68c');this.rect(350,277,18,16,'#c7b499');}
    else if(theme==='mill'){this.rect(332,293,17,16,'#b8a076');this.line(341,278,358,300,'#ccbba0',3);if(r.clear){this.rect(1052,288,55,33,r.chestUsed?'#635853':'#988469');this.rect(1050,281,59,12,'#b49b73');this.rect(1075,288,9,16,'#463f42');}}
    else {this.rect(328,295,45,12,'#817a76');this.rect(338,280,20,17,'#9c9090');}
    if(r.clear){this.glow(1410,340,110,'#a9cec633');for(let i=0;i<4;i++)this.line(1380+i*13,327,1400+i*13,340,'#c0d7c0',2);this.line(1420,339,1410,330,'#dce8c5',3);this.line(1420,339,1410,348,'#dce8c5',3);}
    this.rect(10,480,1500,60,'#242c32');for(let i=0;i<50;i++){this.rect(i*31,465+hash(i)*10,3,17,'#414d47');this.rect(i*31+3,470,7,3,'#556053');}
  }
  human(x,y,color,t,moving=false,id='hero',facing=1,action='idle'){
    this.shade(x,y-30);
    const c=this.c;c.save();c.translate(Math.round(x),Math.round(y));const bob=moving?Math.sin(t*12)*2:Math.sin(t*2)*.6;c.fillStyle='#111c2560';c.beginPath();c.ellipse(0,-2,17,5,0,0,Math.PI*2);c.fill();c.translate(0,Math.round(bob));c.scale(facing,1);
    const step=moving?Math.sin(t*12)*6:0;this.rect(-10,-15+step,7,14,'#282c36');this.rect(4,-15-step,7,14,'#292c35');this.rect(-12,-3+step,10,4,'#514b46');this.rect(3,-3-step,11,4,'#514b46');
    this.poly([[-14,-41],[8,-41],[16,-13],[-17,-13],[-21,-18]],id==='hero'?'#273e4a':color);this.rect(-8,-37,19,19,id==='hero'?'#50646a':'#6d615a');this.rect(-7,-31,18,3,'#9a8068');this.rect(-11,-17,25,4,'#8e715c');
    this.rect(-8,-56,19,19,'#ba9d85');this.rect(-10,-58,22,9,id==='hero'?'#303d46':id==='glen'?'#b8b3a6':id==='milo'?'#7b6653':'#69665f');this.rect(-12,-49,6,12,id==='hero'?'#303d46':color);this.rect(6,-47,3,3,'#2b333d');this.rect(-10,-39,24,5,id==='hero'?'#bb9b6a':color);
    if(id==='milo'){this.rect(2,-49,12,5,'#c4c6af');this.rect(5,-49,4,5,'#7a9a9a');}if(id==='ida')this.rect(-6,-29,14,18,'#dcc4a0');
    if(id==='hero'){this.rect(13,-30,6,17,'#a69073');this.rect(16,-16,8,11,'#ba9155');this.rect(18,-14,4,7,'#f2d597');this.glow(20,-11,42,'#eec37e20');if(action!=='attack'){this.line(-11,-24,-24,3,'#bbc8bd',3);this.line(-18,-15,-9,-10,'#b0a078',3);}}
    c.restore();
  }
  hero(g){const p=g.player,a=g.p,c=this.c;if(a.invincible>0&&Math.floor(g.time*18)%2===0)c.globalAlpha=.6;
    if(a.action==='dodge'){c.globalAlpha=.35;this.human(p.x-a.dx*26,p.y-a.dy*20,'#637888',g.time,true,'hero',p.facing);c.globalAlpha=.8;}
    this.human(p.x,p.y,'#415464',g.time,Math.hypot(g.input.x,g.input.y)>.1&&a.action==='idle','hero',p.facing,a.action);c.globalAlpha=1;
    if(a.action==='attack'){const cfg=COMBO[a.combo],progress=Math.min(1,a.elapsed/cfg.duration),swing=1-Math.pow(1-progress,3);c.save();c.translate(p.x,p.y-28);c.scale(p.facing,1);c.rotate(-1.15+swing*2.7);
      // 挥砍残影：半径明显大于剑尖、弧度短，避免与剑身连成一把镰刀。
      c.strokeStyle=a.combo===2?'#fff0b9':'#decfad';c.globalAlpha=.45;c.lineWidth=a.combo===2?5:4;c.beginPath();c.arc(0,0,80,-.6,-.06);c.stroke();c.globalAlpha=1;
      // 剑：刃身根部宽、向剑尖收窄并带刃口高光，配护手与剑首。
      // 之前「等宽长条 + 垂直横杠」的轮廓就是被读成锄头的原因。
      this.poly([[-13,-4],[-13,4],[-9,6],[-9,-6]],'#c9a86a');
      this.rect(-9,-3,12,6,'#6d5a49');
      this.rect(3,-9,5,18,'#b7a26e');
      this.poly([[8,-4.5],[54,-4],[68,0],[54,4],[8,4.5]],'#e9e1c6');
      this.poly([[8,-4.5],[54,-4],[60,-1.5],[8,-1.5]],'#fffaf0');
      c.restore();}
    if(a.action==='block'){c.save();c.strokeStyle=a.blockAge<=.18?'#f8e5ad':'#a9c8cf';c.lineWidth=4;c.beginPath();c.ellipse(p.x+p.facing*21,p.y-29,12,27,0,0,Math.PI*2);c.stroke();c.restore();}
    if(a.action==='potion'){this.rect(p.x+17,p.y-47,8,13,'#cda294');this.glow(p.x,p.y-25,45,'#87cca23b');}
  }
  enemy(e,g){const c=this.c,cfg=ENEMIES[e.kind],t=g.time,wind=e.state==='windup',boss=e.kind==='boss';
    const warning=boss?BOSS_MOVES[e.move]:{name:e.kind==='archer'?'弩箭瞄准':e.move==='charge'?'冲锋':'扑击',blockable:true};
    if(wind){const color=warning.blockable?'#eac678':'#dc88ac';if(e.kind==='archer'){this.line(e.x,e.y-28,e.tx,e.ty-28,'#e29c9790',1);this.diamond(e.tx,e.ty-28,'#d9858a',5);}else if(e.move!=='field'&&e.move!=='summon'){c.fillStyle=warning.blockable?'#eab95120':'#cf6c9c30';c.beginPath();c.ellipse(e.x,e.y,warning.radius||95,(warning.radius||95)*.48,0,0,Math.PI*2);c.fill();}this.label((warning.blockable?'! ':'× ')+warning.name,e.x,e.y-(boss?137:93),true,color);}
    if(e.kind==='rat'||e.kind==='dog'||e.kind==='elite'){
      c.save();c.translate(Math.round(e.x),Math.round(e.y));c.scale(e.facing,1);const dog=e.kind!=='rat',w=dog?56:32,h=dog?32:20,step=e.state==='chase'?Math.sin(t*14)*4:0;
      c.fillStyle='#11172266';c.beginPath();c.ellipse(0,0,w*.6,6,0,0,Math.PI*2);c.fill();this.rect(-w*.48,-h,w,h*.7,e.flash?'#eceadf':cfg.color);this.rect(w*.25,-h-7,w*.38,h*.65,e.flash?'#fff8eb':'#aaa0ac');this.rect(w*.57,-h,5,3,e.kind==='elite'?'#ec9daa':'#eec186');this.poly([[w*.27,-h-5],[w*.35,-h-18],[w*.5,-h-5]],cfg.color);
      this.rect(-w*.35,-h*.4+step,6,h*.4-step,'#595767');this.rect(w*.3,-h*.4-step,6,h*.4+step,'#666070');this.line(-w*.4,-h*.7,-w*.9,-h*.2,'#827e8d',4);if(dog){this.rect(w*.48,-h*.3,9,3,'#d5c5bd');this.rect(w*.48,-h*.3,3,8,'#d5c5bd');}c.restore();
    }else if(e.kind==='archer'){this.human(e.x,e.y,e.flash?'#eee4d6':'#6d7a72',t,e.state==='chase','archer',e.facing);this.line(e.x+e.facing*15,e.y-32,e.x+e.facing*42,e.y-32,'#c1b59b',4);this.line(e.x+e.facing*34,e.y-45,e.x+e.facing*34,e.y-19,'#a49788',3);}
    else {
      c.save();c.translate(e.x,e.y);c.scale(e.facing,1);this.rect(-22,-33,13,32,'#434551');this.rect(9,-33,14,32,'#4b4d56');this.poly([[-32,-85],[27,-85],[38,-28],[-38,-28]],e.flash?'#e8e0d8':'#555766');this.rect(-21,-84,44,54,e.flash?'#ece4d9':'#96929b');for(let j=0;j<4;j++)this.rect(-18,-79+j*12,39,3,'#5f626c');this.rect(-17,-113,35,31,'#8b8795');this.rect(-22,-104,46,12,'#6a6c7a');this.rect(-15,-97,30,7,e.phase===2?'#ac87c4':'#e9bd78');this.rect(-11,-58,22,21,e.phase===2?'#b294cc':'#e9c789');this.glow(0,-47,50,e.phase===2?'#b99ad22b':'#eec78933');this.line(36,-95,44,9,'#9d9da3',6);this.poly([[36,-100],[68,-92],[54,-73],[47,-79],[56,-88],[35,-90]],'#c1bbc1');this.rect(-49,-49,18,25,'#30313e');this.rect(-47,-45,14,15,'#726579');c.restore();
      if(e.state==='transition'){this.glow(e.x,e.y-55,180,'#c0a1df30');this.label('界灯熄灭',e.x,e.y-141,true,'#d6b9ea');}
      if(e.state==='stunned')this.label('架势崩解',e.x,e.y-133,true,'#f2db9d');
    }
    if(!boss&&e.hp<e.maxHp){this.rect(e.x-22,e.y-(e.kind==='archer'?73:57),44,4,'#1e2833');this.rect(e.x-22,e.y-(e.kind==='archer'?73:57),44*e.hp/e.maxHp,4,'#cb938b');}
  }
  diamond(x,y,color,size){this.poly([[x,y-size],[x+size,y],[x,y+size],[x-size,y]],color);}
  label(text,x,y,active=false,color='#f0ddb0'){const c=this.c;c.font='12px "Microsoft YaHei", sans-serif';const w=c.measureText(text).width;this.rect(x-w/2-10,y-15,w+20,23,active?'#1b2930df':'#1b293099');if(active)this.rect(x-w/2-10,y+7,w+20,1,color);this.text(text,x,y,12,active?color:'#c9c9ba');}
  effects(g){const c=this.c;for(const e of g.effects){c.save();c.globalAlpha=Math.min(1,e.t*3);if(e.type==='text'&&g.s.settings.numbers)this.text(e.text,e.x,e.y-(1.1-e.t)*27,16,e.color);else if(e.type==='spark'){for(let k=0;k<5;k++)this.rect(e.x+Math.cos(k*1.3)*(1-e.t)*30,e.y+Math.sin(k*1.3)*(1-e.t)*30,4,4,e.color);}else if(e.type==='ring'){c.strokeStyle=e.color;c.lineWidth=3;c.beginPath();c.ellipse(e.x,e.y,e.r,e.r*.5,0,0,Math.PI*2);c.stroke();}else if(e.type==='dash')this.line(e.x,e.y-24,e.x2,e.y2-24,e.color,10);else if(e.type==='death'){for(let k=0;k<8;k++)this.rect(e.x+(hash(k)-.5)*(1-e.t)*100,e.y-40-hash(k+8)*(1-e.t)*50,5,5,e.color);}c.restore();}}
  particles(t,color){for(let i=0;i<24;i++){const x=(hash(i)*this.w+t*(5+hash(i)*8))%this.w,y=hash(i+99)*470+Math.sin(t*.5+i)*5;this.rect(x,y,i%3===0?2:1,2,color+'50');}}
}
