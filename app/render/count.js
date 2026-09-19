import { state, ui } from "../state.js";
import { activeShop, pageData, activeStyle } from "../actions.js";
import {
  esc, cellKey, resolveColorHex, formatColorName, formatSizeName,
  getActiveCountSearchTerms, getActiveCountExclusionTerms, getActiveCountSearch, colorMatchesSearch,
  getShopUniqueColors, itemCount, buildSummary, sectionLabelHtml
} from "../helpers.js";
import { renderShopMenuPopoverHtml, renderStyleMenuPopoverHtml } from "./navigation.js";
import {
  ICON_SEARCH, ICON_X, ICON_PLUS, ICON_SAVE, ICON_COPY, ICON_PENCIL_WHITE, ICON_TRASH_WHITE,
  ICON_TRIANGLE_UP, ICON_TRIANGLE_DOWN, ICON_TRIANGLE_LEFT, ICON_TRIANGLE_RIGHT,
  ICON_PLUS_LIGHT, ICON_PALETTE, ICON_BROOM, ICON_STYLE_TOOL,
  ICON_DISCREPANCY, ICON_CABINET_BOX, ICON_CHECK, ICON_KEBAB, ICON_CHEVRON_DOWN,
  ICON_UPLOAD, ICON_DOWNLOAD
} from "../constants.js";

export function countColorCircle(name, ci, s, isEditing) {
    var colorHex = resolveColorHex(name, ci, s);
    if (isEditing) {
      return '<button class="btn-reset tap-btn matrix-swatch-btn" data-action="open-color-picker" data-color-idx="' + ci + '" title="Edit color swatch (' + colorHex + ')" style="touch-action:manipulation;display:inline-flex;align-items:center;margin-right:8px;flex:0 0 auto;vertical-align:middle;padding:4px;border-radius:999px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.25);cursor:pointer;">' +
        '<span class="js-swatch-count-' + ci + '" style="display:inline-block;width:9px;height:9px;border-radius:999px;background:' + colorHex + ';"></span>' +
        '</button>';
    }
    return '<span class="js-swatch-count-' + ci + '" style="display:inline-block;width:8px;height:8px;border-radius:999px;background:' + colorHex + ';margin-right:8px;flex:0 0 auto;vertical-align:middle;"></span>';
  }


export function renderCountSearchBarHtml(activeSearch) {
    var hasChips = (ui.countSearchChips && ui.countSearchChips.length > 0) || (ui.countSearchExclusionChips && ui.countSearchExclusionChips.length > 0);
    var hasText = Boolean(ui.countSearchInputText && ui.countSearchInputText.trim());
    var hasAnyTerms = hasChips || hasText;

    var html = '';
    // Single bordered container
    html += '<div class="count-search-bar-box" style="background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:8px 4px 8px 8px;display:flex;flex-direction:row;gap:8px;align-items:center;box-sizing:border-box;">';

    // 1. Leading search icon (15px)
    html += '<span style="display:flex;align-items:center;color:var(--ink-muted);flex-shrink:0;margin-left:2px;">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '</span>';

    // 2. Flexible chip/text area (scrolls internally up to 84px)
    html += '<div class="count-chips-scroll" data-role="chips-container" data-preserve-scroll="count-search-chips" style="flex:1;min-width:0;max-height:84px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center;cursor:text;">';
    
    // Inclusion chips (green)
    (ui.countSearchChips || []).forEach(function (chip) {
      html += '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--primary-pill-bg);color:var(--primary);border:1px solid var(--primary-pill-border);border-radius:4px;padding:4px 8px;font-size:11px;font-weight:700;font-family:var(--font-mono);line-height:1;flex-shrink:0;">';
      html += '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">' + esc(chip) + '</span>';
      html += '<button class="btn-reset tap-btn" data-action="remove-search-chip" data-chip-term="' + esc(chip) + '" title="Remove ' + esc(chip) + '" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--primary);background:none;border:none;cursor:pointer;padding:0;margin:0;line-height:1;">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>';
      html += '</span>';
    });

    // Exclusion chips (muted red/orange with small "−" icon)
    (ui.countSearchExclusionChips || []).forEach(function (exChip) {
      html += '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(250,93,24,0.12);color:var(--amber);border:1px solid rgba(250,93,24,0.40);border-radius:4px;padding:4px 8px;font-size:11px;font-weight:700;font-family:var(--font-mono);line-height:1;flex-shrink:0;">';
      html += '<svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="flex-shrink:0;"><line x1="2" y1="8" x2="14" y2="8"/></svg>';
      html += '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">' + esc(exChip) + '</span>';
      html += '<button class="btn-reset tap-btn" data-action="remove-exclusion-chip" data-chip-term="' + esc(exChip) + '" title="Remove exclusion ' + esc(exChip) + '" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--amber);background:none;border:none;cursor:pointer;padding:0;margin:0;line-height:1;">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>';
      html += '</span>';
    });

    // Text input at the end
    var placeholderText = hasAnyTerms ? '' : 'Search color(s)... e.g. red, excluded:navy';
    html += '<input id="count-search-input" data-role="count-search-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
      'placeholder="' + esc(placeholderText) + '" value="' + esc(ui.countSearchInputText || '') + '" ' +
      'style="flex:1;min-width:70px;border:none;background:transparent;color:var(--ink);font-size:12px;font-family:var(--font-mono);outline:none;padding:2px 0;line-height:1.4;" />';
    html += '</div>';

    // 3. Thin vertical divider (1px wide, stretches row height)
    html += '<div style="width:1px;align-self:stretch;background:var(--border-subtle);margin:4px 0;flex-shrink:0;"></div>';

    // 4. Toggle button (36x36px tap target, borderless, icon-focused)
    var isOpen = Boolean(ui.colorBrowserOpen);
    var toggleColor = 'var(--primary)';
    html += '<button class="btn-reset tap-btn touch-hit-44 count-palette-toggle-btn' + (isOpen ? ' is-open' : '') + '" data-action="toggle-color-browser" title="' + (isOpen ? 'Close color browser' : 'Browse colors') + '" ' +
      'style="width:36px;height:36px;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;flex-shrink:0;padding:0;color:' + toggleColor + ';">' +
      '<svg class="count-palette-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>' +
      '<circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>' +
      '<circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>' +
      '<circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>' +
      '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' +
      '</svg>' +
      '</button>';

    html += '</div>';
    return html;
  }

