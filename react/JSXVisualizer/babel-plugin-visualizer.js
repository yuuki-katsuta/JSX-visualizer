// 直接実装でreduceAstNodeをオーバーライド
const processJSXElement = (node, componentDefs, processedSet = new Set()) => {
  if (!node) return null;

  // 基本的なノード情報を抽出
  let result = {
    type: node.type,
  };

  // JSX要素の処理
  if (node.type === "JSXElement") {
    const tagName = node.openingElement.name.name;
    result = {
      name: tagName,
      children: [],
    };

    // カスタムコンポーネント（大文字で始まる）の場合、定義を展開
    if (
      /^[A-Z]/.test(tagName) &&
      componentDefs.has(tagName) &&
      !processedSet.has(tagName)
    ) {
      console.log(`コンポーネント${tagName}を展開します`);
      // 無限ループ防止のためにセットに追加
      const newProcessedSet = new Set(processedSet);
      newProcessedSet.add(tagName);

      // コンポーネント定義を取得して展開
      const componentDef = componentDefs.get(tagName);
      return processJSXElement(componentDef, componentDefs, newProcessedSet);
    }

    // 子要素の処理
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        // 空白テキストはスキップ
        if (child.type === "JSXText" && !child.value.trim()) return;

        const processedChild = processJSXElement(
          child,
          componentDefs,
          processedSet
        );
        if (processedChild) {
          result.children.push(processedChild);
        }
      });
    }
  }
  // テキストノードの処理
  // else if (node.type === "JSXText") {
  //   const text = node.value.trim();
  //   if (text) {
  //     result = {
  //       name: "#text",
  //       value: text,
  //       children: [],
  //     };
  //   } else {
  //     return null; // 空白テキストは無視
  //   }
  // }

  // JSX式の処理
  else if (node.type === "JSXExpressionContainer") {
    return processJSXElement(node.expression, componentDefs, processedSet);
  }
  // React.createElement呼び出しの処理
  else if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.name === "React" &&
    node.callee.property.name === "createElement"
  ) {
    // 第一引数から要素タイプを取得
    const elementArg = node.arguments[0];
    let elementName;

    if (elementArg.type === "StringLiteral") {
      elementName = elementArg.value; // HTML要素
    } else if (elementArg.type === "Identifier") {
      elementName = elementArg.name; // コンポーネント名

      // カスタムコンポーネントの場合は展開
      if (
        /^[A-Z]/.test(elementName) &&
        componentDefs.has(elementName) &&
        !processedSet.has(elementName)
      ) {
        console.log(
          `CreateElement内のコンポーネント${elementName}を展開します`
        );
        const newProcessedSet = new Set(processedSet);
        newProcessedSet.add(elementName);

        const componentDef = componentDefs.get(elementName);
        return processJSXElement(componentDef, componentDefs, newProcessedSet);
      }
    }

    result = {
      name: elementName || "unknown",
      children: [],
    };

    // 子要素の処理（第3引数以降）
    if (node.arguments.length > 2) {
      for (let i = 2; i < node.arguments.length; i++) {
        const childArg = node.arguments[i];

        if (childArg.type === "StringLiteral") {
          // 文字列はテキストノードとして追加
          // result.children.push({
          //   name: "#text",
          //   value: childArg.value,
          //   children: [],
          // });
        } else {
          // その他の要素は再帰的に処理
          const processedChild = processJSXElement(
            childArg,
            componentDefs,
            processedSet
          );
          if (processedChild) {
            result.children.push(processedChild);
          }
        }
      }
    }
  }

  return result;
};

