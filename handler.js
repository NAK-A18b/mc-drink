"use strict";
const fs = require("fs");

const lambda = require("./src/lambda");
const {
  startBot,
  sendMessage,
  parseInput,
  editMessage,
  statusUpdate,
  deleteMessage,
  sendDocument,
} = require("./src/telegram");
const mcDonalds = require("./src/mcDonalds");
const { notifyAdmins } = require("./src/monitoring");
const { findCommand } = require("./src/bot");

// Create tmp directory for local development
if (!fs.existsSync("/tmp")) {
  fs.mkdir("/tmp");
}

const response = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Success",
  }),
};

module.exports.telegramBot = ({ body }) => {
  return new Promise(async (resolve, _) => {
    const { message } = process.env.IS_LOCAL ? body : JSON.parse(body);
    if (!message) {
      resolve(response);
      return;
    }

    const telegram = startBot();
    const { chat, text, photo } = message;
    console.info(`Message from ${chat.id}: ${JSON.stringify(message)}`);

    if (!text && !photo) {
      await sendMessage(telegram, chat.id, "Falsche Eingabe 😞");
      resolve(response);
      return;
    }

    const answer = findCommand(text);
    if (answer) {
      await sendMessage(telegram, chat.id, answer.text);
      resolve(response);
      return;
    }

    await lambda.startTelegramApi({
      chatId: chat.id,
      message,
    });

    resolve(response);
  });
};

module.exports.telegramApi = ({ body }) => {
  return new Promise(async (resolve, reject) => {
    const telegram = startBot();

    const { chatId, message } = body;
    const notificationId = await sendMessage(
      telegram,
      chatId,
      "Eingabe wird validiert..."
    );

    const code = await parseInput(
      telegram,
      chatId,
      notificationId,
      message
    ).catch(e => console.error(e.message));

    await editMessage(telegram, chatId, notificationId, "Starte Umfrage... 🏋️‍♂️");

    if (!code || !mcDonalds.verifyCode(code)) {
      await editMessage(telegram, chatId, notificationId, "Falsche Eingabe 😞");
      resolve("Wrong Code");
      return;
    }

    const file = await mcDonalds
      .doSurvey(code, statusUpdate(telegram, chatId, notificationId))
      .catch(async error => {
        let errorMessage = error.msg;
        if (error.status === 500) {
          await notifyAdmins(telegram, error.msg, message);
          errorMessage = "Ein unbekannter Fehler ist aufgetreten 😞";
        }
        await editMessage(telegram, chatId, notificationId, errorMessage);
      });

    if (!file) {
      resolve(`Success`);
      return;
    }

    fs.writeFileSync("/tmp/coupon.pdf", file);

    await deleteMessage(telegram, chatId, notificationId);
    await sendDocument(telegram, chatId, "/tmp/coupon.pdf");

    resolve("Success");
  });
};
