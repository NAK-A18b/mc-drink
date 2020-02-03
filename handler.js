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
const { findCommand } = require("./src/bot");

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
      resolve(response);
      await sendMessage(telegram, chat.id, answer.text);
      return;
    }

    await lambda.startTelegramApi({
      chatId: chat.id,
      text,
      photo,
    });

    resolve(response);
  });
};

module.exports.telegramApi = ({ body }) => {
  return new Promise(async (resolve, reject) => {
    const telegram = startBot();

    const { chatId, photo, text } = body;
    const code = await parseInput(telegram, chatId, text, photo);

    const apiError = async msg => {
      await editMessage(telegram, chatId, messageId, `${msg} 😞`);
      resolve(msg);
      return;
    };

    const messageId = await sendMessage(
      telegram,
      chatId,
      "Starte Umrage... 🏋️‍♂️"
    );

    if (!code || !mcDonalds.verifyCode(code)) {
      await apiError("Falsche Eingabe");
      reject("Wrong Code");
      return;
    }

    const file = await mcDonalds
      .doSurvey(code, statusUpdate(telegram, chatId, messageId))
      .catch(error => ({
        error,
      }));

    if (file.error) {
      await apiError(file.error);
      reject(file.error);
      return;
    }

    if (!fs.existsSync("/tmp")) fs.mkdir("/tmp");
    fs.writeFileSync("/tmp/coupon.pdf", file);

    await deleteMessage(telegram, chatId, messageId);
    await sendDocument(telegram, chatId, "/tmp/coupon.pdf");

    resolve("Success");
  });
};
