/* Numerolojim araçları: tüm hesap formlarını bağlar ve sonuçları yorum kütüphanesiyle gösterir.
   Gerekenler: /assets/nmj-motor.js (window.NMJ) ve /assets/nmj-metin.js (window.NMJ_METIN).
   Gizlilik: ad ve doğum tarihi yalnızca bu sekme açıkken sessionStorage'da tutulur (sekme kapanınca silinir),
   hiçbir sunucuya gönderilmez. */
(function () {
  "use strict";
  var doc = document, N = window.NMJ, T = window.NMJ_METIN;
  if (!N || !T) return;
  var KEY = "nmj_oturum";
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  /* ---------- yardımcılar ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function baslikHarf(s) {
    return String(s || "").trim().split(/\s+/).map(function (w) {
      var l = N.kucult(w); return l ? N.harfBuyuk(l.charAt(0)) + l.slice(1) : "";
    }).join(" ");
  }
  function ilkAd(s) { return baslikHarf(String(s || "").trim().split(/\s+/)[0] || ""); }
  function track(ad, p) { try { window.gtag && gtag("event", ad, p || {}); } catch (e) {} if (!/^rapor_/.test(ad)) { try { window.nmjDone && window.nmjDone(ad); } catch (e) {} } }
  function paras(a) { return (a || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function liste(a, cls) { return a && a.length ? '<ul class="' + (cls || "rs-list") + '">' + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; }
  function oturumOku() { try { var v = JSON.parse(sessionStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : null; } catch (e) { return null; } }
  function oturumYaz(o) { try { var cur = oturumOku() || {}; for (var k in o) if (o[k] !== undefined && o[k] !== "") cur[k] = o[k]; sessionStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {} }
  function oturumSil() { try { sessionStorage.removeItem(KEY); localStorage.removeItem("nmj_user"); } catch (e) {} }
  try { localStorage.removeItem("nmj_user"); } catch (e) {}

  /* Sayılara Türkçe ek: 7'ye, 3'ten ... */
  var OKUNUS = { 0: "sıfır", 1: "bir", 2: "iki", 3: "üç", 4: "dört", 5: "beş", 6: "altı", 7: "yedi", 8: "sekiz", 9: "dokuz", 10: "on", 20: "yirmi", 30: "otuz" };
  function okunus(n) { n = +n; if (n < 10) return OKUNUS[n]; var b = n % 10; return b ? OKUNUS[b] : (OKUNUS[n - b] || "on"); }
  function sonUnlu(w) { var m = w.match(/[aeıioöuü](?=[^aeıioöuü]*$)/); return m ? m[0] : "e"; }
  function ek(n, tur) {
    var w = okunus(n), u = sonUnlu(w), kalin = /[aıou]/.test(u), sonSesli = /[aeıioöuü]$/.test(w), sert = /[fstkçşhp]$/.test(w);
    if (tur === "e") return n + "'" + (sonSesli ? "y" : "") + (kalin ? "a" : "e");
    if (tur === "den") return n + "'" + (sert ? "t" : "d") + (kalin ? "an" : "en");
    return String(n);
  }
  function tarihYaz(g, a, y) { return (g < 10 ? "0" : "") + g + "." + (a < 10 ? "0" : "") + a + "." + y; }
  function yasAraligi(x) { return x.bit === null ? x.bas + " yaş ve sonrası" : x.bas + "–" + x.bit + " yaş"; }
  function sayiAd(n) { return (T.kader[n] && T.kader[n].ad) || ""; }
  function master(n) { return n === 11 || n === 22 || n === 33; }
  function sayiRozet(n, etiket, alt, link) {
    var tag = link ? "a" : "div";
    return "<" + tag + ' class="nc' + (master(n) ? " master" : "") + '"' + (link ? ' href="' + link + '"' : "") + '><span class="nc-l">' + esc(etiket) + '</span><b class="nc-n">' + n + '</b><span class="nc-t">' + esc(alt || sayiAd(n)) + "</span></" + tag + ">";
  }
  function kart(baslik, ic, cls, id) { return '<section class="rs-card ' + (cls || "") + '"' + (id ? ' id="' + id + '"' : "") + "><h3>" + baslik + "</h3>" + ic + "</section>"; }
  function zincirYaz(z) { return z && z.length > 1 ? z.join(" → ") : ""; }
  function borcNot(b) { return b ? ' <span class="tag-borc">karmik borç ' + b + "</span>" : ""; }
  function bar(ad, puan, alt) {
    return '<div class="sk"><span class="sk-ad">' + esc(ad) + '</span><span class="sk-tr"><i style="width:' + Math.max(4, puan) + '%"></i></span><b>' + puan + "</b>" + (alt ? '<small>' + esc(alt) + "</small>" : "") + "</div>";
  }
  function hata(out, m) { out.hidden = false; out.innerHTML = '<p class="err">' + esc(m) + "</p>"; }
  function goster(out) { out.hidden = false; try { out.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} }

  /* Form alanlarını oku */
  function formVeri(f) {
    var g = f.querySelector("[name=g]"), a = f.querySelector("[name=a]"), y = f.querySelector("[name=y]"), i = f.querySelector("[name=isim]");
    return { isim: i ? i.value.trim() : undefined, g: g ? +g.value : undefined, a: a ? +a.value : undefined, y: y ? +y.value : undefined };
  }
  function tarihHata(v) {
    if (!v.g || !v.a || !v.y) return "Doğum tarihini gün, ay ve yıl olarak eksiksiz gir.";
    var simdi = new Date();
    if (v.y < 1900 || v.y > simdi.getFullYear()) return "Doğum yılı 1900 ile " + simdi.getFullYear() + " arasında olmalı.";
    if (!N.tarihGecerli(v.g, v.a, v.y)) return "Bu tarih takvimde yok (örneğin 31 Nisan). Lütfen kontrol et.";
    if (new Date(v.y, v.a - 1, v.g) > simdi) return "Doğum tarihi bugünden sonra olamaz.";
    return "";
  }
  function isimHata(s) {
    if (!s) return "Adını ve soyadını yaz.";
    if (N.harfler(s).length < 2) return "İsim en az iki harften oluşmalı.";
    return "";
  }
  function formDoldur(f) {
    var o = oturumOku(); if (!o) return;
    ["isim", "g", "a", "y"].forEach(function (k) { var el = f.querySelector("[name=" + k + "]"); if (el && !el.value && o[k]) el.value = o[k]; });
  }

  /* ---------- 1) İSİM ANALİZİ ---------- */
  function harfCipleri(isim, vurgula) {
    return '<div class="name-chips">' + N.harfler(isim).map(function (h) {
      var slug = T.harfSlug[h.h], up = N.harfBuyuk(h.h);
      var c = h.s ? " sesli" : "";
      return slug ? '<a class="' + c + '" href="/harf-' + slug + '.html"><b>' + up + "</b><small>" + h.d + "</small></a>" : '<a class="' + c + '"><b>' + up + "</b><small>" + h.d + "</small></a>";
    }).join("") + "</div>";
  }
  function isimAnalizi(p, out) {
    var ad = ilkAd(p.isim), h = "";
    h += '<div class="rs-head"><p class="rs-kicker">' + esc(baslikHarf(p.isim)) + ' için isim analizi</p>' +
         '<div class="nc-row">' + sayiRozet(p.ifade.sayi, "İfade sayısı", T.isimAd[p.ifade.sayi]) + sayiRozet(p.ruh.sayi, "Ruh güdüsü", T.isimAd[p.ruh.sayi]) + sayiRozet(p.kisilik.sayi, "Kişilik sayısı", T.isimAd[p.kisilik.sayi]) +
         (p.olgunluk ? sayiRozet(p.olgunluk.sayi, "Olgunluk sayısı") : "") + "</div>" + harfCipleri(p.isim) +
         '<p class="rs-step">Tüm harfler: ' + p.ifade.toplam + " → " + p.ifade.sayi + " · Sesliler: " + p.ruh.toplam + " → " + p.ruh.sayi + " · Sessizler: " + p.kisilik.toplam + " → " + p.kisilik.sayi + "</p></div>";
    var I = T.ifade[p.ifade.sayi], R = T.ruh[p.ruh.sayi], K = T.kisilik[p.kisilik.sayi];
    h += kart("İfade sayısı " + p.ifade.sayi + ": " + esc(T.isimAd[p.ifade.sayi]) + borcNot(p.ifade.borc), '<p class="lead">' + esc(I.ozet) + "</p>" + paras(I.metin) + '<div class="two">' + '<div><h4>Güçlü yönlerin</h4>' + liste(I.guclu, "ok") + '</div><div><h4>Dikkat etmen gerekenler</h4>' + liste(I.dikkat, "warn") + "</div></div>", "", "ifade");
    h += kart("Ruh güdüsü sayısı " + p.ruh.sayi + borcNot(p.ruh.borc), '<p class="lead">' + esc(R.ozet) + "</p>" + paras(R.metin) + '<div class="two"><div><h4>Seni besleyenler</h4>' + liste(R.guclu, "ok") + '</div><div><h4>Gölgede kalanlar</h4>' + liste(R.dikkat, "warn") + "</div></div>", "", "ruh");
    h += kart("Kişilik sayısı " + p.kisilik.sayi + borcNot(p.kisilik.borc), '<p class="lead">' + esc(K.ozet) + "</p>" + paras(K.metin) + '<div class="two"><div><h4>İlk izlenim gücün</h4>' + liste(K.guclu, "ok") + '</div><div><h4>Yanlış anlaşılma riski</h4>' + liste(K.dikkat, "warn") + "</div></div>", "", "kisilik");
    if (p.olgunluk) h += kart("Olgunluk sayısı " + p.olgunluk.sayi, "<p>" + esc(T.olgunluk[p.olgunluk.sayi]) + '</p><p class="rs-step">Kader sayısı ' + p.kader.sayi + " + ifade sayısı " + p.ifade.sayi + " → " + p.olgunluk.sayi + "</p>");
    if (p.gizliTutku.sayilar.length) h += kart("Gizli tutku", p.gizliTutku.sayilar.map(function (n) { return "<p>" + esc(T.tutku[n]) + "</p>"; }).join("") + '<p class="rs-step">İsminde ' + p.gizliTutku.adet + " kez tekrar ediyor.</p>");
    if (p.karmikDersler.length) h += kart("Karmik dersler (isminde eksik sayılar)", "<p>İsminde şu sayıları veren harf yok: <b>" + p.karmikDersler.join(", ") + "</b>. Bu sayılar hayatında bilinçli olarak geliştirmen gereken alanları gösterir.</p>" + p.karmikDersler.map(function (n) { return "<p>" + esc(T.ders[n]) + "</p>"; }).join("") + '<p><a href="/karmik-borc-hesaplama.html">Karmik borç ve dersler analizine git →</a></p>');
    else h += kart("Karmik dersler", "<p>İsminde 1'den 9'a kadar bütün sayılar temsil ediliyor; eksik karmik dersin yok. Bu, dengeli ve çok yönlü bir isim enerjisi anlamına gelir.</p>");
    h += sonrakiAraclar(["harf", "cakra", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 2) HARF ANALİZİ ---------- */
  function harfAnalizi(p, out) {
    var hs = N.harfler(p.isim), say = {};
    hs.forEach(function (x) { say[x.h] = (say[x.h] || 0) + 1; });
    var h = '<div class="rs-head"><p class="rs-kicker">' + esc(baslikHarf(p.isim)) + " için harf analizi</p>" + harfCipleri(p.isim) +
            '<p class="rs-step">' + hs.length + " harf · " + hs.filter(function (x) { return x.s; }).length + " sesli · " + hs.filter(function (x) { return !x.s; }).length + " sessiz</p></div>";
    function harfKart(c, rol, aciklama) {
      var L = T.harf[c]; if (!L) return "";
      var slug = T.harfSlug[c];
      return kart(rol + ": " + N.harfBuyuk(c), '<p class="lead">' + esc(aciklama) + "</p><p><b>" + esc(L.b) + "</b> · değeri " + N.LV[c] + "</p><p>" + esc(L.t) + "</p>" + (slug ? '<p><a href="/harf-' + slug + '.html">' + N.harfBuyuk(c) + " harfinin anlamını ayrıntılı oku →</a></p>" : ""));
    }
    if (p.temelTasi) h += harfKart(p.temelTasi, "Temel taşı (ilk harf)", "İsminin ilk harfi, hayata ve yeni durumlara nasıl yaklaştığını anlatır. Bir işe başlarken gösterdiğin tavır bu harfte saklıdır.");
    if (p.kapakTasi) h += harfKart(p.kapakTasi, "Kapak taşı (adının son harfi)", "Adının son harfi, işleri nasıl tamamladığını ve bir süreci nasıl kapattığını anlatır.");
    if (p.ilkSesli) h += harfKart(p.ilkSesli, "Ruhun kapısı (ilk sesli harf)", "İsmindeki ilk sesli harf, iç dünyanın dışarıya açılan kapısıdır; içgüdüsel tepkilerini ve gerçek arzularını ilk bu harf ele verir.");
    var tekrar = Object.keys(say).filter(function (c) { return say[c] > 1; }).sort(function (a, b) { return say[b] - say[a]; });
    if (tekrar.length) h += kart("Tekrar eden harfler", "<p>İsminde birden fazla geçen harfler, enerjisi en çok vurgulanan özelliklerini gösterir.</p><ul class=\"rs-list\">" + tekrar.map(function (c) { return "<li><b>" + N.harfBuyuk(c) + "</b> × " + say[c] + " — " + esc(T.harf[c] ? T.harf[c].b : "") + "</li>"; }).join("") + "</ul>");
    var c = p.yogunluk, maxv = 0; for (var i = 1; i <= 9; i++) maxv = Math.max(maxv, c[i]);
    h += kart("Harflerin sayı dağılımı", "<p>Her sayının isminde kaç harfle temsil edildiği. Eksik sayılar karmik derslerini, en yüksek olan gizli tutkunu gösterir.</p>" +
         '<div class="dist">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<div class="dist-c' + (c[n] ? "" : " zero") + '"><b>' + n + '</b><span style="height:' + (maxv ? Math.round(c[n] / maxv * 100) : 0) + '%"></span><small>' + c[n] + "</small></div>"; }).join("") + "</div>");
    h += kart("Her harfin anlamı", '<ul class="harf-list">' + Object.keys(say).map(function (c) { var L = T.harf[c]; var slug = T.harfSlug[c]; return "<li><b>" + N.harfBuyuk(c) + "</b> (" + N.LV[c] + ") " + esc(L ? L.b : "") + (slug ? ' · <a href="/harf-' + slug + '.html">oku</a>' : "") + "</li>"; }).join("") + "</ul>");
    h += sonrakiAraclar(["isim", "cakra", "bebek"]);
    out.innerHTML = h;
  }

  /* ---------- 3) KİŞİSEL YIL ---------- */
  function yilKart(p, yil, simdi) {
    var py = N.kisiselYil(p.g, p.a, yil), Y = T.yil[py];
    var aylar = "";
    for (var m = 1; m <= 12; m++) {
      var pm = N.kisiselAy(p.g, p.a, yil, m);
      var aktif = simdi && yil === simdi.getFullYear() && m === simdi.getMonth() + 1;
      aylar += '<div class="ay' + (aktif ? " on" : "") + '"><span class="ay-ad">' + AYLAR[m - 1] + (aktif ? " · bu ay" : "") + '</span><b>' + pm + "</b><p>" + esc(T.ay[pm]) + "</p></div>";
    }
    return kart(yil + " kişisel yılın: " + py + " · " + esc(Y.tema), '<p class="lead">' + esc(Y.genel) + "</p>" +
      '<div class="alanlar"><div><h4>Kariyer ve iş</h4><p>' + esc(Y.kariyer) + '</p></div><div><h4>Aşk ve ilişkiler</h4><p>' + esc(Y.ask) + '</p></div><div><h4>Para ve maddi konular</h4><p>' + esc(Y.para) + "</p></div></div>" +
      '<p class="tavsiye"><b>Yılın tavsiyesi:</b> ' + esc(Y.tavsiye) + "</p>" +
      '<p class="rs-step">' + p.g + " + " + p.a + " + " + yil + " → " + N.tek(p.g) + " + " + N.tek(p.a) + " + " + N.tek(N.rakamTop(yil)) + " → " + py + "</p>" +
      "<h4>" + yil + " ay ay kişisel enerjin</h4><div class=\"aylar\">" + aylar + "</div>", "", "yil-" + yil);
  }
  function kisiselYilAnalizi(p, out) {
    var simdi = new Date(), y = simdi.getFullYear();
    var h = '<div class="rs-head"><p class="rs-kicker">' + p.g + " " + AYLAR[p.a - 1] + " doğumlular için kişisel yıl</p>" +
      '<div class="nc-row">' + sayiRozet(N.kisiselYil(p.g, p.a, y), y + " kişisel yıl", T.yil[N.kisiselYil(p.g, p.a, y)].tema) + sayiRozet(N.kisiselYil(p.g, p.a, y + 1), (y + 1) + " kişisel yıl", T.yil[N.kisiselYil(p.g, p.a, y + 1)].tema) + sayiRozet(N.kisiselAy(p.g, p.a, y, simdi.getMonth() + 1), "Bu ayın sayısı", AYLAR[simdi.getMonth()]) + "</div></div>";
    h += yilKart(p, y, simdi) + yilKart(p, y + 1, simdi);
    h += '<p class="note"><b>Döngünün neresindesin?</b> Kişisel yıllar 1\'den 9\'a giden dokuz yıllık bir döngü oluşturur. ' + y + " yılı senin için döngünün " + N.kisiselYil(p.g, p.a, y) + ". yılı.</p>";
    h += sonrakiAraclar(["gunluk", "donguler", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 4) GÜNLÜK ---------- */
  function gunlukAnalizi(p, out) {
    var bugun = new Date(), pg = N.kisiselGun(p.g, p.a, bugun), G = T.gun[pg], eg = N.evrenselGun(bugun);
    var h = '<div class="rs-head"><p class="rs-kicker">' + GUNLER[bugun.getDay()] + ", " + bugun.getDate() + " " + AYLAR[bugun.getMonth()] + " " + bugun.getFullYear() + "</p>" +
      '<div class="nc-row">' + sayiRozet(pg, "Kişisel günün", G.baslik) + sayiRozet(eg, "Evrensel gün", T.gun[eg].baslik) + sayiRozet(N.kisiselAy(p.g, p.a, bugun.getFullYear(), bugun.getMonth() + 1), "Kişisel ayın", AYLAR[bugun.getMonth()]) + sayiRozet(N.kisiselYil(p.g, p.a, bugun.getFullYear()), "Kişisel yılın", T.yil[N.kisiselYil(p.g, p.a, bugun.getFullYear())].tema) + "</div></div>";
    h += kart("Bugün senin için: " + esc(G.baslik), '<p class="lead">' + esc(G.metin) + "</p><p>Bugünün rengi: <b>" + esc(G.renk) + "</b></p><p>Bu ayın genel enerjisi: " + esc(T.ay[N.kisiselAy(p.g, p.a, bugun.getFullYear(), bugun.getMonth() + 1)]) + "</p>");
    h += kart("Herkes için bugün (evrensel gün " + eg + ")", "<p>" + esc(T.gun[eg].metin) + "</p><p class=\"rs-step\">Bugünün tarihindeki tüm rakamların toplamından hesaplanır; herkes için aynıdır. Kişisel günün ise doğum tarihine göre sana özeldir.</p>");
    var hafta = "";
    for (var i = 1; i <= 7; i++) {
      var d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + i), n = N.kisiselGun(p.g, p.a, d);
      hafta += '<div class="ay"><span class="ay-ad">' + GUNLER[d.getDay()] + " " + d.getDate() + " " + AYLAR[d.getMonth()] + "</span><b>" + n + "</b><p>" + esc(T.gun[n].baslik) + "</p></div>";
    }
    h += kart("Önümüzdeki 7 gün", '<div class="aylar">' + hafta + "</div>");
    h += sonrakiAraclar(["yil", "kader", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 5) MATRİS ---------- */
  function matrisHtml(m) {
    var sira = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
    return '<div class="mx">' + sira.map(function (r) { return r.map(function (n) { var k = m.adet[n]; return '<div class="mx-c' + (k ? "" : " bos") + '"><span>' + n + "</span><b>" + (k ? new Array(k + 1).join(String(n)) : "—") + "</b></div>"; }).join(""); }).join("") + "</div>";
  }
  function matrisAnalizi(p, out) {
    var m = p.matris;
    var h = '<div class="rs-head"><p class="rs-kicker">' + tarihYaz(p.g, p.a, p.y) + " için numeroloji matrisi</p>" + matrisHtml(m) + '<p class="rs-step">Doğum tarihindeki rakamlar: ' + ("" + p.g + p.a + p.y).split("").filter(function (d) { return d !== "0"; }).join(" ") + " (0 hesaba katılmaz)</p></div>";
    var tam = m.hatlar.filter(function (x) { return x.durum === "tam"; }), bos = m.hatlar.filter(function (x) { return x.durum === "bos"; });
    h += kart("Güçlü hatların", tam.length ? tam.map(function (x) { return "<p>" + esc(T.mxHat[x.id].tam) + "</p>"; }).join("") : "<p>Tablonda tamamen dolu bir hat yok. Bu, yeteneklerinin tek bir alanda yoğunlaşmak yerine farklı alanlara dağıldığını gösterir.</p>", "ok-card");
    h += kart("Boş hatların", bos.length ? bos.map(function (x) { return "<p>" + esc(T.mxHat[x.id].bos) + "</p>"; }).join("") : "<p>Tablonda tamamen boş bir hat yok; her alanda en az bir dayanağın var.</p>", "warn-card");
    var rk = "";
    for (var n = 1; n <= 9; n++) { var R = T.mxRakam[n], k = m.adet[n]; rk += "<div><h4>" + n + " · " + esc(R.ad) + "</h4><p>" + esc(k === 0 ? R.yok : k === 1 ? R.bir : k === 2 ? R.iki : R.cok) + "</p></div>"; }
    h += kart("Rakam rakam yorum", '<div class="alanlar">' + rk + "</div>");
    h += sonrakiAraclar(["donguler", "karmik", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 6) KARMİK ---------- */
  function karmikAnalizi(p, out) {
    var h = '<div class="rs-head"><p class="rs-kicker">' + esc(baslikHarf(p.isim)) + " için karmik analiz</p>";
    var kaynak = [["Kader sayısı", p.kader], ["İfade sayısı", p.ifade], ["Ruh güdüsü", p.ruh], ["Kişilik sayısı", p.kisilik], ["Doğum günü", p.dogumGunu]];
    h += '<table class="kz"><thead><tr><th>Sayı</th><th>Hesap zinciri</th><th>Sonuç</th></tr></thead><tbody>' + kaynak.map(function (k) {
      var z = k[1].zincir; return "<tr" + (k[1].borc ? ' class="on"' : "") + "><td>" + k[0] + "</td><td>" + esc(z.join(" → ")) + "</td><td>" + (k[1].borc ? "Karmik borç " + k[1].borc : "Borç yok") + "</td></tr>";
    }).join("") + "</tbody></table></div>";
    if (p.karmikBorclar.length) p.karmikBorclar.forEach(function (b) { var B = T.borc[b]; h += kart(esc(B.baslik), '<p class="lead">' + esc(B.ozet) + "</p>" + paras(B.metin), "warn-card"); });
    else h += kart("Karmik borcun yok", "<p>Temel sayılarının hiçbirinin hesap zincirinde 13, 14, 16 ya da 19 görünmüyor. Numerolojiye göre bu hayatta taşıdığın belirgin bir karmik borç yok; enerjin daha serbest akar.</p>", "ok-card");
    if (p.karmikDersler.length) h += kart("Karmik derslerin: " + p.karmikDersler.join(", "), p.karmikDersler.map(function (n) { return "<p>" + esc(T.ders[n]) + "</p>"; }).join(""));
    else h += kart("Karmik dersin yok", "<p>İsminde 1'den 9'a kadar bütün sayılar temsil ediliyor. Eksik bir ders yok; bu dengeli ve çok yönlü bir isim enerjisidir.</p>", "ok-card");
    if (p.gizliTutku.sayilar.length) h += kart("Gizli tutkun", p.gizliTutku.sayilar.map(function (n) { return "<p>" + esc(T.tutku[n]) + "</p>"; }).join(""));
    h += sonrakiAraclar(["isim", "donguler", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 7) YAŞAM DÖNGÜLERİ ---------- */
  function donguHtml(p) {
    var d = p.donguler, yas = new Date().getFullYear() - p.y;
    return '<div class="tl">' + d.donemler.map(function (x) {
      var on = x.no === p.donem;
      return '<div class="tl-d' + (on ? " on" : "") + '"><span class="tl-yas">' + yasAraligi(x) + " · " + x.basYil + (x.bitYil ? "–" + x.bitYil : "+") + (on ? " · şu an buradasın (" + yas + " yaş)" : "") + '</span><div class="tl-n"><span>Zirve <b>' + x.zirve + '</b></span><span>Sınav <b>' + x.sinav + "</b></span></div></div>";
    }).join("") + "</div>";
  }
  function dongulerAnalizi(p, out) {
    var h = '<div class="rs-head"><p class="rs-kicker">' + tarihYaz(p.g, p.a, p.y) + " için yaşam döngüleri</p>" + donguHtml(p) + "</div>";
    p.donguler.donemler.forEach(function (x) {
      h += kart(x.no + ". dönem · " + yasAraligi(x) + (x.no === p.donem ? ' <span class="tag-on">şu an</span>' : ""),
        "<h4>Zirve sayısı " + x.zirve + "</h4><p>" + esc(T.zirve[x.zirve]) + "</p><h4>Sınav sayısı " + x.sinav + "</h4><p>" + esc(T.sinav[x.sinav]) + "</p>", x.no === p.donem ? "on-card" : "");
    });
    h += kart("Hayat boyu ana sınavın: " + p.donguler.anaSinav, "<p>Üçüncü sınav sayısı numerolojide 'ana sınav' kabul edilir; hayatın boyunca farklı biçimlerde karşına çıkan temel dersi anlatır.</p><p>" + esc(T.sinav[p.donguler.anaSinav]) + "</p>");
    h += sonrakiAraclar(["yil", "matris", "rapor"]);
    out.innerHTML = h;
  }

  /* ---------- 8) İSİM DEĞİŞİKLİĞİ ---------- */
  function isimDegisikligi(f, out) {
    var e = f.querySelector("[name=isim]").value.trim(), y2 = f.querySelector("[name=isim2]").value.trim();
    var m = isimHata(e) || (isimHata(y2) ? "Yeni ismi de yaz." : ""); if (m) return hata(out, m);
    var A = N.profil(e), B = N.profil(y2);
    function satir(ad, a, b) { var fark = a !== b; return "<tr" + (fark ? ' class="on"' : "") + "><td>" + ad + "</td><td><b>" + a + "</b> " + esc(T.isimAd[a] || "") + "</td><td><b>" + b + "</b> " + esc(T.isimAd[b] || "") + "</td></tr>"; }
    var h = '<div class="rs-head"><p class="rs-kicker">İsim değişikliği karşılaştırması</p><table class="kz"><thead><tr><th></th><th>' + esc(baslikHarf(e)) + "</th><th>" + esc(baslikHarf(y2)) + "</th></tr></thead><tbody>" +
      satir("İfade sayısı", A.ifade.sayi, B.ifade.sayi) + satir("Ruh güdüsü", A.ruh.sayi, B.ruh.sayi) + satir("Kişilik sayısı", A.kisilik.sayi, B.kisilik.sayi) +
      "<tr><td>Karmik dersler</td><td>" + (A.karmikDersler.join(", ") || "yok") + "</td><td>" + (B.karmikDersler.join(", ") || "yok") + "</td></tr></tbody></table></div>";
    var kazan = A.karmikDersler.filter(function (n) { return B.karmikDersler.indexOf(n) < 0; }), kayip = B.karmikDersler.filter(function (n) { return A.karmikDersler.indexOf(n) < 0; });
    var ozet = [];
    if (A.ifade.sayi !== B.ifade.sayi) ozet.push("Yeni isimle ifade sayın " + ek(A.ifade.sayi, "den") + " " + ek(B.ifade.sayi, "e") + " geçiyor: dışarıya yansıttığın yetenekler " + T.anahtar[B.ifade.sayi] + " yönüne kayar.");
    else ozet.push("İfade sayın değişmiyor (" + A.ifade.sayi + "); temel yeteneklerin ve dünyaya sunduğun enerji aynı kalır.");
    if (A.ruh.sayi !== B.ruh.sayi) ozet.push("Ruh güdün " + ek(A.ruh.sayi, "den") + " " + ek(B.ruh.sayi, "e") + " geçiyor: iç motivasyonuna " + T.anahtar[B.ruh.sayi] + " teması eklenir.");
    if (A.kisilik.sayi !== B.kisilik.sayi) ozet.push("Kişilik sayın " + ek(A.kisilik.sayi, "den") + " " + ek(B.kisilik.sayi, "e") + " geçiyor: insanların seni ilk tanıdığında gördüğü tavır değişir.");
    if (kazan.length) ozet.push("Yeni isim " + kazan.join(", ") + " sayılarındaki eksikliği tamamlıyor; bu alanlarda daha dengeli bir enerji kazanırsın.");
    if (kayip.length) ozet.push("Yeni isimde " + kayip.join(", ") + " sayıları eksik kalıyor; bu alanlar bilinçli olarak geliştirilmesi gereken derslere dönüşür.");
    h += kart("Değişimin özeti", liste(ozet));
    h += kart("Yeni ifade sayın " + B.ifade.sayi + ": " + esc(T.isimAd[B.ifade.sayi]), '<p class="lead">' + esc(T.ifade[B.ifade.sayi].ozet) + "</p>" + paras(T.ifade[B.ifade.sayi].metin));
    if (A.ruh.sayi !== B.ruh.sayi) h += kart("Yeni ruh güdün " + B.ruh.sayi, '<p class="lead">' + esc(T.ruh[B.ruh.sayi].ozet) + "</p>" + paras(T.ruh[B.ruh.sayi].metin.slice(0, 2)));
    h += '<p class="note">Resmî kimliğinde yazan isim ile günlük hayatta kullandığın isim farklıysa, numerolojide ikisi de etkilidir: resmî isim temel enerjini, kullandığın isim ise günlük etkini anlatır.</p>';
    h += sonrakiAraclar(["isim", "cakra", "bebek"]);
    out.innerHTML = h; goster(out); track("isim_degisikligi");
    oturumYaz({ isim: e });
  }

  /* ---------- 9) NUMARA ---------- */
  function numaraAnalizi(f, out) {
    var v = f.querySelector("[name=numara]").value.trim(), tur = f.querySelector("[name=tur]").value;
    var r = N.numara(v); if (!r.sayi) return hata(out, "Bir numara yaz (ör. 24, 0532 123 45 67 ya da 08 ABC 123).");
    var X = T.numara[r.sayi], ad = { ev: "Ev numarası", telefon: "Telefon numarası", plaka: "Plaka", diger: "Numara" }[tur] || "Numara";
    var h = '<div class="rs-head"><p class="rs-kicker">' + esc(ad) + ": " + esc(v) + '</p><div class="nc-row">' + sayiRozet(r.sayi, ad + " sayısı", T.kader[r.sayi].ad) + '</div><p class="rs-step">' + esc(r.parca.join(" + ")) + " = " + r.toplam + " → " + r.sayi + "</p></div>";
    h += kart(r.sayi + " enerjisi: " + esc(T.anahtar[r.sayi]), tur === "ev" ? "<p class=\"lead\">" + esc(X.ev) + "</p><p>" + esc(X.genel) + "</p>" : "<p class=\"lead\">" + esc(X.genel) + "</p><p>Ev numarası olsaydı: " + esc(X.ev) + "</p>");
    var o = oturumOku();
    if (o && o.g && o.a && o.y && N.tarihGecerli(o.g, o.a, o.y)) {
      var k = N.kader(o.g, o.a, o.y).sayi, pu = N.ciftPuan(k, r.sayi);
      h += kart("Senin kader sayınla uyumu", "<p>Kader sayın " + k + " ile bu numaranın sayısı " + r.sayi + " arasındaki numerolojik uyum:</p>" + bar("Uyum", pu) + "<p>" + esc(T.uyum[N.ciftKey(k, r.sayi)].d) + "</p>");
    }
    h += '<p class="note">Apartman dairesinde kapı numaranı (ör. 12/4 için 4 ya da 12+4), müstakil evde bina numaranı kullan. Harf içeren numaralarda harfler de Pisagor değerleriyle hesaba katılır.</p>';
    out.innerHTML = h; goster(out); track("numara_analizi", { tur: tur });
  }

  /* ---------- 10) UYUM ---------- */
  function uyumAnalizi(f, out) {
    var v1 = { isim: f.querySelector("[name=isim]").value.trim(), g: +f.querySelector("[name=g]").value, a: +f.querySelector("[name=a]").value, y: +f.querySelector("[name=y]").value };
    var v2 = { isim: f.querySelector("[name=isim2]").value.trim(), g: +f.querySelector("[name=g2]").value, a: +f.querySelector("[name=a2]").value, y: +f.querySelector("[name=y2]").value };
    var m = tarihHata(v1) || (tarihHata(v2) ? "İkinci kişinin doğum tarihi: " + tarihHata(v2) : "");
    if (m) return hata(out, m);
    if (!N.harfler(v1.isim).length || !N.harfler(v2.isim).length) return hata(out, "İki kişinin de adını yaz; isim, uyumun beş boyutundan üçünü belirler.");
    var A = N.profil(v1.isim, v1.g, v1.a, v1.y), B = N.profil(v2.isim, v2.g, v2.a, v2.y), U = N.uyum(A, B);
    var a1 = ilkAd(v1.isim), a2 = ilkAd(v2.isim), cift = T.uyum[N.ciftKey(A.kader.sayi, B.kader.sayi)];
    var h = '<div class="rs-head"><p class="rs-kicker">' + esc(a1) + " & " + esc(a2) + '</p><div class="uy-genel"><b>%' + U.genel + "</b><span>" + (U.genel >= 85 ? "Çok güçlü uyum" : U.genel >= 75 ? "Güçlü uyum" : U.genel >= 65 ? "İyi uyum, emekle güçlenir" : "Zorlayıcı ama öğretici bir uyum") + "</span></div>" +
      U.boyutlar.map(function (d) { return bar(d.ad, d.puan, d.a + " ve " + d.b); }).join("") + "</div>";
    h += kart("Yaşam yolları: " + A.kader.sayi + " ve " + B.kader.sayi + " · " + esc(cift.l), '<p class="lead">' + esc(cift.d) + '</p><div class="two"><div><h4>Güçlü yanlarınız</h4>' + liste(cift.str, "ok") + '</div><div><h4>Dikkat etmeniz gerekenler</h4>' + liste(cift.watch, "warn") + "</div></div>");
    U.boyutlar.forEach(function (d) {
      if (d.id === "yol") return;
      var C = T.uyum[d.key];
      h += kart(esc(d.ad) + ": " + d.a + " ve " + d.b + " (%" + d.puan + ")", "<p>" + esc(T.uyumBoyut[d.id]) + "</p><p>" + esc(C.d) + "</p>");
    });
    h += '<p class="note">Uyum yüzdesi beş boyutun ağırlıklı ortalamasıdır: yaşam yolu %30, kalp %25, iletişim %20, günlük yaşam %15, bu yılın ritmi %10. Düşük bir puan "olmaz" demek değildir; farkındalıkla dengelenecek alanları gösterir.</p>';
    h += sonrakiAraclar(["isim", "rapor", "cakra"]);
    out.innerHTML = h; goster(out); track("uyum", { puan: U.genel });
    oturumYaz({ isim: v1.isim, g: v1.g, a: v1.a, y: v1.y });
  }

  /* ---------- 11) TAM RAPOR ---------- */
  function rapor(p, out) {
    var ad = baslikHarf(p.isim), simdi = new Date(), K = T.kader[p.kader.sayi], skor = N.alanSkorlari(p);
    var h = '<div class="rp-kapak"><p class="rs-kicker">Kişisel numeroloji raporu</p><h2>' + esc(ad) + "</h2><p>" + p.g + " " + AYLAR[p.a - 1] + " " + p.y + " · Rapor tarihi: " + simdi.getDate() + " " + AYLAR[simdi.getMonth()] + " " + simdi.getFullYear() + "</p>" +
      '<div class="nc-row">' + sayiRozet(p.kader.sayi, "Kader (yaşam yolu)", K.ad, "/kader-sayisi-" + p.kader.sayi + ".html") + sayiRozet(p.ifade.sayi, "İfade", T.isimAd[p.ifade.sayi]) + sayiRozet(p.ruh.sayi, "Ruh güdüsü", T.isimAd[p.ruh.sayi]) + sayiRozet(p.kisilik.sayi, "Kişilik", T.isimAd[p.kisilik.sayi]) + sayiRozet(p.dogumGunu.sayi, "Doğum günü") + sayiRozet(p.olgunluk.sayi, "Olgunluk") + sayiRozet(p.kisiselYil, simdi.getFullYear() + " kişisel yıl", T.yil[p.kisiselYil].tema) + "</div>" +
      '<p class="no-print rp-act">' + (UYG.yeni ? '<button class="btn" type="button" data-kart>Raporumu görsel olarak kaydet</button><br><small class="rp-not">Kısa bir reklam izledikten sonra rapor kartın hazırlanır.</small>'
        : UYG.var ? "" : '<button class="btn" type="button" data-yazdir>PDF olarak kaydet / yazdır</button> <button class="btn ghost" type="button" data-kart>Rapor kartımı indir</button>') + "</p></div>";
    var ic = [["yol", "1. Yaşam yolu (kader) sayısı"], ["ifade", "2. İfade sayısı"], ["ruh", "3. Ruh güdüsü sayısı"], ["kisilik", "4. Kişilik sayısı"], ["dg", "5. Doğum günü sayısı"], ["olg", "6. Olgunluk sayısı"], ["borc", "7. Karmik borç"], ["ders", "8. Karmik dersler"], ["yil", "9. Kişisel yıl"], ["ay", "10. 12 aylık yorum"], ["zirve", "11. Zirve döngüleri"], ["sinav", "12. Sınav sayıları"], ["mx", "13. Numeroloji matrisi"], ["harf", "14. İsim ve harfler"], ["skor", "15. Yaşam alanları skor tablosu"], ["unlu", "16. Aynı sayıyı taşıyan ünlüler"], ["sonuc", "17. Sonuç"]];
    h += '<nav class="rp-ic no-print"><h3>İçindekiler</h3><ol>' + ic.map(function (x) { return '<li><a href="#rp-' + x[0] + '">' + x[1].replace(/^\d+\. /, "") + "</a></li>"; }).join("") + "</ol></nav>";
    h += kart(ic[0][1] + ": " + p.kader.sayi + " · " + esc(K.ad), '<p class="lead">' + esc(K.ozet) + "</p>" + K.uzun + '<p class="rs-step">' + p.kader.rakamlar.join(" + ") + " = " + zincirYaz(p.kader.zincir) + '</p><p><a href="/kader-sayisi-' + p.kader.sayi + '.html">Kader sayısı ' + p.kader.sayi + " için tam yorumu oku (aşk, kariyer, uyumlu sayılar) →</a></p>", "", "rp-yol");
    var I = T.ifade[p.ifade.sayi], R = T.ruh[p.ruh.sayi], KS = T.kisilik[p.kisilik.sayi];
    h += kart(ic[1][1] + ": " + p.ifade.sayi + " · " + esc(T.isimAd[p.ifade.sayi]), '<p class="lead">' + esc(I.ozet) + "</p>" + paras(I.metin) + '<div class="two"><div><h4>Doğuştan yetenekler</h4>' + liste(I.guclu, "ok") + "</div><div><h4>Dikkat</h4>" + liste(I.dikkat, "warn") + "</div></div>", "", "rp-ifade");
    h += kart(ic[2][1] + ": " + p.ruh.sayi, '<p class="lead">' + esc(R.ozet) + "</p>" + paras(R.metin), "", "rp-ruh");
    h += kart(ic[3][1] + ": " + p.kisilik.sayi, '<p class="lead">' + esc(KS.ozet) + "</p>" + paras(KS.metin), "", "rp-kisilik");
    h += kart(ic[4][1] + ": " + p.dogumGunu.sayi, "<p>" + esc(T.dogumGunu[p.dogumGunu.sayi]) + "</p>", "", "rp-dg");
    h += kart(ic[5][1] + ": " + p.olgunluk.sayi, "<p>" + esc(T.olgunluk[p.olgunluk.sayi]) + "</p>", "", "rp-olg");
    h += kart(ic[6][1], p.karmikBorclar.length ? p.karmikBorclar.map(function (b) { return "<h4>" + esc(T.borc[b].baslik) + "</h4>" + paras(T.borc[b].metin); }).join("") : "<p>Temel sayılarının hesap zincirlerinde 13, 14, 16 ya da 19 yok; belirgin bir karmik borcun bulunmuyor.</p>", "", "rp-borc");
    h += kart(ic[7][1], p.karmikDersler.length ? p.karmikDersler.map(function (n) { return "<p>" + esc(T.ders[n]) + "</p>"; }).join("") : "<p>İsminde bütün sayılar temsil ediliyor; eksik karmik dersin yok.</p>", "", "rp-ders");
    var Y = T.yil[p.kisiselYil];
    h += kart(ic[8][1] + " " + simdi.getFullYear() + ": " + p.kisiselYil + " · " + esc(Y.tema), '<p class="lead">' + esc(Y.genel) + '</p><div class="alanlar"><div><h4>Kariyer</h4><p>' + esc(Y.kariyer) + "</p></div><div><h4>Aşk</h4><p>" + esc(Y.ask) + "</p></div><div><h4>Para</h4><p>" + esc(Y.para) + "</p></div></div>", "", "rp-yil");
    var aylar = ""; for (var m = 1; m <= 12; m++) { var pm = N.kisiselAy(p.g, p.a, simdi.getFullYear(), m); aylar += '<div class="ay' + (m === simdi.getMonth() + 1 ? " on" : "") + '"><span class="ay-ad">' + AYLAR[m - 1] + "</span><b>" + pm + "</b><p>" + esc(T.ay[pm]) + "</p></div>"; }
    h += kart(ic[9][1] + " (" + simdi.getFullYear() + ")", '<div class="aylar">' + aylar + "</div>", "", "rp-ay");
    h += kart(ic[10][1], donguHtml(p) + p.donguler.donemler.map(function (x) { return "<h4>" + x.no + ". dönem (" + yasAraligi(x) + "): zirve " + x.zirve + "</h4><p>" + esc(T.zirve[x.zirve]) + "</p>"; }).join(""), "", "rp-zirve");
    h += kart(ic[11][1], p.donguler.donemler.map(function (x) { return "<h4>" + x.no + ". dönem sınavı: " + x.sinav + "</h4><p>" + esc(T.sinav[x.sinav]) + "</p>"; }).join("") + "<p><b>Ana sınavın: " + p.donguler.anaSinav + "</b></p>", "", "rp-sinav");
    var mt = p.matris.hatlar;
    h += kart(ic[12][1], matrisHtml(p.matris) + mt.filter(function (x) { return x.durum !== "kismi"; }).map(function (x) { return "<p>" + esc(T.mxHat[x.id][x.durum]) + "</p>"; }).join("") + '<p><a href="/numeroloji-matrisi.html">Matrisin rakam rakam yorumu →</a></p>', "", "rp-mx");
    h += kart(ic[13][1], harfCipleri(p.isim) + "<p>Temel taşın <b>" + N.harfBuyuk(p.temelTasi) + "</b> (" + esc(T.harf[p.temelTasi] ? T.harf[p.temelTasi].b : "") + "), kapak taşın <b>" + N.harfBuyuk(p.kapakTasi) + "</b> (" + esc(T.harf[p.kapakTasi] ? T.harf[p.kapakTasi].b : "") + ").</p>" + (p.gizliTutku.sayilar.length ? p.gizliTutku.sayilar.map(function (n) { return "<p>" + esc(T.tutku[n]) + "</p>"; }).join("") : ""), "", "rp-harf");
    h += kart(ic[14][1], Object.keys(skor).map(function (k) { return bar(N.ALAN_AD[k], skor[k]); }).join("") + '<p class="rs-step">Skorlar; kader, ifade, ruh güdüsü, kişilik, doğum günü ve olgunluk sayılarının her yaşam alanına yatkınlığının ağırlıklı ortalamasıdır (45–95 arası).</p>', "", "rp-skor");
    var un = (T.unlu[p.kader.sayi] || []).slice(0, 8);
    h += kart(ic[15][1], "<p>Kader sayısı " + p.kader.sayi + " olan bazı tanınmış isimler:</p>" + liste(un.map(function (x) { return x[0] + " (" + x[1] + ")"; })) + '<p><a href="/unluler.html">Ünlülerin numerolojisi →</a></p>', "", "rp-unlu");
    var en = Object.keys(skor).sort(function (a, b) { return skor[b] - skor[a]; });
    var sonuc = [
      "En güçlü özelliklerin: " + T.anahtar[p.kader.sayi] + " (kader) ile " + T.anahtar[p.ifade.sayi] + " (ifade).",
      "En güçlü yaşam alanların: " + N.ALAN_AD[en[0]] + " ve " + N.ALAN_AD[en[1]] + ". Geliştirmeye açık alanın: " + N.ALAN_AD[en[en.length - 1]] + ".",
      "Hayat boyu ana dersin: sınav sayısı " + p.donguler.anaSinav + (p.karmikBorclar.length ? " ve karmik borç " + p.karmikBorclar.join(", ") : "") + (p.karmikDersler.length ? "; isminde eksik sayılar " + p.karmikDersler.join(", ") : "") + ".",
      simdi.getFullYear() + " senin için " + Y.tema.toLocaleLowerCase("tr") + ". " + Y.tavsiye
    ];
    h += kart(ic[16][1], liste(sonuc) + '<p class="note">Bu rapor Pisagor numerolojisine göre hesaplanmıştır. Numeroloji sembolik bir kendini tanıma aracıdır; sağlık, para ve hukuk kararlarını bu yorumlara dayandırma.</p>', "", "rp-sonuc");
    out.innerHTML = h;
    var b = out.querySelector("[data-yazdir]");
    if (b) b.addEventListener("click", function () { window.print(); });
    try { doc.fonts && doc.fonts.load('650 84px "Fraunces"'); doc.fonts && doc.fonts.load('400 38px "Literata"'); } catch (e) {}
    var kb = out.querySelector("[data-kart]");
    if (kb) kb.addEventListener("click", function () {
      if (UYG.yeni) { bekleyenKart = p; uygulamayaGonder({ t: "odul", k: "rapor" }); track("rapor_odul_istek"); }
      else kartKaydet(raporKarti(p), "numerolojim-rapor.png", kb);
    });
  }

  /* ---------- uygulama köprüsü ve rapor kartı ---------- */
  var UYG = (function () {
    var m = navigator.userAgent.match(/NumerolojimApp\/(\d+)\.(\d+)/);
    var v = m ? (+m[1]) * 100 + (+m[2]) : 0;
    return { var: !!m, yeni: v >= 102 };
  })();
  var bekleyenKart = null;
  function uygulamayaGonder(o) { try { window.NumerolojimApp && window.NumerolojimApp.postMessage(JSON.stringify(o)); } catch (e) {} }
  window.nmjOdulVerildi = function (k) {
    if (k === "rapor" && bekleyenKart) { kartKaydet(raporKarti(bekleyenKart), "numerolojim-rapor.png"); track("rapor_odul_verildi"); }
  };
  function kartKaydet(cv, ad, btn) {
    if (UYG.yeni) { uygulamayaGonder({ t: "kaydet", ad: ad, mime: "image/png", veri: cv.toDataURL("image/png").split(",")[1] }); return; }
    cv.toBlob(function (bl) {
      try {
        var f = new File([bl], ad, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: "Numeroloji kartım" }).catch(function () {}); return; }
      } catch (e) {}
      var a = doc.createElement("a"); a.href = URL.createObjectURL(bl); a.download = ad; doc.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }, "image/png");
    track("rapor_kart_indir");
  }
  function yuvarlak(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function raporKarti(p) {
    var W = 1080, H = 1920, cv = doc.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d"), simdi = new Date(), skor = N.alanSkorlari(p);
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#120F2A"); g.addColorStop(.6, "#1B1738"); g.addColorStop(1, "#2A1F55");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var rg = x.createRadialGradient(W / 2, 420, 30, W / 2, 420, 600); rg.addColorStop(0, "rgba(221,180,90,.25)"); rg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    var seed = 11; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var s = 0; s < 80; s++) { x.fillStyle = "rgba(241,236,246," + (0.12 + rnd() * .45) + ")"; x.beginPath(); x.arc(rnd() * W, rnd() * H, rnd() * 2 + .4, 0, 7); x.fill(); }
    x.textAlign = "center";
    x.fillStyle = "#BDB5DC"; x.font = '600 34px "Albert Sans",sans-serif'; x.fillText("NUMEROLOJİM · KİŞİSEL NUMEROLOJİ KARTI", W / 2, 150);
    x.fillStyle = "#F1CF7E"; x.font = '650 84px "Fraunces","Literata",Georgia,serif';
    var ad = baslikHarf(p.isim); if (x.measureText(ad).width > 940) x.font = '650 64px "Fraunces","Literata",Georgia,serif';
    x.fillText(ad, W / 2, 270);
    x.fillStyle = "#BDB5DC"; x.font = '400 36px "Albert Sans",sans-serif'; x.fillText(p.g + " " + AYLAR[p.a - 1] + " " + p.y, W / 2, 330);
    var kutular = [["Kader", p.kader.sayi, T.kader[p.kader.sayi].ad], ["İfade", p.ifade.sayi, T.isimAd[p.ifade.sayi]], ["Ruh güdüsü", p.ruh.sayi, T.isimAd[p.ruh.sayi]],
                   ["Kişilik", p.kisilik.sayi, T.isimAd[p.kisilik.sayi]], ["Doğum günü", p.dogumGunu.sayi, T.isimAd[p.dogumGunu.sayi]], ["Olgunluk", p.olgunluk.sayi, T.isimAd[p.olgunluk.sayi]]];
    kutular.forEach(function (k, i) {
      var c = i % 3, r = Math.floor(i / 3), bx = 70 + c * 320, by = 400 + r * 300;
      x.fillStyle = "rgba(255,255,255,.06)"; yuvarlak(x, bx, by, 300, 270, 28); x.fill();
      x.strokeStyle = "rgba(221,180,90,.45)"; x.lineWidth = 2; yuvarlak(x, bx, by, 300, 270, 28); x.stroke();
      x.fillStyle = "#BDB5DC"; x.font = '600 30px "Albert Sans",sans-serif'; x.fillText(k[0], bx + 150, by + 55);
      x.fillStyle = "#DDB45A"; x.font = '650 110px "Fraunces","Literata",Georgia,serif'; x.fillText(String(k[1]), bx + 150, by + 175);
      x.fillStyle = "#F1ECF6"; x.font = '400 28px "Albert Sans",sans-serif'; x.fillText(k[2] || "", bx + 150, by + 230);
    });
    var Y = T.yil[p.kisiselYil];
    x.fillStyle = "rgba(221,180,90,.12)"; yuvarlak(x, 70, 1020, 940, 150, 28); x.fill();
    x.fillStyle = "#F1CF7E"; x.font = '600 34px "Albert Sans",sans-serif'; x.fillText(simdi.getFullYear() + " KİŞİSEL YILIN: " + p.kisiselYil, W / 2, 1080);
    x.fillStyle = "#F1ECF6"; x.font = '400 38px "Literata",Georgia,serif'; x.fillText(Y.tema, W / 2, 1135);
    x.textAlign = "left";
    Object.keys(skor).forEach(function (k, i) {
      var yy = 1250 + i * 72;
      x.fillStyle = "#F1ECF6"; x.font = '600 32px "Albert Sans",sans-serif'; x.fillText(N.ALAN_AD[k], 90, yy + 12);
      x.fillStyle = "rgba(255,255,255,.1)"; yuvarlak(x, 420, yy - 14, 480, 28, 14); x.fill();
      var gr = x.createLinearGradient(420, 0, 900, 0); gr.addColorStop(0, "#DDB45A"); gr.addColorStop(1, "#F1CF7E");
      x.fillStyle = gr; yuvarlak(x, 420, yy - 14, Math.max(28, 480 * skor[k] / 100), 28, 14); x.fill();
      x.fillStyle = "#F1ECF6"; x.textAlign = "right"; x.fillText(String(skor[k]), 990, yy + 12); x.textAlign = "left";
    });
    x.textAlign = "center";
    x.fillStyle = "#DDB45A"; x.font = '600 40px "Albert Sans",sans-serif'; x.fillText("Sen de ücretsiz hesapla:", W / 2, H - 150);
    x.fillStyle = "#F1ECF6"; x.font = '600 50px "Literata",Georgia,serif'; x.fillText("numerolojim.com.tr", W / 2, H - 88);
    return cv;
  }

  /* ---------- ana sayfa profil özeti ---------- */
  function profilOzet(p, out) {
    var simdi = new Date(), K = T.kader[p.kader.sayi];
    var h = '<div class="rs-head"><p class="rs-kicker">Merhaba ' + esc(ilkAd(p.isim)) + ", işte numeroloji haritan</p>" +
      '<div class="nc-row">' + sayiRozet(p.kader.sayi, "Kader sayın", K.ad, "/kader-sayisi-" + p.kader.sayi + ".html") + sayiRozet(p.ifade.sayi, "İfade sayın", T.isimAd[p.ifade.sayi], "/isim-analizi.html#sonuc") + sayiRozet(p.ruh.sayi, "Ruh güdün", T.isimAd[p.ruh.sayi], "/isim-analizi.html#sonuc") + sayiRozet(p.kisilik.sayi, "Kişilik sayın", T.isimAd[p.kisilik.sayi], "/isim-analizi.html#sonuc") + sayiRozet(p.kisiselYil, simdi.getFullYear() + " yılın", T.yil[p.kisiselYil].tema, "/kisisel-yil-hesaplama.html#sonuc") + sayiRozet(p.kisiselGun, "Bugünün sayısı", T.gun[p.kisiselGun].baslik, "/gunluk-numeroloji.html#sonuc") + "</div></div>";
    h += kart("Kader sayın " + p.kader.sayi + ": " + esc(K.ad), '<p class="lead">' + esc(K.ozet) + "</p>" + K.uzun + '<p class="rs-step">' + p.kader.rakamlar.join(" + ") + " = " + zincirYaz(p.kader.zincir) + '</p><p><a class="btn ghost" href="/kader-sayisi-' + p.kader.sayi + '.html">Kader sayısı ' + p.kader.sayi + " tam yorumu</a> <a class=\"btn\" href=\"/rapor.html#sonuc\">17 başlıklı tam raporunu al</a></p>");
    h += kart("Bugün", "<p><b>" + esc(T.gun[p.kisiselGun].baslik) + ":</b> " + esc(T.gun[p.kisiselGun].metin) + "</p>");
    h += '<p class="rs-step oturum">Bilgilerin bu sekme açık kaldıkça diğer araçlarda hazır gelir; sekmeyi kapatınca silinir. <button type="button" class="linkbtn" data-sil>Bilgilerimi şimdi sil</button></p>';
    out.innerHTML = h;
    var s = out.querySelector("[data-sil]"); if (s) s.addEventListener("click", function () { oturumSil(); location.reload(); });
    kutulariKisisellestir(p);
  }
  var ETIKET = { kader: "Kader sayın: ", isim: "İfade sayın: ", yil: "Bu yılın sayısı: ", gunluk: "Bugünün sayısı: ", karmik: "Karmik borcun: ", donguler: "Şu anki zirven: " };
  function kutulariKisisellestir(p) {
    var simdi = new Date(), map = {
      kader: p.kader && p.kader.sayi, isim: p.ifade && p.ifade.sayi, yil: p.kader && p.kisiselYil, gunluk: p.kader && p.kisiselGun,
      karmik: p.karmikBorclar && p.karmikBorclar.length ? p.karmikBorclar.join(", ") : null, donguler: p.donguler && p.donguler.donemler[p.donem - 1].zirve
    };
    Object.keys(map).forEach(function (k) {
      var el = doc.querySelector('.tile[data-tool="' + k + '"] .tile-sen'); if (el && map[k] != null) { el.textContent = (ETIKET[k] || "Senin sayın: ") + map[k]; el.hidden = false; }
    });
  }

  /* ---------- sonraki araçlar ---------- */
  var ARAC = {
    kader: ["/kader-sayilari.html", "Kader sayısı"], isim: ["/isim-analizi.html", "İsim analizi"], harf: ["/harf-analizi.html", "Harf analizi"],
    cakra: ["/cakra-analizi.html", "Çakra haritası"], uyum: ["/uyum-hesapla.html", "Aşk uyumu"], yil: ["/kisisel-yil-hesaplama.html", "Kişisel yıl"],
    gunluk: ["/gunluk-numeroloji.html", "Bugünün enerjisi"], matris: ["/numeroloji-matrisi.html", "Numeroloji matrisi"], karmik: ["/karmik-borc-hesaplama.html", "Karmik borç"],
    donguler: ["/yasam-donguleri.html", "Yaşam döngüleri"], degisim: ["/isim-degisikligi-analizi.html", "İsim değişikliği"], bebek: ["/bebek-ismi-analizi.html", "Bebek ismi"],
    numara: ["/ev-numarasi-numerolojisi.html", "Ev ve telefon numarası"], rapor: ["/rapor.html", "Tam rapor"]
  };
  function sonrakiAraclar(ks) {
    return '<div class="sonraki no-print"><p>Bilgilerin hazır, tek dokunuşla devam et:</p>' + ks.map(function (k) { return '<a class="btn ghost" href="' + ARAC[k][0] + '#sonuc">' + ARAC[k][1] + " →</a>"; }).join("") + "</div>";
  }

  /* ---------- bağlama ---------- */
  var ISLE = {
    isim: { gerek: ["isim"], f: isimAnalizi }, harf: { gerek: ["isim"], f: harfAnalizi }, yil: { gerek: ["tarih"], f: kisiselYilAnalizi },
    gunluk: { gerek: ["tarih"], f: gunlukAnalizi }, matris: { gerek: ["tarih"], f: matrisAnalizi }, karmik: { gerek: ["isim", "tarih"], f: karmikAnalizi },
    donguler: { gerek: ["tarih"], f: dongulerAnalizi }, rapor: { gerek: ["isim", "tarih"], f: rapor }, profil: { gerek: ["isim", "tarih"], f: profilOzet }
  };
  function bagla(f) {
    var tur = f.getAttribute("data-nmj"), out = doc.getElementById(f.getAttribute("data-out") || "sonuc");
    if (!out) return;
    if (tur === "uyum") { formDoldur(f); f.addEventListener("submit", function (e) { e.preventDefault(); uyumAnalizi(f, out); }); return; }
    if (tur === "degisim") { formDoldur(f); f.addEventListener("submit", function (e) { e.preventDefault(); isimDegisikligi(f, out); }); return; }
    if (tur === "numara") { f.addEventListener("submit", function (e) { e.preventDefault(); numaraAnalizi(f, out); }); return; }
    var I = ISLE[tur]; if (!I) return;
    function calis(otomatik) {
      var v = formVeri(f), m = "";
      if (I.gerek.indexOf("isim") >= 0) m = isimHata(v.isim);
      if (!m && I.gerek.indexOf("tarih") >= 0) m = tarihHata(v);
      if (m) { if (!otomatik) hata(out, m); return; }
      var p = N.profil(I.gerek.indexOf("isim") >= 0 ? v.isim : "", v.g, v.a, v.y);
      if (I.gerek.indexOf("isim") < 0 && v.isim && N.harfler(v.isim).length) p = N.profil(v.isim, v.g, v.a, v.y);
      if (tur === "isim" && v.g && !tarihHata(v)) p = N.profil(v.isim, v.g, v.a, v.y);
      I.f(p, out); out.hidden = false;
      if (!otomatik) { goster(out); track("arac_" + tur); }
      oturumYaz(v);
    }
    formDoldur(f);
    f.addEventListener("submit", function (e) { e.preventDefault(); calis(false); });
    // başka bir araçtan "#sonuc" ile gelindiyse ve bilgiler hazırsa sonucu hemen göster
    if (location.hash === "#sonuc" || tur === "profil") {
      var v = formVeri(f), tamam = (I.gerek.indexOf("isim") < 0 || !isimHata(v.isim)) && (I.gerek.indexOf("tarih") < 0 || !tarihHata(v));
      if (tamam) { calis(true); if (location.hash === "#sonuc") setTimeout(function () { goster(out); }, 60); }
    }
  }
  function init() {
    Array.prototype.forEach.call(doc.querySelectorAll("form[data-nmj]"), bagla);
    Array.prototype.forEach.call(doc.querySelectorAll("[data-oturum-sil]"), function (b) { b.addEventListener("click", function () { oturumSil(); location.reload(); }); });
    var o = oturumOku();
    if (o && o.isim && o.g && doc.querySelector(".tile")) { var p = N.profil(o.isim, o.g, o.a, o.y); if (p.kader && p.ifade) kutulariKisisellestir(p); }
  }
  window.NMJ_OTURUM = { oku: oturumOku, yaz: oturumYaz, sil: oturumSil };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
