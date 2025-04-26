import React from "react";
const { createRoot } = require("react-dom/client");
const { render } = require("./visualizer");
const { getTree } = require("../tree");
const { Visualizer } = require("./visualizer");

const MyComponent = () => {
  return (
    <div>
      <p>hello</p>
    </div>
  );
};

createRoot(document.getElementById("app")).render(
  <div>
    <h2>コンポーネント</h2>
    <MyComponent />
    {render(getTree())}

    <h2>ビジュアライザーでラップしたコンポーネント</h2>
    <Visualizer>
      <div>
        <p>hello</p>
        <p>hello</p>
        <p>hello</p>
      </div>
    </Visualizer>
  </div>
);
