//-Path: "extenstion_teachoco_tool/teachoco-tool/src/extension.ts"
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

interface FileTypeConfig {
    file: string[];
    start: string;
    end: string;
}

const fileTypeConfigs: FileTypeConfig[] = [
    {
        file: ["html", "php", "vue", "md", "xml", "svelte"],
        start: '<!---Path: "',
        end: '" -->\n',
    },
    { file: ["css", "sql"], start: '/*-Path: "', end: '" */\n' },
    {
        file: [
            "c",
            "c++",
            "cpp",
            "cs",
            "ino",
            "java",
            "js",
            "ts",
            "jsx",
            "tsx",
            "swift",
            "kt",
            "go",
        ],
        start: '//-Path: "',
        end: '"\n',
    },
    {
        file: ["py", "rb", "sh", "yaml", "yml", "dockerfile"],
        start: '#-Path: "',
        end: '"\n',
    },
    { file: ["ini"], start: ';-Path: "', end: '"\n' },
    { file: ["bat"], start: ':: -Path: "', end: '"\n' },
];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand(
        "teachoco-tool.pathcomment",
        handlePathComment
    );
    context.subscriptions.push(disposable);
}

function handlePathComment(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const showMessageOption: boolean = vscode.workspace
        .getConfiguration("teachoco-tool")
        .get("showMessageOption", false);

    const document = editor.document;
    if (document.isUntitled) {
        showMessage("เอกสารที่ไม่มีชื่อ", "error");
        return;
    }

    const fileExtension = document.fileName.split(".").pop();
    if (!fileExtension) {
        showMessage("ไม่สามารถระบุนามสกุลไฟล์ได้", "error");
        return;
    }

    const config = fileTypeConfigs.find((c) => c.file.includes(fileExtension));
    if (!config) {
        showMessage(`ประเภทไฟล์ที่ไม่รองรับ: ${fileExtension}`, "warning");
        return;
    }

    const documentText = document.getText();
    const relativePath = vscode.workspace.asRelativePath(document.uri.fsPath);
    const pathIncluded = documentText.includes(relativePath);
    const hasPathComment = documentText.trim().startsWith(config.start);
    const newPathComment = `${config.start}${relativePath}${config.end}`;

    if (hasPathComment) {
        editPathComment(editor, document, newPathComment);
        showMessage(
            pathIncluded
                ? "บรรทัดแรกถูกแสดงเส้นทางไฟล์แล้ว"
                : "คอมเมนท์เส้นทางไฟล์ไม่ตรงกับเส้นทางไฟล์จริงๆ",
            "warning"
        );
    } else {
        addPathComment(editor, document, documentText, newPathComment);
        showMessage(`เพิ่มคอมเมนท์เส้นทางไฟล์สำเร็จ: ${relativePath}`, "info");
    }
}

function addPathComment(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    text: string,
    newPathComment: string
): void {
    editor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            ),
            newPathComment + text
        );
    });
}

function editPathComment(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    newPathComment: string
): void {
    const firstLine = document.lineAt(0);
    editor.edit((editBuilder) => {
        editBuilder.delete(firstLine.rangeIncludingLineBreak);
        editBuilder.insert(new vscode.Position(0, 0), newPathComment);
    });
}

function showMessage(
    message: string,
    type: "error" | "warning" | "info"
): void {
    const showMessageOption: boolean = vscode.workspace
        .getConfiguration("teachoco-tool")
        .get("showMessageOption", false);

    if (showMessageOption) {
        switch (type) {
            case "error":
                vscode.window.showErrorMessage(message);
                break;
            case "warning":
                vscode.window.showWarningMessage(message);
                break;
            case "info":
                vscode.window.showInformationMessage(message);
                break;
        }
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
