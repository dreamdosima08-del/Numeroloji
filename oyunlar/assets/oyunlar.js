/* Numeroloji Arenası · oyun merkezi paneli: seviye, XP, günlük görevler, seri ve rozetler */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, P = O.puan, D = O.depo, el = O.motor.el;
  var kok = doc.getElementById("ar-panel");
  if (!kok) return;

  function ciz() {
    var d = D.oku(), sv = P.seviye(d.xp), ad = d.takmaAd || "Gezgin";
    kok.innerHTML = "";
    var xpEl = el("b", null, "0");
    var ray = el("div", { class: "oy-ray", role: "progressbar", "aria-label": "Seviye ilerlemesi", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(sv.yuzde) });
    var dolgu = el("i", { style: "width:0" }); ray.appendChild(dolgu);
    kok.appendChild(el("div", { class: "ar-oyuncu" }, [
      el("div", { class: "ar-avatar", "aria-hidden": "true" }, String(sv.no)),
      el("div", { style: "flex:1;min-width:0" }, [
        el("h2", null, ad),
        el("p", null, "Seviye " + sv.no + " · " + sv.ad),
        ray,
        el("div", { class: "ar-xp" }, [el("span", null, [xpEl, " XP"]), el("span", null, sv.sonraki ? sv.sonraki + " için " + sv.kalan + " XP" : "En yüksek seviye")])
      ])
    ]));
    O.motor.say(xpEl, d.xp, 900);
    setTimeout(function () { dolgu.style.width = sv.yuzde + "%"; }, 60);

    var ul = el("ul");
    P.gorevler().forEach(function (g) { ul.appendChild(el("li", { class: g.bitti ? "bitti" : "" }, [g.ad, el("small", null, "+" + g.xp + " XP")])); });
    var seri = d.seri.son === P.bugun() || d.seri.son === dunStr() ? d.seri.gun : 0;
    kok.appendChild(el("div", { class: "ar-gorevler" }, [el("h3", null, "Bugünün görevleri"), ul,
      el("p", { class: "ar-seri" }, seri > 0 ? "Seri: " + seri + " gün üst üste oynadın." : "Bugün oynayarak serini başlat.")]));

    var liste = el("div", { class: "ar-rozet-liste" });
    Object.keys(P.ROZETLER).filter(function (id) { return id.indexOf("kader_") !== 0 || d.rozetler[id]; }).forEach(function (id) {
      var r = P.ROZETLER[id], var_ = !!d.rozetler[id];
      liste.appendChild(el("span", { class: "ar-rozet" + (var_ ? " var" : ""), title: r.aciklama }, [el("i", { "aria-hidden": "true" }, var_ ? r.ikon : "?"), r.ad]));
    });
    var say = Object.keys(d.rozetler).length;
    kok.appendChild(el("div", { class: "ar-rozetler" }, [el("h3", null, "Rozetler · " + say + " kazanıldı"), liste,
      d.xp || say ? el("button", { type: "button", class: "ar-sifirla", onclick: function (e) {
        /* Uygulama içinde tarayıcı onay penceresi çalışmayabilir; iki dokunuşla onay alınır */
        var t = e.currentTarget;
        if (t.dataset.onay) { D.sifirla(); ciz(); enIyi(); return; }
        t.dataset.onay = "1"; t.textContent = "Emin misin? Takma adın, puanların ve rozetlerin silinecek. Onaylamak için tekrar dokun.";
        setTimeout(function () { if (t.isConnected) { delete t.dataset.onay; t.textContent = "İlerlememi bu cihazdan sil"; } }, 5000);
      } }, "İlerlememi bu cihazdan sil") : null]));
  }
  function dunStr() { var x = new Date(); x.setDate(x.getDate() - 1); return P.bugun(x); }
  function enIyi() {
    var d = D.oku();
    [].forEach.call(doc.querySelectorAll("[data-en-iyi]"), function (e) {
      var k = e.getAttribute("data-en-iyi"), o = d.oyunlar[k];
      if (k === "cark") e.textContent = d.cark.tarih === P.bugun() ? "Bugünün sayısı: " + d.cark.sayi + (d.cark.yapildi ? " · görev tamam" : "") : "Bugün henüz çevrilmedi";
      else if (k === "arena") e.textContent = d.hafta.enIyi && d.hafta.kod ? "Haftalık en iyin: " + d.hafta.enIyi : "";
      else if (k === "sir") e.textContent = Object.keys(d.kartlar).length ? Object.keys(d.kartlar).length + "/12 kart" : "";
      else e.textContent = o && o.enIyi ? "En iyi puanın: " + o.enIyi : "";
    });
  }
  ciz(); enIyi();
  w.addEventListener("nmj:depo", function () { ciz(); enIyi(); });
  w.addEventListener("pageshow", function (e) { if (e.persisted) { ciz(); enIyi(); } });
})(window, document);
