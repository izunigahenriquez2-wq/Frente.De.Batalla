// V14 · Cartas al subir de nivel. Cada nivel da una carta: eliges 1 de 3 (reroll y veto limitados).
// Mejoran las técnicas (Nv. 1→5, luego evolución «+»), añaden técnicas nuevas (sustituyen a las MT de cofre) o dan pasivas.
window.ECOS_CARDS14=function(A){
 'use strict';
 const M=ECOS_TECH.moves,S=RPG_SPECIES,P=A.pat,dist=A.distance,esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),$=id=>document.getElementById(id);
 const SLOTK=['b','q','e',null,'c','u',null,null,null,null],MAXLV=4; // lv guardado 0..4 = Nv. 1..5
 const old={gainXP:A.gainXP,makePlayer:A.makePlayer,cleanActor:A.cleanActor,hurt:A.hurt,attack:A.attack,step:A.step,stats:A.stats,hud:A.hud,nextFloor:A.nextFloor,castV4:A.v4.cast,requestAction:A.requestAction,netAction:A.NET.callbacks.action,playerStep:A.playerStep};
 const lv=(a,k)=>a.skl?.[k]?.lv||0,pl=(a,k)=>!!a.skl?.[k]?.plus;
 const slotOf=(a,key)=>{const L=A.v6.slots(a);for(let i=0;i<L.length;i++){if(!L[i])continue;const k=i>=6?L[i].slug:SLOTK[i];if(k===key)return L[i];}return null;};
 function keyOfMove(a,token){const L=A.v6.slots(a);for(let i=0;i<L.length;i++){const m=L[i];if(!m||SLOTK[i]===null&&i<6)continue;if((m.slug||m.name)===token||m.name===token)return i>=6?m.slug:SLOTK[i];}return null;}
 // ---------- Pasivas ----------
 const STAT=[
  {id:'garra',n:'Garra afilada',d:'+6 % de daño',e:{dmg:.06},max:5,ic:'⚔'},{id:'piel',n:'Piel dura',d:'+8 % de vida máxima',e:{hp:.08},max:5,ic:'♥'},
  {id:'pies',n:'Pies ligeros',d:'+5 % de velocidad',e:{speed:.05},max:4,ic:'»'},{id:'ojo',n:'Ojo certero',d:'+3 % de crítico',e:{crit:.03},max:5,ic:'◎'},
  {id:'conc',n:'Concentración',d:'−4 % de recarga',e:{cdr:.04},max:5,ic:'⏱'},{id:'escudo',n:'Escudo natural',d:'+3 % de armadura',e:{armor:.03},max:5,ic:'▣'},
  {id:'reserva',n:'Reserva de energía',d:'+12 % de PM y +0,3 PM/s',e:{mp:.12,mpRegen:.3},max:4,ic:'✦'},{id:'savia',n:'Savia vital',d:'Regeneras +0,35 PS/s',e:{regen:.35},max:4,ic:'✚'},
  {id:'colmillo',n:'Colmillo vampírico',d:'+2,5 % de robo de vida',e:{leech:.025},max:4,ic:'☾'},{id:'furia',n:'Furia latente',d:'+12 % de carga de definitiva',e:{ult:.12},max:5,ic:'✹'},
  {id:'mente',n:'Mente aguda',d:'+8 % de poder de habilidades',e:{skill:.08},max:5,ic:'✺'},{id:'aprendiz',n:'Aprendiz',d:'+8 % de experiencia',e:{xp:.08},max:4,ic:'★'}];
 const STATBY=Object.fromEntries(STAT.map(s=>[s.id,s]));
 const LOOT={heal:{n:'Descanso breve',d:'Recuperas el 60 % de PS y PM ahora.',ic:'☕'},spark:{n:'Chispa',d:'Tu definitiva se carga un 50 %.',ic:'⚡'}};
 // ---------- Descripciones ----------
 const STEP=n=>n===2?'+12 % de daño · −4 % de recarga':n===3?'+12 % de daño · −4 % de recarga · ECO: se repite al 60 % tras 0,4 s':n===4?'+12 % de daño · −4 % de recarga':'+12 % de daño · −4 % de recarga · ya puede evolucionar («+»)';
 const CATS={proj:['shot','fan','wave','cone',undefined],melee:['melee','cleave','dash'],beam:['beam'],field:['leech','firezone'],status:['sleep','stun','slow','poison'],aid:['heal','shield','buff','haste','regen','cleanse','blink','mimic','metronome','rest','mewmorph']};
 const catOf=m=>{const md=m?.mode;for(const k in CATS)if(CATS[k].includes(md))return k;return 'other';};
 const PLUS={proj:'Evolución +: 4 proyectiles extra en abanico, más grandes, y +25 % de daño.',melee:'Evolución +: cada uso genera ondas de choque (2 anillos) y +25 % de daño.',beam:'Evolución +: dos rayos laterales adicionales y +25 % de daño.',
  field:'Evolución +: añade un vórtice que atrae y daña, y +25 % de daño.',status:'Evolución +: alcance ampliado a 380 y efecto sobre más enemigos, y +25 % de daño.',aid:'Evolución +: +25 % de curación o duración; también ayuda a aliados cercanos.',other:'Evolución +: −20 % adicional de coste de PM y efecto visual ampliado; conserva su comportamiento.'};
 const plusText=(a,key,m)=>key==='b'?'Cada cuarto ataque activa: '+PLUS[catOf(m)]:key==='c'||key==='u'?(A.v14.TXT[m.tpl]?.[1]?'Evolución +: '+A.v14.TXT[m.tpl][1].replace(/^\+ /,'')+' y +25 % de daño.':PLUS.other):PLUS[catOf(m)];
 const ECHO=new Set([...CATS.proj,...CATS.melee.slice(0,2),'beam','leech','firezone']);
 // ---------- Estado ----------
 function init(a){a.cards??={n:0,offer:null,rr:3,vt:2,ban:[],t:0};a.cs??={};a.skl??={};}
 const effects=a=>{const t={};for(const [id,n] of Object.entries(a.cs||{})){const s=STATBY[id];if(s)for(const k in s.e)t[k]=(t[k]||0)+s.e[k]*n;}return t;};
 // ---------- Generación de ofertas ----------
 const rare=c=>c.t==='plus'?'epic':c.t==='up'||c.t==='tech'?'rare':'common';
 function pool(a){
  init(a);const out=[],ban=new Set(a.cards.ban);
  const keys=['b','q','e','c','u',...(a.learned||[]).filter(s=>a.loadout?.includes(s))];
  const unlocked=k=>k==='e'?a.level>=8:k==='c'?a.level>=12:k==='u'?a.level>=16:true;
  for(const k of keys){const m=slotOf(a,k);if(!m)continue;if(!unlocked(k)&&a.level<(k==='e'?5:k==='c'?9:13))continue;
   if(lv(a,k)<MAXLV)out.push({id:'up:'+k,t:'up',k,w:5});else if(!pl(a,k))out.push({id:'plus:'+k,t:'plus',k,w:14});}
  if((a.learned||[]).length<4){const comp=ECOS_TECH.compat[a.id]||[];const have=new Set(a.learned||[]);
   const cand=comp.filter(s=>M[s]&&!have.has(s)&&(M[s].floor??1)<=(A.g?.floor||1)+8);
   const ok=cand.filter(s=>!['cut','rock-smash'].includes(s)).sort((x,y)=>(M[y].power||30)-(M[x].power||30)).slice(0,10);for(const s of ok)out.push({id:'tech:'+s,t:'tech',k:s,w:2.6});}
  for(const s of STAT)if((a.cs[s.id]||0)<s.max)out.push({id:'st:'+s.id,t:'stat',k:s.id,w:3});
  out.push({id:'lo:heal',t:'loot',k:'heal',w:1.2},{id:'lo:spark',t:'loot',k:'spark',w:1.2});
  return out.filter(c=>!ban.has(c.id)&&!ban.has('skill:'+c.k));
 }
 function draw(a,keep=[]){
  const p=pool(a).filter(c=>!keep.includes(c.id)),pick=[];const take=c=>{pick.push(c);const i=p.indexOf(c);if(i>=0)p.splice(i,1);};
  const plus=p.filter(c=>c.t==='plus');if(plus.length)take(plus[Math.floor(Math.random()*plus.length)]);
  const needSkill=!pick.length&&p.some(c=>c.t==='up'||c.t==='tech');if(needSkill){const s=p.filter(c=>c.t==='up'||c.t==='tech');const tot=s.reduce((x,c)=>x+c.w,0);let r=Math.random()*tot;for(const c of s){r-=c.w;if(r<=0){take(c);break;}}}
  while(pick.length+keep.length<3&&p.length){const tot=p.reduce((x,c)=>x+c.w,0);let r=Math.random()*tot,ch=p[p.length-1];for(const c of p){r-=c.w;if(r<=0){ch=c;break;}}take(ch);}
  const ids=pick.map(c=>c.id);return ids;
 }
 // ---------- Host: aplicar ----------
 function openOffer(a){init(a);if(a.cards.n<=0||a.cards.offer||a.down)return;a.cards.offer=draw(a);a.cards.rev=(a.cards.rev||0)+1;a.cards.t=25;}
 function give(a,id){
  const [t,k]=id.split(':');init(a);
  if(t==='up'){const s=(a.skl[k]??={lv:0,plus:false});s.lv=Math.min(MAXLV,s.lv+1);const m=slotOf(a,k);A.toast?.((m?.name||k)+' → Nv. '+(s.lv+1));A.fx('star',a.x,a.y,2,.6);}
  else if(t==='plus'){const s=(a.skl[k]??={lv:MAXLV,plus:false});s.plus=true;const m=slotOf(a,k);A.toast?.('¡'+(m?.name||k).replace(/ \+$/,'')+' evolucionó! (+)');A.fx('s_ring_white',a.x,a.y,3.4,.8);P.burst('star',a.x,a.y,3,.8);A.v14.plusBurst?.(a,{...(m||{}),name:((m&&m.name)||'')+' +'},3);}
  else if(t==='tech'){(a.learned??=[]).push(k);const i=(a.loadout||[]).findIndex(x=>!x);if(i>=0)a.loadout[i]=k;A.toast?.('Técnica nueva: '+M[k].name);A.fx('star',a.x,a.y,2,.6);}
  else if(t==='st'){a.cs[k]=(a.cs[k]||0)+1;A.toast?.(STATBY[k].n+' ×'+a.cs[k]);}
  else if(t==='lo'){if(k==='heal'){a.hp=Math.min(a.max,a.hp+a.max*.6);a.mp=Math.min(a.maxMp,a.mp+a.maxMp*.6);A.fx('synthesis',a.x,a.y,2,.6);}else A.v14.addUlt(a,50);}
  A.stats(a);
 }
 function pick(a,i){init(a);const id=a.cards.offer?.[i];if(!id||a.disconnected)return false;give(a,id);a.cards.offer=null;a.cards.n=Math.max(0,a.cards.n-1);openOffer(a);return true;}
 function reroll(a){init(a);if(!a.cards.offer||a.cards.rr<=0)return false;a.cards.rr--;a.cards.offer=draw(a);a.cards.rev=(a.cards.rev||0)+1;a.cards.t=25;return true;}
 function veto(a,i){init(a);const id=a.cards.offer?.[i];if(!id||a.cards.vt<=0)return false;a.cards.vt--;const [kind,key]=id.split(':');a.cards.ban.push(['up','plus','tech'].includes(kind)?'skill:'+key:id);const keep=a.cards.offer.filter((_,j)=>j!==i),n=draw(a,keep);a.cards.offer=[...keep,...n].slice(0,3);a.cards.rev=(a.cards.rev||0)+1;a.cards.t=25;return true;}
 const H={card(a,arg){if(!a)return false;const [op,i,rev]=String(arg).split('|');if(Number(rev)!==(a.cards?.rev||0))return false;if(op==='pick')return pick(a,+i);if(op==='reroll')return reroll(a);if(op==='veto')return veto(a,+i);return false;}};
 A.requestAction=function(type,key){if(type==='card'){const [pid,...r]=String(key).split('|');if(A.NET.role==='client')A.NET.action(type,key);else H.card(A.players.find(p=>p.pid===pid)||A.me(),r.join('|'));return;}return old.requestAction.call(this,type,key);};
 A.NET.callbacks.action=(pid,type,key)=>{if(type==='card'){const [p,...r]=String(key).split('|');return H.card(A.players.find(a=>a.pid===pid),r.join('|'));}return old.netAction?.(pid,type,key);};
 // ---------- Subida de nivel ----------
 A.gainXP=function(a,n){init(a);const before=a.level;old.gainXP.call(this,a,n);if(a.level>before){a.cards.n+=a.level-before;for(let l=before+1;l<=a.level;l++){if([12,24,36].includes(l))a.cards.rr++;if([18,30].includes(l))a.cards.vt++;}if(a.cards.n>0&&!a.cards.offer)openOffer(a);}};
 A.makePlayer=function(...args){const a=old.makePlayer(...args);init(a);return a;};
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['cards','cs'])if(a[k]!==undefined)o[k]=a[k];return o;};
 // ---------- Estadísticas de pasivas ----------
 A.stats=function(a){if(a.gear&&a.gear.length>(window.ECOS_GEAR_MAX||3))a.gear.length=window.ECOS_GEAR_MAX||3;const ratio=a.max?a.hp/a.max:1;old.stats.call(this,a);const f=effects(a);if(!Object.keys(f).length)return;
  if(f.dmg)a.damage*=1+f.dmg;if(f.skill)a.skillPower=(a.skillPower||1)+f.skill;if(f.speed)a.speed=Math.min(295,a.speed*(1+f.speed));
  if(f.hp){a.max=Math.round(a.max*(1+f.hp));a.hp=Math.min(a.max,Math.max(1,a.max*ratio));}if(f.crit)a.crit=Math.min(.65,(a.crit||0)+f.crit);if(f.cdr)a.cdr=Math.min(.45,(a.cdr||0)+f.cdr);
  if(f.armor)a.armor=Math.min(.45,(a.armor||0)+f.armor);if(f.mp){a.maxMp=Math.round(a.maxMp*(1+f.mp));}if(f.mpRegen)a.mpRegen=(a.mpRegen||0)+f.mpRegen;if(f.regen)a.regenRate=(a.regenRate||0)+f.regen;
  if(f.leech)a.leech=(a.leech||0)+f.leech;if(f.xp)a.xpBonus=(a.xpBonus||1)+f.xp;if(f.ult)a.ultGain=(a.ultGain||1)+f.ult;};
 // ---------- Efecto de los niveles en combate ----------
 const mulOf=(a,k)=>k?(1+.12*lv(a,k))*(pl(a,k)?1.25:1):1;
 A.hurt=function(e,d,who,p){const o=A.players.includes(who)?who:null;if(o&&!p?.pattern&&!p?.thorns){const paid=!!(p?.skill||o.castingSkill),tok=p?.moveSlug||o.castingMove;const k=paid?(tok?keyOfMove(o,tok):null):'b';d*=(k==='c'||k==='u')?1:mulOf(o,k);}return old.hurt.call(this,e,d,who,p);};
 A.v14.tune=function(a,list){return list.map((m,i)=>{if(!m||i===3||m.cool==null)return m;const k=i>=6?m.slug:SLOTK[i];if(!k)return m;const L=lv(a,k);if(!L&&!pl(a,k))return m;const name=pl(a,k)&&!/ \+$/.test(m.name)?m.name+' +':m.name;return{...m,name,mana:catOf(m)==='other'&&m.mode!=='kit'?Math.ceil((m.mana||0)*(1-.04*L)*(pl(a,k)?.8:1)):m.mana,cool:i===0?m.cool:Math.max(.6,m.cool*(1-.04*L)),plusLv:L,plus:pl(a,k)};});};
 A.v14.afterUtility=function(a,m,before){
  const key=keyOfMove(a,m.slug||m.name),L=key?lv(a,key):0,plus=key&&pl(a,key);
  if(catOf(m)==='aid'&&before){const factor=(1+.08*L)*(plus?1.25:1);
   for(const s of before){const b=s.actor;if(b.down)continue;const heal=Math.max(0,b.hp-s.hp);if(heal)b.hp=Math.min(b.max,b.hp+heal*(factor-1));
    for(const k of ['shield','haste','buff','aquaRing','physicalBoost','specialBoost','defenseBoost'])if((b[k]||0)>(s[k]||0))b[k]*=factor;
   }if(plus)plusExtra(a,m,key);
  }A.v14.supportAfter?.(a,before,m.ult);
 };
 const later=[];const sched=(t,fn)=>later.push({t,fn});
 function plusExtra(a,m,key){
  const t=A.nearTarget?.(a),ang=t?Math.atan2(t.y-a.y,t.x-a.x):a.aim??0,c=catOf(m),k=m.kind||'hit',pw=x=>P.power(a,x);
  A.fx('s_ring_white',a.x,a.y,2.6,.5);
  if(c==='proj'){for(const off of [-.44,-.22,.22,.44])A.fire(a,ang+off,440,pw(.6),k,a.x,a.y,{size:1.4});}
  else if(c==='melee'){P.quake(a,{rings:2,r0:95,dr:75,dmg:pw(.7),stun:.4,kind:k});}
  else if(c==='beam'){for(const off of [-.16,.16]){const an=ang+off,ex=a.x+Math.cos(an)*720,ey=a.y+Math.sin(an)*720;A.effects.push({line:true,kind:k,x:a.x,y:a.y,ex,ey,life:.45,total:.45,size:1.4});A.v14.lineHit(a,a.x,a.y,ex,ey,48,pw(.8),k);}}
  else if(c==='field'){P.vortex(a,{at:t||{x:a.x+Math.cos(ang)*140,y:a.y+Math.sin(ang)*140},r:190,life:3,pull:150,dmg:pw(.3),kind:k});}
  else if(c==='status'){const dur={stun:1.2,sleep:2,slow:4,poison:6}[m.mode]||2;for(const e of A.enemies)if(e.hp>0&&dist(a,e)<380&&A.clearLine(a,e)){if(e.boss&&m.mode==='sleep')continue;e[m.mode]=Math.max(e[m.mode]||0,e.boss?(m.mode==='stun'?Math.min(.35,dur):dur*.5):dur);A.fx('discharge',e.x,e.y,1.1,.4);}}
  else if(c==='aid'){for(const b of A.active())if(b!==a&&dist(a,b)<340){if(m.mode==='heal'||m.mode==='cleanse')b.hp=Math.min(b.max,b.hp+b.max*.15);else if(m.mode==='haste')b.haste=Math.max(b.haste||0,4);else if(m.mode==='buff')b.buff=Math.max(b.buff||0,5);else b.shield=Math.max(b.shield||0,3);A.fx('synthesis',b.x,b.y,1.4,.5);}}
  else A.fx(m.kind||'star',a.x,a.y,3,.6);
 }
 function onCast(a,m,key){if(!key||a._echo)return;const L=lv(a,key),p=pl(a,key);
  if(p&&catOf(m)!=='aid')plusExtra(a,m,key);
  if(L>=2&&ECHO.has(m.mode)){sched(.4,()=>{if(a.down||a.disconnected||!A.g)return;a._echo=true;a.castingSkill=key!=='b';a.castingMove=m.slug||m.name;try{old.castV4.call(A.v4,a,{...m,power:Math.max(20,(m.power||40)*.6),mana:m.mana>0?m.mana:0});}finally{a._echo=false;a.castingSkill=false;a.castingMove=null;}});}
 }
 A.v4.cast=function(a,m){old.castV4.call(this,a,m);try{if(A.players.includes(a))onCast(a,m,keyOfMove(a,m.slug||m.name));}catch(e){console.error(e);}};
 A.attack=function(a){const c0=a.cool;old.attack.call(this,a);if(c0<=0&&a.cool>0&&!a.down&&A.NET.role!=='client'){const L=lv(a,'b'),p=pl(a,'b'),m=slotOf(a,'b');if(!m)return;a.cool*=1-.04*L;a.bc=(a.bc||0)+1;
   if(L>=2&&ECHO.has(m.mode))sched(a.cool*.93+.12,()=>{if(a.down||!A.g)return;a._echo=true;try{old.castV4.call(A.v4,a,{...m,power:Math.max(20,(m.power||40)*.6),mana:0});}finally{a._echo=false;}});
   if(p&&a.bc%4===0)sched(a.cool*.93,()=>{if(a.down||!A.g)return;plusExtra(a,m,'b');});}};
 A.step=function(dt){old.step.call(this,dt);
  if(!A.g||A.state!=='play'||A.g.paused||A.NET.role==='client'||A.g.ended)return;
  for(let i=later.length-1;i>=0;i--){later[i].t-=dt;if(later[i].t<=0){const j=later.splice(i,1)[0];try{j.fn();}catch(e){console.error(e);}}}
  for(const a of A.players){if(!a.cards?.offer)continue;if(A.localMode==='online'&&!(a.combat>0)){a.cards.t-=dt;if(a.cards.t<=0)pick(a,Math.floor(Math.random()*a.cards.offer.length));}}
 };
 A.nextFloor=function(...r){later.length=0;return old.nextFloor.apply(this,r);};
 // ---------- Pantalla ----------
 function describe(a,id){
  const [t,k]=id.split(':');
  if(t==='up'){const m=slotOf(a,k),L=lv(a,k),slot={b:'Ataque básico',q:'Q',e:'E',c:'C',u:'Definitiva'}[k]||'Técnica';return{tag:'Mejora · '+slot,title:m?.name||k,sub:'Nv. '+(L+1)+' → Nv. '+(L+2),text:(a.level<({e:8,c:12,u:16}[k]||0)?'Mejora una habilidad que desbloquearás al nivel '+({e:8,c:12,u:16}[k])+'. ':'')+(k==='c'||k==='u'?'Mejora su patrón propio y reduce la recarga un 4 % por nivel.':catOf(m)==='aid'?'−4 % de recarga; +8 % de curación o duración por nivel.':catOf(m)==='other'?'−4 % de coste de PM y recarga por nivel.':STEP(L+2)),icon:m};}
  if(t==='plus'){const m=slotOf(a,k);return{tag:'Evolución',title:(m?.name||k).replace(/ \+$/,'')+' +',sub:'Nv. 5 · versión «+»',text:plusText(a,k,m),icon:m&&{...m,name:m.name.replace(/ \+$/,'')+' +'}};}
  if(t==='tech'){const m=M[k];return{tag:'Técnica nueva',title:m.name,sub:(m.mana||0)+' PM · '+m.cool+' s'+(m.power?' · Potencia '+m.power:''),text:m.desc||'Una técnica que se suma a tu repertorio (espacios 5–8).',icon:{...m,slug:k}};}
  if(t==='st'){const s=STATBY[k],n=a.cs[k]||0;return{tag:'Pasiva',title:s.n,sub:n?'Tienes ×'+n:'Nueva',text:s.d,glyph:s.ic};}
  const s=LOOT[k];return{tag:'Botín',title:s.n,sub:'Un solo uso',text:s.d,glyph:s.ic};
 }
 function pips(a){if(!a)return;const L=A.v6.slots(a);for(let i=0;i<L.length;i++){const b=$('rpgSlot'+i);if(!b)continue;const k=i>=6?L[i]?.slug:SLOTK[i];let el=b.querySelector('.lvPips');if(!k||!L[i]){if(el)el.remove();continue;}if(!el){el=document.createElement('span');el.className='lvPips';b.appendChild(el);}const n=lv(a,k),p=pl(a,k),t=p?'+':'●'.repeat(n+1)+'○'.repeat(MAXLV-n);if(el.textContent!==t)el.textContent=t;b.classList.toggle('plusSlot',p);}}
 let sig='';
 function open(a){
  const c=a.cards,offer=c.offer;A.uiMode='cards';A.keys.clear();if(A.localMode!=='online')A.g.paused=true;sig=a.pid+offer.join()+c.rr+c.vt;
  const cards=offer.map((id,i)=>{const d=describe(a,id),r=rare({t:id.split(':')[0]==='st'?'stat':id.split(':')[0]==='lo'?'loot':id.split(':')[0]});
   return `<div class="cardBox ${r}"><button class="cardPick" data-cp="${i}"><span class="cardTag">${esc(d.tag)}</span><span class="cardArt">${d.icon?`<img src="${A.v6.icon(d.icon)}" alt="">`:`<b>${esc(d.glyph||'?')}</b>`}</span><strong>${esc(d.title)}</strong><em>${esc(d.sub)}</em><p>${esc(d.text)}</p><kbd>${i+1}</kbd></button><button class="cardVeto" data-cv="${i}" ${c.vt<=0?'disabled':''} title="Veta futuras cartas de esta técnica, incluida su versión +. Conservas lo aprendido.">✕ Vetar (${c.vt})</button></div>`;}).join('');
  A.panel(`<div class="cardsPanel"><span class="eyebrow">${esc(a.name)} · NIVEL ${a.level}</span><h2>Elige una carta</h2><p class="cardsSub">${c.n>1?'Te quedan '+(c.n-1)+' carta(s) más por elegir.':'Una carta por cada nivel.'}${A.localMode==='online'?' · Tiempo: '+Math.max(0,Math.ceil(c.t))+' s':''}</p><div class="cardRow">${cards}</div><div class="actions"><button id="cardRoll" ${c.rr<=0?'disabled':''}>↻ Otras tres (${c.rr})</button></div></div>`);
  const send=op=>A.requestAction('card',a.pid+'|'+op+'|'+(c.rev||0));
  document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{send('pick|'+b.dataset.cp);if(A.NET.role!=='client')afterLocal();});
  document.querySelectorAll('[data-cv]').forEach(b=>b.onclick=()=>{send('veto|'+b.dataset.cv);if(A.NET.role!=='client')afterLocal();});
  const r=$('cardRoll');if(r)r.onclick=()=>{send('reroll|');if(A.NET.role!=='client')afterLocal();};
 }
 function afterLocal(){sig='';}
 document.addEventListener('keydown',e=>{if(A.uiMode!=='cards')return;const i={Digit1:0,Digit2:1,Digit3:2}[e.code];if(i===undefined)return;const a=target();if(a?.cards?.offer?.[i]){A.requestAction('card',a.pid+'|pick|'+i+'|'+(a.cards.rev||0));sig='';e.preventDefault();e.stopPropagation();}},true);
 const target=()=>A.localMode==='local'?(A.players.find(p=>p.cards?.offer)||null):A.me();
 A.hud=function(){old.hud.call(this);
  if(!A.g||A.state!=='play')return;const a=target();
  try{pips(a||A.me());}catch(e){}
  if(a?.cards?.offer&&A.localMode==='online'&&a.combat>0){if(A.uiMode==='cards'){A.closeUI();sig='';}return;}
  if(a?.cards?.offer){const s=a.pid+a.cards.offer.join()+a.cards.rr+a.cards.vt;if(!A.uiMode||(A.uiMode==='cards'&&s!==sig))open(a);
   else if(A.uiMode==='cards'&&A.localMode==='online'){const p=document.querySelector('.cardsSub');if(p)p.textContent=p.textContent.replace(/Tiempo: \d+ s/,'Tiempo: '+Math.max(0,Math.ceil(a.cards.t))+' s');}}
  else if(A.uiMode==='cards'){A.closeUI();sig='';}
 };
 A.v14.cards={pool,draw,give,pick,reroll,veto,describe,STAT,openOffer,lv,pl,slotOf,keyOfMove,catOf};
};

