/* Numeroloji Arenası · storage.js
   Oyun ilerlemesini saklar. Yalnızca takma ad, puan, rozet, görev ve oyun özetleri tutulur;
   doğum tarihi ve gerçek ad ASLA saklanmaz (beyaz liste ile korunur).
   Kaynak değiştirilebilir: ileride Firebase/Firestore için depo.kaynakAyarla({oku, yaz}) yeterli. */
(function (w) {
  "use strict";
  var KEY = "nmj_arena_v1", SURUM = 1;
  var bellek = null; // localStorage kapalıysa (gizli sekme vb.) yalnızca bu sayfa boyunca tutulur

  var yerel = {
    oku: function () {
      try { var s = w.localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return bellek; }
    },
    yaz: function (d) {
      bellek = d;
      try { w.localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
    },
    sil: function () { bellek = null; try { w.localStorage.removeItem(KEY); } catch (e) {} }
  };
  var kaynak = yerel;

  function bos() {
    return { v: SURUM, takmaAd: "", xp: 0, rozetler: {}, gorevler: { tarih: "", bitti: {} },
             seri: { son: "", gun: 0 }, oyunlar: {}, kartlar: {}, cark: { tarih: "", sayi: 0, yapildi: false },
             hafta: { kod: "", enIyi: 0 }, guncel: "" };
  }
  function temizAd(s) {
    return String(s || "").replace(/[<>"'`&\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
  }
  /* Beyaz liste: bilinmeyen alanlar (ör. yanlışlıkla eklenmiş bir tarih) kaydedilmez */
  function duzenle(d) {
    var b = bos();
    if (!d || typeof d !== "object") return b;
    b.takmaAd = temizAd(d.takmaAd);
    b.xp = Math.max(0, Math.min(1e7, Math.floor(+d.xp || 0)));
    if (d.rozetler && typeof d.rozetler === "object") Object.keys(d.rozetler).forEach(function (k) { if (/^[a-z0-9_]{2,30}$/.test(k)) b.rozetler[k] = String(d.rozetler[k]).slice(0, 10); });
    if (d.gorevler && /^\d{4}-\d\d-\d\d$/.test(d.gorevler.tarih || "")) {
      b.gorevler.tarih = d.gorevler.tarih;
      Object.keys(d.gorevler.bitti || {}).forEach(function (k) { if (/^[a-z_]{2,20}$/.test(k)) b.gorevler.bitti[k] = true; });
    }
    if (d.seri) { b.seri.son = /^\d{4}-\d\d-\d\d$/.test(d.seri.son || "") ? d.seri.son : ""; b.seri.gun = Math.max(0, Math.min(9999, +d.seri.gun || 0)); }
    if (d.oyunlar && typeof d.oyunlar === "object") Object.keys(d.oyunlar).forEach(function (k) {
      var o = d.oyunlar[k]; if (!/^[a-z_]{2,20}$/.test(k) || !o) return;
      b.oyunlar[k] = { oynama: Math.max(0, +o.oynama || 0), bitirme: Math.max(0, +o.bitirme || 0), enIyi: Math.max(0, +o.enIyi || 0),
                       sonTarih: /^\d{4}-\d\d-\d\d$/.test(o.sonTarih || "") ? o.sonTarih : "",
                       sonSayi: [1,2,3,4,5,6,7,8,9,11,22,33].indexOf(+o.sonSayi) >= 0 ? +o.sonSayi : 0,
                       sonSembol: /^[a-z]{2,12}$/.test(o.sonSembol || "") ? o.sonSembol : "" };
    });
    var SAY = [1,2,3,4,5,6,7,8,9,11,22,33], TARIH = /^\d{4}-\d\d-\d\d$/;
    if (d.kartlar && typeof d.kartlar === "object") Object.keys(d.kartlar).forEach(function (k) { if (SAY.indexOf(+k) >= 0) b.kartlar[+k] = String(d.kartlar[k]).slice(0, 10); });
    if (d.cark && TARIH.test(d.cark.tarih || "")) b.cark = { tarih: d.cark.tarih, sayi: SAY.indexOf(+d.cark.sayi) >= 0 ? +d.cark.sayi : 0, yapildi: !!d.cark.yapildi };
    if (d.hafta && /^\d{4}-H\d{1,2}$/.test(d.hafta.kod || "")) b.hafta = { kod: d.hafta.kod, enIyi: Math.max(0, Math.min(1e6, +d.hafta.enIyi || 0)) };
    b.guncel = String(d.guncel || "").slice(0, 30);
    return b;
  }

  var depo = {
    oku: function () { return duzenle(kaynak.oku()); },
    /* degistir(fn): fn veriyi değiştirir, sonra kaydedilir. Kaydedilen son hali döner. */
    degistir: function (fn) {
      var d = depo.oku(); fn(d); d.guncel = new Date().toISOString(); d = duzenle(d); kaynak.yaz(d);
      try { w.dispatchEvent(new CustomEvent("nmj:depo", { detail: d })); } catch (e) {}
      return d;
    },
    sifirla: function () { kaynak.sil ? kaynak.sil() : kaynak.yaz(bos()); try { w.dispatchEvent(new CustomEvent("nmj:depo", { detail: bos() })); } catch (e) {} },
    temizAd: temizAd,
    /* İleride: depo.kaynakAyarla(firestoreKaynagi) — {oku(), yaz(d), sil()} arayüzü */
    kaynakAyarla: function (k) { if (k && typeof k.oku === "function" && typeof k.yaz === "function") kaynak = k; },
    _duzenle: duzenle
  };
  w.NMJOyun = w.NMJOyun || {};
  w.NMJOyun.depo = depo;
})(window);
