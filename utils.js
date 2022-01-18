//import * as fs from "fs";
//import { readdirSync } from 'fs';
//import * as fs from 'fs';

export function getFilesFromFolder(folder){

    const files = readdirSync(folder);
    return files
}

export function createElementWithContent(tag, content){
    const el = document.createElement(tag);
    el.textContent = content;
    document.body.appendChild(el);
}


export function readLocal(file){
    const fileReader = new FileReader();
    
    fileReader.addEventListener("load", function () {
      img.src = fileReader.result;
    }, false);
    
    fileReader.readAsDataURL(file);
}

export function getElapsed(start){
    const elapsed = Math.floor((Date.now()-start)/1000);
    return elapsed;
}

export function initCam(video) {
   // const video = document.createElement("video");
   if (navigator.mediaDevices.getUserMedia){
   navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}})
            .then(stream=>{
                video.srcObject = stream;
                video.play();
                console.log("webcam is on");
                })
            .catch(error=>{
                    console.log("Something went wrong!", error);
                });
       }
}

export function onWindowResize(camera) {
    // camera.aspect = window.innerWidth / window.innerHeight
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.render();
}
  