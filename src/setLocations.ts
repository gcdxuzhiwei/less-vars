import * as vscode from "vscode";
import utils from "./utils";

let currentPanel: vscode.WebviewPanel | undefined = undefined;

function setWebview(
  currentPanel: vscode.WebviewPanel | undefined,
  newLocation?: string[]
) {
  if (!currentPanel) {
    return;
  }
  const locations = newLocation || utils.getLocations() || [];
  currentPanel.webview.html = `
    <script>const vscode = acquireVsCodeApi();</script>
    <button onClick="vscode.postMessage({id:'selectFile'});">添加文件</button>
    <button onClick="vscode.postMessage({id:'openEdit'});">手动配置</button>
    <small>越靠前优先级越高</small>
    <ul>${locations
      .map(
        (v, index) =>
          `<li>${v}<button onClick="vscode.postMessage({id:'up',index:${index}});">上移</button><button onClick="vscode.postMessage({id:'delete',index:${index}});">删除</button></li>`
      )
      .join("")}</ul>
  `;
}

function registerCommand(context: vscode.ExtensionContext) {
  return () => {
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (currentPanel) {
      // If we already have a panel, show it in the target column
      currentPanel.reveal(columnToShowIn);
    } else {
      // Otherwise, create a new panel
      currentPanel = vscode.window.createWebviewPanel(
        "setLocations",
        "less vars",
        columnToShowIn ?? vscode.ViewColumn.One,
        { enableScripts: true }
      );

      setWebview(currentPanel);

      // Reset when the current panel is closed
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );

      currentPanel.onDidChangeViewState(
        (e) => {
          if (e.webviewPanel.visible) {
            setWebview(currentPanel);
          }
        },
        null,
        context.subscriptions
      );

      currentPanel.webview.onDidReceiveMessage(
        (message) => {
          if (message.id === "openEdit") {
            vscode.commands.executeCommand("workbench.action.openSettingsJson");
          } else if (message.id === "selectFile") {
            vscode.window
              .showOpenDialog({
                filters: { less: ["less"], javascript: ["js"] },
              })
              .then((res) => {
                if (res && res.length) {
                  const pre = utils.getLocations() || [];
                  const newLocation = [...new Set([res[0].fsPath, ...pre])];
                  vscode.workspace
                    .getConfiguration()
                    .update(
                      "lessVars.locations",
                      newLocation,
                      vscode.ConfigurationTarget.Global
                    )
                    .then(() => {
                      setWebview(currentPanel, newLocation);
                    });
                }
              });
          } else if (message.id === "delete") {
            const newLocation = utils.getLocations() || [];
            newLocation.splice(message.index, 1);
            vscode.workspace
              .getConfiguration()
              .update(
                "lessVars.locations",
                newLocation,
                vscode.ConfigurationTarget.Global
              )
              .then(() => {
                setWebview(currentPanel, newLocation);
              });
          } else if (message.id === "up") {
            const newLocation = utils.getLocations() || [];
            const item = newLocation.splice(message.index, 1)[0];
            newLocation.splice(
              message.index - 1 >= 0 ? message.index - 1 : newLocation.length,
              0,
              item
            );
            vscode.workspace
              .getConfiguration()
              .update(
                "lessVars.locations",
                newLocation,
                vscode.ConfigurationTarget.Global
              )
              .then(() => {
                setWebview(currentPanel, newLocation);
              });
          }
        },
        undefined,
        context.subscriptions
      );
    }
  };
}

module.exports = function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("setLocations", registerCommand(context))
  );
};
