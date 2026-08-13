(function () {
  'use strict';

  var screen = document.getElementById('boot-screen');
  var out = document.getElementById('boot-lines');
  if (!screen || !out) return;

  var MIN_MS = 3000;
  // Hard ceiling: a slow connection must never hold someone on the loader.
  var MAX_MS = 5000;
  // Paced so the lines keep arriving for the whole minimum, rather than
  // finishing early and leaving a static screen.
  var LINE_MS = 340;

  var LINES = [
    { text: './init --profile kyle-matthew-calingasan', kind: 'cmd' },
    { text: 'mounting /about', kind: 'ok' },
    { text: 'loading /experience', kind: 'ok' },
    { text: 'compiling /tech-stack', kind: 'ok' },
    { text: 'indexing /projects', kind: 'ok' },
    { text: 'verifying /certifications', kind: 'ok' },
    { text: 'establishing secure channel', kind: 'ok' },
    { text: 'api routes online', kind: 'ok' },
    { text: 'ready', kind: 'ready' },
  ];

  var started = Date.now();
  var finished = false;

  function render(line) {
    var el = document.createElement('div');
    el.className = 'boot-line';

    if (line.kind === 'cmd') {
      el.innerHTML = '<span class="boot-cmd">$</span> ' + line.text;
    } else if (line.kind === 'ready') {
      el.innerHTML = '<span class="boot-ok">' + line.text + '</span> <span class="boot-caret"></span>';
    } else {
      el.innerHTML = '[ <span class="boot-ok">ok</span> ] ' + line.text;
    }

    out.appendChild(el);
  }

  var index = 0;
  (function nextLine() {
    if (index >= LINES.length) return;
    render(LINES[index++]);
    setTimeout(nextLine, LINE_MS);
  })();

  function finish() {
    if (finished) return;
    finished = true;

    try {
      sessionStorage.setItem('portfolio-booted', '1');
    } catch (e) {}

    screen.classList.add('is-done');
    document.body.classList.remove('is-booting');

    setTimeout(function () {
      if (screen.parentNode) screen.parentNode.removeChild(screen);
    }, 500);
  }

  function finishWhenReady() {
    var elapsed = Date.now() - started;
    setTimeout(finish, Math.max(0, MIN_MS - elapsed));
  }

  document.body.classList.add('is-booting');

  if (document.readyState === 'complete') finishWhenReady();
  else window.addEventListener('load', finishWhenReady);

  setTimeout(finish, MAX_MS);
})();
