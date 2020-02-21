const telegram = require("./telegram");
const path = require("path");

const ADMINS = [876296520];

module.exports.notifyAdmins = (telegramApi, msg) =>
  Promise.all(
    ADMINS.map(async chatId => {
      await telegram.sendDocument(
        telegramApi,
        chatId,
        path.resolve(__dirname, "../tmp/error.pdf")
      );
      return await telegram.sendMessage(telegramApi, chatId, msg);
    })
  );
