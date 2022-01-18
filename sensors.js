

async function initSuccess(sensor){
    let result = await navigator.permissions.query({ name: sensor });
    return result==="granted";

}

//export function initSensors(task=(s)=>()=>{}, options={frequency: 60, referenceFrame: 'device'}, sensors=["accelerometer", "magnetometer", "gyroscope"]){
export function initSensors( sensors=["accelerometer", "magnetometer", "gyroscope"], options={frequency: 60, referenceFrame: 'device'}){
    
    const sensor = new AbsoluteOrientationSensor(options);
    let granted = true;
    sensors.forEach((s)=>{
        if (!initSuccess(s))
            requestPermission(s);
            if (!initSuccess(s)){
                alert("No permissions to use AbsoluteOrientationSensor.");
                granted = false;
                // return;
            }
        });
    if(!granted) {
        alert("No permissions to use AbsoluteOrientationSensor.");
        return;
    };

    sensor.start();   
    
   return sensor;

} 


function requestPermission(sensorName){
    navigator.permissions.query({ name: sensorName })
    .then(result => {
      if (result.state === 'denied') {
        alert('Permission to use ' + sensorName + ' sensor is denied.');
        
      } else {
        alert('Permission to use ' + sensorName + ' sensor is accepted with '+ result.state);
  
      }
      // Use the sensor.
    });
}


         // sensor.addEventListener('onchange', () => {
      //   // model is a Three.js object instantiated elsewhere.
      //  // model.quaternion.fromArray(sensor.quaternion).inverse();
      //  createElementWithContent("li", 'onchange '+ sensor.toString());
  
      // });
   
// function acc(){

//     try {
//         accelerometer = new Accelerometer({ referenceFrame: 'device' });
//         console.log(`acc: ${accelerometer}`)
//         accelerometer.addEventListener('error', event => {
//             // Handle runtime errors.
//             if (event.error.name === 'NotAllowedError') {
//                 // Branch to code for requesting permission.
//                 alert('NotAllowedError');
    
//             } else if (event.error.name === 'NotReadableError' ) {
//                 alert('Cannot connect to the sensor.');
//                 console.log(event.error)
//             }
//         });
//         const read = ()=>{
//             //reloadOnShake(accelerometer)
//             //alert(`acc: ${accelerometer}`)
//             createElementWithContent("li", `acc: ${accelerometer}`);
//         }
//         accelerometer.addEventListener('reading', read);
//         // addEventListener('', read);
//         accelerometer.start();
//     } catch (error) {
//         // Handle construction errors.
//         if (error.name === 'SecurityError') {
//             // See the note above about feature policy.
//             console.log('Sensor construction was blocked by a feature policy.');
//         } else if (error.name === 'ReferenceError') {
//             console.log('Sensor is not supported by the User Agent.');
//         } else {
//             throw error;
//         }
//     }
//     }

// window.addEventListener("deviceorientation", (event)=>{ //deviceorientation
//     createElementWithContent("li", `deviceorientation=> beta: ${event.alpha} -> gamma: ${event.gamma} -> beta: ${event.beta}`);
//   });
  