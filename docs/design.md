# Design

How the app looks and behaves for the person holding it. The visual language is a pitch: dark green, chalk
white, gold for attention.

## Principles

1. **One hand, one glance.** The main actions are large tiles and bottom-pinned buttons. Nothing important
   needs precise tapping or small text.
2. **Forgiving.** A stray tap must never cost data. Goals are guarded against double taps; destructive
   actions ask first or can be undone; sheets ignore taps for their first moments (`armShield`).
3. **Quiet by default.** Optional tracking (assists, cards, playing time, line-up plan) is off until a team
   turns it on in Team > Match options. The screen shows only what the team uses.
4. **Say what will happen.** Undo names the entry it removes. Breaks list who comes on and off. Confirm
   dialogs state the consequence in one sentence.
5. **Never block the match.** Errors are toasts or warnings with a way forward, not dead ends. An
   unreadable save still lets the app start (see `data-model.md`).
6. **Plain words.** English, short, no jargon. Use the match's own words: "Next quarter", "Half time" or
   "Next period" depending on the chosen format.

## Visual tokens

Defined as CSS custom properties at the top of the `<style>` block in `index.html`. Use the tokens, never
raw colours.

| Token | Light | Role |
|---|---|---|
| `--pitch-dark` | `#16362A` | Header, darkest green |
| `--pitch` | `#1F5C40` | Primary buttons, brand |
| `--turf` | `#2E7D52` | "On pitch" badges, accents |
| `--chalk` | `#FAF8F2` | Page background |
| `--panel` | `#FFFFFF` | Cards, sheets |
| `--ink` / `--ink-soft` | `#16211A` / `#56645A` | Text |
| `--gold` | `#E2A33D` | Attention: clock past its length, least-played player, primary call to action |
| `--red` / `--red-text` | `#C1443B` / `#A8362C` | Cards, destructive |
| `--yellow-card` | `#E8C93D` | Yellow card |

Dark mode redefines the surface and text tokens (`--chalk`, `--panel`, `--ink`, `--brand-text`...) under
`prefers-color-scheme: dark`. It follows the system. The CSS also honours a `data-theme="light"` or
`"dark"` attribute on `<html>`, but nothing in the UI sets it, so there is no manual switch. Text colours have separate
`*-text` tokens so contrast holds on both backgrounds. Check contrast when adding a colour.

**Fonts:** Oswald (500/600/700) for headings, numbers and the clock; Work Sans (400 to 700) for body text.
Loaded from Google Fonts, cached by the service worker after one online visit; the Android shell bundles
them.

## Layout of the match screen

From top to bottom:

1. **Top bar** (`header.topbar`): help button, the clock (tap to start, pause, kick off), and the two
   scores. Between matches it shows the app name instead.
2. **Score strip** (`#scoreboardBar`): "Team (H) - Opponent (A)". The opponent's name is editable.
3. **On the pitch**: a grid of large player tiles. Tap a tile to score. Its green badge opens that player's
   menu (cards, move to bench).
4. **Bench**: compact rows. Tap the up arrow to bring a player on.
5. **Pinned dock** (`#liveDock`) above the bottom bar: Undo, the opponent goal button, and the period
   button (Kick off / Next quarter / Half time), which turns gold when the period is due.
6. **Bottom navigation**: Match, Team, History.

The pinned elements measure themselves (`syncChrome` sets `--nav-h`, `--topbar-h`, `--head-h`,
`--dock-h`) so nothing hides behind them on any phone or text size.

Between matches the Match tab shows the **Start a match** form: opponent, home or away, period length,
format (2 halves, 4 quarters, 8 periods), the optional line-up plan, **Kick off** and **Prepare a match for
later**. Prepared matches wait above it under **Ready to play**.

## Interaction patterns

- **Sheets** are overlays built with `newOverlay(id)`, closed by `closeOnBackdrop` (where a tap outside is
  safe), with `armShield` to ignore early taps. Use these helpers for any new sheet. They are dialogs for
  assistive tech and move focus inside.
- **Toasts** (`showToast`) for confirmations and warnings; errors that need a decision use `showConfirm`.
- **Feedback on a counted tap**: a short haptic tick (native shell) and a colour flash on the tile.
- **Goal then assist**: with assists on, an assist bar appears for 8 seconds after a goal.
- **Gold means attention**: the clock past its period length, the least-played player's outline, the next
  action. Do not use gold for decoration.
- **Destructive styling**: red buttons and an explicit confirm for removing, ending, clearing.

## Share outputs

- **Match card**: a canvas-drawn image (1080 x 1594): score, scorers with shirt numbers, optionally every
  goal's minute. Footer carries the product name. Shown in a sheet; press and hold to save, or share via
  the system sheet in the Android shell.
- **Text report**: copyable or shared as text.
- **Backup file**: JSON via download, or the share sheet in the Android shell.

## Accessibility

- Tap targets are large; many controls are at least 44 px.
- Sheets are announced as dialogs; a live region (`#liveRegion`) announces changes.
- Colour is never the only signal: cards also show a card glyph, "Away" is written, the period due state
  also changes the label text.
- Text size follows the system setting; layout is tested with large fonts (`tests/fontscale.js`).

## Copy style

Short sentences. Sentence case. No exclamation marks. Say what happened and what the coach can do. Example:
"Clock had been running 3h 12m, paused and reset to 41:00. Your match is safe."
