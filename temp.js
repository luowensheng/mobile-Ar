import './style.css'

import * as tf from "@tensorflow/tfjs"
import * as THREE from "three"
import * as cocoSsd  from '@tensorflow-models/coco-ssd';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

document.addEventListener("DOMContentLoaded", ()=>{

 // initialize();
 test();
 

})
 


var clock = new THREE.Clock();
function render(){

  delta = clock.getDelta();
  object.position.z += speed * delta;

  renderer.render(scene, camera);
}


const p = document.createElement("p");
p.textContent = "document";
document.body.appendChild(p);

function test() {
  var previousOrientation = window.orientation;

  const p = document.createElement("p");
  p.textContent = "Hello World " + previousOrientation;
  document.body.appendChild(p);

  const loop = () => {
    const d = Date.now();
    p.textContent = d.toString() + "  " + window.orientation;
    requestAnimationFrame(loop);
  };

  loop();

  const checkOrientation = () => {
    if (window.orientation != previousOrientation) {
      console.log(window.orientation);
      previousOrientation = window.orientation;
      const el = document.createElement("p");
      el.textContent = "star " + previousOrientation.toString();
      document.body.appendChild(el);
    }
  };

  window.addEventListener("orientationchange", checkOrientation);
  window.addEventListener("click", checkOrientation);

  document.body.addEventListener("click", checkOrientation);
  document.body.addEventListener("touchstart", checkOrientation);
  document.body.addEventListener("touchmove", checkOrientation);
  document.body.addEventListener("touchend", checkOrientation);
}

async function initialize() {
const get_camera = (degree = 75, 
                    aspect_ratio = window.innerWidth/window.innerHeight, 
                    clipping_plane_near = 0.1,
                    clipping_plane_far = 1000 )=>{
      return new THREE.PerspectiveCamera(degree, aspect_ratio, clipping_plane_near, clipping_plane_far)
}

const CreateMesh = ({objGeometry, objMaterial})=>{
  return new THREE.Mesh(objGeometry, objMaterial);
}

var initCam = (video) =>{
  if (navigator.mediaDevices.getUserMedia){
  navigator.mediaDevices.getUserMedia({video: true})
  .then(stream=>{
      video.srcObject = stream;
      video.play()
      console.log("webcam is on")
      })
      .catch(error=>{
          console.log("Something went wrong!", error)
      });
      }
}
  /////////////////////////////////////////////////////////////////////


  var model = await cocoSsd.load();

  ////////////////////////////////////////////////////////////////////////
  var canvas = document.createElement("canvas");
  var video = document.createElement("video");
  const width = 300;
  const height = 150;
  init_cam();

  const scene = new THREE.Scene();
  const camera = get_camera();
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);


  // Add Meshes
  const box = CreateMesh({
    objGeometry: new THREE.BoxGeometry(1, 1, 1),
    objMaterial: new THREE.MeshBasicMaterial({
      color: 0x00FF00
    }),
  });
  scene.add(box);
  console.log("has box");


  // Add lightSource
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.target = box;
  light.position.set(0, 0, 1);
  scene.add(light);
  console.log("has Light");

  var videoTexture = new THREE.Texture(canvas);
  // videoTexture.minFilter = THREE.LinearFilter;
  // videoTexture.magFilter = THREE.LinearFilter;
  // var videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture, 
  // side:THREE.DoubleSide})
  // var vm = new THREE.Mesh(videoTexture, videoMaterial);
  // scene.add(vm)
  scene.background = videoTexture;
  scene.background.needsUpdate = true;

  const drawRect = (detections, ctx) => {
    var x1, y1, w1, h1;
    detections.forEach(prediction => {
      //const [x,y, w,h] = prediction['bbox'];
      const [x, y, w, h] = prediction['bbox'];
      const text = prediction['class'];
      if (text === "cell phone") {
        [x1, y1, w1, h1] = [x, y, w, h];
      }

      const color = "green";
      ctx.strokeStyle = color;
      ctx.font = "18px Arial";
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.fillText(text, x, y);
      ctx.rect(x, y, w, h);
      ctx.stroke();
    });
    return [x1, y1, w1, h1];
  };
  const updateCanvas = async () => {
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const detections = await model.detect(canvas);
    return drawRect(detections, ctx);
  };

  var x1, y1, w1, h1;
  var has = false;

  var N = 0;
  box.name = "box";
  // Animate
  const animate = async () => {
    requestAnimationFrame(animate);
    N++;
    const s = 10;
    // plane.rotation.z -= 0.001
    // controls.update() 
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    box.rotation.z += 0.01;
    light.rotation.z += 0.01;

    const [x, y, w, h] = await updateCanvas();
    if (x != null) {
      if (!has) {
        [x1, y1, w1, h1] = [x, y, w, h];
        has = true;
      }
      const a1 = x1 * y1;
      const a2 = x * y;
      const scale = (a1 - a2) / a1;
      // console.log(a1);
      // console.log(`(${x},${y}) => ${a2} and ${scale}`);
      box.position.z += scale * 0.01;

      const nx = (s * (x / width)) - s / 2;
      const ny = (s * (y / height)) - s / 2;
      box.position.x = nx;
      box.position.y = -1 * ny;
      if (N == 100) {
        scene.remove(box.name);
      }
    }
   // console.log(`${N + 1}. box name = ${box.name}`);
    //console.log(box.position)
    //   box.position.x += 0.1 ;
    //   box.position.y += 0.1;
    // console.log(box.position)
    videoTexture.needsUpdate = true;
    renderer.render(scene, camera);

  };

  // const currentSession = await startWebXR(renderer);
  // console.log(currentSession)
  // const arbutton = document.createElement("button");
  // document.body.appendChild(arbutton)
  // arbutton.textContent = "Click";
  // arbutton.addEventListener("click", async()=>{
  //   if (currentSession === undefined){
  //     console.log(currentSession)
  //     return;
  //   }
  //   if (currentSession){
  //     end(renderer.domElement, currentSession, renderer)
  //   } else {
  //    await initialize();
  //   }
  // })
  animate();

  return; // { video, camera, renderer };
}

function startWebXR(renderer) {
   let currentSession = null;
   const start = async()=>{
     currentSession = await navigator.xr.requestSession("immersive-ar");
     renderer.xr.enabled = true;
     renderer.xr.setSession(currentSession);
     return currentSession;
   }
}

async function end (element, currentSession, renderer) {
  document.body.removeChild(element)
  currentSession.end();
  renderer.clear();
  renderer.setAnimationLoop(null);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render();

}