module.exports = function ({ types: t }) {
  console.log("Babel Plugin Visualizer 読み込み");

  return {
    pre(_state) {
      // コンポーネント定義を格納するマップ
      this.componentDefinitions = new Map();
    },

    visitor: {
      // コンポーネント定義を収集
      VariableDeclarator(path) {
        try {
          // Arrow関数またはFunction式のコンポーネントを検出
          if (
            t.isIdentifier(path.node.id) &&
            (t.isArrowFunctionExpression(path.node.init) ||
              t.isFunctionExpression(path.node.init))
          ) {
            const componentName = path.node.id.name;
            const componentBody = path.node.init;

            // 1. ブロックを持つ関数の場合
            if (t.isBlockStatement(componentBody.body)) {
              // returnステートメントを探す
              const returnStatement = componentBody.body.body.find(
                (node) => t.isReturnStatement(node) && node.argument
              );

              if (
                returnStatement &&
                (t.isJSXElement(returnStatement.argument) ||
                  t.isCallExpression(returnStatement.argument))
              ) {
                console.log(`コンポーネント定義検出: ${componentName}`);
                this.componentDefinitions.set(
                  componentName,
                  returnStatement.argument
                );
              }
            }
            // 2. 省略returnを持つアロー関数の場合
            else if (
              t.isJSXElement(componentBody.body) ||
              t.isCallExpression(componentBody.body)
            ) {
              console.log(
                `暗黙的returnのコンポーネント定義検出: ${componentName}`
              );
              this.componentDefinitions.set(componentName, componentBody.body);
            }
          }
        } catch (err) {
          console.error("コンポーネント検出中にエラーが発生:", err.message);
        }
      },

      // 関数宣言形式のコンポーネントも検出
      FunctionDeclaration(path) {
        try {
          if (t.isIdentifier(path.node.id) && path.node.body) {
            const componentName = path.node.id.name;

            // returnステートメントを探す
            const returnStatement = path.node.body.body.find(
              (node) =>
                t.isReturnStatement(node) &&
                node.argument &&
                (t.isJSXElement(node.argument) ||
                  t.isCallExpression(node.argument))
            );

            if (returnStatement) {
              console.log(`関数宣言コンポーネント検出: ${componentName}`);
              this.componentDefinitions.set(
                componentName,
                returnStatement.argument
              );
            }
          }
        } catch (err) {
          console.error(
            "関数宣言コンポーネント検出中にエラーが発生:",
            err.message
          );
        }
      },

      JSXElement(path) {
        try {
          const opening = path.node.openingElement;
          // ① <Visualizer> 要素を検出
          if (!t.isJSXIdentifier(opening.name, { name: "Visualizer" })) return;

          console.log("Visualizer要素を検出しました");

          // ② 最初の子JSX要素を取得
          const childNode = path.node.children.find((n) => t.isJSXElement(n));
          if (!childNode) {
            console.log("子JSX要素が見つかりませんでした");
            return;
          }

          let targetNode = childNode;

          // コンポーネントの場合、その定義を探す
          if (t.isJSXIdentifier(childNode.openingElement.name)) {
            const componentName = childNode.openingElement.name.name;
            console.log(`JSXコンポーネント検出: ${componentName}`);

            if (this.componentDefinitions.has(componentName)) {
              console.log(`${componentName}の定義が見つかりました！`);
              targetNode = this.componentDefinitions.get(componentName);
            }
          }

          // コンポーネントの構造を再帰的に展開
          console.log("対象ノード処理:", targetNode.type);
          console.log("コンポーネント定義数:", this.componentDefinitions.size);
          this.componentDefinitions.forEach((_, key) => {
            console.log("- 定義済みコンポーネント:", key);
          });

          // 新しい処理関数を使用してコンポーネントツリーを生成
          const processedNode = processJSXElement(
            targetNode,
            this.componentDefinitions
          );
          console.log(
            "変換後treeData:",
            JSON.stringify(processedNode, null, 2)
          );

          // treeData属性として埋め込み
          opening.attributes.push(
            t.JSXAttribute(
              t.JSXIdentifier("treeData"),
              t.JSXExpressionContainer(t.valueToNode([processedNode]))
            )
          );

          console.log("Visualizer要素の変換が完了しました");
        } catch (err) {
          console.error("プラグイン処理中にエラーが発生:", err.message);
          console.error("エラー詳細:", err.stack);
        }
      },
    },
  };
};
