/* Sayı Avcısı · game.js
   60 saniyelik tur: hedef sayı verilir, rakamları toplandığında (tek haneye indirgenince)
   o sayıyı veren bütün sayıları yakala. Doğru yakalayışlar seri (kombo) çarpanı kazandırır. */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, el = M.el, OYUN = "avci";
  var SURE = 60, ADRES = "https://www.numerolojim.com.tr/oyunlar/sayi-avcisi/";

  function kok9(n) { return n ? 1 + (n - 1) % 9 : 0; }
  function adimlar(n) { var s = String(n), t = 0, out = s.split("").join("+"); for (var i = 0; i < s.length; i++) t += +s[i]; out += "=" + t; while (t > 9) { var s2 = String(t); t = 0; for (var j = 0; j < s2.length; j++) t += +s2[j]; out += "→" + s2.split("").join("+") + "=" + t; } return out; }
  function rast(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function oyna(kok) {
    var puan = 0, kombo = 1, tur = 0, dogru = 0, yanlis = 0, kalan = SURE, bitti = false, zamanlayici;
    P.oyunBasla(OYUN); M.olay("oyun_basla", { oyun: OYUN });
    kok.innerHTML = "";
    var ust = el("div", { class: "av-ust" });
    var puanEl = el("b", null, "0"), komboEl = el("b", null, "x1"), sureEl = el("b", null, String(SURE));
    ust.appendChild(el("div", null, [el("span", null, "Puan"), puanEl]));
    ust.appendChild(el("div", null, [el("span", null, "Seri"), komboEl]));
    ust.appendChild(el("div", null, [el("span", null, "Süre"), sureEl]));
    var ray = el("div", { class: "oy-ray av-ray" }), dolgu = el("i", { style: "width:100%" }); ray.appendChild(dolgu);
    var hedefEl = el("p", { class: "av-hedef", "aria-live": "polite" });
    var izgara = el("div", { class: "av-izgara", role: "group", "aria-label": "Sayılar" });
    var ipucu = el("p", { class: "av-ipucu", "aria-live": "polite" });
    kok.appendChild(ust); kok.appendChild(ray); kok.appendChild(hedefEl); kok.appendChild(izgara); kok.appendChild(ipucu);

    function yeniTur() {
      tur++;
      var hedef = rast(1, 9), ust = tur < 3 ? 99 : tur < 6 ? 499 : 9999, alt = tur < 3 ? 10 : 100;
      var adet = rast(3, 5), sayilar = [], kume = {};
      while (sayilar.length < adet) { var n = rast(alt, ust); if (kok9(n) === hedef && !kume[n]) { kume[n] = 1; sayilar.push(n); } }
      while (sayilar.length < 12) { var m = rast(alt, ust); if (kok9(m) !== hedef && !kume[m]) { kume[m] = 1; sayilar.push(m); } }
      sayilar = M.karistir(sayilar);
      var bulunacak = adet;
      hedefEl.innerHTML = "";
      hedefEl.appendChild(el("span", null, "Tur " + tur + " · Rakamları toplamı "));
      hedefEl.appendChild(el("b", null, String(hedef)));
      hedefEl.appendChild(el("span", null, " olan " + adet + " sayıyı yakala"));
      izgara.innerHTML = "";
      sayilar.forEach(function (n) {
        izgara.appendChild(el("button", { type: "button", class: "av-hucre", onclick: function (e) {
          if (bitti) return;
          var b = e.currentTarget; if (b.disabled) return;
          if (kok9(n) === hedef) {
            b.disabled = true; b.classList.add("dogru");
            var k = 10 * kombo; puan += k; dogru++; kombo = Math.min(5, kombo + 1); bulunacak--;
            ipucu.textContent = adimlar(n) + "  ·  +" + k;
            if (!bulunacak) { puan += 20 + tur * 5; ipucu.textContent = "Tur tamam! +" + (20 + tur * 5) + " bonus"; setTimeout(function () { if (!bitti) yeniTur(); }, 450); }
          } else {
            b.classList.remove("yanlis"); void b.offsetWidth; b.classList.add("yanlis");
            puan = Math.max(0, puan - 5); kombo = 1; yanlis++;
            ipucu.textContent = adimlar(n) + " → " + kok9(n) + ", hedef " + hedef + ". Seri sıfırlandı.";
          }
          puanEl.textContent = puan; komboEl.textContent = "x" + kombo;
        } }, String(n)));
      });
    }
    var son = Date.now();
    zamanlayici = setInterval(function () {
      var gecen = (Date.now() - son) / 1000; kalan = Math.max(0, SURE - gecen);
      sureEl.textContent = Math.ceil(kalan); dolgu.style.width = (100 * kalan / SURE) + "%";
      if (kalan <= 10) ray.classList.add("az");
      if (kalan <= 0) { clearInterval(zamanlayici); bitir(); }
    }, 200);
    yeniTur();

    function bitir() {
      if (bitti) return; bitti = true; clearInterval(zamanlayici); doc.removeEventListener("visibilitychange", gizle);
      var isabet = dogru + yanlis ? Math.round(100 * dogru / (dogru + yanlis)) : 0;
      var ilk = P.oyunBitir(OYUN, { puan: puan });
      var kazan = Math.min(60, Math.round(puan / 8));
      if (!ilk) kazan = Math.round(kazan / 4);
      P.xpVer(kazan, "Sayı Avcısı");
      P.gorevTamamla("oyun");
      if (puan >= 400) P.rozetVer("keskin_goz");
      M.olay("oyun_bitir", { oyun: OYUN, puan: puan });
      try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
      var enIyi = D.oku().oyunlar[OYUN].enIyi;
      kok.innerHTML = "";
      var a = el("div", { class: "oy-asama giris" });
      a.appendChild(el("p", { class: "oy-ust" }, "Süre doldu"));
      a.appendChild(el("h2", { tabindex: "-1" }, puan >= enIyi && puan > 0 ? "Yeni rekor: " + puan + " puan!" : puan + " puan"));
      var p1 = el("b", null, "0");
      a.appendChild(el("div", { class: "oy-istat uc" }, [
        el("div", null, [p1, el("span", null, "Puan")]),
        el("div", null, [el("b", null, String(tur)), el("span", null, "Tur")]),
        el("div", null, [el("b", null, "%" + isabet), el("span", null, "İsabet")]),
        el("div", null, [el("b", null, String(enIyi)), el("span", null, "En iyi puanın")]),
        el("div", null, [el("b", null, "+" + kazan), el("span", null, "XP")])
      ]));
      M.say(p1, puan, 900);
      a.appendChild(el("p", null, "İpucu: Bir sayının rakamlarını tek hane kalana kadar topladığında numerolojideki indirgenmiş değerini bulursun. 47 → 4 + 7 = 11 → 1 + 1 = 2. Kader sayısı da tam olarak böyle hesaplanır."));
      a.appendChild(el("div", { class: "oy-son-dugmeler" }, [
        el("button", { type: "button", class: "btn oy-buyuk", onclick: function () { oyna(kok); } }, "Tekrar oyna"),
        M.waDugme("Numerolojim Sayı Avcısı'nda 60 saniyede " + puan + " puan yaptım. Geçebilir misin? " + ADRES, function () { P.gorevTamamla("paylas"); P.rozetVer("paylasimci"); }),
        el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezi"),
        el("a", { class: "btn ghost", href: "/kader-sayilari.html" }, "Kader sayını hesapla")
      ]));
      kok.appendChild(a);
      try { a.querySelector("h2").focus({ preventScroll: true }); } catch (e) {}
    }
    /* Sekme arka plana geçerse tur biter (süre hilesini ve uygulamada arka planda saymayı önler) */
    function gizle() { if (doc.hidden && !bitti) bitir(); }
    doc.addEventListener("visibilitychange", gizle);
  }
  M.basla(oyna);
})(window, document);
