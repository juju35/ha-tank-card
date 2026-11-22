# ha-tank-card

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-tank-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-tank-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-tank-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-tank-card/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-tank-card/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-tank-card/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-tank-card)](https://github.com/juju35/ha-tank-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-tank-card/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center"><img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/icon.svg" alt="Tank Card" width="120"></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/mopeka.png" alt="Mopeka" height="24">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/esphome.png" alt="ESPHome" height="24">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/oilfox.png" alt="OilFox" height="24">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/smartoilgauge.png" alt="Smart Oil Gauge" height="24">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/zha.png" alt="ZHA" height="24">
</p>

An illustrated Lovelace card for **tank levels** — heating oil, propane, rainwater or pellets: the level, the litres left, the days left at the current use and a reminder to reorder.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-tank-card&category=plugin)

| Card | Type | What it shows |
|---|---|---|
| [Tank](#screenshots) | `custom:tank-card` | The days left at the current use, the runway to empty with the date to order by and the delivery time, the level, the use and the last 30 days, under the tank drawn in its boiler room. |
| [Tank mini](#tank-mini) | `custom:tank-mini-card` | The level and the days left on two lines, with a zoom to the full card. |

| Heating oil | Pellets, order now |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-oil.png" alt="Heating oil" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-pellets.png" alt="Pellets, order now" width="400"> |

## Features

- **Days left**: the quantity left divided by the use per day, big, with the quantity of the capacity beside it
- **Runway to empty**: a bar from today to the day the tank is empty, the day to order by marked on it and the delivery time hatched after it, so that the delivery comes before the tank is empty; the order day is also when the level reaches `reorder_level` at the latest
- **Level, use, order by**: three tiles; the use with its trend against the week before; for rainwater, the day it is empty instead of an order
- **Last 30 days**: the use of each day, the refills marked
- **Any level sensor**: a share in %, a volume (L, m³, gal), a mass (kg, t, lb) or the distance from the top of the tank to the surface (cm, mm, m, in) with `height`
- **Heating oil, propane, rainwater or pellets** (`tank_type`, else from the sensor's name, platform and unit: a mass is pellets; *propane*, *LPG*, *GPL* or *Mopeka* is propane, never a mere *gas*), each with its colour, its default capacity and its own tank in the header: a tank on its feet with its gauge for oil and propane, a silo for pellets, a cistern for rainwater
- **The use**: a daily use sensor (`consumption`), else the recorder's daily statistics of the level over 30 days (a rise of more than 3 % of the tank is a refill, not a use); the integration's own days left (`days_left`, OilFox's) wins when set
- **Status**: good, order soon (the order day within 14 days), order now (at the reorder level, or the order day reached), almost empty (under 5 %); rainwater: good or running low
- **Illustrated header**: the tank lying in its boiler room, filled to its level with what it holds, its gauge's needle at the level, the surface of a liquid swaying; the dark theme darkens the room
- **Mini card**: the level as a ring around the badge, the state, the quantity and the days left; its zoom button opens the full card in place
- **Tap a number** to open the sensor's history
- Visual editor for both cards, light and dark themes, 22 languages, no external dependency

## Supported integrations

Any level, percentage or distance sensor works. Among the integrations that expose one:

| | Integration | What the cards show |
|:---:|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/mopeka.png" alt="Mopeka" height="16"> | [Mopeka](https://www.home-assistant.io/integrations/mopeka/) (built in) | Propane tank gauges over Bluetooth |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/esphome.png" alt="ESPHome" height="16"> | [ESPHome](https://www.home-assistant.io/integrations/esphome/) (built in) | Ultrasonic or time-of-flight sensors (JSN-SR04T, VL53L0X…) |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/oilfox.png" alt="OilFox" height="16"> | [OilFox](https://github.com/chises/ha-oilfox) (Marketplace) | Heating oil level, days left and battery |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/smartoilgauge.png" alt="Smart Oil Gauge" height="16"> | [Smart Oil Gauge](https://github.com/bergb91-coder/ha-smartoilgauge) (Marketplace) | Heating oil level and percentage |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/images/zha.png" alt="ZHA" height="16"> | [ZHA](https://www.home-assistant.io/integrations/zha/) (built in) | Zigbee level sensors (Tuya radar and ultrasonic), also through Zigbee2MQTT |

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-tank-card&category=plugin)

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-tank-card` — Type: **Dashboard**
3. Open **Tank Card** and click **Install**
4. Clear your browser cache and refresh

The Marketplace registers the dashboard resource for you.

### Manual

1. Download `ha-tank-card.js` and the `ha-tank-card.i18n.*.js` translation files from the [latest release](https://github.com/juju35/ha-tank-card/releases/latest)
2. Copy them all to `/config/www/` (without the translation files, the cards show in English)
3. Go to **Settings → Dashboards → Resources** → Add resource:
   - URL: `/local/ha-tank-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

Every option is in the visual editor. In YAML:

```yaml
type: custom:tank-card
entity: sensor.oilfox_fill_level
capacity: 3000

# A pellet silo on a load cell, ordered at 30 % with a 10-day delivery
type: custom:tank-card
entity: sensor.pellet_silo_weight
tank_type: pellets
capacity: 3500
reorder_level: 30
delivery_days: 10

# A rainwater tank with an ultrasonic sensor 200 cm above its bottom
type: custom:tank-card
entity: sensor.rain_tank_distance
tank_type: water
capacity: 5000
height: 200

# Two lines on a phone dashboard
type: custom:tank-mini-card
entity: sensor.propane_tank_level
capacity: 500
```

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | the first tank level found | The level sensor: %, a volume, a mass, or the distance from the top of the tank to the surface |
| `title` | string | the tank type | Card title |
| `show_title` | boolean | `true` | Both: show the title |
| `show_subtitle` | boolean | `true` | Both: the quantity and the days left under the title |
| `navigation_path` | string | | Both: a tap on the header opens this dashboard path |
| `tank_type` | string | from the sensor | Both: `oil`, `propane`, `water` or `pellets` |
| `capacity` | number | `1500` (oil), `500` (propane), `5000` (water), `3000` (pellets) | Both: litres, or kilograms for pellets |
| `height` | number | | Both: the tank's height (cm), for a distance sensor |
| `reorder_level` | number | `25` | The level (%) at which to order |
| `delivery_days` | number | `7` | Days between the order and the delivery |
| `consumption` | string | | A sensor of the use per day (else from the level's history) |
| `days_left` | string | | The integration's own days left (OilFox) |
| `show_history` | boolean | `true` | The last 30 days |
| `illustration` | boolean | `true` | Both: the illustrated header (`false`: the classic header) |
| `illustration_theme` | string | `auto` | Both: `auto` (follows the Home Assistant theme: night with a dark theme, day with a light theme), `day` or `night` |
| `animations` | boolean | `true` | Both: the liquid's surface sways |
| `zoom` | boolean | `true` | Mini card: the zoom button |
| `language` | string | Home Assistant's | Advanced: one of the [languages](#translations) |

## Screenshots

| Heating oil | Order soon | Pellets, order now |
|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-oil.png" alt="Heating oil" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-oil_soon.png" alt="Order soon" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-pellets.png" alt="Pellets, order now" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-oil-dark.png" alt="Heating oil, dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-oil_soon-dark.png" alt="Order soon, dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-pellets-dark.png" alt="Pellets, order now, dark" width="400"> |

| Propane | Rainwater (distance sensor) | Almost empty |
|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-propane.png" alt="Propane" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-water.png" alt="Rainwater" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-empty.png" alt="Almost empty" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-propane-dark.png" alt="Propane, dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-water-dark.png" alt="Rainwater, dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-empty-dark.png" alt="Almost empty, dark" width="400"> |

| No history yet | Narrow |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-history.png" alt="No history yet" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-narrow.png" alt="Narrow" width="300"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-history-dark.png" alt="No history yet, dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-narrow-dark.png" alt="Narrow, dark" width="300"> |

**Liquid animation**: the surface of a liquid sways a little in the tank (pellets do not move; still with `animations: false`, or when the system asks for reduced motion).

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-liquid.gif" alt="Liquid animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-liquid-dark.gif" alt="Liquid animation, dark" width="400"> |

### Tank mini

| Heating oil | Pellets, order now | Zoomed in |
|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-oil.png" alt="Mini, heating oil" width="320"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-pellets.png" alt="Mini, pellets" width="320"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-zoom.png" alt="Mini, zoomed in" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-oil-dark.png" alt="Mini, heating oil, dark" width="320"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-pellets-dark.png" alt="Mini, pellets, dark" width="320"> | <img src="https://raw.githubusercontent.com/juju35/ha-tank-card/main/screenshots/tank-mini-zoom-dark.png" alt="Mini, zoomed in, dark" width="400"> |

## How it works

- **Tank**: `entity`, else the first sensor named like a tank level (*tank*, *cuve*, *silo*, *OilFox*, *Mopeka*, *level*…) in %, L, m³, gal, kg, t, cm or mm (exactly), not a battery or a signal
- **Level**: % as is; a volume or a mass against `capacity`; a distance from the top against `height` (the air above the surface)
- **Use**: `consumption`, else the average daily fall of the level over the last 14 days without a refill, from the recorder's daily means (`recorder/statistics_during_period`, period `day`) over 31 days, fetched at first, every hour and on a new day; the level sensor needs a `state_class` for the recorder to keep its statistics
- **Days left**: `days_left`, else the quantity left divided by the use
- **Order by**: the earlier of the day the delivery time before the tank is empty and the day the level reaches `reorder_level`; no order for rainwater
- **Refresh**: the card redraws on each change of its sensors; the level's history is fetched again every hour and on a new day
- **Read only**: the card calls no action

## Development

```bash
npm install
npm run build        # stamps the version of package.json into dist/ha-tank-card.js
npm run check        # builds and checks the bundle (run in CI)
npm test             # unit tests
npm run screenshots  # renders the cards with mock tanks into screenshots/ (and the GIFs, needs ffmpeg)
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built files to the release, which is where the Marketplace installs them from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-tank-card/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `ha-tank-card.js` and its translation files

## Translations

The card auto-detects the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (Portugal) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Contributions for additional languages are welcome!

## License

[MIT](https://github.com/juju35/ha-tank-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
