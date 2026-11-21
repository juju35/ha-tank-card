# ha-tank-card

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
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

> [!NOTE]
> This card is being designed: there is no release yet. Watch the repository to know when the first version is out.

| Card | Type | What it shows |
|---|---|---|
| Tank | `custom:tank-card` | The tank drawn with its level, the litres left, the days left at the current use and a reorder reminder. |
| Tank mini | `custom:tank-mini-card` | The level and the days left on two lines, with a zoom to the full card. |

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

## License

[MIT](https://github.com/juju35/ha-tank-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
