'use strict';
/* v12 · Resumen de partida: build, daño por fuente, causa de caída y logros. Solo el anfitrión mide; el resumen viaja con el estado final. */
window.ECOS_SUMMARY12=function(A){
 const dist=A.distance,esc=A.escape,S=window.RPG_SPECIES,C=window.RPG_CLASSES,I=window.RPG_ITEMS,old={hurt:A.hurt,damage:A.damage,nextFloor:A.nextFloor};
 const isP=a=>!!a&&A.players.includes(a);
 const rec=pid=>{const g=A.g;g.sum??={};return g.sum[pid]??={dealt:{},taken:{},down:0,cause:null,maxHit:0,floorHits:{}};};
 const bump=(o,k,v)=>{o[k]=(o[k]||0)+v;};
 A.hurt=function(e,d,owner,p){
  const hp=e.hp,r=old.hurt.call(this,e,d,owner,p);
  try{if(A.g&&A.NET.role!=='client'&&hp>0&&isP(owner)){const dealt=Math.max(0,hp-Math.max(0,e.hp));if(dealt>0){
   const src=p?.thorns?'Espinas':(owner.castingSkill||p?.skill)?(owner.castingMove||'Técnica de clase'):'Ataque básico';
   const R=rec(owner.pid);bump(R.dealt,src,dealt);if(e.boss)bump(R.dealt,'· contra jefes',dealt);}}}catch{}
  return r;
 };
 A.damage=function(a,d,...rest){
  const hp=a.hp,was=a.down,r=old.damage.call(this,a,d,...rest);
  try{if(A.g&&A.NET.role!=='client'&&isP(a)&&!was){const lost=Math.max(0,hp-a.hp);if(lost>0){
   let src=null,best=300;for(const e of A.enemies)if(e.hp>0){const k=dist(a,e);if(k<best){best=k;src=e;}}
   const name=src?(src.name||S[src.id]?.name||'Enemigo')+(src.boss?' (jefe)':''):'Trampas y terreno';
   const R=rec(a.pid);bump(R.taken,name,lost);R.floorHits[A.g.floor]=(R.floorHits[A.g.floor]||0)+lost;R.maxHit=Math.max(R.maxHit,lost);
   if(a.down&&!R.downNow){R.down++;R.cause={by:name,floor:A.g.floor,hit:Math.round(lost)};}}}}catch{}
  return r;
 };
 A.nextFloor=function(...args){const g=A.g,f=g?.floor,r=old.nextFloor.apply(this,args);try{if(g&&A.NET.role!=='client'){g.sumFloors=Math.max(g.sumFloors||0,f||0);}}catch{}return r;};
 const bars=(o,top=6)=>{const rows=Object.entries(o).filter(([k])=>!k.startsWith('·')).sort((a,b)=>b[1]-a[1]).slice(0,top),t=rows.reduce((s,r)=>s+r[1],0)||1,m=rows[0]?.[1]||1;
  return rows.length?rows.map(([k,v])=>`<div class="sRow"><span>${esc(k)}</span><i style="width:${Math.round(v/m*100)}%"></i><b>${Math.round(v)} <small>${Math.round(v/t*100)}%</small></b></div>`).join(''):'<p class="mHint">Sin datos.</p>';};
 function achievements(a,R,win){
  const g=A.g,out=[],T=A.mastery,spentN=Object.values(a.tal||{}).reduce((x,y)=>x+y,0);
  const add=(n,d,ok)=>{if(ok)out.push([n,d]);};
  add('Camino completo','Derrotaste a Mewtwo.',win);
  add('Piso 10','Llegaste al piso 10.',g.floor>=10);add('Piso 25','Llegaste al piso 25.',g.floor>=25);add('Piso 50','Llegaste al piso 50.',g.floor>=50);
  add('Cazador','100 enemigos vencidos.',g.kills>=100);add('Exterminador','500 enemigos vencidos.',g.kills>=500);
  add('Intocable','Nunca caíste en esta expedición.',!R.down&&g.floor>=5);
  add('Una sola pieza','Terminaste un piso sin recibir daño.',g.floor>=3&&Object.keys(R.floorHits).length<g.floor-1);
  add('Maestro de clase','Gastaste 10 puntos de talento.',spentN>=10);
  add('Coleccionista','Equipaste las seis ranuras.',(a.gear||[]).length>=6);
  add('Cazador de leyendas','Llevas una pieza Legendaria o Única.',(a.gear||[]).some(k=>['l','u'].includes(I[k]?.rk)));
  add('Fusionista','Llevas un objeto fusionado.',(a.gear||[]).some(k=>I[k]?.fused));
  add('Gran golpe','Recibiste un golpe de más de 80 de daño.',R.maxHit>80);
  add('Maratón','Más de 30 minutos de expedición.',g.time>=1800);
  return out;
 }
 A.summaryHTML=function(win){
  const g=A.g;if(!g)return '';const list=(A.localMode==='local'?A.players:[A.me()]).filter(Boolean);
  const sum=g.sum||{};
  return '<div class="runSum">'+list.map(a=>{
   const R=sum[a.pid]||{dealt:{},taken:{},down:0,floorHits:{}},c=C[a.job],tal=Object.entries(a.tal||{}).map(([id,r])=>{const n=A.mastery?.NODE[id];return n?esc(n.n)+(r>1?' ×'+r:''):''}).filter(Boolean),
   gear=(a.gear||[]).map(k=>I[k]?esc(I[k].name):'').filter(Boolean),totalD=Object.entries(R.dealt).filter(([k])=>!k.startsWith('·')).reduce((s,x)=>s+x[1],0),
   ach=achievements(a,R,win),cause=R.cause;
   return `<section class="sCard"><h3>${esc(a.name)} · ${esc(S[a.id].name)} · ${esc(c.name)} · Nv. ${a.level}</h3>
    <div class="sGrid"><div><h4>Build</h4><p><b>Talentos:</b> ${tal.join(', ')||'ninguno'}</p><p><b>Equipo:</b> ${gear.join(', ')||'ninguno'}</p></div>
    <div><h4>Daño causado · ${Math.round(totalD)}</h4>${bars(R.dealt)}</div>
    <div><h4>Daño recibido</h4>${bars(R.taken,4)}${cause?`<p class="sDeath">☠ Cayó en el piso ${cause.floor} por <b>${esc(cause.by)}</b> (golpe de ${cause.hit}).</p>`:'<p class="mHint">No cayó en combate.</p>'}</div></div>
    <h4>Logros</h4><div class="sAch">${ach.map(x=>`<span title="${esc(x[1])}">★ ${esc(x[0])}</span>`).join('')||'<span class="mHint">Ninguno esta vez.</span>'}</div></section>`;}).join('')+'</div>';
 };
 // Los clientes reciben el resumen con el estado final
 A.summaryData=()=>A.g?.sum;
};
