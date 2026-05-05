import * as vscode from "vscode";
import { formatBruDocument } from "./formatter";

export function activate(context: vscode.ExtensionContext): void {
  const provider = vscode.languages.registerDocumentFormattingEditProvider(
    "bru",
    {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        const text = document.getText();
        const formatted = formatBruDocument(text);

        if (formatted === text) {
          return [];
        }

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        return [vscode.TextEdit.replace(fullRange, formatted)];
      },
    }
  );

  context.subscriptions.push(provider);
}

export function deactivate(): void {
  // nothing to clean up
}
