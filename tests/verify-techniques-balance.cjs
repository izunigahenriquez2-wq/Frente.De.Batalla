const {setup,party,flush}=require('./harness-v6.cjs'),assert=require('assert');
(async()=>{
 const {t,c}=setup(),A=t.api;const start=async()=>{t.begin(party(1),'solo');await flush();A.enemies=[];const a=A.me();a.level=30;A.stats(a);a.mp=a.maxMp;a.hp=a.max;return a;};
 let a=await start();a.mp=0;a.combat=20;for(let i=0;i<600;i++)A.playerStep(a,0,1/60);assert(Math.abs(a.mp-9)<.01);a.mp=0;a.combat=0;for(let i=0;i<600;i++)A.playerStep(a,0,1/60);assert(Math.abs(a.mp-22)<.01);
 a.mp=0;a.action=null;a.cool=0;A.attack(a);assert(a.action,'basic unavailable without MP');
 a=await start();const physical={category:'physical'},special={category:'special'};
 for(const slug of ['swords-dance','bulk-up','calm-mind','dragon-dance','nasty-plot','belly-drum']){
  a=await start();const oldHP=a.hp;A.v6.effect(a,{...c.ECOS_TECH.moves[slug],slug});
  if(['swords-dance','bulk-up','dragon-dance','belly-drum'].includes(slug)){assert(A.v6.moveMultiplier(a,physical)>1);assert.equal(A.v6.moveMultiplier(a,special),1);}else{assert(A.v6.moveMultiplier(a,special)>1);assert.equal(A.v6.moveMultiplier(a,physical),1);}
  if(slug==='dragon-dance')assert(a.haste>0);if(['bulk-up','calm-mind'].includes(slug))assert(a.defenseBoost>0);if(slug==='belly-drum')assert.equal(a.hp,oldHP-a.max*.5);
  for(let i=0;i<600;i++)A.playerStep(a,0,1/60);assert.equal(A.v6.moveMultiplier(a,physical),1);assert.equal(A.v6.moveMultiplier(a,special),1);
 }
 a=await start();a.learned=['belly-drum'];a.loadout[0]='belly-drum';a.hp=a.max*.5;const before=a.mp;assert(!A.v6.castSlot(a,4));assert.equal(a.mp,before);
 a=await start();a.bag.tm_case=1;assert(A.v6.castSlot(a,1));const name=c.RPG_SPECIES[a.id].moves[1].name;assert(a.moveCD['name:'+name]>0);A.useItem(a,'tm_case');assert.equal(a.q,0);assert.equal(a.moveCD['name:'+name],0);assert.equal(a.bag.tm_case,0);
 // Repeated requests are limited by action/GCD/CD, not only by how fast the UI is clicked.
 a=await start();a.learned=['earthquake'];a.loadout[0]='earthquake';let accepted=0;for(let i=0;i<100;i++)accepted+=!!A.v6.castSlot(a,4);assert.equal(accepted,1);assert.equal(a.mp,a.maxMp-c.ECOS_TECH.moves.earthquake.mana);
 for(const base of [1,4,7,25,133])for(const job of Object.keys(c.RPG_CLASSES)){
  t.begin([{pid:'p1',profile:{base,job,name:'Mana'}}],'solo');await flush();A.enemies=[];a=A.me();a.level=16;A.stats(a);a.mp=a.maxMp;
  let count=0;for(let tick=0;tick<3600;tick++){a.combat=4;if(tick%60===0)count+=!!A.v6.castSlot(a,(tick/60)%2?1:3);A.playerStep(a,0,1/60);assert(Number.isFinite(a.mp)&&a.mp>=0&&a.mp<=a.maxMp);}
  assert(count>0&&count<60,'mana/cooldown did not constrain sustained casts');
 }
 console.log('PASS: exact combat/rest regeneration, free basic, six distinct buff techniques with expiry, Tambor HP gate, anti-spam and 55 species/class resource simulations. These are controlled resource tests, not human difficulty measurements.');
})().catch(e=>{console.error(e);process.exit(1);});
