const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = (input) => {
    const jobID = uuid();
    const inputFileName = `${jobID}.txt`;
    const inputFilePath = path.join(dirInputs, inputFileName);
    
    // ✅ Convert to string to avoid errors
    fs.writeFileSync(inputFilePath, String(input));

    return inputFilePath;
};

module.exports = {
    generateInputFile,
};
