/**
 * Shared by the tank cards (its names are used by the other src/ files): the tank's level, volume and use, i18n helpers,
 * the base card (header, tiles, tap / hold), the mini card, the visual editor and the common styles. Same base as ha-room-card.
 * https://github.com/juju35/ha-tank-card
 */
const RC_VERSION = "__VERSION__";

const RC_HOLD_MS = 500;
const RC_MOVE_PX = 8;
// A held arrow key repeats some 30 times a second: one brightness step every RC_REPEAT_MS at most.
const RC_REPEAT_MS = 150;

// ── Overviews ────────────────────────────────────────────────────────────────
// Shared by room-overview-card and room-environment-overview-card.

// The zoom / detail button: the same icons on the overviews and the mini cards.
const rcZoomIcon = (card) => (card._zoomed ? "mdi:arrow-collapse" : "mdi:arrow-expand");

// Back to the compact view (mini card, or overview showing the rooms needing a look), when zoomed in.
const rcUnzoom = (card) => {
  if (!card._zoomed) return;
  card._zoomed = false;
  card._sig = null;
  card._render();
};

// True for a click outside `card` that is not in a dialog opened from it (more-info, say): it folds the card back.
const rcOutside = (card, ev) => !ev.composedPath().includes(card) && !rcInDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count), and a scroll does not count (the browser cancels the pointer); keyboard clicks still go
// through the click event. The handler keeps its own checks (outside of the card, not in a dialog).
const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = !ev.composedPath().includes(card);
  };
  const onUp = (ev) => {
    if (downOutside) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

// A click on the detail button: every room, or back to the rooms needing a look. True when handled.
const rcZoomClick = (card, ev) => {
  if (!ev.target.closest?.(".zoom")) return false;
  ev.stopPropagation();
  card._zoomed = !card._zoomed;
  card._sig = null;
  card._render();
  if (ev.detail === 0) card.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  return true;
};

// ── i18n ─────────────────────────────────────────────────────────────────────
// Strings shared by the cards; a card's own dictionary wins over these.
const RC_I18N = {
  en: {
    unavailable: "Unavailable",
    turn_all_off: "Turn everything off",
    ed_title: "Title",
    ed_show_title: "Show title",
    ed_advanced: "Advanced",
    ed_language: "Language",
    ed_language_helper: "Empty: the Home Assistant language",
    ed_language_auto: "Automatic",
    ed_navigation_path: "Navigation path",
    err_config: "Set `area` or `entities`",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    ed_zoom: "Zoom button",
    ed_zoom_helper: "Switches the mini card to the full card and back",
  },
  fr: {
    unavailable: "Indisponible",
    turn_all_off: "Tout éteindre",
    ed_title: "Titre",
    ed_show_title: "Afficher le titre",
    ed_advanced: "Avancé",
    ed_language: "Langue",
    ed_language_helper: "Vide : la langue de Home Assistant",
    ed_language_auto: "Automatique",
    ed_navigation_path: "Chemin de navigation",
    err_config: "Définis `area` ou `entities`",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    ed_zoom: "Bouton zoom",
    ed_zoom_helper: "Bascule la mini-carte en carte complète, et inversement",
  },
  de: {
    unavailable: "Nicht verfügbar",
    turn_all_off: "Alles ausschalten",
    ed_title: "Titel",
    ed_show_title: "Titel anzeigen",
    ed_advanced: "Erweitert",
    ed_language: "Sprache",
    ed_language_helper: "Leer: die Sprache von Home Assistant",
    ed_language_auto: "Automatisch",
    ed_navigation_path: "Navigationspfad",
    err_config: "Lege `area` oder `entities` fest",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    ed_zoom: "Zoom-Schaltfläche",
    ed_zoom_helper: "Wechselt von der Mini-Karte zur vollständigen Karte und zurück",
  },
  es: {
    unavailable: "No disponible",
    turn_all_off: "Apagar todo",
    ed_title: "Título",
    ed_show_title: "Mostrar el título",
    ed_advanced: "Avanzado",
    ed_language: "Idioma",
    ed_language_helper: "Vacío: el idioma de Home Assistant",
    ed_language_auto: "Automático",
    ed_navigation_path: "Ruta de navegación",
    err_config: "Define `area` o `entities`",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    ed_zoom: "Botón de zoom",
    ed_zoom_helper: "Cambia de la minitarjeta a la tarjeta completa y viceversa",
  },
  sr: {
    unavailable: "Недоступно",
    turn_all_off: "Искључи све",
    ed_title: "Наслов",
    ed_show_title: "Прикажи наслов",
    ed_advanced: "Напредно",
    ed_language: "Језик",
    ed_language_helper: "Празно: језик Home Assistant-а",
    ed_language_auto: "Аутоматски",
    ed_navigation_path: "Путања за навигацију",
    err_config: "Подесите `area` или `entities`",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    ed_zoom: "Дугме за увећање",
    ed_zoom_helper: "Пребацује мини картицу на пун приказ и назад",
  },
  "sr-Latn": {
    unavailable: "Nedostupno",
    turn_all_off: "Isključi sve",
    ed_title: "Naslov",
    ed_show_title: "Prikaži naslov",
    ed_advanced: "Napredno",
    ed_language: "Jezik",
    ed_language_helper: "Prazno: jezik Home Assistant-a",
    ed_language_auto: "Automatski",
    ed_navigation_path: "Putanja za navigaciju",
    err_config: "Podesite `area` ili `entities`",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    ed_zoom: "Dugme za uvećanje",
    ed_zoom_helper: "Prebacuje mini karticu na pun prikaz i nazad",
  },
  it: {
    unavailable: "Non disponibile",
    turn_all_off: "Spegni tutto",
    ed_title: "Titolo",
    ed_show_title: "Mostra il titolo",
    ed_advanced: "Avanzate",
    ed_language: "Lingua",
    ed_language_helper: "Vuoto: la lingua di Home Assistant",
    ed_language_auto: "Automatica",
    ed_navigation_path: "Percorso di navigazione",
    err_config: "Imposta `area` o `entities`",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    ed_zoom: "Pulsante zoom",
    ed_zoom_helper: "Passa dalla mini scheda alla scheda completa e viceversa",
  },
  nl: {
    unavailable: "Niet beschikbaar",
    turn_all_off: "Alles uitschakelen",
    ed_title: "Titel",
    ed_show_title: "Titel tonen",
    ed_advanced: "Geavanceerd",
    ed_language: "Taal",
    ed_language_helper: "Leeg: de taal van Home Assistant",
    ed_language_auto: "Automatisch",
    ed_navigation_path: "Navigatiepad",
    err_config: "Stel `area` of `entities` in",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    ed_zoom: "Zoomknop",
    ed_zoom_helper: "Schakelt de minikaart naar de volledige kaart en terug",
  },
  pt: {
    unavailable: "Indisponível",
    turn_all_off: "Desligar tudo",
    ed_title: "Título",
    ed_show_title: "Mostrar o título",
    ed_advanced: "Avançado",
    ed_language: "Idioma",
    ed_language_helper: "Vazio: o idioma do Home Assistant",
    ed_language_auto: "Automático",
    ed_navigation_path: "Caminho de navegação",
    err_config: "Defina `area` ou `entities`",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    ed_zoom: "Botão de zoom",
    ed_zoom_helper: "Alterna entre o minicartão e o cartão completo",
  },
  pl: {
    unavailable: "Niedostępne",
    turn_all_off: "Wyłącz wszystko",
    ed_title: "Tytuł",
    ed_show_title: "Pokaż tytuł",
    ed_advanced: "Zaawansowane",
    ed_language: "Język",
    ed_language_helper: "Puste: język Home Assistanta",
    ed_language_auto: "Automatyczny",
    ed_navigation_path: "Ścieżka nawigacji",
    err_config: "Ustaw `area` lub `entities`",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    ed_zoom: "Przycisk powiększenia",
    ed_zoom_helper: "Przełącza minikartę na pełną kartę i z powrotem",
  },
  ro: {
    unavailable: "Indisponibil",
    turn_all_off: "Oprește tot",
    ed_title: "Titlu",
    ed_show_title: "Afișează titlul",
    ed_advanced: "Avansat",
    ed_language: "Limbă",
    ed_language_helper: "Gol: limba Home Assistant",
    ed_language_auto: "Automată",
    ed_navigation_path: "Cale de navigare",
    err_config: "Setează `area` sau `entities`",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    ed_zoom: "Buton de zoom",
    ed_zoom_helper: "Comută între mini-card și cardul complet",
  },
  da: {
    unavailable: "Utilgængelig",
    turn_all_off: "Sluk alt",
    ed_title: "Titel",
    ed_show_title: "Vis titel",
    ed_advanced: "Avanceret",
    ed_language: "Sprog",
    ed_language_helper: "Tomt: Home Assistants sprog",
    ed_language_auto: "Automatisk",
    ed_navigation_path: "Navigationssti",
    err_config: "Angiv `area` eller `entities`",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til den kompakte visning",
    ed_zoom: "Zoomknap",
    ed_zoom_helper: "Skifter fra minikortet til hele kortet og tilbage",
  },
  sv: {
    unavailable: "Ej tillgänglig",
    turn_all_off: "Stäng av allt",
    ed_title: "Titel",
    ed_show_title: "Visa rubrik",
    ed_advanced: "Avancerat",
    ed_language: "Språk",
    ed_language_helper: "Tomt: Home Assistants språk",
    ed_language_auto: "Automatiskt",
    ed_navigation_path: "Navigeringssökväg",
    err_config: "Ange `area` eller `entities`",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    ed_zoom: "Zoomknapp",
    ed_zoom_helper: "Växlar mellan minikortet och hela kortet",
  },
  bg: {
    unavailable: "Недостъпно",
    turn_all_off: "Изключи всичко",
    ed_title: "Заглавие",
    ed_show_title: "Показване на заглавието",
    ed_advanced: "Разширени",
    ed_language: "Език",
    ed_language_helper: "Празно: езикът на Home Assistant",
    ed_language_auto: "Автоматично",
    ed_navigation_path: "Път за навигация",
    err_config: "Задайте `area` или `entities`",
    zoom_in: "Покажи пълната карта",
    zoom_out: "Обратно към компактния изглед",
    ed_zoom: "Бутон за увеличение",
    ed_zoom_helper: "Превключва от мини картата към пълната карта и обратно",
  },
  ru: {
    unavailable: "Недоступно",
    turn_all_off: "Выключить всё",
    ed_title: "Заголовок",
    ed_show_title: "Показывать заголовок",
    ed_advanced: "Дополнительно",
    ed_language: "Язык",
    ed_language_helper: "Пусто: язык Home Assistant",
    ed_language_auto: "Автоматически",
    ed_navigation_path: "Путь навигации",
    err_config: "Укажите `area` или `entities`",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    ed_zoom: "Кнопка масштаба",
    ed_zoom_helper: "Переключает мини-карточку на полную карточку и обратно",
  },
  uk: {
    unavailable: "Недоступно",
    turn_all_off: "Вимкнути все",
    ed_title: "Заголовок",
    ed_show_title: "Показувати заголовок",
    ed_advanced: "Додатково",
    ed_language: "Мова",
    ed_language_helper: "Порожньо: мова Home Assistant",
    ed_language_auto: "Автоматично",
    ed_navigation_path: "Шлях навігації",
    err_config: "Вкажіть `area` або `entities`",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    ed_zoom: "Кнопка масштабу",
    ed_zoom_helper: "Перемикає міні-картку на повну картку й назад",
  },
  hu: {
    unavailable: "Nem elérhető",
    turn_all_off: "Minden kikapcsolása",
    ed_title: "Cím",
    ed_show_title: "Cím megjelenítése",
    ed_advanced: "Speciális",
    ed_language: "Nyelv",
    ed_language_helper: "Üres: a Home Assistant nyelve",
    ed_language_auto: "Automatikus",
    ed_navigation_path: "Navigációs útvonal",
    err_config: "Állítsd be az `area` vagy az `entities` értékét",
    zoom_in: "A teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    ed_zoom: "Nagyítás gomb",
    ed_zoom_helper: "Vált a mini kártya és a teljes kártya között",
  },
  sk: {
    unavailable: "Nedostupné",
    turn_all_off: "Vypnúť všetko",
    ed_title: "Názov",
    ed_show_title: "Zobraziť názov",
    ed_advanced: "Rozšírené",
    ed_language: "Jazyk",
    ed_language_helper: "Prázdne: jazyk Home Assistanta",
    ed_language_auto: "Automaticky",
    ed_navigation_path: "Navigačná cesta",
    err_config: "Nastavte `area` alebo `entities`",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    ed_zoom: "Tlačidlo priblíženia",
    ed_zoom_helper: "Prepína minikartu na celú kartu a späť",
  },
  cs: {
    unavailable: "Nedostupné",
    turn_all_off: "Vypnout vše",
    ed_title: "Název",
    ed_show_title: "Zobrazit název",
    ed_advanced: "Pokročilé",
    ed_language: "Jazyk",
    ed_language_helper: "Prázdné: jazyk Home Assistanta",
    ed_language_auto: "Automaticky",
    ed_navigation_path: "Navigační cesta",
    err_config: "Nastavte `area` nebo `entities`",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    ed_zoom: "Tlačítko přiblížení",
    ed_zoom_helper: "Přepíná minikartu na celou kartu a zpět",
  },
  sl: {
    unavailable: "Ni na voljo",
    turn_all_off: "Izklopi vse",
    ed_title: "Naslov",
    ed_show_title: "Prikaži naslov",
    ed_advanced: "Napredno",
    ed_language: "Jezik",
    ed_language_helper: "Prazno: jezik Home Assistanta",
    ed_language_auto: "Samodejno",
    ed_navigation_path: "Navigacijska pot",
    err_config: "Nastavite `area` ali `entities`",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    ed_zoom: "Gumb za povečavo",
    ed_zoom_helper: "Preklopi mini kartico v celotno kartico in nazaj",
  },
  lv: {
    unavailable: "Nav pieejams",
    turn_all_off: "Izslēgt visu",
    ed_title: "Virsraksts",
    ed_show_title: "Rādīt virsrakstu",
    ed_advanced: "Papildu",
    ed_language: "Valoda",
    ed_language_helper: "Tukšs: Home Assistant valoda",
    ed_language_auto: "Automātiski",
    ed_navigation_path: "Navigācijas ceļš",
    err_config: "Iestatiet `area` vai `entities`",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    ed_zoom: "Tālummaiņas poga",
    ed_zoom_helper: "Pārslēdz mini karti uz pilno karti un atpakaļ",
  },
  el: {
    unavailable: "Μη διαθέσιμο",
    turn_all_off: "Απενεργοποίηση όλων",
    ed_title: "Τίτλος",
    ed_show_title: "Εμφάνιση τίτλου",
    ed_advanced: "Για προχωρημένους",
    ed_language: "Γλώσσα",
    ed_language_helper: "Κενό: η γλώσσα του Home Assistant",
    ed_language_auto: "Αυτόματα",
    ed_navigation_path: "Διαδρομή πλοήγησης",
    err_config: "Ορίστε `area` ή `entities`",
    zoom_in: "Εμφάνιση της πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    ed_zoom: "Κουμπί ζουμ",
    ed_zoom_helper: "Εναλλάσσει τη μίνι κάρτα με την πλήρη κάρτα",
  },
};

// ── Tank ─────────────────────────────────────────────────────────────────────
// A tank is one level sensor: a share (%), a volume (L, m³, gal), a mass (kg, t, lb) or the distance from the top of the
// tank to the surface (cm, mm, m, in, with `height`). With `capacity` (litres, or kilograms for pellets) it gives the
// volume left. The use per day comes from a daily use sensor (`consumption`) when there is one, else from the recorder's
// daily statistics of the level over the last 30 days (a rise is a refill, not a negative use). The days left come from
// a sensor of the integration (`days_left`, OilFox's) when set, else from the volume and the use.
const TK_TYPES = ["oil", "propane", "water", "pellets"];
const TK_TYPE_NAMES = {
  oil: /oil|fioul|fuel|mazout|heiz|gasoil|oilfox|smartoil/i,
  propane: /propane|propan|lpg|gpl|gas|mopeka/i,
  water: /water|eau|rain|pluie|regen|cistern|citerne/i,
  pellets: /pellet|granul|silo|wood|bois/i,
};
// The share of a full tank (0–1) a reading stands for, from its unit.
const tkShare = (value, unit, { capacity, height }) => {
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

const tkNum = (st) => {
  if (!st || ["unavailable", "unknown", ""].includes(st.state)) return null;
  const v = Number(st.state);
  return Number.isFinite(v) ? v : null;
};

// The tank's type: `tank_type`, else from the sensor's name, platform and unit (a mass is pellets).
const tkType = (hass, id, configured) => {
  if (TK_TYPES.includes(configured)) return configured;
  const st = hass.states[id];
  const label = `${id} ${st?.attributes?.friendly_name || ""} ${hass.entities?.[id]?.platform || ""}`;
  if (/^(kg|t|lb)$/.test(st?.attributes?.unit_of_measurement || "")) return "pellets";
  return TK_TYPES.find((t) => TK_TYPE_NAMES[t].test(label)) || "oil";
};

// The tank level sensors of the home, most likely first: for the card picker's first config.
const tkSources = (hass) =>
  Object.keys(hass.states || {}).filter((id) => {
    if (!id.startsWith("sensor.")) return false;
    const st = hass.states[id];
    const label = `${id} ${st.attributes?.friendly_name || ""} ${hass.entities?.[id]?.platform || ""}`;
    return /tank|cuve|citerne|silo|oilfox|mopeka|level|niveau|fill/i.test(label) && /%|L|m³|kg|cm|mm/.test(st.attributes?.unit_of_measurement || "") && !/battery|batterie|signal|rssi/i.test(label);
  });

// Each day's use and refill, from the daily mean levels ([{ start, mean }], oldest first) turned into volumes: a fall is
// the use of the day, a rise of more than 3 % of the tank a refill (no use that day).
const tkDays = (rows, toVolume, capacity) => {
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
const tkAverage = (days, n) => {
  const kept = days.filter((d) => !d.refill).slice(-n);
  return kept.length >= 3 ? kept.reduce((s, d) => s + d.use, 0) / kept.length : null;
};

// The Intl formats, made once per language and options (a render formats many numbers).
const tkIntlCache = new Map();
const tkIntl = (Kind, lang, opts) => {
  const key = `${Kind.name}|${lang}|${JSON.stringify(opts)}`;
  if (!tkIntlCache.has(key)) tkIntlCache.set(key, new Kind(lang, opts));
  return tkIntlCache.get(key);
};

// Strings of the tank cards; the shared ones above (editor basics) complete them.
const TK_I18N = {
  en: {
    type_oil: "Heating oil",
    type_propane: "Propane",
    type_water: "Rainwater",
    type_pellets: "Pellet silo",
    st_ok: "Good",
    st_order_soon: "Order soon",
    st_order_now: "Order now",
    st_low: "Running low",
    st_empty: "Almost empty",
    st_offline: "Unavailable",
    days_one: "{n} day left",
    days_few: "{n} days left",
    days_many: "{n} days left",
    of_total: "{v} of {t}",
    runway: "Runway to empty",
    at_use: "at {v}",
    today: "Today",
    order_by: "Order by",
    delivery: "delivery {n} d",
    empty_on: "Empty",
    t_level: "Level",
    t_use: "Use",
    t_order: "Order by",
    t_empty: "Empty by",
    in_days: "in {n} d",
    vs_week: "{v} vs last week",
    per_day: "{u}/day",
    last_30: "Last 30 days",
    used_total: "{v} used",
    refill: "Refill",
    no_history: "Not enough history yet to estimate the use",
    no_tank: "No tank level sensor found",
    ed_entity: "Level sensor",
    ed_entity_helper: "A level in %, a volume, a mass, or the distance from the top of the tank to the surface",
    ed_tank_type: "Tank type",
    ed_type_auto: "Automatic (from the sensor)",
    ed_capacity: "Capacity",
    ed_capacity_helper: "Litres, or kilograms for pellets",
    ed_height: "Tank height",
    ed_height_helper: "Centimetres, for a distance sensor",
    ed_reorder_level: "Reorder level",
    ed_reorder_level_helper: "The level (%) at which to order",
    ed_delivery_days: "Delivery time",
    ed_delivery_days_helper: "Days between the order and the delivery",
    ed_consumption: "Daily use sensor",
    ed_consumption_helper: "Optional: a sensor of the use per day; empty: worked out from the level's history",
    ed_days_left: "Days left sensor",
    ed_days_left_helper: "Optional: the integration's own estimate (OilFox)",
    ed_show_history: "Last 30 days",
    ed_show_subtitle: "Show subtitle",
    ed_illustration: "Illustrated header",
    ed_illustration_theme: "Header theme",
    ed_theme_auto: "Automatic (follows the theme)",
    ed_theme_day: "Day",
    ed_theme_night: "Night",
    ed_animations: "Animations",
    ed_title_helper: "Empty: the tank type",
  },
  fr: {
    type_oil: "Fioul",
    type_propane: "Propane",
    type_water: "Eau de pluie",
    type_pellets: "Silo à granulés",
    st_ok: "Bon niveau",
    st_order_soon: "À commander bientôt",
    st_order_now: "À commander",
    st_low: "Niveau bas",
    st_empty: "Presque vide",
    st_offline: "Indisponible",
    days_one: "{n} jour restant",
    days_few: "{n} jours restants",
    days_many: "{n} jours restants",
    of_total: "{v} sur {t}",
    runway: "Jusqu'à la cuve vide",
    at_use: "à {v}",
    today: "Aujourd'hui",
    order_by: "Commander avant",
    delivery: "livraison {n} j",
    empty_on: "Vide",
    t_level: "Niveau",
    t_use: "Conso",
    t_order: "Commander avant",
    t_empty: "Vide le",
    in_days: "dans {n} j",
    vs_week: "{v} vs semaine passée",
    per_day: "{u}/jour",
    last_30: "30 derniers jours",
    used_total: "{v} consommés",
    refill: "Remplissage",
    no_history: "Pas encore assez d'historique pour estimer la conso",
    no_tank: "Aucun capteur de niveau de cuve trouvé",
    ed_entity: "Capteur de niveau",
    ed_entity_helper: "Un niveau en %, un volume, une masse, ou la distance du haut de la cuve à la surface",
    ed_tank_type: "Type de cuve",
    ed_type_auto: "Automatique (d'après le capteur)",
    ed_capacity: "Capacité",
    ed_capacity_helper: "Litres, ou kilogrammes pour les granulés",
    ed_height: "Hauteur de la cuve",
    ed_height_helper: "Centimètres, pour un capteur de distance",
    ed_reorder_level: "Seuil de commande",
    ed_reorder_level_helper: "Le niveau (%) auquel commander",
    ed_delivery_days: "Délai de livraison",
    ed_delivery_days_helper: "Jours entre la commande et la livraison",
    ed_consumption: "Capteur de conso journalière",
    ed_consumption_helper: "Facultatif : un capteur de la conso par jour ; vide : calculée d'après l'historique du niveau",
    ed_days_left: "Capteur de jours restants",
    ed_days_left_helper: "Facultatif : l'estimation de l'intégration (OilFox)",
    ed_show_history: "30 derniers jours",
    ed_show_subtitle: "Afficher le sous-titre",
    ed_illustration: "En-tête illustré",
    ed_illustration_theme: "Thème de l'en-tête",
    ed_theme_auto: "Automatique (suit le thème)",
    ed_theme_day: "Jour",
    ed_theme_night: "Nuit",
    ed_animations: "Animations",
    ed_title_helper: "Vide : le type de cuve",
  },
  de: {
    type_oil: "Heizöl",
    type_propane: "Propan",
    type_water: "Regenwasser",
    type_pellets: "Pelletsilo",
    st_ok: "Gut",
    st_order_soon: "Bald bestellen",
    st_order_now: "Jetzt bestellen",
    st_low: "Niedrig",
    st_empty: "Fast leer",
    st_offline: "Nicht verfügbar",
    days_one: "{n} Tag übrig",
    days_few: "{n} Tage übrig",
    days_many: "{n} Tage übrig",
    of_total: "{v} von {t}",
    runway: "Bis der Tank leer ist",
    at_use: "bei {v}",
    today: "Heute",
    order_by: "Bestellen bis",
    delivery: "Lieferung {n} T",
    empty_on: "Leer",
    t_level: "Füllstand",
    t_use: "Verbrauch",
    t_order: "Bestellen bis",
    t_empty: "Leer am",
    in_days: "in {n} T",
    vs_week: "{v} ggü. Vorwoche",
    per_day: "{u}/Tag",
    last_30: "Letzte 30 Tage",
    used_total: "{v} verbraucht",
    refill: "Befüllung",
    no_history: "Noch nicht genug Verlauf, um den Verbrauch zu schätzen",
    no_tank: "Kein Füllstandssensor gefunden",
    ed_entity: "Füllstandssensor",
    ed_entity_helper: "Ein Füllstand in %, ein Volumen, eine Masse oder der Abstand vom Tankdeckel zur Oberfläche",
    ed_tank_type: "Tankart",
    ed_type_auto: "Automatisch (nach dem Sensor)",
    ed_capacity: "Fassungsvermögen",
    ed_capacity_helper: "Liter, oder Kilogramm für Pellets",
    ed_height: "Tankhöhe",
    ed_height_helper: "Zentimeter, für einen Abstandssensor",
    ed_reorder_level: "Bestellschwelle",
    ed_reorder_level_helper: "Der Füllstand (%), ab dem bestellt wird",
    ed_delivery_days: "Lieferzeit",
    ed_delivery_days_helper: "Tage zwischen Bestellung und Lieferung",
    ed_consumption: "Tagesverbrauchssensor",
    ed_consumption_helper: "Optional: ein Sensor für den Verbrauch pro Tag; leer: aus dem Füllstandsverlauf berechnet",
    ed_days_left: "Sensor für verbleibende Tage",
    ed_days_left_helper: "Optional: die eigene Schätzung der Integration (OilFox)",
    ed_show_history: "Letzte 30 Tage",
    ed_show_subtitle: "Untertitel anzeigen",
    ed_illustration: "Illustrierte Kopfzeile",
    ed_illustration_theme: "Design der Kopfzeile",
    ed_theme_auto: "Automatisch (folgt dem Design)",
    ed_theme_day: "Tag",
    ed_theme_night: "Nacht",
    ed_animations: "Animationen",
    ed_title_helper: "Leer: die Tankart",
  },
  es: {
    type_oil: "Gasóleo",
    type_propane: "Propano",
    type_water: "Agua de lluvia",
    type_pellets: "Silo de pellets",
    st_ok: "Bien",
    st_order_soon: "Pedir pronto",
    st_order_now: "Pedir ya",
    st_low: "Nivel bajo",
    st_empty: "Casi vacío",
    st_offline: "No disponible",
    days_one: "Queda {n} día",
    days_few: "Quedan {n} días",
    days_many: "Quedan {n} días",
    of_total: "{v} de {t}",
    runway: "Hasta el depósito vacío",
    at_use: "a {v}",
    today: "Hoy",
    order_by: "Pedir antes del",
    delivery: "entrega {n} d",
    empty_on: "Vacío",
    t_level: "Nivel",
    t_use: "Consumo",
    t_order: "Pedir antes del",
    t_empty: "Vacío el",
    in_days: "en {n} d",
    vs_week: "{v} vs semana pasada",
    per_day: "{u}/día",
    last_30: "Últimos 30 días",
    used_total: "{v} consumidos",
    refill: "Llenado",
    no_history: "Aún no hay historial suficiente para estimar el consumo",
    no_tank: "No se encontró ningún sensor de nivel de depósito",
    ed_entity: "Sensor de nivel",
    ed_entity_helper: "Un nivel en %, un volumen, una masa o la distancia de la parte superior del depósito a la superficie",
    ed_tank_type: "Tipo de depósito",
    ed_type_auto: "Automático (según el sensor)",
    ed_capacity: "Capacidad",
    ed_capacity_helper: "Litros, o kilogramos para pellets",
    ed_height: "Altura del depósito",
    ed_height_helper: "Centímetros, para un sensor de distancia",
    ed_reorder_level: "Nivel de pedido",
    ed_reorder_level_helper: "El nivel (%) al que pedir",
    ed_delivery_days: "Plazo de entrega",
    ed_delivery_days_helper: "Días entre el pedido y la entrega",
    ed_consumption: "Sensor de consumo diario",
    ed_consumption_helper: "Opcional: un sensor del consumo por día; vacío: calculado a partir del historial del nivel",
    ed_days_left: "Sensor de días restantes",
    ed_days_left_helper: "Opcional: la estimación propia de la integración (OilFox)",
    ed_show_history: "Últimos 30 días",
    ed_show_subtitle: "Mostrar subtítulo",
    ed_illustration: "Encabezado ilustrado",
    ed_illustration_theme: "Tema del encabezado",
    ed_theme_auto: "Automático (sigue el tema)",
    ed_theme_day: "Día",
    ed_theme_night: "Noche",
    ed_animations: "Animaciones",
    ed_title_helper: "Vacío: el tipo de depósito",
  },
  sr: {
    type_oil: "Лож уље",
    type_propane: "Пропан",
    type_water: "Кишница",
    type_pellets: "Силос за пелет",
    st_ok: "Добро",
    st_order_soon: "Наручите ускоро",
    st_order_now: "Наручите сада",
    st_low: "Низак ниво",
    st_empty: "Скоро празно",
    st_offline: "Недоступно",
    days_one: "Остао је {n} дан",
    days_few: "Остала су {n} дана",
    days_many: "Остало је {n} дана",
    of_total: "{v} од {t}",
    runway: "До празног резервоара",
    at_use: "при {v}",
    today: "Данас",
    order_by: "Наручити до",
    delivery: "испорука {n} д",
    empty_on: "Празно",
    t_level: "Ниво",
    t_use: "Потрошња",
    t_order: "Наручити до",
    t_empty: "Празно",
    in_days: "за {n} д",
    vs_week: "{v} у односу на прошлу недељу",
    per_day: "{u}/дан",
    last_30: "Последњих 30 дана",
    used_total: "потрошено {v}",
    refill: "Пуњење",
    no_history: "Још нема довољно историје за процену потрошње",
    no_tank: "Није пронађен сензор нивоа резервоара",
    ed_entity: "Сензор нивоа",
    ed_entity_helper: "Ниво у %, запремина, маса или растојање од врха резервоара до површине",
    ed_tank_type: "Врста резервоара",
    ed_type_auto: "Аутоматски (према сензору)",
    ed_capacity: "Капацитет",
    ed_capacity_helper: "Литри, или килограми за пелет",
    ed_height: "Висина резервоара",
    ed_height_helper: "Центиметри, за сензор растојања",
    ed_reorder_level: "Праг наручивања",
    ed_reorder_level_helper: "Ниво (%) при ком треба наручити",
    ed_delivery_days: "Рок испоруке",
    ed_delivery_days_helper: "Дани између наруџбине и испоруке",
    ed_consumption: "Сензор дневне потрошње",
    ed_consumption_helper: "Опционо: сензор потрошње по дану; празно: израчунато из историје нивоа",
    ed_days_left: "Сензор преосталих дана",
    ed_days_left_helper: "Опционо: сопствена процена интеграције (OilFox)",
    ed_show_history: "Последњих 30 дана",
    ed_show_subtitle: "Прикажи поднаслов",
    ed_illustration: "Илустровано заглавље",
    ed_illustration_theme: "Тема заглавља",
    ed_theme_auto: "Аутоматски (прати тему)",
    ed_theme_day: "Дан",
    ed_theme_night: "Ноћ",
    ed_animations: "Анимације",
    ed_title_helper: "Празно: врста резервоара",
  },
  "sr-Latn": {
    type_oil: "Lož ulje",
    type_propane: "Propan",
    type_water: "Kišnica",
    type_pellets: "Silos za pelet",
    st_ok: "Dobro",
    st_order_soon: "Naručite uskoro",
    st_order_now: "Naručite sada",
    st_low: "Nizak nivo",
    st_empty: "Skoro prazno",
    st_offline: "Nedostupno",
    days_one: "Ostao je {n} dan",
    days_few: "Ostala su {n} dana",
    days_many: "Ostalo je {n} dana",
    of_total: "{v} od {t}",
    runway: "Do praznog rezervoara",
    at_use: "pri {v}",
    today: "Danas",
    order_by: "Naručiti do",
    delivery: "isporuka {n} d",
    empty_on: "Prazno",
    t_level: "Nivo",
    t_use: "Potrošnja",
    t_order: "Naručiti do",
    t_empty: "Prazno",
    in_days: "za {n} d",
    vs_week: "{v} u odnosu na prošlu nedelju",
    per_day: "{u}/dan",
    last_30: "Poslednjih 30 dana",
    used_total: "potrošeno {v}",
    refill: "Punjenje",
    no_history: "Još nema dovoljno istorije za procenu potrošnje",
    no_tank: "Nije pronađen senzor nivoa rezervoara",
    ed_entity: "Senzor nivoa",
    ed_entity_helper: "Nivo u %, zapremina, masa ili rastojanje od vrha rezervoara do površine",
    ed_tank_type: "Vrsta rezervoara",
    ed_type_auto: "Automatski (prema senzoru)",
    ed_capacity: "Kapacitet",
    ed_capacity_helper: "Litri, ili kilogrami za pelet",
    ed_height: "Visina rezervoara",
    ed_height_helper: "Centimetri, za senzor rastojanja",
    ed_reorder_level: "Prag naručivanja",
    ed_reorder_level_helper: "Nivo (%) pri kom treba naručiti",
    ed_delivery_days: "Rok isporuke",
    ed_delivery_days_helper: "Dani između narudžbine i isporuke",
    ed_consumption: "Senzor dnevne potrošnje",
    ed_consumption_helper: "Opciono: senzor potrošnje po danu; prazno: izračunato iz istorije nivoa",
    ed_days_left: "Senzor preostalih dana",
    ed_days_left_helper: "Opciono: sopstvena procena integracije (OilFox)",
    ed_show_history: "Poslednjih 30 dana",
    ed_show_subtitle: "Prikaži podnaslov",
    ed_illustration: "Ilustrovano zaglavlje",
    ed_illustration_theme: "Tema zaglavlja",
    ed_theme_auto: "Automatski (prati temu)",
    ed_theme_day: "Dan",
    ed_theme_night: "Noć",
    ed_animations: "Animacije",
    ed_title_helper: "Prazno: vrsta rezervoara",
  },
  it: {
    type_oil: "Gasolio",
    type_propane: "Propano",
    type_water: "Acqua piovana",
    type_pellets: "Silo di pellet",
    st_ok: "Buono",
    st_order_soon: "Ordinare presto",
    st_order_now: "Ordinare ora",
    st_low: "Livello basso",
    st_empty: "Quasi vuoto",
    st_offline: "Non disponibile",
    days_one: "{n} giorno rimasto",
    days_few: "{n} giorni rimasti",
    days_many: "{n} giorni rimasti",
    of_total: "{v} di {t}",
    runway: "Fino al serbatoio vuoto",
    at_use: "a {v}",
    today: "Oggi",
    order_by: "Ordinare entro",
    delivery: "consegna {n} g",
    empty_on: "Vuoto",
    t_level: "Livello",
    t_use: "Consumo",
    t_order: "Ordinare entro",
    t_empty: "Vuoto il",
    in_days: "tra {n} g",
    vs_week: "{v} vs settimana scorsa",
    per_day: "{u}/giorno",
    last_30: "Ultimi 30 giorni",
    used_total: "{v} consumati",
    refill: "Rifornimento",
    no_history: "Storico non ancora sufficiente per stimare il consumo",
    no_tank: "Nessun sensore di livello del serbatoio trovato",
    ed_entity: "Sensore di livello",
    ed_entity_helper: "Un livello in %, un volume, una massa o la distanza dalla sommità del serbatoio alla superficie",
    ed_tank_type: "Tipo di serbatoio",
    ed_type_auto: "Automatico (dal sensore)",
    ed_capacity: "Capacità",
    ed_capacity_helper: "Litri, o chilogrammi per il pellet",
    ed_height: "Altezza del serbatoio",
    ed_height_helper: "Centimetri, per un sensore di distanza",
    ed_reorder_level: "Soglia di riordino",
    ed_reorder_level_helper: "Il livello (%) al quale ordinare",
    ed_delivery_days: "Tempi di consegna",
    ed_delivery_days_helper: "Giorni tra l'ordine e la consegna",
    ed_consumption: "Sensore di consumo giornaliero",
    ed_consumption_helper: "Facoltativo: un sensore del consumo al giorno; vuoto: calcolato dallo storico del livello",
    ed_days_left: "Sensore dei giorni rimasti",
    ed_days_left_helper: "Facoltativo: la stima propria dell'integrazione (OilFox)",
    ed_show_history: "Ultimi 30 giorni",
    ed_show_subtitle: "Mostra sottotitolo",
    ed_illustration: "Intestazione illustrata",
    ed_illustration_theme: "Tema dell'intestazione",
    ed_theme_auto: "Automatico (segue il tema)",
    ed_theme_day: "Giorno",
    ed_theme_night: "Notte",
    ed_animations: "Animazioni",
    ed_title_helper: "Vuoto: il tipo di serbatoio",
  },
  nl: {
    type_oil: "Stookolie",
    type_propane: "Propaan",
    type_water: "Regenwater",
    type_pellets: "Pelletsilo",
    st_ok: "Goed",
    st_order_soon: "Binnenkort bestellen",
    st_order_now: "Nu bestellen",
    st_low: "Laag",
    st_empty: "Bijna leeg",
    st_offline: "Niet beschikbaar",
    days_one: "{n} dag over",
    days_few: "{n} dagen over",
    days_many: "{n} dagen over",
    of_total: "{v} van {t}",
    runway: "Tot de tank leeg is",
    at_use: "bij {v}",
    today: "Vandaag",
    order_by: "Bestellen vóór",
    delivery: "levering {n} d",
    empty_on: "Leeg",
    t_level: "Niveau",
    t_use: "Verbruik",
    t_order: "Bestellen vóór",
    t_empty: "Leeg op",
    in_days: "over {n} d",
    vs_week: "{v} t.o.v. vorige week",
    per_day: "{u}/dag",
    last_30: "Laatste 30 dagen",
    used_total: "{v} verbruikt",
    refill: "Bijvulling",
    no_history: "Nog niet genoeg geschiedenis om het verbruik te schatten",
    no_tank: "Geen tankniveausensor gevonden",
    ed_entity: "Niveausensor",
    ed_entity_helper: "Een niveau in %, een volume, een massa of de afstand van de bovenkant van de tank tot het oppervlak",
    ed_tank_type: "Soort tank",
    ed_type_auto: "Automatisch (op basis van de sensor)",
    ed_capacity: "Inhoud",
    ed_capacity_helper: "Liter, of kilogram voor pellets",
    ed_height: "Hoogte van de tank",
    ed_height_helper: "Centimeter, voor een afstandssensor",
    ed_reorder_level: "Bestelniveau",
    ed_reorder_level_helper: "Het niveau (%) waarop te bestellen",
    ed_delivery_days: "Levertijd",
    ed_delivery_days_helper: "Dagen tussen bestelling en levering",
    ed_consumption: "Sensor dagverbruik",
    ed_consumption_helper: "Optioneel: een sensor van het verbruik per dag; leeg: berekend uit de geschiedenis van het niveau",
    ed_days_left: "Sensor resterende dagen",
    ed_days_left_helper: "Optioneel: de eigen schatting van de integratie (OilFox)",
    ed_show_history: "Laatste 30 dagen",
    ed_show_subtitle: "Ondertitel tonen",
    ed_illustration: "Geïllustreerde koptekst",
    ed_illustration_theme: "Thema van de koptekst",
    ed_theme_auto: "Automatisch (volgt het thema)",
    ed_theme_day: "Dag",
    ed_theme_night: "Nacht",
    ed_animations: "Animaties",
    ed_title_helper: "Leeg: de soort tank",
  },
  pt: {
    type_oil: "Gasóleo",
    type_propane: "Propano",
    type_water: "Água da chuva",
    type_pellets: "Silo de pellets",
    st_ok: "Bom",
    st_order_soon: "Encomendar em breve",
    st_order_now: "Encomendar já",
    st_low: "Nível baixo",
    st_empty: "Quase vazio",
    st_offline: "Indisponível",
    days_one: "Resta {n} dia",
    days_few: "Restam {n} dias",
    days_many: "Restam {n} dias",
    of_total: "{v} de {t}",
    runway: "Até o depósito ficar vazio",
    at_use: "a {v}",
    today: "Hoje",
    order_by: "Encomendar até",
    delivery: "entrega {n} d",
    empty_on: "Vazio",
    t_level: "Nível",
    t_use: "Consumo",
    t_order: "Encomendar até",
    t_empty: "Vazio a",
    in_days: "em {n} d",
    vs_week: "{v} vs semana passada",
    per_day: "{u}/dia",
    last_30: "Últimos 30 dias",
    used_total: "{v} consumidos",
    refill: "Enchimento",
    no_history: "Ainda não há histórico suficiente para estimar o consumo",
    no_tank: "Nenhum sensor de nível do depósito encontrado",
    ed_entity: "Sensor de nível",
    ed_entity_helper: "Um nível em %, um volume, uma massa ou a distância do topo do depósito à superfície",
    ed_tank_type: "Tipo de depósito",
    ed_type_auto: "Automático (a partir do sensor)",
    ed_capacity: "Capacidade",
    ed_capacity_helper: "Litros, ou quilogramas para pellets",
    ed_height: "Altura do depósito",
    ed_height_helper: "Centímetros, para um sensor de distância",
    ed_reorder_level: "Nível de encomenda",
    ed_reorder_level_helper: "O nível (%) a partir do qual encomendar",
    ed_delivery_days: "Prazo de entrega",
    ed_delivery_days_helper: "Dias entre a encomenda e a entrega",
    ed_consumption: "Sensor de consumo diário",
    ed_consumption_helper: "Opcional: um sensor do consumo por dia; vazio: calculado a partir do histórico do nível",
    ed_days_left: "Sensor de dias restantes",
    ed_days_left_helper: "Opcional: a estimativa própria da integração (OilFox)",
    ed_show_history: "Últimos 30 dias",
    ed_show_subtitle: "Mostrar subtítulo",
    ed_illustration: "Cabeçalho ilustrado",
    ed_illustration_theme: "Tema do cabeçalho",
    ed_theme_auto: "Automático (segue o tema)",
    ed_theme_day: "Dia",
    ed_theme_night: "Noite",
    ed_animations: "Animações",
    ed_title_helper: "Vazio: o tipo de depósito",
  },
  pl: {
    type_oil: "Olej opałowy",
    type_propane: "Propan",
    type_water: "Deszczówka",
    type_pellets: "Silos na pellet",
    st_ok: "Dobry",
    st_order_soon: "Zamów wkrótce",
    st_order_now: "Zamów teraz",
    st_low: "Niski poziom",
    st_empty: "Prawie pusty",
    st_offline: "Niedostępne",
    days_one: "Został {n} dzień",
    days_few: "Zostały {n} dni",
    days_many: "Zostało {n} dni",
    of_total: "{v} z {t}",
    runway: "Do opróżnienia zbiornika",
    at_use: "przy {v}",
    today: "Dziś",
    order_by: "Zamów do",
    delivery: "dostawa {n} dni",
    empty_on: "Pusty",
    t_level: "Poziom",
    t_use: "Zużycie",
    t_order: "Zamów do",
    t_empty: "Pusty",
    in_days: "za {n} dni",
    vs_week: "{v} wobec poprzedniego tygodnia",
    per_day: "{u}/dzień",
    last_30: "Ostatnie 30 dni",
    used_total: "zużyto {v}",
    refill: "Napełnienie",
    no_history: "Za mało historii, by oszacować zużycie",
    no_tank: "Nie znaleziono czujnika poziomu zbiornika",
    ed_entity: "Czujnik poziomu",
    ed_entity_helper: "Poziom w %, objętość, masa lub odległość od góry zbiornika do powierzchni",
    ed_tank_type: "Rodzaj zbiornika",
    ed_type_auto: "Automatycznie (na podstawie czujnika)",
    ed_capacity: "Pojemność",
    ed_capacity_helper: "Litry lub kilogramy dla pelletu",
    ed_height: "Wysokość zbiornika",
    ed_height_helper: "Centymetry, dla czujnika odległości",
    ed_reorder_level: "Próg zamówienia",
    ed_reorder_level_helper: "Poziom (%), przy którym zamawiać",
    ed_delivery_days: "Czas dostawy",
    ed_delivery_days_helper: "Dni między zamówieniem a dostawą",
    ed_consumption: "Czujnik dziennego zużycia",
    ed_consumption_helper: "Opcjonalnie: czujnik zużycia na dzień; puste: obliczane z historii poziomu",
    ed_days_left: "Czujnik pozostałych dni",
    ed_days_left_helper: "Opcjonalnie: własne oszacowanie integracji (OilFox)",
    ed_show_history: "Ostatnie 30 dni",
    ed_show_subtitle: "Pokaż podtytuł",
    ed_illustration: "Ilustrowany nagłówek",
    ed_illustration_theme: "Motyw nagłówka",
    ed_theme_auto: "Automatycznie (zgodnie z motywem)",
    ed_theme_day: "Dzień",
    ed_theme_night: "Noc",
    ed_animations: "Animacje",
    ed_title_helper: "Puste: rodzaj zbiornika",
  },
  ro: {
    type_oil: "Motorină de încălzire",
    type_propane: "Propan",
    type_water: "Apă de ploaie",
    type_pellets: "Siloz de peleți",
    st_ok: "Bun",
    st_order_soon: "Comandă în curând",
    st_order_now: "Comandă acum",
    st_low: "Nivel scăzut",
    st_empty: "Aproape gol",
    st_offline: "Indisponibil",
    days_one: "{n} zi rămasă",
    days_few: "{n} zile rămase",
    days_many: "{n} de zile rămase",
    of_total: "{v} din {t}",
    runway: "Până la rezervorul gol",
    at_use: "la {v}",
    today: "Azi",
    order_by: "Comandă până la",
    delivery: "livrare {n} z",
    empty_on: "Gol",
    t_level: "Nivel",
    t_use: "Consum",
    t_order: "Comandă până la",
    t_empty: "Gol la",
    in_days: "în {n} z",
    vs_week: "{v} față de săptămâna trecută",
    per_day: "{u}/zi",
    last_30: "Ultimele 30 de zile",
    used_total: "{v} consumați",
    refill: "Umplere",
    no_history: "Nu există încă destul istoric pentru a estima consumul",
    no_tank: "Nu s-a găsit niciun senzor de nivel al rezervorului",
    ed_entity: "Senzor de nivel",
    ed_entity_helper: "Un nivel în %, un volum, o masă sau distanța de la partea de sus a rezervorului la suprafață",
    ed_tank_type: "Tip de rezervor",
    ed_type_auto: "Automat (după senzor)",
    ed_capacity: "Capacitate",
    ed_capacity_helper: "Litri, sau kilograme pentru peleți",
    ed_height: "Înălțimea rezervorului",
    ed_height_helper: "Centimetri, pentru un senzor de distanță",
    ed_reorder_level: "Prag de comandă",
    ed_reorder_level_helper: "Nivelul (%) la care se comandă",
    ed_delivery_days: "Termen de livrare",
    ed_delivery_days_helper: "Zile între comandă și livrare",
    ed_consumption: "Senzor de consum zilnic",
    ed_consumption_helper: "Opțional: un senzor al consumului pe zi; gol: calculat din istoricul nivelului",
    ed_days_left: "Senzor de zile rămase",
    ed_days_left_helper: "Opțional: estimarea proprie a integrării (OilFox)",
    ed_show_history: "Ultimele 30 de zile",
    ed_show_subtitle: "Afișează subtitlul",
    ed_illustration: "Antet ilustrat",
    ed_illustration_theme: "Tema antetului",
    ed_theme_auto: "Automat (urmează tema)",
    ed_theme_day: "Zi",
    ed_theme_night: "Noapte",
    ed_animations: "Animații",
    ed_title_helper: "Gol: tipul rezervorului",
  },
  da: {
    type_oil: "Fyringsolie",
    type_propane: "Propan",
    type_water: "Regnvand",
    type_pellets: "Pillesilo",
    st_ok: "God",
    st_order_soon: "Bestil snart",
    st_order_now: "Bestil nu",
    st_low: "Lavt niveau",
    st_empty: "Næsten tom",
    st_offline: "Utilgængelig",
    days_one: "{n} dag tilbage",
    days_few: "{n} dage tilbage",
    days_many: "{n} dage tilbage",
    of_total: "{v} af {t}",
    runway: "Indtil tanken er tom",
    at_use: "ved {v}",
    today: "I dag",
    order_by: "Bestil senest",
    delivery: "levering {n} d",
    empty_on: "Tom",
    t_level: "Niveau",
    t_use: "Forbrug",
    t_order: "Bestil senest",
    t_empty: "Tom den",
    in_days: "om {n} d",
    vs_week: "{v} ift. sidste uge",
    per_day: "{u}/dag",
    last_30: "Seneste 30 dage",
    used_total: "{v} brugt",
    refill: "Påfyldning",
    no_history: "Endnu ikke nok historik til at anslå forbruget",
    no_tank: "Ingen tankniveausensor fundet",
    ed_entity: "Niveausensor",
    ed_entity_helper: "Et niveau i %, en volumen, en masse eller afstanden fra toppen af tanken til overfladen",
    ed_tank_type: "Tanktype",
    ed_type_auto: "Automatisk (ud fra sensoren)",
    ed_capacity: "Kapacitet",
    ed_capacity_helper: "Liter, eller kilogram for piller",
    ed_height: "Tankens højde",
    ed_height_helper: "Centimeter, for en afstandssensor",
    ed_reorder_level: "Bestillingsniveau",
    ed_reorder_level_helper: "Niveauet (%) hvor der skal bestilles",
    ed_delivery_days: "Leveringstid",
    ed_delivery_days_helper: "Dage mellem bestilling og levering",
    ed_consumption: "Sensor for dagligt forbrug",
    ed_consumption_helper: "Valgfri: en sensor for forbruget pr. dag; tom: beregnet ud fra niveauets historik",
    ed_days_left: "Sensor for dage tilbage",
    ed_days_left_helper: "Valgfri: integrationens eget skøn (OilFox)",
    ed_show_history: "Seneste 30 dage",
    ed_show_subtitle: "Vis undertitel",
    ed_illustration: "Illustreret overskrift",
    ed_illustration_theme: "Overskriftens tema",
    ed_theme_auto: "Automatisk (følger temaet)",
    ed_theme_day: "Dag",
    ed_theme_night: "Nat",
    ed_animations: "Animationer",
    ed_title_helper: "Tom: tanktypen",
  },
  sv: {
    type_oil: "Eldningsolja",
    type_propane: "Propan",
    type_water: "Regnvatten",
    type_pellets: "Pelletssilo",
    st_ok: "Bra",
    st_order_soon: "Beställ snart",
    st_order_now: "Beställ nu",
    st_low: "Låg nivå",
    st_empty: "Nästan tom",
    st_offline: "Otillgänglig",
    days_one: "{n} dag kvar",
    days_few: "{n} dagar kvar",
    days_many: "{n} dagar kvar",
    of_total: "{v} av {t}",
    runway: "Tills tanken är tom",
    at_use: "vid {v}",
    today: "I dag",
    order_by: "Beställ senast",
    delivery: "leverans {n} d",
    empty_on: "Tom",
    t_level: "Nivå",
    t_use: "Förbrukning",
    t_order: "Beställ senast",
    t_empty: "Tom den",
    in_days: "om {n} d",
    vs_week: "{v} jämfört med förra veckan",
    per_day: "{u}/dag",
    last_30: "Senaste 30 dagarna",
    used_total: "{v} förbrukat",
    refill: "Påfyllning",
    no_history: "Ännu inte tillräckligt med historik för att uppskatta förbrukningen",
    no_tank: "Ingen tanknivåsensor hittades",
    ed_entity: "Nivåsensor",
    ed_entity_helper: "En nivå i %, en volym, en massa eller avståndet från tankens topp till ytan",
    ed_tank_type: "Tanktyp",
    ed_type_auto: "Automatiskt (från sensorn)",
    ed_capacity: "Kapacitet",
    ed_capacity_helper: "Liter, eller kilogram för pellets",
    ed_height: "Tankens höjd",
    ed_height_helper: "Centimeter, för en avståndssensor",
    ed_reorder_level: "Beställningsnivå",
    ed_reorder_level_helper: "Nivån (%) då det ska beställas",
    ed_delivery_days: "Leveranstid",
    ed_delivery_days_helper: "Dagar mellan beställning och leverans",
    ed_consumption: "Sensor för daglig förbrukning",
    ed_consumption_helper: "Valfritt: en sensor för förbrukningen per dag; tom: beräknad från nivåns historik",
    ed_days_left: "Sensor för dagar kvar",
    ed_days_left_helper: "Valfritt: integrationens egen uppskattning (OilFox)",
    ed_show_history: "Senaste 30 dagarna",
    ed_show_subtitle: "Visa underrubrik",
    ed_illustration: "Illustrerad rubrik",
    ed_illustration_theme: "Rubrikens tema",
    ed_theme_auto: "Automatiskt (följer temat)",
    ed_theme_day: "Dag",
    ed_theme_night: "Natt",
    ed_animations: "Animationer",
    ed_title_helper: "Tom: tanktypen",
  },
  bg: {
    type_oil: "Нафта за отопление",
    type_propane: "Пропан",
    type_water: "Дъждовна вода",
    type_pellets: "Силоз за пелети",
    st_ok: "Добро",
    st_order_soon: "Поръчайте скоро",
    st_order_now: "Поръчайте сега",
    st_low: "Ниско ниво",
    st_empty: "Почти празен",
    st_offline: "Недостъпно",
    days_one: "Остава {n} ден",
    days_few: "Остават {n} дни",
    days_many: "Остават {n} дни",
    of_total: "{v} от {t}",
    runway: "До празен резервоар",
    at_use: "при {v}",
    today: "Днес",
    order_by: "Поръчка до",
    delivery: "доставка {n} д",
    empty_on: "Празен",
    t_level: "Ниво",
    t_use: "Разход",
    t_order: "Поръчка до",
    t_empty: "Празен на",
    in_days: "след {n} д",
    vs_week: "{v} спрямо миналата седмица",
    per_day: "{u}/ден",
    last_30: "Последните 30 дни",
    used_total: "изразходвани {v}",
    refill: "Зареждане",
    no_history: "Все още няма достатъчно история за оценка на разхода",
    no_tank: "Не е намерен сензор за нивото на резервоара",
    ed_entity: "Сензор за ниво",
    ed_entity_helper: "Ниво в %, обем, маса или разстоянието от върха на резервоара до повърхността",
    ed_tank_type: "Вид резервоар",
    ed_type_auto: "Автоматично (според сензора)",
    ed_capacity: "Капацитет",
    ed_capacity_helper: "Литри, или килограми за пелети",
    ed_height: "Височина на резервоара",
    ed_height_helper: "Сантиметри, за сензор за разстояние",
    ed_reorder_level: "Праг за поръчка",
    ed_reorder_level_helper: "Нивото (%), при което да се поръча",
    ed_delivery_days: "Срок на доставка",
    ed_delivery_days_helper: "Дни между поръчката и доставката",
    ed_consumption: "Сензор за дневен разход",
    ed_consumption_helper: "По избор: сензор за разхода на ден; празно: изчислен от историята на нивото",
    ed_days_left: "Сензор за оставащи дни",
    ed_days_left_helper: "По избор: собствената оценка на интеграцията (OilFox)",
    ed_show_history: "Последните 30 дни",
    ed_show_subtitle: "Показване на подзаглавие",
    ed_illustration: "Илюстрирано заглавие",
    ed_illustration_theme: "Тема на заглавието",
    ed_theme_auto: "Автоматично (следва темата)",
    ed_theme_day: "Ден",
    ed_theme_night: "Нощ",
    ed_animations: "Анимации",
    ed_title_helper: "Празно: видът резервоар",
  },
  ru: {
    type_oil: "Печное топливо",
    type_propane: "Пропан",
    type_water: "Дождевая вода",
    type_pellets: "Силос пеллет",
    st_ok: "Хорошо",
    st_order_soon: "Скоро заказать",
    st_order_now: "Заказать сейчас",
    st_low: "Низкий уровень",
    st_empty: "Почти пусто",
    st_offline: "Недоступно",
    days_one: "Остался {n} день",
    days_few: "Осталось {n} дня",
    days_many: "Осталось {n} дней",
    of_total: "{v} из {t}",
    runway: "До пустого бака",
    at_use: "при {v}",
    today: "Сегодня",
    order_by: "Заказать до",
    delivery: "доставка {n} дн.",
    empty_on: "Пусто",
    t_level: "Уровень",
    t_use: "Расход",
    t_order: "Заказать до",
    t_empty: "Пусто",
    in_days: "через {n} дн.",
    vs_week: "{v} к прошлой неделе",
    per_day: "{u}/день",
    last_30: "Последние 30 дней",
    used_total: "израсходовано {v}",
    refill: "Заправка",
    no_history: "Пока недостаточно истории, чтобы оценить расход",
    no_tank: "Датчик уровня бака не найден",
    ed_entity: "Датчик уровня",
    ed_entity_helper: "Уровень в %, объём, масса или расстояние от верха бака до поверхности",
    ed_tank_type: "Тип бака",
    ed_type_auto: "Автоматически (по датчику)",
    ed_capacity: "Ёмкость",
    ed_capacity_helper: "Литры, или килограммы для пеллет",
    ed_height: "Высота бака",
    ed_height_helper: "Сантиметры, для датчика расстояния",
    ed_reorder_level: "Порог заказа",
    ed_reorder_level_helper: "Уровень (%), при котором заказывать",
    ed_delivery_days: "Срок доставки",
    ed_delivery_days_helper: "Дней между заказом и доставкой",
    ed_consumption: "Датчик суточного расхода",
    ed_consumption_helper: "Необязательно: датчик расхода в день; пусто: рассчитывается по истории уровня",
    ed_days_left: "Датчик оставшихся дней",
    ed_days_left_helper: "Необязательно: собственная оценка интеграции (OilFox)",
    ed_show_history: "Последние 30 дней",
    ed_show_subtitle: "Показывать подзаголовок",
    ed_illustration: "Иллюстрированный заголовок",
    ed_illustration_theme: "Тема заголовка",
    ed_theme_auto: "Автоматически (по теме)",
    ed_theme_day: "День",
    ed_theme_night: "Ночь",
    ed_animations: "Анимации",
    ed_title_helper: "Пусто: тип бака",
  },
  uk: {
    type_oil: "Пічне паливо",
    type_propane: "Пропан",
    type_water: "Дощова вода",
    type_pellets: "Силос пелет",
    st_ok: "Добре",
    st_order_soon: "Незабаром замовити",
    st_order_now: "Замовити зараз",
    st_low: "Низький рівень",
    st_empty: "Майже порожньо",
    st_offline: "Недоступно",
    days_one: "Залишився {n} день",
    days_few: "Залишилося {n} дні",
    days_many: "Залишилося {n} днів",
    of_total: "{v} з {t}",
    runway: "До порожнього бака",
    at_use: "при {v}",
    today: "Сьогодні",
    order_by: "Замовити до",
    delivery: "доставка {n} дн.",
    empty_on: "Порожньо",
    t_level: "Рівень",
    t_use: "Витрата",
    t_order: "Замовити до",
    t_empty: "Порожньо",
    in_days: "через {n} дн.",
    vs_week: "{v} до минулого тижня",
    per_day: "{u}/день",
    last_30: "Останні 30 днів",
    used_total: "витрачено {v}",
    refill: "Заправка",
    no_history: "Поки що замало історії, щоб оцінити витрату",
    no_tank: "Датчик рівня бака не знайдено",
    ed_entity: "Датчик рівня",
    ed_entity_helper: "Рівень у %, об'єм, маса або відстань від верху бака до поверхні",
    ed_tank_type: "Тип бака",
    ed_type_auto: "Автоматично (за датчиком)",
    ed_capacity: "Місткість",
    ed_capacity_helper: "Літри, або кілограми для пелет",
    ed_height: "Висота бака",
    ed_height_helper: "Сантиметри, для датчика відстані",
    ed_reorder_level: "Поріг замовлення",
    ed_reorder_level_helper: "Рівень (%), за якого замовляти",
    ed_delivery_days: "Термін доставки",
    ed_delivery_days_helper: "Днів між замовленням і доставкою",
    ed_consumption: "Датчик добової витрати",
    ed_consumption_helper: "Необов'язково: датчик витрати за день; порожньо: обчислюється за історією рівня",
    ed_days_left: "Датчик днів, що залишилися",
    ed_days_left_helper: "Необов'язково: власна оцінка інтеграції (OilFox)",
    ed_show_history: "Останні 30 днів",
    ed_show_subtitle: "Показувати підзаголовок",
    ed_illustration: "Ілюстрований заголовок",
    ed_illustration_theme: "Тема заголовка",
    ed_theme_auto: "Автоматично (за темою)",
    ed_theme_day: "День",
    ed_theme_night: "Ніч",
    ed_animations: "Анімації",
    ed_title_helper: "Порожньо: тип бака",
  },
  hu: {
    type_oil: "Fűtőolaj",
    type_propane: "Propán",
    type_water: "Esővíz",
    type_pellets: "Pelletsiló",
    st_ok: "Jó",
    st_order_soon: "Hamarosan rendelni",
    st_order_now: "Most rendelni",
    st_low: "Alacsony szint",
    st_empty: "Majdnem üres",
    st_offline: "Nem elérhető",
    days_one: "{n} nap van hátra",
    days_few: "{n} nap van hátra",
    days_many: "{n} nap van hátra",
    of_total: "{v} / {t}",
    runway: "A tartály kiürüléséig",
    at_use: "{v} mellett",
    today: "Ma",
    order_by: "Rendelés eddig",
    delivery: "szállítás {n} nap",
    empty_on: "Üres",
    t_level: "Szint",
    t_use: "Fogyasztás",
    t_order: "Rendelés eddig",
    t_empty: "Üres ekkor",
    in_days: "{n} nap múlva",
    vs_week: "{v} az előző héthez képest",
    per_day: "{u}/nap",
    last_30: "Utolsó 30 nap",
    used_total: "{v} elfogyott",
    refill: "Feltöltés",
    no_history: "Még nincs elég előzmény a fogyasztás becsléséhez",
    no_tank: "Nem található tartályszint-érzékelő",
    ed_entity: "Szintérzékelő",
    ed_entity_helper: "Szint %-ban, térfogat, tömeg vagy a tartály tetejétől a felszínig mért távolság",
    ed_tank_type: "Tartály típusa",
    ed_type_auto: "Automatikus (az érzékelő alapján)",
    ed_capacity: "Űrtartalom",
    ed_capacity_helper: "Liter, vagy kilogramm pellet esetén",
    ed_height: "Tartály magassága",
    ed_height_helper: "Centiméter, távolságérzékelőhöz",
    ed_reorder_level: "Rendelési küszöb",
    ed_reorder_level_helper: "A szint (%), amelynél rendelni kell",
    ed_delivery_days: "Szállítási idő",
    ed_delivery_days_helper: "Napok a rendelés és a szállítás között",
    ed_consumption: "Napi fogyasztás érzékelő",
    ed_consumption_helper: "Opcionális: a napi fogyasztás érzékelője; üres: a szint előzményeiből számolva",
    ed_days_left: "Hátralévő napok érzékelő",
    ed_days_left_helper: "Opcionális: az integráció saját becslése (OilFox)",
    ed_show_history: "Utolsó 30 nap",
    ed_show_subtitle: "Alcím megjelenítése",
    ed_illustration: "Illusztrált fejléc",
    ed_illustration_theme: "Fejléc témája",
    ed_theme_auto: "Automatikus (követi a témát)",
    ed_theme_day: "Nappal",
    ed_theme_night: "Éjszaka",
    ed_animations: "Animációk",
    ed_title_helper: "Üres: a tartály típusa",
  },
  sk: {
    type_oil: "Vykurovací olej",
    type_propane: "Propán",
    type_water: "Dažďová voda",
    type_pellets: "Silo na pelety",
    st_ok: "Dobré",
    st_order_soon: "Čoskoro objednať",
    st_order_now: "Objednať teraz",
    st_low: "Nízka hladina",
    st_empty: "Takmer prázdne",
    st_offline: "Nedostupné",
    days_one: "Zostáva {n} deň",
    days_few: "Zostávajú {n} dni",
    days_many: "Zostáva {n} dní",
    of_total: "{v} z {t}",
    runway: "Do prázdnej nádrže",
    at_use: "pri {v}",
    today: "Dnes",
    order_by: "Objednať do",
    delivery: "dodanie {n} d",
    empty_on: "Prázdne",
    t_level: "Hladina",
    t_use: "Spotreba",
    t_order: "Objednať do",
    t_empty: "Prázdne",
    in_days: "o {n} d",
    vs_week: "{v} oproti minulému týždňu",
    per_day: "{u}/deň",
    last_30: "Posledných 30 dní",
    used_total: "spotrebované {v}",
    refill: "Doplnenie",
    no_history: "Zatiaľ nie je dosť histórie na odhad spotreby",
    no_tank: "Nenašiel sa žiadny senzor hladiny nádrže",
    ed_entity: "Senzor hladiny",
    ed_entity_helper: "Hladina v %, objem, hmotnosť alebo vzdialenosť od vrchu nádrže k hladine",
    ed_tank_type: "Typ nádrže",
    ed_type_auto: "Automaticky (podľa senzora)",
    ed_capacity: "Kapacita",
    ed_capacity_helper: "Litre, alebo kilogramy pre pelety",
    ed_height: "Výška nádrže",
    ed_height_helper: "Centimetre, pre senzor vzdialenosti",
    ed_reorder_level: "Hranica objednávky",
    ed_reorder_level_helper: "Hladina (%), pri ktorej objednať",
    ed_delivery_days: "Dodacia lehota",
    ed_delivery_days_helper: "Dni medzi objednávkou a dodaním",
    ed_consumption: "Senzor dennej spotreby",
    ed_consumption_helper: "Voliteľné: senzor spotreby za deň; prázdne: vypočítané z histórie hladiny",
    ed_days_left: "Senzor zostávajúcich dní",
    ed_days_left_helper: "Voliteľné: vlastný odhad integrácie (OilFox)",
    ed_show_history: "Posledných 30 dní",
    ed_show_subtitle: "Zobraziť podnadpis",
    ed_illustration: "Ilustrovaná hlavička",
    ed_illustration_theme: "Téma hlavičky",
    ed_theme_auto: "Automaticky (podľa témy)",
    ed_theme_day: "Deň",
    ed_theme_night: "Noc",
    ed_animations: "Animácie",
    ed_title_helper: "Prázdne: typ nádrže",
  },
  cs: {
    type_oil: "Topný olej",
    type_propane: "Propan",
    type_water: "Dešťová voda",
    type_pellets: "Silo na pelety",
    st_ok: "Dobré",
    st_order_soon: "Brzy objednat",
    st_order_now: "Objednat teď",
    st_low: "Nízká hladina",
    st_empty: "Téměř prázdné",
    st_offline: "Nedostupné",
    days_one: "Zbývá {n} den",
    days_few: "Zbývají {n} dny",
    days_many: "Zbývá {n} dní",
    of_total: "{v} z {t}",
    runway: "Do prázdné nádrže",
    at_use: "při {v}",
    today: "Dnes",
    order_by: "Objednat do",
    delivery: "dodání {n} d",
    empty_on: "Prázdné",
    t_level: "Hladina",
    t_use: "Spotřeba",
    t_order: "Objednat do",
    t_empty: "Prázdné",
    in_days: "za {n} d",
    vs_week: "{v} oproti minulému týdnu",
    per_day: "{u}/den",
    last_30: "Posledních 30 dní",
    used_total: "spotřebováno {v}",
    refill: "Doplnění",
    no_history: "Zatím není dost historie pro odhad spotřeby",
    no_tank: "Nebyl nalezen žádný senzor hladiny nádrže",
    ed_entity: "Senzor hladiny",
    ed_entity_helper: "Hladina v %, objem, hmotnost nebo vzdálenost od vrchu nádrže k hladině",
    ed_tank_type: "Typ nádrže",
    ed_type_auto: "Automaticky (podle senzoru)",
    ed_capacity: "Kapacita",
    ed_capacity_helper: "Litry, nebo kilogramy pro pelety",
    ed_height: "Výška nádrže",
    ed_height_helper: "Centimetry, pro senzor vzdálenosti",
    ed_reorder_level: "Hranice objednávky",
    ed_reorder_level_helper: "Hladina (%), při které objednat",
    ed_delivery_days: "Dodací lhůta",
    ed_delivery_days_helper: "Dny mezi objednávkou a dodáním",
    ed_consumption: "Senzor denní spotřeby",
    ed_consumption_helper: "Volitelné: senzor spotřeby za den; prázdné: vypočteno z historie hladiny",
    ed_days_left: "Senzor zbývajících dní",
    ed_days_left_helper: "Volitelné: vlastní odhad integrace (OilFox)",
    ed_show_history: "Posledních 30 dní",
    ed_show_subtitle: "Zobrazit podtitul",
    ed_illustration: "Ilustrovaná hlavička",
    ed_illustration_theme: "Motiv hlavičky",
    ed_theme_auto: "Automaticky (podle motivu)",
    ed_theme_day: "Den",
    ed_theme_night: "Noc",
    ed_animations: "Animace",
    ed_title_helper: "Prázdné: typ nádrže",
  },
  sl: {
    type_oil: "Kurilno olje",
    type_propane: "Propan",
    type_water: "Deževnica",
    type_pellets: "Silos za pelete",
    st_ok: "Dobro",
    st_order_soon: "Naročite kmalu",
    st_order_now: "Naročite zdaj",
    st_low: "Nizka raven",
    st_empty: "Skoraj prazno",
    st_offline: "Ni na voljo",
    days_one: "Ostaja {n} dan",
    days_few: "Ostajajo {n} dnevi",
    days_many: "Ostaja {n} dni",
    of_total: "{v} od {t}",
    runway: "Do prazne cisterne",
    at_use: "pri {v}",
    today: "Danes",
    order_by: "Naročiti do",
    delivery: "dostava {n} d",
    empty_on: "Prazno",
    t_level: "Raven",
    t_use: "Poraba",
    t_order: "Naročiti do",
    t_empty: "Prazno",
    in_days: "čez {n} d",
    vs_week: "{v} glede na prejšnji teden",
    per_day: "{u}/dan",
    last_30: "Zadnjih 30 dni",
    used_total: "porabljeno {v}",
    refill: "Polnjenje",
    no_history: "Še ni dovolj zgodovine za oceno porabe",
    no_tank: "Senzor ravni cisterne ni bil najden",
    ed_entity: "Senzor ravni",
    ed_entity_helper: "Raven v %, prostornina, masa ali razdalja od vrha cisterne do površine",
    ed_tank_type: "Vrsta cisterne",
    ed_type_auto: "Samodejno (po senzorju)",
    ed_capacity: "Prostornina",
    ed_capacity_helper: "Litri, ali kilogrami za pelete",
    ed_height: "Višina cisterne",
    ed_height_helper: "Centimetri, za senzor razdalje",
    ed_reorder_level: "Prag naročila",
    ed_reorder_level_helper: "Raven (%), pri kateri naročiti",
    ed_delivery_days: "Dobavni rok",
    ed_delivery_days_helper: "Dnevi med naročilom in dostavo",
    ed_consumption: "Senzor dnevne porabe",
    ed_consumption_helper: "Neobvezno: senzor porabe na dan; prazno: izračunano iz zgodovine ravni",
    ed_days_left: "Senzor preostalih dni",
    ed_days_left_helper: "Neobvezno: lastna ocena integracije (OilFox)",
    ed_show_history: "Zadnjih 30 dni",
    ed_show_subtitle: "Prikaži podnaslov",
    ed_illustration: "Ilustrirana glava",
    ed_illustration_theme: "Tema glave",
    ed_theme_auto: "Samodejno (sledi temi)",
    ed_theme_day: "Dan",
    ed_theme_night: "Noč",
    ed_animations: "Animacije",
    ed_title_helper: "Prazno: vrsta cisterne",
  },
  lv: {
    type_oil: "Apkures eļļa",
    type_propane: "Propāns",
    type_water: "Lietusūdens",
    type_pellets: "Granulu silo",
    st_ok: "Labi",
    st_order_soon: "Drīz pasūtīt",
    st_order_now: "Pasūtīt tagad",
    st_low: "Zems līmenis",
    st_empty: "Gandrīz tukšs",
    st_offline: "Nav pieejams",
    days_one: "Atlikusi {n} diena",
    days_few: "Atlikušas {n} dienas",
    days_many: "Atlikušas {n} dienas",
    of_total: "{v} no {t}",
    runway: "Līdz tvertne būs tukša",
    at_use: "pie {v}",
    today: "Šodien",
    order_by: "Pasūtīt līdz",
    delivery: "piegāde {n} d",
    empty_on: "Tukšs",
    t_level: "Līmenis",
    t_use: "Patēriņš",
    t_order: "Pasūtīt līdz",
    t_empty: "Tukšs",
    in_days: "pēc {n} d",
    vs_week: "{v} pret pagājušo nedēļu",
    per_day: "{u}/dienā",
    last_30: "Pēdējās 30 dienas",
    used_total: "patērēti {v}",
    refill: "Uzpilde",
    no_history: "Vēl nav pietiekami daudz vēstures, lai novērtētu patēriņu",
    no_tank: "Tvertnes līmeņa sensors nav atrasts",
    ed_entity: "Līmeņa sensors",
    ed_entity_helper: "Līmenis %, tilpums, masa vai attālums no tvertnes augšas līdz virsmai",
    ed_tank_type: "Tvertnes veids",
    ed_type_auto: "Automātiski (pēc sensora)",
    ed_capacity: "Ietilpība",
    ed_capacity_helper: "Litri, vai kilogrami granulām",
    ed_height: "Tvertnes augstums",
    ed_height_helper: "Centimetri, attāluma sensoram",
    ed_reorder_level: "Pasūtīšanas slieksnis",
    ed_reorder_level_helper: "Līmenis (%), pie kura pasūtīt",
    ed_delivery_days: "Piegādes laiks",
    ed_delivery_days_helper: "Dienas starp pasūtījumu un piegādi",
    ed_consumption: "Dienas patēriņa sensors",
    ed_consumption_helper: "Neobligāti: patēriņa dienā sensors; tukšs: aprēķināts pēc līmeņa vēstures",
    ed_days_left: "Atlikušo dienu sensors",
    ed_days_left_helper: "Neobligāti: integrācijas pašas novērtējums (OilFox)",
    ed_show_history: "Pēdējās 30 dienas",
    ed_show_subtitle: "Rādīt apakšvirsrakstu",
    ed_illustration: "Ilustrēta galvene",
    ed_illustration_theme: "Galvenes motīvs",
    ed_theme_auto: "Automātiski (pēc motīva)",
    ed_theme_day: "Diena",
    ed_theme_night: "Nakts",
    ed_animations: "Animācijas",
    ed_title_helper: "Tukšs: tvertnes veids",
  },
  el: {
    type_oil: "Πετρέλαιο θέρμανσης",
    type_propane: "Προπάνιο",
    type_water: "Νερό βροχής",
    type_pellets: "Σιλό πέλλετ",
    st_ok: "Καλό",
    st_order_soon: "Παραγγελία σύντομα",
    st_order_now: "Παραγγελία τώρα",
    st_low: "Χαμηλή στάθμη",
    st_empty: "Σχεδόν άδεια",
    st_offline: "Μη διαθέσιμο",
    days_one: "Απομένει {n} ημέρα",
    days_few: "Απομένουν {n} ημέρες",
    days_many: "Απομένουν {n} ημέρες",
    of_total: "{v} από {t}",
    runway: "Μέχρι να αδειάσει η δεξαμενή",
    at_use: "με {v}",
    today: "Σήμερα",
    order_by: "Παραγγελία έως",
    delivery: "παράδοση {n} ημ.",
    empty_on: "Άδεια",
    t_level: "Στάθμη",
    t_use: "Κατανάλωση",
    t_order: "Παραγγελία έως",
    t_empty: "Άδεια στις",
    in_days: "σε {n} ημ.",
    vs_week: "{v} έναντι προηγούμενης εβδομάδας",
    per_day: "{u}/ημέρα",
    last_30: "Τελευταίες 30 ημέρες",
    used_total: "καταναλώθηκαν {v}",
    refill: "Ανεφοδιασμός",
    no_history: "Δεν υπάρχει ακόμα αρκετό ιστορικό για εκτίμηση της κατανάλωσης",
    no_tank: "Δεν βρέθηκε αισθητήρας στάθμης δεξαμενής",
    ed_entity: "Αισθητήρας στάθμης",
    ed_entity_helper: "Στάθμη σε %, όγκος, μάζα ή η απόσταση από την κορυφή της δεξαμενής έως την επιφάνεια",
    ed_tank_type: "Τύπος δεξαμενής",
    ed_type_auto: "Αυτόματο (από τον αισθητήρα)",
    ed_capacity: "Χωρητικότητα",
    ed_capacity_helper: "Λίτρα, ή κιλά για πέλλετ",
    ed_height: "Ύψος δεξαμενής",
    ed_height_helper: "Εκατοστά, για αισθητήρα απόστασης",
    ed_reorder_level: "Όριο παραγγελίας",
    ed_reorder_level_helper: "Η στάθμη (%) στην οποία γίνεται παραγγελία",
    ed_delivery_days: "Χρόνος παράδοσης",
    ed_delivery_days_helper: "Ημέρες μεταξύ παραγγελίας και παράδοσης",
    ed_consumption: "Αισθητήρας ημερήσιας κατανάλωσης",
    ed_consumption_helper: "Προαιρετικό: αισθητήρας κατανάλωσης ανά ημέρα· κενό: υπολογίζεται από το ιστορικό της στάθμης",
    ed_days_left: "Αισθητήρας υπολειπόμενων ημερών",
    ed_days_left_helper: "Προαιρετικό: η εκτίμηση της ίδιας της ενσωμάτωσης (OilFox)",
    ed_show_history: "Τελευταίες 30 ημέρες",
    ed_show_subtitle: "Εμφάνιση υπότιτλου",
    ed_illustration: "Εικονογραφημένη κεφαλίδα",
    ed_illustration_theme: "Θέμα κεφαλίδας",
    ed_theme_auto: "Αυτόματο (ακολουθεί το θέμα)",
    ed_theme_day: "Ημέρα",
    ed_theme_night: "Νύχτα",
    ed_animations: "Κινούμενα σχέδια",
    ed_title_helper: "Κενό: ο τύπος δεξαμενής",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const rcLang = (i18n, hass, config) => {
  // The full tag when the card has it (sr-Latn), else its base language (fr-FR → fr, pt-BR → pt), else English.
  const l = config?.language || hass?.locale?.language || hass?.language || "en";
  const base = l.split("-")[0];
  return i18n[l] ? l : i18n[base] ? base : "en";
};

const rcT = (i18n, lang, key, vars = {}) => {
  const s = i18n[lang]?.[key] ?? RC_I18N[lang]?.[key] ?? i18n.en[key] ?? RC_I18N.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
};

// Plural key for `n` items: `<base>_one`, `<base>_few` or `<base>_many` (the "other" form), from the CLDR category of
// `n` in `lang` (Serbian 1 / 2-4 / 5+, 21 / 22…). `_few` is optional: without it, `_many` is used. A `_one` text without
// {n} ("Turn this plug off?") only means exactly one.
const rcPluralKey = (i18n, lang, base, n) => {
  let cat;
  try {
    cat = new Intl.PluralRules(lang).select(n);
  } catch {
    cat = n === 1 ? "one" : "other";
  }
  const text = (k) => i18n[lang]?.[k] ?? RC_I18N[lang]?.[k];
  if (cat === "one" && (n === 1 || text(`${base}_one`)?.includes("{n}"))) return `${base}_one`;
  if (cat === "few" && text(`${base}_few`) != null) return `${base}_few`;
  return `${base}_many`;
};

const rcEsc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const rcMoreInfo = (node, entityId) => {
  const ev = new Event("hass-more-info", { bubbles: true, composed: true });
  ev.detail = { entityId };
  node.dispatchEvent(ev);
};

const rcNavigate = (path) => {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
};

// Wires a card header to its `navigation_path`: click, and Enter on the header itself.
const rcBindNav = (head, path) => {
  head.addEventListener("click", () => rcNavigate(path));
  head.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && ev.target === head) rcNavigate(path);
  });
};

// HA's callService already shows a toast when the call fails, then rejects: the rejection is only swallowed here
// so that it does not end up as "Uncaught (in promise)".
const rcCall = (hass, domain, service, data) => Promise.resolve(hass.callService(domain, service, data)).catch(() => {});

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const rcInDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// `fn()`, computed again only when one of `deps` is no longer the same object (or value) as last time.
const rcMemo = (store, key, deps, fn) => {
  const hit = store[key];
  if (hit && hit.deps.length === deps.length && hit.deps.every((d, i) => d === deps[i])) return hit.value;
  const value = fn();
  store[key] = { deps, value };
  return value;
};

// ── Base card ────────────────────────────────────────────────────────────────
class RcCard extends HTMLElement {
  static getStubConfig(hass) {
    const areas = Object.keys(hass?.areas ?? {});
    return { area: areas[0] ?? "" };
  }

  // Subclasses set: static i18n, static defaults, static tag, static styles.
  static getConfigElement() {
    // biome-ignore lint/complexity/noThisInStatic: each subclass opens its own editor.
    return document.createElement(`${this.tag}-editor`);
  }

  setConfig(config) {
    if (this.constructor.needsArea && !config.area && !config.entities?.length && !config.include?.length) {
      throw new Error(rcT(this.constructor.i18n, rcLang(this.constructor.i18n, this._hass, config), "err_config"));
    }
    this._config = { ...this.constructor.defaults, ...config };
    // show_title: the header's title, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    if (!this.shadowRoot) this._attach();
    this._sig = null;
    this._render();
  }

  // The shadow root, and no rewrite of the card between a press anywhere in it and the end of the click: Home
  // Assistant updates the card several times a second, and a rewrite under the pointer replaces the element pressed,
  // so that the click lands on the card itself and does nothing (the tiles already hold it, see _bindPress; this
  // covers the rest: header button, detail button, rows, popup). The pending update is rendered once released.
  _attach() {
    const root = this.attachShadow({ mode: "open" });
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      // After the click, which comes in the same task as the release.
      setTimeout(() => {
        if (this._pressing) this._released();
      }, 0);
    };
    root.addEventListener("pointerdown", (ev) => {
      this._byPointer = true;
      if (ev.button !== 0) return;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    });
    // The focus is kept across rewrites for the keyboard only (no focus ring after a mouse click or a tap).
    root.addEventListener("keydown", () => {
      this._byPointer = false;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    // A press cut short by the detach never gets its release: rendered now, and the next updates too.
    if (this._pressing) this._released();
  }

  set hass(hass) {
    this._hass = hass;
    // No re-render during a drag or a press: it would replace the tile under the finger.
    if (this._dragging || this._pressing) this._deferred = true;
    else this._render();
  }

  // The tiles actually shown (`only_on` / `only_alerts` applied), nothing when the card is hidden.
  getCardSize() {
    if (this.style.display === "none") return 0;
    const n = this._shown ?? this._items?.length ?? 0;
    if (!n || !this._config) return 1;
    // A row of large tiles (`layout: tiles`) is about one and a half rows of compact ones.
    const rows = Math.ceil(n / this._cols());
    return 1 + (this._tiles() ? Math.ceil(rows * 1.5) : rows);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  _lang() {
    return rcLang(this.constructor.i18n, this._hass, this._config);
  }

  _t(key, vars) {
    return rcT(this.constructor.i18n, this._lang(), key, vars);
  }

  // `<base>_one` / `_few` / `_many` for `n`, with {n} filled in.
  _tn(base, n, vars) {
    return this._t(rcPluralKey(this.constructor.i18n, this._lang(), base, n), { ...vars, n });
  }

  _areaName() {
    const c = this._config;
    return c.area ? (this._hass.areas?.[c.area]?.name ?? c.area) : "";
  }

  // Re-render only when something visible changed.
  _changed(parts) {
    const sig = JSON.stringify([this._config, this._lang(), parts]);
    if (sig === this._sig) return false;
    this._sig = sig;
    return true;
  }

  // Subclasses implement `_collect()` (the tiles) and `_draw(items)`.
  _render() {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    this._items = this._collect();
    this._draw(this._items);
  }

  _cols() {
    return Math.min(4, Math.max(1, Number(this._config.columns) || 2));
  }

  // `layout: tiles`: one large tile per entity, the size of Home Assistant's Tile card (easier to tap on a phone).
  _tiles() {
    return this._config?.layout === "tiles";
  }

  _paint(level, head, tiles, extraClass = "") {
    // The tile or control with the keyboard focus keeps it through the redraw (a toggle, a step or a two-tap
    // confirmation from the keyboard): tiles by their data-id, controls by their data-k.
    const active = this._byPointer ? null : this.shadowRoot.activeElement;
    const focused = active?.dataset?.id;
    const focusKey = active?.dataset?.k;
    this.shadowRoot.innerHTML = `
      <style>${RC_BASE_STYLES}${this.constructor.styles}</style>
      <ha-card class="lvl-${level}${extraClass}${this._tiles() ? " layout-tiles" : ""}">
        ${head}
        ${tiles ? `<div class="grid" style="--cols:${this._cols()}">${tiles}</div>` : ""}
        ${this._afterGrid()}
      </ha-card>`;
    const root = this.shadowRoot;
    root.querySelector(".pill.action")?.addEventListener("click", (ev) => this._allOff(ev));
    if (this._config.navigation_path) rcBindNav(root.querySelector(".head"), this._config.navigation_path);
    for (const el of root.querySelectorAll(".tile")) {
      this._bindTile(el, (this._items || []).find((i) => i.id === el.dataset.id));
      if (focused && el.dataset.id === focused) el.focus({ preventScroll: true });
    }
    this._bindAfter(root);
    if (focusKey) root.querySelector(`[data-k="${focusKey}"]`)?.focus({ preventScroll: true });
  }

  // What a card adds under its tiles (the Lights card's scenes), and its event wiring.
  _afterGrid() {
    return "";
  }

  _bindAfter() {}

  // The "turn everything off" button of the header (full card) or of the status (mini card).
  _allOff(ev) {
    ev.stopPropagation();
    const ids = (this._items || []).filter((i) => i.on).map((i) => i.id);
    if (!ids.length) return;
    // A host card may ask first (the Overview confirms before turning plugs off); otherwise off at once.
    if (this._confirmOff) this._confirmOff(ids);
    else rcCall(this._hass, "homeassistant", "turn_off", { entity_id: ids });
  }

  // Tap, hold for more-info, and an optional horizontal drag ({ move(x), end(x), step(delta), flush() }). From the
  // keyboard: Enter / Space tap, Shift+Enter or the context-menu key open the details, ←/→ step the drag by ∓/±10
  // (a held key at most every RC_REPEAT_MS), and releasing the arrow calls `flush`.
  _bindPress(el, { onTap, onHold, drag }) {
    let start = null;
    let mode = null; // null | "hold" | "drag"
    let timer = null;
    let lastStep = 0;
    el.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      start = { x: ev.clientX, y: ev.clientY };
      mode = null;
      this._pressing = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        // The card may have been detached mid-press (nothing else clears this timer): no hold on a dead node.
        if (mode || !this.isConnected) return;
        mode = "hold";
        // The press is settled (no tap): the details may open over the tile, so its pointerup may never come.
        this._released();
        onHold();
      }, RC_HOLD_MS);
    });
    el.addEventListener("pointermove", (ev) => {
      if (!start || mode === "hold") return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!mode && drag && Math.abs(dx) > RC_MOVE_PX && Math.abs(dx) > Math.abs(dy)) {
        mode = "drag";
        clearTimeout(timer);
        this._dragging = true;
        el.setPointerCapture(ev.pointerId);
        el.classList.add("dragging");
      } else if (!mode && (Math.abs(dx) > RC_MOVE_PX || Math.abs(dy) > RC_MOVE_PX)) {
        clearTimeout(timer); // scrolling, or dragging what cannot be dragged: not a tap
        start = null;
        this._released();
      }
      if (mode === "drag") drag.move(ev.clientX);
    });
    const end = (ev, cancelled) => {
      clearTimeout(timer);
      if (!start) return;
      const wasDrag = mode === "drag";
      if (wasDrag) {
        this._dragging = false;
        el.classList.remove("dragging");
        if (!cancelled) drag.end(ev.clientX);
        this._sig = null;
      } else if (!mode && !cancelled) {
        onTap();
      }
      start = null;
      mode = null;
      // After a drag, the next update redraws (the bar keeps the new level until the light reports it).
      this._released(!wasDrag);
    };
    // The mouse leaving the tile mid-press (no capture outside a drag) cancels it: neither a tap nor a hold.
    el.addEventListener("pointerleave", () => {
      if (!start || mode) return;
      clearTimeout(timer);
      start = null;
      this._released();
    });
    el.addEventListener("pointerup", (ev) => end(ev, false));
    el.addEventListener("pointercancel", (ev) => end(ev, true));
    el.addEventListener("contextmenu", (ev) => ev.preventDefault());
    el.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" && ev.shiftKey) || ev.key === "ContextMenu") {
        ev.preventDefault();
        if (!ev.repeat) onHold();
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        if (!ev.repeat) onTap();
      } else if (drag?.step && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
        ev.preventDefault();
        if (ev.repeat && ev.timeStamp - lastStep < RC_REPEAT_MS) return;
        lastStep = ev.timeStamp;
        drag.step(ev.key === "ArrowRight" ? 10 : -10);
      }
    });
    // The arrow released: the stepped level goes out now rather than after the pause.
    el.addEventListener("keyup", (ev) => {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") drag?.flush?.();
    });
  }

  // End of a press: renders now what an update brought during it.
  _released(flush = true) {
    this._pressing = false;
    if (!this._deferred || this._dragging) return;
    this._deferred = false;
    if (flush) this._render();
  }

  // Default tile: tap toggles, hold opens the details.
  _bindTile(el, item) {
    this._bindPress(el, {
      onTap: () => !item?.unavailable && rcCall(this._hass, "homeassistant", "toggle", { entity_id: el.dataset.id }),
      onHold: () => rcMoreInfo(this, el.dataset.id),
    });
  }
}

