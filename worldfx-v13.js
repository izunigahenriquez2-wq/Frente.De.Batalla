// V13 · Clima por bioma, insignias de rol de enemigo y textos de objetos.
window.ECOS_WORLDFX13=function(A){
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const KINDS=[['storm',/Trueno|Eléctrico|Estruendo|Onda/i],['snow',/Gélido|Escarchado|Nevado|Carámbanos|Cordillera/i],['heat',/Magma|Llama|Penuria|Desierto|Arenas|Meteor/i],['rain',/Mar |Laguna|Cascada/i],['fog',/Turbio|Tóxicas|Sombrío|Abismo|Umbría|Crepuscular|Aullidos|Vacío|Lunar|Místico/i]];
 const kindOf=()=>{const n=A.v4?.biome?.name||'';for(const [k,r] of KINDS)if(r.test(n))return k;return null;};
 const MSG={storm:'⚡ Tormenta eléctrica: huye de los círculos marcados.',snow:'❄ Nevada: el aire corta, pero no hay más peligro que el frío.',heat:'🔥 Calor sofocante: cada cierto tiempo llega una ola de calor.',rain:'🌧 Lluvia: sube la marea; el suelo se vuelve resbaladizo.',fog:'🌫 Niebla espesa: se ve menos de lo que parece.'};
 // Overlay
 let cv=null,ctx=null,parts=[],lastK=null,flash=0,t0=0;
 function mount(){const g=document.querySelector('canvas:not(#fxv13)');if(!g)return false;if(!cv){cv=document.createElement('canvas');cv.id='fxv13';cv.style.cssText='position:fixed;pointer-events:none;z-index:5;';document.body.appendChild(cv);ctx=cv.getContext('2d');}
  const r=g.getBoundingClientRect();cv.style.left=r.left+'px';cv.style.top=r.top+'px';cv.style.width=r.width+'px';cv.style.height=r.height+'px';if(cv.width!==Math.round(r.width)||cv.height!==Math.round(r.height)){cv.width=Math.round(r.width);cv.height=Math.round(r.height);}return true;}
 function frame(ts){requestAnimationFrame(frame);if(!mount())return;const dt=Math.min(.05,(ts-t0)/1000||.016);t0=ts;
  const k=A.state==='play'&&!A.g?.paused?kindOf():null;ctx.clearRect(0,0,cv.width,cv.height);
  if(k!==lastK){lastK=k;parts=[];if(k&&A.g)A.toast(MSG[k]);}
  if(!k)return;const W=cv.width,H=cv.height,n={rain:140,snow:90,storm:170,fog:0,heat:0}[k];
  while(parts.length<n)parts.push({x:Math.random()*W,y:Math.random()*H,s:.6+Math.random()});
  if(k==='rain'||k==='storm'){ctx.strokeStyle=k==='storm'?'rgba(170,190,255,.45)':'rgba(150,200,255,.35)';ctx.lineWidth=1.2;ctx.beginPath();for(const p of parts){ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-4,p.y+14*p.s);p.y+=(620+300*p.s)*dt;p.x-=70*dt;if(p.y>H){p.y=-20;p.x=Math.random()*W+60;}}ctx.stroke();
   if(k==='storm'){ctx.fillStyle='rgba(10,15,40,.18)';ctx.fillRect(0,0,W,H);}}
  if(k==='snow'){ctx.fillStyle='rgba(255,255,255,.8)';for(const p of parts){ctx.beginPath();ctx.arc(p.x,p.y,1.2+p.s,0,7);ctx.fill();p.y+=(40+50*p.s)*dt;p.x+=Math.sin(ts/700+p.s*9)*20*dt;if(p.y>H){p.y=-5;p.x=Math.random()*W;}}ctx.fillStyle='rgba(200,225,255,.07)';ctx.fillRect(0,0,W,H);}
  if(k==='fog'){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.22,W/2,H/2,Math.max(W,H)*.65);g.addColorStop(0,'rgba(190,200,210,0)');g.addColorStop(1,'rgba(190,200,210,.55)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(200,210,220,.10)';ctx.fillRect(0,0,W,H);}
  if(k==='heat'){const g=ctx.createLinearGradient(0,H,0,0);g.addColorStop(0,'rgba(255,110,30,.22)');g.addColorStop(1,'rgba(255,170,60,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);if(A.g?.heatW>0){ctx.fillStyle='rgba(255,90,20,'+(.12+.08*Math.sin(ts/90))+')';ctx.fillRect(0,0,W,H);}}
  if(flash>0){ctx.fillStyle='rgba(255,255,255,'+Math.min(.7,flash*3)+')';ctx.fillRect(0,0,W,H);flash-=dt;}}
 requestAnimationFrame(frame);
 // Peligros de clima (anfitrión)
 const old={step:A.step};
 A.step=function(dt,...r){const out=old.step.call(this,dt,...r);const g=A.g;if(!g||A.state!=='play'||g.paused||A.NET.role==='client')return out;
  const k=kindOf();if(!k||A.bossFloor?.())return out;g.wx=(g.wx||0)+dt;
  const ps=(A.active?A.active():A.players.filter(p=>p.hp>0&&!p.down));if(!ps.length)return out;
  if(k==='storm'){g.bolt??=[];if(g.wx>g.nextBolt||g.nextBolt===undefined){g.nextBolt=g.wx+9+Math.random()*6;const p=ps[Math.floor(Math.random()*ps.length)],a=Math.random()*6.28,d=Math.random()*140;g.bolt.push({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,t:1.6});}
   for(const b of g.bolt){if(b.t>0){b.t-=dt;if(!b.f||b.f<g.wx){b.f=g.wx+.3;A.fx('s_ring_white',b.x,b.y,2.2,.35);}if(b.t<=0){A.fx('discharge',b.x,b.y,3.2,.5);flash=.25;for(const p of ps)if(dist(p,b)<85)A.damage(p,Math.round(p.max*.1),'electric',Math.round(3+g.floor*.72));for(const e of A.enemies)if(e.hp>0&&!e.boss&&dist(e,b)<85)A.hurt(e,e.max*.25);}}}
   g.bolt=g.bolt.filter(b=>b.t>0);}
  if(k==='heat'){g.heatC=(g.heatC||0)+dt;if(g.heatW>0){g.heatW-=dt;g.heatT=(g.heatT||0)+dt;if(g.heatT>=1){g.heatT=0;for(const p of ps)A.damage(p,Math.round(p.max*.02),'fire',Math.round(3+g.floor*.72));}}
   else if(g.heatC>26){g.heatC=0;g.heatW=4;A.toast('¡Ola de calor! Aguanta unos segundos.');}}
  if(k==='rain'){g.wetC=(g.wetC||0)+dt;if(g.wetC>22){g.wetC=0;g.tideW=5;A.toast('🌊 Sube la marea: te mueves más despacio unos segundos.');}if(g.tideW>0){g.tideW-=dt;for(const p of ps)p.slow=Math.max(p.slow||0,.3);}}
  return out;};
 // Insignias de rol
 const BADGE={healer:['✚','#7dffa0'],controller:['◎','#d09cff'],charger:['»','#ff7a6a'],guard:['▣','#b9c3cf'],bomber:['✹','#ffb347'],skirmisher:['➶','#7fe6ff']};
 const prev=window.ECOS_BOSS11_DRAW;
 window.ECOS_BOSS11_DRAW=function(api){prev?.(api);const{label,onScreen}=api;
  for(const e of A.enemies||[]){if(e.hp<=0||e.boss||!BADGE[e.role]||!onScreen(e)||!A.seen(e))continue;const b=BADGE[e.role];label('role-'+(e.eid||e.id)+'-'+e.role,b[0],e.x,e.y-(e.bigH||48)*.55-14,b[1]);}
  for(const b of A.g?.bolt||[])if(b.t>0&&onScreen(b))label('bolt-'+Math.round(b.x)+'-'+Math.round(b.y),'⚡',b.x,b.y,'#fff3a0');};
 // Textos con humor
 const LORE={apple:'«Una al día mantiene lejos al Pokémon salvaje… si se la lanzas.»',gold_apple:'«Tan brillante que el Rattata del barrio ya te vigila.»',night_grain:'«Sabe a insomnio con sirope.»',crisp_bread:'«Se oye crujir a tres pisos de distancia.»',noise_horn:'«Hecho con el cuerno de un Pokémon que nunca aprendió a callarse.»',blast_seed:'«No la guardes en el bolsillo del pantalón.»',sleep_seed:'«Receta de la abuela Snorlax: una cabezadita y a dormir.»',moomoo_milk:'«Fresca de Miltank, sin preguntas sobre el proceso.»',green_tonic:'«Huele a hierbas y a malas decisiones.»',golden_flask:'«El etiquetado dice "no apto para Magikarp".»',gold_berry:'«Dicen que una vez costó un reino. Hoy cuesta dos monedas.»',coral_twig:'«Un recuerdo de Corsola… que ella reclamará.»',gold_fang:'«Colmillo de capitán. Aún sonríe.»',pebble:'«Una piedra. Te mira con cariño.»',frambu_berry:'«Picante. Muy picante. Ya lo dijimos.»'};
 const I=window.RPG_ITEMS;if(I)for(const [k,v] of Object.entries(LORE))if(I[k]&&!I[k].lore){I[k].lore=v;if(I[k].desc&&!I[k].desc.includes(v))I[k].desc+=' '+v;}
 A.worldfx13={kindOf};
};
