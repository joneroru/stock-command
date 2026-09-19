import { state, ui } from "../state.js";
import { render } from "./index.js";
import { activeStyle, setColorHex } from "../actions.js";
import { hexToRgb, rgbToHex, resolveColorHex, esc } from "../helpers.js";
import { ICON_WARN_TRIANGLE, ICON_X, ICON_PALETTE } from "../constants.js";

export function updateLiveModalColor(s, ci, newHex, source) {
    var app = document.getElementById('app-root') || document;
    setColorHex(s.id, ci, newHex);
    var rgb = hexToRgb(newHex);

    if (source !== "hex-input") {
      var hexInput = app.querySelector('.js-color-hex-input[data-color-idx="' + ci + '"]');
      if (hexInput) {
        if (source === "preset" || source === "reset" || document.activeElement !== hexInput) {
          hexInput.value = newHex.toUpperCase();
        }
        if (source === "preset" || source === "reset") {
          try { hexInput.blur(); } catch (err) {}
        }
      }
    }

    var swatchBox = app.querySelector('.js-modal-swatch-box');
    if (swatchBox) {
      swatchBox.style.background = newHex;
      swatchBox.style.boxShadow = '0 0 8px ' + newHex + '44';
    }
    var checkPreview = app.querySelector('.js-modal-check-preview');
    if (checkPreview) {
      checkPreview.style.background = newHex;
      checkPreview.style.boxShadow = '0 0 8px ' + newHex + '88';
    }
    var countPreview = app.querySelector('.js-modal-count-preview');
    if (countPreview) {
      countPreview.style.background = newHex;
      countPreview.style.boxShadow = '0 0 8px ' + newHex + '88';
    }

    var rPct = Math.round((rgb.r / 255) * 100);
    var gPct = Math.round((rgb.g / 255) * 100);
    var bPct = Math.round((rgb.b / 255) * 100);

    var rSlider = app.querySelector('.js-rgb-slider-r');
    if (rSlider) {
      if (source !== "rgb-slider") rSlider.value = rgb.r;
      rSlider.style.background = 'linear-gradient(to right, #ef4444 0%, #ef4444 ' + rPct + '%, #232730 ' + rPct + '%, #232730 100%)';
    }
    var gSlider = app.querySelector('.js-rgb-slider-g');
    if (gSlider) {
      if (source !== "rgb-slider") gSlider.value = rgb.g;
      gSlider.style.background = 'linear-gradient(to right, #84cc16 0%, #84cc16 ' + gPct + '%, #232730 ' + gPct + '%, #232730 100%)';
    }
    var bSlider = app.querySelector('.js-rgb-slider-b');
    if (bSlider) {
      if (source !== "rgb-slider") bSlider.value = rgb.b;
      bSlider.style.background = 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + bPct + '%, #232730 ' + bPct + '%, #232730 100%)';
    }

    var rVal = app.querySelector('.js-rgb-val-r');
    if (rVal) rVal.textContent = rgb.r;
    var gVal = app.querySelector('.js-rgb-val-g');
    if (gVal) gVal.textContent = rgb.g;
    var bVal = app.querySelector('.js-rgb-val-b');
    if (bVal) bVal.textContent = rgb.b;

    // Live update preset buttons checkmark & border without full modal re-render
    var presetBtns = app.querySelectorAll('[data-action="select-color-preset"]');
    presetBtns.forEach(function (btn) {
      var isSel = (btn.dataset.hex || '').toLowerCase() === newHex.toLowerCase();
      btn.style.border = isSel ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.12)';
      btn.style.boxShadow = isSel ? '0 0 6px rgba(255,255,255,0.6)' : 'none';
      btn.innerHTML = isSel ? '<span style="color:' + ((btn.dataset.hex || '').toUpperCase() === '#F3F4F6' ? '#14161A' : '#FFFFFF') + ';font-size:10px;font-weight:900;">✓</span>' : '';
    });

    // Live update reset auto button visibility without rebuilding modal
    var resetWrap = app.querySelector('.js-modal-reset-wrap');
    if (resetWrap) {
      var isCustomNow = !!(s.colorHexes && s.colorHexes[ci] !== undefined && s.colorHexes[ci] !== null);
      resetWrap.style.display = isCustomNow ? 'block' : 'none';
    }

    var tableCheckSwatches = app.querySelectorAll('.js-swatch-check-' + ci);
    tableCheckSwatches.forEach(function (el) { el.style.background = newHex; });
    var tableCountSwatches = app.querySelectorAll('.js-swatch-count-' + ci);
    tableCountSwatches.forEach(function (el) { el.style.background = newHex; });
  }

