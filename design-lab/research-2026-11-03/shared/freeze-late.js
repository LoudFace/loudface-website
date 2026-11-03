// freeze.js from design-directions, run after research.js has drawn the charts (they draw on load + fonts).
window.addEventListener('load', function () { document.fonts.ready.then(function () { setTimeout(function () {
// Freeze rendered sizes so Paper (which drops auto-sized images and flex-grow maths) gets literal pixels.
// Only the main-axis size is frozen: width in a row, height in a column. Zeroing flex-grow on a
// column child shrank `flex: 1` panels to their content, 0px when empty (Pond, 2026-09-23).
(function () {
  function differs(e, prop, size) {
    var declared = parseFloat(e.style[prop]);
    return declared && size > 0 && Math.abs(declared - size) > 0.5;
  }
  function run() {
    document.querySelectorAll('img').forEach(function (im) {
      var r = im.getBoundingClientRect();
      if (r.width && r.height) { im.style.width = r.width + 'px'; im.style.height = r.height + 'px'; }
    });
    var els = Array.prototype.slice.call(document.querySelectorAll('body *'));
    var rects = els.map(function (e) { return e.getBoundingClientRect(); });
    els.forEach(function (e, i) {
      var cs = getComputedStyle(e);
      var parent = e.parentElement && getComputedStyle(e.parentElement);
      var column = parent && /flex/.test(parent.display) && /column/.test(parent.flexDirection);
      var axis = column ? 'height' : 'width';
      var size = rects[i][axis];
      if ((parseFloat(cs.flexGrow) > 0 || differs(e, axis, size)) && size > 0) {
        e.style[axis] = size + 'px'; e.style.flexGrow = '0'; e.style.flexShrink = '0'; e.style.flexBasis = 'auto';
      }
      // A column child's width is its cross axis: keep a declared width the browser changed, leave flex alone.
      if (column && differs(e, 'width', rects[i].width)) e.style.width = rects[i].width + 'px';
    });
  }
  run();
})(); }, 900); }); });
