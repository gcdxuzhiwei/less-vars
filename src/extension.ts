// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  require("./hover")(context); // 悬停提示
  require("./completionAt")(context); // 自动补全@
  require("./completionEq")(context); // 自动补全=
  require("./setLocations")(context); // 设置路径的webview

  // 删除文字命令，在eq功能执行后删除颜色
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "lessVars.deleteColor",
      (editor, edit, position) => {
        if (position) {
          edit.delete(
            new vscode.Range(
              new vscode.Position(position.line, position.start),
              new vscode.Position(position.line, position.end)
            )
          );
        }
      }
    )
  );

  console.log("extension active");
}
// this method is called when your extension is deactivated
export function deactivate() {
  console.log("extension deactivate");
}
