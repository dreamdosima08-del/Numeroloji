/* Numerolojim — harf çakra analizi, bebek ismi simülatörü, ünlü benzerliği,
   paylaşım kartı (1080x1920) ve melek sayısı terminali.
   Veriler: /assets/cakra-data.js (window.CAKRA) ve /assets/melek-data.js (window.MELEK).
   Hiçbir isim cihazda ya da sunucuda saklanmaz. */
(function(){
  "use strict";
  var doc=document, C=window.CAKRA, M=window.MELEK;
  var inApp=/\bin-app\b/.test(doc.documentElement.className);

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function lower(s){try{return s.toLocaleLowerCase("tr")}catch(e){return s.toLowerCase()}}
  function upperTr(s){try{return s.toLocaleUpperCase("tr")}catch(e){return s.toUpperCase()}}
  function title(s){return s.trim().split(/\s+/).map(function(w){return upperTr(w.charAt(0))+lower(w.slice(1))}).join(" ")}
  function track(n,p){try{window.gtag&&gtag("event",n,p||{})}catch(e){}}

  /* ---------- çekirdek hesap ---------- */
  function letters(name){return lower(name).replace(/i̇/g,"i").split("").filter(function(c){return C&&C.LV[c]})}
  function profile(name){
    var v=[0,0,0,0,0,0,0], by=[[],[],[],[],[],[],[]];
    letters(name).forEach(function(ch){var id=C.NUM2CAKRA[C.LV[ch]];v[id-1]++;by[id-1].push(ch)});
    return {v:v,by:by,total:v.reduce(function(a,b){return a+b},0)};
  }
  function state(n){return n===0?"eksik":n>=3?"guclu":"dengeli"}
  var STATE_LABEL={eksik:"Eksik",dengeli:"Dengeli",guclu:"Güçlü · gölge riski"};
  function strongest(v){var b=0;for(var i=1;i<7;i++)if(v[i]>v[b])b=i;return b}
  function cosine(a,b){
    var d=0,x=0,y=0;for(var i=0;i<7;i++){d+=a[i]*b[i];x+=a[i]*a[i];y+=b[i]*b[i]}
    return x&&y?d/Math.sqrt(x*y):0;
  }
  function chipLetters(arr){
    var seen={},out=[];arr.forEach(function(c){var u=c==="i"?"İ":c==="ı"?"I":upperTr(c);if(!seen[u]){seen[u]=1;out.push(u)}});return out.join(", ");
  }
  function bars(v,compact){
    var max=Math.max(4,Math.max.apply(null,v));
    return '<div class="ck-bars'+(compact?" compact":"")+'">'+C.CAKRALAR.map(function(c,i){
      return '<div class="ck-bar st-'+state(v[i])+'"><span class="nm">'+esc(c.ad)+'</span><span class="tr"><i style="width:'+Math.max(4,v[i]/max*100)+'%;background:'+c.renk+'"></i></span><b>'+v[i]+'</b></div>';
    }).join("")+'</div>';
  }

  /* ---------- 1) çakra analizi ---------- */
  function cardHtml(c,i,p){
    var n=p.v[i], st=state(n), txt;
    if(st==="guclu")txt='<p>'+esc(c.guclu.replace("{n}",n))+'</p><p class="ck-shadow"><strong>Gölge yön:</strong> '+esc(c.golge)+'</p>';
    else if(st==="dengeli")txt='<p>'+esc(c.dengeli)+'</p>';
    else txt='<p class="ck-miss">'+esc(c.eksik)+'</p>';
    return '<article class="ck-card st-'+st+'" style="--ck:'+c.renk+'">'+
      '<header><span class="dot"></span><h3>'+(i+1)+'. '+esc(c.ad)+' <small>'+esc(c.sk)+'</small></h3><span class="badge">'+STATE_LABEL[st]+'</span></header>'+
      '<p class="ck-meta">'+esc(c.alan)+' · Harfler: '+esc(c.harfler)+(n?' · İsminde: <b>'+chipLetters(p.by[i])+'</b> ('+n+')':' · İsminde yok')+'</p>'+
      '<ul class="ck-traits">'+c.guc.map(function(g){return"<li>"+esc(g)+"</li>"}).join("")+'</ul>'+txt+'</article>';
  }
  function similar(p){
    return C.UNLULER.map(function(u){return{u:u,s:cosine(p.v,u.v)}}).sort(function(a,b){return b.s-a.s}).slice(0,3);
  }
  function bindCakra(form){
    var out=doc.getElementById("ck-out");
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var raw=(form.name.value||"").trim();
      var p=profile(raw);
      if(p.total<2){out.hidden=false;out.innerHTML='<p class="err">Lütfen adını ve soyadını harflerle yaz.</p>';return}
      var nm=title(raw), top=strongest(p.v), tc=C.CAKRALAR[top];
      var miss=C.CAKRALAR.filter(function(c,i){return!p.v[i]}).map(function(c){return c.ad});
      var strong=C.CAKRALAR.filter(function(c,i){return p.v[i]>=3}).map(function(c){return c.ad});
      var sims=similar(p);
      out.hidden=false;
      out.innerHTML=
        '<div class="ck-summary"><p class="ck-kicker">'+esc(nm)+' için çakra haritası</p>'+
        '<p class="ck-top" style="--ck:'+tc.renk+'">En güçlü merkezin: <b>'+esc(tc.ad)+'</b> <span>('+esc(tc.alan.toLocaleLowerCase("tr"))+')</span></p>'+
        bars(p.v)+
        '<p class="ck-quick">'+(strong.length?'<span>Yoğun: '+esc(strong.join(", "))+'</span>':'')+(miss.length?'<span>Eksik: '+esc(miss.join(", "))+'</span>':'<span>Eksik çakran yok</span>')+'</p>'+
        '<div class="ck-actions"><button class="btn" type="button" data-card>Hikâye kartımı oluştur</button><a class="btn ghost" href="/bebek-ismi-analizi.html">Bebek ismi analizi</a></div>'+
        '<div class="ck-card-out" hidden></div></div>'+
        '<div class="ck-sim"><h3>Çakra haritan kime benziyor?</h3><ul>'+sims.map(function(x){
          return '<li><a href="/unluler.html#'+x.u.slug+'"><b>%'+Math.round(x.s*100)+'</b> '+esc(x.u.ad)+'<small>Baskın: '+esc(C.CAKRALAR[x.u.baskin-1].ad)+'</small></a></li>';
        }).join("")+'</ul><p class="sub">Benzerlik, yedi çakradaki harf dağılımının karşılaştırılmasıyla hesaplanır; eğlence amaçlıdır.</p></div>'+
        '<h2 class="ck-h">Yedi çakranın tek tek yorumu</h2>'+
        '<div class="ck-grid">'+C.CAKRALAR.map(function(c,i){return cardHtml(c,i,p)}).join("")+'</div>';
      out.querySelector("[data-card]").addEventListener("click",function(){makeCard(nm,p,out.querySelector(".ck-card-out"),this)});
      out.scrollIntoView({behavior:"smooth",block:"start"});
      track("cakra_analiz",{top:tc.ad,missing:miss.length,strong:strong.length});
    });
  }

  /* ---------- 6) paylaşım kartı ---------- */
  function wrap(ctx,text,x,y,maxW,lh){
    var words=text.split(" "),line="",lines=[];
    words.forEach(function(w){var t=line?line+" "+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t});
    if(line)lines.push(line);
    lines.forEach(function(l,i){ctx.fillText(l,x,y+i*lh)});
    return y+lines.length*lh;
  }
  function loadImg(src){return new Promise(function(r){var i=new Image();i.onload=function(){r(i)};i.onerror=function(){r(null)};i.src=src})}
  function makeCard(nm,p,box,btn){
    btn.disabled=true;btn.textContent="Kart hazırlanıyor…";
    var fonts=doc.fonts&&doc.fonts.load?Promise.all([doc.fonts.load('600 80px "Literata"'),doc.fonts.load('600 40px "Albert Sans"'),doc.fonts.load('400 40px "Albert Sans"')]).catch(function(){}):Promise.resolve();
    Promise.all([fonts,loadImg("/assets/logo-240.png")]).then(function(r){
      var logo=r[1], W=1080, H=1920, cv=doc.createElement("canvas");cv.width=W;cv.height=H;
      var x=cv.getContext("2d"), top=strongest(p.v), tc=C.CAKRALAR[top];
      var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#120F2A");g.addColorStop(.55,"#1B1738");g.addColorStop(1,"#2A1F55");
      x.fillStyle=g;x.fillRect(0,0,W,H);
      var rg=x.createRadialGradient(W/2,560,40,W/2,560,620);rg.addColorStop(0,tc.renk+"55");rg.addColorStop(1,"rgba(0,0,0,0)");
      x.fillStyle=rg;x.fillRect(0,0,W,H);
      // yıldızlar
      var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
      for(var s=0;s<90;s++){x.fillStyle="rgba(241,236,246,"+(0.15+rnd()*.5)+")";x.beginPath();x.arc(rnd()*W,rnd()*H,rnd()*2.2+.4,0,7);x.fill()}
      if(logo)x.drawImage(logo,W/2-70,110,140,140);
      x.textAlign="center";x.fillStyle="#BDB5DC";x.font='600 36px "Albert Sans",sans-serif';x.fillText("NUMEROLOJİM",W/2,310);
      x.fillStyle="#F1ECF6";x.font='600 76px "Literata",Georgia,serif';
      var ny=wrap(x,nm,W/2,440,900,88);
      x.font='400 44px "Literata",Georgia,serif';x.fillStyle="#DDB45A";x.fillText("Kozmik enerji haritası",W/2,ny+10);
      // en güçlü
      x.fillStyle="rgba(255,255,255,.06)";roundRect(x,90,ny+70,900,220,28);x.fill();
      x.strokeStyle=tc.renk;x.lineWidth=4;roundRect(x,90,ny+70,900,220,28);x.stroke();
      x.fillStyle="#BDB5DC";x.font='600 34px "Albert Sans",sans-serif';x.fillText("EN GÜÇLÜ ÇAKRAN",W/2,ny+135);
      x.fillStyle="#F1ECF6";x.font='600 68px "Literata",Georgia,serif';x.fillText((top+1)+". "+tc.ad,W/2,ny+215);
      x.fillStyle="#BDB5DC";x.font='400 34px "Albert Sans",sans-serif';x.fillText(tc.alan,W/2,ny+265);
      // çubuklar
      var by=ny+360, max=Math.max(4,Math.max.apply(null,p.v));
      x.textAlign="left";
      C.CAKRALAR.forEach(function(c,i){
        var yy=by+i*84;
        x.fillStyle="#F1ECF6";x.font='600 34px "Albert Sans",sans-serif';x.fillText(c.ad,100,yy+12);
        x.fillStyle="rgba(255,255,255,.1)";roundRect(x,460,yy-14,460,30,15);x.fill();
        x.fillStyle=c.renk;roundRect(x,460,yy-14,Math.max(30,460*p.v[i]/max),30,15);x.fill();
        x.fillStyle="#F1ECF6";x.textAlign="right";x.fillText(String(p.v[i]),985,yy+12);x.textAlign="left";
      });
      // uyarı
      var wy=by+7*84+40, strongIdx=p.v[top]>=3?top:-1, missIdx=p.v.indexOf(0), warn;
      if(strongIdx>=0)warn="Dikkat: Bu yoğun enerjinin gölge yönü "+C.CAKRALAR[strongIdx].golge_kisa+" olabilir.";
      else if(missIdx>=0)warn="Çalışma alanın: "+C.CAKRALAR[missIdx].ad+". Bu merkez isminde hiç beslenmiyor.";
      else warn="Yedi çakran da isminde beslenmiş; dengeli bir harita.";
      x.fillStyle="rgba(238,147,147,.12)";roundRect(x,90,wy,900,170,24);x.fill();
      x.textAlign="center";x.fillStyle="#F3B3B3";x.font='400 38px "Albert Sans",sans-serif';
      wrap(x,warn,W/2,wy+70,820,50);
      // alt bilgi
      x.fillStyle="#DDB45A";x.font='600 40px "Albert Sans",sans-serif';x.fillText("Sen de ücretsiz keşfet:",W/2,H-150);
      x.fillStyle="#F1ECF6";x.font='600 48px "Literata",Georgia,serif';x.fillText("numerolojim.com.tr",W/2,H-90);
      var url=cv.toDataURL("image/png");
      box.hidden=false;
      box.innerHTML='<img src="'+url+'" width="1080" height="1920" alt="'+esc(nm)+' için çakra hikâye kartı">'+
        (inApp?'<p class="sub">Kartı kaydetmek için ekran görüntüsü al ya da görsele uzun bas.</p>':
        '<div class="ck-actions"><button class="btn" type="button" data-sh>Paylaş</button><a class="btn ghost" download="numerolojim-cakra.png" href="'+url+'">İndir</a></div><p class="sub">Instagram ya da TikTok hikâyende paylaşabilirsin.</p>');
      var sh=box.querySelector("[data-sh]");
      if(sh)sh.addEventListener("click",function(){
        cv.toBlob(function(b){
          var f=new File([b],"numerolojim-cakra.png",{type:"image/png"});
          if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:"Çakra haritam",text:"Sen de keşfet: numerolojim.com.tr/cakra-analizi.html"}).catch(function(){});
          else{var a=box.querySelector("a[download]");a&&a.click()}
          track("cakra_kart_paylas");
        });
      });
      btn.disabled=false;btn.textContent="Kartı yeniden oluştur";
      box.scrollIntoView({behavior:"smooth",block:"center"});
      track("cakra_kart");
    });
  }
  function roundRect(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}

  /* ---------- 3) bebek ismi simülatörü ---------- */
  function score(v){var s=0;v.forEach(function(n){if(n>=1&&n<=2)s+=2;else if(n>=3&&n<=4)s+=1});return s}
  function pool(g){
    var out=[],seen={};
    C.CAKRALAR.forEach(function(c){(g==="erkek"?c.erkek:g==="kiz"?c.kiz:c.kiz.concat(c.erkek)).forEach(function(n){if(!seen[n]){seen[n]=1;out.push(n)}})});
    return out;
  }
  function suggest(full,g,exclude){
    var base=profile(full).v, missBefore=base.filter(function(n){return!n}).length;
    return pool(g).filter(function(n){return exclude.indexOf(lower(n))<0}).map(function(n){
      var v=profile(n+" "+full).v, miss=v.filter(function(k){return!k}).length;
      return{n:n,fill:missBefore-miss,sc:score(v),miss:miss};
    }).filter(function(o){return o.fill>0}).sort(function(a,b){return b.fill-a.fill||b.sc-a.sc}).slice(0,6);
  }
  function bindBebek(form){
    var out=doc.getElementById("bb-out");
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var sur=(form.soyad.value||"").trim(), g=form.cinsiyet.value;
      var names=[form.ad1.value,form.ad2.value,form.ad3.value].map(function(s){return(s||"").trim()}).filter(Boolean);
      if(!letters(sur).length||!names.length){out.hidden=false;out.innerHTML='<p class="err">Soyadını ve en az bir isim adayını yaz.</p>';return}
      var rows=names.map(function(n){
        var full=title(n)+" "+title(sur), p=profile(full);
        return{n:title(n),full:full,p:p,sc:score(p.v),miss:p.v.filter(function(k){return!k}).length};
      });
      var best=rows.slice().sort(function(a,b){return a.miss-b.miss||b.sc-a.sc})[0];
      out.hidden=false;
      out.innerHTML=(rows.length>1?'<p class="bb-best">Çakra dengesi en iyi aday: <b>'+esc(best.full)+'</b></p>':'')+
        '<div class="bb-grid">'+rows.map(function(r){
          var miss=[],over=[];
          r.p.v.forEach(function(k,i){if(!k)miss.push(i);if(k>=4)over.push(i)});
          var adv="";
          if(miss.length){
            adv+='<p><strong>Eksik kalan:</strong> '+miss.map(function(i){var c=C.CAKRALAR[i];return esc(c.ad)+' <small>('+esc(c.alan.toLocaleLowerCase("tr"))+')</small>'}).join(", ")+'.</p>';
            adv+='<p>Dengeyi tamamlamak istersen göbek adında şu harflerden biri bulunabilir: '+miss.map(function(i){return"<b>"+esc(C.CAKRALAR[i].harfler)+"</b>"}).join(" · ")+'.</p>';
            var sg=suggest(r.full,g,[lower(r.n)]);
            if(sg.length)adv+='<p class="bb-sug">Göbek adı önerileri: '+sg.map(function(o){return'<span title="'+o.fill+' eksik çakrayı tamamlar">'+esc(o.n)+'</span>'}).join("")+'</p>';
          }else adv+='<p class="ok">Yedi çakranın hepsi bu isim kombinasyonunda besleniyor.</p>';
          if(over.length)adv+='<p class="ck-shadow"><strong>Yoğun:</strong> '+over.map(function(i){return esc(C.CAKRALAR[i].ad)+" ("+r.p.v[i]+" harf, gölge yön: "+esc(C.CAKRALAR[i].golge_kisa)+")"}).join("; ")+'. Göbek adında bu harfleri tekrar etmemek dengeyi korur.</p>';
          return'<article class="bb-card'+(r===best&&rows.length>1?" best":"")+'"><h3>'+esc(r.full)+'</h3><p class="ck-meta">Denge puanı: <b>'+r.sc+'/14</b> · Eksik çakra: <b>'+r.miss+'</b></p>'+bars(r.p.v,true)+adv+'</article>';
        }).join("")+'</div>';
      out.scrollIntoView({behavior:"smooth",block:"start"});
      track("bebek_ismi",{adet:rows.length});
    });
  }

  /* ---------- 4) melek sayısı terminali ---------- */
  function melekMsg(raw){
    var n=raw.replace(/\D/g,"");
    if(!n)return null;
    if(M.M[n])return{n:n,b:M.M[n].b,m:M.M[n].m,u:M.M[n].u};
    var d=n.split(""), uniq=d.filter(function(x,i){return d.indexOf(x)===i});
    var parts=uniq.map(function(x){return M.R[x]});
    var sum=d.reduce(function(a,x){return a+(+x)},0);while(sum>9)sum=String(sum).split("").reduce(function(a,x){return a+(+x)},0);
    var m="Şu an "+raw.trim()+" gördün. "+(parts.length>1?"Bu sayı "+parts.slice(0,-1).join(", ")+" ve "+parts[parts.length-1]+" temalarını bir araya getiriyor.":"Bu sayı "+parts[0]+" temasının güçlenmiş halidir.")+" Kökü "+sum+": "+M.R[String(sum)]+". Bugün bu temaya dikkat et.";
    var rep=uniq.length===1&&d.length>=3?(d[0]+d[0]+d[0]):null;
    return{n:n,b:"Kişisel mesajın",m:m,u:rep&&M.M[rep]?M.M[rep].u:null};
  }
  function isTime(n){return n.length===4&&+n.slice(0,2)<24&&+n.slice(2)<60}
  function bindMelek(form){
    var out=form.parentNode.querySelector(".melek-out");
    function show(raw){
      var r=melekMsg(raw);
      out.hidden=false;
      if(!r){out.innerHTML='<p class="err">Bir sayı yaz (ör. 111, 444 ya da 11:11).</p>';return}
      out.innerHTML='<div class="melek-res"><p class="melek-num">'+esc(isTime(r.n)?r.n.slice(0,2)+":"+r.n.slice(2):r.n)+'</p><p class="melek-b">'+esc(r.b)+'</p><p class="melek-m">'+esc(r.m)+'</p>'+(r.u?'<a class="btn ghost" href="'+r.u+'">Ayrıntılı anlamını oku</a>':'')+'</div>';
      track("melek_terminal",{n:r.n});
    }
    form.addEventListener("submit",function(e){e.preventDefault();show(form.n.value||"")});
    var chips=form.parentNode.querySelectorAll(".melek-chips a");
    Array.prototype.forEach.call(chips,function(a){a.addEventListener("click",function(e){e.preventDefault();form.n.value=a.textContent;show(a.textContent)})});
  }

  function init(){
    var f;
    if(C&&(f=doc.querySelector("form[data-cakra]")))bindCakra(f);
    if(C&&(f=doc.querySelector("form[data-bebek]")))bindBebek(f);
    if(M)Array.prototype.forEach.call(doc.querySelectorAll("form[data-melek]"),bindMelek);
  }
  if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",init);else init();
})();
