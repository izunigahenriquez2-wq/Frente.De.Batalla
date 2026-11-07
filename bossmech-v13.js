// V13 · Mecánicas de jefe: puntos débiles que aturden + interrupción de huida/sueño (Cuerno Estruendo).
window.ECOS_BOSSMECH13=function(A){
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const THR=[.8,.6,.4,.2],OK=['approach','windup','act','recover'];
 const old={hurt:A.hurt,step:A.step,cleanActor:A.cleanActor};
 const orbit=(e,p)=>p.a+A.clock*.55;
 const pos=(e,p)=>{const R=e.r*1.25+26,t=orbit(e,p);return{x:e.x+Math.cos(t)*R,y:e.y+Math.sin(t)*R};};
 function spawnWP(e,i){const n=i>=2?3:2;e.wp=[];for(let k=0;k<n;k++)e.wp.push({a:k*Math.PI*2/n,h:Math.round(e.max*.035),m:Math.round(e.max*.035)});e.wpStage=i+1;
  A.toast('¡'+e.name+' deja ver sus puntos débiles! Golpéalos desde su lado.');A.fx('star',e.x,e.y,3,.5);}
 function breakAll(e){e.wp=null;e.bossState='stagger';e.stateTime=3.8;e.warning=null;e.z=0;e.pose=null;e.sched=[];e.vulnT=A.clock+3.8;A.fx('smash',e.x,e.y,3.4,.5);A.toast('¡Puntos débiles rotos! '+e.name+' queda aturdido.');}
 A.hurt=function(e,d,owner,proj){
  if(e&&e.boss&&e.hp>0&&!e.invuln){
   const who=owner||proj?.owner;
   if(e.wp?.length&&who){
    const ang=Math.atan2(who.y-e.y,who.x-e.x);let best=null,bd=.8;
    for(const p of e.wp){let df=Math.abs(((orbit(e,p)-ang)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);if(df<bd){bd=df;best=p;}}
    if(best){best.h-=Math.max(1,d*.9);A.fx('hit',pos(e,best).x,pos(e,best).y,1.4,.25);
     if(best.h<=0){e.wp=e.wp.filter(p=>p!==best);A.fx('star',pos(e,best).x,pos(e,best).y,2,.4);if(!e.wp.length)breakAll(e);}
     d*=.35;}
    else d*=.6;
   }
   if(e.vulnT>A.clock)d*=1.35;
  }
  return old.hurt.call(this,e,d,owner,proj);
 };
 A.step=function(dt,...r){
  const out=old.step.call(this,dt,...r);
  if(A.NET.role==='client')return out;
  for(const e of A.enemies||[]){if(!e.boss||e.hp<=0)continue;
   if(e.wp&&(!OK.includes(e.bossState)&&e.bossState!=='stagger'))e.wp=null;
   const i=e.wpStage||0;
   if(i<4&&e.hp<=e.max*THR[i]&&OK.includes(e.bossState)&&!e.wp)spawnWP(e,i);}
  return out;
 };
 // Interrupción
 function reward(a,e){const lvl=e.level||1;A.gainXP?.(a,Math.round(60+lvl*6));a.coins+=Math.round(40+lvl*3);}
 A.noiseBlast=function(a,r){
  const list=(A.enemies||[]).filter(e=>e.boss&&e.hp>0&&(e.bossState==='flee'||e.bossState==='sleep')&&dist(a,e)<r);
  if(!list.length)return false;
  for(const e of list){const hp=e.hp,was=e.bossState;
   A.boss11?.beginRoar?.(e);e.hp=Math.min(hp,e.hp);if(e.hp<hp)e.hp=hp;
   e.bossState='stagger';e.stateTime=4.5;e.invuln=false;e.pose=null;e.sleepDmg=0;e.vulnT=A.clock+4.5;e.wp=null;
   A.fx('s_ring_white',e.x,e.y,3.4,.6);A.fx('smash',e.x,e.y,2.6,.4);reward(a,e);
   A.toast('¡'+(was==='sleep'?'Interrumpiste el descanso de ':'Cortaste la huida de ')+e.name+'! No se recupera y queda aturdido.');}
  return true;};
 A.cleanActor=function(a){const o=old.cleanActor.call(this,a);if(a.boss){o.wp=a.wp?a.wp.map(p=>({a:p.a,h:p.h,m:p.m})):null;if(a.vulnT)o.vulnT=a.vulnT;}return o;};
 const prev=window.ECOS_BOSS11_DRAW;
 window.ECOS_BOSS11_DRAW=function(api){prev?.(api);const{obj,onScreen}=api;
  for(const e of A.enemies||[]){if(!e.wp?.length||!onScreen(e))continue;e.wp.forEach((p,i)=>{const q=pos(e,p);obj('Evolution','wp-'+(e.eid||e.id)+'-'+i,q.x,q.y,.5+.5*Math.max(0,p.h/p.m));});}};

 // ---- Mecánicas propias de jefe ----
 const T=48,ONIX=[95],COLD=[131,1144],FLIP=[487,1487];
 const kind=e=>{const i=e.baseId||e.id;return ONIX.includes(i)?'onix':COLD.includes(i)?'cold':FLIP.includes(i)?'flip':null;};
 const live=e=>e.boss&&e.hp>0&&!['intro','flee','sleep','roar'].includes(e.bossState);
 const players=()=>A.active?A.active():A.players.filter(p=>p.hp>0&&!p.down);
 function pickCells(e,n){const g=A.g,res=[],tx=Math.floor(e.x/T),ty=Math.floor(e.y/T);
  for(const [ox,oy] of [[-4,-3],[4,-3],[-4,3],[4,3],[0,-5],[0,5]]){if(res.length>=n)break;
   let found=false;for(let r=0;r<3&&!found&&res.length<n;r++){let ok=false;for(let dy=-r;dy<=r&&!ok;dy++)for(let dx=-r;dx<=r&&!ok;dx++){const x=tx+ox+dx,y=ty+oy+dy;if(x<2||y<2||x>=g.mw-2||y>=g.mh-2)continue;const k=A.tileIndex(x,y);
     if(g.map[k]===0&&!res.some(q=>q.k===k)&&Math.hypot(x*T+24-e.x,y*T+24-e.y)>110&&!players().some(p=>Math.hypot(p.x-(x*T+24),p.y-(y*T+24))<80)){res.push({k,x:x*T+24,y:y*T+24,u:3});ok=true;found=true;}}}}
  return res;}
 function clear(e){if(e.pil){for(const q of e.pil)if(A.g&&A.g.map[q.k]===1&&q.own)A.g.map[q.k]=0;e.pil=null;}e.brz=null;if(e.flipOn){e.flipOn=false;}}
 function mech(e,dt){
  const k=kind(e);if(!k)return;
  if(!live(e)){if(e.bossState==='intro')return;if(k!=='cold'&&e.hp>0&&['flee','sleep','roar'].includes(e.bossState)){e.flipOn=false;}return;}
  e.mt=(e.mt||0)+dt;
  if(k==='onix'){
   if(!e.pil){e.pil=pickCells(e,4);for(const q of e.pil){A.g.map[q.k]=1;q.own=true;}A.toast('¡El suelo se agrieta! Mantente junto a los pilares cuando tiemble.');}
   const cyc=e.mt%9;
   if(cyc<dt+.001&&e.mt>2)e.quakeW=2;
   if(e.quakeW>0){e.quakeW-=dt;if(!e.qfx||e.qfx<A.clock){e.qfx=A.clock+.45;A.fx('smash',e.x,e.y,3,.3);}
    if(e.quakeW<=0){A.fx('smash',e.x,e.y,4,.5);for(const p of players()){const near=e.pil.find(q=>Math.hypot(p.x-q.x,p.y-q.y)<190&&q.u>0);if(near){near.u--;A.fx('s_ring_white',near.x,near.y,2,.3);if(near.u<=0){A.g.map[near.k]=0;near.own=false;near.x=-9999;A.toast('Un pilar se derrumba.');}}else A.damage(p,Math.round(p.max*.14),'ground',e.level);}
     if(!e.pil.some(q=>q.u>0)){e.pil=pickCells(e,3);for(const q of e.pil){A.g.map[q.k]=1;q.own=true;}A.toast('Surgen nuevos pilares.');}}}
  }
  if(k==='cold'){
   if(!e.brz){const cs=pickCells({x:e.x,y:e.y,r:e.r},3);e.brz=cs.map(c=>({x:c.x,y:c.y}));A.toast('Hace frío… los braseros te mantienen a salvo de la ventisca.');}
   const cyc=e.mt%16;e.blizz=cyc>9;
   if(e.blizz){for(const p of players()){const warm=e.brz.some(b=>Math.hypot(p.x-b.x,p.y-b.y)<170);
     if(!warm){p.slow=Math.max(p.slow||0,.5);p.chill=(p.chill||0)+dt;if(p.chill>=1){p.chill=0;A.damage(p,Math.round(p.max*.03),'ice',e.level);A.fx('s_ice_crystals',p.x,p.y,1.4,.3);}}}}
   else if(cyc<.1&&e.mt>1)A.toast('¡Se acerca la ventisca! Busca un brasero.');
  }
  if(k==='flip'){
   const cyc=e.mt%16,on=cyc>8&&cyc<15.5;
   if(on!==!!e.flipOn){e.flipOn=on;A.toast(on?'¡Dimensión inversa! Los controles y el mapa se invierten.':'La realidad vuelve a su sitio.');A.fx('psychic',e.x,e.y,4,.6);}
  }
 }
 const oldStep2=A.step;
 A.step=function(dt,...r){const out=oldStep2.call(this,dt,...r);
  if(A.NET.role!=='client'){for(const e of A.enemies||[])if(e.boss)mech(e,dt);
   if(A.g?.boosted!==undefined){}
   for(const e of A.enemies||[])if(e.boss&&e.hp<=0&&(e.pil||e.brz||e.flipOn))clear(e);
   if(A.state!=='play')for(const e of A.enemies||[])if(e.pil)clear(e);}
  const fl=(A.enemies||[]).some(e=>e.flipOn&&e.hp>0);
  const cv=document.querySelector('canvas');if(cv&&cv.__flip!==fl){cv.__flip=fl;cv.style.transition='transform .6s';cv.style.transform=fl?'rotate(180deg)':'';}
  return out;};
 const oldPS=A.playerStep;
 A.playerStep=function(a,mask,dt){
  if((A.enemies||[]).some(e=>e.flipOn&&e.hp>0)){const B=A.B||{UP:1,DOWN:2,LEFT:4,RIGHT:8};let m=mask&~15;
   if(mask&1)m|=2;if(mask&2)m|=1;if(mask&4)m|=8;if(mask&8)m|=4;mask=m;}
  return oldPS.call(this,a,mask,dt);};
 const oc=A.cleanActor;
 A.cleanActor=function(a){const o=oc.call(this,a);if(a.boss){if(a.pil)o.pil=a.pil.map(q=>({x:q.x,y:q.y,u:q.u}));if(a.brz)o.brz=a.brz;o.flipOn=!!a.flipOn;o.blizz=!!a.blizz;o.quakeW=a.quakeW||0;}return o;};
 const prev2=window.ECOS_BOSS11_DRAW;
 window.ECOS_BOSS11_DRAW=function(api){prev2?.(api);const{obj,onScreen}=api;
  for(const e of A.enemies||[]){if(e.hp<=0)continue;
   e.pil?.forEach((q,i)=>{if(q.u>0&&onScreen(q))obj('Block_Vault','pil-'+(e.eid||e.id)+'-'+i,q.x,q.y,2);});
   e.brz?.forEach((b,i)=>{if(onScreen(b))obj('Campfire.Flip','brz-'+(e.eid||e.id)+'-'+i,b.x,b.y,1.6);});}};
 A.bossmech13={spawnWP,breakAll};
};
