import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';

const CONVENTIONAL_COMMIT_RE =
  /^(feat|fix|chore|docs|refactor|test|style|ci|perf|build|revert)(\([^)]+\))?: .+$/m;

const CLAUDE_CODE_SYSTEM_PROMPT = "You are Claude Code, Anthropic's official CLI for Claude.";

function extractCommitMessage(raw: string): string {
  const match = raw.match(CONVENTIONAL_COMMIT_RE);
  return match ? match[0].trim() : raw.split('\n').find((l) => l.trim().length > 0) ?? raw.trim();
}

async function generateCommitMessage(diff: string, oauthToken: string): Promise<string> {
  const client = new Anthropic({
    authToken: oauthToken,
    defaultHeaders: { 'anthropic-beta': 'oauth-2025-04-20' },
  });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    system: [
      { type: 'text', text: CLAUDE_CODE_SYSTEM_PROMPT },
      {
        type: 'text',
        text:
          'You are a git commit message generator. ' +
          'Output ONLY the commit message, one single line, no explanation, no markdown, no quotes. ' +
          'Follow Conventional Commits: type(scope): description. ' +
          'Types: feat, fix, chore, docs, refactor, test, style, ci, perf, build, revert.',
      },
    ],
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

async function resolveOAuthToken(
  config: vscode.WorkspaceConfiguration
): Promise<string | undefined> {
  const fromConfig = config.get<string>('oauthToken')?.trim();
  if (fromConfig) return fromConfig;

  const fromEnv = process.env.CLAUDE_CODE_OAUTH_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  const entered = await vscode.window.showInputBox({
    prompt: 'Enter your Claude Code OAuth token (run `claude setup-token` to generate one)',
    password: true,
    placeHolder: 'sk-ant-oat01-...',
    validateInput: (v) =>
      v && !v.startsWith('sk-ant-oat')
        ? 'Expected an OAuth token starting with sk-ant-oat...'
        : undefined,
  });
  if (!entered) return undefined;

  await config.update('oauthToken', entered, vscode.ConfigurationTarget.Global);
  return entered;
}

async function pickRepository(
  api: any,
  scmArg?: vscode.SourceControl
): Promise<any | undefined> {
  const repos: any[] = api?.repositories ?? [];
  if (repos.length === 0) return undefined;

  if (scmArg?.rootUri) {
    const target = scmArg.rootUri.toString();
    const match = repos.find((r) => r.rootUri?.toString() === target);
    if (match) return match;
  }

  if (repos.length === 1) return repos[0];

  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (activeUri && typeof api.getRepository === 'function') {
    const fromEditor = api.getRepository(activeUri);
    if (fromEditor) return fromEditor;
  }

  const items = repos.map((r) => ({
    label: r.rootUri ? vscode.workspace.asRelativePath(r.rootUri, true) : 'Unknown',
    description: r.rootUri?.fsPath,
    repo: r,
  }));
  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a repository to generate a commit message for',
  });
  return picked?.repo;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'claudeCommit.generate',
    async (scmArg?: vscode.SourceControl) => {
    const config = vscode.workspace.getConfiguration('claudeCommit');
    const oauthToken = await resolveOAuthToken(config);
    if (!oauthToken) return;

    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const api = gitExtension?.getAPI(1);
    const repo = await pickRepository(api, scmArg);

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

          const message = await generateCommitMessage(diff, oauthToken);
          repo.inputBox.value = message;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Error generating message: ${message}`);
        }
      }
    );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
