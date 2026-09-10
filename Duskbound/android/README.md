# 暮边镇 Android 外壳

原生 Java Activity + 系统 Android WebView，横屏沉浸模式，资源完整打入 APK。最低 Android 8.0（API 26），目标 Android 15（API 35）。没有网络、全盘存储、账号或定位权限；仅声明振动权限用于短触感反馈。存档导入、导出通过系统文件选择器授权单个文档。

## 构建

在 Windows PowerShell 7 中运行：

```powershell
pnpm install --frozen-lockfile
./android/install-toolchain.ps1
./android/build.ps1
./android/test-save-codec.ps1
```

默认构建先用 Node.js 和 esbuild 编译两个 Web 入口，再从项目的 `web/index.html` 打包资源，输出名称读取 AndroidManifest.xml 的 versionName（当前为 `releases/暮边镇-1.1.0.apk`），同时生成 SHA-256 和签名、Manifest 验证报告。原生编译使用 JDK 17、Android SDK Platform 35、Build Tools 35，不依赖 Gradle 或 Maven。工具解压在项目上级的 `.tooling`，不写入系统环境变量。下载地址与校验哈希固定在安装脚本中。

如果已有符合要求的工具，可以通过 `-ToolingRoot` 指定包含 `jdk17`、`android-platform`、`android-build-tools` 三个目录的路径；通过 `-AssetDirectory` 指定资源目录。`-Placeholder` 仅用于先验证原生外壳，生成单独的 `duskbound-shell-check.apk`，不覆盖游戏 APK。

本地开发签名位于 `android/keys/debug.keystore`。保留它，以便之后安装同一签名的新版本并保留存档；面向商店发布应改用正式发行证书与版本号。应用未开启 WebView 远程调试或 Android debuggable。

## Web 与原生约定

- 主页为 `https://appassets.androidplatform.net/assets/index.html`，序章为同源 `prologue.html`；两个精确入口都支持启动握手、导入与生命周期。由 WebViewClient 从 APK assets 拦截提供，没有真实网络请求。资源使用相对路径。
- 入口脚本完成初始化、事件绑定及首帧准备后必须调用 `window.AndroidBridge.gameReady()`。HTML 加载完成不会被当成游戏就绪；未握手前暂不派发导入文件。
- 原生 WebChromeClient 捕捉第一个控制台 ERROR，`window.AndroidBridge.startupError(message)` 也可报告早期错误。前台等待 12 秒仍未收到握手时，显示独立于 JavaScript 的原生诊断页：应用、Android、系统 WebView 版本、首个脚本/资源错误和重新加载按钮。诊断仅保留在内存并本机显示，不写文件、不上传。返回前台会重新开始等待。
- 资源禁用缓存，防止覆盖升级后重复使用旧入口；重新加载不清除 localStorage，离线 origin 和签名保持不变。
- 开启 JavaScript 与 DOM storage，存档可写入 localStorage。卸载应用会删除存档。
- 页面收到 `native-pause`、`native-resume`、`native-back` 窗口事件。游戏应在暂停时保存并暂停音频/计时，返回时打开暂停或主菜单。
- Android 会等待 `native-pause` 的 JavaScript 求值回调完成，再在后台暂停 WebView timers。因此同步的 localStorage 保存监听器先于 timers 暂停完成。快速回前台时会忽略过期的暂停回调；`native-resume` 仅通知恢复，不替游戏解除暂停。
- `window.AndroidBridge.vibrate(milliseconds)` 可触发 8–100 毫秒触感；`exitApp()` 仅供明确退出操作调用。
- `window.AndroidBridge.exportSave(jsonString)` 打开系统“创建文档”界面，建议文件名为 `暮边镇-存档-日期.json`；实际写完后显示成功提示。待导出内容保存在应用私有 cache，避免文档选择器期间活动重建丢失内容。
- `window.AndroidBridge.importSave()` 打开系统 JSON 文件选择器；读取后发送 `new CustomEvent('native-import', { detail: jsonString })`。游戏 store 必须验证格式、版本及游戏规则后才能替换存档；原生层不修改 localStorage。
- 存档文件为 UTF-8，最大 1 MiB；非法编码、空文件、超限文件会显示失败提示，取消选择保持原状。读取和写入在单独线程中执行，不阻塞游戏 UI。导入内容分小段传入页面，避免大文件触发单次 IPC 长度限制。
- 原生端不需要 Service Worker，Web 入口应在存在 `window.AndroidBridge` 时跳过注册。
- 任意外部 URL、文件 URL、content URL、路径穿越请求均禁止。

## 安装

把正式 APK 传到安卓手机并打开。按系统提示允许当前文件管理器安装此 APK。安装后点击“暮边镇”。支持横屏两个方向；系统返回键由游戏暂停菜单处理。无需服务器或账户。

签名、Manifest 和 ZIP 对齐验证均在构建时执行。`test-save-codec.ps1` 在 JVM 中检查存档传输的 UTF-8、空文件、字节大小限制和往返无损。这些检查不能替代安卓真机的触控、音频、系统文件选择器、后台恢复和屏幕适配测试。
