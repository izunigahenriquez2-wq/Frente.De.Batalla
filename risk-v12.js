'use strict';
/* v12 · Riesgo y recompensa: dificultad, modificadores de piso opcionales y altar de maldiciones. */
window.ECOS_RISK12=function(A){
 const dist=A.distance,esc=A.escape,$=id=>document.getElementById(id),API=window.ECOS_V10;
 const DIFFS={relax:{n:'Relajado',hp:.8,dmg:.8,rew:.9,d:'Enemigos más blandos. Ideal para probar builds.'},normal:{n:'Normal',hp:1,dmg:1,rew:1,d:'La experiencia pensada.'},hard:{n:'Difícil',hp:1.3,dmg:1.25,rew:1.3,d:'Enemigos más duros; +30% de botín y experiencia.'},night:{n:'Pesadilla',hp:1.7,dmg:1.5,rew:1.7,d:'Para expertos; +70% de botín y experiencia.'}};
 const MODS={swift:{n:'Enemigos rápidos',d:'Se mueven un 25% más rápido.',rew:1.5,speed:1.25},armored:{n:'Enemigos acorazados',d:'+50% de vida.',rew:1.5,hp:1.5},brutal:{n:'Golpes brutales',d:'Recibes +30% de daño.',rew:1.4,dmg:1.3},horde:{n:'Horda',d:'Aparecen un 40% más de enemigos.',rew:1.6}};
 const CURSES={blood:{n:'Pacto de sangre',d:'−15% PS máx. · +18% daño',f:{hp:-.15,dmg:.18}},glass:{n:'Cristal',d:'+20% daño recibido · +10% crítico · +8% daño',f:{taken:.2,crit:.1,dmg:.08}},greed:{n:'Codicia',d:'+40% oro · +15% experiencia · enemigos +10% de vida',f:{gold:.4,xp:.15,foeHp:.1}},silence:{n:'Silencio',d:'−20% PM máx. · −12% recarga · +10% daño',f:{mp:-.2,cdr:.12,dmg:.1}}};
 const KEY='ecosDiff';let sel='normal';try{const v=localStorage.getItem(KEY);if(DIFFS[v])sel=v;}catch{}
 const old={enemy:A.enemy,damage:A.damage,stats:A.stats,gainXP:A.gainXP,award:A.award,generateFloor:A.generateFloor,interact:A.interact,hud:A.hud,requestAction:A.requestAction,netAction:A.NET.callbacks.action,packWorld:A.packWorld,packState:A.packState,applyWorld:A.applyWorld,applyState:A.applyState,cleanActor:A.cleanActor,makePlayer:A.makePlayer};
 const diffId=()=>A.g?.diff||sel,D=()=>DIFFS[diffId()]||DIFFS.normal,fm=()=>A.g?.floorMod?MODS[A.g.floorMod]:null;
 const cf=a=>{const f={};for(const id of a?.curses||[])for(const [k,v] of Object.entries(CURSES[id]?.f||{}))f[k]=(f[k]||0)+v;return f;};
 const isP=a=>!!a&&A.players.includes(a);
 // ---------- selector de dificultad ----------
 function picker(){return `<div class="diffPick"><b>Dificultad</b><div class="diffBtns">${Object.entries(DIFFS).map(([k,v])=>`<button data-diff="${k}" class="${k===sel?'selected':''}" title="${esc(v.d)}">${v.n}</button>`).join('')}</div><small id="diffDesc">${esc(DIFFS[sel].d)}</small></div>`;}
 function wire(){document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{sel=b.dataset.diff;try{localStorage.setItem(KEY,sel)}catch{}document.querySelectorAll('[data-diff]').forEach(x=>x.classList.toggle('selected',x===b));const t=$('diffDesc');if(t)t.textContent=DIFFS[sel].d;});}
 function inject(){if(A.NET.role==='client'||document.querySelector('.diffPick'))return;
  const t=$('selectionReady')?.parentElement||document.querySelector('.lobbyToolbar')||$('localPlayersCount')?.parentElement;
  if(!t)return;const lobby=t.classList?.contains('lobbyToolbar');t.insertAdjacentHTML(lobby?'afterend':'beforebegin',picker());wire();}
 const ov=$('overlay');if(ov)new MutationObserver(inject).observe(ov,{childList:true,subtree:true});
 // ---------- aplicación ----------
 A.enemy=function(...args){const e=old.enemy(...args),d=D(),m=fm(),c=A.g?.curseFoe||0;let h=d.hp*(1+c)*(m?.hp||1);if(h!==1){e.hp*=h;e.max*=h;if(e.bar!=null)e.bar*=h;}if(m?.speed&&e.baseSpeed)e.baseSpeed*=m.speed;return e;};
 A.damage=function(a,d,...r){if(A.g&&isP(a)){d*=D().dmg*(fm()?.dmg||1)*(1+(cf(a).taken||0));}return old.damage.call(this,a,d,...r);};
 A.stats=function(a){const ratio=a.max?a.hp/a.max:1;old.stats(a);const f=cf(a);if(!Object.keys(f).length)return;
  if(f.hp){a.max=Math.round(a.max*(1+f.hp));a.hp=Math.min(a.max,Math.max(1,a.max*ratio));}
  if(f.mp){a.maxMp=Math.round(a.maxMp*(1+f.mp));a.mp=Math.min(a.mp??a.maxMp,a.maxMp);}
  if(f.dmg)a.damage*=1+f.dmg;if(f.crit)a.crit=Math.min(.65,(a.crit||0)+f.crit);if(f.cdr)a.cdr=Math.min(.45,(a.cdr||0)+f.cdr);};
 const rewardMul=()=>D().rew*(fm()?.rew||1);
 A.gainXP=function(a,x,...r){const f=cf(a);return old.gainXP.call(this,a,A.g?x*rewardMul()*(1+(f.xp||0)):x,...r);};
 A.award=function(n,...r){let f=0;for(const a of A.players||[])f=Math.max(f,cf(a).gold||0);return old.award.call(this,A.g?Math.round(n*rewardMul()*(1+f)):n,...r);};
 A.makePlayer=function(...x){const a=old.makePlayer(...x);a.curses=[];return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.curses?.length)o.curses=a.curses;return o;};
 // ---------- altar ----------
 A.generateFloor=function(){old.generateFloor();const g=A.g;g.floorMod=null;g.altar=null;if(A.bossFloor()||g.floor<3||g.floor%3)return;
  const rng=A.seeded(g.seed+g.floor*1337),sv=g.skyVisit,pts=g.spawnPoints.filter(p=>dist(p,g.spawn)>200&&dist(p,g.stairs)>120&&(!sv||dist(p,sv)>160));if(!pts.length)return;
  const p=pts[Math.floor(rng()*pts.length)],ids=Object.keys(MODS).sort(()=>rng()-.5).slice(0,2),cs=Object.keys(CURSES);g.altar={x:p.x,y:p.y,id:'altar-'+g.floor,mods:ids,curse:cs[Math.floor(rng()*cs.length)],used:false};};
 const altar=()=>A.g?.altar;
 const near=a=>{const t=altar();return t&&!t.used&&a&&!a.down&&!a.disconnected&&dist(a,t)<115&&A.clearLine(a,t);};
 function resolve(a,key){if(!A.g||A.g.ended||(A.localMode==='online'&&A.g.paused)||!near(a))return false;const t=altar(),[id,ch,arg]=String(key).split('|');if(id!==t.id)return false;
  if(ch==='mod'){if(!t.mods.includes(arg)||A.g.floorMod)return false;const m=MODS[arg];A.g.floorMod=arg;
   for(const e of A.enemies)if(e.hp>0&&!e.boss){if(m.hp){e.hp*=m.hp;e.max*=m.hp;if(e.bar!=null)e.bar*=m.hp;}if(m.speed&&e.baseSpeed)e.baseSpeed*=m.speed;}
   if(arg==='horde'){const live=A.enemies.filter(e=>e.hp>0&&!e.boss&&!e.sub),pts=A.g.spawnPoints.filter(p=>dist(p,a)>260);for(let i=0;i<Math.ceil(live.length*.4)&&pts.length;i++){const s=live[i%live.length],p=pts[Math.floor(Math.random()*pts.length)];A.enemies.push(A.enemy(s.id,p.x,p.y));}}
   A.toast('Piso modificado: '+m.n+' · botín ×'+m.rew);}
  else if(ch==='curse'){const c=CURSES[t.curse];if((a.curses||[]).length>=3||(a.curses||[]).includes(t.curse))return false;(a.curses??=[]).push(t.curse);a._tver=(a._tver||0)+1;a.points=(a.points||0)+1;
   if(c.f.foeHp){A.g.curseFoe=(A.g.curseFoe||0)+c.f.foeHp;for(const e of A.enemies)if(e.hp>0){e.hp*=1+c.f.foeHp;e.max*=1+c.f.foeHp;}}
   A.stats(a);A.toast(a.name+' aceptó '+c.n+' · +1 punto de talento.');}
  else if(ch!=='leave')return false;
  t.used=true;return true;}
 function open(){const a=A.me(),t=altar();if(!near(a))return;A.keys.clear();A.uiMode='altar';if(A.localMode!=='online')A.g.paused=true;
  const c=CURSES[t.curse],has=(a.curses||[]).includes(t.curse)||(a.curses||[]).length>=3;
  A.panel(`<div class="pathBook"><span class="eyebrow">ALTAR DE RIESGO</span><h2>Un trato oscuro</h2><p>Una piedra antigua susurra ofertas. Solo puedes aceptar una, y no hay vuelta atrás.</p><div class="eventChoices">${t.mods.map(k=>`<button data-alt="mod|${k}" ${A.g.floorMod?'disabled':''}>${MODS[k].n}<br>${MODS[k].d}<br><b>Botín y experiencia ×${MODS[k].rew} este piso</b></button>`).join('')}<button data-alt="curse|${t.curse}" ${has?'disabled':''}>Maldición: ${c.n}<br>${c.d}<br><b>+1 punto de talento · dura toda la expedición</b></button></div><p class="mHint">Maldiciones actuales: ${(a.curses||[]).map(k=>CURSES[k].n).join(', ')||'ninguna'} (máx. 3).</p><button id="altBack">Dejar el altar</button></div>`);
  document.querySelectorAll('[data-alt]').forEach(b=>b.onclick=()=>{A.requestAction('riskaltar',t.id+'|'+b.dataset.alt);A.closeUI();});$('altBack').onclick=A.closeUI;}
 A.interact=function(a,...args){if(near(a)){if(a.pid===A.myPid&&!A.uiMode)open();return;}return old.interact(a,...args);};
 A.requestAction=function(type,key){if(type==='riskaltar'){if(A.NET.role==='client')A.NET.action(type,key);else resolve(A.me(),key);return;}old.requestAction(type,key);};
 A.NET.callbacks.action=(pid,type,key)=>type==='riskaltar'?resolve(A.players.find(a=>a.pid===pid),key):old.netAction?.(pid,type,key);
 // ---------- red ----------
 const extra=()=>({diff:A.g?.diff,altar:A.g?.altar,floorMod:A.g?.floorMod,curseFoe:A.g?.curseFoe});
 A.packWorld=()=>({...old.packWorld(),...extra()});A.packState=()=>({...old.packState(),...extra()});
 const take=o=>{if(A.g&&o){A.g.diff=o.diff;A.g.altar=o.altar;A.g.floorMod=o.floorMod;A.g.curseFoe=o.curseFoe;}};
 A.applyWorld=function(w){old.applyWorld(w);take(w);};
 A.applyState=function(s){const ok=A.g&&s.runId===A.g.runId&&s.floor===A.g.floor;old.applyState(s);if(ok)take(s);};
 const beginDiff=A.begin;A.begin=function(...x){const r=beginDiff.apply(this,x);if(A.g&&A.NET.role!=='client')A.g.diff=sel;return r;};
 // ---------- indicador ----------
 A.hud=function(){old.hud();if(!A.g)return;let b=$('riskBadge');if(!b){document.body.insertAdjacentHTML('beforeend','<div id="riskBadge"></div>');b=$('riskBadge');}
  const m=fm(),cs=(A.me()?.curses||[]).map(k=>CURSES[k].n);b.innerHTML=`${diffId()==='normal'?'':'<span>'+esc(D().n)+'</span>'}${m?`<span class="m">${esc(m.n)} ×${m.rew}</span>`:''}${cs.map(c=>`<span class="c">☠ ${esc(c)}</span>`).join('')}`;b.hidden=false;};
 A.risk={altar,DIFFS,MODS,CURSES,resolve,open,diff:diffId};
};
