'use strict';
// Pokémon Echoe's · v11 · datos de jefes, subjefes, salas secretas y diálogos.
(()=>{
 const S=window.RPG_SPECIES,N=window.RPG_BOSS_NAMES;
 const mk=(id,name,kind,types,hp,speed)=>{if(!S[id])S[id]={name,kind,types,hp,speed,bst:600,price:0,rarity:'jefe',buyable:false,free:false,evos:[],at:100,moves:[]};N[id]=N[id]||name;};
 mk(448,'Lucario','star',['fighting','steel'],110,190);mk(257,'Blaziken','fire',['fire','fighting'],120,185);mk(386,'Deoxys','psychic',['psychic'],100,230);
 mk(241,'Miltank','star',['normal'],120,185);mk(487,'Giratina','ghost',['ghost','dragon'],150,170);mk(1487,'Giratina Origen','ghost',['ghost','dragon'],150,175);mk(1150,'Mega Mewtwo Y','psychic',['psychic'],150,230);mk(1144,'Articuno de Galar','psychic',['psychic','flying'],110,200);mk(1146,'Moltres de Galar','ghost',['dark','flying'],110,205);mk(1160,'IronJaw','water',['water','dark'],130,185);mk(208,'Steelix','rock',['steel','ground'],110,160);
 N[99]='Kingler';N[1150]='Mega Mewtwo Y';N[1144]='Articuno de Galar';N[1146]='Moltres de Galar';N[487]='Giratina';N[1160]='IronJaw';N[1487]='Giratina Origen';N[208]='Steelix';

 // Efectos por tipo para cada función de ataque (claves de FX; las b_ y s_ vienen del baúl).
 window.ECOS_TYPEFX={
  rock:{shot:'rock',ring:'rock',zone:'smash',rain:'b_draco_rock',line:'smash',slam:'quake',beam:'rock'},
  steel:{shot:'s_sword_blue',ring:'star',zone:'s_star_impact',rain:'s_shard_purple',line:'s_spike_yellow',slam:'smash',beam:'s_blade_green'},
  water:{shot:'water',ring:'water',zone:'s_water_splash',rain:'s_water_splash',line:'s_water_splash',slam:'s_water_splash',beam:'water'},
  spark:{shot:'spark',ring:'spark',zone:'discharge',rain:'s_lightning_bolt',line:'discharge',slam:'discharge',beam:'spark'},
  leaf:{shot:'leaf',ring:'leaf',zone:'s_spore_ring',rain:'s_seed_shots',line:'s_ring_leaf',slam:'s_spore_ring',beam:'leaf'},
  poison:{shot:'b_acid',ring:'b_toxic',zone:'b_poison_gas',rain:'b_acid_ring',line:'b_toxic_spikes',slam:'b_poison_gas',beam:'b_acid'},
  psychic:{shot:'psychic',ring:'s_orb_purple',zone:'s_vortex_magenta',rain:'s_orbs_purple',line:'s_beam_pink',slam:'s_nova_pink',beam:'s_orb_pink'},
  fire:{shot:'fire',ring:'fire',zone:'s_fire_column',rain:'s_fire_balls',line:'s_flame_pillars',slam:'s_fire_burst',beam:'flame'},
  hit:{shot:'star',ring:'star',zone:'s_star_impact',rain:'s_fist_yellow',line:'s_impact_burst',slam:'smash',beam:'s_spike_yellow'},
  star:{shot:'star',ring:'star',zone:'s_star_impact',rain:'s_star_burst',line:'s_impact_burst',slam:'smash',beam:'s_spike_yellow'},
  ghost:{shot:'ghost',ring:'s_orb_shadow',zone:'s_vortex_dark',rain:'s_orb_night',line:'s_black_hole',slam:'s_vortex_dark',beam:'s_orb_void'},
  dragon:{shot:'b_dragon_pulse',ring:'b_dragon_rage',zone:'b_spacial_rend',rain:'b_draco_rock',line:'b_dragonbreath',slam:'b_outrage',beam:'b_dragonbreath'},
  ice:{shot:'ice',ring:'s_ice_crystals',zone:'s_ice_crystals',rain:'s_ice_crystals',line:'s_wind_rings',slam:'s_wind_rings',beam:'ice'}
 };

 const PAT={charge:'Embestida',combo:'Embestida triple',fan:'Abanico',barrage:'Ráfaga',ring:'Onda expansiva',spiral:'Espiral',sweep:'Barrido',beam:'Rayo',zones:'Zonas',rain:'Lluvia',pillars:'Pilares',star:'Estrella',slam:'Pisotón',leap:'Salto',blink:'Teletransporte',summon:'Refuerzos',pull:'Torbellino',tail:'Golpe de cola'};
 window.ECOS_PATNAMES=PAT;

 // p1 = repertorio de la fase 1 · p2 = repertorio añadido en la fase 2 (más agresivo).
 // H = altura del sprite en pantalla (el jugador mide ~110). hp/dmg = multiplicadores. drops = botín único.
 const B=window.ECOS_BOSSES={
  // ---- jefes de piso ----
  95:{H:300,p1:['charge','zones','slam'],p2:['tail','pillars','rain','combo'],evolve:208,fxType:'rock',nm:{charge:'Placaje',zones:'Avalancha',slam:'Terremoto',tail:'Cola de Hierro',pillars:'Roca Afilada',rain:'Tumba de Rocas',combo:'Embestida triple'},
     say:{phase2:[['Angry','¡¡GRAAAWRR!!']]}},
  121:{H:260,p1:['fan','ring','blink'],p2:['barrage','spiral','beam','rain'],fxType:'water'},
  26:{H:250,p1:['charge','zones','fan'],p2:['combo','rain','beam','star'],fxType:'spark'},
  45:{H:260,p1:['zones','ring','fan'],p2:['rain','spiral','summon','pillars'],fxType:'leaf'},
  110:{H:270,p1:['zones','ring','fan'],p2:['pull','rain','spiral','slam'],fxType:'poison'},
  65:{H:260,p1:['blink','fan','zones'],p2:['beam','barrage','star','pull'],fxType:'psychic'},
  59:{H:280,p1:['charge','zones','fan'],p2:['combo','rain','beam','tail'],fxType:'fire'},
  112:{H:300,p1:['slam','charge','zones'],p2:['tail','pillars','combo','leap'],fxType:'rock'},
  131:{H:290,p1:['fan','ring','zones'],p2:['beam','spiral','rain','pull'],fxType:'ice'},
  68:{H:280,p1:['leap','charge','slam'],p2:['combo','star','barrage','pillars'],fxType:'hit'},
  94:{H:260,p1:['blink','ring','zones'],p2:['barrage','spiral','pull','summon'],fxType:'ghost'},
  149:{H:300,p1:['fan','charge','zones'],p2:['beam','rain','combo','tail'],fxType:'dragon'},
  1144:{H:290,p1:['fan','charge','ring'],p2:['rain','beam','spiral','star'],fxType:'psychic'},
  1146:{H:290,p1:['fan','charge','ring'],p2:['rain','beam','spiral','star'],fxType:'ghost'},
  150:{H:290,p1:['blink','barrage','zones'],p2:['beam','star','pull','rain','summon'],fxType:'psychic',evolve:1150,boost:{dmg:1.35,spd:1.15,hp:1}},
  3:{H:290,p1:['fan','zones','slam'],p2:['rain','pillars','summon','spiral'],fxType:'leaf'},
  9:{H:290,p1:['barrage','slam','zones'],p2:['beam','rain','pull','sweep'],fxType:'water'},
  6:{H:290,p1:['fan','charge','leap'],p2:['beam','rain','star','sweep'],fxType:'fire'}
 };
 window.ECOS_BOSS_DEFAULT={H:290,p1:['charge','fan','ring','zones'],p2:['rain','sweep','combo','beam']};

 // ---- subjefes de salas secretas ----
 window.ECOS_SUBS={
  kingler:{id:99,name:'Kingler',title:'Rey de las Pinzas',kind:'water',fxType:'water',H:250,hp:.8,dmg:.85,spd:150,p1:['barrage','slam','charge'],p2:['rain','pillars','leap','tail'],
   nm:{barrage:'Burbujas',slam:'Martillazo',charge:'Cangrejazo',rain:'Hidrobomba',pillars:'Géiser',leap:'Salto de pinza',tail:'Pinza giratoria'},
   drops:['crab_claw','sitrus_berry'],say:{intro:[['Angry','¡Cuidado con las pinzas! ¡Ningún intruso sale entero de mi cueva!']],phase2:[['Angry','¡¡Ahora pincharé con las dos!!']],death:[['Pain','Mis… pinzas… se han roto…']]}},
  miltank:{id:241,name:'Miltank',title:'La Vaca Estampida',kind:'star',fxType:'hit',H:260,hp:.8,dmg:.85,spd:160,p1:['charge','slam','fan'],p2:['combo','spiral','ring','leap'],
   nm:{charge:'Rodar',slam:'Pisotón',fan:'Cuernazo',combo:'Rodar infinito',spiral:'Lluvia de corazones',ring:'Bramido',leap:'Salto de toro'},
   drops:['moomoo_milk','lucky_egg'],say:{intro:[['Angry','¡MUUUU! ¡Este es mi establo! ¡Fuera de aquí!']],phase2:[['Angry','¡Voy a rodar sobre ustedes hasta el final!']],death:[['Pain','Muuu… me rindo… llévense la leche…']]}},
  lucario:{id:448,name:'Lucario',title:'Maestro del Aura',kind:'star',fxType:'steel',H:250,hp:.8,dmg:.9,spd:175,p1:['barrage','charge','blink'],p2:['beam','star','pillars','combo'],
   nm:{barrage:'Esfera Aural',charge:'Velocidad Extrema',blink:'Paso Fugaz',beam:'Pulso Aural',star:'Palma Vacío',pillars:'Onda Certera',combo:'Golpe Trueno'},
   drops:['aura_band','silver_powder'],say:{intro:[['Normal','Siento tu aura… Demuéstrame que eres digno de seguir.']],phase2:[['Angry','¡Mi aura se desborda! ¡No te contendré más!']],death:[['Normal','Tu aura… es brillante. Puedes pasar.']]}},
  blaziken:{id:257,name:'Blaziken',title:'Llama Fulgurante',kind:'fire',fxType:'fire',H:260,hp:.8,dmg:.9,spd:170,p1:['leap','fan','charge'],p2:['star','rain','combo','sweep'],
   nm:{leap:'Patada Salto Alta',fan:'Lanzallamas',charge:'Envite Ígneo',star:'Rueda Fuego',rain:'Meteoros de fuego',combo:'Triple patada',sweep:'Barrido ardiente'},
   drops:['blaze_band','charcoal'],say:{intro:[['Angry','¡Mis llamas son más veloces que tus ojos!']],phase2:[['Angry','¡¡El fuego arde más fuerte ahora!!']],death:[['Pain','Se apagó la llama… bien peleado.']]}},
  venusaur:{id:3,name:'Venusaur',title:'Guardián del Jardín',kind:'leaf',fxType:'leaf',H:270,hp:.85,dmg:.85,spd:140,p1:['fan','zones','slam'],p2:['rain','pillars','summon','spiral'],
   nm:{fan:'Hoja Afilada',zones:'Paralizador',slam:'Planta Feroz',rain:'Lluvia de semillas',pillars:'Látigo Cepa',summon:'Brotes guardianes',spiral:'Tormenta de hojas'},
   minions:[43,69,70],drops:['seed_pack','miracle_seed'],say:{intro:[['Normal','Las raíces de este jardín te rodean. No hay salida.']],phase2:[['Angry','¡Que florezca la tormenta!']],death:[['Pain','Las flores se marchitan…']]}},
  charizard:{id:6,name:'Charizard',title:'Dragón de las Brasas',kind:'fire',fxType:'fire',H:280,hp:.85,dmg:.9,spd:165,p1:['fan','charge','leap'],p2:['beam','rain','star','sweep'],
   nm:{fan:'Ascuas',charge:'Envite Ígneo',leap:'Vuelo',beam:'Lanzallamas',rain:'Meteoros',star:'Giro Infernal',sweep:'Cola de dragón'},
   drops:['dragon_scale','charcoal'],say:{intro:[['Angry','¡GRRAAAH! ¡Quién osa despertar al dragón!']],phase2:[['Angry','¡Verán lo que es un verdadero infierno!']],death:[['Pain','Mis alas… ya no… vuelan…']]}},
  blastoise:{id:9,name:'Blastoise',title:'Fortaleza Marina',kind:'water',fxType:'water',H:270,hp:.9,dmg:.9,spd:140,p1:['barrage','slam','zones'],p2:['beam','rain','pull','sweep'],
   nm:{barrage:'Pistola Agua',slam:'Placaje corporal',zones:'Mareas',beam:'Hidrocañón',rain:'Hidrobomba',pull:'Torbellino',sweep:'Giro de caparazón'},
   drops:['shell_armor','sea_incense'],say:{intro:[['Angry','¡Mis cañones están cargados! ¡Prepárense!']],phase2:[['Angry','¡¡Hidrocañón a máxima potencia!!']],death:[['Pain','Mi caparazón… se resquebraja…']]}},
  deoxys:{id:386,name:'Deoxys',title:'Visitante Cósmico',kind:'psychic',fxType:'psychic',H:270,hp:.85,dmg:.95,spd:215,p1:['blink','barrage','fan'],p2:['beam','star','pull','rain','combo'],
   nm:{blink:'Teletransporte',barrage:'Psicorrayo',fan:'Onda mental',beam:'Cañón cósmico',star:'Estrella meteórica',pull:'Agujero gravitatorio',rain:'Lluvia de meteoritos',combo:'Embestida galáctica'},
   drops:['meteorite','twisted_spoon'],say:{intro:[['Normal','Señal detectada. Organismos hostiles. Iniciando eliminación.']],phase2:[['Angry','Mutación completada. Poder máximo.']],death:[['Dizzy','Sistema… dañado… regresando… al espacio…']]}},
  giratina:{id:487,evolve:1487,boost:{dmg:1.35,spd:1.15,hp:1},name:'Giratina',title:'El Rey del Mundo Distorsión',kind:'ghost',fxType:'ghost',H:300,hp:.9,dmg:.95,spd:150,p1:['zones','fan','charge'],p2:['pull','star','rain','beam','summon'],
   nm:{zones:'Sombra Vil',fan:'Pulso Umbrío',charge:'Garra Umbría',pull:'Vacío Absoluto',star:'Cuchilla Distorsión',rain:'Meteoros Oscuros',beam:'Aliento Distorsión',summon:'Sombras vagantes'},
   minions:[92,93],drops:['griseous_orb','spell_tag'],say:{intro:[['Angry','Este es mi mundo, mortal. Aquí no existen ni el tiempo ni el espacio.']],phase2:[['Angry','¡Contempla la distorsión absoluta!']],death:[['Pain','Regreso… al Mundo… Distorsión…']]}},
  mewtwo:{id:150,evolve:1150,boost:{dmg:1.35,spd:1.15,hp:1},name:'Mewtwo',title:'Mente Despertada',kind:'psychic',fxType:'psychic',H:280,hp:.9,dmg:.95,spd:200,p1:['barrage','blink','zones'],p2:['beam','star','pull','rain','summon'],
   nm:{barrage:'Psicorrayo',blink:'Teletransporte',zones:'Psíquico',beam:'Onda Mental',star:'Estrella Psíquica',pull:'Telequinesis',rain:'Lluvia mental',summon:'Clones'},
   minions:[63,64],drops:['mind_crown','twisted_spoon'],say:{intro:[['Normal','Fui creado para luchar. Muéstrame de qué estás hecho.']],phase2:[['Angry','¡Nadie me ha vencido jamás! ¡Despierta, poder!']],death:[['Pain','Soy… más que un experimento…']]}}
 };
 window.ECOS_SUBS_ORDER=['kingler','miltank','lucario','blaziken','venusaur','charizard','blastoise','deoxys','giratina','mewtwo'];

 // ---- IronJaw: villano recurrente ----
 window.ECOS_IRONJAW={id:1160,name:'IronJaw',title:'Capitán IronJaw',kind:'water',fxType:'water',H:235,hp:1.0,dmg:.95,spd:190,
  p1:['charge','tail','fan','leap'],p2:['combo','rain','barrage','spiral','pull','summon'],
  nm:{charge:'Embestida de abordaje',tail:'Tajo de garfio',fan:'Cañonazo',leap:'Salto de abordaje',combo:'Triple abordaje',rain:'Lluvia de cañones',barrage:'Fuego a discreción',spiral:'Torbellino de cañones',pull:'Maremoto',summon:'¡A mí, marineros!'},
  minions:[98,72,120],drops:['ironjaw_hook','pirate_hat'],
  say:{
   first:[['Normal','Jajaja... ¿Así que ustedes son los que huelen a tesoro?'],['Angry','¡Soy IronJaw, el terror de este calabozo! ¡Todo lo que brilla aquí es MÍO!'],['Angry','¡Entreguen el botín... o los hundiré con mis propias fauces!']],
   again:[['Angry','¿Me recuerdan? El capitán IronJaw nunca olvida una deuda...'],['Angry','¡Esta vez no habrá piedad! ¡A ZARPAR AL FONDO!']],
   phase2:[['Angry','¡¿CREEN QUE ESTO ACABÓ?! ¡Me han hecho ENOJAR DE VERDAD!'],['Shouting','¡¡AHORA SÍ... PREPÁRENSE A HUNDIRSE!!']],
   flee:[['Pain','¡Maldición...! Me retiro un momento... ¡solo para afilar los colmillos!']],
   death:[['Pain','Imposible... el capitán... no se hunde...'],['Crying','¡Volveré, lo juro por mi sombrero...!']],
   escape:[['Angry','¡¿Huyen por las escaleras?! ¡Los encontraré, cobardes!']]
  }};
 // Diálogos de aviso de jefes de piso (breves).
 window.ECOS_SUBPLACE='Puerta secreta';
})();
