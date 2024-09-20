import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "teachoco-tool.helloWorld",
        () => {
            vscode.window.showInformationMessage(
                "Hello World from my VS Code extension!"
            );
        }
    );
    vscode.window.showInformationMessage(
        "Hello World from my VS Code extension!"
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
