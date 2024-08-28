// const wss = new WebSocket('wss://voice-chat-app-eight.vercel.app:8000');
const wss = new WebSocket('wss://c2cjobs.org/ws');

var madiaRecorder;

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
        madiaRecorder = new MediaRecorder(stream);
        var audioChunks = [];

        madiaRecorder.addEventListener("dataavailable", function (event) {
            console.log(event.data)
            audioChunks.push(event.data);
        });

        madiaRecorder.addEventListener("stop", function () {
            console.log('Stopped');
            var audioBlob = new Blob(audioChunks);
            audioChunks = [];
            var fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onloadend = function () {
                var base64String = fileReader.result;
                wss.send(base64String);
            };
        });
    })
    .catch((error) => {
        console.error('Error capturing audio.', error);
    });


const speakButton = document.getElementById('speak');
const stopButton = document.getElementById('stop');


function stopAndStart() {
    setInterval(() => {
        if (madiaRecorder.state === 'recording') {
            madiaRecorder.stop();
        }
        madiaRecorder.start();
    }, 1000);
}

setTimeout(() => {
    madiaRecorder.start();
    stopAndStart();
}, 1000);



wss.onopen = () => {
    console.log("Connection established!");
};

wss.onmessage = (event) => {
    const base64String = event.data;
    const audioBlob = base64ToBlob(base64String.split(',')[1], 'audio/webm');
    const audioURL = URL.createObjectURL(audioBlob);
    const audioElement = document.getElementById('audio');
    audioElement.src = audioURL;
    audioElement.play();
};

function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
}