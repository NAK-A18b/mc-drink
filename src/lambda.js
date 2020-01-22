const aws = require("aws-sdk");

const lambda = new aws.Lambda({
  region: "eu-central-1",
});

module.exports.startTelegramApi = (chatId, code) => {
  lambda.invoke({
    FunctionName: "McDrink-dev-telegramApi",
    Payload: JSON.stringify({
      chatId,
      code,
    }),
  });
};
