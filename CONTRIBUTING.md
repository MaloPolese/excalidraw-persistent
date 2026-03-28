# Contributing

First off, thanks for taking the time to contribute! This is a small personal project but contributions are welcome.

## Ways to contribute

- **Bug reports** — open an issue with steps to reproduce
- **Bug fixes** — open a PR referencing the issue
- **Documentation improvements** — typos, clarity, missing steps
- **Small improvements** — better error handling, UX polish, performance

For anything larger (new features, architectural changes), **open an issue first** to discuss before writing code. This avoids wasted effort if it doesn't fit the project's scope.

## Development setup

```bash
git clone https://github.com/MaloPolese/excalidraw-persistent.git
cd excalidraw-persistent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The project structure is straightforward:

```
src/
├── app/
│   ├── api/board/route.ts       # GET + POST board state to disk
│   ├── page.tsx                 # Entry point (dynamic import, no SSR)
│   └── globals.css
└── components/
    └── ExcalidrawWrapper.tsx    # Excalidraw component + auto-save logic
```

## Commit messages — Conventional Commits

This project follows the [Conventional Commits](https://www.conventionalcommits.org) specification. Every commit message must be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `style`    | Formatting, missing semicolons — no logic change |
| `refactor` | Code change that is neither a fix nor a feature  |
| `perf`     | Performance improvement                          |
| `test`     | Adding or fixing tests                           |
| `chore`    | Build process, dependency updates, tooling       |
| `ci`       | CI/CD configuration changes                      |

### Scope (optional)

Keep scopes short and consistent:

| Scope    | What it covers                      |
| -------- | ----------------------------------- |
| `api`    | `src/app/api/`                      |
| `ui`     | `src/components/`                   |
| `docker` | `Dockerfile`, `docker-compose`      |
| `ci`     | `.github/workflows/`                |
| `docs`   | `README`, `CONTRIBUTING`, `LICENSE` |

### Examples

```bash
feat(ui): add dark mode toggle
fix(api): handle missing board.json on first run
docs: update nginx vhost example in README
chore(docker): upgrade base image to node 22
ci: add build cache to publish workflow
refactor(ui): extract save status into custom hook
```

### Breaking changes

If your change breaks backward compatibility (e.g. changes the `board.json` format), add `!` after the type and a `BREAKING CHANGE` footer:

```
feat(api)!: change board storage format to support multiple boards

BREAKING CHANGE: existing board.json files must be migrated.
```

---

## Submitting a PR

1. Fork the repo
2. Create a branch matching your commit type: `feat/your-feature`, `fix/your-fix`, `docs/update-readme`
3. Write commits following the Conventional Commits format above
4. Test locally with `npm run dev` and `docker build` if touching the Dockerfile
5. Open a PR with a clear description of what and why — the PR title should also follow Conventional Commits

## Code style

- TypeScript strict mode is enabled — no `any` unless absolutely necessary
- No new dependencies without a good reason — keep the image small
- If you touch the Dockerfile, verify the standalone build still works

## Reporting a bug

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Docker version, browser)

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) as the project.
