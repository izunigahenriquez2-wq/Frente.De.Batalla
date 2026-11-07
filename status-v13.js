// V13 · Barra de escudo sobre la vida e iconos de efectos con tiempo restante sobre la barra de habilidades.
window.ECOS_STATUS13=function(A){
 const $=id=>document.getElementById(id);
 const EFF=[
  ['shield','Escudo','🛡️',1,'Recibes mucho menos daño mientras dure.'],
  ['haste','Agilidad','💨',1,'Te mueves y actúas más rápido.'],
  ['buff','Frenesí','✨',1,'+35 % de daño y habilidades que se recargan mucho más rápido.'],
  ['physicalBoost','Ataque ↑','⚔️',1,'Tus ataques físicos hacen más daño.'],
  ['specialBoost','At. Esp. ↑','🔮',1,'Tus ataques especiales hacen más daño.'],
  ['defenseBoost','Defensa ↑','🧱',1,'Recibes menos daño.'],
  ['frenzyLeech','Robo de vida','🩸',1,'Recuperas PS al golpear.'],
  ['morph','Transformado','🎭',1,'Has tomado la forma de otro Pokémon.'],
  ['burrow','Sigilo','🌑',1,'Los enemigos no te ven.'],
  ['quiet','Sigilo','🌑',1,'Los enemigos no te ven.'],
  ['poison','Veneno','☠️',0,'Pierdes PS cada segundo.'],
  ['burn','Quemadura','🔥',0,'Pierdes PS cada segundo.'],
  ['sleep','Dormido','💤',0,'No puedes actuar.'],
  ['slow','Ralentizado','🐌',0,'Te mueves más despacio.'],
  ['stun','Aturdido','💫',0,'No puedes actuar.']];
 const css=document.createElement('style');css.textContent=`
 #fxStrip13{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);display:flex;gap:5px;flex-wrap:wrap;justify-content:center;max-width:min(560px,calc(100% - 24px));z-index:6;pointer-events:none}
 #fxStrip13 .ef{display:flex;align-items:center;gap:4px;padding:2px 8px 2px 5px;border-radius:14px;font:800 12px Nunito,system-ui,sans-serif;background:#0d1b26e6;border:1px solid #6fe0a0;color:#d9ffe8;box-shadow:0 2px 6px #0008}
 #fxStrip13 .ef.bad{border-color:#ff7a7a;color:#ffe0e0}
 #fxStrip13 .ef b{font-size:15px;line-height:1}#fxStrip13 .ef em{font-style:normal;opacity:.9;min-width:2.4em;text-align:right}
 .heroHud .bar{position:relative}.heroHud .bar .shieldBar13{position:absolute;left:0;top:0;height:46%;background:linear-gradient(#bfe9ff,#5fb4ff);box-shadow:0 0 6px #7fd0ff;border-radius:3px 3px 0 0;opacity:.95;transition:width .15s}
 button.unfit[data-v4equip]{opacity:.55;border-style:dashed}
 #shieldTag13{font:800 11px Nunito,sans-serif;color:#9fdcff;margin-left:6px}`;document.head.appendChild(css);
 const old={cleanActor:A.cleanActor,hud:A.hud};
 A.cleanActor=function(a){const o=old.cleanActor.call(this,a);for(const k of ['shield','buff','morph','burrow','quiet','stun','shieldMax'])if(a[k]!==undefined)o[k]=a[k];return o;};
 let nextT=0;
 A.hud=function(){old.hud.call(this);if(!A.g||!A.me())return;const a=A.me(),now=performance.now();if(now<nextT)return;nextT=now+90;
  // escudo
  if(a.shield>0)a.shieldMax=Math.max(a.shieldMax||0,a.shield);else a.shieldMax=0;
  const bar=$('life')?.parentElement;if(bar){let s=bar.querySelector('.shieldBar13');if(!s){s=document.createElement('i');s.className='shieldBar13';bar.appendChild(s);}
   s.style.width=a.shield>0?Math.max(4,Math.min(100,a.shield/(a.shieldMax||a.shield)*100))+'%':'0%';
   const hp=$('hp');if(hp){let t=$('shieldTag13');if(a.shield>0){if(!t){t=document.createElement('span');t.id='shieldTag13';hp.appendChild(t);}t.textContent='🛡 '+a.shield.toFixed(1)+'s';}else t?.remove();}}
  // efectos
  let st=$('fxStrip13');if(!st){const sk=$('skills');if(!sk)return;st=document.createElement('div');st.id='fxStrip13';sk.parentElement.insertBefore(st,sk);}
  const seen=new Set();let html='';
  for(const [k,name,ic,good,desc] of EFF){const v=a[k];if(!(v>0)||seen.has(name))continue;seen.add(name);html+=`<span class="ef${good?'':' bad'}" title="${name}: ${desc}"><b>${ic}</b>${name}<em>${v>=10?Math.round(v):v.toFixed(1)}s</em></span>`;}
  if(a.down)html='';
  if(st.__h!==html){st.__h=html;st.innerHTML=html;}};
 A.status13={EFF};
};
