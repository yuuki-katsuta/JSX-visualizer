const { transform } = require("@babel/core");
const { parseExpression } = require("babylon");

// 変換対象
const source = 'const hoge = require("hoge")';

// この名前と一致する変数宣言を探す
const targetId = "hoge";

// ターゲット変数の初期化部分（init）をこのコードで置き換えます
const replaceCode = 'require("dummy-hoge")';

const plugin = ({ types: t, template }) => {
  return {
    visitor: {
      // AST中の各変数宣言（VariableDeclarator）を検査し、変数名がターゲット（この場合 "hoge"）である場合
      // その変数の初期化式（init）を require("dummy-hoge") に置き換えます。
      VariableDeclarator: (nodePath, state) => {
        if (
          // t.isIdentifier(nodePath.node.id)を使って、idがIdentifierかどうかを確かめる
          t.isIdentifier(nodePath.node.id) &&
          nodePath.node.id.name === targetId
        ) {
          // parseExpression は、文字列で書かれたコード（ここでは 'require("dummy-hoge")'）をASTノードに変換するために使用されます。
          const newAst = parseExpression(replaceCode);
          nodePath.get("init").replaceWith(newAst);
        }
      },
    },
  };
};

console.log(transform(source, { plugins: [plugin] }).code);
// const hoge = require("dummy-hoge");

/**
 * VariableDeclarator：AST（抽象構文木）におけるノードのひとつで、変数宣言を表す
 * const hoge = require("hoge");
 * このコードでは hoge = require("hoge") の部分が VariableDeclarator として表現される
 * id: 変数名を示す（この場合は "hoge"）
 * init: 変数に割り当てられる初期値を示す（この場合は require("hoge")）
 *
 * t.isIdentifier(nodePath.node.id)
 * 変数宣言の左側（id）が単純な変数名（Identifier）であるかどうかをチェックする
 * 分割代入の場合の誤った変換を防ぐため
 * nodePath.node.idは変数名を表す
 *
 * nodePath.get("init")ではrequire("hoge")を表す
 */
