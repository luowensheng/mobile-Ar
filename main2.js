import * as THREE from "three";

import {initSensors} from "./sensors";
//import {loadModel, predict} from "./model-utils";
import {createElementWithContent, readLocal, getElapsed, initCam, onWindowResize} from "./utils";
import {getCamera, createMesh} from "./world";

const width = innerWidth;
const height = innerHeight;
const path = "./img.png";
// const path = "./public/img.png";




window.addEventListener("DOMContentLoaded", ()=>{
      
      var scene, camera, renderer, worldQuaternion,plane; //, canvas;
      var X,Y,Z;

      const group = new THREE.Group();
      const clock = new THREE.Clock();

      const canvas = document.createElement("canvas"); 
      const video = document.createElement("video"); 
      // const video = createAndAdd2DOM("video");

      let absolute, alpha, beta , gamma;
      let model = null; // loadModel(modelPath);

      const sensor = initSensors();

      console.log(sensor);
      sensor.addEventListener('reading', ()=>{
          group.quaternion.fromArray(sensor.quaternion).invert();
      });


      initCam(video);

      initWorld();
      
      update();

      function update (){

        //camera.quaternion = worldQuaternion;
        //createElementWithContent("li", "update: "+sensor.quaternion);

       // box.rotation.x += 0.01;
       // scene.background.needsUpdate = true; 
        // console.log(worlQuaternion)
        renderer.render(scene, camera);
        updateCanvas();
        requestAnimationFrame(update);
      
      };

      function initWorld(){
  
        scene = new THREE.Scene();
        const axesHelper = new THREE.AxesHelper( 5 );
        group.add( axesHelper );
        camera = getCamera();
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio); 

        renderer.setSize(width, height);
       // renderer.setPixelRatio(window.devicePixelRatio);
    
        // Add Meshes
        const box = createMesh({
                      objGeometry: new THREE.BoxGeometry(1, 1, 1),
                      //objMaterial: new THREE.MeshBasicMaterial({map: new THREE.VideoTexture(video)}),
                      objMaterial: new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path)}),
                      //objMaterial: new THREE.MeshBasicMaterial({color: 0x00FF00}),
                    });
        // plane = createMesh({
        //               objGeometry: new THREE.PlaneGeometry(1, 1),
        //               objMaterial: new THREE.MeshBasicMaterial({map: new THREE.VideoTexture(video)}),
        //             });
        box.rotation.x = 90 * Math.PI / 180 ;
        group.add(box);
      
      
        // Add lightSource
        const light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.target = box;
        light.position.set(0, 0, 1);
        scene.add(light);

        // scene.background = new THREE.Texture(canvas);
        // scene.background.minFilter = THREE.LinearFilter;
        // scene.background.magFilter = THREE.LinearFilter;

        canvas.style.position = "absolute";
        canvas.style.width = renderer.domElement.width;
        canvas.style.height = renderer.domElement.height;
        renderer.domElement.style.position = "absolute";
        scene.add(group); 

        document.body.appendChild(renderer.domElement); 
        document.body.appendChild(canvas); 


    
    }

    function updateCanvas(){
      var ctx = canvas.getContext("2d"); 
      const text = `<${Math.floor(X)}, ${Math.floor(Y)}, ${Math.floor(Z)}>`;
      let x = 20;
      let y = 20;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (absolute==null) return;
      drawRect(ctx, x-5, y-15, 60, 55);
      drawText(ctx, text, x, y-5);
      drawText(ctx, `absolute: ${Math.floor(absolute)}`, x, y+5);
      drawText(ctx, `alpha: ${Math.floor(alpha)}`, x, y+15);
      drawText(ctx, `beta: ${Math.floor(beta)}`, x, y+25);
      drawText(ctx, `gamma: ${Math.floor(gamma)}`, x, y+35);

    }


  window.addEventListener('devicemotion', (event)=>{

    const t = clock.getDelta();  
    // let px = getPosition(event.acceleration.x, t);// + ' m/s2'
    // let py = getPosition(event.acceleration.y, t);// + ' m/s2'
    // let pz = getPosition(event.acceleration.z, t);// + ' m/s2'
    let dp = -0.01;
    let limit = 1.;

    let px = getDisplacement(event.acceleration.x, limit, dp);// + ' m/s2'
    let py = getDisplacement(event.acceleration.y, limit, dp);// + ' m/s2'
    let pz = getDisplacement(event.acceleration.z, limit, dp);// + ' m/s2'

    // if (Math.abs(px) > limit) 
      group.position.x += px;

    // if (Math.abs(py) > limit) 
      group.position.y += py; 

    // if (Math.abs(pz) > limit) 
      group.position.z += pz; 

    X = px;
    Y = py;
    Z = pz;

    //group.position.z -= 0.01;

   createElementWithContent("li", `posx:${px} _ posy:${py} _ posz:${pz}` );
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
    const p = (Math.abs(acc) > limit)? Math.sign(acc)*(Math.floor(acc)/limit)*dp: 0; 
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
