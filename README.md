# Claude Commit

Generate [Conventional Commit](https://www.conventionalcommits.org/) messages with a single click using Claude AI — directly from the VS Code Source Control panel.

## Requirements

- A Claude Code OAuth token. Generate one by running `claude setup-token` in your terminal (requires the [Claude Code CLI](https://claude.ai/code)).

## Setup

Provide the OAuth token using either of these methods:

1. **VS Code setting** (recommended): Open settings and set `claudeCommit.oauthToken` to your `sk-ant-oat01-...` token. The first time you run the command without a configured token, the extension will prompt you and store it for you.
2. **Environment variable**: Export `CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...` before launching VS Code. Used as a fallback when the setting is empty.

## Usage

1. Stage your changes (`git add`)
2. Click the **✨ sparkle icon** in the Source Control title bar
3. The commit message field is filled automatically

## How it works

The extension reads your staged diff via the VS Code Git API and sends it to the Anthropic Messages API using your Claude Code OAuth token (Bearer auth + the `oauth-2025-04-20` beta header). The response is sanitized to a single Conventional Commit line.

**Model used:** `claude-haiku-4-5` for fast responses.

## Conventional Commits format

```
type(scope): description
```

Supported types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`, `perf`, `build`, `revert`

## Local installation

```bash
npm install
npm run compile
npm run package
# Then in VS Code: Ctrl+Shift+P → Extensions: Install from VSIX...
```

## Publishing to VS Code Marketplace

1. Create a publisher at https://marketplace.visualstudio.com/manage
2. Get a Personal Access Token from https://dev.azure.com (Scopes: Marketplace → Manage)
3. Login and publish:
   ```bash
   npx vsce login <your-publisher-name>
   npm run package
   npx vsce publish
   ```

## License

MIT
