const fetch = require("node-fetch");
const time = require("./utils/time");

const captchaKey = process.env.CAPTCHA_KEY;

const twoCaptchaInUrl = "https://2captcha.com/in.php";
const twoCaptchaResUrl = "https://2captcha.com/res.php";

const twoCaptchaInParams = (siteKey, url) =>
  `key=${captchaKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${url}&json=1`;

const twoCaptchaResParams = captchaId =>
  `key=${captchaKey}&action=get&id=${captchaId}&json=1`;

const startTwoCaptchaApi = (siteKey, url) =>
  fetch(`${twoCaptchaInUrl}?${twoCaptchaInParams(siteKey, url)}`).then(res =>
    res.json()
  );

const captchaSolvingTimeout = async statusCallback => {
  let intervalCount = 5;
  const interval = setInterval(async () => {
    // notify user every second for 20 seconds
    await statusCallback(
      `🤖 Verbindung zum Captchaserver wird aufgebaut... ${intervalCount}%`
    );
    intervalCount += 5;
  }, 1000);

  await time.delay(20000);
  clearInterval(interval);
};

const captchaSolution = captchaId =>
  fetch(`${twoCaptchaResUrl}?${twoCaptchaResParams(captchaId)}`).then(res =>
    res.json()
  );

const dataSiteKey = async page => {
  const iframeHandle = await page.$("iframe");
  const srcHandle = await iframeHandle.getProperty("src");
  const src = await srcHandle.jsonValue();
  return new URL(src).searchParams.get("k");
};

module.exports.solve = async (page, statusCallback) => {
  console.info("Starting captcha");

  // retrive recaptcha datasiteKey from page
  const siteKey = await dataSiteKey(page);
  console.log("sitekey ", siteKey);

  // request 2CaptchaApi start
  const startApiResponse = await startTwoCaptchaApi(siteKey, page.url());

  // timeout for 20 seconds while the captcha gets solved
  await captchaSolvingTimeout(statusCallback);
  await statusCallback(`🤖 Captcha wird gelöst...`);

  // request 2CaptchaApi solution
  const captchaId = startApiResponse.request;
  let solution = await captchaSolution(captchaId);
  console.info(solution);

  // request captcha solution every 5 seconds
  let retryCount = 1;
  while (solution.request === "CAPCHA_NOT_READY" && retryCount <= 30) {
    await statusCallback(`🤖 Captcha wird gelöst. Versuch: ${retryCount}/30`);
    await time.delay(5000);
    solution = await captchaSolution(captchaId);
    retryCount++;
    console.info(solution);
  }

  await statusCallback(`🤖 Captcha gelöst 🥳 warte auf Gutscheincode...`);

  // executes search algorithm in client to find recaptcha callback
  return page.evaluate(token => {
    let checked = [];
    const findCallback = theObject => {
      let result = null;
      if (theObject instanceof Array) {
        for (var i = 0; i < theObject.length; i++) {
          result = findCallback(theObject[i]);
          if (result) {
            break;
          }
        }
      } else {
        for (var prop in theObject) {
          if (prop == "callback") {
            return theObject[prop];
          }

          if (
            !checked.includes(prop) &&
            (theObject[prop] instanceof Object ||
              theObject[prop] instanceof Array)
          ) {
            checked.push(prop);
            result = findCallback(theObject[prop]);
            if (result) {
              return result;
            }
          }
        }
        return;
      }

      return result;
    };

    const callback = findCallback(___grecaptcha_cfg);
    if (callback) callback(token);
    document.getElementById("g-recaptcha-response").innerHTML = token;
  }, solution.request);
};