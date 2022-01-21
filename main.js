 import * as THREE from "three";
 import * as dat from 'dat.gui';
//  import * as THREEx from 'threejsx'
 //import {ModelAnimationObject} from 'threejsx'
 import {initSensors} from "./sensors";
//import {loadModel, predict} from "./model-utils";
import {initCam, onWindowResize} from "./utils";
import {getCamera, getControls, createMesh, ThreeEvents, load3DModel} from "./world";


const gui = new dat.GUI();
gui.add({item:"item"}, "Models", {item1:"item1", item2:"item2", })
gui.windows = [];

const width = innerWidth;
const height = innerHeight;
const path = "./img.png";

const paths = [  'black_leather_chair.gltf', 'Books_Magazines.gltf', 
                 'Broken Container.gltf', 'Cappuccino_cup.glb', 
                 'Dream AP2.glb', 'free_car_001.gltf', 'HepBurn_Sofa.glb', 
                 'lesson1.glb', 'PEACE_LILLY_5K.gltf', 'SHOE_CABINET.gltf', 
                 'TREE_STUMP_CARVED_5K.gltf', 'WHISKEY_GLTF.gltf', 'WoodHouse.glb'];

const mpath = paths[Math.floor(Math.random()*paths.length)];               
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
    

      let absolute, alpha, beta , gamma;
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
        //const domEvents = new THREEx.DomEvents(camera, renderer.domElement); 
        // load3DModel("./objects/" + mpath, group);

        const clickEvents = new ThreeEvents(scene, camera, renderer);

        clickEvents.RegisterObject("background", ()=>{
          // alert(`Clicked background`);

          // gui.windows.forEach((folder)=> gui.removeFolder(folder));
        });

        const postProcess = (object, scale=5)=>{
            object.position.set(0, 0, -15);
            const box = new THREE.Box3().setFromObject(object);
            object.scale.set(1 / (box.max.x / scale), 1 / (box.max.y / scale), 1 / (box.max.z / scale));
            object.rotation.x = 90 * Math.PI / 180;
        }

        load3DModel("./objects/"+mpath, (model)=>{

          postProcess(model);
          model.mname = getName(mpath);
          group.add(model);
          model.userData.clickable = true;
          
          const box = createMesh({
            objGeometry: new THREE.BoxGeometry(1, 1, 1),
            objMaterial: new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path)}),
          });           

          group.add(box);
          
          clickEvents.RegisterObject(model.mname, ()=>{
            // alert(`Clicked ${model.mname} `);
            console.log(`${model.mname} ${model}`);
            haveFun(model);
            
            // model.material.color.set( Math.random() * 0xffffff );

             
          });
          
         // haveFun(model);

          document.addEventListener("click", clickEvents.Tick());
          // document.addEventListener("touchend", clickEvents.Tick());
          document.addEventListener("touchstart", clickEvents.Tick());


          console.log("added click action for ", model);
          console.log("children: ", group.children);

      
          
        }, "gltf");

        // Add lightSource
        const light = new THREE.DirectionalLight(0xffffff, 5);
        light.target = group;//box;
        light.position.set(0, 0, 10);
        scene.add(light);

        scene.background = new THREE.Texture(canvas);
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
  
  window.addEventListener( 'resize', ()=>{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

})


  window.addEventListener("deviceorientation", (event)=>{
    
      absolute = event.absolute;
      alpha = event.alpha;
      beta  = event.beta;
      gamma = event.gamma;

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


function getName(name){
  return name.split(".")[0].split("_").join(" ");
}

function haveFun(object){

  const name = object.mname || `object ${object.uuid}` || "object";

  // const guiContainer = document.createElement("div");
  // guiContainer.id = name;
  // guiContainer.appendChild(gui.domElement);
  // document.body.appendChild(guiContainer);

  
  var objectInfo = gui.addFolder(name);

  var position = objectInfo.addFolder("position");
  var rotation = objectInfo.addFolder("rotation");
  var scale = objectInfo.addFolder("scale");

  position.add(object.position, 'x', -10, 10);
  position.add(object.position, 'y', -10, 10);
  position.add(object.position, 'z', -10, 10);

  rotation.add(object.rotation, 'x', -90, 90);
  rotation.add(object.rotation, 'y', -90, 90);
  rotation.add(object.rotation, 'z', -90, 90);

  scale.add(object.scale, 'x', 0, 10);
  scale.add(object.scale, 'y', 0, 10);
  scale.add(object.scale, 'z', 0, 10);
  
  objectInfo.open();
  position.open();
  rotation.open();
  scale.open();
  gui.windows.push(objectInfo);
  

}


  //   function buttonFunction() {
  //         //do button 
  //         //stuff here.
  //         folder.remove(xf);
  //         folder.remove(yf);
  //         folder.remove(zf);
  //     }
      
  //     var params = {
  //         ClickMe: buttonFunction
  //     };
  // var folder2 = gui.addFolder('Folder');
  // folder2.add(params, "ClickMe");
  // folder2.open();



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
