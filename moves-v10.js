'use strict';
// Pokémon Echoe's · combate coherente (v10)
// - Movimientos físicos = contacto con efecto de impacto; especiales = a distancia.
// - Cada especie tiene básico + 2 movimientos + aprendizaje por nivel (eliges cuál reemplazar).
// - Técnicas de clase propias (ya no son movimientos de Pokémon). MT útiles y sin repetirse.
// - Sustituto invoca un peluche que provoca (Mofa) a los enemigos.

// ---------- Parte estática: se ejecuta al cargar, antes de expedition-v6.js ----------
(()=>{
 const D=window.ECOS_V10_DATA,T=window.ECOS_TECH,M=T.moves,S=window.RPG_SPECIES;
 if(!D||!T||!S)return;
 window.ECOS_FX10=D.fx;D.fx.plush=['Substitute_Doll.png',32];
 // 1. Movimientos nuevos y correcciones de coherencia.
 let nextId=1000;for(const m of Object.values(M))nextId=Math.max(nextId,(m.id||0)+1);
 for(const [slug,def] of Object.entries(D.moves)){const m=M[slug]||(M[slug]={id:nextId++});Object.assign(m,def);}
 const TEXT={melee:'Golpe de contacto rápido.',cleave:'Golpe de contacto en arco frente a ti.',dash:'Embestida de contacto: te lanzas hacia delante y golpeas lo que encuentres.',shot:'Proyectil a distancia.',beam:'Rayo penetrante en línea recta.',fan:'Abanico de proyectiles.',wave:'Ráfaga ancha de proyectiles.',cone:'Chorro continuo en cono.',field:'Impacto de área a tu alrededor.'};
 const STATUS={taunt:'Mofa: los enemigos cercanos solo te atacan a ti durante 4 s.',burn:'Quema a los enemigos cercanos: daño continuo durante 6 s.',curse:'Maldice a los enemigos cercanos: veneno y lentitud. Cuesta el 12 % de tus PS.',decoy:'Deja un peluche de sustituto: provoca a los enemigos cercanos y absorbe sus golpes durante 9 s.'};
 for(const m of Object.values(M)){
  if(m.power>0&&TEXT[m.mode])m.desc=(m.category==='physical'?'Físico. ':'Especial. ')+TEXT[m.mode];
  if(STATUS[m.mode])m.desc=STATUS[m.mode];
 }
 M.substitute.mode='decoy';M.substitute.kind='psychic';M.substitute.cool=16;M.substitute.mana=26;
 if(M.taunt)M.taunt.cool=14;
 // 2. MT: pool curado y compatibilidad por especie.
 T.tms=D.tms.filter(s=>M[s]);
 for(const [id,list] of Object.entries(D.compat))T.compat[id]=list.filter(s=>M[s]);
 for(const n of T.tms){const m=M[n];m.floor??=m.power>90?35:m.power>65?18:m.power>45?8:1;m.rarity??=m.power>90?'épica':m.power>65?'rara':m.power>45?'poco común':'común';}
 // 3. Movimientos por defecto de cada especie a partir de su kit.
 const cache={};
 function build(slug,role){
  const key=role+':'+slug;if(cache[key])return cache[key];
  const b=M[slug];if(!b)return null;
  const m={name:b.name,mode:b.mode,kind:b.kind||b.type,type:b.type,category:b.category,power:b.power,mana:b.mana,cool:b.cool,desc:b.desc,slug};
  if(role==='b'){
   const phys=b.category==='physical';
   m.mode=phys?(b.mode==='cleave'&&/vine|whip|slash/.test(slug)?'cleave':'melee'):'shot';
   m.power=Math.min(Math.round((b.power||35)*(phys?1.1:1)),46);m.mana=0;m.cool=.42;delete m.slug;
   m.desc=(phys?'Ataque básico de contacto.':'Ataque básico a distancia.');
  }
  return cache[key]=m;
 }
 function startMoves(id){
  const K=D.kits[id];if(!K)return null;
  const first=K.l.filter(x=>x[0]<=5).map(x=>x[1]);
  const rest=K.l.map(x=>x[1]).filter(s=>!first.includes(s));
  const q=first[0]||rest.shift(),e=first[1]||rest.shift();
  return{b:K.b,q,e};
 }
 for(const [id,sp] of Object.entries(S)){const k=startMoves(id);if(!k)continue;const list=[build(k.b,'b'),build(k.q,'q'),build(k.e,'e')];if(list.every(Boolean))sp.moves=list;}
 window.ECOS_V10_CORE={build,startMoves,M,D};
 // 4. Sin elecciones de v8: la progresión de movimientos pasa a ser por nivel.
 if(window.ECOS_FAMILIES)window.ECOS_FAMILIES.choices={};
})();

