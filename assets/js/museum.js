const $ = (id) => document.getElementById(id);
const intro = $('museum-intro'), stage = $('museum-stage'), fallback = $('museum-fallback');
const status = $('museum-status'), grid = $('museum-grid'), panel = $('project-panel'), panelContent = $('panel-content');
let projects = [], renderer, scene, camera, animationFrame, three, exhibits = [], selected = null;
let pointerDown = false, lastX = 0, lastY = 0, targetRotation = 0, targetTilt = 0, cameraDistance = 12;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function say(message) { status.textContent = message; }
function renderDirectory() {
  grid.innerHTML = projects.map((project) => `<article class="museum-card"><div class="museum-kicker">${PortfolioProjects.escapeHTML(project.gallery)}</div><h3>${PortfolioProjects.escapeHTML(project.title)}</h3><p>${PortfolioProjects.escapeHTML(project.description)}</p><div>${project.links.map((link) => `<a href="${PortfolioProjects.escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer">${PortfolioProjects.escapeHTML(link.label)} ↗</a>`).join('')}</div></article>`).join('');
}
function showDirectory(message = 'You are viewing the lightweight 2D directory.') {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (renderer) { renderer.dispose(); renderer.domElement.remove(); renderer = null; }
  stage.hidden = true; intro.hidden = true; fallback.hidden = false; panel.hidden = true; say(message);
}
function openProject(project) {
  selected = project;
  panelContent.innerHTML = `<div class="museum-kicker">${PortfolioProjects.escapeHTML(project.gallery)} · ${PortfolioProjects.escapeHTML(project.affiliation)}</div><h2>${PortfolioProjects.escapeHTML(project.title)}</h2><p>${PortfolioProjects.escapeHTML(project.description)}</p><div class="museum-panel-links">${project.links.map((link) => `<a href="${PortfolioProjects.escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer">${PortfolioProjects.escapeHTML(link.label)} ↗</a>`).join('')}</div>`;
  panel.hidden = false;
}
function makeExhibit(THREE, project, index) {
  const angle = (index / projects.length) * Math.PI * 2;
  const group = new THREE.Group(); group.position.set(Math.sin(angle) * 4.3, 0, Math.cos(angle) * 4.3);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.05, .35, 8), new THREE.MeshStandardMaterial({color:0x242019,metalness:.65,roughness:.42})); base.position.y=.18; group.add(base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.15,.12,1.15), new THREE.MeshStandardMaterial({color:0x51452e,metalness:.72,roughness:.3,emissive:0x241b0c})); top.position.y=.42; group.add(top);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.38,0), new THREE.MeshStandardMaterial({color:0xd8bd83,metalness:.55,roughness:.28,emissive:0x5a431d})); marker.position.y=1.12; group.add(marker);
  group.traverse((object) => { if (object.isMesh) { object.userData.project = project; object.userData.exhibit = group; } });
  scene.add(group); exhibits.push(group);
}
async function enterMuseum() {
  $('enter-museum').disabled = true; say('Preparing the 3D room…');
  try {
    if (!window.PortfolioProjects) throw new Error('The project directory script did not load.');
    projects = await PortfolioProjects.load(); renderDirectory();
    three = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    const THREE = three;
    renderer = new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35)); renderer.setSize(stage.clientWidth,stage.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.prepend(renderer.domElement); renderer.domElement.setAttribute('aria-label','3D museum scene. Use the 2D directory button for a non-3D view.');
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x100e0a); scene.fog = new THREE.Fog(0x100e0a,13,25);
    camera = new THREE.PerspectiveCamera(48,stage.clientWidth/stage.clientHeight,.1,60); camera.position.set(0,5,12); camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xe8d7b5,0x17130c,2.1));
    const key = new THREE.PointLight(0xd8bd83,38,22); key.position.set(0,7,0); scene.add(key);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.6,7.6,.25,12),new THREE.MeshStandardMaterial({color:0x191713,metalness:.42,roughness:.58})); floor.position.y=-.18; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6.1,.035,5,72),new THREE.MeshBasicMaterial({color:0x9d7b43})); ring.rotation.x=Math.PI/2; ring.position.y=-.04; scene.add(ring);
    for(let i=0;i<12;i++){const wall=new THREE.Mesh(new THREE.BoxGeometry(.22,4.8,3.8),new THREE.MeshStandardMaterial({color:0x211e18,roughness:.9}));const a=i/12*Math.PI*2;wall.position.set(Math.sin(a)*7.3,2.2,Math.cos(a)*7.3);wall.rotation.y=-a;scene.add(wall);}
    projects.forEach((project,index)=>makeExhibit(THREE,project,index));
    stage.hidden=false; intro.hidden=true; fallback.hidden=true; say('Museum ready. Drag to look around, select an exhibit, or switch to 2D at any time.');
    const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
    renderer.domElement.addEventListener('click',(event)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(exhibits,true)[0];if(hit?.object.userData.project)openProject(hit.object.userData.project);});
    renderer.domElement.addEventListener('pointerdown',(event)=>{pointerDown=true;lastX=event.clientX;lastY=event.clientY;});
    window.addEventListener('pointerup',()=>{pointerDown=false;},{passive:true});
    window.addEventListener('pointermove',(event)=>{if(!pointerDown||stage.hidden)return;targetRotation+=(event.clientX-lastX)*.004;targetTilt=Math.max(-.16,Math.min(.32,targetTilt+(event.clientY-lastY)*.0015));lastX=event.clientX;lastY=event.clientY;},{passive:true});
    renderer.domElement.addEventListener('wheel',(event)=>{cameraDistance=Math.max(9,Math.min(17,cameraDistance+event.deltaY*.008));},{passive:true});
    const resize=()=>{if(!renderer||stage.hidden)return;camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();renderer.setSize(stage.clientWidth,stage.clientHeight);};
    window.addEventListener('resize',resize,{passive:true});
    const render=()=>{if(!renderer)return;camera.position.set(Math.sin(targetRotation)*cameraDistance,4.8+targetTilt*5,Math.cos(targetRotation)*cameraDistance);camera.lookAt(0,.35,0);renderer.render(scene,camera);animationFrame=requestAnimationFrame(render);};
    if(reducedMotion){renderer.render(scene,camera);}else render();
  } catch(error) { console.error(error); showDirectory('3D mode is unavailable right now. The complete 2D project directory is ready below.'); }
  finally { $('enter-museum').disabled=false; }
}
$('enter-museum').addEventListener('click',enterMuseum);
$('open-directory').addEventListener('click',async()=>{try{projects=await PortfolioProjects.load();renderDirectory();showDirectory();}catch(error){say('Project data could not be loaded. Please use the Projects page.');}});
$('museum-directory').addEventListener('click',()=>showDirectory('3D skipped. You are viewing all projects in 2D.'));
$('museum-home').addEventListener('click',()=>{panel.hidden=true;cameraDistance=12;targetRotation=0;targetTilt=0;say('Back in the central lobby.');});
$('close-panel').addEventListener('click',()=>{panel.hidden=true;});
document.addEventListener('keydown',(event)=>{if(event.key==='Escape')panel.hidden=true;});
if(!window.PortfolioProjects) say('Loading project directory…');
