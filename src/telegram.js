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
      text: `${percentage}%`,
    });
  }
};

module.exports.deleteMessage = (chatId, messageId) =>
  api.deleteMessage({
    chat_id: chatId,
    message_id: messageId,
  });

module.exports.sendPhoto = (chatId, photoPath) =>
  api.sendPhoto({
    chat_id: chatId,
    photo: photoPath,
  });

module.exports.editMessage = (chatId, messageId, message) =>
  api.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: message,
  });