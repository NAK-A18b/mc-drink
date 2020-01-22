const fetch = require("node-fetch");

const requestUrl = (method, token = botToken) =>
  `https://api.telegram.org/bot${token}/${method}`;

const setHook = webhookUrl =>
  fetch(
    requestUrl("setWebhook"), {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    }
  );

const getInfo = () =>
  fetch(
    requestUrl("getWebhookInfo")
  );