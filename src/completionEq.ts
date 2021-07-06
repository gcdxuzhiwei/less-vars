import * as vscode from "vscode";
const fs = require("fs");
const lessToJs = require("less-vars-to-js");
const getColor = require("get-css-colors");

function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const line = document.lineAt(position);

  console.log(getColor(line.text));

  return [
    {
      label: "fasf",
      kind: vscode.CompletionItemKind.Text,
    },
  ];
}

function resolveCompletionItem() {
  return null;
}

module.exports = function (context: vscode.ExtensionContext) {
  // 注册代码建议提示，只有当按下“@”时才触发
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "less",
      {
        provideCompletionItems,
        resolveCompletionItem,
      },
      "="
    )
  );
};
