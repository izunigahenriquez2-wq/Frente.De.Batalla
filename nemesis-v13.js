'use strict';
/* v13 · IronJaw, villano con memoria (estilo Némesis). Recuerda cómo caíste, cambia de táctica y de lacayos, y tras 3 derrotas suelta su botín único y se cierra su historia. */
window.ECOS_NEMESIS13=function(A){
 const KEY='ecos-nemesis-v13',S=window.RPG_SPECIES,I=window.RPG_ITEMS,IRON=window.ECOS_IRONJAW;
 let N={enc:0,defeats:0,deaths:0,mem:[],done:false};
 try{Object.assign(N,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(N));}catch{}};
 const host=()=>A.NET.role!=='client';
 const dist=A.distance;
 const TYPES={fire:'fuego',water:'agua',electric:'eléctrico',grass:'planta',normal:'normal',fighting:'lucha',poison:'veneno',ground:'tierra',flying:'volador',psychic:'psíquico',bug:'bicho',rock:'roca',ghost:'fantasma',dragon:'dragón',ice:'hielo',dark:'siniestro',steel:'acero',fairy:'hada'};
 // lacayos que contrarrestan el tipo del Pokémon que cayó (sube el repertorio con cada encuentro)
 const CREWS={fire:[[98,72,120],[91,87,121]],water:[[100,81,92],[100,81,125]],electric:[[74,111,104],[95,111,104]],grass:[[37,58,126],[58,126,109]],
  psychic:[[41,42,92],[92,93,42]],ghost:[[19,66,96],[20,66,96]],rock:[[116,72,55],[117,55,73]],ground:[[116,72,55],[117,55,73]],poison:[[74,104,66],[111,95,66]],
  fighting:[[92,93,96],[93,96,42]],normal:[[92,93,96],[93,96,42]]};
 const DEFAULT_CREW=[[98,72,120],[99,73,121]];
 const PAT_OF=Object.fromEntries(Object.entries(IRON.nm).map(([k,v])=>[v,k]));
 const GROUP={charge:'embestida',leap:'embestida',combo:'embestida',tail:'embestida',fan:'artillería',rain:'artillería',barrage:'artillería',spiral:'artillería',pull:'maremoto',summon:'asedio'};
 const TACTIC={embestida:{title:'Revancha de abordaje',line:'Te gusta mantener la distancia… ¡pues ahora te abordo yo!',favor:['charge','leap','combo'],spd:1.12},
  artillería:{title:'Cañones listos',line:'Ya vi cómo te mueves. ¡Mis cañones llevan tu nombre!',favor:['rain','barrage','fan'],spd:1},
  maremoto:{title:'Marea del Capitán',line:'¿Creías que podías huir? ¡Ahora el mar te arrastra!',favor:['pull','spiral'],spd:1},
  asedio:{title:'Flota completa',line:'Esta vez no vengo solo. ¡A mí, marineros!',favor:['summon'],spd:1}};
 const nameOf=a=>S[a.id]?.name||a.name||'tu Pokémon';
 const typeOf=a=>S[a.id]?.types?.[0]||'normal';

 // ---------- memoria: cómo cayó cada explorador ----------
 function killerOf(a){let best=null,bs=1e9;for(const e of A.enemies){if(e.hp<=0)continue;const d=dist(e,a);if(d>800)continue;const s=d-(e.moveName?300:0)-(e.dk==='iron'?400:0);if(s<bs){bs=s;best=e;}}return best;}
 function remember(a){const k=killerOf(a);if(!k)return;
  const m={pk:nameOf(a),pt:typeOf(a),killer:k.dk==='iron'?'IronJaw':(k.name||S[k.id]?.name||'un enemigo'),iron:k.dk==='iron',move:k.moveName||null,floor:A.g?.floor||0};
  N.mem.push(m);if(N.mem.length>6)N.mem.shift();N.deaths++;save();}
 const was=new Map();
 const oldStep=A.step;
 A.step=function(dt){oldStep.call(this,dt);if(!A.g||A.state!=='play'||A.g.paused||A.g.ended||!host())return;
  for(const a of A.players){const w=was.get(a.pid);if(a.down&&!w&&!a.disconnected&&A.enemies.length)remember(a);was.set(a.pid,!!a.down);}
  const e=A.enemies.find(x=>x.dk==='iron'&&x.hp>0&&!x.nm);if(e)personalize(e);};

 // ---------- IronJaw se adapta ----------
 function lastMemory(){for(let i=N.mem.length-1;i>=0;i--)if(N.mem[i].iron)return N.mem[i];return N.mem[N.mem.length-1]||null;}
 function personalize(e){e.nm=true;N.enc++;const m=lastMemory();e.mem=m||null;
  let group=m&&m.iron&&m.move?GROUP[PAT_OF[m.move]]:null;
  if(!group){const keys=Object.keys(TACTIC);group=keys[(N.enc+(m?m.floor:0))%keys.length];}
  const T=TACTIC[group];e.nmGroup=group;e.favor=T.favor;e.title='Capitán IronJaw · '+T.title;
  const pt=m?.pt||typeOf(A.me()||A.players[0]||{id:25});const crews=CREWS[pt]||DEFAULT_CREW;e.crew=crews[(N.enc-1)%crews.length];
  e.baseSpeed=(e.baseSpeed||190)*T.spd;e.damage*=1+.06*Math.min(N.defeats,3);
  A.toast('IronJaw · encuentro '+N.enc+' · derrotas '+N.defeats+'/3');save();}
 A.nemesisLines=function(e){const m=e.mem;if(!m||N.enc<=1&&!m.iron&&!N.deaths)return null;const T=TACTIC[e.nmGroup]||TACTIC.asedio;const who=m.pk,tp=TYPES[m.pt]||m.pt;
  const L=[];
  if(m.iron&&m.move)L.push(['Angry','¿Te acuerdas de mí, '+who+'? Caíste ante mi «'+m.move+'» en el piso '+m.floor+'.']);
  else L.push(['Angry','Tu '+who+' (tipo '+tp+') cayó ante '+m.killer+' en el piso '+m.floor+'. Lo vi todo desde las sombras.']);
  L.push(['Angry',T.line]);
  if(N.defeats>0)L.push(['Angry','Me has vencido '+N.defeats+(N.defeats===1?' vez':' veces')+'… pero el capitán IronJaw nunca olvida.']);
  return L;};
 A.nemesisState=()=>({...N});

 // ---------- derrota y escena final ----------
 A.nemesisDefeat=function(e){N.defeats++;save();const g=A.g,ps=A.players.filter(p=>!p.disconnected);
  if(N.defeats>=3&&!N.done&&host()){N.done=true;save();
   const face=ps[0]?.id||25,who=ps[0]?nameOf(ps[0]):'Explorador';
   A.boss11.say([['Pain','Imposible… tres veces. Tres veces me han hundido…'],['Normal','Recuerdo cada derrota, cada golpe. Y ahora entiendo por qué.'],['Normal','No custodiaba un botín: custodiaba lo que hay al fondo de esta mazmorra.'],['Normal','Tomen mi tesoro, capitanes. Y no dejen que la oscuridad del fondo lo reclame.']],'IronJaw',1160,{patch:true});
   const key=A.lootMake?A.lootMake('u',g.floor,{base:'ironjaw_chest'}):'ironjaw_chest';if(I[key])A.loot.push({lid:'iron-final',x:e.x,y:e.y+36,key,taken:false});
   for(const p of ps){p.title='Azote de IronJaw';A.gainXP?.(p,400);}
   setTimeout(()=>A.toast('★ Fin de la historia de IronJaw · «Azote de IronJaw»'),400);}
  else A.toast('IronJaw derrotado ('+Math.min(N.defeats,3)+'/3). Recordará esto.');};
};
