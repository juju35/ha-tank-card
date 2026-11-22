/**
 * tank-card / tank-mini-card: a tank's level, illustrated. Heating oil, propane, rainwater or pellets: the days left at the
 * current use, the runway to empty with the date to order by and the delivery time, the level, the use and the history.
 * https://github.com/juju35/ha-tank-card
 */

// The badge's icon of each state (its colour is the stylesheet's).
const TK_ICONS = { oil: "mdi:storage-tank", propane: "mdi:propane-tank", water: "mdi:water-well", pellets: "mdi:silo" };
// The colour of what is inside, per type.
const TK_FILL = { oil: "#d9822b", propane: "#8fb3d1", water: "#3b8fd9", pellets: "#b07a3e" };
// Defaults per type: the capacity (litres, kilograms for pellets).
const TK_CAPACITY = { oil: 1500, propane: 500, water: 5000, pellets: 3000 };
// One loop of the banner's animation (s): the surface of a liquid sways once.
const TK_LOOP = 3;
// The level's history is fetched again every hour.
const TK_REFRESH = 60 * 60 * 1000;
const TK_DAY = 24 * 3.6e6;

// ── Banner ───────────────────────────────────────────────────────────────────
// The illustrated header's scene: 200 × 80, drawn to the banner's right edge. A boiler room's wall and a small window
// (hidden on narrow cards), then the tank of the type, filled to its level with what it holds (the surface of a liquid
// sways a little): heating oil and propane in a tank lying on its two feet, with its filler cap and its gauge, the needle
// at the level; pellets in a silo standing on its legs, its cone and its outlet under it; rainwater in a ribbed cistern
// on its slab, the downpipe coming in at its top and its tap at the bottom. By night (the dark theme) the room is darker.
const tkScene = ({ night, share, type, animate, uid }) => {
  const s = share == null ? 0 : Math.min(1, Math.max(0, share));
  const [wall, joint] = night ? ["#2c3034", "#363a40"] : ["#efe9df", "#ddd5c8"];
  const body = night ? ["#3d444e", "#59616c"] : ["#eef1f4", "#9aa3ae"];
  const fill = share == null ? (night ? "#4a515b" : "#d5dae1") : TK_FILL[type];
  const rows = [20, 32, 44, 56, 68].map((ly) => `<line x1="0" y1="${ly}" x2="200" y2="${ly}"/>`).join("");
  const stroke = night ? "#555b63" : "#c9ced6";
  const room = `<rect width="200" height="80" fill="${wall}"/><g stroke="${joint}" stroke-width=".8">${rows}</g>
    <g class="win"><rect x="8" y="8" width="30" height="24" rx="2" fill="${night ? "#1d2a3a" : "#fff"}" stroke="${stroke}"/><line x1="23" y1="8" x2="23" y2="32" stroke="${stroke}"/></g>`;
  // A liquid's surface: a wave over the inside's width, swaying when animated.
  const liquid = (ix, iw, top, bottom) => {
    const sway = animate && share != null ? `<animateTransform attributeName="transform" type="translate" values="0 0;-12 0;0 0" dur="${TK_LOOP}s" repeatCount="indefinite"/>` : "";
    const waves = " t24 0".repeat(Math.ceil((iw + 20) / 24));
    return `<path d="M${ix - 10} ${top} q12 -2.5 24 0${waves} V${bottom + 4} H${ix - 10}Z" fill="${fill}" opacity=".92">${sway}</path>`;
  };
  if (type === "pellets") {
    // The silo: a cylinder with a domed top, its cone and outlet under it, on four legs (two seen).
    const [x, y, w, h] = [96, 6, 44, 48];
    // The inside runs down into the cone: an empty silo shows no pellets in it.
    const [ix, iy, iw, ih] = [x + 2, y + 2, w - 4, h + 10];
    const top = iy + ih * (1 - s);
    const pile = `<path d="M${ix} ${top + 3} Q${ix + iw / 2} ${top - 4} ${ix + iw} ${top + 3} V${y + h + 14} H${ix}Z" fill="${fill}"/>${[0, 1, 2]
      .map((k) => `<circle cx="${ix + 9 + k * 11}" cy="${top + 7 + (k % 2) * 4}" r="1.3" fill="#8a5a2b"/>`)
      .join("")}`;
    const shell = `M${x} ${y + 8} Q${x} ${y} ${x + w / 2} ${y} Q${x + w} ${y} ${x + w} ${y + 8} V${y + h} L${x + w / 2 + 6} ${y + h + 12} H${x + w / 2 - 6} L${x} ${y + h}Z`;
    return `${room}
      <path d="M${x + 3} ${y + h} L${x - 4} 80 M${x + w - 3} ${y + h} L${x + w + 4} 80" stroke="#7b8794" stroke-width="4"/>
      <defs><clipPath id="tk${uid}"><path d="${shell}"/></clipPath></defs>
      <path d="${shell}" fill="${body[0]}" stroke="${body[1]}" stroke-width="2"/>
      <g clip-path="url(#tk${uid})">${pile}</g>
      <rect x="${x + w / 2 - 4}" y="${y + h + 12}" width="8" height="8" fill="${body[1]}"/>
      <path d="M${x} ${y + h} H${x + w}" stroke="${body[1]}" stroke-width="1.5"/>`;
  }
  if (type === "water") {
    // The cistern: a ribbed tank on its slab, the downpipe from the gutter into its lid, a tap near the bottom.
    const [x, y, w, h] = [72, 18, 72, 54];
    const [ix, iy, iw, ih] = [x + 2, y + 2, w - 4, h - 4];
    const top = iy + ih * (1 - s);
    const ribs = [y + 14, y + 27, y + 40].map((ry) => `<line x1="${x}" y1="${ry}" x2="${x + w}" y2="${ry}"/>`).join("");
    return `${room}
      <path d="M${x + 14} 0 V${y - 2}" stroke="${body[1]}" stroke-width="5" fill="none"/>
      <rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="8" fill="#9aa1a9"/>
      <defs><clipPath id="tk${uid}"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="6"/></clipPath></defs>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${body[0]}" stroke="${body[1]}" stroke-width="2"/>
      <g clip-path="url(#tk${uid})">${liquid(ix, iw, top, iy + ih)}</g>
      <g stroke="${body[1]}" stroke-width="1.2" opacity=".7">${ribs}</g>
      <rect x="${x + 8}" y="${y - 4}" width="${w - 16}" height="5" rx="2" fill="${body[1]}"/>
      <path d="M${x + w} ${y + h - 10} h7 v4" stroke="${body[1]}" stroke-width="3" fill="none"/>`;
  }
  // Heating oil and propane: the tank lying on its two feet, its filler cap and its gauge.
  const [x, y, w, h] = [50, 22, 96, 46];
  const [ix, iy, iw, ih] = [x + 2, y + 2, w - 4, h - 4];
  const top = iy + ih * (1 - s);
  const angle = -120 + 240 * s;
  return `${room}
    <rect x="66" y="66" width="6" height="14" fill="#7b8794"/><rect x="124" y="66" width="6" height="14" fill="#7b8794"/>
    <defs><clipPath id="tk${uid}"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="${ih / 2}"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${body[0]}" stroke="${body[1]}" stroke-width="2"/>
    <g clip-path="url(#tk${uid})">${liquid(ix, iw, top, iy + ih)}</g>
    <rect x="${x + 40}" y="${y - 8}" width="16" height="9" rx="2" fill="${body[1]}"/>
    <circle cx="${x + 48}" cy="${y + 23}" r="9" fill="${night ? "#2c3034" : "#fff"}" stroke="${body[1]}"/>
    <path d="M${x + 48} ${y + 23} v-7" stroke="#e8590c" stroke-width="2" stroke-linecap="round" transform="rotate(${angle.toFixed(1)} ${x + 48} ${y + 23})"/>`;
};

