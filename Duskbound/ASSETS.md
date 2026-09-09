# 素材与第三方说明

| 文件/内容 | 来源 | 当前用途 |
| --- | --- | --- |
| `web/assets/title.webp` | 本次使用 OpenAI ImageGen 原创生成 | 游戏标题主视觉，无文字与 UI。无损原图保留在 `art-source/title.png` |
| `web/assets/world.webp` | 本次使用 OpenAI ImageGen 原创生成 | 游戏内黄昏山林远景。无损原图保留在 `art-source/world.png`；提示词保存在 `web/assets/world.prompt.txt` |
| `web/assets/icon.svg`、界面图标 | 本项目手工编写的简单矢量线条 | App/界面图标 |
| 游戏内人物、敌人、建筑、地面、特效 | `renderer.js` 中本项目程序绘制 | 第一版像素素材，可替换 |
| 音乐与音效 | `audio.js` 中 Web Audio 程序合成 | 第一版听觉反馈，可替换 |
| 对话和设定 | 用户提供的《暮边镇》设计文档，结合本次扩写 | 本地游戏内容 |
| 字体 | 设备自带中文黑体/宋体和系统衬线字体 | 未捆绑第三方字体文件 |

没有使用现有商业游戏截图、角色、美术资源、外部 CDN、追踪或广告 SDK。ImageGen 输出与使用适用相应服务条款；此文件不主张对 AI 输出的排他版权。

Node.js 仅用于开发、测试与资源复制；APK 不捆绑 Node。系统 WebView 为 Android 提供，应用未重新分发 Chromium。

Android 构建工具与平台、JDK 的许可证和 NOTICE 保留在单独下载的 `.tooling` 目录，不包含在游戏源代码压缩包或 APK 中。构建脚本指向官方分发源并校验固定哈希。

素材替换入口为 `web/assets/title.webp`、`Renderer.human/enemy/house` 等绘制函数和 `Sound.play/tick`；替换时保持逻辑碰撞半径、攻击生效时点与判定独立。

## 位图格式

主视觉与远景使用 WebP（`title.webp` q86、`world.webp` q84），两张图合计约 404KB，而原始 PNG 合计 4236KB——它们曾占 APK 体积的 97%。转换用 `node tools/png-to-webp.mjs <输入.png> <输出.webp> [质量]`，该脚本借本机已安装的 Chrome/Edge 内核编码，不引入任何 npm 依赖。

`art-source/` 保存无损原图，**不参与打包**（`android/build.ps1` 只打包 `web/`）。替换素材后需同步更新 `web/style.css`、`web/src/renderer.js` 里的引用路径。
