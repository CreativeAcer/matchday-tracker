# Decisions

Short records of why things are the way they are. Each entry: the choice, the reason, and what it costs. If
you want to reverse one, read the reason first.

Where a reason is written down (code comments, the README, the project history) it is stated plainly. Where
it is my reconstruction from the code, the entry is marked **(inferred)**; ask the owner before relying on
it.

## 1. One HTML file, no build, no framework
**Why:** a volunteer coach's tool that one person maintains. A single file is trivial to host, to cache
offline, to inspect and to hand to someone. No toolchain to rot. **Cost:** a 7,000-line file, a hand-rolled
render loop, discipline needed to keep it navigable (named functions, sections, tests). **Revisit only if**
a backend or accounts become real goals; that is a different product (`roadmap.md`).

## 2. Strict ES5 style in one IIFE (inferred)
**Why:** most likely compatibility with older phones and WebViews, no transpiler, and simple parsing for the
test tooling. **Cost:** verbose code. The file has no `let`, `const`, arrows or template literals; keep it so.

## 3. Data in `localStorage`, on the device
**Why:** zero accounts, works offline, nothing leaves the phone (children's data). **Cost:** data is lost if
the browser data is cleared, so the app nags for backups (`backupNudgeDue`) and exports are first-class.
Storage keys are permanent because real seasons live under them (`data-model.md`).

## 4. Matches are an event log; stats are derived
**Why:** goals, cards and minutes are recomputed from events, so editing or deleting an event, or undoing,
can never leave totals inconsistent. A finished match stores its derived numbers but recomputes them on any
edit. **Cost:** every feature that adds an event type must teach `computeStats`, `recomputeRecord`, undo and
the edit sheets.

## 5. One continuous match clock, derived from `Date.now()`
**Why:** a goal reads 52' in the report, not "Q4 7'", and a locked or backgrounded phone loses nothing.
`periodStartMs` marks where the current period began. **Cost:** a match saved before `periodStartMs` existed
has no period timing; the app falls back to plain match time and says nothing rather than guess.

## 6. Everything optional is off by default
**Why:** a new team sees a minimal app; coaches turn on only what they track (assists, cards, playing time,
line-up plan). Keeps the pitch screen calm. **Cost:** more branches in the render code.

## 7. Stray taps must never cost data
**Why:** one-handed use on a sideline. Goals have a double-tap guard; the badge menu hides cards and
benching one deliberate tap deeper; sheets ignore taps for their first moments; Undo names what it removes
and confirms; a wrong break can be taken back exactly. **Cost:** an extra tap for rare actions.

## 8. The service worker installs all-or-nothing for the app shell
**Why:** a half-cached new version replacing a working old one is the one failure an offline-first app must
never have. Old caches are deleted only once the new cache demonstrably holds the app. Navigations are
network-first so a deploy is picked up, with the cache as the offline fallback.

## 9. Unreadable saved data is rescued, not overwritten
**Why:** an early bug where startup code read a not-yet-assigned constant made `load()` throw, the catch hand
back an empty state and `persist()` write that over the season. Now the raw text is kept under a `_rescue_`
key and the app starts empty with a visible message, and the boot block sits at the very end of the script,
guarded by tests.

## 10. A stale clock is rewound, never the match discarded
**Why:** a phone left in a pocket with the clock running must not produce a 6-hour match. After 3 hours the
clock is paused and rewound to just after the last real activity, and the coach is told. The match survives.

## 11. Import matches players by name and number, and never trusts the file
**Why:** ids are invented per device, so a file from another coach refers to nobody by id. Matching on name
and number, reporting who is missing, and offering new team / merge / replace keeps imports safe.
`exportedFrom` is informational only, so a rename does not break old files.

## 12. Refactor behind a golden master and a snapshot gate
**Why:** v53 and v54 restructured shared helpers (overlays, the kick-off form, one team-field list, the boot
order) without changing behaviour. That is only safe if old and new builds can be compared on identical
data. `gm54.js` compares stored data after identical actions; the snapshot gate compares every screen's
DOM, CSS, state and match card. Both must show *no* difference.

## 13. One list of a team's fields (`normaliseTeam`)
**Why:** fields were previously listed in several places and drifted. A single normaliser means a new field
cannot be forgotten on load, import or new-team creation.

## 14. Bench reuse ("set once")
**Why:** so the bench does not have to be rebuilt before every match (stated in the code and the help text),
so the first-clock-run line-up is remembered. **Known cost:** a player benched or absent that day then starts on the bench every time, with no
hint (`roadmap.md`, first item). The line-up plan overrides it by design.

## 15. Only `index.html` and `sw.js` are delivered for app changes
**Why:** the owner maintains the README and repo layout himself, and a small, predictable hand-over avoids
accidental changes elsewhere. The Android shell reuses the same `index.html`, so there is no second code
base to keep in sync.

## 16. English UI, Belgian-friendly input (inferred)
**Why:** English was the starting language and keeps the app shareable. Numbers accept a decimal comma
(stated in the code) and dates use the device locale. A Dutch interface is a possible later addition.
