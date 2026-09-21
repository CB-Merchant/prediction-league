# Go live: shared Prediction League on Vercel

This makes **one shared, live league table**: you record results, and everyone
with the link sees the same standings update in a few seconds. Only you (with a
password) can edit — friends can look but not touch.

You only do this **once**, and it takes about **5 minutes**. Everything is
copy‑paste. You never share the password with anyone you don't want editing.

---

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | The app your friends open. Same look, colors, and animations as before. |
| `api/state.js` | A tiny server function that stores the shared results and checks your password. |
| `prediction-league-tracker.html` | The old **offline** single‑file version. Keep it as a personal backup — it still works with no internet. |

You don't need to edit any of these. Just deploy the folder.

---

## Step 1 — Put the folder on Vercel

Pick **one** of these.

**A) Easiest — drag & drop (no install)**
1. Go to <https://vercel.com> and sign in (free — you can use your GitHub/Google/email).
2. Click **Add New… → Project**.
3. Choose **Deploy** by dragging this whole `Prediction-League-Tracker` folder in
   (or import it from GitHub if you prefer to keep it there).
4. Click **Deploy** and wait for it to finish. You'll get a URL like
   `https://prediction-league-tracker.vercel.app`.

**B) From the terminal (if you like the command line)**
```bash
npm i -g vercel
cd "Prediction-League-Tracker"
vercel
```
Answer the prompts (accept the defaults). When it finishes it prints your live URL.

> At this point the page loads, but the status pill in the top‑right will say
> **“Local only”** — that's expected until Step 2 adds the shared storage.

---

## Step 2 — Add the shared storage (so everyone sees the same table)

1. In your project on the Vercel dashboard, open the **Storage** tab.
2. Click **Create Database → KV (Redis)** (it may be labelled **Upstash for Redis**),
   give it any name, and create it.
3. When asked, **Connect** it to this project. Leave the variable names as the
   defaults — Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). The app understands
   either pair, so you don't have to rename anything.

---

## Step 3 — Set your admin password

1. Project → **Settings → Environment Variables**.
2. Add a new variable:
   - **Name:** `ADMIN_TOKEN`
   - **Value:** a password you choose (make it decent — anyone who has it can edit).
   - Apply it to **all environments** (Production, Preview, Development).
3. Save.

---

## Step 4 — Redeploy, then share

Environment variables only take effect on a fresh deploy:

- Dashboard: **Deployments** tab → open the latest → **⋯ → Redeploy**.
- Or terminal: `vercel --prod`

Then:
- **Send friends the URL.** They'll see the live table, read‑only. There are no
  Record/Manage tabs for them and nothing is clickable to edit.
- **To record:** open the same URL → click **🔒 Unlock editing** (top‑right) →
  type your `ADMIN_TOKEN` password once. The Record week + Manage tabs appear and
  the pill turns to **“Editing (admin)”**. Your device remembers it, so you only
  type it once per browser. Click **✏️ Editing · Lock** to step back to view mode.

---

## Did it work? (30‑second check)

1. Open your URL on your phone **and** your computer.
2. On your computer, **Unlock editing** and mark one result.
3. Within ~7 seconds it shows up on your phone **without** refreshing. ✅
4. On the phone (still locked), confirm there's **no** way to edit — no Record tab,
   squares don't respond to taps. ✅

If all four are true, you're done. Send the link to the group.

---

## The status pill (top‑right) means:

| Pill | Meaning |
|------|---------|
| 🟢 **Live** | Connected to the shared store, viewing. |
| 🔵 **Editing (admin)** | You're unlocked and your changes are saving for everyone. |
| ⚪ **Local only** | No shared store reachable — using this device's copy. (Usually means Step 2 isn't finished, or you opened the raw file.) |
| 🔴 **Offline — reconnecting** | Lost connection; it keeps working locally and re‑syncs automatically. |

---

## Good to know

- **Nothing is lost if the internet drops.** The page keeps working from a local
  copy and pushes your edits up once it's back online.
- **Back up anytime.** Manage → *Export backup (.json)*. Import it later to restore.
- **Changed the password?** Anyone previously unlocked will be asked to unlock again
  with the new one — old saved passwords stop working automatically.
- **Personal preferences stay personal.** Light/dark theme and the leaderboard sort
  are per‑device — changing them never touches anyone else's view.
