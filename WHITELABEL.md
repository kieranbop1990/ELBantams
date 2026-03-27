# Whitelabel Guide — Set Up Your Own Club Site

This site is designed to work for **any grassroots football club**. No coding required — just edit your club details and deploy.

## Quick Start (3 Steps)

1. **Fork** this repository on GitHub (click the "Fork" button)
2. **Customise** your club details using the built-in editor at `/#/customise`
3. **Deploy** by enabling GitHub Pages in your repo settings

That's it — your site will be live within minutes.

---

## Using the Customise Page

Visit your site (or the original) and navigate to `/#/customise`. The editor lets you configure:

| Tab | What you can edit |
|-----|-------------------|
| **Club** | Name, tagline, colours, socials, badge, address, about section, history |
| **Teams** | Sections (e.g. Seniors, Youth), individual teams, managers, coaches |
| **Committee** | Committee members and their roles |
| **News** | News articles with optional expandable body text |
| **Matchday** | Ground information, directions, facilities |
| **Registration** | Registration options with payment links |
| **Gallery** | Photo captions and image paths |

### Workflow

1. Fill in your club details across the tabs
2. Click **Apply Preview** to see changes live across the site
3. Navigate to other pages (Home, Teams, etc.) to verify everything looks right
4. Click **Export ZIP** to download your configuration files
5. Replace the files in `website/public/data/` in your fork with the exported ones
6. Add your images to `website/public/images/`
7. Push to `main` — done!

---

## Adding Images

Place your images in `website/public/images/` and reference them in the config as `images/filename.ext`.

You'll want:
- **Club badge** — shown on the home page (e.g. `images/badge.png`)
- **Section logos** — shown in the header (e.g. `images/seniors.png`)
- **Team photos** — shown on team cards (optional)
- **Ground image** — shown on the matchday page (optional)

---

## Choosing Your Colour

In the Club tab, select your **Primary Colour** from the dropdown. Available colours:

red, pink, grape, violet, indigo, blue, cyan, teal, green, lime, yellow, orange

The entire site theme updates automatically — buttons, badges, links, icons all follow your chosen colour.

---

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow that builds and deploys automatically.

1. Go to your fork's **Settings > Pages**
2. Under **Source**, select **GitHub Actions**
3. Push any change to `main` — the site builds and deploys within a few minutes
4. Your site will be at `https://<your-username>.github.io/<repo-name>/`

---

## Branch-per-Club Model

If multiple clubs want to share a single repository (e.g. a league or umbrella organisation):

1. Each club creates a branch (e.g. `club/riverside-fc`)
2. Each branch has its own `website/public/data/` and `website/public/images/`
3. Set up separate GitHub Pages deployments per branch, or use separate forks

This approach lets clubs pull upstream improvements (new features, bug fixes) from the `main` branch while keeping their own customisations.

---

## Live Fixture Feeds

The site can show live fixtures and results from the FA Full-Time system via [fulltimeCalendar](https://github.com/adamsuk/fulltimeCalendar).

To connect your club:
1. Set `clubFeedSlug` in club.json to your club's slug (e.g. `"my-club"`)
2. Set `teamSlugPrefix` to filter your teams (e.g. `"my-club-"`)
3. Set individual team `slug` fields in teams.json to match feed team names

If your club isn't in the fulltimeCalendar system yet, the fixtures pages will gracefully show "unavailable" — everything else works fine without it.

---

## Manual JSON Editing (Advanced)

If you prefer to edit JSON directly instead of using the customise page:

- `website/public/data/club.json` — Club identity, colours, socials, nav, about, history
- `website/public/data/teams.json` — Team sections and individual teams
- `website/public/data/committee.json` — Committee members
- `website/public/data/news.json` — News articles
- `website/public/data/matchday.json` — Ground/facility information
- `website/public/data/registration.json` — Registration links
- `website/public/data/gallery.json` — Photo gallery

You can edit these directly in GitHub's web editor — no local setup needed.

---

## Updating from Upstream

To pull new features and fixes from the original repo:

```bash
git remote add upstream https://github.com/adamsuk/ELBantams.git
git fetch upstream
git merge upstream/main
```

Your `data/` and `images/` files won't conflict since they're specific to your club.
