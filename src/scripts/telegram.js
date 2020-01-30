const fetch = require("node-fetch");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const requestUrl = (
  method,
  token = "1005974482:AAFzDYD0N2q_ZpXLkIYbD7fUPRQq1ON6BRU"
) => `https://api.telegram.org/bot${token}/${method}`;

const setHook = webhookUrl =>
  fetch(requestUrl("setWebhook"), {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url:
        "https://j6koy6snn4.execute-api.eu-central-1.amazonaws.com/dev/telegram",
    }),
  });

const getInfo = async () => await fetch(requestUrl("getWebhookInfo"));
// getInfo().then(res => res.json()).then(console.log)
// setHook().then(res => res.json()).then(console.log)
