var iImageIntro = 0;


const CENTER_FACE = "Centralize o rosto"
const PULL_FACE = "Aproxime o rosto"
const PUSH_FACE = "Afaste o rosto"
const DARK_FACE = "Ambiente escuro"
const LIGHT_FACE = "Ambiente muito claro"

const ONE_SECOND = 1000;
const HALF_SECOND = 500;

const screenWidth = screen.width;
const screenHeight = screen.height;

var screenWidthWEB;
var screenHeightWEB;

// Indicates whether a face is valid or not 
var detectFace = false;

var countdown = 3;
var isCountdown = false;
var intervalCountdown;

var intervalVideo;

var hasCaptured = false;

// Indicates whether the device is mobile or not
var isMobile;
isMobile = detectar_mobile();

// Metrics to change border color
const RULER = 2;
var countNoFace = 0;
var countSuccess = 0;
var countError = 0;

// Indicates whether logs will be displayed
var showLog = false;

var capture;

var isRunning = true;

// Methods of another class - Selfie.aspx

var isCaptureBackground;

var backToDefaultFrame;

var isEnableCapture = false;

var isValidateLight;

var MINIMUM_BRIGHTNESS = 80;

var onSuccessCaptureAtFrame;

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

window.onload = function () {

    if (isMobile) {
        document.body.classList.add("body-mob");
    } else {
        document.body.classList.add("body-web");
    }

    var box = document.getElementById('boxCamera');
    var borda = document.getElementsByClassName('new-borda');
    var lbStatus = document.getElementById('lbStatus');
    var lbCountdown = document.getElementById('lbCountdown');
    var icTake = document.getElementById('icTake');
    var icTakeWeb = document.getElementById('icTakeWeb');
    var maskDefault = document.getElementById('maskDefault');
    var lbIlu = document.getElementById('lbIlu');
    var btnCapture = document.getElementById('btnCapture');
    var btnCamera = document.getElementById('btnCamera');
    var video = document.getElementById('video');
    var spin = document.getElementById('spin');

    // btnCamera.style.bottom = '20px';


    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/mob/models'),
        // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).then(startVideo)


    function startVideo() {

        window.scrollTo(0, document.body.scrollHeight);

        mirrorScreen();

        if (isMobile) {

            console.log("MOBILE");

            icTake.onclick = function () {
                capture();
            };

            var constraints;

            if (detectIphoneHigLevel(platform.ua)) {

                constraints = {
                    video: { width: 1920, height: 1080 }
                };

            } else {

                constraints = {

                    //video: { width: screen.height, height: screen.width } 

                    video: { width: { min: 480, ideal: 1280, max: getHeightResolution() }, height: { min: 480, ideal: 720, max: getWidthResolution() }, facingMode: 'user' }
                    /*
                            video: {
                              height: { min: 480, ideal: 720, max: 1080 },
                              width: { min: 640, ideal: 1280, max: 1920 },
                              advanced: [
                                { width: 1920, height: 1080 },
                                { aspectRatio: 9 / 16 }
                              ], facingMode: { exact: 'user' }
                            } */

                };

            }


            try {
                navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
                    video.srcObject = stream;
                });
            }
            catch (err) {

                console.log(err);
                spin.style.display = 'none';
                stopProcess();
                backToDefaultFrame();

            }

        } else {

            console.log("WEB");

            //  icTakeWeb.onclick = function () {
            //    capture();
            // };


            try {

                navigator.getUserMedia(
                    {
                        video: { width: 1280, height: 720 }
                    },
                    stream => video.srcObject = stream,
                    err => console.error(err)
                )
            }
            catch (err) {
                console.log(err);
            }


        }

    }

    function mirrorScreen() {
        video.setAttribute("style", "-webkit-transform: scaleX(-1);  transform: scaleX(-1);");
    }

    function getWidthResolution() {
        return window.screen.width * window.devicePixelRatio;
    }

    function getHeightResolution() {
        return window.screen.height * window.devicePixelRatio;
    }

    video.addEventListener('play', () => {

        lbStatus.innerText = 'Aguarde, estamos configurando!'

        for (i = 0; i < borda.length; i++) {
            borda[i].style.opacity = "1.0";
        }

        startProcess();

    });

    function startProcess() {

        //  btnCamera.style.display = 'block';

        isRunning = true;

        if (isMobile) {
            // borda.style.height = (screen.height - 10) + 'px';

            var h = window.innerHeight;

            //borda.style.height = h  + 'px';
        } else {
            screenWidthWEB = video.videoWidth;
            screenHeightWEB = video.videoHeight;
        }

        var isAllow = true;

        var timeToInterval = 700;
        if (define_performance(platform.ua)) {
            timeToInterval = 500;
        }

        intervalVideo = setInterval(async function () {

            if (isRunning) {

                if (isAllow) {

                    try {
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

                                    /* 150 - compensação do espaço da testa, 
                                      a biblioteca pega do olho pra baixo. */
                                    validateBioMob(detection.box, (boxWidth / 2), boxHeight, boxSideLeft, (boxSideTop - 150));

                                } else {

                                    validateBioWeb(boxWidth, boxHeight, boxSideLeft, boxSideTop, boxSideBottom);

                                }

                            } else {

                                detectFace = false;

                                countNoFace++;
                                showNeutral();


                            }

                            spin.style.display = 'none';

                        })
                    }
                    catch (err) {
                        stopProcess();
                        backToDefaultFrame();
                        spin.style.display = 'none';
                    }


                }

                isAllow = false;

            }

        }, timeToInterval);

    }

    function stopProcess() {
        //  console.log = (err.message);
        //  maskDefault.style.display = 'block';
        // icTakeWeb.style.opacity = '1.0';
        isRunning = false;
        showNeutral();
        clearInterval(intervalCountdown);
        clearInterval(intervalVideo);
    }


    function validateBioMob(box, boxWidth, boxHeight, boxSideLeft, boxSideTop) {
        
     
        if (detectIphoneHigLevel(platform.ua)) {

            if ((boxWidth - 150) > ((screenWidth / 5) * 4)) {
                showError(PUSH_FACE)
                return;
            }

        } else {

            if ((boxWidth - 120) > ((screenWidth / 5) * 3)) {
                showError(PUSH_FACE)
                return;
            }

        }


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

        if (showLog) {
            console.log("OK - DISTANCIA");
        }

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

        if (showLog) {
            console.log("OK - CENTER HORIZONTAL");
        }


        // Verifico a centralização vertical da face a partir do eixo x. left: 1/4 right: 3/4   

        if (detectIphoneHigLevel(platform.ua)) {
            if ((boxSideTop / 2) < (screenHeight / 4)) {
                showError(CENTER_FACE)
                return;
            }
        } else {
            if (boxSideTop < (screenHeight / 4)) {
                showError(CENTER_FACE)
                return;
            }
        }




        if (showLog) {
            console.log("OK - CENTER VERTICAL - TOP");
        }

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

        if (showLog) {
            console.log("OK - CENTER VERTICAL - BOTTOM");
        }


          validateLight(box);

          if (!isValidateLight) {
              return;
          } 

        countSuccess++;
        showSuccess();
    }

    function validateBioWeb(boxWidth, boxHeight, boxSideLeft, boxSideTop, boxSideBottom) {

        // Verifico se o rosto está ocupando mais do 40% da tela. 
        if ((boxHeight) > ((screenHeightWEB / 5) * 3)) {
            showError(PUSH_FACE)
            return;
        }

        if (showLog) {
            console.log("AFASTE O ROSTO - OKAY");
        }


        // console.log("boxHeight: " + boxHeight);
        // console.log(" (screenHeightWEB / 5) " + (screenHeightWEB / 5));

        // Verifico se o rosto está ocupando mais do 40% da tela. 
        if ((boxHeight) < ((screenHeightWEB / 5) * 2)) {
            showError(PULL_FACE)
            return;
        }

        if (showLog) {
            console.log("APROXIME O ROSTO - OKAY");
        }


        // console.log("(boxSideLeft ): " + (boxSideLeft ));
        //  console.log("  (screenWidthWEB / 6) " + (screenWidthWEB / 6));
        // Verifico a centralização horizontal da face a partir do eixo x. left: 1/5 right: 2/5  
        if ((boxSideLeft) < (screenWidthWEB / 6)) {
            showError(CENTER_FACE)
            return;
        }



        if ((boxSideLeft + boxWidth) > ((screenWidthWEB / 6) * 5)) {
            showError(CENTER_FACE)
            return;
        }


        if (showLog) {
            console.log("HORIZONTAL OK - OKAY");
        }


        // Verifico a centralização vertical da face a partir do eixo x. left: 1/4 right: 3/4 
        if (boxSideTop < (screenHeightWEB / 4)) {
            showError(CENTER_FACE)
            return;
        }

        if (showLog) {
            console.log("VERTICAL TOPO - OKAY");
        }


        //  console.log("(boxSideBottom): " + boxSideBottom);
        // console.log("  screenHeightWEB  " + screenHeightWEB);

        if (boxSideBottom > screenHeightWEB) {
            showError(CENTER_FACE)
            return;
        }

        countSuccess++;
        showSuccess();


    }


    function showNeutral() {

        countError++;

        //  console.log("error: " + countError);
        //  console.log("no face: " + countNoFace);

        if (countError > RULER || countNoFace > RULER) {

            isEnableCapture = false;

            countdown = 3;
            lbCountdown.style.display = 'none';
            lbCountdown.innerText = countdown;
            clearInterval(intervalCountdown);
            isCountdown = false;
            countSuccess = 0;

            // borda.style.borderColor = 'gray';
            for (i = 0; i < borda.length; i++) {
                borda[i].style.borderColor = "red";
            }

            lbStatus.innerText = '';
            if (isMobile) {
                icTake.style.opacity = "0.3";
                //btnCapture.style.opacity = "0.3";

            } else {
                icTakeWeb.style.opacity = "0.3";
            }

        }
    }

    function showError(message) {


        isEnableCapture = false;

        countError++;

        if (countError >= RULER) {

            countSuccess = 0;
            countNoFace = 0;
            countdown = 3;
            lbCountdown.style.display = 'none';
            lbCountdown.innerText = countdown;
            clearInterval(intervalCountdown);
            isCountdown = false;
            countSuccess = 0;

            for (i = 0; i < borda.length; i++) {
                borda[i].style.borderColor = "red";
            }

            lbStatus.innerHTML = '<span style="background-color: rgba(255, 255, 255, 0.5); padding: 10px; border-radius: 25px;">' + message + '</span>';
            // lbStatus.innerText = message;
            if (isMobile) {
                icTake.style.opacity = "0.3";
                //   btnCapture.style.opacity = "0.3";
            } else {
                icTakeWeb.style.opacity = "0.3";
            }

        }


    }

    function showSuccess() {

        var pRuler = RULER;
        if (isMobile) {
            pRuler = 0;
        }

        if (countSuccess >= pRuler) {

            isEnableCapture = true;

            countNoFace = 0;
            countError = 0;

            //borda.style.borderColor = 'blue';
            for (i = 0; i < borda.length; i++) {
                borda[i].style.borderColor = "blue";
            }
            lbStatus.innerText = '';

            if (isRunning) {

                if (isMobile) {
                    icTake.style.opacity = "1";
                    //btnCapture.style.opacity = "1";

                } else {
                    icTakeWeb.style.opacity = "1";
                }

                //  if (!hasCaptured) {
                if (!isCountdown) {
                    isCountdown = true;

                    lbCountdown.style.display = 'inline-block';

                    setTimeout(function () {

                        intervalCountdown = setInterval(async () => {

                            countdown--;

                            lbCountdown.innerText = countdown;


                            if (countdown == 2) {
                                isCaptureBackground = true;
                                capture();
                            }

                            if (countdown == 0) {

                                isCaptureBackground = false;

                                hasCaptured = true;
                                //  isCountdown = false;
                                lbCountdown.innerText = 'OK';

                                setTimeout(function () {
                                    lbCountdown.style.display = 'none';

                                }, ONE_SECOND);

                                countdown = 3;
                                clearInterval(intervalCountdown);

                                // Gerando o base64 no console apenas na web.
                                if (isRunning) {
                                    if (isMobile) {
                                        capture();
                                    }
                                }

                            }

                        }, ONE_SECOND);

                    }, HALF_SECOND);
                }

            }


        }


    }

    function webgl_support() {
        try {
            var canvas = document.createElement('canvas');
            return !!window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    };

    function webgl_detect() {
        if (!!window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas"),
                names = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
                context = false;

            for (var i = 0; i < names.length; i++) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter == "function") {
                        // WebGL is enabled
                        //if (return_context) {
                        // return WebGL object if the function's argument is present
                        return { name: names[i], gl: context };
                        //  }
                        // else, return just true
                        return true;
                    }
                } catch (e) { }
            }

            // WebGL is supported, but disabled
            return false;
        }

        // WebGL not supported
        return false;
    }

    function showBase64Label() {

        lbStatus.innerText = "O base64 foi gerado no console";
    }

    function detectIphoneHigLevel(ua) {
        if (ua.includes("12_3_1") || getHeightResolution() > 2000) {
            //   console.log("iphone high level");

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

    function validateLight(box) {

        const canvas = document.createElement('canvas');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, ((box.x / 2) + 150), (box.y / 2) + 300, (box.width) - 200, (box.height) - 200, 0, 0, 1080, 1920);

        // console.log(canvas.toDataURL('image/jpeg'));

        getImageLightness(canvas.toDataURL('image/jpeg'), function (brightness) {

            if (brightness < MINIMUM_BRIGHTNESS) {
                showError(DARK_FACE);
                isValidateLight = false;
            } else if (brightness > 190) {
                showError(LIGHT_FACE);
                isValidateLight = false;
            } else {
                isValidateLight = true;
            }

            brightnessGlobal = brightness;

            //lbIlu.innerText = brightness;

            canvas.remove();

        });

    }

    capture = function () {

        if (isEnableCapture && detectFace) {

            const canvas = document.createElement('canvas');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            var img = document.createElement("img");
            img.src = canvas.toDataURL('image/jpeg', 0.8);;
            img.style.display = "none";
            document.body.appendChild(img);


            img.onload = function () {

                var MAX_WIDTH = 720;
                var MAX_HEIGHT = 1280;
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                var base64 = canvas.toDataURL("image/jpeg");
                
                onSuccessCaptureAtFrame(base64);

            }


        }

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



    function getImageLightness(imageSrc, callback) {
        var img = document.createElement("img");
        img.src = imageSrc;
        img.style.display = "none";
        document.body.appendChild(img);

        var colorSum = 0;

        img.onload = function () {
            // create canvas
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var r, g, b, avg;

            for (var x = 0, len = data.length; x < len; x += 4) {
                r = data[x];
                g = data[x + 1];
                b = data[x + 2];

                avg = Math.floor((r + g + b) / 3);
                colorSum += avg;
            }

            var brightness = Math.floor(colorSum / (this.width * this.height));
            callback(brightness);
        }
    }

}

