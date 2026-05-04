# Claude Commit

Generate [Conventional Commit](https://www.conventionalcommits.org/) messages with a single click using Claude AI — directly from the VS Code Source Control panel.

## Requirements

- [Claude Code CLI](https://claude.ai/code) installed and authenticated (`claude --version` must work in your terminal)

## Usage

1. Stage your changes (`git add`)
2. Click the **✨ sparkle icon** in the Source Control title bar
3. The commit message field is filled automatically

## How it works

The extension pipes your staged diff (`git diff --staged`) to the Claude CLI and extracts a single-line Conventional Commit message from the response.

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
