const telegram = require("telegram-bot-api");
const fs = require("fs");

const { startTelegramApi, SUCCESS_REPONSE } = require("../aws/lambda");
const {
  handleCallbackQuery,
  parseInput,
  statusUpdate,
  inlineButton,
} = require("./index");
const { doSurvey, verifyCode } = require("../mc-donalds");
const { notifyAdmins } = require("../telegram/monitoring");
const { findCommand } = require("../bot");
const { isLocal } = require("../utils/dev");

const { BOT_TOKEN } = process.env;

module.exports.handleTelegramBotRequest = ({ body }) => {
  return new Promise(async (resolve, _) => {
    const payload = isLocal() ? body : JSON.parse(body);
    console.log(payload);

    const telegramApi = new telegram({
      token: BOT_TOKEN,
    });

    if (payload.callback_query) {
      handleCallbackQuery(telegramApi, payload.callback_query);
      resolve(SUCCESS_REPONSE);
      return;
    }

    if (!payload.message) {
      resolve(SUCCESS_REPONSE);
      return;
    }

    const { chat, text, photo } = payload.message;
    console.info(`Message from ${chat.id}: ${JSON.stringify(payload.message)}`);

    if (!text && !photo) {
      await telegramApi.sendMessage({
        chat_id: chat.id,
        text: "Falsche Eingabe 😞",
      });

      resolve(SUCCESS_REPONSE);
      return;
    }

    const answer = findCommand(text);
    if (answer) {
      await telegramApi.sendMessage({
        chat_id: chat.id,
        text: answer.text,
      });

      resolve(SUCCESS_REPONSE);
      return;
    }

    await startTelegramApi({
      chatId: chat.id,
      message: payload.message,
    });

    resolve(SUCCESS_REPONSE);
  });
};

module.exports.handleTelegramApiRequest = ({ body }) => {
  return new Promise(async (resolve, reject) => {
    const telegramApi = new telegram({
      token: BOT_TOKEN,
    });

    const { chatId, message } = body;
    const notificationId = await telegramApi
      .sendMessage({
        chat_id: chatId,
        text: "Eingabe wird validiert...",
      })
      .then(res => res.message_id);

    const code = await parseInput(
      telegramApi,
      chatId,
      notificationId,
      message
    ).catch(e => console.error(e.message));

    if (!code || !verifyCode(code)) {
      await telegramApi.editMessageText({
        chat_id: chatId,
        message_id: notificationId,
        text: "Falsche Eingabe 😞",
      });

      resolve("Wrong Code");
      return;
    }

    const file = await doSurvey(
      code,
      statusUpdate(telegramApi, chatId, notificationId)
    ).catch(async error => {
      let errorMessage = error.msg;
      if (error.status === 500) {
        await notifyAdmins(telegramApi, error.msg, message);
        errorMessage = "Ein unbekannter Fehler ist aufgetreten 😞";
      }

      await telegramApi.editMessageText({
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

    await telegramApi.deleteMessage({
      chat_id: chatId,
      message_id: notificationId,
    });

    await telegramApi.sendDocument({
      chat_id: chatId,
      document: "/tmp/coupon.pdf",
      ...inlineButton("eingelöst ✅", "REMOVE_CALLBACK"),
    });

    resolve("Success");
  });
};
