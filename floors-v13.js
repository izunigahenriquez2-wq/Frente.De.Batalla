// V13 · Pisos especiales: descanso, tienda, oleadas, interruptores y laberinto oscuro.
window.ECOS_FLOORS13=function(A){
 const T=48,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),$=id=>document.getElementById(id);
 const NAMES={rest:'Piso de descanso',shop:'Piso de tienda',wave:'Piso de oleadas',switch:'Piso de interruptores',maze:'Laberinto oscuro'};
 const old={nextFloor:A.nextFloor,interact:A.interact,step:A.step,hud:A.hud,packState:A.packState,applyState:A.applyState};
 const players=()=>A.active?A.active():A.players.filter(p=>p.hp>0&&!p.down);
 const host=()=>A.NET.role!=='client';
 function decide(g){
  if(g.floor<3||A.bossFloor()||g.secret||g.floor%5===0)return null;
  if(g.floor%5===4)return 'rest';
  const r=A.seeded(g.seed+g.floor*31)();
  return r<.12?'shop':r<.30?'wave':r<.48?'switch':r<.60?'maze':null;}
 function ringSpots(n,minR,maxR){const out=[],ps=players();if(!ps.length)return out;
  for(let i=0;i<n*20&&out.length<n;i++){const c=ps[Math.floor(Math.random()*ps.length)],a=Math.random()*6.283,r=minR+Math.random()*(maxR-minR),x=c.x+Math.cos(a)*r,y=c.y+Math.sin(a)*r;
   if(A.tileAt(x,y)&&!out.some(o=>Math.hypot(o.x-x,o.y-y)<50)&&!ps.some(p=>dist(p,{x,y})<minR*.8))out.push({x,y});}
  return out;}
 A.nextFloor=function(...r){old.nextFloor.apply(this,r);const g=A.g;if(!g||!host())return;g.v13=null;
  const k=decide(g);if(!k)return;g.v13={kind:k,done:false,t:0};
  if(k==='rest'||k==='shop'){A.enemies=[];g.stairsKnown=true;g.v13.done=true;const kinds=k==='shop'?['shop','shop','well']:['well','shrine','well'];(g.events||[]).forEach((e,i)=>{if(kinds[i]){e.kind=kinds[i];e.stock=null;}});}
  if(k==='wave'){A.enemies=[];g.v13.n=0;g.v13.max=3;g.v13.next=5;}
  if(k==='switch'){const rooms=(g.rooms||[]).slice(1).filter(r=>Math.hypot(r.cx*T-g.stairs.x,r.cy*T-g.stairs.y)>300),pick=[];
   const rng=A.seeded(g.seed+g.floor*77);while(pick.length<3&&rooms.length)pick.push(rooms.splice(Math.floor(rng()*rooms.length),1)[0]);
   g.v13.sw=pick.map(r=>({x:r.cx*T+24,y:r.cy*T+24,on:false}));if(g.v13.sw.length<3){g.v13.kind='plain';g.v13.done=true;}}
  if(k==='maze'){g.v13.t=0;}
  setTimeout(()=>{if(A.g===g&&g.v13&&g.v13.kind!=='plain')A.toast('✦ '+NAMES[g.v13.kind]+(g.v13.kind==='rest'?': recupérate, nadie te molestará.':g.v13.kind==='shop'?': compra con calma.':g.v13.kind==='wave'?': derrota 3 oleadas para abrir las escaleras.':g.v13.kind==='switch'?': activa los 3 interruptores para abrir las escaleras.':': no se ve nada… la brújula tardará en ayudarte.'));},1800);};
 function unlock(g,msg){g.v13.done=true;g.stairsKnown=true;A.toast(msg);for(const p of players()){p.gold=(p.gold||0)+25+g.floor*2;A.gainXP?.(p,40+g.floor*4);p.bag.potion=(p.bag.potion||0)+1;}A.fx('star',g.stairs.x,g.stairs.y,3,.8);}
 A.step=function(dt,...r){const out=old.step.call(this,dt,...r);const g=A.g,v=g?.v13;if(!v||A.state!=='play'||g.paused||!host())return out;
  v.t=(v.t||0)+dt;
  if(v.kind==='rest'){for(const p of players()){p.hp=Math.min(p.max,p.hp+p.max*.04*dt);p.mp=Math.min(p.maxMp,p.mp+p.maxMp*.05*dt);}}
  if(v.kind==='wave'&&!v.done&&!g.assetLoading){const alive=A.enemies.filter(e=>e.hp>0&&e.w13).length;
   if(alive===0){if(v.n>=v.max){unlock(g,'¡Oleadas superadas! Las escaleras se abren.');}else{v.next-=dt;if(v.next<=0&&!v.spawning){v.spawning=true;const b=A.v4.biome,ids=b.pool,n=5+v.n*3+(A.players.length-1)*2,spots=ringSpots(n,230,420);v.n++;
     Promise.all([...new Set(ids)].map(A.loadActor)).then(()=>{if(A.g!==g)return;spots.forEach((s,i)=>{const id=(v.n===v.max&&i===0&&b.elite?.length)?b.elite[0]:ids[i%ids.length],e=A.enemy(id,s.x,s.y);e.w13=1;e.level+=v.n-1;e.hp=e.max=e.max*(1+.08*(v.n-1));A.enemies.push(e);A.fx('psychic',s.x,s.y,2,.4);});A.toast('Oleada '+v.n+' de '+v.max+'.');v.next=4;v.spawning=false;});}}}}
  return out;};
 A.interact=function(a,dt,pressed,...r){const g=A.g,v=g?.v13;
  if(pressed&&v&&host()&&a.hp>0&&!a.down){
   if(v.kind==='switch'&&!v.done){const s=v.sw.find(s=>!s.on&&dist(a,s)<90);if(s){s.on=true;A.fx('star',s.x,s.y,2.4,.5);const n=v.sw.filter(x=>x.on).length;if(n===v.sw.length)unlock(g,'¡Todos los interruptores activos! Las escaleras se abren.');else A.toast('Interruptor activado ('+n+'/'+v.sw.length+').');return;}}
   if(!v.done&&dist(a,g.stairs)<110){A.toast(v.kind==='wave'?'Las escaleras están selladas: supera las oleadas.':v.kind==='switch'?'Las escaleras están selladas: activa los interruptores.':'');if(v.kind==='wave'||v.kind==='switch')return;}}
  return old.interact.call(this,a,dt,pressed,...r);};
 A.packState=function(...r){const s=old.packState.apply(this,r),v=A.g?.v13;if(v)s.v13={kind:v.kind,done:v.done,n:v.n,max:v.max,t:Math.floor(v.t||0),sw:v.sw};return s;};
 A.applyState=function(s,...r){const o=old.applyState.call(this,s,...r);if(A.g&&s&&s.floor===A.g.floor&&'v13' in s)A.g.v13=s.v13||A.g.v13;return o;};
 // HUD y oscuridad
 let cv=null,cx=null;
 function overlay(on){if(!cv){if(!on)return;cv=document.createElement('canvas');cv.id='darkv13';cv.style.cssText='position:fixed;pointer-events:none;z-index:3;';document.body.appendChild(cv);cx=cv.getContext('2d');}
  cv.style.display=on?'block':'none';if(!on)return;const w=document.getElementById('world');if(!w)return;const r=w.getBoundingClientRect();cv.style.left=r.left+'px';cv.style.top=r.top+'px';cv.style.width=r.width+'px';cv.style.height=r.height+'px';
  if(cv.width!==Math.round(r.width)){cv.width=Math.round(r.width);cv.height=Math.round(r.height);}const W=cv.width,H=cv.height,me=A.me(),kx=W/(A.VW||1440),ky=H/(A.VH||850),px=me?((me.x-A.camera.x)*A.zoom+(A.VW||1440)*(1-A.zoom/2))*kx:W/2,py=me?((me.y-A.camera.y)*A.zoom+(A.VH||850)*(1-A.zoom/2))*ky:H/2,R=250*A.zoom*kx;
  const g=cx.createRadialGradient(px,py,R*.4,px,py,R);g.addColorStop(0,'rgba(2,4,10,0)');g.addColorStop(1,'rgba(2,4,10,.97)');cx.clearRect(0,0,W,H);cx.fillStyle=g;cx.fillRect(0,0,W,H);}
 A.hud=function(){old.hud.call(this);const g=A.g,v=g?.v13;overlay(!!(v&&v.kind==='maze'&&A.state==='play'));if(!v||v.kind==='plain')return;const el=$('goal');if(!el)return;
  el.textContent=v.kind==='wave'?(v.done?'Oleadas superadas · sube las escaleras':'Oleada '+Math.max(1,v.n||0)+'/'+v.max+' · derrota a todos'):v.kind==='switch'?(v.done?'Interruptores activos · sube las escaleras':'Interruptores '+v.sw.filter(s=>s.on).length+'/'+v.sw.length+' · actívalos con F'):v.kind==='maze'?'Laberinto oscuro · encuentra las escaleras':v.kind==='rest'?'Piso de descanso · recupérate y sube':'Piso de tienda · compra con calma';};
 const A8=['→','↘','↓','↙','←','↖','↑','↗'];
 const prev=window.ECOS_BOSS11_DRAW;
 window.ECOS_BOSS11_DRAW=function(api){prev?.(api);const{obj,label,onScreen}=api,g=A.g,v=g?.v13;if(!v)return;
  if(v.kind==='switch')v.sw.forEach((s,i)=>{if(onScreen(s)){obj(s.on?'Tile_Wonder':'Tile_Switch','sw13-'+i+(s.on?'on':''),s.x,s.y,1.6);label('sw13l-'+i,s.on?'Activo':'F · Interruptor',s.x,s.y+34,s.on?'#8cffb0':'#ffe08a');}});
  if(!v.done&&(v.kind==='wave'||v.kind==='switch')&&onScreen(g.stairs))label('lock13',v.kind==='wave'?'Sellada · oleadas':'Sellada · interruptores',g.stairs.x,g.stairs.y+46,'#ff9d9d');
  if(v.kind==='maze'&&(v.t||0)>45&&!v.done){const me=A.me();if(me&&me.hp>0){const a=Math.atan2(g.stairs.y-me.y,g.stairs.x-me.x),i=((Math.round(a/(Math.PI/4))%8)+8)%8;label('compass13',A8[i]+' brújula',me.x+Math.cos(a)*80,me.y+Math.sin(a)*80,'#9fe8ff');}}};
 A.floors13={decide,NAMES};
};
