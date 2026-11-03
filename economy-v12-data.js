'use strict';
/* v12 · fusiones legendarias de tres objetos (se generan tras las fusiones de dos). */
(()=>{
 const I=window.RPG_ITEMS,F=window.ECOS_FUSION;if(!I||!F)return;
 const L=[
  {id:'cetro_ocaso',n:'Cetro del Ocaso',parts:['choice_band','scope_lens','quick_claw'],t:'Ofensiva pura'},
  {id:'egida_eterna',n:'Égida Eterna',parts:['hard_stone','focus_band','leftovers'],t:'Muralla de aguante'},
  {id:'diadema_serena',n:'Diadema Serena',parts:['shell_bell','soothe_bell','sea_incense'],t:'Curación y apoyo'},
  {id:'manto_veloz',n:'Manto del Viento',parts:['carbos','bright_powder','silver_powder'],t:'Velocidad y esquiva'},
  {id:'tesoro_rey',n:'Tesoro del Rey',parts:['lucky_egg','amulet_coin','in_battle_herb'],t:'Experiencia y fortuna'},
  {id:'nucleo_arcano',n:'Núcleo Arcano',parts:['magnet','silver_powder','in_battle_herb'],t:'Maná y potencia'}
 ].filter(l=>l.parts.every(k=>I[k]));
 const PCT=F.STATS&&new Set(['regen','mpRegen']),BOOST=.85,recipes={};
 for(const l of L){
  const e={};for(const k of Object.keys(F.STATS)){const v=l.parts.reduce((s,p)=>s+(I[p][k]||0),0);if(v)e[k]=Math.round(v*(k==='cost'?1:BOOST)*1000)/1000;}
  const key='legend_'+l.id;
  I[key]={name:l.n,icon:I[l.parts[0]].icon||l.parts[0],type:'gear',fused:true,legendary:true,parts:l.parts,...e,desc:'Legendario · '+l.t+'. Forjado con '+l.parts.map(p=>I[p].name).join(', ')+'. '+Object.entries(e).map(([k,v])=>F.fmt(k,v)).join(', ')+'.'};
  recipes[l.id]={key,parts:l.parts,name:l.n,tag:l.t};
 }
 window.ECOS_LEGEND={recipes,list:L.map(l=>l.id)};
})();
