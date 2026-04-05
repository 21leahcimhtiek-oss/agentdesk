# Contributing to AgentDesk

Thank you for your interest in contributing! This document outlines the process.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/agentdesk`
3. Install dependencies: `npm install`
4. Copy env: `cp .env.example .env.local` and fill in test credentials
5. Run the dev server: `npm run dev`

## Branch Naming

- `feat/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `chore/description` — Dependency updates, config

## Pull Request Process

1. Create a branch from `main`
2. Make your changes with tests
3. Ensure all checks pass: `npm run lint && npm run typecheck && npm test`
4. Open a PR with a clear description of what and why
5. PRs require 1 approval before merge

## Commit Format

We use Conventional Commits:

```
feat: add webhook retry logic
fix: correct token cost calculation
docs: update API reference
chore: upgrade Next.js to 14.3
```

## Code Standards

- TypeScript strict mode — no `any` unless absolutely necessary
- Zod validation on all API inputs
- Tests required for new API routes and lib functions
- Tailwind for all styling — no inline styles, no CSS Modules

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, browser)

## License

By contributing, you agree your contributions are licensed under the MIT License.