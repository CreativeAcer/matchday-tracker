# Behaviour rules

What the app does and must keep doing. Each rule here is protected by tests (see `testing.md`). Change one
only on purpose, update this file and the tests together, and say so in the release notes.

## Players, pitch and bench

- Every player is **on the pitch** or **on the bench**. Only players on the pitch can be credited with a
  goal; tapping a benched player's tile says to bring them on first.
- Before the clock has run, the green badge benches a player straight away (setting who starts). After
  that it opens the player's menu (cards, move to bench) so a stray tap cannot bench anyone.
- A player added to the squad later **starts on the pitch**, not on a bench nobody put them on.
- Roster display order is by shirt number, numerically ("10" after "9").

## Starting line-up and "last time"

- The first time the clock runs, the players then on the pitch become `startingLineup`; at match end it is
  saved as the team's `lastLineup`, and the next match starts with the same people. **The bench is set
  once.**
- Resolution at kick-off (`startNewMatch`): if the **line-up plan** is on and its first period has players,
  the plan decides. Otherwise `lastLineup` decides (plus anyone who joined the squad since the last match).
  With neither, everyone starts on the pitch. Anyone marked absent is off the pitch.
- **Known flaw (v54):** a player who was benched or absent when the clock first ran is missing from
  `lastLineup`, so they start on the bench at every later match, with no hint why, until the coach corrects
  it before kick-off or the plan is used. See `roadmap.md`. Do not "fix" this silently; it changes how the
  bench behaves for existing teams.

## Attendance ("Who's here today?")

- Asked at kick-off (and available from prepared matches, which store `unavailable`). Marked players are
  `unavailable`: off the pitch, out of the plan and out of break proposals.
- A player counts as absent only while **not on the pitch at any point since** (`isAbsent`). A child who
  turns up late and is brought on is present from then on.

## The clock and periods

- One continuous **match clock**. Goals are stamped with the match minute (52', not 7'). The current period's
  time is the clock minus `periodStartMs`, shown separately (for example `Q2 · 01:20`).
- The clock is derived from `Date.now()`, so a locked phone loses no time. It is tapped at the top to start
  and pause.
- Formats: **2 halves, 4 quarters or 8 periods.** Period length is optional and may be fractional
  (`7,5` = 7.5). With a length, the clock turns gold when the period runs over, and a toast plus a buzz
  fires **once per period** (`checkPeriodEnd`). A match reopened after its period ended does not buzz.
- **Nothing logs on a stopped clock.** A goal or card asks "The clock isn't running. Start and log?"; the
  period button refuses a period whose clock never ran, so you cannot tap through periods on 00:00.
- The break button names itself by format ("Next quarter", "Next period", "Half time"). Ending a period more
  than 10 seconds early asks first ("End quarter 1 early?"). The **last** period asks "Full time?" with
  End match, Play another period, Not yet.
- **Wrong tap at a break** is reversible: Undo, pressed before anything else is logged, takes the break back
  and restores the line-up and clock exactly (`lastAdvance`).
- **Stale clock:** a clock left running more than 3 hours is paused and rewound to one minute after the last
  real activity, with a toast. The match is never discarded (`checkStaleClock`).

## Events

- **Goal** (our player), optional **assist** (bar open for 8 seconds after the goal, only if assists are
  on), **opponent goal**, **own goal** (by us: point to the opponent; by them: point to us), **card**.
- Taps within 800 ms on the same target are treated as one (`guardDoubleTap`).
- **Undo** acts on the newest entry (or the last break) and **names it before removing**; it only removes
  what it showed (`undoKey`). It is deliberately one tap away from the opponent-goal button, so it never
  acts blind.

## Cards

- A first yellow is one tap. A **second yellow becomes a red** automatically (`auto: true`). A red, or the
  second yellow, asks for confirmation first.
- A red card **benches the player for the rest of the match**; they cannot come back on. Undo reverses it,
  including the auto-red and the yellow that caused it (`reconcileCardConsequences`).
- Logging, editing and undoing cards all go through the one place that decides what a card implies, so
  they cannot drift apart.

## Playing time (when on)

- Per player: `onField`, banked `accumMs`, `onSince`. Live minutes show on every tile; the **least-played
  player** is outlined in gold. Minutes are never negative: recovery code clamps `onSince`.
- Minutes per player are stored in the finished record and feed season totals.

## Line-up plan (when on)

- A plan is `{ periods, lineups }`: who is on the pitch in each period. **Spread evenly** rotates the
  squad through the periods (`spreadEvenly`).
- At each break the plan is **proposed**, listing who comes on and who goes off, with Apply, Edit the plan,
  and Keep who is on. Applying never silently overrides the coach.
- A plan survives roster changes (`planForRoster` drops people who left). The last plan is remembered.

## Prepared matches

- Opponent, home or away, kick-off date and time, period length, absentees, optional plan. Saved under
  **Ready to play**, earliest first, and started with one tap. A match more than 6 hours past its kick-off
  is labelled "past" but never deleted automatically.

## After the match

- A finished match cannot be reopened, but it can be **fixed**: edit or delete events, change the score
  line, and every total (scorers, assists, minutes, season stats) is recalculated and the record keeps
  reading correctly (`recomputeRecord`, `keepNamesInRecord`).
- The **match card** and **text report** are generated from the record. The card's "Goal times" switch is
  a device preference.
- **Season history** shows the record (W/D/L), every match, and top scorers with goals, assists and minutes.

## Teams, backup, import

- Several teams per device, each with its own roster, settings, history, prepared matches and live match.
  Switching never mixes them.
- A backup reminder appears at 3 or more unsaved matches, or after edits, dismissible until the state
  changes (`data-model.md`).
- **Import never trusts the file**: it is sanitised, players are matched by name and number, missing players
  are reported, and the destination is the coach's choice (new team, merge, replace). A match in progress in
  the file is restored only if the target has none running.

## Things the app must never do

- Overwrite unreadable saved data, or refuse to open at the pitch.
- Lose a match in progress across an app update, a reload or an export/import.
- Send data anywhere without the coach sharing it.
- Let a stray tap bench a child, send one off, or remove a goal.
