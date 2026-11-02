/* v12 · Enemigos coherentes con el bioma.
   Cada bioma (y sus variantes) declara qué tipos le pegan; cualquier especie de su lista de enemigos
   (común o élite) que no encaje se sustituye por la más parecida en poder (BST) que sí encaje y tenga animaciones.
   Se ejecuta al cargar, antes que expansion.js, así que todo el juego usa ya las listas corregidas. */
(function(){
 const D=window.KANTO_DEX,PMD=window.PMD_DATA,B=window.RPG_BIOMES,ALTS=window.RPG_BIOME_ALTS;
 if(!D||!PMD||!B)return;
 const W=['water'];
 const TH={
  1:W,
  6:['normal','flying','grass','bug','poison','fairy','fighting'],
  11:['grass','bug','poison','normal','flying','fairy'],
  16:['rock','ground','steel','fighting','poison','normal','dark'],
  21:['poison','grass','bug','water','ground','dark'],
  26:['psychic','ghost','fairy','normal','dark'],
  31:['fire','rock','ground','steel'],
  36:['ice','water','rock','flying'],
  41:['ground','rock','fire','normal','poison','steel'],
  46:W,
  51:['electric','steel','normal'],
  56:['ghost','dark','poison','psychic'],
  61:['dragon','flying','rock','ground','normal'],
  66:['fighting','normal','steel','rock','ground','psychic'],
  71:['flying','dragon','psychic','fire','electric','ice'],
  76:['psychic','ghost','dragon','dark','fairy','steel']
 };
 /* variantes con un carácter propio distinto al del tramo */
 const ALT_TH={
  'Cascada Profunda':W,'Bosque Sombrío Profundo':['dark','poison','grass','bug','ghost'],
  'Abismo Silencioso':['psychic','ghost','dark'],'Torre Temporal':['psychic','ghost','dark','steel'],
  'Monte Trueno':['electric','steel','normal'],
  'Bosque Escarchado':['ice','water','grass'],'Sendero Nevado':['ice','water','normal','flying'],
  'Monte Lejano':['flying','dragon','normal','rock'],'Colina Wyvern':['dragon','ground','rock','poison'],
  'Bosque del Estruendo':['fighting','normal','flying','electric'],'Bosque Místico':['psychic','fairy','grass','ghost','flying'],
  'Bosque de la Pureza':['grass','fairy','psychic','flying','bug'],'Cueva Meteoro':['psychic','dragon','rock','fire','flying'],
  'Cueva Meteórica':['psychic','dragon','rock','fire','flying'],'Santuario Sellado':['psychic','ghost','dragon','fairy'],
  'Bosque Crepuscular':['grass','bug','poison','dark','ghost'],'Espesura Umbría':['grass','bug','poison','dark','normal','psychic'],
  'Región del Desierto':['ground','rock','fire','normal','poison'],'Cueva de Arenas Movedizas':['ground','rock','bug','poison','normal'],
  'Desierto del Norte':['ground','rock','normal','steel','poison'],
  'Monte Acero':['steel','rock','ground','fighting'],'Cueva Lapislázuli':['steel','rock','ground','psychic','water'],
  'Cavernas de Magma':['fire','rock','ground'],'Monte Llama':['fire','rock','ground'],'Cueva del Trueno Sordo':['electric','rock','ground','steel'],
  'Laguna de las Cascadas':W,'Mar Tormentoso':W,'Mar Milagroso':W,'Mar Cercado':W
 };
 const has=id=>!!PMD[id]&&!!D[id];
 const fits=(id,ty)=>{const t=D[id]?.types;return !!t&&t.some(x=>ty.includes(x))};
 /* un enemigo "de agua" no puede ser también de tipo eléctrico/volador puro, etc.: basta con que tenga un tipo permitido,
    salvo en el mar, donde además se exige que NO sea eléctrico (Magnemite, Pikachu, Voltorb…) */
 const okFor=(id,ty)=>fits(id,ty)&&!(ty===W&&D[id].types.includes('electric')&&!D[id].types.includes('water'));
 const all=Object.keys(D).map(Number).filter(has);
 function fix(list,ty,used){
  return list.map(id=>{
   if(okFor(id,ty)&&has(id)){used.add(id);return id}
   const bst=D[id]?.bst||300;
   const c=all.filter(x=>okFor(x,ty)&&!used.has(x)).sort((a,b)=>Math.abs(D[a].bst-bst)-Math.abs(D[b].bst-bst)||a-b)[0];
   if(c==null)return id;used.add(c);return c;});
 }
 function treat(b){
  const ty=ALT_TH[b.name]||TH[b.from];if(!ty||!ty.length)return;
  if(b.pool)b.pool=fix(b.pool,ty,new Set());
  if(b.elite)b.elite=fix(b.elite,ty,new Set(b.pool||[]));
 }
 B.forEach(treat);
 Object.values(ALTS||{}).forEach(l=>l.forEach(a=>{
  /* la variante hereda de su tramo lo que no declare; si no trae elite, la toma del tramo ya corregido */
  const base=B.filter(b=>b.from===a.from)[0];
  if(base&&!a.elite)a.elite=base.elite.slice();
  treat(a)}));
})();
