# Documentation

These documents describe Matchday Tracker **as of version 54**. They exist so that a person or a Claude
session can pick the project up cold and know what is important, what is protected and why.

| Document | Read it when |
|---|---|
| [product.md](product.md) | You need to decide whether something belongs in the app, or what to prioritise |
| [design.md](design.md) | You touch anything visual or any interaction |
| [architecture.md](architecture.md) | You need to find your way around `index.html` or change how it works |
| [data-model.md](data-model.md) | You touch saved state, import or export. Read this one before anything that persists |
| [rules.md](rules.md) | You change match behaviour: clock, periods, cards, line-ups, attendance, undo |
| [testing.md](testing.md) | You change code, add a test, or run the regression |
| [release.md](release.md) | You deliver a build, deploy, or build the Android app |
| [decisions.md](decisions.md) | You wonder why something is done the odd way it is |
| [roadmap.md](roadmap.md) | You look for what to do next, known issues, or want to rename the project |
| [readme-assets.md](readme-assets.md) | You regenerate the README screenshots or GIF |

## Keeping these true

Line numbers and function names refer to v54 and will drift; the names are the stable handle (search for
them). When a change alters behaviour, a stored field, or a rule, update the matching document in the same
change. A document that lies is worse than none.
