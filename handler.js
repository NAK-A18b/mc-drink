"use strict";
const chromium = require("chrome-aws-lambda");

const ratings = require('./src/ratings');
const pageControlls = require('./src/page');
const time = require('./src/utils/time')
const pages = require('./pages.json');

const CODE = "bvlt-dg1p-92gf";
const chromepath = process.env.IS_LOCAL && process.env.CHROME_PATH;

const login = async (page) => {
  await page.waitForSelector("#receiptCode");

  const input = await page.$("#receiptCode");
  await input.focus();
  await page.keyboard.type(CODE, {
    delay: 50
  });
  await time.delay(500);
  const button = await page.$("button");
  button.click();
};

module.exports.handler = async (event, context, callback) => {
  const browser = await chromium.puppeteer.launch({
    executablePath: chromepath || await chromium.executablePath,
    headless: false
  });

  try {
    const page = (await browser.pages())[0];
    await page.goto("https://mcdonalds.fast-insight.com/voc/de/de");
    await login(page);
    ratings.setup(page);

    for (let index = 0; index < pages.length; index++) {
      const {
        percentage,
        action,
        ...rest
      } = pages[index];

      await pageControlls.load(page, percentage);
      await ratings[action](rest);
      await time.delay(1000);
      await pageControlls.next(page);
    }
  } catch (e) {
    console.error("Error: ", e);
  }

  callback(null, "nice");
};