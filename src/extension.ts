'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var spawn = require("child_process").spawn;
var path = require("path");
var fs = require("fs");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sqless" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.enableSqless', () => {
        // The code you place here will be executed every time your command is executed

        var sqlessConfig = vscode.workspace.getConfiguration("sqless");
       
        // Display a message box to the user
        vscode.window.showInformationMessage('Sqless Enabled');
            
        var fileSaved = vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {

            if(e.fileName.endsWith(".sqless"))
            {
                var inputFiles = vscode.workspace.findFiles("main.sqless", "**/node_modules/**", 2).then((files) => {

                    if(files.length > 1)
                    {
                        vscode.window.showErrorMessage("Multiple 'main.sqless' files found in workspace. Limit is one. Use 'include' for multiple files.");
                        return;
                    }

                    if(files.length == 0)
                    {
                        vscode.window.showErrorMessage("Cannot find 'main.sqless' in workspace, please create file in workspace or move out of 'node_modules'.");
                        return;
                    }

                    var mainSqlessPath = files[0].fsPath;
                    
                    var outputFilePath = path.dirname(files[0].fsPath) + '/sqless-output.sql';
                    
                    if(!fs.existsSync(outputFilePath))
                    {
                        fs.writeFileSync(outputFilePath, "");
                    }


                    var compiler = spawn(sqlessConfig.get<string>("compilerPath"), [
                                                                                        mainSqlessPath,
                                                                                        outputFilePath
                                                                                    ]);

                    compiler.stdout.on("data", (data) => {
                        console.log(data.toString("utf-8"));
                    });

                    compiler.stderr.on('data', (data) => {
                        console.log(data.toString("utf-8"));
                    });


                }, () => {
                    vscode.window.showErrorMessage("Cannot find 'main.sqless' in workspace, please create file in workspace or move out of 'node_modules'.");
                });

            
            }


        });

        context.subscriptions.push(fileSaved);
    });


    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}