// Board import only: Paper drops grid-column placement on text, so a grid whose children are placed by column
// (the article grid with a contents rail and margin notes) is rewritten as absolute boxes at their rendered positions.
window.addEventListener('load', function () { document.fonts.ready.then(function () { setTimeout(function () {
  document.querySelectorAll('[data-paper-abs]').forEach(function (box) {
    var b = box.getBoundingClientRect();
    var kids = Array.prototype.slice.call(box.children);
    var rects = kids.map(function (k) { return k.getBoundingClientRect(); });
    box.style.display = 'block'; box.style.position = 'relative'; box.style.height = b.height + 'px'; box.style.width = b.width + 'px';
    kids.forEach(function (k, i) {
      var r = rects[i];
      k.style.position = 'absolute'; k.style.margin = '0'; k.style.left = (r.left - b.left) + 'px'; k.style.top = (r.top - b.top) + 'px';
      k.style.width = r.width + 'px'; if (box.getAttribute('data-paper-abs') === 'h') { k.style.height = r.height + 'px'; k.style.boxSizing = 'border-box'; }
    });
  });
}, 600); }); });
