// V14 · Alfas: el «Pokémon de piso». Más grande, con aura, más vida y ataque, rugido, refuerzos y botín propio.
window.ECOS_ALPHA14=function(A){
 'use strict';
 const dist=A.distance,S=RPG_SPECIES;
 const COL={fire:'#ff7a3a',water:'#4aa8ff',leaf:'#6fdc6a',spark:'#ffe14a',psychic:'#e070ff',ghost:'#9a7cff',poison:'#b45cd6',ice:'#8fe8ff',rock:'#c4a46a',dragon:'#6a7bff',hit:'#ffd877',wave:'#9fe0ff',star:'#ffd877'};
 const old={nextFloor:A.nextFloor,hurt:A.hurt,step:A.step,cleanActor:A.cleanActor};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.alpha){o.alpha=true;o.scale=a.scale;o.alphaName=a.alphaName;}return o;};
 const ok=g=>g&&!A.bossFloor()&&!(g.secret&&g.secret.state&&g.secret.state!=='hidden')&&!['rest','shop'].includes(g.v13?.kind);
 // ---------- aparición ----------
 function spawn(g){
  const bio=[...(window.RPG_BIOMES||[])].filter(b=>b.from<=g.floor).pop(),pool=bio?.pool||A.stage?.()?.pool||[19],elite=bio?.elite||[];const n=1+(g.floor>=45&&Math.random()<.4?1:0);
  const spots=(g.spawnPoints||[]).filter(p=>A.players.every(a=>dist(a,p)>800));if(!spots.length)return;
  for(let k=0;k<n;k++){
   const evolved=elite.length&&Math.random()<.5,id=evolved?elite[Math.floor(Math.random()*elite.length)]:pool[Math.floor(Math.random()*pool.length)],p=spots[Math.floor(Math.random()*spots.length)];
   A.loadActor(id).catch(()=>{});
   const e=A.enemy(id,p.x,p.y);e.alpha=true;e.scale=3.1;e.r=Math.round(e.r*1.7);e.hp=e.max=e.bar=e.max*3.8;e.damage=(e.damage||17)*1.3;e.level=(e.level||5)+3;
   if(e.baseSpeed)e.baseSpeed*=1.12;if(e.speed)e.speed*=1.12;e.alphaName='ALFA · '+(S[id]?.name||'?');e.rt=6+Math.random()*3;e.crew=pool;e.ph=0;A.enemies.push(e);
  }
  A.g.alphas=n;A.toast?.(n>1?'Dos Alfas merodean por este piso. Cuidado.':'Un Alfa merodea por este piso. Su botín vale la pena.');
 }
 A.nextFloor=function(...r){const out=old.nextFloor.apply(this,r);const g=A.g;
  if(A.NET.role!=='client'&&g&&ok(g)&&g.floor>=3&&Math.random()<Math.min(.9,.55+g.floor*.004))try{spawn(g);}catch(e){console.error(e);}
  return out;};
 // ---------- comportamiento ----------
 function minions(e){return A.enemies.filter(m=>m.hp>0&&m.minionOf===e.eid).length;}
 function reinforce(e,n){const pool=e.crew||[19];for(let i=0;i<n&&minions(e)<4;i++){const an=Math.random()*6.28,id=pool[Math.floor(Math.random()*pool.length)];A.loadActor(id).catch(()=>{});const m=A.enemy(id,e.x+Math.cos(an)*70,e.y+Math.sin(an)*70);m.minionOf=e.eid;A.enemies.push(m);A.fx('s_alert',m.x,m.y,1.4,.5);}}
 function roar(e){const rings=e.hp<e.max*.35?2:1;A.fx('s_alert',e.x,e.y,3.2,.9);for(let i=0;i<rings;i++)A.hazards.push({x:e.x,y:e.y,r:200+i*110,age:0,delay:.9+i*.35,life:1.3+i*.35,kind:e.kind||'hit',damage:(e.damage||17)*1.1,level:e.level,once:true,hits:[]});}
 A.step=function(dt){const out=old.step.call(this,dt);
  if(A.NET.role==='client'||!A.g||A.state!=='play'||A.g.paused||A.g.ended)return out;
  for(const e of A.enemies){if(!e.alpha||e.hp<=0)continue;
   const live=A.players.some(a=>!a.down&&dist(a,e)<620);if(!live)continue;
   e.rt-=dt;if(e.rt<=0){e.rt=9;roar(e);}
   const f=e.hp/e.max;if(e.ph<1&&f<.6){e.ph=1;reinforce(e,2);A.toast?.('¡El Alfa llama a los suyos!');}
   if(e.ph<2&&f<.3){e.ph=2;reinforce(e,2);e.damage*=1.3;if(e.baseSpeed)e.baseSpeed*=1.25;A.toast?.('¡El Alfa se enfurece!');}
  }
  return out;};
 // ---------- botín propio ----------
 A.hurt=function(e,d,who,p){const was=e&&e.alpha&&e.hp>0,r=old.hurt.call(this,e,d,who,p);
  if(was&&e.hp<=0&&!e.alphaDone&&A.NET.role!=='client'){e.alphaDone=true;
   const drop=(key,tag,dx)=>A.loot.push({lid:'al'+tag+(e.eid||Math.floor(e.x))+Math.floor(Math.random()*1e5),x:e.x+dx,y:e.y,key,taken:false});
   try{const r1=A.lootRoll('boss',undefined,{min:'r'});drop(r1.key,'a',-14);A.lootFx?.(A.me(),r1.key);if(Math.random()<.3)drop(A.lootRoll('event',undefined,{min:'m'}).key,'b',14);}catch(err){console.error(err);}
   drop(['ether','potion','oran_berry'][Math.floor(Math.random()*3)],'c',0);
   for(const a of A.players)if(!a.down&&!a.disconnected){A.gainXP(a,40+(A.g?.floor||1)*3);A.v14?.addUlt?.(a,8);}
   A.fx('star',e.x,e.y,4,1);A.toast?.('¡Alfa derrotado! Deja botín de calidad.');
  }
  return r;};
 // ---------- aura y barra (capa encima del juego) ----------
 let cv,ctx;
 function mount(){const g=(document.querySelector('canvas.phaser-surface')||document.querySelector('canvas:not(#fxv13):not(#alpha14):not(#darkv13)'));if(!g)return false;if(!cv){cv=document.createElement('canvas');cv.id='alpha14';cv.style.cssText='position:fixed;pointer-events:none;z-index:4;';document.body.appendChild(cv);ctx=cv.getContext('2d');}
  const r=g.getBoundingClientRect();cv.style.left=r.left+'px';cv.style.top=r.top+'px';cv.style.width=r.width+'px';cv.style.height=r.height+'px';if(cv.width!==Math.round(r.width)||cv.height!==Math.round(r.height)){cv.width=Math.round(r.width);cv.height=Math.round(r.height);}return true;}
 function frame(ts){requestAnimationFrame(frame);if(!mount())return;ctx.clearRect(0,0,cv.width,cv.height);
  if(A.state!=='play'||!A.g||A.uiMode&&A.uiMode!=='')return;
  const W=cv.width,H=cv.height,kx=W/(A.VW||1440),ky=H/(A.VH||850),Z=A.zoom||1;
  for(const e of A.enemies){if(!e.alpha||e.hp<=0&&!(e.dead>0))continue;
   const sx=((e.x-A.camera.x)*Z+(A.VW||1440)*(1-Z/2))*kx,sy=((e.y-A.camera.y)*Z+(A.VH||850)*(1-Z/2))*ky;if(sx<-200||sy<-200||sx>W+200||sy>H+200)continue;
   const c=COL[e.kind]||COL.hit,R=(e.r||28)*Z*kx*1.6,pulse=.8+.2*Math.sin(ts/260);
   const g=ctx.createRadialGradient(sx,sy+6,R*.2,sx,sy+6,R*1.5);g.addColorStop(0,c+'00');g.addColorStop(.55,c+'55');g.addColorStop(1,c+'00');ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(sx,sy+6,R*1.5,R*1.05,0,0,7);ctx.fill();
   ctx.strokeStyle=c;ctx.globalAlpha=.55*pulse;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(sx,sy+8,R*1.05,R*.62,0,0,7);ctx.stroke();
   for(let i=0;i<7;i++){const an=ts/900+i*0.9,rr=R*(.9+.25*Math.sin(ts/500+i)),px=sx+Math.cos(an)*rr,py=sy+8+Math.sin(an)*rr*.6-((ts/12+i*40)%50);ctx.globalAlpha=.7;ctx.fillStyle=c;ctx.beginPath();ctx.arc(px,py,2.2,0,7);ctx.fill();}
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   const bw=110*kx,top=sy-(e.r||28)*Z*kx*2.4;ctx.fillStyle='#0b141b';ctx.fillRect(sx-bw/2-2,top-2,bw+4,10);ctx.fillStyle='#2a1a1a';ctx.fillRect(sx-bw/2,top,bw,6);ctx.fillStyle=c;ctx.fillRect(sx-bw/2,top,bw*Math.max(0,e.hp)/e.max,6);
   ctx.font='bold '+Math.round(12*kx)+'px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0b141b';ctx.strokeText(e.alphaName||'ALFA',sx,top-6);ctx.fillStyle='#ffe6a8';ctx.fillText(e.alphaName||'ALFA',sx,top-6);}
 }
 requestAnimationFrame(frame);
 A.alpha14={spawn,COL};
};
