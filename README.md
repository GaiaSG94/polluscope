# PolluScope

A lightweight, dark-themed web map that visualises air pollution across monitoring stations. Built with plain HTML/CSS/JS and [Leaflet](https://leafletjs.com/) — no build step, no dependencies to install.

## Features

- Interactive map with station markers coloured by pollution level
- Switch between overall AQI, PM2.5, PM10, NO₂ and O₃
- Search by city or country, with a live station list
- Six-level AQI legend (Good → Hazardous)
- Popups with the full measurement breakdown for each station
- Responsive layout (panel stacks above the map on small screens)

## Run locally

The app fetches `data/stations.json`, so serve the folder over HTTP:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Data format

`data/stations.json` contains an `updatedAt` timestamp and a `stations` array. Each station has an `id`, `city`, `country`, `lat`, `lng`, and numeric `aqi`, `pm25`, `pm10`, `no2`, `o3` values (concentrations in µg/m³).

```json
{
  "id": "FR-PAR-01",
  "city": "Paris",
  "country": "France",
  "lat": 48.8566,
  "lng": 2.3522,
  "aqi": 86,
  "pm25": 28,
  "pm10": 47,
  "no2": 54,
  "o3": 41
}
```

Replace the sample data with a live feed by pointing `fetch()` in `app.js` at your API — the rendering code stays the same.

## Project structure

```
polluscope/
├── index.html          # layout and UI
├── styles.css          # dark theme and components
├── app.js              # map, filters and rendering
├── data/stations.json  # sample station measurements
└── .github/workflows/  # fast CI (JSON + JS validation)
```

## License

MIT
