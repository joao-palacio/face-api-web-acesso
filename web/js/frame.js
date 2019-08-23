var iImageIntro = 0;

var intro_one = new Image();
intro_one.src = "intro_one.svg";
var intro_two = new Image();
intro_two.src = "intro_two.svg";
var intro_three = new Image();
intro_three.src = "intro_three.svg";
var intro_four = new Image();
intro_four.src = "intro_four.svg";

const CENTER_FACE = "Centralize o rosto"
const PULL_FACE = "Aproxime o rosto"
const PUSH_FACE = "Afaste o rosto"

const screenWidth = screen.width;
const screenHeight = screen.height;

var screenWidthWEB;
var screenHeightWEB;

var detectFace = false;

var countdown = 3;
var isCountdown = false;
var intervar;

var intervalVideo;

var hasCaptured = false;

var isMobile;

var countNoFace = 0;
var countSuccess = 0;

var countError = 0;

var showLog = false;


isMobile = detectar_mobile();

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
    var borda = document.getElementById('borda');
    var lbCountdown = document.getElementById('lbCountdown');
    var icTake = document.getElementById('icTake');
    var icTakeWeb = document.getElementById('icTakeWeb');
    var maskDefault = document.getElementById('maskDefault');
    var lbIlu = document.getElementById('lbIlu');

    if (isMobile) {

        var imgPreview = document.getElementById('imgPreview');
        imgPreview.src = intro_one.src;

        imgPreview.onclick = function () { nextIntro() };

        function nextIntro() {

            if (iImageIntro >= 3) {
                document.getElementById("divBackInst").style.display = 'none';
                return;
            }

            if (iImageIntro == 0) {
                imgPreview.src = intro_two.src;
            } else if (iImageIntro == 1) {
                imgPreview.src = intro_three.src;
            } else if (iImageIntro == 2) {
                imgPreview.src = intro_four.src;
            }

            iImageIntro++;

        }

    }

    var video = document.getElementById('video');

    var isValid = webgl_support();
    console.log(isValid);

    var isValid2 = webgl_detect();
    console.log(isValid2);

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
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


            navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
                video.srcObject = stream;
            });

        } else {

            console.log("WEB");

            icTakeWeb.onclick = function () {
                capture();
            };

            navigator.getUserMedia(
                {
                    video: { width: 1280, height: 720 }
                },
                stream => video.srcObject = stream,
                err => console.error(err)
            )



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

        if (isMobile) {
            borda.style.height = (screen.height - 10) + 'px';
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


           // runImage();

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
                                validateBioMob((boxWidth / 2), boxHeight, boxSideLeft, (boxSideTop - 150));

                            } else {

                                validateBioWeb(boxWidth, boxHeight, boxSideLeft, boxSideTop, boxSideBottom);

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
                catch (err) {
                    console.log = (err.message);
                    maskDefault.style.display = 'block';
                    icTakeWeb.style.opacity = '1.0';
                    clearInterval(intervalVideo);
                }


            }

            isAllow = false;

        }, timeToInterval);

    })

    function validateBioMob(boxWidth, boxHeight, boxSideLeft, boxSideTop) {

        console.log((boxWidth - 70));
        console.log(((screenWidth / 5) * 3));

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

        //console.log("box width - " + boxWidth + 80);
        // console.log("distancia max - " + (((screenWidth / 5) * 2)));

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
        if (boxSideTop < (screenHeight / 4)) {
            showError(CENTER_FACE)
            return;
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


        console.log("(boxSideBottom): " + boxSideBottom);
        console.log("  screenHeightWEB  " + screenHeightWEB);

        if (boxSideBottom > screenHeightWEB) {
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
        if (isMobile) {
            icTake.style.opacity = "0.3";
        } else {
            icTakeWeb.style.opacity = "0.3";
        }
    }

    function showError(message) {

        //countError++;
        // if (countError > 3) {

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
        if (isMobile) {
            icTake.style.opacity = "0.3";
        } else {
            icTakeWeb.style.opacity = "0.3";
        }

    }

    function showSuccess() {

        countNoFace = 0;
        countError = 0;

        borda.style.borderColor = 'blue';
        lbStatus.innerText = '';

        if (isMobile) {
            icTake.style.opacity = "1";
        } else {
            icTakeWeb.style.opacity = "1";
        }

        //  if (!hasCaptured) {
        if (!isCountdown) {
            isCountdown = true;

            lbCountdown.style.display = 'inline-block';

            setTimeout(function () {

                intervar = setInterval(async () => {

                    console.log(countdown);
                    countdown--;

                    lbCountdown.innerText = countdown;


                    if (countdown >= 0) {
                        if (countdown == 0) {
                            hasCaptured = true;
                            //  isCountdown = false;
                            lbCountdown.innerText = 'OK';

                            setTimeout(function () {
                                lbCountdown.style.display = 'none';

                            }, 1000);
                            countdown = 3;
                            clearInterval(intervar);

                            // Gerando o base64 no console apenas na web.
                            if (!isMobile) {
                                capture();
                            }

                        }

                    }
                }, 1000);

            }, 500);
        }

        // }


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

    function runImage() {

        const canvas = document.createElement('canvas');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 100, 100, 800, 600, 0,0,1280,720);

        getImageLightness(canvas.toDataURL('image/jpeg'), function (brightness) {
            console.log(brightness);
            lbIlu.innerText = brightness;
        });



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

        //var blob = new Blob([base64], {type: "text/plain;charset=utf-8"});
        //  saveAs(blob, "base64.txt");

        var data = new FormData();
        data.append("data", "the_text_you_want_to_save");
        var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
        xhr.open('post', '../saveFile.php', true);
        xhr.send(data);

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

