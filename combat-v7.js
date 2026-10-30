'use strict';
window.ECOS_COMBAT7=function(A){
 const old={enemy:A.enemy,enemyStep:A.enemyStep,hurt:A.hurt,fire:A.fire,cleanActor:A.cleanActor,gainXP:A.gainXP};
 const high=()=>Math.max(5,...A.players.filter(a=>!a.disconnected).map(a=>a.level));
 const levelFor=boss=>Math.max(Math.round(5+A.g.floor*.48)+(boss?4:0),high()+(boss?5:0));
 function scale(e){const level=e.boss?levelFor(true):Math.max(e.level,levelFor(false)+(e.id%3)-1);if(e.boss&&level<=e.level&&e.combatV7)return;const ratio=e.max?e.hp/e.max:1;e.level=level;const team=1+Math.max(0,A.players.filter(a=>!a.disconnected).length-1)*.6;e.max=Math.round((e.boss?420+level*37:(RPG_SPECIES[e.id]?.hp||100)*.42+level*6.5)*team);e.hp=e.max*ratio;e.bar=e.hp;e.damage=(e.boss?13:10)+level*(e.boss?.95:.9);e.combatV7=true;}
 A.enemy=function(...args){const e=old.enemy(...args);scale(e);if(e.boss){e.bossState='approach';e.stateTime=1.1;e.phase=1;e.moveIndex=-1;e.stagger=0;e.staggerHits={};e.recover=0;}return e;};
 A.gainXP=function(...args){old.gainXP(...args);for(const e of A.enemies)if(e.boss&&e.hp>0)scale(e);};
 A.fire=function(owner,angle,speed,damage,kind,x,y,options={}){return old.fire(owner,angle,speed,damage,kind,x,y,{...options,skill:options.skill??!!owner.castingSkill});};
 A.hurt=function(e,d,owner,projectile){const skill=projectile?.skill||owner?.castingSkill;
  if(e.boss&&e.hp>0){scale(e);if(e.bossState==='recover'||e.bossState==='stagger')d*=1.4;else if(!skill)d*=.72;
   if(skill&&owner&&e.bossState!=='stagger'&&A.clock-(e.staggerHits?.[owner.pid]??-99)>.65){e.staggerHits??={};e.staggerHits[owner.pid]=A.clock;e.stagger=(e.stagger||0)+1;if(e.stagger>=5){e.stagger=0;e.bossState='stagger';e.stateTime=2.1;e.warning=null;e.rushTime=0;e.combo=0;e.z=0;A.fx('hit',e.x,e.y,2,.4);}}
  }return old.hurt(e,d,owner,projectile);
 };
 const profiles={
  95:[['charge','Placaje'],['zones','Avalancha'],['ring','Terremoto']],121:[['fan','Hidrobomba'],['ring','Rayo Burbuja'],['blink','Psíquico']],26:[['charge','Ataque Rápido'],['zones','Trueno'],['fan','Rayo']],45:[['zones','Somnífero'],['ring','Danza Pétalo'],['fan','Rayo Solar']],110:[['zones','Bomba Lodo'],['ring','Explosión'],['fan','Tóxico']],65:[['blink','Teletransporte'],['fan','Psicorrayo'],['zones','Premonición']],59:[['charge','Envite Ígneo'],['fan','Lanzallamas'],['ring','Onda Ígnea']],112:[['charge','Derribo'],['zones','Avalancha'],['leap','Terremoto']],131:[['fan','Rayo Hielo'],['ring','Surf'],['zones','Ventisca']],68:[['charge','Golpe Cruzado'],['leap','Sumisión'],['fan','Onda Certera']],94:[['blink','Teletransporte'],['zones','Bola Sombra'],['ring','Pulso Umbrío']],149:[['charge','Carga Dragón'],['fan','Pulso Dragón'],['leap','Vuelo']],3:[['zones','Somnífero'],['fan','Rayo Solar'],['ring','Tormenta Floral']],9:[['fan','Hidrobomba'],['ring','Surf'],['charge','Cabezazo']],6:[['charge','Envite Ígneo'],['fan','Lanzallamas'],['leap','Vuelo']],144:[['fan','Rayo Hielo'],['zones','Ventisca'],['charge','Pájaro Osado']],145:[['zones','Trueno'],['charge','Pico Taladro'],['ring','Chispazo']],146:[['fan','Lanzallamas'],['charge','Pájaro Osado'],['zones','Llamarada']],150:[['blink','Teletransporte'],['fan','Onda Mental'],['zones','Premonición'],['ring','Psíquico']]};
 function fan(e,angle,n,speed){for(let i=0;i<n;i++)A.fire(e,angle+(i-(n-1)/2)*.16,speed,e.damage,e.kind,e.x,e.y,{life:3.2});}
 function hazard(e,p,r,delay){if(A.tileAt(p.x,p.y))A.hazards.push({x:p.x,y:p.y,r,age:0,delay,life:delay+.38,kind:e.kind,damage:e.damage*1.35,level:e.level,once:true,hits:[],bossOwner:e.eid});}
 function plan(e,a){const list=profiles[e.id]||profiles[150];e.moveIndex=(e.moveIndex+1)%list.length;let [pattern,name]=list[e.moveIndex];if(A.distance(e,a)>650&&pattern==='ring'){pattern='charge';name='Placaje';}e.pattern=pattern;e.moveName=name;e.targetX=a.x;e.targetY=a.y;e.aimAngle=Math.atan2(a.y-e.y,a.x-e.x);e.bossState='windup';e.stateTime=pattern==='charge'?.85:pattern==='leap'?1.05:.95;e.warning={x:['zones','leap','blink'].includes(pattern)?a.x:e.x,y:['zones','leap','blink'].includes(pattern)?a.y:e.y,r:pattern==='leap'?125:100,line:['charge','fan'].includes(pattern),angle:e.aimAngle};e.moving=false;}
 function execute(e){e.warning=null;e.bossState='recover';e.stateTime=e.phase===3?.85:1.25;e.shotAnim=.45;
  if(e.pattern==='charge'){e.bossState='charge';e.stateTime=.62;e.vx=Math.cos(e.aimAngle)*(450+e.phase*35);e.vy=Math.sin(e.aimAngle)*(450+e.phase*35);}
  else if(e.pattern==='fan'){fan(e,e.aimAngle,3+e.phase*2,300+e.phase*20);e.combo=e.phase>1?1:0;e.comboDelay=.35;}
  else if(e.pattern==='ring'){const n=12+e.phase*2;for(let i=2;i<n-1;i++)A.fire(e,e.aimAngle+i*Math.PI*2/n,220+e.phase*22,e.damage,e.kind,e.x,e.y,{life:3.6});hazard(e,e,85,.55);}
  else if(e.pattern==='zones'){hazard(e,{x:e.targetX,y:e.targetY},85,.9);for(let i=0;i<e.phase+1;i++){const angle=e.aimAngle+i*2.4;hazard(e,{x:e.targetX+Math.cos(angle)*165,y:e.targetY+Math.sin(angle)*165},70,1.15+i*.12);}}
  else if(e.pattern==='leap'){e.bossState='leap';e.stateTime=.65;e.leapStart={x:e.x,y:e.y};}
  else if(e.pattern==='blink'){const x=e.targetX-Math.cos(e.aimAngle)*210,y=e.targetY-Math.sin(e.aimAngle)*210;if(A.tileAt(x,y)){A.fx('psychic',e.x,e.y,2,.4);e.x=x;e.y=y;e.prevX=x;e.prevY=y;A.fx('psychic',x,y,2,.4);}e.bossState='followup';e.stateTime=.7;e.warning={line:true,angle:e.aimAngle,x:e.x,y:e.y,r:75};}
 }
 function bossStep(e,dt){if(e.hp<=0){e.dead=Math.max(0,e.dead-dt);return;}scale(e);const a=A.active().sort((a,b)=>A.distance(a,e)-A.distance(b,e))[0];if(!a)return;e.prevX=e.x;e.prevY=e.y;e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.hurt=Math.max(0,(e.hurt||0)-dt);e.shotAnim=Math.max(0,(e.shotAnim||0)-dt);e.bar+=(e.hp-e.bar)*Math.min(1,dt*8);e.moving=false;
  for(const k of ['sleep','stun','slow','poison','burn'])e[k]=Math.max(0,(e[k]||0)-dt);if(e.poison>0||e.burn>0){e.dotTime=(e.dotTime||0)+dt;if(e.dotTime>=1){e.dotTime=0;A.hurt(e,e.max*.006);if(e.hp<=0)return;}}
  const phase=e.hp/e.max<.3?3:e.hp/e.max<.65?2:1;if(phase>e.phase){e.phase=phase;e.bossState='recover';e.stateTime=.8;e.warning=null;e.combo=0;e.z=0;A.toast(e.name+' · fase '+phase);}
  if(e.combo>0){e.comboDelay-=dt;if(e.comboDelay<=0){e.combo=0;fan(e,e.aimAngle+.18,5,335);}}
  if(!e.bossState){e.bossState='approach';e.stateTime=.8;e.phase=phase;e.moveIndex=-1;}
  if(e.stun>0||e.sleep>0){e.stun=Math.min(e.stun||0,.35);e.sleep=Math.min(e.sleep||0,.55);return;}e.stateTime-=dt;
  if(e.bossState==='windup'){A.face(e,Math.cos(e.aimAngle),Math.sin(e.aimAngle));if(e.stateTime<=0)execute(e);}
  else if(e.bossState==='charge'){A.move(e,e.vx*dt,e.vy*dt);e.moving=true;if(e.stateTime<=0){e.bossState='recover';e.stateTime=1.3;}}
  else if(e.bossState==='leap'){const t=A.clamp(1-e.stateTime/.65,0,1);e.x=e.leapStart.x+(e.targetX-e.leapStart.x)*t;e.y=e.leapStart.y+(e.targetY-e.leapStart.y)*t;e.z=Math.sin(t*Math.PI)*95;if(t>=1){e.z=0;hazard(e,e,125,0);A.fx('smash',e.x,e.y,3,.5);e.bossState='recover';e.stateTime=1.4;}}
  else if(e.bossState==='followup'){if(e.stateTime<=0){e.warning=null;fan(e,e.aimAngle,5+e.phase,320);e.bossState='recover';e.stateTime=1;}}
  else if(['recover','stagger'].includes(e.bossState)){if(e.stateTime<=0){e.bossState='approach';e.stateTime=Math.max(.25,.9-e.phase*.15);}}
  else{const d=A.distance(e,a),angle=Math.atan2(a.y-e.y,a.x-e.x);A.face(e,Math.cos(angle),Math.sin(angle));if(d>180){A.move(e,Math.cos(angle)*(130+e.phase*22)*dt,Math.sin(angle)*(130+e.phase*22)*dt);e.moving=true;}else{A.move(e,Math.cos(angle+Math.PI/2)*85*dt,Math.sin(angle+Math.PI/2)*85*dt);e.moving=true;}if(e.stateTime<=0)plan(e,a);}
  if(!['leap','stagger','recover'].includes(e.bossState))for(const p of A.active())if(A.distance(p,e)<e.r+p.r)A.damage(p,e.damage,e.kind,e.level);
 }
 A.enemyStep=(e,dt)=>e.boss?bossStep(e,dt):old.enemyStep(e,dt);
 A.cleanActor=function(a){const o=old.cleanActor(a);for(const k of ['phase','bossState','moveName','stagger','stateTime','combatV7'])if(a[k]!==undefined)o[k]=a[k];return o;};
 A.combat7={levelFor,scale,profiles,bossStep};
};
