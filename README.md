# DJ Claude Commit

Generate [Conventional Commit](https://www.conventionalcommits.org/) messages with a single click using Claude AI, directly from the VS Code Source Control panel.

![Demo](images/demo.gif)

## Features

- One-click commit message generation from the Source Control title bar.
- Reads your **staged** diff via the built-in VS Code Git API.
- Output strictly follows Conventional Commits: `type(scope): description`.
- Powered by Claude Haiku 4.5 for fast responses.

## Requirements

- VS Code `>= 1.80.0`.
- A Git repository open in your workspace.
- A Claude Code OAuth token (see below).

## Get an OAuth token

The extension authenticates against the Anthropic API using a Claude Code OAuth token.

1. Install the Claude Code CLI:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. Generate the token:
   ```bash
   claude setup-token
   ```
3. Sign in with your Anthropic account in the browser window that opens (requires a Pro, Max, or Team plan).
4. Copy the token printed by the CLI. It starts with `sk-ant-oat01-...`.

## Configuration

Provide the token using any of these methods (resolved in this order):

1. **VS Code setting** (recommended). Open Settings, search **Claude Commit**, and paste the token. Or in `settings.json`:
   ```json
   { "claudeCommit.oauthToken": "sk-ant-oat01-..." }
   ```
2. **Environment variable** `CLAUDE_CODE_OAUTH_TOKEN`, set before launching VS Code.
3. **First-run prompt**. If neither is set, the extension prompts you on first use and stores the value for next time.

## Usage

1. Stage your changes: `git add <files>`.
2. Open the Source Control panel (`Ctrl+Shift+G`).
3. Click the **✨ sparkle icon** in the title bar.
4. The commit input box is filled with a Conventional Commit message.

## Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `claudeCommit.oauthToken` | string | `""` | Claude Code OAuth token. Falls back to `CLAUDE_CODE_OAUTH_TOKEN` env var when empty. |

## Commands

| Command | Title |
|---|---|
| `claudeCommit.generate` | Generate Commit Message (Claude) |

## Conventional Commits

Format: `type(scope): description`. Supported types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`, `perf`, `build`, `revert`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No git repository found.` | Open a folder that contains a `.git` directory. |
| `No staged changes.` | Run `git add` first. The extension only reads staged changes. |
| `Expected an OAuth token starting with sk-ant-oat...` | Re-run `claude setup-token` and paste the full token. |
| `401` / `403` from the API | Token expired or revoked. Regenerate with `claude setup-token`. |
| Empty or truncated message | Stage smaller chunks of changes. |

## License

[MIT](LICENSE)
