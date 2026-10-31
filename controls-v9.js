'use strict';
// Pokémon Echoe's · controles configurables (v9). Esquemas predefinidos y asignación manual; se guardan en este navegador.
(()=>{
const STORE='ecosControls';
const ACTIONS=[
 ['up','Mover arriba','Movimiento'],['down','Mover abajo','Movimiento'],['left','Mover a la izquierda','Movimiento'],['right','Mover a la derecha','Movimiento'],['dash','Esquivar','Movimiento'],
 ['attack','Ataque básico','Combate'],['skill1','Movimiento 1 (antes Q)','Combate'],['skill2','Movimiento 2 (antes E)','Combate'],['skill3','Técnica de clase (antes R)','Combate'],
 ['tm1','Técnica / MT 1','Combate'],['tm2','Técnica / MT 2','Combate'],['tm3','Técnica / MT 3','Combate'],['tm4','Técnica / MT 4','Combate'],['tm5','Técnica / MT 5','Combate'],['tm6','Técnica / MT 6','Combate'],
 ['interact','Interactuar · rescatar','Acciones'],['potion','Poción rápida','Acciones'],['ping','Señalar posición','Acciones'],['bag','Mochila','Interfaz'],['map','Mapa','Interfaz'],['book','Libro de técnicas','Interfaz']
];
const PRESETS={
 classic:{name:'Clásico',desc:'WASD, Espacio, Q/E/R y números 5–0 para las MT (como siempre).',map:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',dash:'ShiftLeft',attack:'Space',skill1:'KeyQ',skill2:'KeyE',skill3:'KeyR',tm1:'Digit5',tm2:'Digit6',tm3:'Digit7',tm4:'Digit8',tm5:'Digit9',tm6:'Digit0',interact:'KeyF',potion:'KeyH',ping:'Backquote',bag:'KeyX',map:'KeyM',book:'KeyK'}},
 right:{name:'WASD + UIOP / JKLÑ',desc:'Mueves con WASD y atacas con la mano derecha: J K L Ñ para movimientos y U I O P para técnicas. Espacio y Shift se mantienen.',map:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',dash:'ShiftLeft',attack:'Space',skill1:'KeyJ',skill2:'KeyK',skill3:'KeyL',tm1:'Semicolon',tm2:'KeyU',tm3:'KeyI',tm4:'KeyO',tm5:'KeyP',tm6:'Comma',interact:'KeyF',potion:'KeyH',ping:'Backquote',bag:'KeyX',map:'KeyM',book:'KeyB'}},
 arrows:{name:'Flechas + ASDF / ZXCV',desc:'Mueves con las flechas y atacas con la mano izquierda: A S D F para movimientos y Z X C V para técnicas. Espacio y Shift se mantienen.',map:{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',dash:'ShiftLeft',attack:'Space',skill1:'KeyA',skill2:'KeyS',skill3:'KeyD',tm1:'KeyF',tm2:'KeyZ',tm3:'KeyX',tm4:'KeyC',tm5:'KeyV',tm6:'KeyG',interact:'Enter',potion:'KeyQ',ping:'Backquote',bag:'KeyI',map:'KeyM',book:'KeyK'}}
};
const MASK=['up','down','left','right','attack','skill1','skill2','skill3','dash','interact','potion','ping'];
const TM=['tm1','tm2','tm3','tm4','tm5','tm6'];
const RESERVED=['Escape','Tab','MetaLeft','MetaRight','ContextMenu'];
const ids=ACTIONS.map(a=>a[0]);
let preset='classic',custom={...PRESETS.classic.map},version=0;
try{const s=JSON.parse(localStorage.getItem(STORE));if(s){if(s.preset==='custom'||PRESETS[s.preset])preset=s.preset;if(s.custom&&ids.every(k=>typeof s.custom[k]==='string'))custom={...s.custom};}}catch{}
const map=()=>preset==='custom'?custom:PRESETS[preset].map;
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({preset,custom}));}catch{}version++;window.dispatchEvent(new Event('ecos-controls'));};
const SHORT={Space:'Espacio',ShiftLeft:'⇧ Izq',ShiftRight:'⇧ Der',ControlLeft:'Ctrl',ControlRight:'Ctrl Der',AltLeft:'Alt',AltRight:'Alt Gr',Enter:'Intro',NumpadEnter:'Intro',Backquote:'º',Semicolon:'Ñ',Comma:',',Period:'.',Minus:'-',Equal:'=',Slash:'-',Backslash:'\\',BracketLeft:'`',BracketRight:'+',Quote:'´',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backspace:'Retroceso',CapsLock:'Bloq Mayús',IntlBackslash:'<'};
function label(code){if(!code)return'—';if(SHORT[code])return SHORT[code];if(/^Key[A-Z]$/.test(code))return code.slice(3);if(/^Digit[0-9]$/.test(code))return code.slice(5);if(/^Numpad/.test(code))return 'Núm '+code.slice(6);return code;}
const C={
 ACTIONS,PRESETS,
 get preset(){return preset;},get version(){return version;},
 get:a=>map()[a],
 label,labelFor:a=>label(map()[a]),
 // Teclas de las doce entradas de movimiento/combate del jugador 1.
 codes12:()=>MASK.map(a=>map()[a]),
 classic12:()=>MASK.map(a=>PRESETS.classic.map[a]),
 // Casilla de la barra (0–9) para una tecla. Las MT usan su tecla asignada; los números 1–0 siguen valiendo como acceso directo si nadie los usa.
 slotFor(code){const m=map();const i=TM.findIndex(k=>m[k]===code);if(i>=0)return 4+i;if(Object.values(m).includes(code))return -1;const d=/^Digit([0-9])$/.exec(code);return d?(+d[1]+9)%10:-1;},
 slotLabel(i){const m=map(),key=['attack','skill1','skill2','skill3',...TM][i];return label(m[key]);},
 setPreset(name){if(!PRESETS[name]&&name!=='custom')return;if(name==='custom'&&!custom)custom={...map()};preset=name;save();},
 // Asigna una tecla; si otra acción la tenía, intercambian. Devuelve el nombre de la acción desplazada (o '').
 assign(action,code){if(!ids.includes(action)||RESERVED.includes(code))return null;if(preset!=='custom'){custom={...map()};preset='custom';}
  const prev=custom[action];let swapped='';for(const k of ids)if(k!==action&&custom[k]===code){custom[k]=prev;swapped=ACTIONS.find(a=>a[0]===k)[1];}custom[action]=code;save();return swapped;},
 reset(){preset='classic';custom={...PRESETS.classic.map};save();}
};
window.ECOS_CONTROLS=C;
})();

// Panel de ajustes. Se abre desde el botón «Controles» de la cabecera.
window.ECOS_CTRL=function(A){
 const C=window.ECOS_CONTROLS,$=id=>document.getElementById(id),esc=A.escape;
 let listening=null,note='',capture=null;
 function stop(){if(capture){window.removeEventListener('keydown',capture,true);capture=null;}listening=null;}
 function refreshLabels(){const b=$('bagBtn'),m=$('mapBtn');if(b)b.textContent='Mochila · '+C.labelFor('bag');if(m)m.textContent='Mapa · '+C.labelFor('map');}
 function render(){
  const groups=[...new Set(C.ACTIONS.map(a=>a[2]))];
  A.panel(`<div class="eyebrow">AJUSTES</div><h2>Controles</h2>
  <p>Elige un esquema o pulsa una casilla y luego la tecla que prefieras. Si repites una tecla, las dos acciones se intercambian. Escape y Tab no se pueden asignar.</p>
  <div class="ctrlPresets">${Object.entries(C.PRESETS).map(([id,p])=>`<button data-preset="${id}" class="${C.preset===id?'selected':''}"><b>${esc(p.name)}</b><small>${esc(p.desc)}</small></button>`).join('')}<button data-preset="custom" class="${C.preset==='custom'?'selected':''}"><b>Personalizado</b><small>Tus propias teclas. Al cambiar cualquier casilla pasas a este esquema.</small></button></div>
  ${note?`<p class="ctrlNote">${esc(note)}</p>`:''}
  <div class="ctrlGrid">${groups.map(g=>`<section><h3>${g}</h3>${C.ACTIONS.filter(a=>a[2]===g).map(([id,name])=>`<div class="ctrlRow"><span>${esc(name)}</span><button data-bind="${id}" class="${listening===id?'listening':''}">${listening===id?'Pulsa una tecla…':esc(C.labelFor(id))}</button></div>`).join('')}</section>`).join('')}</div>
  <p class="ctrlNote">En cooperativo local el jugador 1 usa siempre el esquema clásico para no chocar con las teclas del jugador 2. Los números 1–0 siguen lanzando las casillas si no están asignados a otra acción.</p>
  <div class="actions"><button id="ctrlReset">Restablecer clásico</button><button class="primary" id="ctrlBack">Volver</button></div>`);
  document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{stop();note='';C.setPreset(b.dataset.preset);render();});
  document.querySelectorAll('[data-bind]').forEach(b=>b.onclick=()=>listen(b.dataset.bind));
  $('ctrlReset').onclick=()=>{stop();note='Esquema clásico restablecido.';C.reset();render();};
  $('ctrlBack').onclick=close;
 }
 function listen(action){
  stop();listening=action;render();
  capture=e=>{e.preventDefault();e.stopPropagation();if(e.repeat)return;
   if(e.code==='Escape'){stop();note='Asignación cancelada.';render();return;}
   if(['Tab','MetaLeft','MetaRight','ContextMenu'].includes(e.code)){note='Esa tecla no se puede asignar.';stop();render();return;}
   const swapped=C.assign(action,e.code);stop();note=swapped?'«'+swapped+'» tenía esa tecla y pasó a la anterior.':'';render();};
  window.addEventListener('keydown',capture,true);
 }
 function open(){
  if(A.state==='play'&&A.g){if(A.uiMode&&A.uiMode!=='controls')return;A.uiMode='controls';A.keys.clear();if(A.localMode!=='online')A.g.paused=true;}
  else if(A.state!=='menu'){A.toast?.('Los controles se abren desde el menú principal o durante la expedición.');return;}
  note='';render();
 }
 function close(){stop();if(A.state==='play'&&A.g)A.closeUI();else A.menu();}
 const bar=document.querySelector('header nav');
 if(bar&&!$('ctrlBtn')){bar.insertAdjacentHTML('afterbegin','<button id="ctrlBtn">⌨ Controles</button>');$('ctrlBtn').onclick=()=>{if(A.uiMode==='controls')close();else open();};}
 const oldMenu=A.menu;A.menu=function(...args){const out=oldMenu.apply(this,args);const g=$('homeGuide');if(g&&!$('ctrlMenuBtn')){g.insertAdjacentHTML('afterend','<button id="ctrlMenuBtn">Controles</button>');$('ctrlMenuBtn').onclick=open;}return out;};
 window.addEventListener('ecos-controls',refreshLabels);refreshLabels();
 A.openControls=open;
};
