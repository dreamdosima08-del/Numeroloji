/* Sayıların Sırrı · game.js
   10 soruluk bilgi turu: sayıların adları, anahtar kelimeleri, harf değerleri ve ana sayılar.
   Doğru bilinen her sayının bilgi kartı koleksiyona eklenir (12 kart: 1–9, 11, 22, 33). */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, N = w.NMJ, T = w.NMJ_METIN, el = M.el, OYUN = "sir";
  var SAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33], TUR = 10, ADRES = "https://www.numerolojim.com.tr/oyunlar/sayilarin-sirri/";
  var HARF = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");
  function sec(a) { return a[Math.floor(Math.random() * a.length)]; }
  function digerleri(dogru, havuz, n) { return M.karistir(havuz.filter(function (x) { return x !== dogru; })).slice(0, n); }
  function deger(h) { return N.LV[N.kucult(h)]; }

  /* Soru üreticiler: her biri {soru, secenekler, cevap, sayi (karta eklenecek), aciklama} döndürür */
  var URET = [
    function () { var n = sec(SAY), d = T.kader[n].ad;
      return { soru: "Numerolojide \"" + d + "\" olarak anılan sayı hangisi?", secenekler: M.karistir([n].concat(digerleri(n, SAY, 3))), cevap: n, sayi: n,
               aciklama: n + ": " + d + ". Anahtar kelimeleri: " + T.anahtar[n] + "." }; },
    function () { var n = sec(SAY.slice(0, 9)), dogru = T.anahtar[n];
      var yanlis = digerleri(n, SAY.slice(0, 9), 3).map(function (x) { return T.anahtar[x]; });
      return { soru: n + " sayısının anahtar kelimeleri hangisi?", secenekler: M.karistir([dogru].concat(yanlis)), cevap: dogru, sayi: n,
               aciklama: n + " (" + T.kader[n].ad + "): " + dogru + "." }; },
    function () { var h = sec(HARF), v = deger(h), sik = M.karistir([v].concat(digerleri(v, [1, 2, 3, 4, 5, 6, 7, 8, 9], 3)));
      return { soru: "Pisagor tablosunda " + h + " harfinin değeri kaçtır?", secenekler: sik, cevap: v, sayi: v,
               aciklama: h + " harfi " + v + " değerini taşır. Aynı değerdeki harfler: " + HARF.filter(function (x) { return deger(x) === v; }).join(", ") + "." }; },
    function () { var m = sec([11, 22, 33]), t = N.taban(m);
      return { soru: m + " ana sayısı hangi sayının daha yoğun hali olarak okunur?", secenekler: M.karistir([t].concat(digerleri(t, [1, 2, 3, 4, 5, 6, 7, 8, 9], 3))), cevap: t, sayi: m,
               aciklama: m + " → " + String(m).split("").join(" + ") + " = " + t + ". " + m + " (" + T.kader[m].ad + "), " + t + " sayısının daha yoğun bir halidir." }; },
    function () { var n = sec(SAY.slice(0, 9)), i;
      var x0 = n + 9 * (2 + Math.floor(Math.random() * 105)), s = String(x0), top = 0; for (i = 0; i < s.length; i++) top += +s[i];
      return { soru: x0 + " sayısı numerolojide hangi sayıya indirgenir?", secenekler: M.karistir([n].concat(digerleri(n, [1, 2, 3, 4, 5, 6, 7, 8, 9], 3))), cevap: n, sayi: n,
               aciklama: s.split("").join(" + ") + " = " + top + (top > 9 ? " → " + String(top).split("").join(" + ") + " = " + n : "") + "." }; }
  ];

  function koleksiyon(kap, yeni) {
    var d = D.oku(), adet = Object.keys(d.kartlar).length;
    var k = el("div", { class: "ss-koleksiyon" });
    SAY.forEach(function (n) {
      var var_ = !!d.kartlar[n];
      k.appendChild(el(var_ ? "a" : "div", { class: "ss-kart" + (var_ ? " acik" : "") + (yeni && yeni[n] ? " yeni" : ""), href: var_ ? "/kader-sayisi-" + n + ".html" : null, title: var_ ? T.kader[n].ad : "Henüz açılmadı" },
        [el("b", null, var_ ? String(n) : "?"), el("span", null, var_ ? T.kader[n].ad : "Kilitli")]));
    });
    kap.appendChild(el("h3", null, "Bilgi kartların · " + adet + " / 12"));
    kap.appendChild(k);
    if (adet < 12) kap.appendChild(el("p", { class: "oy-not" }, "Bir sayıyla ilgili soruyu doğru bildiğinde o sayının kartı açılır. Açık kartlara dokunarak sayının ayrıntılı rehberini okuyabilirsin."));
  }

  function oyna(kok) {
    var sorular = [], i = 0, dogru = 0, puan = 0, yeni = {}, goruldu = {};
    while (sorular.length < TUR) { var q = sec(URET)(), k = q.soru; if (!goruldu[k]) { goruldu[k] = 1; sorular.push(q); } }
    P.oyunBasla(OYUN); M.olay("oyun_basla", { oyun: OYUN });
    var cubuk = doc.getElementById("oyun-cubuk");
    function cubukCiz() {
      if (!cubuk) return; cubuk.innerHTML = "";
      cubuk.appendChild(el("div", { class: "oy-cubuk-ust" }, [el("span", null, "Soru " + Math.min(i + 1, TUR) + " / " + TUR), el("b", null, dogru + " doğru")]));
      var r = el("div", { class: "oy-ray" }); r.appendChild(el("i", { style: "width:" + Math.round(100 * i / TUR) + "%" })); cubuk.appendChild(r);
    }
    function ciz() {
      cubukCiz();
      var q = sorular[i], t0 = Date.now();
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Sayıların sırrı"));
      a.appendChild(el("h2", { tabindex: "-1", class: "ss-soru" }, q.soru));
      var uzun = q.secenekler.some(function (s) { return String(s).length > 6; });
      var sec_ = el("div", { class: "oy-secenekler" + (uzun ? "" : " dort"), role: "group" });
      var geri = el("div", { class: "oy-geri", "aria-live": "polite" });
      q.secenekler.forEach(function (s) {
        sec_.appendChild(el("button", { type: "button", class: "oy-secenek" + (uzun ? "" : " sayi"), onclick: function (e) {
          if (sec_.dataset.kilit) return; sec_.dataset.kilit = "1";
          var tamam = s === q.cevap, sure = (Date.now() - t0) / 1000;
          [].forEach.call(sec_.children, function (x, j) { x.disabled = true; if (q.secenekler[j] === q.cevap) x.classList.add("dogru"); });
          if (!tamam) e.currentTarget.classList.add("yanlis");
          var kart = "";
          if (tamam) {
            dogru++; puan += 100 + (sure <= 8 ? 30 : 0);
            var var_ = D.oku().kartlar[q.sayi];
            if (!var_) { D.degistir(function (d) { d.kartlar[q.sayi] = P.bugun(); }); yeni[q.sayi] = 1; kart = " Yeni bilgi kartı açıldı: " + q.sayi + " · " + T.kader[q.sayi].ad + "!"; }
          }
          geri.appendChild(el("p", { class: tamam ? "oy-dogru" : "oy-yanlis" }, (tamam ? "Doğru!" : "Doğru cevap: " + q.cevap) + kart));
          geri.appendChild(el("p", { class: "oy-aciklama" }, q.aciklama));
          geri.appendChild(el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { i++; if (i < TUR) ciz(); else bitir(); } }, i < TUR - 1 ? "Sonraki soru" : "Sonucu gör"));
        } }, String(s)));
      });
      a.appendChild(sec_); a.appendChild(geri); kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (x) {}
    }
    function bitir() {
      i = TUR; cubukCiz();
      var ilk = P.oyunBitir(OYUN, { puan: puan });
      var kazan = dogru * 5 + (ilk ? 20 : 0); if (!ilk) kazan = Math.round(kazan / 4);
      P.xpVer(kazan, "Sayıların Sırrı"); P.gorevTamamla("oyun");
      if (Object.keys(D.oku().kartlar).length >= 12) P.rozetVer("koleksiyon");
      M.olay("oyun_bitir", { oyun: OYUN, puan: puan });
      try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Tur tamamlandı"));
      a.appendChild(el("h2", { tabindex: "-1" }, TUR + " sorudan " + dogru + " doğru"));
      a.appendChild(el("div", { class: "oy-istat uc" }, [
        el("div", null, [el("b", null, String(puan)), el("span", null, "Puan")]),
        el("div", null, [el("b", null, String(Object.keys(yeni).length)), el("span", null, "Yeni kart")]),
        el("div", null, [el("b", null, "+" + kazan), el("span", null, "XP")])
      ]));
      koleksiyon(a, yeni);
      a.appendChild(el("div", { class: "oy-son-dugmeler" }, [
        el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { oyna(kok); } }, "Yeni tur"),
        M.waDugme("Numerolojim'de Sayıların Sırrı turunda " + TUR + " sorudan " + dogru + " doğru yaptım. Sayıları ne kadar tanıyorsun? " + ADRES, function () { P.gorevTamamla("paylas"); P.rozetVer("paylasimci"); }),
        el("a", { class: "btn ghost", href: "/kader-sayilari.html" }, "Bütün sayıların anlamı"),
        el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezi")
      ]));
      kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (e) {}
    }
    ciz();
  }
  /* Başlangıç ekranında mevcut koleksiyonu göster */
  var on = doc.getElementById("ss-onizleme"); if (on) koleksiyon(on);
  M.basla(oyna);
})(window, document);
