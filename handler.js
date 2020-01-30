"use strict";
const fs = require("fs");

const lambda = require("./src/lambda");
const telegram = require("./src/telegram");
const mcDonalds = require("./src/mcDonalds");
const bot = require("./src/bot");

const response = body => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

module.exports.telegramBot = async ({ body }) => {
  const { message } = process.env.IS_LOCAL ? body : JSON.parse(body);
  if (!message) return response("Success");

  const { chat, text } = message;
  if (!text || !chat) return response("Success");

  console.info(`Message from ${chat.id}: ${message}`);
  telegram.start();

  if (!text.startsWith("/")) {
    lambda.startTelegramApi(chat.id, text).send();
    return response("Success");
  }

  const answer = bot.Commands.find(
    ({ cmd }) => cmd === text.toLocaleLowerCase()
  );
  if (answer) await telegram.sendMessage(chat.id, answer.text);

  return response("Success");
};

module.exports.telegramApi = async ({ body }) => {
  telegram.start();
  const { chatId, code } = body;

  const apiError = async msg => {
    await telegram.editMessage(chatId, messageId, msg);
    return response(msg);
  };

  const messageId = await telegram.sendMessage(chatId, "Starting Survey...");

  if (!mcDonalds.verifyCode(code)) return await apiError("Wrong Code");

  const file = await mcDonalds
    .doSurvey(code, telegram.statusUpdate(chatId, messageId))
    .catch(error => ({
      error,
    }));

  if (file.error) return await apiError(file.error);

  if (!fs.existsSync("/tmp")) fs.mkdir("/tmp");
  fs.writeFileSync("/tmp/coupon.pdf", file);

  await telegram.deleteMessage(chatId, messageId);
  await telegram.sendDocument(chatId, "/tmp/coupon.pdf");

  return response("Success");
};

module.exports.test = () => {
  console.log("test lamba");
  return response("Success");
};
