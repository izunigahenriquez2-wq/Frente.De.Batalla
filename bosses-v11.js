'use strict';
// Pokémon Echoe's · v11 · jefes de 2 fases, subjefes en salas secretas y el villano IronJaw.
window.ECOS_BOSS11=function(A){
 const T=48,dist=A.distance,clamp=A.clamp,S=RPG_SPECIES,TF=window.ECOS_TYPEFX,PN=window.ECOS_PATNAMES;
 const SUBS=window.ECOS_SUBS,IRON=window.ECOS_IRONJAW,BOSSES=window.ECOS_BOSSES,DEF=window.ECOS_BOSS_DEFAULT;
 const old={enemy:A.enemy,enemyStep:A.enemyStep,hurt:A.hurt,cleanActor:A.cleanActor,generateFloor:A.generateFloor,nextFloor:A.nextFloor,interact:A.interact,step:A.step,packState:A.packState,applyState:A.applyState,packWorld:A.packWorld,applyWorld:A.applyWorld};
 const rnd=(a,b)=>a+Math.random()*(b-a),pickOf=l=>l[Math.floor(Math.random()*l.length)];
 const isBossFloor=f=>f>=10&&f%5===0;
 const isSecretFloor=f=>f>=8&&f<80&&!isBossFloor(f)&&(f%5===3||(f>=11&&f%5===1));
 const secretIndex=f=>{let n=0;for(let x=8;x<f;x++)if(isSecretFloor(x))n++;return n;};
 const ironFloors=(()=>{const out=[];let f=6;while(f<80){let x=f;while(isBossFloor(x)||isSecretFloor(x))x++;out.push(x);f+=7;}return out;})();
 let pendingDk=null,B={t:0};

 // ================= utilidades de ataque =================
 const role=(e,r)=>(TF[e.fxt]||TF.hit)[r]||'hit';
 const fsz=k=>A.fxArt?.[k]?.size||32;
 const defOf=e=>e.dk==='iron'?IRON:e.dk&&SUBS[e.dk]?SUBS[e.dk]:{...DEF,...(BOSSES[e.baseId||e.id]||{})};
 function shot(e,ang,spd,r_,px,mul=1,life=3.4){const k=role(e,r_),off=e.r*.6;A.fire(e,ang,spd,e.damage*mul,k,e.x+Math.cos(ang)*off,e.y+Math.sin(ang)*off,{life,size:px/fsz(k),r:Math.max(7,px*.3)});}
 function haz(e,x,y,r,delay,r_,mul=1.3,keep=.45){if(!A.tileAt(x,y))return;const k=role(e,r_);A.hazards.push({x,y,r,age:0,delay,life:delay+keep,kind:k,damage:e.damage*mul,level:e.level,once:true,hits:[],bossOwner:e.eid,fxScale:(r*2.1)/fsz(k)});}
 const later=(e,t,fn)=>(e.sched??=[]).push({t:(e.age||0)+t,fn});
 function target(e){const lure=window.ECOS_V10?.taunt?.(e);if(lure)return lure;const l=A.active();if(!l.length)return null;if(l.length>1&&Math.random()<.3&&e.bossState==='approach')return pickOf(l);return l.sort((a,b)=>dist(a,e)-dist(b,e))[0];}
 function aimAt(e,a){e.aimAngle=Math.atan2(a.y-e.y,a.x-e.x);e.targetX=a.x;e.targetY=a.y;}
 const ph=e=>e.phase||1;
 const minions=e=>A.enemies.filter(m=>m.summoner===e.eid&&m.hp>0).length;
 function poseOf(e,name,once=true){e.pose=name;e.poseT=0;e.poseOnce=once;}

 // ================= catálogo de ataques =================
 const PATS={};
 PATS.charge={wind:.85,rec:1.25,pose:'Charge',
  pre(e){e.warning={line:true,angle:e.aimAngle,x:e.x,y:e.y,r:75,wide:e.r*.6};},
  run(e){e.warning=null;const sp=470+(ph(e)-1)*70;e.vx=Math.cos(e.aimAngle)*sp;e.vy=Math.sin(e.aimAngle)*sp;e.trail=0;return .62;},
  tick(e,dt){A.move(e,e.vx*dt,e.vy*dt);e.moving=true;if(ph(e)>1){e.trail-=dt;if(e.trail<=0){e.trail=.15;haz(e,e.x,e.y,e.r*.75,.3,'zone',.9,.25);}}},
  end(e,a){if(e.chain>0){e.chain--;aimAt(e,a);e.bossState='windup';e.stateTime=.42;e.warning={line:true,angle:e.aimAngle,x:e.x,y:e.y,r:75,wide:e.r*.6};e.pose=null;return true;}}};
 PATS.combo={...PATS.charge,wind:.7,rec:1.6,run(e){e.chain=2;return PATS.charge.run(e);}};
 PATS.fan={wind:.8,rec:1.1,pose:'Shoot',run(e){const n=3+ph(e)*2;for(let i=0;i<n;i++)shot(e,e.aimAngle+(i-(n-1)/2)*.17,310,'shot',46);if(ph(e)>1)later(e,.45,()=>{for(let i=0;i<6;i++)shot(e,e.aimAngle+(i-2.5)*.15+.06,340,'shot',46);});return 0;}};
 PATS.barrage={wind:.75,rec:1.3,pose:'Shoot',run(e){const n=ph(e)>1?13:8;for(let i=0;i<n;i++)later(e,i*.09,()=>{const a=target(e);if(!a)return;const g=Math.atan2(a.y-e.y,a.x-e.x)+rnd(-.1,.1);shot(e,g,400,'shot',42,.9);e.shotAnim=.2;});return 0;}};
 PATS.ring={wind:.95,rec:1.3,pose:'Slam',run(e){const n=14+ph(e)*4;for(let i=2;i<n-1;i++)shot(e,e.aimAngle+i*Math.PI*2/n,230+ph(e)*20,'ring',46);haz(e,e.x,e.y,e.r*1.4,.5,'slam',1.2);if(ph(e)>1)later(e,.6,()=>{for(let i=0;i<n;i++)shot(e,e.aimAngle+(i+.5)*Math.PI*2/n,250,'ring',46);});return 0;}};
 PATS.spiral={wind:.8,rec:1.2,pose:'Rotate',run(e){e.sp=0;e.sa=e.aimAngle;return 2.3;},tick(e,dt){e.sp-=dt;if(e.sp<=0){e.sp=.085;const arms=1+ph(e);for(let k=0;k<arms;k++)shot(e,e.sa+k*Math.PI*2/arms,235,'ring',44,.85);e.sa+=.38;}}};
 PATS.sweep={wind:.9,rec:1.3,pose:'Swing',pre(e){e.warning={line:true,angle:e.aimAngle,x:e.x,y:e.y,r:75,wide:60,angles:[e.aimAngle-.8,e.aimAngle,e.aimAngle+.8]};},run(e){e.warning=null;e.sp=0;e.sa=e.aimAngle;e.actT=0;return 1.4;},tick(e,dt){e.actT+=dt;e.sp-=dt;if(e.sp<=0){e.sp=.055;shot(e,e.sa-.8+1.6*clamp(e.actT/1.4,0,1),340,'shot',46,.9);}}};
 PATS.beam={wind:1,rec:1.5,pose:'Shoot',pre(e){const aims=ph(e)>1?[e.aimAngle-.34,e.aimAngle,e.aimAngle+.34]:[e.aimAngle];e.warning={line:true,angle:e.aimAngle,x:e.x,y:e.y,r:75,wide:34,angles:aims};},run(e){e.warning=null;const aims=ph(e)>1?[e.aimAngle-.34,e.aimAngle,e.aimAngle+.34]:[e.aimAngle];for(const g of aims)for(let i=0;i<14;i++)later(e,i*.036,()=>shot(e,g,640,'beam',70,.8,1.7));return 0;}};
 PATS.zones={wind:.95,rec:1.1,pose:'Attack',pre(e){},run(e){haz(e,e.targetX,e.targetY,90,.9,'zone',1.35);for(let i=0;i<ph(e)+1;i++){const g=e.aimAngle+i*2.4;haz(e,e.targetX+Math.cos(g)*170,e.targetY+Math.sin(g)*170,75,1.15+i*.12,'zone',1.3);}return 0;}};
 PATS.rain={wind:.9,rec:1.4,pose:'Attack',run(e){e.rt=0;return 2.4;},tick(e,dt){e.rt-=dt;if(e.rt<=0){e.rt=ph(e)>1?.09:.13;const a=target(e)||{x:e.targetX,y:e.targetY},on=Math.random()<.35,g=rnd(0,Math.PI*2),d=on?0:rnd(40,320);haz(e,a.x+Math.cos(g)*d,a.y+Math.sin(g)*d,68,.85,'rain',1.2);}}};
 PATS.pillars={wind:.85,rec:1.3,pose:'Slam',run(e){const lines=ph(e)>1?[-.45,0,.45]:[0];for(const off of lines)for(let i=0;i<7;i++){const g=e.aimAngle+off,d=e.r+60+i*105;haz(e,e.x+Math.cos(g)*d,e.y+Math.sin(g)*d,58,.45+i*.09,'line',1.25);}return 0;}};
 PATS.star={wind:1,rec:1.4,pose:'Rotate',run(e){const arms=ph(e)>1?8:4;for(let k=0;k<arms;k++)for(let i=0;i<5;i++){const g=e.aimAngle+k*Math.PI*2/arms,d=90+i*115;haz(e,e.x+Math.cos(g)*d,e.y+Math.sin(g)*d,56,.5+i*.1,'line',1.2);}if(ph(e)>1)later(e,.7,()=>{for(let k=0;k<arms;k++)for(let i=0;i<5;i++){const g=e.aimAngle+(k+.5)*Math.PI*2/arms,d=90+i*115;haz(e,e.x+Math.cos(g)*d,e.y+Math.sin(g)*d,56,.5+i*.1,'line',1.2);}});return 0;}};
 PATS.slam={wind:.95,rec:1.4,pose:'Slam',run(e){const r=170+40*(ph(e)-1);haz(e,e.x,e.y,r,.8,'slam',1.6,.5);later(e,.8,()=>{const n=12+ph(e)*4;for(let i=0;i<n;i++)shot(e,i*Math.PI*2/n,260,'ring',46);});if(ph(e)>1)later(e,1.1,()=>haz(e,e.x,e.y,r*1.35,.6,'slam',1.3,.4));return 0;}};
 PATS.tail={wind:.6,rec:1.1,pose:'Swing',run(e){haz(e,e.x,e.y,e.r*2.1+ph(e)*20,.5,'slam',1.4,.4);if(ph(e)>1)haz(e,e.x,e.y,e.r*3.4,.9,'slam',1.2,.4);return 0;}};
 PATS.leap={wind:1.05,rec:1.4,pose:'Hop',min:200,pre(e){e.warning={x:e.targetX,y:e.targetY,r:130};},run(e){e.warning=null;e.leapStart={x:e.x,y:e.y};e.actT=0;return .65;},
  tick(e,dt){e.actT+=dt;const t=clamp(e.actT/.65,0,1);e.x=e.leapStart.x+(e.targetX-e.leapStart.x)*t;e.y=e.leapStart.y+(e.targetY-e.leapStart.y)*t;e.z=Math.sin(t*Math.PI)*110;},
  end(e){e.z=0;haz(e,e.x,e.y,150+25*(ph(e)-1),0,'slam',1.6,.4);A.fx('smash',e.x,e.y,3,.5);if(ph(e)>1)for(let i=0;i<12;i++)shot(e,i*Math.PI/6,230,'ring',44);}};
 PATS.blink={wind:.6,rec:1.1,pose:'Attack',max:900,run(e,a){const go=()=>{for(let k=0;k<8;k++){const g=rnd(0,Math.PI*2),x=a.x+Math.cos(g)*230,y=a.y+Math.sin(g)*230;if(A.tileAt(x,y)&&A.tileAt(x-e.r,y)&&A.tileAt(x+e.r,y)&&A.tileAt(x,y-e.r)&&A.tileAt(x,y+e.r)){A.fx('psychic',e.x,e.y,2,.4);e.x=x;e.y=y;e.prevX=x;e.prevY=y;A.fx('psychic',x,y,2,.4);break;}}};go();later(e,.5,()=>{const t=target(e)||a;aimAt(e,t);for(let i=0;i<5+ph(e);i++)shot(e,e.aimAngle+(i-(4+ph(e))/2)*.16,320,'shot',46);});if(ph(e)>1)later(e,1.1,()=>{go();later(e,.4,()=>{const t=target(e)||a;aimAt(e,t);for(let i=0;i<7;i++)shot(e,e.aimAngle+(i-3)*.15,340,'shot',46);});});return 0;}};
 PATS.summon={wind:1,rec:1.5,pose:'Double',run(e){const d=defOf(e),pool=d.minions||A.stage?.().pool||[19,41],n=Math.min(3-minions(e),ph(e)+1);for(let i=0;i<n;i++){const g=rnd(0,Math.PI*2),x=e.x+Math.cos(g)*170,y=e.y+Math.sin(g)*170;if(!A.tileAt(x,y))continue;const id=pickOf(pool),m=A.enemy(id,x,y);m.summoner=e.eid;A.enemies.push(m);A.loadActor(id).catch(()=>{});A.fx('star',x,y,2,.5);}return 0;}};
 PATS.pull={wind:1,rec:1.6,pose:'Rotate',pre(e){e.warning={x:e.x,y:e.y,r:650};},run(e){e.warning=null;e.actT=0;return 1.5;},
  tick(e,dt){for(const p of A.active()){const d=dist(p,e);if(d<650&&d>e.r+20)A.move(p,(e.x-p.x)/d*170*dt,(e.y-p.y)/d*170*dt);}},
  end(e){haz(e,e.x,e.y,190,0,'slam',1.7,.4);for(let i=0;i<16;i++)shot(e,i*Math.PI/8,240,'ring',46);}};

 // ================= preparación de cada jefe =================
 function prep(e,dk){
  const d=dk==='iron'?IRON:dk&&SUBS[dk]?SUBS[dk]:{...DEF,...(BOSSES[e.id]||{})};
  e.dk=dk||'';e.baseId=e.baseId||e.id;e.bigH=d.H;e.r=Math.round(d.H*.2);e.fxt=d.fxType||(TF[e.kind]?e.kind:'hit');e.phase=1;e.bossState='intro';e.stateTime=dk?2.6:1.4;e.invuln=true;e.pose=null;e.sched=[];e.sleepDmg=0;e.lastPat='';e.chain=0;e.age=0;
  if(dk){e.sub=true;e.name=d.name;e.title=d.title;e.kind=d.kind;e.hpMul=d.hp||.8;e.dmgMul=d.dmg||.85;}
  if(d.spd)e.spd=d.spd;else e.spd=e.baseSpeed||140;
  e.combatV7=false;A.combat7.scale(e);e.hp=e.max;e.bar=e.hp;
 }
 A.enemy=function(id,x,y,boss=false){const e=old.enemy(id,x,y,boss);if(boss){const dk=pendingDk;pendingDk=null;prep(e,dk||'');}return e;};
 function spawnBossEntity(id,x,y,dk){pendingDk=dk;const e=A.enemy(id,x,y,true);A.enemies.push(e);A.loadActor(id).catch(()=>{});return e;}

 // ================= diálogos al estilo Mystery Dungeon =================
 const EMO=['Normal','Pain','Dizzy','Crying','Joyous','Angry','Teary-Eyed','Happy'];
 const IRONFACE={Normal:[0,0],Happy:[0,1],Pain:[0,2],Crying:[0,3],Joyous:[1,1],Dizzy:[1,0],Angry:[1,2],Shouting:[0,7],'Teary-Eyed':[0,4]};
 function say(lines,who,face,opts={}){const g=A.g;if(!g||A.NET.role==='client')return;let t=0;for(const [emo,text] of lines){const dur=2.2+text.length*.052;(g.dlgQ??=[]).push({at:B.t+t,who,face,emo,text,dur,menace:!!opts.menace,patch:!!opts.patch});t+=dur+.35;}return t;}
 function runDialog(dt){const g=A.g;if(!g?.dlgQ?.length)return;const n=g.dlgQ[0];if(B.t>=n.at){g.dlgQ.shift();g.dlgSeq=(g.dlgSeq||0)+1;g.dlg={seq:g.dlgSeq,who:n.who,face:n.face,emo:n.emo,text:n.text,dur:n.dur,menace:n.menace,patch:n.patch};}}
 let shown=-1,typer=null;const face_ok={};
 function ensureBox(){let b=document.getElementById('mdBox');if(!b){b=document.createElement('div');b.id='mdBox';b.className='md hide';b.innerHTML='<div class="mdFace"></div><div class="mdBody"><div class="mdName"></div><div class="mdText"></div><span class="mdArrow">▼</span></div>';document.body.appendChild(b);}return b;}
 function faceTest(id,kind){const k=kind+id;if(face_ok[k]!==undefined)return face_ok[k];face_ok[k]=false;const im=new Image();im.onload=()=>face_ok[k]=true;im.onerror=()=>face_ok[k]=null;im.src=kind==='strip'?'assets/pmdface/'+id+'.png':'assets/portraits/'+id+'.png';return face_ok[k];}
 function showDialog(d){const b=ensureBox(),f=b.querySelector('.mdFace'),nm=b.querySelector('.mdName'),tx=b.querySelector('.mdText');
  nm.textContent=d.who;b.classList.toggle('menace',!!d.menace);b.classList.remove('hide');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');
  if(d.face===1160){const [r,c]=IRONFACE[d.emo]||IRONFACE.Normal,rr=r+(d.patch?2:0);f.style.backgroundImage='url(assets/pmdface/ironjaw32.png)';f.style.backgroundSize='800% 400%';f.style.backgroundPosition=(c*100/7)+'% '+(rr*100/3)+'%';}
  else{const strip=faceTest(d.face,'strip')!==null;f.style.backgroundImage=strip?'url(assets/pmdface/'+d.face+'.png)':'url(assets/portraits/'+d.face+'.png)';f.style.backgroundSize=strip?'800% 100%':'100% 100%';const i=Math.max(0,EMO.indexOf(d.emo==='Shouting'?'Angry':d.emo));f.style.backgroundPosition=strip?(i*100/7)+'% 0':'0 0';}
  clearInterval(typer);let i=0;tx.textContent='';const speed=Math.max(22,d.text.length/(Math.max(1.2,d.dur*.62)));typer=setInterval(()=>{i+=Math.max(1,Math.round(speed/40*3));tx.textContent=d.text.slice(0,i);if(i>=d.text.length)clearInterval(typer);},75);
  clearTimeout(showDialog.h);showDialog.h=setTimeout(()=>b.classList.add('hide'),d.dur*1000);}
 setInterval(()=>{const d=A.g?.dlg;if(d&&d.seq!==shown){shown=d.seq;showDialog(d);}if(!A.g){document.getElementById('mdBox')?.classList.add('hide');shown=-1;}},90);

 // ================= IA de jefe =================
 function fleeSpot(e){const g=A.g,ps=A.active(),rooms=(e.sub&&g.secret?.state==='fight')?[{x:g.secret.arena.x,y:g.secret.arena.y,w:g.secret.arena.w,h:g.secret.arena.h}]:g.rooms;let best=null,bd=-1;
  for(let i=0;i<140;i++){const r=pickOf(rooms),x=(r.x+1.5+Math.random()*(r.w-3))*T,y=(r.y+1.5+Math.random()*(r.h-3))*T;if(dist(e,{x,y})>1500||dist(e,{x,y})<260)continue;if(!(A.tileAt(x-e.r,y-e.r)&&A.tileAt(x+e.r,y-e.r)&&A.tileAt(x-e.r,y+e.r)&&A.tileAt(x+e.r,y+e.r)))continue;const m=Math.min(...ps.map(p=>dist(p,{x,y})),9999);if(m>bd){bd=m;best={x,y};}}
  return best||{x:e.x,y:e.y};}
 function beginFlee(e){e.sched=[];e.warning=null;e.z=0;e.pattern='';e.invuln=true;e.bossState='flee';e.stateTime=3.6;e.spot=fleeSpot(e);e.pose=null;e.stuck=0;e.sleepDmg=0;A.toast(e.name+' se retira para recuperarse…');
  const d=defOf(e),s=d.say?.flee||(e.dk==='iron'?IRON.say.flee:null);if(s&&e.dk==='iron')say(s,e.name,1160,{menace:true});A.fx('star',e.x,e.y,3,.5);}
 function startSleep(e){e.bossState='sleep';e.stateTime=7;e.invuln=false;e.sleepDmg=0;e.zt=0;poseOf(e,'Sleep',false);}
 async function evolveBoss(e,id){try{await A.loadActor(id);}catch{}e.id=id;e.r=Math.round(e.bigH*.2);}
 function beginRoar(e){e.bossState='roar';e.stateTime=1.5;e.pose=null;e.invuln=true;e.phase=2;e.warning=null;const d=defOf(e);
  if(d.evolve&&e.id!==d.evolve){e.name=RPG_BOSS_NAMES[d.evolve]||e.name;evolveBoss(e,d.evolve);A.fx('star',e.x,e.y,5,.9);e.hp=Math.max(e.hp,e.max*.75);const bo=d.boost||{dmg:1.3,spd:1.1};e.damage*=bo.dmg;e.baseSpeed*=bo.spd;e.tagIcon='⚡';}
  e.sched=[];poseOf(e,'Attack');A.toast(e.name+' · ¡fase 2!');A.fx('smash',e.x,e.y,4,.6);
  if(e.dk==='iron')say(IRON.say.phase2,e.name,1160,{menace:true,patch:true});else if(d.say?.phase2)say(d.say.phase2,e.name,d.evolve||(e.baseId>1000?e.baseId:(e.dk?d.id:e.baseId)));
  later(e,.45,()=>{haz(e,e.x,e.y,260,.4,'slam',1.4,.4);for(let i=0;i<16;i++)shot(e,i*Math.PI/8,240,'ring',46);});}
 function windMul(e){return (ph(e)>1?.82:1)*(e.rage?.9:1);}
 function plan(e,a){const d=defOf(e),dd=dist(e,a);let list=ph(e)>1?[...d.p1,...d.p2,...d.p2]:[...d.p1];
  list=list.filter(n=>{const P=PATS[n];return P&&(!P.min||dd>=P.min)&&(!P.max||dd<=P.max)&&n!==e.lastPat&&!(n==='summon'&&minions(e)>=3);});if(!list.length)list=['fan'];
  start(e,a,pickOf(list));}
 function start(e,a,n){const P=PATS[n],d=defOf(e);e.pattern=n;e.lastPat=n;e.moveName=(d.nm&&d.nm[n])||PN[n];aimAt(e,a);e.bossState='windup';e.stateTime=P.wind*windMul(e);e.pose=null;P.pre?.(e,a);}
 function finishAct(e,a){const P=PATS[e.pattern];if(P?.end&&P.end(e,a))return;e.bossState='recover';e.stateTime=(P?.rec||1.2)*(ph(e)>1?.72:1)*(e.rage?.85:1);e.pose=null;}

 function bossStep(e,dt){
  if(e.hp<=0){e.dead=Math.max(0,e.dead-dt);return;}
  if(e.bigH===undefined)prep(e,'');
  A.combat7.scale(e);
  const a=target(e);if(!a)return;
  e.age=(e.age||0)+dt;e.prevX=e.x;e.prevY=e.y;e.anim=(e.anim||0)+dt;e.poseT=(e.poseT||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.hurt=Math.max(0,(e.hurt||0)-dt);e.shotAnim=Math.max(0,(e.shotAnim||0)-dt);e.bar+=(e.hp-e.bar)*Math.min(1,dt*8);e.moving=false;
  for(const k of ['stun','slow','poison','burn'])e[k]=Math.max(0,(e[k]||0)-dt);e.sleep=0;
  if((e.poison>0||e.burn>0)&&!e.invuln){e.dotTime=(e.dotTime||0)+dt;if(e.dotTime>=1){e.dotTime=0;A.hurt(e,e.max*.006);if(e.hp<=0)return;}}
  e.rage=ph(e)>1&&e.hp<e.max*.22;
  // acciones programadas
  if(e.sched?.length){for(const s of e.sched.filter(s=>s.t<=e.age)){s.fn();}e.sched=e.sched.filter(s=>s.t>e.age);}
  const st=e.bossState,speedMul=(ph(e)>1?1.28:1)*(e.slow>0?.6:1)*(e.rage?1.1:1);
  // transición de fase al 50 %
  if(ph(e)===1&&e.hp<=e.max*.5&&!['flee','sleep','roar','intro'].includes(st)){beginFlee(e);return;}
  if(e.stun>0&&!['flee','sleep','roar','intro'].includes(st)){e.stun=Math.min(e.stun,.35);return;}
  e.stateTime-=dt;
  if(st==='intro'){A.face(e,a.x-e.x,a.y-e.y);if(e.stateTime<=0){e.invuln=false;e.bossState='approach';e.stateTime=.5;}}
  else if(st==='windup'){A.face(e,Math.cos(e.aimAngle),Math.sin(e.aimAngle));if(e.stateTime<=0){e.warning=e.warning&&e.warning.keep?e.warning:null;const P=PATS[e.pattern],dur=P.run(e,a)||0;if(P.pose)poseOf(e,P.pose,dur<.8);e.shotAnim=.4;if(dur>0){e.bossState='act';e.stateTime=dur;}else{e.bossState='recover';e.stateTime=(P.rec||1.2)*(ph(e)>1?.72:1)*(e.rage?.85:1);}}}
  else if(st==='act'){const P=PATS[e.pattern];P.tick?.(e,dt,a);if(e.stateTime<=0){finishAct(e,a);}}
  else if(st==='recover'||st==='stagger'){if(st==='stagger')e.sched=[];if(e.stateTime<=0){e.bossState='approach';e.stateTime=Math.max(.2,(.85-ph(e)*.18)*(e.rage?.7:1));e.pose=null;}}
  else if(st==='flee'){const sp=e.spot,d=dist(e,sp);if(d>34&&e.stateTime>0){const px=e.x,py=e.y;A.face(e,sp.x-e.x,sp.y-e.y);A.move(e,(sp.x-e.x)/d*360*dt,(sp.y-e.y)/d*360*dt);e.moving=true;if(Math.hypot(e.x-px,e.y-py)<360*dt*.25)e.stuck+=dt;else e.stuck=0;}
   if(d<=34||e.stateTime<=0||e.stuck>.7){if(d>34){A.fx('psychic',e.x,e.y,2,.4);e.x=sp.x;e.y=sp.y;e.prevX=sp.x;e.prevY=sp.y;A.fx('psychic',sp.x,sp.y,2,.4);}startSleep(e);}}
  else if(st==='sleep'){e.hp=Math.min(e.max*.82,e.hp+e.max*.036*dt);e.zt=(e.zt||0)-dt;if(e.zt<=0){e.zt=.85;A.fx('s_sleep_zzz',e.x+e.r*.5,e.y-e.bigH*.3,1.6,.9);}if(e.stateTime<=0||e.sleepDmg>e.max*.16){e.pose=null;beginRoar(e);}}
  else if(st==='roar'){if(e.stateTime<=0){e.invuln=false;e.pose=null;e.bossState='approach';e.stateTime=.7;}}
  else{ // approach
   const d=dist(e,a),ang=Math.atan2(a.y-e.y,a.x-e.x),want=150+e.r*.9;A.face(e,Math.cos(ang),Math.sin(ang));
   if(e.hunt&&d>520){chase(e,a,e.spd*1.75*speedMul,dt);}
   else if(d>want){A.move(e,Math.cos(ang)*e.spd*speedMul*dt,Math.sin(ang)*e.spd*speedMul*dt);e.moving=true;}
   else{const s=(e.strafe??=Math.random()<.5?1:-1);A.move(e,Math.cos(ang+Math.PI/2*s)*85*dt,Math.sin(ang+Math.PI/2*s)*85*dt);e.moving=true;}
   if(e.stateTime<=0)plan(e,a);}
  if(!['leap','stagger','recover','sleep','flee','intro','roar'].includes(e.bossState)&&!e.invuln)for(const p of A.active())if(dist(p,e)<e.r*.85+p.r)A.damage(p,e.damage*.6,e.kind,e.level);
 }
 function chase(e,a,speed,dt){let dx=a.x-e.x,dy=a.y-e.y;if(!A.clearLine(e,a)){const field=A.g.flow?.[a.pid],tx=Math.floor(e.x/T),ty=Math.floor(e.y/T);let best=field?.[A.tileIndex(tx,ty)]??-1,step=null;for(const [x,y] of [[tx+1,ty],[tx-1,ty],[tx,ty+1],[tx,ty-1]])if(A.walk(x,y)){const c=field?.[A.tileIndex(x,y)]??-1;if(c>=0&&(best<0||c<best)){best=c;step={x:x*T+24,y:y*T+24};}}if(step){dx=step.x-e.x;dy=step.y-e.y;}}const d=Math.hypot(dx,dy)||1;A.face(e,dx,dy);const nx=e.x,ny=e.y;A.move(e,dx/d*speed*dt,dy/d*speed*dt);e.moving=true;}
 A.enemyStep=function(e,dt){
  if(e.boss){if(A.g?.secret?.state==='fight'&&e.dk==='iron')return;return bossStep(e,dt);}
  if(A.g?.secret?.state==='fight'&&!e.summoner)return;
  return old.enemyStep(e,dt);};

 // ================= daño a jefes =================
 A.hurt=function(e,d,owner,projectile){
  if(!e.boss||e.hp<=0)return old.hurt(e,d,owner,projectile);
  if(e.invuln){if(!e.blockT||A.clock-e.blockT>.35){e.blockT=A.clock;A.fx('s_ring_white',e.x,e.y,2,.3);}return;}
  if(e.bossState==='sleep'){d*=1.3;e.sleepDmg=(e.sleepDmg||0)+d;}
  const skill=projectile?.skill||owner?.castingSkill;
  if(e.sub){
   if(e.bossState==='recover'||e.bossState==='stagger')d*=1.4;else if(!skill)d*=.72;
   if(skill&&owner&&e.bossState!=='stagger'&&A.clock-(e.staggerHits?.[owner.pid]??-99)>.65){e.staggerHits??={};e.staggerHits[owner.pid]=A.clock;e.stagger=(e.stagger||0)+1;if(e.stagger>=5){e.stagger=0;e.bossState='stagger';e.stateTime=2.1;e.warning=null;e.z=0;e.pose=null;A.fx('hit',e.x,e.y,2,.4);}}
  }
  const buf=ph(e)===1?e.max*.3:0;e.hp+=buf;e.boss=!e.sub;
  try{old.hurt(e,d,owner,projectile);}finally{e.boss=true;}
  if(buf){e.hp=Math.max(e.hp-buf,e.max*.01);}
  if(e.hp<=0&&!e.fin){e.fin=true;onDeath(e);}
 };
 function onDeath(e){
  for(const m of A.enemies)if(m.summoner===e.eid&&m.hp>0){m.hp=0;m.dead=.6;}
  if(!e.sub&&e.dk!=='iron')return;
  A.hazards=[];A.shots=A.shots.filter(b=>!b.hostile);e.sched=[];
  const g=A.g,d=defOf(e),lvl=e.level,ps=A.players.filter(p=>!p.disconnected);
  for(const p of ps){A.gainXP(p,Math.round(90+lvl*9));p.coins+=Math.round(60+lvl*3);}
  const keys=[...(d.drops||[])];if(window.ECOS_ITEMS11?.rare)keys.push(pickOf(window.ECOS_ITEMS11.rare));
  keys.forEach((k,i)=>{if(!RPG_ITEMS[k])return;const g2=Math.PI*2*i/keys.length;A.loot.push({lid:'sub'+e.eid+i,x:e.x+Math.cos(g2)*46,y:e.y+Math.sin(g2)*46,key:k,taken:false});});
  A.loot.push({lid:'sub'+e.eid+'x',x:e.x,y:e.y+50,key:'revive',taken:false});
  if(e.dk==='iron'){A.g.ironKills=(A.g.ironKills||0)+1;if(A.g.iron)A.g.iron.state='dead';say(IRON.say.death,e.name,1160,{menace:true,patch:true});A.toast('¡IronJaw ha sido derrotado! Por ahora…');}
  else{const dk=SUBS[e.dk];if(dk.say?.death)say(dk.say.death,dk.name,dk.id);A.toast(dk.name+' vencido. Se abre la salida de la sala secreta.');if(g.secret){g.secret.state='cleared';g.secret.exit={x:(g.secret.arena.x+g.secret.arena.w/2)*T,y:(g.secret.arena.y+g.secret.arena.h/2)*T};}}
 }

 // ================= salas secretas =================
 function buildSecret(){const g=A.g;g.secret=null;if(A.bossFloor()||!isSecretFloor(g.floor))return;
  const rng=A.seeded(g.seed+g.floor*4421),rooms=g.rooms.slice(1).filter(r=>!(g.stairs&&Math.abs(g.stairs.x/T-r.cx)<5&&Math.abs(g.stairs.y/T-r.cy)<5));if(!rooms.length)return;
  const r=rooms[Math.floor(rng()*rooms.length)],W=34,H=22,ax=Math.floor((g.mw-W)/2),ay=g.mh+3,oldH=g.mh,newH=ay+H+3;
  g.map.length=g.mw*newH;g.fog.length=g.mw*newH;for(let i=g.mw*oldH;i<g.mw*newH;i++){g.map[i]=0;g.fog[i]=0;}g.mh=newH;
  A.carve(ax,ay,W,H);
  for(const [px,py] of [[ax+8,ay+6],[ax+W-10,ay+6],[ax+8,ay+H-8],[ax+W-10,ay+H-8],[ax+Math.floor(W/2)-1,ay+Math.floor(H/2)-1]])for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++)g.map[A.tileIndex(px+xx,py+yy)]=0;
  let total=0;for(let i=0;i<g.mw*oldH;i++)if(g.map[i])total++;
  const n=secretIndex(g.floor),key=window.ECOS_SUBS_ORDER[n%window.ECOS_SUBS_ORDER.length];
  g.secret={state:'hidden',door:{x:(r.cx+.5)*T,y:(r.cy+.5)*T},arena:{x:ax,y:ay,w:W,h:H},key,lap:Math.floor(n/window.ECOS_SUBS_ORDER.length),total,ret:null};}
 A.generateFloor=function(){old.generateFloor();buildSecret();};
 function walkable(){return A.g.secret.total;}
 function explored(){const g=A.g;let c=0;const lim=g.mw*(g.mh-g.secret.arena.h-6);for(let i=0;i<lim;i++)if(g.map[i]&&g.fog[i])c++;return c/Math.max(1,g.secret.total);}
 function enterSecret(a){const g=A.g,s=g.secret,team=A.players.filter(p=>!p.disconnected);if(team.some(p=>!p.down&&dist(p,s.door)>300)){A.toast('Reúne al equipo junto a la puerta secreta.');return;}
  s.ret={x:s.door.x,y:s.door.y};s.state='fight';A.hazards=[];A.shots=A.shots.filter(b=>!b.hostile);
  const cx=(s.arena.x+s.arena.w/2)*T,cy=(s.arena.y+s.arena.h-4)*T;team.forEach((p,i)=>{p.x=cx+(i-(team.length-1)/2)*60;p.y=cy;p.prevX=p.x;p.prevY=p.y;p.vx=0;p.vy=0;});
  for(let y=s.arena.y-1;y<=s.arena.y+s.arena.h;y++)for(let x=s.arena.x-1;x<=s.arena.x+s.arena.w;x++)g.fog[A.tileIndex(x,y)]=1;
  A.camera.x=cx;A.camera.y=cy;A.fx('discharge',cx,cy,3,.6);
  const d=SUBS[s.key];A.toast('Sala secreta · '+d.name+', '+d.title);
  s.spawnAt=B.t+1.3;}
 function leaveSecret(){const g=A.g,s=g.secret;const team=A.players.filter(p=>!p.disconnected);team.forEach((p,i)=>{p.x=s.ret.x+(i%2)*46-23;p.y=s.ret.y+60+Math.floor(i/2)*46;p.prevX=p.x;p.prevY=p.y;});s.state='done';A.camera.x=s.ret.x;A.camera.y=s.ret.y;A.toast('Regresas a la mazmorra.');}
 function secretStep(dt){const g=A.g,s=g.secret;if(!s)return;
  if(s.state==='hidden'){s.chk=(s.chk||0)-dt;if(s.chk<=0){s.chk=.6;const th=A.players.some(p=>p.job==='explorer')?.33:.5;if(explored()>=th){s.state='found';for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)g.fog[A.tileIndex(Math.floor(s.door.x/T)+x,Math.floor(s.door.y/T)+y)]=1;A.toast('Has oído un eco tras la pared… ¡hay una puerta secreta en este piso!');A.fx('star',s.door.x,s.door.y,3,.8);}}}
  if(s.state==='fight'&&s.spawnAt&&B.t>=s.spawnAt){s.spawnAt=0;const d=SUBS[s.key],cx=(s.arena.x+s.arena.w/2)*T,cy=(s.arena.y+5)*T,e=spawnBossEntity(d.id,cx,cy,s.key);e.level+=s.lap*3;A.combat7.scale(e);e.hp=e.max;e.bar=e.hp;
   say(d.say.intro,d.name,d.id);}}
 const downInteract=a=>A.players.some(b=>b.down&&!b.disconnected&&dist(a,b)<90);
 A.interact=function(a,dt,pressed){const g=A.g;if(pressed&&g&&!downInteract(a)){const s=g.secret;
   if(s?.state==='found'&&dist(a,s.door)<95){enterSecret(a);return;}
   if(s?.state==='cleared'&&s.exit&&dist(a,s.exit)<95){leaveSecret();return;}
}
  return old.interact.call(this,a,dt,pressed);};

 // ================= IronJaw, el villano recurrente =================
 function ironFloor(){return ironFloors.includes(A.g.floor);}
 function ironInit(){const g=A.g;g.iron=null;if(A.bossFloor()||!ironFloor()||g.secret?.state==='fight')return;g.iron={state:'wait',t:rnd(22,38)};}
 function ironStep(dt){const g=A.g,i=g.iron;if(!i||g.secret?.state==='fight')return;
  if(i.state==='wait'){i.t-=dt;if(i.t<=0){const ps=A.active();if(!ps.length)return;const spots=(g.spawnPoints||[]).filter(p=>Math.min(...ps.map(q=>dist(p,q)))>850).sort((a,b)=>Math.min(...ps.map(q=>dist(b,q)))-Math.min(...ps.map(q=>dist(a,q))));const p=spots[0];if(!p){i.t=5;return;}
   const e=spawnBossEntity(IRON.id,p.x,p.y,'iron');e.level+=2+(g.ironN||0)*2;A.combat7.scale(e);e.hp=e.max;e.bar=e.hp;e.hunt=true;e.invuln=true;e.bossState='approach';e.stateTime=99;i.state='hunt';i.eid=e.eid;g.ironN=(g.ironN||0)+1;
   A.toast('¡Algo enorme recorre la mazmorra! IronJaw te ha olfateado…');}}
  else if(i.state==='hunt'){const e=A.enemies.find(x=>x.eid===i.eid);if(!e||e.hp<=0){i.state='dead';return;}const a=target(e);if(a&&dist(e,a)<560&&e.hunt){e.hunt=false;e.bossState='intro';e.stateTime=0;const lines=(g.ironN||1)<=1?IRON.say.first:IRON.say.again;const t=say(lines,IRON.name,1160,{menace:true,patch:(g.ironN||1)>1});e.stateTime=(t||4)+.3;e.invuln=true;i.state='fight';}}}
 // Si el equipo escapa por las escaleras con IronJaw vivo, se burla y volverá.
 A.nextFloor=function(...args){const prev=A.g?.iron;old.nextFloor.apply(this,args);const g=A.g;if(!g)return;ironInit();
  if(prev&&(prev.state==='fight'||prev.state==='hunt')&&A.NET.role!=='client'){g.dlgQ=[];say(IRON.say.escape,IRON.name,1160,{menace:true});if(!g.iron&&!A.bossFloor())g.iron={state:'wait',t:rnd(14,22)};}};

 A.step=function(dt){old.step.call(this,dt);if(A.g&&A.state==='play'&&!A.g.paused&&!A.g.assetLoading&&A.NET.role!=='client'&&!A.g.ended){B.t+=dt;runDialog(dt);secretStep(dt);ironStep(dt);}};

 // ================= red =================
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.boss)for(const k of ['pose','poseT','poseOnce','bigH','sub','invuln','title','phase','bossState','moveName','dk'])if(a[k]!==undefined)o[k]=a[k];return o;};
 A.packWorld=function(){return{...old.packWorld(),secret:A.g.secret};};
 A.applyWorld=function(w){old.applyWorld(w);A.g.secret=w.secret||null;};
 A.packState=function(){return{...old.packState(),secret:A.g.secret,dlg:A.g.dlg};};
 A.applyState=function(s){old.applyState(s);if(!A.g)return;A.g.secret=s.secret||null;if(s.dlg)A.g.dlg=s.dlg;};

 // ================= dibujo de puerta y salida =================
 window.ECOS_BOSS11_DRAW=({obj,label,onScreen})=>{const g=A.g,s=g?.secret;if(!s)return;
  if(s.state==='found'&&A.seen(s.door)&&onScreen(s.door)){obj('Stairs_Down','secret-door',s.door.x,s.door.y,2);label('secret-door-label','F · Entrar en la sala secreta',s.door.x,s.door.y+42,'#d6c3f2');}
  if(s.state==='cleared'&&s.exit&&onScreen(s.exit)){obj('Evolution','secret-exit',s.exit.x,s.exit.y,2);label('secret-exit-label','F · Volver a la mazmorra',s.exit.x,s.exit.y+42,'#d6c3f2');}};
 A.boss11={PATS,prep,spawnBossEntity,say,defOf,B,isSecretFloor,secretIndex,ironFloors,buildSecret,enterSecret,leaveSecret,beginFlee,beginRoar,startSleep};
};
