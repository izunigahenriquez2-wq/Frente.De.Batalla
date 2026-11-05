'use strict';
// Pokémon Echoe's · v11 · objetos del baúl (hoja de objetos de Pokémon Mystery Dungeon 2, sin objetos evolutivos).
// Parte estática: define los objetos. Parte dinámica (ECOS_ITEMS11): da sentido a los consumibles, a las gominolas y a las crestas de tipo.
(()=>{
 const I=window.RPG_ITEMS;if(!I)return;
 const L={damage:'daño',speed:'velocidad',hp:'vida',crit:'prob. de crítico',mana:'maná máx.',cdr:'enfriamiento',armor:'defensa',regen:'regeneración',mpRegen:'maná/s',skill:'potencia de movimientos',leech:'robo de vida',healing:'curación',xp:'experiencia',cost:'coste de maná',rescue:'velocidad de rescate'};
 const fmt=(k,v)=>k==='regen'||k==='mpRegen'?'+'+v+' '+L[k]:(v>0?'+':'')+Math.round(v*100)+' % '+L[k];
 const gear=(key,name,icon,stats,o={})=>{const d=Object.entries(stats).filter(([k])=>L[k]).map(([k,v])=>fmt(k,v)).join(', ');I[key]={name,icon:'n_'+icon,type:'gear',desc:(o.text||'Equipado: '+d+'.')+(o.jobs?' Para '+o.jobsText+'.':''),...stats,...(o.jobs?{jobs:o.jobs}:{}),...(o.unique?{unique:true}:{}),...(o.extra||{})};};
 const use=(key,name,icon,desc,c11,o={})=>{I[key]={name,icon:'n_'+icon,type:'use',desc,c11,...o};};
 const common=[],rare=[];

 // ---------- Equipo corriente (aparece en cofres y tiendas) ----------
 gear('coral_scarf','Bufanda Coral','coral_scarf',{armor:.08,speed:.05});
 gear('xray_specs','Gafas Rayos X','xray_specs',{crit:.1,skill:.06},{text:'Equipadas: +10 % prob. de crítico, +6 % potencia de movimientos y ves las trampas cercanas.'});
 gear('dark_specs','Gafas Umbrías','dark_specs',{crit:.12,damage:.06});
 gear('echo_note','Nota Eco','echo_note',{cdr:.1,mpRegen:.5});
 gear('gold_feather','Pluma Dorada','gold_feather',{speed:.1,cdr:.06});
 gear('pink_cube','Cubo Sedante','pink_cube',{hp:.12,healing:.15});
 gear('honeycomb','Panal Dorado','honeycomb',{regen:2.5,healing:.1});
 gear('pyramid','Reliquia Piramidal','pyramid',{skill:.16,mana:.1});
 gear('gold_scroll','Pergamino Dorado','gold_scroll',{xp:.2});
 gear('moon_stone','Piedra Lunar','moon_stone',{mana:.14,mpRegen:.5});
 gear('toolbox','Caja de Herramientas','toolbox',{rescue:.3,hp:.06});
 gear('ice_cube','Cubo de Hielo Eterno','ice_cube',{armor:.1,hp:.08});
 gear('explorer_medal','Medalla del Explorador','explorer_medal',{hp:.08,xp:.1,speed:.05});
 gear('gold_gem','Gema Áurea','gold_gem',{damage:.1,skill:.08});
 gear('star_feather','Pluma Estelar','star_feather',{speed:.08,cdr:.06});
 gear('iron_horn','Cuerno Férreo','iron_horn',{damage:.12,armor:.06});
 gear('blue_diamond','Diamante Azul','blue_diamond',{skill:.12,mpRegen:.5});
 gear('magic_sprout','Brote Mágico','magic_sprout',{regen:2,hp:.08});
 gear('psy_ring','Anillo Psíquico','psy_ring',{skill:.14,cost:-.1});
 gear('sea_pearl','Perla Marina','sea_pearl',{healing:.15,mana:.1});
 gear('talisman','Talismán Carmesí','talisman',{crit:.08,xp:.1});
 gear('sky_ribbon','Cinta Celeste','sky_ribbon',{speed:.08,cdr:.05});
 gear('travel_pack','Paquete de Viaje','travel_pack',{hp:.1,armor:.05});
 gear('gold_wings','Alas Doradas','gold_wings',{speed:.12});
 gear('falling_star','Estrella Fugaz','falling_star',{crit:.1,damage:.06});
 // Crestas de tipo: potencian el daño si tu Pokémon es de ese tipo (un poco si no lo es).
 const TYPES=[['normal','Normal','normal','Normal'],['fire','Fuego','fire','Fuego'],['water','Agua','water','Agua'],['bug','Bicho','bug','Bicho'],['electric','Eléctrica','electric','Eléctrico'],['flying','Voladora','flying','Volador'],['fighting','Lucha','fighting','Lucha'],['psychic','Psíquica','psychic','Psíquico'],['ground','Tierra','ground','Tierra'],['ice','Hielo','ice','Hielo'],['rock','Roca','rock','Roca'],['grass','Planta','grass','Planta'],['steel','Acero','steel','Acero'],['poison','Veneno','poison','Veneno'],['dragon','Dragón','dragon','Dragón'],['dark','Siniestra','dark','Siniestro'],['ghost','Fantasma','ghost','Fantasma']];
 for(const [t,nm,ic,tn] of TYPES)gear('crest_'+t,'Cresta '+nm,'crest_'+ic,{hp:.04},{text:'Equipada: +22 % daño si tu Pokémon es de tipo '+tn+' (+6 % en otro caso) y +4 % vida.',extra:{typeAmp:{[t]:.22}}});

 // ---------- Equipo único (botín de subjefes y de IronJaw; no sale en cofres) ----------
 const U={unique:true};
 gear('crab_claw','Pinza de Kingler','iron_horn',{armor:.12,damage:.08},U);I.crab_claw.icon='n_iron_horn';
 gear('aura_band','Banda Aural','talisman_b',{crit:.14,speed:.08},U);I.aura_band.icon='black_belt';
 gear('blaze_band','Cinta Ígnea','pink_cube',{damage:.2,cost:.08},U);
 gear('seed_pack','Saco de Semillas','magic_sprout',{regen:3,hp:.12},U);
 gear('dragon_scale','Escama de Dragón','gold_gem',{damage:.1,armor:.1},U);
 gear('shell_armor','Coraza de Blastoise','ice_cube',{armor:.2,hp:.1},U);
 gear('meteorite','Meteorito','moon_stone',{skill:.22,mpRegen:.8},U);
 gear('griseous_orb','Orbe Griseo','explorer_medal',{leech:.1,skill:.15},U);
 gear('mind_crown','Corona Mental','psy_ring',{skill:.25,mana:.2},U);
 gear('ironjaw_hook','Garfio de IronJaw','thorn_iron',{damage:.22,leech:.08},U);I.ironjaw_hook.icon='n_gold_fang';
 gear('pirate_hat','Parche Pirata','dark_specs',{crit:.12,xp:.2,damage:.06},U);I.pirate_hat.icon='black_glasses';
 gear('charcoal','Carbón','rock_brown',{damage:.12},{...U,jobs:undefined});I.charcoal.type='gear';
 gear('twisted_spoon_g','Cuchara Torcida','moon_stone',{skill:.14},U);I.twisted_spoon_g.icon='twisted_spoon';
 gear('spell_tag','Hechizo','talisman_b',{damage:.08,crit:.08},U);
 gear('miracle_seed','Semilla Milagro','magic_sprout',{regen:2,healing:.12},U);I.twisted_spoon=I.twisted_spoon_g;delete I.twisted_spoon_g;
 const RARE=['falling_star','gold_wings','blue_diamond','gold_scroll','star_feather'];

 // ---------- Consumables ----------
 use('apple','Manzana','apple','Recupera 60 PS y 10 PM.',{heal:60,mp:10});common.push('apple','apple');
 use('gold_apple','Manzana Dorada','gold_apple','Recupera todos los PS y 40 PM. Rara.',{ratio:1,mp:40});rare.push('gold_apple');
 use('night_grain','Grano Nocturno','night_grain','Recupera 35 PM y elimina estados negativos.',{mp:35,cleanse:true});common.push('night_grain');
 use('crisp_bread','Pan Crujiente','crisp_bread','Recupera el 35 % de tus PS.',{ratio:.35});common.push('crisp_bread');
 use('frambu_berry','Baya Frambu','frambu_berry','Furia durante 12 s: más daño y velocidad de ataque.',{buff:12});common.push('frambu_berry');
 use('gonlan_berry','Baya Gonlan','gonlan_berry','Un escudo de 8 s te protege.',{shield:8});common.push('gonlan_berry');
 use('gold_berry','Baya Dorada','gold_berry','Recupera el 70 % de tus PS y elimina estados negativos.',{ratio:.7,cleanse:true});
 use('green_tonic','Tónico Verde','green_tonic','Recupera 30 PS y cura veneno, sueño y quemadura.',{heal:30,cleanse:true});common.push('green_tonic');
 use('lilac_pill','Píldora Lila','lilac_pill','Recupera todo tu maná.',{mpRatio:1});common.push('lilac_pill');
 use('golden_flask','Frasco Dorado','golden_flask','Recupera todos los PS y todo el maná. Raro.',{ratio:1,mpRatio:1});rare.push('golden_flask');
 use('blue_flask','Pócima Azul','blue_flask','Recupera 60 PS y 60 PM.',{heal:60,mp:60});common.push('blue_flask');
 use('moomoo_milk','Leche Mu-Mu','golden_flask','Cura el 60 % de PS y limpia estados a todo el equipo cercano.',{ratio:.6,cleanse:true,team:420});I.moomoo_milk.icon='n_blue_flask';
 use('blast_seed','Semilla Explosiva','blast_seed','Lanza una explosión sobre el enemigo más cercano: gran daño en área.',{blast:{r:150,mul:3.2,range:560}});common.push('blast_seed');
 use('sleep_seed','Semilla Somnífera','sleep_seed','Duerme 6 s a los enemigos cercanos (no afecta a jefes).',{sleep:{r:230,t:6}});common.push('sleep_seed');
 use('thorn_green','Espina Venenosa','thorn_green','Lanzable: hiere al enemigo más cercano y lo envenena.',{throw:{mul:1.4,status:'poison',t:6}});common.push('thorn_green');
 use('thorn_pink','Espina Aturdidora','thorn_pink','Lanzable: hiere al enemigo más cercano y lo aturde 2 s.',{throw:{mul:1.2,status:'stun',t:2}});
 use('thorn_gold','Espina Dorada','thorn_gold','Lanzable: gran daño al enemigo más cercano.',{throw:{mul:3}});common.push('thorn_gold');
 use('thorn_night','Espina Nocturna','thorn_night','Lanzable: duerme 5 s al enemigo más cercano (no afecta a jefes).',{throw:{mul:.8,status:'sleep',t:5}});
 use('thorn_iron','Espina de Hierro','thorn_iron','Lanzable: atraviesa a los enemigos en línea.',{throw:{mul:1.5,pierce:3}});
 use('coral_twig','Rama Coralina','coral_twig','Lanzable: hiere y quema al enemigo más cercano.',{throw:{mul:1.3,status:'burn',t:5}});
 use('gold_fang','Colmillo Dorado','gold_fang','Lanzable: daño ×4 al enemigo más cercano. Raro.',{throw:{mul:4.2}});rare.push('gold_fang');
 use('pebble','Guijarro','pebble','Lanzable: golpea y ralentiza 4 s al enemigo más cercano.',{throw:{mul:.9,status:'slow',t:4}});common.push('pebble');
 use('rock_brown','Roca Parda','rock_brown','Lanzable: golpea con fuerza al enemigo más cercano.',{throw:{mul:1.8}});
 use('orb_light','Orbe Luminoso','orb_light','Revela gran parte del piso, las trampas y las escaleras.',{reveal:{r:30}});common.push('orb_light');
 use('orb_slumber','Orbe Sopor','orb_slumber','Duerme 7 s a los enemigos en un radio amplio (no afecta a jefes).',{sleep:{r:380,t:7}});
 use('orb_heal','Orbe Sanador','orb_heal','Cura el 50 % de PS y limpia estados a todo el equipo cercano.',{ratio:.5,cleanse:true,team:520});rare.push('orb_heal');
 use('ice_cube_use','Hielo Cortante','ice_cube','Congela: ralentiza 8 s a los enemigos cercanos.',{slow:{r:300,t:8}});
 use('chest_red','Cofre Rojo','chest_red','Contiene 3 consumables.',{chest:'cons'});
 use('chest_green','Cofre Verde','chest_green','Contiene un objeto de equipo.',{chest:'gear'});
 use('chest_blue','Cofre Azul','chest_blue','Contiene monedas y un objeto raro.',{chest:'rich'});
 use('coin_p','Moneda','coin_p','Se convierte en 60 monedas.',{coins:60});
 // Gominolas: mejoras permanentes (máx. 10 por atributo).
 const GUM=[['red','Roja','damage'],['orange','Naranja','damage'],['yellow','Amarilla','speed'],['lime','Lima','speed'],['green','Verde','hp'],['ice','Celeste','armor'],['blue','Azul','mana'],['navy','Marina','skill'],['purple','Violeta','regen'],['pink','Rosa','skill'],['black','Negra','crit'],['brown','Marrón','hp'],['white','Blanca','damage'],['teal','Turquesa','crit'],['gray','Gris','armor'],['magenta','Magenta','mana'],['gold','Dorada','speed']];
 const GN={damage:['daño','+2 %'],speed:['velocidad','+1,5 %'],hp:['vida máxima','+2,5 %'],armor:['defensa','+1 %'],mana:['maná máximo','+3 %'],skill:['potencia de movimientos','+2 %'],regen:['regeneración','+0,2 PS/s'],crit:['prob. de crítico','+1,2 %']};
 for(const [c,nm,st] of GUM){use('gummi_'+c,'Gominola '+nm,'gummi_'+c,'Mejora permanente: '+GN[st][1]+' de '+GN[st][0]+' (máx. 10 por atributo).',{perm:st});common.push('gummi_'+c);}
 window.ECOS_ITEMS11={common,rare:RARE,rareUse:rare,GUM,TYPES};
})();

