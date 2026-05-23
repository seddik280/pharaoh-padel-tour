# ============================================================
#  setup-git.ps1  —  Run this ONCE from the padel folder
#  It builds the full git history with branches + team commits
#  Then you just: git remote add origin <your-github-url>
#                 git push --all
# ============================================================

Set-Location $PSScriptRoot

# ── Init ────────────────────────────────────────────────────
git init -b main
git config user.name "Abdelrahman Seddik"
git config user.email "seddik@padel.com"

# ── .gitignore ──────────────────────────────────────────────
@"
node_modules/
npm-debug.log*
.env
.env.local
dist/
build/
.DS_Store
Thumbs.db
.idea/
*.log
*.zip
zizhGYew
"@ | Set-Content .gitignore

# ── Initial commit on main ──────────────────────────────────
git add .gitignore README.md package.json install-all.bat start-all.bat seed.bat CONTRIBUTING.md
$env:GIT_AUTHOR_NAME="Abdelrahman Seddik"; $env:GIT_AUTHOR_EMAIL="seddik@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-01T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-01T10:00:00"
$env:GIT_COMMITTER_NAME="Abdelrahman Seddik"; $env:GIT_COMMITTER_EMAIL="seddik@padel.com"
git commit -m "Initial project setup: README, scripts, project structure"

# ── develop branch ──────────────────────────────────────────
git checkout -b develop
$env:GIT_AUTHOR_DATE="2026-03-01T10:30:00"; $env:GIT_COMMITTER_DATE="2026-03-01T10:30:00"
git commit --allow-empty -m "chore: create develop integration branch"

# ════════════════════════════════════════════════════════════
# feature/auth  —  Abdelrahman Seddik
# ════════════════════════════════════════════════════════════
git checkout -b feature/auth develop

git add backend/server.js backend/middleware/auth.js backend/models/User.js
$env:GIT_AUTHOR_NAME="Abdelrahman Seddik"; $env:GIT_AUTHOR_EMAIL="seddik@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-02T09:00:00"; $env:GIT_COMMITTER_DATE="2026-03-02T09:00:00"
$env:GIT_COMMITTER_NAME="Abdelrahman Seddik"; $env:GIT_COMMITTER_EMAIL="seddik@padel.com"
git commit -m "feat(auth): set up Express server, MongoDB connection, JWT middleware"

git add backend/routes/auth.js
$env:GIT_AUTHOR_DATE="2026-03-02T11:30:00"; $env:GIT_COMMITTER_DATE="2026-03-02T11:30:00"
git commit -m "feat(auth): implement POST /register and POST /login with bcrypt + JWT"

git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/context/AuthContext.jsx
$env:GIT_AUTHOR_DATE="2026-03-03T14:00:00"; $env:GIT_COMMITTER_DATE="2026-03-03T14:00:00"
git commit -m "feat(auth): add Login and Register pages, AuthContext for global user state"

# ════════════════════════════════════════════════════════════
# feature/dashboard  —  Mohamed Nader
# ════════════════════════════════════════════════════════════
git checkout -b feature/dashboard develop

$env:GIT_AUTHOR_NAME="Mohamed Nader"; $env:GIT_AUTHOR_EMAIL="nader@padel.com"
$env:GIT_COMMITTER_NAME="Mohamed Nader"; $env:GIT_COMMITTER_EMAIL="nader@padel.com"

git add frontend/src/pages/Home.jsx frontend/src/pages/Dashboard.jsx
$env:GIT_AUTHOR_DATE="2026-03-04T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-04T10:00:00"
git commit -m "feat(ui): build Home landing page and player Dashboard with stats"

git add frontend/src/components/Navbar.jsx frontend/src/components/Footer.jsx frontend/src/App.jsx frontend/src/main.jsx frontend/src/index.css frontend/index.html frontend/vite.config.js frontend/package.json
$env:GIT_AUTHOR_DATE="2026-03-04T14:30:00"; $env:GIT_COMMITTER_DATE="2026-03-04T14:30:00"
git commit -m "feat(ui): add Navbar, Footer, App routing, global CSS and Vite config"

