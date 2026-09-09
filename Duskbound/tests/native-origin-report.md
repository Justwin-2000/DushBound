# 1.0.1 浏览器原生接口契约与打包资产检查

2026-09-09 14:52（北京时间）复测：7 项通过，0 个脚本、控制台或资源错误。环境为本机 Edge 无头浏览器、Playwright 触控输入，视口 844 × 390。

入口使用 `https://appassets.androidplatform.net/assets/index.html`。测试拦截所有请求，从 `web/` 提供与原生宿主相同的资源 MIME、`no-store` 与 `nosniff` 响应，并注入记录调用的模拟 `AndroidBridge`。

| 检查 | 结果 |
| --- | --- |
| HTTPS 资产入口完成初始化，调用 `gameReady` | 通过；就绪确认 1 次 |
| 触控打开标题设置、操作说明并开始新旅程 | 通过 |
| 触控打开暂停和行囊菜单 | 通过 |
| 摇杆移动后，`native-pause` 事件保存位置；恢复事件保留暂停菜单 | 通过 |
| `exportSave` 接收有效 JSON 存档及正确校验值 | 通过；导出 1 次 |
| `native-import` 确认前保留当前存档，确认后恢复位置、进度、物资和设置 | 通过；导入请求 1 次 |
| 资源请求全部由本地资产响应，无启动或运行错误 | 通过；外部请求 0，`startupError` 0 |

最终 `暮边镇-1.0.1.apk` 中的 16 个资产文件与当前 `web/` 的 16 个文件逐字节一致，没有缺失、额外、变更或重复条目。APK SHA-256：

```text
b0ec6d3049eb2cd657fa02d63c7d5572f6e0b15b4f47f45f2a3a61a22c2e6fcd
```

复现命令：`node tests/native-origin-smoke.mjs` 与 `python tests/apk-assets-check.py`。原始结果在 `tests/output/native-origin-report.json`、`tests/output/apk-assets-report.json`；截图为 `native-origin-title.png`、`native-origin-restored.png`。

以上是浏览器中的接口契约模拟与 APK 静态资产核对，**不属于 Android 实测**：未执行 Java 宿主、真实 Android WebView、系统生命周期或文件选择器，也未验证 OPPO Find X8 的触控、布局及旧版 Chrome 58 的实际运行表现。
