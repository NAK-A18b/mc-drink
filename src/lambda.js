const aws = require("aws-sdk");
const dev = require("./utils/dev");

const lambda = new aws.Lambda({
  region: "eu-central-1",
  endpoint: dev.isLocal() ? "http://localhost:3002" : undefined,
});

module.exports.startTelegramApi = (chatId, code) =>
  lambda.invoke({
    FunctionName: "McDrink-dev-telegramApi",
    InvocationType: "Event",
    Payload: JSON.stringify({
      body: {
        chatId,
        code,
      },
    }),
  });
