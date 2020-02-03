const message = require("./utils/message");
const captcha = require("./captcha");

module.exports.starRating = page =>
  page.evaluate(() => {
    const star = document.getElementsByClassName("rating")[2];
    return star.click();
  });

module.exports.multiCheckRating = (page, { option }) =>
  page.evaluate(option => {
    const options = document.getElementsByClassName("subject-answer onlyText");
    const selectOption = options[0].children[option];
    return selectOption.click();
  }, option);

module.exports.textRating = async page => {
  const input = await page.$("input[type=text]");
  await input.focus();
  return await page.keyboard.type(message.generate(), {
    delay: 50,
  });
};

module.exports.selectRating = async (page, { option }) => {
  const value = await page.evaluate(opt => {
    const select = document.getElementsByTagName("select")[0];
    return select.children[opt].value;
  }, option);

  return page.select("select", value);
};

module.exports.submitRating = async page => {
  await captcha.solve(page);

  return page.evaluate(() => {
    const button = document.getElementsByClassName("btn")[0];
    return button.click();
  });
};
