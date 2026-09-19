import { state, ui, syncStatus } from "../state.js";
import { activeShop, pageData, activeStyle } from "../actions.js";
import { esc, itemCount } from "../helpers.js";
import { isLightTheme } from "../theme.js";
import {
  ICON_ROBOTIC_ARM, ICON_CLOUD_CHECK, ICON_CLOUD_X,
  ICON_NAV_HOME, ICON_NAV_CHECK, ICON_NAV_COUNT, ICON_NAV_NOTES, ICON_NAV_HISTORY,
  ICON_STORE, ICON_CHEVRON_DOWN, ICON_PLUS_LIGHT, ICON_KEBAB, ICON_STYLE_TOOL,
  ICON_PENCIL_WHITE, ICON_TRASH_WHITE, ICON_BROOM, ICON_TRIANGLE_LEFT, ICON_TRIANGLE_RIGHT,
  ICON_TRIANGLE_UP, ICON_TRIANGLE_DOWN, ICON_SUN, ICON_MOON, ICON_LOGOUT
} from "../constants.js";

export function renderSyncPillHtml() {
    if (syncStatus === "saving") {
      return '<div style="background:var(--amber-bg);border:1px solid var(--amber-border);color:var(--amber-ink);border-radius:4px;padding:4px 8px;display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.02em;">' +
        ICON_CLOUD_CHECK + '<span>Saving...</span></div>';
    }
    if (syncStatus === "offline") {
      return '<div style="background:var(--red-bg);border:1px solid var(--red-border);color:var(--red-ink);border-radius:4px;padding:4px 8px;display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.02em;">' +
        ICON_CLOUD_X + '<span>Unsynced</span></div>';
    }
    // Synced (default OK)
    return '<div style="background:var(--badge-ok-bg);border:1px solid var(--badge-ok-border);color:var(--primary);border-radius:4px;padding:4px 8px;display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.02em;">' +
      ICON_CLOUD_CHECK + '<span>Synced</span></div>';
  }


export function renderMenuItemHtml(action, dataAttrs, iconHtml, label, isDanger, isDisabled) {
    var textColor = isDisabled ? "var(--ink-faint)" : (isDanger ? "var(--red-ink)" : "var(--ink)");
    var cursor = isDisabled ? "cursor:not-allowed;" : "cursor:pointer;";
    return '<button class="btn-reset tap-btn glass-item" data-action="' + action + '" ' + (dataAttrs || "") + ' ' + (isDisabled ? "disabled" : "") + ' style="width:100%;display:flex;align-items:center;padding:8px 16px;font-size:12px;font-weight:600;color:' + textColor + ';' + cursor + 'text-align:left;">' +
      '<span style="width:18px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;">' + iconHtml + '</span>' +
      '<span style="flex:1;white-space:nowrap;">' + label + '</span>' +
      '</button>';
  }

export function renderShopMenuPopoverHtml(sh) {
    var shIdx = state.shops.findIndex(function (x) { return x.id === sh.id; });
    var html = '<div class="glass-dropdown" style="position:absolute;right:0;top:calc(100% + 8px);z-index:40;min-width:170px;border-radius:8px;overflow:hidden;">';
    
    if (ui.editingShopId === sh.id) {
      html += '<div style="padding:8px 12px;"><input class="js-autofocus" data-role="shop-name-input" data-shop-id="' + sh.id + '" value="' + esc(sh.name) + '" style="width:100%;font-size:12px;color:var(--ink);background:var(--elevated);border:1px solid var(--primary);border-radius:4px;padding:8px 8px;" /></div>';
    } else {
      html += renderMenuItemHtml("shop-name-edit-start", 'data-shop-id="' + sh.id + '"', ICON_PENCIL_WHITE, "Rename", false, false);
    }
    
    html += renderMenuItemHtml("move-shop", 'data-dir="-1"', ICON_TRIANGLE_UP, "Move up", false, shIdx === 0);
    html += renderMenuItemHtml("move-shop", 'data-dir="1"', ICON_TRIANGLE_DOWN, "Move down", false, shIdx === state.shops.length - 1);
    
    if (ui.addingShop) {
      html += '<div style="padding:8px 12px;"><input class="js-autofocus" data-role="add-shop-input" placeholder="New shop name" style="width:100%;font-size:12px;color:var(--ink);background:var(--elevated);border:1px solid var(--primary);border-radius:4px;padding:8px 8px;" /></div>';
    } else {
      html += renderMenuItemHtml("add-shop-toggle", "", ICON_PLUS_LIGHT, "Add a shop", false, false);
    }
    
    if (state.shops.length > 1) {
      html += '<div style="height:1px;background:var(--border-subtle);"></div>';
      html += renderMenuItemHtml("delete-shop", "", ICON_TRASH_WHITE, "Delete shop", true, false);
    }

    html += '<div style="height:1px;background:var(--border-subtle);"></div>';
    html += renderMenuItemHtml("auth-logout", "", ICON_LOGOUT, "Log out", false, false);

    html += '</div>';
    return html;
  }

