const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.post("/complexity", async (req, res) => {
  const { code, language } = req.body;

  const prompt = `Analyze the following ${language} code and provide estimated time and space complexity. Only return the analysis, not the code:\n\n${code}`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: prompt }],
            role: "user",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const generated =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({ complexity: generated });
  } catch (error) {
    console.error("Gemini AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch complexity from Gemini" });
  }
});

module.exports = router;
