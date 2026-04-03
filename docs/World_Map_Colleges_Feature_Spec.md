# World Map Colleges Feature (Top-Tier Implementation Spec)

## 1) Goal

Build a realistic, interactive world map that:
- Shows **number of colleges per country** when zoomed out.
- On country click, opens that country's college list and map context.
- As user zooms in, transitions from country aggregates to **exact college coordinates**.
- Provides smooth, high-performance, professional UX on desktop and mobile.

---

## 2) Product Requirements

### Core Behavior
- **Zoomed out (Global view):**
  - Countries are visually highlighted.
  - Each country shows total college count (label, bubble, or choropleth + tooltip).
- **Country click:**
  - Focus/zoom to selected country.
  - Open side panel or modal with all colleges in that country.
  - Allow clicking a college from list to fly to marker.
- **Zoomed in (Regional/City view):**
  - Country aggregates fade out.
  - College markers appear at exact coordinates.
  - Marker click opens professional card (name, city, rank, exams accepted, fees, details CTA).

### Professional UX Expectations
- Smooth zoom/pan animation (`flyTo`) with easing.
- Marker clustering at medium zoom to avoid visual noise.
- Clear transitions between aggregate and point data.
- Loading skeletons for map and list.
- Empty states and error states.
- Mobile-first responsive behavior.

---

## 3) Recommended Tech Stack

For a modern Next.js app, two strong options:

### Option A (Recommended): Mapbox GL JS + React wrapper
- Libraries:
  - `mapbox-gl`
  - `react-map-gl`
  - `supercluster` (if custom clustering needed)
  - `@turf/turf` (geo calculations; optional but useful)
- Pros:
  - Premium visuals, strong ecosystem, vector tiles, great interactions.
  - Easy fit for high-end product feel.
- Note:
  - Requires Mapbox token and usage-based billing.

### Option B (Open Source): MapLibre GL + Open tiles
- Libraries:
  - `maplibre-gl`
  - React wrapper compatible with MapLibre
- Pros:
  - No Mapbox lock-in.
- Trade-off:
  - Styling/tiles setup can need more effort for polished look.

---

## 4) Data Model You Need

Your map quality depends on clean geo data.

### College Entity (minimum fields)
```ts
type College = {
  id: string;
  name: string;
  countryCode: string; // ISO-3166-1 alpha-2 (e.g., IN, US, GB)
  countryName: string;
  state?: string;
  city?: string;
  latitude: number;
  longitude: number;
  slug: string;
  ranking?: number;
  fees?: number;
  examsAccepted?: string[];
};
```

### Country Aggregate Entity
```ts
type CountryCollegeAggregate = {
  countryCode: string;
  countryName: string;
  collegeCount: number;
  centroid: [number, number]; // lng, lat
};
```

### Data Quality Rules (critical)
- Coordinates must be valid:
  - `latitude` in `[-90, 90]`
  - `longitude` in `[-180, 180]`
- Store with decent precision (6+ decimal places where possible).
- Use consistent country code standard (ISO-2).
- Do not rely only on city names for plotting.

---

## 5) Zoom-Level Rendering Strategy (Must-Have)

Define strict behavior by zoom bands:

- `zoom <= 2.8` (Global)
  - Render country fill/outline layer.
  - Render country-level counts only.
  - No individual college markers.

- `2.8 < zoom <= 5.5` (Regional)
  - Render clustered college points.
  - Keep light country context (boundaries + subtle labels).

- `zoom > 5.5` (Local)
  - Render individual college markers (unclustered).
  - Enable detailed popups/cards.

Use opacity transitions during zoom to avoid abrupt UI jumps.

---

## 6) Information Architecture (UI Layout)

Recommended screen structure:

- **Top controls bar**
  - Search input (college/city/country)
  - Filters (country, exam, fee range, ranking)
  - Reset view button

- **Main map canvas**
  - Full width on desktop, dominant area on mobile
  - Legend (country density scale + marker meaning)
  - Zoom controls + geolocate optional

- **Right panel / bottom sheet**
  - Selected country summary
  - College list (paginated or virtualized)
  - On list click -> map fly to selected college

---

## 7) Suggested Next.js Module Design

```txt
components/map/
  WorldCollegeMap.tsx
  CountryLayer.tsx
  ClusterLayer.tsx
  CollegeMarkerLayer.tsx
  MapControls.tsx
  CountryCollegePanel.tsx
  CollegePopupCard.tsx

lib/map/
  zoomRules.ts
  mapStyle.ts
  geo.ts
  format.ts

app/api/map/
  countries/route.ts      // country aggregates
  colleges/route.ts       // points by bbox/country/filters
```

---

## 8) API Contract Design

