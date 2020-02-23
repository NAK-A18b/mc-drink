const telegram = require("telegram-bot-api");
const fetch = require("node-fetch");

const ocr = require("./ocr");

const { BOT_TOKEN } = process.env;

module.exports.startBot = () =>
  new telegram({
    token: BOT_TOKEN,
  });

module.exports.sendMessage = (api, id, text) =>
  api
    .sendMessage({
      chat_id: id,
      text,
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

module.exports.editMessage = (api, chatId, messageId, message) =>
  api.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: message,
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
    return message.text;
  }

  if (message.photo) {
    const { photo } = message;
    await this.editMessage(api, chatId, messageId, `Suche deinen Code... 🕵️‍♂️`);

    const filePath = await this.getFilePath(
      api,
      photo[photo.length - 1].file_id
    );
    const photoBuffer = await fetch(this.fileUrl(filePath)).then(res =>
      res.buffer()
    );

    const code = await ocr.findCode(photoBuffer);
    if (code) {
      await this.editMessage(
        api,
        chatId,
        messageId,
        `Code erkannt: ${code} 🥳`
      );
    }

    return code;
  }
};
