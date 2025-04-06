const { transform } = require("@babel/core");

const source = "function hogehoge() {return 1}";

const targetId = "hogehoge";
const replaceCode = "function hugahuga() {return 2}";

// 一意な識別子を表す
// すでに置換処理後なのかを判断するためのキー
const WasCreated = Symbol("WasCreated");

const plugin = ({ types: t, template }) => {
  return {
    visitor: {
      FunctionDeclaration: (nodePath, state) => {
        console.log(nodePath.node.id);
        if (nodePath[WasCreated] || !t.isIdentifier(nodePath.node.id)) {
          return;
        }
        // 関数名が "hoge" と一致するかを確認
        if (nodePath.node.id.name === targetId) {
          // ASTノードを生成
          const newAst = template(replaceCode)();
          // 元の関数宣言ノードを新しいノードに置き換え
          nodePath.replaceWith(newAst);
          // ノードが変換済みであることを記録
          nodePath[WasCreated] = true;
        }
      },
    },
  };
};

// 元のソースコードに対して定義したプラグインを適用
console.log(transform(source, { plugins: [plugin] }).code);
// --> function hoge() {
//       return 2;
//     }

/**
 * Babelはプラグインを実行する際、types（t として利用）や template といったユーティリティを提供
 * t はASTノードのチェックや生成に使われるユーティリティ群
 * template は文字列コードをASTに変換するための関数
 *
 * FunctionDeclaration（関数宣言）のノードを対象
 */
