# Changelog

All notable changes to the **DJ Claude Commit** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-04

### Added

- Initial release.
- Command `claudeCommit.generate` accessible via the sparkle icon in the Source Control title bar and from the Command Palette.
- Configuration setting `claudeCommit.oauthToken` with `CLAUDE_CODE_OAUTH_TOKEN` environment variable fallback and a first-run input prompt.
- Conventional Commits output sanitization (single line, validated commit type).
- Integration with the Anthropic Messages API via `@anthropic-ai/sdk@^0.87.0`, model `claude-haiku-4-5-20251001`.
- Bearer auth using a Claude Code OAuth token plus the `anthropic-beta: oauth-2025-04-20` header.
- Progress indicator in the Source Control area while a message is being generated.

[Unreleased]: https://github.com/muryelcabral/vscode-claude-commit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/muryelcabral/vscode-claude-commit/releases/tag/v1.0.0
