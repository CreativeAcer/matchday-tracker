# README images

The screenshots, the hero banner and the demo GIF in `screenshots/` are **generated from the real app**, not
drawn by hand, using fictional demo data (a team called FC Riverside). Regenerate them whenever the look
changes or the product is renamed, so the README never shows an app that no longer exists.

## What is there

| File | Shows |
|---|---|
| `00-hero.png` | Composite banner: four screens (who's here, live match, line-up at the break, match card) |
| `demo.gif` | About 20 seconds: kick-off form, who's here, clock, goal and assist, opponent goal, time's up, line-up at the break |
| `01` to `20` | The step-by-step tour: before the match, during, breaks and full time, after the match, teams/options/backup |
| `21` to `23` | Dark mode: kick-off, live match, history |

Numbered names avoid clashes with older file names, including on systems that ignore letter case.

## How to regenerate

Tools live in `tools/readme-shots/`:

| File | Role |
|---|---|
| `lib.js` | Shared set-up: fake clock, seeded randomness, the real fonts embedded, the demo team and history |
| `shots.js` | Drives the app through a whole match and saves every still (light and dark, phone size) |
| `gif.js` | Captures the frames of the demo flow, with a tap marker on each target |
| `hero.js` | Renders the banner from four of the stills |
| `make.sh` | Runs all of it and writes the final, numbered files into `screenshots/` |

```bash
cd tests && npm i && npx playwright install chromium    # once
cd ../tools/readme-shots
SP=$(cd ../../tests && pwd) bash make.sh                 # needs ffmpeg
```

## How it stays honest and stable

- Real **Oswald and Work Sans** are embedded from `@fontsource`, so the images look like the phone, not a
  fallback font. Google's font requests are answered locally.
- A **fake clock** and a seeded `Math.random` make runs repeatable, and CSS animations are off.
- The flow fills the team's data in through the app's own storage key, takes a real backup first (to
  silence the backup reminder), and waits for toasts to clear so none sit over a screenshot.
- The match card image is saved straight from the app's own canvas.

## If a selector breaks

`shots.js` and `gif.js` click real elements by id (`#kickoffBtn`, `#hereGo`, `#clockBtn`, `#halfTimeBtn`,
`#breakApply`, `[data-here]`, `.tile[data-tile]`, ...). If the UI changes, a step fails with the selector in
the message: update the selector, not the approach. Failures are collected and listed at the end.

## Content rules

Demo names only. Never a real child's name, team or club in a published image. Two things in the README
text still say "Matchday Tracker": the hero image and the match card footer, so a rename needs a rerun.
