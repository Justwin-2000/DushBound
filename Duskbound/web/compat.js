/* Deliberately ES5: this must run before the game, even on an older WebView. */
(function (root) {
  'use strict';
  var initialized = false, firstError = '', deadline;
  function renderFailure() {
    if (!firstError || !document.body) return;
    var box = document.getElementById('fatal');
    if (!box) { box = document.createElement('div'); box.id = 'fatal'; document.body.appendChild(box); }
    box.className = 'fatal';
    while (box.firstChild) box.removeChild(box.firstChild);
    var heading = document.createElement('strong');
    heading.textContent = initialized ? '游戏运行中断' : '游戏未能完成启动';
    var message = document.createElement('p');
    message.textContent = '已保存的旅程会保留。请重试；如果仍然失败，可将下面的诊断信息提供给开发者。';
    var detail = document.createElement('pre');
    detail.textContent = firstError + '\n' + navigator.userAgent;
    var retry = document.createElement('button');
    retry.textContent = '重新加载游戏'; retry.onclick = function () { root.location.reload(); };
    box.appendChild(heading); box.appendChild(message); box.appendChild(detail); box.appendChild(retry);
  }
  function fault(message) {
    if (firstError) return;
    firstError = String(message || '未知脚本错误').slice(0, 1200); renderFailure();
    try { if (root.AndroidBridge && root.AndroidBridge.startupError) root.AndroidBridge.startupError(firstError); } catch (ignored) {}
  }
  root.addEventListener('error', function (event) {
    if (event.message) fault(event.message + (event.filename ? '\n' + event.filename + ':' + event.lineno : ''));
    else if (event.target && event.target.tagName === 'SCRIPT') fault('无法加载游戏脚本：' + event.target.src);
  }, true);
  root.addEventListener('unhandledrejection', function (event) { fault(event.reason && event.reason.message ? event.reason.message : String(event.reason)); });
  document.addEventListener('DOMContentLoaded', renderFailure);
  root.__duskboundBoot = { fault: fault, ready: function () {
    if (firstError) return; initialized = true; clearTimeout(deadline);
    document.documentElement.setAttribute('data-game-ready', 'true');
    try { if (root.AndroidBridge && root.AndroidBridge.gameReady) root.AndroidBridge.gameReady(); } catch (ignored) {}
  } };
  deadline = setTimeout(function () { if (!initialized) fault('启动超时：游戏入口没有完成初始化（1.0.3）。'); }, 6000);
  if (typeof root.globalThis === 'undefined') root.globalThis = root;
  if (!root.structuredClone) root.structuredClone = function (value) { return JSON.parse(JSON.stringify(value)); };
  if (!Array.prototype.at) Object.defineProperty(Array.prototype, 'at', { value: function (index) {
    index = Math.trunc(index) || 0; if (index < 0) index += this.length; return this[index];
  } });
  if (!String.prototype.at) Object.defineProperty(String.prototype, 'at', { value: function (index) {
    var value = String(this); index = Math.trunc(index) || 0; if (index < 0) index += value.length;
    return index < 0 || index >= value.length ? undefined : value.charAt(index);
  } });
  if (!Object.hasOwn) Object.hasOwn = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
  if (root.Blob && !root.Blob.prototype.text) root.Blob.prototype.text = function () {
    var blob = this; return new Promise(function (resolve, reject) {
      var reader = new FileReader(); reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); }; reader.readAsText(blob, 'UTF-8');
    });
  };
})(window);
