# Contributing to AgentDesk

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/agentdesk`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local`
5. Start development server: `npm run dev`

## Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

## Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with tests
3. Run `npm test` and `npm run lint`
4. Submit a PR with a clear description

## Testing
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`