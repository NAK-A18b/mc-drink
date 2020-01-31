"use strict";
const fs = require("fs");

const lambda = require("./src/lambda");
const telegram = require("./src/telegram");
const mcDonalds = require("./src/mcDonalds");
const { Commands } = require("./src/bot");

const response = body => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

module.exports.telegramBot = ({ body }) => {
  return new Promise(async (resolve, _) => {
    const { message } = process.env.IS_LOCAL ? body : JSON.parse(body);
    if (!message) {
      resolve(response("Success"));
      return;
    }

    const { chat, text } = message;
    if (!text || !chat) {
      resolve(response("Success"));
      return;
    }

    console.info(`Message from ${chat.id}: ${text}`);
    telegram.start();

    if (!text.startsWith("/")) {
      await lambda.startTelegramApi(chat.id, text).promise();
      resolve(response("Success"));
      return;
    }

    const answer = Commands.find(({ cmd }) => cmd === text.toLocaleLowerCase());
    if (answer) {
      await telegram.sendMessage(chat.id, answer.text);
    }

    resolve(response("Success"));
  });
};

module.exports.telegramApi = ({ body }) => {
  return new Promise(async (resolve, reject) => {
    telegram.start();
    const { chatId, code } = body;

    const apiError = async msg => {
      await telegram.editMessage(chatId, messageId, msg);
      resolve(msg);
      return;
    };

    const messageId = await telegram.sendMessage(chatId, "Starting Survey...");

    if (!mcDonalds.verifyCode(code)) {
      await apiError("Wrong Code");
      reject("Wrong Code");
      return;
    }

    const file = await mcDonalds
      .doSurvey(code, telegram.statusUpdate(chatId, messageId))
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

    await telegram.deleteMessage(chatId, messageId);
    await telegram.sendDocument(chatId, "/tmp/coupon.pdf");

    resolve("Success");
  });
};
