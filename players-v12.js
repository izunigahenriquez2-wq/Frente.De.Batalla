/* v12 · Los personajes jugables alternan sus animaciones de contacto (Ataque, Barrido, Doble, Golpe)
   cuando la especie las tiene (hojas de PMDCollab). Solo cambia la imagen; el daño y los tiempos siguen siendo los del movimiento. */
window.ECOS_PLAYERS12=function(A){
 const old=A.action;
 const VARS=['Attack','Swing','Double','Strike'];
 A.action=function(a,name,fn,duration){
  let n=name;
  if(name==='Attack'&&a&&a.pid!=null&&!a.boss){
   const art=A.actorArt?.[a.id]||{},vs=VARS.filter(v=>art[v]);
   if(vs.length>1){a.cmb=((a.cmb||0)+1)%vs.length;n=vs[a.cmb];}
  }
  return old.call(this,a,n,fn,duration);
 };
};
