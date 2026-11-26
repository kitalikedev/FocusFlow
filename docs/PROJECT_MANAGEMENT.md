# Project planning and teamwork

Roles, plan and milestones, wireframes and the GitHub workflow of the team. The summary is in the [README](../README.md#8-project-planning-and-teamwork).

## 1. Roles and responsibilities

The team met at the start of the project to agree on the roles below. The meeting notes are in [`MEETING_NOTES.md`](MEETING_NOTES.md) (tracked in [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23)). The work was done in 5 sprints; the report of the 5 sprints is in [`docs/reports/sprints.md`](reports/sprints.md).

| Member | Role | Main responsibilities |
| :--- | :--- | :--- |
| Đàm Huỳnh Hoài Nam | Team leader, tech lead | Architecture, specification documents, database, CI/CD, deployment, workspace features, website pages, Google Analytics and Sentry, reviewing and merging every pull request |
| Nguyễn Anh Dũng | Vice leader, reporter, frontend developer, UI designer | Tracking progress and planning for the team, clock styles, README, redesign of the website |
| Võ Xuân Phú | Frontend developer, performance QA | Lofi radio, quote display and default theme, Lighthouse audits, mini player and the fixes from the peer review |
| Lê Nguyễn Thảo Anh | UI/UX designer, frontend developer | Pixel theme, wireframes, new website interface |
| Trần Công Sanh | Backend and frontend developer | Quotes, demo data for the database, YouTube music controller |


## 2. Plan and milestones

The work was split into GitHub Milestones, each with its own issues and deadline.

```mermaid
gantt
    title FocusFlow timeline (November 2026)
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    section Planning
    Specification, ERD, architecture        :done, p1, 2026-11-05, 2d
    Workspace wireframes                    :done, p2, 2026-11-07, 2d
    Website redesign wireframes             :done, p3, 2026-11-19, 1d
    section Build
    Foundation, auth, data layer            :done, b1, 2026-11-05, 2d
    Workspace features                      :done, b2, 2026-11-07, 4d
    Website pages and navigation            :done, b3, 2026-11-13, 7d
    Google Analytics and Sentry             :done, b4, 2026-11-18, 2d
    Seed data and music controller          :done, b5, 2026-11-19, 2d
    section Polish
    Website redesign                        :done, c1, 2026-11-19, 2d
    Lighthouse audits and fixes             :done, c2, 2026-11-19, 3d
    section Delivery
    Report, video, peer review              :active, d1, 2026-11-21, 6d
    Peer review deadline                    :milestone, m1, 2026-11-26, 0d
```

| Milestone | Content | Deadline |
| :--- | :--- | :--- |
| 1. Multi-page routing | Website pages, landing page, wireframes, meeting notes | 20/11/2026 |
| 2. Tracking and logging | Google Analytics, Sentry | done |
| 3. Seed data and README | Demo data, this report | done with this report |
| 4. Lighthouse | Audits and fixes | done |
| 5. Peer review | Reviews of other teams, changes from feedback | 26/11/2026 |


## 3. Wireframes

The team first drew wireframes of the workspace for desktop and mobile, then one for each page of the redesigned website, and reviewed them together before building the pages.

| Wireframe | Tool | Source file | Date |
| :-- | :-- | :-- | :-- |
| Workspace, desktop and mobile | Figma | [wireframe_focusflow](https://www.figma.com/design/SB7nswLyX7S57NwEHATfKH/wireframe_focusflow?node-id=0-1) | 19/11/2026 (Figma version history) |
| Website redesign: Home, Themes, Analytics, Tracking, About | Claude Design canvas | [FocusFlow Website Redesign](https://claude.ai/artifact/6GVLXUjZeKgWe6j8hjJXw5) | 19/11/2026 |

The images below are exports of these files.

| Workspace (desktop) | Workspace (mobile) |
| :---: | :---: |
| ![Desktop wireframe](wireframes/wireframe_focusflowpc.png) | <img src="wireframes/wireframe_focusflowmobile.png" alt="Mobile wireframe" width="260"> |

| Home | Themes | Analytics |
| :---: | :---: | :---: |
| ![Home wireframe](wireframes/Redesign_Home.png) | ![Themes wireframe](wireframes/Redesign_Themes.png) | ![Analytics wireframe](wireframes/Redesign_Analytics.png) |
| **Tracking** | **About** | |
| ![Tracking wireframe](wireframes/Redesign_Tracking.png) | ![About wireframe](wireframes/Redesign_About.png) | |


## 4. GitHub workflow

```mermaid
flowchart LR
    Issue["Issue<br/>with milestone and assignee"] --> Branch["Branch from main<br/>feature/... or fix/..."]
    Branch --> Commits["Small commits<br/>clear messages"]
    Commits --> PR["Pull request<br/>Closes #issue"]
    PR --> CI{"GitHub Actions<br/>secrets, lint, types,<br/>tests, build"}
    CI -- "fails" --> Commits
    CI -- "passes" --> Review{"Review<br/>1 approval"}
    Review -- "changes requested" --> Commits
    Review -- "approved" --> Merge["Squash merge<br/>into main"]
    Merge --> Deploy["Vercel deploys<br/>production"]
    PR -.-> Preview["Vercel preview<br/>for each PR"]
```

- `main` is protected by a ruleset: changes only through a pull request, 1 approval, squash merge, and the `ci` check must pass.
- Every task is a GitHub Issue with an assignee and a milestone; pull requests link their issue with `Closes #N`.
- Commit messages are short sentences that say what changed, for example `Add landing page and site menu` or `Fix flaky page title tests`.
- Team members work in GitHub Codespaces, so everyone has the same Node.js version and tools.
