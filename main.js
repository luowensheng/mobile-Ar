 import * as THREE from "three";

import {initSensors} from "./sensors";
//import {loadModel, predict} from "./model-utils";
import {getFilesFromFolder, readLocal, getElapsed, initCam, onWindowResize} from "./utils";
import {getCamera, getControls, load3DModel} from "./world";

const btn = document.createElement("button");
btn.textContent = "CLICK!"
btn.addEventListener("click", (ev)=>{
  alert("clicked");
})


const width = innerWidth;
const height = innerHeight;
const path = "./img.png";

const paths = ['black_leather_chair.gltf', 'Books_Magazines.gltf', 
                 'Broken Container.gltf', 'Cappuccino_cup.glb', 
                 'Dream AP2.glb', 'free_car_001.gltf', 'HepBurn_Sofa.glb', 
                 'lesson1.glb', 'PEACE_LILLY_5K.gltf', 'SHOE_CABINET.gltf', 
                 'TREE_STUMP_CARVED_5K.gltf', 'WHISKEY_GLTF.gltf', 'WoodHouse.glb'];

const mpath = paths[Math.floor(Math.random()*paths.length)]               
//alert(getFilesFromFolder("./objects"))

window.addEventListener("DOMContentLoaded", ()=>{
      
      var scene, camera, renderer; //, worldQuaternion,plane; //, canvas;
      var X,Y,Z;

      const group = new THREE.Group();
      const clock = new THREE.Clock();

      const canvas = document.createElement("canvas"); 
      const video = document.createElement("video");
      video.width = width; 
      video.height = height; 

      let absolute; //, alpha, beta , gamma;
      //let model = null; // loadModel(modelPath);

      const sensor = initSensors();

      //console.log(sensor);
      sensor.addEventListener('reading', ()=>{
          group.quaternion.fromArray(sensor.quaternion).invert();
      });


      initCam(video);

      initWorld();

      const controls = getControls(camera, renderer.domElement); 
      
      update();

      function update (){

        controls.update();
        scene.background.needsUpdate = true; 
        renderer.render(scene, camera);
        updateCanvas();
        requestAnimationFrame(update);
      
      };

      function initWorld(){
  
        scene = new THREE.Scene();
        const axesHelper = new THREE.AxesHelper(50);
        group.add(axesHelper);

        camera = getCamera();
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(width, height);
        //renderer.setPixelRatio(window.devicePixelRatio); 
        document.body.appendChild(renderer.domElement); 
      //  renderer.domElement.appendChild(btn); 

        document.body.appendChild(btn);

        renderer.setSize(width, height);
    
        //const box = getBox(path); group.add(box);
        load3DModel("./objects/" + mpath, group);
        //
      
        // Add lightSource
        const light = new THREE.DirectionalLight(0xffffff, 50);
        light.target = group;//box;
        light.position.set(0, 0, 10);
        scene.add(light);

        scene.background = new THREE.Texture(canvas);
        // scene.background.minFilter = THREE.LinearFilter;
        // scene.background.magFilter = THREE.LinearFilter;

        scene.add(group); 
    
    
    }

    function updateCanvas(){
      var ctx = canvas.getContext("2d"); 
      const text = `<${Math.floor(X)}, ${Math.floor(Y)}, ${Math.floor(Z)}>`;
      let x = 20;
      let y = 20;

      const str = (x)=>{
        return (x>0)? "true": (x==0)?"👌":"false";
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (absolute==null) return;
      drawRect(ctx, x-5, y-15, 50, 55);
      drawText(ctx, text, x, y-5);

      // drawText(ctx, `X: ${Math.sign(X)}`, x, y+5);
      // drawText(ctx, `Y: ${Math.sign(Y)}`, x, y+15);
      // drawText(ctx, `Z: ${Math.sign(Z)}`, x, y+25);

      drawText(ctx, `X: ${str(Math.sign(X))}`, x, y+5);
      drawText(ctx, `Y: ${str(Math.sign(Y))}`, x, y+15);
      drawText(ctx, `Z: ${str(Math.sign(Z))}`, x, y+25);


      // drawText(ctx, `absolute: ${Math.floor(absolute)}`, x, y+5);
      // drawText(ctx, `alpha: ${Math.floor(alpha)}`, x, y+15);
      // drawText(ctx, `beta: ${Math.floor(beta)}`, x, y+25);
      // drawText(ctx, `gamma: ${Math.floor(gamma)}`, x, y+35);

    }


  window.addEventListener('devicemotion', (event)=>{

    const t = clock.getDelta();  
    // let px = getPosition(event.acceleration.x, t);// + ' m/s2'
    // let py = getPosition(event.acceleration.y, t);// + ' m/s2'
    // let pz = getPosition(event.acceleration.z, t);// + ' m/s2'
    let dp = -0.01;
    let limit = 0.5;

    let px = getDisplacement(event.acceleration.x, limit, dp);// + ' m/s2'
    let py = getDisplacement(event.acceleration.y, limit+0.2, dp);// + ' m/s2'
    let pz = getDisplacement(event.acceleration.z, limit, dp);// + ' m/s2'
    let dz = 0.02;

    group.position.x += px;
    group.position.y += py; 
    group.position.z += pz; 

    X = px;
    Y = py;
    Z = pz;

    //group.position.z -= 0.01;

  // createElementWithContent("li", `posx:${Math.sign(px)} _ posy:${Math.sign(py)} _ posz:${Math.sign(pz)}` );
   // createElementWithContent("li", `posx:${group.position.x} _ posy:${group.position.y} _ posz:${group.position.z}` );
 // createElementWithContent("li", `accx:${event.acceleration.x} _ accy:${event.acceleration.y} _ accz:${event.acceleration.z}` );
  });
  
  window.addEventListener("deviceorientation", (event)=>{
    
      absolute = event.absolute;
      alpha    = event.alpha;
      beta     = event.beta;
      gamma    = event.gamma;

    //  createElementWithContent("li", `absolute:${absolute} alpha:${alpha} beta:${beta} gamma:${gamma} `)
    
      // Do stuff with the new orientation data
    
  });
  
  function getDisplacement(acc, limit, dp){
    const p = (Math.abs(acc) > limit)?(Math.floor(acc)/limit)*dp: 0; 
    return p;
  }


  function drawText(ctx, text, x, y, color = "white"){
      
      ctx.strokeStyle = color;
      ctx.font = "9px Arial";
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.fillText(text, x, y);
      //ctx.rect(x, y, w, h)
      ctx.stroke();
  }
    window.addEventListener("resize", onWindowResize);
})




function getPosition(acc, t){
  return (0.5*(acc*Math.pow(t, 2)))*10000;
}

function createAndAdd2DOM(tag, id=null){
  const element = document.createElement(tag);
  element.width = width;
  element.height = height;
  element.id = id || tag;

  document.body.appendChild(element);
  console.log(`created element (${tag})`);
  console.log(element);
  return element;
}




function drawRect(ctx, x, y, w, h, color="blue"){
  ctx.strokeStyle = color;
  ctx.font = "10px Arial";
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx
  ctx.stroke();
}


/////////////////////////////////////////////////////////////////////


// function update() {
   
   
//    if (model != null){
//     // predict();
//    } 

//    requestAnimationFrame(update)
//   };




// function updateCanvas() {
//     if (video != null){
//       drawRect(video);
//     } else {
//       drawRect(img);
//     }

//    if (model != null){
//     // predict();
//    } 

//    requestAnimationFrame(updateCanvas)
//   };
