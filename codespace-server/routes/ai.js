const express = require("express");
const verifyUser = require("../middleware/verifyUser");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY; // support both

// ✅ Complexity Estimation Route
router.post("/complexity", verifyUser, async (req, res) => {
  const { code, language } = req.body;

  const prompt = `Analyze the following ${language} code and provide estimated time and space complexity. Only return the analysis, not the code:\n\n${code}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
        },
      }
    );

    const generated =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({ complexity: generated });
  } catch (error) {
    console.error("❌ Gemini Complexity Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch complexity from Gemini" });
  }
});

// ✅ AI Review Route
router.post("/review", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  const prompt = `
Review the following ${language} code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Any bugs or issues.
2. Suggested improvements.
3. A brief summary of what the code does.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const review = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!review) throw new Error("No response from Gemini");

    res.json({ review });
  } catch (err) {
    console.error("❌ Google Gemini AI Review Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "AI review failed." });
  }
});

// ✅ Edge Cases Route
router.post("/edge-cases", verifyUser, async (req, res) => {
  const { code, language, prompt: problemStatement } = req.body;

  if (!code || !language || !problemStatement) {
    return res.status(400).json({ error: "Code, language, and problem statement are required." });
  }

  const edgeCasePrompt = `
You are an expert in competitive programming.

Given the problem:
"${problemStatement}"

And the following ${language} code (which fails some test cases):

\`\`\`${language}
${code}
\`\`\`

Please identify potential edge cases that might cause the code to fail. List the edge cases concisely, each in a new bullet point.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: edgeCasePrompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Log the full Gemini response for debugging
    console.log("Gemini edge cases response:", JSON.stringify(response.data, null, 2));

    const edgeCases = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!edgeCases) {
      return res.status(502).json({ error: "No edge cases generated by Gemini." });
    }

    res.json({ edgeCases });
  } catch (err) {
    // Log the full error for debugging
    console.error("❌ Gemini Edge Case Error:", err?.response?.data || err.message, err.stack);
    res.status(500).json({ error: "Failed to generate edge cases.", details: err?.response?.data || err.message });
  }
});

module.exports = router;
