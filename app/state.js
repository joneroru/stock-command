import { SUPABASE_URL, SUPABASE_KEY, LOCAL_CACHE_KEY } from "./constants.js";
import { cryptoId, cellKey, formatColorName, formatSizeName } from "./helpers.js";
import { renderSyncPillHtml } from "./render/navigation.js";

export var sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export var currentSession = null;
export function setCurrentSession(s) {
  currentSession = s;
  return currentSession;
}
export function getCurrentSession() {
  return currentSession;
}

  // ---------- Default Data Shapes ----------
export function seededStyle() {
    return { id: cryptoId(), name: "T-SHIRT", sizes: ["S", "M", "L", "XL", "2X"], colors: ["BLK", "WHT", "NVY"], cells: {}, counts: {}, colorHexes: {} };
  }
export function blankStyle() {
    return { id: cryptoId(), name: "T-SHIRT", sizes: ["S", "M", "L", "XL", "2X"], colors: [], cells: {}, counts: {}, colorHexes: {} };
  }
export function seededShop(name) {
    var st = seededStyle();
    return { id: cryptoId(), name: name, styles: [st], activeStyleId: st.id };
  }
export function newShop(name) {
    var st = blankStyle();
    return { id: cryptoId(), name: name, styles: [st], activeStyleId: st.id };
  }
export function defaultData() {
    var shops = [seededShop("Cherrol"), seededShop("Main Warehouse"), seededShop("Westside")];
    return { activeShopId: shops[0].id, activePage: "quick", shops: shops, history: [], notes: [] };
  }

export var state = defaultData();
export function setState(s) {
  state = s;
  return state;
}

  // ---------- State Migration ----------
export function unionPreserveOrder(a, b) {
    var result = (a || []).slice();
    (b || []).forEach(function (x) { if (result.indexOf(x) === -1) result.push(x); });
    return result;
  }
export function remapAxisMap(map, colorIndexOf, sizeIndexOf) {
    var result = {};
    Object.keys(map || {}).forEach(function (k) {
      var parts = k.split(":").map(Number), ci = parts[0], si = parts[1];
      var newCi = colorIndexOf[ci], newSi = sizeIndexOf[si];
      if (newCi === undefined || newSi === undefined) return;
      result[cellKey(newCi, newSi)] = map[k];
    });
    return result;
  }
export function mergeQuickCountStyle(qs, cs) {
    var name = (qs && qs.name) || (cs && cs.name) || "STYLE";
    var colors = unionPreserveOrder(qs ? qs.colors : [], cs ? cs.colors : []);
    var sizes = unionPreserveOrder(qs ? qs.sizes : [], cs ? cs.sizes : []);
    var colorHexes = Object.assign({}, (qs && qs.colorHexes) || {}, (cs && cs.colorHexes) || {});
    var cells = {};
    if (qs) {
      var qCi = {}; qs.colors.forEach(function (c, i) { qCi[i] = colors.indexOf(c); });
      var qSi = {}; qs.sizes.forEach(function (sz, i) { qSi[i] = sizes.indexOf(sz); });
      cells = remapAxisMap(qs.cells, qCi, qSi);
    }
    var counts = {};
    if (cs) {
      var cCi = {}; cs.colors.forEach(function (c, i) { cCi[i] = colors.indexOf(c); });
      var cSi = {}; cs.sizes.forEach(function (sz, i) { cSi[i] = sizes.indexOf(sz); });
      counts = remapAxisMap(cs.counts, cCi, cSi);
    }
    return { id: (qs && qs.id) || (cs && cs.id) || cryptoId(), name: name, colors: colors, sizes: sizes, cells: cells, counts: counts, colorHexes: colorHexes };
  }
export function migrateShop(sh) {
    if (!sh.pages) return sh;
    var quickStyles = (sh.pages.quick && sh.pages.quick.styles) || [];
    var countStyles = (sh.pages.count && sh.pages.count.styles) || [];
    var usedCount = {};
    var merged = quickStyles.map(function (qs) {
      var idx = countStyles.findIndex(function (cs, i) { return !usedCount[i] && cs.name === qs.name; });
      var cs = idx !== -1 ? countStyles[idx] : null;
      if (idx !== -1) usedCount[idx] = true;
      return mergeQuickCountStyle(qs, cs);
    });
    countStyles.forEach(function (cs, i) {
      if (usedCount[i]) return;
      merged.push(mergeQuickCountStyle(null, cs));
    });
    if (!merged.length) merged = [blankStyle()];
    return { id: sh.id, name: sh.name, styles: merged, activeStyleId: merged[0].id };
  }
