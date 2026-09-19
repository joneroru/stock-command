import { state, ui } from "../state.js";
import { activeShop, pageData, activeStyle } from "../actions.js";
import {
  esc, cellKey, resolveColorHex, formatColorName, formatSizeName, itemCount, buildSummary,
  quickFlagBreakdown, sectionLabelHtml
} from "../helpers.js";
import { renderShopMenuPopoverHtml, renderStyleMenuPopoverHtml } from "./navigation.js";
import {
  STATE_OK, STATE_LOW, STATE_CRIT, QUICK_STATE_STYLE,
  ICON_SAVE, ICON_COPY, ICON_PENCIL_WHITE, ICON_TRASH_WHITE,
  ICON_TRIANGLE_UP, ICON_TRIANGLE_DOWN, ICON_TRIANGLE_LEFT, ICON_TRIANGLE_RIGHT,
  ICON_PLUS_LIGHT, ICON_PALETTE, ICON_BROOM, ICON_STYLE_TOOL,
  ICON_STORE, ICON_CHECK, ICON_KEBAB, ICON_WARN_TRIANGLE, ICON_CHEVRON_DOWN,
  ICON_UPLOAD, ICON_DOWNLOAD
} from "../constants.js";

export function checkColorRect(name, ci, s, isEditing) {
    var colorHex = resolveColorHex(name, ci, s);
    if (isEditing) {
      return '<button class="btn-reset tap-btn matrix-swatch-btn" data-action="open-color-picker" data-color-idx="' + ci + '" title="Edit color swatch (' + colorHex + ')" style="touch-action:manipulation;display:inline-flex;align-items:center;margin-right:12px;flex:0 0 auto;vertical-align:middle;padding:2px 4px;border-radius:4px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.25);cursor:pointer;">' +
        '<span class="js-swatch-check-' + ci + '" style="display:inline-block;width:5px;height:18px;border-radius:4px;background:' + colorHex + ';"></span>' +
        '</button>';
    }
    return '<span class="js-swatch-check-' + ci + '" style="display:inline-block;width:4px;height:18px;border-radius:4px;background:' + colorHex + ';margin-right:12px;flex:0 0 auto;vertical-align:middle;"></span>';
  }


export function formatStylePillLabel(name) {
    if (!name) return "";
    var trimmed = name.trim();
    return '<span style="white-space:nowrap;line-height:1;display:inline-block;">' + esc(trimmed) + '</span>';
  }

  // (2) Glowing effect on LOW/OUT boxes on CHECK page with solid clean styling
export function quickCellHtml(styleId, ci, si, s) {
    var key = cellKey(ci, si);
    var v = s.cells[key] === undefined ? STATE_OK : s.cells[key];
    var isJustTapped = ui.justTappedCellKey === key;
    var animClass = isJustTapped ? ' class="cell-label-anim"' : '';
    
    var borderAndBg = "";
    var glowStyle = "";
    var labelHtml = "";
    var isActiveCell = false;
    
    if (v === STATE_OK) {
      borderAndBg = "border:1.5px dashed var(--border-cell);background:transparent;";
    } else if (v === STATE_LOW) {
      isActiveCell = true;
      borderAndBg = "border:1.5px solid var(--cell-low-border);background:var(--cell-low-bg);";
      glowStyle = "box-shadow:var(--cell-low-glow);";
      labelHtml = '<span' + animClass + ' style="font-family:var(--font-mono);font-size:10px;font-weight:900;letter-spacing:0.05em;color:var(--cell-low-ink);">LOW</span>';
    } else if (v === STATE_CRIT) {
      isActiveCell = true;
      borderAndBg = "border:1.5px solid var(--cell-out-border);background:var(--cell-out-bg);";
      glowStyle = "box-shadow:var(--cell-out-glow);";
      labelHtml = '<span' + animClass + ' style="font-family:var(--font-mono);font-size:10px;font-weight:900;letter-spacing:0.05em;color:var(--cell-out-ink);text-shadow:var(--cell-out-text-shadow);">OUT</span>';
    }

    var padTop = ci === 0 ? "8px" : "4px";
    var padBottom = (s && s.colors && ci === s.colors.length - 1) ? "8px" : "4px";

    return '<td style="padding:' + padTop + ' 4px ' + padBottom + ';vertical-align:middle;text-align:center;">' +
      '<button class="btn-reset tap-btn quick-cell-btn' + (isActiveCell ? ' is-active-cell' : '') + '" data-action="cycle-cell" data-color-idx="' + ci + '" data-size-idx="' + si + '" id="quick-cell-' + ci + '-' + si + '" style="width:38px;height:38px;border-radius:4px;' + borderAndBg + glowStyle + 'display:inline-flex;align-items:center;justify-content:center;margin:auto;">' +
      labelHtml +
      '</button></td>';
  }


  // ---------- CHECK PAGE (IMAGE 1 & 2) ----------
