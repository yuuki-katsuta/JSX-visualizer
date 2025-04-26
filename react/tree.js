const babylon = require("babylon");

// AST 中の各ノード（特に JSX 要素）を走査し、簡略化したオブジェクトに変換してツリー構造として組み立てる
const reduceAstNode = (oldNode, currentNode) => {
  let element = {};
  // currentNode が JSXElement の場合、その要素のタグ名（currentNode.openingElement.name.name）をキー name として取得し、
  // 空の children 配列とともにオブジェクトを作成
  if (currentNode.type === "JSXElement") {
    element = {
      name: currentNode.openingElement.name.name,
      children: [],
    };
    oldNode.push(element);
  }
  if ("children" in currentNode) {
    // oldNode.length > 0 は、すでに何らかの JSX 要素が追加されている（＝親要素が存在する）場合には
    // 親の children 配列（ここでは element.children）に対して再帰処理を行う
    currentNode.children.forEach((node) =>
      oldNode.length > 0
        ? reduceAstNode(element.children, node)
        : reduceAstNode(oldNode, node)
    );
  }
  return oldNode;
};

const getTree = () => {
  const rawAst = babylon.parse(content, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  // ExportNamedDeclaration（名前付きエクスポートの宣言）を探し出し
  // その中にある変数宣言や関数の初期化部分に埋め込まれた JSX の構造を取り出す
  const initialAst = rawAst.program.body.find(
    (astNode) => astNode.type === "ExportNamedDeclaration"
  ).declaration.declarations[0].init.body.body[0].argument;

  return reduceAstNode([], initialAst);
};

// パース対象のソースコード
const content = `
  export const MyComponent = () => {
    return (
      <div>
        <h1>Hello World</h1>
        <p>This is a sample JSX component.</p>
        <div>
          <p>react</p>
          <p>react</p>
          <p>react</p>
        </div>
      </div>
    );
  };
`;

module.exports = {
  reduceAstNode,
  getTree,
};
