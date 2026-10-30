const {setup,flush}=require('./harness-v6.cjs'),{Peer,tick}=require('./transport.cjs'),assert=require('assert');
(async()=>{
 const instances=Array.from({length:4},()=>setup(null,Peer));const [host,...clients]=instances;const H=host.t.api,N=host.c.ECOS_NET;
 // UI callbacks are excluded; simulation, serialization, transport and reconnect logic are real.
 for(const v of instances){v.errors=[];v.c.ECOS_NET.callbacks.lobby=()=>{};v.c.ECOS_NET.callbacks.error=e=>v.errors.push(e);v.t.api.hud=()=>{};}
 N.host({base:1,job:'support',name:'Host'});await tick();
 for(let i=0;i<3;i++){clients[i].c.ECOS_NET.join(N.code,{base:[25,7,133][i],job:['mage','guardian','engineer'][i],name:'Guest'+i});await tick();}
 assert.equal(N.roster.length,4);host.t.begin(N.roster,'online');await flush();await tick();
 for(const c of clients){assert.equal(c.t.api.players.length,4);assert.equal(c.t.api.g.runId,H.g.runId);assert.equal(c.t.api.me().pid,c.c.ECOS_NET.id);}
 const guest=clients[0],G=guest.t.api,pid=guest.c.ECOS_NET.id,a=H.players.find(p=>p.pid===pid);
 a.learned=['protect'];a.loadout[0]='protect';a.bag.ether=3;a.mp=0;a.coins=17;
 guest.c.ECOS_NET.action('item','ether');await tick();assert.equal(a.bag.ether,2);assert(a.mp>0);
 guest.c.ECOS_NET.action('cast','4');await tick();assert(a.action);for(let i=0;i<90;i++)H.playerStep(a,0,1/120);assert(a.shield>0);
 H.g.paused=true;const bag=a.bag.ether,mp=a.mp;guest.c.ECOS_NET.action('item','ether');guest.c.ECOS_NET.action('loadout','1|protect');await tick();assert.equal(a.bag.ether,bag);assert.equal(a.mp,mp);assert.equal(a.loadout[1],null);H.g.paused=false;
 // V8: identity choices are host-validated and scoped to the sending player.
 a.level=20;a.action=null;a.gcd=0;const offer=H.v8.pending(a)[0];guest.c.ECOS_NET.action('path',offer.key+'|'+offer.options[0]);await tick();assert.equal(a.speciesChoices[offer.slot-1],offer.options[0]);assert(!H.players[0].pathHistory?.[offer.key]);guest.c.ECOS_NET.action('path','999:1|hyper-beam');await tick();assert(!a.pathHistory['999:1']);
 // Old/foreign snapshots must not alter gates, traps, events, helpers or sequence.
 const stale=structuredClone(H.packState());N.state(stale);await tick();const seq=G.g.lastSeq,rev=G.g.revision;
 stale.gates=[{id:'bad',cells:[0],open:true}];stale.traps=[{id:'bad'}];stale.events=[{id:'bad'}];stale.mapRevision=9999;
 guest.c.ECOS_NET.callbacks.state(stale);assert.equal(G.g.lastSeq,seq);assert.equal(G.g.revision,rev);assert(!G.g.gates.some(d=>d.id==='bad'));assert(!G.g.traps.some(d=>d.id==='bad'));
 const wrong={...stale,seq:seq+999,floor:77};guest.c.ECOS_NET.callbacks.state(wrong);assert.equal(G.g.revision,rev);
 // A disconnected explorer cannot perform actions and returns to the same inventory and actor.
 const secret=guest.c.ECOS_NET.resumeToken;assert(secret);assert(!JSON.stringify(N.roster).includes(secret));
 guest.c.ECOS_NET.links.get('host').close();await tick();assert(a.disconnected);assert.equal(N.roster.length,4);assert.equal(N.links.size,2);
 a.itemCD=0;const before=a.bag.ether;H.v6.server(a,'item','ether');assert.equal(a.bag.ether,before);
 assert(guest.c.ECOS_NET.reconnect());await tick();await flush();await tick();
 assert.equal(guest.c.ECOS_NET.id,pid);assert(!a.disconnected);assert.equal(G.me().coins,17);assert.equal(G.me().bag.ether,before);assert.equal(G.me().loadout[0],'protect');assert.equal(N.links.size,3);assert.equal(N.roster.length,4);
 // The next floor is shared by all clients, then paused, with real map and gate snapshots.
 H.g.floor=6;H.nextFloor();await flush();N.world(H.packWorld());N.state(H.packState());await tick();
 for(const c of clients){assert.equal(c.t.api.g.floor,6);assert.deepEqual(Array.from(c.t.api.g.map),Array.from(H.g.map));}
 H.g.paused=true;N.broadcast({type:'pause',paused:true});await tick();for(const c of clients)assert(c.t.api.g.paused);
 for(const v of instances)v.c.ECOS_NET.close();
 console.log('PASS: four simulation instances, inventory/casts, pause validation, stale/foreign snapshots, disconnect/reconnect with same actor, floor changes and shared pause. Transport is deterministic, not real WebRTC.');
})().catch(e=>{console.error(e);process.exit(1);});