// ---------- Parte dinámica ----------
window.ECOS_V10=window.ECOS_V10||{};
window.ECOS_V10_INIT=function(A){
 const {build,startMoves,M,D}=window.ECOS_V10_CORE,C=window.RPG_CLASSES,S=window.RPG_SPECIES,I=window.RPG_ITEMS;
 const $=id=>document.getElementById(id),esc=A.escape,dist=A.distance;
 const old={step:A.step,cleanActor:A.cleanActor,requestAction:A.requestAction,netAction:A.NET.callbacks.action,hud:A.hud,makePlayer:A.makePlayer};
 const API=window.ECOS_V10;

 // ----- kit del jugador -----
 function init(a){
  const s=startMoves(a.id)||{b:'pound',q:'tackle',e:'swift'};
  a.kit={b:s.b,q:s.q,e:s.e,sp:a.id,lv:a.level||5,seen:[s.q,s.e]};a.learnQ=[];return a.kit;
 }
 function moves(a){
  const k=a.kit||init(a);
  const base=S[a.id]?.moves||[];
  return [build(k.b,'b')||base[0],build(k.q,'q')||base[1],build(k.e,'e')||base[2]];
 }
 function scan(a){
  if(a.disconnected)return;
  const k=a.kit||init(a),K=D.kits[a.id];
  const queue=s=>{if(!k.seen.includes(s)&&s!==k.q&&s!==k.e){k.seen.push(s);a.learnQ.push(s);}};
  if(a.id!==k.sp){
   k.sp=a.id;if(K?.b)k.b=K.b;
   for(const [lv,s] of K?.l||[])if(lv<=a.level&&lv>a.level-9)queue(s);
   k.lv=a.level;if(a.pid===A.myPid&&a.learnQ.length)A.toast(S[a.id].name+' puede aprender '+a.learnQ.length+' movimiento(s) nuevo(s).');
  }else if(a.level>k.lv){
   const before=a.learnQ.length;
   for(const [lv,s] of K?.l||[])if(lv>k.lv&&lv<=a.level)queue(s);
   k.lv=a.level;if(a.pid===A.myPid&&a.learnQ.length>before)A.toast(a.name+' puede aprender '+M[a.learnQ[before]].name+'.');
  }
 }
 function learn(a,key){
  if(!a||!A.g||A.g.ended||a.down||a.disconnected||a.evolving)return false;
  const parts=String(key).split('|'),slug=parts.at(-2),slot=Number(parts.at(-1));
  if(!a.learnQ?.length||a.learnQ[0]!==slug||![0,1,2].includes(slot)||!M[slug])return false;
  a.learnQ.shift();
  if(slot){const k=a.kit,name=slot===1?'q':'e',prev=M[k[name]]?.name;k[name]=slug;a[name]=Math.max(a[name]||0,.6);A.toast(a.name+' olvidó '+prev+' y aprendió '+M[slug].name+'.');}
  else A.toast(a.name+' no aprendió '+M[slug].name+'.');
  return true;
 }

 // ----- técnicas de clase propias -----
 const CT={
  guardian:['Muro Vivo','protect','Escudo para el equipo cercano (5 s) y los enemigos de alrededor solo te atacan a ti durante 5 s.'],
  striker:['Frenesí','swords','Durante 7 s atacas más rápido, haces más daño y robas vida con cada golpe.'],
  support:['Pulso Vital','synthesis','Cura al equipo cercano, elimina estados alterados y deja regeneración durante 4 s.'],
  explorer:['Rastreo','psychic','Revela las escaleras y las trampas, desactiva las cercanas y te da velocidad 7 s.'],
  mage:['Nova Arcana','psychic','Explosión arcana alrededor de ti: gran daño de área del tipo de tu Pokémon.'],
  assassin:['Paso Sombrío','ghost','Te teletransportas tras el enemigo más débil y le asestas un golpe crítico.'],
  alchemist:['Mezcla Volátil','poison','Lanza un frasco que crea un charco de 5 s: veneno, fuego o hielo según la mezcla.'],
  engineer:['Torreta Voltorb','spark','Despliega una torreta fija que dispara a los enemigos 14 s (máximo 2).'],
  bard:['Canto Inspirador','star','Aura de 8 s: el equipo gana velocidad, maná y daño; los enemigos se ralentizan.'],
  chronomancer:['Distorsión Temporal','psychic','Zona de 6 s: los enemigos dentro casi se detienen y tus aliados recargan al doble de velocidad.'],
  summoner:['Eco Compañero','star','Invoca dos ecos móviles de tu equipo que luchan a tu lado durante 12 s.']
 };
 function classTech(a){
  const c=C[a.job],d=CT[a.job];if(!c||!d)return null;
  return{name:d[0],mode:'class',kind:d[1],type:'normal',category:'status',power:0,mana:c.cost,cool:c.cool,desc:d[2],source:'class',slug:'class-'+a.job,grant:false};
 }
 const near=(a,r)=>A.enemies.filter(e=>e.hp>0&&dist(a,e)<r&&A.clearLine(a,e));
 const ring=(x,y,kind,size)=>A.fx(kind,x,y,size,.7);
 function classEffect(a,m){
  const power=(a.skillPower||1),branch=a.branch;
  switch(a.job){
  case 'guardian':{for(const b of A.active().filter(b=>dist(a,b)<300&&A.clearLine(a,b)))b.shield=Math.max(b.shield||0,branch==='Bastión'?6:5);a.taunt=5;for(const e of A.enemies)if(e.hp>0&&!e.boss&&dist(a,e)<420)e.stagger=0;ring(a.x,a.y,'smash',4);break;}
  case 'striker':{a.buff=7;a.frenzyLeech=Math.max(a.frenzyLeech||0,7);a.physicalBoost=7;a.physicalAmp=Math.max(a.physicalAmp||1,1.3);a.specialBoost=7;a.specialAmp=Math.max(a.specialAmp||1,1.2);ring(a.x,a.y,'swords',2.4);break;}
  case 'support':{for(const b of A.active().filter(b=>dist(a,b)<300&&A.clearLine(a,b))){b.hp=Math.min(b.max,b.hp+b.max*(branch==='Clínico'?.33:.25)*(a.healPower||1));b.poison=0;b.sleep=0;b.burn=0;b.slow=0;b.aquaRing=4;b.ringPower=a.healPower||1;}ring(a.x,a.y,'synthesis',5);break;}
  case 'explorer':{A.g.stairsKnown=true;for(const t of A.g.traps||[]){t.revealed=true;if(dist(a,t)<220)t.armed=false;}a.haste=Math.max(a.haste||0,7);ring(a.x,a.y,'psychic',4);break;}
  case 'mage':{const kind=S[a.id].kind||'psychic';for(const e of near(a,310))A.hurt(e,A.dealt(a,a.damage*2.3*power),a,{skill:true});ring(a.x,a.y,kind,5);ring(a.x,a.y,'discharge',3);break;}
  case 'assassin':{const list=near(a,520).sort((x,y)=>x.hp-y.hp),t=list[0];a.inv=Math.max(a.inv,.9);a.haste=Math.max(a.haste||0,3);if(t){const ang=Math.atan2(t.y-a.y,t.x-a.x);ring(a.x,a.y,'ghost',2);for(let i=0;i<14;i++)A.move(a,Math.cos(ang)*Math.max(0,Math.min(18,(dist(a,t)-38)/14)),Math.sin(ang)*Math.max(0,Math.min(18,(dist(a,t)-38)/14)));A.hurt(t,A.dealt(a,a.damage*3.4*power)*(Math.random()<.5?1.5:1),a,{skill:true});ring(t.x,t.y,'hit',3);}break;}
  case 'alchemist':{const t=A.nearTarget(a)||{x:a.x+Math.cos(a.aim||0)*140,y:a.y+Math.sin(a.aim||0)*140};a.alchIdx=((a.alchIdx||0)+1)%3;const mix=['poison','fire','ice'][a.alchIdx];A.v4.zones.push({id:'alch'+A.clock+a.pid,owner:a.pid,x:t.x,y:t.y,r:135,mode:'firezone',kind:mix==='fire'?'fire':mix==='ice'?'ice':'poison',damage:a.damage*.4*power,life:5,tick:0,alch:mix});ring(t.x,t.y,mix==='fire'?'fire':mix==='ice'?'ice':'poison',4);break;}
  case 'engineer':{const hs=A.v4.helpers,mine=hs.filter(h=>h.owner===a.pid&&h.turret);while(mine.length>=(branch==='Mecánico'?3:2)){mine.shift().life=0;}const count=branch==='Mecánico'?2:1;for(let i=0;i<count;i++)hs.push({id:100,owner:a.pid,turret:true,x:a.x+(i?65:-65),y:a.y,life:branch==='Mecánico'?10:14,cool:0,stationary:true,damage:a.damage*(count===2?.7:1.25),dir:0,anim:0});ring(a.x,a.y,'spark',3);break;}
  case 'bard':{a.bardAura=8;a.bardTick=0;ring(a.x,a.y,'star',4);break;}
  case 'chronomancer':{a.timeZone={x:a.x,y:a.y,r:230,life:6,tick:0};ring(a.x,a.y,'psychic',5);break;}
  case 'summoner':{const hs=A.v4.helpers,mine=hs.filter(h=>h.owner===a.pid&&h.echo);while(mine.length>=(branch==='Enjambre'?4:2)){mine.shift().life=0;}const team=A.players.filter(p=>!p.disconnected&&!p.down).map(p=>p.id),count=branch==='Enjambre'?2:2;for(let i=0;i<count;i++)hs.push({id:team[(i+hs.length)%team.length]||a.id,owner:a.pid,echo:true,x:a.x+(i?55:-55),y:a.y+30,life:12,cool:0,stationary:false,damage:a.damage*(branch==='Enjambre'?.5:.75),dir:a.dir,anim:0,heals:branch==='Guía'});ring(a.x,a.y,'star',3);break;}
  }
 }

 // ----- movimientos de estado nuevos -----
 function special(a,m){
  switch(m.mode){
  case 'taunt':{a.taunt=4;for(const e of A.enemies)if(e.hp>0&&!e.boss&&dist(a,e)<380)e.tauntFlash=.6;A.fx('taunt_veins',a.x,a.y-10,2.2,.8);break;}
  case 'burn':{for(const e of near(a,250))e.burn=Math.max(e.burn||0,6);A.fx('will_o_wisp',a.x,a.y,3,.7);break;}
  case 'curse':{a.hp=Math.max(1,a.hp-a.max*.12);for(const e of near(a,270)){e.poison=Math.max(e.poison||0,8);e.slow=Math.max(e.slow||0,4);}A.fx('curse',a.x,a.y,3,.7);break;}
  case 'decoy':decoy(a);break;
  }
 }
 function decoy(a){
  const hs=A.v4.helpers;for(const h of hs)if(h.owner===a.pid&&h.decoy)h.life=0;
  const t=A.nearTarget(a),ang=t?Math.atan2(t.y-a.y,t.x-a.x):a.aim??0,hp=Math.round(a.max*.7);
  const h={id:a.id,owner:a.pid,decoy:true,plush:true,stationary:true,noAttack:true,x:a.x,y:a.y,life:9,cool:0,damage:0,dir:a.dir,anim:0,hp,max:hp,r:16,inv:0,hurt:0,down:false,disconnected:false,shield:0,bag:{},level:a.level,job:'decoy',armor:0,cd:0};
  for(let i=0;i<12;i++)A.move(h,Math.cos(ang)*6,Math.sin(ang)*6);
  hs.push(h);A.fx('psychic',h.x,h.y,2.4,.6);
 }
 // El objetivo que provoca: peluche vivo cercano, o un jugador con Mofa/Muro Vivo activos.
 function taunt(e){
  if(e.boss||!A.g)return null;
  let best=null,bd=520;
  for(const h of A.v4.helpers)if(h.decoy&&h.hp>0&&h.life>0){const d=dist(e,h);if(d<bd){bd=d;best=h;}}
  if(best)return best;
  for(const p of A.players)if(p.taunt>0&&!p.down&&!p.disconnected){const d=dist(e,p);if(d<bd){bd=d;best=p;}}
  return best;
 }

 // ----- MT útiles y sin repetirse -----
 function pickTM(g,rng){
  g.tmDropped??=[];
  const team=A.players.filter(p=>!p.disconnected);
  const known=new Set();for(const p of team){for(const s of p.learned||[])known.add(s);}
  const score=n=>team.filter(p=>(window.ECOS_TECH.compat[p.id]||[]).includes(n)&&!(p.learned||[]).includes(n)).length;
  let pool=window.ECOS_TECH.tms.filter(n=>M[n].floor<=g.floor+4&&!g.tmDropped.includes(n)&&score(n)>0);
  if(!pool.length)pool=window.ECOS_TECH.tms.filter(n=>score(n)>0&&!known.has(n));
  if(!pool.length)return null;
  // Prefiere las que más compañeros pueden usar y las de mayor utilidad por piso.
  const weighted=[];for(const n of pool){const w=score(n)*2+(M[n].power>=60||M[n].category==='status'?2:0);for(let i=0;i<w;i++)weighted.push(n);}
  const slug=weighted[Math.floor(rng()*weighted.length)];g.tmDropped.push(slug);return slug;
 }

 // ----- sistemas por fotograma (solo anfitrión / local) -----
 function systems(dt){
  for(const a of A.players){
   scan(a);
   if(a.taunt>0)a.taunt=Math.max(0,a.taunt-dt);
   if(a.bardAura>0){a.bardAura-=dt;a.bardTick=(a.bardTick||0)-dt;if(a.bardTick<=0){a.bardTick=.5;for(const b of A.active().filter(b=>dist(a,b)<300)){b.haste=Math.max(b.haste||0,1.2);b.mp=Math.min(b.maxMp,b.mp+1.4);b.physicalBoost=Math.max(b.physicalBoost||0,1);b.physicalAmp=Math.max(b.physicalAmp||1,1.15);b.specialBoost=Math.max(b.specialBoost||0,1);b.specialAmp=Math.max(b.specialAmp||1,1.15);}for(const e of A.enemies)if(e.hp>0&&dist(a,e)<300)e.slow=Math.max(e.slow||0,1);if(Math.random()<.4)A.fx('star',a.x+(Math.random()-.5)*120,a.y+(Math.random()-.5)*120,1.4,.5);}}
   const z=a.timeZone;
   if(z){z.life-=dt;z.tick-=dt;if(z.life<=0){a.timeZone=null;}else{for(const e of A.enemies)if(e.hp>0&&dist(e,z)<z.r){e.slow=Math.max(e.slow||0,.6);if(!e.boss)e.cd=(e.cd||0)+dt*.7;}for(const b of A.active())if(dist(b,z)<z.r){b.haste=Math.max(b.haste||0,.5);for(const k of ['q','e','rskill'])if(b[k]>0)b[k]=Math.max(0,b[k]-dt);if(b.moveCD)for(const k of Object.keys(b.moveCD))b.moveCD[k]=Math.max(0,b.moveCD[k]-dt);}if(z.tick<=0){z.tick=.9;A.fx('psychic',z.x,z.y,z.r/22,.7);}}}
  }
  for(const zn of A.v4.zones)if(zn.alch)for(const e of A.enemies)if(e.hp>0&&dist(e,zn)<zn.r){if(zn.alch==='poison')e.poison=Math.max(e.poison||0,2);if(zn.alch==='fire')e.burn=Math.max(e.burn||0,2);if(zn.alch==='ice')e.slow=Math.max(e.slow||0,1.5);}
  for(const h of A.v4.helpers)if(h.decoy){
   h.cd=(h.cd||0)-dt;h.hurt=Math.max(0,(h.hurt||0)-dt);
   if(h.cd<=0){const hit=A.enemies.find(e=>e.hp>0&&dist(e,h)<(e.r||15)+h.r+8);if(hit){h.cd=.7;h.hp-=Math.max(3,(hit.damage||12)*.55);h.hurt=.2;A.fx('hit',h.x,h.y,1,.3);}}
   if(h.hp<=0){h.life=0;A.fx('smash',h.x,h.y,2,.4);}
  }
 }
 A.step=function(dt){old.step(dt);if(A.g&&A.state==='play'&&!A.g.paused&&!A.g.assetLoading&&A.NET.role!=='client'&&!A.g.ended)systems(dt);};
 A.makePlayer=function(...args){const a=old.makePlayer(...args);init(a);return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['kit','learnQ','taunt','bardAura','timeZone'])if(a[k]!==undefined)o[k]=a[k];return o;};
 A.requestAction=function(type,key){if(type==='learn'){if(A.NET.role==='client')A.NET.action(type,key);else{const pid=String(key).split('|')[0];learn(A.localMode==='local'?A.players.find(p=>p.pid===pid)||A.me():A.me(),key);}return;}return old.requestAction.call(this,type,key);};
 A.NET.callbacks.action=(pid,type,key)=>type==='learn'?learn(A.players.find(a=>a.pid===pid),key):old.netAction?.(pid,type,key);

 // ----- tarjeta de aprendizaje -----
 let cardSig='';
 const label=m=>(m.category==='physical'?'Físico · contacto':m.category==='special'?'Especial · distancia':'Estado')+(m.power?' · Potencia '+m.power:'')+' · '+m.mana+' PM · '+m.cool+' s';
 function card(){
  if(!A.g||A.state!=='play'){$('learnCard')?.remove();cardSig='';return;}
  const a=A.localMode==='local'?(A.players.find(p=>p.learnQ?.length)||A.me()):A.me();
  const slug=a?.learnQ?.[0];
  let el=$('learnCard');
  if(!slug||A.uiMode){if(el)el.hidden=true;return;}
  const k=a.kit,sig=[a.pid,slug,k.q,k.e,a.learnQ.length].join('|');
  if(!el){document.body.insertAdjacentHTML('beforeend','<div id="learnCard" class="learnCard"></div>');el=$('learnCard');}
  el.hidden=false;if(sig===cardSig)return;cardSig=sig;
  const m=M[slug],q=M[k.q],e=M[k.e],lock=a.level<8;
  el.innerHTML=`<div class="learnHead"><b>${esc(a.name)} puede aprender</b><span>${a.learnQ.length>1?'+'+(a.learnQ.length-1)+' más':''}</span></div>
  <div class="learnMove"><strong>${esc(m.name)}</strong><small>${esc(label(m))}</small><p>${esc(m.desc||'')}</p></div>
  <div class="learnPick">
   <button data-learn="1"><small>Sustituir Q</small><b>${esc(q.name)}</b><em>${esc(label(q))}</em></button>
   <button data-learn="2" ${lock?'disabled':''}><small>Sustituir E</small><b>${esc(e.name)}</b><em>${lock?'Se desbloquea en Nv. 8':esc(label(e))}</em></button>
   <button data-learn="0" class="ghost"><small>Mantener</small><b>No aprender</b></button>
  </div>`;
  el.querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>{A.requestAction('learn',a.pid+'|'+slug+'|'+b.dataset.learn);cardSig='';setTimeout(card,120);});
 }
 A.hud=function(){old.hud();card();};
 setInterval(card,300);

 function studyMove(a){const have=a.learned||[],list=window.ECOS_TECH.tms.filter(n=>(window.ECOS_TECH.compat[a.id]||[]).includes(n)&&!have.includes(n)&&M[n].floor<=(A.g?.floor||1)+10);if(!list.length)return null;list.sort((x,y)=>(M[y].power||30)-(M[x].power||30));return list[Math.floor(Math.random()*Math.min(4,list.length))];}
 Object.assign(API,{studyMove,moves,classTech,classEffect,special,taunt,pickTM,learn,init,scan,build,kits:D.kits});
};
