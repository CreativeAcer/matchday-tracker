# Data model

Everything lives in the browser's `localStorage`, on the coach's phone. There is no server. **This is the
document to read before touching anything that persists, imports or exports.** Real seasons are stored in
this format on real phones.

## Storage keys (never rename)

| Key | Content |
|---|---|
| `matchdayTrackerData_v1` | The whole saved state (below). The `_v1` is the key's name, not the data version |
| `matchdayTrackerData_v1_rescue_<timestamp>` | Raw text of a save that could not be parsed, kept instead of overwritten |
| `matchdayTrackerCardTimeline_v1` | Device preference: the match card's "Goal times" switch. Not team data, never exported |
| `matchdayInstallHidden` | Device preference: the "add to home screen" hint was dismissed |

## Saved state (`version: 2`)

```
{ version: 2,
  activeTeamId: "<team id>",
  teams: [ Team, ... ] }
```

Version 1 stored one team at the top level; `migrate()` wraps it as the first team. Anything unreadable is
tolerated: bad team entries are dropped, an unknown `activeTeamId` falls back to the first team.

### Team (the single list is `normaliseTeam`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | `uid()` |
| `teamName` | string | default "My Team"; printed on the match card |
| `roster` | `[{ id, name, number }]` | strings; sorted for display by shirt number, stored in entry order |
| `settings` | `{ trackAssists, trackPlayingTime, trackCards, planLineups }` | booleans, all default `false` |
| `activeMatch` | Match or `null` | the match in progress |
| `history` | `[Record]` | finished matches, newest first |
| `lastLineup` | `[playerId]` or `null` | who was on the pitch when the last match's clock first ran; reused at the next kick-off |
| `lastPlan` | Plan or `null` | the last line-up plan used |
| `lastPeriodMinutes` | number or `null` | the last real period length |
| `upcoming` | `[Upcoming]` | prepared matches ("Ready to play") |
| `lastExportPrep`, `lastExportHistory` | string | signatures of what was last backed up (for the backup reminder) |
| `backupNudgeSeen` | string | which reminder state the coach dismissed |
| `lastBackupAt`, `lastExportCount` | number | when and how many matches at the last backup |

Field order matters to the tests (`tests/v54.js` asserts the key order). Add a new team field **only** in
`normaliseTeam`, with a safe default, so every old save loads.

### Match (`activeMatch`)

```
{ id, opponentName, isHome, startedAt (ISO),
  clock: { elapsedMs, running, runningSince },   // elapsed = banked time; add (now - runningSince) when running
  period,                                        // 1-based
  periodStartMs,                                 // where the current period began on the match clock (may be absent)
  periodMinutes, periodFormat,                   // optional length; 2 | 4 | 8 | null
  plan,                                          // { periods, lineups: [[playerId]...] } or null
  unavailable: [playerId],                       // marked "not here today"
  playingTime: { <playerId>: { onField, accumMs, onSince } },
  startingLineup, lineupCaptured,                // captured when the clock first runs
  lastAdvance,                                   // what the last break changed, for undo
  events: [Event] }
```

The clock is **one continuous match clock**: a goal in the last quarter is stamped 52', not 7'. The current
period's time is `clock - periodStartMs`. A match from before `periodStartMs` existed has none, and the app
falls back to plain match time.

### Event

```
{ id, type, minuteAtEvent, period, ts, ... }
type "goal"          playerId, assistId (or null)
type "opponent_goal" playerId: null
type "own_goal"      by: "us" | "them"      ("us" = our own net, point to the opponent)
type "card"          playerId, cardType: "yellow" | "red", auto (true for a red made by a second yellow)
```

### Finished match (history record)

Created by `endMatch`:

```
{ id, date, opponentName, teamName, isHome,
  rosterSnapshot: [{ id, name, number }],        // names as they were; records stay readable after roster edits
  scoreUs, scoreThem, ownGoalsFor, ownGoalsAgainst,
  scorers: { playerId: n }, assists: { playerId: n }, cards,
  playingTimeMinutes: { playerId: minutes }, durationMinutes,
  events: [Event] }
```

Derived numbers are stored here and **recomputed after any edit** (`recomputeRecord`). Records keep their own
`rosterSnapshot` so a renamed or removed player never breaks old matches.

### Plan and Upcoming

```
Plan      { periods: 2|4|8, lineups: [[playerId] x periods] }
Upcoming  { id, opponentName, kickoffAt ("YYYY-MM-DDTHH:MM" local), isHome,
            unavailable: [playerId], periodMinutes, plan, updatedAt }
```

A plan outlives roster changes: `planForRoster` drops players who have left.

## Export file (JSON)

Made by **Back up team data**; read by **Import a file**. Parts are independent switches (players and
settings, matches played, prepared matches); the default is all three, which is a full backup.

```
{ exportedFrom, exportedAt, teamName, exportParts: { players, history, prep },
  // players part:   roster, settings, lastPlan, lastPeriodMinutes, lastLineup
  // history part:   history, seasonStats, matchStats, activeMatch (clock frozen at export time)
  // prep part:      upcoming
  // when the squad is left out but history or prep is in: playerRefs [{ id, name, number }] }
```

- `exportedFrom` is informational. **Import does not check it**, so renaming the product does not break old
  files.
- Ids are made up per device. An import therefore **matches players by name and number** (`matchPlayers`),
  and tells the coach plainly if someone is missing.
- Import destinations: **new team** (default), **merge** into the current team, or **replace** it (marked
  dangerous). Merging never loses either side: prepared matches are reconciled by `updatedAt`.
- `sanitiseImport` accepts only what it understands and coerces the rest; a file is never trusted.

## Compatibility rules

1. **Additive only.** New fields get a default in `normaliseTeam` (or the matching normaliser). Old saves,
   old exports and half-migrated states must all load.
2. **Never change the meaning of an existing field**, and never remove one. A phone may be several versions
   behind and later import a newer file, or the reverse.
3. **Never overwrite unreadable data.** `load()` keeps the raw text under a `_rescue_` key and starts empty
   with a visible message rather than refusing to open at the pitch.
4. **A match in progress travels** (export, import, app update). It must survive an update with fields from
   an older version missing (`tests/upgrade.js`).
5. **Failing to save is loud.** `persist()` shows a persistent warning; the app keeps working in memory.
6. **Test with a golden master** before changing load, normalise, import or boot code: run old and new
   builds on the same stored data and compare `localStorage` (`tests/gm54.js`).

## Backup reminder logic (so it does not nag)

`unexportedCount()` counts matches since the last backup; a reminder shows at 3 or more unsaved matches, or
when prepared matches or history were edited. Dismissing stores the state it was about (`backupNudgeSeen`),
so it returns only when the answer changes. Signatures (`prepSignature`, `historySignature`) detect edits.
