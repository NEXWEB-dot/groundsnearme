# GroundsNearMe — player-facing site

Find and book a cricket ground in Karachi. This repository is the **public site**:
homepage, search, ground detail, matchmaking and login. Vanilla HTML/CSS/JS on
Cloudflare Pages, no build step.

Owned and built by the frontend developers.

## The repositories

| Repository | What it is | Deploys as |
| --- | --- | --- |
| **`groundsnearme`** (this repo) | the player-facing site | Cloudflare Pages |
| `groundsnearme-backend` | Supabase schema, the Worker, every `/v1` route, R2 images | Cloudflare Worker |
| `groundsnearme-admin` | owner dashboard, admin view, private finance dashboard | Cloudflare Pages |

## Layout

```
index.html      the homepage — rendering UI and mock/live data
assets/         hero imagery
```

## Note on the images

`assets/hero-bg.jpg`, `assets/hero-cricket.jpg` and `assets/batsman-on-turf.jpg` are
available in the `assets/` directory.
