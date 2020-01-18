const math = require("./utils/math");

const messages = ["Schlechter Service", "Dreckige Toiletten", "Kaltes Essen", "Nette Bedienung"];

module.exports.generate = () => messages[math.randomNumber(0, messages.length - 1)];