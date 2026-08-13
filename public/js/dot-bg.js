(function () {
  'use strict';

  var canvas = document.getElementById('bg-dots');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');

  // ----- Value noise -----------------------------------------------------
  // Math.imul keeps the mixing in 32-bit; a plain multiply loses precision
  // and skews the output distribution toward the dark end.
  function hash(x, y, seed) {
    var h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1013904223);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

  function valueNoise(x, y, seed) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    var u = smooth(x - xi);
    var v = smooth(y - yi);

    var a = hash(xi, yi, seed);
    var b = hash(xi + 1, yi, seed);
    var c = hash(xi, yi + 1, seed);
    var d = hash(xi + 1, yi + 1, seed);

    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  function fbm(x, y, seed) {
    return (
      valueNoise(x, y, seed) * 0.55 +
      valueNoise(x * 2.1, y * 2.1, seed + 17) * 0.3 +
      valueNoise(x * 4.3, y * 4.3, seed + 41) * 0.15
    );
  }

  // ----- Palettes --------------------------------------------------------
  var RAMPS = {
    dark: [
      [0.0, 16, 26, 20],
      [0.45, 20, 53, 31],
      [0.72, 63, 185, 80],
      [0.88, 126, 231, 135],
      [1.0, 255, 255, 255],
    ],
    light: [
      [0.0, 222, 228, 234],
      [0.45, 170, 205, 180],
      [0.72, 26, 127, 55],
      [0.88, 20, 90, 42],
      [1.0, 8, 45, 22],
    ],
  };

  // Precompute the ramp into lookup tables so the draw loop does no interpolation.
  var LUT_SIZE = 128;

  function buildLut(ramp) {
    var lut = new Array(LUT_SIZE);

    for (var i = 0; i < LUT_SIZE; i++) {
      var t = i / (LUT_SIZE - 1);
      var stop = ramp[ramp.length - 1];

      for (var j = 1; j < ramp.length; j++) {
        if (t <= ramp[j][0]) {
          var a = ramp[j - 1];
          var b = ramp[j];
          var f = (t - a[0]) / (b[0] - a[0]);
          stop = [
            0,
            Math.round(a[1] + (b[1] - a[1]) * f),
            Math.round(a[2] + (b[2] - a[2]) * f),
            Math.round(a[3] + (b[3] - a[3]) * f),
          ];
          break;
        }
      }

      lut[i] = 'rgb(' + stop[1] + ',' + stop[2] + ',' + stop[3] + ')';
    }

    return lut;
  }

  var LUTS = { dark: buildLut(RAMPS.dark), light: buildLut(RAMPS.light) };

  // ----- Config ----------------------------------------------------------
  function num(attr, fallback) {
    var v = parseFloat(canvas.getAttribute(attr));
    return isFinite(v) ? v : fallback;
  }

  var spacing = num('data-spacing', 14);
  var opacity = num('data-opacity', 0.55);
  var speed = num('data-speed', 1);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var width = 0;
  var height = 0;
  var time = 0;
  var lastFrame = 0;
  var lut = LUTS.dark;

  function syncTheme() {
    lut = document.documentElement.getAttribute('data-theme') === 'light' ? LUTS.light : LUTS.dark;
  }

  // The backing store has to track the element's rendered size, otherwise the
  // browser scales the old bitmap and the dots come out as ellipses.
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);

    if (!w || !h) return false;
    if (w === width && h === height) return false;

    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function draw() {
    if (!width || !height) return;

    var freq = 0.055 * (14 / spacing);
    var maxRadius = spacing * 0.46;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = opacity;

    for (var y = spacing / 2; y < height + spacing; y += spacing) {
      for (var x = spacing / 2; x < width + spacing; x += spacing) {
        var n =
          fbm(x * freq + time * 0.35, y * freq, 1) * 0.6 +
          fbm(x * freq * 1.8 - time * 0.22, y * freq * 1.8 + time * 0.12, 92) * 0.4;

        n = n < 0.18 ? 0 : n > 0.76 ? 1 : (n - 0.18) / 0.58;

        ctx.fillStyle = lut[(n * (LUT_SIZE - 1)) | 0];
        ctx.beginPath();
        ctx.arc(x, y, maxRadius * (0.18 + n * 0.82), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (!document.hidden && !reduceMotion.matches) {
      // ~30fps is plenty: the field drifts slowly and this halves the cost.
      if (now - lastFrame >= 33) {
        lastFrame = now;
        time += speed * 0.01;
        draw();
      }
    }
    requestAnimationFrame(loop);
  }

  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (resize()) draw();
    }).observe(canvas);
  } else {
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (resize()) draw();
      }, 150);
    });
  }

  if (window.MutationObserver) {
    new MutationObserver(function () {
      syncTheme();
      draw();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', draw);
  }

  syncTheme();
  if (resize()) draw();
  requestAnimationFrame(loop);
})();
