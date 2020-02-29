const telegram = require("telegram-bot-api");
const fetch = require("node-fetch");

const ocr = require("../aws/ocr");

const { BOT_TOKEN } = process.env;

module.exports.start = () =>
  new telegram({
    token: BOT_TOKEN,
  });

module.exports.inlineButton = (text, id) => ({
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: text, callback_data: id }]],
  }),
});

module.exports.statusUpdate = (api, chatId, messageId) => progress => {
  if (!messageId) {
    return;
  } else {
    return api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: progress,
    });
  }
};

module.exports.fileUrl = filePath =>
  `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

module.exports.parseInput = async (
  telegramApi,
  chatId,
  notificationId,
  inputMessage
) => {
  if (inputMessage.text) {
    await telegramApi.editMessageText({
      chat_id: chatId,
      message_id: notificationId,
      text: "Starte Umfrage... 🏋️‍♂️",
    });

    return inputMessage.text;
  }

  if (inputMessage.photo) {
    const { photo } = inputMessage;

    await telegramApi.editMessageText({
      chat_id: chatId,
      message_id: notificationId,
      text: "Suche deinen Code... 🕵️‍♂️",
    });

    const filePath = await telegramApi
      .getFile({
        file_id: photo[photo.length - 1].file_id,
      })
      .then(res => res.file_path);

    const code = await fetch(this.fileUrl(filePath))
      .then(res => res.buffer())
      .then(ocr.findCode);

    await telegramApi.editMessageText({
      chat_id: chatId,
      message_id: notificationId,
      text: `${code ? `Code: ${code} | ` : ""}Starte Umfrage... 🏋️‍♂️`,
    });

    return code;
  }
};
