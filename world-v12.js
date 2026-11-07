'use strict';
/* v12 · Vida en el mundo: encuentros con NPC y mini-historias por bioma, fenómenos ambientales y enemigos con comportamiento propio. */
window.ECOS_WORLD12=function(A){
 const dist=A.distance,esc=A.escape,$=id=>document.getElementById(id),S=window.RPG_SPECIES,I=window.RPG_ITEMS;
 const old={generateFloor:A.generateFloor,interact:A.interact,requestAction:A.requestAction,netAction:A.NET.callbacks.action,packWorld:A.packWorld,packState:A.packState,applyWorld:A.applyWorld,applyState:A.applyState,enemy:A.enemy,enemyStep:A.enemyStep,hurt:A.hurt,cleanActor:A.cleanActor,step:A.step};
 const host=()=>A.NET.role!=='client';
 // ---------- historias por bioma ----------
 // fx: heal · pot · ether · xp · gold · gear · ambush · hurtxp · reveal · shield
 const ST={
  rock:[{npc:74,name:'Geodude, el minero',l:['¡Eh, tú! Llevo horas atrapado bajo este derrumbe y mi pico se rompió.','Dicen que bajo estas rocas hay vetas de mineral… pero también algo que se mueve.'],o:[['Ayudarle a salir','Pierdes un rato, pero él te agradece.','pot','Geodude sale tosiendo polvo y te regala dos Pociones que guardaba.'],['Pedirle que te lleve a su veta','Puede haber riqueza… o problemas.','ambush','La veta estaba vigilada. ¡Salen enemigos del derrumbe! Te dejan una bolsa de oro.'],['Dejarlo','Sigues tu camino.','','Geodude murmura algo sobre la falta de compañerismo.']]},
  {npc:95,name:'Onix cría, perdido',l:['Un pequeño Onix se enrosca en una esquina, temblando.','Su madre ruge a lo lejos. No sabe cómo volver.'],o:[['Guiarlo hasta la salida','El camino es largo, pero seguro.','xp','Lo acompañas y aprendes atajos de la cantera. Ganas experiencia.'],['Ofrecerle comida','Le das de comer.','heal','Su madre aparece, agradecida, y una vibración sanadora recorre al equipo.']]}],
  water:[{npc:79,name:'Slowpoke, el pescador',l:['Llevo tres días esperando que algo pique. Slowpoke no se inmuta.','La marea sube cada vez más. Dicen que no es normal.'],o:[['Pescar con él','Un rato de calma junto al agua.','ether','Pican algo raro: una burbuja de energía. Recuperas PM y un Éter.'],['Preguntarle por la marea','Él sabe cosas de este lugar.','reveal','Señala en el agua el camino hacia las escaleras.'],['Ignorarlo','Sigues explorando.','','El anzuelo sigue colgando. Slowpoke bosteza.']]},
  {npc:54,name:'Psyduck con dolor de cabeza',l:['Psyduck se agarra la cabeza. Algo en el aire le hace daño.','Cada vez que se concentra, el agua a su alrededor se agita.'],o:[['Calmarlo con una canción','Haces un poco de silencio.','shield','El agua deja de agitarse y una burbuja protectora envuelve al equipo.'],['Aprovechar su poder','Lo animas a descargar.','ambush','Psyduck libera un pulso… que atrae enemigos. Él te agradece con oro.']]}],
  spark:[{npc:100,name:'Voltorb de juguete',l:['Parece una Poké Ball… pero zumba. Está cargada de electricidad.','Hay un cartel torcido: "NO TOCAR".'],o:[['Descargarla con cuidado','Un poco de riesgo.','hurtxp','Te llevas un calambre, pero absorbes parte de la energía. Ganas experiencia.'],['Rodearla','Mejor no arriesgar.','','Te alejas despacio. La Voltorb zumba aliviada.'],['Golpearla','Es una mala idea.','ambush','¡Explota en chispas y atrae a los guardianes de la pradera! Cae oro del cielo.']]},
  {npc:81,name:'Magnemite, el técnico',l:['Magnemite flota entre cables rotos del viejo generador de la pradera.','Si lo reparas, dice, te dejará una parte de su colección.'],o:[['Ayudarle a reparar','Un poco de maña.','gear','El generador se enciende y Magnemite te entrega una pieza de equipo.'],['Pedirle ánimo','Solo conversación.','shield','Magnemite proyecta un campo y te da un escudo temporal.']]}],
  leaf:[{npc:43,name:'Oddish, la jardinera',l:['Oddish riega unas flores que brillan con una luz suave.','"Si me ayudas a regarlas, florecen y curan", dice con voz soñolienta.'],o:[['Regar las flores','Un rato tranquilo.','heal','Las flores florecen y su polen cura al equipo.'],['Recoger semillas','Te llevas provisiones.','pot','Guardas semillas curativas para el camino.'],['Pisotearlas','No es muy amable.','ambush','Las flores sueltan esporas y el bosque se enfurece. Algo se mueve entre las hojas…']]},
  {npc:69,name:'Bellsprout, el guardabosques',l:['Bellsprout vigila un sendero cubierto de raíces.','"Algo anda talando el bosque. Si lo detienes, el camino será seguro."'],o:[['Prometer ayudar','Aceptas el encargo.','xp','Cuando vuelves, ha limpiado el camino y te enseña un par de trucos.'],['Pedir su mapa','Te lo da a cambio de nada.','reveal','Marca en tu mapa la ruta a las escaleras.']]}],
  poison:[{npc:109,name:'Koffing, el alquimista',l:['Koffing burbujea frente a un caldero humeante.','"¡Casi lo tengo! Una poción sin efectos secundarios… ¿Quieres probarla?"'],o:[['Probar la poción','Puede salir bien… o mal.','hurtxp','Sabe fatal y te marea, pero sientes una fuerza nueva. Ganas experiencia.'],['Comprarle la receta','Una versión segura.','pot','Te vende dos pociones sin riesgo.'],['Rechazar','No te fías.','','Koffing se encoge de hombros y vuelve a su caldero.']]}],
  psychic:[{npc:63,name:'Abra, el vidente',l:['Abra mantiene los ojos cerrados. Sabe que estás aquí.','"Veo dos futuros", susurra. "En uno ganas fuerza. En el otro encuentras el camino."'],o:[['Elegir fuerza','Aceptas la visión.','xp','Una oleada de visiones te enseña a pelear mejor. Ganas experiencia.'],['Elegir el camino','Aceptas el mapa.','reveal','Abra proyecta el camino hacia las escaleras en tu mente.'],['Pedir ambos','Eso tiene un precio.','hurtxp','Abra sonríe. Pagas con tus fuerzas, pero obtienes la visión completa.']]}],
  fire:[{npc:77,name:'Ponyta, la mensajera',l:['Ponyta patea el suelo con las llamas ardiendo en su crin.','"Llevo un mensaje al otro lado de la caldera, pero el camino arde. ¿Corres conmigo?"'],o:[['Correr con ella','Calor y velocidad.','shield','Su llama protectora te cubre durante la carrera.'],['Pedirle que te lleve','Un viaje corto.','reveal','Te deja junto a las escaleras y señala el camino.']]}],
  ice:[{npc:86,name:'Seel, el explorador polar',l:['Seel toma el sol sobre un témpano, con una bufanda improvisada.','"El hielo canta cuando va a romperse. Ahora mismo canta mucho."'],o:[['Escuchar su consejo','Escuchas con atención.','reveal','Seel te señala el único camino firme hacia las escaleras.'],['Compartir calor','Os sentáis juntos.','heal','El calor compartido recupera al equipo.'],['Retarlo a un deslizamiento','Un poco de diversión.','xp','Pierdes el desafío, pero aprendes a moverte mejor sobre el hielo.']]}],
  hit:[{npc:66,name:'Machop, el instructor',l:['Machop golpea un saco de arena con una paciencia infinita.','"Un combate de práctica, solo uno. Si resistes, te enseño mi secreto."'],o:[['Aceptar el reto','Un combate real.','ambush','Sus discípulos se unen al combate. Aguantas y recibes una recompensa.'],['Entrenar con él','Entrenamiento tranquilo.','xp','Pasas horas golpeando el saco. Ganas experiencia.'],['Rechazar','No hay tiempo.','','Machop asiente con respeto y vuelve a su saco.']]}],
  ghost:[{npc:92,name:'Gastly, el narrador',l:['Un Gastly flota sobre una vela casi apagada y susurra una historia.','"Un explorador cayó aquí hace años. Su equipo aún vaga buscando la salida."'],o:[['Escuchar hasta el final','Algo frío te recorre.','gear','Al final de la historia, un objeto olvidado cae a tus pies.'],['Encender la vela','Un gesto amable.','heal','La vela brilla y una calidez inesperada recorre al equipo.'],['Reírte','El silencio se vuelve pesado.','ambush','Aparecen sombras furiosas. Dejan oro al desaparecer.']]}],
  dragon:[{npc:147,name:'Dratini, el aprendiz',l:['Dratini se enrosca nervioso junto a una grieta.','"Mi maestro dice que debo vencer a un guardián antes de evolucionar. ¿Me ayudas?"'],o:[['Ayudarlo en el combate','Una batalla real.','ambush','Los guardianes aparecen. Dratini lucha a tu lado y te deja oro.'],['Darle un consejo','Palabras alentadoras.','xp','Dratini se siente fuerte. Tú también ganas experiencia.']]}]
 };
 const GENERIC=[{npc:25,name:'Explorador cansado',l:['Un explorador herido se apoya contra la pared.','"Llevo días aquí abajo. ¿Tienes algo para ayudarme?"'],o:[['Darle una Poción','Gastas una Poción.','xp','Te agradece con un consejo valioso. Ganas experiencia.'],['Compartir provisiones','Le das de comer.','heal','Comparte su ánimo con tu equipo.'],['Pasar de largo','Sigues tu camino.','','No dice nada.']]}];
 const OUT={
  heal:a=>{for(const b of A.players)if(!b.down){b.hp=Math.min(b.max,b.hp+b.max*.35);}},
  pot:a=>{a.bag.potion=(a.bag.potion||0)+2;},ether:a=>{a.bag.ether=(a.bag.ether||0)+1;a.mp=a.maxMp;},
  xp:a=>{A.gainXP(a,60+A.g.floor*4);},gold:a=>{a.gold=(a.gold||0)+30+A.g.floor*2;},
  reveal:a=>{A.g.stairsKnown=true;},shield:a=>{for(const b of A.players)b.shield=Math.max(b.shield||0,10+A.g.floor);},
  hurtxp:a=>{a.hp=Math.max(1,a.hp-a.max*.2);A.gainXP(a,90+A.g.floor*5);},
  gear:a=>{const jobs=A.players.map(p=>p.job),pool=Object.keys(I).filter(k=>I[k].type==='gear'&&!I[k].fused&&!I[k].unique&&(!I[k].jobs||I[k].jobs.some(j=>jobs.includes(j))));if(pool.length){const k=A.lootRoll?A.lootRoll('event',undefined,{min:'m'}).key:A.pick(pool);a.bag[k]=(a.bag[k]||0)+1;A.lootFx?.(a,k);}},
  ambush:(a,n)=>{const st=A.stage(),pool=st.pool||[19],ps=A.g.spawnPoints.filter(p=>dist(p,n)>40&&dist(p,n)<420);for(let i=0;i<3;i++){const p=ps[Math.floor(Math.random()*ps.length)]||n;const e=A.enemy(pool[i%pool.length],p.x,p.y);A.enemies.push(e);}a.gold=(a.gold||0)+40+A.g.floor*2;}
 };
 const npc=()=>A.g?.npc12;
 const near=a=>{const n=npc();return n&&!n.used&&a&&!a.down&&!a.disconnected&&dist(a,n)<115&&A.clearLine(a,n);};
 A.generateFloor=function(){old.generateFloor();const g=A.g;g.npc12=null;g.ambT=8;if(A.bossFloor()||g.floor<3||g.floor%2===0)return;
  const rng=A.seeded(g.seed+g.floor*4177),sv=g.skyVisit,al=g.altar;const pts=g.spawnPoints.filter(p=>dist(p,g.spawn)>220&&dist(p,g.stairs)>120&&(!sv||dist(p,sv)>160)&&(!al||dist(p,al)>160));if(!pts.length)return;
  const p=pts[Math.floor(rng()*pts.length)],kind=A.stage()?.kind,list=ST[kind]||GENERIC,s=list[Math.floor(rng()*list.length)];
  g.npc12={x:p.x,y:p.y,id:'npc-'+g.floor,sp:s.npc,name:s.name,l:s.l,o:s.o.map(o=>({t:o[0],d:o[1],fx:o[2],r:o[3]})),used:false};A.loadActor(s.npc).catch(()=>{});};
 function resolve(a,key){if(!A.g||A.g.ended||(A.localMode==='online'&&A.g.paused)||!near(a))return false;const n=npc(),[id,i]=String(key).split('|'),o=n.o[+i];if(id!==n.id||!o)return false;
  if(o.fx==='pot'&&false)return false;if(o.fx&&OUT[o.fx])OUT[o.fx](a,n);n.used=true;n.result=o.r;A.toast(n.name+': '+o.r);return true;}
 function open(){const a=A.me(),n=npc();if(!near(a))return;A.keys.clear();A.uiMode='npc12';if(A.localMode!=='online')A.g.paused=true;
  A.panel(`<div class="pathBook"><span class="eyebrow">ENCUENTRO · ${esc(A.stage?.()?.zone||'Mazmorra')}</span><h2>${esc(n.name)}</h2><div class="visitTalk"><img class="visitFace" src="assets/portraits/${n.sp}.png" onerror="this.onerror=null;this.src='assets/bw/${n.sp}.gif'" alt=""><div class="visitBubble">${n.l.map(t=>`<p>“${esc(t)}”</p>`).join('')}</div></div><div class="eventChoices">${n.o.map((o,i)=>`<button data-npc="${i}">${esc(o.t)}<br>${esc(o.d)}</button>`).join('')}</div></div>`);
  document.querySelectorAll('[data-npc]').forEach(b=>b.onclick=()=>{A.requestAction('npc12',n.id+'|'+b.dataset.npc);A.closeUI();});}
 A.interact=function(a,...args){if(near(a)){if(a.pid===A.myPid&&!A.uiMode)open();return;}return old.interact(a,...args);};
 A.requestAction=function(type,key){if(type==='npc12'){if(A.NET.role==='client')A.NET.action(type,key);else resolve(A.me(),key);return;}old.requestAction(type,key);};
 A.NET.callbacks.action=(pid,type,key)=>type==='npc12'?resolve(A.players.find(a=>a.pid===pid),key):old.netAction?.(pid,type,key);
 const extra=()=>({npc12:A.g?.npc12});A.packWorld=()=>({...old.packWorld(),...extra()});A.packState=()=>({...old.packState(),...extra()});
 const take=o=>{if(A.g&&o){A.g.npc12=o.npc12;if(o.npc12)A.loadActor(o.npc12.sp).catch(()=>{});}};
 A.applyWorld=function(w){old.applyWorld(w);take(w);};A.applyState=function(s){const ok=A.g&&s.runId===A.g.runId&&s.floor===A.g.floor;old.applyState(s);if(ok)take(s);};
 // ---------- enemigos con comportamiento ----------
 const ICON={burrow:'⛏',volatile:'💥',healer:'✚',frenzy:'🔥',pack:'🐾'},BYKIND={rock:['burrow',.35],poison:['volatile',.4],ghost:['volatile',.3],leaf:['healer',.3],psychic:['healer',.25],hit:['frenzy',.45],fire:['frenzy',.35],dragon:['frenzy',.3],water:['pack',.5],spark:['pack',.5],ice:['pack',.4]};
 A.enemy=function(...args){const e=old.enemy(...args);if(e.boss||!A.g||A.g.floor<3)return e;const b=BYKIND[A.stage()?.kind||e.kind];if(b&&Math.random()<b[1]){e.beh=b[0];e.tagIcon=ICON[b[0]];e.bT=2+Math.random()*5;e.bs0=e.baseSpeed;}return e;};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.beh){o.beh=a.beh;o.tagIcon=a.tagIcon;if(a.burrow>0)o.burrow=a.burrow;if(a.quiet>0)o.quiet=Math.round(a.quiet*10)/10;}return o;};
 A.hurt=function(e,d,owner,p){if(e.burrow>0)return;const was=e.hp,r=old.hurt.call(this,e,d,owner,p);
  if(was>0&&e.hp<=0&&e.beh&&host()){
   if(e.beh==='volatile'){A.hazards.push({x:e.x,y:e.y,r:85,age:0,delay:.8,life:1.2,kind:e.kind,damage:e.damage*1.5,level:e.level,once:true,hits:[]});}
   if(e.beh==='pack')for(const o of A.enemies)if(o!==e&&o.hp>0&&o.beh==='pack'&&dist(o,e)<340)o.packT=5;}
  return r;};
 A.enemyStep=function(e,dt){
  if(!e.beh||e.hp<=0||!host()||A.g?.ended)return old.enemyStep.call(this,e,dt);
  const live=A.active();
  if(e.quiet>0)e.quiet-=dt;
  if(e.beh==='burrow'){
   if(e.burrow>0){e.burrow-=dt;const t=live.sort((x,y)=>dist(e,x)-dist(e,y))[0];if(t){const d=dist(e,t)||1;A.move(e,(t.x-e.x)/d*240*dt,(t.y-e.y)/d*240*dt);}
    if(e.burrow<=0){e.burrow=0;A.hazards.push({x:e.x,y:e.y,r:70,age:0,delay:.6,life:.95,kind:e.kind,damage:e.damage*1.3,level:e.level,once:true,hits:[]});e.stun=Math.max(e.stun||0,.9);e.quiet=.9;}
    return;}
   e.bT-=dt;const t=live.sort((x,y)=>dist(e,x)-dist(e,y))[0];if(e.bT<=0&&t&&dist(e,t)<420&&dist(e,t)>90){e.burrow=1.3;e.bT=6+Math.random()*4;}
  }else if(e.beh==='healer'){e.bT-=dt;if(e.bT<=0){e.bT=3.2;const w=A.enemies.filter(o=>o!==e&&o.hp>0&&!o.boss&&o.hp<o.max*.8&&dist(o,e)<280).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(w){w.hp=Math.min(w.max,w.hp+w.max*.14);A.fx('star',w.x,w.y-10,1.2,.5);A.fx('star',e.x,e.y-10,1,.4);}}
  }else if(e.beh==='frenzy'){if(!e.enr&&e.hp<e.max*.4){e.enr=true;e.baseSpeed*=1.3;e.damage*=1.25;e.tagIcon='😡';e.flash=.4;}}
  else if(e.beh==='pack'){if(e.packT>0){e.packT-=dt;e.baseSpeed=(e.bs0||e.baseSpeed)*1.3;}else if(e.bs0)e.baseSpeed=e.bs0;}
  return old.enemyStep.call(this,e,dt);};
 // ---------- fenómenos ambientales ----------
 A.step=function(dt){old.step.call(this,dt);const g=A.g;if(!g||A.state!=='play'||g.paused||g.assetLoading||!host()||g.ended||g.floor<4)return;
  g.ambT=(g.ambT??10)-dt;if(g.ambT>0)return;g.ambT=Math.max(7,15-g.floor*.12)+Math.random()*4;
  const live=A.active();if(!live.length)return;const t=live[Math.floor(Math.random()*live.length)],a=Math.random()*6.28,r=60+Math.random()*120,x=t.x+Math.cos(a)*r,y=t.y+Math.sin(a)*r;
  if(!A.tileAt(x,y)||A.enemies.some(e=>e.boss&&e.hp>0&&dist(e,{x,y})<80)&&false)return;
  const kind=A.stage()?.kind||'hit';A.hazards.push({x,y,r:70,age:0,delay:1.1,life:1.5,kind,damage:(6+g.floor*.8)*(1+(g.floor>20?.4:0)),level:Math.round(3+g.floor*.85),once:true,hits:[],ambient:true});};
 // ---------- Placaje / Derribo y golpe desesperado ----------
 // Si te acercas demasiado, el enemigo carga contra ti (con aviso). Con ≤10 % de vida hace un golpe físico rápido, casi sin aviso.
 const prevStep=A.enemyStep;
 function nearestPlayer(e){let best=null,bd=1e9;for(const p of A.active()){const d=dist(p,e);if(d<bd){bd=d;best=p;}}return best?{p:best,d:bd}:null;}
 function knock(p,ang,px){const n=6,sx=Math.cos(ang)*px/n,sy=Math.sin(ang)*px/n;for(let i=0;i<n;i++)A.move(p,sx,sy);p.hurt=Math.max(p.hurt||0,.35);}
 function tackle(e,dt){
  const T=e.tk;
  if(e.sleep>0||e.stun>0||e.burrow>0||e.rushWindup>0||e.rushTime>0||e.bossState){if(T){e.tk=null;e.warning=null;}return false;}
  if(T){
   e.anim=(e.anim||0)+dt;A.face(e,Math.cos(T.ang),Math.sin(T.ang));
   if(T.ph==='wind'){e.moving=false;e.warning={line:true,angle:T.ang};T.t-=dt;if(T.t<=0){T.ph='dash';T.t=T.dash;e.warning=null;e.shotAnim=Math.max(e.shotAnim||0,T.dash);A.fx('hit',e.x,e.y,T.quick?1.2:1.6,.4);}return true;}
   if(T.ph==='dash'){T.t-=dt;A.move(e,Math.cos(T.ang)*T.speed*dt,Math.sin(T.ang)*T.speed*dt);e.moving=true;
    if(!T.hit)for(const b of A.active())if(dist(b,e)<b.r+e.r+6){T.hit=true;A.damage(b,e.damage*T.mult,e.kind,e.level);knock(b,T.ang,T.push);A.fx('hit',b.x,b.y,2,.35);}
    if(T.t<=0||T.hit&&T.t<T.dash*.35){e.tk=null;e.moving=false;e.stun=Math.max(e.stun||0,T.quick?.25:.55);}return true;}
   e.tk=null;return false;
  }
  e.tkCD=(e.tkCD??1.2+Math.random()*2.5)-dt;e.tkQCD=(e.tkQCD||0)-dt;
  const n=nearestPlayer(e);if(!n||n.d>320||!A.clearLine(e,n.p))return false;
  const ang=Math.atan2(n.p.y-e.y,n.p.x-e.x);
  if(e.hp<=e.max*.1&&e.tkQCD<=0&&n.d<260){e.tkQCD=3.4;e.tkCD=Math.max(e.tkCD,1.5);e.tk={ph:'wind',t:.16,dash:.2,speed:720,mult:1,push:50,ang,quick:true};e.flash=.3;return true;}
  if(n.d<e.r+n.p.r+85&&e.tkCD<=0){e.tkCD=4.5+Math.random()*2.5;e.tk={ph:'wind',t:.55,dash:.32,speed:430,mult:1.25,push:95,ang,quick:false};return true;}
  return false;}
 A.enemyStep=function(e,dt){if(e.hp>0&&!e.boss&&host()&&!A.g?.ended&&tackle(e,dt))return;return prevStep.call(this,e,dt);};
 A.world12={npc,open,ST,resolve};
};