// The status pill's place, decided by measurement after each render and each new width (the same rule on every
// card): on the title row, right after the title, only when the whole title and the pill's whole label fit there;
// otherwise on its own line under the subtitle (clamped to one line). When the label is still cut there, or the text
// block leaves the banner or runs over its ground strip, the pill keeps its dot alone, on the title row (its label
// stays in title and aria-label). A card of 200 px or less shows the dot alone anyway (CSS), beside the title.
const tkPlacePill = (head, row, ground) => {
  if (!head) return;
  head.removeAttribute("data-wrap");
  head.removeAttribute("data-dot");
  const pill = row.querySelector(":scope > .bpill, :scope > .pill");
  const text = pill?.querySelector(".bpt, .pt");
  if (!text?.getBoundingClientRect || text.getBoundingClientRect().width <= 1) return;
  const name = row.querySelector(".title");
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const title = name ? (name.scrollWidth > name.clientWidth ? name.scrollWidth : name.getBoundingClientRect().width) + gap : 0;
  if (title + pill.getBoundingClientRect().width <= row.getBoundingClientRect().width + 0.5) return;
  head.setAttribute("data-wrap", "");
  const box = row.parentElement.getBoundingClientRect();
  const frame = head.getBoundingClientRect();
  const out = ground && (box.bottom > ground.getBoundingClientRect().top + 0.5 || box.top < frame.top - 0.5);
  if (text.scrollWidth > text.clientWidth + 0.5 || out) {
    head.removeAttribute("data-wrap");
    head.setAttribute("data-dot", "");
  }
};

const tkIcon = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const TK_SVG = {
  level: '<path d="M6 3h12v18H6z"/><path d="M6 13h12"/>',
  use: '<path d="M12 3c.8 3 4.5 5 4.5 9.5a4.5 4.5 0 0 1-9 0c0-2.3 1.2-3.6 2.3-4.5 0 1.8.9 3 2.2 3.2-.4-3-1-5.5 0-8.2z"/>',
  date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};

