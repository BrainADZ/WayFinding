# BrainADZ Way

Kiosk wayfinding, mobile directions, and the Command management demo for Riverside Shopping Centre.

## Run locally

Open this project root in your editor, then run:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Next.js provides the development and production servers. The development server updates as frontend files change.
If port 3000 is busy, `npm.cmd run dev` chooses the next free port and uses a separate dev build directory, so another copy of this project can keep running. You can request a starting port with `npm.cmd run dev -- --port 4000`.

- Kiosk: http://localhost:3000/
- Mobile directions: http://localhost:3000/go?destination=oliva
- Command: http://localhost:3000/command

Use `npm.cmd run check` for TypeScript checks and `npm.cmd test` for domain tests. On other shells, `npm` can be used instead of `npm.cmd`.

## Project layout

```text
app/
  api/             Next.js route handlers
  command/         Command management page
  go/              Mobile directions page
  layout.tsx       Shared metadata, fonts, and styles
  page.tsx         Kiosk page
components/wayfinding/
  shared.tsx        Map, profile, route, and shared UI
  kiosk.tsx         Kiosk screen and directory interactions
  go.tsx            Mobile route screen
  command.tsx       Command dashboard and editors
  *-screen.tsx      Route-specific client entry points
packages/
  advertising/     Campaign scheduling and idle state
  domain/          Shared schemas and demo data
  routing/         Route calculation and graph validation
  search/          Directory search
public/            Static web assets
tests/             Domain tests
docs/
  specifications/  Original project and UI specifications
  mockups/         Reference screen images
  OPERATOR_GUIDE.md
  QA_REPORT.md
```

`node_modules` contains installed dependencies; `.next` and `.next-port-*` contain generated build output. All are ignored by Git. `.archive` holds the original exports and the previous Vite/Express entry files for recovery. It is not used by the application.

The application currently uses demo data in memory. See [the operator guide](docs/OPERATOR_GUIDE.md) and [the original QA report](docs/QA_REPORT.md) for scope and limitations.
