import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function InterviewPage() {
  const [questionText, setQuestionText] = useState("Loading question...");
  const [liveAnswer, setLiveAnswer] = useState("Your answer will appear here...");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState("AI is ready");
  
  const currentAnswerRef = useRef("");
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const sessionId = localStorage.getItem("sessionId");

  // Load first question
  useEffect(() => {
    if (!sessionId) {
      navigate("/"); // Redirect if no session
      return;
    }
    const savedQuestion = localStorage.getItem("question");
    if (savedQuestion) {
      setQuestionText(savedQuestion);
    } else {
      setQuestionText("Tell me about yourself");
    }

    // Attempt to load video logic cleanly on mount
    const handleVoicesChanged = () => {
      console.log("Voices loaded:", speechSynthesis.getVoices().length);
    };
    speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [navigate, sessionId]);

  // Handle Text-to-Speech
  const speak = (text) => {
    if (!text) return;

    speechSynthesis.cancel();

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

    setIsSpeaking(true);
    setAvatarStatus("AI is speaking...");

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => console.log("Video auto-play blocked"));
    }

    speech.onend = () => {
      setIsSpeaking(false);
      setAvatarStatus("Listening...");
      if (videoRef.current) videoRef.current.pause();
    };

    speechSynthesis.speak(speech);
  };

  // Handle Speech-to-Text
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      currentAnswerRef.current = transcript;
      setLiveAnswer(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Submit Answer
  const submitAnswer = async () => {
    const answer = currentAnswerRef.current.trim();
    if (!answer) {
      alert("Please provide an answer");
      return false;
    }

    try {
      await fetch("http://localhost:3000/api/interview/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer })
      });
      return true;
    } catch (err) {
      console.error(err);
      return false; // Assuming dummy backend, we might just proceed anyway
    }
  };

  const getNextQuestion = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/interview/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { completed: true }; // complete on error
    }
  };

  // Logic Handlers
  const handleMicClick = () => {
    if (!isListening && !isSpeaking) {
      speak(questionText);
      setTimeout(() => {
        startListening();
      }, 2000);
    } else if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const handleNextClick = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();

    const success = await submitAnswer();
    if (!success) return; // user needs to speak more

    const data = await getNextQuestion();

    if (data.completed) {
      navigate("/result");
      return;
    }

    setQuestionText(data.question);
    speak(data.question);
    currentAnswerRef.current = "";
    setLiveAnswer("Your answer will appear here...");
  };

  return (
    <>
      {/* HEADER */}
      <div className="interview-header">
        <h2>AI Interview</h2>
      </div>

      <div className="main-container">
        {/* VIDEO SIDE */}
        <div className={`video-section ${isSpeaking ? "video-speaking" : ""}`}>
          <video id="avatarVideo" muted loop ref={videoRef}>
            <source src="/assets/avatar.mp4" type="video/mp4" />
          </video>
          <p id="avatarStatus">{avatarStatus}</p>
        </div>

        {/* INTERACTION SIDE */}
        <div className="interaction-panel">
          {/* QUESTION */}
          <div className="question-card">
            <p id="questionText">{questionText}</p>
          </div>

          {/* ANSWER */}
          <div className="answer-card">
            <p id="liveAnswer">{liveAnswer}</p>
          </div>

          {/* CONTROLS */}
          <div className="controls">
            <button id="micBtn" onClick={handleMicClick}>
              {isListening ? "🎤 Listening..." : "🎤 Start Speaking"}
            </button>
            <button id="nextBtn" onClick={handleNextClick}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InterviewPage;