export function renderColorPickerModalHtml(s, ci) {
    if (!s || ci === null || ci === undefined || !s.colors || !s.colors[ci]) return "";
    var colorName = s.colors[ci];
    var currentHex = resolveColorHex(colorName, ci, s);
    var isCustom = s.colorHexes && s.colorHexes[ci] !== undefined;
    var rgb = hexToRgb(currentHex);

    var presets = [
      { name: "Black", hex: "#14161A" },
      { name: "Charcoal", hex: "#2B313A" },
      { name: "Slate", hex: "#475569" },
      { name: "Grey", hex: "#8F95A3" },
      { name: "White", hex: "#F3F4F6" },
      { name: "Navy", hex: "#1E293B" },
      { name: "Royal Blue", hex: "#2563EB" },
      { name: "Sky Blue", hex: "#0EA5E9" },
      { name: "Teal", hex: "#0D9488" },
      { name: "Forest", hex: "#15803D" },
      { name: "Olive", hex: "#4D7C0F" },
      { name: "Sage", hex: "#84A98C" },
      { name: "Burgundy", hex: "#881337" },
      { name: "Crimson", hex: "#DC2626" },
      { name: "Coral", hex: "#F87171" },
      { name: "Rust", hex: "#C2410C" },
      { name: "Amber", hex: "#D97706" },
      { name: "Khaki / Tan", hex: "#C2B280" },
      { name: "Mocha / Brown", hex: "#5C3D2E" },
      { name: "Lavender", hex: "#7C3AED" }
    ];

    var html = '<div id="color-picker-overlay" class="modal-overlay-anim" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;touch-action:manipulation;">';
    
    html += '<div class="modal-anim" style="background:var(--panel);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-card);width:100%;max-width:340px;overflow:hidden;">';

    // Header
    html += '<div style="padding:12px 16px;background:var(--elevated);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;">';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:var(--primary);display:flex;">' + ICON_PALETTE + '</span>';
    html += '<span style="font-family:var(--font-mono);font-size:12px;font-weight:800;letter-spacing:0.06em;color:var(--ink);">SWATCH COLOR</span>';
    html += '</div>';
    html += '<button class="btn-reset tap-btn touch-hit-44" data-action="close-color-picker" style="touch-action:manipulation;color:var(--ink-muted);font-size:14px;padding:4px 8px;">✕</button>';
    html += '</div>';

    html += '<div style="padding:16px;">';

    // Color name & Live dual preview
    html += '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-deep);border:1px solid var(--border-subtle);border-radius:8px;padding:12px 16px;margin-bottom:16px;">';
    html += '<div>';
    html += '<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:0.04em;">ITEM COLOR</div>';
    html += '<div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink);margin-top:2px;">' + esc(colorName) + '</div>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:16px;">';
    html += '<div style="text-align:center;"><span class="js-modal-check-preview" style="display:inline-block;width:6px;height:22px;border-radius:4px;background:' + currentHex + ';box-shadow:0 0 8px ' + currentHex + '88;"></span><div style="font-size:10px;font-family:var(--font-mono);color:var(--ink-muted);margin-top:2px;">CHECK</div></div>';
    html += '<div style="text-align:center;"><span class="js-modal-count-preview" style="display:inline-block;width:14px;height:14px;border-radius:999px;background:' + currentHex + ';box-shadow:0 0 8px ' + currentHex + '88;"></span><div style="font-size:10px;font-family:var(--font-mono);color:var(--ink-muted);margin-top:2px;">COUNT</div></div>';
    html += '</div>';
    html += '</div>';

    // Hex Code Input
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    html += '<label style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;color:var(--ink-muted);">HEX CODE</label>';
    html += '<span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);">#000000 to #FFFFFF</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<div class="js-modal-swatch-box" style="width:38px;height:38px;border-radius:4px;border:1px solid var(--border);background:' + currentHex + ';flex:0 0 auto;box-shadow:0 0 8px ' + currentHex + '44;"></div>';
    html += '<div style="flex:1;">';
    html += '<input class="js-color-hex-input" data-role="color-hex-input" data-color-idx="' + ci + '" value="' + currentHex.toUpperCase() + '" maxlength="7" placeholder="#000000" style="width:100%;height:38px;padding:0 12px;background:var(--bg-deep);border:1px solid var(--primary);border-radius:4px;color:var(--ink);font-family:var(--font-mono);font-size:14px;font-weight:700;letter-spacing:0.06em;box-sizing:border-box;" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Custom Dark Theme RGB Sliders (Red, Green, Blue)
    var rPct = Math.round((rgb.r / 255) * 100);
    var gPct = Math.round((rgb.g / 255) * 100);
    var bPct = Math.round((rgb.b / 255) * 100);

    html += '<div style="margin-bottom:16px;background:var(--bg-deep);border:1px solid var(--border-subtle);border-radius:8px;padding:12px 16px;">';
    html += '<div style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;color:var(--ink-muted);margin-bottom:8px;">RGB COLOR CHANNELS</div>';

    // Red Slider
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    html += '<span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:#f87171;width:12px;">R</span>';
    html += '<input type="range" min="0" max="255" value="' + rgb.r + '" class="rgb-channel-slider slider-r js-rgb-slider-r" data-role="rgb-slider" data-channel="r" data-color-idx="' + ci + '" style="background:linear-gradient(to right, #ef4444 0%, #ef4444 ' + rPct + '%, rgba(120,120,120,0.3) ' + rPct + '%, rgba(120,120,120,0.3) 100%) !important;" />';
    html += '<span class="js-rgb-val-r" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);width:28px;text-align:right;">' + rgb.r + '</span>';
    html += '</div>';

    // Green Slider
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    html += '<span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:#84cc16;width:12px;">G</span>';
    html += '<input type="range" min="0" max="255" value="' + rgb.g + '" class="rgb-channel-slider slider-g js-rgb-slider-g" data-role="rgb-slider" data-channel="g" data-color-idx="' + ci + '" style="background:linear-gradient(to right, #84cc16 0%, #84cc16 ' + gPct + '%, rgba(120,120,120,0.3) ' + gPct + '%, rgba(120,120,120,0.3) 100%) !important;" />';
    html += '<span class="js-rgb-val-g" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);width:28px;text-align:right;">' + rgb.g + '</span>';
    html += '</div>';

    // Blue Slider
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:#60a5fa;width:12px;">B</span>';
    html += '<input type="range" min="0" max="255" value="' + rgb.b + '" class="rgb-channel-slider slider-b js-rgb-slider-b" data-role="rgb-slider" data-channel="b" data-color-idx="' + ci + '" style="background:linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + bPct + '%, rgba(120,120,120,0.3) ' + bPct + '%, rgba(120,120,120,0.3) 100%) !important;" />';
    html += '<span class="js-rgb-val-b" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);width:28px;text-align:right;">' + rgb.b + '</span>';
    html += '</div>';

    html += '</div>';

    // Quick Preset Swatches
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;color:var(--ink-muted);display:block;margin-bottom:8px;">PRESET PALETTES</label>';
    html += '<div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;">';
    presets.forEach(function (p) {
      var isSelected = p.hex.toLowerCase() === currentHex.toLowerCase();
      var borderStyle = isSelected ? "border:2px solid var(--ink);box-shadow:0 0 6px rgba(0,0,0,0.4);" : "border:1px solid var(--border);";
      html += '<button class="btn-reset tap-btn" data-action="select-color-preset" data-color-idx="' + ci + '" data-hex="' + p.hex + '" title="' + p.name + ' (' + p.hex + ')" style="touch-action:manipulation;height:28px;border-radius:4px;background:' + p.hex + ';' + borderStyle + 'cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;">';
      if (isSelected) {
        html += '<span style="color:' + (p.hex === '#F3F4F6' ? '#14161A' : '#FFFFFF') + ';font-size:10px;font-weight:900;">✓</span>';
      }
      html += '</button>';
    });
    html += '</div>';
    html += '</div>';

    // Buttons: Reset to Auto & Done
    html += '<div style="display:flex;gap:8px;padding-top:4px;">';
    html += '<div class="js-modal-reset-wrap" style="' + (isCustom ? '' : 'display:none;') + '">';
    html += '<button class="btn-reset tap-btn" data-action="reset-color-hex" data-color-idx="' + ci + '" style="touch-action:manipulation;padding:8px 12px;background:var(--panel-alt);border:1px solid var(--border);border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-muted);">';
    html += 'RESET AUTO</button>';
    html += '</div>';
    html += '<button class="btn-reset tap-btn" data-action="close-color-picker" style="touch-action:manipulation;flex:1;padding:8px 16px;background:var(--primary);border-radius:4px;font-family:var(--font-mono);font-size:12px;font-weight:800;color:var(--on-primary);letter-spacing:0.04em;">';
    html += 'DONE ✓</button>';
    html += '</div>';

    html += '</div>'; // padding
    html += '</div>'; // modal card
    html += '</div>'; // overlay

    return html;
  }

  // ---------- Confirmation Dialog Modal ----------