export function renderStyleMenuPopoverHtml(s, styles) {
    if (!s) return "";
    var stIdx = styles.findIndex(function (x) { return x.id === s.id; });
    var html = '<div class="glass-dropdown" style="position:absolute;right:0;top:calc(100% + 8px);z-index:40;min-width:170px;border-radius:8px;overflow:hidden;">';
    
    if (ui.editingStyleId === s.id) {
      html += '<div style="padding:8px 12px;"><input class="js-autofocus" data-role="style-name-input" data-style-id="' + s.id + '" value="' + esc(s.name) + '" style="width:100%;font-size:12px;color:var(--ink);background:var(--elevated);border:1px solid var(--primary);border-radius:4px;padding:8px 8px;" /></div>';
    } else {
      html += renderMenuItemHtml("style-name-edit-start", 'data-style-id="' + s.id + '"', ICON_PENCIL_WHITE, "Rename", false, false);
    }
    
    html += renderMenuItemHtml("move-style", 'data-dir="-1"', ICON_TRIANGLE_LEFT, "Move left", false, stIdx === 0);
    html += renderMenuItemHtml("move-style", 'data-dir="1"', ICON_TRIANGLE_RIGHT, "Move right", false, stIdx === styles.length - 1);
    
    if (ui.addingStyle) {
      html += '<div style="padding:8px 12px;"><input class="js-autofocus" data-role="add-style-input" placeholder="New style name" style="width:100%;font-size:12px;color:var(--ink);background:var(--elevated);border:1px solid var(--primary);border-radius:4px;padding:8px 8px;" /></div>';
    } else {
      html += renderMenuItemHtml("add-style-toggle", "", ICON_PLUS_LIGHT, "Add a style", false, false);
    }
    
    html += renderMenuItemHtml("toggle-edit-structure", "", ICON_STYLE_TOOL, ui.editStructure ? "Done editing matrix" : "Edit Colors & Sizes", false, false);
    
    var activePage = (state && state.activePage) || "quick";
    if (activePage === "quick") {
      html += '<div style="height:1px;background:var(--border-subtle);"></div>';
      html += renderMenuItemHtml("clear-all-flags-all-styles", "", ICON_BROOM, "Clear All Flags", true, false);
    } else if (activePage === "count") {
      html += '<div style="height:1px;background:var(--border-subtle);"></div>';
      html += renderMenuItemHtml("clear-all-counts-all-styles", "", ICON_BROOM, "Clear All Counts", true, false);
    }

    if (styles.length > 1) {
      html += '<div style="height:1px;background:var(--border-subtle);"></div>';
      html += renderMenuItemHtml("delete-style", "", ICON_TRASH_WHITE, "Delete style", true, false);
    }
    html += '</div>';
    return html;
  }

  // ---------- Header & Top Navigation Bar ----------
