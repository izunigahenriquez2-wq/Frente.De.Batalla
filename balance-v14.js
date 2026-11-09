// V14 · Ajustes de equilibrio medidos con simulaciones completas (tools/simbot.py):
// - rampa de daño enemigo en los primeros pisos (los frágiles morían en el 2-6),
// - vida de jefes que crece con el piso (a partir del 60 caían en ~15 s) y primer jefe más suave.
window.ECOS_BALANCE14=function(A){
 'use strict';
 const dmgRamp=f=>f>=12?1:.55+.45*(f-1)/11;
 const bossHp=f=>f<=10?.6:f<=15?.85:f<20?1:1+(f-20)*.022;
 function tune(e){
  if(e.bal||e.decoy||e.owner!=null||e.ally||e.friendly)return;e.bal=true;
  const f=A.g?.floor||1;
  if(e.boss){const m=bossHp(f);e.hp*=m;e.max=e.hp;e.bar=e.hp;if(f<=10)e.damage*=.75;}
  else if(!e.alpha&&f<12)e.damage*=dmgRamp(f);
 }
 const old={step:A.step};
 A.step=function(dt){const r=old.step.call(this,dt);if(A.NET.role!=='client'&&A.g)for(const e of A.enemies)if(!e.bal)tune(e);return r;};
 A.balance14={dmgRamp,bossHp};
};
