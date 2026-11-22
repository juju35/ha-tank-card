import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHass, midnight } from "./hass.mjs";
import { fakeNode, load } from "./load.mjs";

const NOW = new Date(2026, 10, 22, 15, 30).getTime();
const tk = load({ now: NOW });
const { cards } = tk;
const json = (v) => JSON.parse(JSON.stringify(v));
const settle = () => new Promise((r) => setTimeout(r, 0));

// A card whose shadow root answers every selector with nodes recording their click listeners; the level's history
// fetched (callWS) before the test reads it.
const make = async (tag, config, hass = makeHass({ now: NOW })) => {
  const card = new cards[tag]();
  card.attachShadow();
  const nodes = {};
  card.shadowRoot.querySelector = (s) => (nodes[s] ||= fakeNode());
  card._nodes = nodes;
  card.setConfig({ type: `custom:${tag}`, ...config });
  card.hass = hass;
  await settle();
  await settle();
  return card;
};
const OIL = { entity: "sensor.oilfox_fill_level", capacity: 3000 };

test("both cards are registered, with their editors and a picker entry", () => {
  for (const tag of ["tank-card", "tank-mini-card"]) {
    assert.ok(tk.customElements.get(tag), tag);
    assert.ok(tk.customElements.get(`${tag}-editor`), `${tag}-editor`);
  }
  assert.deepEqual(json(tk.window.customCards.map((c) => c.type)), ["tank-card", "tank-mini-card"]);
});

test("the level, whatever the unit: %, a volume, a mass, a distance from the top", () => {
  const o = { capacity: 2000, height: 200 };
  assert.equal(tk.tkShare(46, "%", o), 0.46);
  assert.equal(tk.tkShare(1000, "L", o), 0.5);
  assert.equal(tk.tkShare(1.5, "m³", o), 0.75);
  assert.equal(tk.tkShare(500, "kg", o), 0.25);
  assert.equal(tk.tkShare(1, "t", o), 0.5);
  assert.equal(tk.tkShare(50, "cm", o), 0.75, "50 cm of air in a 200 cm tank");
  assert.equal(tk.tkShare(150, "%", o), 1, "clamped");
  assert.equal(tk.tkShare(50, "cm", { capacity: 2000 }), null, "a distance needs the height");
  assert.equal(tk.tkShare(50, "dB", o), null);
});

test("the type: configured, else from the name, the platform and the unit", () => {
  const h = makeHass({ now: NOW });
  assert.equal(tk.tkType(h, "sensor.oilfox_fill_level"), "oil");
  assert.equal(tk.tkType(h, "sensor.propane_tank_level"), "propane");
  assert.equal(tk.tkType(h, "sensor.pellet_silo_weight"), "pellets", "a mass is pellets");
  assert.equal(tk.tkType(h, "sensor.rain_tank_distance"), "water");
  assert.equal(tk.tkType(h, "sensor.oilfox_fill_level", "water"), "water");
  assert.deepEqual(json(cards["tank-card"].getStubConfig(h)), { entity: "sensor.oilfox_fill_level" });
});

test("detection: a gas meter is no propane tank, and only a tank's units count", () => {
  const h = makeHass({ now: NOW });
  const add = (id, state, attrs) => (h.states[id] = { entity_id: id, state, attributes: attrs });
  add("sensor.gas_tank_level", "40", { unit_of_measurement: "%", friendly_name: "Gas tank level" });
  assert.equal(tk.tkType(h, "sensor.gas_tank_level"), "oil", "\"gas\" alone is not propane");
  add("sensor.lpg_tank_level", "40", { unit_of_measurement: "%", friendly_name: "LPG tank level" });
  assert.equal(tk.tkType(h, "sensor.lpg_tank_level"), "propane");
  add("sensor.tank_light_level", "300", { unit_of_measurement: "lm", friendly_name: "Tank light level" });
  add("sensor.tank_dose_level", "5", { unit_of_measurement: "mL", friendly_name: "Tank dose level" });
  const ids = tk.tkSources(h);
  assert.ok(!ids.includes("sensor.tank_light_level"), "lm");
  assert.ok(!ids.includes("sensor.tank_dose_level"), "mL");
  assert.ok(ids.includes("sensor.lpg_tank_level"));
});

