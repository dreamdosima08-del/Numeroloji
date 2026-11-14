/* Numerolojim · "Google Play'den yükle" bildirimi (yalnızca web)
   Ziyaret başına en fazla 3 kez üstten süzülerek iner: ilk kez 8 saniye sonra, sonra her 45 saniyede bir;
   her seferinde 9 saniye görünüp yukarı çekilir. Çarpıyla kapatılırsa 2 gün, "Yükle"ye basılırsa bir daha gösterilmez.
   Uygulamanın içinde ve iPhone/iPad'de (iOS sürümü yok) çıkmaz.
   Yalnızca gösterim zamanları bu cihazda saklanır; kişisel veri yoktur. */
(function (w, doc) {
  "use strict";
  var ua = navigator.userAgent || "";
  if (/NumerolojimApp/.test(ua)) return;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return;
  if (w.matchMedia && w.matchMedia("(display-mode: standalone)").matches) return;

  var KEY = "nmj_uyg_bildirim", SKEY = "nmj_uyg_bildirim_oturum", GUN = 864e5, SURE_KAPAT = 2 * GUN;
  var ILK = 8000, ARA = 45000, GORUN = 9000, EN_FAZLA = 3;
  var PLAY = "https://play.google.com/store/apps/details?id=tr.com.numerolojim&referrer=utm_source%3Dnumerolojim.com.tr%26utm_medium%3Dbildirim%26utm_campaign%3Duygulama";
  function oku() { try { return JSON.parse(w.localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function yaz(d) { try { w.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  /* Oturum sayacı: sayfalar arasında gezerken toplam 3 inişi aşmasın */
  function oturum() { try { return +w.sessionStorage.getItem(SKEY) || 0; } catch (e) { return 0; } }
  function oturumArtir() { try { w.sessionStorage.setItem(SKEY, String(oturum() + 1)); } catch (e) {} }

  var d = oku();
  if (d.indirdi) return;
  if (d.kapat && Date.now() - d.kapat < SURE_KAPAT) return;
  function olay(ad) { try { w.gtag && w.gtag("event", ad, { yer: location.pathname, sira: oturum() }); } catch (e) {} }

  var k = null, bitti = false, zam = null, kapanis = null;
  function kur() {
    k = doc.createElement("aside");
    k.className = "uyg-bildirim";
    k.setAttribute("role", "region");
    k.setAttribute("aria-label", "Numerolojim uygulaması");
    k.innerHTML =
      '<img src="/assets/logo-96.webp" width="44" height="44" alt="" class="ub-logo">' +
      '<div class="ub-tx"><b>Numerolojim cebinde</b><span>Oyunlar, günlük sayın ve rapor kartın tek dokunuşta</span>' +
      '<span class="ub-yildiz">Google Play · Ücretsiz</span></div>' +
      '<a class="ub-indir" href="' + PLAY + '" rel="noopener"' + (/Android/i.test(ua) ? "" : ' target="_blank"') + '>Yükle</a>' +
      '<button type="button" class="ub-kapat" aria-label="Kapat">×</button>';
    doc.body.appendChild(k);
    k.querySelector(".ub-kapat").addEventListener("click", function () { sonlandir(); yaz({ kapat: Date.now() }); olay("uyg_bildirim_kapat"); });
    k.querySelector(".ub-indir").addEventListener("click", function () { yaz({ indirdi: Date.now() }); olay("uyg_bildirim_tikla"); setTimeout(sonlandir, 300); });
    /* Dokunulduğu sürece yukarı çekilmez */
    k.addEventListener("pointerdown", function () { clearTimeout(kapanis); kapanis = setTimeout(cek, GORUN); });
    var y0 = null;
    k.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    k.addEventListener("touchmove", function (e) { if (y0 !== null && y0 - e.touches[0].clientY > 30) { y0 = null; cek(); } }, { passive: true });
  }
  function in_() {
    if (bitti) return;
    if (oturum() >= EN_FAZLA) { bitti = true; return; }
    if (doc.hidden) { zam = setTimeout(in_, 5000); return; }
    if (!k) kur();
    oturumArtir();
    w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { k.classList.add("acik"); }); });
    olay("uyg_bildirim_goster");
    clearTimeout(kapanis); kapanis = setTimeout(cek, GORUN);
  }
  function cek() {
    if (!k) return;
    k.classList.remove("acik");
    clearTimeout(kapanis);
    if (!bitti && oturum() < EN_FAZLA) { clearTimeout(zam); zam = setTimeout(in_, ARA); }
  }
  function sonlandir() {
    bitti = true; clearTimeout(zam); clearTimeout(kapanis);
    if (k) { k.classList.remove("acik"); var x = k; k = null; setTimeout(function () { x.remove(); }, 450); }
  }
  zam = setTimeout(in_, oturum() ? ARA / 2 : ILK);
})(window, document);
