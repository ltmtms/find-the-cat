# Find the Cat 🐱

A browser mini-game: spot the hidden cat in each scene before the countdown runs out.

**Play online:** [https://ltmtms.github.io/find-the-cat/](https://ltmtms.github.io/find-the-cat/)

## How to play

1. Tap **Play** on the start screen.
2. Each level shows a illustrated scene with a camouflaged cat.
3. **Click or tap the cat** before the timer hits zero.
4. You have **3 lives**. Losing a level (timeout or empty life after mistakes) costs one life and replays that level.
5. **Wrong taps** do not cost a life directly, but subtract **3 seconds** from the clock — enough misses can still make you fail.
6. Finding the cat awards **100 points** plus **+25 per consecutive find** (streak). Wrong taps or timeouts reset your streak.
7. Clear all **22 levels** to win.

Difficulty ramps up: cats get smaller and better camouflaged, and timers get shorter on later levels.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/find-the-cat/`).

## Build

Level SVGs and `public/levels.json` are generated automatically before build:

```bash
npm run generate:levels   # optional manual regen
npm run build
npm run preview           # serve production build locally
```

Output is in `dist/`, configured for the GitHub Pages project path `/find-the-cat/`.

## GitHub Pages

Pushes to `main` run [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml), which builds with Vite and deploys to GitHub Pages.

In the repo **Settings → Pages**, set the source to **GitHub Actions** (if not already).

## Project layout

| Path | Purpose |
|------|---------|
| `scripts/generate-levels.mjs` | Builds 22 scene SVGs + hit-box metadata |
| `public/levels/` | Generated level images (committed after build) |
| `public/levels.json` | Per-level countdown and normalized hit boxes |
| `src/main.ts` | Game logic and UI |
| `src/style.css` | Layout and theming |

## License

MIT — have fun finding cats.
