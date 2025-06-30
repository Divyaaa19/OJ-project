const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');


const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

/**
 * Utility responsible for creating unique temporary source-code files on disk.
 *
 * Why do we need this?
 * 1. The online compiler receives raw code text from the client.
 * 2. In order to compile / execute the program we must first write that text
 *    into a real file so that tools like `g++` can read it.
 * 3. We keep things tidy by placing every generated file inside a dedicated
 *    `codes` folder (created automatically if it does not yet exist).
 * 4. A UUID (universally-unique identifier) is used to ensure file names never
 *    clash when several users hit the endpoint at the same time.
 *
 * The main export is `generateFile(extension, code)` which returns **the full
 * path** of the freshly-created file so that the caller can pass it to the
 * next build / run step.
 */

const generateInputFile = (input) => {
    const jobID = uuid();
    const inputFileName = `${jobID}.txt`;
    const inputFilePath = path.join(dirInputs, inputFileName);
    fs.writeFileSync(inputFilePath, input);
    return inputFilePath;
};

module.exports = {
    generateInputFile,
};
