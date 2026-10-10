# Product

## What it is

Matchday Tracker turns a phone into a sideline companion for a volunteer youth-soccer coach. Tap a
player's tile to log a goal, record who assisted, track minutes played, plan who plays which quarter, and
end up with a shareable match report and season history. No account, no backend, no setup.

Built by a Flemish parent-coach for his son's U8 team (7 on the pitch, 9 to 11 children on the squad), with
other teams in mind. Live as a PWA on GitHub Pages, and buildable as a Capacitor-wrapped Android APK.

## Who uses it

- **The coach or parent on the sideline.** Standing, watching children, phone in one hand, often in sun or
  rain, sometimes with no signal. This person is the design target.
- **Other parents and coaches**, through shared match cards, text reports and exported team files.

## Priorities

1. **Data safety.** A saved season, a match in progress and prepared matches must survive crashes, app
   updates, odd input and a phone in a pocket. Loss of data is the worst possible bug.
2. **Reliable offline use at the pitch.** The app must open and work with no signal, after one online visit.
3. **Glanceable and forgiving.** Large tap targets, little reading, every destructive action confirmed or
   undoable, stray taps guarded.
4. **Correct stats.** Goals, assists, cards and minutes must add up, including after edits.
5. **Simplicity.** One file, no build. Few features, each earning its place. Optional things (assists,
   cards, playing time, line-up plan) are **off by default**, so a new team sees a minimal app.
6. **Children's privacy.** First name and shirt number only. Data stays on the device. Nothing is sent
   anywhere. The coach decides what to share.

## Non-goals (today)

- Accounts, a server, live sync between phones, or anything needing a connection to work.
- Leaderboards that single children out, opponent scouting, or heavy analytics.
- A build step, a framework, or runtime dependencies beyond Google Fonts.

A separate track explores a standalone product with a backend, live following for parents and more. That is
**not this codebase**: see `roadmap.md`. This app must keep working as it is.

## Success looks like

A coach opens the app at the pitch with no signal, sets who is here, kicks off, logs goals with two taps,
swaps players at the break with one tap, ends the match and shares a card, and nothing is ever lost.

## Language and region

UI copy is English. The owner is Belgian, so decimal commas are accepted where a coach types a number
(`7,5` and `7.5` are the same) and dates show in the device locale. A Dutch interface is a possible future
item, not a current feature.
