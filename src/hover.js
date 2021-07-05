const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideHover(document, position, token) {
  // 当前字符
  const word = document.getText(document.getWordRangeAtPosition(position));
  // 文件路径
  const locations = vscode.workspace
    .getConfiguration()
    .get("lessVars.locations");

  // 只查询@开头
  if (!word || word[0] !== "@") {
    return;
  }

  //未配置文件路径
  if (!locations) {
    return new vscode.Hover("请先在settings.json中配置变量文件路径");
  }

  // 字符串路径传数组
  const allFile = typeof locations === "string" ? [locations] : locations;

  let currentWord = word;
  const hoverRes = [];

  function findWord() {
    for (let i = 0; i < allFile.length; i++) {
      if (!fs.existsSync(allFile[i])) {
        return new vscode.Hover(`此路径配置错误:${allFile[i]}`);
      }
      const context = fs.readFileSync(allFile[i], "utf-8");
      const startIndex = context.search(currentWord);
      if (startIndex >= 0) {
        let endIndex = startIndex + 1;
        while (endIndex < context.length && context[endIndex] !== ";") {
          endIndex++;
        }
        const text = context.slice(startIndex, endIndex + 1);
        hoverRes.push(text);
        const nextText = text.slice(1, text.length);
        const nextStart = nextText.search("@");
        if (nextStart === -1) {
          currentWord = "";
        } else {
          let nextEnd = nextStart + 1;
          while (
            nextEnd < nextText.length &&
            ![";", " ", ":", ","].includes(nextText[nextEnd])
          ) {
            nextEnd++;
          }
          currentWord = nextText.slice(nextStart, nextEnd);
        }
        break;
      }

      if (i === allFile.length - 1) {
        currentWord = "";
      }
    }
  }

  while (currentWord) {
    findWord();
  }

  return new vscode.Hover(hoverRes.length ? hoverRes : "未找到变量值");
}

module.exports = function (context) {
  // 注册鼠标悬停提示
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("less", {
      provideHover,
    })
  );
};
