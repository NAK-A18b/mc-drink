const fetch = require("node-fetch");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const file = fs.readFileSync(path.resolve(__dirname, '../../secrets/secrets.yml'), 'utf8')
const secrets = YAML.parse(file);

const requestUrl = (
    method,
    token
) => `https://api.telegram.org/bot${token}/${method}`;

const getInfo = async () => await fetch(requestUrl("getWebhookInfo", secrets.BOT_TOKEN));
getInfo().then(res => res.json()).then(console.log)