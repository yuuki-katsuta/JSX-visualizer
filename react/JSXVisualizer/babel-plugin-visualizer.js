const babylon = require("babylon");
const generate = require("babel-generator").default;
const { reduceAstNode } = require("../tree");

module.exports = function ({ types: t }) {
  console.log("Babel Plugin Visualizer 読み込み");

  return {
    visitor: {
      JSXElement(path) {
        try {
          const opening = path.node.openingElement;
          // ① <Visualizer> 要素をキャッチ
          if (!t.isJSXIdentifier(opening.name, { name: "Visualizer" })) return;

          console.log("Visualizer要素を検出しました");

          // ② 最初の子JSX要素を文字列化して再パース
          const childNode = path.node.children.find((n) => t.isJSXElement(n));
          if (!childNode) {
            console.log("子JSX要素が見つかりませんでした");
            return;
          }

          console.log("子ノードの生成を開始");
          const { code: childCode } = generate(childNode);
          console.log("生成されたコード:", childCode);

          const childAst = babylon.parse(childCode, {
            sourceType: "module",
            plugins: ["jsx"],
          });

          // ExpressionStatement の expression がルートJSXElement
          const jsxRoot = childAst.program.body[0].expression;
          console.log("JSXRoot:", jsxRoot.type);

          // ③ AST→シンプルJSONに変換
          const treeData = reduceAstNode([], jsxRoot);
          console.log("treeData生成完了:", JSON.stringify(treeData));

          // ④ treeData属性として埋め込み
          opening.attributes.push(
            t.JSXAttribute(
              t.JSXIdentifier("treeData"),
              t.JSXExpressionContainer(t.valueToNode(treeData))
            )
          );

          console.log("Visualizer要素の変換が完了しました");
        } catch (err) {
          console.error("プラグイン処理中にエラーが発生しました:", err.message);
          console.error("エラーの詳細:", err.stack);
        }
      },
    },
  };
};
