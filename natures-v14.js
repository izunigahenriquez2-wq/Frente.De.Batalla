// V14 · Naturalezas. Se eligen al preparar al explorador. Adaptan la idea de Pokémon a las cinco estadísticas de Ecos:
// Fuerza (daño) · Pericia (poder de habilidades) · Vigor (vida) · Temple (armadura) · Agilidad (velocidad).
// Veinte naturalezas suben una y bajan otra; las cinco neutras dan una ventaja pequeña propia.
window.ECOS_STATS14={fue:'Fuerza',per:'Pericia',vig:'Vigor',tem:'Temple',agi:'Agilidad'};
window.ECOS_NATURES=(()=>{
 const n=[],T=['fue','tem','agi','per','vig'],names=[
  ['Fuerte','Huraña','Audaz','Firme','Pícara'],['Osada','Dócil','Plácida','Agitada','Floja'],['Miedosa','Activa','Seria','Alegre','Ingenua'],
  ['Modesta','Afable','Mansa','Tímida','Alocada'],['Serena','Amable','Grosera','Cauta','Rara']];
 const quirk={fue:{xp:.06,txt:'+6 % de experiencia'},tem:{ult:.12,txt:'+12 % de carga de definitiva'},agi:{cdr:.05,txt:'−5 % de recarga'},per:{crit:.04,txt:'+4 % de crítico'},vig:{mp:.1,mpRegen:.25,txt:'+10 % de maná y regeneración de maná'}};
 for(let r=0;r<5;r++)for(let c=0;c<5;c++){const up=T[r],down=T[c];n.push({id:names[r][c].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''),name:names[r][c],up:r===c?null:up,down:r===c?null:down,quirk:r===c?quirk[up]:null});}
 return n;
})();
window.ECOS_NATURE_BY=Object.fromEntries(window.ECOS_NATURES.map(n=>[n.id,n]));
window.ECOS_NATURE_TEXT=n=>{const S=window.ECOS_STATS14;if(!n)return'';return n.up?`+${S[n.up]} · −${S[n.down]}`:`Equilibrada · ${n.quirk.txt}`;};
window.ECOS_NATURES14=function(A){
 const N=window.ECOS_NATURE_BY,old={stats:A.stats,makePlayer:A.makePlayer,cleanActor:A.cleanActor,gainXP:A.gainXP};
 const MUL={fue:v=>{},per:v=>{},vig:v=>{},tem:v=>{},agi:v=>{}};
 A.stats=function(a){
  const ratio=a.max?a.hp/a.max:1;old.stats.call(this,a);const n=N[a.nature];if(!n)return;
  const k={fue:0,per:0,vig:0,tem:0,agi:0};if(n.up){k[n.up]+=1;k[n.down]-=1;}
  if(k.fue)a.damage*=1+.08*k.fue;
  if(k.per)a.skillPower=(a.skillPower||1)*(1+.10*k.per);
  if(k.vig){a.max=Math.round(a.max*(1+.10*k.vig));a.hp=Math.min(a.max,Math.max(1,a.max*ratio));}
  if(k.tem)a.armor=Math.max(-.1,Math.min(.45,(a.armor||0)+.06*k.tem));
  if(k.agi)a.speed=Math.min(295,a.speed*(1+.08*k.agi));
  const q=n.quirk;if(q){if(q.xp)a.xpBonus=(a.xpBonus||1)+q.xp;if(q.cdr)a.cdr=Math.min(.45,(a.cdr||0)+q.cdr);if(q.crit)a.crit=Math.min(.65,(a.crit||0)+q.crit);
   if(q.mp){a.maxMp=Math.round(a.maxMp*(1+q.mp));a.mp=Math.min(a.mp??a.maxMp,a.maxMp);}if(q.mpRegen)a.mpRegen=(a.mpRegen||0)+q.mpRegen;a.ultGain=1+(q.ult||0);}
  else a.ultGain=1;
 };
 A.makePlayer=function(pid,profile,index){const a=old.makePlayer.call(this,pid,profile,index);a.nature=N[profile?.nature]?profile.nature:'seria';A.stats(a);a.hp=a.max;return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);if(a.nature)o.nature=a.nature;return o;};
 A.natures={list:window.ECOS_NATURES,by:N};
};
