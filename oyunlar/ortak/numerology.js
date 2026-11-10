/* Numeroloji Arenası · numerology.js
   Oyunlar sitenin ortak hesap motorunu (/assets/nmj-motor.js) kullanır; formüller burada
   yeniden yazılmaz. Böylece oyundaki yaşam yolu sayısı, sitedeki kader sayısı aracıyla birebir aynıdır.
   Yöntem: Pisagor; doğum tarihinin bütün rakamları toplanır, 11, 22 ve 33 ana sayı olarak korunur. */
(function (w) {
  "use strict";
  var N = w.NMJ;
  if (!N) throw new Error("nmj-motor.js yüklenmeli");

  function tarihKontrol(g, a, y) {
    g = +g; a = +a; y = +y;
    if (!g || !a || !y) return "Gün, ay ve yılı eksiksiz seç.";
    if (y < 1900) return "Yıl 1900'den küçük olamaz.";
    if (!N.tarihGecerli(g, a, y)) return "Bu tarih takvimde yok; günü ve ayı kontrol et.";
    var d = new Date(y, a - 1, g), simdi = new Date();
    if (d > simdi) return "Doğum tarihi gelecekte olamaz.";
    return "";
  }

  /* Yaşam yolu: sonuç + ekranda gösterilecek adım adım hesap */
  function yasamYolu(g, a, y) {
    var k = N.kader(+g, +a, +y);
    var adim = k.rakamlar.join(" + ") + " = " + k.toplam;
    for (var i = 1; i < k.zincir.length; i++) adim += " → " + String(k.zincir[i - 1]).split("").join(" + ") + " = " + k.zincir[i];
    return { sayi: k.sayi, adim: adim, zincir: k.zincir, usta: k.sayi === 11 || k.sayi === 22 || k.sayi === 33, taban: N.taban(k.sayi) };
  }

  w.NMJOyun.sayi = { tarihKontrol: tarihKontrol, yasamYolu: yasamYolu, taban: N.taban, tek: N.tek };
})(window);
