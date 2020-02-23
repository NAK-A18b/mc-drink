const math = require("./utils/math");

const Commands = [{
    cmd: "/start",
    text: "🔗 Verbunden\n" +
      "Bitte gib deinen 12-stelligen Rechnungs-Code ein.\n" +
      "\n" +
      "💡 Beispiel: \n" +
      "- bzjqnlivf5dr \n" +
      "- bvlt-dg1p-92gf",
  },
  {
    cmd: "/help",
    text: "ℹ️ Informationen: \n" +
      "Gib deinen Rechnungs-Code ein und erhalte nach kurzer Zeit deinen gratis Getränk Coupon! \n" +
      "Der Rechnungs-Code befindet sich im unteren Bereich deiner Rechnung und besteht aus 12 Zahlen und Zeichen." +
      "Nachdem du deinen Gratiscoupon erhalten hast, bekommst du beim Vorzeigen an der Kasse ein gratis 0.25l Getränk deiner Wahl!" +
      "\n\n" +
      "📋 Weitere Informationen: \n" +
      "- Dein Rechnungs-Code ist ab dem Kauf der Bestellung 2 Tage gültig.\n" +
      "- Der Gratiscoupon ist ab Erstellung 1 Monat gültig. \n" +
      "- Alle Codes sind nur ein Mal einlösbar",
  },
];

module.exports.findCommand = input => input && Commands.find(({
  cmd
}) => cmd === input.toLocaleLowerCase());

const messages = ["Service", "Toiletten", "Parkplatzgröße", "Bedienung", "Restaurant Sauberkeit"];

module.exports.generateMessage = () => messages[math.randomNumber(0, messages.length)];