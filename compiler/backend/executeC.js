const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const executeC = (filepath, inputFilePath) => {
  const jobId = path.basename(filepath, path.extname(filepath));
  const outPath = path.join(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    // Compile step
    const compileCmd = `gcc "${filepath}" -o "${outPath}"`;
    exec(compileCmd, (compileErr, stdout, stderr) => {
      if (compileErr) {
        return reject({ error: compileErr, stderr });
      }
      // Run step
      const inputStream = fs.createReadStream(inputFilePath);
      const runProc = spawn(outPath, [], { stdio: ["pipe", "pipe", "pipe"] });

      let output = "";
      let errorOutput = "";

      runProc.stdout.on("data", (data) => {
        output += data.toString();
      });
      runProc.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      runProc.on("close", (code, signal) => {
        if (signal === "SIGTERM" || signal === "SIGKILL") {
          return resolve("Time Limit Exceeded");
        }
        if (errorOutput && /cannot allocate memory|memoryerror/i.test(errorOutput)) {
          return resolve("Memory Limit Exceeded");
        }
        resolve(output);
      });

      // Pipe input file to the process
      inputStream.pipe(runProc.stdin);
    });
  });
};

module.exports = { executeC };
