const fetch = require("node-fetch");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const file = fs.readFileSync(
  path.resolve(__dirname, `../../../secrets/${process.env.STAGE}-secrets.yml`),
  "utf8"
);
const secrets = YAML.parse(file);

const requestUrl = (method, token) =>
  `https://api.telegram.org/bot${token}/${method}`;

const setHook = webhookUrl =>
  fetch(requestUrl("setWebhook", secrets.BOT_TOKEN), {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
    }),
  });

setHook(secrets.LAMBDA_PATH)
  .then(res => res.json())
  .then(console.log);
