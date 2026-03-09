const { spawn } = require("child_process");
const path = require("path");

function preprocessImage(imagePath) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [
      path.join(__dirname, "../models/image_preprocess.py"),
      imagePath,
    ]);

    let output = "";
    let error = "";

    python.stdout.on("data", data => output += data.toString());
    python.stderr.on("data", data => error += data.toString());

    python.on("close", code => {
      if (code !== 0) {
        return reject(error || "Python processing failed");
      }
      resolve(JSON.parse(output));
    });
  });
}

module.exports = { preprocessImage };
