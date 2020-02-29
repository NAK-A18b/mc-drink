"use strict";
const fs = require("fs");

const lambda = require("./src/aws/lambda");
const {
  start,
  parseInput,
  statusUpdate,
  inlineButton,
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
    const telegram = start();

    if (
      payload.callback_query &&
      payload.callback_query.data === "REMOVE_CALLBACK"
    ) {
      try {
        const { id, message: callbackMessage } = payload.callback_query;
        await telegram.answerCallbackQuery({
          callback_query_id: id,
        });

        await telegram.deleteMessage({
          chat_id: callbackMessage.chat.id,
          message_id: callbackMessage.message_id,
        });

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
      await telegram.sendMessage({
        chat_id: chat.id,
        text: "Falsche Eingabe 😞",
      });
      resolve(response);
      return;
    }

    const answer = findCommand(text);
    if (answer) {
      await telegram.sendMessage({
        chat_id: chat.id,
        text: answer.text,
      });
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
    const telegram = start();

    const { chatId, message } = body;

    const notificationId = await telegram
      .sendMessage({
        chat_id: chatId,
        text: "Eingabe wird validiert...",
      })
      .then(res => res.message_id);

    const code = await parseInput(
      telegram,
      chatId,
      notificationId,
      message
    ).catch(e => console.error(e.message));

    if (!code || !mcDonalds.verifyCode(code)) {
      await telegram.editMessageText({
        chat_id: chatId,
        message_id: notificationId,
        text: "Falsche Eingabe 😞",
      });
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
        await telegram.editMessageText({
          chat_id: chatId,
          message_id: notificationId,
          text: errorMessage,
        });
      });

    if (!file) {
      resolve(`Success`);
      return;
    }

    fs.writeFileSync("/tmp/coupon.pdf", file);

    await telegram.deleteMessage({
      chat_id: chatId,
      message_id: notificationId,
    });
    await telegram.sendDocument({
      chat_id: chatId,
      document: "/tmp/coupon.pdf",
    });

    resolve("Success");
  });
};
