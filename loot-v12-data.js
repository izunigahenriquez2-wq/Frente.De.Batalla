'use strict';
/* Pokémon Echoe's · v12 · botín estilo Diablo (datos y motor puro).
   Cada pieza de equipo con rareza se codifica entera en su clave, así el anfitrión y los clientes
   la reconstruyen igual sin enviar definiciones:
     L~<base>~<rareza m/r/l/u>~<nivel>~<afijo.valor,afijo.valor…>~<aspectos a+b>~<semilla de nombre>
   Los valores van en milésimas (45 = 0,045). RPG_ITEMS pasa a ser un Proxy que construye esas piezas al vuelo. */
(function(){
 const raw=window.RPG_ITEMS;if(!raw||window.ECOS_LOOT)return;
 const ST={damage:['daño','%'],speed:['velocidad','%'],hp:['vida máxima','%'],crit:['prob. de crítico','%'],mana:['maná máximo','%'],cdr:['enfriamiento','%'],armor:['defensa','%'],regen:['PS/s','f'],mpRegen:['PM/s','f'],skill:['potencia de movimientos','%'],leech:['robo de vida','%'],healing:['curación','%'],xp:['experiencia','%'],cost:['coste de maná','%'],rescue:['velocidad de rescate','%'],electric:['daño eléctrico','%']};
 const STATS=Object.keys(ST);
 const RAR={
  c:{id:'common',n:'Común',color:'#e6e2d2',dust:5},m:{id:'magic',n:'Mágico',color:'#5aa0ff',dust:10},
  r:{id:'rare',n:'Raro',color:'#f5dd4a',dust:20},l:{id:'legendary',n:'Legendario',color:'#ff8c2e',dust:50},u:{id:'unique',n:'Único',color:'#e2b26a',dust:100}
 };
 const BYID=Object.fromEntries(Object.entries(RAR).map(([k,v])=>[v.id,k]));
 // Afijos: peso (probabilidad relativa) y rango [mín,máx] por rareza. Los más potentes pesan menos.
 const AFF={
  damage:{w:10,m:[.02,.04],r:[.03,.06],l:[.05,.08]},hp:{w:10,m:[.03,.06],r:[.05,.09],l:[.07,.12]},
  speed:{w:8,m:[.02,.04],r:[.03,.06],l:[.05,.08]},crit:{w:8,m:[.02,.035],r:[.03,.05],l:[.045,.07]},
  armor:{w:7,m:[.015,.03],r:[.02,.04],l:[.03,.055]},skill:{w:9,m:[.03,.05],r:[.04,.07],l:[.06,.1]},
  cdr:{w:6,m:[.02,.035],r:[.03,.05],l:[.04,.065]},mana:{w:7,m:[.04,.08],r:[.06,.1],l:[.08,.14]},
  mpRegen:{w:6,m:[.3,.5],r:[.4,.7],l:[.6,.9]},regen:{w:6,m:[.8,1.4],r:[1.2,2],l:[1.8,2.8]},
  leech:{w:3,m:[.01,.02],r:[.015,.03],l:[.025,.04]},healing:{w:5,m:[.05,.1],r:[.08,.14],l:[.12,.18]},
  xp:{w:4,m:[.05,.1],r:[.08,.14],l:[.12,.2]},cost:{w:3,m:[-.04,-.07],r:[-.06,-.1],l:[-.08,-.13]}
 };
 const SUF={damage:'de Furia',hp:'de Vigor',speed:'de Viento',crit:'de Precisión',armor:'de Roca',skill:'de Poder',cdr:'de Prisa',mana:'de Sabiduría',mpRegen:'de Flujo',regen:'de Savia',leech:'de Sangre',healing:'de Alivio',xp:'de Experiencia',cost:'de Ahorro'};
 const NAMES=['Ojo de la Tormenta','Sello Ancestral','Lazo del Alba','Destello Salvaje','Latido de Cristal','Susurro del Abismo','Colmillo Eterno','Reflejo Lunar','Vórtice Ardiente','Eco de las Sombras','Presagio Dorado','Aliento Glacial','Fulgor del Bosque','Juramento Férreo','Rastro Estelar','Corazón de Brasa','Velo del Crepúsculo','Alma de Trueno','Mirada del Halcón','Promesa del Mar','Chispa Indómita','Reliquia Olvidada','Tesoro del Viajero','Instinto Primigenio','Ascua Serena','Cántico del Viento','Brújula Errante','Marea Viva','Sombra Fugaz','Orgullo del Alfa'];
 // Aspectos: poderes especiales de piezas Legendarias y Únicas (los aplica loot-v12.js).
 const ASP={
  boss:{name:'Azote de Jefes',desc:'+22 % de daño a jefes.'},
  exec:{name:'Verdugo',desc:'+30 % de daño a enemigos con menos del 30 % de vida.'},
  bers:{name:'Furia Desesperada',desc:'+25 % de daño mientras tengas menos del 50 % de vida.'},
  lucky:{name:'Golpe Afortunado',desc:'10 % de probabilidad de que tus golpes hagan el doble de daño.'},
  blood:{name:'Sed de Sangre',desc:'Al derrotar a un enemigo recuperas el 3 % de tus PS máximos.'},
  manae:{name:'Eco Arcano',desc:'Al derrotar a un enemigo recuperas el 5 % de tus PM máximos.'},
  aura:{name:'Aura Vital',desc:'Tú y los aliados a menos de 260 px regeneráis 1,2 PS/s.'},
  frenz:{name:'Frenesí',desc:'Al derrotar a un enemigo obtienes 3 s de aceleración.'}
 };
 const ASPK=Object.keys(ASP);
 const UNIQ_ASP={crab_claw:['boss'],aura_band:['lucky'],blaze_band:['bers'],seed_pack:['aura'],dragon_scale:['exec'],shell_armor:['blood','aura'],meteorite:['manae'],griseous_orb:['blood'],mind_crown:['manae','lucky'],ironjaw_hook:['boss','blood'],ironjaw_chest:['boss','lucky','blood'],pirate_hat:['lucky','frenz'],charcoal:['bers'],twisted_spoon:['manae'],spell_tag:['lucky'],miracle_seed:['aura','frenz']};
 // Probabilidad de cada rareza según el origen y el piso (se normalizan).
 const WEIGHTS={
  chest:f=>({c:Math.max(18,58-.4*f),m:30+.05*f,r:9+.32*f,l:1.8+.075*f,u:.1+.004*f}),
  event:f=>({c:38,m:42,r:15+.1*f,l:3.2+.05*f,u:.25}),
  shop:f=>({c:0,m:Math.max(40,62-.3*f),r:33+.2*f,l:4+.08*f,u:0}),
  sub:f=>({c:0,m:12,r:54,l:30+.15*f,u:4+.03*f}),
  boss:f=>({c:0,m:0,r:35,l:52+.1*f,u:13+.04*f})
 };
 const FACT={m:.5,r:.5,l:.55,u:.8};     // parte de las estadísticas originales de la base que conserva cada rareza
 const fmt=(s,v)=>{const [n,t]=ST[s];const x=t==='%'?Math.round(v*1000)/10:Math.round(v*10)/10;return(v<0?'':'+')+String(x).replace('.',',')+(t==='%'?' % ':' ')+n;};
 const baseVals=b=>{const src=b.base0||b,o={};for(const s of STATS)if(typeof src[s]==='number'&&src[s])o[s]=src[s];return o;};
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};

 function build(key,T){
  const p=String(key).split('~');if(p[0]!=='L'||p.length<7)return null;
  const [,bk,r,lv,affs,asp,seed]=p,b=T[bk];if(!b||b.type!=='gear'||!RAR[r]||r==='c')return null;
  const ilvl=Math.max(1,Math.min(99,+lv||1)),aff=[];
  for(const x of affs.split(',')){if(!x)continue;const [s,v]=x.split('.');if(!ST[s])continue;aff.push([s,(+v||0)/1000]);}
  const aspects=asp?asp.split('+').filter(a=>ASP[a]):[];
  const stats={};
  if(r!=='u')for(const [s,v] of Object.entries(baseVals(b)))stats[s]=(stats[s]||0)+v*FACT[r];
  for(const [s,v] of aff)stats[s]=(stats[s]||0)+v;
  const n=+seed||0;
  const top=aff[0]?.[0];
  const name=r==='m'?b.name+' '+(SUF[top]||'Mágico'):r==='r'?NAMES[n%NAMES.length]:r==='l'?b.name+' · '+ASP[aspects[0]||'boss'].name:b.name;
  const lines=['['+RAR[r].n+' · nivel '+ilvl+']'];
  if(r!=='u'&&r!=='c')lines.push('Base: '+b.name);
  for(const [s,v] of Object.entries(stats))lines.push(fmt(s,v));
  if(b.typeAmp){const t=Object.keys(b.typeAmp)[0];lines.push('+'+Math.round(b.typeAmp[t]*100)+' % de daño si tu Pokémon es de tipo '+String(b.name).replace(/^Cresta\s+/,'')+' (+'+Math.round(b.typeAmp[t]*27)+' % en otro caso).');}
  if(bk==='xray_specs')lines.push('Ves las trampas cercanas.');
  for(const a of aspects)lines.push('★ '+ASP[a].name+': '+ASP[a].desc);
  if(b.jobs&&b.jobsText)lines.push('Para '+b.jobsText+'.');
  const def={name,icon:b.icon,type:'gear',rarity:RAR[r].id,rk:r,ilvl,inst:true,baseKey:bk,parts:[bk],asp:aspects,...stats,desc:lines.join('\n')};
  if(b.jobs)def.jobs=b.jobs;if(b.jobsText)def.jobsText=b.jobsText;
  return def;
 }
 const cache=Object.create(null),isInst=k=>typeof k==='string'&&k.charCodeAt(0)===76&&k.charCodeAt(1)===126;
 const proxy=new Proxy(raw,{
  get(t,k,rc){if(isInst(k))return cache[k]||(cache[k]=build(k,t))||undefined;return Reflect.get(t,k,rc);},
  has(t,k){if(isInst(k))return !!(cache[k]||(cache[k]=build(k,t)));return Reflect.has(t,k);}
 });
 window.RPG_ITEMS=proxy;

 // ---------- generación ----------
 const wpick=(entries,rnd)=>{let tot=0;for(const [,w] of entries)tot+=w;if(tot<=0)return entries[0]?.[0];let x=rnd()*tot;for(const [v,w] of entries){if((x-=w)<0)return v;}return entries.at(-1)[0];};
 const rollRarity=(src,floor,rnd=Math.random,min)=>{const w=(WEIGHTS[src]||WEIGHTS.chest)(Math.min(80,floor||1));const order=['c','m','r','l','u'],i0=min?order.indexOf(min):0;return wpick(order.filter((_,i)=>i>=i0).map(r=>[r,Math.max(0,w[r]||0)]),rnd);};
 const bases=()=>Object.keys(raw).filter(k=>{const it=raw[k];return it.type==='gear'&&!it.fused&&!it.unique&&!it.legendary&&!it.inst;});
 const baseWeight=k=>k.startsWith('crest_')?.6:(window.ECOS_ITEMS11?.rare||[]).includes(k)?.5:1;
 const pickBase=(rnd=Math.random,jobs)=>{const pool=bases().filter(k=>!raw[k].jobs||!jobs||jobs.some(j=>raw[k].jobs.includes(j)));return wpick(pool.map(k=>[k,baseWeight(k)]),rnd);};
 const uniqueBases=()=>Object.keys(raw).filter(k=>raw[k].type==='gear'&&raw[k].unique);
 const rollAffixes=(r,n,ilvl,rnd,exclude=[])=>{
  const pool=Object.entries(AFF).filter(([s])=>!exclude.includes(s)).map(([s,a])=>[s,a.w]),out=[],sc=1+ilvl*.004;
  while(out.length<n&&pool.length){const s=wpick(pool,rnd);pool.splice(pool.findIndex(x=>x[0]===s),1);const [lo,hi]=AFF[s][r],v=(lo+(hi-lo)*rnd())*sc;out.push([s,Math.round(v*1000)]);}
  return out;
 };
 const keyOf=(bk,r,ilvl,aff,asp,seed)=>['L',bk,r,ilvl,aff.map(([s,v])=>s+'.'+v).join(','),asp.join('+'),seed].join('~');
 function make(r,floor,o={}){
  const rnd=o.rnd||Math.random,ilvl=Math.max(1,Math.min(80,Math.round(floor||1)));
  if(r==='c'){return o.base||pickBase(rnd,o.jobs);}
  if(r==='u'){const bk=o.base&&raw[o.base]?.unique?o.base:wpick(uniqueBases().map(k=>[k,1]),rnd),bv=baseVals(raw[bk]),aff=[];
   for(const [s,v] of Object.entries(bv))aff.push([s,Math.round(v*FACT.u*(.9+.2*rnd())*1000)]);
   return keyOf(bk,'u',ilvl,aff,UNIQ_ASP[bk]||[ASPK[Math.floor(rnd()*ASPK.length)]],Math.floor(rnd()*9999));}
  const bk=o.base||pickBase(rnd,o.jobs),bs=Object.keys(baseVals(raw[bk]));
  let n=r==='m'?(rnd()<.6?1:2):r==='r'?(rnd()<Math.min(.7,.2+ilvl*.006)?4:3):4;
  const aff=rollAffixes(r,n,ilvl,rnd,r==='m'?[]:[]),asp=r==='l'?[ASPK[Math.floor(rnd()*ASPK.length)]]:[];
  return keyOf(bk,r,ilvl,aff,asp,Math.floor(rnd()*9999));
 }
 function roll(src,floor,o={}){const r=rollRarity(src,floor,o.rnd,o.min);return{key:make(r,floor,o),rarity:r};}
 const rarityOf=it=>!it?'c':it.rk||(it.unique?'u':it.legendary?'l':it.fused?'r':'c');
 window.ECOS_LOOT={RAR,BYID,AFF,ASP,ST,WEIGHTS,UNIQ_ASP,fmt,roll,make,rollRarity,rarityOf,isInst,hash,pickBase,build:k=>proxy[k]};
})();