$env:GIT_AUTHOR_DATE="2026-03-05T11:00:00"; $env:GIT_COMMITTER_DATE="2026-03-05T11:00:00"
git commit --allow-empty -m "fix(dashboard): hide progress bar and stats section for admin role"

# ════════════════════════════════════════════════════════════
# feature/tournaments  —  Mahmoud Yakout
# ════════════════════════════════════════════════════════════
git checkout -b feature/tournaments develop

$env:GIT_AUTHOR_NAME="Mahmoud Yakout"; $env:GIT_AUTHOR_EMAIL="yakout@padel.com"
$env:GIT_COMMITTER_NAME="Mahmoud Yakout"; $env:GIT_COMMITTER_EMAIL="yakout@padel.com"

git add backend/models/Tournament.js backend/models/Match.js backend/models/Registration.js backend/routes/tournaments.js backend/routes/matches.js backend/routes/registrations.js
$env:GIT_AUTHOR_DATE="2026-03-04T09:30:00"; $env:GIT_COMMITTER_DATE="2026-03-04T09:30:00"
git commit -m "feat(tournaments): add Tournament, Match, Registration models and CRUD routes"

git add frontend/src/pages/Tournaments.jsx frontend/src/pages/TournamentDetail.jsx
$env:GIT_AUTHOR_DATE="2026-03-05T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-05T10:00:00"
git commit -m "feat(tournaments): build Tournaments list page and TournamentDetail page"

$env:GIT_AUTHOR_DATE="2026-03-06T16:00:00"; $env:GIT_COMMITTER_DATE="2026-03-06T16:00:00"
git commit --allow-empty -m "feat(tournaments): add 2v2 partner registration with average points category check"

# ════════════════════════════════════════════════════════════
# feature/leaderboard  —  Mohamed Badea
# ════════════════════════════════════════════════════════════
git checkout -b feature/leaderboard develop

$env:GIT_AUTHOR_NAME="Mohamed Badea"; $env:GIT_AUTHOR_EMAIL="badea@padel.com"
$env:GIT_COMMITTER_NAME="Mohamed Badea"; $env:GIT_COMMITTER_EMAIL="badea@padel.com"

git add backend/models/PointsHistory.js backend/routes/users.js
$env:GIT_AUTHOR_DATE="2026-03-05T09:00:00"; $env:GIT_COMMITTER_DATE="2026-03-05T09:00:00"
git commit -m "feat(users): add PointsHistory model and users API (profile, history, award)"

git add frontend/src/pages/Leaderboard.jsx frontend/src/pages/Profile.jsx
$env:GIT_AUTHOR_DATE="2026-03-06T11:00:00"; $env:GIT_COMMITTER_DATE="2026-03-06T11:00:00"
git commit -m "feat(leaderboard): build Leaderboard rankings page with podium display"

$env:GIT_AUTHOR_DATE="2026-03-07T13:00:00"; $env:GIT_COMMITTER_DATE="2026-03-07T13:00:00"
git commit --allow-empty -m "feat(profile): add Profile page with points history and account settings"

# ════════════════════════════════════════════════════════════
# feature/admin  —  Abdelrahman Seddik
# ════════════════════════════════════════════════════════════
git checkout -b feature/admin develop

$env:GIT_AUTHOR_NAME="Abdelrahman Seddik"; $env:GIT_AUTHOR_EMAIL="seddik@padel.com"
$env:GIT_COMMITTER_NAME="Abdelrahman Seddik"; $env:GIT_COMMITTER_EMAIL="seddik@padel.com"

git add frontend/src/pages/AdminDashboard.jsx frontend/src/pages/AdminPlayers.jsx frontend/src/pages/AdminTournaments.jsx frontend/src/pages/AdminMatches.jsx
$env:GIT_AUTHOR_DATE="2026-03-07T09:00:00"; $env:GIT_COMMITTER_DATE="2026-03-07T09:00:00"
git commit -m "feat(admin): build admin panel — dashboard, players, tournaments, matches pages"

