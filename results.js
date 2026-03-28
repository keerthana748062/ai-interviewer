const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const scoringService = require('../services/scoringservice');

const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'sessions.json');


/* -------------------------
LOAD SESSION
------------------------- */
function loadSessions() {
    try {
        if (!fs.existsSync(SESSIONS_FILE)) return {};
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        return raw ? JSON.parse(raw) : {};
    } catch (err) {
        console.error('Error loading sessions:', err.message);
        return {};
    }
}

function getSession(sessionId) {
    const sessions = loadSessions();
    return sessions[sessionId] || null;
}


/* -------------------------
MAIN RESULT ROUTE
------------------------- */
router.get('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // 🔥 AUTO-GENERATE SCORES IF MISSING (IMPORTANT FIX)
        if (!session.scores) {
            session.scores = scoringService.evaluateCandidate(session.answers || []);
        }

        const overallScore = session.scores.overall || 0;

        // 🔥 SIMPLE FINAL DECISION (UI FRIENDLY)
        const finalDecision =
            overallScore >= 80 ? "Hire" :
            overallScore >= 65 ? "Consider" :
            "Reject";

        res.json({
            success: true,

            sessionId: sessionId,
            candidateName: session.candidateName || "Candidate",

            overallScore,
            finalDecision,

            scores: session.scores,

            totalQuestions: session.questions?.length || 0,
            totalAnswers: session.answers?.length || 0,

            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Result Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate result'
        });
    }
});


/* -------------------------
ROLE RECOMMENDATION
------------------------- */
router.get('/:sessionId/roles', (req, res) => {
    try {
        const session = getSession(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (!session.scores) {
            session.scores = scoringService.evaluateCandidate(session.answers || []);
        }

        res.json({
            success: true,
            message: "Role recommendation feature ready",
            note: "You can plug your ROLE_DATABASE here"
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Error generating roles' });
    }
});


/* -------------------------
STAKEHOLDER VIEW
------------------------- */
router.get('/:sessionId/stakeholder', (req, res) => {
    try {
        const session = getSession(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (!session.scores) {
            session.scores = scoringService.evaluateCandidate(session.answers || []);
        }

        const score = session.scores.overall || 0;

        const stakeholders = [
            {
                name: "Hiring Manager",
                score: Math.round(score * 0.9),
                decision: score >= 70 ? "Hire" : "No Hire"
            },
            {
                name: "Tech Lead",
                score: Math.round(score * 0.95),
                decision: score >= 75 ? "Hire" : "No Hire"
            },
            {
                name: "HR",
                score: Math.round(score * 0.85),
                decision: score >= 65 ? "Hire" : "No Hire"
            }
        ];

        res.json({
            success: true,
            stakeholders
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Error generating stakeholder view' });
    }
});


/* -------------------------
FEEDBACK
------------------------- */
router.post('/:sessionId/feedback', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const sessions = loadSessions();
        const session = sessions[sessionId];

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        session.feedback = {
            rating,
            comment: comment || "",
            submittedAt: new Date().toISOString()
        };

        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

        res.json({
            success: true,
            message: "Feedback saved"
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Error saving feedback' });
    }
});


module.exports = router;