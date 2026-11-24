import * as THREE from 'three';
import { gsap } from 'gsap';

const $=s=>document.querySelector(s),canvas=$('#scene'),fallback=$('#fallback'),loading=$('#loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,mobile=matchMedia('(max-width:760px)').matches;
const gold=0xd8bd83,pale=0xf0dfb7,clock=new THREE.Clock();
let scene,camera,renderer,raycaster,pointer,book,cover,museum,clickables=[],started=false,free=false,stopIndex=0,drag=null,dragged=false,hovered=null;
const lookTarget=new THREE.Vector3(0,1.5,-1.8),spherical=new THREE.Spherical(15,1.38,0);
const stops=[
 {name:'THE GRAND HALL',cam:[0,3.8,14.5],look:[0,1.6,-1.8]},
 {name:'DIGITAL GLOBE',cam:[-5.7,3.2,5.4],look:[-4.2,2,-2.5]},
 {name:'AI CORE',cam:[0,3.1,5.2],look:[0,2.2,-4.2]},
 {name:'PROJECT GALLERY',cam:[5.7,3.1,5.4],look:[4.1,1.7,-2.4]},
 {name:'KNOWLEDGE & CONTACT',cam:[0,3.1,-1.3],look:[0,1.7,-8.1]}
];
const mat=(c,r=.58,m=.3,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,...extra});
function box(parent,size,pos,m){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),m);o.position.set(...pos);parent.add(o);return o}
function glow(parent,pos,size=.03){const o=new THREE.Mesh(new THREE.SphereGeometry(size,12,10),new THREE.MeshBasicMaterial({color:pale}));o.position.set(...pos);parent.add(o);return o}
function labelTexture(title,sub){const c=document.createElement('canvas');c.width=900;c.height=440;const x=c.getContext('2d');x.fillStyle='#17140f';x.fillRect(0,0,900,440);x.strokeStyle='#d8bd83';x.lineWidth=5;x.strokeRect(18,18,864,404);x.fillStyle='#d8bd83';x.font='26px monospace';x.fillText(sub.toUpperCase(),55,95);x.fillStyle='#f4efe5';x.font='bold 66px Georgia';x.fillText(title,55,215);x.fillStyle='#a99a7e';x.font='23px monospace';x.fillText('SELECT TO EXPLORE  ↗',55,310);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function label(parent,title,sub,pos=[0,2.9,-.45]){const o=new THREE.Mesh(new THREE.PlaneGeometry(2.45,.8),new THREE.MeshBasicMaterial({map:labelTexture(title,sub)}));o.position.set(...pos);parent.add(o)}
function exhibit(g,data){g.traverse(o=>{if(o.isMesh){o.userData.exhibit=data;clickables.push(o)}});g.userData.data=data;return g}
function createBook(){
 book=new THREE.Group();book.position.set(0,1.65,6.1);scene.add(book);
 box(book,[2.55,1.78,.18],[0,0,-.04],mat(0x100d09));
 box(book,[2.4,1.62,.12],[0,0,.08],mat(0xe4d5b5,.88,.04));
 box(book,[.055,1.7,.22],[-1.2,0,.09],mat(gold,.35,.7));
 cover=new THREE.Group();cover.position.set(-1.2,0,.17);book.add(cover);
 box(cover,[2.42,1.76,.09],[1.21,0,0],mat(0x17130d,.42,.36));
 box(cover,[2.16,1.5,.012],[1.21,0,.052],mat(0x211a10,.52,.25));
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2,1.54,.015)),new THREE.LineBasicMaterial({color:gold}));edges.position.set(1.21,0,.065);cover.add(edges);
 const emblem=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.95),new THREE.MeshBasicMaterial({map:labelTexture('MUKESH BABU','THE PORTFOLIO')}));emblem.position.set(1.21,0,.075);cover.add(emblem);
 box(book,[.12,1.8,.25],[-1.23,0,0],mat(0x9b794a,.38,.72));
 exhibit(book,{kicker:'THE PORTFOLIO · INTRODUCTION',title:'A book of beginnings',description:'This stylised book represents a portfolio: a place to collect projects, experiments, interests and lessons. The museum is an interactive way to explore those chapters.',links:[['OPEN PROJECTS','./projects.html'],['ABOUT ME','./about.html']]});
}
function createRoom(){
 museum=new THREE.Group();scene.add(museum);const stone=mat(0x17140f,.72,.24),wall=mat(0x211d16,.82,.12),trim=mat(0x94764a,.36,.72);
 box(museum,[30,.35,34],[0,-.22,-1],stone);box(museum,[30,9,.45],[0,4.25,-17.5],wall);box(museum,[.45,9,34],[-15,4.25,-1],wall);box(museum,[.45,9,34],[15,4.25,-1],wall);
 box(museum,[30,.08,.55],[0,.03,-17.2],trim);box(museum,[30,.08,.55],[0,8.4,-17.2],trim);
 for(let x=-12;x<=12;x+=6){const c=new THREE.Group();c.position.set(x,0,-10);museum.add(c);const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,7.2,16),mat(0x30271a,.5,.35));shaft.position.y=3.6;c.add(shaft);const base=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.22,20),trim);base.position.y=.12;c.add(base);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.42,.32,.2,20),trim);cap.position.y=7.25;c.add(cap)}
 for(let x=-12;x<=12;x+=4){const l=new THREE.PointLight(0xd9bd85,1.1,10,2);l.position.set(x,7,-5);museum.add(l);const f=new THREE.Mesh(new THREE.CylinderGeometry(.42,.18,.12,20),trim);f.position.set(x,8.05,-5);museum.add(f)}
 for(let z=8;z>=-13;z-=3){const line=box(museum,[.025,.012,1.4],[0,-.035,z],mat(gold,.3,.6,{emissive:gold,emissiveIntensity:.12}))}
 museum.add(new THREE.HemisphereLight(0xc8b58e,0x100d08,.8));const key=new THREE.DirectionalLight(0xffe5b2,1.3);key.position.set(3,9,7);museum.add(key);
 const spot=new THREE.SpotLight(0xe8d2a2,35,25,Math.PI/5,.6,1.4);spot.position.set(0,8,0);spot.target.position.set(0,0,-5);museum.add(spot,spot.target);
}
function globe(){
 const g=new THREE.Group();g.position.set(-4.3,2,-2.6);scene.add(g);
 g.add(new THREE.Mesh(new THREE.SphereGeometry(1.05,36,28),mat(0x8c7146,.34,.72,{emissive:0x38270f,emissiveIntensity:.25})));
 g.add(new THREE.Mesh(new THREE.SphereGeometry(1.075,18,12),new THREE.MeshBasicMaterial({color:pale,wireframe:true,transparent:true,opacity:.22})));
 const a=new THREE.Mesh(new THREE.TorusGeometry(1.35,.012,8,100),mat(gold,.3,.7));a.rotation.x=1.05;g.add(a);const b=new THREE.Mesh(new THREE.TorusGeometry(1.48,.008,8,100),mat(0x8c7047,.3,.7));b.rotation.y=1.05;g.add(b);
 for(let i=0;i<26;i++){const p=Math.acos(-1+2*(i+.5)/26),t=Math.sqrt(26*Math.PI)*p;glow(g,[1.08*Math.sin(p)*Math.cos(t),1.08*Math.cos(p),1.08*Math.sin(p)*Math.sin(t)],.025)}
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.85,1.05,.5,32),mat(0x2b2419,.38,.62));base.position.y=-1.35;g.add(base);
 return exhibit(g,{kicker:'EXHIBIT 01 · TECHNOLOGY',title:'The Digital Globe',description:'A symbol of connected technology: tools, platforms and open-source communities that make digital projects possible. An invitation to keep exploring.',links:[['VRUNTIME LABS','https://github.com/vruntime-labs'],['PERSONAL GITHUB','https://github.com/mmukeshbabu2010-dot']]});
}
function aiCore(){
 const g=new THREE.Group();g.position.set(0,2.25,-4.5);scene.add(g);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.78,2),mat(0xc5a66d,.22,.75,{emissive:0x62451c,emissiveIntensity:.35}));g.add(core);
 g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.12,1),new THREE.MeshBasicMaterial({color:pale,wireframe:true,transparent:true,opacity:.32})));
 const a=new THREE.Mesh(new THREE.TorusGeometry(1.5,.012,8,120),mat(gold,.3,.8));a.rotation.x=1.1;g.add(a);
 const b=new THREE.Mesh(new THREE.TorusGeometry(1.32,.009,8,120),mat(0x98794a,.3,.8));b.rotation.y=1.1;g.add(b);
 for(let i=0;i<9;i++){const t=i*Math.PI*2/9;glow(g,[Math.cos(t)*1.5,Math.sin(t*2)*.3,Math.sin(t)*1.5],.035)}
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.85,1,.42,32),mat(0x2b2419,.4,.55));base.position.y=-1.55;g.add(base);
 return exhibit(g,{kicker:'EXHIBIT 02 · ARTIFICIAL INTELLIGENCE',title:'The AI Core',description:'A visual representation of the AI learning path: models, data, prompts, retrieval, agents, evaluation and responsible deployment. The goal is to learn the engineering behind useful AI systems.',links:[['VISIT AI LAB','./ai-lab.html'],['ABOUT & INTERESTS','./about.html']]});
}
function laptop(){
 const g=new THREE.Group();g.position.set(4.35,1.05,-2.5);scene.add(g);box(g,[2.15,.13,1.48],[0,0,.1],mat(0x5a4930,.34,.8));
 const hinge=new THREE.Group();hinge.position.set(0,.08,-.58);g.add(hinge);box(hinge,[2.12,1.38,.12],[0,.68,0],mat(0x252017,.34,.78));
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.92,1.17),new THREE.MeshBasicMaterial({map:labelTexture('PROJECTS','SELECTED WORK / 01—06')}));screen.position.set(0,.68,.067);hinge.add(screen);hinge.rotation.x=-.08;box(g,[1.55,.025,.75],[0,.08,.1],mat(0x262016,.45,.48));
 return exhibit(g,{kicker:'EXHIBIT 03 · SELECTED WORK',title:'The Project Gallery',description:'A collection of independent projects and explorations. Open the project gallery to inspect current repositories and live demos. Each project remains linked to its original source.',links:[['EXPLORE PROJECTS','./projects.html'],['PERSONAL GITHUB','https://github.com/mmukeshbabu2010-dot']]});
}
function library(){
 const g=new THREE.Group();g.position.set(-4.4,0,-9.2);scene.add(g);const wood=mat(0x342819,.55,.45),colors=[0x8e7048,0x5d4b35,0xc1a16b,0x51402c,0x9a825b];box(g,[2.5,3.3,.38],[0,1.65,0],wood);
 for(let y=.65;y<3.1;y+=.82){box(g,[2.65,.09,.55],[0,y,0],mat(0x96784d,.35,.68));for(let i=0;i<7;i++){const h=.42+(i%3)*.1,b=box(g,[.19,h,.32],[-.92+i*.3,y+.045+h/2,.02],mat(colors[(i+Math.round(y*10))%colors.length],.62,.25));b.rotation.z=i%2?-.04:.035}}
 return exhibit(g,{kicker:'EXHIBIT 04 · LEARNING',title:'The Knowledge Library',description:'Every project begins with learning. This section connects to the academic journey and the learning resources collected along the way.',links:[['EDUCATION','./education.html'],['ABOUT & INTERESTS','./about.html'],['LEARNING REPOSITORY','https://github.com/icse-cbse-10-12']]});
}
function contact(){
 const g=new THREE.Group();g.position.set(4.4,0,-9.2);scene.add(g);box(g,[2.35,3.2,.38],[0,1.6,0],mat(0x292218,.4,.62));
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.25),new THREE.MeshBasicMaterial({map:labelTexture('SAY HELLO','CONTACT TERMINAL')}));screen.position.set(0,2.15,.205);g.add(screen);box(g,[1.45,.13,.45],[0,.55,.15],mat(gold,.35,.7));
 return exhibit(g,{kicker:'EXHIBIT 05 · CONTACT',title:'The Contact Terminal',description:'Have a question about a project, an idea to discuss or a useful resource to share? You can reach me through email or LinkedIn.',links:[['SEND AN EMAIL','mailto:mmukeshbabu.2010@gmail.com'],['LINKEDIN','https://linkedin.com/in/mmukesh-babu']]});
}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x080807);scene.fog=new THREE.FogExp2(0x080807,.023);
 camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);camera.position.set(0,1.8,10.2);camera.lookAt(0,1.65,6);
 renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.65));renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();createRoom();createBook();globe();aiCore();laptop();library();contact();
 addEventListener('resize',resize);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('click',canvasClick);canvas.addEventListener('wheel',wheel,{passive:false});
 $('#play').addEventListener('click',playIntro);$('#skip').addEventListener('click',skipIntro);$('#prev').addEventListener('click',()=>goStop(Math.max(0,stopIndex-1)));$('#next').addEventListener('click',()=>goStop((stopIndex+1)%stops.length));$('#mode').addEventListener('click',toggleMode);$('#panel-close').addEventListener('click',closePanel);$('#help').addEventListener('click',toggleHelp);$('#help-close').addEventListener('click',toggleHelp);document.addEventListener('keydown',keyDown);
 fallback.style.display='none';loading.textContent='THE MUSEUM IS READY';animate();
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.65));renderer.setSize(innerWidth,innerHeight,false)}
function showMuseum(){ $('#intro').hidden=true;$('#hud').hidden=false;$('#footer').hidden=false;loading.style.display='none';}
function playIntro(){if(started)return;started=true;showMuseum();gsap.to(cover.rotation,{y:-2.35,duration:reduced?0:.95,ease:'power3.inOut'});gsap.to(book.scale,{x:.42,y:.42,z:.42,duration:reduced?0:1.5,delay:reduced?0:.55,ease:'power3.inOut'});gsap.to(camera.position,{x:0,y:3.8,z:14.5,duration:reduced?0:3.1,delay:reduced?0:.45,ease:'power3.inOut'});gsap.to(lookTarget,{x:0,y:1.6,z:-1.8,duration:reduced?0:3.1,delay:reduced?0:.45,ease:'power3.inOut',onUpdate:()=>camera.lookAt(lookTarget)});gsap.to(book.position,{y:.55,z:3.8,duration:reduced?0:2.5,delay:.4,ease:'power2.inOut'});setTimeout(()=>{stopIndex=0;updateHud()},reduced?30:3200)}
function skipIntro(){if(started)return;started=true;showMuseum();book.visible=false;camera.position.set(...stops[0].cam);lookTarget.set(...stops[0].look);camera.lookAt(lookTarget);stopIndex=0;updateHud()}
function updateHud(){$('#place-name').textContent=stops[stopIndex].name;$('#place-count').textContent=String(stopIndex+1).padStart(2,'0')+' / '+String(stops.length).padStart(2,'0');$('#prev').disabled=stopIndex===0}
function goStop(i){if(!started)return;stopIndex=i;free=false;$('#mode').textContent='FREE EXPLORE';updateHud();closePanel();const s=stops[i],d=reduced?0:1.65;gsap.to(camera.position,{x:s.cam[0],y:s.cam[1],z:s.cam[2],duration:d,ease:'power2.inOut'});gsap.to(lookTarget,{x:s.look[0],y:s.look[1],z:s.look[2],duration:d,ease:'power2.inOut',onUpdate:()=>camera.lookAt(lookTarget)});spherical.setFromVector3(camera.position.clone().sub(lookTarget))}
function toggleMode(){free=!free;$('#mode').textContent=free?'GUIDED MODE':'FREE EXPLORE';if(free){spherical.setFromVector3(camera.position.clone().sub(lookTarget));$('#place-name').textContent='FREE EXPLORATION'}else goStop(stopIndex)}
function pointerDown(e){if(!started||!free||e.button!==0)return;drag={x:e.clientX,y:e.clientY};dragged=false;canvas.setPointerCapture?.(e.pointerId)}
function pointerUp(){if(drag)drag=null}
function pointerMove(e){const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;if(drag&&free){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)dragged=true;spherical.theta-=dx*.005;spherical.phi=THREE.MathUtils.clamp(spherical.phi+dy*.004,.55,2.35);camera.position.copy(lookTarget).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(lookTarget);drag.x=e.clientX;drag.y=e.clientY;return}if(!started)return;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickables,false);hovered=hit.length?hit[0].object:null;canvas.style.cursor=hovered?'pointer':free?'grab':'default'}
function canvasClick(e){if(!started||dragged)return;const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickables,false);if(hit.length&&hit[0].object.userData.exhibit)openPanel(hit[0].object.userData.exhibit)}
function wheel(e){if(!started||!free)return;e.preventDefault();spherical.radius=THREE.MathUtils.clamp(spherical.radius+e.deltaY*.012,5,23);camera.position.copy(lookTarget).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(lookTarget)}
function openPanel(d){$('#panel-kicker').textContent=d.kicker;$('#panel-title').textContent=d.title;$('#panel-description').textContent=d.description;const links=$('#panel-links');links.replaceChildren();d.links.forEach(([name,href])=>{const a=document.createElement('a');a.href=href;a.textContent=name+' ↗';if(href.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer'}links.append(a)});$('#panel').hidden=false;$('#help-box').hidden=true}
function closePanel(){$('#panel').hidden=true}
function toggleHelp(){$('#help-box').hidden=!$('#help-box').hidden;$('#help').setAttribute('aria-expanded',String(!$('#help-box').hidden))}
function keyDown(e){if(e.key==='Escape'){closePanel();$('#help-box').hidden=true}if(!started||!free)return;if(e.key==='ArrowLeft')spherical.theta+=.08;if(e.key==='ArrowRight')spherical.theta-=.08;if(e.key==='ArrowUp')spherical.phi=THREE.MathUtils.clamp(spherical.phi-.06,.55,2.35);if(e.key==='ArrowDown')spherical.phi=THREE.MathUtils.clamp(spherical.phi+.06,.55,2.35);camera.position.copy(lookTarget).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(lookTarget)}
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(book?.visible&&!reduced){book.rotation.y=Math.sin(t*.35)*.035;book.position.y=1.65+Math.sin(t*.65)*.05}scene.traverse(o=>{if(o.userData.data?.title==='The Digital Globe')o.rotation.y=t*.11;if(o.userData.data?.title==='The AI Core')o.rotation.y=t*.16});renderer.render(scene,camera)}
try{init()}catch(err){console.error('Museum initialisation failed:',err);canvas.style.display='none';loading.style.display='none';fallback.style.display='block'}
