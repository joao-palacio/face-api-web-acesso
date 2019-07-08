
const video = document.getElementById('video');
var bottom = document.getElementById('boxCamera');
var borda = document.getElementById('borda');

//var lbStatus = document.getElementById('lbStatus');

const CENTER_FACE = "Centralize o rosto"
const PULL_FACE = "Aproxime o rosto"
const PUSH_FACE = "Afaste o rosto"

const screenWidth = screen.width;
const screenHeight = screen.height;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {

  if(detectar_mobile) {

  }else{
    
  }

  navigator.getUserMedia(
    {
      video: {
        width: { min: 480, ideal: 720, max: 1080 },
        height: { min: 640, ideal: 1280, max: 1920 },
        advanced: [
          { width: 1280, height: 1920 },
          { aspectRatio: 9 / 16 }
        ], facingMode: 'user'
      }
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


//video.setAttribute("style", "-webkit-transform: scaleX(-1);  transform: scaleX(-1);");

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)

  const displaySize = { width: screenWidth, height: screenHeight }

  var image = new Image();

  var countSuccess = 0;
  var countNoFace = 0;

  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {

    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()

    if (countNoFace > 5) {
      showNeutral();
    }

    if (typeof detections == 'undefined') {
      countNoFace++;
    } else {

      countNoFace = 0;

      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      // const results = resizedDetections.map(d => faceMather.findBestMatch (d.descriptor));
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, { lineWidth: 4, color: 'red' });

      image.src = canvas.toDataURL();

      const landmarks1 = await faceapi.detectFaceLandmarks(image);

      if (landmarks1._positions.length > 0) {

        var lEyeX = landmarks1.getLeftEye()[0]._x;
        var lEyeY = landmarks1.getLeftEye()[0]._y;

        var rEyeX = landmarks1.getRightEye()[5]._x;
        var rEyeY = landmarks1.getRightEye()[0]._y;

        // JawOutline 
         var jX_min = landmarks1.getJawOutline()[0];
         var jX_max = landmarks1.getJawOutline()[landmarks1.getJawOutline().length - 1]._x;

        var boxSideLeft = detections.detection.box.left;
        var boxSideRight = detections.detection.box.right;
        var boxSideTop = detections.detection.box.top;
        var boxWidth = detections.detection.box.width;

        // console.log(detections.detection.box.top);
        // console.log(boxWidth);

        // console.log(landmarks1.getJawOutline());
        //console.log(jX_min);
        // console.log(jX_max);

        //var diff_between_eyes = rEyeX - lEyeX;
        // console.log("diff_between_eyes " + diff_between_eyes);

        // Verifico a distância do rosto
       /* if (boxWidth < ((screenWidth/5) * 3)) {
          showError(PULL_FACE)
          return;
        }*/


        console.log("boxW: " + (boxWidth /2 ) + "3/5: " + ((screenWidth/5) * 3));
        if ((boxWidth/2) > ((screenWidth/5) * 3)) {
          showError(PUSH_FACE)
          return;
        } 

        console.log(boxWidth);
        // Verifico a centralização horizontal da face a partir do eixo x. left: 1/5 right: 2/5  
        if (boxSideLeft < (screenWidth / 5) || boxSideLeft > ((screenWidth / 5) * 2)) {
          showError(CENTER_FACE)
          return;
        }

        // Verifico a centralização vertical da face a partir do eixo x. left: 1/4 right: 3/4 
        if (boxSideTop < (screenHeight / 4) || boxSideTop > ((screenHeight / 4) * 3)) {
          showError(CENTER_FACE)
          return;
        } 

        countSuccess++;
        if (countSuccess > 3) {
          showSuccess()
        }

      }
    }


  }, 50)


})

function showNeutral() {
  countSuccess = 0;
  borda.style.borderColor = 'gray';
  lbStatus.innerText = 'Não identificamos uma face';
}

function showError(message) {
  countSuccess = 0;
  borda.style.borderColor = 'red';
  lbStatus.innerText = message;
}

function showSuccess() {
  borda.style.borderColor = 'blue';
  lbStatus.innerText = '';
}

function detectar_mobile() {
  if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
  ) {
      return true;
  }
  else {
      return false;
  }
}