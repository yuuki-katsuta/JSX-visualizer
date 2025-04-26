import React from "react";
import { createRoot } from "react-dom/client";
import { render } from "./visualizer";
import { getTree } from "../tree";
import { Visualizer } from "./visualizer";

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
      <MyComponent />
    </Visualizer>

    {/* <h2>手動で追加したtreeData</h2>
    <Visualizer treeData='[{"name":"div","children":[{"name":"p","children":[]}]}]' /> */}
  </div>
);
