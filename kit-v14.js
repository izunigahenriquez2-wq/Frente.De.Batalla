// V14 · Kit de especie: habilidad 3 (C) + definitiva (V) con medidor. Cada línea evolutiva tiene sus dos habilidades.
// Se construyen con la biblioteca de patrones (órbita, bumerán, minas, torreta, rastro, vórtice, cadena, rebote, meteoros, temblor).
window.ECOS_KIT14=function(A){
 'use strict';
 const S=RPG_SPECIES,P=A.pat,dist=A.distance,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 // ---------- Tabla de líneas: raíz|habilidad 3|plantilla|definitiva|plantilla ----------
 const LINES=`1|Bomba Semilla|mines|Rayo Solar|beam
4|Rueda de Fuego|orbit|Ultra Llamarada|nova
7|Giro Rápido|boomer|Hidrocañón|beam
10|Disparo Demora|mines|Danza Mariposa|petals
13|Pin Misil|fan|Lluvia de Aguijones|meteors
16|Tornado|vortex|Vendaval Cortante|blades
19|Hipercolmillo|dashq|Hiperrayo|beam
21|Pico Taladro|dashq|Pico Fulgor|rush
23|Residuos|trail|Mordisco Letal|rush
25|Onda Trueno|chain|Trueno|storm
27|Excavar|dashq|Terremoto|rings
29|Doble Patada|bounce|Tóxico Total|hole
32|Cornada|dashq|Megacuerno|rush
35|Doble Rayo|boomer|Luz Lunar|sanct
37|Fuego Fatuo|orbit|Nova Ígnea|nova
39|Canto|vortex|Berrinche Sónico|nova
41|Chupavidas|drain|Ala Letal|blades
43|Esporas|mines|Danza Pétalo|petals
46|Seducción Esporas|vortex|Gigadrenado|sanct
48|Psicorrayo Ocular|boomer|Polvo Plateado|petals
50|Socavón|quake|Terremoto|rings
52|Día de Pago|bounce|Garra Dorada|rage
54|Confusión|vortex|Jaqueca Total|mirage
56|Patada Furia|dashq|Furia Eterna|rage
58|Colmillo Ígneo|dashq|Envite Ígneo|rush
60|Rayo Burbuja|bounce|Surfear|rings
63|Teletransporte Ofensivo|dashq|Psíquico|mirage
66|Sumisión|dashq|A Bocajarro|rage
69|Látigo Ácido|fan|Tormenta Floral|petals
72|Ácido|trail|Latigazo Marino|rings
74|Lanzarrocas|meteor|Roca Colosal|meteors
77|Galope Ardiente|trail|Fuego Unicornio|rush
79|Bostezo|vortex|Psico Pesada|hole
81|Foco Resplandor|turret|Electrocañón|beam
83|Tajo Aéreo|boomer|Danza Puerro|blades
84|Triataque|fan|Triple Pico|beam
86|Rayo Aurora|boomer|Ventisca|frost
88|Residuos Tóxicos|trail|Marea de Lodo|hole
90|Carámbano|turret|Caparazón Final|nova
92|Bola Sombra|bounce|Pesadilla|hole
95|Pilar Rocoso|quake|Cola Férrea|rings
96|Hipnosis|vortex|Comesueños|hole
98|Martillazo|quake|Guillotina|rush
100|Mina Eléctrica|mines|Autodestrucción|nova
102|Bomba Huevo|meteor|Lluvia de Huevos|meteors
104|Huesomerang|boomer|Danza de Huesos|blades
106|Patada Salto|dashq|Patada Mortal|rush
107|Puño Trueno|chain|Puño Meteoro|rage
108|Lengüetazo|chain|Atracción Estruendo|nova
109|Nube Tóxica|trail|Explosión|nova
111|Cornada Rocosa|dashq|Megacuerno Rocoso|rush
113|Huevo Curativo|pulse|Sanación Total|sanct
114|Látigo Giratorio|orbit|Bosque Aprisionador|hole
115|Puño Cometa|bounce|Furia Maternal|rage
116|Disparo Tinta|fan|Maremoto|rings
118|Cornada Acuática|dashq|Hidropulso Final|rings
120|Cañón Estrella|turret|Gran Constelación|meteors
122|Barrera Mimo|guard|Gran Mimo|mirage
123|Doble Filo|orbit|Danza Espada|blades
124|Beso Gélido|chain|Ventisca Polar|frost
125|Puño Trueno|chain|Gran Descarga|storm
126|Puño Fuego|bounce|Erupción|meteors
127|Agarre Tenaz|dashq|Corte Rápido|blades
128|Pisotón|dashq|Embestida Salvaje|rush
129|Salpicadura|bounce|Cascada Final|rings
131|Canto Gélido|orbit|Ventisca|frost
132|Transformación|guard|Copia Perfecta|legion
133|Doble Patada Adorable|bounce|Adaptación Final|rage
134|Anillo Acuático|orbit|Hidrobomba|rings
135|Doble Rayo|chain|Trueno Final|storm
136|Llamarada Doble|fan|Sobrecalentamiento|nova
137|Conversión|turret|Hiperrayo Binario|beam
138|Rayo Burbuja|bounce|Aguaje|rings
140|Cuchillada Antigua|boomer|Tajo Umbrío|blades
142|Ala de Acero|boomer|Colmillo Ancestral|rush
143|Pisotón Pesado|quake|Gigaimpacto|rush
147|Cola Dragón|boomer|Cometa Draco|meteors
151|Pulso Primigenio|orbit|Todo el Arsenal|storm
169|Chupavidas|drain|Ala Letal|blades
196|Psicorrayo|boomer|Psíquico|hole
197|Mirada Lunar|vortex|Luna Negra|mirage
208|Pilar de Acero|quake|Cola Férrea|rings
212|Doble Filo|orbit|Danza Espada|blades
230|Disparo Tinta|fan|Maremoto Dragón|rings
237|Giro Rápido|dashq|Triple Patada|rage
241|Batido Lácteo|pulse|Giro Estruendoso|rush
257|Patada Ígnea|dashq|Tormenta de Puños|rage
386|Pulso Cósmico|orbit|Ataque Cosmo|meteors
448|Aura Esfera|bounce|Aura Máxima|beam
470|Hoja Aguda|fan|Tormenta de Hojas|petals
471|Cristal de Hielo|mines|Ventisca|frost
487|Garra Umbría|bounce|Devastación Distorsión|hole
700|Fuerza Lunar|chain|Brillo Mágico|sanct
900|Hachazo de Piedra|quake|Danza del Hacha|blades
979|Puño Furia|chain|Furia Fantasma|rage
1144|Psicorrayo Gélido|boomer|Tormenta Psíquica|frost
1146|Llama Oscura|trail|Fuego Siniestro|meteors
1150|Esfera Psíquica|orbit|Psicosis Total|hole
1160|Triturar|dashq|Mandíbula Férrea|rush
1487|Garra Umbría|bounce|Devastación Distorsión|hole`.split('\n').reduce((m,l)=>{const [id,an,at,un,ut]=l.split('|');m[id]={a:[an,at],u:[un,ut]};return m;},{});
 // Reservas por tipo para especies sin entrada propia.
 const POOL={
  fire:[['Rueda de Fuego','orbit'],['Rastro Ígneo','trail'],['Brasas Cadentes','meteor']],water:[['Rayo Burbuja','bounce'],['Hidrobumerán','boomer'],['Remolino','vortex']],
  grass:[['Bomba Semilla','mines'],['Hoja Aguda','fan'],['Látigo Giratorio','orbit']],electric:[['Onda Trueno','chain'],['Foco Resplandor','turret'],['Mina Eléctrica','mines']],
  psychic:[['Esfera Psíquica','orbit'],['Confusión','vortex'],['Psicorrayo','boomer']],ghost:[['Bola Sombra','bounce'],['Mina Sombría','mines'],['Rastro Espectral','trail']],
  poison:[['Residuos','trail'],['Bomba Lodo','mines'],['Ácido','fan']],dragon:[['Cola Dragón','boomer'],['Garra Dragón','dashq'],['Furia Dragón','orbit']],
  ice:[['Cristal de Hielo','mines'],['Rayo Hielo','boomer'],['Aliento Gélido','vortex']],rock:[['Lanzarrocas','meteor'],['Pilar Rocoso','quake'],['Cornada Rocosa','dashq']],
  ground:[['Excavar','dashq'],['Temblor','quake'],['Bomba Fango','mines']],fighting:[['Patada Salto','dashq'],['Onda Vacío','boomer'],['Puño Trueno','chain']],
  normal:[['Doble Patada','bounce'],['Hipercolmillo','dashq'],['Triataque','fan']],flying:[['Tornado','vortex'],['Tajo Aéreo','boomer'],['Pico Taladro','dashq']],
  bug:[['Disparo Demora','mines'],['Pin Misil','fan'],['Doble Filo','orbit']],steel:[['Foco Resplandor','turret'],['Cabezazo de Acero','dashq'],['Ala de Acero','boomer']],
  fairy:[['Fuerza Lunar','chain'],['Brillo Mágico','fan'],['Beso Drenaje','drain']],dark:[['Mirada Lunar','vortex'],['Rastro Sombrío','trail'],['Triturar','dashq']]
 };
 const UPOOL={
  fire:[['Erupción','meteors'],['Nova Ígnea','nova']],water:[['Maremoto','rings'],['Torbellino Marino','hole']],grass:[['Tormenta de Hojas','petals'],['Rayo Solar','beam']],
  electric:[['Gran Descarga','storm'],['Electrocañón','beam']],psychic:[['Psíquico','hole'],['Espejismo','mirage']],ghost:[['Pesadilla','hole'],['Legión Sombría','legion']],
  poison:[['Niebla Letal','hole'],['Lluvia Ácida','meteors']],dragon:[['Cometa Draco','meteors'],['Furia Dragón','rush']],ice:[['Ventisca','frost'],['Cristalización','nova']],
  rock:[['Roca Colosal','meteors'],['Terremoto','rings']],ground:[['Terremoto','rings'],['Tormenta de Arena','hole']],fighting:[['Furia Eterna','rage'],['Patada Mortal','rush']],
  normal:[['Hiperrayo','beam'],['Gigaimpacto','rush']],flying:[['Vendaval','hole'],['Aire Afilado','blades']],bug:[['Plaga','meteors'],['Enjambre','blades']],
  steel:[['Meteoro de Acero','meteors'],['Cañón Flash','beam']],fairy:[['Luz Lunar','sanct'],['Brillo Mágico','nova']],dark:[['Noche Eterna','hole'],['Filo Umbrío','blades']]
 };
 // ---------- Descripciones de plantillas ----------
 const TXT={
  orbit:['Orbes que giran a tu alrededor y dañan al contacto.','+ orbes y radio mayores'],boomer:['Lanza un proyectil que vuelve a ti atravesando enemigos.','+ más proyectiles, más alcance'],
  mines:['Siembra minas que se arman y estallan al pisarlas.','+ más minas y mayor área'],turret:['Coloca una torreta que dispara sola al enemigo más cercano.','+ torreta extra'],
  trail:['Dejas un rastro dañino mientras corres a toda velocidad.','+ rastro más ancho y duradero'],vortex:['Vórtice que atrae y daña a los enemigos.','+ mayor radio y duración'],
  chain:['Descarga que salta entre enemigos cercanos.','+ más saltos'],bounce:['Proyectil que rebota entre enemigos.','+ más rebotes'],
  meteor:['Meteoros caen sobre la zona señalada.','+ más meteoros y mayor área'],quake:['Ondas de choque concéntricas que aturden.','+ más ondas'],
  dashq:['Te lanzas hacia delante dañando lo que cruzas y sacudes el suelo al llegar.','+ mayor área y aturdimiento'],fan:['Abanico de proyectiles.','+ más proyectiles'],
  guard:['Barrera protectora y ráfaga de velocidad.','+ protege también a aliados'],pulse:['Pulso que cura a tu equipo y limpia estados.','+ regeneración continua'],
  drain:['Cadena que roba vida a los enemigos.','+ más saltos y más robo'],
  meteors:['Lluvia de meteoros devastadora.','+ tormenta más densa'],rings:['Ondas de choque gigantes que aturden.','+ más ondas'],hole:['Agujero que arrastra a todos y estalla al final.','+ mayor radio y explosión'],
  storm:['Rayos en cadena sobre varios enemigos a la vez.','+ más cadenas'],blades:['Aros de filos giran a tu alrededor; ganas velocidad e invulnerabilidad breve.','+ más aros'],
  rush:['Embestida invulnerable que deja rastro y termina en una gran onda.','+ onda más grande'],beam:['Rayo devastador en línea recta.','+ rayo doble y más ancho'],
  nova:['Explosión alrededor que aturde.','+ meteoros adicionales'],sanct:['Santuario: cura, protege y daña.','+ regeneración'],legion:['Despliega torretas que castigan a todo el que se acerca.','+ más torretas'],
  petals:['Remolino de pétalos con proyectiles que regresan.','+ más pétalos'],frost:['Congela y ralentiza en un área enorme.','+ ventisca extra'],
  rage:['Frenesí: más daño, velocidad y robo de vida.','+ dura más'],mirage:['Señuelo y onda psíquica aturdidora.','+ segundo señuelo']
 };
 const COOL={dashq:8,turret:12,mines:10,meteor:11,vortex:11,orbit:11,quake:10,guard:12,pulse:13},MANA={a:22};
 const hashKind=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return h;};
 const cache={};
 function kit(id){
  if(cache[id])return cache[id];const s=S[id]||{},row=LINES[id]||LINES[s.root]||null,pr=s.types?.[0]||'normal',h=hashKind(id);
  let a,u;
  if(row){a=row.a;u=row.u;}
  else{const pool=POOL[pr]||POOL.normal,up=UPOOL[pr]||UPOOL.normal;a=pool[h%pool.length];u=up[(h>>3)%up.length];}
  const tier=(s.bst||400)<330?0:(s.bst||400)<470?1:2;
  return cache[id]={a:{name:a[0],tpl:a[1]},u:{name:u[0],tpl:u[1]},tier,kind:s.kind||'hit'};
 }
 const lvOf=(a,k)=>a.skl?.[k]?.lv||0,plusOf=(a,k)=>!!a.skl?.[k]?.plus;
 function skill(a,key){ // key 'c' | 'u'
  const k=kit(a.id),d=k[key==='c'?'a':'u'],t=TXT[d.tpl],L=lvOf(a,key),plus=plusOf(a,key);
  return{name:d.name+(plus?' +':''),mode:'kit',kit:key,tpl:d.tpl,kind:k.kind,slug:'kit-'+key,source:'species',mana:key==='c'?MANA.a:0,cool:key==='c'?(COOL[d.tpl]||10):1,
   power:key==='c'?100:300,unlock:key==='c'?12:16,ult:key==='u',
   desc:(key==='u'?'DEFINITIVA · se carga luchando. ':'')+t[0]+(L?' Nivel '+(L+1)+'/5.':'')+(plus?' '+t[1]+'.':(L>=4?' Nivel máximo: puedes evolucionarla (+).':''))};
 }
 // ---------- Ejecución ----------
 const pw=(a,m)=>P.power(a,m);
 function anchor(a){const t=A.nearTarget?.(a);if(t&&dist(a,t)<520)return t;const g=a.aim??0;return{x:a.x+Math.cos(g)*170,y:a.y+Math.sin(g)*170};}
 const aimAt=(a,t)=>t?Math.atan2(t.y-a.y,t.x-a.x):(a.aim??0);
 const foes=()=>A.enemies.filter(e=>e.hp>0);
 const stat=(e,k,t)=>{if(e.boss){if(k==='sleep')return;if(k==='stun')e.stun=Math.max(e.stun||0,Math.min(.35,t));else e[k]=Math.max(e[k]||0,t*.6);return;}e[k]=Math.max(e[k]||0,t);};
 function lineHit(a,x1,y1,x2,y2,w,d,k){const dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy||1;for(const e of foes()){const t=cl(((e.x-x1)*dx+(e.y-y1)*dy)/len2,0,1),px=x1+dx*t,py=y1+dy*t;if(Math.hypot(e.x-px,e.y-py)<w+(e.r||0))A.hurt(e,d,a,{skill:true,pattern:true});}}
 function dash(a,ang,spd,dur,inv){a.burst=dur;a.vx=Math.cos(ang)*spd;a.vy=Math.sin(ang)*spd;a.inv=Math.max(a.inv||0,inv);a.aim=ang;return{x:a.x+Math.cos(ang)*spd*dur,y:a.y+Math.sin(ang)*spd*dur};}
 const RUN={
  // ---- habilidad 3 ----
  orbit(a,c){P.orbit(a,{n:2+c.tier+(c.L>>1)+(c.plus?2:0),r:92+(c.plus?28:0),life:6+c.L*.5,dmg:pw(a,.42*c.dm),kind:c.k,tick:.45});},
  boomer(a,c){const n=1+(c.L>=3?1:0)+(c.plus?2:0),base=aimAt(a,c.t);for(let i=0;i<n;i++)P.boomerang(a,{angle:base+(i-(n-1)/2)*.38,range:380+c.tier*30+(c.plus?150:0),dmg:pw(a,.95*c.dm),kind:c.k,size:1+(c.plus?.4:0)});},
  mines(a,c){P.mines(a,{at:anchor(a),n:3+c.tier+(c.L>>1)+(c.plus?3:0),spread:130,dmg:pw(a,1.3*c.dm),r:105+(c.plus?30:0),kind:c.k});},
  turret(a,c){const n=c.plus?2:1;for(let i=0;i<n;i++)P.turret(a,{at:{x:a.x+(i?40:0),y:a.y+(i?30:0)},life:10+c.L,rate:Math.max(.4,.7-c.L*.03),dmg:pw(a,.55*c.dm),kind:c.k,max:3});},
  trail(a,c){const life=3.2+c.L*.4;P.trail(a,{life,dmg:pw(a,.5*c.dm),kind:c.k,w:48+(c.plus?22:0)});a.haste=Math.max(a.haste||0,life*.8);},
  vortex(a,c){P.vortex(a,{at:anchor(a),r:230+(c.plus?70:0),life:3+c.L*.25,pull:260,dmg:pw(a,.5*c.dm),kind:c.k});},
  chain(a,c){P.chain(a,{hops:4+c.L+(c.plus?3:0),dmg:pw(a,1.1*c.dm),kind:c.k,range:230});},
  bounce(a,c){P.bounce(a,{bounces:5+c.L+(c.plus?3:0),dmg:pw(a,.95*c.dm),kind:c.k});},
  meteor(a,c){P.meteors(a,{at:anchor(a),n:5+c.tier+(c.plus?4:0),spread:190,dmg:pw(a,1.2*c.dm),r:90+(c.plus?20:0),kind:c.k});},
  quake(a,c){P.quake(a,{rings:3+(c.plus?2:0),r0:110,dr:85,dmg:pw(a,1.1*c.dm),stun:.7,kind:c.k});},
  dashq(a,c){const ang=aimAt(a,c.t),end=dash(a,ang,650,.24,.4);lineHit(a,a.x,a.y,end.x,end.y,52,pw(a,1.1*c.dm),c.k);const q=P.quake(a,{at:end,rings:c.plus?3:2,r0:100,dr:80,dmg:pw(a,.9*c.dm),stun:c.plus?1:.6,kind:c.k});if(q)q.wait=.26;},
  fan(a,c){const n=5+c.L+(c.plus?4:0),base=aimAt(a,c.t);for(let i=0;i<n;i++)A.fire(a,base+(i-(n-1)/2)*.17,430,pw(a,.8*c.dm),c.k,a.x,a.y,{size:1.1});},
  guard(a,c){a.shield=Math.max(a.shield||0,3.5+c.L*.3);a.haste=Math.max(a.haste||0,3);if(c.plus)for(const b of A.active())if(b!==a&&dist(a,b)<320)b.shield=Math.max(b.shield||0,3);A.fx('s_ring_white',a.x,a.y,2.4,.5);},
  pulse(a,c){for(const b of A.active())if(dist(a,b)<340){b.hp=Math.min(b.max,b.hp+b.max*(.18+.04*c.L));b.poison=0;b.burn=0;if(c.plus){b.aquaRing=8;b.ringPower=1;}A.fx('synthesis',b.x,b.y,1.6,.6);}},
  drain(a,c){P.chain(a,{hops:3+c.L+(c.plus?2:0),dmg:pw(a,1*c.dm),kind:c.k,range:230});a.hp=Math.min(a.max,a.hp+a.max*(.06+(c.plus?.04:0)));A.fx('synthesis',a.x,a.y,1.6,.6);},
  // ---- definitivas ----
  meteors(a,c){P.meteors(a,{at:anchor(a),n:10+c.tier*2+c.L+(c.plus?6:0),spread:300,dmg:pw(a,2.2*c.dm),r:110,interval:.12,kind:c.k});},
  rings(a,c){P.quake(a,{rings:5+(c.plus?2:0),r0:130,dr:100,dmg:pw(a,2.6*c.dm),stun:1.2,kind:c.k});},
  hole(a,c){const at=anchor(a),life=4.2+c.L*.2;P.vortex(a,{at,r:340+(c.plus?80:0),life,pull:380,dmg:pw(a,1*c.dm),kind:c.k});P.meteors(a,{at,n:1,spread:0,delay:life-.1,dmg:pw(a,5*c.dm),r:300+(c.plus?60:0),kind:c.k});},
  storm(a,c){const list=foes().filter(e=>dist(a,e)<650).sort((x,y)=>dist(a,x)-dist(a,y)).slice(0,3+(c.plus?2:0));for(const e of list)P.chain(a,{from:e,reach:700,hops:8,dmg:pw(a,1.8*c.dm),kind:c.k,range:260});if(!list.length)P.chain(a,{hops:8,dmg:pw(a,1.8*c.dm),kind:c.k});},
  blades(a,c){P.orbit(a,{n:6+(c.plus?3:0),r:120,w:5,life:8,dmg:pw(a,.8*c.dm),kind:c.k,tick:.3});a.haste=Math.max(a.haste||0,8);a.inv=Math.max(a.inv||0,1.2);},
  rush(a,c){const ang=aimAt(a,c.t),end=dash(a,ang,800,.3,1.2);lineHit(a,a.x,a.y,end.x,end.y,64,pw(a,2.4*c.dm),c.k);P.trail(a,{life:1.4,dmg:pw(a,1.2*c.dm),kind:c.k,w:56});const q=P.quake(a,{at:end,rings:c.plus?5:4,r0:120,dr:95,dmg:pw(a,3*c.dm),stun:1.2,kind:c.k});if(q)q.wait=.33;},
  beam(a,c){const ang=aimAt(a,c.t),n=c.plus?2:1;for(let i=0;i<n;i++){const an=ang+(n===2?(i?.22:-.22):0),ex=a.x+Math.cos(an)*720,ey=a.y+Math.sin(an)*720;A.effects.push({line:true,kind:c.k,x:a.x,y:a.y,ex,ey,life:.6,total:.6,size:3});lineHit(a,a.x,a.y,ex,ey,(c.plus?100:70),pw(a,4.5*c.dm),c.k);}P.burst(c.k,a.x+Math.cos(ang)*120,a.y+Math.sin(ang)*120,3,.5);},
  nova(a,c){P.quake(a,{rings:3,r0:90,dr:110,dmg:pw(a,3*c.dm),stun:1.6,kind:c.k});if(c.plus)P.meteors(a,{at:a,n:6,spread:220,dmg:pw(a,1.6*c.dm),r:90,kind:c.k});},
  sanct(a,c){for(const b of A.active())if(dist(a,b)<420){b.hp=Math.min(b.max,b.hp+b.max*.45);b.shield=Math.max(b.shield||0,6);b.poison=0;b.burn=0;b.slow=0;if(c.plus){b.aquaRing=8;b.ringPower=1.2;}A.fx('synthesis',b.x,b.y,2,.7);}
   for(const e of foes())if(dist(a,e)<300){A.hurt(e,pw(a,1.5*c.dm),a,{skill:true,pattern:true});stat(e,'slow',3);}P.burst('psychic',a.x,a.y,4,.6);},
  legion(a,c){const n=3+(c.plus?2:0);for(let i=0;i<n;i++){const an=i*6.283/n;P.turret(a,{at:{x:a.x+Math.cos(an)*70,y:a.y+Math.sin(an)*70},life:12,rate:.45,dmg:pw(a,.9*c.dm),kind:c.k,max:6});}},
  petals(a,c){P.orbit(a,{n:8+(c.plus?3:0),r:110,w:3.6,life:7,dmg:pw(a,.6*c.dm),kind:c.k,tick:.35});const b=aimAt(a,c.t);for(let i=-1;i<=1;i++)P.boomerang(a,{angle:b+i*.5,range:420,dmg:pw(a,1.6*c.dm),kind:c.k});},
  frost(a,c){for(const e of foes())if(dist(a,e)<340){stat(e,'stun',1.6);stat(e,'slow',5);A.hurt(e,pw(a,1.4*c.dm),a,{skill:true,pattern:true});}P.vortex(a,{at:a,r:320,life:4,pull:200,dmg:pw(a,.7*c.dm),kind:c.k});if(c.plus)P.quake(a,{rings:3,r0:120,dr:100,dmg:pw(a,1.5*c.dm),stun:.8,kind:c.k});P.burst(c.k,a.x,a.y,5,.7);},
  rage(a,c){const t=c.plus?12:9;a.physicalBoost=t;a.physicalAmp=1.6;a.specialBoost=t;a.specialAmp=1.6;a.haste=Math.max(a.haste||0,t);a.frenzyLeech=Math.max(a.frenzyLeech||0,t);a.inv=Math.max(a.inv||0,.8);P.burst(c.k,a.x,a.y,3.5,.6);A.fx('s_ring_white',a.x,a.y,3.2,.6);},
  mirage(a,c){window.ECOS_V10?.special?.(a,{mode:'decoy'});if(c.plus)window.ECOS_V10?.special?.(a,{mode:'decoy'});for(const e of foes())if(dist(a,e)<300){stat(e,'stun',1.8);A.hurt(e,pw(a,2*c.dm),a,{skill:true,pattern:true});}a.inv=Math.max(a.inv||0,1);P.burst('psychic',a.x,a.y,3.5,.6);}
 };
 function run(a,m){
  const key=m.kit,L=lvOf(a,key),plus=plusOf(a,key),k=kit(a.id),t=A.nearTarget?.(a),
   c={L,plus,tier:k.tier,k:k.kind,t,dm:(1+.14*L)*(plus?1.25:1)*(.94+.06*k.tier)};
  if(key==='u'){a.ult=0;a.ultFlash=1.4;A.fx('s_ring_white',a.x,a.y,3.5,.7);A.toast?.(S[a.id].name+' · '+m.name.toUpperCase()+'!');}
  if(key!=='u'&&(L>=2||plus)){A.fx('s_ring_white',a.x,a.y,1.2+L*.22,.45);}
  (RUN[m.tpl]||RUN.nova)(a,c);
 }
 // Comprobaciones previas de castSlot: nivel y medidor.
 function gate(a,m){
  if(m.mode!=='kit')return true;
  if(a.level<m.unlock){A.toast?.(m.name+' se desbloquea al nivel '+m.unlock+'.');return false;}
  if(m.ult&&(a.ult||0)<100){A.toast?.('Definitiva al '+Math.floor(a.ult||0)+'%: lucha para cargarla.');return false;}
  return true;
 }
 // ---------- Medidor ----------
 const addUlt=(a,n)=>{if(!a||a.down||!(n>0))return;a.ult=Math.min(100,(a.ult||0)+n*(a.ultGain||1));};
 const owner=o=>o?(A.players.includes(o)?o:A.players.find(p=>p.pid===o.pid)):null;
 const old={hurt:A.hurt,damage:A.damage,makePlayer:A.makePlayer,cleanActor:A.cleanActor,playerStep:A.playerStep,hud:A.hud};
 A.hurt=function(e,d,who,p){const alive=e.hp>0,r=old.hurt.call(this,e,d,who,p);const pl=owner(who);
  if(pl&&alive&&d>0){addUlt(pl,p?.pattern?.05:p?.skill?.13:.16);if(e.hp<=0)addUlt(pl,e.boss?15:e.alpha||e.elite?10:3.5);}return r;};
 A.damage=function(a,d,...r){const before=a.hp,out=old.damage.call(this,a,d,...r);if(a&&before>a.hp)addUlt(a,(before-a.hp)/Math.max(1,a.max)*55);return out;};
 A.makePlayer=function(...args){const a=old.makePlayer(...args);a.ult=30;a.skl={};return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['ult','ultFlash','skl'])if(a[k]!==undefined)o[k]=a[k];return o;};
 A.playerStep=function(a,mask,dt){
  if(a.ult===undefined)a.ult=30;if(!a.skl)a.skl={};
  const press=mask&~(a.oldInput||0);
  if(a.ultFlash>0)a.ultFlash=Math.max(0,a.ultFlash-dt);
  if(A.NET.role!=='client'&&A.g&&!A.g.ended&&!a.down&&a.combat>0)addUlt(a,.8*dt);
  old.playerStep.call(this,a,mask,dt);
  if(!a.down&&A.v6?.castSlot){if(press&8192)A.v6.castSlot(a,4);if(press&16384)A.v6.castSlot(a,5);}
 };
 // ---------- Barra de habilidades: bloqueos y medidor ----------
 function decorate(){
  const a=A.localMode==='local'?(A.players.find(p=>p.pid===(document.getElementById('barPlayer')?.value))||A.me()):A.me();if(!a||!A.g)return;
  for(const [i,m] of [[4,skill(a,'c')],[5,skill(a,'u')]]){
   const b=document.getElementById('rpgSlot'+i);if(!b)continue;const locked=a.level<m.unlock;
   if(m.ult){const pct=Math.floor(a.ult||0),ready=pct>=100&&!locked;b.classList.toggle('ultReady',ready);b.style.setProperty('--ult',pct+'%');
    b.querySelector('small').textContent=locked?String(m.unlock):ready?'LISTA':pct+'%';b.querySelector('i').style.transform='scaleY('+(locked?1:1-pct/100)+')';b.classList.remove('noMana');}
   else if(locked){b.querySelector('small').textContent=String(m.unlock);b.querySelector('i').style.transform='scaleY(1)';}
   if(locked)b.dataset.tip=(b.dataset.tip||m.name)+'\nDesbloqueo: Nv. '+m.unlock;
  }
 }
 A.hud=function(){old.hud.call(this);try{decorate();}catch(e){}};
 A.v14=Object.assign(A.v14||{},{lineHit,kit,skill,run,gate,addUlt,TXT,RUN,LINES,lv:lvOf,plus:plusOf});
 window.ECOS_KIT=A.v14;
};
