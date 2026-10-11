/* Numerolojim — ortak davranışlar: mini hesaplayıcılar ve paylaşım.
   Hesaplama ana sayfadaki yöntemle aynıdır: doğum tarihindeki tüm rakamlar
   toplanır, 11/22/33 korunarak tek haneye indirilir. */
(function(){
  "use strict";
  var doc=document, html=doc.documentElement;
  var EN=(html.lang||"").slice(0,2)==="en";

  var LV={a:1,b:2,c:3,"ç":3,d:4,e:5,f:6,g:7,"ğ":7,h:8,"ı":9,i:9,j:1,k:2,l:3,m:4,n:5,o:6,"ö":6,p:7,q:8,r:9,s:1,"ş":1,t:2,u:3,"ü":3,v:4,w:5,x:6,y:7,z:8};
  var LETTER_PAGE={a:"a",b:"b",c:"c","ç":"c2",d:"d",e:"e",f:"f",g:"g","ğ":"g2",h:"h","ı":"i",i:"i",j:"j",k:"k",l:"l",m:"m",n:"n",o:"o","ö":"o2",p:"p",r:"r",s:"s","ş":"s2",t:"t",u:"u","ü":"u2",v:"v",y:"y",z:"z"};
  var MASTER={11:1,22:1,33:1};

  function digitSum(n){return String(n).split("").reduce(function(a,d){return a+(+d||0)},0)}
  function reduceSteps(n){
    var steps=[n];
    while(n>9&&!MASTER[n]){n=digitSum(n);steps.push(n)}
    return steps;
  }
  function lower(s){try{return s.toLocaleLowerCase(EN?"en":"tr")}catch(e){return s.toLowerCase()}}

  function kaderUrl(n){return EN?("/en/life-path-number-"+n+".html"):("/kader-sayisi-"+n+".html")}

  /* Doğum tarihinden kader sayısı */
  function bindDate(form){
    var out=form.parentNode.querySelector(".calc-out");
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var d=+form.d.value,m=+form.m.value,y=+form.y.value, now=new Date().getFullYear();
      if(!d||!m||!y||d<1||d>31||m<1||m>12||y<1900||y>now){
        out.hidden=false;
        out.innerHTML='<p class="err">'+(EN?"Enter a valid day, month and year (e.g. 15 / 5 / 1990).":"Geçerli bir gün, ay ve yıl gir (ör. 15 / 5 / 1990).")+'</p>';
        return;
      }
      var digits=(""+d+m+y).split("");
      var total=digits.reduce(function(a,x){return a+(+x)},0);
      var steps=reduceSteps(total), n=steps[steps.length-1];
      out.hidden=false;
      out.innerHTML='<p class="steps">'+digits.join(" + ")+" = "+steps.join(" → ")+'</p>'+
        '<div class="res"><b>'+n+'</b><a class="btn" href="'+kaderUrl(n)+'">'+
        (EN?("Read life path "+n):("Kader sayısı "+n+" yorumunu oku"))+'</a></div>';
      try{window.gtag&&gtag("event","mini_calc",{type:"date",result:n})}catch(err){}
    });
  }

  /* İsimden harf değerleri */
  function bindName(form){
    var out=form.parentNode.querySelector(".calc-out");
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var raw=(form.name.value||"").trim();
      var chars=lower(raw).replace(/i̇/g,"i").split("").filter(function(c){return LV[c]});
      if(!chars.length){
        out.hidden=false;
        out.innerHTML='<p class="err">'+(EN?"Type a name using letters.":"Harflerden oluşan bir isim yaz.")+'</p>';
        return;
      }
      var total=chars.reduce(function(a,c){return a+LV[c]},0);
      var steps=reduceSteps(total), n=steps[steps.length-1];
      var chips=chars.map(function(c){
        var up=c==="i"?"İ":c==="ı"?"I":c.toLocaleUpperCase("tr");
        var href=!EN&&LETTER_PAGE[c]?("/harf-"+LETTER_PAGE[c]+".html"):null;
        return href?('<a href="'+href+'"><b>'+up+'</b><small>'+LV[c]+'</small></a>'):('<a><b>'+up+'</b><small>'+LV[c]+'</small></a>');
      }).join("");
      out.hidden=false;
      out.innerHTML='<div class="name-chips">'+chips+'</div>'+
        '<p class="steps">'+(EN?"Total":"Toplam")+": "+steps.join(" → ")+'</p>'+
        '<div class="res"><b>'+n+'</b><span>'+(EN?"Expression number":"İfade (isim) sayın")+'</span></div>'+
        '<p class="steps">'+(EN?"Tap a letter to read its meaning.":"Bir harfe dokunarak anlamını okuyabilirsin.")+'</p>';
      try{window.gtag&&gtag("event","mini_calc",{type:"name",result:n})}catch(err){}
    });
  }

  function bindShare(){
    var wa=doc.querySelector("[data-share=wa]"), cp=doc.querySelector("[data-share=copy]");
    if(wa)wa.addEventListener("click",function(){
      window.open("https://wa.me/?text="+encodeURIComponent(doc.title+" "+location.href),"_blank","noopener");
    });
    if(cp)cp.addEventListener("click",function(){
      var done=function(){cp.textContent=EN?"Link copied":"Bağlantı kopyalandı"};
      if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(done,done);else done();
    });
  }

  function init(){
    doc.querySelectorAll("form[data-calc=date]").forEach(bindDate);
    doc.querySelectorAll("form[data-calc=name]").forEach(bindName);
    bindShare();
  }
  if(doc.readyState!=="loading")init();else doc.addEventListener("DOMContentLoaded",init);
})();