// ---------- Parte dinámica ----------
window.ECOS_ITEMS11_INIT=function(A){
 const I=RPG_ITEMS,S=RPG_SPECIES,dist=A.distance,T=48,X=window.ECOS_ITEMS11;
 const old={useItem:A.useItem,stats:A.stats,step:A.step};
 const PERM={damage:.02,speed:.015,hp:.025,armor:.01,mana:.03,skill:.02,regen:.2,crit:.012},CAP=10;
 const parts=a=>a.gear.flatMap(k=>I[k]?.parts||[k]);
 // Gominolas y crestas se aplican sobre las estadísticas ya calculadas.
 A.stats=function(a){
  const hpRatio=a.max?a.hp/a.max:1;old.stats(a);
  const p=a.perm||{},n=k=>Math.min(CAP,p[k]||0);
  if(n('hp')){a.max=Math.round(a.max*(1+PERM.hp*n('hp')));a.hp=Math.min(a.max,Math.max(a.hp,a.max*hpRatio));}
  if(n('damage'))a.damage*=1+PERM.damage*n('damage');
  if(n('speed'))a.speed=Math.min(295,a.speed*(1+PERM.speed*n('speed')));
  if(n('armor'))a.armor=Math.min(.45,(a.armor||0)+PERM.armor*n('armor'));
  if(n('mana')){a.maxMp=Math.round(a.maxMp*(1+PERM.mana*n('mana')));a.mp=Math.min(a.mp,a.maxMp);}
  if(n('skill'))a.skillPower=(a.skillPower||1)+PERM.skill*n('skill');
  if(n('regen'))a.regenRate=(a.regenRate||0)+PERM.regen*n('regen');
  if(n('crit'))a.crit=Math.min(.65,(a.crit||0)+PERM.crit*n('crit'));
  const types=S[a.id]?.types||[];let amp=0;
  for(const k of parts(a)){const t=I[k]?.typeAmp;if(t)for(const [ty,v] of Object.entries(t))amp+=types.includes(ty)?v:v*.27;}
  if(amp)a.damage*=1+amp;
  return;
 };
 // Las gafas Rayos X revelan las trampas cercanas.
 const step=A.step;
 A.step=function(dt){step.call(this,dt);if(A.g&&A.state==='play'&&!A.g.paused&&A.NET.role!=='client'&&!A.g.ended){for(const a of A.players)if(!a.down&&!a.disconnected&&parts(a).includes('xray_specs'))for(const t of A.g.traps||[])if(!t.revealed&&dist(a,t)<380)t.revealed=true;}};

 const near=(a,range)=>A.enemies.filter(e=>e.hp>0&&A.seen(e)&&dist(a,e)<range&&A.clearLine(a,e)).sort((x,y)=>dist(a,x)-dist(a,y))[0];
 const area=(c,r)=>A.enemies.filter(e=>e.hp>0&&dist(c,e)<r+(e.r||16));
 const dmgOf=(a,mul)=>(a.damage||20)*mul;
 function status(e,kind,t){if(e.boss){if(kind==='sleep')return;if(kind==='stun')e.stun=Math.min(.35,t);else e[kind]=Math.max(e[kind]||0,t*.6);return;}e[kind]=Math.max(e[kind]||0,t);}
 const gearPool=()=>Object.keys(I).filter(k=>I[k].type==='gear'&&!I[k].fused&&!I[k].unique);
 const give=(a,k,n=1)=>{a.bag[k]=(a.bag[k]||0)+n;};
 const pickOf=l=>l[Math.floor(Math.random()*l.length)];
 function team(a,r){return A.players.filter(b=>!b.down&&!b.disconnected&&dist(a,b)<r);}
 function run(a,c,key){
  const it=I[key];
  if(c.perm){a.perm??={};const n=a.perm[c.perm]||0;if(n>=CAP){A.toast('Ya alcanzaste el máximo de esta mejora ('+CAP+').');return false;}a.perm[c.perm]=n+1;A.stats(a);A.fx('star',a.x,a.y,2.2,.6);A.toast(a.name+': '+it.name+' · mejora permanente '+(n+1)+'/'+CAP+'.');return true;}
  if(c.coins){for(const b of A.players)if(b===a)b.coins+=c.coins;A.fx('star',a.x,a.y,1.6,.5);A.toast('+'+c.coins+' monedas.');return true;}
  if(c.chest){const got=[];if(c.chest==='cons')for(let i=0;i<3;i++)got.push(pickOf(X.common.filter(k=>!k.startsWith('gummi'))));else if(c.chest==='gear')got.push(A.lootRoll?A.lootRoll('chest',undefined,{min:'m'}).key:pickOf(gearPool()));else{got.push(pickOf(X.rare),pickOf(X.rareUse));a.coins+=80;}for(const k of got)give(a,k);A.fx('star',a.x,a.y,2.4,.7);A.toast(a.name+' abrió el cofre: '+got.map(k=>I[k].name).join(', ')+'.');return true;}
  if(c.throw){const e=near(a,560);if(!e){A.toast('No hay enemigos a tiro.');return false;}const d=dmgOf(a,c.throw.mul);
   const list=c.throw.pierce?A.enemies.filter(x=>x.hp>0&&A.seen(x)&&dist(a,x)<640&&Math.abs(Math.atan2(x.y-a.y,x.x-a.x)-Math.atan2(e.y-a.y,e.x-a.x))<.22).slice(0,c.throw.pierce):[e];
   for(const x of list){A.hurt(x,d,a);if(c.throw.status)status(x,c.throw.status,c.throw.t);A.fx('hit',x.x,x.y,1.2,.3);}
   A.fire(a,Math.atan2(e.y-a.y,e.x-a.x),700,0,'star',a.x,a.y,{life:.25,size:.8,hostile:false});return true;}
  if(c.blast){const e=near(a,c.blast.range);if(!e){A.toast('No hay enemigos a tiro.');return false;}for(const x of area(e,c.blast.r))A.hurt(x,dmgOf(a,c.blast.mul),a);A.fx('smash',e.x,e.y,3.2,.5);A.fx('fire',e.x,e.y,3,.5);return true;}
  if(c.sleep||c.slow){const k=c.sleep?'sleep':'slow',v=c[k],list=area(a,v.r);if(!list.length){A.toast('No hay enemigos cerca.');return false;}for(const x of list)status(x,k,v.t);A.fx(k==='sleep'?'s_sleep_zzz':'s_ice_crystals',a.x,a.y,3.4,.8);return true;}
  if(c.reveal){const g=A.g,tx=Math.floor(a.x/T),ty=Math.floor(a.y/T),r=c.reveal.r;for(let y=Math.max(0,ty-r);y<=Math.min(g.mh-1,ty+r);y++)for(let x=Math.max(0,tx-r);x<=Math.min(g.mw-1,tx+r);x++)if((x-tx)**2+(y-ty)**2<=r*r&&!(g.secret&&y>=g.secret.arena.y-1))g.fog[A.tileIndex(x,y)]=1;g.stairsKnown=true;for(const t of g.traps||[])t.revealed=true;A.fx('discharge',a.x,a.y,3.6,.8);A.toast('El orbe revela el piso.');return true;}
  if(c.buff){if(a.buff>c.buff-1){A.toast('Ya tienes ese efecto.');return false;}a.buff=c.buff;A.fx('star',a.x,a.y,2.6,.6);return true;}
  if(c.shield){a.shield=Math.max(a.shield||0,c.shield);A.fx('discharge',a.x,a.y,2.8,.6);return true;}
  // Curación (con o sin equipo cercano)
  const targets=c.team?team(a,c.team):[a];let used=false;
  for(const b of targets){const needHp=c.heal||c.ratio,needMp=c.mp||c.mpRatio;
   const hp0=b.hp,mp0=b.mp;if(needHp)b.hp=Math.min(b.max,b.hp+(c.heal||0)+(c.ratio||0)*b.max);if(needMp)b.mp=Math.min(b.maxMp,b.mp+(c.mp||0)+(c.mpRatio||0)*b.maxMp);
   const cl=c.cleanse&&['poison','sleep','burn','slow'].some(k=>b[k]>0);if(c.cleanse){b.poison=0;b.sleep=0;b.burn=0;b.slow=0;}
   if(b.hp>hp0||b.mp>mp0||cl){used=true;A.fx('water',b.x,b.y,2,.5);}}
  if(!used){A.toast('No te serviría de nada ahora.');return false;}
  return true;}
 A.useItem=function(a,key){const it=I[key];
  if(!it?.c11||!(a.bag[key]>0)||a.down||a.disconnected||a.evolving||!A.g||A.g.ended||(A.localMode==='online'&&A.g.paused))return old.useItem.call(this,a,key);
  if(run(a,it.c11,key)){a.bag[key]--;try{window.playSound?.('heal');}catch{}}};
 // Las gominolas se guardan en el estado del jugador.
 const clean=A.cleanActor;A.cleanActor=function(a){const o=clean(a);if(a.perm)o.perm=a.perm;return o;};
};
