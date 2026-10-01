# Prediction League

A simple web app for tracking a friends' football prediction league. Every game
week, each friend predicts games; you record whether each prediction was right
(✓) or wrong (✗). The app keeps a running **accuracy leaderboard** — a colorful
horizontal bar chart showing who's doing best across the season.

Built for a group of 13 friends over 38 game weeks, but the names and week count
can be changed inside the app.

## What it looks like

- **Leaderboard** — a bar chart ranked by accuracy (correct ÷ weeks played). Each
  rank has its own color, matched between the rank number and its bar.
- **Games played** — the per-week log of individual game results.
- **Full grid** — every player × every week, at a glance.
- **Record week** / **Manage** — admin-only tabs for entering results and editing
  players, season name, and backups.

## How it works (two ways to use it)

**1. Live & shared (the hosted version)**
Everyone opens the same link and sees the same live standings, updating within a
few seconds. Only the admin — the person with the password — can record results;
everyone else views read-only. There's no way for a viewer to edit, even by
fiddling with the page: the server checks the password on every change.

- Friends: just open the link. You'll see the leaderboard; there are no editing
  tabs and nothing is clickable to change.
- Admin: open the same link, click **🔒 Unlock editing** (top-right), type the
  password once, and the **Record week** + **Manage** tabs appear. Your browser
  remembers it, so you only type it once per device. Click **✏️ Editing · Lock**
  to step back to view-only.

The little status pill (top-right) tells you the state:

| Pill | Meaning |
|------|---------|
| 🟢 Live | Connected to the shared store, viewing. |
| 🔵 Editing (admin) | Unlocked — your changes save for everyone. |
| ⚪ Local only | No shared store reached — using this device's own copy. |
| 🔴 Offline — reconnecting | Lost connection; keeps working locally and re-syncs. |

**2. Offline / personal (no internet needed)**
`prediction-league-tracker.html` is a single self-contained file. Double-click it
to open in any browser — it works with no internet and no setup, storing data in
that browser only. Handy as a personal backup or for playing with it locally.

## Running it

**Just view/use it offline:** open `prediction-league-tracker.html` in a browser.
That's it — no install, no server.

**Host the shared live version:** see **[README-DEPLOY.md](README-DEPLOY.md)** for
the step-by-step guide (deploy to Vercel, add a free Redis store, set your admin
password). It's a one-time ~5-minute setup.

## What's in this repo

| File | What it is |
|------|------------|
| `index.html` | The hosted app your friends open. Reads/writes shared results. |
| `api/state.js` | Tiny server function that stores the shared results and checks the admin password. |
| `prediction-league-tracker.html` | The offline single-file version. Works with no internet. |
| `README-DEPLOY.md` | Click-by-click guide to put the shared version online. |

## How it's built

Deliberately simple and dependency-free:

- **Frontend:** one self-contained HTML file — no frameworks, no CDN, no chart
  library. The bar chart is plain HTML/CSS.
- **Backend:** a single Vercel serverless function (`api/state.js`) with no npm
  dependencies, talking to an Upstash Redis store over its REST API.
- **Storage:** the whole league is one JSON blob under a single key. Live updates
  work by polling every few seconds — plenty for a weekly league.
- **Data safety:** if the network drops, the app keeps working from a local copy
  and re-syncs when it's back. Export/import backups any time from the Manage tab.

Personal preferences (light/dark theme, leaderboard sort) are kept per-device and
never affect anyone else's view.
