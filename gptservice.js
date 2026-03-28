const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// 🎯 FIRST QUESTION (DOMAIN BASED)
async function generateFirstQuestion(domain) {

  const prompt = `
You are a professional interviewer.

Generate the FIRST interview question for a candidate in the domain: ${domain}.

Rules:
- Ask a clear, relevant technical or conceptual question
- Keep it short (1–2 lines)
- Make it realistic

Only return the question.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}


// 🎯 NEXT QUESTION (ADAPTIVE)
async function generateNextQuestion(domain, previousAnswer) {

  const prompt = `
You are an AI interviewer.

Domain: ${domain}

Candidate's previous answer:
"${previousAnswer}"

Based on the answer:
- If answer is weak → ask follow-up
- If answer is good → ask next level question
- If unclear → ask clarification

Keep it short and natural.

Only return the next question.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}


module.exports = {
  generateFirstQuestion,
  generateNextQuestion
};