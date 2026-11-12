// Controlled meter scenarios, not a campaign survival test.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function scenario(kind){const a={pid:'a',hp:100,max:100,ult:30,ultGain:1,combat:4,level:16},b={pid:'b',hp:50,max:100,combat:4};
 const A={players:[a,b],NET:{role:'host'},g:{time:0},distance:()=>0,active:()=>[a,b],pat:{},hurt(e,d){if(!e.invuln)e.hp=Math.max(0,e.hp-d)},damage(a,d){a.hp=Math.max(0,a.hp-d)},makePlayer:()=>a,cleanActor:a=>({...a}),playerStep(){},hud(){}};
 const c={window:null,RPG_SPECIES:{},console,document:{getElementById:()=>null}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../kit-v14.js'),'utf8'),c);c.ECOS_KIT14(A);
 const initial=a.ult;A.hurt({hp:100,max:100,invuln:true},10,a);assert.equal(a.ult,initial);A.hurt({hp:1,max:1,minionOf:99},10,a);assert.equal(a.ult,initial);
 let first=null,e={hp:100,max:100},ready=[];for(let frame=0;frame<7200&&ready.length<3;frame++){A.g.time=frame/20;A.playerStep(a,0,.05);
 if(kind==='rapid'&&frame%2===0){A.hurt(e,1,a);if(e.hp===0)e={hp:100,max:100};}if(kind==='heavy'&&frame%20===0){A.hurt(e,10,a);if(e.hp===0)e={hp:100,max:100};}
 if(kind==='support'&&frame%40===0){b.hp=70;const s=A.v14.supportBefore();b.hp=90;A.v14.supportAfter(a,s);}if(kind==='tank'&&frame%20===0){a.hp=100;A.damage(a,10);}
 if(a.ult>=100){if(first===null)first=A.g.time;ready.push(A.g.time);a.ult=0;}}
 return{kind,firstReadySeconds:first,intervals:ready.slice(1).map((t,i)=>+(t-ready[i]).toFixed(2)),sources:a.ultAudit?.sources};}
const r=['rapid','heavy','support','tank'].map(scenario);assert(Math.abs(r[0].firstReadySeconds-r[1].firstReadySeconds)<2);assert(r[3].firstReadySeconds>r[0].firstReadySeconds);console.log(JSON.stringify({controlled:true,results:r},null,2));
