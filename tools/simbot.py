#!/usr/bin/env python3
"""Bot autopiloto para Pokémon Mundo Misterioso: Ecos. Juega una partida solo hasta el piso 80 (o hasta morir) y vuelca métricas por piso.
Uso: simbot.py JOB BASE NATURE HUMAN SEED OUT.json   (HUMAN = fracción de daño recibido que no se esquiva, 1 = sin esquivar)"""
import sys, json, time
from playwright.sync_api import sync_playwright
job,base,nat,human,seed,out=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),float(sys.argv[4]),int(sys.argv[5]),sys.argv[6]
INIT="(()=>{let ui;Object.defineProperty(window,'RPG_UI',{configurable:true,get(){return A=>{window.__A=A;return ui&&ui(A)}},set(v){ui=v}});})();"
JS=r"""
async o=>{
 const A=window.__A;A.meta.unlocked=[...new Set([...(A.meta.unlocked||[]),o.base])];
 let sd=o.seed;window.__rnd=()=>{sd=(sd*1664525+1013904223)%4294967296;return sd/4294967296};
 await A.prepare([{pid:'p1',profile:{base:o.base,job:o.job,name:'Bot',nature:window.ECOS_NATURES[o.nat%25].id}}],'solo');
 const wait=async()=>{let n=0;while(A.g.assetLoading&&n++<600)await new Promise(r=>setTimeout(r,20))};await wait();
 const a=A.me(),I=A.items||window.RPG_ITEMS,DT=1/20,rec=[],T=window.ECOS_TAL12,NODE=T.NODE;
 window.ECOS_MAXLV=40;
 const info={job:o.job,base:o.base,nature:a.nature,human:o.human};
 let dmgTaken=0,ultUses=0,cardTally={},lastHp=a.hp,t0=Date.now();
 const alive=()=>A.enemies.filter(e=>e.hp>0&&!(e.dead>0)&&!e.decoy&&!e.ally&&!e.friendly&&e.owner==null);
 const gearScore=k=>{const v=I[k];let s=0;for(const [f,x] of Object.entries(v))if(typeof x==='number')s+=x*(f==='hp'?.8:1);return s};
 function manage(){
  // cartas
  let guard=0;while(a.cards&&a.cards.offer&&guard++<60){const off=a.cards.offer;let best=0,bs=-1;
   off.forEach((id,i)=>{const [t,k]=id.split(':');let s={plus:90,up:60,tech:40,st:30}[t]??20;
     if(t==='up'&&(k==='b'||k==='u'))s+=10;if(t==='tech'){const n=A.v6.slots(a).slice(6).filter(Boolean).length;if(n>=4)s=15;}s+=window.__rnd()*8;if(s>bs){bs=s;best=i}});
   const id=off[best];cardTally[id.split(':')[0]]=(cardTally[id.split(':')[0]]||0)+1;
   if(!A.v14.cards.pick(a,best))break;}
  if(A.uiMode)A.closeUI?.();
  // talentos: un nodo por escalón, opción al azar
  for(let tier=1;tier<=T.TIERS;tier++){if(a.level<5*tier+5)continue;
   const has=Object.keys(a.tal||{}).some(id=>NODE[id]&&id.startsWith(o.job+'.')&&NODE[id].tier===tier);if(has)continue;
   const opts=Object.values(NODE).filter(n=>n.id.startsWith(o.job+'.')&&n.tier===tier);if(!opts.length)continue;
   A.talent(a,'tt:'+opts[Math.floor(window.__rnd()*opts.length)].id);}
  // equipo: los 3 mejores para la clase
  const cand=Object.keys(a.bag).filter(k=>a.bag[k]>0&&I[k]&&I[k].type==='gear'&&(!I[k].jobs||I[k].jobs.includes(a.job))).sort((x,y)=>gearScore(y)-gearScore(x)).slice(0,3);
  const cur=a.gear.slice();for(const k of cur)if(!cand.includes(k))A.equip(a,k);for(const k of cand)if(!a.gear.includes(k)&&a.gear.length<3)A.equip(a,k);
  if(a.hp<a.max*.45&&a.bag.potion>0&&!(a._pcd>0)){A.useItem(a,'potion');a._pcd=3;}
  if(a.mp<a.maxMp*.2&&a.bag.ether>0)A.useItem(a,'ether');
 }
 const totXp=()=>{let t=a.xp;for(let L=5;L<a.level;L++)t+=window.ECOS_XPNEXT(L+1);return t};
 const prio=[5,4,3,2,1,6,7,8,9,0];
 function tick(target){
  a.inv=Math.max(a.inv||0,0);a.down&&0;
  if(o.human===0)a.hp=1e9;const hp0=a.hp;
  if(target){const d=Math.hypot(a.x-target.x,a.y-target.y);if(d>150||(window.__stuck&&window.__stuck>40)){window.__stuck=0;const r=a.r||15,ok=(x,y)=>A.tileAt(x-r,y-r)&&A.tileAt(x+r,y-r)&&A.tileAt(x-r,y+r)&&A.tileAt(x+r,y+r);
    let placed=false;for(const rad of [60,90,40,120]){for(let k=0;k<8&&!placed;k++){const an=k*Math.PI/4,x=target.x+Math.cos(an)*rad,y=target.y+Math.sin(an)*rad;if(ok(x,y)){a.x=x;a.y=y;placed=true;}}if(placed)break;}
    if(!placed){a.x=target.x;a.y=target.y;}}}
  for(const s of prio){try{if(A.v6.castSlot(a,s)&&s===5)ultUses++;}catch(e){}}
  A.step(DT);a._pcd=Math.max(0,(a._pcd||0)-DT);
  const lost=hp0-a.hp;if(lost>0&&lost<1e6)dmgTaken+=lost;if(o.human===0){a.hp=a.max;a.down=false;}else if(lost>0&&o.human<1&&!a.down)a.hp=Math.min(a.max,a.hp+lost*(1-o.human));
  if(a.mp<a.maxMp*.5)a.mp=Math.min(a.maxMp,a.mp+a.maxMp*.01); // maná asumido: el bot no gestiona regeneración fina
 }
 const ign=new Set();let dead=false,reason='';
 for(let guardF=0;guardF<90&&!dead;guardF++){
  ign.clear();const f=A.g.floor,fl={f,kills0:A.g.kills,t0:A.g.time,hpLost0:dmgTaken,lv0:a.level};
  const boss=A.enemies.some(e=>e.boss);const alphas0=A.enemies.filter(e=>e.alpha).length;const bn=new Set();let steps=0,cap=boss?5400:3200,stall=false;
  while(steps++<cap){
   manage();const list=alive().filter(e=>!ign.has(e));if(!list.length&&A.g.bossDefeated!==false)break;if(!list.length)break;
   let tgt=list[0],bd=1e9;for(const e of list){const d=Math.hypot(a.x-e.x,a.y-e.y);if(d<bd){bd=d;tgt=e;}}
   if(tgt!==window.__lt){window.__lt=tgt;window.__lhp=tgt.hp;window.__ls=0;}else{window.__ls++;if(tgt.hp<window.__lhp-.5){window.__lhp=tgt.hp;window.__ls=0;}}
   if(window.__ls>500&&!tgt.boss){ign.add(tgt);window.__ls=0;continue;}
   window.__stuck=(window.__ls>120)?(window.__stuck||0)+1:0;
   if(boss)for(const e of A.enemies)if(e.boss)bn.add(e.name+(e.phase?' f'+e.phase:''));
   tick(tgt);
   if(a.down||A.g.ended){dead=true;reason=boss?'jefe '+(A.enemies.find(e=>e.boss)?.name||''):'piso normal';break;}
  }
  let left=null;if(steps>=cap){stall=true;left=alive().filter(e=>!ign.has(e)).slice(0,4).map(e=>[e.name,e.id,Math.round(e.hp),e.boss?'B':'',e.alpha?'A':'',e.invuln?'inv':'',e.sleep>0?'sl':'',e.bossState||'',Math.round(Math.hypot(a.x-e.x,a.y-e.y))]);}
  if(dead){rec.push({f,dead:true,reason,lv:a.level});break;}
  // recoger botín y cofres
  manage();for(let k=0;k<2;k++){for(const c of A.g.chests||[])if(!c.opened){a.x=c.x;a.y=c.y+10;A.step(DT);for(let q=0;q<4;q++){A.interact(a,DT,true);A.step(DT);}} }
  for(let q=0;q<3;q++)for(const it of A.loot)if(!it.taken){a.x=it.x;a.y=it.y;A.step(DT);A.interact(a,DT,true);A.step(DT);}
  for(let k=0;k<5;k++){manage();A.step(DT);} 
  const sk=Object.values(a.skl||{}),slots=A.v6.slots(a);
  rec.push({f,boss,stall,left,alphas:alphas0,bossNames:[...bn],xpTot:Math.round(totXp()),ignored:[...ign].filter(e=>e.hp>0).length,lv:a.level,xp:Math.round(a.xp),xpNext:a.xpNext,hpMax:Math.round(a.max),dmg:+a.damage.toFixed(1),armor:+(a.armor||0).toFixed(2),
   kills:A.g.kills-fl.kills0,secs:+(A.g.time-fl.t0).toFixed(1),taken:Math.round(dmgTaken-fl.hpLost0),gear:a.gear.slice(),lvUp:a.level-fl.lv0,
   skillLv:sk.reduce((s,x)=>s+(x.lv||0),0),plus:sk.filter(x=>x.plus).length,tal:Object.keys(a.tal||{}).length,ult:ultUses,gold:a.gold??A.g.gold,
   techs:slots.slice(6).filter(Boolean).length,id:a.id,hpEnd:Math.round(a.hp)});
  if(f>=80&&A.g.bossDefeated)break;
  if(f>=80)break;
  const before=A.g.floor;A.nextFloor();await wait();if(A.g.floor===before){A.g.floor=before+1;A.nextFloor();await wait();}
  a.hp=Math.max(a.hp,a.max*.6); // descanso entre pisos (escaleras/curaciones asumidas)
 }
 return {info,rec,dead,reason,cards:cardTally,ultUses,secsReal:Math.round((Date.now()-t0)/1000)};
}
"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']);pg=b.new_page(viewport={'width':480,'height':300})
    pg.on('pageerror',lambda e:print('ERR',str(e)[:160],file=sys.stderr))
    pg.add_init_script(INIT)
    pg.goto('http://localhost:8123/dungeon.html');pg.wait_for_timeout(2000)
    r=pg.evaluate(JS,{'job':job,'base':base,'nat':nat,'human':human,'seed':seed})
    json.dump(r,open(out,'w'));
    last=r['rec'][-1] if r['rec'] else {}
    print(job,base,'piso',last.get('f'),'lv',last.get('lv'),'muerte' if r['dead'] else 'ok',r['reason'],r['secsReal'],'s')
    b.close()
