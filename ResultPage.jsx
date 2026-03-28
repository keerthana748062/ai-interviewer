import { useState, useEffect } from "react";

function ResultPage() {
  const [data, setData] = useState({
    score: 0,
    tech: 0,
    communication: 0,
    problem: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/result");
        if (res.ok) {
          const resultData = await res.json();
          setData(resultData);
        } else {
          throw new Error("No backend");
        }
      } catch (err) {
        // Fallback dummy data
        setData({
          score: 78,
          tech: 85,
          communication: 65,
          problem: 80
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  if (loading) {
    return (
      <>
        <nav className="navbar">
          <div className="nav-logo">AI Interviewer</div>
        </nav>
        <section className="result-container">
          <h2>Evaluating your performance...</h2>
        </section>
      </>
    );
  }

  // Calculate Rating
  let rating = "Average ⚠️";
  if (data.score > 80) rating = "Excellent 🎉";
  else if (data.score > 60) rating = "Good 👍";

  // Calculate Summary
  let summary = "Your technical skills are strong, but communication needs improvement.";
  if (data.communication >= 70) {
    summary = "Great performance overall! Keep improving to reach excellence.";
  }

  // Calculate Decision
  let decision = "❌ Not Selected";
  let role = "Keep improving and try again!";
  if (data.score > 75) {
    decision = "✅ Selected";
    role = "Recommended Role: Software Developer";
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">AI Interviewer</div>
      </nav>

      <section className="result-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="card score-card">
            <h2>Your Score</h2>
            <h1 id="score">{data.score}%</h1>
            <p id="rating">{rating}</p>
          </div>

          <div className="card decision-card">
            <h3>Hiring Decision</h3>
            <p id="decision">{decision}</p>
            <p id="role">{role}</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="card">
            <h3>Performance Breakdown</h3>
            <div className="progress-item">
              <span>Technical</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  id="techBar"
                  style={{ width: `${data.tech}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <span>Communication</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  id="commBar"
                  style={{ width: `${data.communication}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <span>Problem Solving</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  id="problemBar"
                  style={{ width: `${data.problem}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY + FEEDBACK */}
      <section className="bottom-section">
        <div className="card summary-card">
          <h3>AI Evaluation Summary</h3>
          <p id="summary">{summary}</p>
        </div>

        <div className="card feedback-card">
          <h3>Your Feedback</h3>
          <textarea placeholder="Share your experience..."></textarea>
          <button className="start-btn">Submit</button>
        </div>
      </section>
    </>
  );
}

export default ResultPage;
