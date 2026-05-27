(function () {
  'use strict';

  var GUARD_MESSAGE = 'Source code is protected. Developer tools are not permitted on this site.';

  function isAllowedTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], .chat-panel, .chat-input, .chat-send'
    );
  }

  function blockEvent(e) {
    if (isAllowedTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  document.addEventListener('contextmenu', blockEvent);

  document.addEventListener('keydown', function (e) {
    if (isAllowedTarget(e.target)) return;

    var key = (e.key || '').toLowerCase();
    var code = e.keyCode || e.which;

    if (code === 123) return blockEvent(e);

    if (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
      return blockEvent(e);
    }

    if (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c')) {
      return blockEvent(e);
    }

    if ((e.ctrlKey || e.metaKey) && key === 'u') return blockEvent(e);
    if ((e.ctrlKey || e.metaKey) && key === 's') return blockEvent(e);
    if ((e.ctrlKey || e.metaKey) && key === 'p') return blockEvent(e);
  });

  document.addEventListener('copy', blockEvent);
  document.addEventListener('cut', blockEvent);

  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') blockEvent(e);
  });

  if (window.console) {
    var warnStyle = 'color:#ef4444;font-size:28px;font-weight:700;';
    var infoStyle = 'color:#a3a3a3;font-size:13px;';
    try {
      console.clear();
    } catch (err) {}
    console.log('%c⚠ Protected Source', warnStyle);
    console.log('%c' + GUARD_MESSAGE, infoStyle);
  }

  function ensureOverlay() {
    var overlay = document.getElementById('source-guard-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'source-guard-overlay';
    overlay.className = 'source-guard-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="source-guard-overlay-box">' +
      '<p class="source-guard-overlay-title">Source Protected</p>' +
      '<p class="source-guard-overlay-text">' + GUARD_MESSAGE + '</p>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function setDevtoolsState(open) {
    var overlay = ensureOverlay();
    document.body.classList.toggle('source-guard-active', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function detectDevtools() {
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    var widthGap = window.outerWidth - window.innerWidth;
    var heightGap = window.outerHeight - window.innerHeight;
    var open = widthGap > 160 || heightGap > 160;

    setDevtoolsState(open);
  }

  window.addEventListener('resize', detectDevtools);
  setInterval(detectDevtools, 1000);
  detectDevtools();
})();
