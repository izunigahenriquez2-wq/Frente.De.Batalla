'use strict';
/* v12 · Maestría de clase (motor + pantalla).
   El PERSONAJE (clase) tiene pasiva, técnica propia y un árbol de talentos; el Pokémon aporta sus movimientos.
   Puntos: 1 por nivel desde el 5 (más los extra del juego). Datos en talents-v12-data.js. */
window.ECOS_FREE_RESPEC=true; // modo pruebas: reiniciar el árbol es gratis
window.ECOS_TALENTS12=function(A){
 const T=window.ECOS_TAL12,TREE=T.TREE,NODE=T.NODE,TXT=T.TXT,FLAG=T.FLAG,dist=A.distance,C=window.RPG_CLASSES,S=window.RPG_SPECIES,esc=A.escape,$=id=>document.getElementById(id);
 const API=window.ECOS_V10,old={stats:A.stats,step:A.step,hurt:A.hurt,damage:A.damage,cleanActor:A.cleanActor,makePlayer:A.makePlayer,nextFloor:A.nextFloor,hud:A.hud};
 const isP=a=>!!a&&A.players.includes(a);
 // ---------- agregación de efectos ----------
 function agg(a){
  if(!a||!TREE[a.job])return {};
  const host=A.NET.role!=='client';
  if(host&&a._tf&&a._tfv===(a._tver||0)&&a._tfj===a.job)return a._tf;
  const f={},add=(fx,r)=>{for(const [k,v] of Object.entries(fx)){if(FLAG[k])f[k]=1;else f[k]=(f[k]||0)+v*r;}};
  add(TREE[a.job].passive.f,1);
  if(a.techRank){f.rpow=(f.rpow||0)+.18*a.techRank;f.rcdr=(f.rcdr||0)+.05*a.techRank;}
  for(const [id,r] of Object.entries(a.tal||{})){const n=NODE[id];if(n&&id.startsWith(a.job+'.'))add(n.f,r);}
  if(host){a._tf=f;a._tfv=a._tver||0;a._tfj=a.job;}
  return f;
 }
 const spent=a=>Object.values(a.tal||{}).reduce((x,y)=>x+y,0);
 const total=a=>Math.max(0,(a.level-5)+(a.points||0));
 const points=a=>Math.max(0,total(a)-spent(a));
 const inBranch=(a,b)=>Object.entries(a.tal||{}).reduce((s,[id,r])=>{const n=NODE[id];return s+(n&&id.startsWith(a.job+'.')&&n.branch===b?r:0)},0);
 function why(a,n){ // null = se puede invertir
  const rank=a.tal?.[n.id]||0;
  if(rank>=n.max)return 'max';
  if(points(a)<=0)return 'puntos';
  if(!rank){const sib=NODE[n.id.replace(/\.\d$/,'.'+(1-n.opt))];if((a.tal?.[sib.id]||0)>0)return 'bloqueado';}
  if(inBranch(a,n.branch)<T.need(n.tier))return 'req';
  return null;
 }
 function learn(a,id){
  const n=NODE[id];if(!a||!n||!id.startsWith(a.job+'.'))return false;
  if(why(a,n))return false;
  a.tal=a.tal||{};a.tal[id]=(a.tal[id]||0)+1;a._tver=(a._tver||0)+1;A.stats(a);
  if(a.pid===A.myPid)A.toast(n.n+(n.max>1?' · rango '+a.tal[id]+'/'+n.max:''));
  return true;
 }
 function reset(a){if(!window.ECOS_FREE_RESPEC||!a)return false;a.tal={};a._tver=(a._tver||0)+1;A.stats(a);a.hp=Math.min(a.hp,a.max);if(a.pid===A.myPid)A.toast('Maestría reiniciada: puntos devueltos.');return true;}
 A.talent=function(a,key){
  if(typeof key!=='string'||!key.startsWith('tt:'))return; // los talentos numéricos antiguos ya no existen
  const k=key.slice(3);if(k==='reset')reset(a);else learn(a,k);
 };
 // ---------- estadísticas ----------
 A.stats=function(a){
  const ratio=a.max?a.hp/a.max:1;old.stats(a);
  const f=agg(a);if(!Object.keys(f).length)return;
  if(f.hp){a.max=Math.round(a.max*(1+f.hp));a.hp=Math.min(a.max,Math.max(a.hp,a.max*ratio));}
  if(f.dmg)a.damage*=1+f.dmg;
  if(f.speed)a.speed=Math.min(295,a.speed*(1+f.speed));
  if(f.crit)a.crit=Math.min(.65,(a.crit||0)+f.crit);
  if(f.cdr)a.cdr=Math.min(.45,(a.cdr||0)+f.cdr);
  if(f.armor)a.armor=Math.min(.45,(a.armor||0)+f.armor);
  if(f.mp){a.maxMp=Math.round(a.maxMp*(1+f.mp));a.mp=Math.min(a.mp??a.maxMp,a.maxMp);}
  if(f.mpRegen)a.mpRegen=(a.mpRegen||0)+f.mpRegen;
  if(f.leech)a.leech=(a.leech||0)+f.leech;
  if(f.skill)a.skillPower=(a.skillPower||1)+f.skill;
  if(f.heal)a.healPower=(a.healPower||1)+f.heal;
  if(f.xp)a.xpBonus=(a.xpBonus||0)+f.xp;
 };
 A.makePlayer=function(...args){const a=old.makePlayer(...args);a.tal={};a._tver=0;return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.tal)o.tal=a.tal;if(a.techRank)o.techRank=a.techRank;return o;};
 // ---------- tareas diferidas ----------
 const later=[];
 const status=(e,kind,t)=>{if(e.boss){if(kind==='sleep')return;if(kind==='stun')e.stun=Math.min(.35,t);else e[kind]=Math.max(e[kind]||0,t*.6);return;}e[kind]=Math.max(e[kind]||0,t);};
 // ---------- efectos por segundo, auras y piso nuevo ----------
 A.step=function(dt){
  old.step.call(this,dt);
  if(!A.g||A.state!=='play'||A.g.paused||A.g.assetLoading||A.NET.role==='client'||A.g.ended)return;
  for(let i=later.length-1;i>=0;i--){later[i].t-=dt;if(later[i].t<=0){const j=later.splice(i,1)[0];try{j.fn()}catch(e){console.error(e)}}}
  const live=A.players.filter(p=>!p.down&&!p.disconnected);
  for(const p of A.players)p.auraDmgNow=0;
  for(const a of live){
   const f=agg(a);if(!Object.keys(f).length)continue;
   if(f.regenPct&&a.hp<a.max)a.hp=Math.min(a.max,a.hp+a.max*f.regenPct*dt);
   if(f.auraHeal||f.auraDmg||f.auraSpeed)for(const b of live){if(dist(a,b)>240)continue;
    if(f.auraHeal&&b.hp<b.max)b.hp=Math.min(b.max,b.hp+b.max*f.auraHeal*dt);
    if(f.auraDmg)b.auraDmgNow=Math.min(.35,(b.auraDmgNow||0)+f.auraDmg);
    if(f.auraSpeed)b.haste=Math.max(b.haste||0,.3);}
   if(f.trapwise)for(const t of A.g.traps||[])if(!t.revealed&&dist(a,t)<520)t.revealed=true;
  }
 };
 A.nextFloor=function(...args){const r=old.nextFloor.apply(this,args);if(A.g&&A.players)for(const a of A.players){const f=agg(a);if(f.floorShield)a.shield=Math.max(a.shield||0,f.floorShield);}return r;};
 // ---------- daño que haces ----------
 A.hurt=function(e,d,owner,p){
  if(!isP(owner)||p?.thorns)return old.hurt.call(this,e,d,owner,p);
  const f=agg(owner);let m=1;
  if(f.lowHp&&owner.hp<owner.max*.5)m+=f.lowHp;
  if(f.execute&&e.hp<e.max*.3)m+=f.execute;
  if(owner.auraDmgNow)m+=owner.auraDmgNow;
  const before=e.hp,r=old.hurt.call(this,e,d*m,owner,p);
  if(before>0&&f.mpOnHit&&e.hp<before)owner.mp=Math.min(owner.maxMp,owner.mp+f.mpOnHit);
  if(before>0&&e.hp<=0&&!e.sub&&!e.fled){
   if(f.onKillHeal)owner.hp=Math.min(owner.max,owner.hp+owner.max*f.onKillHeal);
   if(f.onKillMp)owner.mp=Math.min(owner.maxMp,owner.mp+f.onKillMp);
   if(f.onKillCd){owner.q=Math.max(0,(owner.q||0)-f.onKillCd);owner.e=Math.max(0,(owner.e||0)-f.onKillCd);}
  }
  return r;
 };
 // ---------- daño que recibes ----------
 A.damage=function(a,d,...rest){
  if(!isP(a)||a.down)return old.damage.call(this,a,d,...rest);
  const f=agg(a);
  if(f.dodge&&!(a.inv>0)&&Math.random()<f.dodge){A.fx('hit',a.x,a.y-10,1.2,.3);return;}
  if(f.second&&a.secondUsed!==A.g.floor&&a.hp>1&&a.hp<=d){a.secondUsed=A.g.floor;d=a.hp-1;a.shield=Math.max(a.shield||0,3);a.inv=Math.max(a.inv||0,1);if(a.pid===A.myPid)A.toast('Segundo aliento: sobrevives por un pelo.');}
  const before=a.hp,r=old.damage.call(this,a,d,...rest);
  if(f.thorns&&a.hp<before){const e=A.enemies.filter(x=>x.hp>0&&dist(a,x)<130).sort((x,y)=>dist(a,x)-dist(a,y))[0];if(e)A.hurt(e,(before-a.hp)*f.thorns,a,{thorns:true,skill:false});}
  return r;
 };
 // ---------- aggro del tanque ----------
 if(API&&API.taunt){const tn=API.taunt;API.taunt=function(e){
  const t=tn.call(this,e);if(t||e.boss||!A.g)return t;
  let nearest=1e9,best=null,bs=0;for(const p of A.players)if(!p.down&&!p.disconnected)nearest=Math.min(nearest,dist(e,p));
  for(const p of A.players){if(p.down||p.disconnected)continue;const th=agg(p).threat||0;if(!th)continue;const d=dist(e,p);if(d<420&&d<nearest+120+150*Math.min(3,th)&&th>bs){bs=th;best=p;}}
  return best;};}
 // ---------- técnica de clase ----------
 if(API&&API.classEffect){const ce=API.classEffect;API.classEffect=function(a,m){
  const f=agg(a),sp=a.skillPower,hp=a.healPower,before=new Set(A.v4.helpers);
  if(f.rpow){a.skillPower=(sp||1)*(1+f.rpow);a.healPower=(hp||1)*(1+f.rpow);}
  try{ce.call(this,a,m);}finally{a.skillPower=sp;a.healPower=hp;}
  const foes=A.enemies.filter(e=>e.hp>0&&dist(a,e)<300),team=A.active().filter(b=>dist(a,b)<320);
  if(f.rStun)for(const e of foes)status(e,'stun',f.rStun);
  if(f.rSlow)for(const e of foes)status(e,'slow',f.rSlow);
  if(f.rBurst){for(const e of foes)A.hurt(e,a.damage*f.rBurst*(sp||1),a,{skill:true,splash:true});if(foes.length)A.fx('discharge',a.x,a.y,3,.5);}
  for(const b of team){if(f.rShield)b.shield=Math.max(b.shield||0,f.rShield);if(f.rHeal)b.hp=Math.min(b.max,b.hp+b.max*f.rHeal*(hp||1));if(f.rHaste)b.haste=Math.max(b.haste||0,f.rHaste);}
  for(const h of A.v4.helpers)if(!before.has(h)&&h.owner===a.pid&&(h.turret||h.echo)){if(f.helperPow&&h.damage!=null)h.damage*=1+f.helperPow;if(f.helperLife)h.life*=1+f.helperLife;}
  if(!a._twice){
   if(f.rcdr)a.rskill=Math.max(0,(a.rskill||0)*(1-Math.min(.6,f.rcdr)));
   if(f.rTwice)later.push({t:.7,fn:()=>{if(a.down||a.disconnected)return;a._twice=true;try{API.classEffect(a,m)}finally{a._twice=false}}});
  }
 };}
 // ---------- fichas de nodo ----------
 const R1=v=>Math.round(v*10)/10;
 function fmt(f,rank){
  return Object.entries(f).map(([k,v])=>{
   if(FLAG[k])return FLAG[k];
   const [n,u,mul]=TXT[k]||[k,'',1],val=R1(v*mul*(rank||1)),neg=u.startsWith('−'),unit=neg?u.slice(1):u;
   return n+': '+(neg?'−':'+')+val+(unit?(unit==='s'||unit==='−s'?' s':' '+unit):'');
  }).join(' · ');
 }
 // ---------- pantalla ----------
 const send=(a,key)=>{if(A.NET.role==='client')A.NET.action('talent',key);else A.talent(a,key);};
 function techOf(a){try{return API.classTech(a)}catch{return null}}
 function open(pid){
  const a=A.localMode==='local'?(A.players.find(p=>p.pid===pid)||A.me()):A.me();if(!a||!A.g||!TREE[a.job])return;
  A.uiMode='mastery';A.keys.clear();if(A.localMode!=='online')A.g.paused=true;
  const J=TREE[a.job],c=C[a.job],pts=points(a),tech=techOf(a),f=agg(a),mon=S[a.id];
  const moves=(A.v8?.speciesMoves?.(a)||mon.moves||[]).slice(0,3).map(m=>esc(m.name)).join(' · ');
  const branch=(b,bi)=>`<div class="mBranch"><h3>${esc(b.name)} <small>${inBranch(a,bi)} pts</small></h3><p class="mBdesc">${esc(b.arch)} · ${esc(b.desc)}</p>${b.tiers.map((tier,ti)=>`<div class="mTier ${tier[0].key?'key':''}"><span class="mReq">${tier[0].key?'Piedra angular':'Escalón '+(ti+1)} · requiere ${T.need(ti+1)} pts en la rama</span><div class="mOpts">${tier.map(n=>{const rank=a.tal?.[n.id]||0,w=why(a,n),cls=rank?'on':w==='bloqueado'?'blocked':w==='req'?'locked':w==='puntos'?'nopts':'ok';
    return `<button class="mNode ${cls}" data-tt="${n.id}" ${w&&!rank||w==='max'?'':''} title="${esc(fmt(n.f,rank||1))}"><b>${esc(n.n)}</b><span class="mPips">${n.max>1?'●'.repeat(rank)+'○'.repeat(n.max-rank):(rank?'●':'○')}</span><small>${esc(fmt(n.f,rank||1))}</small></button>`;}).join('')}</div></div>`).join('')}</div>`;
  A.panel(`<div class="mastery"><span class="eyebrow">MAESTRÍA · PERSONAJE</span><h2>${esc(a.name)} · ${esc(c.name)} <em class="mRole">${esc(J.role)}</em></h2>
   <div class="mTop"><div class="mCard"><b>Personaje</b><img src="assets/items/${c.icon}.png" alt=""><p><strong>${esc(c.name)}</strong> · Nv. ${a.level}</p><p><u>Pasiva:</u> <strong>${esc(J.passive.n)}</strong> — ${esc(J.passive.d)}</p>${tech?`<p><u>Técnica de clase (R):</u> <strong>${esc(tech.name)}</strong> — ${esc(tech.desc)}</p>`:''}</div>
   <div class="mCard"><b>Pokémon vinculado</b><p><strong>${esc(mon.name)}</strong> · Nv. ${a.level}</p><p>Movimientos: ${moves||'—'}</p><p class="mHint">El Pokémon aporta sus movimientos; el personaje aporta rol, pasiva y árbol. Los talentos mejoran a los dos.</p><button id="mDev">Técnicas del Pokémon</button></div>
   <div class="mCard mPts"><b>${pts}</b><span>punto(s) de talento</span><small>1 por nivel. Cada escalón: una opción entre dos, hasta 3 rangos; la piedra angular es de rango 1.</small>${A.localMode==='local'?'<div class="actions">'+A.players.map(p=>`<button data-mp="${p.pid}" class="${p===a?'selected':''}">${esc(p.name)}</button>`).join('')+'</div>':''}</div></div>
   <div class="mTree">${J.branches.map(branch).join('')}</div>
   <div class="actions">${window.ECOS_FREE_RESPEC?'<button id="mReset">Reiniciar talentos (gratis en pruebas)</button>':''}<button id="mClose">Continuar explorando</button></div></div>`);
  document.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{send(a,'tt:'+b.dataset.tt);setTimeout(()=>{if(A.uiMode==='mastery')open(a.pid)},A.NET.role==='client'?320:0);});
  document.querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>open(b.dataset.mp));
  const r=$('mReset');if(r)r.onclick=()=>{send(a,'tt:reset');setTimeout(()=>{if(A.uiMode==='mastery')open(a.pid)},A.NET.role==='client'?320:0);};
  $('mClose').onclick=A.closeUI;const d=$('mDev');if(d)d.onclick=()=>{if(A.v8?.openPaths)A.v8.openPaths(a.pid);};
 }
 // botón en el HUD, tecla T y acceso desde la mochila
 A.hud=function(){
  old.hud();if(!A.g||!A.me())return;
  let b=$('masteryBtn');if(!b){const anchor=$('skills');if(anchor){anchor.insertAdjacentHTML('afterend','<button id="masteryBtn" class="pathPrompt masteryBtn"></button>');b=$('masteryBtn');}}
  if(b){const a=A.me(),n=A.localMode==='local'?A.players.reduce((s,p)=>s+points(p),0):points(a);b.textContent=n?'Maestría · '+n:'Maestría · T';b.classList.toggle('pending',n>0);b.onclick=()=>open();}
 };
 document.addEventListener('click',e=>{const t=e.target.closest?.('[data-open-mastery]');if(t){open(t.dataset.openMastery);}});
 document.addEventListener('keydown',e=>{
  if(e.code!=='KeyT'||e.repeat||A.state!=='play'||!A.g)return;
  const tag=(e.target?.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||tag==='select')return;
  if(A.localMode==='local')return; // T es la tecla de interactuar del jugador 3
  if(A.uiMode==='mastery'){A.closeUI();return;}
  if(!A.uiMode)open();
 });
 A.mastery={open,agg,points,learn,reset,fmt,NODE,TREE};
};
