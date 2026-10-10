# Testing

The app has no unit-test framework, because it has no build and no modules. Instead it is tested the way a
coach uses it: **a real Chromium (Playwright) opens the real `index.html` and drives it**, then asserts on
the DOM and on what is stored in `localStorage`. The suites live in `tests/`.

At v54 the regression is 63 suites plus two static gates: **2,063 assertions, 0 failures.** Treat any
failure, crash or "0 checks" result as a failed build.

## The gates, in the order they run

1. **Static gates** (`lint.js`, `bootorder.js`): parse the script with Acorn.
   - `lint.js` finds references to names that no longer exist (a runtime `ReferenceError` that
     `node --check` accepts).
   - `bootorder.js` fails if startup code can read something not yet assigned (the failure that once wiped a
     saved season on load). Related: `bootreach54.js`, `toplevel54.js`, `freefn.js`, `fnlen53.js`.
2. **Behaviour suites** (`runall.sh` runs all 63). Each prints `PASS n  FAIL m`. Areas covered: clock and
   periods, goals/assists/cards, undo, playing time, line-up plan, prepared matches, attendance, teams,
   export and import, backup reminder, install hints, service worker, offline start, native shell,
   large-font layout, match card, upgrade of a match in progress, hardening against bad stored data. The
   newest, `v46.js` to `v54.js`, test each version's changes.
3. **Golden master** (`gm54.js`) for any change to loading, normalising, importing or boot order: run the
   previous build and the new build on the same stored data and imports, with a frozen `Date` and seeded
   `Math.random`, and compare `localStorage` side by side. Generated ids are replaced by tokens in order of
   appearance, so what is compared is *where* ids sit and *which* are equal, not the order they were issued.
4. **Snapshot gate** (`snapgate.sh` with `snap/snap.js`): a scripted walk through the app that saves the DOM,
   CSS, state and match card of every screen, and compares them with the previous version's run. Everything
   except PNG pixels must be **identical**, apart from the version line in the help text. PNG differences are
   reported (known one-pixel noise). This is what proves a refactor changed nothing visible.

## Rules for new tests

- **A new test must fail on the old build.** Run it against the previous `index.html` first; if it passes
  there, it proves nothing. (`APP=file:///path/to/old/index.html node tests/v54.js`.)
- Write what the coach would see or what is stored, not internals.
- Use the **fake clock** technique rather than waiting: either Playwright's `clock.install` /
  `runFor`, or shifting `Date.now` in the page (`window.__off`). The suites show both.
- Seed state with `addInitScript` setting `matchdayTrackerData_v1` once per session (guard with
  `sessionStorage`). Never edit the app file in a test.
- Also test the **edge**: empty team, one player, unreadable storage, a match from an older version,
  a file with missing fields.
- A suite must print its result in the `PASS n  FAIL m` form (or `n geslaagd, m gefaald`); the runner counts
  a crash or silence as a failure.
- **Do not edit `index.html` while a regression runs.** The suites read the file live.

## Running

Requirements: Node 22, `npm i` in `tests/` (Playwright 1.56, Acorn, acorn-walk), and Chromium
(`npx playwright install chromium`, or point at an installed one).

The suites default to `/mnt/user-data/outputs/index.html` (and `sw.js`) because that is where builds are
delivered in the Claude sessions. Locally the reliable way is a symlink from that path to the repo root.
Only about half the suites honour `APP=file:///abs/path/index.html` (31 of 63 at v54), and those that
read `sw.js` always look in `/mnt/user-data/outputs`. Comparing against an older build (`APP=...old/index.html`)
therefore works for the newer suites; for the others, swap the file in place.

```bash
cd tests
npm i && npx playwright install chromium
mkdir -p /mnt/user-data && ln -s "$(cd .. && pwd)" /mnt/user-data/outputs   # once; needs permission
SP=$PWD ./runall.sh            # everything; ends with "TOTAAL  pass N  fail 0"
SP=$PWD node v54.js            # one suite (older suites: node -r $PWD/welcomeshim.js clock.js)
```

Some suites need a shim (`-r welcomeshim.js`): since v48 an empty team shows a Welcome list, and older
suites type the squad into the single-player form, so the shim clicks "Add one at a time" first. `runall.sh`
applies it where needed (not to `v48.js` onwards, which test the Welcome itself).

### Making a snapshot baseline

The snapshot gate compares against a "golden" run of the previous version. Make one from the build you are
about to replace, then gate the new build against it:

```bash
APP=file:///path/to/previous/index.html OUT=snap/golden_prev node snap/snap.js
./snapgate.sh new golden_prev      # builds from /mnt/user-data/outputs/index.html, prints SNAPSHOT-POORT: OK
```

## Before delivering a build

1. `APP_VERSION` equals `CACHE_VERSION` in `sw.js`.
2. Full `runall.sh`: zero failures, no crashes.
3. Golden master and snapshot gate if the change touches load, import, boot or rendering.
4. The new tests failed on the previous build.
5. A short note of what changed, for the owner's README.

## Known limits

- Real-device behaviour (haptics, wake lock, share sheet, install prompt) is only partly testable in
  Chromium; the Android shell has a manual checklist in `android-shell/README.md`.
- The suites are slow-ish (minutes) because they use real timers in places.
- Paths: several suites hard-code `/mnt/user-data/outputs` and a few write scratch files under `/tmp`.
