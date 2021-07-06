import * as vscode from "vscode";
const fs = require("fs");
const rgba = require("color-rgba");
const lessToJs = require("less-vars-to-js");

// 文件路径
const locations = vscode.workspace.getConfiguration().get("lessVars.locations");

// 字符串路径转数组
const allFile = typeof locations === "string" ? [locations] : locations;

// 汇总所有变量
let allVars = {};
for (let i = 0; i < allFile.length; i++) {
  const context = fs.readFileSync(allFile[i], "utf-8");
  allVars = {
    ...lessToJs(context, { resolveVariables: true }),
    ...allVars,
  };
}

console.log(allVars);

// const rgbaVars = {};
// for (let i in allVars) {
//   if (allVars[i].slice(0, 4) !== "fade") {
//     rgbaVars[i] = rgba(allVars[i]).join("");
//     delete allVars[i];
//   } else {
//   }
// }