test("plurals: the Slovenian dual, and a label around its number whatever its side", async () => {
  const hass = makeHass({ now: NOW });
  const card = await make("tank-card", { ...OIL, language: "sl" }, hass);
  assert.equal(card._tn("days", 2), "Ostajata 2 dneva");
  assert.equal(card._tn("days", 3), "Ostajajo 3 dnevi");
  assert.equal(card._tn("days", 102), "Ostajata 102 dneva");
  assert.equal(card._tn("days", 1500, { n: "1.500" }), "Ostaja 1.500 dni", "a formatted number");
  const es = await make("tank-card", { ...OIL, language: "es" }, hass);
  const html = es._big({ ...es._items, daysLeft: 41 });
  assert.match(html, /<span>Quedan<\/span><b>41<\/b><span>días<\/span>/);
});

test("the use: each day's fall, a rise is a refill; the average without the refills", () => {
  const rows = [100, 90, 80, 95, 85, 75].map((mean, i) => ({ start: i, mean }));
  const days = tk.tkDays(rows, (v) => v * 10, 1000);
  assert.deepEqual(
    json(days.map((d) => [d.use, d.refill])),
    [
      [100, false],
      [100, false],
      [0, true],
      [100, false],
      [100, false],
    ],
  );
  assert.equal(tk.tkAverage(days, 14), 100);
  assert.equal(tk.tkAverage(days.slice(0, 2), 14), null, "fewer than 3 days");
});

test("full card: the days left, the runway with the date to order by, the tiles and the last 30 days", async () => {
  const hass = makeHass({ now: NOW });
  const card = await make("tank-card", OIL, hass);
  const m = card._items;
  assert.equal(hass.ws[0].type, "recorder/statistics_during_period");
  assert.equal(hass.ws[0].period, "day");
  assert.equal(m.type, "oil");
  assert.equal(Math.round(m.volume), 1479);
  assert.equal(Math.round(m.use), 36);
  assert.equal(Math.round(m.daysLeft), 41);
  assert.equal(Math.round(m.orderDays), 20, "the reorder level (25 %) comes before the delivery deadline");
  assert.equal(m.state, "ok");
  assert.equal(m.days.length, 30);
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /class="banner"/);
  assert.match(html, /<span class="bpt">Good<\/span>/);
  assert.match(html, /<div class="title">Heating oil<\/div>/);
  assert.match(html, /<div class="subt"><span class="sq">1,479 L · <\/span>41 days left<\/div>/);
  assert.match(html, /<b>41<\/b><span>days left<\/span><span class="of">1,479 L of 3,000 L<\/span>/);
  assert.match(html, /class="om" style="left:4\d\.\d%"/);
  assert.match(html, /class="dz"/);
  assert.match(html, /<div class="dl">delivery 7 d<\/div>/);
  assert.match(html, /<span class="xl">Order by<\/span>/);
  assert.match(html, /in 20 d/);
  assert.equal((html.match(/class="hb"/g) || []).length, 29);
  assert.equal((html.match(/class="hb rf"/g) || []).length, 1, "the refill");
  assert.match(html, /<span class="xv">49<small>%<\/small><\/span>/);
});

test("states: order soon, order now, almost empty; rainwater runs low; offline; no tank", async () => {
  const soon = await make("tank-card", OIL, makeHass({ now: NOW, level: 30 }));
  assert.equal(soon._items.state, "order_soon");
  const now = await make("tank-card", OIL, makeHass({ now: NOW, level: 22 }));
  assert.equal(now._items.state, "order_now");
  const empty = await make("tank-card", OIL, makeHass({ now: NOW, level: 3 }));
  assert.equal(empty._items.state, "empty");
  const rain = await make("tank-card", { entity: "sensor.rain_tank_distance", height: 160 });
  assert.equal(rain._items.type, "water");
  assert.equal(rain._items.state, "low", "150 cm of air in a 160 cm tank");
  assert.equal(rain._items.orderDays, null, "no order for rainwater");
  const h = makeHass({ now: NOW });
  h.states["sensor.oilfox_fill_level"].state = "unavailable";
  const off = await make("tank-card", OIL, h);
  assert.equal(off._items.state, "offline");
  const none = await make("tank-card", {}, { ...makeHass({ now: NOW, ws: false }), entities: {}, states: {} });
  assert.equal(none._items.state, "none");
  assert.match(none.shadowRoot.innerHTML, /No tank level sensor found/);
});