export function renderColorBrowserPanelHtml(pd, activeSearch) {
    var isOpen = Boolean(ui.colorBrowserOpen);
    var isExcludeMode = Boolean(ui.colorBrowserExcludeMode);
    var html = '<div id="count-color-browser" style="display:' + (isOpen ? 'block' : 'none') + ';margin-top:8px;background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px;box-sizing:border-box;">';

    var uniqueColors = getShopUniqueColors(pd);
    if (uniqueColors.length === 0) {
      html += '<div style="text-align:center;padding:16px 8px;font-size:11px;font-family:var(--font-mono);color:var(--ink-muted);letter-spacing:0.03em;">' +
        'No colors found for current shop' +
        '</div>';
    } else {
      html += '<div data-preserve-scroll="count-color-browser-grid" style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:8px;max-height:240px;overflow-y:auto;padding:6px 4px 6px 2px;box-sizing:border-box;">';
      uniqueColors.forEach(function (c) {
        var cLower = c.name.toLowerCase().trim();
        var cNoSpaces = cLower.replace(/\s+/g, '');

        var isExcluded = (ui.countSearchExclusionChips || []).some(function (ex) {
          var exLower = ex.toLowerCase().trim();
          var exNoSpaces = exLower.replace(/\s+/g, '');
          return cLower.indexOf(exLower) !== -1 || (exNoSpaces && cNoSpaces.indexOf(exNoSpaces) !== -1);
        });

        var isSelected = !isExcluded && ((ui.countSearchChips || []).some(function (chip) {
          return chip.toLowerCase().trim() === cLower;
        }) || (!ui.countSearchInputText.toLowerCase().startsWith("excluded:") && String(ui.countSearchInputText || "").trim().toLowerCase() === cLower));

        var borderStyle = isExcluded
          ? 'border:1px solid rgba(250,93,24,0.45);'
          : (isSelected ? 'border:1px solid var(--primary);' : 'border:1px solid var(--border);');

        var bgStyle = isExcluded
          ? 'background:rgba(250,93,24,0.12);'
          : (isSelected ? 'background:var(--primary-pill-bg);' : 'background:transparent;');

        var textCol = isExcluded
          ? 'color:var(--amber);'
          : (isSelected ? 'color:var(--primary);' : 'color:var(--ink);');

        html += '<button class="btn-reset tap-btn count-browser-item" data-action="toggle-color-term" data-color-name="' + esc(c.name) + '" ' +
          'style="position:relative;display:flex;align-items:center;gap:8px;' + borderStyle + bgStyle + 'border-radius:4px;padding:8px ' + (isSelected || isExcluded ? '20px' : '8px') + ' 8px 8px;cursor:pointer;text-align:left;min-width:0;width:100%;box-sizing:border-box;">' +
          '<span style="width:16px;height:16px;min-width:16px;min-height:16px;border-radius:999px;background:' + (c.hex || '#8e9384') + ';border:1px solid rgba(255,255,255,0.15);flex-shrink:0;display:inline-block;"></span>' +
          '<span style="flex:1;min-width:0;font-size:11px;font-weight:600;font-family:var(--font-mono);' + textCol + 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;">' +
          esc(c.name) +
          '</span>';

        if (isExcluded) {
          html += '<span style="position:absolute;top:6px;right:6px;color:var(--amber);display:flex;align-items:center;line-height:1;">' +
            '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="8" x2="13" y2="8"/></svg>' +
            '</span>';
        } else if (isSelected) {
          html += '<span style="position:absolute;top:6px;right:6px;color:var(--primary);display:flex;align-items:center;line-height:1;">' +
            '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5L6.5 12L13 4"/></svg>' +
            '</span>';
        }

        html += '</button>';
      });
      html += '</div>';
    }

    // Bottom row: Segmented Mode Toggle (Include vs Exclude with smooth sliding pill) + DONE button
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--border-subtle);gap:8px;">';

    // Segmented Mode Toggle with smooth sliding pill indicator
    var sliderTransform = isExcludeMode ? 'translateX(100%)' : 'translateX(0)';
    var sliderBg = isExcludeMode
      ? 'background:rgba(250,93,24,0.18);border:1px solid rgba(250,93,24,0.50);box-shadow:0 1px 3px rgba(250,93,24,0.2);'
      : 'background:var(--primary-pill-bg);border:1px solid var(--primary-pill-border);box-shadow:0 1px 3px rgba(0,0,0,0.25);';

    var incTextColor = !isExcludeMode ? 'var(--primary)' : 'var(--ink-muted)';
    var exTextColor = isExcludeMode ? 'var(--amber)' : 'var(--ink-muted)';
    var incWeight = !isExcludeMode ? '700' : '600';
    var exWeight = isExcludeMode ? '700' : '600';

    html += '<div class="count-mode-segmented" style="position:relative;display:inline-flex;align-items:center;background:var(--bg-deep);border:1px solid var(--border);border-radius:4px;padding:2px;user-select:none;isolation:isolate;">';
    html += '<div class="count-mode-slider" style="position:absolute;top:2px;bottom:2px;left:2px;width:calc(50% - 2px);border-radius:2px;pointer-events:none;z-index:0;transform:' + sliderTransform + ';' + sliderBg + '"></div>';

    html += '<button class="btn-reset count-mode-tab-btn count-mode-btn-inc' + (!isExcludeMode ? ' is-active' : '') + '" data-action="set-color-browser-mode" data-mode="include" title="Include mode: tap swatches to match" style="position:relative;z-index:1;height:26px;min-width:80px;display:inline-flex;align-items:center;justify-content:center;gap:4px;border-radius:2px;border:1px solid transparent;padding:0 8px;font-size:10px;font-family:var(--font-mono);font-weight:' + incWeight + ';letter-spacing:0.04em;line-height:1;cursor:pointer;color:' + incTextColor + ';background:none;">' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
      'INCLUDE' +
      '</button>';

    html += '<button class="btn-reset count-mode-tab-btn count-mode-btn-ex' + (isExcludeMode ? ' is-active' : '') + '" data-action="set-color-browser-mode" data-mode="exclude" title="Exclude mode: tap swatches to exclude" style="position:relative;z-index:1;height:26px;min-width:80px;display:inline-flex;align-items:center;justify-content:center;gap:4px;border-radius:2px;border:1px solid transparent;padding:0 8px;font-size:10px;font-family:var(--font-mono);font-weight:' + exWeight + ';letter-spacing:0.04em;line-height:1;cursor:pointer;color:' + exTextColor + ';background:none;">' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
      'EXCLUDE' +
      '</button>';
    html += '</div>';

    // DONE button
    html += '<button class="btn-reset tap-btn count-browser-done-btn" data-action="close-color-browser" style="height:28px;background:var(--primary-pill-bg);border:1px solid var(--primary-pill-border);color:var(--primary);border-radius:4px;padding:0 14px;font-size:11px;font-weight:700;font-family:var(--font-mono);letter-spacing:0.04em;cursor:pointer;line-height:1;">DONE</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }


  // ---------- COUNT PAGE (IMAGE 3 & 4) ----------
