'use strict';
(()=>{
const PROTOCOL=9;
const N={role:'none',peer:null,links:new Map(),roster:[],code:'',id:'host',running:false,callbacks:{},lastInput:0,resumeToken:'',profileData:null};
// Tokens are private to each data channel. Never include them in lobby or world broadcasts.
const sessions=new Map();
const safeProfile=p=>({base:window.KANTO_DEX?.[+p?.base]?.buyable?+p.base:25,job:!!window.RPG_CLASSES?.[p?.job]?p.job:'striker',name:String(p?.name||'Explorador').replace(/[<>]/g,'').slice(0,18)});
const options=()=>({debug:0,...(window.ECOS_PEER_CONFIG||{})});
const token=()=>window.crypto?.randomUUID?.()||Array.from({length:4},()=>Math.random().toString(36).slice(2)).join('');
N.on=c=>N.callbacks=c;
N.close=()=>{const old=N.peer;N.peer=null;N.role='none';N.links.clear();old?.destroy();N.roster=[];N.running=false;N.code='';N.resumeToken='';N.profileData=null;sessions.clear();};
N.send=(link,data)=>{try{if(link?.open)link.send(data);}catch{}};
N.broadcast=data=>{for(const link of N.links.values())N.send(link,data);};
N.lobby=()=>{const data={type:'lobby',code:N.code,roster:N.roster};N.broadcast(data);N.callbacks.lobby?.(data);};
function peerError(e){const texts={'peer-unavailable':'No se encontró esa sala. Revisa el código y que el anfitrión siga conectado.','network':'No se pudo contactar al servidor de salas. Puedes reintentar la conexión.','unavailable-id':'Ese código ya existe. Vuelve a crear una sala.','browser-incompatible':'Este navegador no admite el cooperativo WebRTC.','webrtc':'La conexión directa falló. Puede ser una restricción de la red.'};N.callbacks.error?.(texts[e.type]||'No se pudo establecer la conexión: '+(e.type||'red'));}
function watchSignal(peer){peer.on('disconnected',()=>{if(N.peer===peer&&!peer.destroyed){N.callbacks.notice?.('Reconectando con el servidor de salas…');try{peer.reconnect();}catch{}}});}
N.host=profile=>{
 N.close();if(!window.Peer){N.callbacks.error?.('No se cargó el módulo online. Comprueba la carpeta vendor.');return;}
 N.role='host';N.code=Math.random().toString(36).slice(2,8).toUpperCase();N.id='host';N.roster=[{pid:'host',profile:safeProfile(profile),ready:false}];
 const peer=N.peer=new Peer('ecos-rpg-'+N.code,options());watchSignal(peer);
 peer.on('open',()=>{if(N.peer===peer&&!N.running)N.lobby();});
 peer.on('error',e=>{if(N.peer!==peer)return;if(N.running&&['network','socket-error','socket-closed'].includes(e.type))N.callbacks.notice?.('Servidor de salas desconectado. La expedición continúa con los enlaces activos.');else peerError(e);});
 peer.on('connection',link=>{
  let welcomed=false,pid=null,sessionToken=null;let recent=[];
  const timer=setTimeout(()=>{if(!welcomed)link.close();},10000);
  const reject=text=>{N.send(link,{type:'reject',text});clearTimeout(timer);setTimeout(()=>link.close(),250);};
  link.on('data',m=>{
   if(N.peer!==peer||!m||typeof m!=='object')return;
   if(m.type==='hello'&&!welcomed){
    if(m.protocol!==PROTOCOL){reject('Todos deben usar la misma versión del juego.');return;}
    const prior=typeof m.resumeToken==='string'?sessions.get(m.resumeToken):null;
    if(prior){
     if(N.links.get(prior.pid)?.open){reject('Ese explorador ya está conectado.');return;}
     pid=prior.pid;sessionToken=m.resumeToken;
    }else{
     if(m.resumeToken){reject('La sesión de regreso ya no existe. El anfitrión debe mantener abierta la expedición.');return;}
     if(N.running||N.roster.length>=4){reject(N.running?'La expedición ya empezó.':'Sala completa: máximo 4 jugadores.');return;}
     pid=link.peer;sessionToken=token();sessions.set(sessionToken,{pid});
     N.roster.push({pid,profile:safeProfile(m.profile),ready:false});
    }
    welcomed=true;clearTimeout(timer);N.links.set(pid,link);
    N.send(link,{type:'welcome',pid,resumeToken:sessionToken});
    const member=N.roster.find(p=>p.pid===pid);if(member)member.disconnected=false;
    if(N.running)N.callbacks.rejoined?.(pid,link);else N.lobby();
   }else if(welcomed&&N.links.get(pid)===link){
    if(!N.running&&m.type==='profile'){const p=N.roster.find(p=>p.pid===pid);if(p){p.profile=safeProfile(m.profile);p.ready=false;N.lobby();}}
    else if(!N.running&&m.type==='ready'){const p=N.roster.find(p=>p.pid===pid);if(p){p.ready=!!m.ready;N.lobby();}}
    else if(m.type==='input'){const mask=Number.isInteger(m.mask)?m.mask&4095:0;N.callbacks.input?.(pid,mask);}
    else if(m.type==='action'){
     const now=Date.now();recent=recent.filter(t=>now-t<1000);if(recent.length>=24)return;recent.push(now);
     if(['item','equip','talent','evolve','branch','drop','transfer','event','cast','loadout','gate','path','skyvisit'].includes(m.action))N.callbacks.action?.(pid,m.action,String(m.key||'').slice(0,120));
    }
   }
  });
  link.on('close',()=>{clearTimeout(timer);if(N.peer!==peer||!welcomed||N.links.get(pid)!==link)return;N.links.delete(pid);
   if(N.running){const p=N.roster.find(p=>p.pid===pid);if(p)p.disconnected=true;N.callbacks.left?.(pid);}
   else{N.roster=N.roster.filter(p=>p.pid!==pid);sessions.delete(sessionToken);N.lobby();}
  });
  link.on('error',()=>link.close());
 });
};
function connectGuest(){
 const peer=N.peer=new Peer(undefined,options());watchSignal(peer);let linked=false;
 peer.on('error',e=>{if(N.peer===peer)peerError(e);});
 peer.on('open',()=>{
  if(N.peer!==peer||linked)return;linked=true;
  const link=peer.connect('ecos-rpg-'+N.code,{reliable:true,serialization:'json'});N.links.set('host',link);
  const timer=setTimeout(()=>{if(N.peer===peer&&N.links.get('host')===link)N.callbacks.error?.('La sala no respondió. Comprueba la red y vuelve a intentar.');},15000);
  link.on('open',()=>N.send(link,{type:'hello',protocol:PROTOCOL,profile:N.profileData,resumeToken:N.resumeToken}));
  link.on('data',m=>{if(N.peer!==peer||N.links.get('host')!==link||!m||typeof m!=='object')return;
   if(m.type==='welcome'){clearTimeout(timer);N.id=m.pid;N.resumeToken=m.resumeToken||'';}
   else if(m.type==='lobby'){clearTimeout(timer);N.roster=m.roster;N.callbacks.lobby?.(m);}
   else if(m.type==='reject'){clearTimeout(timer);N.callbacks.error?.(m.text);}
   else if(m.type==='world'){N.running=true;N.callbacks.world?.(m.world);}
   else if(m.type==='state')N.callbacks.state?.(m.state);
   else if(m.type==='event-open')N.callbacks.event?.(m.event);
   else if(m.type==='obstacle-open')N.callbacks.obstacle?.(m.id);
   else if(m.type==='ended')N.callbacks.ended?.(m.win);
   else if(m.type==='pause')N.callbacks.pause?.(m.paused);
  });
  link.on('close',()=>{clearTimeout(timer);if(N.peer!==peer||N.role!=='client'||N.links.get('host')!==link)return;N.links.delete('host');N.callbacks.error?.('Se perdió la conexión con el anfitrión. Puedes volver al mismo explorador mientras la expedición siga abierta.');});
  link.on('error',e=>{clearTimeout(timer);if(N.peer===peer)peerError(e);});
 });
}
N.join=(code,profile)=>{N.close();if(!window.Peer){N.callbacks.error?.('No se cargó el módulo online.');return;}const clean=String(code).trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(clean)){N.callbacks.error?.('El código debe tener seis letras o números.');return;}N.role='client';N.code=clean;N.profileData=safeProfile(profile);connectGuest();};
N.canReconnect=()=>N.role==='client'&&!!N.code&&!!N.profileData;
N.reconnect=()=>{if(!N.canReconnect())return false;const old=N.peer;N.peer=null;N.links.clear();old?.destroy();connectGuest();return true;};
N.profile=profile=>{if(N.running)return;N.profileData=safeProfile(profile);if(N.role==='host'){N.roster[0].profile=N.profileData;N.roster[0].ready=false;N.lobby();}else N.send(N.links.get('host'),{type:'profile',profile:N.profileData});};
N.ready=value=>{if(N.running)return;if(N.role==='host'){N.roster[0].ready=!!value;N.lobby();}else N.send(N.links.get('host'),{type:'ready',ready:!!value});};
N.input=mask=>N.send(N.links.get('host'),{type:'input',mask});
N.action=(action,key)=>N.send(N.links.get('host'),{type:'action',action,key});
N.world=world=>{N.running=true;N.broadcast({type:'world',world});};
N.state=state=>N.broadcast({type:'state',state});
window.ECOS_NET=N;
})();
