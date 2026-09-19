import { initEvents } from "./events.js";
import { applyAppTheme } from "./theme.js";
import { initAuthGate } from "./auth.js";

applyAppTheme();

document.getElementById("app-root").innerHTML =
  '<div style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--bg);">' +
  '<div style="font-family:var(--font-mono);color:var(--ink-muted);font-size:12px;letter-spacing:.08em;">INITIALIZING COMMAND CENTER...</div></div>';

initEvents();

// Auth Gate: Checks session before calling loadFromCloud() or showing the app
initAuthGate();
