const { transform } = require("@babel/core");

const source = "console.log(1)";

const insertCode = "console.log(2)";

const plugin = ({ types: t, template }) => {
  return {
    visitor: {
      Program: {
        exit: (NodePath, state) => {
          const newAst = template(insertCode)();
          NodePath.pushContainer("body", newAst);
        },
      },
    },
  };
};

console.log(transform(source, { plugins: [plugin] }).code);
