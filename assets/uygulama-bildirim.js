/* Numerolojim · "Uygulamayı indir" bildirimi (yalnızca web, yalnızca Android tarayıcılar)
   Ara sıra üstten süzülerek iner: sayfada 18 saniye kalan ve biraz kaydıran ziyaretçiye,
   en fazla 3 günde bir; kapatılırsa 7 gün boyunca gösterilmez. Uygulamanın içinde asla çıkmaz.
   Yalnızca son gösterim zamanı bu cihazda saklanır; kişisel veri yoktur. */
(function (w, doc) {
  "use strict";
  var ua = navigator.userAgent || "";
  if (/NumerolojimApp/.test(ua) || !/Android/i.test(ua)) return;
  if (w.matchMedia && w.matchMedia("(display-mode: standalone)").matches) return;
  var KEY = "nmj_uyg_bildirim", GUN = 864e5, SURE_GOSTER = 3 * GUN, SURE_KAPAT = 7 * GUN;
  var PLAY = "https://play.google.com/store/apps/details?id=tr.com.numerolojim&referrer=utm_source%3Dnumerolojim.com.tr%26utm_medium%3Dbildirim%26utm_campaign%3Duygulama";
  function oku() { try { return JSON.parse(w.localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function yaz(d) { try { w.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  var d = oku(), simdi = Date.now();
  if (d.indirdi) return;
  if (d.kapat && simdi - d.kapat < SURE_KAPAT) return;
  if (d.son && simdi - d.son < SURE_GOSTER) return;
  function olay(ad) { try { w.gtag && w.gtag("event", ad, { yer: location.pathname }); } catch (e) {} }

  var kaydirdi = false, sureDoldu = false, gosterildi = false;
  function dene() { if (kaydirdi && sureDoldu && !gosterildi && !doc.hidden) goster(); }
  w.addEventListener("scroll", function k() { if (w.pageYOffset > 250) { kaydirdi = true; w.removeEventListener("scroll", k); dene(); } }, { passive: true });
  setTimeout(function () { sureDoldu = true; dene(); }, 18000);

  function goster() {
    gosterildi = true;
    yaz({ son: Date.now(), kapat: d.kapat || 0 });
    var k = doc.createElement("aside");
    k.className = "uyg-bildirim";
    k.setAttribute("role", "region");
    k.setAttribute("aria-label", "Numerolojim uygulaması");
    k.innerHTML =
      '<img src="/assets/logo-96.webp" width="44" height="44" alt="" class="ub-logo">' +
      '<div class="ub-tx"><b>Numerolojim cebinde</b><span>Oyunlar, günlük sayın ve rapor kartın tek dokunuşta</span>' +
      '<span class="ub-yildiz">Google Play · Ücretsiz</span></div>' +
      '<a class="ub-indir" href="' + PLAY + '" rel="noopener">İndir</a>' +
      '<button type="button" class="ub-kapat" aria-label="Kapat">×</button>';
    doc.body.appendChild(k);
    w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { k.classList.add("acik"); }); });
    olay("uyg_bildirim_goster");
    var zam = setTimeout(kapat, 15000);
    function kapat(kullanici) {
      clearTimeout(zam);
      k.classList.remove("acik");
      setTimeout(function () { k.remove(); }, 450);
      if (kullanici === true) { yaz({ son: Date.now(), kapat: Date.now() }); olay("uyg_bildirim_kapat"); }
    }
    k.querySelector(".ub-kapat").addEventListener("click", function () { kapat(true); });
    k.querySelector(".ub-indir").addEventListener("click", function () { yaz({ son: Date.now(), indirdi: Date.now() }); olay("uyg_bildirim_tikla"); setTimeout(kapat, 300); });
    k.addEventListener("pointerdown", function () { clearTimeout(zam); });
    /* Yukarı kaydırma hareketiyle kapatma */
    var y0 = null;
    k.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    k.addEventListener("touchmove", function (e) { if (y0 !== null && y0 - e.touches[0].clientY > 30) { y0 = null; kapat(true); } }, { passive: true });
  }
})(window, document);
