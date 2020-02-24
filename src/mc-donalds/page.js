const time = require("../utils/time");

module.exports.load = async (page, percentage) => {
  await page.waitForSelector(".progress-number");
  return await page.waitForFunction(
    `document.getElementsByClassName("progress-number")[0].innerText.toString() === "${percentage}"`
  );
};

module.exports.next = page =>
  page.evaluate(() => document.getElementById("next-sbj-btn").click());

module.exports.login = async (page, code) => {
  await page.waitForSelector("#receiptCode");

  const input = await page.$("#receiptCode");
  await input.focus();
  await page.keyboard.type(code, {
    delay: 50,
  });
  await time.delay(100);
  const button = await page.$("button");
  button.click();
};
