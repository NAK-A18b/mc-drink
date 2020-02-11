const fetch = require("node-fetch");
const time = require("./utils/time");

const dataSiteKey = "6LfZ43cUAAAAAKTRpN6xjp9Fd7nZVDY86nUA-Zmh"
const captchaKey = process.env.CAPTCHA_KEY

module.exports.solve = async (page, statusCallback) => {
  console.info("Starting captcha");

  const url = page.url();
  const res = await fetch(`https://2captcha.com/in.php?key=${captchaKey}&method=userrecaptcha&googlekey=${dataSiteKey}&pageurl=${url}&json=1`)
    .then(res => res.json())

  let intervalCount = 0;
  const interval = setInterval(async () => {
    await statusCallback(`🤖 Verbindung zum Captchaserver wird aufgebaut... ${intervalCount}%`);
    intervalCount += 5;
  }, 1000)
  await time.delay(20000);
  clearInterval(interval);

  const captchaId = res.request;
  let solution = await fetch(`https://2captcha.com/res.php?key=${captchaKey}&action=get&id=${captchaId}&json=1`).then(res => res.json());

  let retryCount = 0;
  while (solution.request === "CAPCHA_NOT_READY" && retryCount < 30) {
    await time.delay(5000);
    solution = await fetch(`https://2captcha.com/res.php?key=${captchaKey}&action=get&id=${captchaId}&json=1`).then(res => res.json());
    retryCount++;
    await statusCallback(`🤖 Captcha wird gelöst: ${retryCount}/30`);
    console.info(solution)
  }

  await statusCallback(`🤖 Captcha gelöst 🥳 warte auf Gutscheincode...`);
  return page.evaluate(token => {
    let checked = [];
    const findCallback = (theObject) => {

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

          if (prop == 'callback') {
            return theObject[prop];
          }

          if (!checked.includes(prop) && (theObject[prop] instanceof Object || theObject[prop] instanceof Array)) {
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
    }

    const callback = findCallback(___grecaptcha_cfg);
    callback(token);
    document.getElementById("g-recaptcha-response").innerHTML = token;
  }, solution.request);
}