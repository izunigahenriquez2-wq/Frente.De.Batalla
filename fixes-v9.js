'use strict';
// Pokémon Echoe's · correcciones 9: mochila estable online, retratos de Mundo Misterioso en el HUD y estados sincronizados.
window.ECOS_FIX9=function(A){
 const $=id=>document.getElementById(id),EM=['Normal','Pain','Dizzy','Worried','Joyous','Stunned','Determined','Happy'];
 const old={cleanActor:A.cleanActor,applyState:A.applyState,bagView:A.bagView,hud:A.hud};

 // 1. Los estados que cambian la expresión se envían también a los invitados.
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['poison','sleep','slow','haste'])if(typeof a[k]==='number')o[k]=Math.round(a[k]*10)/10;return o;};

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
 function emotion(a,now){
  const s=mood[a.pid]??={hp:a.hp,level:a.level,pain:0,joy:0};
  const drop=s.hp-a.hp;
  if(drop>.5&&!(a.poison>0&&drop<a.max*.06))s.pain=now+500;
  if(a.level>s.level)s.joy=now+1800;
  s.hp=a.hp;s.level=a.level;
  if(now<s.pain)return'Pain';
  if(a.down)return'Stunned';
  if(a.poison>0)return'Dizzy';
  if(a.sleep>0)return'Stunned';
  if(a.hp<a.max*.25)return'Worried';
  if(now<s.joy)return'Joyous';
  return'Normal';
 }
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