// ── Card ─────────────────────────────────────────────────────────────────────
class TankCard extends RcCard {
  static tag = "tank-card";
  static i18n = TK_I18N;
  static defaults = { illustration: true, illustration_theme: "auto", show_subtitle: true, show_history: true, animations: true, reorder_level: 25, delivery_days: 7 };

  // The first tank of the home.
  static getStubConfig(hass) {
    const entity = hass ? tkSources(hass)[0] : undefined;
    return entity ? { entity } : {};
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    super.connectedCallback?.();
    this._timer ??= setInterval(() => this._fetch(), TK_REFRESH);
    // A new width: the status pill is fitted again (in the next frame, and only for a new width).
    if (typeof ResizeObserver !== "function") return;
    this._resize ??= new ResizeObserver((entries) => {
      const w = Math.round(entries.at(-1).contentRect.width);
      if (w === this._fitWidth) return;
      this._fitWidth = w;
      cancelAnimationFrame(this._fitFrame);
      this._fitFrame = requestAnimationFrame(() => this._fitPill());
    });
    this._resize.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    clearInterval(this._timer);
    this._timer = undefined;
    this._resize?.disconnect();
    this._fitWidth = undefined;
    if (this._fitFrame) cancelAnimationFrame(this._fitFrame);
  }

  _entityId() {
    const c = this._config;
    // Without `entity`: the first tank of the home, looked for again only when the registry changes.
    return c.entity || rcMemo((this._memo ||= {}), "sources", [this._hass.entities], () => tkSources(this._hass))[0];
  }

