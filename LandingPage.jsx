import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const domains = [
    "DSA",
    "Frontend",
    "Backend",
    "ML",
    "DevOps",
    "Product"
  ];

  /* -------------------------
  NAVBAR ACTIVE LINK
  ------------------------- */
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
          setActiveSection(section.getAttribute("id") || "hero");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------------
  START INTERVIEW
  ------------------------- */
  const handleStart = async () => {
    if (!selectedDomain) {
      alert("Please select an interview domain");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain: selectedDomain })
      });

      const data = await response.json();
      console.log("START RESPONSE:", data);

      if (!response.ok) {
        alert(data.error || "Failed to start interview");
        setLoading(false);
        return;
      }

      // Store in localStorage
      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("question", data.question);
      localStorage.setItem("domain", selectedDomain);
      
      if (data.avatar) {
        localStorage.setItem("avatar", JSON.stringify(data.avatar));
      }

      // Redirect
      navigate("/interview");

    } catch (error) {
      console.error("Error:", error);
      alert("Server not reachable. Make sure backend is running.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">AI Interviewer</div>
        <div className="nav-links">
          <a href="#" className={activeSection === "hero" ? "active" : ""}>Home</a>
          <a href="#about" className={activeSection === "about" ? "active" : ""}>About</a>
          <a href="#process" className={activeSection === "process" ? "active" : ""}>How It Works</a>
          <a href="#features" className={activeSection === "features" ? "active" : ""}>Features</a>
          <a href="#faq" className={activeSection === "faq" ? "active" : ""}>FAQ</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <h1 className="fade-up">Hire Beyond Resumes</h1>
        <p className="fade-up delay">
          Experience AI-driven interviews that evaluate real skills,
          communication, and thinking ability.
        </p>

        {/* DOMAIN SELECT */}
        <div className="domains-inline fade-up delay2">
          <span>Select Domain:</span>
          {domains.map((domain) => (
            <button
              key={domain}
              className={`domain-option ${selectedDomain === domain ? "active" : ""}`}
              onClick={() => setSelectedDomain(domain)}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* BIG START BUTTON */}
        <button
          className={`start-btn ${selectedDomain ? "enabled" : ""}`}
          onClick={handleStart}
          disabled={!selectedDomain || loading}
        >
          {loading ? "Starting..." : "🚀 Start Your AI Interview"}
        </button>
      </section>

      {/* ABOUT */}
      <section id="about" className="section fade-up">
        <h2>About AI Interviewer</h2>
        <p>
          Hiring today relies heavily on resumes — but resumes don’t reflect real skills,
          confidence, or problem-solving ability. Many capable candidates are overlooked
          simply because they cannot express their true potential on paper.
        </p>
        <br/>
        <p>
          Our AI Interviewer transforms this process by conducting intelligent,
          real-time interviews that adapt based on your responses. Instead of static
          evaluation, we measure how you think, explain, and solve problems.
        </p>
        <br/>
        <p>
          This creates a *fair, unbiased, and skill-driven hiring process*
          that benefits both candidates and recruiters.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" className="section process fade-up">
        <h2>How It Works</h2>
        <div className="process-steps">
          <div className="step">
            <h3>1. Choose Your Domain</h3>
            <p>
              Select your field of interest such as DSA, Frontend, Backend, or ML.
              The AI customizes questions based on your domain.
            </p>
          </div>
          <div className="step">
            <h3>2. Interactive AI Interview</h3>
            <p>
              The AI asks questions dynamically. Based on your answers,
              it adapts difficulty and explores your depth of understanding.
            </p>
          </div>
          <div className="step">
            <h3>3. Smart Evaluation</h3>
            <p>
              You receive detailed feedback including accuracy, clarity,
              confidence, and problem-solving approach.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section fade-up">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Adaptive AI Questions</h3>
            <p>Dynamically adjusts difficulty based on your answers.</p>
          </div>
          <div className="feature">
            <h3>Voice + Text Interaction</h3>
            <p>Communicate naturally using voice or typing.</p>
          </div>
          <div className="feature">
            <h3>Real-Time Feedback</h3>
            <p>Instant insights on your performance and improvement areas.</p>
          </div>
          <div className="feature">
            <h3>Bias-Free Evaluation</h3>
            <p>Fair assessment based purely on skills and responses.</p>
          </div>
          <div className="feature">
            <h3>AI Avatar Interview</h3>
            <p>Experience a real one-on-one interview with an AI avatar.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section faq fade-up">
        <h2>Interview Process</h2>
        <div className="faq-item">
          <h4>Round 1: Technical Questions</h4>
          <p>Core domain questions to test knowledge.</p>
        </div>
        <div className="faq-item">
          <h4>Round 2: Communication</h4>
          <p>Evaluates clarity and explanation.</p>
        </div>
        <div className="faq-item">
          <h4>Round 3: Deep Analysis</h4>
          <p>Advanced questions based on performance.</p>
        </div>
        
        <h2>Preparation Tips</h2>
        <div className="faq-item">
          <p>
            ✔ Focus on concepts<br/>
            ✔ Practice explaining clearly<br/>
            ✔ Stay confident<br/>
            ✔ Think logically step-by-step
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 AI Interviewer | Smarter Hiring Platform</p>
      </footer>
    </>
  );
}

export default LandingPage;
