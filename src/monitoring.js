const telegram = require("./telegram");

const ADMINS = [876296520];

module.exports.notifyAdmins = (telegramApi, error, message) =>
  Promise.all(
    ADMINS.map(async chatId => {
      await telegram.sendMessage(telegramApi, chatId, "Admin notification: ");
      await telegram.sendDocument(telegramApi, chatId, "/tmp/error.pdf");
      return await telegram.sendMessage(
        telegramApi,
        chatId,
        `Error bei ${message.from.first_name}: ${error}`
      );
    })
  );