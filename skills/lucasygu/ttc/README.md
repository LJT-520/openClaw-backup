# @lucasygu/ttc

CLI for Toronto Transit Commission — real-time bus & streetcar arrivals, vehicle tracking, and alerts from the terminal.

No API key required. All data comes from TTC's public GTFS-RT feeds.

## Install

```bash
npm install -g @lucasygu/ttc
```

## Usage

```bash
# Next arrivals at a stop (fuzzy name matching)
ttc next "king spadina"

# Route info with active vehicles
ttc route 504

# Live vehicle positions
ttc vehicles 504

# Service alerts
ttc alerts
ttc alerts --broad    # include subway alerts

# Nearby stops + arrivals
ttc nearby 43.6426,-79.4002

# All surface routes
ttc routes
ttc routes --type streetcar

# Fuzzy stop search
ttc search "broadview"

# System status
ttc status
```

All commands support `--json` for programmatic use.

## Data

- **Real-time**: GTFS-RT protobuf feeds from `bustime.ttc.ca` (vehicles, predictions, alerts)
- **Static**: Stop names, route info, and trip headsigns bundled from [Open Toronto GTFS](https://open.toronto.ca/dataset/merged-gtfs-ttc-routes-and-schedules/)
- **Coverage**: Surface transit (buses + streetcars). Subway alerts available with `--broad`.

## Claude Code Integration

Installs as a `/ttc` skill automatically. Use it in Claude Code:

```
/ttc next "union station"
/ttc alerts --json
```

## Development

```bash
git clone https://github.com/lucasygu/ttc.git
cd ttc
npm install --ignore-scripts
npm run update-gtfs    # download fresh GTFS data
npm run build
node dist/cli.js status
```

## License

MIT
