module.exports.load = async (page, percentage) => {
  await page.waitForSelector(".progress-number");
  return await page.waitForFunction(
    `document.getElementsByClassName("progress-number")[0].innerText.toString() === "${percentage}"`
  );
};

module.exports.next = (page) =>
  page.evaluate(() => document.getElementById("next-sbj-btn").click());