export function renderHeaderHtml() {
    // Structural theme decision: selects the sun vs moon icon and tooltip title
    var isLight = isLightTheme();
    var toggleTitle = isLight ? "Switch to dark mode" : "Switch to light mode";
    var toggleIcon = isLight ? ICON_SUN : ICON_MOON;

    var html = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 16px 12px;border-bottom:1px solid var(--border-subtle);">';
    
    // (9) Logo: Mechanical Robotic Arm Icon + STOCK COMMAND title perfectly aligned
    html += '<div style="display:flex;align-items:center;gap:10px;line-height:1;">' +
      ICON_ROBOTIC_ARM +
      '<span style="font-family:var(--font-sans);font-size:16px;font-weight:800;letter-spacing:-0.01em;color:var(--ink);text-transform:uppercase;line-height:1;display:inline-block;">STOCK COMMAND</span>' +
      '</div>';
    
    // Header Controls: Light/Dark Theme toggle + Sync status pill badge
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<button class="btn-reset tap-btn theme-header-btn" data-action="toggle-theme" title="' + toggleTitle + '" aria-label="' + toggleTitle + '" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:var(--panel-alt);border:1px solid var(--border-subtle);color:var(--ink-muted);cursor:pointer;transition:transform 0.14s ease, color 0.14s ease, border-color 0.14s ease;">' + toggleIcon + '</button>';
    html += '<div id="sync-pill-container" style="display:flex;align-items:center;">' + renderSyncPillHtml() + '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ---------- Bottom Navigation Bar (Matching design with Green Active & Capitalized Mono) ----------
export function renderBottomNavHtml() {
    var page = (state && state.activePage) || "quick";
    var activeIdx = ui.showHome ? 0 : (page === "quick" ? 1 : (page === "count" ? 2 : (page === "notes" ? 3 : 4)));

    var items = [
      { id: "home", label: "HOME", icon: ICON_NAV_HOME, active: ui.showHome },
      { id: "quick", label: "CHECK", icon: ICON_NAV_CHECK, active: !ui.showHome && page === "quick" },
      { id: "count", label: "COUNT", icon: ICON_NAV_COUNT, active: !ui.showHome && page === "count" },
      { id: "notes", label: "NOTES", icon: ICON_NAV_NOTES, active: !ui.showHome && page === "notes" },
      { id: "history", label: "HISTORY", icon: ICON_NAV_HISTORY, active: !ui.showHome && page === "history" }
    ];

    var html = '<div class="bottom-nav-fixed-wrap">';
    html += '<nav class="bottom-nav-bar" style="pointer-events:auto;width:100%;max-width:390px;border-radius:999px;padding:4px;position:relative;user-select:none;-webkit-tap-highlight-color:transparent;outline:none;">';
    html += '<div class="bottom-nav-track" style="position:relative;width:100%;display:flex;align-items:stretch;">';

    // Sliding background active green capsule indicator with animated transition
    html += '<div id="bottom-nav-pill" class="bottom-nav-pill" style="position:absolute;top:0;bottom:0;left:0;width:20%;transform:translateX(' + (activeIdx * 100) + '%);border-radius:999px;transition:transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), width 0.2s ease;pointer-events:none;z-index:1;"></div>';

    items.forEach(function (item, idx) {
      var action = item.id === "home" ? "set-home" : "set-page";
      var dataPage = item.id === "home" ? "" : ' data-page="' + item.id + '"';
      var activeColor = "var(--nav-tab-active)";
      var color = item.active ? activeColor : "var(--nav-tab-inactive)";
      var iconTransform = item.active ? "scale(1.08)" : "scale(1)";
      if (item.id === "history") iconTransform += " translateX(0.6px)";
      var labelWeight = item.active ? "800" : "700";
      var activeClass = item.active ? " is-active" : "";

      html += '<button class="btn-reset tap-btn nav-tab-btn' + activeClass + '" data-action="' + action + '"' + dataPage + ' data-nav-idx="' + idx + '" style="flex:1 1 0;width:20%;min-width:0;position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7px 0 6px;border-radius:999px;color:' + color + ';transition:color 0.22s ease;-webkit-tap-highlight-color:transparent;outline:none;">';
      html += '<span class="nav-icon" style="display:flex;align-items:center;justify-content:center;height:20px;transform:' + iconTransform + ';transition:transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);">' + item.icon + '</span>';
      html += '<span class="nav-label" style="font-family:var(--font-mono);font-size:10px;font-weight:' + labelWeight + ';letter-spacing:0.08em;margin-right:-0.08em;margin-top:4px;line-height:1;text-transform:uppercase;">' + esc(item.label) + '</span>';
      html += '</button>';
    });

    html += '</div></nav></div>';
    return html;
  }

export function updateBottomNavState(navContainer) {
    if (!navContainer) return;
    var page = (state && state.activePage) || "quick";
    var activeIdx = ui.showHome ? 0 : (page === "quick" ? 1 : (page === "count" ? 2 : (page === "notes" ? 3 : 4)));
    var pill = navContainer.querySelector("#bottom-nav-pill");
    var buttons = navContainer.querySelectorAll("[data-nav-idx]");
    var activeBtn = buttons[activeIdx];

    if (pill) {
      if (activeBtn && activeBtn.offsetWidth > 0) {
        pill.style.width = activeBtn.offsetWidth + "px";
        pill.style.transform = "translateX(" + activeBtn.offsetLeft + "px)";
      } else {
        pill.style.width = "20%";
        pill.style.transform = "translateX(" + (activeIdx * 100) + "%)";
      }
    }

    var activeColor = "var(--nav-tab-active)";
    buttons.forEach(function (btn) {
      var idx = parseInt(btn.dataset.navIdx, 10);
      var isActive = (idx === activeIdx);
      btn.classList.toggle("is-active", isActive);
      btn.style.color = isActive ? activeColor : "var(--nav-tab-inactive)";
      var iconSpan = btn.querySelector(".nav-icon");
      if (iconSpan) {
        var baseTransform = isActive ? "scale(1.08)" : "scale(1)";
        if (idx === 4) baseTransform += " translateX(0.6px)";
        iconSpan.style.transform = baseTransform;
      }
      var labelSpan = btn.querySelector(".nav-label");
      if (labelSpan) {
        labelSpan.style.fontWeight = isActive ? "800" : "700";
      }
    });
  }
