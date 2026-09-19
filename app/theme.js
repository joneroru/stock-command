import { NOTE_PALETTE_DARK, NOTE_PALETTE_LIGHT } from "./constants.js";

export var THEME_STORAGE_KEY = "stock-command-theme";

export function getAppTheme() {
  try {
    var stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("stocky-theme");
    return stored === "light" ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
}

export function isLightTheme() {
  return getAppTheme() === "light";
}

export function setAppTheme(theme) {
  var t = theme === "light" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, t);
  } catch (e) {}
  applyAppTheme(t);
}

export function toggleAppTheme() {
  var next = isLightTheme() ? "dark" : "light";
  setAppTheme(next);
  return next;
}

export function applyAppTheme(theme) {
  var t = theme || getAppTheme();
  if (t === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }
}

export function getNotePalette(colorKey) {
  var isLight = isLightTheme();
  var pal = isLight ? NOTE_PALETTE_LIGHT : NOTE_PALETTE_DARK;
  return pal[colorKey] || pal.none;
}