// ── Mini cards ───────────────────────────────────────────────────────────────
// A mini card shows what its full card (`Base`) shows on two lines: the room badge, title and status, then one chip
// per entity. Its zoom button (top right, `zoom: false` removes it) switches it to the full card and back; a click
// anywhere else brings it back too.
// The subclass implements `_drawMini(items)`, which builds the chips and calls `_paintMini`.
// Zoomed in, everything is shown (`only_alerts` and `hide_when_clear` only apply to the compact view). With
// `alertsOnly`, the compact view always shows only what needs a look (no `only_alerts` option then): quiet entities
// show once zoomed in.
const rcMini = (Base, tag, styles, { alertsOnly = false } = {}) =>
  class extends Base {
    static tag = tag;
    static defaults = (({ only_alerts, ...rest }) => ({ ...rest, ...(alertsOnly ? {} : { only_alerts }), zoom: true }))(
      Base.defaults,
    );
    static styles = `${Base.styles}${RC_MINI_STYLES}${styles}`;

    constructor() {
      super();
      // A click anywhere else brings the card back to its compact view.
      this._onUnzoom = (ev) => {
        if (rcOutside(this, ev)) rcUnzoom(this);
      };
    }

    connectedCallback() {
      super.connectedCallback?.();
      this._unzoom ??= watchOutside(this, this._onUnzoom);
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback?.();
      this._unzoom?.off();
      // Left (another dashboard view, a conditional card hidden): back to the compact view.
      rcUnzoom(this);
    }

    getCardSize() {
      if (this._zoomed) return super.getCardSize();
      return this.style.display === "none" ? 0 : 1;
    }

    getGridOptions() {
      return { columns: 12, min_columns: 6, rows: "auto" };
    }

    _draw(items) {
      const config = this._config;
      // The base card's own filter does the work: off zoomed in, always on in an `alertsOnly` compact view.
      if (this._zoomed) this._config = { ...config, only_alerts: false, hide_when_clear: false };
      else if (alertsOnly) this._config = { ...config, only_alerts: true };
      try {
        if (this._zoomed) super._draw(items);
        else this._drawMini(items);
      } finally {
        this._config = config;
      }
      this._addZoom();
    }

    _paintMini({ level, icon, status, chips, cls = "", allOff = false }) {
      const c = this._config;
      const nav = c.navigation_path;
      // With `allOff` the status is the "turn everything off" button, like the full card's pill.
      const st = allOff
        ? `<button class="st action" title="${rcEsc(this._t("turn_all_off"))}"><ha-icon icon="mdi:power"></ha-icon><span class="pt">${rcEsc(status)}</span></button>`
        : `<span class="st" title="${rcEsc(status)}"><span class="pt">${rcEsc(status)}</span></span>`;
      this.shadowRoot.innerHTML = `
        <style>${RC_BASE_STYLES}${this.constructor.styles}</style>
        <ha-card class="lvl-${level}${cls}">
          <div class="mini">
            <div class="badge" title="${rcEsc(status)}"><ha-icon icon="${rcEsc(icon)}"></ha-icon></div>
            <div class="body">
              <div class="head${nav ? " nav" : ""}"${nav ? ' role="link" tabindex="0"' : ""}>
                <div class="title">${rcEsc(c.title || this._areaName() || this._t("title"))}</div>
                ${st}
              </div>
              <div class="rs">${chips}</div>
            </div>
          </div>
        </ha-card>`;
      const root = this.shadowRoot;
      if (nav) rcBindNav(root.querySelector(".head"), nav);
      root.querySelector(".st.action")?.addEventListener("click", (ev) => this._allOff(ev));
      for (const el of root.querySelectorAll(".r")) el.addEventListener("click", () => rcMoreInfo(this, el.dataset.id));
    }

    // Zoom button at the end of the header, top right in both views, added once per render.
    // Its click is the overviews' (rcZoomClick): stop the tap on the title (navigation_path), toggle, keep the
    // keyboard focus (Enter / Space: no click count) on the button that replaced this one.
    _addZoom() {
      const head = this._config.zoom && this.shadowRoot.querySelector(".head");
      if (!head || head.querySelector(".zoom")) return;
      const button = document.createElement("button");
      button.className = "zoom";
      button.title = this._t(this._zoomed ? "zoom_out" : "zoom_in");
      button.innerHTML = `<ha-icon icon="${rcZoomIcon(this)}"></ha-icon>`;
      button.addEventListener("click", (ev) => rcZoomClick(this, ev));
      head.appendChild(button);
    }
  };

