import { state, ui, save, blankStyle, newShop } from "./state.js";
import { render } from "./render/index.js";
import {
  cellKey, reindexAfterRemoval, formatColorName, formatSizeName,
  resolveColorHex, itemCount, buildSummary, cryptoId
} from "./helpers.js";
import { STATE_OK, STATE_LOW, STATE_CRIT } from "./constants.js";

export function activeShop() {
    if (!state || !state.shops || !state.shops.length) return null;
    var found = state.shops.filter(function (sh) { return sh.id === state.activeShopId; })[0];
    return found || state.shops[0];
  }
export function pageData(shop) {
    shop = shop || activeShop();
    return { styles: (shop && shop.styles) || [] };
  }
export function activeStyle() {
    var sh = activeShop();
    if (!sh || !sh.styles || !sh.styles.length) return null;
    var list = sh.styles;
    var found = list.filter(function (s) { return s.id === sh.activeStyleId; })[0];
    return found || list[0];
  }
export function field() { return (state && state.activePage === "quick") ? "cells" : "counts"; }

export function updateStyle(styleId, fn) {
    var sh = activeShop();
    sh.styles = sh.styles.map(function (s) { return s.id === styleId ? fn(s) : s; });
    save();
  }

  // ---- Quick Check Cycling ----
export function cycleCell(styleId, ci, si) {
    var next;
    updateStyle(styleId, function (s) {
      var key = cellKey(ci, si);
      var cur = s.cells[key] === undefined ? STATE_OK : s.cells[key];
      next = (cur + 1) % 3;
      var cells = Object.assign({}, s.cells);
      if (next === STATE_OK) delete cells[key]; else cells[key] = next;
      return Object.assign({}, s, { cells: cells });
    });
    return next;
  }

  // ---- Actual Count Logic ----
export function incCount(styleId, ci, si) {
    var newCount;
    updateStyle(styleId, function (s) {
      var key = cellKey(ci, si);
      var cur = s.counts ? s.counts[key] : undefined;
      var counts = Object.assign({}, s.counts || {});
      if (cur === undefined) {
        counts[key] = 1;
      } else {
        counts[key] = cur + 1;
      }
      newCount = counts[key];
      return Object.assign({}, s, { counts: counts });
    });
    return newCount;
  }
export function decCount(styleId, ci, si) {
    var newCount;
    updateStyle(styleId, function (s) {
      var key = cellKey(ci, si);
      var cur = s.counts ? s.counts[key] : undefined;
      var counts = Object.assign({}, s.counts || {});
      if (cur === undefined) {
        newCount = undefined;
        return s; // Already empty (-)
      } else if (cur === 0) {
        delete counts[key]; // Revert 0 -> - (default, empty)
        newCount = undefined;
      } else {
        counts[key] = cur - 1; // e.g. 2 -> 1, 1 -> 0
        newCount = counts[key];
      }
      return Object.assign({}, s, { counts: counts });
    });
    return newCount;
  }
export function setCountManual(styleId, ci, si, raw) {
    updateStyle(styleId, function (s) {
      var key = cellKey(ci, si);
      var counts = Object.assign({}, s.counts || {});
      var trimmed = String(raw).trim();
      if (trimmed === "" || trimmed === "-") {
        delete counts[key];
      } else {
        var n = Math.floor(Number(trimmed));
        if (!isNaN(n) && n >= 0) {
          counts[key] = n;
        }
      }
      return Object.assign({}, s, { counts: counts });
    });
  }

  // ---- Style Management ----
export function renameStyle(styleId, newName) {
    var trimmed = newName.trim(); if (!trimmed) return;
    updateStyle(styleId, function (s) { return Object.assign({}, s, { name: trimmed.toUpperCase() }); });
  }
export function moveStyle(styleId, dir) {
    var sh = activeShop();
    var arr = sh.styles.slice();
    var idx = arr.findIndex(function (s) { return s.id === styleId; });
    var target = idx + dir;
    if (idx === -1 || target < 0 || target >= arr.length) return;
    var tmp = arr[idx]; arr[idx] = arr[target]; arr[target] = tmp;
    sh.styles = arr; save();
  }
export function addStyleObj(name) {
    var trimmed = name.trim(); if (!trimmed) return;
    var sh = activeShop();
    var base = blankStyle();
    base.name = trimmed.toUpperCase();
    sh.styles.push(base);
    sh.activeStyleId = base.id;
    save();
  }
export function removeStyle(styleId) {
    var sh = activeShop();
    var remaining = sh.styles.filter(function (s) { return s.id !== styleId; });
    sh.styles = remaining;
    if (sh.activeStyleId === styleId) sh.activeStyleId = remaining.length ? remaining[0].id : null;
    save();
  }
export function clearAll(styleId) {
    var f = field();
    updateStyle(styleId, function (s) { var copy = Object.assign({}, s); copy[f] = {}; return copy; });
  }
