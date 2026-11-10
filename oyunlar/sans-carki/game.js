/* Şans Çarkı · game.js
   Günde bir kez çevrilen sayı çarkı: çıkan sayı günün teması olur ve küçük bir kişisel gelişim görevi verir.
   Fal ya da kehanet değildir: çark tamamen rastgele döner, amaç güne küçük ve güzel bir adım eklemektir. */
(function (w, doc) {
  "use strict";
  var O = w.NMJOyun, M = O.motor, P = O.puan, D = O.depo, T = w.NMJ_METIN, el = M.el, OYUN = "cark";
  var ADRES = "https://www.numerolojim.com.tr/oyunlar/sans-carki/";
  var RENK = ["#F1CF7E", "#B9A3FF", "#5FD3C6", "#F29BB8", "#F5A65B", "#9ED3B4", "#7C5CD6", "#DDB45A", "#8FB8FF"];
  var GOREV = {
    1: "Ertelediğin bir işe bugün sadece 10 dakika ayır; başlamak işin yarısıdır.",
    2: "Uzun zamandır konuşmadığın birine hal hatır soran kısa bir mesaj gönder.",
    3: "Bugün küçük bir şey üret: bir not, bir çizim ya da güzel bir fotoğraf.",
    4: "Masanı, çantanı ya da bir çekmeceni 10 dakikada düzenle.",
    5: "Hiç gitmediğin bir yoldan yürü ya da daha önce denemediğin bir şeyi dene.",
    6: "Bir aile büyüğünü ara ya da evde birinin bir işine yardım et.",
    7: "Telefonsuz 15 dakika ayır; okuyabilir, yürüyebilir ya da tefekkür edebilirsin.",
    8: "Bu haftaki harcamalarına 5 dakika göz at; bir tanesini gözden geçir.",
    9: "Kullanmadığın bir eşyayı ihtiyacı olana ver ya da birine küçük bir iyilik yap."
  };
  var TEMA = { 1: "Başlangıç", 2: "İş birliği", 3: "İfade", 4: "Düzen", 5: "Değişim", 6: "Sevgi ve sorumluluk", 7: "İç gözlem", 8: "Güç ve emek", 9: "Paylaşmak" };

  function carkSvg() {
    var s = '<svg viewBox="-120 -122 240 242" class="sc-cark" aria-hidden="true"><g class="sc-don" style="transform-origin:0 0">';
    for (var i = 0; i < 9; i++) {
      var a0 = (i * 40 - 90 - 20) * Math.PI / 180, a1 = ((i + 1) * 40 - 90 - 20) * Math.PI / 180;
      var x0 = 100 * Math.cos(a0), y0 = 100 * Math.sin(a0), x1 = 100 * Math.cos(a1), y1 = 100 * Math.sin(a1);
      var am = (i * 40 - 90) * Math.PI / 180;
      s += '<path d="M0 0L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A100 100 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + 'Z" fill="' + RENK[i] + '" fill-opacity=".9" stroke="#1B1738" stroke-width="2"/>';
      var tx = (68 * Math.cos(am)).toFixed(1), ty = (68 * Math.sin(am)).toFixed(1);
      /* Sayı, dilimi üste geldiğinde düz okunacak şekilde döndürülür */
      s += '<text x="' + tx + '" y="' + ty + '" transform="rotate(' + (i * 40) + ' ' + tx + ' ' + ty + ')" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="700" fill="#1B1738" font-family="Fraunces,Georgia,serif">' + (i + 1) + "</text>";
    }
    s += '</g><circle r="16" fill="#1B1738" stroke="#F1CF7E" stroke-width="3"/><path d="M0 -96l-11 -22h22z" fill="#F1CF7E" stroke="#1B1738" stroke-width="2"/></svg>';
    return s;
  }
  function yarinaKalan() { var s = new Date(), y = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 1); var m = Math.round((y - s) / 60000); return Math.floor(m / 60) + " saat " + (m % 60) + " dakika"; }

  function ciz(kok) {
    var d = D.oku(), bugun = P.bugun(), cevrildi = d.cark.tarih === bugun && d.cark.sayi;
    kok.innerHTML = "";
    var a = el("div", { class: "oy-asama sc-alan" });
    a.appendChild(el("p", { class: "oy-ust" }, "Günün çarkı"));
    a.appendChild(el("h2", { tabindex: "-1" }, cevrildi ? "Bugünün sayısı: " + d.cark.sayi : "Çarkı çevir, gününün sayısını bul"));
    var tekerlek = el("div", { class: "sc-tekerlek", html: carkSvg() });
    a.appendChild(tekerlek);
    var sonuc = el("div", { class: "sc-sonuc", "aria-live": "polite" });
    a.appendChild(sonuc);
    var g = tekerlek.querySelector(".sc-don");
    function aciyaGetir(n, anim) {
      var hedef = 360 * (anim ? 6 : 0) + (360 - (n - 1) * 40);
      g.style.transition = anim ? "transform 3.6s cubic-bezier(.17,.67,.12,1)" : "none";
      g.style.transform = "rotate(" + hedef + "deg)";
    }
    function sonucCiz(n) {
      var dd = D.oku().cark;
      sonuc.innerHTML = "";
      sonuc.appendChild(el("p", { class: "sc-tema" }, [el("b", null, String(n)), " · " + TEMA[n] + (T && T.kader && T.kader[n] ? " (" + T.kader[n].ad + ")" : "")]));
      sonuc.appendChild(el("p", { class: "sc-gorev" }, [el("strong", null, "Günün küçük görevi: "), GOREV[n]]));
      if (dd.yapildi) sonuc.appendChild(el("p", { class: "oy-dogru" }, "Görevi tamamladın, eline sağlık!"));
      else sonuc.appendChild(el("button", { type: "button", class: "btn oy-buyuk", onclick: function () {
        D.degistir(function (x) { x.cark.yapildi = true; });
        P.xpVer(30, "Günün görevi"); P.rozetVer("iyilik"); M.olay("cark_gorev", { sayi: n });
        sonucCiz(n);
      } }, "Görevi yaptım (+30 XP)"));
      sonuc.appendChild(el("p", { class: "oy-not" }, "Yeni çark " + yarinaKalan() + " sonra. Bu bir fal değildir; çark rastgele döner. Amaç güne küçük ve güzel bir adım eklemek."));
      sonuc.appendChild(el("div", { class: "oy-son-dugmeler" }, [
        el("a", { class: "btn ghost", href: "/gunluk-numeroloji.html#sonuc" }, "Kişisel günlük sayın"),
        M.waDugme("Bugün Numerolojim'de günün çarkı " + n + " (" + TEMA[n] + ") çıktı. Görevim: " + GOREV[n] + " Sen de çevir: " + ADRES, function () { P.gorevTamamla("paylas"); P.rozetVer("paylasimci"); }),
        el("a", { class: "btn ghost", href: "/oyunlar/" }, "Oyun merkezi")
      ]));
    }
    if (cevrildi) { aciyaGetir(d.cark.sayi, false); sonucCiz(d.cark.sayi); }
    else {
      var btn = el("button", { type: "button", class: "btn oy-buyuk sc-cevir", onclick: function () {
        btn.disabled = true;
        var n = 1 + Math.floor(Math.random() * 9);
        D.degistir(function (x) { x.cark = { tarih: P.bugun(), sayi: n, yapildi: false }; });
        P.oyunBasla(OYUN);
        aciyaGetir(n, !w.matchMedia("(prefers-reduced-motion: reduce)").matches);
        setTimeout(function () {
          btn.remove();
          a.querySelector("h2").textContent = "Bugünün sayısı: " + n;
          P.oyunBitir(OYUN, { puan: n }); P.xpVer(10, "Çark"); P.rozetVer("carkci"); P.gorevTamamla("oyun");
          M.olay("oyun_bitir", { oyun: OYUN, sayi: n });
          try { w.nmjDone && w.nmjDone("oyun"); } catch (e) {}
          sonucCiz(n);
        }, 3700);
      } }, "Çarkı çevir");
      a.appendChild(btn);
    }
    kok.appendChild(a);
  }
  M.basla(ciz);
})(window, document);
