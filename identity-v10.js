'use strict';
// Pokémon Echoe's · identidad por tipo y por clase (v10)
// - Tabla de tipos: daño recibido y causado (×1.3 débil, ×0.75 resiste, ×0.5 inmune parcial).
// - Habilidades naturales del Pokémon para abrir atajos y puertas.
// - Inmunidades a trampas y estados según el tipo.
// - Pasivas propias de cada clase.
// Descripciones de clase con su técnica única (R) y su pasiva.
const applyClassText=()=>{const C=window.RPG_CLASSES;if(!C)return;
 const D={
  guardian:['Muro Vivo','Más PS y resistencia. R: escudo al equipo y provoca a los enemigos cercanos. Pasiva: gana defensa al usar movimientos.'],
  striker:['Frenesí','Más daño y críticos. R: 7 s de ataque más rápido, más daño y robo de vida. Pasiva: puede abrir atajos a golpes.'],
  support:['Pulso Vital','Cura y rescata aliados. R: cura al equipo, limpia estados y regenera. Pasiva: rescata un 40 % más rápido.'],
  explorer:['Rastreo','Más velocidad y detección. R: revela escaleras y trampas, y desactiva las cercanas. Pasiva: ve las trampas de lejos.'],
  mage:['Nova Arcana','Gran daño especial. R: explosión arcana del tipo de tu Pokémon. Pasiva: tras un movimiento a distancia, el siguiente pega más.'],
  assassin:['Paso Sombrío','Críticos y movilidad. R: te teletransportas tras el enemigo más débil. Pasiva: esquivas brevemente tras golpear.'],
  alchemist:['Mezcla Volátil','Control de zona. R: charco de veneno, fuego o hielo. Pasiva: las pociones curan un 30 % más.'],
  engineer:['Torreta Voltorb','Torretas y herramientas. R: despliega una torreta fija. Pasiva: desactiva trampas al acercarse y no sufre pinchos.'],
  bard:['Canto Inspirador','Apoyo ofensivo. R: aura de velocidad, maná y daño para el equipo. Pasiva: ralentiza a los enemigos al cantar.'],
  chronomancer:['Distorsión Temporal','Control del tiempo. R: zona que frena a los enemigos y acelera tus recargas. Pasiva: reduce recargas de movimientos.'],
  summoner:['Eco Compañero','Invocación. R: dos ecos del equipo luchan a tu lado. Pasiva: los ecos comparten tus mejoras de rama.']
 };
 for(const [k,[skill,desc]] of Object.entries(D))if(C[k]){C[k].skill=skill;C[k].desc=desc;}
};

