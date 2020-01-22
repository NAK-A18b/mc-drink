const telegram = require("telegram-bot-api");

let api;

module.exports.start = () => {
  api = new telegram({
    token: process.env.BOT_TOKEN,
  });
  return api;
};

module.exports.sendMessage = (id, text) =>
  api
  .sendMessage({
    chat_id: id,
    text,
  })
  .then(res => res.message_id);

module.exports.statusUpdate = (chatId, messageId) => percentage => {
  if (!messageId) {
    return;
  } else {
    return api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `${percentage}%`,
    });
  }
};

module.exports.deleteMessage = (chatId, messageId) =>
  api.deleteMessage({
    chat_id: chatId,
    message_id: messageId,
  });

module.exports.sendPhoto = (chatId, photoPath) =>
  api.sendPhoto({
    chat_id: chatId,
    photo: photoPath,
  });

module.exports.editMessage = (chatId, messageId, message) =>
  api.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: message,
  });

module.exports.Commands = [{
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