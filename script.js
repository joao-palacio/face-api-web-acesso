
const video = document.getElementById('video');
var box = document.getElementById('boxCamera');
var borda = document.getElementById('borda');
var lbCountdown = document.getElementById('lbCountdown');
var imgPreview = document.getElementById('imgPreview');
var icTake = document.getElementById('icTake');
//var lbStatus = document.getElementById('lbStatus');

const CENTER_FACE = "Centralize o rosto"
const PULL_FACE = "Aproxime o rosto"
const PUSH_FACE = "Afaste o rosto"

const screenWidth = screen.width;
const screenHeight = screen.height;

var detectFace = false;

var countdown = 3;
isCountdown = false;
var intervar;

hasCaptured = false;

const isMobile = detectar_mobile();

var countNoFace = 0;
var countSuccess = 0;

if(isMobile) {
  document.body.classList.add("body-mob");
}else{
  document.body.classList.add("body-web");
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
 // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
]).then(startVideo)



function startVideo() {

  icTake.onclick = function () {
    capture();
  };

  var md = new MobileDetect(window.navigator.userAgent);

  
  platform.name;
  platform.version;
  platform.product;
  platform.manufacturer;
  platform.layout;
  platform.os;
  platform.description;

  if (isMobile) {

    mirrorScreen();

    console.log("MOBILE");

   // alert(platform.ua);


    var constraints;

    if (detectIphoneHigLevel(platform.ua)) {

      constraints = {
        video: { width: 1920, height: 1080 }
      };

    } else {
      constraints = {


         video: { width: 1280, height: 780 }

        /*
        video: {
          height: { min: 480, ideal: 720, max: 1080 },
          width: { min: 640, ideal: 1280, max: 1920 },
          advanced: [
            { width: 1920, height: 1280 },
            { aspectRatio: 9 / 16 }
          ], facingMode: { exact: 'user' }
        } */

      };

    }


    navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
      video.srcObject = stream;
    });

  } else {

    console.log("WEB");


    navigator.getUserMedia(
      {
        video: { width: 1080, height: 720 }
      },
      stream => video.srcObject = stream,
      err => console.error(err)
    )

  }

}

function mirrorScreen() {
  video.setAttribute("style", "-webkit-transform: scaleX(-1);  transform: scaleX(-1);");
}


video.addEventListener('play', () => {

  var isAllow = true;

  var timeToInterval = 700;

  if (define_performance(platform.ua)) {
    timeToInterval = 500;
  }

  setInterval(async function () {

    if (isAllow) {

      faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.3 })).then(detection => {

        isAllow = true;
        if (detection) {
          detectFace = true;



          countNoFace = 0;

          var boxSideLeft = detection.box.left;
          var boxSideRight = detection.box.right;
          var boxSideTop = detection.box.y;
          var boxSideBottom = detection.box.bottom;

          var boxWidth = detection.box.width;
          var boxHeight = detection.box.height;

          if (isMobile) {

            // 150 - compensação do espaço da testa, a biblioteca pega do olho pra baixo. 
            bioMobile((boxWidth / 2), boxHeight, boxSideLeft, (boxSideTop - 150));

          } else {

            bioWeb(boxWidth, boxHeight, boxSideLeft, boxSideTop);

          }

          //  countSuccess++;
          // if (countSuccess > 3) {
          // showSuccess()
          // }

        } else {
          detectFace = false;

          countNoFace++;
          if (countNoFace > 3) {
            showNeutral();
          }

        }

      })

    }

    isAllow = false;

  }, timeToInterval);

})

function bioMobile(boxWidth, boxHeight, boxSideLeft, boxSideTop) {

  /*
  var boxSideRight =  (screenWidth - (boxSideLeft +  boxWidth));

  console.log(boxSideRight);
*/

  if (detectIphoneHigLevel(platform.ua)) {

    if ((boxWidth - 200) > ((screenWidth / 5) * 3)) {
      showError(PUSH_FACE)
      return;
    }
  } else {

    if ((boxWidth - 70) > ((screenWidth / 5) * 3)) {
      showError(PUSH_FACE)
      return;
    }
  }

  console.log("box width - " + boxWidth + 80);
  console.log("distancia max - " + (((screenWidth / 5) * 2)));

  if (detectIphoneHigLevel(platform.ua)) {
    // Verifico a distância do rosto
    if (boxWidth < ((screenWidth / 5) * 3)) {
      showError(PULL_FACE)
      return;
    }
  } else {

    // Verifico a distância do rosto
    if ((boxWidth - 40) < ((screenWidth / 5) * 2)) {
      showError(PULL_FACE)
      return;
    }

  }

  console.log("OK - DISTANCIA");

  if (detectIphoneHigLevel(platform.ua)) {
    // Verifico a centralização horizontal da face a partir do eixo x. left: 1/5 right: 2/5  
    if (boxSideLeft < (screenWidth / 4) || boxSideLeft > ((screenWidth / 4) * 3)) {
      showError(CENTER_FACE)
      return;
    }
  }
  else {
    // Verifico a centralização horizontal da face a partir do eixo x. left: 1/5 right: 2/5  
    if (boxSideLeft < ((screenWidth / 6) - 50) || boxSideLeft > (((screenWidth / 6) * 3) - 30)) {
      showError(CENTER_FACE)
      return;
    }
  }

  console.log("OK - CENTER HORIZONTAL");

  // Verifico a centralização vertical da face a partir do eixo x. left: 1/4 right: 3/4   
  if (boxSideTop < (screenHeight / 4)) {
    showError(CENTER_FACE)
    return;
  }

  console.log("OK - CENTER VERTICAL - TOP");

  //  console.log("limit " + ((screenHeight / 4) * 3));

  console.log("box sidetop - " + boxSideTop);
  console.log("minimum top - " + ((screenHeight / 4) * 3));

  if (detectIphoneHigLevel(platform.ua)) {
    if ((boxSideTop / 2) > ((screenHeight / 4) * 3)) {
      showError(CENTER_FACE)
      return;
    }
  }
  else {
    if (boxSideTop > ((screenHeight / 4) * 3)) {
      showError(CENTER_FACE)
      return;
    }
  }

  console.log("OK - CENTER VERTICAL - BOTTOM");


  showSuccess();

}


