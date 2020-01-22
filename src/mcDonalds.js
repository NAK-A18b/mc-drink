const chromium = require("chrome-aws-lambda");

const ratings = require("./ratings");
const pageControlls = require("./page");
const time = require("./utils/time");

const pages = require("../pages.json");

const chromepath = process.env.IS_LOCAL && process.env.CHROME_PATH;

module.exports.verifyCode = code => code.match(/^(\S{4})-?(\S{4})-?(\S{4})$/);

const startBrowser = async () => {
  return chromium.puppeteer.launch({
    args: chromium.args,
    executablePath: chromepath || (await chromium.executablePath),
    headless: !process.env.IS_LOCAL,
  });
};

module.exports.doSurvey = (code, statusCallback) => {
  return new Promise(async (resolve, reject) => {
    const browser = await startBrowser();
    const page = await browser.newPage();
    await page.goto("https://mcdonalds.fast-insight.com/voc/de/de");

    await pageControlls.login(page, code);
    await time.delay(500);
    const error = await page.$("#errorMessage");
    if (error) {
      await browser.close();
      return reject("Wrong Code");
    }

    ratings.setup(page);

    for (let index = 0; index < pages.length; index++) {
      const {
        percentage,
        action,
        ...rest
      } = pages[index];

      await statusCallback(percentage);
      await pageControlls.load(page, percentage);
      await ratings[action](rest);
      await time.delay(500);
      await pageControlls.next(page);
    }

    const screen = await page.screenshot();
    // await browser.close();
    resolve(screen);
  });
};