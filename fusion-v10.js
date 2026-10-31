'use strict';
// Pokémon Echoe's · fusión de objetos (v10), inspirada en los componentes del modo Tácticas.
// Dos objetos de equipo (o dos copias del mismo) se fusionan en uno solo, más potente y con una ranura.

// ---------- Parte estática: genera todas las fusiones antes de cargar expedition-v6.js ----------
(()=>{
 const I=window.RPG_ITEMS;if(!I)return;
 const STATS={damage:'daño',speed:'velocidad',hp:'vida',crit:'prob. de crítico',mana:'maná máx.',cdr:'enfriamiento',armor:'defensa',regen:'regeneración',mpRegen:'maná/s',skill:'potencia de movimientos',leech:'robo de vida',healing:'curación',xp:'experiencia',cost:'coste de maná',rescue:'velocidad de rescate',electric:'daño eléctrico'};
 const PCT=new Set(['regen','mpRegen']);
 const BOOST=1.25;
 const NAMES={
  'protein|choice_band':'Banda Furia','protein|scope_lens':'Cinta Letal','protein|quick_claw':'Garra Vehemente','protein|carbos':'Puño Veloz','protein|silk_scarf':'Peto Reforzado','protein|hard_stone':'Coraza de Combate',
  'choice_band|scope_lens':'Lente Fatal','choice_band|focus_band':'Cinta Implacable','carbos|quick_claw':'Pluma Relámpago','carbos|scope_lens':'Lente Ágil','carbos|bright_powder':'Polvo Veloz',
  'magnet|silver_powder':'Imán Argénteo','magnet|bright_powder':'Brújula Astral','magnet|in_battle_herb':'Núcleo Sereno','silver_powder|bright_powder':'Polvo Estelar','silver_powder|in_battle_herb':'Hierba Plateada',
  'silk_scarf|hard_stone':'Escudo Pétreo','silk_scarf|leftovers':'Pañuelo Vital','hard_stone|focus_band':'Muralla','focus_band|silk_scarf':'Cinta Resistente','leftovers|shell_bell':'Banquete Curativo',
  'leftovers|sea_incense':'Brisa Reparadora','shell_bell|soothe_bell':'Campanilla Sanadora','shell_bell|sea_incense':'Marea Sanadora','soothe_bell|sea_incense':'Aroma Sereno','lucky_egg|amulet_coin':'Fortuna Dorada',
  'amulet_coin|in_battle_herb':'Moneda Zen','lucky_egg|in_battle_herb':'Huevo Zen','scope_lens|lucky_egg':'Ojo de la Suerte','quick_claw|bright_powder':'Garra Brillante','hard_stone|protein':'Coraza de Combate'
 };
 const gear=Object.keys(I).filter(k=>I[k].type==='gear'&&!I[k].fused);
 const keyOf=(a,b)=>'fuse_'+[a,b].sort().join('__');
 const fmt=(k,v)=>PCT.has(k)?'+'+(Math.round(v*10)/10)+' '+STATS[k]:(v<0?'':'+')+Math.round(v*100)+' % '+STATS[k];
 const recipes={};
 for(let i=0;i<gear.length;i++)for(let j=i;j<gear.length;j++){
  const a=gear[i],b=gear[j],A=I[a],B=I[b],e={};
  for(const k of Object.keys(STATS)){const v=(A[k]||0)+(B[k]||0);if(v)e[k]=Math.round(v*(k==='cost'?1:BOOST)*1000)/1000;}
  const jobs=A.jobs&&B.jobs?[...new Set([...A.jobs,...B.jobs])]:undefined;
  const sorted=[a,b].sort().join('|'),nm=NAMES[sorted]||NAMES[[b,a].join('|')]||(a===b?'Doble '+A.name:'Fusión: '+A.name+' + '+B.name);
  const key=keyOf(a,b);
  I[key]={name:nm,icon:A.icon||a,type:'gear',fused:true,parts:[a,b],jobs,...e,desc:'Fusión de '+A.name+' y '+B.name+'. Equipada: '+Object.entries(e).map(([k,v])=>fmt(k,v)).join(', ')+'.'};
  recipes[a+'|'+b]=recipes[b+'|'+a]=key;
 }
 window.ECOS_FUSION={recipes,keyOf,gear,fmt,STATS,BOOST};
})();

