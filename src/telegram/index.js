const telegram = require("telegram-bot-api");
const fetch = require("node-fetch");

const ocr = require("../aws/ocr");

const { BOT_TOKEN } = process.env;

module.exports.startBot = () =>
  new telegram({
    token: BOT_TOKEN,
  });

module.exports.inlineButton = (text, id) => ({
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: text, callback_data: id }]],
  }),
});

module.exports.sendMessage = (api, id, text, args) =>
  api
    .sendMessage({
      chat_id: id,
      text,
      ...args,
    })
    .then(res => res.message_id);

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

module.exports.deleteMessage = (api, chatId, messageId) =>
  api.deleteMessage({
    chat_id: chatId,
    message_id: messageId,
  });

module.exports.sendDocument = (api, chatId, file) =>
  api.sendDocument({
    chat_id: chatId,
    document: file,
  });

module.exports.editMessage = (api, chatId, messageId, message, args) =>
  api.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: message,
    ...args,
  });

module.exports.getFilePath = (api, fileId) =>
  api
    .getFile({
      file_id: fileId,
    })
    .then(res => res.file_path);

module.exports.fileUrl = filePath =>
  `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

module.exports.parseInput = async (api, chatId, messageId, message) => {
  if (message.text) {
    await this.editMessage(api, chatId, messageId, "Starte Umfrage... 🏋️‍♂️");
    return message.text;
  }

  if (message.photo) {
    const { photo } = message;
    await this.editMessage(api, chatId, messageId, "Suche deinen Code... 🕵️‍♂️");

    const filePath = await this.getFilePath(
      api,
      photo[photo.length - 1].file_id
    );

    const code = await fetch(this.fileUrl(filePath))
      .then(res => res.buffer())
      .then(ocr.findCode);

    await this.editMessage(
      api,
      chatId,
      messageId,
      `${code ? `Code: ${code} | ` : ""}Starte Umfrage... 🏋️‍♂️`
    );
    return code;
  }
};
