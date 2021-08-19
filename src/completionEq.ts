import * as vscode from "vscode";
import utils, { DepValue } from "./utils";
const getColor = require("get-css-colors");
const colorRgba = require("color-rgba");

const { fade } = utils;

function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const line = document.lineAt(position);

  // 不是“=”时return
  if (line.text[position.character - 1] !== "=") {
    return;
  }

  const allColor = getColor(line.text.slice(0, position.character - 1));

  // "="前没有颜色return
  if (!allColor || !allColor.length) {
    return;
  }

  // 输入的颜色
  const searchColor = allColor[allColor.length - 1];

  const colorStart = line.text.indexOf(searchColor);

  // 颜色转为rgba格式再转为字符串，用来比较
  const innerColor = colorRgba(searchColor).join(",");

  const allDepVars = utils.getDepVars(
    utils.getVarsByFiles(utils.getLocations(document) || [])
  );

  // 只取颜色变量
  const allColorVars: Record<string, DepValue[]> = {};
  for (let i in allDepVars) {
    const lastColor = getColor(allDepVars[i][allDepVars[i].length - 1].value);
    if (lastColor && lastColor.length) {
      allColorVars[i] = allDepVars[i].map((v) => ({
        key: v.key,
        value: v.value,
      }));
    }
  }

  const allInnerColor: Record<string, string> = {};
  for (let i in allColorVars) {
    const value = allColorVars[i];
    let handleValue = value.shift()!.value;
    while (value.length) {
      handleValue = handleValue.replaceAll(value[0].key, value[0].value);
      value.shift();
    }
    allInnerColor[i] = handleValue;
  }

  const colorStore: Record<string, string> = {};
  for (let i in allInnerColor) {
    const value = allInnerColor[i];
    if (value.slice(0, 4) === "fade" && value.indexOf("@") === -1) {
      const handleValue = utils.handleEval(value);
      let color = "";
      try {
        eval(`color=${handleValue}`);
      } catch (e) {
        console.log(value, handleValue);
      }
      colorStore[i] = colorRgba(color).join(",");
    } else {
      colorStore[i] = colorRgba(value).join(",");
    }
  }

  const label = [];
  for (let i in colorStore) {
    if (colorStore[i] === innerColor) {
      const documentation = allDepVars[i].reduce((pre, value, index) => {
        return (
          pre +
          `${value.key} : ${value.value} ;${
            index < allDepVars[i].length - 1 ? "\n" : ""
          }`
        );
      }, "");
      label.push({
        detail: `rgba(${innerColor})`,
        label: i,
        kind: vscode.CompletionItemKind.Color,
        documentation,
        command: {
          title: "deleteColor",
          command: "lessVars.deleteColor",
          arguments: [
            {
              line: position.line,
              start: colorStart,
              end: position.character,
            },
          ],
        },
      });
    }
  }

  return label.length
    ? label
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
  // 注册代码建议提示，只有当按下“=”时才触发
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