window.ECOS_ID10=function(A){
 applyClassText();
 const S=window.RPG_SPECIES,M=window.ECOS_TECH.moves,C=window.RPG_CLASSES,dist=A.distance;
 // ---------- tabla de tipos: ataque → [débiles, resistentes, inmunes] ----------
 const CH={
  normal:[[],['rock','steel'],['ghost']],fire:[['grass','ice','bug','steel'],['fire','water','rock','dragon'],[]],
  water:[['fire','ground','rock'],['water','grass','dragon'],[]],grass:[['water','ground','rock'],['fire','grass','poison','flying','bug','dragon','steel'],[]],
  electric:[['water','flying'],['electric','grass','dragon'],['ground']],ice:[['grass','ground','flying','dragon'],['fire','water','ice','steel'],[]],
  fighting:[['normal','ice','rock','dark','steel'],['poison','flying','psychic','bug','fairy'],['ghost']],poison:[['grass','fairy'],['poison','ground','rock','ghost'],['steel']],
  ground:[['fire','electric','poison','rock','steel'],['grass','bug'],['flying']],flying:[['grass','fighting','bug'],['electric','rock','steel'],[]],
  psychic:[['fighting','poison'],['psychic','steel'],['dark']],bug:[['grass','psychic','dark'],['fire','fighting','poison','flying','ghost','steel','fairy'],[]],
  rock:[['fire','ice','flying','bug'],['fighting','ground','steel'],[]],ghost:[['psychic','ghost'],['dark'],['normal']],
  dragon:[['dragon'],['steel'],['fairy']],dark:[['psychic','ghost'],['fighting','dark','fairy'],[]],steel:[['ice','rock','fairy'],['fire','water','electric','steel'],[]],
  fairy:[['fighting','dragon','dark'],['fire','poison','steel'],[]]
 };
 const KIND={leaf:'grass',spark:'electric',water:'water',fire:'fire',flame:'fire',ice:'ice',psychic:'psychic',ghost:'ghost',poison:'poison',rock:'rock',dragon:'dragon',hit:'normal',swords:'normal',smash:'fighting',star:'normal'};
 const typesOf=x=>S[x?.id]?.types||[];
 function mult(att,defTypes){
  if(!att||!CH[att]||!defTypes?.length)return 1;
  const [weak,res,imm]=CH[att];let m=1;
  for(const t of defTypes){if(imm.includes(t))m*=.5;else if(weak.includes(t))m*=1.3;else if(res.includes(t))m*=.75;}
  return Math.max(.45,Math.min(1.7,m));
 }
 const old={hurt:A.hurt,damage:A.damage,interact:A.interact,useItem:A.useItem};

 // Daño causado por jugadores: el tipo es el del movimiento usado (o el del ataque básico).
 A.hurt=function(e,d,a,p){
  if(a?.pid&&e&&!e.pid&&!e.boss){
   const slug=p?.moveSlug||a.castingMove,t=M[slug]?.type||(!a.castingSkill?M[a.kit?.b]?.type:null),m=mult(t,typesOf(e));
   if(m!==1)d*=m;
   if(m>1.2&&e.hp>0&&!(e.sfxT>A.clock)){e.sfxT=A.clock+.5;A.fx('smash',e.x,e.y-10,1.1,.25);}
  }
  return old.hurt(e,d,a,p);
 };
 // Daño recibido por jugadores y estados que el tipo ignora.
 A.damage=function(a,d,kind='hit',level,effect){
  if(a?.pid){
   d*=mult(KIND[kind]||null,typesOf(a));
   const ty=typesOf(a);
   if(effect==='poison'&&(ty.includes('poison')||ty.includes('steel')))effect=undefined;
   if(effect==='stun'&&ty.includes('ground'))effect=undefined;
  }
  return old.damage(a,d,kind,level,effect);
 };

 // ---------- habilidades naturales ----------
 const VINE=['grass','bug','fire','flying'],ROCK=['rock','ground','fighting','steel','dragon'],LOCK=['electric','psychic','ghost'];
 const hasAny=(a,list)=>typesOf(a).some(t=>list.includes(t));
 const NAME={grass:'Apartar lianas',bug:'Cortar con mandíbulas',fire:'Quemar la maleza',flying:'Corte con las alas',rock:'Romper con fuerza',ground:'Excavar el derrumbe',fighting:'Golpe de roca',steel:'Abrir a golpes',dragon:'Embestida draconiana',electric:'Cortocircuito',psychic:'Telequinesis',ghost:'Atravesar la cerradura'};
 const first=(a,list)=>typesOf(a).find(t=>list.includes(t));
 function natural(a,gate){
  if(!a||!gate)return null;
  if(gate.kind==='door'){const t=first(a,LOCK);return t&&(a.lockUsed?.[A.g.floor]!==true)?NAME[t]:null;}
  const t=first(a,gate.kind==='vines'?VINE:ROCK);return t?NAME[t]:null;
 }
 function useLock(a){a.lockUsed={...(a.lockUsed||{}),[A.g.floor]:true};}
 // Clases que aportan una especialidad para abrir atajos.
 const JOBS=['striker','guardian','engineer','explorer','alchemist','mage'];

 // ---------- trampas ----------
 const PROOF={spikes:['flying','ghost'],poison:['poison','steel'],sleep:['psychic','normal'],mana:['steel'],snare:['flying','ghost']};
 const trapProof=(a,kind)=>hasAny(a,PROOF[kind]||[])||(a.job==='engineer'&&kind==='spikes');

 // ---------- pasivas por clase y por tipo ----------
 A.interact=function(a,dt,pressed){
  // Apoyo rescata más deprisa.
  if(a.job==='support'&&A.players.some(b=>b!==a&&b.down&&!b.disconnected&&dist(a,b)<90))dt*=1.4;
  return old.interact.call(this,a,dt,pressed);
 };
 A.useItem=function(a,key){
  const before=a.hp,count=a.bag?.[key]||0;
  const r=old.useItem.call(this,a,key);
  if(a.job==='alchemist'&&(a.bag?.[key]||0)<count&&a.hp>before)a.hp=Math.min(a.max,a.hp+(a.hp-before)*.3);
  return r;
 };
 function systems(dt){
  for(const a of A.players){
   if(a.down||a.disconnected)continue;
   // Psíquicos y fantasmas perciben las trampas; los ingenieros las desactivan al acercarse.
   const sense=a.job==='explorer'?0:hasAny(a,['psychic'])?330:hasAny(a,['ghost'])?220:0;
   for(const t of A.g.traps||[]){
    if(sense&&dist(a,t)<sense)t.revealed=true;
    if(a.job==='engineer'&&t.armed&&dist(a,t)<80){t.armed=false;t.revealed=true;if(a.pid===A.myPid)A.toast('Trampa desactivada por el ingeniero.');}
   }
   // Agua apaga las quemaduras; fuego no se quema; hielo no se ralentiza.
   if(a.burn>0&&hasAny(a,['water','fire']))a.burn=0;
   if(a.slow>0&&hasAny(a,['ice']))a.slow=Math.max(0,a.slow-dt*3);
   // Hierba regenera un poco al estar quieta; bardo y apoyo ya tienen auras propias.
   if(hasAny(a,['grass'])&&Math.hypot(a.vx||0,a.vy||0)<5&&a.hp<a.max)a.hp=Math.min(a.max,a.hp+a.max*.004*dt);
  }
 }
 const step=A.step;
 A.step=function(dt){step.call(this,dt);if(A.g&&A.state==='play'&&!A.g.paused&&!A.g.assetLoading&&A.NET.role!=='client'&&!A.g.ended)systems(dt);};

 window.ECOS_ID10_API={mult,natural,useLock,JOBS,trapProof,typesOf,NAME,VINE,ROCK,LOCK};
 A.id10=window.ECOS_ID10_API;
};
