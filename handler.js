"use strict";
const fs = require("fs");

const {
  handleTelegramBotRequest,
  handleTelegramApiRequest,
} = require("./src/telegram/handler");

// Create tmp directory for local development
if (!fs.existsSync("/tmp")) {
  fs.mkdir("/tmp");
}

// Handles http requests to /telegram endpoint
module.exports.telegramBot = payload => handleTelegramBotRequest(payload);

// Handles lambda invocations triggeres by telegramBot Function
module.exports.telegramApi = payload => handleTelegramApiRequest(payload);
