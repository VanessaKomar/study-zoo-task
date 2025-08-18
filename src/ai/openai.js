require("dotenv").config(); // Load .env
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getAIResponse(prompt, systemPrompt) {

  try {
    const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt, },
      ],
    });

    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI processing error:", error.response?.data || error.message);
    return "I'm having trouble responding right now.";
  }
}

module.exports = getAIResponse;