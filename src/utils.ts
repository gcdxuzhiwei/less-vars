import * as vscode from "vscode";
const fs = require("fs");
const lessToJs = require("less-vars-to-js");

interface LessToJsConfig {
  resolveVariables?: boolean;
  dictionary?: Record<string, string>;
  stripPrefix?: boolean;
}

interface DepValue {
  key: string;
  value: string;
}

const utils = {
  // 获得less文件路径数组
  getLocations: () => {
    const locations: string | string[] | undefined = vscode.workspace
      .getConfiguration()
      .get("lessVars.locations");
    if (typeof locations === "string") {
      return [locations];
    } else if (locations instanceof Array) {
      return locations;
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
        allVars = {
          ...(lessToJs(context, config) || {}),
          ...allVars,
        };
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
};

export default utils;
