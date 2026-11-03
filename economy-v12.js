'use strict';
/* v12 · Economía: libro de recetas, fusiones legendarias, tienda rotatoria, reciclaje en polvo y mejora de objetos. */
window.ECOS_ECON12=function(A){
 const I=window.RPG_ITEMS,F=window.ECOS_FUSION,LG=window.ECOS_LEGEND||{recipes:{},list:[]},$=id=>document.getElementById(id),esc=A.escape,dist=A.distance;
 const old={requestAction:A.requestAction,netAction:A.NET.callbacks.action,stats:A.stats,hud:A.hud,cleanActor:A.cleanActor,makePlayer:A.makePlayer};
 const KEY='ecosBook12',COST=[10,20,35];
 let book={rec:[],leg:[],seen:[]};try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.rec)book={rec:v.rec||[],leg:v.leg||[],seen:v.seen||[]};}catch{}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(book))}catch{}};
 const total=Object.keys(I).filter(k=>I[k].fused&&!I[k].legendary).length;
 // ---------- descubrimiento (lee la mochila propia en cualquier modo) ----------
 let tick=0;
 function scan(a){let ch=false;if(!a)return;
  for(const [k,n] of Object.entries(a.bag||{})){if(!(n>0)||!I[k])continue;
   if(I[k].legendary){const id=k.replace('legend_','');if(!book.leg.includes(id)){book.leg.push(id);ch=true;}for(const p of I[k].parts)if(!book.seen.includes(p)){book.seen.push(p);ch=true;}}
   else if(I[k].fused){if(!book.rec.includes(k)){book.rec.push(k);ch=true;}for(const p of I[k].parts)if(!book.seen.includes(p)){book.seen.push(p);ch=true;}}
   else if(I[k].type==='gear'&&!book.seen.includes(k)){book.seen.push(k);ch=true;}}
  if(ch)save();}
 // ---------- acciones ----------
 const own=(a,k)=>a.bag[k]||0,spent=a=>a.gear.includes.bind(a.gear);
 const remove=(a,k,n=1)=>{a.bag[k]-=n;if((a.bag[k]||0)<=0&&a.gear.includes(k))a.gear.splice(a.gear.indexOf(k),1);};
 function legFuse(a,id){const r=LG.recipes[id];if(!a||!r||!A.g||A.g.ended||a.down||a.disconnected||(A.localMode==='online'&&A.g.paused))return false;
  if(!r.parts.every(p=>own(a,p)>=1))return false;
  const eq=r.parts.some(p=>a.gear.includes(p));for(const p of r.parts)remove(a,p);
  a.bag[r.key]=(a.bag[r.key]||0)+1;if(eq&&a.gear.length<3)a.gear.push(r.key);
  A.stats(a);A.fx('star',a.x,a.y,3,.9);A.toast(a.name+' forjó '+r.name+'.');return true;}
 function dustOf(k){const it=I[k];if(!it)return 0;if(it.legendary)return 40;if(it.fused)return 14;if(it.type==='gear')return 6;return it.type==='use'&&!/^(tm_|chest_|dungeon_key|revive)/.test(k)?1:0;}
 function recycle(a,k){if(!a||!A.g||A.g.ended||a.down||!I[k])return false;const d=dustOf(k),keep=a.gear.includes(k)?1:0;if(!d||own(a,k)<=keep)return false;a.bag[k]--;a.dust=(a.dust||0)+d;A.toast('Reciclaste '+I[k].name+': +'+d+' polvo.');return true;}
 function upgrade(a,k){if(!a||!A.g||A.g.ended||a.down||!I[k]||I[k].type!=='gear'||!(own(a,k)>0))return false;const lv=(a.up||{})[k]||0;if(lv>=3||(a.dust||0)<COST[lv])return false;a.dust-=COST[lv];(a.up??={})[k]=lv+1;a._tver=(a._tver||0)+1;A.stats(a);A.fx('star',a.x,a.y,2,.6);A.toast(I[k].name+' mejorado a +'+(lv+1)+'.');return true;}
 const H={legfuse:legFuse,recycle,upgrade};
 A.requestAction=function(type,key){if(H[type]){const [pid,arg]=String(key).split('|');if(A.NET.role==='client')A.NET.action(type,key);else H[type](A.players.find(p=>p.pid===pid)||A.me(),arg);return;}return old.requestAction.call(this,type,key);};
 A.NET.callbacks.action=(pid,type,key)=>{if(H[type]){const [p,arg]=String(key).split('|');return H[type](A.players.find(a=>a.pid===pid),arg);}return old.netAction?.(pid,type,key);};
 // ---------- mejoras de objeto en las estadísticas ----------
 A.stats=function(a){const ratio=a.max?a.hp/a.max:1;old.stats(a);if(!a.up)return;let d={};
  for(const [k,lv] of Object.entries(a.up)){if(!lv||!a.gear.includes(k)||!I[k])continue;for(const s of ['damage','hp','speed','crit','cdr','armor','leech','skill','healing','xp','mana']){if(I[k][s])d[s]=(d[s]||0)+I[k][s]*.1*lv;}}
  if(d.hp){a.max=Math.round(a.max*(1+d.hp));a.hp=Math.min(a.max,Math.max(a.hp,a.max*ratio));}
  if(d.damage)a.damage*=1+d.damage;if(d.speed)a.speed=Math.min(295,a.speed*(1+d.speed));if(d.crit)a.crit=Math.min(.65,(a.crit||0)+d.crit);if(d.cdr)a.cdr=Math.min(.45,(a.cdr||0)+d.cdr);if(d.armor)a.armor=Math.min(.45,(a.armor||0)+d.armor);
  if(d.leech)a.leech=(a.leech||0)+d.leech;if(d.skill)a.skillPower=(a.skillPower||1)+d.skill;if(d.healing)a.healPower=(a.healPower||1)+d.healing;if(d.xp)a.xpBonus=(a.xpBonus||0)+d.xp;if(d.mana){a.maxMp=Math.round(a.maxMp*(1+d.mana));a.mp=Math.min(a.mp??a.maxMp,a.maxMp);}};
 A.makePlayer=function(...x){const a=old.makePlayer(...x);a.dust=0;a.up={};return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.dust)o.dust=a.dust;if(a.up&&Object.keys(a.up).length)o.up=a.up;return o;};
 // ---------- tienda rotatoria ----------
 window.ECOS_SHOP12=function(ev){const g=A.g,jobs=A.players.map(a=>a.job),epoch=Math.floor((g.floor-1)/3),rng=A.seeded((g.seed||1)+epoch*977),ps=A.seeded((g.seed||1)+g.floor*31);
  const pool=Object.keys(I).filter(k=>I[k].type==='gear'&&!I[k].fused&&!I[k].unique&&(!I[k].jobs||I[k].jobs.some(j=>jobs.includes(j)))).sort(),cons=['potion','super_potion','ether','oran_berry','sitrus_berry','leppa_berry','lum_berry','escape_rope','revive',...(window.ECOS_ITEMS11?.common||[])].filter(k=>I[k]);
  const pickN=(arr,n,r)=>{const c=arr.slice(),o=[];while(o.length<n&&c.length)o.push(c.splice(Math.floor(r()*c.length),1)[0]);return o;};
  const gear=pickN(pool,3,rng),deal=gear[2],c=pickN(cons,2,ps);
  return [{key:gear[0],price:30},{key:gear[1],price:30},{key:deal,price:21,deal:true},{key:c[0],price:12},{key:c[1],price:12}].filter(s=>s.key).map((s,i)=>({...s,taken:false,id:i}));};
 // ---------- libro y taller ----------
 const actor=()=>A.players.find(p=>p.pid===pid)||A.me();let pid=null;
 const tabs=cur=>`<div class="bagTabs"><button data-ecotab="book" class="${cur==='book'?'selected':''}">📖 Libro de recetas</button><button data-ecotab="shop" class="${cur==='shop'?'selected':''}">✦ Taller de polvo</button><button data-ecotab="fuse">⚗ Fusionar</button></div>`;
 const named=()=>Object.keys(F.recipes).filter((k,i,arr)=>arr.indexOf(k)===i);
 function openBook(p){const a=p?A.players.find(x=>x.pid===p):actor();if(!a||!A.g)return;pid=a.pid;A.uiMode='recipes';A.keys.clear();scan(a);
  const knownL=id=>book.leg.includes(id),have=(a,k)=>own(a,k)>0,nm=k=>book.seen.includes(k)||have(a,k)?esc(I[k].name):'???';
  const legs=LG.list.map(id=>{const r=LG.recipes[id],ok=r.parts.every(p=>have(a,p)),got=knownL(id);
   return `<article class="recCard leg ${got?'done':''}"><h4>${knownL(id)||r.parts.filter(p=>book.seen.includes(p)||have(a,p)).length>=2?esc(r.name):'Fusión legendaria ???'} <small>${esc(r.tag)}</small></h4><p>${r.parts.map(p=>`<span class="${have(a,p)?'own':''}">${nm(p)}</span>`).join(' + ')}</p>${got||ok?`<p class="mHint">${esc(I[r.key].desc)}</p>`:''}<button data-leg="${id}" ${ok?'':'disabled'}>${got?'Forjar otra':'Forjar'}</button></article>`;}).join('');
  const disc=book.rec.filter(k=>I[k]).map(k=>`<article class="recCard"><h4>${esc(I[k].name)}</h4><p>${I[k].parts.map(p=>esc(I[p].name)).join(' + ')}</p><p class="mHint">${esc(I[k].desc.replace(/^Fusión de [^.]*\. /,''))}</p></article>`).join('')||'<p class="mHint">Aún no has descubierto fusiones. Funde dos objetos de equipo para escribir la primera receta.</p>';
  const hints=[...new Set(Object.values(F.recipes))].filter(k=>!book.rec.includes(k)&&!/^Fusión:|^Doble/.test(I[k].name)).slice(0,10).map(k=>`<article class="recCard hint"><h4>??? <small>pista</small></h4><p>${esc(I[I[k].parts[0]].name)} + ???</p></article>`).join('');
  A.panel(`<div class="eyebrow">LIBRO DE RECETAS · ${esc(a.name)}</div><h2>Recetas de fusión</h2>${tabs('book')}<p>Descubiertas: <b>${book.rec.length}</b> de ${total} · Legendarias forjadas: <b>${book.leg.length}</b> de ${LG.list.length}. Los ingredientes se revelan al encontrarlos.</p>
   <h3>Fusiones legendarias · tres objetos</h3><div class="recGrid">${legs}</div><h3>Recetas descubiertas</h3><div class="recGrid">${disc}</div>${hints?`<h3>Pistas</h3><div class="recGrid">${hints}</div>`:''}<div class="actions"><button id="bkBack">Volver a la mochila</button></div>`);
  wireTabs(a);document.querySelectorAll('[data-leg]').forEach(b=>b.onclick=()=>{A.requestAction('legfuse',a.pid+'|'+b.dataset.leg);setTimeout(()=>{scan(actor());openBook(a.pid)},200);});$('bkBack').onclick=()=>{A.uiMode='bag';A.bagView();};}
 function openShop(p){const a=p?A.players.find(x=>x.pid===p):actor();if(!a||!A.g)return;pid=a.pid;A.uiMode='recipes';A.keys.clear();
  const rec=Object.entries(a.bag).filter(([k,n])=>n>(a.gear.includes(k)?1:0)&&dustOf(k)>0),up=Object.entries(a.bag).filter(([k,n])=>n>0&&I[k]?.type==='gear');
  A.panel(`<div class="eyebrow">TALLER DE POLVO · ${esc(a.name)}</div><h2>Reciclar y mejorar</h2>${tabs('shop')}<p>Polvo: <b class="dust">${a.dust||0}</b>. Recicla lo que te sobra (consumibles 1, equipo 6, fusiones 14, legendarios 40) y gástalo en mejorar equipo: +10% de sus efectos por nivel, hasta +3.</p>
   <h3>Mejorar equipo</h3><div class="recGrid">${up.map(([k])=>{const lv=(a.up||{})[k]||0,c=COST[lv];return `<article class="recCard"><h4>${esc(I[k].name)} <small>+${lv}</small></h4><button data-up="${k}" ${lv>=3||(a.dust||0)<c?'disabled':''}>${lv>=3?'Máximo':'Mejorar · '+c+' polvo'}</button></article>`;}).join('')||'<p class="mHint">No llevas equipo.</p>'}</div>
   <h3>Reciclar sobrantes</h3><div class="recGrid">${rec.map(([k,n])=>`<article class="recCard"><h4>${esc(I[k].name)} ×${n-(a.gear.includes(k)?1:0)}</h4><button data-rc="${k}">Reciclar · +${dustOf(k)}</button></article>`).join('')||'<p class="mHint">No tienes sobrantes.</p>'}</div><div class="actions"><button id="bkBack">Volver a la mochila</button></div>`);
  wireTabs(a);const redo=()=>setTimeout(()=>openShop(a.pid),200);
  document.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{A.requestAction('upgrade',a.pid+'|'+b.dataset.up);redo();});
  document.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{A.requestAction('recycle',a.pid+'|'+b.dataset.rc);redo();});$('bkBack').onclick=()=>{A.uiMode='bag';A.bagView();};}
 function wireTabs(a){document.querySelectorAll('[data-ecotab]').forEach(b=>b.onclick=()=>{const t=b.dataset.ecotab;if(t==='book')openBook(a.pid);else if(t==='shop')openShop(a.pid);else{A.openFusion?.();}});}
 // botones en la mochila y en el taller de fusión
 const ov=$('overlay');
 if(ov)new MutationObserver(()=>{const back=$('fuseBack');if(back&&!$('ecoBook')){back.insertAdjacentHTML('beforebegin','<button id="ecoBook">📖 Libro de recetas</button><button id="ecoShop">✦ Taller de polvo</button>');$('ecoBook').onclick=()=>openBook();$('ecoShop').onclick=()=>openShop();}
  const row=$('fuseOpen');if(row&&!$('bagBook')){row.insertAdjacentHTML('afterend','<button id="bagBook">📖 Libro de recetas</button><button id="bagShop">✦ Taller de polvo</button>');$('bagBook').onclick=()=>openBook();$('bagShop').onclick=()=>openShop();}}).observe(ov,{childList:true,subtree:true});
 A.hud=function(){old.hud();if(++tick%30===0&&A.g)scan(A.me());};
 A.econ={book:()=>book,openBook,openShop,legFuse,recycle,upgrade,dustOf};
};
