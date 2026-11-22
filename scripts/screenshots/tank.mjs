// Renders the tank cards with mock tanks and saves the README screenshots.
// Usage: npm install && npm run build && node scripts/screenshots/tank.mjs
import { pair, shoot } from "./harness.mjs";
import { pageScript, setup } from "./mock.mjs";

// Stills: animations: false stills the liquid's surface, so a capture only changes when the card does.
const still = (file, s) => pair(file, { ...s, config: { animations: false, ...s.config } });
const scenes = ["oil", "oil_soon", "pellets", "propane", "water", "empty", "history"].flatMap((scene) => still(scene, { scene }));
await shoot({ prefix: "tank", tag: "tank-card", shots: [...scenes, ...still("narrow", { scene: "oil", width: 300 })], setup, ws: pageScript() });
await shoot({
  prefix: "tank-mini",
  tag: "tank-mini-card",
  shots: [...still("oil", { scene: "oil" }), ...still("pellets", { scene: "pellets" }), ...still("zoom", { scene: "oil", open: ".zoom" })],
  setup,
  ws: pageScript(),
});
