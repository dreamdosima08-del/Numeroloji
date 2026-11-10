/* Kendini Keşfet · game.js
   7 aşamalı numeroloji yolculuğu. Ortak modüller: storage.js, scoring.js, numerology.js, game-engine.js.
   Gizlilik: doğum tarihi yalnızca bu sayfanın belleğinde tutulur; hiçbir yere kaydedilmez ve paylaşılmaz. */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, S = O.sayi, I = O.kesfetIcerik;
  var el = M.el, OYUN = "kesfet", ADRES = "https://www.numerolojim.com.tr/oyunlar/kendini-kesfet/";
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var UYG = /NumerolojimApp\/(\d+)\.(\d+)/.exec(navigator.userAgent);
  var UYG_YENI = UYG && (+UYG[1] * 100 + +UYG[2]) >= 102;

  var kok = doc.getElementById("oyun"), cubuk = doc.getElementById("oyun-cubuk");
  if (!kok) return;

  /* ---------- Yardımcılar ---------- */
  function karistir(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sec(a) { return a[Math.floor(Math.random() * a.length)]; }
  function olay(ad, p) { try { w.gtag && w.gtag("event", ad, p || {}); } catch (e) {} }
  function tekrarMi() { var o = D.oku().oyunlar[OYUN]; return !!(o && o.sonTarih === P.bugun()); }
  function xp(miktar, neden) { if (miktar > 0) P.xpVer(miktar, neden); }
  function baslik(kap, ust, h, alt) {
    kap.appendChild(el("p", { class: "oy-ust" }, ust));
    kap.appendChild(el("h2", null, h));
    if (alt) kap.appendChild(el("p", { class: "oy-alt" }, alt));
  }
  function dugme(metin, fn, cls) { return el("button", { type: "button", class: "btn " + (cls || ""), onclick: fn }, metin); }

  var IKON = {
    anahtar: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="20" cy="32" r="11"/><circle cx="20" cy="32" r="4"/><path d="M31 32h26M49 32v8M42 32v6"/></svg>',
    ay: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M40 10a23 23 0 1 0 14 38A19 19 0 1 1 40 10z"/><path d="M48 18l1.5 3 3 1.5-3 1.5L48 27l-1.5-3-3-1.5 3-1.5z"/></svg>',
    yildiz: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6l6.8 16.6L56 24l-13.4 11 4.4 17.4L32 43l-15 9.4 4.4-17.4L8 24l17.2-1.4z"/><circle cx="32" cy="31" r="4"/></svg>'
  };

  /* Oyun durumu (yalnızca bellekte) */
  var oyunNo = 0;
  function yeniDurum(d) {
    d.takmaAd = D.oku().takmaAd || "";
    d.tarih = null; d.yol = null; d.cevaplar = []; d.bulmacalar = []; d.sembol = null;
    d.puan = 0; d.kazanilanXp = 0; d.biten = {}; d.tekrar = tekrarMi(); d.basladi = false; d.bitti = false;
    oyunNo++;
  }
  function puanEkle(d, n) { d.puan = Math.min(1000, d.puan + n); }
  /* Aşama bonusu: geri tuşuyla tekrar geçilse bile bir kez verilir */
  function asamaBitti(d, no) {
    if (d.biten[no]) return; d.biten[no] = true;
    puanEkle(d, 50); if (!d.tekrar && no > 1) xp(P.XP.asama, "Aşama " + no);
  }
  w.addEventListener("nmj:xp", function (e) { if (motor && motor.durum) motor.durum.kazanilanXp += e.detail.miktar; });

  /* ---------- AŞAMA 1: Takma ad ---------- */
  function asama1(api, kap) {
    var d = api.durum;
    baslik(kap, "Yolculuk başlıyor", "Sana nasıl seslenelim?", "Bir takma ad seç. Gerçek adını yazmak zorunda değilsin; sonuç kartında bu ad görünecek.");
    var inp = el("input", { type: "text", id: "takma", maxlength: "20", autocomplete: "nickname", placeholder: "Örneğin: Gece Yolcusu", value: d.takmaAd, "aria-describedby": "takma-hata" });
    var hata = el("p", { class: "oy-hata", id: "takma-hata", role: "alert" });
    var f = el("form", { class: "oy-form", novalidate: true }, [el("label", { for: "takma" }, "Takma adın"), inp, hata, el("button", { type: "submit", class: "btn oy-buyuk" }, "Yolculuğa başla")]);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ad = D.temizAd(inp.value);
      if (ad.length < 2) { hata.textContent = "Takma adın en az 2 harf olmalı."; inp.focus(); return; }
      d.takmaAd = ad;
      D.degistir(function (x) { x.takmaAd = ad; });
      if (!d.basladi) { d.basladi = true; P.oyunBasla(OYUN); if (!d.tekrar) xp(P.XP.oyun_basla, "Oyuna başladın"); olay("oyun_basla", { oyun: OYUN }); }
      asamaBitti(d, 1);
      api.ileri();
    });
    kap.appendChild(f);
    setTimeout(function () { if (!("ontouchstart" in w)) inp.focus(); }, 50);
  }

  /* ---------- AŞAMA 2: Doğum tarihi ve yaşam yolu ---------- */
  function secim(ad, etiket, secenekler, deger) {
    var s = el("select", { id: ad, name: ad, "aria-label": etiket });
    s.appendChild(el("option", { value: "" }, etiket));
    secenekler.forEach(function (o) { var op = el("option", { value: o[0] }, o[1]); if (String(o[0]) === String(deger)) op.selected = true; s.appendChild(op); });
    return s;
  }
  function asama2(api, kap) {
    var d = api.durum, on = d.tarih || oturumTarihi() || {};
    baslik(kap, "Sayının kaynağı", "Doğum tarihin ne?", "Yaşam yolu sayın doğum tarihinin bütün rakamlarından hesaplanır. Tarihin hiçbir yere kaydedilmez ve paylaşılmaz.");
    var gun = [], ay = [], yil = [], buYil = new Date().getFullYear();
    for (var i = 1; i <= 31; i++) gun.push([i, i]);
    AYLAR.forEach(function (a, i) { ay.push([i + 1, a]); });
    for (var y = buYil; y >= 1900; y--) yil.push([y, y]);
    var sg = secim("dg", "Gün", gun, on.g), sa = secim("da", "Ay", ay, on.a), sy = secim("dy", "Yıl", yil, on.y);
    var hata = el("p", { class: "oy-hata", role: "alert" });
    var sonuc = el("div", { class: "oy-yol", "aria-live": "polite" });
    var f = el("form", { class: "oy-form", novalidate: true }, [el("div", { class: "oy-tarih" }, [sg, sa, sy]), hata, el("button", { type: "submit", class: "btn oy-buyuk" }, "Yaşam yolu sayımı hesapla")]);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = S.tarihKontrol(sg.value, sa.value, sy.value);
      if (m) { hata.textContent = m; return; }
      hata.textContent = "";
      d.tarih = { g: +sg.value, a: +sa.value, y: +sy.value };
      d.yol = S.yasamYolu(d.tarih.g, d.tarih.a, d.tarih.y);
      f.hidden = true;
      sonuc.innerHTML = "";
      var n = el("b", { class: "oy-dev" }, "0");
      sonuc.appendChild(el("p", { class: "oy-adim" }, d.yol.adim));
      sonuc.appendChild(el("div", { class: "oy-dev-kap" + (d.yol.usta ? " usta" : "") }, [n, el("span", null, "Yaşam yolu sayın")]));
      if (d.yol.usta) sonuc.appendChild(el("p", { class: "oy-not" }, d.yol.sayi + " bir ana sayı! Ana sayılar indirgenmez ve daha yoğun bir enerji taşır."));
      sonuc.appendChild(dugme("Devam et", function () { asamaBitti(d, 2); api.ileri(); }, "oy-buyuk"));
      sonuc.appendChild(dugme("Tarihi değiştir", function () { f.hidden = false; sonuc.innerHTML = ""; }, "ghost"));
      M.say(n, d.yol.sayi, 1100);
    });
    kap.appendChild(f); kap.appendChild(sonuc);
  }
  /* Sitedeki araçlarda bu oturumda girilen tarih varsa önerir (yalnızca okunur, sekme kapanınca silinir) */
  function oturumTarihi() {
    try { var o = JSON.parse(w.sessionStorage.getItem("nmj_oturum") || "null"); if (o && o.g && o.a && o.y) return { g: o.g, a: o.a, y: o.y }; } catch (e) {}
    return null;
  }

  /* ---------- AŞAMA 3: Kişilik soruları ---------- */
  function asama3(api, kap) {
    var d = api.durum, i = 0, yeni = [];
    baslik(kap, "Seni tanıyalım", "Beş kısa soru", "Doğru ya da yanlış cevap yok; ilk içinden geleni seç.");
    var alan = el("div", { class: "oy-soru-alan" });
    kap.appendChild(alan);
    function ciz() {
      var q = I.SORULAR[i];
      alan.innerHTML = "";
      var nokta = el("div", { class: "oy-noktalar", "aria-hidden": "true" });
      I.SORULAR.forEach(function (_, j) { nokta.appendChild(el("i", { class: j < i ? "tam" : j === i ? "simdi" : "" })); });
      alan.appendChild(nokta);
      alan.appendChild(el("p", { class: "oy-soru", id: "soru-m" }, (i + 1) + ". " + q.soru));
      var liste = el("div", { class: "oy-secenekler", role: "group", "aria-labelledby": "soru-m" });
      karistir(q.secenekler).forEach(function (s) {
        liste.appendChild(el("button", { type: "button", class: "oy-secenek", onclick: function (e) {
          if (liste.dataset.kilit) return; liste.dataset.kilit = "1";
          e.currentTarget.classList.add("secili");
          yeni.push(s.sayilar);
          setTimeout(function () {
            i++;
            if (i < I.SORULAR.length) ciz();
            else { d.cevaplar = yeni; asamaBitti(d, 3); api.ileri(); }
          }, 380);
        } }, s.metin));
      });
      alan.appendChild(liste);
    }
    ciz();
  }

  /* ---------- AŞAMA 4: Üç bulmaca ---------- */
  function asama4(api, kap) {
    var d = api.durum, turler = ["eksik", "dizi", "mantik"], i = 0;
    if (!d.bulmacalar.length || d.bulmacalar.oyun !== oyunNo) {
      d.bulmacalar = turler.map(function (t) { var b = sec(I.BULMACALAR[t]); return { tur: t, b: b, sonuc: null, ipucu: false }; });
      d.bulmacalar.oyun = oyunNo;
    }
    baslik(kap, "Zihnini ısıt", "Üç sayı bulmacası", "Her doğru cevap puan kazandırır. İpucu alırsan puanın yarıya iner; 15 saniyede çözersen hız bonusu kazanırsın.");
    var alan = el("div", { class: "oy-bulmaca-alan" });
    kap.appendChild(alan);
    if (d.bulmacalar.every(function (B) { return B.sonuc !== null; })) {
      var ozet = el("ul", { class: "oy-liste" });
      d.bulmacalar.forEach(function (B) { ozet.appendChild(el("li", null, I.BULMACA_ADLARI[B.tur] + ": " + (B.sonuc ? "doğru" : "yanlış") + " (cevap " + B.b.cevap + ")")); });
      kap.appendChild(ozet); kap.appendChild(dugme("Devam et", function () { api.ileri(); }, "oy-buyuk"));
      return;
    }
    while (d.bulmacalar[i].sonuc !== null) i++;
    function ciz() {
      var B = d.bulmacalar[i], b = B.b, t0 = Date.now();
      alan.innerHTML = "";
      alan.appendChild(el("p", { class: "oy-etiket" }, "Bulmaca " + (i + 1) + " / 3 · " + I.BULMACA_ADLARI[B.tur]));
      alan.appendChild(el("p", { class: "oy-soru", id: "bul-m" }, b.soru));
      var ipucuP = el("p", { class: "oy-ipucu", hidden: true }, "İpucu: " + b.ipucu);
      var geri = el("div", { class: "oy-geri", "aria-live": "polite" });
      var liste = el("div", { class: "oy-secenekler dort", role: "group", "aria-labelledby": "bul-m" });
      var ipucuBtn = dugme("İpucu al", function () { B.ipucu = true; ipucuP.hidden = false; ipucuBtn.disabled = true; }, "ghost oy-kucuk");
      karistir(b.secenekler).forEach(function (s) {
        liste.appendChild(el("button", { type: "button", class: "oy-secenek sayi", onclick: function (e) {
          if (B.sonuc !== null) return;
          var dogru = s === b.cevap, sure = (Date.now() - t0) / 1000;
          B.sonuc = dogru;
          [].forEach.call(liste.children, function (x) { x.disabled = true; if (+x.textContent === b.cevap) x.classList.add("dogru"); });
          if (!dogru) e.currentTarget.classList.add("yanlis");
          ipucuBtn.disabled = true;
          var puan = 0;
          if (dogru) {
            puan = B.ipucu ? 75 : 150;
            if (sure <= 15) puan += 50;
            puanEkle(d, puan);
            xp(d.tekrar ? 5 : (B.ipucu ? P.XP.bulmaca_ipucu : P.XP.bulmaca), "Bulmaca");
            if (!B.ipucu) P.gorevTamamla("ipucusuz");
          }
          geri.appendChild(el("p", { class: dogru ? "oy-dogru" : "oy-yanlis" }, dogru ? "Doğru! +" + puan + " puan" + (sure <= 15 ? " (hız bonusu dahil)" : "") : "Bu sefer olmadı. Doğru cevap: " + b.cevap));
          geri.appendChild(el("p", { class: "oy-aciklama" }, b.aciklama));
          geri.appendChild(dugme(i < 2 ? "Sonraki bulmaca" : "Devam et", function () {
            i++;
            if (i < 3) ciz();
            else { asamaBitti(d, 4); api.ileri(); }
          }, "oy-buyuk"));
        } }, String(s)));
      });
      alan.appendChild(liste); alan.appendChild(ipucuP); alan.appendChild(ipucuBtn); alan.appendChild(geri);
    }
    ciz();
  }

  /* ---------- AŞAMA 5: Sembol seçimi ---------- */
  function asama5(api, kap) {
    var d = api.durum, secilen = d.sembol;
    baslik(kap, "Sezgine güven", "Sana hangisi sesleniyor?", "Uzun düşünme; gözünün ilk takıldığı sembolü seç.");
    var onay = dugme("Seçimimi onayla", function () { d.sembol = secilen; asamaBitti(d, 5); api.ileri(); }, "oy-buyuk");
    onay.disabled = !secilen;
    var liste = el("div", { class: "oy-semboller", role: "radiogroup", "aria-label": "Semboller" });
    I.SEMBOLLER.forEach(function (s) {
      var k = el("button", { type: "button", role: "radio", "aria-checked": secilen && secilen.id === s.id ? "true" : "false", class: "oy-sembol" + (secilen && secilen.id === s.id ? " secili" : ""), onclick: function () {
        secilen = s; onay.disabled = false;
        [].forEach.call(liste.children, function (x) { x.classList.remove("secili"); x.setAttribute("aria-checked", "false"); });
        k.classList.add("secili"); k.setAttribute("aria-checked", "true");
      } }, [el("span", { class: "oy-sembol-ikon", html: IKON[s.ikon] }), el("b", null, s.ad), el("small", null, s.anlam)]);
      liste.appendChild(k);
    });
    kap.appendChild(liste); kap.appendChild(onay);
  }

  /* ---------- AŞAMA 6: Kişisel keşif ---------- */
  function egilimBul(d) {
    var say = {}; d.cevaplar.forEach(function (c) { c.forEach(function (n, j) { say[n] = (say[n] || 0) + (j === 0 ? 2 : 1); }); });
    var hedef = d.yol.taban, enIyi = null;
    Object.keys(say).forEach(function (k) {
      k = +k;
      if (enIyi === null || say[k] > say[enIyi] || (say[k] === say[enIyi] && Math.abs(k - hedef) < Math.abs(enIyi - hedef))) enIyi = k;
    });
    return enIyi || hedef;
  }
  function asama6(api, kap) {
    var d = api.durum, Y = I.YORUM[d.yol.sayi], eg = egilimBul(d), E = I.EGILIM[eg];
    d.egilim = eg;
    var dogru = d.bulmacalar.filter(function (b) { return b.sonuc; }).length;
    baslik(kap, "Kişisel keşif", d.takmaAd + ", işte senin haritan", null);
    var uyum = eg === d.yol.taban
      ? "Yaşam yolu sayın ile cevapların aynı yönü gösteriyor: içinden geçenle yaşadığın yol uyum içinde."
      : "Yaşam yolu sayın " + d.yol.sayi + " (" + Y.baslik.toLowerCase() + ") ile cevaplarındaki " + E.ad.toLowerCase() + " yanın birbirini tamamlıyor. Bu iki enerji arasında denge kurdukça kendini daha bütün hissedersin.";
    var zihin = dogru === 3 ? "Üç bulmacanın üçünü de çözdün; sayılarla aran çok iyi." : dogru === 2 ? "Üç bulmacadan ikisini çözdün; analitik zihnin uyanık." : dogru === 1 ? "Bir bulmacayı çözdün; sezgilerin mantığından önde gidiyor olabilir." : "Bulmacalar bu sefer zorladı; bir dahaki tura daha dinç başlarsın.";
    var kartlar = el("div", { class: "oy-kesif" }, [
      el("div", { class: "oy-kesif-kart" }, [el("span", { class: "oy-k-n" }, String(d.yol.sayi)), el("div", null, [el("b", null, "Yaşam yolun: " + Y.baslik), el("p", null, Y.ozet)])]),
      el("div", { class: "oy-kesif-kart" }, [el("span", { class: "oy-k-n" }, String(eg)), el("div", null, [el("b", null, "İç eğilimin: " + E.ad), el("p", null, E.metin)])]),
      el("div", { class: "oy-kesif-kart" }, [el("span", { class: "oy-k-ikon", html: IKON[d.sembol.ikon] }), el("div", null, [el("b", null, "Sembolün: " + d.sembol.ad), el("p", null, d.sembol.yorum)])])
    ]);
    kap.appendChild(kartlar);
    kap.appendChild(el("p", { class: "oy-sentez" }, uyum + " " + zihin));
    kap.appendChild(dugme("Sonucumu gör", function () { asamaBitti(d, 6); api.ileri(); }, "oy-buyuk"));
  }

  /* ---------- AŞAMA 7: Sonuç ---------- */
  function asama7(api, kap) {
    var d = api.durum, n = d.yol.sayi, Y = I.YORUM[n];
    if (!d.bitti) {
      d.bitti = true;
      puanEkle(d, 100);
      var ilk = P.oyunBitir(OYUN, { puan: d.puan, sayi: n, sembol: d.sembol.id });
      xp(ilk ? P.XP.oyun_bitir : P.XP.oyun_tekrar, ilk ? "Yolculuğu tamamladın" : "Tekrar oynadın");
      P.gorevTamamla("oyun");
      P.rozetVer("ilk_adim"); P.rozetVer("kesifci"); P.rozetVer("kader_" + n);
      if (d.yol.usta) P.rozetVer("ana_sayi");
      if (d.bulmacalar.every(function (b) { return b.sonuc && !b.ipucu; })) P.rozetVer("keskin");
      olay("oyun_bitir", { oyun: OYUN, puan: d.puan });
      try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
    }
    var depo = D.oku(), sv = P.seviye(depo.xp), roz = P.ROZETLER["kader_" + n];
    baslik(kap, "Yolculuğun tamamlandı", d.takmaAd + ", yaşam yolun " + n + ": " + Y.baslik, null);

    var puanEl = el("b", null, "0"), xpEl = el("b", null, "0");
    kap.appendChild(el("div", { class: "oy-sonuc-ust" }, [
      el("div", { class: "oy-dev-kap kucuk" + (d.yol.usta ? " usta" : "") }, [el("b", { class: "oy-dev" }, String(n)), el("span", null, "Yaşam yolu")]),
      el("div", { class: "oy-istat" }, [
        el("div", null, [puanEl, el("span", null, "Oyun puanı / 1000")]),
        el("div", null, [xpEl, el("span", null, "Bu oyunda XP")]),
        el("div", { class: "oy-rozet-kutu" }, [el("i", { "aria-hidden": "true" }, roz.ikon), el("span", null, roz.ad)])
      ])
    ]));
    M.say(puanEl, d.puan, 1200); M.say(xpEl, d.kazanilanXp, 1000);

    var ray = el("div", { class: "oy-ray" }); ray.appendChild(el("i", { style: "width:" + sv.yuzde + "%" }));
    kap.appendChild(el("div", { class: "oy-seviye" }, [el("p", null, [el("b", null, "Seviye " + sv.no + ": " + sv.ad), sv.sonraki ? " · " + sv.sonraki + " için " + sv.kalan + " XP kaldı" : " · En yüksek seviyedesin"]), ray]));

    kap.appendChild(el("h3", null, "Sembolik yorum"));
    kap.appendChild(el("p", null, Y.ozet + " " + d.sembol.yorum));
    kap.appendChild(el("h3", null, "Güçlü yönlerin"));
    var ul = el("ul", { class: "oy-liste" }); Y.guclu.forEach(function (g) { ul.appendChild(el("li", null, g)); }); kap.appendChild(ul);
    kap.appendChild(el("h3", null, "Kendine sorman için"));
    var ul2 = el("ul", { class: "oy-liste soru" }); Y.sorular.forEach(function (g) { ul2.appendChild(el("li", null, g)); }); kap.appendChild(ul2);

    /* Paylaşım */
    kap.appendChild(el("h3", null, "Sonuç kartın"));
    var onizleme = el("canvas", { class: "oy-onizleme", width: "1080", height: "1080", "aria-label": "Sonuç kartı önizlemesi" });
    kap.appendChild(onizleme);
    kartCiz(onizleme, d, "kare");
    var paylas = el("div", { class: "oy-paylas" }, [
      dugme("Story olarak kaydet", function () { kaydet(d, "story"); }),
      dugme("Kare kaydet", function () { kaydet(d, "kare"); }, "ghost"),
      el("a", { class: "btn ghost", href: waLink(d), rel: "noopener", target: UYG ? null : "_blank", onclick: function () { paylasildi("whatsapp"); } }, "WhatsApp'ta paylaş")
    ]);
    kap.appendChild(paylas);
    kap.appendChild(el("p", { class: "oy-not" }, "Kartta ve paylaşım mesajında doğum tarihin yer almaz. Bu yorumlar sembolik ve eğlence amaçlıdır; bilimsel bir gerçek ya da gelecekle ilgili bir tahmin değildir. Gaybı yalnızca Allah bilir."));

    kap.appendChild(el("div", { class: "oy-son-dugmeler" }, [
      dugme("Tekrar oyna", function () { yeniDurum(d); api.yeniden(); }),
      el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezine dön"),
      el("a", { class: "btn ghost", href: "/kader-sayisi-" + n + ".html" }, "Kader sayısı " + n + " rehberi"),
      el("a", { class: "btn ghost", href: "/rapor.html" }, "Tam numeroloji raporu")
    ]));
  }

  /* ---------- Sonuç kartı (canvas) ---------- */
  function kartCiz(cv, d, bicim) {
    var W = 1080, H = bicim === "story" ? 1920 : 1080, x = cv.getContext("2d"), n = d.yol.sayi, Y = I.YORUM[n];
    cv.width = W; cv.height = H;
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#120F2A"); g.addColorStop(.55, "#1B1738"); g.addColorStop(1, "#2E1F5E");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var cy = bicim === "story" ? 640 : 380;
    var rg = x.createRadialGradient(W / 2, cy, 20, W / 2, cy, 520); rg.addColorStop(0, "rgba(221,180,90,.28)"); rg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    var tohum = 7; function r() { tohum = (tohum * 9301 + 49297) % 233280; return tohum / 233280; }
    for (var s = 0; s < 90; s++) { x.fillStyle = "rgba(241,236,246," + (0.1 + r() * .45) + ")"; x.beginPath(); x.arc(r() * W, r() * H, r() * 2.2 + .4, 0, 7); x.fill(); }
    x.textAlign = "center";
    var serif = '"Fraunces","Literata",Georgia,serif', sans = '"Albert Sans",system-ui,sans-serif';
    x.fillStyle = "#BDB5DC"; x.font = "600 30px " + sans;
    x.fillText("NUMEROLOJİM · KENDİNİ KEŞFET", W / 2, bicim === "story" ? 150 : 90);
    x.fillStyle = "#F1ECF6"; x.font = "500 52px " + serif;
    x.fillText(d.takmaAd, W / 2, bicim === "story" ? 260 : 165);
    /* Sayı halkası */
    x.strokeStyle = "rgba(241,207,126,.85)"; x.lineWidth = 5; x.beginPath(); x.arc(W / 2, cy, bicim === "story" ? 230 : 165, 0, 7); x.stroke();
    x.strokeStyle = "rgba(241,207,126,.3)"; x.lineWidth = 2; x.beginPath(); x.arc(W / 2, cy, bicim === "story" ? 262 : 190, 0, 7); x.stroke();
    x.fillStyle = "#F1CF7E"; x.font = "600 " + (bicim === "story" ? (n > 9 ? 230 : 290) : (n > 9 ? 170 : 210)) + "px " + serif;
    x.textBaseline = "middle"; x.fillText(String(n), W / 2, cy + 10); x.textBaseline = "alphabetic";
    var yb = bicim === "story" ? 1020 : 680;
    x.fillStyle = "#BDB5DC"; x.font = "600 30px " + sans; x.fillText("YAŞAM YOLU SAYIM", W / 2, yb - 70);
    x.fillStyle = "#F1ECF6"; x.font = "600 70px " + serif; x.fillText(Y.baslik, W / 2, yb);
    if (bicim === "story") {
      x.fillStyle = "#DDB45A"; x.font = "600 30px " + sans; x.fillText("GÜÇLÜ YÖNLERİM", W / 2, 1150);
      x.fillStyle = "#F1ECF6"; x.font = "400 42px " + sans;
      Y.guclu.forEach(function (gy, i) { x.fillText(gy, W / 2, 1220 + i * 66); });
      x.fillStyle = "#BDB5DC"; x.font = "400 36px " + sans;
      x.fillText("Sembolüm: " + d.sembol.ad + "  ·  İç eğilimim: " + I.EGILIM[d.egilim].ad, W / 2, 1490);
      x.fillText("Oyun puanım: " + d.puan + " / 1000", W / 2, 1550);
    } else {
      x.fillStyle = "#BDB5DC"; x.font = "400 36px " + sans;
      x.fillText(Y.guclu.slice(0, 2).join("  ·  "), W / 2, 770);
      x.fillText("Sembolüm: " + d.sembol.ad + "  ·  Puanım: " + d.puan, W / 2, 835);
    }
    x.fillStyle = "#DDB45A"; x.font = "600 34px " + sans;
    x.fillText("Sen de oyna: numerolojim.com.tr/oyunlar", W / 2, H - (bicim === "story" ? 140 : 90));
  }
  function waLink(d) {
    var Y = I.YORUM[d.yol.sayi];
    var t = "Numerolojim'de Kendini Keşfet oyununu bitirdim: yaşam yolu sayım " + d.yol.sayi + " (" + Y.baslik + "), oyun puanım " + d.puan + "/1000. Sen de dene: " + ADRES;
    return "https://wa.me/?text=" + encodeURIComponent(t);
  }
  function paylasildi(kanal) {
    olay("oyun_paylas", { oyun: OYUN, kanal: kanal });
    P.gorevTamamla("paylas"); P.rozetVer("paylasimci");
  }
  function kaydet(d, bicim) {
    var cv = doc.createElement("canvas"), ad = "numerolojim-kendini-kesfet-" + bicim + ".png";
    kartCiz(cv, d, bicim);
    paylasildi(bicim);
    if (UYG_YENI) { try { w.NumerolojimApp.postMessage(JSON.stringify({ t: "kaydet", ad: ad, mime: "image/png", veri: cv.toDataURL("image/png").split(",")[1] })); } catch (e) {} return; }
    cv.toBlob(function (bl) {
      try {
        var f = new File([bl], ad, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: "Numerolojim · Kendini Keşfet" }).catch(function () {}); return; }
      } catch (e) {}
      var a = doc.createElement("a"); a.href = URL.createObjectURL(bl); a.download = ad; doc.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }, "image/png");
  }

  /* ---------- Başlat ---------- */
  var motor = null;
  function baslat() {
    var bas = doc.getElementById("oyun-basla");
    if (bas) bas.hidden = true;
    kok.hidden = false; if (cubuk) cubuk.hidden = false;
    motor = M.kur({
      kok: kok, cubuk: cubuk,
      asamalar: [
        { ad: "Takma ad", ciz: asama1 }, { ad: "Doğum tarihi", ciz: asama2 }, { ad: "Kişilik soruları", ciz: asama3 },
        { ad: "Sayı bulmacaları", ciz: asama4 }, { ad: "Sembol", ciz: asama5 }, { ad: "Kişisel keşif", ciz: asama6 }, { ad: "Sonuç", ciz: asama7 }
      ]
    });
    yeniDurum(motor.durum);
    motor.bas();
  }
  var b = doc.getElementById("oyun-basla-btn");
  if (b) b.addEventListener("click", baslat); else baslat();
  w.NMJOyun.kesfet = { kartCiz: kartCiz, _egilim: egilimBul };
})(window, document);
