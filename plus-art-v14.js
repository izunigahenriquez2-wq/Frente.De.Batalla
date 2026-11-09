// V14 · Arte de las habilidades «+»: insignias doradas para la barra/cartas/libro y un estallido rúnico propio al lanzarlas.
window.ECOS_PLUSART14=function(A){
 'use strict';
 const NAMES=['aquaring','beam','bell','discharge','dragon','fire','flame','ghost','hit','ice','leaf','leech','poison','protect','psychic','quake','rock','sleep','spark','star','swords','synthesis','water','wave','whip'];
 for(const n of NAMES){const im=new Image();im.src='assets/plus-fx/'+n+'.png';A.fxArt['plus_'+n]={size:128,im};const ic=new Image();ic.src='assets/tech-icons/plus/'+n+'.png';}
 const isPlus=m=>!!m&&/ \+$/.test(m.name||'');
 const nameOf=m=>{const u=A.v6?.icon?.(m)||'';const f=u.split('/').pop().replace('.png','');return NAMES.includes(f)?f:'star';};
 // Estallido: tamaño según el tipo de casilla (definitiva más grande).
 function burst(a,m,size){if(!a||!isPlus(m))return;A.fx('plus_'+nameOf(m),a.x,a.y,size||(m.ult||m.kit==="u"?4.2:2.6),m.ult||m.kit==='u'?.95:.7);}
 const old=A.v8.afterMove;
 A.v8.afterMove=function(a,m){try{burst(a,m);}catch(e){}return old.apply(this,arguments);};
 A.v14.plusBurst=burst;A.v14.isPlus=isPlus;
};
