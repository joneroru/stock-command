import { state, setState, ui, cacheLocally, saveToCloud, migrateState, save, saveCountSearchPreference } from "./state.js";
import { render } from "./render/index.js";
import { activeShop, pageData } from "./actions.js";
import { STATE_CRIT, STATE_LOW } from "./constants.js";

export function cryptoId() { return Math.random().toString(36).slice(2, 9); }
export function cellKey(ci, si) { return ci + ":" + si; }
export function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }


export function formatNoteDate(d) {
    var dt = d ? new Date(d) : new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[dt.getMonth()] + " " + dt.getDate();
  }

export function createNoteObj(type, initialBody) {
    var isChecklist = (type === "checklist");
    return {
      id: cryptoId(),
      title: "",
      text: isChecklist ? undefined : (initialBody || ""),
      items: isChecklist ? [] : undefined,
      color: "none",
      trackable: true,
      done: false,
      date: formatNoteDate(new Date()),
      createdAt: Date.now()
    };
  }

export function isNoteCompletelyEmpty(n) {
    if (!n) return true;
    var hasTitle = !!(n.title && n.title.trim().length > 0);
    if (hasTitle) return false;
    if (Array.isArray(n.items)) {
      return !n.items.some(function (it) { return it && it.text && it.text.trim().length > 0; });
    }
    return !(n.text && n.text.trim().length > 0);
  }

export function parseCountSearchTerms(query) {
    if (!query || typeof query !== "string") return [];
    return query
      .split(",")
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(function (t) { return t.length > 0; });
  }

export function getActiveCountSearchTerms() {
    var terms = [];
    var seen = {};
    (ui.countSearchChips || []).forEach(function (c) {
      var trimmed = String(c || "").trim();
      var lower = trimmed.toLowerCase();
      if (trimmed && !seen[lower]) {
        seen[lower] = true;
        terms.push(lower);
      }
    });
    var typed = String(ui.countSearchInputText || "").trim();
    if (typed && !typed.toLowerCase().startsWith("excluded:")) {
      var parts = typed.split(",").map(function (p) { return p.trim().toLowerCase(); }).filter(Boolean);
      parts.forEach(function (p) {
        if (!seen[p]) {
          seen[p] = true;
          terms.push(p);
        }
      });
    }
    return terms;
  }

export function getActiveCountExclusionTerms() {
    var terms = [];
    var seen = {};
    (ui.countSearchExclusionChips || []).forEach(function (c) {
      var trimmed = String(c || "").trim();
      var lower = trimmed.toLowerCase();
      if (trimmed && !seen[lower]) {
        seen[lower] = true;
        terms.push(lower);
      }
    });
    var typed = String(ui.countSearchInputText || "").trim();
    if (typed && typed.toLowerCase().startsWith("excluded:")) {
      var after = typed.slice(9);
      var parts = after.split(",").map(function (p) { return p.trim().toLowerCase(); }).filter(Boolean);
      parts.forEach(function (p) {
        if (!seen[p]) {
          seen[p] = true;
          terms.push(p);
        }
      });
    }
    return terms;
  }

export function getActiveCountSearch() {
    return {
      inclusions: getActiveCountSearchTerms(),
      exclusions: getActiveCountExclusionTerms()
    };
  }

export function syncCountSearchQuery() {
    var inc = getActiveCountSearchTerms();
    var ex = getActiveCountExclusionTerms();
    var parts = [];
    if (inc.length > 0) parts.push(inc.join(", "));
    if (ex.length > 0) parts.push("excluded:" + ex.join(","));
    ui.countSearchQuery = parts.join(" | ");
    saveCountSearchPreference();
  }

