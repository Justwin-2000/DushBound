export const VERSION = 2;
export const PLAYER = { hp: 100, stamina: 100, speed: 220, attack: 12, defense: 2, potionHeal: 35, potionCap: 3 };
export const COMBO = [ { damage: 1, cost: 8, duration: .28, impact: .08 }, { damage: 1.1, cost: 9, duration: .3, impact: .1 }, { damage: 1.5, cost: 14, duration: .44, impact: .16 } ];
export const ENEMIES = {
  rat: { name: '雾噬鼠', hp: 28, speed: 160, damage: 8, range: 70, windup: .35, recovery: .6, color: '#827a99' },
  dog: { name: '裂爪犬', hp: 65, speed: 190, damage: 14, range: 88, windup: .6, recovery: .85, color: '#b89a93' },
  archer: { name: '空壳弩手', hp: 42, speed: 92, damage: 12, range: 430, windup: .8, recovery: 1.6, color: '#9cae9b' },
  elite: { name: '裂爪犬 · 蚀化', hp: 98, speed: 190, damage: 14, range: 88, windup: .6, recovery: .85, color: '#bd8297' },
  boss: { name: '失灯守卫', hp: 620, speed: 100, defense: 2, damage: 18, range: 140, windup: .65, recovery: .9, color: '#aba4b4' }
};
export const BOSS_MOVES = {
  sweep: { name: '横扫', damage: 18, windup: .65, radius: 160, blockable: true },
  thrust: { name: '钩刺', damage: 22, windup: .55, radius: 130, blockable: true, dash: 180 },
  slam: { name: '灯笼震击 · 破盾', damage: 20, windup: .9, radius: 185, blockable: false },
  charge: { name: '雾影冲锋', damage: 16, windup: .8, radius: 100, blockable: true, dash: 270 },
  field: { name: '失灯领域 · 破盾', damage: 24, windup: 1, radius: 72, blockable: false },
  summon: { name: '召回', damage: 0, windup: 1, radius: 0, blockable: true }
};
export const ROOMS = [
  { name: '倾倒的路牌', subtitle: '灰风原野 · 旧商道', corruption: 5, waves: [['rat'], ['rat']], reward: { coins: 2 }, hint: '黄色预警可以格挡。攻击时留一点体力，给下一次闪避。', lore: '路牌歪在风里。还能辨认的字是：「王都 67 里」。', theme: 'road' },
  { name: '废弃农舍', subtitle: '灰风原野 · 无人归家', corruption: 10, waves: [['dog']], reward: { iron: 1, potions: 1 }, hint: '裂爪犬压低身体时，向侧方闪避，或迎着攻击格挡。', lore: '桌上仍摆着两只碗。门后的刻痕，一年比一年高。', theme: 'farm' },
  { name: '断桥', subtitle: '灰风原野 · 河谷', corruption: 10, waves: [['archer', 'rat']], reward: { coins: 3 }, hint: '弩箭沿瞄准线射出。完美格挡能把箭送还给弩手。', lore: '桥对岸的脚印走向雾里，再也没有回来。', theme: 'bridge' },
  { name: '旧营火', subtitle: '灰风原野 · 短暂安宁', corruption: 0, waves: [], reward: {}, hint: '营火只能使用一次：恢复生命，或让提灯净化侵蚀。', lore: '士兵日志：「艾琳说，风车的灯昨晚自己亮了。她想等换岗后去看看。」', theme: 'camp' },
  { name: '麦田遗迹', subtitle: '灰风原野 · 空穗', corruption: 15, waves: [['rat', 'dog'], ['rat', 'archer']], reward: { iron: 3 }, hint: '敌人分两波出现。优先处理弩手，别被两边夹住。', lore: '麦穗里没有种子。只有和雾一样轻的灰。', theme: 'wheat' },
  { name: '风车下层', subtitle: '风车哨站 · 记忆裂隙', corruption: 20, waves: [['elite', 'archer']], reward: {}, hint: '蚀化裂爪犬更耐打。清场后，别忘记开启补给箱。', lore: '提灯碎了。你却看见另一只手：洛恩从界灯上取下碎片，鲜血沿着他的指缝滴落。', theme: 'mill' },
  { name: '旧风车顶部', subtitle: '风车哨站 · 最后的守灯人', corruption: 15, waves: [['boss']], reward: {}, hint: '红色破盾招式必须躲开。守卫每次收招后，都有反击机会。', lore: '「不许……取走……灯。」守卫重复着最后一道命令。', theme: 'boss' }
];
export const TOWN = [
  { id: 'ida', x: 300, y: 330, name: '伊妲', role: '旅店老板娘', color: '#b36762', place: '晚灯旅店' },
  { id: 'glen', x: 1710, y: 330, name: '格伦', role: '铁匠', color: '#b8a186', place: '炉火与铁' },
  { id: 'lorn', x: 3310, y: 330, name: '洛恩', role: '哨兵队长', color: '#8dabb2', place: '界灯广场' },
  { id: 'milo', x: 4800, y: 330, name: '米洛', role: '药师学徒', color: '#94af86', place: '药草屋' }
];
export const PLACES = [ { name: '晚灯旅店', x: 300, icon: 'inn' }, { name: '铁匠铺', x: 1710, icon: 'sword' }, { name: '界灯广场', x: 3310, icon: 'lamp' }, { name: '药草屋', x: 4800, icon: 'leaf' }, { name: '东门', x: 6970, icon: 'gate' } ];
export const QUESTS = [
  '', '走出旅店，和伊妲说说话', '到铁匠铺找格伦', '完成格伦的基础训练', '到界灯广场询问洛恩', '从东门进入灰风原野', '穿过原野，抵达旧风车', '击败失灯守卫，夺回核心', '带着核心返回暮边镇', '与洛恩交谈，决定军牌的去向', '余烬已燃 · 可再次远征'
];
export const ENDINGS = {
  honesty: { title: '共同看见的灯火', name: '交出军牌', lines: ['你把艾琳的军牌，放进洛恩摊开的手里。', '洛恩：「是我取走了界灯碎片。那天，我不能再失去一个人。」', '洛恩：「明天，我会把这一切告诉大家。」', '灯火没有抹去失去，却让人们第一次共同看见它。'] },
  silence: { title: '留在灯下的影子', name: '托伊妲保管', lines: ['伊妲用干净的布包起军牌，收进柜台下的木盒。', '伊妲：「有些名字，需要有人替我们多守一夜。」', '洛恩仍站在东门。他望着你，最终没有再问。', '有些灯照亮道路，有些灯只把影子藏得更深。'] }
};
export const DEFAULT_SETTINGS = { master: .7, music: .45, sfx: .7, shake: true, numbers: true, vibration: true, controls: .8, fps: 60, assist: false };
