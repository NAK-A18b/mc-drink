const message = require("./message");

let page;

module.exports.setup = p => page = p;

module.exports.starRating = () =>
  page.evaluate(() => {
    const star = document.getElementsByClassName("rating")[2];
    return star.click();
  })

module.exports.multiCheckRating = ({
    option
  }) =>
  page.evaluate(option => {
    const options = document.getElementsByClassName(
      "subject-answer onlyText"
    );
    const selectOption = options[0].children[option];
    return selectOption.click();
  }, option)


module.exports.textRating = () =>
  page.evaluate(msg => {
    const input = document.getElementsByClassName(
      "politeText required requiredtrim"
    )[0];
    return (input.value = msg);
  }, message.generate())


module.exports.selectRating = ({
    option
  }) =>
  page.evaluate(opt => {
    const select = document.getElementsByTagName("select")[0];
    return (select.value = select.children[opt].value);
  }, option)

module.exports.submitRating = () => page.evaluate(() => {
  const button = document.getElementsByClassName("btn")[0];
  return button.click();
});