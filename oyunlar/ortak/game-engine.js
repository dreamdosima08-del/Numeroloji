/* Numeroloji Arenası · game-engine.js
   Aşamalı oyunlar için ortak motor: aşama geçişleri, ilerleme çubuğu, tarayıcı geri tuşu,
   sayı animasyonu, XP ve rozet bildirimleri. Her oyun yalnızca aşamalarını tanımlar. */
(function (w, doc) {
  "use strict";
  var azHareket = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Küçük DOM yardımcısı: el("button", {class:"x", onclick:fn}, "Metin") */
  function el(tag, at, icerik) {
    var e = doc.createElement(tag);
    if (at) Object.keys(at).forEach(function (k) {
      var v = at[k]; if (v === null || v === undefined || v === false) return;
      if (k.slice(0, 2) === "on" && typeof v === "function") e.addEventListener(k.slice(2), v);
      else if (k === "html") e.innerHTML = v;
      else e.setAttribute(k, v === true ? "" : v);
    });
    [].concat(icerik === undefined ? [] : icerik).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === "object" ? c : doc.createTextNode(String(c)));
    });
    return e;
  }

  /* Sayı animasyonu: 0'dan hedefe sayar */
  function say(elm, hedef, ms) {
    if (azHareket || !ms) { elm.textContent = hedef; return; }
    var t0 = null;
    function adim(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); elm.textContent = Math.round(hedef * e); if (p < 1) w.requestAnimationFrame(adim); }
    w.requestAnimationFrame(adim);
  }

  /* Bildirim balonları (XP, rozet, seviye): sıraya alınır, aynı anda en fazla 2 görünür;
     bekleyen XP bildirimleri tek balonda toplanır ki ekran dolmasın */
  var kutu = null, sira = [], gorunen = 0;
  function bildirim(metin, tur, xp) {
    if (tur === "xp" && xp) {
      var son = sira[sira.length - 1];
      if (son && son.tur === "xp" && son.xp) { son.xp += xp; son.metin = "+" + son.xp + " XP"; return; }
      sira.push({ metin: metin, tur: tur, xp: xp });
    } else sira.push({ metin: metin, tur: tur });
    isle();
  }
  function isle() {
    if (gorunen >= 2 || !sira.length) return;
    if (!kutu) { kutu = el("div", { class: "oy-bildirim", "aria-live": "polite" }); doc.body.appendChild(kutu); }
    var o = sira.shift(), b = el("div", { class: "oy-balon " + (o.tur || "") }, o.metin);
    gorunen++; kutu.appendChild(b);
    setTimeout(function () { b.classList.add("cik"); }, 1700);
    setTimeout(function () { b.remove(); gorunen--; isle(); }, 2150);
  }
  w.addEventListener("nmj:xp", function (e) {
    var d = e.detail; if (!d.miktar) return;
    bildirim("+" + d.miktar + " XP" + (d.neden ? " · " + d.neden : ""), "xp", d.miktar);
    if (d.seviyeAtladi) bildirim("Yeni seviye: " + d.seviye.ad, "seviye");
  });
  w.addEventListener("nmj:rozet", function (e) { bildirim("Yeni rozet: " + e.detail.rozet.ikon + " " + e.detail.rozet.ad, "rozet"); });

  /* Oyun kurucu
     ayar = { kok: Element, cubuk: Element (isteğe bağlı), asamalar: [{ ad, ciz: function(api, kap) }] } */
  function kur(ayar) {
    var simdi = -1, enUzak = 0, durum = {}, A = ayar.asamalar;
    var api = {
      durum: durum, el: el, say: say, bildirim: bildirim,
      ileri: function () { git(simdi + 1, true); },
      git: function (i) { git(i, true); },
      bas: function () { git(0, false); },
      yeniden: function () { enUzak = 0; git(0, true); }
    };
    function cubukCiz() {
      if (!ayar.cubuk) return;
      var yuzde = Math.round(100 * (simdi + 1) / A.length);
      ayar.cubuk.innerHTML = "";
      ayar.cubuk.appendChild(el("div", { class: "oy-cubuk-ust" }, [el("span", null, "Aşama " + (simdi + 1) + " / " + A.length), el("b", null, A[simdi].ad)]));
      var ray = el("div", { class: "oy-ray", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(yuzde), "aria-label": "Oyun ilerlemesi" });
      ray.appendChild(el("i", { style: "width:" + yuzde + "%" }));
      ayar.cubuk.appendChild(ray);
    }
    function git(i, gecmis) {
      if (i < 0 || i >= A.length) return;
      simdi = i; enUzak = Math.max(enUzak, i);
      if (gecmis) { try { w.history.pushState({ nmjAsama: i }, "", "#asama-" + (i + 1)); } catch (e) {} }
      var kap = el("div", { class: "oy-asama" + (azHareket ? "" : " giris") });
      ayar.kok.innerHTML = ""; ayar.kok.appendChild(kap);
      A[i].ciz(api, kap);
      cubukCiz();
      var h = kap.querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) {} }
      var ust = ayar.cubuk || ayar.kok, r = ust.getBoundingClientRect();
      if (r.top < 0 || r.top > w.innerHeight * .4) w.scrollTo({ top: w.pageYOffset + r.top - 80, behavior: azHareket ? "auto" : "smooth" });
      if (ayar.degisti) ayar.degisti(i);
    }
    /* Tarayıcı / Android geri tuşu: önceki aşamaya döner; ilk aşamada sayfadan çıkar */
    w.addEventListener("popstate", function (e) {
      var s = e.state && typeof e.state.nmjAsama === "number" ? e.state.nmjAsama : 0;
      if (s <= enUzak) git(s, false);
    });
    try { w.history.replaceState({ nmjAsama: 0 }, "", w.location.pathname + w.location.search); } catch (e) {}
    git(0, false);
    return api;
  }

  w.NMJOyun.motor = { kur: kur, el: el, say: say, bildirim: bildirim };
})(window, document);
