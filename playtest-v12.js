/* v12 · Modo pruebas: todos los personajes jugables gratis (ECOS_FREE_ALL) y Pichu fuera del reclutamiento.
   Para volver al reclutamiento normal basta con poner ECOS_FREE_ALL=false. Lo que se compra de verdad
   se sigue guardando aparte, así que no se pierde ni se regala nada de forma permanente. */
window.ECOS_FREE_ALL=true;
/* datos: se aplican al cargar, antes que ui.js/expansion.js cuenten el gremio */
(function(){const D=window.KANTO_DEX,F=window.ECOS_FAMILIES?.dex;
 [D,F].forEach(X=>{if(!X)return;
  if(X[172]){X[172].buyable=false;X[172].playable=false;X[172].free=false}
  if(X[25]&&X[25].root===172)X[25].root=25;if(X[26]&&X[26].root===172)X[26].root=25;});})();
window.ECOS_PLAYTEST12=function(A){
 const D=window.KANTO_DEX;
 const real=new Set(A.meta.unlocked.filter(id=>id!==172&&D[id]?.buyable));real.add(25);
 const all=Object.keys(D).map(Number).filter(id=>D[id].buyable);
 const apply=()=>{A.meta.unlocked=window.ECOS_FREE_ALL?[...new Set([...real,...all])]:[...real]};
 apply();
 const oldSave=A.saveMeta;
 A.saveMeta=function(){ /* guarda solo lo realmente reclutado */
  A.meta.unlocked.forEach(id=>{if(!window.ECOS_FREE_ALL)real.add(id)});
  const full=A.meta.unlocked;A.meta.unlocked=[...real];
  try{return oldSave.apply(this,arguments)}finally{A.meta.unlocked=full}};
 try{const p=JSON.parse(localStorage.getItem('ecosProfile'));if(p&&+p.base===172){p.base=25;localStorage.setItem('ecosProfile',JSON.stringify(p))}}catch{}
};
