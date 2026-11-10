/* Haftalık Arena · game.js
   Her hafta herkes için aynı 10 soru (hafta koduyla tohumlanmış rastgelelik). Soru başına 20 saniye;
   hızlı doğru cevap bonus kazandırır. Haftalık en iyi puan cihazda tutulur.
   Not: Çevrimiçi sıralama eklendiğinde puanlar sunucuda yeniden hesaplanıp doğrulanacaktır. */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, N = w.NMJ, el = M.el, OYUN = "arena";
  var TUR = 10, SURE = 20, ADRES = "https://www.numerolojim.com.tr/oyunlar/haftalik-arena/";
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var ISIMLER = ["Ali", "Ayşe", "Can", "Ece", "Emre", "Elif", "Kerem", "Zeynep", "Mert", "Defne", "Ömer", "Selin", "Yusuf", "Deniz", "Arda", "Nehir"];

  /* ISO hafta kodu: 2026-H46 */
  function haftaKodu(t) {
    var d = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())), gun = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - gun);
    var y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return d.getUTCFullYear() + "-H" + Math.ceil(((d - y0) / 864e5 + 1) / 7);
  }
  function tohumlu(kod) { var h = 2166136261; for (var i = 0; i < kod.length; i++) { h ^= kod.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function sorular(kod) {
    var r = tohumlu(kod);
    function ri(a, b) { return a + Math.floor(r() * (b - a + 1)); }
    function karis(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    /* 4 benzersiz seçenek: doğru cevap + havuzdan farklı yanlışlar (gerekirse yakın sayılarla tamamlanır) */
    function sik(c, havuz) {
      var s = [c], gor = {}; gor[c] = 1;
      karis(havuz).forEach(function (x) { if (s.length < 4 && x > 0 && !gor[x]) { gor[x] = 1; s.push(x); } });
      for (var k = 1; s.length < 4; k++) { var x = c + (k % 2 ? 1 : -1) * Math.ceil(k / 2); if (x > 0 && !gor[x]) { gor[x] = 1; s.push(x); } }
      return karis(s);
    }
    var SAYI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33], RAKAM = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var U = [
      function () { var g, a, y, k; do { g = ri(1, 28); a = ri(1, 12); y = ri(1950, 2012); k = N.kader(g, a, y).sayi; } while (!k);
        return { s: g + " " + AYLAR[a - 1] + " " + y + " doğumlu birinin kader sayısı kaçtır?", c: k, o: sik(k, SAYI) }; },
      function () { var n = ri(100, 9999), k = N.tek(n); return { s: n + " sayısı tek haneye indirgenince kaç olur?", c: k, o: sik(k, RAKAM) }; },
      function () { var ad = ISIMLER[ri(0, ISIMLER.length - 1)], k = N.isimSayisi(ad, "hepsi").sayi; return { s: "\"" + ad + "\" isminin ifade sayısı kaçtır? (Pisagor tablosu)", c: k, o: sik(k, SAYI) }; },
      function () { var ad = ISIMLER[ri(0, ISIMLER.length - 1)], k = N.isimSayisi(ad, "sesli").sayi; return { s: "\"" + ad + "\" isminin ruh güdüsü (sesli harfler) sayısı kaçtır?", c: k, o: sik(k, SAYI) }; },
      function () { var g = ri(1, 31), k = N.dogumGunu(g).sayi; return { s: "Ayın " + g + "'inde doğan birinin doğum günü sayısı kaçtır?", c: k, o: sik(k, SAYI) }; },
      function () { var a = ri(2, 9), b = ri(2, 6), x = [a, a * b, a * b * b]; return { s: "Diziyi devam ettir: " + x.join(", ") + ", ?", c: a * b * b * b, o: sik(a * b * b * b, [a * b * b * b + a, a * b * b * b - a, a * b * b + a * b, a * b * b * 2, a * b * b * b + b]) }; },
      function () { var a = ri(1, 9), f = ri(2, 9), x = [a, a + f, a + 2 * f, a + 4 * f]; return { s: "Eksik sayıyı bul: " + x[0] + ", " + x[1] + ", " + x[2] + ", ?, " + x[3], c: a + 3 * f, o: sik(a + 3 * f, [a + 3 * f + 1, a + 3 * f - 1, a + 3 * f + 2, a + 2 * f + 1]) }; },
      function () { var y = ri(1940, 2030), k = N.tek(y); return { s: y + " yılının rakamları toplanıp tek haneye indirgenirse kaç olur?", c: k, o: sik(k, RAKAM) }; }
    ];
    var out = [], gor = {};
    /* Soru türleri dengeli dağılsın: her tür en fazla iki kez */
    var sira = karis(U.map(function (_, i) { return i; }).concat(U.map(function (_, i) { return i; }))), j = 0;
    while (out.length < TUR) { var q = U[sira[j % sira.length]](); j++; if (!gor[q.s]) { gor[q.s] = 1; out.push(q); } }
    return out;
  }

  function oyna(kok) {
    var kod = haftaKodu(new Date()), S = sorular(kod), i = 0, dogru = 0, puan = 0, zam;
    P.oyunBasla(OYUN); M.olay("oyun_basla", { oyun: OYUN, hafta: kod });
    var cubuk = doc.getElementById("oyun-cubuk");
    function cubukCiz() {
      if (!cubuk) return; cubuk.innerHTML = "";
      cubuk.appendChild(el("div", { class: "oy-cubuk-ust" }, [el("span", null, "Soru " + Math.min(i + 1, TUR) + " / " + TUR), el("b", null, puan + " puan")]));
      var r = el("div", { class: "oy-ray" }); r.appendChild(el("i", { style: "width:" + Math.round(100 * i / TUR) + "%" })); cubuk.appendChild(r);
    }
    function ciz() {
      cubukCiz();
      var q = S[i], t0 = Date.now(), kilit = false;
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Haftalık Arena · " + kod.replace("-H", " · ") + ". hafta"));
      a.appendChild(el("h2", { tabindex: "-1", class: "ss-soru" }, q.s));
      var sayac = el("div", { class: "oy-ray ha-sayac" }), sd = el("i", { style: "width:100%" }); sayac.appendChild(sd);
      a.appendChild(sayac);
      var sec = el("div", { class: "oy-secenekler dort", role: "group" }), geri = el("div", { class: "oy-geri", "aria-live": "polite" });
      function cevap(s, btn) {
        if (kilit) return; kilit = true; clearInterval(zam);
        var tamam = s === q.c, sure = (Date.now() - t0) / 1000, k = 0;
        [].forEach.call(sec.children, function (x, j) { x.disabled = true; if (q.o[j] === q.c) x.classList.add("dogru"); });
        if (btn && !tamam) btn.classList.add("yanlis");
        if (tamam) { dogru++; k = 100 + Math.round(50 * Math.max(0, SURE - sure) / SURE); puan += k; }
        geri.appendChild(el("p", { class: tamam ? "oy-dogru" : "oy-yanlis" }, s === null ? "Süre doldu. Doğru cevap: " + q.c : tamam ? "Doğru! +" + k + " puan" : "Doğru cevap: " + q.c));
        geri.appendChild(el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { i++; if (i < TUR) ciz(); else bitir(); } }, i < TUR - 1 ? "Sonraki soru" : "Sonucu gör"));
      }
      q.o.forEach(function (s) { sec.appendChild(el("button", { type: "button", class: "oy-secenek sayi", onclick: function (e) { cevap(s, e.currentTarget); } }, String(s))); });
      a.appendChild(sec); a.appendChild(geri); kok.appendChild(a);
      zam = setInterval(function () { var k = Math.max(0, SURE - (Date.now() - t0) / 1000); sd.style.width = (100 * k / SURE) + "%"; if (k <= 5) sayac.classList.add("az"); if (k <= 0) cevap(null, null); }, 150);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (x) {}
    }
    function bitir() {
      i = TUR; cubukCiz();
      var once = D.oku().hafta, rekor = once.kod !== kod || puan > once.enIyi;
      if (rekor) D.degistir(function (d) { d.hafta = { kod: kod, enIyi: puan }; });
      var ilk = P.oyunBitir(OYUN, { puan: puan });
      var kazan = dogru * 5 + (ilk ? 20 : 0); if (!ilk) kazan = Math.round(kazan / 4);
      P.xpVer(kazan, "Haftalık Arena"); P.gorevTamamla("oyun");
      if (dogru >= 8) P.rozetVer("sampiyon");
      M.olay("oyun_bitir", { oyun: OYUN, puan: puan, hafta: kod });
      try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
      var enIyi = D.oku().hafta.enIyi;
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Bu haftanın turu bitti"));
      a.appendChild(el("h2", { tabindex: "-1" }, (rekor ? "Haftalık rekorun: " : "") + puan + " puan"));
      var pe = el("b", null, "0");
      a.appendChild(el("div", { class: "oy-istat uc" }, [
        el("div", null, [pe, el("span", null, "Puan")]),
        el("div", null, [el("b", null, dogru + "/" + TUR), el("span", null, "Doğru")]),
        el("div", null, [el("b", null, String(enIyi)), el("span", null, "Bu haftaki en iyin")]),
        el("div", null, [el("b", null, "+" + kazan), el("span", null, "XP")])
      ]));
      M.say(pe, puan, 900);
      a.appendChild(el("p", null, "Bu haftanın 10 sorusu herkes için aynı. Arkadaşlarına puanını gönder, kimin daha iyi olduğunu görün. Sorular her pazartesi yenilenir; çevrimiçi sıralama tablosu yakında geliyor."));
      a.appendChild(el("div", { class: "oy-son-dugmeler" }, [
        el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { oyna(kok); } }, "Rekorunu geliştir"),
        M.waDugme("Numerolojim Haftalık Arena'da bu hafta " + puan + " puan yaptım (" + dogru + "/" + TUR + "). Sorular herkes için aynı, geçebilir misin? " + ADRES, function () { P.gorevTamamla("paylas"); P.rozetVer("paylasimci"); }),
        el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezi")
      ]));
      kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (e) {}
    }
    ciz();
  }
  var b = doc.getElementById("ha-hafta"); if (b) { var kod = haftaKodu(new Date()), h = D.oku().hafta; b.textContent = "Bu hafta: " + kod.replace("-H", ", ") + ". hafta" + (h.kod === kod && h.enIyi ? " · En iyi puanın: " + h.enIyi : ""); }
  w.NMJOyun.arena = { haftaKodu: haftaKodu, sorular: sorular };
  M.basla(oyna);
})(window, document);
