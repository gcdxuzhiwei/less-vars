import * as vscode from "vscode";
const fs = require("fs");
const lessToJs = require("less-vars-to-js");
const getColor = require("get-css-colors");
const colorAh = require("color-alpha");

function provideCompletionItems() {
  // 文件路径
  const locations: string | string[] =
    vscode.workspace.getConfiguration().get("lessVars.locations") ?? [];

  // 字符串路径转数组
  const allFile = typeof locations === "string" ? [locations] : locations;

  // 汇总所有变量
  let allVars: Record<string, string> = {};
  for (let i = 0; i < allFile.length; i++) {
    if (fs.existsSync(allFile[i])) {
      const context = fs.readFileSync(allFile[i], "utf-8");
      allVars = {
        ...(lessToJs(context) || {}),
        ...allVars,
      };
    }
  }

  const total = [];
  for (let i in allVars) {
    let documentation = `${i} : ${allVars[i]} ;`;
    let atStart = allVars[i].search("@");
    while (atStart >= 0) {
      let atEnd = atStart + 1;
      while (
        atEnd <= allVars[i].length &&
        /^[A-Za-z0-9-_]+$/.test(allVars[i][atEnd])
      ) {
        atEnd++;
      }
      const currentVar = allVars[i].slice(atStart, atEnd);
      const currentValue = allVars[currentVar];
      if (currentValue) {
        documentation += `\n${currentVar} : ${currentValue} ;`;
        atStart = currentValue.search("@");
      } else {
        atStart = -1;
      }
    }
    const color = getColor(documentation).pop() || "#fff";
    total.push({
      detail: ["r", "#"].includes(color[0]) ? color : colorAh(color),
      label: i, // 提示菜单展示内容
      kind: vscode.CompletionItemKind.Color,
      documentation, // 提示菜单描述内容
    });
  }

  return total.length
    ? total
    : [
        {
          label: "@less-vars",
          kind: vscode.CompletionItemKind.Text,
          documentation:
            "未找到变量,可在setting.json中设置lessVars.locations为less文件绝对路径",
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
      "@"
    )
  );
};
