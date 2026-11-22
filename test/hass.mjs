// A mock Home Assistant with an OilFox heating oil tank (a level in %), a Mopeka propane tank, a pellet silo weighed in
// kg and a rainwater tank with a distance sensor, and callWS answering the recorder's daily statistics of the oil level:
// 31 days of a steady use with one refill.
export const st = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes, last_changed: "2026-01-01T00:00:00Z" });

export const DAY = 24 * 3.6e6;
export const midnight = (now, offset = 0) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.getTime();
};

// The oil tank's volumes, oldest first: 900 L, 36 L a day, a refill to 2200 L on the 11th day.
export const volumes = (use = 36) => {
  const out = [];
  let v = 900;
  for (let i = 0; i <= 30; i++) {
    if (i === 10) v = 2200;
    else if (i) v -= use;
    out.push(v);
  }
  return out;
};

export const makeHass = ({ now = Date.now(), level, use = 36, ws = true, ...overrides } = {}) => {
  const vols = volumes(use);
  const pct = level ?? Math.round((vols.at(-1) / 3000) * 1000) / 10;
  const hass = {
    language: "en",
    locale: { language: "en" },
    themes: { darkMode: false },
    entities: {
      "sensor.oilfox_fill_level": { platform: "oilfox", device_id: "fox" },
      "sensor.oilfox_days_reach": { platform: "oilfox", device_id: "fox" },
      "sensor.propane_tank_level": { platform: "mopeka", device_id: "mop" },
      "sensor.pellet_silo_weight": { platform: "esphome", device_id: "silo" },
      "sensor.rain_tank_distance": { platform: "esphome", device_id: "rain" },
    },
    states: {
      "sensor.oilfox_fill_level": st("sensor.oilfox_fill_level", String(pct), { unit_of_measurement: "%", friendly_name: "OilFox Fill level", state_class: "measurement" }),
      "sensor.oilfox_days_reach": st("sensor.oilfox_days_reach", "50", { unit_of_measurement: "d", friendly_name: "OilFox Days reach" }),
      "sensor.propane_tank_level": st("sensor.propane_tank_level", "64", { unit_of_measurement: "%", friendly_name: "Propane tank level" }),
      "sensor.pellet_silo_weight": st("sensor.pellet_silo_weight", "1100", { unit_of_measurement: "kg", friendly_name: "Pellet silo weight" }),
      "sensor.rain_tank_distance": st("sensor.rain_tank_distance", "150", { unit_of_measurement: "cm", friendly_name: "Rain tank distance" }),
      "sensor.oil_daily_use": st("sensor.oil_daily_use", "20", { unit_of_measurement: "L" }),
    },
    calls: [],
    ws: [],
    callService(domain, service, data) {
      this.calls.push([domain, service, data]);
    },
    ...overrides,
  };
  if (ws)
    hass.callWS = async (msg) => {
      hass.ws.push(msg);
      if (msg.type !== "recorder/statistics_during_period") return null;
      const id = msg.statistic_ids[0];
      if (id !== "sensor.oilfox_fill_level") return { [id]: [] };
      return { [id]: vols.map((v, i) => ({ start: midnight(now, i - 30), end: midnight(now, i - 29), mean: (v / 3000) * 100 })) };
    };
  return hass;
};
