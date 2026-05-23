# Contributing to PadelPro

## Branch Strategy

We follow **Git Flow** with the following branches:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only. Never push directly. |
| `develop` | Integration branch. All features merge here first. |
| `feature/<name>` | New features (e.g. `feature/leaderboard-filter`) |
| `fix/<name>` | Bug fixes (e.g. `fix/login-validation`) |
| `test/<name>` | Test additions (e.g. `test/auth-endpoints`) |
| `docs/<name>` | Documentation updates |

## Workflow

```
1. Branch off develop:
   git checkout develop
   git checkout -b feature/your-feature-name

2. Commit regularly with clear messages (see below)

3. Push and open a Pull Request into develop

4. After review, merge into develop

5. When release is ready, develop → main
```

## Commit Message Format

```
<type>(<scope>): <short description>

Types:
  feat      — new feature
  fix       — bug fix
  test      — adding/updating tests
  docs      — documentation only
  style     — formatting, no logic change
  refactor  — code restructure
  chore     — build, deps, tooling

Examples:
  feat(auth): add JWT login endpoint
  fix(leaderboard): correct points sorting order
  test(matches): add admin-only endpoint tests
  docs(readme): update setup instructions
```

## Team Member Responsibilities

| Member | Pages | Service |
|--------|-------|---------|
| Member 1 | Home, Login, Register | Auth Service |
| Member 2 | Dashboard, Profile, Leaderboard | User Service |
| Member 3 | Tournaments, Tournament Detail | Tournament Service |
| Member 4 | Admin pages (×4), Match Service | Match Service + API Gateway |
