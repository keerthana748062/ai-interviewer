const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================
MAIN FUNCTION
========================================= */
async function evaluateCandidate(answers) {

    if (!answers || answers.length === 0) {
        return {
            overall: 0,
            dimensions: {},
            feedback: "No answers provided"
        };
    }

    // 🔥 1. RULE-BASED SCORING
    const ruleScores = ruleBasedScoring(answers);

    // 🔥 2. NLP-BASED SCORING
    const nlpScores = nlpScoring(answers);

    // 🔥 3. OPTIONAL AI SCORING
    let aiScore = null;

    try {
        aiScore = await aiEvaluation(answers);
    } catch {
        aiScore = null; // fallback safe
    }

    // 🔥 4. MERGE SCORES
    const finalScores = mergeScores(ruleScores, nlpScores, aiScore);

    return finalScores;
}


/* =========================================
RULE-BASED SCORING
========================================= */
function ruleBasedScoring(answers) {

    let scores = initScores();

    answers.forEach(ans => {
        const text = ans.toLowerCase();

        // Communication
        if (text.length > 20) scores.communication += 10;
        if (text.length > 50) scores.communication += 10;

        // Logic
        if (text.includes("because") || text.includes("therefore")) {
            scores.logic += 15;
        }

        // Confidence
        if (text.includes("i did") || text.includes("i handled")) {
            scores.confidence += 10;
        }

        // Teamwork
        if (text.includes("team")) {
            scores.teamwork += 10;
        }

        // Leadership
        if (text.includes("led") || text.includes("managed")) {
            scores.leadership += 15;
        }

        // Creativity
        if (text.includes("idea") || text.includes("solution")) {
            scores.creativity += 10;
        }

        // Adaptability
        if (text.includes("learned") || text.includes("adapt")) {
            scores.adaptability += 10;
        }

        // Domain Knowledge
        if (text.includes("project") || text.includes("technical")) {
            scores.domainKnowledge += 10;
        }
    });

    return normalize(scores);
}


/* =========================================
NLP-BASED SCORING (LIGHTWEIGHT)
========================================= */
function nlpScoring(answers) {

    let scores = initScores();

    answers.forEach(ans => {

        const words = ans.split(" ");

        // Vocabulary richness
        if (words.length > 20) {
            scores.communication += 10;
        }

        // Sentence complexity
        if (ans.includes(",") || ans.includes("and")) {
            scores.logic += 5;
        }

        // Emotional intelligence
        if (ans.includes("felt") || ans.includes("understood")) {
            scores.teamwork += 5;
        }

        // Confidence tone
        if (ans.includes("successfully")) {
            scores.confidence += 10;
        }

    });

    return normalize(scores);
}


/* =========================================
AI SCORING (OPTIONAL)
========================================= */
async function aiEvaluation(answers) {

    const prompt = `
Evaluate the following interview answers:

${answers.join("\n")}

Return JSON with:
{
  "overall": number (0-100),
  "feedback": "short feedback"
}
`;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
    });

    try {
        return JSON.parse(response.choices[0].message.content);
    } catch {
        return null;
    }
}


/* =========================================
MERGE ALL SCORES
========================================= */
function mergeScores(rule, nlp, ai) {

    let final = initScores();

    Object.keys(final).forEach(key => {
        final[key] = Math.round(
            (rule[key] + nlp[key]) / 2
        );
    });

    const overall =
        Object.values(final).reduce((a, b) => a + b, 0) /
        Object.keys(final).length;

    return {
        overall: Math.round(overall),
        dimensions: final,
        aiFeedback: ai ? ai.feedback : "AI feedback unavailable"
    };
}


/* =========================================
HELPERS
========================================= */
function initScores() {
    return {
        logic: 0,
        communication: 0,
        confidence: 0,
        creativity: 0,
        teamwork: 0,
        leadership: 0,
        adaptability: 0,
        domainKnowledge: 0
    };
}

function normalize(scores) {
    Object.keys(scores).forEach(key => {
        scores[key] = Math.min(scores[key], 100);
    });
    return scores;
}


module.exports = {
    evaluateCandidate
};