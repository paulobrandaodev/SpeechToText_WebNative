const startRecordingButton = document.getElementById("startRecording");
const stopRecordingButton = document.getElementById("stopRecording");
const audioElement = document.getElementById("audioElement");
const sendToAzureButton = document.getElementById("sendToAzure");
const transcriptionResult = document.getElementById("transcription");

let mediaRecorder;
let audioChunks = [];

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
sendToAzureButton.addEventListener("click", sendToAzureSTT);

async function startRecording() {

    audioChunks = [];

    const audioOptions = {
        audioBitsPerSecond: 16 * 1000 * 1024, // Defina uma taxa de bits alta, por exemplo, 16 Mbps
        sampleRate: 44100, // Taxa de amostragem em Hz (exemplo: 44.1 kHz)
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioOptions });
        mediaRecorder = new MediaRecorder(stream, audioOptions);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioElement.src = URL.createObjectURL(audioBlob);
        };

        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;

        console.log(MediaRecorder.audioBitsPerSecond);
        console.log(MediaRecorder.mimeType);

    } catch (error) {
        console.error("Erro ao iniciar a gravação de áudio:", error);
    }
}

function  stopRecording() {    
    
    

    if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
    }
}

async function sendToAzureSTT() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

    const subscriptionKey = '2e8eef00d83c4dbf83b3070aab58e047';

    try {

        // Agora que você tem o token, pode usá-lo para enviar o áudio para o serviço de Reconhecimento de Fala
        const sttEndpoint = `https://brazilsouth.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=pt-BR&format=detailed`;
        
        const response = await fetch(sttEndpoint, {
            method: 'POST',
            body: audioBlob,
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Content-Type': 'audio/wav'
            },
            
        });

        if (!response.ok) {
            console.error('Erro da requisição ao enviar o áudio para o Azure STT:', error);
        }

        const result = await response.json();

        // O resultado contém a transcrição do áudio
        transcriptionResult.innerText = result.DisplayText;
    } catch (error) {
        console.error('Erro ao enviar o áudio para o Azure STT:', error);
    }
}

