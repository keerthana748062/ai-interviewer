
// ===============================
// GLOBAL VARIABLES
// ===============================
const sessionId = localStorage.getItem("sessionId");

const questionText = document.getElementById("questionText");
const liveAnswer = document.getElementById("liveAnswer");

const micBtn = document.getElementById("micBtn");
const nextBtn = document.getElementById("nextBtn");

const avatarVideo = document.getElementById("avatarVideo");
const avatarStatus = document.getElementById("avatarStatus");
const videoSection = document.querySelector(".video-section");

let currentAnswer = "";
let recognition;


// ===============================
// 🔊 TEXT → SPEECH (AI SPEAKING + VIDEO)
// ===============================
function speak(text) {

    if (!text) return;

    const speech = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("google")
    );

    speech.voice = femaleVoice || voices[0];
    speech.rate = 0.95;
    speech.pitch = 1.2;

    // 🎥 START VIDEO
    if (avatarVideo) {
        avatarVideo.currentTime = 0;
        avatarVideo.play();
    }

    // 🔴 UI EFFECT
    if (videoSection) videoSection.classList.add("video-speaking");
    if (avatarStatus) avatarStatus.innerText = "AI is speaking...";

    speechSynthesis.cancel();
    speechSynthesis.speak(speech);

    speech.onend = () => {
        // ⏹️ STOP VIDEO
        if (avatarVideo) avatarVideo.pause();

        if (videoSection) videoSection.classList.remove("video-speaking");
        if (avatarStatus) avatarStatus.innerText = "Listening...";
    };
}


// ===============================
// 🎤 SPEECH → TEXT (LIVE SUBTITLES)
// ===============================
function startListening() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        micBtn.innerText = "🎤 Listening...";
    };

    recognition.onresult = (event) => {
        let transcript = "";

        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        currentAnswer = transcript;
        liveAnswer.innerText = transcript;
    };

    recognition.onend = () => {
        micBtn.innerText = "🎤 Start Speaking";
    };

    recognition.start();
}


// ===============================
// LOAD FIRST QUESTION
// ===============================
function loadInitialQuestion() {

    const question = localStorage.getItem("question");

    if (question) {
        questionText.innerText = question;
    } else {
        questionText.innerText = "Tell me about yourself";
    }
}


// ===============================
// SUBMIT ANSWER
// ===============================
async function submitAnswer() {

    if (!currentAnswer || currentAnswer.trim() === "") {
        alert("Please provide an answer");
        return false;
    }

    await fetch("http://localhost:3000/api/interview/submit-answer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sessionId,
            answer: currentAnswer
        })
    });

    return true;
}


// ===============================
// GET NEXT QUESTION
// ===============================
async function getNextQuestion() {

    const res = await fetch("http://localhost:3000/api/interview/next-question", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId })
    });

    return await res.json();
}


// ===============================
// NEXT BUTTON FLOW
// ===============================
nextBtn.addEventListener("click", async () => {

    if (recognition) recognition.stop();

    const success = await submitAnswer();
    if (!success) return;

    const data = await getNextQuestion();

    if (data.completed) {
        window.location.href = "result.html";
        return;
    }

    questionText.innerText = data.question;

    // 🔊 Speak next question
    speak(data.question);

    currentAnswer = "";
    liveAnswer.innerText = "Your answer will appear here...";
});


// ===============================
// MIC BUTTON (USER TRIGGER)
// ===============================
micBtn.addEventListener("click", () => {

    const question = questionText.innerText;

    // 🔊 Speak first (browser requirement)
    speak(question);

    // 🎤 Start listening after slight delay
    setTimeout(() => {
        startListening();
    }, 2000);
});


// ===============================
// INIT
// ===============================
loadInitialQuestion();


// ===============================
// VOICE LOADING FIX
// ===============================
speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded");
};