const chromium = require("chrome-aws-lambda");

const ratings = require("./ratings");
const pageControlls = require("./page");
const time = require("./utils/time");
const dev = require("./utils/dev");

const pages = require("../resources/pages.json");

const chromepath = dev.isLocal() && process.env.CHROME_PATH;

module.exports.verifyCode = code => code.match(/^(\S{4})-?(\S{4})-?(\S{4})$/);

const startBrowser = async () =>
  chromium.puppeteer.launch({
    args: chromium.args,
    executablePath: chromepath || (await chromium.executablePath),
    headless: !process.env.IS_LOCAL,
  });

module.exports.doSurvey = (code, statusCallback) => {
  return new Promise(async (resolve, reject) => {
    const browser = await startBrowser();
    const page = await browser.newPage();
    await page.goto("https://mcdonalds.fast-insight.com/voc/de/de");

    await pageControlls.login(page, code);
    await time.delay(500);

    const error = await page.$eval(
      "#errorMessage strong",
      element => element.innerHTML
    );

    if (error) {
      await browser.close();
      return reject(error);
    }

    ratings.setup(page);
    for (let index = 0; index < pages.length; index++) {
      const { percentage, action, ...rest } = pages[index];

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
