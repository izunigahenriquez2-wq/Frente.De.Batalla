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
 // Passive telemetry. Never adjusts resources, movement, XP or combat.
 const snapshot=()=>A.players.map(a=>({pid:a.pid,species:a.id,job:a.job,level:a.level,xp:a.earnedXP||0,hp:a.hp,mp:a.mp,cardsPending:a.cards?.n||0,skills:JSON.parse(JSON.stringify(a.skl||{})),talents:Object.keys(a.tal||{}).length,gear:[...a.gear],ultimate:a.ultAudit||null}));
 const audit=()=>A.g&&(A.g.balanceAudit??={version:1,assisted:false,floors:[],kills:{normal:0,alpha:0,minion:0,boss:0},alphaXP:{},consumables:{}});
 const previous={nextFloor:A.nextFloor,hurt:A.hurt,useItem:A.useItem,finish:A.finish};
 const record=reason=>{const m=audit();if(!m)return;const row={floor:m.currentFloor||A.g.floor,time:A.g.time,reason,players:JSON.parse(JSON.stringify(snapshot()))};if(m.floors.length<100)m.floors.push(row);};
 A.nextFloor=function(...args){if(A.g?.floor&&A.g.time>0)record('leaving');const r=previous.nextFloor.apply(this,args);const m=audit();if(m)m.currentFloor=A.g.floor;return r;};
 A.hurt=function(e,...args){const alive=e.hp>0,before=e.alpha?A.players.map(a=>a.earnedXP||0):null,r=previous.hurt.call(this,e,...args);if(alive&&e.hp<=0){const m=audit();if(m){m.kills[e.boss?'boss':e.alpha?'alpha':e.minionOf?'minion':'normal']++;if(before)A.players.forEach((a,i)=>{m.alphaXP[a.pid]=(m.alphaXP[a.pid]||0)+(a.earnedXP||0)-before[i];});}}return r;};
 A.useItem=function(a,key){const n=a.bag?.[key]||0,r=previous.useItem.call(this,a,key);if((a.bag?.[key]||0)<n){const m=audit();if(m)m.consumables[key]=(m.consumables[key]||0)+n-(a.bag[key]||0);}return r;};
 A.finish=function(...args){record('finish');return previous.finish.apply(this,args);};
 const report=()=>({...(audit()||{}),floor:A.g?.floor,difficulty:A.g?.diff,players:snapshot()});
 window.ECOS_EXPORT_BALANCE=()=>{const blob=new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='ecos-balance.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const summary=A.summaryHTML;A.summaryHTML=function(...args){return(summary?.apply(this,args)||'')+(A.NET.role!=='client'?'<button onclick="ECOS_EXPORT_BALANCE()">Exportar datos de equilibrio</button>':'');};
 A.balance14={dmgRamp,bossHp,report};
};

