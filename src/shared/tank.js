// ── Tank ─────────────────────────────────────────────────────────────────────
// A tank is one level sensor: a share (%), a volume (L, m³, gal), a mass (kg, t, lb) or the distance from the top of the
// tank to the surface (cm, mm, m, in, with `height`). With `capacity` (litres, or kilograms for pellets) it gives the
// volume left. The use per day comes from a daily use sensor (`consumption`) when there is one, else from the recorder's
// daily statistics of the level over the last 30 days (a rise is a refill, not a negative use). The days left come from
// a sensor of the integration (`days_left`, OilFox's) when set, else from the volume and the use.
export const TK_TYPES = ["oil", "propane", "water", "pellets"];
export const TK_TYPE_NAMES = {
  oil: /oil|fioul|fuel|mazout|heiz|gasoil|oilfox|smartoil/i,
  propane: /propane|propan|lpg|gpl|mopeka/i,
  water: /water|eau|rain|pluie|regen|cistern|citerne/i,
  pellets: /pellet|granul|silo|wood|bois/i,
};
// The share of a full tank (0–1) a reading stands for, from its unit.
export const tkShare = (value, unit, { capacity, height }) => {
  if (value == null || !Number.isFinite(value)) return null;
  const u = String(unit || "%").trim();
  const clamp = (x) => Math.min(1, Math.max(0, x));
  if (u === "%" || u === "") return clamp(value / 100);
  const litres = { L: 1, l: 1, mL: 0.001, "m³": 1000, m3: 1000, gal: 3.785, "ft³": 28.317 }[u];
  if (litres) return capacity ? clamp((value * litres) / capacity) : null;
  const kg = { kg: 1, t: 1000, g: 0.001, lb: 0.4536 }[u];
  if (kg) return capacity ? clamp((value * kg) / capacity) : null;
  const cm = { cm: 1, mm: 0.1, m: 100, in: 2.54 }[u];
  if (cm) return height ? clamp((height - value * cm) / height) : null;
  return null;
};

export const tkNum = (st) => {
  if (!st || ["unavailable", "unknown", ""].includes(st.state)) return null;
  const v = Number(st.state);
  return Number.isFinite(v) ? v : null;
};

// The tank's type: `tank_type`, else from the sensor's name, platform and unit (a mass is pellets).
export const tkType = (hass, id, configured) => {
  if (TK_TYPES.includes(configured)) return configured;
  const st = hass.states[id];
  const label = `${id} ${st?.attributes?.friendly_name || ""} ${hass.entities?.[id]?.platform || ""}`;
  if (/^(kg|t|lb)$/.test(st?.attributes?.unit_of_measurement || "")) return "pellets";
  return TK_TYPES.find((t) => TK_TYPE_NAMES[t].test(label)) || "oil";
};

// The units a tank level sensor is read in: a share, a volume, a mass, a distance from the top (exact, so "mL" or "lm"
// never pass).
export const TK_UNITS = new Set(["%", "L", "l", "m³", "m3", "gal", "kg", "t", "cm", "mm"]);
// The tank level sensors of the home, most likely first: for the card picker's first config.
export const tkSources = (hass) =>
  Object.keys(hass.states || {}).filter((id) => {
    if (!id.startsWith("sensor.")) return false;
    const st = hass.states[id];
    const label = `${id} ${st.attributes?.friendly_name || ""} ${hass.entities?.[id]?.platform || ""}`;
    return /tank|cuve|citerne|silo|oilfox|mopeka|level|niveau|fill/i.test(label) && TK_UNITS.has(String(st.attributes?.unit_of_measurement ?? "").trim()) && !/battery|batterie|signal|rssi/i.test(label);
  });

// Each day's use and refill, from the daily mean levels ([{ start, mean }], oldest first) turned into volumes: a fall is
// the use of the day, a rise of more than 3 % of the tank a refill (no use that day).
export const tkDays = (rows, toVolume, capacity) => {
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const a = toVolume(rows[i - 1].mean);
    const b = toVolume(rows[i].mean);
    if (a == null || b == null) continue;
    const refill = b - a > capacity * 0.03;
    out.push({ t: rows[i].start, use: refill ? 0 : Math.max(0, a - b), refill });
  }
  return out;
};

// The average use per day over the last `n` days without a refill (null when there are fewer than 3).
export const tkAverage = (days, n) => {
  const kept = days.filter((d) => !d.refill).slice(-n);
  return kept.length >= 3 ? kept.reduce((s, d) => s + d.use, 0) / kept.length : null;
};

// The Intl formats, made once per language and options (a render formats many numbers).
export const tkIntlCache = new Map();
export const tkIntl = (Kind, lang, opts) => {
  const key = `${Kind.name}|${lang}|${JSON.stringify(opts)}`;
  if (!tkIntlCache.has(key)) tkIntlCache.set(key, new Kind(lang, opts));
  return tkIntlCache.get(key);
};
