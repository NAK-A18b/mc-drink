const { generateMessage } = require("./bot");

const captcha = require("./captcha");

module.exports.starRating = page =>
  page.evaluate(() => {
    const star = document.getElementsByClassName("rating")[2];
    return star.click();
  });

module.exports.multiCheckRating = page =>
  page.evaluate(() => {
    const options = [...document.getElementsByClassName("option")].filter(
      option => !option.classList.contains("linkto")
    );

    const random = Math.floor(Math.random() * (options.length - 0) + 0);
    return options[random].click();
  });

module.exports.textRating = async page => {
  const input = await page.$("input[type=text]");
  await input.focus();
  return await page.keyboard.type(generateMessage(), {
    delay: 50,
  });
};

module.exports.selectRating = async page => {
  const value = await page.evaluate(() => {
    const select = document.getElementsByTagName("select")[0];

    const random = Math.floor(Math.random() * (select.children.length - 1) + 1);
    return select.children[random].value;
  });

  return page.select("select", value);
};

module.exports.submitRating = async (page, statusCallback) => {
  await captcha.solve(page, statusCallback);

  return page.evaluate(() => {
    const button = document.getElementsByClassName("btn")[0];
    return button.click();
  });
};
