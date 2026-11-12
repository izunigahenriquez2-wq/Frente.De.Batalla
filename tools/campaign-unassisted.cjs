// Uses real movement/casts/owned consumables. No teleport, forced floors, HP/MP grants or damage edits.
const {setup}=require('../tests/harness-current.cjs');
const base=+(process.argv[2]||25),job=process.argv[3]||'mage',seed=+(process.argv[4]||1),limit=+(process.argv[5]||18000);
(async()=>{const {A,c}=setup(seed);A.begin([{pid:'p1',profile:{base,job,name:'Bot',nature:'seria'}}],'solo');await Promise.all(A.ready);for(let i=0;i<25;i++)await Promise.resolve();
 let mask=0;A.inputFor=()=>mask;const a=A.me(),records=[];let floor=0,lastPos='',stuck=0;
 function route(target){const g=A.g,w=g.mw,h=g.mh,start=Math.floor(a.y/48)*w+Math.floor(a.x/48),end=Math.floor(target.y/48)*w+Math.floor(target.x/48),prev=new Int32Array(w*h).fill(-1),q=[start];prev[start]=start;
 for(let i=0;i<q.length&&prev[end]<0;i++){const n=q[i],x=n%w,y=Math.floor(n/w);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||prev[k]>=0||!A.tileAt(nx*48+24,ny*48+24))continue;prev[k]=n;q.push(k);}}
 if(prev[end]<0)return null;let k=end;while(prev[k]!==start&&k!==start)k=prev[k];return{x:k%w*48+24,y:Math.floor(k/w)*48+24};}
 for(let tick=0;tick<limit&&!A.g.ended&&!a.down;tick++){
 if(A.g.floor!==floor){floor=A.g.floor;records.push({floor,level:a.level,xp:a.earnedXP||0,hp:a.hp,mp:a.mp,time:A.g.time});}
 if(a.cards?.offer){const choices=a.cards.offer,score=id=>id.startsWith('plus:')?100:id.startsWith('up:')?70:id.startsWith('tech:')?50:30;let i=0;for(let j=1;j<choices.length;j++)if(score(choices[j])>score(choices[i]))i=j;A.v14.cards.pick(a,i);}
 for(const tiers of c.ECOS_TAL12.TREE[job].tiers)if(a.level>=tiers[0].lvl&&!tiers.some(n=>a.tal?.[n.id]))A.mastery.learn(a,tiers[0].id);
 if(A.uiMode)A.closeUI();if(a.hp<a.max*.45&&a.bag.potion>0)A.useItem(a,'potion');if(a.mp<a.maxMp*.25&&a.bag.ether>0)A.useItem(a,'ether');
 const enemies=A.enemies.filter(e=>e.hp>0&&!e.ally&&!e.friendly&&!e.minionOf).sort((x,y)=>A.distance(a,x)-A.distance(a,y)),enemy=enemies.find(e=>A.distance(a,e)<400&&A.clearLine(a,e));
 const target=enemy||A.g.chests.find(ch=>!ch.opened&&route(ch))||enemies.find(e=>route(e))||A.g.stairs,pos=route(target);mask=0;if(pos){const dx=pos.x-a.x,dy=pos.y-a.y;if(Math.abs(dx)>6)mask|=dx>0?8:4;if(Math.abs(dy)>6)mask|=dy>0?2:1;}
 if(enemy){a.aim=Math.atan2(enemy.y-a.y,enemy.x-a.x);for(const slot of [5,4,3,2,1])if(A.v6.castSlot(a,slot))break;mask|=16;}if(tick%4===0)mask|=512;
 const here=Math.floor(a.x/16)+':'+Math.floor(a.y/16);stuck=here===lastPos?stuck+1:0;lastPos=here;if(stuck>180){records.push({stalled:true,floor,time:A.g.time});break;}
 A.step(1/30);if(tick%300===0)for(let i=0;i<8;i++)await Promise.resolve();
 }console.log(JSON.stringify({base,job,seed,assisted:false,ended:A.g.ended,down:a.down,floor:A.g.floor,level:a.level,time:A.g.time,records,ultimate:a.ultAudit||null}));
})().catch(e=>{console.error(e);process.exitCode=1});
