/* Numerolojim · araç arayüzü canlandırma katmanı (yalnızca görsel)
   Hesaplamalara dokunmaz: sonuç kutusu (.calc-out) dolunca sayıları sayarak gösterir,
   çubukları doldurur, uyum yüzdesini halka göstergeye çevirir, kartları sırayla getirir.
   Formda gün → ay → yıl arasında otomatik geçiş yapar. Hiçbir veri saklamaz. */
(function (w, doc) {
  "use strict";
  var az = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sayiSay(el) {
    var t = el.textContent, m = t.match(/^(\D*)(\d{1,3})(\D*)$/);
    if (!m || el.dataset.cnl) return;
    el.dataset.cnl = "1";
    var son = +m[2], on = m[1], arka = m[3], yuzde = on.indexOf("%") > -1;
    if (az) return;
    var bas = performance.now(), sure = yuzde ? 1100 : 650;
    el.classList.add("cnl-say");
    (function adim(z) {
      var p = Math.min(1, (z - bas) / sure), v;
      if (yuzde) v = Math.round(son * (1 - Math.pow(1 - p, 3)));
      else v = p < 1 ? 1 + Math.floor(Math.random() * 9) : son;
      el.textContent = on + v + arka;
      if (p < 1) w.requestAnimationFrame(adim); else { el.textContent = t; el.classList.remove("cnl-say"); }
    })(bas);
  }

  function halka(ug) {
    var b = ug.querySelector("b");
    if (!b || ug.querySelector(".cnl-halka")) return;
    var m = b.textContent.match(/(\d+)/); if (!m) return;
    var h = doc.createElement("span");
    h.className = "cnl-halka";
    h.style.setProperty("--p", az ? m[1] : "0");
    b.parentNode.insertBefore(h, b); h.appendChild(b);
    ug.classList.add("cnl-ug");
    w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { h.style.setProperty("--p", m[1]); }); });
  }

  function canlandir(out) {
    if (out.hidden || !out.firstElementChild) return;
    var kartlar = out.children, i;
    for (i = 0; i < kartlar.length; i++) {
      kartlar[i].style.setProperty("--i", Math.min(i, 8));
      kartlar[i].classList.add("cnl-gir");
    }
    [].forEach.call(out.querySelectorAll(".uy-genel"), halka);
    [].forEach.call(out.querySelectorAll(".nc-n,.uy-genel b,.res b,.re-sayi b,.ay b,.tl-n b,.sk b"), sayiSay);
    if (!az) [].forEach.call(out.querySelectorAll(".sk-tr i,.dist-c span"), function (c) {
      var dik = c.parentNode.classList.contains("dist-c"), k = dik ? "height" : "width", v = c.style[k];
      if (!v || c.dataset.cnl) return;
      c.dataset.cnl = "1"; c.style[k] = "0"; c.offsetWidth; c.style.transition = k + " .9s cubic-bezier(.2,.8,.2,1)";
      w.setTimeout(function () { c.style[k] = v; }, 120);
    });
  }

  function izle(out) {
    var bekle = 0;
    new MutationObserver(function () {
      clearTimeout(bekle);
      bekle = setTimeout(function () { canlandir(out); }, 0);
    }).observe(out, { childList: true, attributes: true, attributeFilter: ["hidden"] });
  }

  function formKur(f) {
    var btn = f.querySelector("button[type=submit],.btn[type=submit]");
    f.addEventListener("submit", function () {
      if (!btn || az) return;
      btn.classList.remove("cnl-bas"); btn.offsetWidth; btn.classList.add("cnl-bas");
    }, true);
    /* başlıklı grup + hemen ardından gelen tarih grubu tek kutu gibi görünsün */
    [].forEach.call(f.querySelectorAll("fieldset"), function (fs) {
      var n = fs.nextElementSibling;
      if (fs.querySelector("legend") && n && n.tagName === "FIELDSET" && !n.querySelector("legend")) fs.classList.add("cnl-ust");
    });
    /* gün yazınca aya, ay seçince yıla geç */
    [].forEach.call(f.querySelectorAll("input[name=g],input[name=g2],input[name=d],input[name=m]"), function (g) {
      g.addEventListener("input", function () {
        if (g.value.length >= 2 || +g.value > (g.name === "m" ? 1 : 3)) {
          var s = g.closest("label") && g.closest("label").nextElementSibling;
          var hedef = s && s.querySelector("select,input");
          if (hedef && !hedef.value) hedef.focus();
        }
      });
    });
    [].forEach.call(f.querySelectorAll("select"), function (s) {
      s.addEventListener("change", function () {
        var n = s.closest("label") && s.closest("label").nextElementSibling;
        var y = n && n.querySelector("input");
        if (y && !y.value) y.focus();
      });
    });
  }

  function kur() {
    [].forEach.call(doc.querySelectorAll(".calc-out"), izle);
    [].forEach.call(doc.querySelectorAll(".calc form"), formKur);
    doc.documentElement.classList.add("cnl");
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", kur); else kur();
})(window, document);
