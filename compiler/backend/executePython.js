const { exec } = require("child_process");

const executePython = (filepath, inputFilePath) => {
  return new Promise((resolve, reject) => {
    const command = `python "${filepath}" < "${inputFilePath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) return reject({ error, stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executePython };
