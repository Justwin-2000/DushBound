package game.duskbound.embers;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.DisplayCutout;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/** An offline host. Only explicit SAF selection grants access to one save document. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    private static final int EXPORT_SAVE = 401;
    private static final int IMPORT_SAVE = 402;
    private static final int STARTUP_TIMEOUT_MS = 12000;
    /** 上次重建 WebView 的时间戳；避免渲染进程反复被回收时陷入无限重建。 */
    private static long lastRenderRecovery;
    private WebView webView;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private ScrollView startupDiagnostic;
    private TextView startupDiagnosticText;
    private String firstScriptError;
    private String firstResourceError;
    private String startupFailureReason;
    private boolean documentLoaded;
    private volatile int startupEpoch;
    private final Runnable startupWatchdog = new Runnable() {
        @Override public void run() {
            if (!pageReady && activityResumed && !isDestroyed()) {
                showStartupDiagnostic("等待 12 秒后，游戏仍未完成初始化。");
            }
        }
    };
    private final ExecutorService fileExecutor = Executors.newSingleThreadExecutor();
    private boolean activityStopped;
    private boolean activityResumed;
    private boolean pauseEventCompleted;
    private boolean pageReady;
    private int pauseEpoch;
    private int importEpoch;
    private int pendingDocumentRequest;
    private String pendingImport;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) pendingDocumentRequest = savedInstanceState.getInt("documentRequest", 0);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.rgb(16, 25, 29));
        getWindow().setNavigationBarColor(Color.rgb(16, 25, 29));
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(16, 25, 29));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // Assets change with app updates; never reuse a cached entry script from an older APK.
        // This affects resource caching only, not the origin's persistent localStorage.
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        CookieManager.getInstance().setAcceptCookie(false);
        webView.addJavascriptInterface(new DeviceBridge(), "AndroidBridge");
        webView.setWebChromeClient(new StartupChromeClient());
        webView.setWebViewClient(new OfflineClient());
        final FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(16, 25, 29));
        frame.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        if (Build.VERSION.SDK_INT >= 28) {
            frame.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
                @Override public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
                    DisplayCutout cutout = insets.getDisplayCutout();
                    frame.setPadding(cutout == null ? 0 : cutout.getSafeInsetLeft(),
                        cutout == null ? 0 : cutout.getSafeInsetTop(),
                        cutout == null ? 0 : cutout.getSafeInsetRight(),
                        cutout == null ? 0 : cutout.getSafeInsetBottom());
                    return insets;
                }
            });
        }
        setContentView(frame);
        createStartupDiagnostic(frame);
        enterFullscreen();
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                new OnBackInvokedCallback() {
                    @Override public void onBackInvoked() { dispatchEvent("native-back"); }
                });
        }
        // The game persists only serializable game state in localStorage, never a WebView snapshot.
        webView.loadUrl(START_URL);
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) enterFullscreen();
    }

    private void enterFullscreen() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    private void dispatchEvent(String event) {
        if (webView != null) webView.evaluateJavascript("window.dispatchEvent(new Event('" + event + "'));", null);
    }

    private void createStartupDiagnostic(FrameLayout frame) {
        startupDiagnostic = new ScrollView(this);
        startupDiagnostic.setFillViewport(true);
        startupDiagnostic.setBackgroundColor(Color.rgb(16, 25, 29));
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setGravity(Gravity.CENTER_VERTICAL);
        int padding = Math.round(24 * getResources().getDisplayMetrics().density);
        content.setPadding(padding, padding, padding, padding);
        TextView title = new TextView(this);
        title.setText("暮边镇 · 启动诊断");
        title.setTextColor(Color.rgb(239, 183, 107));
        title.setTextSize(24);
        content.addView(title, new LinearLayout.LayoutParams(-1, -2));
        startupDiagnosticText = new TextView(this);
        startupDiagnosticText.setTextColor(Color.rgb(235, 228, 211));
        startupDiagnosticText.setTextSize(14);
        startupDiagnosticText.setTextIsSelectable(true);
        startupDiagnosticText.setPadding(0, padding / 2, 0, padding / 2);
        content.addView(startupDiagnosticText, new LinearLayout.LayoutParams(-1, -2));
        Button retry = new Button(this);
        retry.setText("重新加载游戏");
        retry.setAllCaps(false);
        retry.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View view) { retryStartup(); }
        });
        content.addView(retry, new LinearLayout.LayoutParams(-1, -2));
        Button exit = new Button(this);
        exit.setText("关闭应用");
        exit.setAllCaps(false);
        exit.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View view) { finish(); }
        });
        content.addView(exit, new LinearLayout.LayoutParams(-1, -2));
        startupDiagnostic.addView(content, new ScrollView.LayoutParams(-1, -1));
        startupDiagnostic.setVisibility(View.GONE);
        frame.addView(startupDiagnostic, new FrameLayout.LayoutParams(-1, -1));
    }

    private void armStartupWatchdog() {
        mainHandler.removeCallbacks(startupWatchdog);
        if (!pageReady && activityResumed) mainHandler.postDelayed(startupWatchdog, STARTUP_TIMEOUT_MS);
    }

    private void beginStartup() {
        ++startupEpoch;
        ++importEpoch;
        pageReady = false;
        documentLoaded = false;
        firstScriptError = null;
        firstResourceError = null;
        startupFailureReason = null;
        if (startupDiagnostic != null) startupDiagnostic.setVisibility(View.GONE);
        armStartupWatchdog();
    }

    private void retryStartup() {
        if (webView == null || isDestroyed()) return;
        webView.stopLoading();
        ++pauseEpoch;
        webView.resumeTimers();
        if (activityResumed) webView.onResume();
        beginStartup();
        webView.loadUrl(START_URL);
    }

    private static String shorten(String text) {
        if (text == null || text.trim().isEmpty()) return "未提供错误内容";
        return text.length() > 1200 ? text.substring(0, 1200) + "…" : text;
    }

    private void recordScriptError(String message) {
        if (pageReady || isDestroyed()) return;
        if (firstScriptError == null) firstScriptError = shorten(message);
        updateStartupDiagnostic();
    }

    private void recordResourceError(final String message, final int epoch) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                if (epoch != startupEpoch || pageReady || isDestroyed()) return;
                if (firstResourceError == null) firstResourceError = shorten(message);
                updateStartupDiagnostic();
            }
        });
    }

    private String webViewVersion() {
        try {
            PackageInfo provider = WebView.getCurrentWebViewPackage();
            if (provider != null) return provider.versionName + "\n提供方：" + provider.packageName;
        } catch (RuntimeException ignored) { }
        return "系统未提供版本信息";
    }

    private String appVersion() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
        catch (android.content.pm.PackageManager.NameNotFoundException ignored) { return "未知"; }
    }

    private void showStartupDiagnostic(String reason) {
        if (pageReady || startupDiagnostic == null || isDestroyed()) return;
        startupFailureReason = reason;
        startupDiagnostic.setVisibility(View.VISIBLE);
        startupDiagnostic.bringToFront();
        updateStartupDiagnostic();
    }

    private void updateStartupDiagnostic() {
        if (startupDiagnosticText == null || startupFailureReason == null) return;
        startupDiagnosticText.setText(startupFailureReason + "\n\n" +
            "应用版本：" + appVersion() + "\n" +
            "Android：" + Build.VERSION.RELEASE + "（API " + Build.VERSION.SDK_INT + "）\n" +
            "系统 WebView：" + webViewVersion() + "\n" +
            "页面加载：" + (documentLoaded ? "已完成，游戏尚未确认就绪" : "尚未完成") + "\n\n" +
            "首个 JavaScript / 控制台错误：\n" + (firstScriptError == null ? "尚未捕获到错误；脚本可能没有执行。" : firstScriptError) + "\n\n" +
            "首个资源加载错误：\n" + (firstResourceError == null ? "尚未捕获到错误。" : firstResourceError) + "\n\n" +
            "重新加载不会删除已有存档。如果重试后仍出现此页面，可截图反馈上述信息。诊断只在本机显示，不联网。" );
    }

    @Override protected void onStart() {
        super.onStart();
        activityStopped = false;
        if (webView != null) webView.resumeTimers();
    }

    @Override protected void onResume() {
        super.onResume();
        activityResumed = true;
        ++pauseEpoch; // Ignore a delayed pause acknowledgement from an earlier background transition.
        if (webView != null) {
            webView.resumeTimers();
            webView.onResume();
            dispatchEvent("native-resume");
            deliverPendingImport();
            armStartupWatchdog();
        }
    }

    @Override protected void onPause() {
        activityResumed = false;
        mainHandler.removeCallbacks(startupWatchdog);
        ++importEpoch;
        pauseEventCompleted = false;
        final int epoch = ++pauseEpoch;
        final WebView pausedView = webView;
        if (pausedView != null) {
            // dispatchEvent runs synchronous listeners (including localStorage save). Waiting for
            // the evaluation callback prevents onStop from freezing JS before that save executes.
            pausedView.evaluateJavascript("window.dispatchEvent(new Event('native-pause'));true;",
                new ValueCallback<String>() {
                    @Override public void onReceiveValue(String ignored) {
                        if (epoch != pauseEpoch || webView != pausedView) return;
                        pauseEventCompleted = true;
                        pauseTimersAfterSave();
                    }
                });
            // onPause suspends media/animations, but does not pause JavaScript timers.
            pausedView.onPause();
        }
        super.onPause();
    }

    @Override protected void onStop() {
        activityStopped = true;
        pauseTimersAfterSave();
        super.onStop();
    }

    private void pauseTimersAfterSave() {
        if (activityStopped && pauseEventCompleted && webView != null) webView.pauseTimers();
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        state.putInt("documentRequest", pendingDocumentRequest);
        super.onSaveInstanceState(state);
    }

    @Override public void onBackPressed() { dispatchEvent("native-back"); }

    @Override protected void onDestroy() {
        ++pauseEpoch;
        ++importEpoch;
        mainHandler.removeCallbacksAndMessages(null);
        fileExecutor.shutdownNow();
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidBridge");
            webView.stopLoading();
            if (webView.getParent() instanceof ViewGroup) ((ViewGroup) webView.getParent()).removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    public final class DeviceBridge {
        @JavascriptInterface public void gameReady() {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (webView == null || isDestroyed() || !isGamePage(webView.getUrl())) return;
                    // Only the game can acknowledge successful handler binding and initialization.
                    // onPageFinished merely means HTML loading ended, including failed scripts.
                    pageReady = true;
                    mainHandler.removeCallbacks(startupWatchdog);
                    if (startupDiagnostic != null) startupDiagnostic.setVisibility(View.GONE);
                    deliverPendingImport();
                }
            });
        }

        @JavascriptInterface public void startupError(final String message) {
            runOnUiThread(new Runnable() {
                @Override public void run() { recordScriptError(message); }
            });
        }

        @JavascriptInterface public void exportSave(final String content) {
            runOnUiThread(new Runnable() {
                @Override public void run() { beginExport(content); }
            });
        }

        @JavascriptInterface public void importSave() {
            runOnUiThread(new Runnable() {
                @Override public void run() { beginImport(); }
            });
        }

        /** 标题页连按两次返回键时由 web 层调用：此前返回键在标题页只打开设置，等于退不出去。 */
        @JavascriptInterface public void exitApp() {
            runOnUiThread(new Runnable() { @Override public void run() { finish(); } });
        }

        @JavascriptInterface public void vibrate(int milliseconds) {
            final int duration = Math.max(8, Math.min(100, milliseconds));
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                    if (vibrator != null && vibrator.hasVibrator()) {
                        vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
                    }
                }
            });
        }
    }

    private File exportCache() { return new File(getCacheDir(), "pending-save-export.json"); }

    /**
     * 回读刚写入的文档，逐字节与写入内容比对。
     *
     * SAF 的目标 URI 只能拿到一个输出流，做不了「临时文件 + 改名」的原子替换，所以
     * 唯一能保证备份可用的办法是写后校验：拷贝被中断、被提供方截断时这里会抛错，
     * 玩家会看到失败提示，而不是拿着一份截断的备份却以为导出成功。
     *
     * 返回 false 表示提供方不允许回读（无法校验，但这不代表写入失败）；内容不一致
     * 会抛 IOException。
     */
    private boolean verifyExportedDocument(Uri uri, byte[] expected) throws IOException {
        final InputStream input;
        try {
            input = getContentResolver().openInputStream(uri);
        } catch (SecurityException | java.io.FileNotFoundException notReadable) {
            return false;
        }
        if (input == null) return false;
        try (InputStream stream = input) {
            byte[] chunk = new byte[8192];
            int index = 0, read;
            while ((read = stream.read(chunk)) != -1) {
                for (int i = 0; i < read; i++) {
                    if (index >= expected.length || chunk[i] != expected[index]) throw new IOException("回读内容与写入内容不一致，备份可能不完整");
                    index++;
                }
            }
            if (index != expected.length) throw new IOException("回读长度与写入长度不一致，备份可能不完整");
        }
        return true;
    }

    private boolean beginDocumentRequest(int request) {
        if (isFinishing() || isDestroyed() || !activityResumed) return false;
        if (pendingDocumentRequest != 0) {
            showMessage("请先完成当前的存档文件操作");
            return false;
        }
        pendingDocumentRequest = request;
        return true;
    }

    private void beginExport(final String content) {
        if (!beginDocumentRequest(EXPORT_SAVE)) return;
        fileExecutor.execute(new Runnable() {
            @Override public void run() {
                try {
                    byte[] bytes = SaveFileCodec.encode(content);
                    // Use app-private cache instead of a Bundle: a large save must not hit the
                    // Android Binder state limit while the system document picker is foreground.
                    try (FileOutputStream output = new FileOutputStream(exportCache())) {
                        output.write(bytes);
                        output.getFD().sync();
                    }
                    runOnUiThread(new Runnable() {
                        @Override public void run() {
                            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                            intent.addCategory(Intent.CATEGORY_OPENABLE);
                            intent.setType("application/json");
                            intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
                            String date = new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.ROOT).format(new Date());
                            intent.putExtra(Intent.EXTRA_TITLE, "暮边镇-存档-" + date + ".json");
                            launchPicker(intent, EXPORT_SAVE);
                        }
                    });
                } catch (IOException exception) {
                    finishFileOperation("导出失败：" + exception.getMessage(), true);
                }
            }
        });
    }

    private void beginImport() {
        if (!beginDocumentRequest(IMPORT_SAVE)) return;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
        launchPicker(intent, IMPORT_SAVE);
    }

    private void launchPicker(Intent intent, int request) {
        if (isFinishing() || isDestroyed()) return;
        try {
            startActivityForResult(intent, request);
        } catch (ActivityNotFoundException | SecurityException exception) {
            finishFileOperation("系统文件选择器不可用，请检查手机的文件管理应用", request == EXPORT_SAVE);
        }
    }

    @Override protected void onActivityResult(final int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != EXPORT_SAVE && request != IMPORT_SAVE) return;
        if (result != RESULT_OK || data == null || data.getData() == null) {
            finishFileOperation(null, request == EXPORT_SAVE);
            return;
        }
        final Uri uri = data.getData();
        if (!"content".equals(uri.getScheme())) {
            finishFileOperation("请选择系统文件管理器中的 JSON 存档", request == EXPORT_SAVE);
            return;
        }
        fileExecutor.execute(new Runnable() {
            @Override public void run() {
                try {
                    if (request == EXPORT_SAVE) {
                        String content;
                        try (InputStream input = new FileInputStream(exportCache())) {
                            content = SaveFileCodec.read(input);
                        }
                        final byte[] encoded = SaveFileCodec.encode(content);
                        try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                            if (output == null) throw new IOException("文件无法写入");
                            output.write(encoded);
                            output.flush();
                            if (output instanceof FileOutputStream) ((FileOutputStream) output).getFD().sync();
                        }
                        boolean verified = verifyExportedDocument(uri, encoded);
                        finishFileOperation(verified ? "存档备份已导出，并已回读校验" : "存档备份已导出", true);
                    } else {
                        final String content;
                        try (InputStream input = getContentResolver().openInputStream(uri)) {
                            content = SaveFileCodec.read(input);
                        }
                        runOnUiThread(new Runnable() {
                            @Override public void run() {
                                if (isDestroyed()) return;
                                pendingDocumentRequest = 0;
                                pendingImport = content;
                                deliverPendingImport();
                            }
                        });
                    }
                } catch (IOException | SecurityException exception) {
                    finishFileOperation((request == EXPORT_SAVE ? "导出失败：" : "导入失败：") + exception.getMessage(), request == EXPORT_SAVE);
                }
            }
        });
    }

    private void finishFileOperation(final String message, final boolean clearExport) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                pendingDocumentRequest = 0;
                if (clearExport) exportCache().delete();
                if (message != null && !isDestroyed()) showMessage(message);
            }
        });
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void deliverPendingImport() {
        if (pendingImport == null || !pageReady || !activityResumed || webView == null) return;
        final int epoch = ++importEpoch;
        final WebView importView = webView;
        final String content = pendingImport;
        importView.evaluateJavascript("window.__duskboundNativeImportParts=[];", new ValueCallback<String>() {
            @Override public void onReceiveValue(String ignored) { sendImportChunk(importView, content, 0, epoch); }
        });
    }

    private void sendImportChunk(final WebView importView, final String content, final int offset, final int epoch) {
        if (epoch != importEpoch || webView != importView || !activityResumed) return;
        if (offset >= content.length()) {
            pendingImport = null;
            importView.evaluateJavascript("(function(){var text=window.__duskboundNativeImportParts.join('');" +
                "delete window.__duskboundNativeImportParts;" +
                "window.dispatchEvent(new CustomEvent('native-import',{detail:text}));})();", null);
            return;
        }
        // Keep individual IPC/script messages small, even for a file at the 1 MiB limit.
        final int end = Math.min(content.length(), offset + 16384);
        String chunk = JSONObject.quote(content.substring(offset, end))
            .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
        importView.evaluateJavascript("window.__duskboundNativeImportParts.push(" + chunk + ");", new ValueCallback<String>() {
            @Override public void onReceiveValue(String ignored) { sendImportChunk(importView, content, end, epoch); }
        });
    }

    private final class StartupChromeClient extends WebChromeClient {
        @Override public boolean onConsoleMessage(ConsoleMessage message) {
            if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                recordScriptError(message.message() + "\n位置：" + message.sourceId() + ":" + message.lineNumber());
            }
            // Retained in memory for the native diagnostic only; never uploaded or persisted.
            return true;
        }
    }

    private final class OfflineClient extends WebViewClient {
        /**
         * 渲染进程被系统回收（后台内存压力，或 ColorOS 一类厂商的清理）时，WebView 的默认
         * 行为是直接终止整个应用进程——玩家看到的是白屏或闪退。这里返回 true 自行接管：
         * 销毁失效的 WebView 并重建 Activity，游戏会从最近一次自动保存恢复。
         * 若短时间内反复被回收，则退回桌面，避免重建死循环。
         */
        @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            if (view != null) {
                if (view.getParent() instanceof ViewGroup) ((ViewGroup) view.getParent()).removeView(view);
                view.destroy();
            }
            if (webView == view) webView = null;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (isDestroyed()) return;
                    long now = System.currentTimeMillis();
                    if (now - lastRenderRecovery < 15000L) {
                        Toast.makeText(MainActivity.this, "画面进程反复被系统回收，已退出。重新打开即可从最近存档继续。", Toast.LENGTH_LONG).show();
                        finish();
                        return;
                    }
                    lastRenderRecovery = now;
                    Toast.makeText(MainActivity.this, "画面进程被系统回收，正在从最近存档恢复…", Toast.LENGTH_SHORT).show();
                    recreate();
                }
            });
            return true;
        }

        @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            beginStartup();
        }

        @Override public void onPageFinished(WebView view, String url) {
            documentLoaded = isGamePage(url);
            updateStartupDiagnostic();
        }

        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !isLocalAsset(request.getUrl());
        }

        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            final int epoch = startupEpoch;
            if (!isLocalAsset(uri)) {
                recordResourceError("已拒绝离线资源范围以外的请求：" + uri.toString(), epoch);
                return errorResponse(403, "Forbidden");
            }
            String path = uri.getPath().substring("/assets/".length());
            if (path.isEmpty()) path = "index.html";
            if (path.contains("..") || path.contains("\\") || path.startsWith("/")) {
                return errorResponse(403, "Forbidden");
            }
            try {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Cache-Control", "no-store, max-age=0");
                headers.put("X-Content-Type-Options", "nosniff");
                return new WebResourceResponse(mimeType(path), "UTF-8", 200, "OK", headers, getAssets().open(path));
            } catch (IOException exception) {
                recordResourceError("APK 内缺少或无法读取资源：" + path, epoch);
                return errorResponse(404, "Not Found");
            }
        }

        @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            recordResourceError(error.getDescription().toString() + "\n资源：" + request.getUrl().toString(), startupEpoch);
            if (request.isForMainFrame()) {
                showStartupDiagnostic("游戏入口页面未能加载。");
            }
        }

        @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            recordResourceError("资源状态 " + response.getStatusCode() + "：" + request.getUrl().toString(), startupEpoch);
            if (request.isForMainFrame()) showStartupDiagnostic("游戏入口资源返回了错误状态。");
        }
    }

    private static boolean isGamePage(String url) {
        return START_URL.equals(url) || ("https://" + HOST + "/assets/prologue.html").equals(url);
    }

    private static boolean isLocalAsset(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) &&
            uri.getPath() != null && uri.getPath().startsWith("/assets/");
    }

    private static WebResourceResponse errorResponse(int status, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", status, reason,
            new HashMap<String, String>(),
            new ByteArrayInputStream(reason.getBytes(StandardCharsets.UTF_8)));
    }

    private static String mimeType(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        return "application/octet-stream";
    }
}
