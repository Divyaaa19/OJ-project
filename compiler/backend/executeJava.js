const { exec } = require("child_process");
const path = require("path");

const executeJava = (filepath, inputFilePath) => {
  const dir = path.dirname(filepath);
  const className = path.basename(filepath).split(".")[0];

  return new Promise((resolve, reject) => {
    const command = `javac ${filepath} && java -cp ${dir} ${className} < ${inputFilePath}`;
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) return reject({ error, stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executeJava };
