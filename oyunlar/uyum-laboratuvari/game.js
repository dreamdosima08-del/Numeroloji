/* Uyum Laboratuvarı · game.js
   8 deney: iki kader sayısı karşılaşır, oyuncu uyumun hangi bantta olduğunu tahmin eder.
   Puanlar sitedeki uyum testinin kullandığı tabloyla (NMJ.ciftPuan) birebir aynıdır. */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, N = w.NMJ, T = w.NMJ_METIN, el = M.el, OYUN = "uyum";
  var TUR = 8, ADRES = "https://www.numerolojim.com.tr/oyunlar/uyum-laboratuvari/";
  var BANT = [
    { id: "guclu", ad: "Güçlü uyum", alt: "%80 ve üzeri", min: 80 },
    { id: "dengeli", ad: "Dengeli uyum", alt: "%68 – %79", min: 68 },
    { id: "ogretici", ad: "Öğretici uyum", alt: "%68'in altı", min: 0 }
  ];
  function bant(p) { for (var i = 0; i < BANT.length; i++) if (p >= BANT[i].min) return BANT[i]; return BANT[2]; }
  function ad(n) { return T && T.kader && T.kader[n] ? T.kader[n].ad : ""; }

  function ciftler() {
    var hepsi = [];
    for (var a = 1; a <= 9; a++) for (var b = a; b <= 9; b++) hepsi.push([a, b]);
    /* Her bantdan dengeli sayıda soru: 3 güçlü, 3 dengeli, 2 öğretici */
    var g = M.karistir(hepsi.filter(function (c) { return N.ciftPuan(c[0], c[1]) >= 80; })).slice(0, 3);
    var d = M.karistir(hepsi.filter(function (c) { var p = N.ciftPuan(c[0], c[1]); return p >= 68 && p < 80; })).slice(0, 3);
    var o = M.karistir(hepsi.filter(function (c) { return N.ciftPuan(c[0], c[1]) < 68; })).slice(0, 2);
    return M.karistir(g.concat(d, o)).map(function (c) { return Math.random() < .5 ? c : [c[1], c[0]]; });
  }

  function oyna(kok) {
    var liste = ciftler(), i = 0, bilinen = 0, puan = 0;
    P.oyunBasla(OYUN); M.olay("oyun_basla", { oyun: OYUN });
    var cubuk = doc.getElementById("oyun-cubuk");
    function cubukCiz() {
      if (!cubuk) return; cubuk.innerHTML = "";
      cubuk.appendChild(el("div", { class: "oy-cubuk-ust" }, [el("span", null, "Deney " + Math.min(i + 1, TUR) + " / " + TUR), el("b", null, bilinen + " doğru")]));
      var r = el("div", { class: "oy-ray" }); r.appendChild(el("i", { style: "width:" + Math.round(100 * i / TUR) + "%" })); cubuk.appendChild(r);
    }
    function ciz() {
      cubukCiz();
      var c = liste[i], p = N.ciftPuan(c[0], c[1]), dogruB = bant(p), key = N.ciftKey(c[0], c[1]), bilgi = T && T.uyum ? T.uyum[key] : null;
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Deney " + (i + 1)));
      a.appendChild(el("h2", { tabindex: "-1" }, "Bu iki sayı ne kadar uyumlu?"));
      a.appendChild(el("div", { class: "ul-cift" }, [
        el("div", { class: "ul-sayi" }, [el("b", null, String(c[0])), el("span", null, ad(c[0]))]),
        el("i", { class: "ul-arti", "aria-hidden": "true" }, "+"),
        el("div", { class: "ul-sayi" }, [el("b", null, String(c[1])), el("span", null, ad(c[1]))])
      ]));
      var sec = el("div", { class: "oy-secenekler", role: "group", "aria-label": "Uyum tahmini" });
      var geri = el("div", { class: "oy-geri", "aria-live": "polite" });
      BANT.forEach(function (b) {
        sec.appendChild(el("button", { type: "button", class: "oy-secenek", "data-b": b.id, onclick: function (e) {
          if (sec.dataset.kilit) return; sec.dataset.kilit = "1";
          var tamam = b.id === dogruB.id;
          [].forEach.call(sec.children, function (x) { x.disabled = true; if (x.getAttribute("data-b") === dogruB.id) x.classList.add("dogru"); });
          if (!tamam) e.currentTarget.classList.add("yanlis");
          if (tamam) { bilinen++; puan += 100; }
          geri.appendChild(el("p", { class: tamam ? "oy-dogru" : "oy-yanlis" }, (tamam ? "Doğru tahmin! " : "Bu sefer olmadı. ") + c[0] + " ile " + c[1] + " uyumu: %" + p + " (" + dogruB.ad.toLowerCase() + ")"));
          if (bilgi) {
            geri.appendChild(el("p", { class: "ul-etiket" }, bilgi.l));
            geri.appendChild(el("p", { class: "oy-aciklama" }, String(bilgi.d).split(". ")[0].replace(/\.$/, "") + "."));
          }
          geri.appendChild(el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { i++; if (i < TUR) ciz(); else bitir(); } }, i < TUR - 1 ? "Sonraki deney" : "Sonucu gör"));
        } }, [el("b", null, b.ad), el("small", null, " · " + b.alt)]));
      });
      a.appendChild(sec); a.appendChild(geri);
      kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (x) {}
    }
    function bitir() {
      i = TUR; cubukCiz();
      var ilk = P.oyunBitir(OYUN, { puan: puan });
      var kazan = bilinen * 6 + (ilk ? 20 : 0); if (!ilk) kazan = Math.round(kazan / 4);
      P.xpVer(kazan, "Uyum Laboratuvarı"); P.gorevTamamla("oyun");
      if (bilinen >= 7) P.rozetVer("uyumcu");
      M.olay("oyun_bitir", { oyun: OYUN, puan: puan });
      try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
      var unvan = bilinen >= 7 ? "Uyum Uzmanı" : bilinen >= 5 ? "Uyum Araştırmacısı" : bilinen >= 3 ? "Laboratuvar Çırağı" : "Meraklı Gözlemci";
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Deneyler tamamlandı"));
      a.appendChild(el("h2", { tabindex: "-1" }, TUR + " deneyden " + bilinen + " doğru: " + unvan));
      a.appendChild(el("div", { class: "oy-istat uc" }, [
        el("div", null, [el("b", null, String(bilinen) + "/" + TUR), el("span", null, "Doğru tahmin")]),
        el("div", null, [el("b", null, String(puan)), el("span", null, "Puan")]),
        el("div", null, [el("b", null, "+" + kazan), el("span", null, "XP")])
      ]));
      a.appendChild(el("p", null, "Laboratuvardaki puanlar, sitedeki aşk, arkadaşlık ve iş ortaklığı uyumu araçlarıyla aynı tablodan gelir. Şimdi gerçek bir deney yap: kendi adını ve doğum tarihini, uyumunu merak ettiğin kişininkiyle karşılaştır."));
      a.appendChild(el("div", { class: "oy-son-dugmeler" }, [
        el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { oyna(kok); } }, "Yeni deneyler"),
        el("a", { class: "btn ghost", href: "/uyum-hesapla.html" }, "Aşk uyumu"),
        el("a", { class: "btn ghost", href: "/arkadaslik-uyumu.html" }, "Arkadaşlık uyumu"),
        el("a", { class: "btn ghost", href: "/is-ortakligi-uyumu.html" }, "İş ortaklığı uyumu"),
        M.waDugme("Numerolojim Uyum Laboratuvarı'nda " + TUR + " deneyden " + bilinen + " doğru yaptım: " + unvan + ". Sen kaç yaparsın? " + ADRES, function () { P.gorevTamamla("paylas"); P.rozetVer("paylasimci"); }),
        el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezi")
      ]));
      a.appendChild(el("p", { class: "oy-not" }, "Uyum yüzdeleri sembolik bir rehberdir; bir ilişkinin geleceğini söylemez."));
      kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (e) {}
    }
    ciz();
  }
  M.basla(oyna);
})(window, document);
