/* Numerolojim hesap motoru — sitedeki BÜTÜN araçlar bu tek dosyayı kullanır.
   Yöntem (Pisagor numerolojisi, Türk alfabesine uyarlanmış):
   - Harf değerleri: A J S Ş=1, B K T=2, C Ç L U Ü=3, D M V=4, E N=5, F O Ö=6, G Ğ P Y=7, H Z=8, I İ R=9
     (Â=A, Î=İ, Û=U; Q=8, W=5, X=6 yabancı isimler için)
   - Sesli harfler: A E I İ O Ö U Ü (Â Î Û). Y Türkçede sessizdir.
   - Kader sayısı: doğum tarihindeki tüm rakamların toplamı; 11, 22, 33 indirgenmez.
   - Kişisel yıl/ay/gün: 1–9 arasına indirgenir (master tutulmaz).
   - Karmik borç: indirgeme zincirinde 13, 14, 16 ya da 19 görülmesi.
   Bu dosya tarayıcıda window.NMJ olarak, Node'da require() ile çalışır. Hiçbir veri saklanmaz. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.NMJ = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var LV = { a:1,b:2,c:3,"ç":3,d:4,e:5,f:6,g:7,"ğ":7,h:8,"ı":9,i:9,j:1,k:2,l:3,m:4,n:5,o:6,"ö":6,p:7,q:8,r:9,
             s:1,"ş":1,t:2,u:3,"ü":3,v:4,w:5,x:6,y:7,z:8,"â":1,"î":9,"û":3 };
  var SESLI = { a:1,e:1,"ı":1,i:1,o:1,"ö":1,u:1,"ü":1,"â":1,"î":1,"û":1 };
  var MASTER = { 11:1, 22:1, 33:1 };
  var BORC = { 13:1, 14:1, 16:1, 19:1 };

  function rakamTop(n) { return String(n).split("").reduce(function (a, d) { return a + (+d || 0); }, 0); }

  /* İndirgeme zinciri: [toplam, ..., sonuç]. master=true ise 11/22/33'te durur. */
  function zincir(n, master) {
    var z = [n];
    while (n > 9 && !(master && MASTER[n])) { n = rakamTop(n); z.push(n); }
    return z;
  }
  function indir(n, master) { var z = zincir(n, master !== false); return z[z.length - 1]; }
  function tek(n) { return indir(n, false); }              // her zaman 1–9 (0 için 0)
  function taban(n) { return n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n; }
  function borcVar(z) { for (var i = 0; i < z.length - 1; i++) if (BORC[z[i]]) return z[i]; return 0; }

  function kucult(s) {
    s = String(s || "");
    try { s = s.toLocaleLowerCase("tr"); } catch (e) { s = s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase(); }
    return s.replace(/i̇/g, "i");
  }
  /* İsmi harf listesine çevirir: [{h:'a', d:1, s:true}, ...] (boşluk ve işaretler atlanır) */
  function harfler(isim) {
    var out = [], k = kucult(isim);
    for (var i = 0; i < k.length; i++) { var c = k[i]; if (LV[c]) out.push({ h: c, d: LV[c], s: !!SESLI[c] }); }
    return out;
  }
  function harfBuyuk(c) { return c === "i" ? "İ" : c === "ı" ? "I" : c === "â" ? "Â" : c === "î" ? "Î" : c === "û" ? "Û" : c.toLocaleUpperCase ? c.toLocaleUpperCase("tr") : c.toUpperCase(); }

  function isimSayisi(isim, tur) {           // tur: "hepsi" | "sesli" | "sessiz"
    var hs = harfler(isim).filter(function (x) { return tur === "sesli" ? x.s : tur === "sessiz" ? !x.s : true; });
    var top = hs.reduce(function (a, x) { return a + x.d; }, 0);
    var z = top ? zincir(top, true) : [0];
    return { sayi: z[z.length - 1], toplam: top, zincir: z, borc: borcVar(z), harf: hs.length };
  }

  function tarihGecerli(g, a, y) {
    g = +g; a = +a; y = +y;
    if (!g || !a || !y || a < 1 || a > 12 || g < 1 || y < 1000 || y > 9999) return false;
    var d = new Date(y, a - 1, g);
    return d.getFullYear() === y && d.getMonth() === a - 1 && d.getDate() === g;
  }

  function kader(g, a, y) {
    var rakamlar = ("" + g + a + y).split("").map(Number);
    var top = rakamlar.reduce(function (s, d) { return s + d; }, 0);
    var z = zincir(top, true);
    return { sayi: z[z.length - 1], rakamlar: rakamlar, toplam: top, zincir: z, borc: borcVar(z) };
  }
  function dogumGunu(g) {
    var z = zincir(+g, true);
    return { sayi: z[z.length - 1], zincir: z, borc: BORC[+g] ? +g : 0 };
  }

  /* Harf yoğunluğu: isimde 1–9 her sayıdan kaç harf var */
  function yogunluk(isim) {
    var c = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
    harfler(isim).forEach(function (x) { c[x.d]++; });
    return c;
  }
  function karmikDersler(isim) {
    var c = yogunluk(isim), out = [];
    for (var i = 1; i <= 9; i++) if (!c[i]) out.push(i);
    return out;
  }
  function gizliTutku(isim) {
    var c = yogunluk(isim), max = 0, out = [];
    for (var i = 1; i <= 9; i++) if (c[i] > max) max = c[i];
    if (max < 2) return { sayilar: [], adet: max };
    for (i = 1; i <= 9; i++) if (c[i] === max) out.push(i);
    return { sayilar: out, adet: max };
  }

  /* Numeroloji matrisi (Pisagor kare tablosu): doğum tarihindeki 1–9 rakamlarının sayısı
     Satırlar: 1-4-7, 2-5-8, 3-6-9  */
  var HATLAR = [
    { id: "fiziksel", ad: "Fiziksel hat", s: [1, 4, 7] },
    { id: "duygusal", ad: "Duygusal hat", s: [2, 5, 8] },
    { id: "zihinsel", ad: "Zihinsel hat", s: [3, 6, 9] },
    { id: "planlama", ad: "Planlama hattı", s: [1, 2, 3] },
    { id: "irade", ad: "İrade hattı", s: [4, 5, 6] },
    { id: "eylem", ad: "Eylem hattı", s: [7, 8, 9] },
    { id: "kararlilik", ad: "Kararlılık köşegeni", s: [1, 5, 9] },
    { id: "sezgi", ad: "Sezgi köşegeni", s: [3, 5, 7] }
  ];
  function matris(g, a, y) {
    var c = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
    ("" + g + a + y).split("").forEach(function (d) { d = +d; if (d) c[d]++; });
    var hat = HATLAR.map(function (h) {
      var dolu = h.s.filter(function (n) { return c[n] > 0; }).length;
      return { id: h.id, ad: h.ad, sayilar: h.s, dolu: dolu, durum: dolu === 3 ? "tam" : dolu === 0 ? "bos" : "kismi" };
    });
    return { adet: c, hatlar: hat };
  }

  /* Yaşam döngüleri: zirve (pinnacle) ve sınav (challenge) sayıları */
  function donguler(g, a, y) {
    var ay = tek(a), gun = tek(g), yil = tek(rakamTop(y));
    var p1 = indir(ay + gun), p2 = indir(gun + yil), p3 = indir(taban(p1) + taban(p2)), p4 = indir(ay + yil);
    var c1 = Math.abs(ay - gun), c2 = Math.abs(gun - yil), c3 = Math.abs(c1 - c2), c4 = Math.abs(ay - yil);
    var yol = taban(kader(g, a, y).sayi);
    if (yol > 9) yol = tek(yol);
    var bit1 = 36 - yol;
    var donem = [
      { no: 1, zirve: p1, sinav: c1, bas: 0, bit: bit1 },
      { no: 2, zirve: p2, sinav: c2, bas: bit1 + 1, bit: bit1 + 9 },
      { no: 3, zirve: p3, sinav: c3, bas: bit1 + 10, bit: bit1 + 18 },
      { no: 4, zirve: p4, sinav: c4, bas: bit1 + 19, bit: null }
    ];
    donem.forEach(function (d) { d.basYil = y + d.bas; d.bitYil = d.bit === null ? null : y + d.bit; });
    return { donemler: donem, anaSinav: c3 };
  }
  function simdikiDonem(dg, y, bugun) {
    var yas = bugun.getFullYear() - y;
    for (var i = 0; i < dg.donemler.length; i++) {
      var d = dg.donemler[i];
      if (yas >= d.bas && (d.bit === null || yas <= d.bit)) return d.no;
    }
    return 4;
  }

  function kisiselYil(g, a, yil) { return tek(tek(g) + tek(a) + tek(rakamTop(yil))); }
  function kisiselAy(g, a, yil, ay) { return tek(kisiselYil(g, a, yil) + tek(ay)); }
  function kisiselGun(g, a, tarih) {
    return tek(kisiselAy(g, a, tarih.getFullYear(), tarih.getMonth() + 1) + tek(tarih.getDate()));
  }
  function evrenselYil(yil) { return tek(rakamTop(yil)); }
  function evrenselGun(t) { return tek(rakamTop("" + t.getDate() + (t.getMonth() + 1) + t.getFullYear())); }

  /* Uyum tablosu (1–9 taban sayılar, simetrik). Sitenin yayınladığı çift yorumlarıyla aynı puanlar. */
  var UYUM = {
    "1-1":68,"1-2":88,"1-3":82,"1-4":60,"1-5":90,"1-6":75,"1-7":65,"1-8":85,"1-9":80,
    "2-2":78,"2-3":72,"2-4":85,"2-5":55,"2-6":92,"2-7":68,"2-8":70,"2-9":90,
    "3-3":80,"3-4":58,"3-5":88,"3-6":80,"3-7":62,"3-8":65,"3-9":85,
    "4-4":82,"4-5":50,"4-6":88,"4-7":85,"4-8":70,"4-9":60,
    "5-5":75,"5-6":65,"5-7":78,"5-8":72,"5-9":80,
    "6-6":85,"6-7":70,"6-8":75,"6-9":90,
    "7-7":80,"7-8":68,"7-9":82,
    "8-8":78,"8-9":72,
    "9-9":85
  };
  function ciftKey(x, y) { x = taban(x); y = taban(y); if (x > 9) x = tek(x); if (y > 9) y = tek(y); return Math.min(x, y) + "-" + Math.max(x, y); }
  function ciftPuan(x, y) {
    if (!x || !y) return null;
    var p = UYUM[ciftKey(x, y)];
    if (x === y && MASTER[x]) p += 3;
    return Math.min(99, p);
  }
  function profil(isim, g, a, y, bugun) {
    bugun = bugun || new Date();
    var p = { isim: String(isim || "").trim(), g: +g, a: +a, y: +y };
    if (tarihGecerli(g, a, y)) {
      p.kader = kader(g, a, y);
      p.dogumGunu = dogumGunu(g);
      p.matris = matris(g, a, y);
      p.donguler = donguler(+g, +a, +y);
      p.donem = simdikiDonem(p.donguler, +y, bugun);
      p.kisiselYil = kisiselYil(g, a, bugun.getFullYear());
      p.kisiselAy = kisiselAy(g, a, bugun.getFullYear(), bugun.getMonth() + 1);
      p.kisiselGun = kisiselGun(g, a, bugun);
    }
    if (harfler(isim).length) {
      p.ifade = isimSayisi(isim, "hepsi");
      p.ruh = isimSayisi(isim, "sesli");
      p.kisilik = isimSayisi(isim, "sessiz");
      p.yogunluk = yogunluk(isim);
      p.karmikDersler = karmikDersler(isim);
      p.gizliTutku = gizliTutku(isim);
      var hs = harfler(isim), ilk = kucult(isim).trim().split(/\s+/)[0];
      var ilkHarfler = harfler(ilk);
      p.temelTasi = hs[0] ? hs[0].h : null;
      p.kapakTasi = ilkHarfler.length ? ilkHarfler[ilkHarfler.length - 1].h : null;
      var sv = hs.filter(function (x) { return x.s; })[0];
      p.ilkSesli = sv ? sv.h : null;
      if (p.kader) p.olgunluk = { sayi: indir(p.kader.sayi + p.ifade.sayi) };
    }
    p.karmikBorclar = [];
    ["kader", "ifade", "ruh", "kisilik", "dogumGunu"].forEach(function (k) {
      if (p[k] && p[k].borc && p.karmikBorclar.indexOf(p[k].borc) < 0) p.karmikBorclar.push(p[k].borc);
    });
    return p;
  }

  function uyum(A, B) {
    var boyut = [
      { id: "yol", ad: "Yaşam yolu uyumu", ag: 30, a: A.kader && A.kader.sayi, b: B.kader && B.kader.sayi },
      { id: "ruh", ad: "Kalp ve tutku uyumu", ag: 25, a: A.ruh && A.ruh.sayi, b: B.ruh && B.ruh.sayi },
      { id: "iletisim", ad: "İletişim uyumu", ag: 20, a: A.ifade && A.ifade.sayi, b: B.ifade && B.ifade.sayi },
      { id: "gunluk", ad: "Günlük yaşam uyumu", ag: 15, a: A.kisilik && A.kisilik.sayi, b: B.kisilik && B.kisilik.sayi },
      { id: "ritim", ad: "Bu yılın ritmi", ag: 10, a: A.kisiselYil, b: B.kisiselYil }
    ];
    var top = 0, ag = 0;
    boyut.forEach(function (d) { d.puan = ciftPuan(d.a, d.b); if (d.puan !== null) { top += d.puan * d.ag; ag += d.ag; } d.key = d.puan === null ? null : ciftKey(d.a, d.b); });
    return { boyutlar: boyut, genel: ag ? Math.round(top / ag) : null };
  }

  /* Ev, telefon, plaka gibi numaraların sayısı (harfler de değerlendirilir) */
  function numara(metin) {
    var s = kucult(metin), top = 0, parca = [];
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (/[0-9]/.test(c)) { top += +c; parca.push(c); }
      else if (LV[c]) { top += LV[c]; parca.push(harfBuyuk(c) + "=" + LV[c]); }
    }
    return { sayi: top ? tek(top) : 0, toplam: top, parca: parca };
  }

  /* Yaşam alanları skoru: çekirdek sayıların alanlara yatkınlığı (0–1), ağırlıklı ortalama */
  var YATKINLIK = {
    liderlik:  { 1:1, 2:.3, 3:.5, 4:.6, 5:.5, 6:.5, 7:.4, 8:1, 9:.6 },
    kariyer:   { 1:.9, 2:.5, 3:.6, 4:.9, 5:.6, 6:.6, 7:.7, 8:1, 9:.6 },
    finans:    { 1:.7, 2:.5, 3:.4, 4:.9, 5:.5, 6:.6, 7:.4, 8:1, 9:.4 },
    ask:       { 1:.4, 2:1, 3:.7, 4:.6, 5:.6, 6:1, 7:.4, 8:.5, 9:.8 },
    sosyal:    { 1:.5, 2:.7, 3:1, 4:.4, 5:1, 6:.8, 7:.3, 8:.6, 9:.8 },
    ruhsal:    { 1:.3, 2:.7, 3:.5, 4:.3, 5:.4, 6:.6, 7:1, 8:.3, 9:1 }
  };
  var ALAN_AD = { liderlik: "Liderlik", kariyer: "Kariyer", finans: "Finans", ask: "Aşk", sosyal: "Sosyal yaşam", ruhsal: "Ruhsal gelişim" };
  function alanSkorlari(p) {
    var kaynak = [];
    if (p.kader) kaynak.push([p.kader.sayi, 3]);
    if (p.ifade) kaynak.push([p.ifade.sayi, 2], [p.ruh.sayi, 2], [p.kisilik.sayi, 1]);
    if (p.dogumGunu) kaynak.push([p.dogumGunu.sayi, 1]);
    if (p.olgunluk) kaynak.push([p.olgunluk.sayi, 1]);
    var out = {};
    Object.keys(YATKINLIK).forEach(function (alan) {
      var t = 0, w = 0;
      kaynak.forEach(function (k) {
        var n = k[0], b = taban(n); if (b > 9) b = tek(b);
        var v = YATKINLIK[alan][b] || 0;
        if (MASTER[n] && (alan === "ruhsal" || alan === "liderlik")) v = Math.min(1, v + .2);
        t += v * k[1]; w += k[1];
      });
      out[alan] = w ? Math.round(45 + 50 * (t / w)) : null;
    });
    return out;
  }

  return {
    LV: LV, SESLI: SESLI, HATLAR: HATLAR, UYUM: UYUM, ALAN_AD: ALAN_AD,
    rakamTop: rakamTop, zincir: zincir, indir: indir, tek: tek, taban: taban,
    kucult: kucult, harfler: harfler, harfBuyuk: harfBuyuk, isimSayisi: isimSayisi, tarihGecerli: tarihGecerli,
    kader: kader, dogumGunu: dogumGunu, yogunluk: yogunluk, karmikDersler: karmikDersler, gizliTutku: gizliTutku,
    matris: matris, donguler: donguler, simdikiDonem: simdikiDonem,
    kisiselYil: kisiselYil, kisiselAy: kisiselAy, kisiselGun: kisiselGun, evrenselYil: evrenselYil, evrenselGun: evrenselGun,
    ciftKey: ciftKey, ciftPuan: ciftPuan, profil: profil, uyum: uyum, numara: numara, alanSkorlari: alanSkorlari
  };
});