test("the use and the days left from sensors win over the history", async () => {
  const card = await make("tank-card", { ...OIL, consumption: "sensor.oil_daily_use", days_left: "sensor.oilfox_days_reach" });
  assert.equal(card._items.use, 20);
  assert.equal(card._items.daysLeft, 50);
});

test("pellets in tonnes, no history: the level instead of the days left", async () => {
  const card = await make("tank-card", { entity: "sensor.pellet_silo_weight" });
  const m = card._items;
  assert.equal(m.type, "pellets");
  assert.equal(m.daysLeft, null);
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<div class="title">Pellet silo<\/div>/);
  assert.match(html, /<b>37 %<\/b><span>Level<\/span><span class="of">1\.1 t of 3\.0 t<\/span>/);
  assert.match(html, /Not enough history yet/);
});

test("the numbers open the sensor's details", async () => {
  const card = await make("tank-card", OIL);
  const events = [];
  card.dispatchEvent = (e) => events.push(e.detail?.entityId);
  const buttons = [{ dataset: { id: "sensor.oilfox_fill_level" }, addEventListener(_t, fn) { this.fn = fn; } }];
  card.shadowRoot.querySelectorAll = (s) => (s === "[data-id]" ? buttons : []);
  card._bindAfter(card.shadowRoot);
  buttons[0].fn();
  assert.deepEqual(events, ["sensor.oilfox_fill_level"]);
});

test("mini card: the ring, the chips, and the zoom to the full card", async () => {
  const card = await make("tank-mini-card", OIL);
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<ha-card class="lvl-ok bn">/);
  assert.match(html, /class="ringb"/);
  assert.match(html, /1,479 L · 49 %/);
  assert.match(html, /41 days left/);
  card._zoomed = true;
  card._sig = null;
  card._render();
  assert.match(card.shadowRoot.innerHTML, /class="box rw"/);
});

test("the dark theme darkens the room", async () => {
  const card = await make("tank-card", OIL, makeHass({ now: NOW, themes: { darkMode: true } }));
  assert.match(card.shadowRoot.innerHTML, /<ha-card class="lvl-ok dk">/);
  assert.match(card.shadowRoot.innerHTML, /class="banner night"/);
});

test("translations: every language has every English key, plural forms included", () => {
  const en = Object.keys(tk.TK_I18N.en);
  for (const [lang, table] of Object.entries(tk.TK_I18N)) assert.deepEqual(en.filter((k) => !(k in table)), [], lang);
  assert.equal(Object.keys(tk.TK_I18N).length, 22);
});

test("the editor writes only what differs from the defaults", () => {
  const ed = new (tk.customElements.get("tank-card-editor"))();
  ed.setConfig({ type: "custom:tank-card" });
  ed.hass = makeHass({ now: NOW });
  const form = ed.children[0];
  const names = form.schema.flatMap((s) => (s.schema ? s.schema.map((x) => x.name) : [s.name]));
  for (const n of ["entity", "tank_type", "capacity", "height", "reorder_level", "delivery_days", "consumption", "days_left", "show_history", "language"]) assert.ok(names.includes(n), n);
  let out;
  ed.dispatchEvent = (e) => (out = e.detail.config);
  form.listeners["value-changed"]({ detail: { value: { type: "custom:tank-card", reorder_level: 25, delivery_days: 7, tank_type: "", entity: "sensor.oilfox_fill_level" } } });
  assert.deepEqual(json(out), { type: "custom:tank-card", entity: "sensor.oilfox_fill_level" });
  assert.ok(midnight(NOW) < NOW);
});
