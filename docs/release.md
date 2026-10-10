# Release

## Versioning

- `APP_VERSION` (a string of digits, e.g. `"54"`) in `index.html`, and `CACHE_VERSION = "matchday-v54"` in
  `sw.js`, **must match**. `tests/manifest.js` and `tests/v54.js` check it. Bump both on **every**
  delivered build; the cache name changing is what makes installed copies update.
- One version per package of change. The version shows in Help ("Matchday Tracker · version 54") and becomes
  the Android `versionName`.
- Current: **v54**.

## What gets delivered

For an app change, only these two files:

- `index.html`
- `sw.js`

State the version number in the hand-over note; the owner updates the README himself. Everything else
(README, docs, `android-shell/`, workflow, icons, `manifest.json`) changes only on request. The shell zip
(`android-shell`) has been unchanged since v41.

## Deploying (the website)

GitHub Pages serves the repo root from `main`. Commit `index.html` and `sw.js` and push; the site updates
shortly after. Phones pick up the new service worker on their next online visit (navigations are
network-first, and the new cache name replaces the old one once the new shell is safely stored).

Do not rename the repo or change its path casually: the Pages URL is derived from it and installed home-screen
copies point at it (`roadmap.md`, "Renaming").

## Android app

Manual workflow: GitHub > Actions > **Android APK** > Run workflow. About 6 to 10 minutes later the APK is under
Releases > `android-latest` > `matchday-tracker.apk`. It takes the **current `index.html` from the repo root**,
so it needs no separate code.

- The version code is the workflow run number; the version name is `APP_VERSION`.
- It is a **debug APK signed with a fixed public key** (`android-shell/debug.keystore`): fine for the owner
  and teammates, not for the Play Store, which needs a private key.
- A new build installs over the old one and keeps its data (same key, rising version code).
- `appId` `com.creativeacer.matchdaytracker` becomes permanent on publishing. Do not change it casually: it
  is a different app to Android.
- The app's storage is separate from the browser's. Moving data = Team > Back up team data, then Import in
  the other.
- iOS is not covered (needs a Mac and an Apple developer account).
- First-install manual checklist: `android-shell/README.md`.

## Release checklist

1. Change `index.html` (and `sw.js` for the version).
2. Bump `APP_VERSION` and `CACHE_VERSION` together.
3. New tests written and shown to fail on the previous build.
4. Full regression green (`testing.md`); golden master and snapshot gate if load, import, boot or rendering
   changed.
5. Update the affected documents in `docs/` (rules, data model, architecture) in the same change.
6. Deliver `index.html` and `sw.js`; give the version number and a short list of changes.
7. After deploy: open the live app once online, confirm Help shows the new version, then confirm it still
   opens in airplane mode.

## README and screenshots

The README is owned by the owner. Screenshots and the GIF are regenerated with scripts, not by hand
(`readme-assets.md`); regenerate them when the look changes or the product is renamed.
