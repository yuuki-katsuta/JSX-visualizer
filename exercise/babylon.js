const babylon = require("babylon");

const ast = babylon.parse("1 + 2");

console.log(ast);
