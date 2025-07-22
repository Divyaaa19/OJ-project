const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputFilePath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    const command = `g++ ${filepath} -o ${outPath} && ${outPath} < ${inputFilePath}`;
    exec(command, { timeout: 2000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed && error.signal === 'SIGKILL') {
          return resolve("Memory Limit Exceeded");
        }
        if (error.killed || error.signal === 'SIGTERM' || error.code === null) {
          return resolve("Time Limit Exceeded");
        }
        if (stderr && /cannot allocate memory|memoryerror/i.test(stderr)) {
          return resolve("Memory Limit Exceeded");
        }
        return reject({ error, stderr });
      }
      if (stderr && /cannot allocate memory|memoryerror/i.test(stderr)) {
        return resolve("Memory Limit Exceeded");
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};
