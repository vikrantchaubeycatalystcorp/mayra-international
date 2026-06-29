"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MapGL, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
  type MapRef,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
interface CountryCollegeStat {
  countryCode: string;
  countryName: string;
  collegeCount: number;
  centroid: [number, number];
}
import { CollegePopupCard } from "./CollegePopupCard";
import { CountryCollegePanel } from "./CountryCollegePanel";
import { MapSearchBar } from "./MapSearchBar";
import { Layers, Globe } from "lucide-react";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const ZOOM_GLOBAL = 2.8;
const ZOOM_REGIONAL = 5.5;

interface MapCollegePoint {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
  nirfRank?: number;
  rating?: number;
  fees?: { min: number; max: number };
  streams?: string[];
  type?: string;
}

interface Props {
  countriesData: CountryCollegeStat[];
  initialColleges: MapCollegePoint[];
}

export function WorldCollegeMap({ countriesData, initialColleges }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 20,
    latitude: 20,
    zoom: 1.8,
  });
  const [zoom, setZoom] = useState(1.8);
  const [selectedCountry, setSelectedCountry] = useState<CountryCollegeStat | null>(null);
  const [countryColleges, setCountryColleges] = useState<MapCollegePoint[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<MapCollegePoint | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [countryGeoJSON, setCountryGeoJSON] = useState<any>(null);
  const [loadingCountryGeo, setLoadingCountryGeo] = useState(true);

  // Load country GeoJSON for fill layers
  useEffect(() => {
    fetch(COUNTRIES_GEOJSON_URL)
      .then(r => r.json())
      .then(data => {
        // Enrich features with college counts
        const countMap = new Map(countriesData.map(c => [c.countryCode, c.collegeCount]));
        const enriched = {
          ...data,
          features: data.features.map((f: any) => ({
            ...f,
            properties: {
              ...f.properties,
              ISO_A2: f.properties.ISO_A2,
              collegeCount: countMap.get(f.properties.ISO_A2) || 0,
            },
          })),
        };
        setCountryGeoJSON(enriched);
        setLoadingCountryGeo(false);
      })
      .catch(() => setLoadingCountryGeo(false));
  }, [countriesData]);

  // Colleges as GeoJSON for markers
  const collegesGeoJSON = {
    type: "FeatureCollection" as const,
    features: initialColleges.map(c => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [c.longitude, c.latitude] },
      properties: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        city: c.city,
        state: c.state,
        countryCode: c.countryCode,
        nirfRank: c.nirfRank,
        rating: c.rating,
        fees: c.fees ? JSON.stringify(c.fees) : null,
        streams: c.streams ? JSON.stringify(c.streams) : null,
        type: c.type,
      },
    })),
  };

  const handleCountryClick = useCallback(
    (e: MapLayerMouseEvent) => {
      // Find the country-fill feature specifically (ignore college markers)
      const feature = e.features?.find(f => f.layer?.id === "country-fill");
      if (!feature) return;
      const code = feature.properties?.ISO_A2;
      if (!code) return;
      const stat = countriesData.find(c => c.countryCode === code);
      if (!stat) return;

      setSelectedCountry(stat);
      setPanelOpen(true);
      setSelectedCollege(null);

      fetch(`/api/map/colleges?countryCode=${code}`)
        .then(r => r.json())
        .then(setCountryColleges)
        .catch(() => setCountryColleges([]));

      if (stat.centroid) {
        mapRef.current?.getMap()?.flyTo({
          center: stat.centroid as [number, number],
          zoom: Math.max(4, Math.min(6, zoom + 2)),
          duration: 1400,
          essential: true,
        });
      }
    },
    [countriesData, zoom]
  );

  const handleMarkerClick = useCallback((e: MapLayerMouseEvent) => {
    // Find the college-markers feature specifically (ignore country fill)
    const feature = e.features?.find(f => f.layer?.id === "college-markers");
    if (!feature) return;
    const props = feature.properties;
    if (!props) return;
    setSelectedCollege({
      id: props.id,
      name: props.name,
      slug: props.slug,
      city: props.city ?? undefined,
      state: props.state ?? undefined,
      latitude: e.lngLat.lat,
      longitude: e.lngLat.lng,
      countryCode: props.countryCode ?? undefined,
      nirfRank: props.nirfRank ?? undefined,
      rating: props.rating ?? undefined,
      fees: props.fees ? JSON.parse(props.fees) : undefined,
      streams: props.streams ? JSON.parse(props.streams) : undefined,
      type: props.type ?? undefined,
    });
  }, []);

  const flyToCollege = useCallback((college: MapCollegePoint) => {
    mapRef.current?.getMap()?.flyTo({
      center: [college.longitude, college.latitude],
      zoom: 12,
      duration: 1200,
      essential: true,
    });
    setSelectedCollege(college);
  }, []);

  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
    setZoom(evt.viewState.zoom);
  }, []);

  const countryFillOpacity =
    zoom <= ZOOM_GLOBAL ? 0.6 : zoom <= ZOOM_REGIONAL ? Math.max(0, 0.6 - (zoom - ZOOM_GLOBAL) / (ZOOM_REGIONAL - ZOOM_GLOBAL) * 0.5) : 0.1;

  const markerOpacity =
    zoom < ZOOM_GLOBAL ? 0 : zoom < ZOOM_REGIONAL ? (zoom - ZOOM_GLOBAL) / (ZOOM_REGIONAL - ZOOM_GLOBAL) : 1;

  const interactiveLayers = countryGeoJSON
    ? (["country-fill", zoom > ZOOM_GLOBAL ? "college-markers" : ""].filter(Boolean) as string[])
    : [];

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Search bar */}
      <MapSearchBar
        countriesData={countriesData}
        colleges={initialColleges}
        onSelectCountry={(stat) => {
          setSelectedCountry(stat);
          setPanelOpen(true);
          fetch(`/api/map/colleges?countryCode=${stat.countryCode}`)
            .then(r => r.json())
            .then(setCountryColleges)
            .catch(() => setCountryColleges([]));
          mapRef.current?.getMap()?.flyTo({
            center: stat.centroid as [number, number],
            zoom: 5,
            duration: 1400,
          });
        }}
        onSelectCollege={flyToCollege}
      />

      {/* Map */}
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={interactiveLayers}
        onClick={(e) => {
          // College marker takes priority over country fill
          const hasCollegeFeature = e.features?.some(f => f.layer?.id === "college-markers");
          if (hasCollegeFeature) {
            handleMarkerClick(e);
          } else {
            handleCountryClick(e);
          }
        }}
        onMouseEnter={(e) => {
          if (e.features?.[0]?.layer?.id === "country-fill") {
            setHoveredCountry(e.features[0].properties?.ISO_A2 || null);
          }
        }}
        onMouseLeave={() => setHoveredCountry(null)}
        cursor={hoveredCountry ? "pointer" : "grab"}
      >
        <NavigationControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />

        {/* Country fill layer */}
        {countryGeoJSON && (
          <Source id="countries" type="geojson" data={countryGeoJSON}>
            {/* Fill by college count */}
            <Layer
              id="country-fill"
              type="fill"
              paint={{
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["coalesce", ["get", "collegeCount"], 0],
                  0, "#e8f4fd",
                  100, "#b3d9f5",
                  500, "#5aabe8",
                  2000, "#2563eb",
                  5000, "#1e3a8a",
                  10000, "#0f172a",
                ],
                "fill-opacity": countryFillOpacity,
              }}
            />
            {/* Country outline */}
            <Layer
              id="country-outline"
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["==", ["get", "ISO_A2"], hoveredCountry || ""],
                  "#f59e0b",
                  ["==", ["get", "ISO_A2"], selectedCountry?.countryCode || ""],
                  "#3b82f6",
                  "#cbd5e1",
                ],
                "line-width": [
                  "case",
                  ["==", ["get", "ISO_A2"], hoveredCountry || ""],
                  2.5,
                  ["==", ["get", "ISO_A2"], selectedCountry?.countryCode || ""],
                  2,
                  0.5,
                ],
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {/* Country count labels */}
        {zoom <= ZOOM_REGIONAL && (
          <Source
            id="country-labels"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: countriesData
                .filter(c => c.collegeCount > 0)
                .map(c => ({
                  type: "Feature" as const,
                  geometry: { type: "Point" as const, coordinates: c.centroid },
                  properties: { count: c.collegeCount, name: c.countryName, code: c.countryCode },
                })),
            }}
          >
            <Layer
              id="country-count-circle"
              type="circle"
              paint={{
                "circle-radius": [
                  "interpolate", ["linear"], ["get", "count"],
                  0, 8, 100, 12, 1000, 18, 10000, 28, 50000, 36,
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "code"], selectedCountry?.countryCode || ""],
                  "#2563eb",
                  "#1e40af",
                ],
                "circle-stroke-color": "#fff",
                "circle-stroke-width": 2,
                "circle-opacity": Math.min(1, countryFillOpacity * 1.6 + 0.2),
              }}
            />
            <Layer
              id="country-count-label"
              type="symbol"
              layout={{
                "text-field": [
                  "case",
                  [">=", ["get", "count"], 1000],
                  ["concat", ["to-string", ["round", ["/", ["get", "count"], 1000]]], "k"],
                  ["to-string", ["get", "count"]],
                ],
                "text-size": 11,
                "text-font": ["Noto Sans Regular"],
                "text-allow-overlap": false,
                "text-anchor": "center",
              }}
              paint={{
                "text-color": "#fff",
                "text-opacity": Math.min(1, countryFillOpacity * 1.6 + 0.2),
              }}
            />
          </Source>
        )}

        {/* College markers */}
        {zoom > ZOOM_GLOBAL && (
          <Source
            id="colleges"
            type="geojson"
            data={collegesGeoJSON}
            cluster={zoom < ZOOM_REGIONAL}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            {/* Cluster circles */}
            <Layer
              id="cluster-circle"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-radius": ["step", ["get", "point_count"], 20, 5, 28, 10, 36],
                "circle-color": ["step", ["get", "point_count"], "#f97316", 5, "#ef4444", 10, "#dc2626"],
                "circle-stroke-width": 3,
                "circle-stroke-color": "#fff",
                "circle-opacity": markerOpacity,
              }}
            />
            <Layer
              id="cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-size": 13,
                "text-font": ["Noto Sans Bold"],
              }}
              paint={{ "text-color": "#fff", "text-opacity": markerOpacity }}
            />
            {/* Individual college markers */}
            <Layer
              id="college-markers"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-radius": 9,
                "circle-color": "#f97316",
                "circle-stroke-width": 2.5,
                "circle-stroke-color": "#fff",
                "circle-opacity": markerOpacity,
              }}
            />
            <Layer
              id="college-marker-labels"
              type="symbol"
              filter={["!", ["has", "point_count"]]}
              layout={{
                "text-field": ["get", "name"],
                "text-size": 11,
                "text-offset": [0, 1.4],
                "text-anchor": "top",
                "text-max-width": 10,
                "text-font": ["Noto Sans Regular"],
              }}
              paint={{
                "text-color": "#1e293b",
                "text-halo-color": "#fff",
                "text-halo-width": 1.5,
                "text-opacity": zoom > ZOOM_REGIONAL ? markerOpacity : 0,
              }}
            />
          </Source>
        )}

        {/* College popup */}
        {selectedCollege && (
          <Popup
            longitude={selectedCollege.longitude}
            latitude={selectedCollege.latitude}
            onClose={() => setSelectedCollege(null)}
            closeButton={false}
            anchor="bottom"
            offset={16}
            maxWidth="320px"
          >
            <CollegePopupCard
              college={selectedCollege}
              onClose={() => setSelectedCollege(null)}
            />
          </Popup>
        )}
      </MapGL>

      {/* Legend */}
      {zoom <= ZOOM_REGIONAL && (
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 z-10">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">Colleges per Country</span>
          </div>
          <div className="space-y-1">
            {[
              { color: "#e8f4fd", label: "0" },
              { color: "#5aabe8", label: "100–500" },
              { color: "#2563eb", label: "500–2K" },
              { color: "#1e3a8a", label: "2K–10K" },
              { color: "#0f172a", label: "10K+" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country drill-down panel */}
      <CountryCollegePanel
        open={panelOpen}
        country={selectedCountry}
        colleges={countryColleges}
        selectedCollegeId={selectedCollege?.id}
        onClose={() => { setPanelOpen(false); setSelectedCountry(null); }}
        onSelectCollege={flyToCollege}
      />

      {/* Loading indicator */}
      {loadingCountryGeo && (
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex items-center gap-4">
            <Globe className="h-6 w-6 text-blue-600 animate-spin" style={{ animationDuration: "2s" }} />
            <span className="text-gray-700 font-semibold">Loading World Map…</span>
          </div>
        </div>
      )}
    </div>
  );
}
