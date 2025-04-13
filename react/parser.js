const babelParser = require("@babel/parser");
const fs = require("fs");
const content = fs.readFileSync(__dirname + "/welcome/index.js", "utf8");
const ast = babelParser.parse(content, {
  sourceType: "module",
  plugins: ["jsx"],
});
console.log(JSON.stringify(ast));