export function renderCheckPageHtml() {
    var sh = activeShop();
    var pd = pageData(sh);
    var s = activeStyle();
    var html = '<div class="page-view" style="padding:16px 16px 24px;">';

    // (1) QUICK CHECK Title + LIVE MODE, with line between title and shop dropdown
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<div style="font-family:var(--font-mono);font-size:14px;font-weight:700;letter-spacing:0.04em;color:var(--primary);">QUICK CHECK</div>' +
      '<div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--ink-muted);letter-spacing:0.08em;">LIVE MODE</div>' +
      '</div>';
    html += '<div style="height:1px;background:var(--border-subtle);margin-bottom:20px;"></div>';

    // Shop dropdown row + Kebab edit menu
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">';
    
    // Shop dropdown
    html += '<div style="position:relative;flex:1;min-width:0;display:flex;">';
    html += '<button class="btn-reset shop-picker-btn" data-action="shop-picker-toggle" style="width:100%;height:44px;min-height:44px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:0 16px;background:var(--panel);border:1px solid var(--border-subtle);border-radius:8px;color:var(--ink);font-size:14px;font-weight:700;">' +
      '<span style="color:var(--ink-muted);display:flex;flex:0 0 auto;">' + ICON_STORE + '</span>' +
      '<span style="flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-sans);">' + esc(sh.name) + '</span>' +
      '<span style="color:var(--ink-muted);font-size:11px;flex:0 0 auto;">' + (ui.shopPickerOpen ? "▲" : "▼") + '</span>' +
      '</button>';
    
    if (ui.shopPickerOpen) {
      html += '<div class="glass-dropdown-check" style="position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:30;border-radius:8px;overflow:hidden;">';
      state.shops.forEach(function (shp, idx) {
        var isActive = shp.id === sh.id;
        html += '<button class="btn-reset tap-btn glass-item" data-action="set-shop" data-shop-id="' + shp.id + '" style="width:100%;text-align:left;display:flex;align-items:center;gap:8px;padding:12px 16px;background:' + (isActive ? "var(--elevated)" : "transparent") + ';color:' + (isActive ? "var(--ink)" : "var(--ink-secondary)") + ';font-size:14px;font-weight:' + (isActive ? "700" : "500") + ';' + (idx < state.shops.length - 1 ? "border-bottom:1px solid var(--border-subtle);" : "") + '">' +
          '<span style="flex:0 0 auto;display:flex;color:' + (isActive ? "var(--primary)" : "var(--ink-muted)") + ';">' + ICON_STORE + '</span>' +
          '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-sans);">' + esc(shp.name) + '</span>' +
          (isActive ? '<span style="flex:0 0 auto;display:flex;color:var(--primary);">' + ICON_CHECK + '</span>' : '') +
          '</button>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Kebab Edit Menu for Shop
    html += '<div style="position:relative;flex:0 0 auto;">';
    html += '<button class="btn-reset check-shop-kebab-btn" data-action="shop-menu-toggle" title="Edit Shop" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;min-width:44px;min-height:44px;border:1px solid var(--border-subtle);border-radius:8px;background:var(--panel);color:var(--ink-muted);">' +
      ICON_KEBAB + '</button>';
    if (ui.shopMenuOpen) {
      html += renderShopMenuPopoverHtml(sh);
    }
    html += '</div>';
    html += '</div>';

    // (1) Style tabs bar with clean single-line pill buttons, smooth right fade mask, separator, and edit icon
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:8px;">';
    
    // Style tabs scroll container with smooth increased fade mask on right edge (56px)
    html += '<div class="style-tabs-scroll" data-preserve-scroll="check-style-tabs" style="flex:1;min-width:0;padding:4px 0 4px 6px;margin:-4px 0 -4px -6px;mask-image:linear-gradient(to right, black calc(100% - 56px), transparent 100%);-webkit-mask-image:linear-gradient(to right, black calc(100% - 56px), transparent 100%);">';
    pd.styles.forEach(function (st) {
      var isActive = s && st.id === s.id;
      var styleClasses = isActive
        ? 'background:var(--primary-pill-bg);border:1.5px solid var(--primary);color:var(--primary);'
        : 'background:var(--panel-alt);border:1px solid var(--border-subtle);color:var(--ink-muted);';
      html += '<button class="btn-reset tap-btn style-pill-btn' + (isActive ? ' is-active' : '') + '" data-action="set-style" data-style-id="' + st.id + '" style="height:36px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:var(--font-mono);font-size:clamp(11px, 2.7vw, 12px);font-weight:700;letter-spacing:0.03em;border-radius:8px;line-height:1;white-space:nowrap;flex-shrink:0;' + styleClasses + '">' +
        esc(st.name) + '</button>';
    });
    if (ui.addingStyle) {
      html += '<input class="js-autofocus" data-role="add-style-input" placeholder="STYLE" style="width:92px;height:36px;font-family:var(--font-mono);font-size:12px;border:1.5px solid var(--primary);border-radius:8px;background:var(--panel);color:var(--ink);padding:4px 16px;box-sizing:border-box;flex-shrink:0;" />';
    } else {
      html += '<button class="btn-reset tap-btn style-add-btn" data-action="add-style-toggle" style="height:36px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:0.04em;border-radius:8px;padding:0 16px;line-height:1;white-space:nowrap;flex-shrink:0;">+ STYLE</button>';
    }
    // Trailing spacer so right dashed border of + STYLE never gets cut off when scrolled to the end
    html += '<div style="width:18px;flex:0 0 18px;height:1px;"></div>';
    html += '</div>';

    // (7) & (8) Perfectly aligned vertical divider and centered style edit tool (44x44px touch target)
    html += '<div style="display:flex;align-items:center;gap:4px;flex:0 0 auto;margin-left:4px;align-self:center;">';
    html += '<div style="width:1.5px;height:34px;background:var(--border-subtle);flex-shrink:0;border-radius:4px;"></div>';

    // Style edit menu toggle for Check page
    html += '<div style="position:relative;display:flex;align-items:center;">';
    html += '<button class="btn-reset tool-icon-btn" data-action="style-menu-toggle" title="Style Settings" style="color:var(--ink-muted);display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;min-width:44px;min-height:44px;border-radius:4px;border:1px solid transparent;">' + ICON_STYLE_TOOL + '</button>';
    if (ui.styleMenuOpen) {
      html += renderStyleMenuPopoverHtml(s, pd.styles);
    }
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // (3) MATRIX CONTAINER: GRID VIEW, EDIT MATRIX, and CLEAR FLAGS above table
    if (s) {
      var hasFlags = s && Object.keys(s.cells || {}).some(function (k) {
        return s.cells[k] === STATE_LOW || s.cells[k] === STATE_CRIT;
      });

      // Header row above table
      html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px;margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);">GRID VIEW</span>' +
        '<button class="btn-reset tap-btn edit-matrix-btn' + (ui.editStructure ? ' is-active' : '') + '" data-action="toggle-edit-structure" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;padding:4px 8px;border-radius:4px;' + (ui.editStructure ? 'background:var(--primary);color:var(--on-primary);' : 'background:var(--panel-alt);border:1px solid var(--border-subtle);color:var(--ink-muted);') + '">' +
        (ui.editStructure ? '✓ DONE EDITING' : '⚙ EDIT MATRIX') + '</button>' +
        '</div>';
      if (hasFlags) {
        html += '<button class="btn-reset tap-btn clear-action-btn" data-action="clear-all" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;color:var(--ink-muted);display:inline-flex;align-items:center;gap:4px;">≡ CLEAR FLAGS</button>';
      }
      html += '</div>';

      // Clean Table Matrix
      html += '<div style="border:1px solid var(--border-subtle);border-radius:12px;background:var(--panel);overflow:hidden;margin-bottom:24px;box-shadow:var(--shadow-card);">';
      html += '<div style="overflow-x:auto;" class="matrix-table-scroll" data-preserve-scroll="quick-matrix">';
      html += '<table class="count-matrix-table" style="background:var(--panel);width:100%;border-collapse:separate;border-spacing:0;">';
      
      // Top header row
      var checkHeaderSizesHtml = s.sizes.map(function (size, si) {
        var content = "";
        if (ui.editStructure) {
          if (ui.editingSize === si) {
            content = '<input class="js-autofocus edit-tool-pop" data-role="size-name-input" data-size-idx="' + si + '" value="' + esc(size) + '" style="width:38px;font-size:11px;text-align:center;background:var(--elevated);border:1px solid var(--primary);color:var(--ink);border-radius:4px;padding:4px 0;" />';
          } else {
            content = '<div class="edit-tool-pop" style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
              '<button class="btn-reset tap-btn matrix-name-btn" data-action="size-name-edit-start" data-size-idx="' + si + '" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);text-decoration:underline;">' + esc(size) + '</button>' +
              '<div style="display:flex;align-items:center;gap:4px;">' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-size" data-size-idx="' + si + '" data-dir="-1" title="Move left"' + (si === 0 ? " disabled" : "") + '>◀</button>' +
              '<button class="btn-reset tap-btn matrix-icon-btn matrix-reorder-btn" data-action="move-size" data-size-idx="' + si + '" data-dir="1" title="Move right"' + (si === s.sizes.length - 1 ? " disabled" : "") + '>▶</button>' +
              (s.sizes.length > 1 ? '<button class="btn-reset tap-btn matrix-icon-btn matrix-delete-btn" data-action="delete-size" data-size-idx="' + si + '" title="Delete size">✕</button>' : '') +
              '</div></div>';
          }
        } else {
          content = esc(size);
        }
        return '<th style="font-family:var(--font-mono);font-size:11px;font-weight:700;padding:8px 8px;letter-spacing:0.06em;color:var(--ink-muted);">' + content + '</th>';
      }).join("");

      var extraHeaderTh = "";
      if (ui.editStructure) {
        if (ui.addingSize) {
          extraHeaderTh = '<th style="padding:4px;"><input class="js-autofocus edit-tool-pop" data-role="add-size-input" placeholder="Size" style="width:42px;font-size:10px;padding:4px 4px;border:1px solid var(--primary);border-radius:4px;background:var(--elevated);color:var(--ink);" /></th>';
        } else {
          extraHeaderTh = '<th style="padding:4px;"><button class="btn-reset tap-btn edit-tool-pop matrix-add-btn" data-action="add-size-toggle" style="padding:4px 8px;font-size:10px;font-family:var(--font-mono);font-weight:700;border:1px dashed var(--border);border-radius:4px;color:var(--primary);white-space:nowrap;">+ SIZE</button></th>';
        }
      } else {
        extraHeaderTh = '<th style="width:20px;background:var(--bg-input);"></th>';
      }

      html += '<thead><tr style="background:var(--bg-input);border-bottom:1px solid var(--border);">';
      html += '<th class="count-sticky-col" style="position:sticky;left:0;background:var(--bg-input);z-index:11;text-align:left;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.06em;padding:8px 16px;color:var(--ink-muted);box-shadow:var(--shadow-pin);transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">COLOR</th>';
      html += checkHeaderSizesHtml;
      html += extraHeaderTh;
      html += '</tr></thead>';

      // Compact rows with equal uniform height and centered alignment
      var checkRowsHtml = s.colors.map(function (color, ci) {
        var padTop = ci === 0 ? "8px" : "4px";
        var padBottom = ci === s.colors.length - 1 ? "8px" : "4px";
        
        var colorColContent = "";
        if (ui.editStructure) {
          if (ui.editingColor === ci) {
            colorColContent = '<input class="js-autofocus edit-tool-pop" data-role="color-name-input" data-color-idx="' + ci + '" value="' + esc(color) + '" style="width:80px;font-size:12px;padding:4px 4px;background:var(--elevated);border:1px solid var(--primary);color:var(--ink);border-radius:4px;" />';
          } else {
            colorColContent = '<div class="edit-tool-pop" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
              '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' +
              checkColorRect(color, ci, s, true) +
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
          colorColContent = '<div style="display:flex;align-items:center;line-height:1.35;padding:4px 0;">' +
            checkColorRect(color, ci, s, false) +
            '<span style="letter-spacing:0.03em;color:var(--ink);">' + esc(color) + '</span>' +
            '</div>';
        }

        var cellsHtml = s.sizes.map(function (_, si) {
          return quickCellHtml(s.id, ci, si, s);
        }).join("");

        return '<tr style="background:var(--panel);">' +
          '<td class="count-sticky-col" style="position:sticky;left:0;background:var(--panel);z-index:10;font-family:var(--font-mono);font-size:12px;font-weight:700;padding:' + padTop + ' 16px ' + padBottom + ';min-width:140px;box-shadow:var(--shadow-pin);text-align:left;vertical-align:middle;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;">' +
          colorColContent +
          '</td>' +
          cellsHtml +
          '<td style="background:var(--panel);"></td></tr>';
      }).join("");

      html += '<tbody>' + checkRowsHtml;

      // Bottom Add Color Row when editing structure
      if (ui.editStructure) {
        html += '<tr style="border-top:1px solid var(--border-subtle);background:var(--panel);">';
        html += '<td colspan="' + (s.sizes.length + 2) + '" style="padding:8px 12px;">';
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

    // (5) RESTOCK LIST Card with Green icon & "N ITEMS" badge & collapsible toggle
    var summaryText = buildSummary(sh, "quick");
    var totalFlags = quickFlagBreakdown(sh).low + quickFlagBreakdown(sh).out;

    var checkCardPadding = ui.summaryOpen ? "16px 20px" : "8px 16px";
    html += '<div class="tap-card" style="border:1px solid var(--border-subtle);border-radius:12px;background:var(--panel);padding:' + checkCardPadding + ';margin-bottom:20px;box-shadow:var(--shadow-card);">';
    
    // (6) Header row: Green warning triangle + RESTOCK LIST on left, Green "N ITEMS" badge & toggle on right (perfect vertical centering)
    html += '<div class="summary-header-btn" data-action="toggle-summary" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;line-height:1;">';
    html += '<div style="display:inline-flex;align-items:center;gap:8px;line-height:1;">' +
      '<span style="color:var(--primary);display:inline-flex;align-items:center;">' + ICON_WARN_TRIANGLE + '</span>' +
      '<span style="font-family:var(--font-mono);font-size:12px;font-weight:800;letter-spacing:0.04em;color:var(--ink);line-height:1;">RESTOCK LIST</span>' +
      '</div>';
    html += '<div style="display:inline-flex;align-items:center;gap:8px;line-height:1;">';
    html += '<div id="quick-total-badge" style="background:var(--badge-ok-bg);border:1px solid var(--badge-ok-border);color:var(--primary);border-radius:4px;padding:4px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;line-height:1;display:inline-flex;align-items:center;">' +
      totalFlags + ' ITEMS</div>';
    html += '<button class="btn-reset tap-btn summary-toggle-arrow-btn" style="color:var(--ink-muted);font-size:10px;line-height:1;">' +
      '<span class="toggle-rot-icon ' + (ui.summaryOpen ? "is-open" : "") + '" style="font-size:10px;display:inline-flex;align-items:center;">' + ICON_CHEVRON_DOWN + '</span></button>';
    html += '</div>';
    html += '</div>';

    // Summary box and buttons in smooth collapsible grid with 12px top clearance
    html += '<div class="collapsible-grid ' + (ui.summaryOpen ? "is-open" : "") + '" id="check-summary-collapse">';
    html += '<div class="collapsible-inner">';
    html += '<div style="padding-top:12px;">';
    html += '<div style="background:var(--bg-deep);border:1px solid var(--border-subtle);border-radius:4px;padding:8px 12px;margin-bottom:12px;">';
    html += '<textarea id="summary-textarea" readonly rows="' + Math.min(10, Math.max(3, summaryText.split("\n").length)) + '" style="width:100%;font-family:var(--font-mono);font-size:12px;line-height:1.6;white-space:pre;overflow-x:auto;color:var(--ink-primary);resize:none;">' + esc(summaryText) + '</textarea>';
    html += '</div>';

    // Action buttons (reverted to original rich spacing)
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    html += '<button class="btn-reset tap-btn action-btn-primary" data-action="copy-summary" style="width:100%;padding:12px;background:var(--primary);color:var(--on-primary);border-radius:4px;font-family:var(--font-mono);font-size:12px;font-weight:800;letter-spacing:0.06em;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;white-space:nowrap;">' +
      ICON_COPY + '<span id="copy-btn-label" style="white-space:nowrap;line-height:1;display:inline-flex;align-items:center;">' + ui.copyLabel + '</span></button>';
    html += '<button class="btn-reset tap-btn action-btn-secondary" data-action="save-snapshot" style="width:100%;padding:12px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);border-radius:4px;font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:0.04em;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;">' +
      ICON_SAVE + '<span id="snapshot-btn-label" style="white-space:nowrap;line-height:1;display:inline-flex;align-items:center;">' + ui.snapshotLabel + '</span></button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // Backup & Sync
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
