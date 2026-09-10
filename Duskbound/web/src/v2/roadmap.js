// Production data manifest, deliberately NOT enabled gameplay in 1.1.0.
export const REGIONS=[
 {id:'graywind',name:'灰风邮路',implemented:false,normal:['路牌交叉口','空农院','晒谷场','邮车道','风车地基','税关庭'],special:['背风火堆','无人邮亭'],boss:'圆形脱粒场',enemies:['雾噬鼠','裂爪犬','空壳弩手','封条税卒'],evidence:['押运封条','洛恩旧报告','艾琳校准记录'],unlock:'岚'},
 {id:'sunken',name:'沉钟港',implemented:false,normal:['鱼市拱廊','钟罩仓库','双闸平台','绞盘码头','停泊船坞','海关大厅'],special:['浮台茶摊','干燥档案舱'],boss:'大钟下排水平台',enemies:['罐头潜工','浮囊水母','绞盘卫','鸣钟员'],evidence:['分频器','封装记忆档案'],unlock:'朔'},
 {id:'rain',name:'雨幕温室',implemented:false,normal:['玻璃门厅','根桥病区','标本庭','灌溉室','碎顶温室','病历花园'],special:['医师亭','留声花坛'],boss:'圆形病床庭',enemies:['剪枝偶','灯蛾','病历花','护根者'],evidence:['活木器官','静夜姓名册'],unlock:'葵'}
];
export const BOSSES=[
 {id:'reaper',name:'巡税机 · 拾穗者',hp:1100,region:'graywind',moves:['留缺口五扇弹','锯臂直冲','双封条地雷'],thresholds:[.5]},
 {id:'helmsman',name:'沉钟司舵',hp:1400,region:'sunken',moves:['旋转锚链','双蒸汽带','60度缺口环弹'],thresholds:[.5]},
 {id:'mother',name:'温室母体',hp:1600,region:'rain',moves:['依次根刺','种子扇弹','召唤两剪枝偶'],thresholds:[.5]},
 {id:'calibrator',name:'校准者 · 白昼副机',hp:1900,region:'heart',moves:['描边激光','四向门弹','位移锥射'],thresholds:[.6,.3]}
].map(b=>({...b,implemented:false}));
export const RELICS=[['ember','余烬芯','每第三次直接武器命中附燃'],['echo','回声弹匣','每第六次付费射击返还一半能耗'],['boots','旧军鞋','移速+8%'],['mirror','裂镜片','每第五次直线单弹增40%伤害侧弹'],['wire','绝缘线','护盾等待3.2秒'],['spring','轻弹簧','切枪0.06秒'],['glove','冷手套','寒冻结+0.2秒'],['button','缝补扣','药剂+1生命'],['ring','重铁环','近战半径+3'],['filament','备用灯丝','最大能量与当前能量+20'],['hourglass','砂钟','技能CD-15%'],['stamp','勇气邮票','本房无生命损失多2铜筹']].map(([id,name,rule])=>({id,name,rule,implemented:false}));
export const EVENTS=['无人邮箱','错误贩卖机','潮湿棋桌','走失炮台','记忆交换','无名歌者','封存医箱','裂开的镜子'].map((name,i)=>({id:'event-'+(i+1),name,implemented:false}));
export const QUESTS=[
 {id:'glen',name:'没寄出的退伍信',steps:['灰风找名单','问洛恩','寄出或附补记'],reward:'工坊队徽与试枪修理台'},
 {id:'milo',name:'药瓶上的名字',steps:['港口取残签','林区采无害标本','征求患者同意'],reward:'标本册与补给配方'},
 {id:'ida',name:'合照缺席者',steps:['调查空相框','找到静夜曲谱','共同演奏'],reward:'姓名椅与钢琴曲'},
 {id:'lorne',name:'无需签收',steps:['收三封信','说明军牌去向','选择回信内容'],reward:'东门信箱'},
 {id:'keeper',name:'自己的字',steps:['发现笔迹','确认现在的自己','写下署名'],reward:'斗篷内衬'},
 {id:'ranger',name:'最后一单',steps:['发现箱单','拆验退货','承担赔偿'],reward:'岚修补信箱'},
 {id:'engineer',name:'零件之外',steps:['收集零件','修复小鸟','放弃固定叫声'],reward:'机械鸟'},
 {id:'weaver',name:'允许悲伤',steps:['倾听患者','确认保留记忆','安排陪伴'],reward:'药草屋椅子'}
].map(q=>({...q,implemented:false}));
export const ENDINGS=[{id:'archive',name:'归档协议',requiredTownQuests:0},{id:'shared',name:'众灯协议',requiredTownQuests:2},{id:'free',name:'自由灯线',requiredTownQuests:0}].map(e=>({...e,implemented:false}));
