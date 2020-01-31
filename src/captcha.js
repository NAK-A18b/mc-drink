const fetch = require("node-fetch");
const time = require("./utils/time");

const dataSiteKey = "6LfZ43cUAAAAAKTRpN6xjp9Fd7nZVDY86nUA-Zmh"
const captchaKey = process.env.CAPTCHA_KEY

module.exports.solve = async page => {
  console.info("Starting captcha");

  const url = page.url();
  const res = await fetch(`https://2captcha.com/in.php?key=${captchaKey}&method=userrecaptcha&googlekey=${dataSiteKey}&pageurl=${url}&json=1`)
    .then(res => res.json())

  await time.delay(20000);
  const captchaId = res.request;
  let solution = await fetch(`https://2captcha.com/res.php?key=${captchaKey}&action=get&id=${captchaId}&json=1`).then(res => res.json());
  let count = 0;

  while (solution.request === "CAPCHA_NOT_READY" && count < 20) {
    await time.delay(5000);
    solution = await fetch(`https://2captcha.com/res.php?key=${captchaKey}&action=get&id=${captchaId}&json=1`).then(res => res.json());
    count++;
    console.info(solution)
  }

  return page.evaluate(token => {
    ___grecaptcha_cfg.clients[0].$.H.callback(token);
    document.getElementById("g-recaptcha-response").innerHTML = token;
  }, solution.request);
}