'use strict';
/* v12 · Objetos de uso rápido: dos recuadros junto a las habilidades.
   · Curación (tecla "Poción rápida", H por defecto): el objeto de curación equipado.
   · Arrojable (tecla "Arrojable rápido", 4 por defecto): un objeto de daño, sueño, ralentización o explosión.
   Un clic en el recuadro cambia al siguiente objeto disponible. Si el equipado se acaba, se usa el siguiente. */
window.ECOS_QUICK12=function(A){
 const I=window.RPG_ITEMS;if(!I)return;
 const $=id=>document.getElementById(id),esc=A.escape;
 const amount=k=>{const it=I[k],c=it?.c11||{};return(it?.heal||c.heal||0)+((it?.ratio||c.ratio||0)*100);};
 const isHeal=k=>{const it=I[k];return it?.type==='use'&&amount(k)>0&&!(it.c11?.perm||it.c11?.chest||it.c11?.coins||it.c11?.throw);};
 const isThrow=k=>{const it=I[k],c=it?.c11;return it?.type==='use'&&!!(c&&(c.throw||c.blast||c.sleep||c.slow));};
 const list=(a,f,slot)=>Object.keys(a?.bag||{}).filter(k=>a.bag[k]>0&&f(k)).sort((x,y)=>slot==='heal'?amount(x)-amount(y)||x.localeCompare(y):I[x].name.localeCompare(I[y].name,'es'));
 const keyOf=(a,slot)=>{const l=list(a,slot==='heal'?isHeal:isThrow,slot),q=a.quick?.[slot];return q&&l.includes(q)?q:l[0]||null;};
 A.quickHealKey=a=>keyOf(a,'heal');
 A.quickThrowKey=a=>keyOf(a,'throw');
 A.quickThrow=a=>{if(!a||a.down)return;const k=keyOf(a,'throw');if(!k){if(a.pid===A.myPid)A.toast('No tienes objetos arrojables.');return;}A.useItem(a,k);};
 A.quickSet=(a,spec)=>{if(!a)return;const [slot,val]=String(spec).split(':');if(slot!=='heal'&&slot!=='throw')return;const l=list(a,slot==='heal'?isHeal:isThrow,slot);if(!l.length)return;
  let next=val;if(val==='next'){const i=l.indexOf(keyOf(a,slot));next=l[(i+1)%l.length];}if(!l.includes(next))return;(a.quick??={})[slot]=next;};
 const oldNetQuick=A.NET.callbacks.action;A.NET.callbacks.action=(pid,type,key)=>{if(type==='quick'){A.quickSet(A.players.find(p=>p.pid===pid),key);return;}return oldNetQuick?.(pid,type,key);};
 const cl=A.cleanActor;A.cleanActor=function(a){const o=cl(a);if(a.quick)o.quick=a.quick;return o;};
 const label=act=>window.ECOS_CONTROLS?.labelFor(act)||(act==='potion'?'H':'4');
 const shown=()=>{const sel=$('barPlayer');return A.localMode==='local'&&sel?A.players.find(p=>p.pid===sel.value)||A.me():A.me();};
 function click(slot){const a=shown();if(!a||A.uiMode)return;const spec=slot+':next';if(A.NET.role==='client')A.requestAction('quick',spec);else A.quickSet(a,spec);}
 const draw=A.v6.drawHUD;
 A.v6.drawHUD=function(){
  draw.apply(this,arguments);
  const bar=$('rpgActionBar');if(!bar)return;
  let qs=$('quickSlots');
  if(!qs){let row=bar.parentNode;if(!row.classList.contains('barRow')){row=document.createElement('div');row.className='barRow';bar.parentNode.insertBefore(row,bar);row.append(bar);}
   qs=document.createElement('div');qs.id='quickSlots';qs.innerHTML='<button class="quickSlot" id="quickHeal" data-slot="heal"></button><button class="quickSlot" id="quickThrow" data-slot="throw"></button>';row.append(qs);
   qs.querySelectorAll('button').forEach(b=>b.onclick=()=>click(b.dataset.slot));}
  const a=shown();if(!a)return;
  for(const [slot,act,cap] of [['heal','potion','Curar'],['throw','throw','Lanzar']]){
   const b=$(slot==='heal'?'quickHeal':'quickThrow'),k=keyOf(a,slot),n=k?a.bag[k]:0,sig=slot+':'+(k||'')+':'+n+':'+label(act);
   if(b.dataset.sig===sig)continue;b.dataset.sig=sig;b.className='quickSlot'+(k?'':' empty');
   b.title=k?I[k].name+' ×'+n+' · '+I[k].desc+' · Clic: cambiar objeto':(slot==='heal'?'Sin objetos de curación':'Sin objetos arrojables');
   b.innerHTML='<kbd>'+esc(label(act))+'</kbd>'+(k?'<img src="assets/items/'+I[k].icon+'.png" alt=""><small>×'+n+'</small>':'<span class="quickNone">—</span>')+'<em>'+cap+'</em>';}
 };
};
