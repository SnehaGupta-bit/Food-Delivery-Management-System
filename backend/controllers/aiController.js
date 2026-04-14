import axios from "axios";

export const getAIResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          ...history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({ reply });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "AI error" });
  }
};