  // The level's daily means over the last 31 days, from the recorder.
  async _fetch() {
    const h = this._hass;
    const id = this._entityId();
    if (!h?.callWS || !id || this._busy) return;
    this._busy = true;
    const now = Date.now();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 31);
    try {
      const r = await h
        .callWS({ type: "recorder/statistics_during_period", start_time: start.toISOString(), end_time: new Date(now).toISOString(), statistic_ids: [id], period: "day", types: ["mean"] })
        .catch(() => null);
      const rows = (r?.[id] || []).map((x) => ({ start: typeof x.start === "number" ? x.start : new Date(x.start).getTime(), mean: Number(x.mean) })).filter((x) => Number.isFinite(x.mean));
      this._ws = { id, rows, day: new Date(now).toDateString() };
    } finally {
      this._busy = false;
    }
    this._sig = null;
    this._render();
  }

  _fmt(v, digits) {
    try {
      return tkIntl(Intl.NumberFormat, this._lang(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
    } catch {
      return v.toFixed(digits);
    }
  }

  // A quantity in litres, or in kilograms (tonnes from 1000 kg) for pellets.
  _qty(v, type) {
    if (v == null) return "—";
    if (type === "pellets") return v >= 1000 ? `${this._fmt(v / 1000, 1)} t` : `${this._fmt(v, 0)} kg`;
    return `${this._fmt(v, 0)} L`;
  }

  _date(t) {
    try {
      return tkIntl(Intl.DateTimeFormat, this._lang(), { month: "short", day: "numeric" }).format(new Date(t));
    } catch {
      return new Date(t).toDateString();
    }
  }

  // The tank's level, volume, use and dates.
  _collect() {
    const h = this._hass;
    const c = this._config;
    const id = this._entityId();
    const st = id ? h.states[id] : undefined;
    const now = Date.now();
    const ws = this._ws;
    // Fetched at first, every TK_REFRESH, and on a new day or a new sensor.
    if (id && h.callWS && !this._busy && (!ws || ws.id !== id || ws.day !== new Date(now).toDateString())) this._fetch();
    const type = id ? tkType(h, id, c.tank_type) : TK_TYPES.includes(c.tank_type) ? c.tank_type : "oil";
    const capacity = Number(c.capacity) || TK_CAPACITY[type];
    const opts = { capacity, height: Number(c.height) || null };
    const unit = st?.attributes?.unit_of_measurement;
    const share = tkShare(tkNum(st), unit, opts);
    const volume = share == null ? null : share * capacity;
    const toVolume = (v) => {
      const s = tkShare(v, unit, opts);
      return s == null ? null : s * capacity;
    };
    const rows = ws && ws.id === id ? ws.rows : [];
    const days = tkDays(rows, toVolume, capacity).slice(-30);
    const useSt = c.consumption ? h.states[c.consumption] : undefined;
    const use = tkNum(useSt) ?? tkAverage(days, 14);
    const week = tkAverage(days, 7);
    const before = tkAverage(days.slice(0, -7), 7);
    const leftSt = c.days_left ? h.states[c.days_left] : undefined;
    const daysLeft = tkNum(leftSt) ?? (use > 0 && volume != null ? volume / use : null);
    const reorder = Math.min(90, Math.max(0, Number(c.reorder_level ?? 25))) / 100;
    const delivery = Math.max(0, Number(c.delivery_days ?? 7));
    const water = type === "water";
    // The day to order by: early enough for the delivery to come before the tank is empty, and when it reaches the
    // reorder level at the latest.
    const toReorder = use > 0 && volume != null ? Math.max(0, (volume - reorder * capacity) / use) : null;
    const orderDays = water || daysLeft == null ? null : Math.max(0, Math.min(daysLeft - delivery, toReorder ?? Number.POSITIVE_INFINITY));
    let state;
    if (!st && !id) state = "none";
    else if (!st || share == null) state = "offline";
    else if (share < 0.05) state = "empty";
    else if (water) state = share < reorder ? "low" : "ok";
    else if (share <= reorder || (orderDays != null && orderDays <= 0)) state = "order_now";
    else if (orderDays != null && orderDays <= 14) state = "order_soon";
    else state = "ok";
    return {
      none: state === "none",
      state,
      id,
      type,
      name: c.title || this._t(`type_${type}`),
      share,
      volume,
      capacity,
      use,
      trend: week != null && before ? week / before - 1 : null,
      daysLeft,
      orderDays,
      delivery,
      water,
      days,
      now,
      useId: c.consumption || null,
    };
  }

  _dark() {
    return !!this._hass.themes?.darkMode;
  }

  // The banner's night: forced by `illustration_theme`, else Home Assistant's dark theme alone.
  _night() {
    const theme = this._config.illustration_theme;
    if (theme === "night" || theme === "day") return theme === "night";
    return this._dark();
  }

  _animate() {
    if (this._config.animations === false) return false;
    try {
      return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return true;
    }
  }

  // Unique per card: the SVG ids of several cards on one page never clash.
  _id() {
    this._uid ||= Math.random().toString(36).slice(2, 8);
    return this._uid;
  }

  // The illustrated header: the badge (the type's icon, in the state's colour), the title and `sub` on the wall at the
  // left, the tank at the right, a 10 px concrete strip edge to edge. `ring`: the mini card's level around the badge.
  _banner(m, sub, ring = "", pill = "") {
    const c = this._config;
    const nav = c.navigation_path;
    const night = this._night();
    const scene = tkScene({ night, share: m.share, type: m.type, animate: this._animate(), uid: this._id() });
    const chip = pill ? `<span class="bpill" title="${rcEsc(pill)}" aria-label="${rcEsc(pill)}"><span class="bdot"></span><span class="bpt">${rcEsc(pill)}</span></span>` : "";
    return `
      <div class="banner${night ? " night" : ""}">
        <div class="head${nav ? " nav" : ""}"${nav ? ' role="link" tabindex="0"' : ""}>
          <div class="badge">${ring}<ha-icon icon="${TK_ICONS[m.type]}"></ha-icon></div>
          <div class="tt"><div class="trow"><div class="title">${rcEsc(m.name)}</div>${chip}</div>${sub}</div>
        </div>
        <svg class="room" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">${scene}</svg>
        <div class="ground"></div>
      </div>`;
  }

  // The status pill's place, on the banner and on the classic header (see tkPlacePill).
  _fitPill() {
    for (const row of this.shadowRoot?.querySelectorAll?.(".trow") || []) {
      const banner = row.closest(".banner");
      tkPlacePill(banner || row.closest(".head"), row, banner?.querySelector(".ground"));
    }
  }

  _pct(m) {
    return m.share == null ? "—" : `${this._fmt(m.share * 100, 0)} %`;
  }

  _left(m) {
    const n = Math.round(m.daysLeft);
    return this._tn("days", n, { n: this._fmt(n, 0) });
  }

  _sub(m) {
    if (m.none || m.state === "offline") return "";
    return [this._qty(m.volume, m.type), m.daysLeft != null ? this._left(m) : this._pct(m)].join(" · ");
  }

  // The days left, big, and the quantity left of the capacity.
  _big(m) {
    const of = `<span class="of">${rcEsc(this._t("of_total", { v: this._qty(m.volume, m.type), t: this._qty(m.capacity, m.type) }))}</span>`;
    if (m.daysLeft == null) return `<button class="big" data-id="${rcEsc(m.id)}"><b>${rcEsc(this._pct(m))}</b><span>${rcEsc(this._t("t_level"))}</span>${of}</button>`;
    const n = Math.round(m.daysLeft);
    const label = this._left(m).replace(this._fmt(n, 0), "").trim();
    return `<button class="big" data-id="${rcEsc(m.id)}"><b>${rcEsc(this._fmt(n, 0))}</b><span>${rcEsc(label)}</span>${of}</button>`;
  }

  // The runway from today to empty: the day to order by, the delivery time after it.
  _runway(m) {
    if (m.daysLeft == null || m.daysLeft <= 0) return `<div class="box hint">${rcEsc(this._t("no_history"))}</div>`;
    const span = Math.max(m.daysLeft, 1);
    const pct = (d) => `${Math.min(100, Math.max(0, (d / span) * 100)).toFixed(1)}%`;
    const unit = m.type === "pellets" ? "kg" : "L";
    const at = m.use != null ? `<span>${rcEsc(this._t("at_use", { v: this._t("per_day", { u: `${this._fmt(m.use, m.use < 10 ? 1 : 0)} ${unit}` }) }))}</span>` : "";
    const order =
      m.orderDays != null
        ? `<span class="om" style="left:${pct(m.orderDays)}"></span><span class="dz" style="left:${pct(m.orderDays)};width:${pct(Math.min(m.delivery, span - m.orderDays))}"></span>`
        : "";
    // The order label sits over its marker; near either end it is anchored to that end, in place of "Today" or "Empty".
    const op = m.orderDays != null ? (m.orderDays / span) * 100 : null;
    const edge = op == null ? "" : op < 15 ? " start" : op > 85 ? " end" : "";
    const labels =
      m.orderDays != null
        ? `<span class="rl ord${edge}" style="left:${pct(m.orderDays)}">${rcEsc(this._t("order_by"))}<br>${rcEsc(this._date(m.now + m.orderDays * TK_DAY))}</span>`
        : "";
    return `
      <div class="box rw">
        <div class="rh"><span>${rcEsc(this._t("runway"))}</span>${at}</div>
        <div class="bar t-${m.type}">${order}</div>
        <div class="rls">${edge === " start" ? "" : `<span class="rl first">${rcEsc(this._t("today"))}</span>`}${labels}${edge === " end" ? "" : `<span class="rl last">${rcEsc(this._t("empty_on"))}<br>${rcEsc(this._date(m.now + m.daysLeft * TK_DAY))}</span>`}</div>
        ${m.orderDays != null && m.delivery ? `<div class="dl">${rcEsc(this._t("delivery", { n: this._fmt(m.delivery, 0) }))}</div>` : ""}
      </div>`;
  }

  // "in 3 d", or "Today".
  _in(days) {
    const n = Math.round(days);
    return n <= 0 ? this._t("today") : this._t("in_days", { n: this._fmt(n, 0) });
  }

  _tileRow(m) {
    const unit = m.type === "pellets" ? "kg" : "L";
    const tile = (icon, label, value, small, sub, id) =>
      `<button class="xt"${id ? ` data-id="${rcEsc(id)}"` : ""}><span class="xh">${tkIcon(TK_SVG[icon])}<span class="xl">${rcEsc(this._t(label))}</span></span><span class="xv">${rcEsc(value)}${small ? `<small>${rcEsc(small)}</small>` : ""}</span>${sub ? `<span class="xs">${rcEsc(sub)}</span>` : ""}</button>`;
    const trend = m.trend != null && Math.round(m.trend * 100) !== 0 ? this._t("vs_week", { v: `${m.trend >= 0 ? "+" : "−"}${this._fmt(Math.abs(m.trend) * 100, 0)} %` }) : "";
    const use = m.use != null ? tile("use", "t_use", this._fmt(m.use, m.use < 10 ? 1 : 0), this._t("per_day", { u: unit }), trend, m.useId) : tile("use", "t_use", "—", "", "", m.useId);
    const date =
      m.orderDays != null
        ? tile("date", "t_order", this._date(m.now + m.orderDays * TK_DAY), "", this._in(m.orderDays))
        : tile("date", "t_empty", m.daysLeft != null ? this._date(m.now + m.daysLeft * TK_DAY) : "—", "", m.daysLeft != null ? this._in(m.daysLeft) : "");
    return `<div class="tiles">${tile("level", "t_level", m.share == null ? "—" : this._fmt(m.share * 100, 0), "%", "", m.id)}${use}${date}</div>`;
  }

  // The last 30 days: the use of each day, a refill marked.
  _history(m) {
    if (this._config.show_history === false || m.days.length < 3) return "";
    const max = Math.max(...m.days.map((d) => d.use), 0.001);
    const total = m.days.reduce((s, d) => s + d.use, 0);
    const bars = m.days
      .map((d) => {
        const hgt = Math.max(2, Math.round((d.use / max) * 48));
        return d.refill
          ? `<span class="hb rf" title="${rcEsc(`${this._date(d.t)} · ${this._t("refill")}`)}"></span>`
          : `<span class="hb" style="height:${hgt}px" title="${rcEsc(`${this._date(d.t)} · ${this._qty(d.use, m.type)}`)}"></span>`;
      })
      .join("");
    return `<div class="box hs"><div class="rh"><span>${rcEsc(this._t("last_30"))}</span><span>${rcEsc(this._t("used_total", { v: this._qty(total, m.type) }))}</span></div><div class="hbs t-${m.type}">${bars}</div></div>`;
  }

  _draw(m) {
    const c = this._config;
    const status = this._t(`st_${m.state === "none" ? "offline" : m.state}`);
    const parts = [m.state, m.id, m.type, m.share, m.capacity, m.use, m.trend, m.daysLeft, m.orderDays, m.delivery, m.days, new Date(m.now).toDateString(), this._night(), this._dark()];
    if (!this._changed(parts)) return;
    const sub = this._sub(m);
    const subHtml = c.show_subtitle !== false && sub ? `<div class="subt">${rcEsc(sub)}</div>` : "";
    const head =
      c.illustration !== false
        ? this._banner(m, subHtml, "", m.none ? "" : status)
        : `<div class="head${c.navigation_path ? " nav" : ""}"${c.navigation_path ? ' role="link" tabindex="0"' : ""}>
            <div class="badge"><ha-icon icon="${TK_ICONS[m.type]}"></ha-icon></div>
            <div class="tt"><div class="trow"><div class="title">${rcEsc(m.name)}</div>${m.none ? "" : `<span class="pill" title="${rcEsc(status)}" aria-label="${rcEsc(status)}"><span class="pt">${rcEsc(status)}</span></span>`}</div>${subHtml}</div>
          </div>`;
    const dk = this._dark() ? " dk" : "";
    if (m.none || m.state === "offline") {
      this._paint(m.state, `${head}<div class="box hint">${rcEsc(this._t(m.none ? "no_tank" : "st_offline"))}</div>`, "", dk);
      this._fitPill();
      return;
    }
    this._paint(m.state, head + this._big(m) + this._runway(m) + this._tileRow(m) + this._history(m), "", dk);
    this._fitPill();
  }

  _bindAfter(root) {
    for (const b of root.querySelectorAll("[data-id]") || []) b.addEventListener("click", () => rcMoreInfo(this, b.dataset.id));
  }

  static styles = `
    :host { --tk-oil: #d9822b; --tk-propane: #8fb3d1; --tk-water: #3b8fd9; --tk-pellets: #b07a3e; --tk-order: #b23a10; }
    ha-card.lvl-ok { --c: #2f9e44; }
    ha-card.lvl-order_soon, ha-card.lvl-low { --c: #e8590c; }
    ha-card.lvl-order_now, ha-card.lvl-empty { --c: var(--rc-alert); }
    ha-card.lvl-offline, ha-card.lvl-none { --c: var(--rc-idle); }
    ha-card.dk { --tk-order: #ff8a65; }
    .tt { flex: 1 1 0; min-width: 5ch; display: flex; flex-direction: column; }
    .tt .title { flex: none; }
    .subt { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :host([hide-title]) .head .tt { visibility: hidden; }
    .box { margin-top: 10px; border-radius: 12px; padding: 10px 12px; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .hint { font-size: 13px; color: var(--secondary-text-color); }
    .big { all: unset; cursor: pointer; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; margin-top: 12px; min-width: 0; width: 100%; box-sizing: border-box; }
    .big:focus-visible, .xt:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .big b { font-size: 40px; font-weight: 500; line-height: 1; color: var(--primary-text-color); }
    .big span { font-size: 15px; color: var(--secondary-text-color); }
    .big .of { margin-left: auto; font-size: 13px; }
    .rh { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--secondary-text-color); margin-bottom: 10px; }
    .rh span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar { position: relative; height: 24px; border-radius: 12px; --f: var(--tk-oil);
           background: linear-gradient(90deg, var(--f) 0%, color-mix(in srgb, var(--f) 55%, transparent) 70%, color-mix(in srgb, var(--f) 22%, transparent) 100%); }
    .t-propane { --f: var(--tk-propane); } .t-water { --f: var(--tk-water); } .t-pellets { --f: var(--tk-pellets); } .t-oil { --f: var(--tk-oil); }
    .om { position: absolute; top: -6px; bottom: -6px; width: 2px; margin-left: -1px; background: var(--tk-order); border-radius: 1px; }
    .dz { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--tk-order) 22%, transparent) 0 6px, transparent 6px 12px); }
    .rls { position: relative; height: 32px; margin-top: 6px; font-size: 11px; line-height: 1.3; }
    .rl { position: absolute; white-space: nowrap; color: var(--secondary-text-color); }
    .rl.first { left: 0; font-weight: 500; color: var(--primary-text-color); }
    .rl.last { right: 0; text-align: right; }
    .rl.ord { transform: translateX(-50%); text-align: center; font-weight: 500; color: var(--tk-order); }
    .rl.ord.start { left: 0 !important; transform: none; text-align: left; }
    .rl.ord.end { left: auto !important; right: 0; transform: none; text-align: right; }
    .dl { font-size: 11px; color: var(--secondary-text-color); }
    .tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    .xt { all: unset; cursor: pointer; min-width: 0; border-radius: 12px; padding: 9px 11px; display: flex; flex-direction: column; gap: 5px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .xt:not([data-id]) { cursor: default; }
    .xh { display: flex; align-items: center; gap: 6px; min-width: 0; color: var(--c); }
    .xh svg { flex: none; width: 15px; height: 15px; }
    .xl { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .xv { font-size: 18px; font-weight: 500; line-height: 1.15; color: var(--primary-text-color); overflow-wrap: anywhere; }
    .xv small { font-size: 12px; font-weight: 400; color: var(--secondary-text-color); margin-left: 3px; }
    .xs { font-size: 12px; color: var(--secondary-text-color); }
    .hbs { display: flex; align-items: flex-end; gap: 2px; height: 52px; }
    .hb { flex: 1 1 0; min-width: 2px; border-radius: 2px; background: color-mix(in srgb, var(--f) 70%, transparent); }
    .hb.rf { height: 52px; background: repeating-linear-gradient(0deg, color-mix(in srgb, #2f9e44 45%, transparent) 0 4px, transparent 4px 8px); }
    @container (max-width: 340px) {
      .big b { font-size: 32px; }
      .big .of { margin-left: 0; width: 100%; }
      .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .tiles > :nth-child(3) { grid-column: 1 / -1; }
    }
    /* Illustrated header (banner): 90 px, edge to edge, the title on the boiler room's wall, the tank at the right,
       a 10 px concrete strip at the bottom. The badge's icon is in the state's colour, grey when idle, by day and night. */
    .banner { position: relative; display: flex; height: 90px; margin: -12px -12px 0; overflow: hidden; background: #efe9df;
              --bt: #0d2a45; --bs: #3b5b78; --ic: color-mix(in srgb, var(--c) 85%, #10283f); --sw: min(200px, 56%); }
    .banner.night { background: #2c3034; --bt: #fff; --bs: rgba(255,255,255,.78); --ic: color-mix(in srgb, var(--c) 72%, #fff); }
    .lvl-offline .banner, .lvl-none .banner { --ic: #6b7680; }
    .lvl-offline .banner.night, .lvl-none .banner.night { --ic: #a7b0b8; }
    .banner .head { position: relative; z-index: 1; flex: 1; min-width: 0; height: 80px; box-sizing: border-box;
                    padding: 0 calc(var(--sw) + 4px) 0 14px; flex-wrap: nowrap; }
    .banner .head::after { content: none; }
    .banner .badge { position: relative; color: var(--ic); background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(13,42,69,.12); }
    .banner.night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
    .banner .title { color: var(--bt); }
    .banner .subt { color: var(--bs); font-size: 13px; }
    .banner .room { position: absolute; right: 0; bottom: 10px; width: var(--sw); height: calc(80px * var(--sk, 1)); }
    .banner .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: #9aa1a9; box-shadow: inset 0 2px 0 #b5bbc2; }
    .banner.night .ground { background: #1f2329; box-shadow: inset 0 2px 0 #3a4048; }
    /* The mini card's expand / collapse button: 24 px, frosted, 5 px from the banner's top right corner. */
    .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                    background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
    .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
    .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
    .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
    .banner .tt { min-width: 0; flex: 1 1 auto; }
    /* Status pill right after the title (see tkPlacePill). */
    .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .trow > .title { flex: 0 1 auto; min-width: 0; }
    .trow > .bpill, .trow > .pill { flex: none; max-width: none; }
    :host([hide-title]) .trow .title { visibility: hidden; }
    .head:has(.trow) { flex-wrap: nowrap; }
    .head:has(.trow)::after { content: none; }
    .bpill { display: inline-flex; align-items: center; gap: 4px; min-width: 0; box-sizing: border-box; overflow: hidden;
             white-space: nowrap; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; line-height: 16px;
             background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
    .banner.night .bpill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
    .bdot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
    .bpt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    [data-wrap] .trow { display: contents; }
    [data-wrap] .trow > .bpill, [data-wrap] .trow > .pill { order: 9; align-self: flex-start; max-width: 100%; margin-top: 3px; }
    .banner[data-wrap] .trow > .bpill { max-width: calc(100cqw - 80px); }
    [data-wrap] .subt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    [data-dot] .bpill { padding: 0; background: none; }
    [data-dot] .bpt, [data-dot] .trow > .pill .pt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    [data-dot] .trow > .pill { padding: 0; width: 18px; height: 18px; justify-content: center; background: none; }
    [data-dot] .trow > .pill::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
    @container (max-width: 200px) {
      .bpill { padding: 0; background: none; }
      .bpt, .trow > .pill .pt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
      .trow > .pill { padding: 0; width: 18px; height: 18px; justify-content: center; background: none; }
      .trow > .pill::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
    }
    /* The mini card: the banner alone, its readings as chips on the wall. */
    ha-card.bn { padding: 0; }
    ha-card.bn > .banner { margin: 0; --sw: min(200px, 46%); }
    /* Narrower cards: the room is drawn smaller (75 %, 62 %, then 50 % of its height, its left part cropped). */
    @container (max-width: 420px) { .banner, ha-card.bn > .banner { --sw: 150px; --sk: .75; } }
    @container (max-width: 340px) { .banner, ha-card.bn > .banner { --sw: 112px; --sk: .62; } }
    @container (max-width: 260px) { .banner, ha-card.bn > .banner { --sw: 70px; --sk: .5; } }
    /* The chips that do not fit wrap to a second line, hidden: never a chip cut to "R…". */
    .banner .rs { display: flex; flex-wrap: wrap; gap: 4px; height: 20px; margin: 3px 0 0 -2px; min-width: 0; overflow: hidden; }
    .banner .r { flex: none; line-height: 20px; padding: 0 7px; color: var(--bt); background: rgba(255,255,255,.62); }
    .banner.night .r { background: rgba(10,20,40,.4); }
    .banner .ringb { position: absolute; inset: 0; }
  `;
}

// ── Editor ───────────────────────────────────────────────────────────────────
const tkSchema = (booleans) => (lang) => [
  { name: "entity", selector: { entity: { domain: "sensor" } } },
  { name: "title", selector: { text: {} } },
  { name: "navigation_path", selector: { navigation: {} } },
  {
    name: "tank_type",
    selector: {
      select: {
        mode: "dropdown",
        options: [{ value: "", label: rcT(TK_I18N, lang, "ed_type_auto") }, ...TK_TYPES.map((value) => ({ value, label: rcT(TK_I18N, lang, `type_${value}`) }))],
      },
    },
  },
  { name: "capacity", selector: { number: { min: 10, max: 100000, step: 10, mode: "box" } } },
  { name: "height", selector: { number: { min: 10, max: 1000, step: 1, mode: "box", unit_of_measurement: "cm" } } },
  { name: "reorder_level", selector: { number: { min: 0, max: 90, step: 5, mode: "box", unit_of_measurement: "%" } } },
  { name: "delivery_days", selector: { number: { min: 0, max: 60, step: 1, mode: "box" } } },
  { name: "consumption", selector: { entity: { domain: "sensor" } } },
  { name: "days_left", selector: { entity: { domain: "sensor" } } },
  ...rcBooleans(...booleans),
  {
    name: "illustration_theme",
    selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: rcT(TK_I18N, lang, `ed_theme_${value}`) })) } },
  },
  ...rcAdvanced(TK_I18N, lang, "language"),
];