### `GET /api/map/countries`
Returns all country aggregates for global view.

Response:
```json
[
  {
    "countryCode": "IN",
    "countryName": "India",
    "collegeCount": 1342,
    "centroid": [78.9629, 20.5937]
  }
]
```

### `GET /api/map/colleges?countryCode=IN&bbox=minLng,minLat,maxLng,maxLat&zoom=4&exam=JEE`
Returns college points constrained by viewport and filters.

Response:
```json
[
  {
    "id": "clg_123",
    "name": "IIT Bombay",
    "countryCode": "IN",
    "countryName": "India",
    "city": "Mumbai",
    "latitude": 19.1334,
    "longitude": 72.9133,
    "slug": "iit-bombay"
  }
]
```

### API Best Practices
- Always filter by map bounding box for performance.
- Support pagination or capped result size.
- Cache country aggregate response aggressively (CDN).

---

## 9) Interaction Logic (High-Level)

1. Initial load:
   - Fetch country aggregates.
   - Render global layer + counts.
2. Country click:
   - Set selected country.
   - `flyTo` country bounds.
   - Fetch country colleges (bbox + filters).
   - Open panel with list.
3. Zoom changes:
   - Evaluate zoom band.
   - Toggle layers: aggregate -> cluster -> points.
4. Marker click:
   - Open college popup.
   - Highlight corresponding list item.
5. List click:
   - Fly to marker.
   - Open details.

---

## 10) Performance Targets (Non-Negotiable)

- First interactive map paint under 2.5s on broadband.
- 60fps pan/zoom on modern devices.
- Debounce viewport-driven API calls (200ms-350ms).
- Use vector tiles and avoid huge GeoJSON in client.
- Cache static boundaries and country metadata.
- Use marker clustering for large datasets.
- Use memoized selectors for filtered data.

---

## 11) Professional Visual Design Guidelines

- Use a restrained, premium color palette.
- Country layer: neutral base + brand accent scale by count.
- Markers: clear icon hierarchy (cluster > point > selected).
- Use soft shadows, subtle blur for cards, and consistent spacing.
- Keep typography crisp and readable at all zoom levels.
- Provide dark mode map style if your product supports theme switch.

---

## 12) Edge Cases to Handle

- Colleges with missing/invalid coordinates.
- Countries with zero colleges.
- Dense cities with many overlapping colleges.
- Dateline and polar region projection oddities.
- Slow network / API timeout fallback.
- Mobile low-memory behavior.

---

## 13) Accessibility & Quality

- Keyboard-accessible controls and list navigation.
- Screen-reader labels for map actions and selected country.
- High contrast for labels and controls.
- Respect reduced-motion setting (disable heavy fly animations).

---

## 14) Security & Reliability

- Validate query params (`bbox`, `zoom`, `countryCode`) on server.
- Rate-limit map APIs.
- Avoid exposing sensitive internal IDs.
- Gracefully handle token expiry / map tile failures.

---

## 15) Implementation Phases

### Phase 1: Foundation
- Integrate map library.
- Load base world style.
- Render country boundaries + aggregate counts.

### Phase 2: Country Drill-Down
- Country click selection + flyTo.
- Side panel with country colleges list.

### Phase 3: Coordinate Precision View
- Implement zoom-based layer switching.
- Add clusters and exact college markers.

### Phase 4: Polish
- Search + filters + legends.
- Advanced popup cards.
- Loading/empty/error states.

### Phase 5: Scale + Hardening
- API caching and bbox optimization.
- Accessibility pass.
- Cross-device QA and performance tuning.

---

## 16) Acceptance Criteria Checklist

- [ ] Zoomed-out map shows country-wise college counts.
- [ ] Clicking a country shows that country's colleges list.
- [ ] Zooming in reveals accurate college coordinate markers.
- [ ] Layer transitions are smooth and visually professional.
- [ ] Marker/list interactions are synchronized.
- [ ] APIs are bbox-aware and performant.
- [ ] UX is responsive and accessible.
- [ ] Works reliably on modern desktop and mobile browsers.

---

## 17) Future Upgrades (Optional "God-Level")

- Heatmap mode (density visualization).
- Time slider (growth of colleges over years).
- Route planner (distance from user location).
- Compare countries side-by-side.
- AI recommendations panel (best-fit colleges by profile).

---

## 18) Quick Start Notes for Your Existing Data

Since your project already has college data, do this first:
- Add `countryCode`, `latitude`, `longitude` to every college record.
- Backfill missing coordinates via a geocoding pipeline (offline script + manual QA).
- Build a precomputed country aggregate JSON for instant global render.

When this data foundation is correct, the map experience becomes premium automatically.
