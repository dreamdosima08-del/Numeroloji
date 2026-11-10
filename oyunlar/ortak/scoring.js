/* Numeroloji Arenası · scoring.js
   XP, seviye, rozet, günlük görev ve seri sistemi. Bütün oyunlar bu modülü kullanır.
   Not: Bu puanlar tarayıcıda tutulur ve güvenilir rekabet verisi değildir; çevrimiçi
   liderlik tablosu eklendiğinde puanlar sunucu tarafında yeniden doğrulanmalıdır. */
(function (w) {
  "use strict";
  var depo = w.NMJOyun.depo;

  var SEVIYELER = [
    { ad: "Sayı Meraklısı", min: 0 },
    { ad: "Sayı Kaşifi", min: 150 },
    { ad: "Keşif Ustası", min: 400 },
    { ad: "Numeroloji Uzmanı", min: 800 },
    { ad: "Numeroloji Ustası", min: 1500 }
  ];
  var XP = { oyun_basla: 10, asama: 10, bulmaca: 20, bulmaca_ipucu: 10, oyun_bitir: 50, oyun_tekrar: 10, gunluk_gorev: 30 };

  var ROZETLER = {
    ilk_adim:   { ad: "İlk Adım", aciklama: "İlk oyununu tamamladın.", ikon: "✦" },
    kesifci:    { ad: "Kendini Keşfeden", aciklama: "Kendini Keşfet yolculuğunun 7 aşamasını bitirdin.", ikon: "◎" },
    keskin:     { ad: "Keskin Zihin", aciklama: "Üç bulmacayı ipucu almadan doğru çözdün.", ikon: "◆" },
    ana_sayi:   { ad: "Ana Sayı Taşıyıcısı", aciklama: "Yaşam yolu sayın 11, 22 ya da 33 çıktı.", ikon: "✶" },
    paylasimci: { ad: "Işığını Paylaş", aciklama: "Sonuç kartını kaydettin ya da paylaştın.", ikon: "↗" },
    seri3:      { ad: "Üç Gün Üst Üste", aciklama: "Üç gün art arda oyun oynadın.", ikon: "③" },
    seri7:      { ad: "Haftalık Ritim", aciklama: "Yedi gün art arda oyun oynadın.", ikon: "⑦" },
    gorevci:    { ad: "Görev Avcısı", aciklama: "Bir günün bütün görevlerini tamamladın.", ikon: "☑" },
    usta:       { ad: "Numeroloji Ustası", aciklama: "En yüksek seviyeye ulaştın.", ikon: "♛" }
  };
  /* Yaşam yolu mühürleri: Kendini Keşfet'i bitirince sayına göre kazanılır */
  var MUHUR = { 1: "Öncünün Mührü", 2: "Barışın Mührü", 3: "İlhamın Mührü", 4: "Temelin Mührü", 5: "Rüzgârın Mührü",
                6: "Şefkatin Mührü", 7: "Bilgeliğin Mührü", 8: "Gücün Mührü", 9: "Gönlün Mührü",
                11: "Ana Sayı 11 Mührü", 22: "Ana Sayı 22 Mührü", 33: "Ana Sayı 33 Mührü" };
  Object.keys(MUHUR).forEach(function (n) {
    ROZETLER["kader_" + n] = { ad: MUHUR[n], aciklama: "Yaşam yolu sayın " + n + ". Kendini Keşfet yolculuğunda kazanıldı.", ikon: String(n) };
  });
  var GOREVLER = [
    { id: "oyun", ad: "Bugün bir oyunu baştan sona tamamla" },
    { id: "ipucusuz", ad: "Bir bulmacayı ipucu almadan çöz" },
    { id: "paylas", ad: "Sonuç kartını kaydet ya da paylaş" }
  ];

  function bugun(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dun() { var d = new Date(); d.setDate(d.getDate() - 1); return bugun(d); }

  function seviye(xp) {
    var i = 0; while (i + 1 < SEVIYELER.length && xp >= SEVIYELER[i + 1].min) i++;
    var alt = SEVIYELER[i].min, ust = SEVIYELER[i + 1] ? SEVIYELER[i + 1].min : null;
    return { no: i + 1, ad: SEVIYELER[i].ad, alt: alt, ust: ust, sonraki: SEVIYELER[i + 1] ? SEVIYELER[i + 1].ad : null,
             yuzde: ust ? Math.round(100 * (xp - alt) / (ust - alt)) : 100, kalan: ust ? ust - xp : 0 };
  }

  function bildir(tur, detay) { try { w.dispatchEvent(new CustomEvent("nmj:" + tur, { detail: detay })); } catch (e) {} }

  /* Seri: o gün ilk kez puan kazanıldığında güncellenir */
  function seriGuncelle(d, yeni) {
    var b = bugun();
    if (d.seri.son === b) return;
    d.seri.gun = d.seri.son === dun() ? d.seri.gun + 1 : 1;
    d.seri.son = b;
    if (d.seri.gun >= 3 && !d.rozetler.seri3) { d.rozetler.seri3 = b; yeni.push("seri3"); }
    if (d.seri.gun >= 7 && !d.rozetler.seri7) { d.rozetler.seri7 = b; yeni.push("seri7"); }
  }

  /* xpVer(miktar, neden): puanı ekler; seviye atlama ve yeni rozetleri döndürür */
  function xpVer(miktar, neden) {
    miktar = Math.max(0, Math.round(miktar || 0));
    var once, sonra, yeni = [];
    var d = depo.degistir(function (d) {
      once = seviye(d.xp); d.xp += miktar; seriGuncelle(d, yeni);
      sonra = seviye(d.xp);
      if (sonra.no === SEVIYELER.length && !d.rozetler.usta) { d.rozetler.usta = bugun(); yeni.push("usta"); }
    });
    var s = { miktar: miktar, neden: neden || "", xp: d.xp, seviye: sonra, seviyeAtladi: sonra.no > once.no, yeniRozetler: yeni };
    if (miktar) bildir("xp", s);
    yeni.forEach(function (r) { bildir("rozet", { id: r, rozet: ROZETLER[r] }); });
    return s;
  }

  function rozetVer(id) {
    if (!ROZETLER[id]) return false;
    var yeni = false;
    depo.degistir(function (d) { if (!d.rozetler[id]) { d.rozetler[id] = bugun(); yeni = true; } });
    if (yeni) bildir("rozet", { id: id, rozet: ROZETLER[id] });
    return yeni;
  }

  function gorevler() {
    var d = depo.oku(), b = bugun(), bitti = d.gorevler.tarih === b ? d.gorevler.bitti : {};
    return GOREVLER.map(function (g) { return { id: g.id, ad: g.ad, xp: XP.gunluk_gorev, bitti: !!bitti[g.id] }; });
  }
  /* Günlük görev: aynı gün ikinci kez puan vermez */
  function gorevTamamla(id) {
    if (!GOREVLER.some(function (g) { return g.id === id; })) return null;
    var yeni = false, hepsi = false;
    depo.degistir(function (d) {
      var b = bugun();
      if (d.gorevler.tarih !== b) d.gorevler = { tarih: b, bitti: {} };
      if (!d.gorevler.bitti[id]) { d.gorevler.bitti[id] = true; yeni = true; }
      hepsi = GOREVLER.every(function (g) { return d.gorevler.bitti[g.id]; });
    });
    if (!yeni) return null;
    bildir("gorev", { id: id });
    var s = xpVer(XP.gunluk_gorev, "Günlük görev");
    if (hepsi) rozetVer("gorevci");
    return s;
  }

  /* Oyun bitişi: günün ilk bitirişi tam puan, sonrakiler sınırlı (puan kasılmasını önler) */
  function oyunBitir(oyun, ozet) {
    var ilkBugun = false;
    depo.degistir(function (d) {
      var o = d.oyunlar[oyun] || { oynama: 0, bitirme: 0, enIyi: 0 };
      ilkBugun = o.sonTarih !== bugun();
      o.bitirme = (o.bitirme || 0) + 1;
      o.enIyi = Math.max(o.enIyi || 0, ozet.puan || 0);
      o.sonTarih = bugun();
      if (ozet.sayi) o.sonSayi = ozet.sayi;
      if (ozet.sembol) o.sonSembol = ozet.sembol;
      d.oyunlar[oyun] = o;
    });
    return ilkBugun;
  }
  function oyunBasla(oyun) {
    depo.degistir(function (d) { var o = d.oyunlar[oyun] || { oynama: 0, bitirme: 0, enIyi: 0 }; o.oynama = (o.oynama || 0) + 1; d.oyunlar[oyun] = o; });
  }

  w.NMJOyun.puan = {
    SEVIYELER: SEVIYELER, XP: XP, ROZETLER: ROZETLER,
    seviye: seviye, xpVer: xpVer, rozetVer: rozetVer, gorevler: gorevler, gorevTamamla: gorevTamamla,
    oyunBasla: oyunBasla, oyunBitir: oyunBitir, bugun: bugun
  };
})(window);
