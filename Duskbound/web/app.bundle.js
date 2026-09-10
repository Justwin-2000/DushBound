(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // web/src/data.js
  var VERSION = 1;
  var PLAYER = { hp: 100, stamina: 100, speed: 220, attack: 12, defense: 2, potionHeal: 35, potionCap: 3 };
  var COMBO = [{ damage: 1, cost: 8, duration: 0.28, impact: 0.08 }, { damage: 1.1, cost: 9, duration: 0.3, impact: 0.1 }, { damage: 1.5, cost: 14, duration: 0.44, impact: 0.16 }];
  var ENEMIES = {
    rat: { name: "雾噬鼠", hp: 28, speed: 160, damage: 8, range: 70, windup: 0.35, recovery: 0.6, color: "#827a99" },
    dog: { name: "裂爪犬", hp: 65, speed: 190, damage: 14, range: 88, windup: 0.6, recovery: 0.85, color: "#b89a93" },
    archer: { name: "空壳弩手", hp: 42, speed: 92, damage: 12, range: 430, windup: 0.8, recovery: 1.6, color: "#9cae9b" },
    elite: { name: "裂爪犬 · 蚀化", hp: 98, speed: 190, damage: 14, range: 88, windup: 0.6, recovery: 0.85, color: "#bd8297" },
    boss: { name: "失灯守卫", hp: 620, speed: 100, defense: 2, damage: 18, range: 140, windup: 0.65, recovery: 0.9, color: "#aba4b4" }
  };
  var BOSS_MOVES = {
    sweep: { name: "横扫", damage: 18, windup: 0.65, radius: 160, blockable: true },
    thrust: { name: "钩刺", damage: 22, windup: 0.55, radius: 130, blockable: true, dash: 180 },
    slam: { name: "灯笼震击 · 破盾", damage: 20, windup: 0.9, radius: 185, blockable: false },
    charge: { name: "雾影冲锋", damage: 16, windup: 0.8, radius: 100, blockable: true, dash: 270 },
    field: { name: "失灯领域 · 破盾", damage: 24, windup: 1, radius: 72, blockable: false },
    summon: { name: "召回", damage: 0, windup: 1, radius: 0, blockable: true }
  };
  var ROOMS = [
    { name: "倾倒的路牌", subtitle: "灰风原野 · 旧商道", corruption: 5, waves: [["rat"], ["rat"]], reward: { coins: 2 }, hint: "黄色预警可以格挡。攻击时留一点体力，给下一次闪避。", lore: "路牌歪在风里。还能辨认的字是：「王都 67 里」。", theme: "road" },
    { name: "废弃农舍", subtitle: "灰风原野 · 无人归家", corruption: 10, waves: [["dog"]], reward: { iron: 1, potions: 1 }, hint: "裂爪犬压低身体时，向侧方闪避，或迎着攻击格挡。", lore: "桌上仍摆着两只碗。门后的刻痕，一年比一年高。", theme: "farm" },
    { name: "断桥", subtitle: "灰风原野 · 河谷", corruption: 10, waves: [["archer", "rat"]], reward: { coins: 3 }, hint: "弩箭沿瞄准线射出。完美格挡能把箭送还给弩手。", lore: "桥对岸的脚印走向雾里，再也没有回来。", theme: "bridge" },
    { name: "旧营火", subtitle: "灰风原野 · 短暂安宁", corruption: 0, waves: [], reward: {}, hint: "营火只能使用一次：恢复生命，或让提灯净化侵蚀。", lore: "士兵日志：「艾琳说，风车的灯昨晚自己亮了。她想等换岗后去看看。」", theme: "camp" },
    { name: "麦田遗迹", subtitle: "灰风原野 · 空穗", corruption: 15, waves: [["rat", "dog"], ["rat", "archer"]], reward: { iron: 3 }, hint: "敌人分两波出现。优先处理弩手，别被两边夹住。", lore: "麦穗里没有种子。只有和雾一样轻的灰。", theme: "wheat" },
    { name: "风车下层", subtitle: "风车哨站 · 记忆裂隙", corruption: 20, waves: [["elite", "archer"]], reward: {}, hint: "蚀化裂爪犬更耐打。清场后，别忘记开启补给箱。", lore: "提灯碎了。你却看见另一只手：洛恩从界灯上取下碎片，鲜血沿着他的指缝滴落。", theme: "mill" },
    { name: "旧风车顶部", subtitle: "风车哨站 · 最后的守灯人", corruption: 15, waves: [["boss"]], reward: {}, hint: "红色破盾招式必须躲开。守卫每次收招后，都有反击机会。", lore: "「不许……取走……灯。」守卫重复着最后一道命令。", theme: "boss" }
  ];
  var TOWN = [
    { id: "ida", x: 300, y: 330, name: "伊妲", role: "旅店老板娘", color: "#b36762", place: "晚灯旅店" },
    { id: "glen", x: 1710, y: 330, name: "格伦", role: "铁匠", color: "#b8a186", place: "炉火与铁" },
    { id: "lorn", x: 3310, y: 330, name: "洛恩", role: "哨兵队长", color: "#8dabb2", place: "界灯广场" },
    { id: "milo", x: 4800, y: 330, name: "米洛", role: "药师学徒", color: "#94af86", place: "药草屋" }
  ];
  var PLACES = [{ name: "晚灯旅店", x: 300, icon: "inn" }, { name: "铁匠铺", x: 1710, icon: "sword" }, { name: "界灯广场", x: 3310, icon: "lamp" }, { name: "药草屋", x: 4800, icon: "leaf" }, { name: "东门", x: 6970, icon: "gate" }];
  var QUESTS = [
    "",
    "走出旅店，和伊妲说说话",
    "到铁匠铺找格伦",
    "完成格伦的基础训练",
    "到界灯广场询问洛恩",
    "从东门进入灰风原野",
    "穿过原野，抵达旧风车",
    "击败失灯守卫，夺回核心",
    "带着核心返回暮边镇",
    "与洛恩交谈，决定军牌的去向",
    "余烬已燃 · 可再次远征"
  ];
  var ENDINGS = {
    honesty: { title: "共同看见的灯火", name: "交出军牌", lines: ["你把艾琳的军牌，放进洛恩摊开的手里。", "洛恩：「是我取走了界灯碎片。那天，我不能再失去一个人。」", "洛恩：「明天，我会把这一切告诉大家。」", "灯火没有抹去失去，却让人们第一次共同看见它。"] },
    silence: { title: "留在灯下的影子", name: "托伊妲保管", lines: ["伊妲用干净的布包起军牌，收进柜台下的木盒。", "伊妲：「有些名字，需要有人替我们多守一夜。」", "洛恩仍站在东门。他望着你，最终没有再问。", "有些灯照亮道路，有些灯只把影子藏得更深。"] }
  };
  var DEFAULT_SETTINGS = { master: 0.7, music: 0.45, sfx: 0.7, shake: true, numbers: true, vibration: true, controls: 0.8, fps: 60, assist: false };

  // web/src/game.js
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function damage(attack, mult = 1, defense = 0, roll = 0.5, critical = false) {
    const n = Math.max(1, Math.floor(attack * mult * (0.95 + roll * 0.1) - defense));
    return critical ? Math.floor(n * 1.5) : n;
  }
  var freshRun = () => ({ room: 0, wave: 0, corruption: 0, startIron: 0, rewarded: [], campUsed: false, chestUsed: false, won: false, clear: false, replay: false, salveUsed: false });
  function newState(settings2 = {}) {
    return {
      saveVersion: 1,
      scene: "town",
      stage: 1,
      playTime: 0,
      ending: null,
      player: { x: 180, y: 350, hp: 100, maxHp: 100, stamina: 100, weapon: 0, potions: 2, facing: 1 },
      inventory: { coins: 0, iron: 0, leaf: 0, salve: 0 },
      flags: { cloak: false, miloGift: false, leafTaken: false, memory: false, log: false, core: false, tag: false },
      tutorial: { active: false, hits: 0, combo: 0, dodges: 0, blocks: 0, parries: 0, attempts: 0 },
      settings: __spreadValues(__spreadValues({}, DEFAULT_SETTINGS), settings2),
      run: freshRun(),
      enemies: [],
      logs: []
    };
  }
  var Game = class {
    constructor(state = newState(), random = Math.random) {
      this.s = structuredClone(state);
      this.random = random;
      this.events = [];
      this.paused = false;
      this.dialog = null;
      this.time = 0;
      this.autoSave = 0;
      this.id = 100;
      this.effects = [];
      this.projectiles = [];
      this.fields = [];
      this.input = { x: 0, y: 0, block: false };
      this.trainingClock = 1.5;
      this.trainingTell = 0;
      this.p = { action: "idle", timer: 0, elapsed: 0, combo: 0, lastCombo: -10, queue: false, hit: [], staminaDelay: 0, invincible: 0, blockAge: 0, dodgeCooldown: 0, dx: 0, dy: 0, hitDone: false };
      this.s.enemies.forEach((e) => {
        this.id = Math.max(this.id, e.id + 1);
        if (!e.move) e.move = "sweep";
        if (!e.history) e.history = [];
        if (e.kind === "boss" && e.state === "windup" && e.move === "field") this.fields = [{ x: e.tx, y: e.ty, r: 72, t: e.timer + 0.1 }, { x: clamp(e.tx - 205, 150, 1390), y: clamp(e.ty + 65, 240, 420), r: 72, t: e.timer + 0.1 }, { x: clamp(e.tx + 205, 150, 1390), y: clamp(e.ty - 65, 240, 420), r: 72, t: e.timer + 0.1 }];
      });
      if (this.s.scene === "dungeon") this.p.invincible = 0.8;
      if (this.s.player.hp <= 0) this.fail();
    }
    get player() {
      return this.s.player;
    }
    get worldWidth() {
      return this.s.scene === "town" ? 7300 : 1520;
    }
    // 小镇的路面在 y=344..426、地平面自 310 起；原先 205 的下限会让角色走到山峦与天空里。
    bounds() {
      return this.s.scene === "town" ? { minY: 325, maxY: 450 } : { minY: 205, maxY: 440 };
    }
    emit(type, data = {}) {
      this.events.push(__spreadValues({ type }, data));
    }
    toast(text) {
      this.emit("toast", { text });
    }
    sound(name) {
      this.emit("sound", { name });
    }
    save() {
      this.emit("save");
    }
    drain() {
      return this.events.splice(0);
    }
    log(speaker, line) {
      this.s.logs.push("".concat(speaker, "：").concat(line));
      this.s.logs = this.s.logs.slice(-30);
    }
    talk(speaker, lines, choices = [{ text: "继续", action: "close" }]) {
      this.dialog = { speaker, lines, choices };
      lines.forEach((l) => this.log(speaker, l));
      this.emit("dialog", { dialog: this.dialog });
    }
    setStage(n) {
      if (this.s.stage < n) {
        this.s.stage = n;
        this.toast(QUESTS[n]);
        this.sound("quest");
        this.save();
      }
    }
    resetMotion() {
      this.input = { x: 0, y: 0, block: false };
      this.p.action = "idle";
      this.p.queue = false;
      this.p.timer = 0;
    }
    pause() {
      this.paused = true;
      this.resetMotion();
      this.save();
    }
    resume() {
      this.paused = false;
    }
    startIntro() {
      this.talk("记忆的碎片", ["我记得风。", "然后，是灯熄灭的声音。", "有人把一盏灯放在你身旁。窗外，是尚未入夜的小镇。"], [{ text: "睁开眼睛", action: "intro" }]);
    }
    choose(action) {
      this.dialog = null;
      this.emit("close-dialog");
      switch (action) {
        case "intro":
          this.toast("拖动左下摇杆移动。靠近人物后，点「交谈」。");
          break;
        case "idaGift":
          this.s.flags.cloak = true;
          this.player.maxHp = 110;
          this.player.hp = 110;
          this.player.potions = Math.max(2, this.player.potions);
          this.setStage(2);
          this.toast("获得旧巡界斗篷 · 生命上限 +10");
          break;
        case "rest":
          this.rest();
          break;
        case "train":
          this.s.tutorial.active = true;
          this.player.x = 1800;
          this.player.y = 350;
          this.player.stamina = 100;
          this.trainingClock = 1.2;
          this.setStage(3);
          this.toast("向右靠近木桩，点击攻击，连续衔接三段。");
          break;
        case "accept":
          this.setStage(5);
          break;
        case "miloGift":
          if (!this.s.flags.miloGift) {
            this.s.flags.miloGift = true;
            this.addPotion(1, true);
            this.save();
          }
          this.emit("menu", { name: "shop" });
          break;
        case "shop":
          this.emit("menu", { name: "shop" });
          break;
        case "forge":
          this.emit("menu", { name: "equipment" });
          break;
        case "enter":
          this.enterDungeon();
          break;
        case "next":
          this.nextRoom();
          break;
        case "healCamp":
          this.useCamp("heal");
          break;
        case "cleanseCamp":
          this.useCamp("cleanse");
          break;
        case "return":
          this.returnTown();
          break;
        case "retreat":
          this.retreat();
          break;
        case "honesty":
        case "silence":
          this.finishEnding(action);
          break;
        case "endingDone":
          this.emit("ending", { ending: this.s.ending });
          break;
      }
      this.save();
    }
    interactables() {
      if (this.s.scene === "town") return [
        ...TOWN.map((n) => __spreadProps(__spreadValues({}, n), { label: "交谈 · ".concat(n.name) })),
        { id: "bed", x: 150, y: 270, label: "休息" },
        { id: "board", x: 470, y: 300, label: "留言板" },
        { id: "lamp", x: 3160, y: 300, label: "查看界灯" },
        { id: "herbs", x: 4650, y: 280, label: "药草架" },
        { id: "gate", x: 7040, y: 340, label: "进入原野" }
      ];
      const r = this.s.run, points = [{ id: "lore", x: 350, y: 270, label: r.room === 5 ? "调查破碎提灯" : r.room === 3 ? "阅读日志" : "调查遗迹" }];
      if (r.room === 3) points.push({ id: "camp", x: 710, y: 330, label: r.campUsed ? "营火已熄" : "使用营火" });
      if (r.room === 5 && r.clear) points.push({ id: "chest", x: 1080, y: 310, label: r.chestUsed ? "空补给箱" : "开启补给箱" });
      if (r.clear) points.push({ id: "exit", x: 1400, y: 350, label: r.room === 6 ? "返回暮边镇" : "前往下一区域" });
      return points;
    }
    nearby() {
      return this.interactables().map((v) => __spreadProps(__spreadValues({}, v), { d: distance(v, this.player) })).filter((v) => v.d < 155).sort((a, b) => a.d - b.d)[0] || null;
    }
    interact() {
      if (this.paused || this.dialog) return;
      const n = this.nearby();
      if (!n) {
        this.toast("靠近人物或发光的交互标记。");
        return;
      }
      this.interactWith(n.id);
    }
    interactWith(id) {
      const s = this.s;
      if (id === "ida") {
        if (!s.flags.cloak) this.talk("伊妲", ["别急着想起一切。先确认自己的脚还听使唤。", "斗篷给你留着了。格伦就在东边的铁匠铺，他会教你怎么握剑。"], [{ text: "披上斗篷", action: "idaGift" }]);
        else this.talk("伊妲", s.ending ? ["灯亮起来以后，客人也多了。你的房间还给你留着。"] : ["从雾里带回来的东西，不一定都该立刻示人。", "累了就回来。这里不用你付房钱。"], [{ text: "休息，恢复生命与药剂", action: "rest" }, { text: "再聊", action: "close" }]);
      } else if (id === "glen") {
        if (!s.flags.cloak) this.talk("格伦", ["先回去见伊妲。你连斗篷都没穿好。"]);
        else if (s.stage < 4) this.talk("格伦", ["剑不是用来挥得好看。看准，再出手。", "先打木桩，接着练闪避。最后，我用木剑陪你练格挡。"], [{ text: s.tutorial.active ? "继续训练" : "开始训练", action: "train" }, { text: "稍后再来", action: "close" }]);
        else this.talk("格伦", ["雾里的东西也会犹豫。那一瞬间就是你的路。", "带来六块灰铁，我替你把剑刃再磨亮些。"], [{ text: "查看装备与强化", action: "forge" }, { text: "离开", action: "close" }]);
      } else if (id === "lorn") {
        if (s.stage < 4) this.talk("洛恩", ["先去格伦那儿。原野不会等你慢慢学会拿剑。"]);
        else if (s.stage === 4) this.talk("洛恩", ["风车哨站还有一枚备用核心。把它带回来，别追别的影子。", "三天前？你受了伤。我把你带回来。现在不是回忆的时候。"], [{ text: "接下「余烬初巡」", action: "accept" }, { text: "再准备一下", action: "close" }]);
        else if (s.stage === 9) this.talk("洛恩", ["你带回来了。界灯终于可以……", "风车里，有没有和艾琳有关的东西？"], [{ text: "把军牌交给洛恩", action: "honesty" }, { text: "先托伊妲保管军牌", action: "silence" }]);
        else this.talk("洛恩", s.ending ? ["今晚的雾退了些。路上小心，巡界者。"] : ["沿着旧商道走。经过营火，再向风车去。"]);
      } else if (id === "milo") {
        if (!s.flags.miloGift) this.talk("米洛", ["你那盏灯……可以借我看看吗？不，先别熄灭它！", "这瓶药送你。原野会慢慢侵蚀提灯，营火能帮你缓一缓。"], [{ text: "收下药剂，查看补给", action: "miloGift" }]);
        else this.talk("米洛", ["药要在伤口变糟以前用。带满三瓶，就别再往包里塞啦。"], [{ text: "购买补给", action: "shop" }, { text: "离开", action: "close" }]);
      } else if (id === "bed") this.talk("晚灯旅店", ["床铺仍有余温。休息会恢复全部生命，并补至两瓶药剂。"], [{ text: "休息片刻", action: "rest" }, { text: "先不休息", action: "close" }]);
      else if (id === "board") this.emit("menu", { name: "journal" });
      else if (id === "lamp") this.talk("旧界灯", [s.ending ? "火焰向上舒展开来。你终于听见，广场另一边有人在笑。" : "灯火很弱。灯座上，有一道新近留下的划痕。"]);
      else if (id === "herbs") {
        if (!s.flags.leafTaken) {
          s.flags.leafTaken = true;
          s.inventory.leaf = clamp(s.inventory.leaf + 1, 0, 999);
          this.toast("获得苦叶 ×1 · 可在药草屋制成苦叶膏");
          this.save();
        } else this.toast("药草架上只剩晾晒中的叶片。");
      } else if (id === "gate") {
        if (s.stage < 5) this.talk("东门", ["先完成格伦的训练，再去界灯广场见洛恩。"]);
        else this.talk("灰风原野", ["远征中会自动保存。若倒下，界灯会带你回到旅店。", "携带 " + this.player.potions + " 瓶药剂 · 长剑攻击 " + (this.player.weapon ? 15 : 12)], [{ text: s.ending ? "再次远征" : "踏入灰风原野", action: "enter" }, { text: "继续准备", action: "close" }]);
      } else if (id === "lore") {
        const r = s.run.room;
        if (r === 3) s.flags.log = true;
        if (r === 5) s.flags.memory = true;
        this.talk(r === 5 ? "记忆的裂隙" : "巡界手记", [ROOMS[r].lore]);
        this.save();
      } else if (id === "camp") {
        if (s.run.campUsed) this.toast("余温还在，但已经不能再为提灯添火。");
        else this.talk("旧营火", ["火还没有熄。你可以让身体暖起来，或为提灯净去灰雾。"], [{ text: "休憩 · 恢复 40 生命", action: "healCamp" }, { text: "净化 · 侵蚀降低 15", action: "cleanseCamp" }]);
      } else if (id === "chest") {
        if (s.run.chestUsed) this.toast("补给箱已经空了。");
        else {
          s.run.chestUsed = true;
          this.addPotion(1, true);
          s.inventory.iron = clamp(s.inventory.iron + 2, 0, 999);
          this.toast("补给箱 · 灰铁 +2");
          this.save();
        }
      } else if (id === "exit") {
        if (s.run.room === 6) this.returnTown();
        else this.nextRoom();
      }
    }
    rest() {
      this.player.hp = this.player.maxHp;
      this.player.potions = Math.max(2, this.player.potions);
      this.player.stamina = 100;
      this.sound("heal");
      this.toast("休息完毕 · 生命恢复，药剂已补给");
      this.save();
    }
    addPotion(n, convert = false) {
      const added = Math.min(3 - this.player.potions, n), extra = n - added;
      this.player.potions += added;
      if (extra && convert) {
        this.s.inventory.coins = clamp(this.s.inventory.coins + extra * 8, 0, 999);
        this.toast("药剂已满 · 多余药剂转为 " + extra * 8 + " 旧币");
      } else if (added) this.toast("恢复药剂 +" + added);
    }
    buy(item2) {
      const s = this.s;
      if (s.scene !== "town") return false;
      if (item2 === "potion") {
        if (this.player.potions >= 3) {
          this.toast("最多携带 3 瓶药剂");
          return false;
        }
        if (s.inventory.coins < 8) {
          this.toast("旧币不足");
          return false;
        }
        s.inventory.coins -= 8;
        this.player.potions++;
      } else if (item2 === "salve") {
        if (s.inventory.salve) {
          this.toast("已有一份苦叶膏");
          return false;
        }
        if (s.inventory.coins < 5) {
          this.toast("旧币不足");
          return false;
        }
        s.inventory.coins -= 5;
        s.inventory.salve = 1;
      } else if (item2 === "craft") {
        if (!s.inventory.leaf || s.inventory.salve) {
          this.toast("需要苦叶，且只能携带一份苦叶膏");
          return false;
        }
        s.inventory.leaf--;
        s.inventory.salve = 1;
      } else return false;
      this.sound("item");
      this.toast(item2 === "potion" ? "药剂已放入行囊" : "苦叶膏已放入行囊");
      this.save();
      return true;
    }
    upgrade() {
      if (this.s.scene !== "town" || this.player.weapon || this.s.inventory.iron < 6) {
        this.toast(this.player.weapon ? "长剑已完成强化" : "强化需要 6 块灰铁");
        return false;
      }
      this.s.inventory.iron -= 6;
      this.player.weapon = 1;
      this.sound("quest");
      this.toast("长剑强化完成 · 攻击 12 → 15");
      this.save();
      return true;
    }
    useSalve() {
      if (!this.s.inventory.salve) {
        this.toast("没有苦叶膏");
        return false;
      }
      if (this.s.run.salveUsed) {
        this.toast("苦叶膏已涂抹，会在下一次侵蚀增长时生效");
        return false;
      }
      this.s.inventory.salve--;
      this.s.run.salveUsed = true;
      this.toast("提灯已涂抹苦叶膏 · 下次侵蚀增长 −10");
      this.save();
      return true;
    }
    useCamp(kind) {
      if (this.s.scene !== "dungeon" || this.s.run.room !== 3 || this.s.run.campUsed) return false;
      this.s.run.campUsed = true;
      if (kind === "heal") {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
        this.toast("营火休憩 · 生命 +40");
      } else {
        this.s.run.corruption = Math.max(0, this.s.run.corruption - 15);
        this.toast("提灯净化 · 侵蚀 −15");
      }
      this.sound("heal");
      this.save();
      return true;
    }
    enterDungeon() {
      if (this.s.stage < 5 || this.s.scene !== "town") return false;
      const salve = this.s.run.salveUsed;
      this.s.run = freshRun();
      this.s.run.startIron = this.s.inventory.iron;
      this.s.run.replay = !!this.s.ending;
      this.s.run.salveUsed = salve;
      this.s.scene = "dungeon";
      this.s.tutorial.active = false;
      this.setStage(6);
      this.loadRoom(0);
      return true;
    }
    spawn(kind, x = 880, y = 320, hp = null) {
      const cfg = ENEMIES[kind];
      const e = { id: this.id++, kind, x, y, hp: hp != null ? hp : cfg.hp, maxHp: hp != null ? hp : cfg.hp, state: "chase", timer: 0, facing: -1, move: "sweep", history: [], phase: 1, transitioned: false, summoned: false, parries: 0, attackCount: 0, tx: 0, ty: 0, flash: 0, chargeStep: 0 };
      this.s.enemies.push(e);
      return e;
    }
    loadRoom(i) {
      const r = this.s.run, cfg = ROOMS[i];
      r.room = i;
      r.wave = 0;
      r.clear = cfg.waves.length === 0;
      r.won = false;
      r.corruption = clamp(r.corruption + Math.max(0, cfg.corruption - (r.salveUsed ? 10 : 0)), 0, 100);
      if (cfg.corruption && r.salveUsed) r.salveUsed = false;
      this.s.enemies = [];
      this.projectiles = [];
      this.fields = [];
      this.effects = [];
      this.resetMotion();
      this.player.x = 160;
      this.player.y = 350;
      this.player.stamina = 100;
      this.p.invincible = 1;
      this.spawnWave();
      if (i === 6) this.setStage(7);
      this.toast(cfg.name + " · " + cfg.hint);
      this.emit("region", { name: cfg.name, subtitle: cfg.subtitle });
      this.save();
    }
    spawnWave() {
      const r = this.s.run, w = ROOMS[r.room].waves[r.wave] || [];
      w.forEach((kind, i) => this.spawn(kind, 880 + i * 240, 300 + i * 80));
    }
    nextRoom() {
      if (this.s.scene !== "dungeon" || !this.s.run.clear || this.s.run.room >= 6) return false;
      this.loadRoom(this.s.run.room + 1);
      return true;
    }
    clearRoom() {
      const r = this.s.run;
      if (r.clear) return;
      const cfg = ROOMS[r.room];
      if (r.wave + 1 < cfg.waves.length) {
        r.wave++;
        this.spawnWave();
        this.toast("下一波敌人出现");
        return;
      }
      r.clear = true;
      this.sound("quest");
      if (!r.rewarded.includes(r.room)) {
        r.rewarded.push(r.room);
        for (const [k, n] of Object.entries(cfg.reward)) {
          if (k === "potions") this.addPotion(n, true);
          else this.s.inventory[k] = clamp(this.s.inventory[k] + n, 0, 999);
        }
        if (Object.keys(cfg.reward).length) this.toast("区域肃清 · " + Object.entries(cfg.reward).map(([k, n]) => ({ coins: "旧币", iron: "灰铁", potions: "药剂" })[k] + " +" + n).join(" / "));
      }
      this.toast("道路已开启 → 靠近右侧出口继续");
      this.save();
    }
    bossVictory() {
      if (this.s.run.won) return;
      this.s.run.won = true;
      this.s.run.clear = true;
      this.s.enemies = [];
      this.projectiles = [];
      this.fields = [];
      this.resetMotion();
      if (!this.s.flags.core && !this.s.ending) {
        this.s.flags.core = true;
        this.s.flags.tag = true;
        this.s.inventory.coins = clamp(this.s.inventory.coins + 20, 0, 999);
        this.setStage(8);
        this.talk("失灯守卫", ["换岗的人……终于来了。", "守卫跪下，将灯笼轻轻放在地上。灰雾散去，留下黯淡核心与艾琳的军牌。", "获得：黯淡核心、艾琳军牌、20 枚旧币。"], [{ text: "带他们回家", action: "return" }]);
      } else {
        this.s.inventory.coins = clamp(this.s.inventory.coins + 5, 0, 999);
        this.s.inventory.iron = clamp(this.s.inventory.iron + 4, 0, 999);
        this.talk("余烬再燃", ["守卫的残影随风散去。你的灯仍然亮着。", "重复远征奖励：5 枚旧币、4 块灰铁。"], [{ text: "返回暮边镇", action: "return" }]);
      }
      this.sound("victory");
      this.save();
    }
    returnTown() {
      if (this.s.scene !== "dungeon") return;
      this.s.scene = "town";
      this.s.enemies = [];
      this.projectiles = [];
      this.fields = [];
      this.player.x = 3420;
      this.player.y = 350;
      this.resetMotion();
      this.player.stamina = 100;
      if (this.s.stage === 8) this.setStage(9);
      this.toast("暮边镇 · 界灯在等你");
      this.emit("region", { name: "暮边镇", subtitle: "灯火仍在，归人有处" });
      this.save();
    }
    retreat() {
      if (this.s.scene !== "dungeon") return;
      this.returnTown();
      this.player.x = 6800;
      this.toast("安全撤回 · 本次物资全部保留，下次从原野入口出发");
      this.save();
    }
    fail() {
      const s = this.s, earned = Math.max(0, s.inventory.iron - s.run.startIron), lost = Math.ceil(earned / 2);
      if (s.scene === "dungeon") s.inventory.iron -= lost;
      s.scene = "town";
      s.enemies = [];
      this.projectiles = [];
      this.fields = [];
      this.player.x = 240;
      this.player.y = 350;
      this.player.hp = this.player.maxHp;
      this.player.potions = Math.max(2, this.player.potions);
      this.player.stamina = 100;
      this.resetMotion();
      if (s.stage === 8) this.setStage(9);
      this.talk("伊妲", ["界灯将你从雾中唤回。", "你回来了。这就够了。剩下的，我们明天再算。", "本次灰铁损失 ".concat(lost, " 块。旧币、原有材料与任务物品全部保留。")]);
      this.sound("death");
      this.save();
    }
    finishEnding(kind) {
      if (this.s.stage !== 9 || this.s.ending || !ENDINGS[kind]) return false;
      this.s.ending = kind;
      this.s.stage = 10;
      this.s.flags.tag = false;
      this.s.flags.core = false;
      this.talk(kind === "honesty" ? "洛恩" : "伊妲", ENDINGS[kind].lines, [{ text: "灯火长明", action: "endingDone" }]);
      this.sound("victory");
      this.save();
      return true;
    }
    travel(x) {
      if (this.s.scene !== "town" || this.s.tutorial.active) return false;
      this.player.x = clamp(x, 100, 7150);
      this.player.y = 360;
      this.resetMotion();
      this.save();
      return true;
    }
    canAct() {
      return !this.paused && !this.dialog && this.player.hp > 0;
    }
    spend(n) {
      if (this.player.stamina < n) {
        this.toast("体力不足，稍作喘息");
        return false;
      }
      this.player.stamina -= n;
      this.p.staminaDelay = 0.6;
      return true;
    }
    attack() {
      if (!this.canAct()) return false;
      if (this.p.action === "attack") {
        this.p.queue = true;
        return true;
      }
      if (!["idle", "block"].includes(this.p.action)) return false;
      const combo = this.time - this.p.lastCombo <= 0.35 ? (this.p.combo + 1) % 3 : 0, cfg = COMBO[combo];
      if (!this.spend(cfg.cost)) return false;
      this.p.action = "attack";
      this.p.combo = combo;
      this.p.timer = cfg.duration;
      this.p.elapsed = 0;
      this.p.hit = [];
      this.p.hitDone = false;
      this.p.queue = false;
      if (Math.hypot(this.input.x, this.input.y) < 0.15) {
        const near = this.s.enemies.filter((e) => distance(e, this.player) < 160).sort((a, b) => distance(a, this.player) - distance(b, this.player))[0];
        if (near) this.player.facing = near.x >= this.player.x ? 1 : -1;
      }
      this.sound("swing" + combo);
      return true;
    }
    dodge() {
      if (!this.canAct() || this.p.dodgeCooldown > 0) return false;
      const a = this.p.action;
      if (!["idle", "block", "attack", "potion"].includes(a) || a === "attack" && this.p.elapsed < COMBO[this.p.combo].impact) return false;
      if (!this.spend(24)) return false;
      let { x, y } = this.input, n = Math.hypot(x, y);
      if (n < 0.1) {
        x = -this.player.facing;
        y = 0;
        n = 1;
      }
      this.p.dx = x / n;
      this.p.dy = y / n;
      this.p.action = "dodge";
      this.p.elapsed = 0;
      this.p.timer = 0.42;
      this.p.dodgeCooldown = 0.67;
      this.p.invincible = Math.max(0.22, this.p.invincible);
      this.p.queue = false;
      if (this.s.tutorial.active) {
        this.s.tutorial.dodges++;
        this.checkTutorial();
      }
      this.sound("dodge");
      return true;
    }
    block(down) {
      this.input.block = down;
      if (!down) {
        if (this.p.action === "block") this.p.action = "idle";
        return;
      }
      const recovering = this.p.action === "attack" && this.p.elapsed >= COMBO[this.p.combo].impact;
      if (!this.canAct() || !recovering && !["idle", "block"].includes(this.p.action) || this.player.stamina <= 0) return;
      if (this.p.action !== "block") {
        this.p.action = "block";
        this.p.blockAge = 0;
      }
    }
    potion() {
      if (!this.canAct() || !["idle", "block"].includes(this.p.action)) return false;
      if (this.player.potions <= 0) {
        this.toast("药剂用完了");
        return false;
      }
      if (this.player.hp >= this.player.maxHp) {
        this.toast("生命已满，无需使用药剂");
        return false;
      }
      this.p.action = "potion";
      this.p.timer = 0.4;
      this.p.elapsed = 0;
      this.p.queue = false;
      return true;
    }
    hitPlayer(raw, blockable = true, source = null, projectile = false, training = false) {
      if (!training && (this.p.invincible > 0 || this.player.hp <= 0 || this.s.run.won)) return "immune";
      if (this.p.action === "block" && blockable) {
        const window2 = training && this.s.tutorial.attempts >= 3 ? 0.32 : 0.18;
        if (this.p.blockAge <= window2) {
          this.p.invincible = Math.max(this.p.invincible, 0.18);
          this.sound("parry");
          this.emit("flash", { color: "gold" });
          this.float(this.player, "完美格挡", "#f8dea0");
          if (training) {
            this.s.tutorial.parries++;
            this.checkTutorial();
          } else if (source) {
            if (projectile) this.hitEnemy(source, 24, true);
            else if (source.kind === "boss") {
              source.parries++;
              if (source.parries >= 2) {
                source.state = "stunned";
                source.timer = 2;
                source.parries = 0;
                this.float(source, "架势崩解", "#f8dea0");
              }
            } else {
              source.state = "stunned";
              source.timer = 1.2;
            }
          }
          return "parry";
        }
        if ((source == null ? void 0 : source.kind) === "boss") source.parries = 0;
        const cost = raw * 1.5;
        if (this.player.stamina >= cost) {
          this.player.stamina -= cost;
          this.p.staminaDelay = 0.6;
          this.sound("block");
          if (training) {
            this.s.tutorial.blocks++;
            this.checkTutorial();
            return "block";
          }
          raw *= 0.3;
        } else {
          this.player.stamina = 0;
          this.p.action = "stunned";
          this.p.timer = 1;
          this.input.block = false;
          this.float(this.player, "破防", "#ed9693");
        }
      }
      if ((source == null ? void 0 : source.kind) === "boss") source.parries = 0;
      if (training) {
        this.s.tutorial.attempts++;
        this.float(this.player, "木剑轻触", "#c5cbc5");
        return "practice";
      }
      if (this.s.settings.assist) raw *= 0.7;
      if (this.s.run.corruption >= 100) raw *= 1.2;
      const dealt = Math.max(1, Math.floor(raw - PLAYER.defense));
      this.player.hp = Math.max(0, this.player.hp - dealt);
      this.p.invincible = 0.5;
      if (this.p.action !== "stunned") {
        this.p.action = "hurt";
        this.p.timer = raw >= 20 ? 0.8 : 0.25;
        if (raw >= 20) this.p.invincible = 0.8;
      }
      this.p.queue = false;
      this.sound("hurt");
      this.emit("shake", { strength: 7 });
      this.emit("vibrate", { duration: 35 });
      this.float(this.player, "−" + dealt, "#f29d96");
      if (source) {
        const bounds = this.bounds(), dx = this.player.x - source.x, dy = this.player.y - source.y, d = Math.hypot(dx, dy) || 1;
        this.player.x = clamp(this.player.x + dx / d * 22, 45, this.worldWidth - 45);
        this.player.y = clamp(this.player.y + dy / d * 16, bounds.minY, bounds.maxY);
      }
      if (this.player.hp <= 0) this.fail();
      return "hit";
    }
    float(at, text, color) {
      this.effects.push({ type: "text", x: at.x, y: at.y - 60, text, color, t: 1.1 });
    }
    hitEnemy(e, n, reflect = false) {
      if (e.hp <= 0 || e.state === "transition") return;
      e.hp = Math.max(0, e.hp - n);
      e.flash = 0.1;
      this.float(e, String(n), reflect ? "#ffe3a1" : "#f7eee0");
      this.sound("hit");
      this.effects.push({ type: "spark", x: e.x, y: e.y - 27, t: 0.24, color: "#ffdab1" });
      if (e.kind === "boss" && e.hp <= 310 && !e.transitioned && e.hp > 0) {
        e.transitioned = true;
        e.phase = 2;
        e.state = "transition";
        e.timer = 2;
        e.chargeStep = 0;
        this.fields = [];
        this.projectiles = [];
        this.s.run.corruption = clamp(this.s.run.corruption + 20, 0, 100);
        this.toast("界灯熄灭 · 失灯守卫进入第二阶段");
        this.sound("boss");
        this.save();
      }
      if (e.hp <= 0) {
        this.effects.push({ type: "death", x: e.x, y: e.y, t: 0.6, color: ENEMIES[e.kind].color });
        if (e.kind === "boss") this.bossVictory();
        else this.sound("enemyDeath");
      }
    }
    attackImpact() {
      const p = this.player, cfg = COMBO[this.p.combo];
      for (const e of [...this.s.enemies]) {
        if (e.hp <= 0 || this.p.hit.includes(e.id)) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        if (dx * p.facing >= -25 && dx * p.facing < 115 + (e.kind === "boss" ? 25 : 0) && Math.abs(dy) < 76) {
          this.p.hit.push(e.id);
          this.hitEnemy(e, damage(p.weapon ? 15 : 12, cfg.damage, ENEMIES[e.kind].defense || 0, this.random(), this.random() < 0.05));
        }
      }
      if (this.s.scene === "town" && Math.abs(p.x - 1870) < 125 && Math.abs(p.y - 340) < 80 && p.facing * (1870 - p.x) > -25) {
        this.float({ x: 1870, y: 330 }, String(damage(p.weapon ? 15 : 12, cfg.damage, 0, this.random())), "#f0d69d");
        this.sound("hit");
        if (this.s.tutorial.active) {
          this.s.tutorial.hits++;
          if (this.p.combo === 2) this.s.tutorial.combo++;
          this.checkTutorial();
        }
      }
    }
    tutorialHint() {
      const t = this.s.tutorial;
      if (t.hits < 3 || t.combo < 1) return "练剑 · 命中 ".concat(Math.min(t.hits, 3), "/3 · 三段连击 ").concat(Math.min(t.combo, 1), "/1");
      if (t.dodges < 2) return "闪避 · ".concat(t.dodges, "/2 · 点击「闪避」，留意体力");
      if (t.blocks < 1) return "普通格挡 · 木剑举起时开始按住「格挡」";
      if (t.parries < 1) return "完美格挡 · 在木剑即将落下时按住「格挡」";
      return "";
    }
    checkTutorial() {
      const t = this.s.tutorial;
      t.hits = Math.min(t.hits, 9999);
      t.combo = Math.min(t.combo, 9999);
      t.dodges = Math.min(t.dodges, 9999);
      t.blocks = Math.min(t.blocks, 9999);
      t.parries = Math.min(t.parries, 9999);
      t.attempts = Math.min(t.attempts, 9999);
      if (t.hits >= 3 && t.combo >= 1 && t.dodges >= 2 && t.blocks >= 1 && t.parries >= 1) {
        t.active = false;
        this.player.stamina = 100;
        this.player.hp = this.player.maxHp;
        this.setStage(4);
        this.talk("格伦", ["雾里的东西也会犹豫。那一瞬间就是你的路。", "你准备好了。去广场找洛恩吧。"]);
      }
      this.save();
    }
    pickBossMove(e) {
      const pool = e.phase === 1 ? ["sweep", "thrust", "slam"] : ["sweep", "thrust", "slam", "charge", "field"];
      if (e.phase === 2 && !e.summoned) pool.push("summon");
      const last = e.history.at(-1), twice = e.history.at(-2) === last;
      const eligible = pool.filter((m2) => !(twice && m2 === last) && !(["charge", "field"].includes(last) && ["charge", "field"].includes(m2)));
      const m = eligible[Math.floor(this.random() * eligible.length) % eligible.length];
      e.history.push(m);
      e.history = e.history.slice(-3);
      return m;
    }
    prepareEnemy(e) {
      const cfg = ENEMIES[e.kind];
      e.state = "windup";
      e.tx = this.player.x;
      e.ty = this.player.y;
      e.facing = e.tx >= e.x ? 1 : -1;
      if (e.kind === "boss") {
        e.move = this.pickBossMove(e);
        e.timer = BOSS_MOVES[e.move].windup;
        if (e.move === "field") this.fields = [{ x: e.tx, y: e.ty, r: 72, t: e.timer + 0.1 }, { x: clamp(e.tx - 205, 150, 1390), y: clamp(e.ty + 65, 240, 420), r: 72, t: e.timer + 0.1 }, { x: clamp(e.tx + 205, 150, 1390), y: clamp(e.ty - 65, 240, 420), r: 72, t: e.timer + 0.1 }];
        this.sound("warning");
      } else {
        e.move = (e.kind === "dog" || e.kind === "elite") && e.attackCount % 2 === 1 ? "charge" : "strike";
        e.timer = cfg.windup;
      }
    }
    executeEnemy(e) {
      const p = this.player, cfg = ENEMIES[e.kind];
      if (e.kind === "archer") {
        let dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy) || 1;
        this.projectiles.push({ x: e.x, y: e.y, vx: dx / d * 410, vy: dy / d * 410, t: 3, source: e.id });
        this.sound("arrow");
      } else if (e.kind === "boss") {
        const m = BOSS_MOVES[e.move];
        if (e.move === "summon") {
          if (!e.summoned) {
            e.summoned = true;
            this.spawn("rat", clamp(e.x - 230, 120, 1350), 260, 16);
            this.spawn("rat", clamp(e.x + 230, 120, 1350), 410, 16);
          }
        } else if (e.move === "field") {
          for (const f of this.fields) {
            if (distance(p, f) <= f.r) this.hitPlayer(m.damage, false, e);
          }
          this.fields = [];
          this.emit("shake", { strength: 5 });
        } else {
          if (m.dash) this.enemyDash(e, m.dash, m.damage, m.blockable);
          else if (distance(e, p) < m.radius) this.hitPlayer(m.damage, m.blockable, e);
          this.effects.push({ type: "ring", x: e.x, y: e.y, r: m.radius, t: 0.3, color: m.blockable ? "#f2cd78" : "#d37c98" });
        }
        if (e.state === "stunned" || e.state === "transition") {
          e.chargeStep = 0;
          return;
        }
        if (e.move === "charge" && e.chargeStep === 0) {
          e.chargeStep = 1;
          e.tx = p.x;
          e.ty = p.y;
          e.state = "windup";
          e.timer = 0.65;
          return;
        }
        e.chargeStep = 0;
      } else if (e.move === "charge") this.enemyDash(e, 240, 20, true);
      else if (distance(e, p) < cfg.range + 30) this.hitPlayer(cfg.damage, true, e);
      if (e.state === "stunned" || e.state === "transition") return;
      e.state = "recover";
      e.timer = cfg.recovery || 0.85;
      e.attackCount++;
    }
    enemyDash(e, length, n, blockable) {
      const ox = e.x, oy = e.y, dx = e.tx - ox, dy = e.ty - oy, d = Math.hypot(dx, dy) || 1;
      e.x = clamp(ox + dx / d * Math.min(length, d + 40), 60, 1460);
      e.y = clamp(oy + dy / d * Math.min(length, d + 40), 205, 440);
      const vx = e.x - ox, vy = e.y - oy, den = vx * vx + vy * vy, u = clamp(((this.player.x - ox) * vx + (this.player.y - oy) * vy) / (den || 1), 0, 1);
      if (Math.hypot(this.player.x - (ox + u * vx), this.player.y - (oy + u * vy)) < 50) this.hitPlayer(n, blockable, e);
      this.effects.push({ type: "dash", x: ox, y: oy, x2: e.x, y2: e.y, t: 0.24, color: "#d7bec6" });
    }
    updateEnemy(e, dt) {
      if (e.hp <= 0) return;
      const cfg = ENEMIES[e.kind];
      e.flash = Math.max(0, e.flash - dt);
      if (e.state !== "chase") {
        e.timer = Math.max(0, e.timer - dt);
        if (e.timer <= 0) {
          if (e.state === "windup") this.executeEnemy(e);
          else {
            e.state = "chase";
            e.timer = 0;
          }
        }
        return;
      }
      const dx = this.player.x - e.x, dy = this.player.y - e.y, d = Math.hypot(dx, dy) || 1;
      e.facing = dx > 0 ? 1 : -1;
      const range2 = e.kind === "boss" ? 220 : e.kind === "archer" ? 450 : e.move === "charge" ? 240 : cfg.range;
      if (e.kind === "archer" && d < 240) {
        e.x = clamp(e.x - dx / d * cfg.speed * dt, 70, 1450);
        e.y = clamp(e.y - dy / d * cfg.speed * dt, 205, 440);
      }
      if (d <= range2) {
        this.prepareEnemy(e);
        return;
      }
      if (d < 1400) {
        e.x = clamp(e.x + dx / d * cfg.speed * dt, 70, 1450);
        e.y = clamp(e.y + dy / d * cfg.speed * dt, 205, 440);
      }
    }
    update(dt) {
      if (this.paused || this.dialog) return;
      dt = clamp(dt, 0, 0.05);
      this.time += dt;
      this.s.playTime += dt;
      this.autoSave += dt;
      const p = this.player, a = this.p;
      a.invincible = Math.max(0, a.invincible - dt);
      a.dodgeCooldown = Math.max(0, a.dodgeCooldown - dt);
      a.staminaDelay = Math.max(0, a.staminaDelay - dt);
      if (a.action === "block") {
        a.blockAge += dt;
        p.stamina = Math.max(0, p.stamina - 12 * dt);
        a.staminaDelay = 0.6;
        if (p.stamina <= 0) {
          a.action = "stunned";
          a.timer = 1;
          this.input.block = false;
          this.float(p, "体力耗尽", "#ecaca1");
        }
      }
      if (a.staminaDelay <= 0 && a.action !== "block") p.stamina = Math.min(100, p.stamina + 35 * dt);
      if (["attack", "dodge", "hurt", "stunned", "potion"].includes(a.action)) {
        a.timer -= dt;
        a.elapsed += dt;
        if (a.action === "attack" && !a.hitDone && a.elapsed >= COMBO[a.combo].impact) {
          a.hitDone = true;
          this.attackImpact();
        }
        if (a.action === "dodge") {
          p.x += a.dx * 490 * dt;
          p.y += a.dy * 310 * dt;
        }
        if (a.timer <= 0) {
          const old = a.action, queued = a.queue;
          a.action = "idle";
          a.queue = false;
          if (old === "attack") {
            a.lastCombo = this.time;
            if (queued) this.attack();
          }
          if (old === "potion" && p.potions > 0) {
            p.potions--;
            p.hp = Math.min(p.maxHp, p.hp + 35);
            this.sound("heal");
            this.float(p, "+35", "#a9d7b3");
            this.save();
          }
        }
      }
      if (a.action === "idle" && this.input.block) this.block(true);
      const recovering = a.action === "attack" && a.elapsed >= COMBO[a.combo].impact;
      if (["idle", "block", "potion"].includes(a.action) || recovering) {
        let { x, y } = this.input, d = Math.hypot(x, y);
        if (d > 1) {
          x /= d;
          y /= d;
        }
        if (Math.abs(x) > 0.05 && !recovering) p.facing = x > 0 ? 1 : -1;
        const mobility = a.action === "block" ? 0.35 : a.action === "potion" ? 0.45 : recovering ? 0.5 : 1;
        const speed = mobility * PLAYER.speed;
        p.x += x * speed * dt;
        p.y += y * speed * 0.75 * dt;
      }
      const bounds = this.bounds();
      p.x = clamp(p.x, 45, this.worldWidth - 45);
      p.y = clamp(p.y, bounds.minY, bounds.maxY);
      if (this.s.scene === "dungeon") {
        for (const e of [...this.s.enemies]) {
          this.updateEnemy(e, dt);
          if (this.dialog || this.s.scene !== "dungeon") break;
        }
        if (this.s.scene === "dungeon" && !this.dialog) {
          for (const b of this.projectiles) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.t -= dt;
            if (distance(b, p) < 26) {
              const source = this.s.enemies.find((e) => e.id === b.source);
              this.hitPlayer(12, true, source, true);
              b.t = 0;
            }
          }
          this.projectiles = this.projectiles.filter((b) => b.t > 0 && b.x > 0 && b.x < 1520 && b.y > 150 && b.y < 490);
          this.s.enemies = this.s.enemies.filter((e) => e.hp > 0);
          if (!this.s.enemies.length && !this.s.run.clear) this.clearRoom();
          for (const e of this.s.enemies) {
            if (e.state === "windup" || a.action === "dodge") continue;
            const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy), min = e.kind === "boss" ? 45 : 30;
            if (d < min) {
              const nx = d > 0 ? dx / d : p.facing, ny = d > 0 ? dy / d : 0;
              p.x = clamp(p.x + nx * (min - d) * 0.5, 45, this.worldWidth - 45);
              p.y = clamp(p.y + ny * (min - d) * 0.5, bounds.minY, bounds.maxY);
            }
          }
        }
      } else if (this.s.tutorial.active) {
        const t = this.s.tutorial;
        if (t.hits >= 3 && t.combo >= 1 && t.dodges >= 2) {
          this.trainingClock -= dt;
          if (this.trainingClock <= 1.2 && this.trainingClock > 0) this.trainingTell = this.trainingClock;
          else this.trainingTell = 0;
          if (this.trainingClock <= 0) {
            this.trainingClock = 2.6;
            if (Math.abs(p.x - 1840) < 230) {
              this.hitPlayer(8, true, null, false, true);
            } else this.toast("回到木桩旁边，格伦正在等你练格挡。");
          }
        }
      }
      this.effects.forEach((e) => e.t -= dt);
      this.effects = this.effects.filter((e) => e.t > 0).slice(-70);
      this.fields.forEach((f) => f.t = Math.max(0, f.t - dt));
      if (this.autoSave > 4) {
        this.autoSave = 0;
        this.save();
      }
    }
  };

  // web/src/store.js
  var KEY = "duskbound.save.v1";
  var num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
  function validateSave(s) {
    if (!s || s.saveVersion !== VERSION || !["town", "dungeon"].includes(s.scene) || !Number.isInteger(s.stage) || !num(s.stage, 1, 10)) return false;
    const p = s.player, inv = s.inventory, r = s.run, t = s.tutorial;
    if (!p || ![100, 110].includes(p.maxHp) || !num(p.hp, 0, p.maxHp) || !num(p.stamina, 0, 100) || !num(p.x, 0, 7300) || !num(p.y, 170, 460) || ![-1, 1].includes(p.facing) || ![0, 1].includes(p.weapon) || !Number.isInteger(p.potions) || !num(p.potions, 0, 3)) return false;
    if (!inv || !["coins", "iron", "leaf", "salve"].every((k) => Number.isInteger(inv[k]) && num(inv[k], 0, k === "salve" ? 1 : 999))) return false;
    if (!s.flags || !["cloak", "miloGift", "leafTaken", "memory", "log", "core", "tag"].every((k) => typeof s.flags[k] === "boolean") || ![null, "honesty", "silence"].includes(s.ending)) return false;
    if (s.stage === 10 !== Boolean(s.ending) || s.stage >= 8 && s.stage < 10 && (!s.flags.core || !s.flags.tag)) return false;
    if (!t || !["hits", "combo", "dodges", "blocks", "parries", "attempts"].every((k) => Number.isInteger(t[k]) && num(t[k], 0, 9999)) || typeof t.active !== "boolean") return false;
    if (!r || !Number.isInteger(r.room) || !num(r.room, 0, 6) || !Number.isInteger(r.wave) || !num(r.wave, 0, 2) || !num(r.corruption, 0, 100) || !num(r.startIron, 0, 999) || !Array.isArray(r.rewarded) || !r.rewarded.every((v) => Number.isInteger(v) && num(v, 0, 6)) || !["campUsed", "chestUsed", "won", "clear", "replay", "salveUsed"].every((k) => typeof r[k] === "boolean")) return false;
    if (!Array.isArray(s.enemies) || s.enemies.length > 5 || s.enemies.some((e) => !ENEMIES[e.kind] || !num(e.hp, 0, ENEMIES[e.kind].hp) || !num(e.maxHp, 1, ENEMIES[e.kind].hp) || e.hp > e.maxHp || !num(e.x, 0, 1600) || !num(e.y, 170, 460) || !Number.isInteger(e.id) || !num(e.id, 0, 1e9) || !["chase", "windup", "recover", "stunned", "transition"].includes(e.state) || !num(e.timer, 0, 10) || ![1, -1].includes(e.facing) || ![1, 2].includes(e.phase) || !["transitioned", "summoned"].every((k) => typeof e[k] === "boolean") || !["parries", "attackCount"].every((k) => Number.isInteger(e[k]) && num(e[k], 0, 1e9)) || ![0, 1].includes(e.chargeStep) || !num(e.tx, 0, 1600) || !num(e.ty, 0, 460) || !num(e.flash, 0, 1) || !Array.isArray(e.history) || e.history.length > 3 || !e.history.every((m) => Object.hasOwn(BOSS_MOVES, m)) || ![...Object.keys(BOSS_MOVES), "strike"].includes(e.move))) return false;
    if (s.scene === "dungeon" && (p.x > 1600 || s.stage < 6)) return false;
    if (!num(s.playTime, 0, 1e9) || !Array.isArray(s.logs) || s.logs.length > 30 || s.logs.some((v) => typeof v !== "string" || v.length > 1e3)) return false;
    if (!s.settings || !Object.entries(DEFAULT_SETTINGS).every(([k, v]) => typeof s.settings[k] === typeof v)) return false;
    if (!["master", "music", "sfx", "controls"].every((k) => num(s.settings[k], 0, 1)) || ![30, 60].includes(s.settings.fps)) return false;
    return true;
  }
  function checksum(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  }
  function encodeSave(s) {
    const payload = JSON.stringify(s);
    return JSON.stringify({ checksum: checksum(payload), payload });
  }
  function parseSave(raw) {
    const e = JSON.parse(raw);
    if (typeof e.payload !== "string" || checksum(e.payload) !== e.checksum) throw Error("存档校验失败");
    return JSON.parse(e.payload);
  }
  var SAVE_MIGRATIONS = {
    // 示例：0: s => ({ ...s, saveVersion: 1, 新字段: 默认值 }),
  };
  function migrateSave(s) {
    if (!s || typeof s !== "object") return null;
    let version = Number.isInteger(s.saveVersion) ? s.saveVersion : 0;
    if (version > VERSION) return null;
    while (version < VERSION) {
      const step = SAVE_MIGRATIONS[version];
      if (typeof step !== "function") return null;
      const next = step(s);
      if (!next || !Number.isInteger(next.saveVersion) || next.saveVersion <= version) return null;
      s = next;
      version = next.saveVersion;
    }
    return s;
  }
  function decodeSave(raw) {
    const migrated = migrateSave(parseSave(raw));
    if (!migrated || !validateSave(migrated)) throw Error("存档版本或内容无效");
    return migrated;
  }
  var SaveStore = class {
    constructor(storage2) {
      this.storage = storage2;
      this.error = "";
      this.recovered = false;
      this.blocked = false;
    }
    load() {
      this.error = "";
      this.recovered = false;
      let candidates;
      try {
        candidates = [this.storage.getItem(KEY), this.storage.getItem(KEY + ".backup"), this.storage.getItem(KEY + ".pending")];
      } catch (e) {
        this.error = "此设备暂时无法读取存档。进度仍可在本次游玩中保留。";
        return null;
      }
      if (candidates.every((raw) => !raw)) return null;
      let newer = false;
      for (const [i, raw] of candidates.entries()) {
        if (!raw) continue;
        try {
          const parsed = parseSave(raw), migrated = migrateSave(parsed);
          if (!migrated) {
            if (Number.isInteger(parsed == null ? void 0 : parsed.saveVersion) && parsed.saveVersion > VERSION) newer = true;
            continue;
          }
          if (!validateSave(migrated)) continue;
          this.recovered = i > 0;
          this.blocked = false;
          return migrated;
        } catch (e) {
        }
      }
      this.blocked = true;
      this.error = newer ? "存档来自更新的游戏版本，已原样保留。请升级到更新的版本再继续，或导入一份备份。" : "存档损坏，备份也无法恢复。原始数据已保留；可导入备份，或确认开始新旅程。";
      return null;
    }
    save(s) {
      if (this.blocked) return false;
      try {
        if (!validateSave(s)) throw Error("存档字段验证失败");
        const next = encodeSave(s), prev = this.storage.getItem(KEY);
        this.storage.setItem(KEY + ".pending", next);
        decodeSave(this.storage.getItem(KEY + ".pending"));
        if (prev) {
          try {
            decodeSave(prev);
            this.storage.setItem(KEY + ".backup", prev);
          } catch (e) {
            this.storage.setItem(KEY + ".backup", next);
          }
        } else this.storage.setItem(KEY + ".backup", next);
        this.storage.setItem(KEY, next);
        this.storage.removeItem(KEY + ".pending");
        this.error = "";
        return true;
      } catch (e) {
        this.error = "自动保存暂时失败，当前进度仍在。可从设置导出备份。";
        return false;
      }
    }
    reset() {
      this.blocked = false;
    }
    export(s) {
      return encodeSave(s);
    }
    import(raw) {
      const s = decodeSave(raw);
      this.blocked = false;
      if (!this.save(s)) throw Error(this.error);
      return s;
    }
  };

  // web/src/renderer.js
  var hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  var Renderer = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.c = canvas.getContext("2d", { alpha: false });
      if (!this.c) throw Error("此设备无法创建游戏画布");
      this.w = 960;
      this.h = 540;
      this.camera = 0;
      this.shake = 0;
      this.artCache = /* @__PURE__ */ new Map();
      this.gradients = /* @__PURE__ */ new Map();
      this.glowCache = /* @__PURE__ */ new Map();
      this.scenery = new Image();
      this.scenery.src = "./assets/world.webp";
      this.resize();
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.w = Math.max(640, Math.round(540 * rect.width / Math.max(1, rect.height)));
      this.canvas.width = this.w;
      this.canvas.height = 540;
      this.c.imageSmoothingEnabled = false;
      this.gradients.clear();
    }
    rect(x, y, w, h, color) {
      this.c.fillStyle = color;
      this.c.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
    }
    poly(points, color) {
      const c = this.c;
      c.fillStyle = color;
      c.beginPath();
      points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.closePath();
      c.fill();
    }
    text(text, x, y, size = 13, color = "#e8dfc5", align = "center") {
      const c = this.c;
      c.font = "".concat(size, 'px "Microsoft YaHei", sans-serif');
      c.fillStyle = color;
      c.textAlign = align;
      c.fillText(text, Math.round(x), Math.round(y));
    }
    // 每帧重建渐变是这里最大的固定开销：渐变对象按 (场景/画布宽) 缓存复用；
    // 光晕则预渲染成离屏精灵，用 drawImage 贴图取代「新建径向渐变 + 整块 alpha 填充」。
    grad(key, build) {
      let g = this.gradients.get(key);
      if (!g) {
        g = build();
        this.gradients.set(key, g);
      }
      return g;
    }
    glowSprite(radius, color) {
      const key = radius + "|" + color;
      let sprite = this.glowCache.get(key);
      if (!sprite) {
        sprite = document.createElement("canvas");
        sprite.width = sprite.height = radius * 2;
        const g = sprite.getContext("2d"), rg = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
        rg.addColorStop(0, color);
        rg.addColorStop(1, "rgba(255,178,90,0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, radius * 2, radius * 2);
        this.glowCache.set(key, sprite);
      }
      return sprite;
    }
    glow(x, y, r, color) {
      const radius = Math.max(1, Math.round(r));
      this.c.drawImage(this.glowSprite(radius, color), Math.round(x - radius), Math.round(y - radius));
    }
    line(x1, y1, x2, y2, color, width = 2) {
      const c = this.c;
      c.strokeStyle = color;
      c.lineWidth = width;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
    }
    draw(g, dt = 1 / 60) {
      var _a2;
      const c = this.c, s = g.s, p = g.player, t = g.time;
      this.camera += (clamp(p.x - this.w * 0.4, 0, Math.max(0, g.worldWidth - this.w)) - this.camera) * Math.min(1, dt * 9);
      if (Math.abs(p.x - this.camera - this.w * 0.4) > this.w) this.camera = clamp(p.x - this.w * 0.4, 0, Math.max(0, g.worldWidth - this.w));
      c.save();
      if (this.shake > 0 && s.settings.shake) {
        c.translate((hash(t * 71) - 0.5) * this.shake, (hash(t * 89) - 0.5) * this.shake);
        this.shake = Math.max(0, this.shake - dt * 30);
      }
      this.background(g);
      c.save();
      c.translate(-Math.round(this.camera), 0);
      if (s.scene === "town") this.town(g);
      else this.dungeon(g);
      for (const f of g.fields) {
        c.fillStyle = "rgba(174,90,151,.2)";
        c.strokeStyle = "#e594bb";
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(f.x, f.y, f.r, f.r * 0.7, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        this.text("× 破盾", f.x, f.y, 15, "#f7c3d8");
      }
      let actors = s.enemies.filter((e) => e.hp > 0).map((e) => ({ y: e.y, draw: () => this.enemy(e, g) }));
      if (s.scene === "town") for (const npc of TOWN) actors.push({ y: npc.y, draw: () => {
        var _a3;
        this.human(npc.x, npc.y, npc.color, t, false, npc.id);
        this.label(npc.name, npc.x, npc.y - 84, ((_a3 = g.nearby()) == null ? void 0 : _a3.id) === npc.id);
      } });
      actors.push({ y: p.y, draw: () => this.hero(g) });
      actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
      for (const b of g.projectiles) {
        this.line(b.x - b.vx * 0.04, b.y - b.vy * 0.04 - 25, b.x, b.y - 25, "#eddab1", 3);
        this.rect(b.x - 2, b.y - 27, 4, 4, "#ffecbd");
      }
      for (const n of g.interactables()) {
        if (n.x < this.camera - 100 || n.x > this.camera + this.w + 100) continue;
        const near = ((_a2 = g.nearby()) == null ? void 0 : _a2.id) === n.id;
        const npc = TOWN.some((x) => x.id === n.id);
        if (!npc) {
          this.diamond(n.x, n.y - 74 + Math.sin(t * 2) * 3, near ? "#fff0b9" : "#cdb776", near ? 6 : 4);
          if (near) this.label(n.label, n.x, n.y - 98, true);
        } else if (near) this.diamond(n.x, n.y - 103 + Math.sin(t * 2) * 3, "#fff0b9", 5);
      }
      this.effects(g);
      c.restore();
      c.fillStyle = this.grad("vignette", () => {
        const g2 = c.createRadialGradient(this.w / 2, 270, 160, this.w / 2, 270, this.w * 0.65);
        g2.addColorStop(0, "#04081600");
        g2.addColorStop(1, "#04081680");
        return g2;
      });
      c.fillRect(0, 0, this.w, 540);
      this.particles(t, s.scene === "town" ? "#ffcb89" : "#b5aec5");
      c.restore();
    }
    background(g) {
      const c = this.c, t = g.time, town = g.s.scene === "town", boss = !town && g.s.run.room === 6, phase = g.s.enemies.some((e) => e.kind === "boss" && e.phase === 2), lit = !!g.s.ending;
      c.fillStyle = this.grad("sky|" + (town ? "town" : "field") + "|" + (boss && phase ? "phase2" : "phase1"), () => {
        const g2 = c.createLinearGradient(0, 0, 0, 370);
        g2.addColorStop(0, boss && phase ? "#151322" : "#20273a");
        g2.addColorStop(0.55, town ? "#6c586e" : "#404353");
        g2.addColorStop(1, town ? "#b58378" : "#6c6273");
        return g2;
      });
      c.fillRect(0, 0, this.w, 540);
      this.glow(this.w * 0.7, 145, 120, town ? "#e6b49e24" : "#c9bade18");
      for (let i = 0; i < 25; i++) {
        const x = (i * 153 - this.camera * 0.05) % (this.w + 100);
        this.rect(x, 30 + hash(i) * 130, hash(i + 8) > 0.8 ? 2 : 1, 1, "#cfc8c170");
      }
      for (let layer = 0; layer < 3; layer++) {
        const scale = [0.08, 0.16, 0.3][layer], base = [210, 245, 290][layer], color = ["#3f4054", "#323b4b", "#283440"][layer];
        let points = [[-100, 400]];
        for (let x = -100; x < this.w + 150; x += 55) {
          const xx = x + this.camera * scale;
          points.push([x, base - hash(Math.floor(xx / 55) + layer * 13) * (layer === 2 ? 65 : 85)]);
        }
        points.push([this.w + 200, 400]);
        this.poly(points, color);
      }
      if (this.scenery.complete && this.scenery.naturalWidth) {
        const width = this.w + 240, offset = clamp(this.camera / Math.max(1, g.worldWidth - this.w), 0, 1) * 240;
        c.drawImage(this.scenery, -offset, 0, width, 330);
        this.rect(0, 0, this.w, 330, town ? "#17233528" : boss && phase ? "#1b102c9c" : "#17233270");
        c.fillStyle = this.grad("fade|" + (town ? "town" : "field"), () => {
          const g2 = c.createLinearGradient(0, 265, 0, 335);
          g2.addColorStop(0, "#26343d00");
          g2.addColorStop(1, town ? "#343d3e" : "#32363c");
          return g2;
        });
        c.fillRect(0, 265, this.w, 70);
      }
      const millx = (town ? this.w * 0.78 : 1050) - this.camera * 0.08;
      this.windmill(millx, 250, 0.6, t * 0.18, "#383847", false);
      this.rect(0, 310, this.w, 230, town ? "#343d3e" : boss ? "#34303e" : "#32363c");
      if (town) {
        this.rect(0, 344, this.w, 82, lit ? "#727269" : "#5c5b58");
        this.rect(0, 347, this.w, 3, "#8c80704d");
        this.rect(0, 424, this.w, 4, "#242e33");
      } else {
        this.rect(0, 210, this.w, 275, boss ? "#45414c" : "#44444a");
        if (g.s.run.room === 2) {
          this.rect(0, 445, this.w, 95, "#202b36");
          this.rect(0, 205, this.w, 35, "#253039");
        }
      }
      for (let i = 0; i < 150; i++) {
        const x = ((i * 73 - Math.floor(this.camera)) % (this.w + 90) + this.w + 90) % (this.w + 90) - 30, y = 330 + hash(i + 90) * 180;
        if (y > 344 && y < 425 && town) {
          this.rect(x, y, 12 + hash(i) * 12, 2, "#363d3e40");
          this.rect(x + 12, y - 8, 1, 9, "#353b3b25");
        } else this.rect(x, y, 3 + hash(i) * 5, 2, town ? "#89906b35" : "#9e97902a");
      }
    }
    visible(x, margin = 300) {
      return x > this.camera - margin && x < this.camera + this.w + margin;
    }
    town(g) {
      const t = g.time, lit = !!g.s.ending;
      for (let x = 0; x < 7350; x += 150) {
        if (!this.visible(x, 150)) continue;
        if (x % 600 === 0) {
          this.tree(x + 70, 315, 1 + hash(x) * 0.5);
          this.fence(x - 90, 330, 90);
        }
        if (x % 450 === 0) this.lamp(x + 55, 345, t, lit || x % 900 === 0);
        for (let k = 0; k < 6; k++) {
          const xx = x + k * 23, yy = 445 + hash(xx) * 28;
          this.rect(xx, yy, 2, 8, "#596c56");
          this.rect(xx + 2, yy + 4, 3, 2, k % 3 === 0 ? "#b8a47b" : "#6f8060");
        }
      }
      this.house(240, 312, 285, 188, "inn", lit, t);
      this.house(1680, 313, 305, 165, "forge", lit, t);
      this.house(4770, 312, 255, 165, "herbs", lit, t);
      if (this.visible(3180, 450)) {
        this.poly([[2920, 420], [2910, 345], [3170, 275], [3450, 345], [3440, 420]], "#696865");
        for (let i = 0; i < 7; i++) this.line(2950 + i * 70, 339, 2930 + i * 70, 419, "#4e5355", 2);
        this.rect(3116, 321, 88, 15, "#333b45");
        this.rect(3124, 305, 72, 16, "#6e7274");
        this.rect(3137, 249, 46, 58, "#66717a");
        this.rect(3143, 242, 34, 52, "#323c4a");
        this.rect(3126, 233, 70, 11, "#82858a");
        this.rect(3137, 200, 46, 35, "#233340");
        this.rect(3146, 208, 28, 26, "#f7c36d");
        this.rect(3132, 191, 58, 10, "#6f737d");
        this.poly([[3125, 191], [3159, 164], [3193, 191]], "#4a535f");
        this.glow(3160, 222, lit ? 155 : 85, lit ? "#ffb95e60" : "#eec58035");
        this.flame(3160, 221, lit ? 1.6 : 0.8, t);
        if (lit) {
          this.human(3040, 367, "#9a8794", t, false, "resident");
          this.human(3390, 390, "#8d9c88", t, false, "resident");
        }
      }
      if (this.visible(1870)) {
        this.rect(1865, 301, 10, 48, "#715e4e");
        this.rect(1847, 294, 44, 20, "#a18f71");
        this.rect(1848, 315, 43, 6, "#5a5046");
        this.rect(1861, 281, 18, 14, "#a99676");
        this.rect(1853, 346, 38, 5, "#393b35");
        if (g.s.tutorial.active && g.trainingTell > 0) {
          this.line(1730, 304, 1800, 315, "#eed080", 5);
          this.label("木剑 " + g.trainingTell.toFixed(1) + "s", 1800, 264, true);
          this.diamond(1800, 283, "#f2cd78", 7);
        }
      }
      if (this.visible(470)) {
        this.rect(453, 271, 6, 50, "#6a5142");
        this.rect(491, 271, 6, 50, "#6a5142");
        this.rect(445, 259, 60, 38, "#a48b64");
        this.rect(450, 264, 50, 25, "#453b35");
        for (let k = 0; k < 3; k++) this.rect(458 + k * 13, 269, 9, 16, "#c8b993");
      }
      if (this.visible(4650)) {
        this.rect(4620, 294, 68, 9, "#84745e");
        this.rect(4625, 303, 5, 20, "#5c5549");
        this.rect(4676, 303, 5, 20, "#5c5549");
        for (let k = 0; k < 6; k++) {
          this.rect(4625 + k * 10, 277, 6, 18, "#72866d");
          this.rect(4620 + k * 10, 280, 9, 5, "#a5b38a");
        }
      }
      if (this.visible(6990, 400)) {
        for (const x of [6860, 7130]) {
          this.rect(x, 191, 65, 155, "#555864");
          for (let i = 0; i < 8; i++) {
            this.rect(x + 3, 194 + i * 18, 58, 2, "#343f49");
            this.rect(x + 28 + i % 2 * 15, 197 + i * 18, 2, 13, "#343f49");
          }
          this.poly([[x - 15, 193], [x + 32, 133], [x + 80, 193]], "#343947");
        }
        this.rect(6915, 221, 232, 18, "#7e7163");
        this.rect(6920, 242, 220, 7, "#554f49");
        this.label("灰风原野", 7030, 215, false);
        this.glow(7040, 320, 100, "#c3beee19");
        this.lamp(6910, 310, t, true);
      }
      this.fence(140, 328, 85);
    }
    house(x, y, w, h, kind, lit, t) {
      if (!this.visible(x, w)) return;
      const c = this.c, left = x - w / 2, roof = kind === "inn" ? "#674d54" : kind === "forge" ? "#4f5662" : "#5a645e";
      this.rect(left + 8, y - h + 48, w - 16, h - 45, "#64605c");
      this.rect(left + 14, y - h + 54, w - 28, h - 60, kind === "inn" ? "#887b6a" : kind === "forge" ? "#6b6a66" : "#7b7c69");
      this.poly([[left - 20, y - h + 54], [left + w * 0.36, y - h - 16], [left + w * 0.66, y - h - 16], [left + w + 20, y - h + 54]], roof);
      this.line(left - 20, y - h + 54, left + w + 20, y - h + 54, "#a5927a", 5);
      for (let i = 0; i < 6; i++) {
        const yy = y - h + 4 + i * 9;
        this.line(left + 60 - i * 12, yy, left + w - 50 + i * 10, yy, "#282e3c55", 2);
        for (let k = 0; k < 8; k++) {
          const xx = left + 62 - i * 10 + k * (w - 105 + i * 18) / 8;
          this.rect(xx, yy + 2, 11, 2, "#b3938335");
          this.rect(xx + 4, yy + 3, 1, 5, "#272d3940");
        }
      }
      for (let i = 0; i < 6; i++) {
        const yy = y - h + 64 + i * 17;
        this.line(left + 22, yy, left + w - 22, yy, "#403f3930", 1);
        for (let k = 0; k < 7; k++) this.rect(left + 28 + k * 34 + i % 2 * 10, yy - 8, 2, 8, "#514c4220");
      }
      this.rect(left + w * 0.72, y - h - 15, 25, 52, "#655f64");
      this.rect(left + w * 0.72 - 4, y - h - 20, 34, 8, "#8e8080");
      for (let i = 0; i < 4; i++) {
        this.rect(left + w * 0.76 + Math.sin(t * 0.5 + i) * 12, y - h - 40 - i * 15, 20 - i * 3, 13, "#a29aa515");
      }
      this.rect(left + 12, y - h + 54, 9, h - 52, "#494942");
      this.rect(left + w - 21, y - h + 54, 9, h - 52, "#494942");
      this.rect(x - 5, y - h + 54, 10, h - 52, "#514b43");
      this.rect(left + 15, y - 50, w - 30, 8, "#534f44");
      this.rect(x - 25, y - 72, 48, 74, "#413f3b");
      this.rect(x - 19, y - 67, 36, 67, "#605444");
      this.line(x - 1, y - 63, x - 1, y - 4, "#403e36", 2);
      this.rect(x + 8, y - 37, 4, 4, "#c2a367");
      for (const xx of [left + 48, left + w - 83]) {
        this.rect(xx - 6, y - 100, 47, 59, "#3e4545");
        this.rect(xx, y - 95, 35, 43, lit || kind !== "forge" ? "#e8ae6e" : "#b4845a");
        this.rect(xx + 16, y - 95, 4, 44, "#715748");
        this.rect(xx, y - 75, 35, 4, "#715748");
        this.rect(xx - 9, y - 49, 52, 6, "#4c4944");
        this.glow(xx + 18, y - 76, 50, "#ecb07118");
      }
      if (kind === "forge") {
        this.rect(left + w - 70, y - 55, 48, 52, "#2c3438");
        this.rect(left + w - 62, y - 47, 32, 32, "#a06543");
        this.flame(left + w - 46, y - 22, 0.9, t);
        this.rect(x + 130, y + 13, 65, 12, "#353e43");
        this.poly([[x + 115, y + 1], [x + 198, y + 1], [x + 179, y + 17], [x + 136, y + 17]], "#899090");
        this.rect(x + 151, y + 15, 20, 15, "#566069");
      }
      for (let k = 0; k < 5; k++) {
        this.rect(left + 39 + k * 9, y - 43, 3, 12, "#586b51");
        this.rect(left + 36 + k * 9, y - 46, 7, 4, k % 2 ? "#c5ad86" : "#af8185");
      }
      this.rect(left + 30, y - 34, 59, 9, "#705b49");
      this.label(kind === "inn" ? "晚灯旅店" : kind === "forge" ? "炉火与铁" : "药草屋", x, y - h + 71, false);
    }
    tree(x, y, scale = 1) {
      const w = 35 * scale;
      this.rect(x - 5, y - 70 * scale, 10, 75 * scale, "#424d45");
      this.poly([[x - w, y - 44 * scale], [x, y - 130 * scale], [x + w, y - 44 * scale]], "#314842");
      this.poly([[x - w * 0.8, y - 72 * scale], [x, y - 153 * scale], [x + w * 0.8, y - 72 * scale]], "#3d5149");
      this.poly([[x - w * 0.5, y - 111 * scale], [x, y - 167 * scale], [x + w * 0.5, y - 111 * scale]], "#4b5a50");
    }
    fence(x, y, w) {
      for (let i = 0; i < w; i += 23) this.rect(x + i, y - 27, 5, 29, "#676452");
      this.rect(x, y - 20, w, 5, "#807763");
      this.rect(x, y - 9, w, 5, "#676652");
    }
    lamp(x, y, t, lit = true) {
      this.rect(x - 3, y - 93, 6, 94, "#303943");
      this.rect(x - 15, y - 96, 30, 6, "#252f3b");
      this.rect(x - 10, y - 93, 20, 23, lit ? "#e8bc77" : "#62635b");
      this.rect(x - 13, y - 73, 26, 5, "#343943");
      this.rect(x - 2, y - 92, 4, 21, "#7a7157");
      if (lit) this.glow(x, y - 83, 65 + Math.sin(t * 3 + x) * 4, "#fac7842d");
    }
    flame(x, y, scale, t) {
      const flicker = Math.sin(t * 8 + x) * 3;
      this.poly([[x - 10 * scale, y], [x - 7 * scale, y - 17 * scale], [x + flicker, y - 34 * scale], [x + 4 * scale, y - 20 * scale], [x + 10 * scale, y - 11 * scale], [x + 7 * scale, y]], "#cc8256");
      this.poly([[x - 5 * scale, y], [x - 4 * scale, y - 15 * scale], [x + 2 * scale, y - 23 * scale], [x + 5 * scale, y]], "#f7d493");
    }
    windmill(x, y, scale, t, color, active) {
      this.poly([[x - 24 * scale, y], [x - 16 * scale, y - 108 * scale], [x + 15 * scale, y - 108 * scale], [x + 27 * scale, y]], color);
      this.poly([[x - 24 * scale, y - 104 * scale], [x, y - 140 * scale], [x + 24 * scale, y - 104 * scale]], color);
      const c = this.c;
      c.save();
      c.translate(x, y - 105 * scale);
      c.rotate(t);
      for (let k = 0; k < 4; k++) {
        c.rotate(Math.PI / 2);
        this.rect(-4 * scale, -110 * scale, 8 * scale, 110 * scale, color);
        this.rect(4 * scale, -105 * scale, 16 * scale, 70 * scale, color);
        for (let j = 0; j < 6; j++) this.line(5 * scale, (-102 + j * 11) * scale, 18 * scale, (-102 + j * 11) * scale, active ? "#9e929330" : "#98869920", 2);
      }
      c.restore();
    }
    dungeon(g) {
      const r = g.s.run, theme = ROOMS[r.room].theme, t = g.time;
      if (theme === "boss") {
        this.windmill(760, 294, 2.1, t * 0.7, "#292733", true);
        this.poly([[100, 460], [40, 300], [220, 216], [1320, 216], [1480, 300], [1430, 460]], "#4a4651");
        for (let k = 0; k < 15; k++) this.line(90 + k * 90, 245, 110 + k * 90, 453, "#5a535e", 2);
        this.rect(90, 238, 1350, 12, "#777075");
        this.rect(70, 454, 1390, 20, "#2f2e39");
        for (let i = 0; i < 18; i++) this.rect(100 + i * 77, 204, 8, 46, "#47414d");
      } else if (theme === "bridge") {
        this.rect(70, 236, 1370, 209, "#56535a");
        for (let i = 0; i < 26; i++) this.rect(75 + i * 53, 241, 3, 200, "#343842");
        this.fence(85, 242, 1290);
        this.fence(80, 444, 1270);
      } else if (theme === "farm") this.house(690, 294, 350, 172, "herbs", false, t);
      else if (theme === "mill") {
        this.rect(510, 110, 500, 180, "#484650");
        for (let k = 0; k < 7; k++) this.rect(520, 120 + k * 23, 480, 3, "#383b46");
        this.rect(710, 191, 130, 105, "#252b34");
        this.rect(740, 216, 8, 63, "#777079");
        this.rect(789, 216, 8, 63, "#777079");
      } else {
        for (let i = 0; i < 12; i++) {
          const x = i * 127;
          if (this.visible(x, 100)) this.tree(x, 285, 0.8 + hash(i) * 0.9);
        }
        if (theme === "wheat") {
          for (let i = 0; i < 100; i++) {
            const x = hash(i) * 1500, y = 235 + hash(i + 9) * 55;
            this.rect(x, y, 2, 30, "#797464");
            this.rect(x - 3, y, 8, 12, "#99907b");
          }
        }
      }
      if (theme === "road") {
        this.rect(332, 255, 8, 65, "#827564");
        this.poly([[312, 257], [384, 257], [393, 265], [380, 274], [312, 274]], "#a5977a");
        this.text("王都 67 里", 351, 270, 9, "#413d3e");
      } else if (theme === "camp") {
        this.rect(688, 343, 47, 9, "#575459");
        this.line(689, 338, 734, 324, "#867665", 8);
        this.line(695, 323, 728, 339, "#7a6759", 7);
        if (!r.campUsed) {
          this.flame(711, 333, 1.1, t);
          this.glow(711, 315, 110, "#edb4743d");
        }
        this.rect(332, 290, 38, 9, "#b4a68c");
        this.rect(350, 277, 18, 16, "#c7b499");
      } else if (theme === "mill") {
        this.rect(332, 293, 17, 16, "#b8a076");
        this.line(341, 278, 358, 300, "#ccbba0", 3);
        if (r.clear) {
          this.rect(1052, 288, 55, 33, r.chestUsed ? "#635853" : "#988469");
          this.rect(1050, 281, 59, 12, "#b49b73");
          this.rect(1075, 288, 9, 16, "#463f42");
        }
      } else {
        this.rect(328, 295, 45, 12, "#817a76");
        this.rect(338, 280, 20, 17, "#9c9090");
      }
      if (r.clear) {
        this.glow(1410, 340, 110, "#a9cec633");
        for (let i = 0; i < 4; i++) this.line(1380 + i * 13, 327, 1400 + i * 13, 340, "#c0d7c0", 2);
        this.line(1420, 339, 1410, 330, "#dce8c5", 3);
        this.line(1420, 339, 1410, 348, "#dce8c5", 3);
      }
      this.rect(10, 480, 1500, 60, "#242c32");
      for (let i = 0; i < 50; i++) {
        this.rect(i * 31, 465 + hash(i) * 10, 3, 17, "#414d47");
        this.rect(i * 31 + 3, 470, 7, 3, "#556053");
      }
    }
    human(x, y, color, t, moving = false, id = "hero", facing = 1, action = "idle") {
      const c = this.c;
      c.save();
      c.translate(Math.round(x), Math.round(y));
      const bob = moving ? Math.sin(t * 12) * 2 : Math.sin(t * 2) * 0.6;
      c.fillStyle = "#111c2560";
      c.beginPath();
      c.ellipse(0, -2, 17, 5, 0, 0, Math.PI * 2);
      c.fill();
      c.translate(0, Math.round(bob));
      c.scale(facing, 1);
      const step = moving ? Math.sin(t * 12) * 6 : 0;
      this.rect(-10, -15 + step, 7, 14, "#282c36");
      this.rect(4, -15 - step, 7, 14, "#292c35");
      this.rect(-12, -3 + step, 10, 4, "#514b46");
      this.rect(3, -3 - step, 11, 4, "#514b46");
      this.poly([[-14, -41], [8, -41], [16, -13], [-17, -13], [-21, -18]], id === "hero" ? "#273e4a" : color);
      this.rect(-8, -37, 19, 19, id === "hero" ? "#50646a" : "#6d615a");
      this.rect(-7, -31, 18, 3, "#9a8068");
      this.rect(-11, -17, 25, 4, "#8e715c");
      this.rect(-8, -56, 19, 19, "#ba9d85");
      this.rect(-10, -58, 22, 9, id === "hero" ? "#303d46" : id === "glen" ? "#b8b3a6" : id === "milo" ? "#7b6653" : "#69665f");
      this.rect(-12, -49, 6, 12, id === "hero" ? "#303d46" : color);
      this.rect(6, -47, 3, 3, "#2b333d");
      this.rect(-10, -39, 24, 5, id === "hero" ? "#bb9b6a" : color);
      if (id === "milo") {
        this.rect(2, -49, 12, 5, "#c4c6af");
        this.rect(5, -49, 4, 5, "#7a9a9a");
      }
      if (id === "ida") this.rect(-6, -29, 14, 18, "#dcc4a0");
      if (id === "hero") {
        this.rect(13, -30, 6, 17, "#a69073");
        this.rect(16, -16, 8, 11, "#ba9155");
        this.rect(18, -14, 4, 7, "#f2d597");
        this.glow(20, -11, 42, "#eec37e20");
        if (action !== "attack") {
          this.line(-11, -24, -24, 3, "#bbc8bd", 3);
          this.line(-18, -15, -9, -10, "#b0a078", 3);
        }
      }
      c.restore();
    }
    hero(g) {
      const p = g.player, a = g.p, c = this.c;
      if (a.invincible > 0 && Math.floor(g.time * 18) % 2 === 0) c.globalAlpha = 0.6;
      if (a.action === "dodge") {
        c.globalAlpha = 0.35;
        this.human(p.x - a.dx * 26, p.y - a.dy * 20, "#637888", g.time, true, "hero", p.facing);
        c.globalAlpha = 0.8;
      }
      this.human(p.x, p.y, "#415464", g.time, Math.hypot(g.input.x, g.input.y) > 0.1 && a.action === "idle", "hero", p.facing, a.action);
      c.globalAlpha = 1;
      if (a.action === "attack") {
        const cfg = COMBO[a.combo], progress = Math.min(1, a.elapsed / cfg.duration), swing = 1 - Math.pow(1 - progress, 3);
        c.save();
        c.translate(p.x, p.y - 28);
        c.scale(p.facing, 1);
        c.rotate(-1.15 + swing * 2.7);
        c.strokeStyle = a.combo === 2 ? "#fff0b9" : "#decfad";
        c.globalAlpha = 0.45;
        c.lineWidth = a.combo === 2 ? 5 : 4;
        c.beginPath();
        c.arc(0, 0, 80, -0.6, -0.06);
        c.stroke();
        c.globalAlpha = 1;
        this.poly([[-13, -4], [-13, 4], [-9, 6], [-9, -6]], "#c9a86a");
        this.rect(-9, -3, 12, 6, "#6d5a49");
        this.rect(3, -9, 5, 18, "#b7a26e");
        this.poly([[8, -4.5], [54, -4], [68, 0], [54, 4], [8, 4.5]], "#e9e1c6");
        this.poly([[8, -4.5], [54, -4], [60, -1.5], [8, -1.5]], "#fffaf0");
        c.restore();
      }
      if (a.action === "block") {
        c.save();
        c.strokeStyle = a.blockAge <= 0.18 ? "#f8e5ad" : "#a9c8cf";
        c.lineWidth = 4;
        c.beginPath();
        c.ellipse(p.x + p.facing * 21, p.y - 29, 12, 27, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
      if (a.action === "potion") {
        this.rect(p.x + 17, p.y - 47, 8, 13, "#cda294");
        this.glow(p.x, p.y - 25, 45, "#87cca23b");
      }
    }
    enemy(e, g) {
      const c = this.c, cfg = ENEMIES[e.kind], t = g.time, wind = e.state === "windup", boss = e.kind === "boss";
      const warning = boss ? BOSS_MOVES[e.move] : { name: e.kind === "archer" ? "弩箭瞄准" : e.move === "charge" ? "冲锋" : "扑击", blockable: true };
      if (wind) {
        const color = warning.blockable ? "#eac678" : "#dc88ac";
        if (e.kind === "archer") {
          this.line(e.x, e.y - 28, e.tx, e.ty - 28, "#e29c9790", 1);
          this.diamond(e.tx, e.ty - 28, "#d9858a", 5);
        } else if (e.move !== "field" && e.move !== "summon") {
          c.fillStyle = warning.blockable ? "#eab95120" : "#cf6c9c30";
          c.beginPath();
          c.ellipse(e.x, e.y, warning.radius || 95, (warning.radius || 95) * 0.48, 0, 0, Math.PI * 2);
          c.fill();
        }
        this.label((warning.blockable ? "! " : "× ") + warning.name, e.x, e.y - (boss ? 137 : 93), true, color);
      }
      if (e.kind === "rat" || e.kind === "dog" || e.kind === "elite") {
        c.save();
        c.translate(Math.round(e.x), Math.round(e.y));
        c.scale(e.facing, 1);
        const dog = e.kind !== "rat", w = dog ? 56 : 32, h = dog ? 32 : 20, step = e.state === "chase" ? Math.sin(t * 14) * 4 : 0;
        c.fillStyle = "#11172266";
        c.beginPath();
        c.ellipse(0, 0, w * 0.6, 6, 0, 0, Math.PI * 2);
        c.fill();
        this.rect(-w * 0.48, -h, w, h * 0.7, e.flash ? "#eceadf" : cfg.color);
        this.rect(w * 0.25, -h - 7, w * 0.38, h * 0.65, e.flash ? "#fff8eb" : "#aaa0ac");
        this.rect(w * 0.57, -h, 5, 3, e.kind === "elite" ? "#ec9daa" : "#eec186");
        this.poly([[w * 0.27, -h - 5], [w * 0.35, -h - 18], [w * 0.5, -h - 5]], cfg.color);
        this.rect(-w * 0.35, -h * 0.4 + step, 6, h * 0.4 - step, "#595767");
        this.rect(w * 0.3, -h * 0.4 - step, 6, h * 0.4 + step, "#666070");
        this.line(-w * 0.4, -h * 0.7, -w * 0.9, -h * 0.2, "#827e8d", 4);
        if (dog) {
          this.rect(w * 0.48, -h * 0.3, 9, 3, "#d5c5bd");
          this.rect(w * 0.48, -h * 0.3, 3, 8, "#d5c5bd");
        }
        c.restore();
      } else if (e.kind === "archer") {
        this.human(e.x, e.y, e.flash ? "#eee4d6" : "#6d7a72", t, e.state === "chase", "archer", e.facing);
        this.line(e.x + e.facing * 15, e.y - 32, e.x + e.facing * 42, e.y - 32, "#c1b59b", 4);
        this.line(e.x + e.facing * 34, e.y - 45, e.x + e.facing * 34, e.y - 19, "#a49788", 3);
      } else {
        c.save();
        c.translate(e.x, e.y);
        c.scale(e.facing, 1);
        this.rect(-22, -33, 13, 32, "#434551");
        this.rect(9, -33, 14, 32, "#4b4d56");
        this.poly([[-32, -85], [27, -85], [38, -28], [-38, -28]], e.flash ? "#e8e0d8" : "#555766");
        this.rect(-21, -84, 44, 54, e.flash ? "#ece4d9" : "#96929b");
        for (let j = 0; j < 4; j++) this.rect(-18, -79 + j * 12, 39, 3, "#5f626c");
        this.rect(-17, -113, 35, 31, "#8b8795");
        this.rect(-22, -104, 46, 12, "#6a6c7a");
        this.rect(-15, -97, 30, 7, e.phase === 2 ? "#ac87c4" : "#e9bd78");
        this.rect(-11, -58, 22, 21, e.phase === 2 ? "#b294cc" : "#e9c789");
        this.glow(0, -47, 50, e.phase === 2 ? "#b99ad22b" : "#eec78933");
        this.line(36, -95, 44, 9, "#9d9da3", 6);
        this.poly([[36, -100], [68, -92], [54, -73], [47, -79], [56, -88], [35, -90]], "#c1bbc1");
        this.rect(-49, -49, 18, 25, "#30313e");
        this.rect(-47, -45, 14, 15, "#726579");
        c.restore();
        if (e.state === "transition") {
          this.glow(e.x, e.y - 55, 180, "#c0a1df30");
          this.label("界灯熄灭", e.x, e.y - 141, true, "#d6b9ea");
        }
        if (e.state === "stunned") this.label("架势崩解", e.x, e.y - 133, true, "#f2db9d");
      }
      if (!boss && e.hp < e.maxHp) {
        this.rect(e.x - 22, e.y - (e.kind === "archer" ? 73 : 57), 44, 4, "#1e2833");
        this.rect(e.x - 22, e.y - (e.kind === "archer" ? 73 : 57), 44 * e.hp / e.maxHp, 4, "#cb938b");
      }
    }
    diamond(x, y, color, size) {
      this.poly([[x, y - size], [x + size, y], [x, y + size], [x - size, y]], color);
    }
    label(text, x, y, active = false, color = "#f0ddb0") {
      const c = this.c;
      c.font = '12px "Microsoft YaHei", sans-serif';
      const w = c.measureText(text).width;
      this.rect(x - w / 2 - 10, y - 15, w + 20, 23, active ? "#1b2930df" : "#1b293099");
      if (active) this.rect(x - w / 2 - 10, y + 7, w + 20, 1, color);
      this.text(text, x, y, 12, active ? color : "#c9c9ba");
    }
    effects(g) {
      const c = this.c;
      for (const e of g.effects) {
        c.save();
        c.globalAlpha = Math.min(1, e.t * 3);
        if (e.type === "text" && g.s.settings.numbers) this.text(e.text, e.x, e.y - (1.1 - e.t) * 27, 16, e.color);
        else if (e.type === "spark") {
          for (let k = 0; k < 5; k++) this.rect(e.x + Math.cos(k * 1.3) * (1 - e.t) * 30, e.y + Math.sin(k * 1.3) * (1 - e.t) * 30, 4, 4, e.color);
        } else if (e.type === "ring") {
          c.strokeStyle = e.color;
          c.lineWidth = 3;
          c.beginPath();
          c.ellipse(e.x, e.y, e.r, e.r * 0.5, 0, 0, Math.PI * 2);
          c.stroke();
        } else if (e.type === "dash") this.line(e.x, e.y - 24, e.x2, e.y2 - 24, e.color, 10);
        else if (e.type === "death") {
          for (let k = 0; k < 8; k++) this.rect(e.x + (hash(k) - 0.5) * (1 - e.t) * 100, e.y - 40 - hash(k + 8) * (1 - e.t) * 50, 5, 5, e.color);
        }
        c.restore();
      }
    }
    particles(t, color) {
      for (let i = 0; i < 24; i++) {
        const x = (hash(i) * this.w + t * (5 + hash(i) * 8)) % this.w, y = hash(i + 99) * 470 + Math.sin(t * 0.5 + i) * 5;
        this.rect(x, y, i % 3 === 0 ? 2 : 1, 2, color + "50");
      }
    }
  };

  // web/src/input.js
  var Input = class {
    constructor(getGame, onPause, onInteract, sound2) {
      this.getGame = getGame;
      this.onPause = onPause;
      this.onInteract = onInteract;
      this.sound = sound2;
      this.keys = /* @__PURE__ */ new Set();
      this.attackHeld = false;
      this.attackTimer = 0;
      this.stickPointer = null;
      this.stick = { x: 0, y: 0 };
      this.bind();
    }
    bind() {
      const stick = document.getElementById("joystick"), knob = document.getElementById("stick-knob");
      const move = (e) => {
        if (e.pointerId !== this.stickPointer) return;
        const r = stick.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), radius = r.width * 0.34, d = Math.hypot(dx, dy), f = d > radius ? radius / d : 1;
        this.stick = { x: dx * f / radius, y: dy * f / radius };
        knob.style.transform = "translate(".concat(dx * f, "px,").concat(dy * f, "px)");
      };
      stick.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (this.stickPointer !== null) return;
        this.stickPointer = e.pointerId;
        stick.setPointerCapture(e.pointerId);
        move(e);
      });
      stick.addEventListener("pointermove", move);
      const release = (e) => {
        if (e.pointerId === this.stickPointer) {
          this.stickPointer = null;
          this.stick = { x: 0, y: 0 };
          knob.style.transform = "";
        }
      };
      stick.addEventListener("pointerup", release);
      stick.addEventListener("pointercancel", release);
      stick.addEventListener("lostpointercapture", release);
      for (const [id, action] of [["attack", "attack"], ["dodge", "dodge"], ["block", "block"], ["potion", "potion"]]) {
        const el = document.getElementById(id);
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          this.sound.unlock();
          el.setPointerCapture(e.pointerId);
          el.classList.add("pressed");
          const g = this.getGame();
          if (!g) return;
          if (action === "block") g.block(true);
          else g[action]();
          if (action === "attack") {
            this.attackHeld = true;
            this.attackTimer = 0.3;
          }
        });
        const up = () => {
          var _a2;
          el.classList.remove("pressed");
          if (action === "block") (_a2 = this.getGame()) == null ? void 0 : _a2.block(false);
          if (action === "attack") this.attackHeld = false;
        };
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        el.addEventListener("lostpointercapture", up);
      }
      window.addEventListener("keydown", (e) => {
        if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
        const key = e.key.toLowerCase();
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "escape"].includes(key)) e.preventDefault();
        if (e.repeat) return;
        this.keys.add(key);
        this.sound.unlock();
        const g = this.getGame();
        if (key === "escape") {
          this.onPause();
          return;
        }
        if (!g) return;
        if (key === "j" || key === " ") {
          g.attack();
          this.attackHeld = true;
          this.attackTimer = 0.3;
        }
        if (key === "k") g.dodge();
        if (key === "l") g.block(true);
        if (key === "h") g.potion();
        if (key === "e" || key === "enter") this.onInteract();
      });
      window.addEventListener("keyup", (e) => {
        var _a2;
        const key = e.key.toLowerCase();
        this.keys.delete(key);
        if (key === "l") (_a2 = this.getGame()) == null ? void 0 : _a2.block(false);
        if (key === "j" || key === " ") this.attackHeld = false;
      });
      window.addEventListener("blur", () => this.clear());
      window.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    clear() {
      var _a2;
      this.keys.clear();
      this.stick = { x: 0, y: 0 };
      this.stickPointer = null;
      this.attackHeld = false;
      (_a2 = this.getGame()) == null ? void 0 : _a2.block(false);
      document.getElementById("stick-knob").style.transform = "";
      document.querySelectorAll(".pressed").forEach((e) => e.classList.remove("pressed"));
    }
    update(dt) {
      const g = this.getGame();
      if (!g) return;
      const has = (k) => this.keys.has(k) ? 1 : 0;
      g.input.x = this.stick.x + has("d") + has("arrowright") - has("a") - has("arrowleft");
      g.input.y = this.stick.y + has("s") + has("arrowdown") - has("w") - has("arrowup");
      this.attackTimer -= dt;
      if (this.attackHeld && this.attackTimer <= 0) {
        this.attackTimer = 0.18;
        g.attack();
      }
    }
  };

  // web/src/audio.js
  var Sound = class {
    constructor() {
      this.ctx = null;
      this.noise = null;
      this.settings = { master: 0.7, music: 0.45, sfx: 0.7 };
      this.next = 0;
      this.note = 0;
      this.scene = "town";
    }
    unlock() {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {
        });
      } catch (e) {
      }
    }
    tone(freq, duration, volume = 0.08, type = "sine", end = null) {
      const ctx = this.ctx;
      if (!ctx || ctx.state !== "running" || volume <= 0 || this.settings.master <= 0) return;
      try {
        const o = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
        o.type = type;
        o.frequency.setValueAtTime(freq, now);
        if (end) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), now + duration);
        gain.gain.setValueAtTime(1e-3, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(1e-3, volume * this.settings.master), now + 0.015);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
        o.connect(gain);
        gain.connect(ctx.destination);
        o.start();
        o.stop(now + duration + 0.04);
        o.onended = () => {
          o.disconnect();
          gain.disconnect();
        };
      } catch (e) {
      }
    }
    play(name) {
      const v = this.settings.sfx * 0.11;
      if (name.startsWith("swing")) {
        const i = Number(name.at(-1) || 0);
        this.whoosh(0.15 + i * 0.02, v * 1.6, 1600 + i * 260, 430 + i * 110);
        this.tone(300 + i * 50, 0.06, v * 0.3, "triangle", 150);
      } else if (name === "hit") {
        this.whoosh(0.07, v * 0.9, 3e3, 650);
        this.tone(145, 0.12, v, "square", 55);
      } else if (name === "hurt") this.tone(90, 0.25, v, "sawtooth", 32);
      else if (name === "parry") {
        this.tone(880, 0.4, v, "triangle", 1300);
        this.tone(1320, 0.5, v * 0.5);
      } else if (name === "block") this.tone(210, 0.15, v, "triangle", 120);
      else if (name === "heal" || name === "item") {
        this.tone(523, 0.3, v);
        setTimeout(() => this.tone(784, 0.4, v * 0.7), 90);
      } else if (name === "quest" || name === "victory") {
        [392, 493.88, 587.33, 783.99].forEach((f, i) => setTimeout(() => this.tone(f, 0.8, v), i * 140));
      } else if (name === "warning" || name === "boss") this.tone(110, 0.35, v * 0.6, "sine", 80);
      else if (name === "dodge") this.tone(260, 0.15, v * 0.5, "triangle", 90);
      else if (name === "arrow") this.tone(570, 0.08, v * 0.5, "triangle", 230);
      else if (name === "death") this.tone(160, 1, v, "triangle", 60);
      else this.tone(350, 0.08, v * 0.4);
    }
    tick(scene, paused = false) {
      if (!this.ctx || this.ctx.state !== "running" || paused) return;
      this.scene = scene;
      if (this.ctx.currentTime < this.next) return;
      this.next = this.ctx.currentTime + (scene === "boss" ? 0.48 : 1.1);
      const scales = scene === "title" ? [220, 261.63, 329.63, 293.66, 220, 196, 164.81, 196] : scene === "town" ? [261.63, 329.63, 392, 329.63, 293.66, 220, 261.63, 196] : scene === "boss" ? [110, 130.81, 110, 155.56, 146.83, 130.81, 98, 110] : [164.81, 196, 220, 196, 164.81, 146.83, 130.81, 146.83];
      const freq = scales[this.note++ % scales.length];
      this.tone(freq, 2.5, this.settings.music * 0.1);
      this.tone(freq / 2, 3, this.settings.music * 0.05, "triangle");
    }
    // 挥砍是宽频噪声而不是音调：短促的带通噪声扫频才做出「嗖」的破空声。
    // 噪声缓冲只建一次并复用，随机取一段避免每次听起来一样。
    whoosh(duration, volume, from, to) {
      const ctx = this.ctx;
      if (!ctx || ctx.state !== "running" || volume <= 0 || this.settings.master <= 0) return;
      try {
        if (!this.noise) {
          const length = Math.ceil(ctx.sampleRate * 0.6), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
          for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
          this.noise = buffer;
        }
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(), now = ctx.currentTime;
        source.buffer = this.noise;
        filter.type = "bandpass";
        filter.Q.value = 1.1;
        filter.frequency.setValueAtTime(from, now);
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), now + duration);
        gain.gain.setValueAtTime(1e-4, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, volume * this.settings.master), now + 0.01);
        gain.gain.exponentialRampToValueAtTime(1e-4, now + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now, Math.random() * 0.4, duration + 0.04);
        source.stop(now + duration + 0.06);
        source.onended = () => {
          source.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch (e) {
      }
    }
    suspend() {
      var _a2;
      try {
        (_a2 = this.ctx) == null ? void 0 : _a2.suspend().catch(() => {
        });
      } catch (e) {
      }
    }
  };

  // web/src/app.js
  var $ = (id) => document.getElementById(id);
  var esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var paths = {
    sword: "M5 19 17 7m-5-2 7-2-2 7M3 17l4 4m-4 0 4-4m2-2 3 3",
    shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8 12l3 3 5-6",
    dodge: "m14 3-5 8h6l-5 10M3 8h4M2 13h4M4 18h3",
    potion: "M9 3h6M10 3v5l-5 9c-1 3 1 4 3 4h8c2 0 4-1 3-4l-5-9V3M7 14h10",
    bag: "M7 8V6a5 5 0 0 1 10 0v2M5 8h14l2 13H3ZM9 12v2m6-2v2",
    map: "m3 5 6-2 6 3 6-2v16l-6 2-6-3-6 2ZM9 3v16m6-13v16",
    lamp: "M7 9h10v11H7ZM6 20h12M5 9l7-6 7 6M12 12v5M10 2h4",
    book: "M3 4h7c1 0 2 1 2 2 0-1 1-2 2-2h7v16h-7c-1 0-2 1-2 1s-1-1-2-1H3ZM12 6v15M6 8h3m6 0h3",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
    home: "m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8",
    leaf: "M20 3C5 1 1 10 6 16s16 3 14-13ZM5 21 16 8M8 14h6",
    iron: "m7 4 10 1 5 9-6 6-12-1-2-8ZM7 4l2 8 8-7M9 12l7 8M2 11l7 1",
    coin: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 8h6v8H9Z",
    cloak: "M9 3h6l6 17-9 1-9-1ZM9 3l3 7 3-7M12 10v11",
    gate: "M3 21V6h5v15M16 21V6h5v15M2 6l3-3 4 3m6 0 4-3 3 3M8 9h8M11 9v12m3-12v12",
    inn: "m3 9 9-6 9 6M5 8v13h14V8M8 12h3v3H8m5-3h3v3h-3M10 21v-3h4v3",
    play: "m8 4 12 8-12 8Z",
    tag: "M8 3h8l4 5v12H4V8ZM12 6v1M8 12h8m-8 4h6",
    forge: "M3 6h18l-5 6H7ZM9 12v7m6-7v7M6 20h12"
  };
  var icon = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'.concat(paths[name] || paths.lamp, '"/></svg>');
  $("map-button").innerHTML = icon("map");
  $("bag-button").innerHTML = icon("bag");
  $("potion-icon").innerHTML = icon("potion");
  for (const [id, name] of [["attack", "sword"], ["block", "shield"], ["dodge", "dodge"]]) $(id).querySelector(".action-icon").innerHTML = icon(name);
  var storage;
  try {
    storage = window.localStorage;
  } catch (e) {
    storage = { getItem() {
      throw Error();
    }, setItem() {
      throw Error();
    }, removeItem() {
    } };
  }
  var store = new SaveStore(storage);
  var sound = new Sound();
  var renderer = new Renderer($("world"));
  var saved = store.load();
  var game = null;
  var onTitle = true;
  var menu = null;
  var dialogIndex = 0;
  var currentDialog = null;
  var regionTimer = null;
  var hudLast = "";
  var lastFrame = 0;
  var accumulator = 0;
  var settings = __spreadValues(__spreadValues({}, DEFAULT_SETTINGS), saved == null ? void 0 : saved.settings);
  var saveErrorShown = false;
  var restoreFocus = null;
  try {
    const raw = JSON.parse(storage.getItem("duskbound.settings") || "null");
    if (raw) for (const k in DEFAULT_SETTINGS) {
      const v = raw[k];
      if (typeof v !== typeof DEFAULT_SETTINGS[k]) continue;
      if (typeof v === "boolean") settings[k] = v;
      else if (k === "fps" && [30, 60].includes(v)) settings[k] = v;
      else if (k !== "fps" && Number.isFinite(v) && v >= (k === "controls" ? 0.2 : 0) && v <= 1) settings[k] = v;
    }
  } catch (e) {
  }
  var input = new Input(() => onTitle ? null : game, togglePause, () => {
    if (currentDialog) {
      advanceDialog();
    } else if (!menu) game == null ? void 0 : game.interact();
  }, sound);
  function applySettings() {
    sound.settings = settings;
    document.documentElement.style.setProperty("--control-opacity", settings.controls);
    if (game) game.s.settings = __spreadValues({}, settings);
  }
  applySettings();
  function showToast(text, duration = 3600) {
    const nodes = $("toasts");
    if ([...nodes.children].some((n2) => n2.textContent === text)) return;
    while (nodes.children.length) nodes.firstChild.remove();
    const n = document.createElement("div");
    n.className = "toast";
    n.textContent = text;
    nodes.appendChild(n);
    setTimeout(() => n.remove(), duration);
  }
  function saveGame() {
    if (!game) return;
    const ok = store.save(game.s);
    if (ok) {
      saved = structuredClone(game.s);
      $("save-indicator").textContent = "已自动保存";
      saveErrorShown = false;
    } else if (!saveErrorShown) {
      showToast(store.error, 7e3);
      saveErrorShown = true;
    }
  }
  function refreshTitle() {
    const b = $("continue-game");
    b.disabled = !saved;
    b.className = saved ? "primary" : "secondary";
    b.style.order = saved ? "0" : "1";
    $("new-game").className = saved ? "secondary" : "primary";
    b.querySelector("span").textContent = "继续旅程";
    $("title-ending").classList.toggle("hidden", !(saved == null ? void 0 : saved.ending));
    if (saved == null ? void 0 : saved.ending) $("title-ending").textContent = "◇ 余烬已燃 · " + ENDINGS[saved.ending].title;
    $("save-info").textContent = saved ? "".concat(saved.scene === "town" ? "暮边镇" : ROOMS[saved.run.room].name, " · ").concat(Math.floor(saved.playTime / 60), " 分钟 · 自动存档") : store.error || "提灯已备好，等你出发。";
  }
  function begin(state, isNew = false) {
    input.clear();
    onTitle = false;
    game = new Game(state);
    settings = __spreadValues({}, game.s.settings);
    applySettings();
    $("title-screen").classList.add("hidden");
    $("hud").classList.remove("hidden");
    $("touch-controls").classList.remove("hidden");
    hideModal(false);
    renderer.camera = Math.max(0, game.player.x - renderer.w * 0.4);
    currentDialog = null;
    $("dialog-layer").classList.add("hidden");
    lastFrame = performance.now();
    accumulator = 0;
    hudLast = "";
    if (isNew) game.startIntro();
    else showToast("旅程已恢复 · 前方的灯还亮着");
    requestFullscreen(false);
    processEvents();
    refreshHud();
    saveGame();
  }
  function requestNew() {
    if (saved || store.blocked) {
      showModal("confirm", "新的旅程", '<p>当前旅程将被新存档替换。你可以先到设置里导出备份。</p><div class="button-row"><button class="secondary" data-ui="close">保留当前旅程</button><button class="primary" data-ui="confirm-new">开始新旅程</button></div>');
    } else startNew();
  }
  function startNew() {
    store.reset();
    begin(newState(settings), true);
  }
  function backToTitle() {
    input.clear();
    if (game) {
      game.pause();
      processEvents();
      saveGame();
    }
    onTitle = true;
    hideModal(false);
    currentDialog = null;
    $("dialog-layer").classList.add("hidden");
    $("hud").classList.add("hidden");
    $("touch-controls").classList.add("hidden");
    $("title-screen").classList.remove("hidden");
    refreshTitle();
  }
  function showModal(name, title, html, kicker = "D U S K B O U N D") {
    restoreFocus = document.activeElement;
    input.clear();
    menu = name;
    if (game && !onTitle) game.pause();
    $("modal-title").textContent = title;
    $("modal-kicker").textContent = kicker;
    $("modal-body").innerHTML = html;
    $("modal-layer").classList.remove("hidden");
    $("close-modal").focus({ preventScroll: true });
    processSavesOnly();
  }
  function hideModal(resume = true) {
    menu = null;
    $("modal-layer").classList.add("hidden");
    if (game && !onTitle && resume) game.resume();
    input.clear();
    if (restoreFocus == null ? void 0 : restoreFocus.isConnected) restoreFocus.focus({ preventScroll: true });
  }
  function togglePause() {
    if (currentDialog && !menu) {
      openMenu("pause");
      return;
    }
    if (menu) {
      hideModal();
      return;
    }
    if (onTitle) return;
    openMenu("pause");
  }
  function openMenu(name) {
    const s = (game == null ? void 0 : game.s) || saved, p = s == null ? void 0 : s.player;
    let html = "", title = "";
    if (name === "pause") {
      title = "片刻歇息";
      const items = [["resume", "play", "继续旅程", "Esc"], ["journal", "book", "主线与手记", ""], ["inventory", "bag", "行囊", ""], ["equipment", "sword", "装备", ""], ["map", "map", "地图", ""], ["records", "book", "对话记录", ""], ["settings", "settings", "设置", ""], ["confirm-title", "home", "返回标题", ""]];
      html = '<div class="menu-grid">'.concat(items.map(([n, i, t, k]) => '<button data-ui="'.concat(n, '">').concat(icon(i), "<span>").concat(t, "</span><small>").concat(k, "</small></button>")).join("")).concat(s.scene === "dungeon" ? '<button class="wide" data-ui="confirm-retreat">'.concat(icon("gate"), "安全撤回小镇<small>保留已得物资</small></button>") : "", '</div><div class="menu-meta"><span>').concat(s.scene === "town" ? "暮边镇" : ROOMS[s.run.room].name, "</span><span>旅程 ").concat(Math.floor(s.playTime / 60), " 分钟</span><span>单人 · 自动保存</span></div>");
    } else if (name === "inventory") {
      title = "巡界者的行囊";
      html = '<span class="section-label">消耗品</span>'.concat(item("potion", "恢复药剂", "恢复 35 生命；饮用过程中受击会打断，药剂保留。", "×".concat(p.potions), p.potions && p.hp < p.maxHp ? '<button class="small-button" data-ui="use-potion">使用</button>' : "")).concat(item("leaf", "苦叶膏", "涂抹后，下一次房间侵蚀增长减少 10。", "×".concat(s.inventory.salve), s.inventory.salve && !s.run.salveUsed ? '<button class="small-button" data-ui="use-salve">涂抹</button>' : ""), '\n      <span class="section-label" style="margin-top:25px">材料与货币</span>').concat(item("coin", "旧币", "原野里的旧时代货币。", s.inventory.coins)).concat(item("iron", "灰铁", "收集 6 块可请格伦强化长剑一次。", s.inventory.iron)).concat(item("leaf", "苦叶", "药草屋可免费将一份苦叶制成苦叶膏。", s.inventory.leaf), "\n      ").concat(s.flags.core || s.flags.tag || s.flags.log ? '<span class="section-label" style="margin-top:25px">关键物品 · 永久保留</span>' : "").concat(s.flags.core ? item("lamp", "黯淡核心", "尚有余温。界灯正在等待它。", "") : "").concat(s.flags.tag ? item("tag", "艾琳的军牌", "一个名字，和一个尚未被说出的故事。", "") : "").concat(s.flags.log ? item("book", "士兵日志", "艾琳说，风车的灯昨晚自己亮了。", "") : "");
    } else if (name === "equipment") {
      title = "剑与提灯";
      html = "".concat(item("sword", p.weapon ? "巡界长剑 · 已强化" : "巡界长剑", "旧刃仍有分量。三段攻击，最后一击最重。", p.weapon ? "Ⅰ" : "")).concat(item("cloak", s.flags.cloak ? "旧巡界斗篷" : "旧皮甲", s.flags.cloak ? "伊妲替你缝好了领口。生命上限 +10。" : "去旅店找伊妲，取回她保管的斗篷。", ""), '<div class="stat-grid"><div><small>攻击</small><b>').concat(p.weapon ? 15 : 12, "</b></div><div><small>防御</small><b>2</b></div><div><small>生命上限</small><b>").concat(p.maxHp, "</b></div></div><p>装备随身携带，无需反复装卸。</p>").concat(!p.weapon ? '<div class="notice">格伦的锻造 · 需要灰铁 6 块，现有 '.concat(s.inventory.iron, ' 块。强化后攻击提升至 15。</div><button class="primary" data-ui="upgrade" ').concat(s.scene !== "town" || s.inventory.iron < 6 ? "disabled" : "", ">").concat(s.scene !== "town" ? "返回小镇后可强化" : "请格伦强化长剑", " <span>6 灰铁</span></button>") : '<div class="notice">这把剑已经磨得足够锋利。剩下的，要靠握剑的人。</div>');
    } else if (name === "shop") {
      title = "米洛的补给";
      html = '<div class="menu-meta" style="margin:0 0 21px"><span>出发前，把背包再检查一遍。</span><span>旧币 '.concat(s.inventory.coins, "</span></div>").concat(item("potion", "恢复药剂", "每瓶恢复 35 生命，最多携带 3 瓶。", "".concat(p.potions, "/3"), '<button class="small-button" data-buy="potion" '.concat(p.potions >= 3 || s.inventory.coins < 8 ? "disabled" : "", ">8 旧币</button>"))).concat(item("leaf", "苦叶膏", "下一个产生侵蚀的房间，增长减少 10。", "".concat(s.inventory.salve, "/1"), '<button class="small-button" data-buy="salve" '.concat(s.inventory.salve || s.inventory.coins < 5 ? "disabled" : "", ">5 旧币</button>"))).concat(item("leaf", "调制苦叶膏", "用一份苦叶，请米洛免费调制。", "".concat(s.inventory.leaf, " 叶"), '<button class="small-button" data-buy="craft" '.concat(!s.inventory.leaf || s.inventory.salve ? "disabled" : "", ">调制</button>")), '<div class="notice">旅店可免费恢复生命，并将药剂补至两瓶。米洛首次见面还会赠送一瓶。</div>');
    } else if (name === "map") {
      title = s.scene === "town" ? "暮边镇街道" : "灰风原野";
      if (s.scene === "town") {
        html = '<p>从西向东，一条被灯火照亮的街道。</p><div class="map-list">'.concat(PLACES.map((v, i) => '<div class="map-stop"><span>0'.concat(i + 1, "</span>").concat(icon(v.icon), "<strong>").concat(v.name, "</strong><small>").concat(Math.abs(p.x - v.x) < 400 ? "当前附近" : "", '</small><button class="small-button" data-travel="').concat(v.x, '" ').concat(s.tutorial.active ? "disabled" : "", ">前往</button></div>")).join(""), "</div>").concat(s.tutorial.active ? '<div class="notice">训练中请先留在木桩旁。完成训练后可使用街道导航。</div>' : '<div class="notice">可步行探索，也可点「前往」快速到达。东门会检查你的远征准备。</div>');
      } else {
        html = '<div class="map-list">'.concat(ROOMS.map((v, i) => '<div class="map-stop"><span>0'.concat(i + 1, "</span>").concat(icon(i === 3 ? "lamp" : i === 6 ? "shield" : "map"), "<strong>").concat(v.name, "</strong><small>").concat(i < s.run.room ? "已通过" : i === s.run.room ? s.run.clear ? "道路已开启" : "所在区域" : "尚未抵达", "</small></div>")).join(""), "</div><p>清除当前区域全部敌人，右侧道路才会开放。旧营火可以休息一次。</p>");
      }
    } else if (name === "journal") {
      title = "余烬初巡";
      html = '<span class="section-label">当前目标</span><div class="quest-detail">'.concat(QUESTS[s.stage], "</div><p>").concat(s.stage < 4 ? "小镇的人们记得你。先学会如何重新上路。" : s.stage < 8 ? "带回旧风车的备用核心，为暮边镇重新点亮界灯。" : s.stage < 10 ? "你带回了核心，也带回了一个沉甸甸的名字。" : ENDINGS[s.ending].lines.at(-1), '</p><ol class="quest-steps">').concat(QUESTS.slice(1).map((q, i) => '<li class="'.concat(i + 1 < s.stage ? "done" : i + 1 === s.stage ? "active" : "", '"><i>').concat(i + 1 < s.stage ? "✓" : i + 1 === s.stage ? "◇" : "·", "</i>").concat(q, "</li>")).join(""), "</ol>").concat(s.flags.memory ? '<div class="notice">记忆闪回：洛恩从界灯上取下碎片。血沿着指缝滴落，他没有松手。</div>' : "", '<button class="secondary" data-ui="help">重新查看操作说明 <span>→</span></button>');
    } else if (name === "records") {
      title = "灯下的对话";
      html = s.logs.length ? s.logs.slice().reverse().map((v) => '<div class="log-entry">'.concat(esc(v), "</div>")).join("") : "<p>暂时没有记录。去和镇上的人说说话吧。</p>";
    } else if (name === "settings") {
      title = "设置";
      html = "".concat(range("master", "主音量")).concat(range("music", "音乐")).concat(range("sfx", "音效")).concat(range("controls", "触控按钮透明度")).concat(toggle("shake", "屏幕震动")).concat(toggle("vibration", "设备振动")).concat(toggle("numbers", "伤害数字")).concat(toggle("assist", "援助模式", "受到的伤害减少 30%，不改变剧情和奖励。"), '<div class="setting-row"><label for="fps-setting">画面帧率<small>战斗逻辑始终按固定时间运行。</small></label><select id="fps-setting" data-setting="fps"><option value="60" ').concat(settings.fps === 60 ? "selected" : "", '>60 FPS</option><option value="30" ').concat(settings.fps === 30 ? "selected" : "", '>30 FPS · 省电</option></select></div><div class="setting-row"><label>语言</label><span>简体中文</span></div><div class="button-row"><button class="secondary" data-ui="export" ').concat(!s ? "disabled" : "", '>导出存档备份</button><button class="secondary" data-ui="import">导入存档</button></div><div class="button-row"><button class="secondary" data-ui="help">操作说明</button>').concat(window.AndroidBridge ? '<button class="secondary" data-ui="exit">保存并退出</button>' : "", '</div><p style="margin-top:15px;font-size:11px">存档保存在本机。卸载应用前，请先导出备份。</p>');
    } else if (name === "help") {
      title = "巡界者须知";
      html = '<div class="help-grid"><div><strong>移动</strong>左下摇杆<br><span>键盘 WASD / 方向键</span></div><div><strong>三段连击</strong>连续点击或按住攻击<br><span>键盘 J / 空格</span></div><div><strong>闪避</strong>向摇杆方向闪避；静止时后撤<br><span>键盘 K · 消耗 24 体力</span></div><div><strong>格挡与反击</strong>按住格挡，减伤；迎击瞬间按下可完美格挡<br><span>键盘 L · 持续消耗体力</span></div><div><strong>药剂</strong>右上角饮用药剂<br><span>键盘 H · 恢复 35 生命</span></div><div><strong>交谈 / 暂停</strong>靠近发光标记，点击交互<br><span>键盘 E / Esc 暂停</span></div></div><div class="notice">黄色「!」攻击可格挡；红色「× 破盾」必须闪避。完美格挡可以反弹弩箭，连续两次完美格挡能打破首领架势。体力在停止消耗 0.6 秒后恢复。</div><p>房间切换、剧情推进、物品变动都会自动保存。进入后台会暂停。倒下时保留全部旧币和关键物品，只损失本次获得的半数灰铁。</p>';
    } else if (name === "credits") {
      title = "灯火长明";
      html = '<div class="credits"><div class="eyebrow">D U S K B O U N D</div><h3>暮边镇 · 余烬初巡</h3><p>谨献给每一个在黄昏出发，<br>也愿意为别人留一盏灯的人。</p><p>世界与故事 · 《暮边镇》原始设定<br>游戏实现 · Codex 协作开发<br>主视觉 · AI 原创像素插画<br>场景、角色与声音 · 程序绘制与合成</p><p>第一版 · 完全离线 · 无广告 · 无内购</p></div>';
    } else return;
    showModal(name, title, html);
  }
  function item(art, name, description, amount, action = "") {
    return '<div class="item-row"><div class="item-art">'.concat(icon(art), '</div><div class="item-copy"><strong>').concat(name, "</strong><p>").concat(description, "</p></div><b>").concat(amount, "</b>").concat(action, "</div>");
  }
  function range(key, label) {
    return '<div class="setting-row"><label for="setting-'.concat(key, '">').concat(label, '</label><input id="setting-').concat(key, '" data-setting="').concat(key, '" type="range" min="').concat(key === "controls" ? 20 : 0, '" max="100" value="').concat(Math.round(settings[key] * 100), '" aria-label="').concat(label, '"></div>');
  }
  function toggle(key, label, desc = "") {
    return '<div class="setting-row"><label for="setting-'.concat(key, '">').concat(label).concat(desc ? "<small>".concat(desc, "</small>") : "", '</label><input id="setting-').concat(key, '" data-setting="').concat(key, '" type="checkbox" ').concat(settings[key] ? "checked" : "", "></div>");
  }
  function showDialog(d) {
    input.clear();
    currentDialog = d;
    dialogIndex = 0;
    $("dialog-layer").classList.remove("hidden");
    renderDialog();
  }
  function renderDialog() {
    const d = currentDialog;
    if (!d) return;
    $("dialog-speaker").textContent = d.speaker;
    $("dialog-text").textContent = d.lines[dialogIndex];
    $("dialog-index").textContent = "".concat(dialogIndex + 1, " / ").concat(d.lines.length);
    $("dialog-portrait").textContent = d.speaker.length <= 3 ? d.speaker[0] : "◇";
    $("dialog-choices").innerHTML = dialogIndex < d.lines.length - 1 ? '<button data-dialog-next>继续 <span aria-hidden="true">›</span></button>' : d.choices.map((ch) => '<button data-choice="'.concat(esc(ch.action), '">').concat(esc(ch.text), "</button>")).join("");
  }
  function advanceDialog() {
    if (!currentDialog) return;
    if (dialogIndex < currentDialog.lines.length - 1) {
      dialogIndex++;
      renderDialog();
      sound.play("ui");
    }
  }
  function showEnding(kind) {
    const e = ENDINGS[kind];
    showModal("ending", e.title, '<div class="credits"><div class="eyebrow">余 烬 已 燃</div><h3>'.concat(e.title, "</h3><p>").concat(e.lines.at(-1), '</p><p>第一章 · 余烬初巡 · 完</p><div class="notice">界灯重新燃起，小镇的人们开始走出家门。<br>你仍可以回到街道，交谈、强化长剑，或再次远征。</div><p style="font-size:12px">世界与故事 · 原始设定<br>游戏实现 · Codex 协作开发<br>美术 · AI 主视觉与程序像素绘制<br>音乐与音效 · 程序合成</p><button class="primary" data-ui="resume">回到灯火中的小镇</button></div>'), "第一章 · 余烬初巡");
  }
  function processSavesOnly() {
    if (game) saveGame();
  }
  function processEvents() {
    var _a2;
    if (!game) return;
    let save = false;
    for (const e of game.drain()) {
      if (e.type === "save") save = true;
      else if (e.type === "toast") showToast(e.text);
      else if (e.type === "sound") sound.play(e.name);
      else if (e.type === "dialog") showDialog(e.dialog);
      else if (e.type === "close-dialog") {
        currentDialog = null;
        $("dialog-layer").classList.add("hidden");
        input.clear();
      } else if (e.type === "menu") openMenu(e.name);
      else if (e.type === "ending") showEnding(e.ending);
      else if (e.type === "shake") renderer.shake = Math.max(renderer.shake, e.strength);
      else if (e.type === "vibrate" && settings.vibration) {
        try {
          if (window.AndroidBridge) window.AndroidBridge.vibrate(e.duration);
          else (_a2 = navigator.vibrate) == null ? void 0 : _a2.call(navigator, e.duration);
        } catch (e2) {
        }
      } else if (e.type === "region") {
        $("region-title").textContent = e.name;
        $("region-subtitle").textContent = e.subtitle;
        $("region").classList.add("hidden");
        void $("region").offsetWidth;
        $("region").classList.remove("hidden");
        clearTimeout(regionTimer);
        regionTimer = setTimeout(() => $("region").classList.add("hidden"), 3400);
      }
    }
    if (save) saveGame();
  }
  function refreshHud() {
    if (!game || onTitle) return;
    const s = game.s, p = s.player, r = s.run, boss = s.enemies.find((e) => e.kind === "boss"), near = game.nearby();
    $("hp-text").textContent = "".concat(Math.ceil(p.hp), " / ").concat(p.maxHp);
    $("hp-fill").style.width = p.hp / p.maxHp * 100 + "%";
    $("stamina-fill").style.width = p.stamina + "%";
    $("corruption-fill").style.width = r.corruption + "%";
    $("corruption-text").textContent = r.corruption;
    $("potion-count").textContent = p.potions;
    $("corruption-row").classList.toggle("hidden", s.scene !== "dungeon");
    $("boss-hud").classList.toggle("hidden", !boss);
    if (boss) {
      $("boss-fill").style.width = boss.hp / 620 * 100 + "%";
      $("boss-value").textContent = Math.ceil(boss.hp) + " / 620";
      $("boss-phase").textContent = boss.phase === 2 ? "Ⅱ · 灯灭之时" : "Ⅰ · 最后的命令";
    }
    const key = [s.scene, r.room, s.stage, s.ending, Math.floor(p.x / 500)].join(":");
    if (key !== hudLast) {
      hudLast = key;
      $("quest-text").textContent = QUESTS[s.stage];
      $("place-name").textContent = s.scene === "town" ? "暮边镇" : ROOMS[r.room].name;
      $("place-subtitle").textContent = s.scene === "town" ? s.ending ? "余烬已燃" : "黄昏 · 界灯尚明" : "灰风原野 · ".concat(r.room + 1, " / 7");
      $("room-dots").innerHTML = s.scene === "dungeon" ? ROOMS.map((_, i) => '<i class="'.concat(i <= r.room ? "done" : "", '"></i>')).join("") : "";
    }
    $("coins-text").textContent = "旧币 " + s.inventory.coins;
    $("iron-text").textContent = "灰铁 " + s.inventory.iron;
    $("tutorial").classList.toggle("hidden", !s.tutorial.active);
    if (s.tutorial.active) $("tutorial-text").textContent = game.tutorialHint();
    $("interact").classList.toggle("hidden", !near || !!menu || !!currentDialog);
    if (near) $("interact-label").textContent = near.label;
    $("attack").style.opacity = p.stamina < 8 ? 0.5 : 1;
    $("dodge").style.opacity = p.stamina < 24 || game.p.dodgeCooldown > 0 ? 0.5 : 1;
    const controlVisible = !onTitle && !currentDialog && !menu;
    $("touch-controls").style.visibility = controlVisible ? "visible" : "hidden";
  }
  function importSave(raw) {
    if (raw.length > 1024 * 1024) {
      showToast("存档文件过大，未导入");
      return;
    }
    let parsed;
    try {
      parsed = decodeSave(raw);
    } catch (e) {
      showToast("存档无效或校验失败，当前旅程未改变", 6e3);
      return;
    }
    const buttonId = "confirm-import";
    showModal("import-confirm", "恢复备份", "<p>将恢复这份旅程：".concat(esc(QUESTS[parsed.stage]), "<br>所在位置：").concat(parsed.scene === "town" ? "暮边镇" : ROOMS[parsed.run.room].name, "<br>旅程时间：").concat(Math.floor(parsed.playTime / 60), ' 分钟</p><div class="notice">确认后替换本机当前存档。</div><div class="button-row"><button class="secondary" data-ui="close">取消</button><button id="').concat(buttonId, '" class="primary">恢复这份旅程</button></div>'));
    $(buttonId).addEventListener("click", () => {
      try {
        const s = store.import(raw);
        saved = s;
        begin(s);
        showToast("存档已恢复");
      } catch (e) {
        showToast(e.message, 6e3);
      }
    });
  }
  function exportSave() {
    var _a2;
    const s = (game == null ? void 0 : game.s) || saved;
    if (!s) return;
    const raw = store.export(s);
    try {
      if ((_a2 = window.AndroidBridge) == null ? void 0 : _a2.exportSave) {
        window.AndroidBridge.exportSave(raw);
        return;
      }
      const blob = new Blob([raw], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url;
      a.download = "暮边镇-存档-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5e3);
      showToast("存档备份已导出");
    } catch (e) {
      showToast("无法导出，请检查设备的文件保存权限");
    }
  }
  function importPicker() {
    var _a2;
    if ((_a2 = window.AndroidBridge) == null ? void 0 : _a2.importSave) window.AndroidBridge.importSave();
    else $("import-file").click();
  }
  async function requestFullscreen(explicit = true) {
    var _a2, _b, _c;
    if (window.AndroidBridge) return;
    try {
      if (explicit && !document.fullscreenElement) await ((_b = (_a2 = document.documentElement).requestFullscreen) == null ? void 0 : _b.call(_a2));
      if (document.fullscreenElement && ((_c = screen.orientation) == null ? void 0 : _c.lock)) await screen.orientation.lock("landscape");
    } catch (e) {
      if (explicit) showToast("请将手机横过来；也可用浏览器菜单开启全屏。");
    }
  }
  $("new-game").addEventListener("click", () => {
    sound.unlock();
    requestNew();
  });
  $("continue-game").addEventListener("click", () => {
    sound.unlock();
    if (saved) begin(saved);
  });
  $("title-settings").addEventListener("click", () => openMenu("settings"));
  $("title-help").addEventListener("click", () => openMenu("help"));
  $("title-credits").addEventListener("click", () => openMenu("credits"));
  $("pause").addEventListener("click", togglePause);
  $("bag-button").addEventListener("click", () => openMenu("inventory"));
  $("map-button").addEventListener("click", () => openMenu("map"));
  $("quest-button").addEventListener("click", () => openMenu("journal"));
  $("interact").addEventListener("click", () => {
    game == null ? void 0 : game.interact();
    processEvents();
  });
  $("close-modal").addEventListener("click", () => hideModal());
  $("dialog-text").addEventListener("click", advanceDialog);
  $("fullscreen-button").addEventListener("click", () => requestFullscreen(true));
  $("dialog-layer").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b == null ? void 0 : b.hasAttribute("data-choice")) {
      const action = b.dataset.choice;
      game == null ? void 0 : game.choose(action);
      processEvents();
    } else if ((b == null ? void 0 : b.hasAttribute("data-dialog-next")) || !b) advanceDialog();
  });
  $("modal-body").addEventListener("click", (e) => {
    var _a2;
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    sound.unlock();
    sound.play("ui");
    if (b.dataset.buy) {
      game.buy(b.dataset.buy);
      processEvents();
      openMenu("shop");
      return;
    }
    if (b.dataset.travel) {
      game.travel(Number(b.dataset.travel));
      hideModal();
      processEvents();
      return;
    }
    const action = b.dataset.ui;
    if (!action) return;
    if (action === "close" || action === "resume") {
      hideModal();
      return;
    }
    if (action === "confirm-new") {
      startNew();
      return;
    }
    if (action === "use-potion") {
      hideModal();
      game.potion();
      return;
    }
    if (action === "use-salve") {
      game.useSalve();
      processEvents();
      openMenu("inventory");
      return;
    }
    if (action === "upgrade") {
      game.upgrade();
      processEvents();
      openMenu("equipment");
      return;
    }
    if (action === "confirm-title") {
      showModal("confirm", "返回标题", '<p>当前旅程会自动保存。下次从标题选择「继续旅程」，即可接着游玩。</p><div class="button-row"><button class="secondary" data-ui="close">留在这里</button><button class="primary" data-ui="title">保存并返回</button></div>');
      return;
    }
    if (action === "title") {
      backToTitle();
      return;
    }
    if (action === "confirm-retreat") {
      showModal("confirm", "撤回灯火之中", '<p>你会带着已经获得的物资返回小镇。下次远征从第一间房重新出发。</p><div class="button-row"><button class="secondary" data-ui="close">继续远征</button><button class="primary" data-ui="retreat">安全撤回</button></div>');
      return;
    }
    if (action === "retreat") {
      hideModal();
      game.retreat();
      processEvents();
      return;
    }
    if (action === "export") {
      exportSave();
      return;
    }
    if (action === "import") {
      importPicker();
      return;
    }
    if (action === "exit") {
      if (game) saveGame();
      (_a2 = window.AndroidBridge) == null ? void 0 : _a2.exitApp();
      return;
    }
    openMenu(action);
  });
  $("modal-body").addEventListener("input", (e) => {
    const k = e.target.dataset.setting;
    if (!k) return;
    settings[k] = e.target.type === "checkbox" ? e.target.checked : k === "fps" ? Number(e.target.value) : Number(e.target.value) / 100;
    applySettings();
    try {
      storage.setItem("duskbound.settings", JSON.stringify(settings));
    } catch (e2) {
    }
    if (game) saveGame();
    else if (saved) {
      saved.settings = __spreadValues({}, settings);
      store.save(saved);
    }
  });
  $("import-file").addEventListener("change", async (e) => {
    var _a2;
    const f = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 1024 * 1024) {
      showToast("存档文件过大，未导入");
      return;
    }
    try {
      importSave(await f.text());
    } catch (e2) {
      showToast("无法读取这个文件");
    }
  });
  window.addEventListener("native-import", (e) => {
    if (typeof e.detail === "string") importSave(e.detail);
  });
  window.addEventListener("native-message", (e) => {
    if (typeof e.detail === "string") showToast(e.detail);
  });
  window.addEventListener("native-back", () => {
    if (onTitle && !menu) {
      openMenu("settings");
    } else togglePause();
  });
  function backgroundPause() {
    input.clear();
    if (game && !onTitle) {
      game.pause();
      processEvents();
      saveGame();
      if (!menu) openMenu("pause");
    }
    sound.suspend();
    accumulator = 0;
    lastFrame = performance.now();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) backgroundPause();
    else {
      sound.unlock();
      lastFrame = performance.now();
      accumulator = 0;
    }
  });
  window.addEventListener("native-pause", backgroundPause);
  window.addEventListener("native-resume", () => {
    sound.unlock();
    lastFrame = performance.now();
    accumulator = 0;
  });
  window.addEventListener("pagehide", backgroundPause);
  window.addEventListener("resize", () => {
    renderer.resize();
    renderElapsed = 1e9;
    if (window.innerWidth < window.innerHeight && !onTitle) backgroundPause();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && menu) {
      const focusable = [...$("modal-layer").querySelectorAll("button:not(:disabled),input,select")];
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last == null ? void 0 : last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first == null ? void 0 : first.focus();
      }
    }
  });
  var renderElapsed = 0;
  function frame(now) {
    const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1e3) : 0;
    lastFrame = now;
    renderElapsed += dt;
    if (game && !onTitle) {
      input.update(dt);
      accumulator += dt;
      let steps = 0;
      while (accumulator >= 1 / 60 && steps < 6) {
        game.update(1 / 60);
        accumulator -= 1 / 60;
        steps++;
      }
      processEvents();
      const frozen = game.paused || !!game.dialog || !!menu;
      if (renderElapsed >= (frozen ? 0.5 : 1 / settings.fps)) {
        renderer.draw(game, frozen ? 1 / 60 : renderElapsed);
        refreshHud();
        renderElapsed = 0;
      }
      sound.tick(game.s.scene === "town" ? "town" : game.s.run.room === 6 ? "boss" : "dungeon", game.paused || !!game.dialog);
    } else {
      sound.tick("title", !!menu);
      accumulator = 0;
    }
    requestAnimationFrame(frame);
  }
  refreshTitle();
  if (store.recovered) setTimeout(() => showToast("主存档损坏，已从上一份备份恢复旅程。", 6500), 500);
  if (store.error) setTimeout(() => showToast(store.error, 7500), 500);
  requestAnimationFrame(frame);
  var _a;
  (_a = window.__duskboundBoot) == null ? void 0 : _a.ready();
})();
