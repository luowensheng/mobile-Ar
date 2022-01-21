import * as THREE from "three";
import { THREEGLTFLoader } from 'three-loaders';
import { OrbitControls } from 'three-controls';

const Loader = {
  "gltf":loadGLTF
}

function MouseScreenPosition(e, startPoint, endPoint) {

  const convert = (p, axis)=>(p - startPoint[axis])/(endPoint[axis]-startPoint[axis]);

  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;

  const mouseX = convert(clientX, "x") * 2 - 1;
  const mouseY = -1*(convert(clientY, "y")  * 2 - 1);
  
  return new THREE.Vector2(mouseX, mouseY);
}

function getPosition(renderer){
  
  const {left:x1, right:x2, top:y1, bottom:y2} = renderer.domElement.getBoundingClientRect();

  const startPoint = {x:x1, y:y1};
  const endPoint = {x:x2, y:y2};

  return [startPoint, endPoint];
}

export class ThreeEvents {

  constructor(scene, camera, renderer){

    this.map = new Map();

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

  }

  Tick(){
    
    const map = this.map;
    const camera = this.camera;
    const scene = this.scene;
    const renderer = this.renderer;

  return (event)=> {

    const [startPoint, endPoint] = getPosition(renderer);

    // console.log("TICK  startPoint: ", startPoint, " endPoint: ", endPoint);
 
    const mouse = MouseScreenPosition(event, startPoint, endPoint);
    // console.log("TICK  mouse: ", mouse);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length>0){
      let object = intersects[0].object;

      while (object.parent && !object.userData.clickable){
        object = object.parent;
      }
      if (object.userData.clickable){
        if (object === object){
          let objectName = object.mname;
          // alert(`SuCCess ClickeD!! ${objectName}`);
            
          if (map.has(objectName)){
            map.get(objectName)();
            return;
          }
                
        }
      }
    } 

    map.get("background")(); 
    
  }
}

  RegisterObject(objectName, func=()=>{}){
    this.map.set(objectName, func);
  }

  UnregisterObject(objectName){
    this.map.delete(objectName); 
  }
}



export function getControls(camera, domElement){
    const controls = new OrbitControls( camera, domElement );
    return controls;
  }

  // "dat.gui": "^0.7.7",
  // "three": "^0.136.0",
  // "three-controls": "^1.0.1",
  // "three-events": "^1.0.1",
  // "three-loaders": "^1.0.9",
  // "threejsx": "0.0.33"

export function getBox(path=null){
    // Add Meshes
    const box = createMesh({
      objGeometry: new THREE.BoxGeometry(1, 1, 1),
      objMaterial: new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path)}),
      //objMaterial: new THREE.MeshBasicMaterial({map: new THREE.VideoTexture(video)}),
      //objMaterial: new THREE.MeshBasicMaterial({color: 0x00FF00}),
    });

  // plane = createMesh({objGeometry: new THREE.PlaneGeometry(1, 1),
  //               objMaterial: new THREE.MeshBasicMaterial({map: new THREE.VideoTexture(video)}) });

  box.rotation.x = 90 * Math.PI / 180 ;
return box;
}


export async function load3DModel(path, then, ext="gltf"){
  
  //alert(`path: ${path}`);
  
  try{
    //loadGLTF(path, acquire);
    Loader[ext](path, then)
  } catch {
    alert(`failed loading model of extenstion .${ext}`);
  }
  
}

  function loadGLTF(path, then) {

  let loader = new THREEGLTFLoader();
  loader.load(path, (gltf) => {
      then(gltf.scene);
    },
      (xhr) => {
        //  console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
      },
      (error) => {
        alert(`loadGLTF error loading ${path}: ${error}`);
        console.log(`loadGLTF error loading ${path}: ${error}`);

      }
    );
  
  }


export function initWorld(canvasEl, video){
  
    const scene = new THREE.Scene();
    const camera = getCamera();
    camera.position.z = 5;
    console.log((canvasEl, video));
    const renderer = new THREE.WebGLRenderer(); document.body.appendChild(renderer.domElement); //{canvas: canvasEl});
     
    // const renderer = new THREE.WebGLRenderer({canvas: canvasEl});
    // const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true }); 
    // renderer = new THREE.WebGLRenderer( { canvas: canvasElm } );
    // new THREE.WebGLRenderer();
    // const renderer = (canvasEl!=null)? new THREE.WebGLRenderer({canvas: canvasEl}): new THREE.WebGLRenderer();

    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio);  
    // const c = document.createElement("canvas");
    renderer.setSize(canvasEl.width, canvasEl.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.setPixelRatio(window.devicePixelRatio);

    // Add Meshes
    // const box = createMesh({
    //               objGeometry: new THREE.BoxGeometry(1, 1, 1),
    //               objMaterial: new THREE.MeshBasicMaterial({color: 0x00FF00}),
    //             });
   const box = createMesh({
                  objGeometry: new THREE.PlaneGeometry(1, 1),
                  objMaterial: new THREE.MeshBasicMaterial({map: new THREE.VideoTexture(video)}),
                });
    scene.add(box);
  
  
    // Add lightSource
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.target = box;
    light.position.set(0, 0, 1);
    scene.add(light);
    
    if (video!=null){
      scene.background = new THREE.Texture(video);
      scene.background.needsUpdate = true;      
    }

    return {scene, camera, renderer, box};
}

export function getCamera(degree = 75, 
                        aspect_ratio = window.innerWidth/window.innerHeight, 
                        clipping_plane_near = 0.1,
                        clipping_plane_far = 1000 ){

    return new THREE.PerspectiveCamera(degree, aspect_ratio, clipping_plane_near, clipping_plane_far);
}


export function createMesh ({objGeometry, objMaterial}){
    return new THREE.Mesh(objGeometry, objMaterial);
}