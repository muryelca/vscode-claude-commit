"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const CONVENTIONAL_COMMIT_RE = /^(feat|fix|chore|docs|refactor|test|style|ci|perf|build|revert)(\([^)]+\))?: .+$/m;
function extractCommitMessage(raw) {
    const match = raw.match(CONVENTIONAL_COMMIT_RE);
    return match ? match[0].trim() : raw.split('\n').find((l) => l.trim().length > 0) ?? raw.trim();
}
async function generateCommitMessage(diff, apiKey) {
    const client = new sdk_1.default({ apiKey });
    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: 'You are a git commit message generator. ' +
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
function activate(context) {
    const disposable = vscode.commands.registerCommand('claudeCommit.generate', async () => {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        let apiKey = config.get('anthropicApiKey');
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Anthropic API key',
                password: true,
                placeHolder: 'sk-ant-...',
            });
            if (!apiKey)
                return;
            await config.update('anthropicApiKey', apiKey, vscode.ConfigurationTarget.Global);
        }
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const api = gitExtension?.getAPI(1);
        const repo = api?.repositories[0];
        if (!repo) {
            vscode.window.showErrorMessage('No git repository found.');
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.SourceControl,
            title: 'Claude: generating commit message...',
        }, async () => {
            try {
                const diff = await repo.diff(true);
                if (!diff.trim()) {
                    vscode.window.showWarningMessage('No staged changes. Run git add first.');
                    return;
                }
                const message = await generateCommitMessage(diff, apiKey);
                repo.inputBox.value = message;
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Error generating message: ${message}`);
            }
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map