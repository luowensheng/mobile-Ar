import * as tf from "@tensorflow/tfjs";
tf.setBackend('cpu');

const ewidth = 224;
const eheight = 224;

export async function loadModel(path="./models/fastdepth_opset9/model.json"){
    const model = await tf.loadGraphModel(path);
    return model;
}  

export function predict(){
  const start = Date.now();
  const image = tf.browser.fromPixels(canvas)
                  .resizeBilinear([ewidth, eheight])
                  .reshape([ 3, ewidth, eheight])
                  .expandDims(0);
  if (read){
    read = false;
    model.then((fastdepth)=>{
    const output = fastdepth.predict(image)
                  .squeeze()
                  .reshape([ewidth, eheight, 1])
                  .resizeBilinear([width, height]);

    const elapsed = getElapsed(start);  
    createElementWithContent("p", "Processing time: "+ elapsed.toString() +" seconds");

    //output.print()
    const bigMess = tf.randomUniform([width, height, 3]);
    tf.browser.toPixels(bigMess, canvas); 

    image.dispose();
    output.dispose();
    })
  }
}


