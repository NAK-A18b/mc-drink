const ADMINS = [876296520];

module.exports.notifyAdmins = (telegramApi, error, message) =>
  Promise.all(
    ADMINS.map(async chatId => {
      await telegramApi.sendMessage({
        chat_id: chatId,
        text: "Admin notification: ",
      });

      await telegramApi.sendDocument({
        chat_id: chatId,
        document: "/tmp/error.pdf",
      });

      return await telegramApi.sendMessage({
        chat_id: chatId,
        text: `Error bei ${message.from.first_name}: ${error}`,
      });
    })
  );