export function addSearchChip(term) {
    var trimmed = String(term || "").trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase().startsWith("excluded:")) {
      addExclusionChip(trimmed);
      return;
    }
    var lower = trimmed.toLowerCase();
    if (!ui.countSearchChips) ui.countSearchChips = [];
    var exists = ui.countSearchChips.some(function (c) {
      return c.toLowerCase().trim() === lower;
    });
    if (!exists) {
      ui.countSearchChips.push(trimmed);
    }
    if (ui.countSearchExclusionChips && ui.countSearchExclusionChips.length > 0) {
      ui.countSearchExclusionChips = ui.countSearchExclusionChips.filter(function (c) {
        return c.toLowerCase().trim() !== lower;
      });
    }
    saveCountSearchPreference();
  }

export function addExclusionChip(term) {
    var trimmed = String(term || "").trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase().startsWith("excluded:")) {
      trimmed = trimmed.slice(9).trim();
    }
    if (!trimmed) return;
    var lower = trimmed.toLowerCase();
    if (!ui.countSearchExclusionChips) ui.countSearchExclusionChips = [];
    var exists = ui.countSearchExclusionChips.some(function (c) {
      return c.toLowerCase().trim() === lower;
    });
    if (!exists) {
      ui.countSearchExclusionChips.push(trimmed);
    }
    if (ui.countSearchChips && ui.countSearchChips.length > 0) {
      ui.countSearchChips = ui.countSearchChips.filter(function (c) {
        return c.toLowerCase().trim() !== lower;
      });
    }
    saveCountSearchPreference();
  }

export function colorMatchesSearch(colorName, inclusionTerms, exclusionTerms) {
    var nameLower = (colorName || "").toLowerCase().trim();
    var nameNoSpaces = nameLower.replace(/\s+/g, "");

    // 1. Exclusion matching: case-insensitive AND space-stripped
    if (exclusionTerms && exclusionTerms.length > 0) {
      var isExcluded = exclusionTerms.some(function (ex) {
        var exLower = (ex || "").toLowerCase().trim();
        var exNoSpaces = exLower.replace(/\s+/g, "");
        if (!exLower) return false;
        return nameLower.indexOf(exLower) !== -1 || (exNoSpaces && nameNoSpaces.indexOf(exNoSpaces) !== -1);
      });
      if (isExcluded) return false;
    }

    // 2. Inclusion matching: case-insensitive substring
    if (inclusionTerms && inclusionTerms.length > 0) {
      return inclusionTerms.some(function (inc) {
        var incLower = (inc || "").toLowerCase().trim();
        if (!incLower) return false;
        return nameLower.indexOf(incLower) !== -1;
      });
    }

    // If only exclusions were specified and it didn't match any exclusion, show it
    return true;
  }

export function getShopUniqueColors(pd) {
    var colors = [];
    var seen = {};
    if (!pd || !pd.styles) return colors;
    pd.styles.forEach(function (st) {
      (st.colors || []).forEach(function (cName, ci) {
        var trimmed = String(cName || "").trim();
        if (!trimmed) return;
        var lower = trimmed.toLowerCase();
        var hex = (st.colorHexes && st.colorHexes[ci]) ? st.colorHexes[ci] : null;
        if (!seen[lower]) {
          var entry = { name: trimmed, hex: hex || resolveColorHex(trimmed, null, null), hasCustom: Boolean(hex) };
          seen[lower] = entry;
          colors.push(entry);
        } else if (hex && !seen[lower].hasCustom) {
          seen[lower].hex = hex;
          seen[lower].hasCustom = true;
        }
      });
    });
    return colors;
  }

export function reindexAfterRemoval(map, removedIdx, axis) {
    var result = {};
    Object.keys(map || {}).forEach(function (k) {
      var parts = k.split(":").map(Number), ci = parts[0], si = parts[1];
      var idx = axis === 0 ? ci : si;
      if (idx === removedIdx) return;
      var newCi = axis === 0 ? (ci > removedIdx ? ci - 1 : ci) : ci;
      var newSi = axis === 1 ? (si > removedIdx ? si - 1 : si) : si;
      result[cellKey(newCi, newSi)] = map[k];
    });
    return result;
  }

  // Helper to format Color names (Title Case: First letter of each word capitalized, rest lowercase, e.g. "Emerald Green", "Black", "Off White")
