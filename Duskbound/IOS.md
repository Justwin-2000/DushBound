# iOS 上架评估

> 结论先行：**同意你的判断——先把安卓做好。** 但有一件低成本的事现在就该做（见最后一节）。

---

## 一、硬门槛：没有 Mac 就上不了

这不是"麻烦"，是**过不去**：

| 环节 | 要求 |
|---|---|
| 编译 iOS 包 | 必须 macOS + Xcode（Apple 不允许其他平台工具链） |
| 代码签名 | 必须 Xcode / `codesign`（macOS 独占） |
| 上架提交 | 必须 Xcode 或 Transporter（macOS 独占） |
| 开发者账号 | Apple Developer Program，**$99/年**，个人账号需实名 |

**我这台机器是 Windows，无法构建、签名或测试任何 iOS 产物。** 就算写完代码，也只能交给你在 Mac 上编译——而我无法验证它能不能跑。

---

## 二、当前代码里，哪些部分 iOS 完全用不了

架构是 `web/`（JS Canvas 游戏核心）+ `android/`（Java WebView 宿主）。

| 模块 | 现状 | iOS 需要 |
|---|---|---|
| `MainActivity.java`（673 行） | Java 宿主：离线资源拦截、生命周期、沉浸式、返回键 | **全部用 Swift 重写**（`WKWebView` + `WKURLSchemeHandler`） |
| 存档导入导出 | Android SAF（`ACTION_OPEN_DOCUMENT`） | `UIDocumentPickerViewController`，**重写** |
| 振动 | `Vibrator` / `navigator.vibrate` | `UIImpactFeedbackGenerator`。**iOS Safari/WKWebView 根本没有 `navigator.vibrate`**，现在的代码在 iOS 上会静默失效 |
| 沉浸式全屏 | `WindowInsetsController.hide(statusBars｜navigationBars)` | iOS 是 `safeAreaInsets` + 刘海/灵动岛，**逻辑不同** |
| 音频 | WebAudio 由用户手势解锁即可 | **iOS 的坑**：必须配置 `AVAudioSession` 的 category，否则**静音开关一拨就整个没声音**；且后台/来电行为不同 |
| `web/`（游戏本体） | 纯 JS/Canvas | **可直接复用** ✅ |

也就是说：**游戏逻辑能全量复用，宿主层要从零重写。** 这是好消息也是坏消息——好消息是核心资产（`game.js` 700 行 + 全部数值/剧情）不用动。

---

## 三、三条路线

| 路线 | 工作量 | 结果 | 主要风险 |
|---|---|---|---|
| **A. WKWebView 套壳**（Swift 宿主 + 复用 `web/`） | 中，约 1–3 周 | 与安卓体验基本一致 | 审核 4.2「最低功能性」可能被拒 |
| **B. Capacitor / Cordova** | 小–中，约 1–2 周 | 同上 | 多一层框架依赖；4.2 风险同样存在 |
| **C. SpriteKit / Unity / Godot 重写** | 大，2–4 个月 | 手感与性能最好，也是唯一能真正做"高审美"的长期方案 | 全部逻辑重写，等于重做一遍 |

### 关于 App Store 审核 4.2

条款原文大意：**仅仅把网页打包成 app 会被拒。** 规避方式不是伪装，而是把原生能力做深：

- 完整的存档管理（多槽位、导入导出、iCloud 备份）
- 原生触觉反馈（`UIImpactFeedbackGenerator`，体验确实比 `navigator.vibrate` 好）
- 原生成就 / 通知 / 手柄支持
- 离线优先（本项目天然满足，且**无内购、无广告、无账号**，这点对审核是加分项）

**本项目是完整单机游戏（7 房间、两阶段首领、两种结局），不是"网页壳"**，只要把宿主做扎实，4.2 通过是有希望的，但**不能保证**。

---

## 四、建议顺序

### 第 1 步（现在做，成本极低）：把平台能力抽成一层接口

现在 `web/src/app.js` 里散落着对安卓的直接依赖：

```js
window.AndroidBridge?.exportSave(raw)      // 存档导出
window.AndroidBridge?.importSave()         // 存档导入
window.AndroidBridge.vibrate(duration)     // 振动
navigator.vibrate?.(duration)             // 振动降级
```

抽成 `web/src/platform.js` 一层适配器，web 层只调 `platform.save.export(...)` 这类接口。**这样以后接 iOS 只是多写一个适配器，而不是回头改散落各处的调用。**

这一步现在做成本最低（游戏内容还没定稿，以后再改会更贵）。

### 第 2 步：先把安卓做扎实

- 美术 v2（见 `ART-V2.md`）——这是"体验好不好"的决定因素
- 存档版本迁移（目前 `saveVersion` 一升级就会判定老档损坏且永久无法存档）
- 真机性能与帧率验证

### 第 3 步：内容稳定后再上 iOS

用路线 A（WKWebView）或 B（Capacitor）最省事。前置条件：

1. 一台 Mac（或云 Mac，如 MacinCloud；GitHub Actions 的 macOS runner 能构建但**不能交互测试**）
2. Apple Developer 账号（$99/年）
3. 补 Swift 侧的存档 / 振动 / 音频 / 安全区适配

### 如果一定要现在就上 iOS

最小可执行路径：

```bash
# 在 Mac 上
npm i -D @capacitor/cli @capacitor/core @capacitor/ios
npx cap init 暮边镇 game.duskbound.embers --web-dir=web
npx cap add ios
npx cap sync ios
npx cap open ios      # 在 Xcode 里配签名后跑真机
```

预计 1–2 周能出可安装的 TestFlight 包，但**审核通过与否无法预估**。

---

## 五、一句话总结

| 问题 | 回答 |
|---|---|
| 现在能上 iOS 吗？ | 不能——**没有 Mac 就无法构建与签名**，而且宿主层要从零用 Swift 重写 |
| 游戏本体要重做吗？ | 不用，`web/` 全量复用 |
| 最该先做什么？ | **先把平台接口抽出来**（1 次小改动），然后专心打磨安卓 |
| 什么时候再回来做 iOS？ | 美术 v2 落地、内容稳定之后 |
| 谁来承担 Mac 与 $99？ | 只能是你；这部分我无法代办 |