const rcBooleans = (...names) => names.map((name) => ({ name, selector: { boolean: {} } }));

const rcAdvanced = (i18n, lang, ...names) => [
  {
    name: "advanced",
    type: "expandable",
    flatten: true,
    schema: names.map((name) =>
      name === "language"
        ? {
            name,
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "", label: rcT(i18n, lang, "ed_language_auto") },
                  { value: "en", label: "English" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                  { value: "es", label: "Español" },
                  { value: "sr", label: "Српски" },
                  { value: "sr-Latn", label: "Srpski (latinica)" },
                  { value: "it", label: "Italiano" },
                  { value: "nl", label: "Nederlands" },
                  { value: "pt", label: "Português (Portugal)" },
                  { value: "pl", label: "Polski" },
                  { value: "ro", label: "Română" },
                  { value: "da", label: "Dansk" },
                  { value: "sv", label: "Svenska" },
                  { value: "bg", label: "Български" },
                  { value: "ru", label: "Русский" },
                  { value: "uk", label: "Українська" },
                  { value: "hu", label: "Magyar" },
                  { value: "sk", label: "Slovenčina" },
                  { value: "cs", label: "Čeština" },
                  { value: "sl", label: "Slovenščina" },
                  { value: "lv", label: "Latviešu" },
                  { value: "el", label: "Ελληνικά" },
                ],
              },
            },
          }
        : { name, selector: { object: {} } },
    ),
  },
];
// `schema(lang, hass, config)` lists the fields; options left at the card's default are not written to the YAML
// (list defaults such as `exclude: []` are not shown in the form: an empty list is never written anyway).
// `autos` maps an option to its default worked out from the config (`(hass, config) => value`): shown in the form
// while unset, and kept out of the YAML when left at it.
// Entity lists the form edits with an entity picker (ids only): an item written `{ entity, name, icon }` in YAML shows as its entity,
// and gets its name and icon back when the form changes the list (ha-room-card#77).
const RC_ENTITY_LISTS = ["include"];
const rcListIds = (list) => (Array.isArray(list) ? list.map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean) : list);
const rcListKeep = (ids, before) =>
  Array.isArray(ids) ? ids.map((id) => (Array.isArray(before) ? before.find((e) => typeof e === "object" && e?.entity === id) : undefined) ?? id) : ids;

