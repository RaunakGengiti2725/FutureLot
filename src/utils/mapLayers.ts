import mapboxgl from 'mapbox-gl';

export function loadAdminBoundaries(map: mapboxgl.Map) {
  const sourceId = "zones";
  const tileset = process.env.NEXT_PUBLIC_BOUNDARIES_TILESET;

  // Skip if source already exists (for HMR)
  if (map.getSource(sourceId)) return;

  // Add source based on environment
  if (tileset) {
    map.addSource(sourceId, {
      type: "vector",
      url: `mapbox://${tileset}`
    });
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: "/data/boundaries.geojson"
    });
  }

  // Add fill layer below labels
  map.addLayer({
    id: "zones-fill",
    type: "fill",
    source: sourceId,
    ...(tileset ? { "source-layer": "boundaries" } : {}),
    paint: {
      "fill-color": "#627183",
      "fill-opacity": 0.2
    }
  }, "road-label");

  // Add line layer below labels
  map.addLayer({
    id: "zones-line",
    type: "line",
    source: sourceId,
    ...(tileset ? { "source-layer": "boundaries" } : {}),
    paint: {
      "line-color": "#627183",
      "line-width": 1
    }
  }, "road-label");
} 