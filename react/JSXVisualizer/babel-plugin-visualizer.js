import { parse } from "@babel/parser";
import generate from "@babel/generator";
import { reduceAstNode } from "../tree";

module.exports = function ({ types: t }) {
  console.log("Babel Plugin Visualizer 読み込み");

  return {
    visitor: {
      JSXElement(path) {
        const opening = path.node.openingElement;
        // ① <Visualizer> 要素をキャッチ
        if (!t.isJSXIdentifier(opening.name, { name: "Visualizer" })) return;

        // ② 最初の子JSX要素を文字列化して再パース
        const childNode = path.node.children.find((n) => t.isJSXElement(n));
        if (!childNode) return;
        const { code: childCode } = generate(childNode);
        const childAst = parse(childCode, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
        });
        // ExpressionStatement の expression がルートJSXElement
        const jsxRoot = childAst.program.body[0].expression;

        // ③ AST→シンプルJSONに変換
        const treeData = reduceAstNode([], jsxRoot);

        // ④ treeData属性として埋め込み & 子要素はクリア
        opening.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier("treeData"),
            t.jsxExpressionContainer(t.valueToNode(treeData))
          )
        );
        path.node.children = [];
      },
    },
  };
};
