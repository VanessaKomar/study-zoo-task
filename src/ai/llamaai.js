const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getAIResponse(prompt, systemPrompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1
    });

    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI processing error:", error);
    return "I'm having trouble responding right now.";
  }
}

module.exports = getAIResponse;