export function migrateState(data) {
    if (!data || typeof data !== "object") return false;
    var migrated = false;
    if (!data.activePage) {
      data.activePage = "quick";
      migrated = true;
    }
    if (!Array.isArray(data.shops) || data.shops.length === 0) {
      var def = defaultData();
      data.shops = def.shops;
      data.activeShopId = def.activeShopId;
      migrated = true;
    } else if (!data.activeShopId) {
      data.activeShopId = data.shops[0].id;
      migrated = true;
    }
    data.shops = (data.shops || []).map(function (sh) {
      if (!sh) return seededShop("Store");
      if (sh.styles) {
        sh.styles.forEach(function (st) {
          if (!st) return;
          if (st.colors) {
            st.colors = st.colors.map(function (c) { return formatColorName(c); });
          }
          if (st.sizes) {
            st.sizes = st.sizes.map(function (sz) { return formatSizeName(sz); });
          }
        });
      }
      if (!sh.pages) return sh;
      migrated = true;
      return migrateShop(sh);
    });
    if (data.history && data.history.length) {
      var prevLen = data.history.length;
      data.history = data.history.filter(function (e) {
        return Number(e.itemCount) > 0 && !(e.summaryText && (e.summaryText.indexOf("No counts recorded yet") !== -1 || e.summaryText.indexOf("No low or out-of-stock") !== -1));
      });
      if (data.history.length !== prevLen) migrated = true;
    } else if (!Array.isArray(data.history)) {
      data.history = [];
      migrated = true;
    }
    if (!Array.isArray(data.notes)) {
      data.notes = [];
      migrated = true;
    }
    return migrated;
  }


export var COUNT_SEARCH_STORAGE_KEY = "stock-command-count-search";

export function loadCountSearchPreference() {
  try {
    var raw = localStorage.getItem(COUNT_SEARCH_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          countSearchChips: Array.isArray(parsed.countSearchChips) ? parsed.countSearchChips : [],
          countSearchExclusionChips: Array.isArray(parsed.countSearchExclusionChips) ? parsed.countSearchExclusionChips : [],
          countSearchQuery: typeof parsed.countSearchQuery === "string" ? parsed.countSearchQuery : ""
        };
      }
    }
  } catch (e) {}
  return {
    countSearchChips: [],
    countSearchExclusionChips: [],
    countSearchQuery: ""
  };
}

export function saveCountSearchPreference() {
  try {
    var data = {
      countSearchChips: ui.countSearchChips || [],
      countSearchExclusionChips: ui.countSearchExclusionChips || [],
      countSearchQuery: ui.countSearchQuery || ""
    };
    localStorage.setItem(COUNT_SEARCH_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

var initialSearchPref = loadCountSearchPreference();

export var ui = {
    showHome: true,
    addingShop: false, editingShopId: null, editingShopValue: "", shopMenuOpen: false, shopPickerOpen: false,
    addingStyle: false, editingStyleId: null, styleMenuOpen: false,
    addingColor: false, addingSize: false,
    renamingStyle: false,
    editingColor: null, editingSize: null, editingCount: null,
    justFinishedStepperRepeat: null,
    countSearchQuery: initialSearchPref.countSearchQuery,
    countSearchChips: initialSearchPref.countSearchChips,
    countSearchExclusionChips: initialSearchPref.countSearchExclusionChips,
    countSearchInputText: "",
    needsAutofocus: false,
    colorBrowserOpen: false,
    colorBrowserExcludeMode: false,
    summaryOpen: true, copyLabel: "COPY LIST", snapshotLabel: "SAVE TO HISTORY",
    expandedHistoryId: null, editingHistoryDateId: null, editingHistoryDateValue: "",
    editStructure: false,
    colorPickerModal: null,
    isClosingColorPicker: false,
    confirmDialog: null, // { title, message, confirmText, danger, onConfirm }
    notesSearchQuery: "",
    notesViewMode: "grid", // "grid" | "full"
    notesSort: "newest", // "newest" | "oldest" | "color"
    notesAdjustMenuOpen: false,
    notesPlusMenuOpen: false,
    activeNoteId: null,
    originNoteRect: null,
    isEditorClosing: false
  };

export var syncStatus = "loading"; // loading | saving | saved | offline
export function cacheLocally(data) {
    try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
  }
export function loadLocalCache() {
    try {
      var raw = localStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }


export function setSyncStatus(status) {
    syncStatus = status;
    var container = document.getElementById("sync-pill-container");
    if (container) container.innerHTML = renderSyncPillHtml();
  }

export function loadFromCloud() {
    if (!sb) {
      var cached = loadLocalCache();
      setSyncStatus("offline");
      var d = cached || defaultData();
      if (!Array.isArray(d.notes)) d.notes = [];
      return Promise.resolve(d);
    }
    return sb.from("stock_data").select("data").eq("id", 1).single().then(function (res) {
      if (res.error) throw res.error;
      var loaded = res.data && res.data.data;
      if (loaded && loaded.shops && loaded.shops.length) {
        if (!loaded.history) loaded.history = [];
        if (!Array.isArray(loaded.notes)) loaded.notes = [];
        cacheLocally(loaded);
        return loaded;
      }
      var fresh = defaultData();
      return saveToCloud(fresh).then(function () { return fresh; });
    }).catch(function () {
      var cached = loadLocalCache();
      setSyncStatus("offline");
      var d = cached || defaultData();
      if (!Array.isArray(d.notes)) d.notes = [];
      return d;
    });
  }

export var saveTimer = null;
export function save() {
    setSyncStatus("saving");
    cacheLocally(state);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveToCloud(state); }, 400);
  }

export function saveToCloud(data) {
    if (!sb) {
      setSyncStatus("offline");
      return Promise.resolve();
    }
    return sb.from("stock_data").upsert({ id: 1, data: data, updated_at: new Date().toISOString() }).then(function (res) {
      if (res.error) throw res.error;
      setSyncStatus("saved");
    }).catch(function () {
      setSyncStatus("offline");
    });
  }