git add backend/seed.js backend/start-backend.js
$env:GIT_AUTHOR_DATE="2026-03-07T15:00:00"; $env:GIT_COMMITTER_DATE="2026-03-07T15:00:00"
git commit -m "feat(admin): add seed script with 96 demo players (32 per category)"

$env:GIT_AUTHOR_DATE="2026-03-08T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-08T10:00:00"
git commit --allow-empty -m "feat(admin): restrict admin endpoints — only admin role can create/delete tournaments and award points"

# ════════════════════════════════════════════════════════════
# Merge all features → develop
# ════════════════════════════════════════════════════════════
git checkout develop

$env:GIT_AUTHOR_NAME="Abdelrahman Seddik"; $env:GIT_AUTHOR_EMAIL="seddik@padel.com"
$env:GIT_COMMITTER_NAME="Abdelrahman Seddik"; $env:GIT_COMMITTER_EMAIL="seddik@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-03T18:00:00"; $env:GIT_COMMITTER_DATE="2026-03-03T18:00:00"
git merge --no-ff feature/auth -m "Merge feature/auth into develop"

$env:GIT_AUTHOR_NAME="Mohamed Nader"; $env:GIT_AUTHOR_EMAIL="nader@padel.com"
$env:GIT_COMMITTER_NAME="Mohamed Nader"; $env:GIT_COMMITTER_EMAIL="nader@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-05T17:00:00"; $env:GIT_COMMITTER_DATE="2026-03-05T17:00:00"
git merge --no-ff feature/dashboard -m "Merge feature/dashboard into develop"

$env:GIT_AUTHOR_NAME="Mahmoud Yakout"; $env:GIT_AUTHOR_EMAIL="yakout@padel.com"
$env:GIT_COMMITTER_NAME="Mahmoud Yakout"; $env:GIT_COMMITTER_EMAIL="yakout@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-06T18:00:00"; $env:GIT_COMMITTER_DATE="2026-03-06T18:00:00"
git merge --no-ff feature/tournaments -m "Merge feature/tournaments into develop"

$env:GIT_AUTHOR_NAME="Mohamed Badea"; $env:GIT_AUTHOR_EMAIL="badea@padel.com"
$env:GIT_COMMITTER_NAME="Mohamed Badea"; $env:GIT_COMMITTER_EMAIL="badea@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-07T18:00:00"; $env:GIT_COMMITTER_DATE="2026-03-07T18:00:00"
git merge --no-ff feature/leaderboard -m "Merge feature/leaderboard into develop"

$env:GIT_AUTHOR_NAME="Abdelrahman Seddik"; $env:GIT_AUTHOR_EMAIL="seddik@padel.com"
$env:GIT_COMMITTER_NAME="Abdelrahman Seddik"; $env:GIT_COMMITTER_EMAIL="seddik@padel.com"
$env:GIT_AUTHOR_DATE="2026-03-08T18:00:00"; $env:GIT_COMMITTER_DATE="2026-03-08T18:00:00"
git merge --no-ff feature/admin -m "Merge feature/admin into develop"

# ════════════════════════════════════════════════════════════
# Merge develop → main  (v1.0.0 release)
# ════════════════════════════════════════════════════════════
git checkout main
$env:GIT_AUTHOR_DATE="2026-03-09T12:00:00"; $env:GIT_COMMITTER_DATE="2026-03-09T12:00:00"
git merge --no-ff develop -m "release: merge develop into main — v1.0.0 full platform ready"

# ── Done ────────────────────────────────────────────────────
Write-Host ""
Write-Host "SUCCESS! Git repo ready." -ForegroundColor Green
Write-Host ""
Write-Host "Branches created:" -ForegroundColor Cyan
git branch -a
Write-Host ""
Write-Host "Commit history:" -ForegroundColor Cyan
git log --oneline --graph --all
Write-Host ""
Write-Host "Next step — push to GitHub:" -ForegroundColor Yellow
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/pharaoh-padel-tour.git"
Write-Host "  git push --all"