export function clearAllStyles(customField) {
    var f = customField || field();
    var sh = activeShop();
    if (!sh || !sh.styles) return;
    sh.styles.forEach(function (s) {
      s[f] = {};
    });
    save();
  }

  // ---- Color Management ----
export function addColor(styleId, name) {
    var formatted = formatColorName(name);
    if (!formatted) return;
    updateStyle(styleId, function (s) {
      if (s.colors.indexOf(formatted) !== -1) return s;
      return Object.assign({}, s, { colors: s.colors.concat([formatted]) });
    });
  }
export function setColorHex(styleId, ci, hex) {
    updateStyle(styleId, function (s) {
      var colorHexes = Object.assign({}, s.colorHexes || {});
      if (!hex) {
        delete colorHexes[ci];
      } else {
        var clean = hex.trim();
        if (clean.charAt(0) !== "#") clean = "#" + clean;
        colorHexes[ci] = clean;
      }
      return Object.assign({}, s, { colorHexes: colorHexes });
    });
  }
export function ensureColorHex(styleId, newColor) {
    var sh = activeShop();
    var s = (sh && sh.styles ? sh.styles : []).find(function (x) { return x.id === styleId; });
    if (!s) return;
    var ci = s.colors.indexOf(newColor);
    if (ci !== -1 && (!s.colorHexes || !s.colorHexes[ci])) {
      var hex = resolveColorHex(newColor, ci, s);
      if (hex) setColorHex(styleId, ci, hex);
    }
  }
export function removeColor(styleId, ci) {
    updateStyle(styleId, function (s) {
      var copy = Object.assign({}, s);
      copy.colors = s.colors.filter(function (_, i) { return i !== ci; });
      copy.cells = reindexAfterRemoval(s.cells, ci, 0);
      copy.counts = reindexAfterRemoval(s.counts, ci, 0);
      
      var newHexes = {};
      if (s.colorHexes) {
        Object.keys(s.colorHexes).forEach(function (k) {
          var idx = Number(k);
          if (idx === ci) return;
          var newIdx = idx > ci ? idx - 1 : idx;
          newHexes[newIdx] = s.colorHexes[k];
        });
      }
      copy.colorHexes = newHexes;
      return copy;
    });
  }
export function renameColor(styleId, ci, newName) {
    var formatted = formatColorName(newName);
    if (!formatted) return;
    updateStyle(styleId, function (s) {
      var colors = s.colors.slice(); colors[ci] = formatted;
      return Object.assign({}, s, { colors: colors });
    });
  }

function swapCellAxis(map, axisIdx, fromIdx, toIdx) {
  var newMap = {};
  Object.keys(map || {}).forEach(function (k) {
    var parts = k.split(":").map(Number);
    if (axisIdx === 0) {
      var curCi = parts[0], si = parts[1];
      var newCi = curCi;
      if (curCi === fromIdx) newCi = toIdx; else if (curCi === toIdx) newCi = fromIdx;
      newMap[cellKey(newCi, si)] = map[k];
    } else {
      var ci = parts[0], curSi = parts[1];
      var newSi = curSi;
      if (curSi === fromIdx) newSi = toIdx; else if (curSi === toIdx) newSi = fromIdx;
      newMap[cellKey(ci, newSi)] = map[k];
    }
  });
  return newMap;
}

export function moveColor(styleId, ci, dir) {
    updateStyle(styleId, function (s) {
      var target = ci + dir;
      if (target < 0 || target >= s.colors.length) return s;
      var colors = s.colors.slice();
      var tmp = colors[ci]; colors[ci] = colors[target]; colors[target] = tmp;
      var newHexes = Object.assign({}, s.colorHexes || {});
      var hexCi = newHexes[ci];
      var hexTarget = newHexes[target];
      if (hexTarget !== undefined) newHexes[ci] = hexTarget; else delete newHexes[ci];
      if (hexCi !== undefined) newHexes[target] = hexCi; else delete newHexes[target];

      return Object.assign({}, s, {
        colors: colors,
        cells: swapCellAxis(s.cells, 0, ci, target),
        counts: swapCellAxis(s.counts, 0, ci, target),
        colorHexes: newHexes
      });
    });
  }

  // ---- Size Management ----
export function addSize(styleId, name) {
    var formatted = formatSizeName(name);
    if (!formatted) return;
    updateStyle(styleId, function (s) {
      if (s.sizes.indexOf(formatted) !== -1) return s;
      return Object.assign({}, s, { sizes: s.sizes.concat([formatted]) });
    });
  }
export function removeSize(styleId, si) {
    updateStyle(styleId, function (s) {
      var copy = Object.assign({}, s);
      copy.sizes = s.sizes.filter(function (_, i) { return i !== si; });
      copy.cells = reindexAfterRemoval(s.cells, si, 1);
      copy.counts = reindexAfterRemoval(s.counts, si, 1);
      return copy;
    });
  }
