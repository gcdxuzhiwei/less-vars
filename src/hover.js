const vscode = require("vscode");
const fs = require("fs");
const lessToJs = require("less-vars-to-js");

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideHover(document, position, token) {
  // 查询字符
  const word = document.getText(document.getWordRangeAtPosition(position));
  // 文件路径
  const locations = vscode.workspace
    .getConfiguration()
    .get("lessVars.locations");

  // 只查询@开头
  if (!word || word[0] !== "@") {
    return;
  }

  // 未配置文件路径
  if (!locations || (locations instanceof Array && locations.length === 0)) {
    return new vscode.Hover(
      "请先在settings.json中配置变量文件路径,配置项为lessVars.locations"
    );
  }

  // 字符串路径转数组
  const allFile = typeof locations === "string" ? [locations] : locations;

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
  let allVars = {};
  for (let i = 0; i < allFile.length; i++) {
    const context = fs.readFileSync(allFile[i], "utf-8");
    allVars = {
      ...lessToJs(context, { resolveVariables: true }),
      ...allVars,
    };
  }

  // 开始查找，值中有变量就继续查找
  let currentWord = word;
  const hoverRes = [];

  while (currentWord) {
    const currentValue = allVars[currentWord];
    if (!currentValue) {
      currentWord = "";
    } else {
      hoverRes.push(`${currentWord} : ${currentValue} ;`);
      const nextStart = currentValue.search("@");
      if (nextStart < 0) {
        currentWord = "";
      } else {
        let nextEnd = nextStart + 1;
        while (
          nextEnd <= currentValue.length &&
          /^[A-Za-z0-9-_]+$/.test(currentValue[nextEnd])
        ) {
          nextEnd++;
        }
        currentWord = currentValue.slice(nextStart, nextEnd);
      }
    }
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
