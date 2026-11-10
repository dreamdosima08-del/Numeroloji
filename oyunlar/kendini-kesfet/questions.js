/* Kendini Keşfet · questions.js
   Oyunun bütün içeriği: kişilik soruları, bulmaca havuzları, semboller ve yorumlar.
   Yorumlar sembolik ve eğlence amaçlıdır; bilimsel gerçek ya da gelecek tahmini değildir. */
(function (w) {
  "use strict";

  /* AŞAMA 3: Kişilik soruları. Her seçenek bir ya da iki sayıya "eğilim" puanı verir. */
  var SORULAR = [
    { soru: "Boş bir cumartesi sabahı uyandın. İlk aklına gelen ne?",
      secenekler: [
        { metin: "Kafamdaki projeye hemen başlamak", sayilar: [1, 8] },
        { metin: "Sevdiklerimi arayıp bir buluşma ayarlamak", sayilar: [2, 6] },
        { metin: "Plansız çıkıp şehirde kaybolmak", sayilar: [5, 3] },
        { metin: "Kitap, kahve ve kendi sessizliğim", sayilar: [7, 9] } ] },
    { soru: "Arkadaş grubunda genellikle hangi rolü üstlenirsin?",
      secenekler: [
        { metin: "Planı yapan ve herkesi toplayan", sayilar: [1, 4] },
        { metin: "Herkesi güldüren, ortamı canlandıran", sayilar: [3, 5] },
        { metin: "Dertleri dinleyen, sır saklayan", sayilar: [2, 7] },
        { metin: "Herkesin iyiliğini düşünen, kollayan", sayilar: [6, 9] } ] },
    { soru: "Önemli bir kararı nasıl verirsin?",
      secenekler: [
        { metin: "Artısını eksisini yazar, hesaplarım", sayilar: [4, 8] },
        { metin: "İçimden gelen sese kulak veririm", sayilar: [7, 2] },
        { metin: "Hızlıca karar verir, yolda düzeltirim", sayilar: [1, 5] },
        { metin: "Bu karardan kimlerin etkileneceğini düşünürüm", sayilar: [6, 9] } ] },
    { soru: "Sana bir süper güç verilse hangisini seçerdin?",
      secenekler: [
        { metin: "Zihin okumak", sayilar: [7, 2] },
        { metin: "İstediğim yere ışınlanmak", sayilar: [5, 1] },
        { metin: "Dokunduğum her şeyi iyileştirmek", sayilar: [6, 9] },
        { metin: "Hiç yorulmadan çalışıp her şeyi inşa etmek", sayilar: [4, 8] } ] },
    { soru: "Seni en çok ne mutlu eder?",
      secenekler: [
        { metin: "Bir hedefe ulaşıp sonucu görmek", sayilar: [8, 1] },
        { metin: "Ürettiğim bir şeyin beğenilmesi", sayilar: [3, 1] },
        { metin: "Huzurlu bir ev ve yanımda sevdiklerim", sayilar: [6, 2] },
        { metin: "Bir şeyi derinlemesine anlamak", sayilar: [7, 4] } ] }
  ];

  /* AŞAMA 4: Bulmaca havuzları. Her oyunda her türden rastgele bir soru gelir. */
  var BULMACALAR = {
    eksik: [
      { soru: "Eksik sayıyı bul: 2, 4, ?, 8, 10", secenekler: [5, 6, 7, 9], cevap: 6, ipucu: "Her adımda aynı miktar artıyor.", aciklama: "Sayılar ikişer artıyor: 4 + 2 = 6." },
      { soru: "Eksik sayıyı bul: 3, 9, 27, ?", secenekler: [36, 54, 81, 90], cevap: 81, ipucu: "Her sayı bir öncekinin kaç katı?", aciklama: "Her sayı bir öncekinin 3 katı: 27 × 3 = 81." },
      { soru: "Eksik ana sayıyı bul: 11, 22, ?", secenekler: [23, 30, 33, 44], cevap: 33, ipucu: "Numerolojideki üç ana sayıyı düşün.", aciklama: "Numerolojinin üç ana sayısı 11, 22 ve 33'tür." },
      { soru: "Eksik sayıyı bul: 1, 4, 9, ?, 25", secenekler: [12, 14, 16, 20], cevap: 16, ipucu: "1×1, 2×2, 3×3…", aciklama: "Sayılar kare sayılar: 4 × 4 = 16." },
      { soru: "Eksik sayıyı bul: 7, 14, ?, 28, 35", secenekler: [18, 20, 21, 24], cevap: 21, ipucu: "7'nin katlarına bak.", aciklama: "7'nin katları: 7 × 3 = 21." }
    ],
    dizi: [
      { soru: "Diziyi devam ettir: 1, 1, 2, 3, 5, ?", secenekler: [6, 7, 8, 9], cevap: 8, ipucu: "Her sayı, kendinden önceki iki sayının toplamı.", aciklama: "Fibonacci dizisi: 3 + 5 = 8." },
      { soru: "Diziyi devam ettir: 2, 3, 5, 7, 11, ?", secenekler: [12, 13, 14, 15], cevap: 13, ipucu: "Bu sayılar yalnızca 1'e ve kendisine bölünür.", aciklama: "Asal sayılar dizisi: 11'den sonraki asal sayı 13." },
      { soru: "Diziyi devam ettir: 1, 3, 6, 10, ?", secenekler: [12, 14, 15, 16], cevap: 15, ipucu: "Aradaki farklar 2, 3, 4…", aciklama: "Farklar birer artıyor: 10 + 5 = 15." },
      { soru: "Diziyi devam ettir: 64, 32, 16, ?", secenekler: [4, 8, 10, 12], cevap: 8, ipucu: "Her adımda yarıya iniyor.", aciklama: "Her sayı bir öncekinin yarısı: 16 ÷ 2 = 8." },
      { soru: "Diziyi devam ettir: 1, 2, 6, 24, ?", secenekler: [48, 72, 96, 120], cevap: 120, ipucu: "×2, ×3, ×4…", aciklama: "Çarpan her adımda bir artıyor: 24 × 5 = 120." }
    ],
    mantik: [
      { soru: "Ayın 29'unda doğan birinin doğum günü sayısı kaçtır?", secenekler: [2, 9, 11, 29], cevap: 11, ipucu: "Rakamları topla; sonuç bir ana sayıysa indirgeme.", aciklama: "2 + 9 = 11. 11 ana sayı olduğu için indirgenmez." },
      { soru: "1985 yılının rakamları toplanıp tek haneye indirgenirse kaç olur?", secenekler: [5, 6, 7, 23], cevap: 5, ipucu: "1 + 9 + 8 + 5 = ? Sonra bir kez daha topla.", aciklama: "1 + 9 + 8 + 5 = 23, 2 + 3 = 5." },
      { soru: "Pisagor harf tablosunda A harfinin değeri kaçtır?", secenekler: [1, 2, 5, 9], cevap: 1, ipucu: "Alfabenin ilk harfi.", aciklama: "Pisagor tablosunda A, J ve S harfleri 1 değerini taşır." },
      { soru: "Hangisi numerolojide ana sayı değildir?", secenekler: [11, 22, 33, 44], cevap: 44, ipucu: "Ana sayılar üç tanedir.", aciklama: "Ana sayılar 11, 22 ve 33'tür; 44 indirgenerek 8 olur." },
      { soru: "15 Mayıs 1990 doğumlu birinin yaşam yolu sayısı kaçtır?", secenekler: [3, 4, 7, 30], cevap: 3, ipucu: "1+5+0+5+1+9+9+0 = ? Sonra tek haneye indir.", aciklama: "1+5+0+5+1+9+9+0 = 30, 3 + 0 = 3." }
    ]
  };
  var BULMACA_ADLARI = { eksik: "Eksik sayı", dizi: "Sayı dizisi", mantik: "Numeroloji mantığı" };

  /* AŞAMA 5: Semboller */
  var SEMBOLLER = [
    { id: "anahtar", ad: "Anahtar", ikon: "anahtar", anlam: "Kapıları açmak, yeni yollar bulmak",
      yorum: "Anahtarı seçtin: içinde, kapalı kapıların ardını merak eden bir kâşif var. Bir sorunla karşılaştığında onu çözülmeyi bekleyen bir kilit gibi görürsün." },
    { id: "ay", ad: "Hilal", ikon: "ay", anlam: "Sezgi, iç dünya, sessiz bilgelik",
      yorum: "Hilali seçtin: sezgilerine güvenen, söylenmeyeni hisseden bir yanın var. En doğru cevapları çoğu zaman sessiz anlarda bulursun." },
    { id: "yildiz", ad: "Yıldız", ikon: "yildiz", anlam: "Umut, ilham, yol göstermek",
      yorum: "Yıldızı seçtin: karanlıkta bile yönünü bulan, başkalarına da ışık tutan bir ruhun var. İlham vermek senin doğal halin." }
  ];

  /* AŞAMA 6: Cevaplardan çıkan iç eğilim sayısının kısa anlamı */
  var EGILIM = {
    1: { ad: "Öncü", metin: "Cevapların harekete geçme, başlatma ve kendi yolunu çizme isteğini öne çıkarıyor." },
    2: { ad: "Uyumlu", metin: "Cevapların ilişkilere, dengeye ve insanları bir arada tutmaya verdiğin değeri gösteriyor." },
    3: { ad: "Yaratıcı", metin: "Cevapların ifade etme, üretme ve hayatın neşeli yanını görme isteğini öne çıkarıyor." },
    4: { ad: "Kurucu", metin: "Cevapların düzene, emeğe ve sağlam temeller kurmaya önem verdiğini gösteriyor." },
    5: { ad: "Özgür", metin: "Cevapların değişime, deneyime ve özgürce hareket etme isteğini öne çıkarıyor." },
    6: { ad: "Koruyucu", metin: "Cevapların sevdiklerini kollama, sorumluluk alma ve şefkat gösterme yönünü öne çıkarıyor." },
    7: { ad: "Araştırmacı", metin: "Cevapların derin düşünmeye, anlamaya ve iç sese kulak vermeye yöneldiğini gösteriyor." },
    8: { ad: "Hedef odaklı", metin: "Cevapların sonuç almaya, güç ve sorumluluğu yönetmeye odaklandığını gösteriyor." },
    9: { ad: "Gönül insanı", metin: "Cevapların herkesi kucaklayan, büyük resmi gören ve iyilik yapmayı seven yanını öne çıkarıyor." }
  };

  /* AŞAMA 7: Yaşam yolu sayısının sembolik yorumu */
  var YORUM = {
    1: { baslik: "Öncü", rozet: "Öncünün Mührü", ozet: "1, başlangıçların sayısıdır. Yeni yollar açmak, kendi kararlarını vermek ve cesaretle öne çıkmak bu enerjinin özüdür.",
         guclu: ["Kararlılık ve cesaret", "Bağımsız düşünebilme", "İlk adımı atma gücü"],
         sorular: ["Son zamanlarda ertelediğin ve aslında başlamak istediğin şey ne?", "Liderlik ederken başkalarının fikrine ne kadar yer açıyorsun?"] },
    2: { baslik: "Diplomat", rozet: "Barışın Mührü", ozet: "2, uyumun ve iş birliğinin sayısıdır. İnsanların arasında köprü kurmak, ince ayrıntıları fark etmek ve sabırla ilerlemek bu enerjinin özüdür.",
         guclu: ["Empati ve anlayış", "Uzlaştırma yeteneği", "İnce ayrıntıları fark etmek"],
         sorular: ["Başkalarını memnun etmek için kendi isteğini en son ne zaman erteledin?", "Hayır demekte zorlandığın bir alan var mı?"] },
    3: { baslik: "Yaratıcı İfade", rozet: "İlhamın Mührü", ozet: "3, ifadenin ve yaratıcılığın sayısıdır. Konuşmak, yazmak, üretmek ve hayatın neşesini paylaşmak bu enerjinin özüdür.",
         guclu: ["Yaratıcılık", "Etkileyici iletişim", "İyimserlik ve neşe"],
         sorular: ["Yarım bıraktığın yaratıcı bir işin var mı?", "Enerjini çok fazla şeye dağıttığın oluyor mu?"] },
    4: { baslik: "Kurucu", rozet: "Temelin Mührü", ozet: "4, düzenin ve emeğin sayısıdır. Plan yapmak, sabırla çalışmak ve kalıcı şeyler inşa etmek bu enerjinin özüdür.",
         guclu: ["Disiplin ve sabır", "Güvenilirlik", "Pratik çözümler üretmek"],
         sorular: ["Planların değiştiğinde nasıl hissediyorsun?", "Kendine dinlenme izni vermekte zorlanıyor musun?"] },
    5: { baslik: "Özgür Ruh", rozet: "Rüzgârın Mührü", ozet: "5, değişimin ve özgürlüğün sayısıdır. Yeni deneyimler, yolculuklar ve esneklik bu enerjinin özüdür.",
         guclu: ["Uyum sağlama hızı", "Merak ve cesaret", "İnsanlarla kolay bağ kurmak"],
         sorular: ["Rutinden sıkıldığında yarım bıraktığın sorumluluklar oluyor mu?", "Seni gerçekten özgür hissettiren şey ne?"] },
    6: { baslik: "Koruyucu", rozet: "Şefkatin Mührü", ozet: "6, sevginin ve sorumluluğun sayısıdır. Aileyi, evi ve sevdiklerini kollamak bu enerjinin özüdür.",
         guclu: ["Şefkat ve sadakat", "Sorumluluk bilinci", "Güzelliği ve uyumu fark etmek"],
         sorular: ["Herkesi kollarken kendine ne kadar zaman ayırıyorsun?", "Yardım istemekte zorlanıyor musun?"] },
    7: { baslik: "Bilge", rozet: "Bilgeliğin Mührü", ozet: "7, araştırmanın ve iç dünyanın sayısıdır. Derinlemesine düşünmek, sorgulamak ve sezgiye güvenmek bu enerjinin özüdür.",
         guclu: ["Analiz ve derin düşünce", "Güçlü sezgi", "Bilgiye duyulan merak"],
         sorular: ["Yalnız kalma ihtiyacını çevrene nasıl anlatıyorsun?", "Her şeyi anlamadan karar vermekte zorlanıyor musun?"] },
    8: { baslik: "Güç ve Başarı", rozet: "Gücün Mührü", ozet: "8, hedeflerin ve maddi dünyanın sayısıdır. Yönetmek, sonuç almak ve gücü sorumlulukla taşımak bu enerjinin özüdür.",
         guclu: ["Hedef koyma ve ulaşma", "Yönetim becerisi", "Dayanıklılık"],
         sorular: ["Başarıyı yalnızca sonuçla mı ölçüyorsun?", "Kontrolü bırakmak sana ne hissettiriyor?"] },
    9: { baslik: "Hümanist", rozet: "Gönlün Mührü", ozet: "9, tamamlanmanın ve insan sevgisinin sayısıdır. Büyük resmi görmek, bağışlamak ve iyilik yapmak bu enerjinin özüdür.",
         guclu: ["Geniş bakış açısı", "Cömertlik ve hoşgörü", "İlham verme gücü"],
         sorular: ["Bırakman gereken ama hâlâ tuttuğun bir şey var mı?", "Başkalarına verdiğin desteğin bir kısmını kendine de veriyor musun?"] },
    11: { baslik: "Işık Taşıyıcı", rozet: "Ana Sayı 11 Mührü", ozet: "11 bir ana sayıdır ve 2'nin daha yoğun halidir. Güçlü sezgi, ilham ve başkalarına yol göstermek bu enerjinin özüdür.",
          guclu: ["Çok güçlü sezgi", "İlham veren bir duruş", "Başkalarını derinden anlamak"],
          sorular: ["Sezgilerin sana bir şey söylediğinde ona ne kadar güveniyorsun?", "Yüksek beklentilerin seni ne zaman yoruyor?"] },
    22: { baslik: "Usta İnşaatçı", rozet: "Ana Sayı 22 Mührü", ozet: "22 bir ana sayıdır ve 4'ün daha yoğun halidir. Büyük hayalleri somut yapılara dönüştürmek bu enerjinin özüdür.",
          guclu: ["Büyük ölçekli düşünme", "Hayali gerçeğe dönüştürme", "Sabır ve organizasyon"],
          sorular: ["Büyük bir hayalin için bugün atabileceğin küçük adım ne?", "Mükemmeliyetçilik seni ne zaman durduruyor?"] },
    33: { baslik: "Usta Öğretmen", rozet: "Ana Sayı 33 Mührü", ozet: "33 bir ana sayıdır ve 6'nın daha yoğun halidir. Şefkatle öğretmek, iyileştirmek ve çevresine örnek olmak bu enerjinin özüdür.",
          guclu: ["Derin şefkat", "Öğretme ve rehberlik", "Fedakârlık"],
          sorular: ["Başkalarına verdiğin emeğin karşılığını beklemeden verebiliyor musun?", "Kendi sınırlarını korumak sana ne kadar kolay?"] }
  };

  w.NMJOyun.kesfetIcerik = { SORULAR: SORULAR, BULMACALAR: BULMACALAR, BULMACA_ADLARI: BULMACA_ADLARI, SEMBOLLER: SEMBOLLER, EGILIM: EGILIM, YORUM: YORUM };
})(window);
