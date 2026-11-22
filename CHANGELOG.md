# Changelog

## 1.0.1 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.0.0 - 2026-11-22

### Features
- First release: `tank-card` and `tank-mini-card`. Heating oil, propane, rainwater or pellets, from a level in %, a volume, a mass or a distance: the days left at the current use, the runway to empty with the date to order by and the delivery time, the level, the use and its trend, and the last 30 days with the refills; an illustrated header with the tank filled to its level. The use comes from a daily use sensor or from the recorder's daily statistics of the level.