// ---------- Parte dinámica ----------
window.ECOS_FUSION10=function(A){
 const F=window.ECOS_FUSION,I=window.RPG_ITEMS,C=window.RPG_CLASSES,$=id=>document.getElementById(id),esc=A.escape;
 const old={requestAction:A.requestAction,netAction:A.NET.callbacks.action,bagView:A.bagView,closeUI:A.closeUI};
 const fuse=(a,key)=>{
  if(!a||!A.g||A.g.ended||a.down||a.disconnected||a.evolving||(A.localMode==='online'&&A.g.paused))return false;
  const [x,y]=String(key).split('|').slice(-2),rec=F.recipes[x+'|'+y];
  if(!rec||!I[x]||!I[y]||I[x].fused||I[y].fused)return false;
  if(x===y?(a.bag[x]||0)<2:(a.bag[x]||0)<1||(a.bag[y]||0)<1)return false;
  const wasEquipped=a.gear.includes(x)||a.gear.includes(y);
  a.bag[x]--;if(x!==y)a.bag[y]--;else a.bag[x]--;
  for(const k of new Set([x,y]))if((a.bag[k]||0)<=0&&a.gear.includes(k))a.gear.splice(a.gear.indexOf(k),1);
  a.bag[rec]=(a.bag[rec]||0)+1;
  if(wasEquipped&&a.gear.length<3&&(!I[rec].jobs||I[rec].jobs.includes(a.job)))a.gear.push(rec);
  A.stats(a);A.fx('star',a.x,a.y,2.2,.7);A.toast(a.name+' fusionó '+I[x].name+' y '+I[y].name+': '+I[rec].name+'.');
  return true;
 };
 A.requestAction=function(type,key){
  if(type==='fuse'){const pid=String(key).split('|')[0];if(A.NET.role==='client')A.NET.action(type,key);else fuse(A.players.find(p=>p.pid===pid)||A.me(),key);return;}
  return old.requestAction.call(this,type,key);
 };
 A.NET.callbacks.action=(pid,type,key)=>type==='fuse'?fuse(A.players.find(p=>p.pid===pid),key):old.netAction?.(pid,type,key);

 // ----- panel de fusión -----
 let sel=[],pid=null,sig='';
 const actor=()=>A.players.find(p=>p.pid===pid)||A.me();
 const candidates=a=>Object.entries(a.bag).filter(([k,n])=>n>0&&I[k]?.type==='gear'&&!I[k].fused);
 const mkSig=a=>JSON.stringify([a.pid,a.bag,a.gear,sel]);
 function render(force){
  const a=actor();if(!a)return;const s=mkSig(a);if(!force&&s===sig)return;sig=s;
  const list=candidates(a),counts=Object.fromEntries(list),chosen=sel.filter(k=>(counts[k]||0)>0);
  const ok=sel.length===2&&F.recipes[sel[0]+'|'+sel[1]]&&(sel[0]!==sel[1]||(counts[sel[0]]||0)>=2)&&sel.every(k=>(counts[k]||0)>0);
  const rec=ok?I[F.recipes[sel[0]+'|'+sel[1]]]:null,pick=sel.slice();
  const ov=$('overlay'),y=ov?.scrollTop||0;
  A.panel(`<div class="eyebrow">TALLER DE FUSIÓN · ${esc(a.name)}</div><h2>Fusionar objetos</h2>
  <p>Elige dos objetos de equipo (o dos copias del mismo). Se combinan en uno solo con un 25 % más de efecto y ocupan una única ranura. No se pueden volver a fusionar.</p>
  ${A.localMode==='local'?`<div class="bagTabs">${A.players.map(b=>`<button data-fuseplayer="${b.pid}" class="${a===b?'selected':''}">${esc(b.name)}</button>`).join('')}</div>`:''}
  <div class="bagGrid compactBag">${list.map(([k,n])=>{const it=I[k],n2=pick.filter(x=>x===k).length;return `<div class="itemCard ${n2?'equipped':''}">${A.iconTag(k)}<strong>${it.name} ×${n}</strong><p>${it.desc}</p><div class="miniActions"><button data-fusepick="${k}" ${pick.length>=2&&!n2||(n2>=n)?'disabled':''}>${n2?'Elegido ('+n2+')':'Elegir'}</button>${n2?`<button data-fuseunpick="${k}">Quitar</button>`:''}</div></div>`;}).join('')||'<p>Necesitas al menos dos objetos de equipo en la mochila.</p>'}</div>
  <div class="box fuseBox">${rec?`<b>${esc(rec.name)}</b><p>${esc(rec.desc)}</p>`:`<b>Resultado</b><p>${sel.length===2?'Esa combinación no es posible.':'Elige '+(2-sel.length)+' objeto(s) más.'}</p>`}</div>
  <div class="actions"><button class="primary" id="fuseGo" ${rec?'':'disabled'}>Fusionar</button><button id="fuseBack">Volver a la mochila</button></div>`);
  const ov2=$('overlay');if(ov2)ov2.scrollTop=y;const g2=document.querySelector('#overlay .compactBag');if(g2)g2.scrollTop=0;
  document.querySelectorAll('[data-fusepick]').forEach(b=>b.onclick=()=>{if(sel.length<2)sel.push(b.dataset.fusepick);render(true);});
  document.querySelectorAll('[data-fuseunpick]').forEach(b=>b.onclick=()=>{const i=sel.lastIndexOf(b.dataset.fuseunpick);if(i>=0)sel.splice(i,1);render(true);});
  document.querySelectorAll('[data-fuseplayer]').forEach(b=>b.onclick=()=>{pid=b.dataset.fuseplayer;sel=[];render(true);});
  $('fuseGo')?.addEventListener('click',()=>{A.requestAction('fuse',a.pid+'|'+sel[0]+'|'+sel[1]);sel=[];sig='';setTimeout(()=>render(true),150);});
  $('fuseBack').onclick=()=>{A.uiMode='bag';A.bagView();};
 }
 function open(){
  const a=A.localMode==='local'?(A.players.find(p=>p.pid===pid)||A.me()):A.me();if(!a||!A.g)return;
  pid=a.pid;sel=[];sig='';A.uiMode='fusion';A.keys.clear();render(true);
 }
 // Botón dentro de la mochila.
 A.bagView=function(){
  old.bagView();
  if(A.uiMode==='fusion')return;
  const row=document.querySelector('#overlay .equipRow');
  if(row&&!$('fuseOpen'))row.insertAdjacentHTML('afterend','<div class="actions fuseOpenRow"><button id="fuseOpen">⚗ Fusionar objetos</button></div>');
  const b=$('fuseOpen');if(b)b.onclick=open;
 };
 // Refresca el panel si cambia la mochila (online) y lo mantiene abierto.
 setInterval(()=>{if(A.uiMode==='fusion'&&A.g)render(false);},250);
 A.openFusion=open;A.fusion10={fuse};
};
