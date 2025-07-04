const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { generateFile } = require("./generateFile.js");
const { executeCpp } = require("./executeCpp.js");
const { executeC } = require("./executeC.js");
const { executePython } = require("./executePython.js");
const { executeJava } = require("./executeJava.js");

const { generateInputFile } = require("./generateInputFile.js");

const app = express();
dotenv.config();

/**
 * Entry point for the Express server.
 *
 * 1. Receives code + language choice from the client (`/run` endpoint).
 * 2. Persists the source code to a temporary file (`generateFile`).
 * 3. Compiles & executes the code (`executeCpp`).
 * 4. Returns the program output back to the caller as JSON.
 *
 * NOTE: Only the C++ workflow is fully wired-up right now, but because the
 *       architecture is modular you can plug in extra languages by adding
 *       another `execute<LANG>.js` implementation and a simple switch-case.
 */

//middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ online: "compiler" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Empty code!" });
  }

  try {
    const filePath = generateFile(language, code);
    const inputFilePath = generateInputFile(input);
    let output;
    
    switch (language) {
      case "cpp":
        output = await executeCpp(filePath, inputFilePath);
        break;
      case "c":
        output = await executeC(filePath, inputFilePath);
        break;
      case "python":
        output = await executePython(filePath, inputFilePath);
        break;
      case "java":
        output = await executeJava(filePath, inputFilePath);
        break;
      default:
        return res.status(400).json({ error: "Language not supported" });
    }

    res.json({ output });
  } catch (error) {
    console.error("Execution Error:", error); // log to terminal
    res
      .status(500)
      .json({ error: error.stderr || error.message || "Unknown Error" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});
