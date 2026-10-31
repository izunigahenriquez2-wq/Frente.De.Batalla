'use strict';
// Pokémon Echoe's · correcciones 9: mochila estable online, retratos de Mundo Misterioso en el HUD y estados sincronizados.
window.ECOS_FIX9=function(A){
 const $=id=>document.getElementById(id),EM=['Normal','Pain','Dizzy','Crying','Joyous','Angry','Teary-Eyed','Happy'];
 const old={cleanActor:A.cleanActor,applyState:A.applyState,bagView:A.bagView,hud:A.hud};

 // 1. Los estados que cambian la expresión se envían también a los invitados.
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['poison','sleep','slow','haste','happy'])if(typeof a[k]==='number')o[k]=Math.round(a[k]*10)/10;return o;};

 // 2. La mochila no se redibuja con cada instantánea del anfitrión: conserva el scroll y los clics.
 let fromState=false,bagSig='';
 const signature=()=>{const a=A.me();if(!a)return'';const near=A.players.filter(b=>b!==a&&!b.disconnected&&A.distance(a,b)<250).map(b=>b.pid);return JSON.stringify([a.pid,a.id,a.bag,a.gear,a.points,a.evoPending,a.evoPostponed,a.level,a.branch,a.gold,a.down,a.synergies,near,A.g?.floor]);};
 A.applyState=function(s){fromState=true;try{return old.applyState(s);}finally{fromState=false;}};
 A.bagView=function(){
  const sig=signature();
  if(fromState&&sig===bagSig&&document.querySelector('#overlay .compactBag'))return;
  bagSig=sig;
  const ov=$('overlay'),grid=document.querySelector('#overlay .compactBag'),y=ov?.scrollTop||0,gy=grid?.scrollTop||0;
  old.bagView();
  if(ov)ov.scrollTop=y;const g2=document.querySelector('#overlay .compactBag');if(g2)g2.scrollTop=gy;
 };

 // 3. Retratos con expresión.
 const ok={},mood={};
 function frames(id){if(ok[id]!==undefined)return ok[id];ok[id]=false;const im=new Image();im.onload=()=>{ok[id]=true;};im.onerror=()=>{ok[id]=null;};im.src='assets/pmdface/'+id+'.png';return ok[id];}
 function paint(el,id,emotion){
  if(!el)return;
  const strip=frames(id)!==null;
  if(el.dataset.id!==String(id)||el.dataset.strip!==String(strip)){el.dataset.id=id;el.dataset.strip=strip;el.style.backgroundImage=strip?`url(assets/pmdface/${id}.png)`:`url(assets/portraits/${id}.png)`;el.style.backgroundSize=strip?EM.length*100+'% 100%':'100% 100%';}
  const i=strip?Math.max(0,EM.indexOf(emotion)):0;
  el.style.backgroundPosition=strip?(i*100/(EM.length-1))+'% 0':'0 0';
  el.dataset.emotion=emotion;
 }
 const useCount=a=>Object.entries(a.bag||{}).reduce((n,[k,v])=>n+(RPG_ITEMS[k]?.type==='use'?v:0),0);
 function emotion(a,now){
  const s=mood[a.pid]??={hp:a.hp,id:a.id,use:useCount(a),pain:0,joy:0};
  const drop=s.hp-a.hp,use=useCount(a);
  if(drop>.5&&!(a.poison>0&&drop<a.max*.06))s.pain=now+500;   // daño de enemigos o trampas
  if(use<s.use)s.joy=Math.max(s.joy,now+500);                  // usar una poción u objeto de curación
  if(a.id!==s.id)s.joy=Math.max(s.joy,now+2200);               // evolución
  s.hp=a.hp;s.id=a.id;s.use=use;
  if(now<s.pain)return'Pain';
  if(now<s.joy)return'Joyous';
  if(a.happy>0)return'Happy';                                  // interacción con otro jugador
  if(a.sleep>0)return'Dizzy';
  if(a.poison>0)return'Crying';
  if(a.down||a.hp<=a.max*.25)return'Teary-Eyed';
  if(a.hp<=a.max*.5)return'Angry';
  return'Normal';
 }
 // Interacciones entre jugadores: rescatar y entregar objetos.
 const mark=(...list)=>{for(const x of list)if(x)x.happy=1.6;};
 const oldInteract=A.interact,oldPlayerStep=A.playerStep,oldRequest=A.requestAction,oldNet=A.NET.callbacks.action;
 A.interact=function(a,dt,pressed){const down=A.players.find(b=>b!==a&&b.down&&!b.disconnected&&A.distance(a,b)<90);const r=oldInteract.call(this,a,dt,pressed);if(down)mark(a,down);return r;};
 A.playerStep=function(a,mask,dt){oldPlayerStep.call(this,a,mask,dt);if(a.happy>0)a.happy=Math.max(0,a.happy-dt);};
 const transfer=(a,key)=>{const b=A.players.find(p=>p.pid===String(key).split('|')[1]);if(a&&b&&b!==a&&!b.disconnected&&A.distance(a,b)<250)mark(a,b);};
 A.requestAction=function(type,key){if(type==='transfer'&&A.NET.role!=='client')transfer(A.me(),key);return oldRequest.call(this,type,key);};
 A.NET.callbacks.action=(pid,type,key)=>{if(type==='transfer')transfer(A.players.find(a=>a.pid===pid),key);return oldNet?.(pid,type,key);};
 const status=a=>[a.down?'Caído':'',a.poison>0?'Envenenado':'',a.sleep>0?'Dormido':'',a.slow>0?'Ralentizado':''].filter(Boolean);
 function ensureFrame(){
  const hero=document.querySelector('.heroHud');if(!hero||$('faceBox'))return;
  hero.insertAdjacentHTML('afterbegin','<div id="faceBox" class="faceBox" role="img" aria-label="Retrato del explorador"></div>');
  hero.querySelector('#level')?.insertAdjacentHTML('afterend','<em id="faceStatus" class="faceStatus"></em>');
 }
 function update(){
  if(!A.g||!A.me()||A.state==='over')return;
  ensureFrame();
  const now=performance.now(),a=A.me();
  paint($('faceBox'),a.id,emotion(a,now));
  const st=status(a),fs=$('faceStatus');if(fs){fs.textContent=st.join(' · ');fs.hidden=!st.length;fs.className='faceStatus'+(a.poison>0?' poison':a.down?' down':'');}
  // Cada compañero muestra su retrato (sin cambiar de expresión) y su estado.
  A.players.filter(b=>b.pid!==a.pid).forEach((b,i)=>{
   const el=$('mate'+i);if(!el)return;
   let f=el.querySelector('.mateFace');if(!f){el.insertAdjacentHTML('afterbegin','<div class="mateFace"></div>');f=el.querySelector('.mateFace');el.insertAdjacentHTML('beforeend','<em class="mateStatus"></em>');}
   paint(f,b.id,'Normal');
   const text=b.disconnected?['Desconectado']:status(b),m=el.querySelector('.mateStatus');
   m.textContent=text.join(' · ');m.hidden=!text.length;m.className='mateStatus'+(b.poison>0?' poison':b.down||b.disconnected?' down':'');
   el.classList.toggle('mateDown',!!b.down);
  });
 }
 A.hud=function(){old.hud();update();};
 setInterval(update,70);
 A.fix9={emotion,status,paint};
};
