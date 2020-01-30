const telegram = require("telegram-bot-api");

let api;

module.exports.start = () => {
  api = new telegram({
    token: process.env.BOT_TOKEN,
  });
  return api;
};

module.exports.sendMessage = (id, text) =>
  api
  .sendMessage({
    chat_id: id,
    text,
  })
  .then(res => res.message_id);

module.exports.statusUpdate = (chatId, messageId) => percentage => {
  if (!messageId) {
    return;
  } else {
    return api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `⏳ ${percentage}%`,
    });
  }
};

module.exports.deleteMessage = (chatId, messageId) =>
  api.deleteMessage({
    chat_id: chatId,
    message_id: messageId,
  });

module.exports.sendDocument = (chatId, file) =>
  api.sendDocument({
    chat_id: chatId,
    document: file,
  });

module.exports.editMessage = (chatId, messageId, message) =>
  api.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: message,
  });