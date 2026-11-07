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
 A.bossmech13={spawnWP,breakAll};
};
