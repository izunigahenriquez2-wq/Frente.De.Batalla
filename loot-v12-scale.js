'use strict';
/* v12 · Ajuste de las piezas Comunes (equipo base) al pasar de 3 a 6 ranuras.
   Se ejecuta antes de generar las fusiones, así éstas heredan los valores ajustados.
   Se guardan los valores originales en base0 para que Mágico/Raro/Legendario/Único los usen como base. */
(function(){
 const I=window.RPG_ITEMS,L=window.ECOS_LOOT;if(!I||!L||I.protein?.base0)return;
 const F=.55,STATS=Object.keys(L.ST);
 for(const [k,it] of Object.entries(I)){
  if(it.type!=='gear'||it.fused||it.legendary||it.inst)continue;
  it.base0={};for(const s of STATS)if(typeof it[s]==='number'&&it[s])it.base0[s]=it[s];
  if(it.unique)continue;
  for(const s of Object.keys(it.base0))it[s]=Math.round(it[s]*F*1000)/1000;
  const parts=Object.keys(it.base0).map(s=>L.fmt(s,it[s]));
  if(it.typeAmp){
   const t=Object.keys(it.typeAmp)[0],tn=it.typeAmp[t];it.typeAmp={[t]:Math.round(tn*F*1000)/1000};
   const nm=(it.name||'').replace(/^Cresta\s+/,'');
   it.desc='Equipada: +'+Math.round(it.typeAmp[t]*100)+' % de daño si tu Pokémon es de tipo '+nm+' (+'+Math.round(it.typeAmp[t]*.27*100)+' % en otro caso)'+(parts.length?', '+parts.join(', '):'')+'.';
  }else if(k==='xray_specs')it.desc='Equipadas: '+parts.join(', ')+' y ves las trampas cercanas.';
  else it.desc='Equipado: '+parts.join(', ')+'.';
 }
})();
