const {setup,party,flush}=require('./harness-v6.cjs'),vm=require('vm'),fs=require('fs'),assert=require('assert');
(async()=>{
 const {c,t}=setup(),A=t.api;assert.equal(A.v6.displayActor({x:100,y:50,prevX:0,prevY:0},.5).x,50);A.NET.role='client';A.netBlend=.04;assert.equal(A.v6.displayActor({x:100,y:50,prevX:0,prevY:0}).x,50);A.NET.role='none';const nodes=[];let drawCalls=0,lastScene,lastCamera,canvas;
 const node=()=>({style:{},hidden:false,setAttribute(){},append(){},remove(){this.removed=true;},addEventListener(name,fn){this[name]=fn;}});
 c.document.createElement=node;c.document.getElementById('gameview').prepend=n=>nodes.push(n);c.document.getElementById('gameview').append=n=>nodes.push(n);c.devicePixelRatio=1;
 vm.runInContext(fs.readFileSync('vendor/three.min.js','utf8'),c);
 // Keep real Three geometry, materials, sprites and camera math; replace only the unavailable GPU device.
 c.THREE.WebGLRenderer=class{constructor(){this.domElement=canvas=node();}setPixelRatio(){}setSize(){}render(scene,camera){drawCalls++;lastScene=scene;lastCamera=camera;}};
 vm.runInContext(fs.readFileSync('world3d.js','utf8'),c);c.ECOS_3D(A);
 t.begin(party(1),'solo');await flush();
 // The image stub must give each sheet its own source, as real browser Images do.
 for(const [k,im] of Object.entries(A.tiles))im.src='tiles/'+k;
 for(let f=1;f<=80;f+=5){t.floor(f);await flush();A.render(1);assert(drawCalls>0);assert.equal(A.rendererInfo.name,'Three.js · escenario 3D');
  for(const o of lastScene.children){if(o.isMesh){for(const name of ['position','uv','normal','color'])assert(Array.from(o.geometry.getAttribute(name).array).every(Number.isFinite),name+' has NaN');}if(o.position)assert(o.position.toArray().every(Number.isFinite));}
  assert(lastCamera.projectionMatrix.elements.every(Number.isFinite));
 }
 A.effects.push({line:true,x:A.me().x,y:A.me().y,ex:A.me().x,ey:A.me().y,kind:'spark',life:.4,total:.4});A.render(1);
 for(const o of lastScene.children)assert(o.position.toArray().every(Number.isFinite),'zero-length effect');
 A.view3D=false;A.render(1);assert(canvas.hidden);A.view3D=true;A.render(1);assert(!canvas.hidden);
 canvas.webglcontextlost({preventDefault(){}});A.render(1);assert(canvas.hidden);assert.equal(A.rendererInfo.name,'Vista inclinada compatible');
 console.log('PASS: real Three.js scene/geometry/camera math in 16 biomes, finite coordinates, 2D switch and context-loss fallback. GPU rasterization is not exercised.');
})().catch(e=>{console.error(e);process.exit(1);});
