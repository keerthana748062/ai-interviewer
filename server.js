// Import modules
const express = require("express");
const cors = require("cors");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const interviewRoutes = require("./routes/interview");

// Use routes
app.use("/api/interview", interviewRoutes);

// Test route (for browser check)
app.get("/", (req, res) => {
  res.send("AI Interviewer Backend Running 🚀");
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});