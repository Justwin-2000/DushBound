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

  // web/src/v2/data.js
  var SAMPLE = ["P01", "S01", "M01", "W01"];
  var WEAPONS = {};
  var rows = [
    ["P01", "驿站手枪", "白", 8, 1, 0.24, 0, 260, 150, "免费单发"],
    ["P02", "双音左轮", "绿", 9, 2, 0.4, 1, 290, 160, "两发相隔 .06 秒"],
    ["P03", "收信人", "蓝", 15, 1, 0.42, 2, 250, 170, "标记供下一次武器命中消耗"],
    ["S01", "破门散弹", "白", 5, 5, 0.7, 2, 230, 85, "26°散布、近距击退"],
    ["S02", "盐雨", "绿", 4, 7, 0.75, 3, 210, 100, "两侧弹反弹一次"],
    ["S03", "风箱", "紫", 6, 6, 0.85, 4, 240, 100, "锥区清普通弹"],
    ["A01", "铆钉枪", "白", 4, 1, 0.1, 1, 320, 140, "墙面钉痕"],
    ["A02", "织雨机", "蓝", 3, 2, 0.12, 1, 300, 150, "交替双线"],
    ["A03", "夜班哨兵", "紫", 5, 1, 0.09, 1, 330, 160, "连射两秒过热"],
    ["B01", "折返弩", "绿", 18, 1, 0.65, 0, 220, 130, "去回各一击"],
    ["B02", "钟针步枪", "蓝", 34, 1, 0.9, 3, 480, 220, "贯穿一个目标"],
    ["B03", "地平线", "紫", 50, 1, 1.2, 5, 520, 240, "蓄力 .45 秒"],
    ["M01", "巡界短剑", "白", 15, 1, 0.24, 0, 0, 22, "100°扇形，有效帧清普通弹"],
    ["M02", "修灯扳手", "绿", 28, 1, 0.55, 0, 0, 24, "80°扇形、击退8"],
    ["M03", "月牙回刃", "紫", 12, 1, 0.45, 1, 180, 75, "去回各一击，不清弹"],
    ["W01", "线灯杖", "白", 10, 1, 0.3, 1, 190, 145, "直线光针"],
    ["W02", "冷苔杖", "蓝", 9, 1, 0.32, 2, 180, 145, "三层寒冻结"],
    ["W03", "合唱灯", "紫", 7, 3, 0.5, 3, 160, 150, "弯曲声弹，不追踪"],
    ["X01", "邮筒炮", "绿", 30, 1, 0.9, 4, 150, 130, "半径18爆炸"],
    ["X02", "温室瓶", "蓝", 8, 1, 0.75, 3, 0, 100, "落地苔区"],
    ["X03", "失重炉", "紫", 20, 1, 1.1, 5, 130, 120, "拉近后爆炸"],
    ["O01", "雨伞枪", "绿", 6, 3, 0.45, 1, 240, 110, "第四击前方清弹"],
    ["O02", "面包投石器", "蓝", 18, 1, 0.6, 1, 170, 110, "弹墙一次"],
    ["O03", "借来的月亮", "紫", 5, 1, 0.15, 1, 150, 90, "最多六个绕行光球"]
  ];
  for (const [id, name, rarity, damage, pellets, interval, energy, speed, range, behavior] of rows) WEAPONS[id] = { id, name, rarity, damage, pellets, interval, energy, speed, range, behavior, implemented: SAMPLE.includes(id) };
  var CLASSES = [
    { id: "keeper", name: "守灯人 · 巡界者", hp: 6, shield: 6, energy: 120, speed: 112, skill: "灯环", cooldown: 10, implemented: true },
    { id: "ranger", name: "游铳手 · 岚", hp: 5, shield: 4, energy: 140, speed: 124, skill: "换位射击", cooldown: 7, implemented: false },
    { id: "engineer", name: "机匠 · 朔", hp: 7, shield: 5, energy: 110, speed: 104, skill: "展开炮台", cooldown: 14, implemented: false },
    { id: "weaver", name: "织灯师 · 葵", hp: 5, shield: 5, energy: 160, speed: 110, skill: "缝光", cooldown: 11, implemented: false }
  ];
  var ENEMIES = { rat: { name: "雾噬鼠", hp: 18, speed: 42, r: 7, range: 17, tell: 0.45, damage: 1 }, dog: { name: "裂爪犬", hp: 45, speed: 35, r: 9, range: 100, tell: 0.7, damage: 2 }, archer: { name: "空壳弩手", hp: 28, speed: 24, r: 8, range: 175, tell: 0.65, damage: 1 } };
  var ROOM = { id: "postal-yard", name: "灰风 · 旧邮亭试炼庭", bounds: { x: 24, y: 54, w: 592, h: 274 }, walls: [{ x: 190, y: 110, w: 32, h: 56 }, { x: 385, y: 188, w: 64, h: 32 }], spawn: { x: 92, y: 238 } };
  var DEFAULT_KEYS = { up: "w", down: "s", left: "a", right: "d", dash: " ", skill: "q", swap: "e", interact: "f" };
  var PALETTE = { ink: "#20232f", shadow: "#39465d", stone: "#a68b73", gold: "#e7b96d", white: "#f2e4c5", red: "#9d5157", teal: "#4b858a", green: "#6b8b6c", purple: "#9673b5", bullet: "#f47d78", floor: "#697568", edge: "#465653" };

  // web/src/v2/geometry.js
  var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  function segmentCircle(a, b, c, r) {
    const dx = b.x - a.x, dy = b.y - a.y, ox = a.x - c.x, oy = a.y - c.y, A = dx * dx + dy * dy, C = ox * ox + oy * oy - r * r;
    if (C <= 0) return 0;
    if (A === 0) return null;
    const B = 2 * (ox * dx + oy * dy), d = B * B - 4 * A * C;
    if (d < 0) return null;
    const t = (-B - Math.sqrt(d)) / (2 * A);
    return t >= 0 && t <= 1 ? t : null;
  }
  function segmentBox(a, b, rect, r = 0) {
    let enter2 = 0, exit = 1;
    for (const axis of ["x", "y"]) {
      const lo = rect[axis] - r, hi = rect[axis] + (axis === "x" ? rect.w : rect.h) + r, d = b[axis] - a[axis];
      if (Math.abs(d) < 1e-9) {
        if (a[axis] < lo || a[axis] > hi) return null;
      } else {
        const u = (lo - a[axis]) / d, v = (hi - a[axis]) / d;
        enter2 = Math.max(enter2, Math.min(u, v));
        exit = Math.min(exit, Math.max(u, v));
        if (enter2 > exit) return null;
      }
    }
    return enter2;
  }
  function firstWall(a, b, walls, r = 0) {
    let best = null;
    for (const wall of walls) {
      const t = segmentBox(a, b, wall, r);
      if (t !== null && (best === null || t < best)) best = t;
    }
    return best;
  }
  var visible = (a, b, walls, r = 0) => firstWall(a, b, walls, r) === null;
  function nextWaypoint(start, goal, walls, r = 7) {
    const escape = (p) => {
      for (const w of walls) {
        const left = w.x - r - 0.5, right = w.x + w.w + r + 0.5, top = w.y - r - 0.5, bottom = w.y + w.h + r + 0.5;
        if (p.x > left && p.x < right && p.y > top && p.y < bottom) {
          return [{ x: left, y: p.y }, { x: right, y: p.y }, { x: p.x, y: top }, { x: p.x, y: bottom }].sort((a, b) => distance(a, p) - distance(b, p))[0];
        }
      }
      return p;
    };
    const origin = escape(start);
    if (origin !== start) return origin;
    goal = escape(goal);
    if (visible(start, goal, walls, r)) return goal;
    const nodes = [start, goal];
    for (const w of walls) for (const x of [w.x - r - 2, w.x + w.w + r + 2]) for (const y of [w.y - r - 2, w.y + w.h + r + 2]) nodes.push({ x, y });
    const cost = nodes.map(() => Infinity), previous = nodes.map(() => -1), visited = /* @__PURE__ */ new Set();
    cost[0] = 0;
    for (let step = 0; step < nodes.length; step++) {
      let u = -1;
      for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (u < 0 || cost[i] < cost[u])) u = i;
      if (u < 0 || cost[u] === Infinity) break;
      if (u === 1) {
        let next = 1;
        while (previous[next] > 0) next = previous[next];
        return nodes[next];
      }
      visited.add(u);
      for (let v = 0; v < nodes.length; v++) {
        if (visited.has(v) || !visible(nodes[u], nodes[v], walls, r)) continue;
        const c = cost[u] + distance(nodes[u], nodes[v]);
        if (c < cost[v]) {
          cost[v] = c;
          previous[v] = u;
        }
      }
    }
    return goal;
  }
  function inSector(origin, target, direction, range, arc, r = 0) {
    const d = distance(origin, target);
    return d <= range + r + 2 && (d <= r || Math.abs(angleDiff(Math.atan2(target.y - origin.y, target.x - origin.x), direction)) <= arc / 2 + Math.asin(Math.min(1, (r + 2) / Math.max(1, d))));
  }
  function moveCircle(entity, dx, dy, walls, bounds, r = 7) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
    const valid = (x, y) => walls.every((w) => {
      const nx = clamp(x, w.x, w.x + w.w), ny = clamp(y, w.y, w.y + w.h);
      return Math.hypot(x - nx, y - ny) >= r - 1e-3;
    });
    for (let i = 0; i < steps; i++) {
      const x = clamp(entity.x + dx / steps, bounds.x + r, bounds.x + bounds.w - r);
      if (valid(x, entity.y)) entity.x = x;
      const y = clamp(entity.y + dy / steps, bounds.y + r, bounds.y + bounds.h - r);
      if (valid(entity.x, y)) entity.y = y;
    }
  }

  // web/src/v2/game.js
  function newSession(mode = "practice", weapons = ["M01", "P01"]) {
    return {
      mode,
      clock: 0,
      wave: 0,
      preview: mode === "trial" ? 0.8 : 0,
      done: false,
      dead: false,
      rewarded: [],
      copper: 0,
      nextId: 20,
      shots: 0,
      hits: 0,
      damageTaken: 0,
      dashes: 0,
      cleared: 0,
      player: __spreadProps(__spreadValues({}, ROOM.spawn), { hp: 6, shield: 6, energy: 120, potions: 1, angle: 0, active: 1, weapons: [...weapons], cooldowns: [0, 0], switchTime: 0, dashCharges: 2, dashRecharge: 0, dashTime: 0, dashX: 0, dashY: 0, invulnerable: 0, lastHurt: -10, shieldTick: 0, skillCooldown: 0, ring: 0, breakBoost: 0, melee: null }),
      enemies: [],
      bullets: [],
      pendingShots: [],
      targetId: null,
      targetDelay: 0,
      targetsHit: [],
      usedSkill: false
    };
  }
  var Arena = class {
    constructor(session = newSession()) {
      this.s = session;
      this.input = { x: 0, y: 0 };
      this.events = [];
      this.effects = [];
      this.paused = false;
      this.manualTime = 0;
      this.manualAngle = 0;
      this.manualHeld = false;
      this.attackHeld = false;
      this.repeatAt = 0;
      this.bufferDash = 0;
      if (!session.enemies.length && session.mode === "practice") this.addTargets();
    }
    get p() {
      return this.s.player;
    }
    get weapon() {
      return WEAPONS[this.p.weapons[this.p.active]];
    }
    event(type, data = {}) {
      this.events.push(__spreadValues({ type }, data));
    }
    drain() {
      const events = this.events;
      this.events = [];
      return events;
    }
    pause() {
      this.paused = true;
      this.clearInput();
    }
    resume() {
      this.clearInput();
      this.paused = false;
    }
    clearInput() {
      this.input = { x: 0, y: 0 };
      this.attackHeld = false;
      this.repeatAt = 0;
      this.manualHeld = false;
      this.bufferDash = 0;
    }
    addTargets() {
      this.s.enemies = [["static", 300, 98], ["strafe", 472, 109], ["orbit", 518, 249], ["cover", 300, 243]].map(([motion, x, y], i) => ({ id: i + 1, kind: "target", motion, x: x + (motion === "orbit" ? 26 : 0), y, ox: x, oy: y, hp: 40, maxHp: 40, r: 8, state: "idle", timer: 0, angle: 0, tx: x, ty: y, flash: 0, stun: 0, vx: 0, vy: 0, hit: [] }));
    }
    aim(angle, held = false) {
      this.manualAngle = angle;
      this.manualTime = 0.25;
      this.manualHeld = held;
      this.p.angle = angle;
      this.s.targetId = null;
    }
    updateAim(dt) {
      const s = this.s, p = this.p;
      s.targetDelay = Math.max(0, s.targetDelay - dt);
      if (this.manualHeld || this.manualTime > 0) {
        this.manualTime = Math.max(0, this.manualTime - dt);
        p.angle = this.manualAngle;
        s.targetId = null;
        return;
      }
      const candidates = s.enemies.filter((e) => e.hp > 0 && e.state !== "spawn" && distance(p, e) <= this.weapon.range + e.r && visible(p, e, ROOM.walls, this.weapon.id === "M01" ? 0 : this.weapon.id === "S01" ? 2 : 3));
      let target = candidates.find((e) => e.id === s.targetId);
      if (!target) {
        s.targetId = null;
        if (s.targetDelay > 0) return;
        candidates.sort((a, b) => this.score(a) - this.score(b));
        target = candidates[0];
        if (target) {
          s.targetId = target.id;
          s.targetDelay = 0.12;
        }
      }
      if (target) {
        const lead = this.weapon.id === "P01" ? Math.min(0.12, distance(p, target) / this.weapon.speed) : 0;
        p.angle = Math.atan2(target.y + (target.vy || 0) * lead - p.y, target.x + (target.vx || 0) * lead - p.x);
      }
    }
    score(e) {
      return distance(this.p, e) + Math.abs(angleDiff(Math.atan2(e.y - this.p.y, e.x - this.p.x), this.p.angle)) * 25 - (distance(this.p, e) < 35 ? 25 : 0);
    }
    pressAttack() {
      if (this.paused || this.s.dead || this.s.done) return false;
      this.attackHeld = true;
      this.updateAim(0);
      const fired = this.fire();
      this.repeatAt = this.weapon.interval;
      return fired;
    }
    releaseAttack() {
      this.attackHeld = false;
    }
    fire() {
      const p = this.p, w = this.weapon;
      if (this.paused || this.s.dead || this.s.done || p.switchTime > 0 || p.cooldowns[p.active] > 1e-8 || p.dashTime > 0) return false;
      if (p.energy < w.energy) {
        this.event("empty");
        return false;
      }
      p.energy -= w.energy;
      p.cooldowns[p.active] = w.interval;
      this.s.shots++;
      const origin = { x: p.x, y: p.y };
      if (w.id === "M01") p.melee = { angle: p.angle, time: 0, hit: [], cleared: [] };
      else {
        const group = this.s.nextId++;
        for (let i = 0; i < w.pellets; i++) {
          const angle = p.angle + (w.pellets === 1 ? 0 : (i / (w.pellets - 1) - 0.5) * 26 * Math.PI / 180);
          this.s.bullets.push({ id: this.s.nextId++, group, team: "friend", kind: w.id === "W01" ? "needle" : "round", x: origin.x, y: origin.y, vx: Math.cos(angle) * w.speed, vy: Math.sin(angle) * w.speed, damage: w.damage, r: w.id === "S01" ? 2 : 3, remaining: w.range, pierce: 0, hit: [], source: w.id });
        }
      }
      this.effects.push({ kind: "muzzle", x: p.x, y: p.y, angle: p.angle, life: 0.08, weapon: w.id });
      this.event("shot", { weapon: w.id });
      return true;
    }
    swap() {
      if (this.paused || this.s.dead) return false;
      this.attackHeld = false;
      this.repeatAt = 0;
      this.p.active = 1 - this.p.active;
      this.p.switchTime = 0.12;
      this.p.melee = null;
      this.s.targetId = null;
      this.event("swap");
      return true;
    }
    emergencyWeapon() {
      if (this.p.energy > 0 || this.p.weapons.some((id) => WEAPONS[id].energy === 0)) return false;
      this.attackHeld = false;
      this.p.weapons[this.p.active] = "P01";
      this.p.switchTime = 0.12;
      this.p.melee = null;
      return true;
    }
    equip(id, slot) {
      if (!SAMPLE.includes(id) || ![0, 1].includes(slot) || this.s.mode === "trial" && !this.s.done) return false;
      if (this.p.weapons[1 - slot] === id) return false;
      this.clearInput();
      this.p.weapons[slot] = id;
      this.p.cooldowns[slot] = 0;
      this.p.melee = null;
      this.s.targetId = null;
      return true;
    }
    dash() {
      const p = this.p;
      if (this.paused || this.s.dead || this.s.done) return false;
      if (p.switchTime > 0 || p.melee && p.melee.time < 0.04) {
        this.bufferDash = 0.1;
        return false;
      }
      if (p.dashCharges <= 0 || p.dashTime > 0) return false;
      const d = Math.hypot(this.input.x, this.input.y), a = d > 0 ? Math.atan2(this.input.y, this.input.x) : p.angle;
      p.dashX = Math.cos(a);
      p.dashY = Math.sin(a);
      p.dashTime = 0.18;
      p.invulnerable = Math.max(p.invulnerable, 0.12);
      p.dashCharges--;
      if (!p.dashRecharge) p.dashRecharge = 2.8;
      p.melee = null;
      this.s.dashes++;
      this.event("dash");
      return true;
    }
    skill() {
      const p = this.p;
      if (this.paused || this.s.dead || this.s.done || p.skillCooldown > 0) return false;
      p.skillCooldown = 10;
      p.ring = 2;
      this.s.usedSkill = true;
      this.event("skill");
      return true;
    }
    potion() {
      if (this.s.mode === "trial" && !this.s.done) return false;
      if (this.p.hp >= 6 || this.p.potions === 0) return false;
      this.p.potions--;
      this.p.hp = Math.min(6, this.p.hp + 2);
      return true;
    }
    hurt(damage, group) {
      const p = this.p;
      if (this.s.dead || p.invulnerable > 0 || this.s.mode === "practice") return false;
      const before = p.shield;
      const amount = p.ring > 0 ? damage * 0.5 : damage;
      p.shield = Math.max(0, p.shield - amount);
      p.hp = Math.max(0, p.hp - Math.max(0, amount - before));
      p.invulnerable = 0.55;
      p.lastHurt = this.s.clock;
      p.shieldTick = 0;
      if (before > 0 && p.shield === 0) {
        p.breakBoost = 1;
        p.invulnerable = Math.max(0.35, p.invulnerable);
      }
      this.s.damageTaken += amount;
      this.event("hurt", { group });
      if (p.hp === 0) {
        this.s.dead = true;
        this.clearInput();
        this.s.bullets = [];
        this.event("dead");
      }
      return true;
    }
    hitEnemy(e, damage, angle, knock = 3) {
      if (e.hp <= 0) return;
      e.hp = Math.max(0, e.hp - damage);
      e.flash = 0.035;
      e.stun = 0.025;
      this.s.hits++;
      if (e.kind === "target" && !this.s.targetsHit.includes(e.motion)) this.s.targetsHit.push(e.motion);
      if (e.kind !== "target") moveCircle(e, Math.cos(angle) * knock, Math.sin(angle) * knock, ROOM.walls, ROOM.bounds, e.r);
      this.effects.push({ kind: "hit", x: e.x, y: e.y, angle, life: 0.12 });
      const number = this.effects.find((f) => f.kind === "number" && f.id === e.id && f.life > 0.57);
      if (number) number.value += damage;
      else {
        const old = this.effects.filter((f) => f.kind === "number" && f.id === e.id);
        if (old.length >= 2) old[0].life = 0;
        this.effects.push({ kind: "number", id: e.id, x: e.x, y: e.y - 26, value: damage, life: 0.65 });
      }
      this.event("hit", { material: e.kind === "archer" ? "metal" : e.kind === "target" ? "wood" : "mist" });
      if (e.hp === 0) {
        this.effects.push({ kind: "death", x: e.x, y: e.y, life: 0.35 });
        this.event("kill");
      }
    }
    spawnWave() {
      const kinds = this.s.wave === 0 ? ["rat", "rat", "archer", "dog"] : ["dog", "archer", "rat"];
      const spots = [{ x: 535, y: 100 }, { x: 510, y: 265 }, { x: 310, y: 90 }, { x: 310, y: 283 }, { x: 80, y: 82 }, { x: 80, y: 288 }];
      const used = [];
      this.s.enemies = kinds.map((kind, i) => {
        const spot = spots.filter((pos) => distance(pos, this.p) >= 80 && !used.includes(pos)).sort((a, b) => distance(b, this.p) - distance(a, this.p))[0];
        if (!spot) throw Error("没有安全的生成位置");
        used.push(spot);
        const d = ENEMIES[kind];
        return { id: this.s.nextId++, kind, x: spot.x, y: spot.y, ox: spot.x, oy: spot.y, hp: d.hp, maxHp: d.hp, r: d.r, state: "spawn", timer: 0.8, angle: 0, tx: spot.x, ty: spot.y, flash: 0, stun: 0, vx: 0, vy: 0, hit: [] };
      });
      this.s.preview = 0;
      this.event("wave");
    }
    updateEnemy(e, dt) {
      const s = this.s, p = this.p;
      if (e.hp <= 0) {
        if (e.kind === "target") {
          e.timer += dt;
          if (e.timer > 1.5) {
            e.hp = e.maxHp;
            e.timer = 0;
          }
        }
        return;
      }
      e.flash = Math.max(0, e.flash - dt);
      if (e.stun > 0) {
        e.stun -= dt;
        return;
      }
      if (e.kind === "target") {
        const old2 = { x: e.x, y: e.y };
        const t = s.clock;
        e.x = e.ox + (e.motion === "strafe" ? Math.sin(t * 1.6) * 40 : e.motion === "orbit" ? Math.cos(t) * 26 : e.motion === "cover" ? Math.sin(t * 0.7) * 52 : 0);
        e.y = e.oy + (e.motion === "orbit" ? Math.sin(t) * 24 : 0);
        e.vx = (e.x - old2.x) / dt;
        e.vy = (e.y - old2.y) / dt;
        return;
      }
      const d = ENEMIES[e.kind];
      e.timer -= dt;
      if (e.state === "spawn") {
        if (e.timer <= 0) e.state = "chase";
        return;
      }
      if (e.state === "recover") {
        if (e.timer <= 0) e.state = "chase";
        return;
      }
      if (e.state === "charge") {
        moveCircle(e, Math.cos(e.angle) * 190 * dt, Math.sin(e.angle) * 190 * dt, ROOM.walls, ROOM.bounds, e.r);
        if (distance(p, e) <= e.r + 5) this.hurt(2, e.id);
        if (e.timer <= 0) {
          e.state = "recover";
          e.timer = 0.9;
        }
        return;
      }
      if (e.state === "windup") {
        if (e.timer > 0) return;
        if (e.kind === "archer") {
          const group = s.nextId++;
          for (let i = -1; i <= 1; i++) {
            const a = e.angle + i * 0.23;
            s.bullets.push({ id: s.nextId++, group, team: "enemy", kind: "round", x: e.x, y: e.y, vx: Math.cos(a) * 78, vy: Math.sin(a) * 78, damage: 1, r: 2.5, remaining: 420, pierce: 0, hit: [], source: "archer" });
          }
          e.state = "recover";
          e.timer = 1.25;
        } else if (e.kind === "dog") {
          e.state = "charge";
          e.timer = 0.48;
        } else {
          if (distance(p, e) < 23 && visible(e, p, ROOM.walls)) this.hurt(1, e.id);
          e.state = "recover";
          e.timer = 0.8;
        }
        return;
      }
      const dist = distance(e, p);
      e.angle = Math.atan2(p.y - e.y, p.x - e.x);
      if (dist <= d.range && visible(e, p, ROOM.walls, e.kind === "archer" ? 2.5 : e.r)) {
        e.state = "windup";
        e.timer = d.tell;
        e.tx = p.x;
        e.ty = p.y;
        return;
      }
      const speed = d.speed;
      const old = { x: e.x, y: e.y }, waypoint = nextWaypoint(e, p, ROOM.walls, e.r);
      const heading = Math.atan2(waypoint.y - e.y, waypoint.x - e.x);
      moveCircle(e, Math.cos(heading) * speed * dt, Math.sin(heading) * speed * dt, ROOM.walls, ROOM.bounds, e.r);
      e.vx = (e.x - old.x) / dt;
      e.vy = (e.y - old.y) / dt;
    }
    updateBullets(dt) {
      const p = this.p, s = this.s;
      const packets = /* @__PURE__ */ new Map();
      for (const b of s.bullets) {
        if (b.remaining <= 0) continue;
        const a = { x: b.x, y: b.y };
        const length = Math.min(b.remaining, Math.hypot(b.vx, b.vy) * dt), angle = Math.atan2(b.vy, b.vx), z = { x: a.x + Math.cos(angle) * length, y: a.y + Math.sin(angle) * length };
        const wall = firstWall(a, z, ROOM.walls, b.r);
        let stop = wall === null ? 1 : wall;
        if (b.team === "friend") {
          const hits = s.enemies.filter((e) => e.hp > 0 && e.state !== "spawn" && !b.hit.includes(e.id)).map((e) => ({ e, t: segmentCircle(a, z, e, e.r + b.r) })).filter((o) => o.t !== null && o.t < stop).sort((x, y) => x.t - y.t);
          for (const h of hits) {
            this.hitEnemy(h.e, b.damage, angle, b.source === "S01" ? 5 : 3);
            b.hit.push(h.e.id);
            if (b.pierce-- <= 0) {
              stop = h.t;
              b.remaining = 0;
              break;
            }
          }
        } else {
          const clear = p.ring > 0 ? segmentCircle(a, z, p, 24 + b.r) : null;
          const t = segmentCircle(a, z, p, 5 + b.r);
          if (clear !== null && clear <= stop) {
            stop = clear;
            b.remaining = 0;
            this.effects.push({ kind: "spark", x: a.x + (z.x - a.x) * clear, y: a.y + (z.y - a.y) * clear, life: 0.12 });
          } else if (t !== null && t < stop) {
            const prev = packets.get(b.group) || 0;
            packets.set(b.group, Math.max(prev, b.damage));
            stop = t;
            b.remaining = 0;
          }
        }
        b.x = a.x + (z.x - a.x) * stop;
        b.y = a.y + (z.y - a.y) * stop;
        b.remaining -= length;
        if (wall !== null && stop >= wall) b.remaining = 0;
        const bounds = ROOM.bounds;
        if (b.x < bounds.x || b.x > bounds.x + bounds.w || b.y < bounds.y || b.y > bounds.y + bounds.h) b.remaining = 0;
      }
      for (const [group, damage] of packets) this.hurt(damage, group);
      s.bullets = s.bullets.filter((b) => b.remaining > 0);
    }
    update(dt) {
      if (this.paused || this.s.dead || this.s.done) return;
      dt = clamp(dt, 0, 1 / 30);
      const s = this.s, p = this.p;
      s.clock += dt;
      this.updateAim(dt);
      for (const k of ["switchTime", "invulnerable", "skillCooldown", "ring", "breakBoost"]) p[k] = Math.max(0, p[k] - dt);
      p.cooldowns = p.cooldowns.map((t) => Math.max(0, t - dt));
      if (p.dashCharges < 2) {
        p.dashRecharge -= dt;
        if (p.dashRecharge <= 1e-8) {
          p.dashCharges++;
          p.dashRecharge = p.dashCharges < 2 ? 2.8 + p.dashRecharge : 0;
        }
      }
      if (s.clock - p.lastHurt >= 4 && p.shield < 6) {
        p.shieldTick += dt;
        if (p.shieldTick >= 1) {
          p.shield = Math.min(6, p.shield + 1);
          p.shieldTick -= 1;
        }
      }
      if (this.bufferDash > 0) {
        this.bufferDash -= dt;
        if (p.switchTime <= 0 && (!p.melee || p.melee.time >= 0.04)) {
          this.bufferDash = 0;
          this.dash();
        }
      }
      const norm = Math.max(1, Math.hypot(this.input.x, this.input.y));
      if (p.dashTime > 0) {
        const step = Math.min(dt, p.dashTime);
        moveCircle(p, p.dashX * 30 / 0.18 * step, p.dashY * 30 / 0.18 * step, ROOM.walls, ROOM.bounds);
        p.dashTime = Math.max(0, p.dashTime - dt);
      } else {
        const firing = p.cooldowns[p.active] > 0;
        const speed = 112 * (p.breakBoost > 0 ? 1.15 : 1) * (firing ? this.weapon.id === "M01" ? 0.9 : this.weapon.id === "S01" ? 0.95 : 1 : 1);
        moveCircle(p, this.input.x / norm * speed * dt, this.input.y / norm * speed * dt, ROOM.walls, ROOM.bounds);
      }
      if (p.dashTime <= 0) for (const e of s.enemies) {
        if (e.hp <= 0 || e.kind === "target" || e.state === "spawn") continue;
        const d = distance(p, e), r = 7 + e.r;
        if (d < r) {
          const a = d > 1e-3 ? Math.atan2(p.y - e.y, p.x - e.x) : 0;
          moveCircle(p, Math.cos(a) * (r - d) * 0.5, Math.sin(a) * (r - d) * 0.5, ROOM.walls, ROOM.bounds);
          moveCircle(e, -Math.cos(a) * (r - d) * 0.5, -Math.sin(a) * (r - d) * 0.5, ROOM.walls, ROOM.bounds, e.r);
        }
      }
      if (this.attackHeld) {
        this.repeatAt -= dt;
        if (this.repeatAt <= 1e-8) {
          this.fire();
          this.repeatAt = this.weapon.interval;
        }
      }
      if (p.melee) {
        const m = p.melee;
        m.time += dt;
        if (m.time >= 0.04 && m.time <= 0.11) {
          for (const e of s.enemies) if (e.hp > 0 && e.state !== "spawn" && !m.hit.includes(e.id) && inSector(p, e, m.angle, 22, 100 * Math.PI / 180, e.r) && visible(p, e, ROOM.walls)) {
            m.hit.push(e.id);
            this.hitEnemy(e, 15, m.angle, 3);
          }
          for (const b of s.bullets) if (b.team === "enemy" && b.kind === "round" && inSector(p, b, m.angle, 22, 100 * Math.PI / 180, b.r) && visible(p, b, ROOM.walls)) b.remaining = 0;
        }
        if (m.time >= 0.24) p.melee = null;
      }
      for (const e of s.enemies) this.updateEnemy(e, dt);
      this.updateBullets(dt);
      this.effects = this.effects.filter((e) => (e.life -= dt) > 0);
      if (s.mode === "trial" && !s.dead) {
        if (s.preview > 0) {
          s.preview -= dt;
          if (s.preview <= 0) this.spawnWave();
        } else if (!s.enemies.some((e) => e.hp > 0)) {
          if (!s.rewarded.includes(s.wave)) {
            s.rewarded.push(s.wave);
            s.copper += 10;
            p.energy = Math.min(120, p.energy + 10);
            s.cleared++;
            this.event("save");
          }
          if (s.wave === 0) {
            s.wave = 1;
            s.preview = 1.5;
            s.bullets = [];
            this.event("nextWave");
          } else {
            s.done = true;
            this.clearInput();
            s.bullets = [];
            this.event("win");
          }
        }
      }
    }
  };

  // web/src/data.js
  var VERSION = 1;
  var ENEMIES2 = {
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
  var DEFAULT_SETTINGS = { master: 0.7, music: 0.45, sfx: 0.7, shake: true, numbers: true, vibration: true, controls: 0.8, fps: 60, assist: false };

  // web/src/store.js
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
    if (!Array.isArray(s.enemies) || s.enemies.length > 5 || s.enemies.some((e) => !ENEMIES2[e.kind] || !num(e.hp, 0, ENEMIES2[e.kind].hp) || !num(e.maxHp, 1, ENEMIES2[e.kind].hp) || e.hp > e.maxHp || !num(e.x, 0, 1600) || !num(e.y, 170, 460) || !Number.isInteger(e.id) || !num(e.id, 0, 1e9) || !["chase", "windup", "recover", "stunned", "transition"].includes(e.state) || !num(e.timer, 0, 10) || ![1, -1].includes(e.facing) || ![1, 2].includes(e.phase) || !["transitioned", "summoned"].every((k) => typeof e[k] === "boolean") || !["parries", "attackCount"].every((k) => Number.isInteger(e[k]) && num(e[k], 0, 1e9)) || ![0, 1].includes(e.chargeStep) || !num(e.tx, 0, 1600) || !num(e.ty, 0, 460) || !num(e.flash, 0, 1) || !Array.isArray(e.history) || e.history.length > 3 || !e.history.every((m) => Object.hasOwn(BOSS_MOVES, m)) || ![...Object.keys(BOSS_MOVES), "strike"].includes(e.move))) return false;
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
  function decodeSave(raw) {
    const e = JSON.parse(raw);
    if (typeof e.payload !== "string" || checksum(e.payload) !== e.checksum) throw Error("存档校验失败");
    const s = JSON.parse(e.payload);
    if (!validateSave(s)) throw Error("存档版本或内容无效");
    return s;
  }

  // web/src/v2/store.js
  var KEY = "duskbound.save.v2";
  var LEGACY = "duskbound.save.v1";
  var finite = (v, a, b) => typeof v === "number" && Number.isFinite(v) && v >= a && v <= b;
  var integer = (v, a, b) => Number.isInteger(v) && finite(v, a, b);
  var short = (v, n = 120) => typeof v === "string" && v.length <= n;
  function freshProfile(ending = null) {
    return { schemaVersion: 2, legacy: { ending, stage: 1, flags: {}, logs: [], coins: 0, iron: 0, leaf: 0, salve: 0, potions: 1, warehousePotions: 0, memorial: false, migrated: false }, settings: { sound: 0.65, shake: true, fps: 60, keys: __spreadValues({}, DEFAULT_KEYS) }, session: newSession(), tutorial: { targets: [], dash: false, skill: false }, trialWins: 0 };
  }
  function validateProfile(v) {
    if (!v || v.schemaVersion !== 2 || !v.legacy || !v.settings || !v.session || !v.tutorial || !integer(v.trialWins, 0, 1e6)) return false;
    const l = v.legacy, o = v.settings, s = v.session, p = s.player;
    if (![null, "honesty", "silence"].includes(l.ending) || !integer(l.stage, 1, 10) || !["coins", "iron", "leaf", "salve", "warehousePotions"].every((k) => integer(l[k], 0, 9999)) || !integer(l.potions, 0, 2) || typeof l.migrated !== "boolean" || typeof l.memorial !== "boolean" || !l.flags || typeof l.flags !== "object" || Array.isArray(l.flags) || !Object.values(l.flags).every((x) => typeof x === "boolean") || !Array.isArray(l.logs) || l.logs.length > 30 || !l.logs.every((x) => short(x, 1e3))) return false;
    if (!finite(o.sound, 0, 1) || typeof o.shake !== "boolean" || ![30, 60].includes(o.fps) || !o.keys || !Object.keys(DEFAULT_KEYS).every((k) => short(o.keys[k], 1) && o.keys[k].length === 1) || new Set(Object.values(o.keys)).size !== 8) return false;
    if (!Array.isArray(v.tutorial.targets) || v.tutorial.targets.length > 4 || !v.tutorial.targets.every((x) => ["static", "strafe", "orbit", "cover"].includes(x)) || typeof v.tutorial.dash !== "boolean" || typeof v.tutorial.skill !== "boolean") return false;
    if (!["practice", "trial"].includes(s.mode) || !finite(s.clock, 0, 1e9) || ![0, 1].includes(s.wave) || !finite(s.preview, 0, 2) || !["done", "dead"].every((k) => typeof s[k] === "boolean") || !Array.isArray(s.rewarded) || s.rewarded.length > 2 || new Set(s.rewarded).size !== s.rewarded.length || !s.rewarded.every((i) => [0, 1].includes(i)) || !["copper", "nextId", "shots", "hits", "damageTaken", "dashes", "cleared"].every((k) => finite(s[k], 0, 1e9)) || s.copper !== s.rewarded.length * 10 || !finite(s.targetDelay, 0, 0.13) || !["number", "object"].includes(typeof s.targetId) || typeof s.usedSkill !== "boolean" || !Array.isArray(s.targetsHit) || s.targetsHit.length > 4 || !s.targetsHit.every((x) => ["static", "strafe", "orbit", "cover"].includes(x))) return false;
    if (!p || !finite(p.x, 31, 609) || !finite(p.y, 61, 321) || !finite(p.hp, 0, 6) || !finite(p.shield, 0, 6) || !finite(p.energy, 0, 120) || !integer(p.potions, 0, 2) || !finite(p.angle, -Math.PI * 2, Math.PI * 2) || ![0, 1].includes(p.active) || !Array.isArray(p.weapons) || p.weapons.length !== 2 || p.weapons[0] === p.weapons[1] || !p.weapons.every((x) => SAMPLE.includes(x)) || !Array.isArray(p.cooldowns) || p.cooldowns.length !== 2 || !p.cooldowns.every((x) => finite(x, 0, 2))) return false;
    if (!integer(p.dashCharges, 0, 2) || !["switchTime", "dashRecharge", "dashTime", "invulnerable", "shieldTick", "skillCooldown", "ring", "breakBoost"].every((k) => finite(p[k], 0, 15)) || !finite(p.lastHurt, -10, s.clock) || !finite(p.dashX, -1, 1) || !finite(p.dashY, -1, 1)) return false;
    if (p.melee && (!finite(p.melee.time, 0, 0.25) || !finite(p.melee.angle, -7, 7) || !Array.isArray(p.melee.hit) || p.melee.hit.length > 6 || !p.melee.hit.every((x) => integer(x, 0, 1e9)))) return false;
    if (!Array.isArray(s.enemies) || s.enemies.length > 6 || s.enemies.some((e) => !["target", "rat", "dog", "archer"].includes(e.kind) || !integer(e.id, 0, 1e9) || !["x", "y", "ox", "oy", "tx", "ty"].every((k) => finite(e[k], 0, 640)) || !finite(e.hp, 0, 45) || !finite(e.maxHp, 1, 45) || e.hp > e.maxHp || !finite(e.r, 5, 12) || !["idle", "spawn", "chase", "windup", "charge", "recover"].includes(e.state) || !finite(e.timer, -1e9, 3) || !finite(e.angle, -7, 7) || !finite(e.flash, 0, 1) || !finite(e.stun, -1, 1) || !finite(e.vx, -1e3, 1e3) || !finite(e.vy, -1e3, 1e3) || e.kind === "target" && !["static", "strafe", "orbit", "cover"].includes(e.motion))) return false;
    if (!Array.isArray(s.bullets) || s.bullets.length > 150 || s.bullets.some((b) => !integer(b.id, 0, 1e9) || !integer(b.group, 0, 1e9) || !["enemy", "friend"].includes(b.team) || !["round", "needle"].includes(b.kind) || !finite(b.x, 0, 640) || !finite(b.y, 0, 360) || !finite(b.vx, -1e3, 1e3) || !finite(b.vy, -1e3, 1e3) || !finite(b.damage, 0, 50) || !finite(b.r, 1, 4) || !finite(b.remaining, 0, 500) || !integer(b.pierce, 0, 4) || !Array.isArray(b.hit) || b.hit.length > 6 || !b.hit.every((x) => integer(x, 0, 1e9)) || !["P01", "S01", "W01", "archer"].includes(b.source))) return false;
    return s.dead === (p.hp === 0) && (!s.done || s.rewarded.length === 2);
  }
  function hash(text) {
    let n = 2166136261;
    for (let i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619);
    return (n >>> 0).toString(16);
  }
  function encode(v) {
    if (!validateProfile(v)) throw Error("第二版存档字段无效");
    const payload = JSON.stringify(v);
    return JSON.stringify({ checksum: hash(payload), payload });
  }
  function decode(raw) {
    if (typeof raw !== "string" || raw.length > 1048576) throw Error("存档过大或格式无效");
    const e = JSON.parse(raw);
    if (typeof e.payload !== "string" || hash(e.payload) !== e.checksum) throw Error("存档校验失败");
    const v = JSON.parse(e.payload);
    if (!validateProfile(v)) throw Error("不是有效的第二版存档");
    return v;
  }
  var ProfileStore = class {
    constructor(storage2) {
      this.storage = storage2;
      this.error = "";
      this.blocked = false;
      this.recovered = false;
    }
    write(v) {
      if (this.blocked) return false;
      try {
        const raw = encode(v), prev = this.storage.getItem(KEY);
        this.storage.setItem(KEY + ".pending", raw);
        decode(this.storage.getItem(KEY + ".pending"));
        if (prev) {
          try {
            decode(prev);
            this.storage.setItem(KEY + ".backup", prev);
          } catch (e) {
          }
        }
        this.storage.setItem(KEY, raw);
        this.storage.removeItem(KEY + ".pending");
        this.error = "";
        return true;
      } catch (e) {
        this.error = "本机保存失败，请在设置导出旅程。";
        return false;
      }
    }
    load() {
      try {
        const main = this.storage.getItem(KEY), backup = this.storage.getItem(KEY + ".backup");
        for (const [i, raw] of [main, backup].entries()) {
          if (!raw) continue;
          try {
            const v2 = decode(raw);
            this.recovered = i === 1;
            if (i === 1 && main) {
              const damagedKey = KEY + ".damaged." + hash(main);
              this.storage.setItem(damagedKey, main);
              if (this.storage.getItem(damagedKey) !== main) throw Error("无法保存损坏源档");
            }
            return v2;
          } catch (e) {
          }
        }
        if (main || backup) {
          this.blocked = true;
          this.error = "第二版存档损坏，原始数据已保留。请导入备份，或在设置明确新建。";
          return freshProfile();
        }
        const old = this.storage.getItem(LEGACY), oldBackup = this.storage.getItem(LEGACY + ".backup");
        if (!old && !oldBackup) return freshProfile();
        let legacy = null;
        for (const raw of [old, oldBackup]) {
          if (!raw) continue;
          try {
            legacy = decodeSave(raw);
            break;
          } catch (e) {
          }
        }
        if (!legacy) {
          this.blocked = true;
          this.error = "旧存档损坏，未迁移、未覆盖。可先回序章恢复，或在设置新建第二版。";
          return freshProfile();
        }
        for (const [suffix, raw] of [["", old], [".backup", oldBackup]]) if (raw) {
          let key = LEGACY + ".before-v2" + suffix;
          const prior = this.storage.getItem(key);
          if (prior && prior !== raw) key += "." + hash(raw);
          this.storage.setItem(key, raw);
          if (this.storage.getItem(key) !== raw) throw Error("备份写入失败");
        }
        const v = freshProfile(legacy.ending);
        v.legacy = { ending: legacy.ending, stage: legacy.stage, flags: __spreadValues({}, legacy.flags), logs: [...legacy.logs], coins: legacy.inventory.coins, iron: legacy.inventory.iron + (legacy.player.weapon ? 6 : 0), leaf: legacy.inventory.leaf, salve: legacy.inventory.salve, potions: Math.min(2, legacy.player.potions), warehousePotions: Math.max(0, legacy.player.potions - 2), memorial: !!legacy.player.weapon, migrated: true };
        v.session.player.potions = v.legacy.potions;
        if (!this.write(v)) throw Error("旧档备份后，新存档未能写入");
        return v;
      } catch (e) {
        this.blocked = true;
        this.error = "无法安全备份或迁移存档，原档未覆盖；可暂时试用，再导出进度。";
        return freshProfile();
      }
    }
    import(raw) {
      const v = decode(raw), wasBlocked = this.blocked;
      this.blocked = false;
      if (!this.write(v)) {
        this.blocked = wasBlocked;
        throw Error(this.error);
      }
      return v;
    }
    reset() {
      this.blocked = false;
      const v = freshProfile();
      if (!this.write(v)) throw Error(this.error);
      return v;
    }
  };

  // web/src/v2/renderer.js
  var Scene = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: false });
      if (!this.ctx) throw Error("无法创建游戏画布");
      this.resize();
    }
    resize() {
      const w = window.innerWidth, h = window.innerHeight, scale = Math.min(w / 640, h / 360);
      this.canvas.style.width = 640 * scale + "px";
      this.canvas.style.height = 360 * scale + "px";
      this.ctx.imageSmoothingEnabled = false;
    }
    rect(x, y, w, h, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }
    circle(x, y, r, color) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    line(x, y, x2, y2, color, width = 1) {
      const c = this.ctx;
      c.strokeStyle = color;
      c.lineWidth = width;
      c.beginPath();
      c.moveTo(Math.round(x), Math.round(y));
      c.lineTo(Math.round(x2), Math.round(y2));
      c.stroke();
    }
    text(t, x, y, color = PALETTE.white, size = 10) {
      const c = this.ctx;
      c.font = "".concat(size, 'px "Microsoft YaHei",sans-serif');
      c.textAlign = "center";
      c.fillStyle = color;
      c.fillText(t, Math.round(x), Math.round(y));
    }
    shadow(x, y, w = 12) {
      const c = this.ctx;
      c.fillStyle = "#20232f55";
      c.beginPath();
      c.ellipse(Math.round(x), Math.round(y), w, 4, 0, 0, Math.PI * 2);
      c.fill();
    }
    ground() {
      this.rect(0, 0, 640, 360, PALETTE.ink);
      this.rect(16, 46, 608, 290, PALETTE.shadow);
      this.rect(24, 54, 592, 274, PALETTE.floor);
      for (let y = 56; y < 325; y += 16) for (let x = 24; x < 615; x += 16) {
        const n = (x * 13 + y * 7) % 11;
        this.rect(x, y, 15, 15, n < 3 ? "#747f6d" : n < 6 ? "#6c7869" : "#697568");
        if (n === 3) this.rect(x + 4, y + 7, 5, 1, "#7e876f");
      }
      this.rect(34, 192, 572, 25, "#a68b7348");
      for (let x = 35; x < 613; x += 28) {
        this.rect(x, 51, 19, 3, PALETTE.stone);
        this.rect(x, 329, 19, 3, PALETTE.stone);
      }
      for (let y = 66; y < 330; y += 24) {
        this.rect(20, y, 4, 15, PALETTE.stone);
        this.rect(616, y, 4, 15, PALETTE.stone);
      }
      this.rect(62, 62, 84, 21, PALETTE.ink);
      this.text("旧邮亭 · 训练庭", 104, 76, PALETTE.gold, 10);
      for (const [x, y] of [[47, 104], [584, 85], [585, 290], [45, 300]]) {
        this.shadow(x, y, 14);
        this.rect(x - 3, y - 18, 7, 18, PALETTE.shadow);
        this.rect(x - 9, y - 30, 18, 14, PALETTE.red);
        this.rect(x - 9, y - 31, 18, 3, PALETTE.gold);
        this.rect(x - 4, y - 27, 8, 3, PALETTE.ink);
        this.rect(x - 6, y - 18, 12, 3, PALETTE.stone);
      }
      for (let i = 0; i < 25; i++) {
        const x = 30 + i * 173 % 572, y = 59 + i * 59 % 260;
        if (i % 3 === 0) this.rect(x, y, 2, 3, PALETTE.gold);
        else this.line(x, y, x + 2, y - 3, PALETTE.green);
      }
    }
    cover(w) {
      this.shadow(w.x + w.w / 2, w.y + w.h, w.w / 2 + 7);
      this.rect(w.x, w.y - 13, w.w, w.h + 13, PALETTE.shadow);
      this.rect(w.x, w.y - 17, w.w, w.h, PALETTE.stone);
      this.rect(w.x + 2, w.y - 15, w.w - 4, 2, PALETTE.white);
      this.rect(w.x, w.y + w.h - 17, w.w, 17, "#70675f");
      for (let x = w.x + 8; x < w.x + w.w; x += 16) this.line(x, w.y - 12, x, w.y + w.h - 18, "#8a7868");
      this.line(w.x, w.y + w.h - 2, w.x + w.w, w.y + w.h - 2, PALETTE.ink);
    }
    person(p, time) {
      const c = this.ctx, move = Math.sin(time * 13) * 2, back = Math.sin(p.angle) < -0.45, side = Math.abs(Math.cos(p.angle)) > 0.75;
      this.shadow(p.x, p.y, 10);
      const x = Math.round(p.x), y = Math.round(p.y), hurt = p.invulnerable > 0 && Math.floor(time * 24) % 2;
      const coat = hurt ? PALETTE.white : PALETTE.shadow;
      this.rect(x - 7, y - 7, 5, 7 + (move > 0 ? 1 : 0), PALETTE.ink);
      this.rect(x + 3, y - 7, 5, 7 + (move < 0 ? 1 : 0), PALETTE.ink);
      this.rect(x - 9, y - 24, 18, 18, PALETTE.ink);
      this.rect(x - 8, y - 25, 16, 17, coat);
      this.rect(x - 10, y - 23, 7, 18, coat);
      this.rect(x - 8, y - 25, 7, 2, PALETTE.teal);
      this.rect(x + 4, y - 22, 4, 15, "#596579");
      this.rect(x - 5, y - 36, 11, 12, PALETTE.ink);
      this.rect(x - 4, y - 35, 9, 10, back ? "#a29480" : "#c8b196");
      this.rect(x - 5, y - 37, 11, 4, "#807b75");
      this.rect(x - 6, y - 35, 4, 8, "#807b75");
      if (!back) {
        this.rect(x + (side ? Math.cos(p.angle) > 0 ? 3 : -4 : -3), y - 31, 2, 1, PALETTE.ink);
        if (!side) this.rect(x + 2, y - 31, 2, 1, PALETTE.ink);
        this.rect(x, y - 27, 3, 1, "#8d756b");
      }
      this.rect(x - 10, y - 13, 5, 7, PALETTE.ink);
      this.rect(x - 9, y - 12, 3, 4, PALETTE.gold);
      if (p.ring > 0) {
        c.strokeStyle = PALETTE.gold;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x, y, 24, 0, Math.PI * 2);
        c.stroke();
        for (let i = 0; i < 8; i++) {
          const a2 = i * Math.PI / 4 + time;
          this.rect(x + Math.cos(a2) * 24, y + Math.sin(a2) * 24, 2, 2, PALETTE.white);
        }
      }
      const a = p.melee ? p.melee.angle - 1 + Math.min(1, p.melee.time / 0.11) * 2 : p.angle, wx = x + Math.cos(a) * 8, wy = y - 10 + Math.sin(a) * 8;
      this.line(x, y - 12, wx, wy, PALETTE.stone, 4);
      const id = p.weapons[p.active];
      c.save();
      c.translate(Math.round(wx), Math.round(wy));
      c.rotate(a);
      if (id === "M01") {
        this.rect(0, -2, 21, 3, PALETTE.white);
        this.rect(2, -5, 2, 10, PALETTE.gold);
        this.rect(-4, -2, 7, 4, PALETTE.ink);
      } else if (id === "S01") {
        this.rect(-2, -3, 17, 6, PALETTE.ink);
        this.rect(3, -2, 17, 3, PALETTE.shadow);
        this.rect(-4, -2, 8, 5, PALETTE.red);
      } else if (id === "W01") {
        this.rect(-3, -1, 22, 3, PALETTE.stone);
        this.rect(12, -5, 6, 8, PALETTE.gold);
        this.rect(13, -4, 4, 5, PALETTE.teal);
      } else {
        this.rect(-3, -2, 14, 4, PALETTE.gold);
        this.rect(1, 1, 4, 6, PALETTE.red);
        this.rect(10, -2, 3, 3, PALETTE.ink);
      }
      c.restore();
      if (p.melee && p.melee.time >= 0.04 && p.melee.time <= 0.11) {
        c.strokeStyle = "#f2e4c599";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, y - 5, 24, p.melee.angle - 0.87, p.melee.angle + 0.87);
        c.stroke();
      }
    }
    enemy(e, s) {
      if (e.hp <= 0) return;
      const x = e.x, y = e.y;
      this.shadow(x, y, e.r + 2);
      if (e.state === "spawn") {
        this.ctx.strokeStyle = PALETTE.bullet;
        this.ctx.setLineDash([3, 3]);
        this.ctx.strokeRect(x - 12, y - 12, 24, 24);
        this.ctx.setLineDash([]);
        this.text("!", x, y - 19, PALETTE.bullet, 13);
        return;
      }
      const color = e.flash > 0 ? PALETTE.white : e.kind === "target" ? PALETTE.stone : e.kind === "rat" ? PALETTE.purple : e.kind === "dog" ? PALETTE.red : PALETTE.teal;
      if (e.kind === "target") {
        this.rect(x - 3, y - 22, 6, 22, PALETTE.ink);
        this.rect(x - 11, y - 28, 22, 21, PALETTE.ink);
        this.rect(x - 10, y - 27, 20, 19, color);
        this.rect(x - 7, y - 24, 14, 13, PALETTE.red);
        this.rect(x - 4, y - 21, 8, 7, PALETTE.gold);
        this.rect(x - 1, y - 18, 2, 2, PALETTE.ink);
      } else if (e.kind === "archer") {
        this.rect(x - 6, y - 7, 4, 7, PALETTE.ink);
        this.rect(x + 3, y - 7, 4, 7, PALETTE.ink);
        this.rect(x - 8, y - 24, 16, 19, PALETTE.ink);
        this.rect(x - 7, y - 23, 14, 17, color);
        this.rect(x - 5, y - 33, 11, 12, PALETTE.ink);
        this.rect(x - 4, y - 32, 9, 8, PALETTE.stone);
        this.line(x - 13, y - 18, x + 13, y - 18, PALETTE.stone, 3);
        this.line(x, y - 22, x, y - 10, PALETTE.ink, 2);
      } else {
        this.rect(x - e.r, y - 13, e.r * 2, 10, PALETTE.ink);
        this.rect(x - e.r + 1, y - 14, e.r * 2 - 2, 10, color);
        this.rect(x + Math.cos(e.angle) * e.r - 3, y - 13, 7, 7, PALETTE.stone);
        this.line(x - e.r, y - 7, x - e.r - 9, y - 11, color, 2);
        this.rect(x - 6, y - 3, 3, 4, PALETTE.ink);
        this.rect(x + 4, y - 3, 3, 4, PALETTE.ink);
        this.rect(x + Math.cos(e.angle) * e.r, y - 12, 2, 2, PALETTE.gold);
      }
      if (e.kind !== "target" && e.hp < e.maxHp) {
        this.rect(x - 10, y - 38, 20, 2, PALETTE.ink);
        this.rect(x - 10, y - 38, Math.ceil(e.hp / e.maxHp * 20), 2, PALETTE.bullet);
      }
      if (e.id === s.targetId) {
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
          this.line(x + sx * 13, y + sy * 10, x + sx * 8, y + sy * 10, PALETTE.gold);
          this.line(x + sx * 13, y + sy * 10, x + sx * 13, y + sy * 6, PALETTE.gold);
        }
      }
    }
    draw(g2) {
      const s = g2.s, c = this.ctx;
      c.save();
      if (this.shake > 0) {
        c.translate(Math.round(Math.sin(s.clock * 83) * this.shake), Math.round(Math.cos(s.clock * 97) * this.shake));
        this.shake = Math.max(0, this.shake - 0.7);
      }
      this.ground();
      for (const e of s.enemies) if (e.state === "windup") {
        if (e.kind === "dog") {
          this.line(e.x, e.y, e.x + Math.cos(e.angle) * 92, e.y + Math.sin(e.angle) * 92, PALETTE.bullet, 2);
        } else if (e.kind === "archer") {
          for (let i = -1; i <= 1; i++) this.line(e.x, e.y, e.x + Math.cos(e.angle + i * 0.23) * 36, e.y + Math.sin(e.angle + i * 0.23) * 36, "#f47d7888");
        } else {
          c.strokeStyle = PALETTE.bullet;
          c.beginPath();
          c.arc(e.x, e.y, 19, 0, Math.PI * 2);
          c.stroke();
        }
        this.text("!", e.x, e.y - 39, PALETTE.white, 12);
      }
      const layers = ROOM.walls.map((w) => ({ y: w.y + w.h, draw: () => this.cover(w) }));
      for (const e of s.enemies) layers.push({ y: e.y, draw: () => this.enemy(e, s) });
      layers.push({ y: g2.p.y, draw: () => this.person(g2.p, s.clock) });
      layers.sort((a, b) => a.y - b.y).forEach((o) => o.draw());
      for (const b of s.bullets.filter((b2) => b2.team === "friend")) {
        this.shadow(b.x, b.y, 2);
        const a = Math.atan2(b.vy, b.vx);
        this.line(b.x - Math.cos(a) * 7, b.y - 8 - Math.sin(a) * 7, b.x, b.y - 8, b.kind === "needle" ? PALETTE.teal : PALETTE.gold, 2);
        this.rect(b.x - 1, b.y - 9, 2, 2, PALETTE.white);
      }
      for (const e of g2.effects) {
        if (e.kind === "number") this.text(String(e.value), e.x, e.y - (0.65 - e.life) * 15, PALETTE.white, 10);
        else if (e.kind === "muzzle") {
          this.circle(e.x + Math.cos(e.angle) * 20, e.y - 10 + Math.sin(e.angle) * 20, 3, PALETTE.white);
        } else if (e.kind === "death") {
          for (let i = 0; i < 5; i++) this.rect(e.x + Math.cos(i * 1.3) * (0.35 - e.life) * 40, e.y - 8 + Math.sin(i * 1.3) * (0.35 - e.life) * 40, 2, 2, PALETTE.stone);
        } else {
          this.line(e.x - 3, e.y - 9, e.x + 3, e.y - 3, PALETTE.gold);
          this.line(e.x + 3, e.y - 9, e.x - 3, e.y - 3, PALETTE.white);
        }
      }
      for (const b of s.bullets.filter((b2) => b2.team === "enemy")) {
        this.shadow(b.x, b.y, 3);
        this.circle(b.x, b.y - 8, b.r + 1.5, PALETTE.ink);
        this.circle(b.x, b.y - 8, b.r, PALETTE.bullet);
        this.rect(b.x - 1, b.y - 9, 2, 2, PALETTE.white);
      }
      if (s.preview > 0) this.text("下一波显形中 · 留出走位空间", 320, 170, PALETTE.white, 13);
      this.text(s.mode === "practice" ? "自由试用 · 四种移动靶" : "实战试炼 · " + (s.wave + 1) + "/2", 320, 43, PALETTE.gold, 11);
      c.restore();
    }
  };

  // web/src/v2/input.js
  var Controls = class {
    constructor(getArena, callbacks, keys = DEFAULT_KEYS) {
      this.getArena = getArena;
      this.callbacks = callbacks;
      this.keys = keys;
      this.pressed = /* @__PURE__ */ new Set();
      this.stickId = null;
      this.fireId = null;
      this.bind();
    }
    clear() {
      var _a2;
      this.pressed.clear();
      this.stickId = null;
      this.fireId = null;
      (_a2 = this.getArena()) == null ? void 0 : _a2.clearInput();
      document.getElementById("v2-knob").style.transform = "";
    }
    bind() {
      const stick = document.getElementById("v2-stick"), fire = document.getElementById("v2-fire"), knob = document.getElementById("v2-knob");
      const motion = (e) => {
        if (e.pointerId !== this.stickId) return;
        const r = stick.getBoundingClientRect(), dx = e.clientX - r.x - r.width / 2, dy = e.clientY - r.y - r.height / 2, d = Math.max(r.width * 0.32, Math.hypot(dx, dy));
        const g2 = this.getArena();
        if (g2) g2.input = { x: dx / d, y: dy / d };
        knob.style.transform = "translate(".concat(dx / d * 28, "px,").concat(dy / d * 28, "px)");
      };
      stick.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (this.stickId !== null) return;
        this.callbacks.unlock();
        this.stickId = e.pointerId;
        stick.setPointerCapture(e.pointerId);
        motion(e);
      });
      stick.addEventListener("pointermove", motion);
      const stop = (e) => {
        if (e.pointerId !== this.stickId) return;
        this.stickId = null;
        knob.style.transform = "";
        if (this.getArena()) this.getArena().input = { x: 0, y: 0 };
      };
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) stick.addEventListener(name, stop);
      fire.addEventListener("pointerdown", (e) => {
        var _a2;
        e.preventDefault();
        if (this.fireId !== null) return;
        this.callbacks.unlock();
        this.fireId = e.pointerId;
        this.fireStart = { x: e.clientX, y: e.clientY };
        fire.setPointerCapture(e.pointerId);
        (_a2 = this.getArena()) == null ? void 0 : _a2.pressAttack();
      });
      fire.addEventListener("pointermove", (e) => {
        var _a2;
        if (e.pointerId !== this.fireId) return;
        const x = e.clientX - this.fireStart.x, y = e.clientY - this.fireStart.y;
        if (Math.hypot(x, y) > 12) (_a2 = this.getArena()) == null ? void 0 : _a2.aim(Math.atan2(y, x), true);
      });
      const end = (e) => {
        if (e.pointerId !== this.fireId) return;
        this.fireId = null;
        const g2 = this.getArena();
        if (g2) {
          g2.releaseAttack();
          if (g2.manualHeld) g2.manualTime = 0.25;
          g2.manualHeld = false;
        }
      };
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) fire.addEventListener(name, end);
      for (const [id, fn] of [["v2-dash", "dash"], ["v2-skill", "skill"], ["v2-swap", "swap"]]) document.getElementById(id).addEventListener("pointerdown", (e) => {
        var _a2;
        e.preventDefault();
        this.callbacks.unlock();
        (_a2 = this.getArena()) == null ? void 0 : _a2[fn]();
      });
      const canvas = document.getElementById("v2-world");
      canvas.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const g2 = this.getArena();
        if (!g2) return;
        const r = canvas.getBoundingClientRect(), x = (e.clientX - r.x) / r.width * 640, y = (e.clientY - r.y) / r.height * 360;
        g2.aim(Math.atan2(y - g2.p.y, x - g2.p.x), true);
      });
      canvas.addEventListener("pointerdown", (e) => {
        var _a2;
        if (e.pointerType === "mouse" && e.button === 0) {
          this.callbacks.unlock();
          canvas.setPointerCapture(e.pointerId);
          (_a2 = this.getArena()) == null ? void 0 : _a2.pressAttack();
        }
      });
      for (const n of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(n, () => {
        var _a2;
        return (_a2 = this.getArena()) == null ? void 0 : _a2.releaseAttack();
      });
      window.addEventListener("keydown", (e) => {
        if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName) && e.key !== "Escape") return;
        if (e.key === "Escape") {
          this.callbacks.pause();
          return;
        }
        const key = e.key.toLowerCase();
        if (!Object.values(this.keys).includes(key)) return;
        e.preventDefault();
        if (e.repeat) return;
        this.pressed.add(key);
        this.callbacks.unlock();
        const g2 = this.getArena();
        if (key === this.keys.dash) g2 == null ? void 0 : g2.dash();
        if (key === this.keys.skill) g2 == null ? void 0 : g2.skill();
        if (key === this.keys.swap) g2 == null ? void 0 : g2.swap();
        if (key === this.keys.interact) this.callbacks.interact();
        this.keyboardMove();
      });
      window.addEventListener("keyup", (e) => {
        this.pressed.delete(e.key.toLowerCase());
        this.keyboardMove();
      });
      window.addEventListener("blur", () => {
        this.clear();
        this.callbacks.pause(true);
      });
      window.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    keyboardMove() {
      if (this.stickId !== null) return;
      const g2 = this.getArena();
      if (g2) g2.input = { x: Number(this.pressed.has(this.keys.right)) - Number(this.pressed.has(this.keys.left)), y: Number(this.pressed.has(this.keys.down)) - Number(this.pressed.has(this.keys.up)) };
    }
  };

  // web/src/v2/audio.js
  var Audio = class {
    constructor() {
      this.volume = 0.65;
      this.voices = 0;
      this.ctx = null;
    }
    unlock() {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {
        });
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
    play(kind, material = "mist") {
      const c = this.ctx;
      if (!c || c.state !== "running" || !this.volume || this.voices >= 6) return;
      this.voices++;
      try {
        const now = c.currentTime, v = this.volume * 0.07, g2 = c.createGain(), o = c.createOscillator();
        const frequency = { P01: 760, S01: 110, M01: 390, W01: 900, dash: 250, skill: 520, hit: material === "metal" ? 1400 : material === "wood" ? 200 : 80, hurt: 75, swap: 430 }[kind] || 440;
        const length = kind === "skill" ? 0.55 : kind === "W01" ? 0.23 : kind === "S01" ? 0.18 : 0.1;
        o.type = kind === "W01" || kind === "skill" ? "sine" : kind === "S01" ? "sawtooth" : "triangle";
        o.frequency.setValueAtTime(frequency * (0.97 + Math.random() * 0.06), now);
        o.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * (kind === "W01" ? 1.5 : 0.3)), now + length);
        g2.gain.setValueAtTime(1e-3, now);
        g2.gain.exponentialRampToValueAtTime(v, now + 8e-3);
        g2.gain.exponentialRampToValueAtTime(1e-3, now + length);
        o.connect(g2);
        g2.connect(c.destination);
        o.start();
        o.stop(now + length + 0.01);
        o.onended = () => {
          o.disconnect();
          g2.disconnect();
          this.voices--;
        };
        if (["P01", "S01", "M01"].includes(kind)) {
          if (!this.noise) {
            this.noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.2), c.sampleRate);
            const data = this.noise.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          }
          const n = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
          n.buffer = this.noise;
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(kind === "M01" ? 1600 : 2400, now);
          filter.frequency.exponentialRampToValueAtTime(kind === "S01" ? 90 : 430, now + 0.1);
          gain.gain.setValueAtTime(v * (kind === "S01" ? 3 : 1.5), now);
          gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.12);
          n.connect(filter);
          filter.connect(gain);
          gain.connect(c.destination);
          n.start();
          n.stop(now + 0.13);
          n.onended = () => {
            n.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch (e) {
        this.voices = Math.max(0, this.voices - 1);
      }
    }
  };

  // web/src/v2/app.js
  var $ = (id) => document.getElementById(id);
  var esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var storage;
  try {
    storage = window.localStorage;
  } catch (e) {
    storage = { getItem() {
      throw Error("storage");
    }, setItem() {
      throw Error("storage");
    }, removeItem() {
    } };
  }
  var store = new ProfileStore(storage);
  var profile = store.load();
  var g = new Arena(profile.session);
  var home = true;
  var modal = null;
  var last = 0;
  var accumulator = 0;
  var renderTime = 0;
  var autosave = 0;
  var toastTimer = 0;
  var lastHud = "";
  var pendingImport = null;
  var scene = new Scene($("v2-world"));
  var audio = new Audio();
  audio.volume = profile.settings.sound;
  var controls = new Controls(() => home ? null : g, { unlock: () => audio.unlock(), pause: (background2) => pause(background2), interact: () => openRack() }, profile.settings.keys);
  function toast(message) {
    $("v2-toast").textContent = message;
    $("v2-toast").classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("v2-toast").classList.add("hidden"), 3200);
  }
  function sync() {
    var _a2, _b;
    profile.session = g.s;
    for (const t of g.s.targetsHit) if (!profile.tutorial.targets.includes(t)) profile.tutorial.targets.push(t);
    (_a2 = profile.tutorial).dash || (_a2.dash = g.s.dashes > 0);
    (_b = profile.tutorial).skill || (_b.skill = g.s.usedSkill);
    const ok = store.write(profile);
    $("v2-save").textContent = ok ? "已自动保存 · 继续本房" : "暂未保存 · 设置可导出";
    if (!ok && store.error) toast(store.error);
    return ok;
  }
  function overview() {
    const l = profile.legacy;
    $("v2-legacy-note").textContent = store.error || (l.migrated ? "旧旅程已备份并继承 · 旧币 ".concat(l.coins, " · 灰铁 ").concat(l.iron).concat(l.memorial ? " · 格伦修复纪念已保留" : "") : "首个第二版样板：先试四种武器，再挑战两波敌群。");
    $("v2-enter").innerHTML = g.s.mode === "trial" && !g.s.done && !g.s.dead ? "继续本房 <span>→</span>" : "进入训练庭 <span>→</span>";
  }
  function show(title, html, type = "menu") {
    controls.clear();
    g.pause();
    modal = type;
    $("v2-modal-title").textContent = title;
    $("v2-modal-body").innerHTML = html;
    $("v2-modal").classList.remove("hidden");
    $("v2-controls").classList.add("hidden");
    $("v2-close").focus();
    sync();
  }
  function close() {
    var _a2;
    modal = null;
    $("v2-modal").classList.add("hidden");
    if (!home) {
      $("v2-controls").classList.remove("hidden");
      g.resume();
    }
    last = performance.now();
    accumulator = 0;
    (_a2 = document.activeElement) == null ? void 0 : _a2.blur();
  }
  function enter() {
    var _a2;
    audio.unlock();
    (_a2 = document.activeElement) == null ? void 0 : _a2.blur();
    home = false;
    $("v2-home").classList.add("hidden");
    $("v2-hud").classList.remove("hidden");
    $("v2-controls").classList.remove("hidden");
    g.resume();
    last = performance.now();
    accumulator = 0;
    if (g.s.done || g.s.dead) result();
    else if (!profile.legacy.migrated && !profile.legacy.ending) show("第八次钟声", '<p>七口钟，响了八次。军牌里传来一个声音。</p><p>序章里，你把艾琳的军牌交给了谁？这个选择会记录在第二版旅程中。</p><div class="button-row"><button data-action="honesty">向洛恩坦白</button><button data-action="silence">交给伊妲保管</button></div><div class="notice">当前先开放训练庭与试炼。完整续章和新职业将在后续版本开放。</div>', "recap");
    else toast("左手移动，右手按住攻击；拖动攻击区可手动瞄准。");
  }
  function practice() {
    g = new Arena(newSession("practice", g.p.weapons));
    profile.session = g.s;
    close();
    sync();
    toast("训练庭已恢复 · 补满生命、护盾和能量");
  }
  function trial() {
    g = new Arena(newSession("trial", g.p.weapons));
    profile.session = g.s;
    close();
    sync();
    toast("两波试炼 · 敌人显形后行动，利用掩体和闪步");
  }
  function pause(background2 = false) {
    if (home) {
      if (background2) audio.suspend();
      return;
    }
    if (modal) {
      if (!background2) close();
      return;
    }
    show("片刻歇息", '<p>进度保留完整房内状态。回来后选择“继续本房”。</p><div class="menu-grid"><button data-action="resume" class="primary">继续本房</button><button data-action="rack">军械台</button><button data-action="settings">设置与存档</button><button data-action="notes">旧旅程与见闻</button><button data-action="help">操作说明</button><button data-action="home">保存并返回标题</button><button data-action="practice">返回训练庭并补给</button>'.concat(g.p.energy === 0 && g.p.weapons.every((id) => WEAPONS[id].energy > 0) ? '<button data-action="emergency">将当前武器换为免费手枪</button>' : "", "</div>"));
    if (background2) audio.suspend();
  }
  function openRack() {
    if (home) return;
    if (g.s.mode === "trial" && !g.s.done && !g.s.dead) {
      toast("试炼开始后固定两把武器，返回训练庭再调整。");
      return;
    }
    show("军械台 · 免费借用", '<p>可携带两把不同武器。装备只换枪，不增加能量；训练庭可免费补给。</p><div class="weapon-grid">'.concat(SAMPLE.map((id) => {
      const w = WEAPONS[id];
      return '<div class="weapon-card"><h3>'.concat(w.name, " <small>标准</small></h3><p>").concat(w.damage, " × ").concat(w.pellets, " 伤害 · ").concat(w.interval, "s · 能耗 ").concat(w.energy, "<br>").concat(w.behavior, "</p>").concat([0, 1].map((slot) => '<button data-equip="'.concat(id, '" data-slot="').concat(slot, '" ').concat(g.p.weapons[1 - slot] === id ? "disabled" : "", ">").concat(g.p.weapons[slot] === id ? "✓ " : "", "槽 ").concat(slot + 1).concat(g.p.active === slot ? " · 当前" : "", "</button>")).join(""), "</div>");
    }).join(""), '</div><div class="button-row"><button data-action="refill">补给并重置移动靶</button><button data-action="potion" ').concat(g.p.hp >= 6 || g.p.potions === 0 ? "disabled" : "", ">安全房药剂 ").concat(g.p.potions, '/2 · 恢复2生命</button><button data-action="catalog">查看后续武器设计</button></div>'), "rack");
  }
  function help() {
    show("巡界者的新步伐", '<p>左摇杆任意方向移动。右攻击区轻点只攻击一次；按住按武器间隔连发，拖动超过12像素手动瞄准，松手0.25秒后恢复辅助。没有目标时仍沿当前方向攻击。</p><div class="notice">护盾4秒未受伤后每秒恢复1点。闪步两次充能，每2.8秒补一次；灯环2秒清普通弹并减伤50%，冷却10秒。两把武器各自保留冷却。能量耗尽时，在暂停的军械台返回训练庭，免费借用手枪或短剑。</div><p>键盘：WASD 移动 · 鼠标瞄准/左键攻击 · Space 闪步 · Q 灯环 · E 切枪 · F 军械台 · Esc 暂停。按键可在设置重绑。</p><p>训练目标：射中三种移动靶、闪步一次、释放一次灯环。不限制时间，可随时进入试炼。样板中的试炼铜筹仅用于结算展示，不会兑换永久旧币。</p>', "help");
  }
  function settings() {
    show("设置与存档", '<label class="row">音量<input type="range" min="0" max="100" value="'.concat(profile.settings.sound * 100, '" data-setting="sound" aria-label="音量"></label><label class="row">轻微震屏<input type="checkbox" data-setting="shake" ').concat(profile.settings.shake ? "checked" : "", '></label><label class="row">画面帧率<select data-setting="fps"><option value="60" ').concat(profile.settings.fps === 60 ? "selected" : "", '>60 FPS</option><option value="30" ').concat(profile.settings.fps === 30 ? "selected" : "", ">30 FPS</option></select></label><p>键盘绑定：点击方框后按一个键；不接受重复按键。</p>").concat(Object.entries(DEFAULT_KEYS).map(([key, value]) => '<label class="row">'.concat({ up: "上", down: "下", left: "左", right: "右", dash: "闪步", skill: "技能", swap: "切枪", interact: "交互" }[key], '<input class="key-input" readonly data-bind="').concat(key, '" value="').concat(profile.settings.keys[key] === " " ? "Space" : esc(profile.settings.keys[key].toUpperCase()), '" aria-label="').concat(key, '按键"></label>')).join(""), '<div class="button-row"><button data-action="export">导出第二版旅程</button><button data-action="import">导入第二版备份</button><button data-action="reset-keys">恢复默认按键</button><button data-action="reset-confirm">新建第二版旅程</button></div><div class="notice">旧档在独立位置保留，升级前原文另有备份。序章继续使用原档；第二版导入不改序章。房内快照恢复，不重新发清房奖励。</div>'), "settings");
  }
  function result() {
    show(g.s.dead ? "灯锚将你带回" : "试炼完成", "<p>".concat(g.s.dead ? "没有失去旧旅程中的财产与关键物品。可以回到训练庭重新尝试。" : "两波敌群已清除。接下来可以换另一组武器，比较移动、射程与清弹的用途。", '</p><div class="notice">射击/挥击 ').concat(g.s.shots, " 次 · 命中 ").concat(g.s.hits, " 次<br>闪步 ").concat(g.s.dashes, " 次 · 承受伤害 ").concat(g.s.damageTaken, "<br>本次试炼铜筹 ").concat(g.s.copper, '（离开清零）</div><div class="button-row"><button data-action="practice" class="primary">返回训练庭</button><button data-action="trial">再试一次</button><button data-action="feedback">试玩记录表</button></div>'), "result");
  }
  function confirmTrial() {
    show("实战试炼", "<p>当前装备：".concat(g.p.weapons.map((id) => WEAPONS[id].name).join(" / "), '。面对雾噬鼠、裂爪犬和空壳弩手的两波攻击。每波结束恢复10能量。</p><div class="notice">带一把免费武器可在零能量时继续攻击。训练庭随时可返回；试炼不发永久奖励，不推进尚未开放的续章。</div><div class="button-row"><button data-action="trial" class="primary">带这两把武器进入试炼</button><button data-action="practice">返回训练庭并补给</button></div>'));
  }
  function exportProfile() {
    var _a2;
    try {
      const raw = encode(profile);
      if ((_a2 = window.AndroidBridge) == null ? void 0 : _a2.exportSave) {
        window.AndroidBridge.exportSave(raw);
        return;
      }
      const url = URL.createObjectURL(new Blob([raw], { type: "application/json" })), a = document.createElement("a");
      a.href = url;
      a.download = "暮边镇-七灯余响-旅程.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5e3);
    } catch (e) {
      toast("导出失败，当前旅程仍在。");
    }
  }
  function previewImport(raw) {
    try {
      pendingImport = decode(raw);
      show("恢复第二版备份", "<p>旧结局：".concat(pendingImport.legacy.ending === "honesty" ? "向洛恩坦白" : pendingImport.legacy.ending === "silence" ? "交伊妲保管" : "尚未选择", " · 试炼完成 ").concat(pendingImport.trialWins, ' 次。</p><p>确认后替换第二版旅程；序章档案保留。</p><button data-action="confirm-import" class="primary">确认恢复</button>'), "import");
    } catch (e) {
      toast("不是有效的第二版备份，当前旅程未改变。");
    }
  }
  function notes() {
    const l = profile.legacy;
    show("旧旅程与见闻", "<p>军牌去向：".concat(l.ending === "honesty" ? "向洛恩坦白" : l.ending === "silence" ? "伊妲保管" : "尚未记录", "。</p><p>旧币 ").concat(l.coins, " · 灰铁 ").concat(l.iron, " · 苦叶 ").concat(l.leaf, " · 苦叶膏 ").concat(l.salve, "<br>旧药剂 ").concat(l.potions, "，镇仓溢出药剂 ").concat(l.warehousePotions, "。").concat(l.memorial ? "旧剑强化已转为“格伦修复纪念”和6灰铁。" : "", '</p><div class="notice">本版迁移后安全返回训练庭，保留已结算资源、关键物与剧情记录。序章仍能在独立入口继续原旅程。</div><p>').concat(l.logs.slice(-6).map(esc).join("<br>") || "旧旅程尚无对话记录。", "</p><p>训练：").concat(profile.tutorial.targets.length, "/3 种靶 · ").concat(profile.tutorial.dash ? "已闪步" : "待闪步", " · ").concat(profile.tutorial.skill ? "已释放灯环" : "待释放灯环", "<br>试炼完成 ").concat(profile.trialWins, " 次</p>"));
  }
  function feedback() {
    show("真人试玩记录", '<p>这一版需要真人反馈，再扩展区域和武器。建议试玩10分钟，分别体验四种武器。</p><div class="notice">请记录：手机型号/系统、是否有漏输入、误锁目标、走位误触、受伤是否看得清；四类武器各有什么用途。帧率设置是绘制目标，不是实测性能承诺。</div><p>当前自动记录：攻击 '.concat(g.s.shots, " 次、命中 ").concat(g.s.hits, " 次、伤害 ").concat(g.s.damageTaken, '。这些数量不能证明输入延迟或真人手感。</p><button data-action="export">导出旅程供复现</button>'));
  }
  var actions = { resume: close, rack: openRack, settings, help, notes, trial, practice, refill: practice, feedback, export: exportProfile, import: () => {
    var _a2;
    return ((_a2 = window.AndroidBridge) == null ? void 0 : _a2.importSave) ? window.AndroidBridge.importSave() : $("v2-import").click();
  }, potion: () => {
    g.potion();
    sync();
    openRack();
  }, honesty: () => {
    profile.legacy.ending = "honesty";
    close();
    sync();
  }, silence: () => {
    profile.legacy.ending = "silence";
    close();
    sync();
  }, home: () => {
    sync();
    home = true;
    close();
    g.pause();
    $("v2-home").classList.remove("hidden");
    $("v2-hud").classList.add("hidden");
    $("v2-controls").classList.add("hidden");
    overview();
  }, catalog: () => show("武器设计目录", '<p>4把样板武器已实装，其余20把为后续设计数据，尚不可试射。四职业目前仅开放守灯人。</p><div class="catalog">'.concat(Object.values(WEAPONS).map((w) => "<div>".concat(w.id, " ").concat(w.name, " · ").concat(w.rarity, " · ").concat(w.implemented ? "已实装" : "待制作", "<br><small>").concat(w.behavior, "</small></div>")).join(""), "</div><p>").concat(CLASSES.map((c) => c.name + "：" + (c.implemented ? "已开放" : "后续剧情解锁，待制作")).join("<br>"), "</p>")), "reset-keys": () => {
    profile.settings.keys = __spreadValues({}, DEFAULT_KEYS);
    controls.keys = profile.settings.keys;
    settings();
  }, "reset-confirm": () => show("新建第二版旅程", '<p>会替换当前第二版的试炼和教学记录。建议先导出；序章原始存档和升级前备份不会删除。</p><button data-action="reset" class="primary">确认新建第二版</button>'), "reset": () => {
    try {
      profile = store.reset();
      g = new Arena(profile.session);
      controls.keys = profile.settings.keys;
      audio.volume = profile.settings.sound;
      actions.home();
    } catch (e) {
      toast(store.error);
    }
  }, "confirm-import": () => {
    try {
      profile = store.import(encode(pendingImport));
      g = new Arena(profile.session);
      controls.keys = profile.settings.keys;
      audio.volume = profile.settings.sound;
      close();
      actions.home();
      toast("旅程已恢复，点击继续进入本房。");
    } catch (e) {
      toast("恢复失败，原备份可再次导入。");
    }
  } };
  $("v2-enter").onclick = enter;
  $("v2-home-settings").onclick = settings;
  $("v2-close").onclick = close;
  $("v2-pause").onclick = () => pause();
  $("v2-rack").onclick = openRack;
  $("v2-mode").onclick = confirmTrial;
  $("v2-modal-body").onclick = (e) => {
    var _a2;
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    audio.unlock();
    if (b.dataset.action === "emergency") {
      g.emergencyWeapon();
      sync();
      close();
      return;
    }
    if (b.dataset.equip) {
      g.equip(b.dataset.equip, Number(b.dataset.slot));
      sync();
      openRack();
      return;
    }
    (_a2 = actions[b.dataset.action]) == null ? void 0 : _a2.call(actions);
  };
  $("v2-modal-body").oninput = (e) => {
    const k = e.target.dataset.setting;
    if (!k) return;
    profile.settings[k] = k === "shake" ? e.target.checked : k === "sound" ? Number(e.target.value) / 100 : Number(e.target.value);
    audio.volume = profile.settings.sound;
    sync();
  };
  $("v2-modal-body").onkeydown = (e) => {
    const binding = e.target.dataset.bind;
    if (!binding) return;
    e.preventDefault();
    e.stopPropagation();
    const key = e.key.toLowerCase();
    if (key.length !== 1 || Object.entries(profile.settings.keys).some(([b, v]) => b !== binding && v === key)) {
      toast("请选择未使用的单个字母或空格键");
      return;
    }
    profile.settings.keys[binding] = key;
    controls.keys = profile.settings.keys;
    e.target.value = key === " " ? "Space" : key.toUpperCase();
    sync();
  };
  $("v2-import").onchange = async (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 1048576) {
      toast("文件超过1MB，未导入");
      return;
    }
    try {
      previewImport(await file.text());
    } catch (e2) {
      toast("无法读取文件");
    }
  };
  $("v2-fullscreen").onclick = async () => {
    var _a2, _b, _c, _d;
    try {
      await ((_b = (_a2 = document.documentElement).requestFullscreen) == null ? void 0 : _b.call(_a2));
      await ((_d = (_c = screen.orientation) == null ? void 0 : _c.lock) == null ? void 0 : _d.call(_c, "landscape"));
    } catch (e) {
      toast("请手动横过手机");
    }
  };
  function background() {
    controls.clear();
    if (!home && !modal) pause(true);
    sync();
    audio.suspend();
    accumulator = 0;
    last = performance.now();
  }
  window.addEventListener("native-pause", background);
  window.addEventListener("pagehide", background);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) background();
    else {
      last = performance.now();
      accumulator = 0;
    }
  });
  window.addEventListener("native-resume", () => {
    last = performance.now();
    accumulator = 0;
    audio.unlock();
  });
  window.addEventListener("native-back", () => home ? settings() : pause());
  window.addEventListener("native-import", (e) => previewImport(e.detail));
  window.addEventListener("native-message", (e) => toast(e.detail));
  window.addEventListener("resize", () => {
    scene.resize();
    if (innerWidth < innerHeight) background();
  });
  function hud() {
    const p = g.p, content = [p.hp, p.shield, Math.ceil(p.energy), p.dashCharges, Math.ceil(p.skillCooldown), p.active, ...p.weapons, profile.tutorial.targets.length, profile.tutorial.dash, profile.tutorial.skill, g.s.mode].join("|");
    if (content === lastHud) return;
    lastHud = content;
    $("v2-life").textContent = "生命 ".concat(p.hp, "/6　护盾 ").concat(p.shield, "/6");
    $("v2-energy").textContent = "能量 ".concat(Math.floor(p.energy), " / 120");
    $("v2-dash").innerHTML = "闪步 <small>".concat(p.dashCharges, " / 2</small>");
    $("v2-skill").innerHTML = "灯环 <small>".concat(p.skillCooldown > 0 ? Math.ceil(p.skillCooldown) + "s" : "就绪", "</small>");
    $("v2-weapon").textContent = "".concat(p.active + 1, " · ").concat(g.weapon.name, "　/　").concat(WEAPONS[p.weapons[1 - p.active]].name);
    $("v2-guide").textContent = g.s.mode === "trial" ? "躲开 ! 预警 · 找掩体 · 按住攻击" : "训练 ".concat(Math.min(3, profile.tutorial.targets.length), "/3 种靶 · ").concat(profile.tutorial.dash ? "✓" : "○", " 闪步 · ").concat(profile.tutorial.skill ? "✓" : "○", " 灯环");
    $("v2-rack").disabled = g.s.mode === "trial" && !g.s.done && !g.s.dead;
  }
  function frame(now) {
    var _a2, _b;
    const dt = last ? Math.min(0.05, (now - last) / 1e3) : 0;
    last = now;
    renderTime += dt;
    if (!home && !modal && !document.hidden) {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= 1 / 60 && steps++ < 3) {
        g.update(1 / 60);
        accumulator -= 1 / 60;
      }
      for (const e of g.drain()) {
        if (e.type === "shot") {
          audio.play(e.weapon);
          if (profile.settings.shake) scene.shake = e.weapon === "S01" ? 1.5 : 0.4;
        } else if (e.type === "hit") audio.play("hit", e.material);
        else if (["skill", "dash", "swap", "hurt"].includes(e.type)) audio.play(e.type);
        else if (e.type === "empty") toast("能量不足 · 切换免费手枪或短剑，或返回训练庭补给");
        else if (e.type === "win") {
          profile.trialWins++;
          sync();
          result();
        } else if (e.type === "dead") {
          sync();
          result();
        } else if (e.type === "save") sync();
      }
      for (const t of g.s.targetsHit) if (!profile.tutorial.targets.includes(t)) profile.tutorial.targets.push(t);
      (_a2 = profile.tutorial).dash || (_a2.dash = g.s.dashes > 0);
      (_b = profile.tutorial).skill || (_b.skill = g.s.usedSkill);
      autosave += dt;
      if (autosave >= 5) {
        sync();
        autosave = 0;
      }
    } else accumulator = 0;
    if (renderTime >= 1 / profile.settings.fps) {
      if (!home) scene.draw(g);
      hud();
      renderTime = 0;
    }
    requestAnimationFrame(frame);
  }
  overview();
  scene.draw(g);
  requestAnimationFrame(frame);
  var _a;
  (_a = window.__duskboundBoot) == null ? void 0 : _a.ready();
})();
