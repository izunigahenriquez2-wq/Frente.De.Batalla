const {EventEmitter}=require('events');
const peers=new Map();let serial=0;
class Link extends EventEmitter{
 constructor(id){super();this.peer=id;this.open=false;}
 send(m){if(this.open){const copy=structuredClone(m);queueMicrotask(()=>{if(this.open&&this.other.open)this.other.emit('data',copy);});}}
 close(){if(!this.open)return;this.open=false;this.other.open=false;queueMicrotask(()=>{this.emit('close');this.other.emit('close');});}
}
class Peer extends EventEmitter{
 constructor(id){super();this.id=id||'guest-'+(++serial);this.channels=[];this.destroyed=false;peers.set(this.id,this);queueMicrotask(()=>{if(!this.destroyed)this.emit('open',this.id);});}
 connect(id){const a=new Link(id),b=new Link(this.id);a.other=b;b.other=a;this.channels.push(a);queueMicrotask(()=>{const target=peers.get(id);if(!target){this.emit('error',{type:'peer-unavailable'});return;}target.channels.push(b);target.emit('connection',b);a.open=b.open=true;a.emit('open');b.emit('open');});return a;}
 destroy(){this.destroyed=true;peers.delete(this.id);for(const c of this.channels)c.close();}
 reconnect(){this.disconnected=false;queueMicrotask(()=>this.emit('open',this.id));}
}
module.exports={Peer,tick:()=>new Promise(resolve=>setImmediate(resolve))};
