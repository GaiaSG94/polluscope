const CATEGORIES = [
  { label: "Good", key: "good", color: "#2ecc71" },
  { label: "Moderate", key: "moderate", color: "#f1c40f" },
  { label: "Unhealthy for sensitive groups", key: "sensitive", color: "#e67e22" },
  { label: "Unhealthy", key: "unhealthy", color: "#e74c3c" },
  { label: "Very unhealthy", key: "very-unhealthy", color: "#8e44ad" },
  { label: "Hazardous", key: "hazardous", color: "#7b1d1d" },
];

const THRESHOLDS = {
  aqi: [50, 100, 150, 200, 300],
  pm25: [10, 25, 50, 75, 100],
  pm10: [20, 50, 100, 150, 200],
  no2: [40, 100, 150, 200, 300],
  o3: [60, 100, 140, 180, 240],
};

const UNITS = {
  aqi: "AQI",
  pm25: "µg/m³",
  pm10: "µg/m³",
  no2: "µg/m³",
  o3: "µg/m³",
};

const LABELS = {
  aqi: "Air Quality Index",
  pm25: "Fine particles (PM2.5)",
  pm10: "Coarse particles (PM10)",
  no2: "Nitrogen dioxide (NO₂)",
  o3: "Ground-level ozone (O₃)",
};

const mapState = {
  map: null,
  layer: null,
  stations: [],
  markers: new Map(),
};

function categoryIndex(value, pollutant) {
  const thresholds = THRESHOLDS[pollutant] || THRESHOLDS.aqi;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value <= thresholds[i]) return i;
  }
  return thresholds.length;
}

function categoryFor(value, pollutant) {
  return CATEGORIES[categoryIndex(value, pollutant)];
}

function valueFor(station, pollutant) {
  return station[pollutant];
}

function makeIcon(value, pollutant) {
  const color = categoryFor(value, pollutant).color;
  return L.divIcon({
    className: "pollu-icon",
    html: `<div class="pollu-dot" style="background:${color};box-shadow:0 0 0 4px ${color}33"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function buildPopup(station) {
  const el = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = `${station.city}, ${station.country}`;
  el.appendChild(title);
  for (const key of ["aqi", "pm25", "pm10", "no2", "o3"]) {
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("span");
    label.textContent = LABELS[key];
    const val = document.createElement("span");
    val.textContent = `${station[key]} ${UNITS[key]}`;
    row.append(label, val);
    el.appendChild(row);
  }
  const stationId = document.createElement("div");
  stationId.className = "row";
  stationId.style.cssText = "margin-top:8px;color:var(--muted);font-size:11px";
  stationId.textContent = `Station ${station.id}`;
  el.appendChild(stationId);
  return el;
}

function focusStation(station) {
  mapState.map.setView([station.lat, station.lng], 7, { animate: true });
  const marker = mapState.markers.get(station.id);
  if (marker) marker.openPopup();
}

function renderList(stations, pollutant) {
  const list = document.getElementById("stations");
  list.replaceChildren();
  for (const station of stations) {
    const value = valueFor(station, pollutant);
    const cat = categoryFor(value, pollutant);
    const item = document.createElement("li");
    item.className = "station";
    const dot = document.createElement("i");
    dot.className = `dot ${cat.key}`;
    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = station.city;
    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = `${station.country} · ${LABELS[pollutant]}`;
    info.append(name, sub);
    const val = document.createElement("div");
    val.className = "value";
    val.textContent = value;
    item.append(dot, info, val);
    item.addEventListener("click", () => focusStation(station));
    list.appendChild(item);
  }
}

function renderMarkers(stations, pollutant) {
  mapState.layer.clearLayers();
  mapState.markers.clear();
  for (const station of stations) {
    const value = valueFor(station, pollutant);
    const marker = L.marker([station.lat, station.lng], {
      icon: makeIcon(value, pollutant),
    })
      .bindPopup(buildPopup(station))
      .addTo(mapState.layer);
    mapState.markers.set(station.id, marker);
  }
}

function applyFilters() {
  const pollutant = document.getElementById("pollutant").value;
  const query = document.getElementById("search").value.trim().toLowerCase();
  const filtered = mapState.stations.filter(
    (s) =>
      s.city.toLowerCase().includes(query) ||
      s.country.toLowerCase().includes(query)
  );
  renderList(filtered, pollutant);
  renderMarkers(filtered, pollutant);
  document.getElementById("count").textContent = filtered.length;
}

function createMap() {
  const map = L.map("map").setView([46.7, 4.5], 5);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);
  mapState.map = map;
  mapState.layer = L.layerGroup().addTo(map);
}

function bindControls() {
  document.getElementById("pollutant").addEventListener("change", applyFilters);
  document.getElementById("search").addEventListener("input", applyFilters);
}

async function init() {
  bindControls();
  try {
    const response = await fetch("data/stations.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    mapState.stations = data.stations;
    createMap();
    applyFilters();
    const updated = new Date(data.updatedAt).toLocaleString();
    document.getElementById("status").textContent = `${data.stations.length} stations · updated ${updated}`;
  } catch (error) {
    document.getElementById("status").textContent = `Data unavailable (${error.message})`;
  }
}

init();