const rcEditor = ({ card, helpers, schema, autos = {} }) => {
  const i18n = card.i18n;
  const defaults = { show_title: true, ...Object.fromEntries(Object.entries(card.defaults).filter(([, v]) => !Array.isArray(v))) };
  return class extends HTMLElement {
    setConfig(config) {
      this._config = config;
      this._update();
    }

    set hass(hass) {
      this._hass = hass;
      this._update();
    }

    _update() {
      if (!this._hass || !this._config) return;
      const lang = rcLang(i18n, this._hass, this._config);
      // Read by the label and helper callbacks, set once on the form: a language change must reach them too.
      this._lang = lang;
      if (!this._form) {
        this._form = document.createElement("ha-form");
        this._form.computeLabel = (s) => rcT(i18n, this._lang, `ed_${s.name}`);
        this._form.computeHelper = (s) =>
          helpers.includes(s.name) ? rcT(i18n, this._lang, `ed_${s.name}_helper`) : undefined;
        this._form.addEventListener("value-changed", (ev) => {
          const config = { ...ev.detail.value };
          for (const k of RC_ENTITY_LISTS) if (k in config) config[k] = rcListKeep(config[k], this._config[k]);
          for (const k of Object.keys(config)) {
            const v = config[k];
            if (v === "" || v == null || (Array.isArray(v) && !v.length) || defaults[k] === v) delete config[k];
          }
          for (const [k, auto] of Object.entries(autos)) {
            const untouched = this._config[k] === undefined && config[k] === auto(this._hass, this._config);
            if (untouched || config[k] === auto(this._hass, config)) delete config[k];
          }
          this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
        });
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      // A new data or schema object re-renders the whole form, and the schema runs the card's discovery:
      // both only change with the config, the language or the registries.
      const memo = (this._memo ||= {});
      const h = this._hass;
      this._form.data = rcMemo(memo, "data", [this._config, h.areas], () => {
        const data = { ...defaults, ...this._config };
        for (const k of RC_ENTITY_LISTS) if (k in data) data[k] = rcListIds(data[k]);
        for (const [k, auto] of Object.entries(autos)) data[k] ??= auto(h, this._config);
        return data;
      });
      this._form.schema = rcMemo(memo, "schema", [lang, this._config, h.entities, h.devices, h.areas], () =>
        schema(lang, h, this._config),
      );
    }
  };
};

const rcRegister = (card, editor, name, description) => {
  if (customElements.get(card.tag)) return;
  customElements.define(card.tag, card);
  customElements.define(`${card.tag}-editor`, editor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: card.tag,
    name,
    description,
    preview: true,
    documentationURL: "https://github.com/juju35/ha-tank-card",
  });
};