export function formatColorName(str) {
    if (!str) return "";
    var words = str.trim().split(/\s+/);
    return words.map(function (w) {
      if (!w) return "";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(" ");
  }

  // Helper to format Size names (Always UPPERCASE, e.g. "M", "L", "XL", "2XL", "ONE SIZE")
export function formatSizeName(str) {
    if (!str) return "";
    return str.trim().toUpperCase();
  }

  // ---------- Summary Builder with Columnar Alignment & Grid Order ----------
export function buildSummary(shop, page) {
    shop = shop || activeShop(); page = page || (state && state.activePage) || "quick";
    var lines = [];
    var pd = pageData(shop, page);
    var todayStr = new Date().toISOString().slice(0, 10);
    pd.styles.forEach(function (s) {
      if (page === "quick") {
        var items = [];
        // Traverse strictly in row-major matrix order: color rows top-to-bottom, size columns left-to-right
        s.colors.forEach(function (color, ci) {
          s.sizes.forEach(function (size, si) {
            var k = cellKey(ci, si);
            var v = s.cells ? s.cells[k] : undefined;
            if (v === STATE_CRIT) {
              items.push({ text: color + " / " + size, tag: "[OUT]", isCrit: true });
            } else if (v === STATE_LOW) {
              items.push({ text: color + " / " + size, tag: "[LOW]", isCrit: false });
            }
          });
        });
        if (items.length === 0) return;

        // Calculate max item width for column alignment
        var maxLen = 0;
        items.forEach(function (it) { if (it.text.length > maxLen) maxLen = it.text.length; });
        var targetCol = Math.max(14, maxLen + 3);

        lines.push(s.name);
        items.forEach(function (it) {
          var padded = it.text;
          while (padded.length < targetCol) padded += " ";
          lines.push("  " + padded + it.tag);
        });
        lines.push("");
      } else {
        var items = [];
        // Traverse strictly in row-major matrix order: color rows top-to-bottom, size columns left-to-right
        s.colors.forEach(function (color, ci) {
          s.sizes.forEach(function (size, si) {
            var k = cellKey(ci, si);
            var v = s.counts ? s.counts[k] : undefined;
            if (v !== undefined && typeof v === "number") {
              items.push({ text: color + " - " + size, count: v });
            }
          });
        });
        if (items.length === 0) return;

        var maxLen = 0;
        items.forEach(function (it) { if (it.text.length > maxLen) maxLen = it.text.length; });
        var targetCol = Math.max(14, maxLen + 2);

        lines.push(s.name);
        items.forEach(function (it) {
          var padded = it.text + ":";
          while (padded.length < targetCol + 1) padded += " ";
          lines.push("  " + padded + it.count + " pcs");
        });
        lines.push("");
      }
    });
    if (lines.length === 0) return page === "quick" ? "No low or out-of-stock items flagged yet." : "No counts recorded yet.";
    var shopName = (shop && shop.name) ? shop.name : "Shop";
    var header = "SHOP: " + shopName + "\nDATE: " + todayStr + "\n";
    return header + "\n" + lines.join("\n").trim();
  }

  // ---------- Activity Time Formatter for Home Page ----------
export function formatActivityTime(entry) {
    var now = new Date();
    var savedDate = null;
    if (entry.savedAt) {
      savedDate = new Date(entry.savedAt);
    } else if (entry.date) {
      savedDate = new Date(entry.date + "T12:00:00");
    }

    var timeStr = "";
    if (savedDate && !isNaN(savedDate.getTime())) {
      var hours = savedDate.getHours();
      var mins = savedDate.getMinutes();
      var hh = (hours < 10 ? "0" : "") + hours;
      var mm = (mins < 10 ? "0" : "") + mins;
      timeStr = hh + ":" + mm;
    }

    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth();
    var nowDate = now.getDate();

    var entryYear = savedDate ? savedDate.getFullYear() : null;
    var entryMonth = savedDate ? savedDate.getMonth() : null;
    var entryDay = savedDate ? savedDate.getDate() : null;

    var dayLabel = "";
    if (savedDate && entryYear === nowYear && entryMonth === nowMonth && entryDay === nowDate) {
      dayLabel = "Today";
    } else {
      var yesterday = new Date(nowYear, nowMonth, nowDate - 1);
      if (savedDate && entryYear === yesterday.getFullYear() && entryMonth === yesterday.getMonth() && entryDay === yesterday.getDate()) {
        dayLabel = "Yesterday";
      } else if (entry.date) {
        dayLabel = entry.date;
      } else if (savedDate) {
        dayLabel = savedDate.toISOString().slice(0, 10);
      }
    }

    if (timeStr) {
      return dayLabel ? (dayLabel + ", " + timeStr) : timeStr;
    }
    return dayLabel;
  }

export function itemCount(shop, page) {
    shop = shop || activeShop(); page = page || (state && state.activePage) || "quick";
    var pd = pageData(shop, page);
    if (page === "quick") {
      return pd.styles.reduce(function (acc, s) { return acc + Object.keys(s.cells).length; }, 0);
    }
    return pd.styles.reduce(function (acc, s) {
      return acc + Object.keys(s.counts).reduce(function (sum, k) { return sum + (Number(s.counts[k]) || 0); }, 0);
    }, 0);
  }

export function quickFlagBreakdown(shop) {
    shop = shop || activeShop();
    var low = 0, out = 0;
    var pd = pageData(shop, "quick");
    var styles = (pd && Array.isArray(pd.styles)) ? pd.styles : [];
    styles.forEach(function (s) {
      if (!s || !s.cells || typeof s.cells !== "object") return;
      Object.keys(s.cells).forEach(function (k) {
        var v = s.cells[k];
        if (v === STATE_LOW) low++;
        else if (v === STATE_CRIT) out++;
      });
    });
    return { low: low, out: out };
  }

export function totalQuickCells(shop) {
    shop = shop || activeShop();
    var pd = pageData(shop, "quick");
    var styles = (pd && Array.isArray(pd.styles)) ? pd.styles : [];
    var total = styles.reduce(function (acc, s) {
      if (!s) return acc;
      var numColors = Array.isArray(s.colors) ? s.colors.length : (s.colors && typeof s.colors === "object" ? Object.keys(s.colors).length : 0);
      var numSizes = Array.isArray(s.sizes) ? s.sizes.length : (s.sizes && typeof s.sizes === "object" ? Object.keys(s.sizes).length : 0);
      var matrixCells = numColors * numSizes;
      var cellCount = (s.cells && typeof s.cells === "object") ? Object.keys(s.cells).length : 0;
      return acc + Math.max(matrixCells, cellCount);
    }, 0);
    return Math.max(0, Number(total) || 0);
  }

export function lastCheckedFor(shopId) {
    var entries = (state.history || []).filter(function (e) { return e.shopId === shopId; });
    return entries.length ? entries[0].date : null;
  }

  // ---------- Clipboard Helper ----------
export function handleCopy(text, textareaId, labelElId, onLabel) {
    function setLabel(v) { var el = document.getElementById(labelElId); if (el) el.textContent = v; }
    function done(label) {
      setLabel(label);
      setTimeout(function () { setLabel(onLabel); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done("COPIED ✓"); }).catch(function () { fallbackCopy(text, textareaId, done); });
    } else {
      fallbackCopy(text, textareaId, done);
    }
  }

export function fallbackCopy(text, textareaId, done) {
    var ta = document.getElementById(textareaId);
    try {
      if (ta) {
        ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length);
        var ok = document.execCommand("copy");
        if (ok) { done("COPIED ✓"); return; }
      }
    } catch (e) {}
    if (ta) { ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); }
    done("SELECTED — TAP COPY");
  }


  // ---------- Backup & Export / Import ----------
