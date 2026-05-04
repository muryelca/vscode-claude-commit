import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';

const CONVENTIONAL_COMMIT_RE =
  /^(feat|fix|chore|docs|refactor|test|style|ci|perf|build|revert)(\([^)]+\))?: .+$/m;

function extractCommitMessage(raw: string): string {
  const match = raw.match(CONVENTIONAL_COMMIT_RE);
  return match ? match[0].trim() : raw.split('\n').find((l) => l.trim().length > 0) ?? raw.trim();
}

async function generateCommitMessage(diff: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    system:
      'You are a git commit message generator. ' +
      'Output ONLY the commit message, one single line, no explanation, no markdown, no quotes. ' +
      'Follow Conventional Commits: type(scope): description. ' +
      'Types: feat, fix, chore, docs, refactor, test, style, ci, perf, build, revert.',
    messages: [
      {
        role: 'user',
        content: `Generate a Conventional Commit message for this diff:\n\n${diff}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return extractCommitMessage(text);
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('claudeCommit.generate', async () => {
    const config = vscode.workspace.getConfiguration('claudeCommit');
    let apiKey: string | undefined = config.get<string>('anthropicApiKey');

    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Anthropic API key',
        password: true,
        placeHolder: 'sk-ant-...',
      });
      if (!apiKey) return;
      await config.update('anthropicApiKey', apiKey, vscode.ConfigurationTarget.Global);
    }

    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const api = gitExtension?.getAPI(1);
    const repo = api?.repositories[0];

    if (!repo) {
      vscode.window.showErrorMessage('No git repository found.');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.SourceControl,
        title: 'Claude: generating commit message...',
      },
      async () => {
        try {
          const diff: string = await repo.diff(true);

          if (!diff.trim()) {
            vscode.window.showWarningMessage('No staged changes. Run git add first.');
            return;
          }

          const message = await generateCommitMessage(diff, apiKey!);
          repo.inputBox.value = message;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Error generating message: ${message}`);
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