if (!customElements.get("tank-card")) {
  console.info(`%c HA-TANK-CARD %c v${RC_VERSION} `, "background:#e8590c;color:#fff;font-weight:700", "");
}

// ── Common styles ────────────────────────────────────────────────────────────
const RC_BASE_STYLES = `
  :host {
    --rc-ok: var(--success-color, #43a047);
    --rc-warn: var(--warning-color, #ffa600);
    --rc-alert: var(--error-color, #db4437);
    --rc-info: var(--info-color, #039be5);
    --rc-light: var(--state-light-active-color, #ffb300);
    --rc-plug: var(--state-switch-on-color, var(--primary-color, #03a9f4));
    --rc-idle: var(--secondary-text-color, #9e9e9e);
    --rc-na: var(--disabled-color, #9e9e9e);
    display: block;
    min-width: 0;
  }
  /* The card answers its own width (container queries). That containment drops its content from its natural width: in
     a wrapper sized by its content (inline-block, a grid's auto column, a flex row: layout-card, button-card…) it would
     shrink to its padding. The empty grid below (no height) gives the host a natural width of 344 px there, as a
     preferred width only: its column is minmax(0, …), so the card still shrinks to its column in a grid card, a
     horizontal stack or a 1fr column, even wrapped in a <div> (hui-card in layout-card). contain-intrinsic-inline-size
     or a min-width in px would be a minimum there, and the card would overflow. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 344px); height: 0; }
  ha-card { padding: 12px; overflow: hidden; container-type: inline-size; }
  ha-card.lvl-alert { box-shadow: 0 0 0 1px color-mix(in srgb, var(--rc-alert) 45%, transparent), var(--ha-card-box-shadow, none); }

  .head { display: flex; align-items: center; gap: 10px; }
  .head.nav { cursor: pointer; }
  .head.nav:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
  .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
           background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
  .badge ha-icon { --mdc-icon-size: 24px; }
  .lvl-alert .badge { animation: rc-pulse 1.6s ease-in-out infinite; }
  /* Narrow header: the title keeps a few letters (never 0 px), the status pill shrinks and ellipsises, the icon buttons
     (zoom, power) never shrink; under 200 px the pill is only its coloured dot, its text kept for screen readers. */
  .title { flex: 1 1 0; min-width: 5ch; font-size: 16px; font-weight: 500; color: var(--primary-text-color);
           white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
           /* show_title: false keeps the title's room (the pill and buttons stay in place) */
  :host([hide-title]) .head > .title { visibility: hidden; }
  .pill { all: unset; flex: 0 1 auto; min-width: 0; box-sizing: border-box; position: relative;
          display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 500;
          padding: 1px 8px; border-radius: 999px; background: color-mix(in srgb, var(--c) 14%, transparent);
          /* Coloured text is half the accent, half the text colour: 4.5:1 on its tint in light and dark themes, where
             the bare accent (amber above all) is not. */
          color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color, #212121)); }
  .pt { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pill ha-icon { flex: none; }
  /* A card this narrow (6 columns of the Sections view on a phone): the title is at its few letters already, so the
     status pill goes to a line of its own under it, where its whole label fits, rather than end with "…". */
  @container (max-width: 260px) {
    .head { flex-wrap: wrap; row-gap: 4px; }
    .head::after { content: ""; order: 1; flex: 1 0 100%; }
    .head > .pill { order: 2; margin-left: 50px; max-width: calc(100% - 50px); }
  }
  @container (max-width: 200px) {
    /* Under 200 px the pill is only its dot again: back on the title's line. */
    .head { flex-wrap: nowrap; }
    .head::after { content: none; }
    .head > .pill { order: 0; margin-left: 0; max-width: none; }
    .head > .pill .pt, .st .pt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .head > .pill:not(.action), .st { flex: none; padding: 0; width: 18px; height: 18px; justify-content: center; background: none; }
    .head > .pill:not(.action)::before, .st::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
    .head > .pill.action { padding: 1px 4px; }
    /* A full card this narrow (6 columns of the Sections view on a phone): a smaller badge, no side chip in the header. */
    .head { gap: 6px; }
    .head > .badge { width: 32px; height: 32px; }
    .head > .badge ha-icon { --mdc-icon-size: 20px; }
    .head > .chip { display: none; }
  }
  .pill.action { cursor: pointer; }
  .pill.action:hover { background: color-mix(in srgb, var(--c) 24%, transparent); }
  .pill.action:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .pill ha-icon { --mdc-icon-size: 12px; margin-left: -2px; }

  .grid { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
  .tile { all: unset; position: relative; overflow: hidden; box-sizing: border-box; cursor: pointer; min-width: 0;
          display: flex; align-items: center; gap: 8px; padding: 5px 8px 5px 5px; border-radius: 10px;
          touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
          background: color-mix(in srgb, var(--t) 9%, var(--secondary-background-color, transparent));
          border: 1px solid color-mix(in srgb, var(--t) 22%, transparent); transition: background .2s, border-color .2s; }
  .tile.off, .tile.na { background: var(--secondary-background-color, transparent); border-color: transparent; }
  .tile.na { --t: var(--rc-na); opacity: .7; }
  .tile:hover { background: color-mix(in srgb, var(--t) 15%, var(--secondary-background-color, transparent)); }
  .tile:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .ic, .txt { position: relative; }
  .ic { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
        color: var(--t); background: color-mix(in srgb, var(--t) 20%, transparent); }
  .ic ha-icon { --mdc-icon-size: 16px; }
  .txt { display: flex; flex-direction: column; min-width: 0; }
  .name { font-size: 13px; font-weight: 500; line-height: 1.2; color: var(--primary-text-color);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* A reading is never cut: on a narrow tile it goes on to a second line (the name, a label, keeps its ellipsis). */
  .state { font-size: 11px; line-height: 1.2; color: var(--secondary-text-color); overflow-wrap: break-word; }
  /* A card this narrow (a phone, 6 columns of the Sections view): one tile per row, whatever the columns option. */
  @container (max-width: 260px) { .grid { grid-template-columns: minmax(0, 1fr); } }
  /* layout: tiles — the size of Home Assistant's Tile card — 56 px high, a 40 px icon, the name over the state. */
  .layout-tiles .grid { gap: 8px; }
  .layout-tiles .tile { min-height: 56px; gap: 10px; padding: 8px 10px 8px 8px; border-radius: 12px; }
  .layout-tiles .ic { width: 40px; height: 40px; }
  .layout-tiles .ic ha-icon { --mdc-icon-size: 24px; }
  .layout-tiles .txt { gap: 2px; }
  .layout-tiles .name { font-size: 14px; line-height: 1.25; }
  .layout-tiles .state { font-size: 12px; line-height: 1.25; }

  @keyframes rc-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
  @keyframes rc-pulse { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 45%, transparent) }
                        50% { box-shadow: 0 0 0 7px transparent } }
  @media (prefers-reduced-motion: reduce) { .tile, .lvl-alert .badge { animation: none; transition: none; } }
`;