export function exportBackup() {
    var jsonStr = JSON.stringify(state, null, 2);
    var stamp = new Date().toISOString().slice(0, 10);
    var fileName = "stock-command-backup-" + stamp + ".json";
    var blob = new Blob([jsonStr], { type: "application/json" });

    function standardDownload() {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }

    // Try Web Share API with File (Mobile Android & Capacitor WebView)
    if (navigator.canShare && window.File) {
      try {
        var file = new File([blob], fileName, { type: "application/json" });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: fileName,
            text: "Stock Command Data Backup (" + stamp + ")"
          }).then(function () {
            // Successfully shared or saved
          }).catch(function (err) {
            if (err && err.name !== "AbortError") {
              standardDownload();
            }
          });
          return;
        }
      } catch (e) {
        // Fallback to standard download
      }
    }

    standardDownload();
  }

export function handleImportFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        if (!parsed || !parsed.shops || !parsed.shops.length) {
          alert("That file doesn't look like a valid Stock Command backup.");
          return;
        }
        if (!confirm("Import this backup? It will replace all currently loaded shops, styles, notes, and matrix data.")) return;
        if (!parsed.history) parsed.history = [];
        if (!Array.isArray(parsed.notes)) parsed.notes = [];
        migrateState(parsed);
        setState(parsed);
        if (!state.activeShopId && state.shops.length) {
          state.activeShopId = state.shops[0].id;
        }
        save();
        render();
      } catch (e) {
        alert("Couldn't parse that file. Please make sure it's a valid Stock Command JSON backup.");
      }
    };
    reader.readAsText(file);
  }


