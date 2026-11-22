// The mock home of the screenshots and animations: a heating oil tank (OilFox, a level in %), a pellet silo weighed in
// kg, a Mopeka propane tank and a rainwater tank with a distance sensor, and the recorder's daily statistics of each level
// over 31 days (a steady use, one refill). The clock is fixed, so that a capture only changes when the card does.
const st = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes, last_changed: "2026-11-22T00:00:00Z" });

const NOW = new Date(2026, 10, 22, 15, 30).getTime();
const day = (offset) => new Date(2026, 10, 22 + offset).getTime();

// `scene`: oil (good), oil_soon (order soon), pellets (order now), propane, water (rainwater, filled by the rain),
// empty, history (no history yet: the level instead of the days left).
const SCENES = {
  oil: { id: "sensor.oilfox_fill_level", unit: "%", name: "OilFox Fill level", platform: "oilfox", capacity: 3000, start: 900, refill: 10, to: 2200, use: 36 },
  oil_soon: { id: "sensor.oilfox_fill_level", unit: "%", name: "OilFox Fill level", platform: "oilfox", capacity: 3000, start: 1950, use: 36 },
  pellets: { id: "sensor.pellet_silo_weight", unit: "kg", name: "Pellet silo weight", platform: "esphome", capacity: 3500, start: 1900, use: 42 },
  propane: { id: "sensor.propane_tank_level", unit: "%", name: "Propane tank level", platform: "mopeka", capacity: 500, start: 420, use: 4.5 },
  water: { id: "sensor.rain_tank_distance", unit: "cm", name: "Rain tank distance", platform: "esphome", capacity: 5000, height: 200, start: 2600, refill: 18, to: 4100, use: 95 },
  empty: { id: "sensor.oilfox_fill_level", unit: "%", name: "OilFox Fill level", platform: "oilfox", capacity: 3000, start: 1150, use: 36 },
  history: { id: "sensor.oilfox_fill_level", unit: "%", name: "OilFox Fill level", platform: "oilfox", capacity: 3000, start: 1380, use: 0, noHistory: true },
};

// The volume of each of the last 31 days, oldest first; a little noise, the same at every run.
const series = (v) => {
  const out = [];
  let q = v.start;
  for (let i = 0; i <= 30; i++) {
    if (i === v.refill) q = v.to;
    else if (i) q -= v.use * (1 + 0.15 * Math.sin(i * 1.7));
    out.push(Math.max(0, q));
  }
  return out;
};
// A volume as the sensor reads it.
const reading = (v, q) => (v.unit === "%" ? (q / v.capacity) * 100 : v.unit === "cm" ? v.height * (1 - q / v.capacity) : q);

export const pageScript = () => `(() => {
  const N = ${NOW};
  const R = Date;
  window.Date = class extends R {
    constructor(...a) { super(...(a.length ? a : [N])); }
    static now() { return N; }
  };
  window.__ws = async function (msg) {
    return msg.type === "recorder/statistics_during_period" ? (this.__ws?.stats ?? null) : null;
  };
})();`;

export const setup = (s) => {
  const v = SCENES[s.scene];
  const q = series(v);
  const now = v.noHistory ? v.start : q.at(-1);
  const value = reading(v, now);
  const states = { [v.id]: st(v.id, value.toFixed(v.unit === "kg" ? 0 : 1), { unit_of_measurement: v.unit, friendly_name: v.name, state_class: "measurement" }) };
  const rows = v.noHistory ? [] : q.map((x, i) => ({ start: day(i - 30), end: day(i - 29), mean: Math.round(reading(v, x) * 100) / 100 }));
  return {
    hass: {
      language: "en",
      locale: { language: "en" },
      entities: { [v.id]: { entity_id: v.id, platform: v.platform, device_id: "tank" } },
      states,
      __ws: { stats: { [v.id]: rows } },
    },
    config: { entity: v.id, capacity: v.capacity, ...(v.height ? { height: v.height } : {}), ...s.config },
    open: s.open,
  };
};
