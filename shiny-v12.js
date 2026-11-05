'use strict';
/* v12 · Skins shiny: se compran en el gremio por línea evolutiva y se activan al elegir explorador.
   El sprite shiny de cada Pokémon es el actor 20000+id (PMDCollab); si una especie no lo tiene, se usa el normal. */
window.ECOS_SHINY12=function(A){
 const D=window.KANTO_DEX,old={makePlayer:A.makePlayer,saveMeta:A.saveMeta};
 const root=id=>D[id]?.root||id;
 const exists=id=>!!A.actorArt[20000+root(id)]?.Idle;
 const owns=id=>!!window.ECOS_FREE_ALL||(A.meta.shiny||[]).includes(root(id));
 const has=id=>exists(id)&&owns(id);
 const RARE={'inicial':700,'común':800,'poco común':1100,'raro':1800,'épico':3200};
 const price=id=>{const r=root(id),p=D[r];const base=Math.round((p?.price||0)*2.2/50)*50;return Math.max(RARE[p?.rarity]||900,base);};
 function buy(id){const r=root(id);if(!exists(r)||(A.meta.shiny||[]).includes(r))return false;const c=price(r);if(A.meta.bank<c)return false;A.meta.bank-=c;(A.meta.shiny??=[]).push(r);A.saveMeta();return true;}
 A.makePlayer=function(pid,profile,index){const a=old.makePlayer.call(this,pid,profile,index);a.shiny=!!profile?.shiny&&exists(a.id);a.alt=!a.shiny&&!!profile?.alt&&!!A.actorArt[30000+a.id]?.Idle;if(a.shiny||a.alt)A.loadActor(A.akey(a)).catch(()=>{});return a;};
 const cl=A.cleanActor;A.cleanActor=function(a){const o=cl(a);if(a.shiny)o.shiny=true;if(a.alt)o.alt=true;return o;};
 A.alt={exists:id=>!!A.actorArt[30000+id]?.Idle};
 A.shiny={exists,owns,has,price,buy,root};
};
