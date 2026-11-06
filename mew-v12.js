/* v12 · Mew jugable (épico, tienda del gremio). Jugabilidad propia:
   · Q Metrónomo: lanza una técnica al azar de seis posibles (rayo, nova, esferas, escudo, terremoto, llamas).
   · E Transformación: 8 s con el aspecto del enemigo más cercano; tu ataque básico pasa a ser el suyo (+35 % de daño) y ganas un escudo breve.
   · Pasiva Genoma Ancestral: cada especie distinta que derrotas añade +2 % de daño permanente (máx. 15 especies). */
(function(){
 const D=window.KANTO_DEX,S=window.RPG_SPECIES,ID=151;
 const m=D[ID]; if(!m)return;
 m.playable=true;m.buyable=true;m.root=ID;m.price=m.price||3150;m.rarity='épico';
 const METRO={name:'Metrónomo',mode:'mewmetro',kind:'psychic',type:'psychic',category:'special',power:60,mana:18,cool:6.5,desc:'Lanza una técnica al azar: rayo, nova, esferas, escudo, terremoto o llamas.',slug:'metronome'};
 const MORPH={name:'Transformación',mode:'mewmorph',kind:'psychic',type:'normal',category:'status',power:0,mana:26,cool:16,desc:'8 s con el aspecto del enemigo más cercano: tu ataque básico se convierte en el suyo (+35 % de daño) y ganas un escudo breve.',slug:'transform'};
 m.moves=[m.moves[0],METRO,MORPH];
 if(window.ECOS_FAMILIES?.passives)window.ECOS_FAMILIES.passives[ID]={name:'Genoma Ancestral',desc:'Cada especie distinta que derrotas añade +2 % de daño permanente (máx. 15).',effect:'mew'};
})();
window.ECOS_MEW12=function(A){
 const D=window.KANTO_DEX,S=window.RPG_SPECIES,dist=A.distance,ID=151;
 const m=D[ID]; if(!m)return;
 const METRO=m.moves[1],MORPH=m.moves[2];
 const V10=window.ECOS_V10=window.ECOS_V10||{},oldMoves=V10.moves;
 V10.moves=function(a){
  const base=oldMoves?oldMoves(a):null;
  if(!a||a.id!==ID)return base;
  const b=base||m.moves;
  let first=b[0];
  if(a.morph>0&&a.disguise&&S[a.disguise]?.moves?.[0]&&!/mew/.test(S[a.disguise].moves[0].mode))first={...S[a.disguise].moves[0],power:(S[a.disguise].moves[0].power||40)*1.35};
  return [first,METRO,MORPH];
 };
 const oldCast=A.v4.cast;
 A.v4.cast=function(a,mv){
  if(mv.mode==='mewmetro')return metro(a);
  if(mv.mode==='mewmorph')return morph(a);
  return oldCast.call(this,a,mv);
 };
 const near=(a,r)=>A.enemies.filter(e=>e.hp>0&&dist(a,e)<r&&A.clearLine(a,e)).sort((x,y)=>dist(a,x)-dist(a,y));
 const dmg=(a,k)=>A.dealt(a,a.damage*k*(a.skillPower||1)*1.45);
 function metro(a){
  const t=A.nearTarget(a),ang=t?Math.atan2(t.y-a.y,t.x-a.x):a.aim??Math.PI/2;
  const opts=[
   ['Psíquico',()=>{A.effects.push({line:true,kind:'psychic',x:a.x,y:a.y,ex:a.x+Math.cos(ang)*780,ey:a.y+Math.sin(ang)*780,life:.4,total:.4,size:1});for(const e of near(a,850)){const ea=Math.atan2(e.y-a.y,e.x-a.x);if(Math.abs(Math.atan2(Math.sin(ea-ang),Math.cos(ea-ang)))<.2)A.hurt(e,dmg(a,1.7),a,{effect:'beam'});}}],
   ['Nova Psíquica',()=>{for(const e of near(a,200)){A.hurt(e,dmg(a,1.2),a);e.stun=Math.max(e.stun||0,1.2);}A.fx('psychic',a.x,a.y,4,.6);}],
   ['Esfera Aural',()=>{for(const e of near(a,520).slice(0,3)){A.hurt(e,dmg(a,1.45),a);A.fx('aura_sphere',e.x,e.y,2,.5);}}],
   ['Escudo y Recuperación',()=>{a.shield=Math.max(a.shield||0,4);a.hp=Math.min(a.max,a.hp+a.max*.22*(a.healPower||1));A.fx('water',a.x,a.y,3,.6);}],
   ['Terremoto',()=>{for(const e of near(a,270)){A.hurt(e,dmg(a,1.0),a);e.slow=Math.max(e.slow||0,2.5);}A.fx('quake',a.x,a.y,4,.65);}],
   ['Lanzallamas',()=>{oldCast.call(A.v4,a,{name:'Lanzallamas',mode:'cone',kind:'fire',type:'fire',power:100,mana:0,cool:1,slug:'flamethrower',category:'special'});}]
  ];
  const o=A.pick(opts);o[1]();if(a.pid===A.myPid)A.toast('Metrónomo → '+o[0]+'.');
 }
 function morph(a){
  const t=A.nearTarget(a),pool=A.stage?.()?.pool||[19,41];
  const id=t&&S[t.id]?t.id:A.pick(pool);
  a.disguise=id;a.morph=8;a.shield=Math.max(a.shield||0,2);
  A.loadActor(id).catch(()=>{});A.fx('psychic',a.x,a.y,3,.6);
  if(a.pid===A.myPid)A.toast('Transformación → '+(S[id]?.name||'enemigo')+'.');
 }
 // aspecto durante la transformación
 const oldKey=A.akey;
 A.akey=function(a){
  if(a&&a.morph>0&&a.disguise&&A.actorArt[a.disguise]?.Idle)return a.disguise;
  return oldKey.call(this,a);
 };
 // temporizador + bonificación del básico transformado
 const oldStep=A.step;
 A.step=function(dt){
  for(const a of A.players)if(a.morph>0){a.morph-=dt;if(a.morph<=0){a.morph=0;a.disguise=null;}}
  return oldStep.call(this,dt);
 };
 // pasiva: especies derrotadas
 const oldHurt=A.hurt;
 A.hurt=function(t,amount,src,opt){
  const was=t&&t.hp>0&&!t.pid;
  const r=oldHurt.call(this,t,amount,src,opt);
  const owner=src&&src.pid!=null?src:(src&&src.owner!=null?A.players.find(p=>p.pid===src.owner):null);
  if(was&&t.hp<=0&&owner&&owner.id===ID&&!t.mewSeen){
   t.mewSeen=true;owner.lore??=[];
   if(!owner.lore.includes(t.id)&&owner.lore.length<15){owner.lore.push(t.id);A.stats(owner);if(owner.pid===A.myPid)A.toast('Genoma Ancestral: '+owner.lore.length+' especies (+'+owner.lore.length*2+' % de daño).');}
  }
  return r;
 };
 const oldStats=A.stats;
 A.stats=function(a){
  oldStats.call(this,a);
  if(a&&a.id===ID&&a.lore?.length)a.damage*=1+.02*a.lore.length;
 };
 const oldClean=A.cleanActor;
 A.cleanActor=function(a){const o=oldClean.call(this,a);if(a&&a.id===ID){o.morph=a.morph||0;o.disguise=a.disguise||null;o.lore=a.lore||[];}return o;};
};
