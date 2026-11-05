'use strict';
/* v12 · botín estilo Diablo: motor dinámico.
   Rarezas Común → Mágico → Raro → Legendario → Único, afijos aleatorios, aspectos de poder y 6 ranuras.
   Datos y generación pura en loot-v12-data.js. */
window.ECOS_LOOT12=function(A){
 const L=window.ECOS_LOOT,I=window.RPG_ITEMS,dist=A.distance;if(!L)return;
 const jobs=()=>A.players.map(p=>p.job);
 A.lootRoll=(src,floor,o={})=>L.roll(src,floor??A.g?.floor??1,{jobs:jobs(),...o});
 A.lootMake=(r,floor,o={})=>L.make(r,floor??A.g?.floor??1,{jobs:jobs(),...o});
 A.lootFx=(a,key)=>{const rk=L.rarityOf(I[key]);if(rk==='c'||rk==='m')return;A.fx('star',a.x,a.y,rk==='r'?1.4:2.6,.8);if(rk==='l'||rk==='u')A.toast('¡'+L.RAR[rk].n+'! '+I[key].name+(rk==='u'?' — pieza única.':'.'));};
 const dropAt=(e,key,tag)=>{A.loot.push({lid:'lt'+tag+(e.eid||Math.floor(e.x))+Math.floor(Math.random()*1e5),x:e.x,y:e.y,key,taken:false});};

 // ---------- aspectos ----------
 const oldStats=A.stats;
 A.stats=function(a){oldStats.call(this,a);const asp={};for(const k of a.gear||[])for(const s of I[k]?.asp||[])asp[s]=(asp[s]||0)+1;a.aspects=asp;};
 const oldHurt=A.hurt;
 A.hurt=function(e,d,owner,proj){
  const asp=owner&&owner.pid!=null?owner.aspects:null,was=!!e&&e.hp>0&&e.pid==null;
  if(asp&&was){
   if(asp.boss&&e.boss)d*=1+.22*asp.boss;
   if(asp.exec&&e.hp<(e.max||e.maxHp||e.hp*3)*.3)d*=1+.3*asp.exec;
   if(asp.bers&&owner.hp<owner.max*.5)d*=1+.25*asp.bers;
   if(asp.lucky&&Math.random()<.1*asp.lucky)d*=2;
  }
  const r=oldHurt.call(this,e,d,owner,proj);
  if(was&&e.hp<=0&&!e.lootDone&&A.NET.role!=='client'){
   e.lootDone=true;
   if(asp){
    if(asp.blood)owner.hp=Math.min(owner.max,owner.hp+owner.max*.03*asp.blood);
    if(asp.manae)owner.mp=Math.min(owner.maxMp,owner.mp+owner.maxMp*.05*asp.manae);
    if(asp.frenz)owner.haste=Math.max(owner.haste||0,3);
   }
   if(e.boss&&!e.sub&&e.dk!=='iron')dropAt(e,A.lootRoll('boss').key,'b');
   else if(!e.boss&&!e.sub&&Math.random()<.015)dropAt(e,A.lootRoll('event',undefined,{min:'m'}).key,'m');
  }
  return r;
 };
 const oldStep=A.step;
 A.step=function(dt){
  const r=oldStep.call(this,dt);
  if(A.NET.role==='client'||!A.g||A.g.ended)return r;
  for(const a of A.players){const n=a.aspects?.aura;if(!n||a.down||a.disconnected)continue;for(const b of A.players)if(!b.down&&!b.disconnected&&dist(a,b)<260)b.hp=Math.min(b.max,b.hp+1.2*n*dt);}
  return r;
 };

 // ---------- mochila: color por rareza y orden ----------
 const rank=k=>'cmrlu'.indexOf(k);
 function decorate(){
  const grid=document.querySelector('.bagGrid');
  for(const el of document.querySelectorAll('[data-v4equip],[data-v4use],[data-v4drop]')){
   const k=el.dataset.v4equip||el.dataset.v4use||el.dataset.v4drop,it=I[k];if(!it||it.type!=='gear')continue;
   const rk=L.rarityOf(it),card=el.closest('.itemCard')||el;
   card.classList.add('rar','rar-'+rk);card.style.setProperty('--rar',L.RAR[rk].color);card.dataset.rk=rank(rk);
  }
  if(grid){const cards=[...grid.children];const w=c=>c.classList.contains('equipped')?100:c.dataset.rk!=null?+c.dataset.rk*10+5:0;cards.map((c,i)=>[c,i]).sort((x,y)=>w(y[0])-w(x[0])||x[1]-y[1]).forEach(([c])=>grid.appendChild(c));}
 }
 const mo=new MutationObserver(()=>{if(mo.t)return;mo.t=requestAnimationFrame(()=>{mo.t=0;for(const el of document.querySelectorAll('[data-itemkey]:not(.rar),[data-up]:not(.rar),[data-rc]:not(.rar)')){const it=I[el.dataset.itemkey||el.dataset.up||el.dataset.rc];if(!it||it.type!=='gear')continue;const rk=L.rarityOf(it);el.classList.add('rar','rar-'+rk);const tg=el.dataset.itemkey?el:(el.closest('article')||el);tg.classList.add('rar','rar-'+rk);tg.style.setProperty('--rar',L.RAR[rk].color);if(el.dataset.itemkey)el.dataset.tip=it.name+'\n'+it.desc;}});});
 mo.observe(document.body,{childList:true,subtree:true});
 const oldBag=A.bagView;
 A.bagView=function(){const r=oldBag.apply(this,arguments);decorate();return r;};
 A.lootDecorate=decorate;
};
