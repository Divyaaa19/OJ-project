const { exec } = require("child_process");
const path = require("path");

const executeJava = (filepath, inputFilePath) => {
  const dir = path.dirname(filepath);
  const className = path.basename(filepath).split(".")[0];

  return new Promise((resolve, reject) => {
    const command = `javac ${filepath} && java -cp ${dir} ${className} < ${inputFilePath}`;
    exec(command, { timeout: 2000 }, (error, stdout, stderr) => {
      if (error) {
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

module.exports = { executeJava };
