const { exec } = require("child_process");

const executePython = (filepath, inputFilePath) => {
  return new Promise((resolve, reject) => {
    const command = `python "${filepath}" < "${inputFilePath}"`;
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

module.exports = { executePython };
