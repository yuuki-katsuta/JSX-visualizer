const path = require("path");

module.exports = {
  plugins: [
    path.resolve(__dirname, "./react/JSXVisualizer/babel-plugin-visualizer.js"),
  ],
};