export function renameSize(styleId, si, newName) {
    var formatted = formatSizeName(newName);
    if (!formatted) return;
    updateStyle(styleId, function (s) {
      var sizes = s.sizes.slice(); sizes[si] = formatted;
      return Object.assign({}, s, { sizes: sizes });
    });
  }
export function moveSize(styleId, si, dir) {
    updateStyle(styleId, function (s) {
      var target = si + dir;
      if (target < 0 || target >= s.sizes.length) return s;
      var sizes = s.sizes.slice();
      var tmp = sizes[si]; sizes[si] = sizes[target]; sizes[target] = tmp;
      return Object.assign({}, s, {
        sizes: sizes,
        cells: swapCellAxis(s.cells, 1, si, target),
        counts: swapCellAxis(s.counts, 1, si, target)
      });
    });
  }

  // ---- Shop Management ----
export function renameShop(shopId, newName) {
    var trimmed = newName.trim(); if (!trimmed) return;
    state.shops = state.shops.map(function (sh) { return sh.id === shopId ? Object.assign({}, sh, { name: trimmed }) : sh; });
    save();
  }
export function moveShop(shopId, dir) {
    var arr = state.shops.slice();
    var idx = arr.findIndex(function (sh) { return sh.id === shopId; });
    var target = idx + dir;
    if (idx === -1 || target < 0 || target >= arr.length) return;
    var tmp = arr[idx]; arr[idx] = arr[target]; arr[target] = tmp;
    state.shops = arr; save();
  }
export function addShopObj(name) {
    var trimmed = name.trim(); if (!trimmed) return;
    var sh = newShop(trimmed);
    state.shops.push(sh);
    state.activeShopId = sh.id;
    save();
  }
export function removeShop(shopId) {
    if (state.shops.length <= 1) return;
    var remaining = state.shops.filter(function (sh) { return sh.id !== shopId; });
    state.shops = remaining;
    if (state.activeShopId === shopId) state.activeShopId = remaining[0].id;
    save();
  }

  // ---------- History Log Actions ----------
export function saveSnapshot() {
    var shop = activeShop(), page = (state && state.activePage) || "quick";
    var count = itemCount(shop, page);

    // (10) Prevent saving to history if no changes or items were recorded
    if (!count || count === 0) {
      ui.snapshotLabel = "NO ITEMS!";
      var btnLabelEl = document.getElementById("snapshot-btn-label");
      if (btnLabelEl) btnLabelEl.textContent = ui.snapshotLabel;
      else render();
      setTimeout(function () {
        ui.snapshotLabel = "SAVE TO HISTORY";
        var el = document.getElementById("snapshot-btn-label");
        if (el) el.textContent = ui.snapshotLabel;
      }, 1500);
      return;
    }

    var todayStr = new Date().toISOString().slice(0, 10);
    var newSummary = buildSummary(shop, page);

    if (!state.history) state.history = [];
    
    // Check if an entry for this exact shop, page, and date already exists
    var existingIdx = state.history.findIndex(function (e) {
      return e.shopId === shop.id && e.page === page && e.date === todayStr;
    });

    if (existingIdx !== -1) {
      state.history[existingIdx].summaryText = newSummary;
      state.history[existingIdx].itemCount = count;
      state.history[existingIdx].savedAt = new Date().toISOString();
      state.history[existingIdx].shopName = shop.name;
    } else {
      var entry = {
        id: cryptoId(),
        date: todayStr,
        savedAt: new Date().toISOString(),
        shopId: shop.id,
        shopName: shop.name,
        page: page,
        itemCount: count,
        summaryText: newSummary
      };
      state.history.unshift(entry);
    }
    save();
    ui.snapshotLabel = "SAVED ✓";
    render();
    setTimeout(function () {
      ui.snapshotLabel = "SAVE TO HISTORY";
      var el = document.getElementById("snapshot-btn-label");
      if (el) el.textContent = ui.snapshotLabel;
    }, 1500);
  }

export function removeHistoryEntry(entryId) {
    state.history = (state.history || []).filter(function (e) { return e.id !== entryId; });
    save();
  }

export function removeHistoryDateGroup(date) {
    state.history = (state.history || []).filter(function (e) { return e.date !== date; });
    save();
  }

export function renameHistoryDate(entryId, newDate) {
    var trimmed = newDate.trim(); if (!trimmed) return;
    state.history = (state.history || []).map(function (e) { return e.id === entryId ? Object.assign({}, e, { date: trimmed }) : e; });
    save();
  }

export function renameHistoryDateGroup(oldDate, newDate) {
    var trimmed = newDate.trim(); if (!trimmed) return;
    state.history = (state.history || []).map(function (e) { return e.date === oldDate ? Object.assign({}, e, { date: trimmed }) : e; });
    save();
  }