export function renderCountPageHtml() {
    var sh = activeShop();
    var pd = pageData(sh);
    var s = activeStyle();
    var html = '<div class="page-view" style="padding:16px 16px 24px;">';

    // (13) Large structured rectangle box for ACTUAL COUNT, BETA, LOCATION, SHOP CHOOSING, EDIT, STYLES
    html += '<div style="border:1px solid var(--border);border-radius:12px;background:var(--panel);padding:16px;margin-bottom:24px;box-shadow:var(--shadow-card);">';
    
    // Title row: ACTUAL COUNT on left, green BETA pill badge on right
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
    html += '<div style="font-family:var(--font-mono);font-size:16px;font-weight:800;letter-spacing:0.04em;color:var(--ink);">ACTUAL COUNT</div>';
    html += '<div style="background:var(--primary-pill-bg);border:1px solid var(--primary-pill-border);color:var(--primary);border-radius:4px;padding:4px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;">BETA</div>';
    html += '</div>';

    // Location label
    html += '<div class="label-caps" style="font-size:10px;color:var(--ink-muted);margin-bottom:8px;">LOCATION</div>';

    // Location / Shop dropdown select box
    html += '<div style="position:relative;margin-bottom:16px;">';
    html += '<button class="btn-reset shop-picker-btn" data-action="shop-picker-toggle" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--panel);border:1px solid var(--border-subtle);border-radius:8px;color:var(--ink);font-family:var(--font-mono);font-size:14px;font-weight:600;">' +
      '<span>' + esc(sh.name) + '</span>' +
      '<span style="color:var(--ink-muted);font-size:10px;">' + (ui.shopPickerOpen ? "▲" : "▼") + '</span>' +
      '</button>';

    if (ui.shopPickerOpen) {
      html += '<div class="glass-dropdown-count" style="position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:30;border-radius:8px;overflow:hidden;">';
      state.shops.forEach(function (shp, idx) {
        var isActive = shp.id === sh.id;
        html += '<button class="btn-reset tap-btn glass-item" data-action="set-shop" data-shop-id="' + shp.id + '" style="width:100%;text-align:left;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:' + (isActive ? "var(--elevated)" : "transparent") + ';color:' + (isActive ? "var(--ink)" : "var(--ink-secondary)") + ';font-family:var(--font-mono);font-size:12px;font-weight:' + (isActive ? "700" : "500") + ';' + (idx < state.shops.length - 1 ? "border-bottom:1px solid var(--border-subtle);" : "") + '">' +
          '<span>' + esc(shp.name) + '</span>' +
          (isActive ? '<span style="color:var(--primary);">' + ICON_CHECK + '</span>' : '') +
          '</button>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Multi-color search and active terms (inclusions & exclusions)
    var activeSearch = getActiveCountSearch();
    var isSearchActive = activeSearch.inclusions.length > 0 || activeSearch.exclusions.length > 0;

    // Search bar container + Color browser panel
    html += '<div style="margin-bottom:' + (isSearchActive ? '0' : '12px') + ';">';
    html += renderCountSearchBarHtml(activeSearch);
    html += renderColorBrowserPanelHtml(pd, activeSearch);
    html += '</div>';

    if (!isSearchActive) {
      // (9), (10), (11) Style tabs row without baseline underline, vertical divider |, Style edit icon, and Shop kebab menu (Image 4)
      html += '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-subtle);padding-top:12px;gap:8px;">';
      
      // Style text tabs with fluid bottom scrollbar, increased fade mask on right edge (56px), and trailing spacer
      html += '<div class="style-tabs-scroll count-style-tabs" data-preserve-scroll="count-style-tabs" style="flex:1;min-width:0;padding:4px 0 4px 6px;margin:-4px 0 -4px -6px;mask-image:linear-gradient(to right, black calc(100% - 56px), transparent 100%);-webkit-mask-image:linear-gradient(to right, black calc(100% - 56px), transparent 100%);">';
      pd.styles.forEach(function (st) {
        var isActive = s && st.id === s.id;
        var styleClasses = isActive
          ? 'color:var(--primary);font-weight:700;'
          : 'color:var(--ink-muted);font-weight:600;';
        html += '<button class="btn-reset tap-btn style-pill-btn count-style-tab' + (isActive ? ' is-active' : '') + '" data-action="set-style" data-style-id="' + st.id + '" style="height:26px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:var(--font-mono);font-size:clamp(11px, 2.7vw, 12px);letter-spacing:0.04em;line-height:1;white-space:nowrap;flex-shrink:0;' + styleClasses + '">' +
          esc(st.name) + '</button>';
      });
      if (ui.addingStyle) {
        html += '<input class="js-autofocus" data-role="add-style-input" placeholder="STYLE" style="width:74px;height:22px;font-family:var(--font-mono);font-size:11px;font-weight:700;border:1px solid var(--primary);border-radius:4px;background:var(--panel);color:var(--ink);padding:4px 8px;box-sizing:border-box;line-height:1;margin-top:0;flex-shrink:0;" />';
      } else {
        html += '<button class="btn-reset tap-btn style-add-btn" data-action="add-style-toggle" style="height:22px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.04em;border-radius:4px;padding:0 8px;line-height:1;margin-top:0;flex-shrink:0;">+ STYLE</button>';
      }
      // Trailing spacer so right dashed border of + STYLE never gets cut off when scrolled to the end
      html += '<div style="width:18px;flex:0 0 18px;height:1px;"></div>';
      html += '</div>';

      // (7) & (8) Right actions: full-height divider |, Style edit icon, and Shop kebab menu perfectly centered with text (touch targets preserved via touch-hit-44)
      html += '<div style="display:flex;align-items:center;gap:4px;flex:0 0 auto;margin-left:4px;align-self:center;">';
      html += '<div style="width:1px;height:18px;background:var(--border-subtle);flex-shrink:0;"></div>';
      
      // Style edit icon (left of 3-dot colon)
      html += '<div style="position:relative;display:flex;align-items:center;">';
      html += '<button class="btn-reset tool-icon-btn count-tool-btn touch-hit-44" data-action="style-menu-toggle" title="Style Settings" style="color:var(--ink-muted);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;min-width:28px;min-height:28px;border-radius:4px;border:1px solid transparent;">' + ICON_STYLE_TOOL + '</button>';
      if (ui.styleMenuOpen) {
        html += renderStyleMenuPopoverHtml(s, pd.styles);
      }
      html += '</div>';

      // 3-dot colon (⋮) for Location / Shop menu (Image 4) with subtle matching scale
      html += '<div style="position:relative;display:flex;align-items:center;">';
      html += '<button class="btn-reset count-shop-kebab-btn count-tool-btn tool-icon-btn touch-hit-44" data-action="shop-menu-toggle" title="Location Settings" style="color:var(--ink-muted);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;min-width:28px;min-height:28px;border-radius:4px;border:1px solid transparent;">' + ICON_KEBAB + '</button>';
      if (ui.shopMenuOpen) {
        html += renderShopMenuPopoverHtml(sh);
      }
      html += '</div>';

      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    // (5) INVENTORY MATRIX TABLE & CLEAR COUNTS (IMAGE 3 & 4) OR MULTI-COLOR SEARCH VIEW
    if (isSearchActive) {
      var matchingStyles = [];
      pd.styles.forEach(function (st) {
        var matches = [];
        (st.colors || []).forEach(function (colorName, ci) {
          if (colorMatchesSearch(colorName, activeSearch.inclusions, activeSearch.exclusions)) {
            matches.push({ name: colorName, ci: ci });
          }
        });
        if (matches.length > 0) {
          matchingStyles.push({ style: st, matches: matches });
        }
      });

      if (matchingStyles.length === 0) {
        var descParts = [];
        if (activeSearch.inclusions.length > 0) descParts.push('matching "' + esc(activeSearch.inclusions.join(', ')) + '"');
        if (activeSearch.exclusions.length > 0) descParts.push('excluding "' + esc(activeSearch.exclusions.join(', ')) + '"');
        var descMsg = descParts.length > 0 ? 'No styles contain colors ' + descParts.join(' and ') : 'Enter color terms to filter';

        html += '<div style="border:1px dashed var(--border);border-radius:8px;background:var(--panel);padding:32px 16px;text-align:center;margin-bottom:24px;">' +
          '<div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--ink-muted);letter-spacing:0.04em;margin-bottom:4px;">No colors found</div>' +
          '<div style="font-size:11px;color:var(--ink-faint);">' +
          descMsg +
          '</div>' +
          '</div>';
      } else {
        matchingStyles.forEach(function (item) {
          var st = item.style;
          var matches = item.matches;

          // Style header label above each table
          html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
          html += '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="font-family:var(--font-mono);font-size:12px;font-weight:800;letter-spacing:0.06em;color:var(--ink);">' + esc(st.name) + '</span>' +
            '<span style="background:var(--badge-ok-bg);border:1px solid var(--badge-ok-border);color:var(--primary);border-radius:4px;padding:4px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;line-height:1;">' +
            matches.length + ' ' + (matches.length === 1 ? 'COLOR' : 'COLORS') + '</span>' +
            '</div>';
          html += '</div>';

          // Table container with sticky COLOR column and matching count stepper cells
          html += '<div style="border:1px solid var(--border-cell);border-radius:8px;background:var(--panel);overflow:hidden;margin-bottom:24px;box-shadow:var(--shadow-card);">';
          html += '<div style="overflow-x:auto;" class="matrix-table-scroll" data-preserve-scroll="count-matrix-' + st.id + '">';
          html += '<table class="count-matrix-table" style="border-collapse:separate;border-spacing:0;width:100%;border:none;">';

          // Top header row
          var searchHeaderSizesHtml = st.sizes.map(function (size) {
            return '<th style="font-family:var(--font-mono);font-size:11px;font-weight:700;padding:8px 8px;letter-spacing:0.06em;color:var(--ink-muted);border-bottom:1px solid var(--border-cell);border-right:1px solid var(--border-cell);">' + esc(size) + '</th>';
          }).join("");

          html += '<thead><tr style="background:var(--bg-input);">';
          html += '<th class="count-sticky-col" style="position:sticky;left:0;background:var(--bg-input);z-index:11;text-align:left;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.06em;padding:8px 16px;color:var(--ink-muted);border-bottom:1px solid var(--border-cell);border-right:1px solid var(--border-cell);box-shadow:var(--shadow-pin);transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">COLOR</th>';
          html += searchHeaderSizesHtml;
          html += '<th style="width:20px;background:var(--bg-input);border-bottom:1px solid var(--border-cell);"></th>';
          html += '</tr></thead>';

          // Body
          var searchRowsHtml = matches.map(function (match, rowIdx) {
            var color = match.name;
            var ci = match.ci;
            var rowBg = rowIdx % 2 === 0 ? "var(--panel)" : "var(--panel-alt)";
            var isLastRow = rowIdx === matches.length - 1;
            var borderBottomStyle = isLastRow ? 'border-bottom:none;' : 'border-bottom:1px solid var(--border-cell);';

            var rowCellsHtml = st.sizes.map(function (_, si) {
              var key = cellKey(ci, si);
              var count = st.counts ? st.counts[key] : undefined;
              var isCounted = count !== undefined;
              var cellBoxBg = isCounted ? 'background:var(--counted-bg);color:var(--counted-text);' : 'background:transparent;color:var(--ink-muted);';

              var isEditing = ui.editingCount && ui.editingCount.styleId === st.id && ui.editingCount.colorIdx === ci && ui.editingCount.sizeIdx === si;
              var numberDisplay = isEditing
                ? '<input class="js-autofocus count-cell-input" data-role="count-input" data-style-id="' + st.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="' + (count === undefined ? "" : count) + '" />'
                : '<button class="btn-reset tap-btn count-num-btn" data-action="count-edit-start" data-style-id="' + st.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="width:28px;text-align:center;font-family:var(--font-mono);font-size:12px;font-weight:700;color:inherit;">' + (count === undefined ? "-" : count) + '</button>';

              return '<td class="count-cell-td" style="padding:4px 6px;border-right:1px solid var(--border-cell);' + borderBottomStyle + 'vertical-align:middle;' + cellBoxBg + '">' +
                '<div style="display:flex;align-items:center;justify-content:center;gap:3px;height:36px;min-width:72px;">' +
                '<button class="btn-reset tap-btn count-stepper-btn" data-action="dec-count" data-style-id="' + st.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:inherit;">−</button>' +
                numberDisplay +
                '<button class="btn-reset tap-btn count-stepper-btn" data-action="inc-count" data-style-id="' + st.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:inherit;">+</button>' +
                '</div></td>';
            }).join("");

            return '<tr style="background:' + rowBg + ';">' +
              '<td class="count-sticky-col" style="position:sticky;left:0;background:' + rowBg + ';z-index:10;font-family:var(--font-mono);font-size:12px;font-weight:700;padding:8px 16px;min-width:140px;border-right:1px solid var(--border-cell);' + borderBottomStyle + 'box-shadow:var(--shadow-pin);text-align:left;vertical-align:middle;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">' +
              '<div style="display:flex;align-items:center;line-height:1.35;padding:2px 0;">' +
              countColorCircle(color, ci, st, false) +
              '<span style="letter-spacing:0.03em;color:var(--ink);">' + esc(color) + '</span>' +
              '</div>' +
              '</td>' +
              rowCellsHtml +
              '<td style="background:' + rowBg + ';' + borderBottomStyle + '"></td></tr>';
          }).join("");

          html += '<tbody>' + searchRowsHtml + '</tbody></table></div></div>';
        });
      }
    } else if (s) {
      var hasCounts = s && Object.keys(s.counts || {}).some(function (k) {
        return s.counts[k] !== undefined;
      });

      // Header label above matrix (INVENTORY MATRIX, EDIT MATRIX on left, CLEAR COUNTS on right only if counts exist)
      html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px;margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);">INVENTORY MATRIX</span>' +
        '<button class="btn-reset tap-btn edit-matrix-btn' + (ui.editStructure ? ' is-active' : '') + '" data-action="toggle-edit-structure" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;padding:4px 8px;border-radius:4px;' + (ui.editStructure ? 'background:var(--primary);color:var(--on-primary);' : 'background:var(--panel-alt);border:1px solid var(--border-subtle);color:var(--ink-muted);') + '">' +
        (ui.editStructure ? '✓ DONE EDITING' : '⚙ EDIT MATRIX') + '</button>' +
        '</div>';
      if (hasCounts) {
        html += '<button class="btn-reset tap-btn clear-action-btn" data-action="clear-all" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;color:var(--ink-muted);display:inline-flex;align-items:center;gap:4px;">≡ CLEAR COUNTS</button>';
      }
      html += '</div>';

      // Table with Dark top row, full grid row & column lines, stepped row colors
      html += '<div style="border:1px solid var(--border-cell);border-radius:8px;background:var(--panel);overflow:hidden;margin-bottom:24px;box-shadow:var(--shadow-card);">';
      html += '<div style="overflow-x:auto;" class="matrix-table-scroll" data-preserve-scroll="count-matrix">';
      html += '<table class="count-matrix-table" style="border-collapse:separate;border-spacing:0;width:100%;border:none;">';
      
      // Top header row
      var matrixHeaderSizesHtml = s.sizes.map(function (size, si) {
        var cellContent = "";
        if (ui.editStructure) {
          if (ui.editingSize === si) {
            cellContent = '<input class="js-autofocus edit-tool-pop" data-role="size-name-input" data-size-idx="' + si + '" value="' + esc(size) + '" style="width:38px;font-size:11px;text-align:center;background:var(--elevated);border:1px solid var(--primary);color:var(--ink);border-radius:4px;padding:4px 0;" />';
          } else {
            cellContent = '<div class="edit-tool-pop" style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
              '<button class="btn-reset tap-btn matrix-name-btn" data-action="size-name-edit-start" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);text-decoration:underline;">' + esc(size) + '</button>' +
              '<div style="display:flex;align-items:center;gap:4px;">' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-size" data-size-idx="' + si + '" data-dir="-1" title="Move left"' + (si === 0 ? " disabled" : "") + '>◀</button>' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-size" data-size-idx="' + si + '" data-dir="1" title="Move right"' + (si === s.sizes.length - 1 ? " disabled" : "") + '>▶</button>' +
              (s.sizes.length > 1 ? '<button class="btn-reset tap-btn matrix-icon-btn matrix-delete-btn" data-action="delete-size" data-size-idx="' + si + '" title="Delete size">✕</button>' : '') +
              '</div></div>';
          }
        } else {
          cellContent = esc(size);
        }
        return '<th style="font-family:var(--font-mono);font-size:11px;font-weight:700;padding:8px 8px;letter-spacing:0.06em;color:var(--ink-muted);border-bottom:1px solid var(--border-cell);border-right:1px solid var(--border-cell);">' + cellContent + '</th>';
      }).join("");

      var extraHeaderTh = "";
      if (ui.editStructure) {
        if (ui.addingSize) {
          extraHeaderTh = '<th style="padding:4px;border-bottom:1px solid var(--border-cell);"><input class="js-autofocus edit-tool-pop" data-role="add-size-input" placeholder="Size" style="width:42px;font-size:10px;padding:4px 4px;border:1px solid var(--primary);border-radius:4px;background:var(--elevated);color:var(--ink);" /></th>';
        } else {
          extraHeaderTh = '<th style="padding:4px;border-bottom:1px solid var(--border-cell);"><button class="btn-reset tap-btn edit-tool-pop matrix-add-btn" data-action="add-size-toggle" style="padding:4px 8px;font-size:10px;font-family:var(--font-mono);font-weight:700;border:1px dashed var(--border);border-radius:4px;color:var(--primary);white-space:nowrap;">+ SIZE</button></th>';
        }
      } else {
        extraHeaderTh = '<th style="width:20px;background:var(--bg-input);border-bottom:1px solid var(--border-cell);"></th>';
      }

      html += '<thead><tr style="background:var(--bg-input);">';
      html += '<th class="count-sticky-col" style="position:sticky;left:0;background:var(--bg-input);z-index:11;text-align:left;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.06em;padding:8px 16px;color:var(--ink-muted);border-bottom:1px solid var(--border-cell);border-right:1px solid var(--border-cell);box-shadow:var(--shadow-pin);transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">COLOR</th>';
      html += matrixHeaderSizesHtml;
      html += extraHeaderTh;
      html += '</tr></thead>';

      // Stepped rows with uniform row height, balanced vertical centering, and spacious color column
      var matrixRowsHtml = s.colors.map(function (color, ci) {
        var rowBg = ci % 2 === 0 ? "var(--panel)" : "var(--panel-alt)";
        var isLastRow = (ci === s.colors.length - 1) && !ui.editStructure;
        var borderBottomStyle = isLastRow ? 'border-bottom:none;' : 'border-bottom:1px solid var(--border-cell);';

        var colorColContent = "";
        if (ui.editStructure) {
          if (ui.editingColor === ci) {
            colorColContent = '<input class="js-autofocus edit-tool-pop" data-role="color-name-input" data-color-idx="' + ci + '" value="' + esc(color) + '" style="width:80px;font-size:12px;padding:4px 4px;background:var(--elevated);border:1px solid var(--primary);color:var(--ink);border-radius:4px;" />';
          } else {
            colorColContent = '<div class="edit-tool-pop" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
              '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' +
              countColorCircle(color, ci, s, true) +
              '<button class="btn-reset tap-btn matrix-name-btn" data-action="color-name-edit-start" data-color-idx="' + ci + '" style="letter-spacing:0.03em;color:var(--ink);font-family:var(--font-mono);font-size:12px;font-weight:700;text-decoration:underline;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(color) + '</button>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-palette-btn" data-action="open-color-picker" data-color-idx="' + ci + '" title="Edit color swatch">' + ICON_PALETTE + '</button>' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-color" data-color-idx="' + ci + '" data-dir="-1" title="Move up"' + (ci === 0 ? " disabled" : "") + '>▲</button>' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-color" data-color-idx="' + ci + '" data-dir="1" title="Move down"' + (ci === s.colors.length - 1 ? " disabled" : "") + '>▼</button>' +
              (s.colors.length > 1 ? '<button class="btn-reset tap-btn matrix-icon-btn matrix-delete-btn" data-action="delete-color" data-color-idx="' + ci + '" title="Delete color">✕</button>' : '') +
              '</div></div>';
          }
        } else {
          colorColContent = '<div style="display:flex;align-items:center;line-height:1.35;padding:2px 0;">' +
            countColorCircle(color, ci, s, false) +
            '<span style="letter-spacing:0.03em;color:var(--ink);">' + esc(color) + '</span>' +
            '</div>';
        }

        var cellsHtml = s.sizes.map(function (_, si) {
          var key = cellKey(ci, si);
          var count = s.counts[key];
          var isCounted = count !== undefined;
          
          var cellBoxBg = isCounted ? 'background:var(--counted-bg);color:var(--counted-text);' : 'background:transparent;color:var(--ink-muted);';

          var isEditing = ui.editingCount && ui.editingCount.styleId === s.id && ui.editingCount.colorIdx === ci && ui.editingCount.sizeIdx === si;
          var numberDisplay = isEditing
            ? '<input class="js-autofocus count-cell-input" data-role="count-input" data-style-id="' + s.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="' + (count === undefined ? "" : count) + '" />'
            : '<button class="btn-reset tap-btn count-num-btn" data-action="count-edit-start" data-style-id="' + s.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="width:28px;text-align:center;font-family:var(--font-mono);font-size:12px;font-weight:700;color:inherit;">' + (count === undefined ? "-" : count) + '</button>';

          return '<td class="count-cell-td" style="padding:4px 6px;border-right:1px solid var(--border-cell);' + borderBottomStyle + 'vertical-align:middle;' + cellBoxBg + '">' +
            '<div style="display:flex;align-items:center;justify-content:center;gap:3px;height:36px;min-width:72px;">' +
            '<button class="btn-reset tap-btn count-stepper-btn" data-action="dec-count" data-style-id="' + s.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:inherit;">−</button>' +
            numberDisplay +
            '<button class="btn-reset tap-btn count-stepper-btn" data-action="inc-count" data-style-id="' + s.id + '" data-color-idx="' + ci + '" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:inherit;">+</button>' +
            '</div></td>';
        }).join("");

        return '<tr style="background:' + rowBg + ';">' +
          '<td class="count-sticky-col" style="position:sticky;left:0;background:' + rowBg + ';z-index:10;font-family:var(--font-mono);font-size:12px;font-weight:700;padding:8px 16px;min-width:140px;border-right:1px solid var(--border-cell);' + borderBottomStyle + 'box-shadow:var(--shadow-pin);text-align:left;vertical-align:middle;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">' +
          colorColContent +
          '</td>' +
          cellsHtml +
          '<td style="background:' + rowBg + ';' + borderBottomStyle + '"></td></tr>';
      }).join("");

      html += '<tbody>' + matrixRowsHtml;

      // Bottom Add Color Row when editing structure
      if (ui.editStructure) {
        html += '<tr style="border-top:1px solid var(--border-subtle);background:var(--panel);">';
        html += '<td colspan="' + (s.sizes.length + 2) + '" style="padding:8px 12px;border-bottom:none;">';
        if (ui.addingColor) {
          html += '<div class="edit-tool-pop" style="display:flex;align-items:center;gap:8px;"><input class="js-autofocus" data-role="add-color-input" placeholder="New color name" style="width:140px;font-size:12px;padding:4px 8px;border:1px solid var(--primary);border-radius:4px;background:var(--elevated);color:var(--ink);" /><span style="font-size:10px;color:var(--ink-muted);">Press Enter to add</span></div>';
        } else {
          html += '<button class="btn-reset tap-btn edit-tool-pop matrix-add-btn" data-action="add-color-toggle" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--primary);display:inline-flex;align-items:center;gap:8px;padding:4px 8px;border:1px dashed var(--border);border-radius:4px;">+ ADD COLOR</button>';
        }
        html += '</td></tr>';
      }

      html += '</tbody></table></div>';
      html += '</div>';
    }

    // (15) COUNTED STOCK Card (IMAGE 4)
    var totalCount = itemCount(sh, "count");
    var countSummaryText = buildSummary(sh, "count");

    var countCardPadding = ui.summaryOpen ? "16px 20px" : "8px 16px";
    html += '<div class="tap-card" style="border:1px solid var(--border);border-radius:12px;background:var(--panel);padding:' + countCardPadding + ';margin-bottom:20px;box-shadow:var(--shadow-card);">';
    
    // (6) Header row: Green filing cabinet icon + COUNTED STOCK on left, TOTAL: N badge on right (perfect vertical centering)
    html += '<div class="summary-header-btn" data-action="toggle-summary" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;line-height:1;">';
    html += '<div style="display:inline-flex;align-items:center;gap:8px;line-height:1;">' +
      '<span style="color:var(--primary);display:inline-flex;align-items:center;">' + ICON_CABINET_BOX + '</span>' +
      '<span style="font-family:var(--font-sans);font-size:14px;font-weight:800;letter-spacing:0.02em;color:var(--ink);line-height:1;">COUNTED STOCK</span>' +
      '</div>';
    html += '<div style="display:inline-flex;align-items:center;gap:8px;line-height:1;">';
    html += '<div id="count-total-badge" style="background:var(--badge-ok-bg);border:1px solid var(--badge-ok-border);color:var(--primary);border-radius:4px;padding:4px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;line-height:1;display:inline-flex;align-items:center;">' +
      'TOTAL: ' + totalCount + '</div>';
    html += '<button class="btn-reset tap-btn summary-toggle-arrow-btn" style="color:var(--ink-muted);font-size:10px;line-height:1;">' +
      '<span class="toggle-rot-icon ' + (ui.summaryOpen ? "is-open" : "") + '" style="font-size:10px;display:inline-flex;align-items:center;">' + ICON_CHEVRON_DOWN + '</span></button>';
    html += '</div>';
    html += '</div>';

    // Summary content in smooth collapsible grid with 12px clearance
    html += '<div class="collapsible-grid ' + (ui.summaryOpen ? "is-open" : "") + '" id="count-summary-collapse">';
    html += '<div class="collapsible-inner">';
    html += '<div style="padding-top:12px;">';
    html += '<div style="background:var(--bg-deep);border:1px solid var(--border-subtle);border-radius:4px;padding:8px 12px;margin-bottom:12px;">';
    html += '<textarea id="summary-textarea" readonly rows="' + Math.min(10, Math.max(3, countSummaryText.split("\n").length)) + '" style="width:100%;font-family:var(--font-mono);font-size:12px;line-height:1.6;white-space:pre;overflow-x:auto;color:var(--ink-primary);resize:none;">' + esc(countSummaryText) + '</textarea>';
    html += '</div>';

    // Actions: COPY LIST & SAVE TO HISTORY (reverted to rich layout)
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn-reset tap-btn action-btn-secondary" data-action="copy-summary" style="flex:1 1 130px;min-width:110px;padding:12px 8px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);border-radius:4px;font-family:var(--font-mono);font-size:clamp(10px, 2.7vw, 11px);font-weight:700;letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;">' +
      ICON_COPY + '<span id="copy-btn-label" style="white-space:nowrap;">' + ui.copyLabel + '</span></button>';
    html += '<button class="btn-reset tap-btn action-btn-secondary" data-action="save-snapshot" style="flex:1 1 130px;min-width:110px;padding:12px 8px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);border-radius:4px;font-family:var(--font-mono);font-size:clamp(10px, 2.7vw, 11px);font-weight:700;letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;">' +
      ICON_SAVE + '<span id="snapshot-btn-label" style="white-space:nowrap;">' + ui.snapshotLabel + '</span></button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // (6) Backup & Sync on COUNT page
    html += '<div style="margin-top:24px;">';
    html += sectionLabelHtml("BACKUP & SYNC");
    html += '<div style="display:flex;gap:8px;">';
    html += '<button class="btn-reset tap-btn backup-sync-btn" data-action="export-backup" style="flex:1;padding:8px 12px;background:var(--panel);border:1px solid var(--border-subtle);border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-muted);display:flex;align-items:center;justify-content:center;gap:8px;">' +
      ICON_UPLOAD + 'EXPORT</button>';
    html += '<button class="btn-reset tap-btn backup-sync-btn" data-action="import-backup-trigger" style="flex:1;padding:8px 12px;background:var(--panel);border:1px solid var(--border-subtle);border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-muted);display:flex;align-items:center;justify-content:center;gap:8px;">' +
      ICON_DOWNLOAD + 'IMPORT</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }
