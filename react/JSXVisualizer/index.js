import React from "react";
const { createRoot } = require("react-dom/client");
const { Visualizer } = require("./visualizer");

const MyComponent3 = () => {
  return (
    <div>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
    </div>
  );
};

const MyComponent2 = () => {
  return (
    <div>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <MyComponent3 />
    </div>
  );
};

const MyComponent = () => {
  return (
    <div hidden>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <MyComponent2 />
      <MyComponent2 />
      <MyComponent2 />
    </div>
  );
};

createRoot(document.getElementById("app")).render(
  <React.Fragment>
    <Visualizer>
      {/* 現状単体のコンポーネントのみ対応 */}
      <MyComponent />
    </Visualizer>
  </React.Fragment>
);