export function openConfirmDialog(config) {
    ui.confirmDialog = config;
    render();
  }

export function closeConfirmDialog() {
    ui.confirmDialog = null;
    render();
  }

export function renderConfirmDialogHtml() {
    var d = ui.confirmDialog;
    if (!d) return "";
    var title = d.title || "Are you sure?";
    var message = d.message || "This action cannot be undone.";
    var confirmText = d.confirmText || "Confirm";
    var cancelText = d.cancelText || "Cancel";
    var isDanger = d.danger !== false;

    var btnBg = isDanger ? "background:var(--red);color:#ffffff;" : "background:var(--primary);color:var(--on-primary);";

    var html = '<div id="confirm-modal-overlay" class="modal-overlay-fade" style="position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:90;display:flex;align-items:center;justify-content:center;padding:16px;">';
    html += '<div class="modal-pop-card" style="width:100%;max-width:340px;background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-card);">';
    
    // Dialog Body
    html += '<div style="padding:16px 20px 16px;">';
    html += '<div style="font-family:var(--font-mono);font-size:14px;font-weight:800;color:var(--ink);letter-spacing:0.02em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">';
    if (isDanger) {
      html += '<span style="color:var(--red);display:inline-flex;align-items:center;">' + ICON_WARN_TRIANGLE + '</span>';
    }
    html += '<span>' + esc(title) + '</span>';
    html += '</div>';
    
    html += '<div style="font-size:12px;color:var(--ink-muted);line-height:1.5;">' + esc(message) + '</div>';
    html += '</div>';

    // Dialog Footer Buttons
    html += '<div style="display:flex;gap:8px;padding:12px 20px 16px;background:transparent;border-top:1px solid var(--border-subtle);">';
    html += '<button class="btn-reset tap-btn" data-action="confirm-dialog-cancel" style="flex:1;padding:8px 12px;background:var(--panel-alt);border:1px solid var(--border);border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink);letter-spacing:0.03em;">' +
      esc(cancelText) + '</button>';
    html += '<button class="btn-reset tap-btn" data-action="confirm-dialog-confirm" style="flex:1;padding:8px 12px;' + btnBg + 'border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:800;letter-spacing:0.03em;border:none;">' +
      esc(confirmText) + '</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    return html;
  }


export function getModalHtml() {
    if (ui.confirmDialog !== null) {
      return renderConfirmDialogHtml();
    }
    var activePage = (state && state.activePage) || "quick";
    if (ui.colorPickerModal !== null && activePage !== "history" && activePage !== "notes") {
      return renderColorPickerModalHtml(activeStyle(), ui.colorPickerModal.colorIdx);
    }
    return "";
  }