// Mini cards: layout, chips and zoom button. A chip is plain (icon and text) until it needs a look: then a tinted pill.
// The zoom / detail button of the mini cards and the overviews.
const RC_ZOOM_STYLES = `
  /* 40 px to tap, laid out as the 24 px it looks (the negative margins). */
  .zoom { all: unset; flex: none; cursor: pointer; width: 40px; height: 40px; margin: -12px -12px -12px -8px; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom ha-icon { --mdc-icon-size: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--rc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
`;

const RC_MINI_STYLES = `${RC_ZOOM_STYLES}
  /* The badge sits 12px from the card's top-left corner, like the other ha-* cards, beside the title and the readings. */
  ha-card:has(.mini) { padding: 12px; }
  .mini { display: flex; align-items: flex-start; gap: 10px; }
  /* The badge keeps the full card's size (40 px, icon 24 px): the body is at least as tall, a lone title line centred
     beside it. */
  .body { flex: 1; min-width: 0; min-height: 40px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
  .mini .head { gap: 8px; }
  .mini .title { line-height: 1.25; }
  .st { flex: 0 1 auto; min-width: 0; position: relative; display: inline-flex; align-items: center;
        margin-left: auto; font-size: 11px; font-weight: 500; color: var(--c); }
  .rs { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-left: -4px; }
  .rs:empty { display: none; }
  /* A chip never runs past the card: a long name ends with an ellipsis. */
  .r { all: unset; cursor: pointer; display: inline-flex; align-items: baseline; gap: 1px; padding: 0 5px 0 4px;
       box-sizing: border-box; min-width: 0; max-width: 100%; overflow: hidden;
       border-radius: 999px; font-size: 12px; font-weight: 500; line-height: 24px; white-space: nowrap; --t: var(--rc-ok);
       color: var(--primary-text-color); }
  .r ha-icon { --mdc-icon-size: 13px; flex: none; color: var(--t); align-self: center; margin-right: 2px; }
  .r > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .r.pill { color: color-mix(in srgb, var(--t) 50%, var(--primary-text-color, #212121)); background: color-mix(in srgb, var(--t) 14%, transparent); }
  .r:hover { background: color-mix(in srgb, var(--t) 20%, var(--secondary-background-color, transparent)); }
  .r:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
`;