const TK_HELPERS = ["entity", "title", "capacity", "height", "reorder_level", "delivery_days", "consumption", "days_left", "zoom", "language"];

const TankCardEditor = rcEditor({
  card: TankCard,
  helpers: TK_HELPERS,
  schema: tkSchema(["show_title", "show_subtitle", "illustration", "show_history", "animations"]),
});

rcRegister(TankCard, TankCardEditor, "Tank Card", "A tank's level, illustrated: the days left, the date to order by, the use and the last 30 days");

// ── Mini card ────────────────────────────────────────────────────────────────
// The tank on two lines: a ring with the level as the badge, the title and the state, then the quantity and the days
// left as chips; the zoom button opens the full card in place.
class TankMiniCard extends rcMini(
  TankCard,
  "tank-mini-card",
  `
    .mini > .badge { background: none; }
    .ringb { width: 40px; height: 40px; }
  `,
) {
  getCardSize() {
    return this._zoomed ? super.getCardSize() : 1;
  }

  _drawMini(m) {
    const night = this._night();
    if (!this._changed(["mini", m.state, m.type, m.share, m.daysLeft, night, this._dark()])) return;
    const status = this._t(`st_${m.state === "none" ? "offline" : m.state}`);
    const chip = (text) => `<button class="r" data-id="${rcEsc(m.id || "")}" title="${rcEsc(text)}"><span>${rcEsc(text)}</span></button>`;
    const chips = m.none
      ? chip(this._t("no_tank"))
      : m.state === "offline"
        ? ""
        : [chip(`${this._qty(m.volume, m.type)} · ${this._pct(m)}`), m.daysLeft != null && chip(this._left(m))].filter(Boolean).join("");
    // The ring around the badge: the level.
    const pct = m.share == null ? 0 : m.share * 100;
    const L = 2 * Math.PI * 17;
    const ring = `<svg class="ringb" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="color-mix(in srgb, var(--c) 18%, transparent)" stroke-width="4"/><circle cx="20" cy="20" r="17" fill="none" stroke="var(--c)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${((L * pct) / 100).toFixed(1)} 999" transform="rotate(-90 20 20)"/></svg>`;
    const c = this._config;
    this.shadowRoot.innerHTML = `<style>${RC_BASE_STYLES}${this.constructor.styles}</style>
      <ha-card class="lvl-${m.state} bn${this._dark() ? " dk" : ""}">${this._banner(m, chips ? `<div class="rs">${chips}</div>` : "", ring, m.none ? "" : status)}</ha-card>`;
    const root = this.shadowRoot;
    if (c.navigation_path) rcBindNav(root.querySelector(".head"), c.navigation_path);
    for (const el of root.querySelectorAll(".r[data-id]")) if (el.dataset.id) el.addEventListener("click", () => rcMoreInfo(this, el.dataset.id));
    this._fitPill();
  }
}

const TankMiniCardEditor = rcEditor({
  card: TankMiniCard,
  helpers: TK_HELPERS,
  schema: tkSchema(["show_title", "show_subtitle", "illustration", "show_history", "animations", "zoom"]),
});

rcRegister(TankMiniCard, TankMiniCardEditor, "Tank Mini Card", "The tank on two lines: the level as a ring, the quantity and the days left, with a zoom to the full card");
