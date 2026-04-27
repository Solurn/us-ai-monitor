# Web Deployment

This project can be published as a web dashboard with GitHub Pages.

## What Users Will See

After deployment, other people can open the dashboard from a normal web URL. They do not need Node.js, Codex, PowerShell, or the local project folder.

## What Updates Automatically

The GitHub Actions workflow:

1. Runs `npm run update:performance`.
2. Writes `web/data/performance-snapshot.js`.
3. Publishes the `web/` folder to GitHub Pages.

Current automated data scope:

- US ticker 21-trading-day performance snapshot.
- Taiwan tickers remain TradingView links and are not included in performance averages.
- Company notes, event notes, and learning content are still curated static content unless separate news/IR updaters are added later.

## Setup Steps

1. Create a GitHub repository.
2. Upload this project to the repository.
3. In GitHub, open `Settings` -> `Pages`.
4. Set `Build and deployment` source to `GitHub Actions`.
5. Open the `Actions` tab.
6. Run `Update and deploy dashboard` manually once.
7. GitHub will give you a Pages URL after the first successful deploy.

## Schedule

The workflow currently runs on weekdays at:

```text
23:30 UTC
```

This is around Taiwan morning after the regular US market close during US daylight saving time.

You can also run it manually from the GitHub Actions page.

## Local vs Web

Local mode:

- Good for private editing and testing.
- Can use Windows logon scheduled updates.

Web mode:

- Good for sharing.
- GitHub Actions updates and publishes the website.
- Visitors only need the URL.

## Important

This is a research dashboard, not investment advice. Free quote sources can fail or change behavior, so the dashboard should show missing data rather than inventing values.
