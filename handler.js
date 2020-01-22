"use strict";
const fs = require("fs");

const lambda = require("./src/lambda");
const telegram = require("./src/telegram");
const mcDonalds = require("./src/mcDonalds");

const response = body => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const Commands = [
  {
    cmd: "/start",
    text: "🔗 Verbunden\n" +
        "Bitte gib deinen 12-stelligen Rechnungs-Code ein.\n" +
        "\n" +
        "💡 Beispiel: \n" +
        "- bzjqnlivf5dr \n" +
        "- bzjq-nliv-fki3",
  },
  {
    cmd: "/help",
    text: "ℹ️Informationen: \n "+
          "Gib deinen Rechnungs-Code ein und erhalte nach kurzer Zeit deinen gratis Getränk Coupon! \n" +
          "Der Rechnungs-Code befindet sich im unteren Bereich deiner Rechnung und besteht aus 12 Zahlen und Zeichen."+
          "Nachdem du deinen Gratiscoupon erhalten hast, bekommst du beim Vorzeigen an der Kasse ein gratis 0.25l Getränk deiner Wahl!" +
          "\n" +
          "📋 Weitere Informationen: \n" +
          "- Dein Rechnungs-Code ist ab dem Kauf der Bestellung 2 Tage gültig.\n" +
          "- Der Gratiscoupon ist ab Erstellung 1 Monat gültig. \n" +
          "- Alle Codes sind nur ein Mal einlösbar",
  },
];

module.exports.telegramBot = async ({ body }) => {
  const { message } = process.env.IS_LOCAL ? body : JSON.parse(body);
  const { chat } = message;

  telegram.start();

  if (!message.startsWith("/")) {
    lambda.startTelegramApi(chat.id, message.text);
    return response("Success");
  }

  const message = Commands.find(({ cmd }) => cmd === message);
  if (message) await telegram.sendMessage(chat.id, message.text);

  return response("Success");
};

module.exports.telegramApi = async ({ body }) => {
  telegram.start();
  const { chatId, code } = JSON.parse(body);

  const apiError = async msg => {
    await telegram.sendMessage(chatId, messageId, msg);
    return response(msg);
  };

  const messageId = await telegram.sendMessage(chatId, "Starting Survey...");
  if (!mcDonalds.verifyCode(code)) return await apiError("Wrong Code");

  const screenshot = await mcDonalds
    .doSurvey(code, telegram.statusUpdate(chatId, messageId))
    .catch(error => ({
      error,
    }));

  if (screenshot.error) return await apiError(screenshot.error);

  if (!fs.existsSync("/tmp")) fs.mkdir("/tmp");
  fs.writeFileSync("/tmp/photo.png", screenshot);

  await telegram.deleteMessage(chatId, messageId);
  await telegram.sendPhoto(chatId, "/tmp/photo.png");

  return response("Success");
};
