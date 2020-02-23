const AWS = require("aws-sdk");

var textract = new AWS.Textract({
  apiVersion: "2018-06-27",
  region: "eu-west-2",
});

module.exports.findCode = async image => {
  const params = {
    Document: {
      Bytes: image,
    },
  };

  const data = await textract.detectDocumentText(params).promise();
  if (!data) return;

  return data.Blocks.filter(block => block.BlockType === "WORD")
    .map(block => block.Text)
    .find(text => text.match(/(\S{4})-(\S{4})-(\S{4})/));
};
