// V14 · Biblioteca de patrones de ataque reutilizables: órbita, bumerán, minas, torreta, rastro, vórtice, cadena, rebote, meteoros y temblor.
// Se usan en habilidades, evoluciones "+" de movimientos y definitivas. El daño ocurre en el anfitrión; los efectos visuales se sincronizan por A.fx.
window.ECOS_PATTERNS14=function(A){
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),R=Math.random;
 let list=[],T=0;
 const ORB={fire:'s_orb_orange',water:'s_orb_blue',leaf:'s_orb_green_big',spark:'s_orb_gold',psychic:'s_orb_pink',ghost:'s_orb_shadow',poison:'s_orb_purple',dragon:'s_orb_void',ice:'s_orb_blue',rock:'s_orb_gold',hit:'s_orb_gold',wind:'s_orb_green_big'};
 const BURST={fire:'s_fire_burst',water:'s_water_splash',leaf:'s_ring_leaf',spark:'s_spark_burst',psychic:'s_nova_pink',ghost:'s_orb_night',poison:'s_poison',dragon:'s_star_burst',ice:'s_ice_crystals',rock:'smash',hit:'s_impact_burst',wind:'s_wind_rings'};
 const orbFx=(k,x,y,sz=1,t=.3)=>A.fx(ORB[k]||'s_orb_gold',x,y,sz,t),burstFx=(k,x,y,sz=2,t=.5)=>A.fx(BURST[k]||'smash',x,y,sz,t);
 const foes=()=>A.enemies.filter(e=>e.hp>0);
 const near=(p,r,pred)=>foes().filter(e=>dist(e,p)<r&&(!pred||pred(e)));
 const nearest=(p,r,skip)=>{let b=null,bd=r;for(const e of foes()){if(skip&&skip.has(e))continue;const d=dist(e,p);if(d<bd){bd=d;b=e;}}return b;};
 const status=(e,kind,t)=>{if(e.boss){if(kind==='sleep')return;if(kind==='stun')e.stun=Math.min(.35,t);else e[kind]=Math.max(e[kind]||0,t*.6);return;}e[kind]=Math.max(e[kind]||0,t);};
 const hit=(owner,e,d,extra)=>{if(e.hp>0)A.hurt(e,d,owner,{skill:true,pattern:true,...extra});};
 const area=(owner,p,r,d,k,st)=>{for(const e of near(p,r+e0(),null)){if(dist(e,p)<r+(e.r||0)){hit(owner,e,d);if(st)status(e,st[0],st[1]);}}burstFx(k,p.x,p.y,Math.max(1.6,r/50),.5);};
 const e0=()=>0;
 const aim=(a,target)=>target?Math.atan2(target.y-a.y,target.x-a.x):a.aim??0;
 function add(o){o.age=0;o.id=Math.random();list.push(o);return o;}
 const P={
  // Orbes que giran alrededor del dueño y dañan al contacto.
  orbit(owner,o={}){return add({t:'orbit',owner,n:o.n||3,r:o.r||95,w:o.w||3.4,life:o.life||6,dmg:o.dmg,kind:o.kind||'hit',tick:o.tick||.45,ang:R()*6.28,hits:new Map(),vis:0});},
  // Proyectil que va, da la vuelta y regresa.
  boomerang(owner,o={}){const an=o.angle??owner.aim??0;return add({t:'boomerang',owner,x:owner.x,y:owner.y,an,range:o.range||380,speed:o.speed||560,dmg:o.dmg,kind:o.kind||'hit',phase:0,trav:0,hits:new Set(),life:4,vis:0,size:o.size||1});},
  // Minas que se arman y estallan al acercarse un enemigo.
  mines(owner,o={}){const c=o.at||owner,n=o.n||3;for(let i=0;i<n;i++){const a=R()*6.28,d=40+R()*(o.spread||130);add({t:'mine',owner,x:c.x+Math.cos(a)*d,y:c.y+Math.sin(a)*d,dmg:o.dmg,r:o.r||110,arm:o.arm||.7,life:o.life||14,kind:o.kind||'fire',vis:0});}A.fx('star',c.x,c.y,1.4,.3);},
  // Torreta estacionaria que dispara al enemigo más cercano.
  turret(owner,o={}){const mine=list.filter(x=>x.t==='turret'&&x.owner===owner);if(mine.length>=(o.max||3))mine[0].life=0;const c=o.at||owner;return add({t:'turret',owner,x:c.x,y:c.y,life:o.life||9,rate:o.rate||.7,range:o.range||430,dmg:o.dmg,kind:o.kind||'spark',cd:.3,vis:0});},
  // Rastro: deja charcos dañinos por donde pasas durante `life` segundos.
  trail(owner,o={}){return add({t:'trail',owner,life:o.life||3,dmg:o.dmg,kind:o.kind||'fire',w:o.w||48,lx:owner.x,ly:owner.y,acc:0});},
  // Vórtice que atrae y daña.
  vortex(owner,o={}){const c=o.at||owner;return add({t:'vortex',owner,x:c.x,y:c.y,r:o.r||240,life:o.life||3.2,pull:o.pull||260,dmg:o.dmg,kind:o.kind||'psychic',tick:0,vis:0});},
  // Cadena de impactos que salta entre enemigos.
  chain(owner,o={}){const first=o.from||nearest(owner,o.reach||420);if(!first)return null;return add({t:'chain',owner,cur:first,from:{x:owner.x,y:owner.y},left:o.hops||5,range:o.range||210,dmg:o.dmg,fall:o.fall||.86,kind:o.kind||'spark',wait:0,seen:new Set(),bounce:false});},
  // Rebote: igual que la cadena pero con una bola que rebota (visual distinta, más saltos y menos daño perdido).
  bounce(owner,o={}){const first=o.from||nearest(owner,o.reach||480);if(!first)return null;return add({t:'chain',owner,cur:first,from:{x:owner.x,y:owner.y},left:o.bounces||5,range:o.range||260,dmg:o.dmg,fall:o.fall||.93,kind:o.kind||'hit',wait:0,seen:new Set(),bounce:true,gap:.14});},
  // Meteoros que caen en una zona con aviso previo.
  meteors(owner,o={}){const c=o.at||owner,n=o.n||8;for(let i=0;i<n;i++){const a=R()*6.28,d=R()*(o.spread||230);add({t:'meteor',owner,x:c.x+Math.cos(a)*d,y:c.y+Math.sin(a)*d,delay:(o.delay||.9)+i*(o.interval||.17),dmg:o.dmg,r:o.r||95,kind:o.kind||'fire',warn:false,life:99});}},
  // Temblor: ondas de choque concéntricas.
  quake(owner,o={}){const c=o.at||owner;return add({t:'quake',owner,x:c.x,y:c.y,rings:o.rings||3,r0:o.r0||120,dr:o.dr||90,dmg:o.dmg,stun:o.stun??.6,kind:o.kind||'rock',n:0,wait:0,life:99});},
  power:(a,mult)=>(a.damage||20)*mult*(a.skillPower||1),
  clear(){list=[];},active:()=>list,
  burst:burstFx,orbFx
 };
 const U={ // actualización por tipo (dt en s)
  orbit(e,dt){const o=e.owner;if(o.down||o.hp<=0){e.life=0;return;}e.ang+=e.w*dt;e.vis-=dt;
   for(let i=0;i<e.n;i++){const a=e.ang+i*6.2832/e.n,p={x:o.x+Math.cos(a)*e.r,y:o.y+Math.sin(a)*e.r};
    if(e.vis<=0)orbFx(e.kind,p.x,p.y,.9,.22);
    for(const f of foes())if(dist(f,p)<34+(f.r||0)&&(e.hits.get(f.eid)||0)<=T){e.hits.set(f.eid,T+e.tick);hit(o,f,e.dmg);}}
   if(e.vis<=0)e.vis=.1;},
  boomerang(e,dt){const o=e.owner;e.life-=dt;e.vis-=dt;let tx,ty;
   if(e.phase===0){e.x+=Math.cos(e.an)*e.speed*dt;e.y+=Math.sin(e.an)*e.speed*dt;e.trav+=e.speed*dt;if(e.trav>=e.range||!A.tileAt(e.x,e.y)){e.phase=1;e.hits.clear();}}
   else{const a=Math.atan2(o.y-e.y,o.x-e.x);e.x+=Math.cos(a)*e.speed*1.1*dt;e.y+=Math.sin(a)*e.speed*1.1*dt;if(dist(e,o)<30)e.life=0;}
   if(e.vis<=0){orbFx(e.kind,e.x,e.y,1.1*e.size,.2);e.vis=.06;}
   for(const f of foes())if(dist(f,e)<36+(f.r||0)&&!e.hits.has(f.eid)){e.hits.add(f.eid);hit(o,f,e.dmg);}},
  mine(e,dt){e.life-=dt;e.vis-=dt;if(e.vis<=0){A.fx(e.age>e.arm?'s_orb_orange':'s_alert',e.x,e.y,.8,.4);e.vis=.5;}
   if(e.age>e.arm&&near(e,70).length){area(e.owner,e,e.r,e.dmg,e.kind);e.life=0;}},
  turret(e,dt){e.life-=dt;e.cd-=dt;e.vis-=dt;if(e.vis<=0){A.fx('s_orb_blue',e.x,e.y,1,.5);e.vis=.45;}
   if(e.cd<=0){const t=nearest(e,e.range);if(t){e.cd=e.rate;A.fire({pid:e.owner.pid,level:e.owner.level,x:e.x,y:e.y,r:1},Math.atan2(t.y-e.y,t.x-e.x),470,e.dmg,e.kind,e.x,e.y,{});}}},
  trail(e,dt){const o=e.owner;e.life-=dt;if(dist(o,{x:e.lx,y:e.ly})>26){e.lx=o.x;e.ly=o.y;add({t:'puddle',owner:o,x:o.x,y:o.y,r:e.w,dmg:e.dmg,kind:e.kind,life:2.4,tick:0,vis:0});}},
  puddle(e,dt){e.life-=dt;e.tick-=dt;e.vis-=dt;if(e.vis<=0){burstFx(e.kind,e.x,e.y,.9,.4);e.vis=.4;}
   if(e.tick<=0){e.tick=.35;for(const f of near(e,e.r+10))hit(e.owner,f,e.dmg);}},
  vortex(e,dt){e.life-=dt;e.tick-=dt;e.vis-=dt;if(e.vis<=0){A.fx('s_vortex_magenta',e.x,e.y,e.r/70,.5);e.vis=.35;}
   for(const f of near(e,e.r)){const a=Math.atan2(e.y-f.y,e.x-f.x),k=(f.boss?.35:1)*e.pull*dt;if(dist(f,e)>16){const nx=f.x+Math.cos(a)*k,ny=f.y+Math.sin(a)*k;if(A.tileAt(nx,ny)){f.x=nx;f.y=ny;}}}
   if(e.tick<=0){e.tick=.45;for(const f of near(e,e.r*.8))hit(e.owner,f,e.dmg);}},
  chain(e,dt){e.wait-=dt;if(e.wait>0)return;const t=e.cur;if(!t||t.hp<=0&&!e.seen.size&&false){e.life=0;return;}
   A.effects.push({line:true,kind:e.kind,x:e.from.x,y:e.from.y,ex:t.x,ey:t.y,life:.28,total:.28,size:e.bounce?.6:1});orbFx(e.kind,t.x,t.y,1.1,.25);hit(e.owner,t,e.dmg);e.seen.add(t);e.dmg*=e.fall;e.left--;
   e.from={x:t.x,y:t.y};const nx=nearest(t,e.range,e.seen);if(e.left<=0||!nx){e.life=0;return;}e.cur=nx;e.wait=e.gap||.09;},
  meteor(e,dt){e.delay-=dt;if(!e.warn){e.warn=true;A.fx('s_alert',e.x,e.y,e.r/45,Math.max(.3,e.delay));}
   if(e.delay<=0){area(e.owner,e,e.r,e.dmg,e.kind);A.fx('smash',e.x,e.y,e.r/40,.45);e.life=0;}},
  quake(e,dt){e.wait-=dt;if(e.wait>0)return;const r=e.r0+e.n*e.dr,p=r-e.dr;
   for(const f of foes()){const d=dist(f,e);if(d<=r+(f.r||0)&&d>=p-(f.r||0)){hit(e.owner,f,e.dmg*(1-e.n*.12));if(e.stun)status(f,'stun',e.stun);}}
   A.fx('smash',e.x,e.y,r/45,.45);A.fx('s_ring_white',e.x,e.y,r/38,.4);e.n++;e.wait=.22;if(e.n>=e.rings)e.life=0;}
 };
 const oldStep=A.step,oldNext=A.nextFloor;
 A.step=function(dt,...r){const out=oldStep.call(this,dt,...r);
  if(!A.g||A.state!=='play'||A.g.paused||A.NET.role==='client')return out;T+=dt;
  for(const e of list.slice()){e.age+=dt;try{U[e.t](e,dt);}catch(err){console.error(err);e.life=0;}if(e.life!==undefined&&e.life<=0&&e.t!=='meteor'&&e.t!=='chain'&&e.t!=='quake'&&e.t!=='trail'){}}
  list=list.filter(e=>e.life>0);return out;};
 A.nextFloor=function(...r){list=[];return oldNext.apply(this,r);};
 A.pat=P;
};