function bioWeb(boxWidth, boxHeight, boxSideLeft, boxSideTop) {

  // Verifico se o rosto está ocupando mais do 40% da tela. 
  if ((boxHeight) > ((screenHeight / 100) * 40)) {
    showError(PUSH_FACE)
    return;
  }

  // Verifico se o rosto está ocupando mais do 40% da tela. 
  if ((boxHeight) < (screenHeight / 4)) {
    showError(PULL_FACE)
    return;
  }

  // Verifico a centralização horizontal da face a partir do eixo x. left: 1/5 right: 2/5  
  if (boxSideLeft < (screenWidth / 6) || boxSideLeft > ((screenWidth / 6) * 2)) {
    showError(CENTER_FACE)
    return;
  }

  // Verifico a centralização vertical da face a partir do eixo x. left: 1/4 right: 3/4 
  if (boxSideTop < (screenHeight / 5) || boxSideTop > ((screenHeight / 5) * 2)) {

    showError(CENTER_FACE)
    return;
  }

  countSuccess++;

  if (countSuccess > 3) {
    showSuccess();
  }


}

function showNeutral() {
  countdown = 3;
  lbCountdown.innerText = countdown;
  clearInterval(intervar);
  lbCountdown.style.display = 'none';
  isCountdown = false;
  countSuccess = 0;
  // borda.style.borderColor = 'gray';
  borda.style.borderColor = 'red';
  lbStatus.innerText = '';
}

function showError(message) {
  countSuccess = 0;
  countNoFace = 0;
  countdown = 3;
  lbCountdown.innerText = countdown;
  clearInterval(intervar);
  lbCountdown.style.display = 'none';
  isCountdown = false;
  countSuccess = 0;
  borda.style.borderColor = 'red';
  lbStatus.innerText = message;
  icTake.style.opacity = "0.3";
}

function showSuccess() {

  countNoFace = 0;

  borda.style.borderColor = 'blue';
  lbStatus.innerText = '';

  icTake.style.opacity = "1";


  if (!hasCaptured) {
    if (!isCountdown) {

      lbCountdown.style.display = 'inline-block';

      isCountdown = true;

      setTimeout(function () {

        intervar = setInterval(async () => {

          console.log(countdown);
          countdown--;

          lbCountdown.innerText = countdown;


          if (countdown >= 0) {
            if (countdown == 0) {
              hasCaptured = true;
              isCountdown = false;
              lbCountdown.innerText = 'OK';

              setTimeout(function () {
                lbCountdown.style.display = 'none';

              }, 1000);
              countdown = 3;
              clearInterval(intervar);

              //capture();
            }

          }
        }, 1000);

      }, 500);
    }

  }


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


function detectIphoneHigLevel(ua) {
  if (ua.includes("12_3_1")) {
    console.log("iphone high level");

    return true;
  } else {
    return false;
  }
}


function define_performance(ua) {
  if (ua.includes("ASUS_X00QD")
    || ua.includes("Pixel XL")
    || ua.includes("iPhone OS")
    || ua.includes("iPhone OS")
    || ua.includes("SM-G965F")
    || ua.includes("MI 8 Lite")
    || ua.includes("SM-G950F")) {
    return true;
  } else {
    return false;
  }

}


function capture() {
  const canvas = document.createElement('canvas');
  //const img = document.createElement('img');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  // Other browsers will fall back to image/png
  // img.src = canvas.toDataURL('image/jpeg');
  //  saveBase64AsFile(canvas.toDataURL('image/jpeg', 0.8), "imageSaved")
  // imgPreview.src = canvas.toDataURL('image/jpeg', 0.8);
  //imgPreview.style.display = 'inline-block';
  //hasCaptured = true;
  //stopStream();

  var base64 = canvas.toDataURL('image/jpeg', 1.0);
  console.log(base64);

  // Select the text

  var input = document.createElement("textarea");
  document.body.appendChild(input);
  input.style.display = 'none';
  input.value = base64;
  input.select();
  var copied;

  try {
    // Copy the text
    copied = document.execCommand('copy');
  }
  catch (ex) {
    copied = false;
  }

  if (copied) {
    alert("base64 copiado");
    console.log ("base64 copiado");
  }

  return base64;
}

function stopStream() {

  let stream = video.srcObject;
  let tracks = stream.getTracks();

  tracks.forEach(function (track) {
    track.stop();
  });

  video.srcObject = null;
  // video.style.display = "none";

}
function saveBase64AsFile(base64, fileName) {

  var link = document.createElement("a");
  link.setAttribute("href", base64);
  link.setAttribute("download", fileName);
  link.click();

}
