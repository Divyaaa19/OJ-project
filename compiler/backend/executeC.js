const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const executeC = (filepath, inputFilePath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    const command = `gcc ${filepath} -o ${outPath} && ${outPath} < ${inputFilePath}`;
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) return reject({ error, stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executeC };
