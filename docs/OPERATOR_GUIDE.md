# BrainADZ Way demo

BrainADZ Way is a connected kiosk, Way Go mobile route, and Command management demo for Riverside Shopping Centre. The app uses one shared TypeScript domain model. The embedded seed is a fictional three-floor centre because the Drive map, tenant, and advertising asset folders are currently empty.

## Run

```text
npm install
npm run dev
```

Use `/` for the kiosk, `/go` for the Way Go route, and `/command` for the Command admin panel. The production server runs `npm run build` then `npm start`.

The demo route is calculated by A* over floor-specific route nodes and weighted edges. Accessible mode removes stairs and escalators and uses lifts. The Command Routing screen can disable a corridor and preview a detour. The kiosk returns to the seasonal ad after 120 seconds of inactivity; touching the ad returns to a clean home state. Analytics are accepted through `/api/analytics` and can be replaced by PostgreSQL persistence through the repository boundary.

## Demo script

1. Search `Italian food`, choose Oliva Italian Kitchen, and review the profile drawer.
2. Select Get directions, switch to Accessible route, and use Send to phone to render the QR code.
3. Open `/go?destination=oliva` to show the phone continuation view; advance a step, recenter, switch accessibility, and open the in-app profile sheet.
4. Use the kiosk floor buttons, zoom controls, Expand map, View directory, category cards, Offers, Events, Help, language, notifications, and amenity cards.
5. Open `/command`, use each sidebar section, edit Tenants & Stores and publish, toggle a device, close a routing corridor and publish the detour, use map tools, export analytics, and save a Create new draft.

## Data and production path

`packages/domain` contains validated entity schemas and the seed boundary. `packages/routing` contains A* and graph validation. `packages/search` contains synonym and fuzzy ranking. `packages/advertising` contains schedule targeting and idle-state logic. The current demo uses local seed memory so it remains fast and offline-capable; production should bind these repository functions to PostgreSQL/Supabase and durable media storage.

The QR panel is generated locally from the route deep link for this demo. A deployment should issue a signed short-lived token from `/api/route` before physical-phone scanning. No live blue-dot positioning is claimed.
