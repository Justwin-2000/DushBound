// Chapter II tuning data. Only the four sample weapons are enabled in 1.1.0.
export const RELEASE = '1.1.0';
export const SAMPLE = ['P01', 'S01', 'M01', 'W01'];
export const WEAPONS = {};
const rows = [
 ['P01','驿站手枪','白',8,1,.24,0,260,150,'免费单发'],['P02','双音左轮','绿',9,2,.40,1,290,160,'两发相隔 .06 秒'],['P03','收信人','蓝',15,1,.42,2,250,170,'标记供下一次武器命中消耗'],
 ['S01','破门散弹','白',5,5,.70,2,230,85,'26°散布、近距击退'],['S02','盐雨','绿',4,7,.75,3,210,100,'两侧弹反弹一次'],['S03','风箱','紫',6,6,.85,4,240,100,'锥区清普通弹'],
 ['A01','铆钉枪','白',4,1,.10,1,320,140,'墙面钉痕'],['A02','织雨机','蓝',3,2,.12,1,300,150,'交替双线'],['A03','夜班哨兵','紫',5,1,.09,1,330,160,'连射两秒过热'],
 ['B01','折返弩','绿',18,1,.65,0,220,130,'去回各一击'],['B02','钟针步枪','蓝',34,1,.90,3,480,220,'贯穿一个目标'],['B03','地平线','紫',50,1,1.20,5,520,240,'蓄力 .45 秒'],
 ['M01','巡界短剑','白',15,1,.24,0,0,22,'100°扇形，有效帧清普通弹'],['M02','修灯扳手','绿',28,1,.55,0,0,24,'80°扇形、击退8'],['M03','月牙回刃','紫',12,1,.45,1,180,75,'去回各一击，不清弹'],
 ['W01','线灯杖','白',10,1,.30,1,190,145,'直线光针'],['W02','冷苔杖','蓝',9,1,.32,2,180,145,'三层寒冻结'],['W03','合唱灯','紫',7,3,.50,3,160,150,'弯曲声弹，不追踪'],
 ['X01','邮筒炮','绿',30,1,.90,4,150,130,'半径18爆炸'],['X02','温室瓶','蓝',8,1,.75,3,0,100,'落地苔区'],['X03','失重炉','紫',20,1,1.10,5,130,120,'拉近后爆炸'],
 ['O01','雨伞枪','绿',6,3,.45,1,240,110,'第四击前方清弹'],['O02','面包投石器','蓝',18,1,.60,1,170,110,'弹墙一次'],['O03','借来的月亮','紫',5,1,.15,1,150,90,'最多六个绕行光球']
];
for (const [id,name,rarity,damage,pellets,interval,energy,speed,range,behavior] of rows) WEAPONS[id]={id,name,rarity,damage,pellets,interval,energy,speed,range,behavior,implemented:SAMPLE.includes(id)};
export const CLASSES = [
 {id:'keeper',name:'守灯人 · 巡界者',hp:6,shield:6,energy:120,speed:112,skill:'灯环',cooldown:10,implemented:true},
 {id:'ranger',name:'游铳手 · 岚',hp:5,shield:4,energy:140,speed:124,skill:'换位射击',cooldown:7,implemented:false},
 {id:'engineer',name:'机匠 · 朔',hp:7,shield:5,energy:110,speed:104,skill:'展开炮台',cooldown:14,implemented:false},
 {id:'weaver',name:'织灯师 · 葵',hp:5,shield:5,energy:160,speed:110,skill:'缝光',cooldown:11,implemented:false}
];
export const ENEMIES={rat:{name:'雾噬鼠',hp:18,speed:42,r:7,range:17,tell:.45,damage:1},dog:{name:'裂爪犬',hp:45,speed:35,r:9,range:100,tell:.7,damage:2},archer:{name:'空壳弩手',hp:28,speed:24,r:8,range:175,tell:.65,damage:1}};
export const ROOM={id:'postal-yard',name:'灰风 · 旧邮亭试炼庭',bounds:{x:24,y:54,w:592,h:274},walls:[{x:190,y:110,w:32,h:56},{x:385,y:188,w:64,h:32}],spawn:{x:92,y:238}};
export const DEFAULT_KEYS={up:'w',down:'s',left:'a',right:'d',dash:' ',skill:'q',swap:'e',interact:'f'};
export const PALETTE={ink:'#20232f',shadow:'#39465d',stone:'#a68b73',gold:'#e7b96d',white:'#f2e4c5',red:'#9d5157',teal:'#4b858a',green:'#6b8b6c',purple:'#9673b5',bullet:'#f47d78',floor:'#697568',edge:'#465653'};
