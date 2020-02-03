const { createWorker } = require("tesseract.js");
const { findCode } = require("./mcDonalds");

module.exports.getCode = async file => {
  const scannedText = await scanImage(file);
  return findCode(scannedText);
};

const scanImage = async file => {
  try {
    const worker = createWorker({
      cachePath: "/tmp",
    });
    await worker.load();
    await worker.loadLanguage("deu");
    await worker.initialize("deu");
    const { data } = await worker.recognize(file);
    await worker.terminate();
    return data.text;
  } catch (e) {
    console.log("Tesseract Erro: ", e);
  }
};
