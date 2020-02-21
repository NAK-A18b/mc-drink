const message = require("./utils/message");

const captcha = require("./captcha");

module.exports.starRating = page =>
  page.evaluate(() => {
    const star = document.getElementsByClassName("rating")[2];
    return star.click();
  });

module.exports.multiCheckRating = page =>
  page.evaluate(() => {
    const options = [...document.getElementsByClassName("option")].filter(
      c => !c.classList.contains("linkto")
    );

    const random = Math.floor(Math.random() * (options.length - 0) + 0);
    return options[random].click();
  });

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

    const random = Math.floor(Math.random() * (select.children.length - 0) + 0);
    return select.children[random].value;
  }, option);

  return page.select("select", value);
};

module.exports.submitRating = async (page, _, statusCallback) => {
  await captcha.solve(page, statusCallback);

  return page.evaluate(() => {
    const button = document.getElementsByClassName("btn")[0];
    return button.click();
  });
};
