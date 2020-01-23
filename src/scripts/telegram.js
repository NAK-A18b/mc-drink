const fetch = require("node-fetch");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const requestUrl = (method, token) =>
  `https://api.telegram.org/bot${token}/${method}`;

const setHook = webhookUrl =>
  fetch(requestUrl("setWebhook"), {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
    }),
  });

const getInfo = () => fetch(requestUrl("getWebhookInfo"));
