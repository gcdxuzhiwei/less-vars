import * as vscode from "vscode";
const fs = require("fs");
const path = require("path");
const lessToJs = require("less-vars-to-js");
const getColor = require("get-css-colors");
const colorAlpha = require("color-alpha");

interface LessToJsConfig {
  resolveVariables?: boolean;
  dictionary?: Record<string, string>;
  stripPrefix?: boolean;
}

export interface DepValue {
  key: string;
  value: string;
}

const myRequire = (str: string) => {
  const module = { exports: {} };
  ((module, exports) => {
    eval(str);
  })(module, module.exports);
  return module.exports;
};

const utils = {
  // 获得less文件路径数组,${folder}转为工作文件夹路径
  getLocations: (document?: vscode.TextDocument) => {
    let workspace: string | undefined;
    if (document) {
      workspace = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
    }

    const handlePath = (paths: string[]) => {
      return paths.map((v) => {
        if (workspace) {
          return path.join(v.replace("${folder}", workspace));
        } else {
          return path.join(v);
        }
      });
    };
    const locations: string | string[] | undefined = vscode.workspace
      .getConfiguration()
      .get("lessVars.locations");
    if (typeof locations === "string") {
      return handlePath([locations]);
    } else if (locations instanceof Array) {
      return handlePath(locations);
    } else {
      return false;
    }
  },
  // 获得全部变量
  getVarsByFiles: (allFile: string[], config?: LessToJsConfig) => {
    let allVars: Record<string, string> = {};
    for (let i = 0; i < allFile.length; i++) {
      if (fs.existsSync(allFile[i])) {
        const context = fs.readFileSync(allFile[i], "utf-8");
        if (allFile[i].slice(-4) === "less") {
          allVars = {
            ...(lessToJs(context, config) || {}),
            ...allVars,
          };
        } else if (allFile[i].slice(-2) === "js") {
          try {
            allVars = {
              ...(myRequire(context) || {}),
              ...allVars,
            };
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    return allVars;
  },
  // 取到变量值中的变量
  getDepVars: (allVars: Record<string, string>) => {
    const allDepVars: Record<string, DepValue[]> = {};
    for (let key in allVars) {
      const depValue = [
        {
          key,
          value: allVars[key],
        },
      ];
      let search = depValue[0].value.search("@");
      while (search >= 0) {
        let searchEnd = search + 1;
        const currentValue = depValue[0].value;
        while (
          searchEnd <= currentValue.length &&
          /^[A-Za-z0-9-_]+$/.test(currentValue[searchEnd])
        ) {
          searchEnd++;
        }
        const subValue = currentValue.slice(search, searchEnd);
        if (allVars[subValue]) {
          depValue.unshift({
            key: subValue,
            value: allVars[subValue],
          });
          search = depValue[0].value.search("@");
        } else {
          search = -1;
        }
      }
      allDepVars[key] = depValue.reverse();
    }
    return allDepVars;
  },
  handleEval: (handleStr: string) => {
    const colors = [
      ...new Set([
        ...(getColor(handleStr) || []),
        ...(handleStr.match(/\d+\.?\d{0,2}%/g) || []),
      ]),
    ];
    for (let i = 0; i < colors.length; i++) {
      handleStr = handleStr.replaceAll(colors[i], `'${colors[i]}'`);
    }
    return handleStr;
  },
  fade: (a: string, b: string): string => {
    return colorAlpha(a, b);
  },
};

export default utils;
