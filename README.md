# Matchday Tracker

A simple, offline-friendly score tracker for youth soccer matches. Single self-contained HTML file — no backend, no build step, no dependencies beyond Google Fonts.

## Features
- Roster setup (name + shirt number), reusable every match
- Tap a player to log a goal, with optional assists, cards, and playing-time tracking
- Home/away, running clock, undo
- Post-match summary with a shareable, minute-by-minute report
- Season history with top scorers
- Export/import team data as JSON, so other parents or coaches don't have to re-enter the roster

## Running it
Just open `index.html` in a browser — nothing to install or build.

Data is stored in the browser's local storage, per device. Use **Export team data** (in Team & settings or History) to share the roster and history with someone else, who can **Import** it on their own device.

## Hosting
This is a static site: `index.html` is the entire app. Any static host works — GitHub Pages, Netlify, Cloudflare Pages, or a plain web server.
