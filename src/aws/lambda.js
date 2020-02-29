const AWS = require("aws-sdk");

const dev = require("../utils/dev");

const lambda = new AWS.Lambda({
  region: "eu-central-1",
  endpoint: dev.isLocal() ? "http://localhost:3002" : undefined,
});

module.exports.startTelegramApi = args =>
  lambda
    .invoke({
      FunctionName: `McDrink-${process.env.STAGE}-telegramApi`,
      InvocationType: "Event",
      Payload: JSON.stringify({
        body: args,
      }),
    })
    .promise();

module.exports.SUCCESS_REPONSE = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Success",
  }),
};
