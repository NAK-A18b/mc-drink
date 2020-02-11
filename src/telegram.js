const telegram = require("telegram-bot-api");
const tesseract = require("./tesseract");

const {
  BOT_TOKEN
} = process.env;

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

module.exports.parseInput = async (api, chatId, text, photo) => {
  if (text) {
    return text;
  }

  if (photo) {
    await this.sendMessage(api, chatId, `Suche deinen Code... 🕵️‍♂️`);
    const filePath = await this.getFilePath(
      api,
      photo[photo.length - 1].file_id
    );
    const photoUrl = this.fileUrl(filePath);
    const code = await tesseract.getCode(photoUrl);

    if (code) await this.sendMessage(api, chatId, `Code erkannt: ${code} 🥳`);
    return code;
  }
};