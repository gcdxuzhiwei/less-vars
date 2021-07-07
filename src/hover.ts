import * as vscode from "vscode";
import utils from "./utils";
const fs = require("fs");
const lessToJs = require("less-vars-to-js");

function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  // 查询字符
  const word = document.getText(document.getWordRangeAtPosition(position));
  // 文件路径
  const allFile = utils.getLocations() || [];

  // 只查询@开头
  if (!word || word[0] !== "@") {
    return;
  }

  // 未配置文件路径
  if (allFile.length === 0) {
    return new vscode.Hover(
      "请先在settings.json中配置变量文件路径,配置项为lessVars.locations"
    );
  }

  // 检测路径配置是否正确
  const error = [];
  for (let i = 0; i < allFile.length; i++) {
    if (allFile[i].slice(-4) !== "less") {
      error.push(`只支持less文件,${allFile[i]}`);
    }
    if (!fs.existsSync(allFile[i])) {
      error.push(`路径配置有误,${allFile[i]}`);
    }
  }
  if (error.length) {
    return new vscode.Hover(error);
  }

  // 汇总所有变量
  const allVars = utils.getVarsByFiles(allFile);

  const allDepVars = utils.getDepVars(allVars);

  const valueByWord = allDepVars[word];

  if (valueByWord && valueByWord.length) {
    return new vscode.Hover(
      valueByWord.map((current) => {
        return `${current.key} : ${current.value} ;`;
      })
    );
  } else {
    return new vscode.Hover("未找到变量值");
  }
}

module.exports = function (context: vscode.ExtensionContext) {
  // 注册鼠标悬停提示
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("less", {
      provideHover,
    })
  );
};
