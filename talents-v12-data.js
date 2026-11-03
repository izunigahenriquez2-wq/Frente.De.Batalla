'use strict';
/* v12 · Maestría de clase: el PERSONAJE (clase) tiene su propio árbol; el Pokémon aporta sus movimientos.
   Cada clase: una pasiva innata + 3 ramas de 5 escalones. En los escalones 1-4 eliges UNA de dos opciones y puedes subirla
   hasta 3 rangos; el escalón 5 es una piedra angular (rango 1). Para abrir el escalón N hay que haber gastado (N-1)×2 puntos en la rama.
   Efectos (por rango): ver TXT. Las claves se aplican en talents-v12.js. */
(()=>{
 const TXT={
  dmg:['daño','%',100],hp:['vida máxima','%',100],speed:['velocidad','%',100],crit:['prob. de crítico','%',100],cdr:['reducción de recargas','%',100],armor:['daño recibido','−%',100],
  regenPct:['regeneración por segundo','% de vida',100],mp:['maná máximo','%',100],mpRegen:['maná por segundo','',1],leech:['robo de vida','%',100],skill:['potencia de movimientos','%',100],heal:['curación','%',100],xp:['experiencia','%',100],
  rcdr:['recarga de la técnica de clase','−%',100],rpow:['potencia de la técnica de clase','%',100],threat:['aggro (los enemigos te prefieren)','%',100],thorns:['daño reflejado','%',100],
  auraHeal:['aura: cura a aliados cercanos por segundo','% de vida',100],auraDmg:['aura: daño de aliados cercanos','%',100],auraSpeed:['aura: velocidad de aliados cercanos','%',100],
  onKillHeal:['al derrotar: cura','% de vida',100],onKillMp:['al derrotar: maná','',1],onKillCd:['al derrotar: recargas de Q/E','−s',1],lowHp:['daño con menos de la mitad de vida','%',100],execute:['daño a enemigos con menos del 30 % de vida','%',100],
  floorShield:['escudo al llegar a un piso','s',1],dodge:['probabilidad de esquivar','%',100],mpOnHit:['maná al golpear','',1],
  rStun:['la técnica de clase aturde','s',1],rSlow:['la técnica de clase ralentiza','s',1],rShield:['la técnica de clase da escudo','s',1],rHeal:['la técnica de clase cura','% de vida',100],rHaste:['la técnica de clase da celeridad','s',1],rBurst:['la técnica de clase explota: daño','%',100],
  helperPow:['daño de torretas y ecos','%',100],helperLife:['duración de torretas y ecos','%',100]
 };
 const FLAG={second:'Segundo aliento: sobrevives a un golpe mortal una vez por piso',trapwise:'Ves las trampas de lejos',rTwice:'La técnica de clase se repite una vez a los 0,7 s'};
 /* arquetipos: 4 escalones × 2 opciones */
 const ARCH={
  tank:{n:'Defensa',t:[[['Piel Curtida',{armor:.025}],['Vigor',{hp:.05}]],[['Provocador',{threat:.5}],['Espinas',{thorns:.12}]],[['Voluntad de Hierro',{regenPct:.004}],['Paso Firme',{speed:.03,armor:.01}]],[['Aura Protectora',{rShield:2,armor:.015}],['Eco del Impacto',{rBurst:.5,rStun:.4}]]]},
  bruiser:{n:'Combate cercano',t:[[['Golpe Pesado',{dmg:.04}],['Sed de Combate',{leech:.012}]],[['Furia Creciente',{lowHp:.06}],['Ímpetu',{speed:.03,dmg:.02}]],[['Rematador',{execute:.07}],['Piel de Guerra',{armor:.02,hp:.03}]],[['Ola de Choque',{rBurst:.6}],['Cadena de Victorias',{onKillHeal:.015,onKillCd:.4}]]]},
  striker:{n:'Críticos y remate',t:[[['Ojo Certero',{crit:.02}],['Filo Afilado',{dmg:.035}]],[['Remate Mortal',{execute:.08}],['Danza Sombría',{dodge:.02,speed:.02}]],[['Sangre Fría',{onKillMp:3,onKillCd:.3}],['Aliento Corto',{rcdr:.05,cdr:.02}]],[['Golpe Crítico',{crit:.03,dmg:.03}],['Rastro de Sangre',{leech:.015,onKillHeal:.01}]]]},
  caster:{n:'Magia',t:[[['Mente Clara',{mp:.06}],['Potencia Arcana',{skill:.04}]],[['Flujo de Maná',{mpRegen:.25}],['Concentración',{cdr:.025}]],[['Eco Arcano',{rpow:.06}],['Golpe Elemental',{mpOnHit:1}]],[['Sobrecarga',{skill:.05,rBurst:.5}],['Canalizar',{rcdr:.06,mpRegen:.2}]]]},
  healer:{n:'Curación',t:[[['Manos Suaves',{heal:.05}],['Fe',{hp:.04}]],[['Aura Vital',{auraHeal:.0035}],['Limpieza',{rHeal:.04}]],[['Respiro',{regenPct:.003}],['Luz Protectora',{rShield:1.5}]],[['Plegaria',{rHeal:.06,rpow:.05}],['Bendición',{auraDmg:.02,auraSpeed:.015}]]]},
  aura:{n:'Auras y ritmo',t:[[['Himno',{auraDmg:.02}],['Ritmo',{auraSpeed:.02}]],[['Armonía',{auraHeal:.003}],['Eco',{rcdr:.05}]],[['Inspiración',{mpRegen:.2}],['Tempo Veloz',{cdr:.025}]],[['Crescendo',{rHaste:1.2,rpow:.05}],['Coro',{auraDmg:.02,auraHeal:.002}]]]},
  control:{n:'Control',t:[[['Hielo en las Venas',{rSlow:.8}],['Mente Fría',{cdr:.025}]],[['Estasis',{rStun:.35}],['Distorsión',{rcdr:.05}]],[['Reloj Roto',{onKillCd:.4}],['Paradoja',{dodge:.025}]],[['Zona de Quietud',{rSlow:1,rpow:.05}],['Cronofractura',{rBurst:.5,rStun:.3}]]]},
  maker:{n:'Construcción',t:[[['Obra Reforzada',{helperPow:.1}],['Mecanismos Duraderos',{helperLife:.1}]],[['Sinergia',{dmg:.02,helperPow:.05}],['Planos',{rcdr:.05}]],[['Chispa Doble',{skill:.03}],['Blindaje',{armor:.02}]],[['Ensamblaje Rápido',{rcdr:.06,helperLife:.1}],['Sobrecarga',{helperPow:.1,rBurst:.3}]]]},
  scout:{n:'Exploración',t:[[['Pies Ligeros',{speed:.035}],['Ojo de Águila',{trapwise:1}]],[['Buen Olfato',{xp:.04}],['Reflejos',{dodge:.02}]],[['Saqueador',{onKillHeal:.01,xp:.03}],['Bolsillos Hondos',{hp:.04}]],[['Maestro del Atajo',{speed:.03,cdr:.02}],['Sorpresa',{rStun:.3,execute:.04}]]]},
  alchemy:{n:'Alquimia',t:[[['Pócimas Potentes',{heal:.05}],['Toxinas',{dmg:.03}]],[['Vapores',{rSlow:.6}],['Destilación',{rcdr:.05}]],[['Reacción en Cadena',{rBurst:.4}],['Elixir',{regenPct:.003}]],[['Catalizador',{rpow:.07}],['Saturación',{rcdr:.05,skill:.03}]]]}
 };
 /* clases: rol, pasiva innata y 3 ramas [nombre, arquetipo, descripción, piedra A, piedra B] */
 const K=(n,f)=>[n,f];
 const JOBS={
  guardian:{role:'Tanque',passive:['Muro de Aggro','Los enemigos cercanos prefieren atacarte a ti y recibes menos daño.',{threat:2,armor:.05}],
   br:[['Bastión','tank','Resiste y protege a todo el equipo.',K('Muro Eterno',{armor:.12,thorns:.3,rShield:2}),K('Ancla Viviente',{threat:1.5,second:1,hp:.12})],
       ['Vanguardia','bruiser','Avanza y rompe la línea enemiga.',K('Embestida Imparable',{rBurst:1,rStun:.8,dmg:.08}),K('Aplastaplanetas',{execute:.15,leech:.03,lowHp:.12})],
       ['Guardia Sagrada','healer','Escudos y recuperación.',K('Escudo del Alba',{auraHeal:.008,rShield:3}),K('Juramento Inquebrantable',{floorShield:10,regenPct:.008,armor:.06})]]},
  striker:{role:'Daño',passive:['Sed de Sangre','Los remates hacen más daño y derrotar enemigos acelera tus recargas.',{execute:.1,onKillCd:.3}],
   br:[['Duelista','striker','Golpes certeros y críticos.',K('Un Solo Corte',{execute:.2,crit:.08}),K('Estocada Relámpago',{rTwice:1,cdr:.05})],
       ['Berserker','bruiser','Más fuerte cuanto más herido.',K('Sangre y Furia',{lowHp:.25,leech:.04}),K('Frenesí Eterno',{rcdr:.2,dmg:.08})],
       ['Cazador','scout','Persigue presas y recoge botín.',K('Marca del Cazador',{execute:.15,onKillCd:1}),K('Presa Fácil',{xp:.1,onKillHeal:.03})]]},
  support:{role:'Apoyo',passive:['Aura Vital','Cura poco a poco a los aliados cercanos.',{auraHeal:.004}],
   br:[['Clínico','healer','Curación potente.',K('Milagro',{rHeal:.15,second:1}),K('Fuente de Vida',{auraHeal:.01,heal:.1})],
       ['Protector','aura','Auras que fortalecen al equipo.',K('Cúpula Radiante',{rShield:4,armor:.06}),K('Pacto de Luz',{auraDmg:.06,auraSpeed:.04})],
       ['Luz','caster','Daño sagrado y esperanza.',K('Rayo de Esperanza',{rBurst:1,rHeal:.08}),K('Vigilia',{regenPct:.008,floorShield:8})]]},
  explorer:{role:'Utilidad',passive:['Instinto de Explorador','Ves las trampas de lejos y eres más veloz.',{trapwise:1,speed:.04}],
   br:[['Rastreador','scout','Velocidad y sentidos.',K('Sentidos Agudos',{trapwise:1,speed:.06,dodge:.05}),K('Cartografía',{xp:.15,rcdr:.15})],
       ['Trampero','control','Ralentiza y atrapa.',K('Red Pegajosa',{rSlow:3,rStun:.8}),K('Mina Sorpresa',{rBurst:1.2,rcdr:.1})],
       ['Saqueador','striker','Golpea y roba.',K('Botín Doble',{xp:.15,onKillHeal:.03}),K('Ladrón de Sombras',{dodge:.06,execute:.1})]]},
  mage:{role:'Daño a distancia',passive:['Canal Arcano','Más maná y movimientos más potentes.',{mpRegen:.3,skill:.05}],
   br:[['Artillero','caster','Gran daño de área.',K('Tormenta Arcana',{skill:.12,rBurst:1.2}),K('Nova Doble',{rTwice:1,mp:.1})],
       ['Canalizador','aura','Maná y resonancia para el grupo.',K('Pozo de Maná',{mpRegen:.8,mp:.12}),K('Resonancia',{rpow:.2,cdr:.06})],
       ['Elemental','striker','Afinidad con tu tipo.',K('Afinidad Total',{skill:.15,dmg:.06}),K('Colapso',{execute:.15,rBurst:.8})]]},
  assassin:{role:'Daño',passive:['Filo Letal','Remata a los débiles y esquiva algún golpe.',{execute:.1,dodge:.03}],
   br:[['Acechante','striker','Salta al objetivo y remata.',K('Danza de Cuchillas',{rTwice:1,crit:.06}),K('Muerte Súbita',{execute:.25,onKillCd:1})],
       ['Saboteador','alchemy','Veneno y trampas.',K('Veneno Letal',{dmg:.08,rSlow:1.5}),K('Bomba de Humo',{dodge:.08,rStun:.8})],
       ['Sombra','scout','Evasión y sigilo.',K('Paso Fantasma',{dodge:.1,speed:.08}),K('Sed de Sombras',{leech:.04,onKillHeal:.03})]]},
  alchemist:{role:'Control',passive:['Maestro de Pociones','Las curaciones son más potentes.',{heal:.1}],
   br:[['Transmutador','healer','Elixires de curación.',K('Piedra Filosofal',{heal:.12,rHeal:.1}),K('Elixir Supremo',{regenPct:.008,second:1})],
       ['Bombardero','alchemy','Frascos explosivos.',K('Reacción Total',{rBurst:1.2,rpow:.12}),K('Frasco Doble',{rTwice:1,rcdr:.1})],
       ['Toxicólogo','control','Venenos y plagas.',K('Plaga',{rSlow:2,dmg:.08}),K('Antídoto Vivo',{armor:.06,regenPct:.006})]]},
  engineer:{role:'Utilidad',passive:['Ingeniería','Torretas más fuertes y ves las trampas.',{helperPow:.1,trapwise:1}],
   br:[['Mecánico','maker','Más torretas, más tiempo.',K('Taller Móvil',{helperPow:.3,helperLife:.3}),K('Torre Gemela',{rTwice:1,rcdr:.1})],
       ['Artillero','caster','Potencia de fuego.',K('Cañón Pesado',{skill:.12,helperPow:.2}),K('Cadena de Fuego',{rBurst:1,dmg:.06})],
       ['Táctico','tank','Fortificaciones.',K('Fortificación',{armor:.08,floorShield:10}),K('Reparación',{auraHeal:.006,regenPct:.006})]]},
  bard:{role:'Apoyo',passive:['Melodía de Grupo','Aura de daño y velocidad para el equipo.',{auraDmg:.04,auraSpeed:.03}],
   br:[['Inspirador','aura','Fortalece al equipo.',K('Himno de Guerra',{auraDmg:.08,auraSpeed:.05}),K('Canción de Cuna',{auraHeal:.008,rHeal:.1})],
       ['Discordante','control','Aturde y ralentiza.',K('Disonancia',{rSlow:3,rStun:.8}),K('Réquiem',{rBurst:1,execute:.1})],
       ['Solista','caster','Voz de cristal.',K('Gran Final',{rTwice:1,skill:.08}),K('Voz de Cristal',{mpRegen:.6,crit:.05})]]},
  chronomancer:{role:'Control',passive:['Tiempo Comprimido','Recargas más cortas.',{cdr:.05,rcdr:.05}],
   br:[['Acelerador','aura','Acelera a todos.',K('Aceleración Total',{cdr:.1,auraSpeed:.06}),K('Bucle',{rTwice:1,rcdr:.1})],
       ['Detenedor','control','Frena el tiempo.',K('Tiempo Detenido',{rStun:1,rSlow:3}),K('Eterno Retorno',{onKillCd:1.5,second:1})],
       ['Paradoja','striker','Golpes imposibles.',K('Paradoja Letal',{execute:.2,crit:.06}),K('Eco Temporal',{rBurst:1.2,rcdr:.12})]]},
  summoner:{role:'Control',passive:['Vínculo de Ecos','Tus ecos son más fuertes y duran más.',{helperPow:.1,helperLife:.15}],
   br:[['Enjambre','maker','Muchos ecos.',K('Legión',{helperPow:.3,rcdr:.1}),K('Marea de Ecos',{helperLife:.4,rTwice:1})],
       ['Pacto','healer','Vida compartida.',K('Pacto de Sangre',{leech:.04,helperPow:.2}),K('Alma Compartida',{auraHeal:.008,second:1})],
       ['Dominio','control','Voluntad que somete.',K('Voluntad Dominante',{rStun:.8,rSlow:2}),K('Jaula de Almas',{rBurst:1,armor:.06})]]}
 };
 /* árbol plano: nodos con id, rango máximo y efectos */
 const TREE={};
 for(const [job,J] of Object.entries(JOBS)){
  const branches=J.br.map(([name,arch,desc,kA,kB],bi)=>{
   const A=ARCH[arch],tiers=A.t.map((pair,ti)=>pair.map(([n,f],oi)=>({id:`${job}.${bi}.${ti}.${oi}`,n,f,max:3,tier:ti+1,branch:bi,opt:oi})));
   tiers.push([kA,kB].map(([n,f],oi)=>({id:`${job}.${bi}.4.${oi}`,n,f,max:1,tier:5,branch:bi,opt:oi,key:true})));
   return {name,arch:A.n,desc,tiers};
  });
  TREE[job]={role:J.role,passive:{n:J.passive[0],d:J.passive[1],f:J.passive[2]},branches};
 }
 const NODE={};for(const J of Object.values(TREE))for(const b of J.branches)for(const t of b.tiers)for(const n of t)NODE[n.id]=n;
 window.ECOS_TAL12={TREE,NODE,TXT,FLAG,need:t=>(t-1)*2};
})();