export function resolveColorHex(name, ci, s) {
    if (s && s.colorHexes && ci !== undefined && ci !== null && s.colorHexes[ci]) {
      return s.colorHexes[ci];
    }
    var lower = (name || "").toLowerCase().trim();
    if (lower === "black" || lower === "blk") return "#1a1a1a";
    if (lower === "white" || lower === "wht") return "#e2e2e8";
    if (lower === "navy" || lower === "nvy") return "#1d3557";
    if (lower === "red") return "#bb1c1c";
    if (lower === "blue") return "#2a6f97";
    if (lower === "green") return "#4a6829";
    if (lower === "grey" || lower === "gray") return "#6B7280";
    if (lower === "olive") return "#4d7c0f";
    if (lower === "sage") return "#84a98c";
    if (lower === "brown" || lower === "mocha") return "#5c3d2e";
    if (lower === "pink" || lower === "blush") return "#d47a8a";
    if (lower === "purple" || lower === "lavender") return "#7c3aed";
    if (lower === "yellow" || lower === "mustard") return "#d97706";
    if (lower === "orange" || lower === "rust") return "#c2410c";
    if (lower === "khaki" || lower === "sand" || lower === "tan" || lower === "beige") return "#c2b280";
    if (lower === "charcoal") return "#2B313A";
    return "#8e9384";
  }


export function hexToRgb(hex) {
    var c = hex.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var num = parseInt(c, 16);
    if (isNaN(num)) return { r: 128, g: 128, b: 128 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

export function rgbToHex(r, g, b) {
    var clamp = function (v) { return Math.max(0, Math.min(255, Math.round(v))); };
    var rH = clamp(r).toString(16).padStart(2, "0");
    var gH = clamp(g).toString(16).padStart(2, "0");
    var bH = clamp(b).toString(16).padStart(2, "0");
    return ("#" + rH + gH + bH).toUpperCase();
  }

export function sectionLabelHtml(text) {
    return '<div style="display:flex;align-items:center;gap:8px;margin:16px 0 8px;">' +
      '<span class="label-caps" style="color:var(--ink-muted);">' + text + '</span>' +
      '<span style="flex:1;height:1px;background:var(--border-subtle);"></span></div>';
  }
