# BrainADZ Way QA report

Date: 16 September 2026

## Checks run

- `npm run check` — passed.
- `npm test` — 5 domain tests passed: same-floor A* routing, accessible multi-floor routing, closure detour, synonym search, and idle/campaign selection.
- `npm run build` — passed with Vite production output.
- Browser smoke checks — `/` kiosk rendered at desktop width with the five-by-two category layout and interactive map; floor switching, zoom, map expansion, search results, profile drawer, route generation, accessibility recalculation, QR rendering, offers, events, help, language, and notification actions were exercised. `/go` rendered the mobile route, next-step control, accessibility switch, recenter, full-map link, and in-app profile sheet. `/command` rendered the desktop dashboard; all sidebar sections navigated to a real view, tenant editing published a changed value with a toast, device status toggled, routing closure preview recalculated, map tools responded, analytics export responded, and the create modal saved a draft.

## Scope verified

The shared seed includes Riverside Shopping Centre, three floors, four tenant profiles, amenities, four kiosk devices, a campaign, route nodes, weighted edges, lift/escalator connectors, and tenant offers. Kiosk search accepts intent terms such as `Italian food` and `washroom`. Accessible routing removes stairs and escalators.

## Known limitations

The local slice uses an in-memory seed repository for fast demo startup. The API boundary is ready for PostgreSQL/Supabase replacement, but no external database credentials were supplied. The QR handoff is generated locally as a route deep link for this demo; production should exchange it for a signed short-lived token. The app does not claim live blue-dot positioning.
