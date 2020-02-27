"use strict";
const fs = require("fs");

const lambda = require("./src/aws/lambda");
const {
  startBot,
  sendMessage,
  parseInput,
  editMessage,
  statusUpdate,
  deleteMessage,
  sendDocument,
} = require("./src/telegram");
const mcDonalds = require("./src/mc-donalds");
const { notifyAdmins } = require("./src/telegram/monitoring");
const { findCommand } = require("./src/bot");
const { isLocal } = require("./src/utils/dev");

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
    const payload = isLocal() ? body : JSON.parse(body);
    console.log(payload);
    const telegram = startBot();

    if (
      payload.callback_query &&
      payload.callback_query.data === "REMOVE_CALLBACK"
    ) {
      try {
        const { id, message: callbackMessage } = payload.callback_query;
        console.log(id);
        await telegram.answerCallbackQuery({
          callback_query_id: id,
        });
        await deleteMessage(
          telegram,
          callbackMessage.chat.id,
          callbackMessage.message_id
        );
        resolve(response);
      } catch (e) {
        console.error(e);
        resolve(response);
      }
      return;
    }

    if (!payload.message) {
      resolve(response);
      return;
    }

    const { chat, text, photo } = payload.message;
    console.info(`Message from ${chat.id}: ${JSON.stringify(payload.message)}`);

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
      message: payload.message,
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
