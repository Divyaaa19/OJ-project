const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes, { recursive: true });

const generateFile = (language, code) => {
  let filename = "";
  let extension = "";

  switch (language) {
    case "cpp":
      extension = "cpp";
      filename = `${uuid()}.${extension}`;
      break;
    case "c":
      extension = "c";
      filename = `${uuid()}.${extension}`;
      break;
    case "python":
      extension = "py";
      filename = `${uuid()}.${extension}`;
      break;
    case "java":
      extension = "java";

      // Extract class name using regex
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : "Main";

      filename = `${className}.${extension}`;
      break;
    default:
      throw new Error("Unsupported language");
  }

  const filepath = path.join(dirCodes, filename);
  fs.writeFileSync(filepath, code);
  return filepath;
};

module.exports = { generateFile };
