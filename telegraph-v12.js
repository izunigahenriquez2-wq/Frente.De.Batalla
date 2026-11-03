/* v12 · Legibilidad del combate.
   Los enemigos cuerpo a cuerpo ya no solo te rozan: antes de lanzarse muestran un cono rojo con flechas hacia donde van a golpear
   (el dibujo está en phaser-renderer.js). El avance dura un instante y luego se quedan expuestos. */
window.ECOS_TELEGRAPH12=function(A){
 const old=A.enemyStep,S=window.RPG_SPECIES,dist=A.distance;
 const RANGED_KIND=['water','spark','psychic','ghost','poison','leaf','ice','dragon'],NOT_RANGED=[98,99,129,130,46,47,10,13],NO_LUNGE=[129,130,35,36,39,40,113,120,121,100,101];
 const WIND=.55,DASH=.26,REC=.5;
 const isMelee=e=>{const k=S[e.id]?.kind;return !(RANGED_KIND.includes(k)&&!NOT_RANGED.includes(e.id))};
 A.enemyStep=function(e,dt){
  if(e.hp>0&&!e.boss&&!e.sub&&!(e.sleep>0||e.stun>0)&&!e.rushWindup&&!e.rushTime&&A.NET.role!=='client'){
   const L=e.lunge;
   if(L){
    L.t+=dt;e.anim=(e.anim||0)+dt;
    if(L.p==='wind'){A.face(e,Math.cos(L.a),Math.sin(L.a));e.moving=false;e.warning={cone:true,angle:L.a,spread:.85,r:L.r,dur:WIND,x:e.x,y:e.y};
     if(L.t>=WIND){L.p='dash';L.t=0;e.warning=null;e.shotAnim=.3;}return;}
    if(L.p==='dash'){const sp=L.r/DASH*.85;A.move(e,Math.cos(L.a)*sp*dt,Math.sin(L.a)*sp*dt);e.moving=true;
     if(!L.hit)for(const p of A.active())if(dist(p,e)<p.r+e.r+14){L.hit=true;A.damage(p,e.damage*1.5,e.kind||'hit',e.level);}
     if(L.t>=DASH){L.p='rec';L.t=0;e.moving=false;}return;}
    if(L.p==='rec'){e.moving=false;e.warning=null;if(L.t>=REC)e.lunge=null;return;}
   }
   e.lungeCD=(e.lungeCD??1+Math.random()*3)-dt;
   if(e.lungeCD<=0&&isMelee(e)&&!NO_LUNGE.includes(e.id)){
    const a=window.ECOS_V10?.taunt?.(e)||A.active().sort((x,y)=>dist(x,e)-dist(y,e))[0];
    if(a&&dist(a,e)<230&&dist(a,e)>60&&A.clearLine(e,a)){
     const ang=Math.atan2(a.y-e.y,a.x-e.x);e.lunge={p:'wind',t:0,a:ang,r:Math.min(220,dist(a,e)+70)};e.lungeCD=3.2+Math.random()*2.4;e.warning={cone:true,angle:ang,spread:.85,r:e.lunge.r,dur:WIND,x:e.x,y:e.y};return;
    }else e.lungeCD=.4;
   }
  }
  return old.call(this,e,dt);
 };
};
