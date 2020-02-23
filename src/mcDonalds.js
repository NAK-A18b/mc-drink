const chromium = require("chrome-aws-lambda");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const ratings = require("./ratings");
const pageControlls = require("./page");

const time = require("./utils/time");
const dev = require("./utils/dev");

const pages = require("../resources/pages.json");

const chromepath = dev.isLocal() && process.env.CHROME_PATH;

module.exports.findCode = text => {
  if (!text) return;

  const matches = text.match(/(\S{4})-(\S{4})-(\S{4})/);
  if (matches) return matches[0];
};

module.exports.verifyCode = code => code.match(/^(\S{4})-?(\S{4})-?(\S{4})$/);

const startBrowser = async () =>
  chromium.puppeteer.launch({
    args: dev.isLocal() ? [] : chromium.args,
    executablePath: chromepath || (await chromium.executablePath),
    headless: !dev.isLocal(),
  });

module.exports.doSurvey = (code, statusCallback) => {
  return new Promise(async (resolve, reject) => {
    const browser = await startBrowser();
    const page = await browser.newPage();

    try {
      await page.goto("https://mcdonalds.fast-insight.com/voc/de/de");
      await pageControlls.login(page, code);
      await time.delay(1000);

      const hasError = await page.$("#errorMessage");
      if (hasError) {
        const error = await page.$eval(
          "#errorMessage strong",
          element => element.innerHTML
        );

        await browser.close();
        reject(error);
        return;
      }

      for (let index = 0; index < pages.length; index++) {
        const { percentage, action, message } = pages[index];

        await statusCallback(`⏳ ${message || `${percentage}%`}`);
        await pageControlls.load(page, percentage);
        await ratings[action](page, statusCallback);
        await time.delay(500);
        await pageControlls.next(page);
      }

      await time.delay(500);
      await page.waitForNavigation({
        waitUntil: "networkidle0",
      });
      await page.waitForSelector("#lblCode1");

      const spanElement = await page.$("#lblCode1");
      const textHandle = await spanElement.getProperty("innerText");
      const text = await textHandle.jsonValue();

      const file = await fetch(
        `https://survey.fast-insight.com/mcd/germany/coupon_pdf.php?code=${text}`
      ).then(res => res.buffer());

      await browser.close();
      resolve(file);
    } catch (e) {
      if (!dev.isLocal()) {
        const print = await page.pdf();
        fs.writeFileSync("/tmp/error.pdf", print);
      }

      console.error("Error while doing survey: ", e.message);
      reject(`Error while doing survey: ${e.message}`);
    }
  });
};
