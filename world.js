import * as THREE from "three";
import { THREEGLTFLoader } from 'three-loaders';
import { OrbitControls } from 'three-controls';


export function getControls(camera, domElement){
    const controls = new OrbitControls( camera, domElement );
    return controls;
  }

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

export function load3DModel(path, parent){  
  
  alert(`path: ${path}`);

  let loader = new THREEGLTFLoader();
  loader.load(path, (gltf)=>{
      const scene = gltf.scene;
      scene.position.set(0, 0, -10);
      const box = new THREE.Box3().setFromObject( scene );
      //console.log(path, " ", scene);
      scene.scale.set(1/(box.max.x/10), 1/(box.max.y/10), 1/(box.max.z/10));
      scene.rotation.x = 90 * Math.PI / 180 ;
      
       //scene.rotation.y = 90 * Math.PI / 180 ;
      parent.add(scene)
  })
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