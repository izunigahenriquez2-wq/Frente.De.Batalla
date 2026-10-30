'use strict';
window.ECOS_V8=function(A){
 const F=ECOS_FAMILIES,M=ECOS_TECH.moves,$=id=>document.getElementById(id),esc=A.escape;
 M['shadow-ball'].desc='Proyectil que ralentiza 2 s; la identidad Fantasma aumenta el daño sobre enemigos afectados.';M['sludge-bomb'].desc='Proyectil venenoso: 5 s de veneno y salpicadura de daño en un radio de 80 px.';
 const old={makePlayer:A.makePlayer,gainXP:A.gainXP,stats:A.stats,playerStep:A.playerStep,hurt:A.hurt,fire:A.fire,cleanActor:A.cleanActor,requestAction:A.requestAction,hud:A.hud,menu:A.menu,action:A.NET.callbacks.action};
 const moves=a=>RPG_SPECIES[a.id].moves.map((m,i)=>i>0&&M[a.speciesChoices?.[i-1]]?{...M[a.speciesChoices[i-1]],slug:a.speciesChoices[i-1],source:'species'}:m);
 function pending(a){if(!a||!F.choices[a.id])return[];return [1,2].filter(slot=>a.level>=(slot===1?10:20)&&!a.pathHistory?.[a.id+':'+slot]).map(slot=>({key:a.id+':'+slot,slot,options:F.choices[a.id][slot-1]}));}
 function initialize(a){a.speciesChoices??=[null,null];a.pathHistory??={};a.identityCD??=0;}
 function choose(a,key,slug){if(!a||!A.g||A.g.ended||a.down||a.disconnected||a.evolving||a.action||(A.localMode==='online'&&A.g.paused))return false;initialize(a);const offer=pending(a).find(x=>x.key===key);if(!offer||!offer.options.includes(slug))return false;a.speciesChoices[offer.slot-1]=slug;a.pathHistory[key]=slug;A.toast(RPG_SPECIES[a.id].name+' aprendió '+M[slug].name+' · '+(offer.slot===1?'Q':'E'));return true;}
 A.makePlayer=function(...args){const a=old.makePlayer(...args);initialize(a);return a;};
 A.stats=function(a){old.stats(a);initialize(a);};
 A.gainXP=function(a,n){const before=pending(a).length;old.gainXP(a,n);initialize(a);if(pending(a).length>before&&a.pid===A.myPid)A.toast('Nueva elección de técnica · abre Desarrollo');};
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['speciesChoices','pathHistory','identityCD'])if(a[k]!==undefined)o[k]=a[k];return o;};
 const server=(a,key)=>{const [offer,slug]=String(key).split('|');return choose(a,offer,slug);};
 A.requestAction=function(type,key){if(type==='path'){if(A.NET.role==='client')A.NET.action(type,key);else server(A.me(),key);return;}old.requestAction(type,key);};
 A.NET.callbacks.action=(pid,type,key)=>type==='path'?server(A.players.find(a=>a.pid===pid),key):old.action?.(pid,type,key);
 A.fire=function(owner,angle,speed,damage,kind,x,y,options={}){return old.fire(owner,angle,speed,damage,kind,x,y,{...options,moveSlug:options.moveSlug||owner?.castingMove});};
 A.hurt=function(e,d,a,p){const paid=!!(p?.skill||a?.castingSkill),identity=F.passives[a?.id]?.effect,slug=p?.moveSlug||a?.castingMove;if(paid&&identity==='haunt'&&(e.poison>0||e.sleep>0||e.slow>0))d*=1.25;const before=e.hp,result=old.hurt(e,d,a,p);if(a&&paid&&e.hp<before&&e.hp>0){if(identity==='blaze')e.burn=Math.max(e.burn||0,3);if(identity==='toxic'||slug==='sludge-bomb')e.poison=Math.max(e.poison||0,5);if(slug==='shadow-ball')e.slow=Math.max(e.slow||0,2);if(slug==='sludge-bomb'&&!p?.splash)for(const other of A.enemies)if(other!==e&&other.hp>0&&A.distance(other,e)<80&&A.clearLine(other,e)){old.hurt(other,d*.35,a,{skill:true,splash:true});other.poison=Math.max(other.poison||0,3);}if(identity==='static')e.slow=Math.max(e.slow||0,1.2);if(identity==='torrent'){const dx=e.x-a.x,dy=e.y-a.y,len=Math.hypot(dx,dy)||1;A.move(e,dx/len*28,dy/len*28);}}return result;};
 function afterMove(a,m){if(a.identityCD>0)return;a.identityCD=2;const effect=F.passives[a.id]?.effect;
  if(effect==='seed'){for(const ally of A.active())if(A.distance(a,ally)<170&&A.clearLine(a,ally))ally.hp=Math.min(ally.max,ally.hp+ally.max*.025);}
  if(effect==='torrent')a.shield=Math.max(a.shield||0,1.2);
  if(['static','haunt','focus'].includes(effect))a.haste=Math.max(a.haste||0,1.6);
  if(effect==='armor')a.defenseBoost=Math.max(a.defenseBoost||0,3);
  if(effect==='guts')a.frenzyLeech=Math.max(a.frenzyLeech||0,3);
  if(effect==='sync')for(const k of ['q','e'])a[k]=Math.max(0,a[k]-.3);
  if(effect==='adapt'){a.physicalBoost=Math.max(a.physicalBoost||0,3);a.physicalAmp=Math.max(a.physicalAmp||1,1.15);a.haste=Math.max(a.haste||0,1);}
  // Classes modify the same identity without changing the species or its chosen attacks.
  if(a.job==='guardian')a.defenseBoost=Math.max(a.defenseBoost||0,1.5);
  if(a.job==='support'&&!['heal','regen','rest'].includes(m.mode))for(const ally of A.active())if(A.distance(a,ally)<180&&A.clearLine(a,ally))ally.hp=Math.min(ally.max,ally.hp+a.max*.015);
  if(a.job==='assassin'&&['dash','blink','melee'].includes(m.mode))a.inv=Math.max(a.inv||0,.25);
  if(a.job==='mage'&&['beam','shot','fan','field'].includes(m.mode)){a.specialBoost=2;a.specialAmp=Math.max(a.specialAmp||1,1.1);}
 }
 A.playerStep=function(a,mask,dt){initialize(a);a.identityCD=Math.max(0,a.identityCD-dt);old.playerStep(a,mask,dt);};
 function openPaths(pid){const a=A.localMode==='local'?A.players.find(p=>p.pid===pid)||A.me():A.me();if(!a||!A.g)return;A.uiMode='development';A.keys.clear();if(A.localMode!=='online')A.g.paused=true;const offers=pending(a),identity=F.passives[a.id];
  A.panel(`<div class="pathBook"><span class="eyebrow">DESARROLLO · ${esc(RPG_CLASSES[a.job].name)}</span><h2>${esc(RPG_SPECIES[a.id].name)} · Nv. ${a.level}</h2><p>${esc(identity.name)}: ${esc(identity.desc)}</p><p>Elige una técnica para sustituir Q al nivel 10 y E al 20. Al evolucionar puedes redefinirlas para la nueva forma. La decisión dura esta expedición; puedes posponerla.</p>${A.localMode==='local'?'<div class="actions">'+A.players.map(p=>'<button data-path-player="'+p.pid+'">'+esc(p.name)+'</button>').join('')+'</div>':''}${offers.map(o=>`<section><h3>Sustituir ${o.slot===1?'Q':'E'} · ${esc(moves(a)[o.slot].name)}</h3><div class="pathChoices">${o.options.map(slug=>{const m=M[slug];return `<button data-path-key="${o.key}" data-path-slug="${slug}"><img src="assets/tech-icons/${m.kind}.png" alt=""><b>${esc(m.name)}</b><span>${esc(m.desc)}</span><small>Potencia ${m.power||'—'} · ${m.mana} PM · ${m.cool} s</small></button>`;}).join('')}</div></section>`).join('')||'<p>No hay elecciones pendientes. Próximos hitos: nivel 10, nivel 20 y nuevas evoluciones.</p>'}<div class="actions"><button id="closePaths">Continuar explorando</button></div></div>`);
  document.querySelectorAll('[data-path-key]').forEach(b=>b.onclick=()=>{const key=b.dataset.pathKey+'|'+b.dataset.pathSlug;if(A.localMode==='local')server(a,key);else A.requestAction('path',key);A.closeUI();});document.querySelectorAll('[data-path-player]').forEach(b=>b.onclick=()=>openPaths(b.dataset.pathPlayer));$('closePaths').onclick=A.closeUI;
 }
 A.hud=function(){old.hud();if(!A.g||!A.me())return;let b=$('pathPrompt');if(!b){$('skills').insertAdjacentHTML('afterend','<button id="pathPrompt" class="pathPrompt"></button>');b=$('pathPrompt');}if(b){const n=A.localMode==='local'?A.players.reduce((s,a)=>s+pending(a).length,0):pending(A.me()).length;b.textContent=n?'Elegir técnica · '+n:'Desarrollo';b.classList.toggle('pending',n>0);b.onclick=()=>openPaths();}};
 A.v8={speciesMoves:moves,pending,choose,afterMove,openPaths,identity:a=>F.passives[a.id]};
};
