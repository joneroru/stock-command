import { state, setState, ui, save, loadFromCloud, migrateState, setSyncStatus } from "./state.js";
import { render, isRendering } from "./render/index.js";
import {
  activeShop, pageData, activeStyle,
  cycleCell, incCount, decCount, setCountManual,
  renameStyle, moveStyle, addStyleObj, removeStyle, clearAll, clearAllStyles,
  addColor, setColorHex, ensureColorHex, removeColor, renameColor, moveColor,
  addSize, removeSize, renameSize, moveSize,
  renameShop, moveShop, addShopObj, removeShop,
  saveSnapshot, removeHistoryEntry, removeHistoryDateGroup, renameHistoryDate, renameHistoryDateGroup
} from "./actions.js";
import { openConfirmDialog, closeConfirmDialog, updateLiveModalColor } from "./render/modals.js";
import {
  openNoteEditor, closeNoteEditor, deleteNoteFromEditor,
  updateEditorChecklistDOM, updateNotesGridColumnsDOM,
  startCardDrag, handleCardDragMove, finishCardDrop, cancelCardDrag,
  renderNotesToolbarHtml, renderNoteEditorPanelHtml, dragData
} from "./render/notes.js";
import { updateBottomNavState } from "./render/navigation.js";
import {
  syncCountSearchQuery, addSearchChip, addExclusionChip, handleCopy, exportBackup, handleImportFile,
  createNoteObj, rgbToHex, hexToRgb, resolveColorHex, cellKey, buildSummary, formatColorName, formatSizeName,
  itemCount, quickFlagBreakdown
} from "./helpers.js";
import { STATE_OK, STATE_LOW, STATE_CRIT } from "./constants.js";
import { toggleAppTheme } from "./theme.js";
import { showUndoToast, handleUndoClick } from "./toast.js";
import { handleLogout, submitLogin } from "./auth.js";

export function initEvents() {
  // ---------- Event Delegation ----------
  var app = document.getElementById("app-root");
  var lastColorPickerCloseTime = 0;

  function closeColorPickerWithFade() {
    if (!ui.colorPickerModal || ui.isClosingColorPicker) return;
    ui.isClosingColorPicker = true;
    lastColorPickerCloseTime = Date.now();
    var overlay = document.getElementById("color-picker-overlay");
    if (overlay) {
      overlay.classList.add("modal-fade-out");
      setTimeout(function () {
        ui.colorPickerModal = null;
        ui.isClosingColorPicker = false;
        render();
      }, 150);
    } else {
      ui.colorPickerModal = null;
      ui.isClosingColorPicker = false;
      render();
    }
  }

  function updateColorBrowserModeDOM(isEx) {
    var panel = document.getElementById("count-color-browser");
    if (!panel) return;
    var slider = panel.querySelector(".count-mode-slider");
    var incBtn = panel.querySelector(".count-mode-btn-inc");
    var exBtn = panel.querySelector(".count-mode-btn-ex");

    if (slider) {
      slider.style.transform = isEx ? "translateX(100%)" : "translateX(0)";
      if (isEx) {
        slider.style.background = "rgba(250,93,24,0.18)";
        slider.style.borderColor = "rgba(250,93,24,0.50)";
        slider.style.boxShadow = "0 1px 3px rgba(250,93,24,0.2)";
      } else {
        slider.style.background = "var(--primary-pill-bg)";
        slider.style.borderColor = "var(--primary-pill-border)";
        slider.style.boxShadow = "0 1px 3px rgba(0,0,0,0.25)";
      }
    }

    if (incBtn) {
      incBtn.classList.toggle("is-active", !isEx);
      incBtn.style.color = !isEx ? "var(--primary)" : "var(--ink-muted)";
      incBtn.style.fontWeight = !isEx ? "700" : "600";
    }

    if (exBtn) {
      exBtn.classList.toggle("is-active", isEx);
      exBtn.style.color = isEx ? "var(--amber)" : "var(--ink-muted)";
      exBtn.style.fontWeight = isEx ? "700" : "600";
    }
  }

  app.addEventListener("click", function (e) {
    // Dismiss notes dropdown menus if clicking outside
    if (ui.notesAdjustMenuOpen) {
      var inAdjust = e.target.closest && (e.target.closest('[data-action="toggle-notes-adjust-menu"]') || e.target.closest('#notes-adjust-menu'));
      if (!inAdjust) {
        ui.notesAdjustMenuOpen = false;
        render();
      }
    }
    if (ui.notesPlusMenuOpen) {
      var inPlus = e.target.closest && (e.target.closest('[data-action="toggle-notes-plus-menu"]') || e.target.closest('#notes-plus-menu'));
      if (!inPlus) {
        ui.notesPlusMenuOpen = false;
        render();
      }
    }

    if (e.target && e.target.id === "color-picker-overlay") {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      closeColorPickerWithFade();
      return;
    }
    if (e.target && e.target.id === "confirm-modal-overlay") {
      ui.confirmDialog = null;
      render();
      return;
    }

    var chipsContainer = e.target.closest && e.target.closest('[data-role="chips-container"]');
    if (chipsContainer && !e.target.closest("button") && e.target.tagName !== "INPUT") {
      var searchInp = chipsContainer.querySelector("#count-search-input");
      if (searchInp) {
        searchInp.focus();
        return;
      }
    }

    var el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    var action = el.dataset.action;
    var s = (state && state.activePage !== "history") ? activeStyle() : null;

    switch (action) {
      case "auth-logout":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        handleLogout();
        break;
      case "toggle-theme":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        toggleAppTheme();
        render();
        break;
      case "confirm-dialog-cancel":
        ui.confirmDialog = null;
        render();
        break;
      case "undo-delete-checklist-item":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        handleUndoClick();
        break;
      case "confirm-dialog-confirm":
        if (ui.confirmDialog && typeof ui.confirmDialog.onConfirm === "function") {
          var cb = ui.confirmDialog.onConfirm;
          ui.confirmDialog = null;
          cb();
        } else {
          ui.confirmDialog = null;
          render();
        }
        break;
      case "open-color-picker":
        if (Date.now() - lastColorPickerCloseTime < 750) {
          return;
        }
        if (ui.colorPickerModal !== null && ui.colorPickerModal.colorIdx === parseInt(el.dataset.colorIdx, 10)) {
          return;
        }
        ui.colorPickerModal = { colorIdx: parseInt(el.dataset.colorIdx, 10) };
        render();
        break;
      case "close-color-picker":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        closeColorPickerWithFade();
        break;
      case "select-color-preset":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        if (s) {
          var ci = parseInt(el.dataset.colorIdx, 10);
          var newHex = el.dataset.hex;
          updateLiveModalColor(s, ci, newHex, "preset");
        }
        break;
      case "reset-color-hex":
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        if (s) {
          var ci = parseInt(el.dataset.colorIdx, 10);
          setColorHex(s.id, ci, null);
          var autoHex = resolveColorHex(s.colors[ci], ci, s);
          updateLiveModalColor(s, ci, autoHex, "reset");
        }
        break;
      case "set-shop":
        state.activeShopId = el.dataset.shopId;
        ui.shopMenuOpen = false;
        ui.shopPickerOpen = false;
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        break;
      case "set-home":
        ui.showHome = true;
        ui.shopPickerOpen = false;
        ui.shopMenuOpen = false;
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        break;
      case "go-to-shop":
        ui.showHome = false;
        if (state) {
          state.activeShopId = el.dataset.shopId;
          state.activePage = "quick";
        }
        ui.shopMenuOpen = false;
        ui.shopPickerOpen = false;
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        break;
      case "go-to-history":
        ui.showHome = false;
        if (state) state.activePage = "history";
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        break;
      case "set-page":
        ui.showHome = false;
        if (state) state.activePage = el.dataset.page;
        ui.shopMenuOpen = false;
        ui.shopPickerOpen = false;
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        break;
      case "add-shop-toggle":
        ui.addingShop = true;
        ui.needsAutofocus = true;
        render();
        break;
      case "shop-name-edit-start":
        ui.editingShopId = el.dataset.shopId;
        ui.needsAutofocus = true;
        render();
        break;
      case "shop-menu-toggle":
        ui.shopMenuOpen = !ui.shopMenuOpen;
        ui.shopPickerOpen = false;
        render();
        break;
      case "shop-picker-toggle":
        ui.shopPickerOpen = !ui.shopPickerOpen;
        ui.shopMenuOpen = false;
        render();
        break;
      case "move-shop":
        moveShop(activeShop().id, parseInt(el.dataset.dir, 10));
        render();
        break;
      case "delete-shop":
        var curShop = activeShop();
        openConfirmDialog({
          title: "Delete Shop",
          message: 'Are you sure you want to delete "' + (curShop.name || "this shop") + '" and all its styles?',
          confirmText: "Delete",
          danger: true,
          onConfirm: function () {
            removeShop(curShop.id);
            ui.shopMenuOpen = false;
            ui.editStructure = false;
            ui.editingColor = null;
            ui.editingSize = null;
            ui.addingColor = false;
            ui.addingSize = false;
            render();
          }
        });
        break;
      case "set-style":
        activeShop().activeStyleId = el.dataset.styleId;
        ui.styleMenuOpen = false;
        render();
        break;
      case "style-menu-toggle":
        ui.styleMenuOpen = !ui.styleMenuOpen;
        ui.shopMenuOpen = false;
        ui.shopPickerOpen = false;
        render();
        break;
      case "move-style":
        if (s) {
          moveStyle(s.id, parseInt(el.dataset.dir, 10));
        }
        render();
        break;
      case "delete-style":
        if (s) {
          var targetStyleId = s.id;
          var targetStyleName = s.name || "this style";
          openConfirmDialog({
            title: "Delete Style",
            message: 'Are you sure you want to delete "' + targetStyleName + '"?',
            confirmText: "Delete",
            danger: true,
            onConfirm: function () {
              removeStyle(targetStyleId);
              ui.styleMenuOpen = false;
              render();
            }
          });
        }
        break;
      case "add-style-toggle":
        ui.addingStyle = true;
        ui.needsAutofocus = true;
        render();
        break;
      case "style-name-edit-start":
        ui.editingStyleId = el.dataset.styleId || (s ? s.id : null);
        ui.renamingStyle = true;
        ui.needsAutofocus = true;
        render();
        break;
      case "toggle-edit-structure":
        ui.editStructure = !ui.editStructure;
        ui.styleMenuOpen = false;
        render();
        break;
      case "color-name-edit-start":
        ui.editingColor = parseInt(el.dataset.colorIdx, 10);
        ui.needsAutofocus = true;
        render();
        break;
      case "size-name-edit-start":
        ui.editingSize = parseInt(el.dataset.sizeIdx, 10);
        ui.needsAutofocus = true;
        render();
        break;
      case "add-color-toggle":
        ui.addingColor = true;
        ui.needsAutofocus = true;
        render();
        break;
      case "add-size-toggle":
        ui.addingSize = true;
        ui.needsAutofocus = true;
        render();
        break;
      case "move-color":
        if (s) {
          moveColor(s.id, parseInt(el.dataset.colorIdx, 10), parseInt(el.dataset.dir, 10));
        }
        render();
        break;
      case "delete-color":
        if (s) {
          var cIdx = parseInt(el.dataset.colorIdx, 10);
          var cName = s.colors[cIdx] || "Color " + (cIdx + 1);
          openConfirmDialog({
            title: "Delete Color",
            message: 'Remove "' + cName + '" from this style grid?',
            confirmText: "Remove",
            danger: true,
            onConfirm: function () {
              removeColor(s.id, cIdx);
              render();
            }
          });
        }
        break;
      case "move-size":
        if (s) {
          moveSize(s.id, parseInt(el.dataset.sizeIdx, 10), parseInt(el.dataset.dir, 10));
        }
        render();
        break;
      case "delete-size":
        if (s) {
          var szIdx = parseInt(el.dataset.sizeIdx, 10);
          var szName = s.sizes[szIdx] || "Size " + (szIdx + 1);
          openConfirmDialog({
            title: "Delete Size",
            message: 'Remove size "' + szName + '" from this style grid?',
            confirmText: "Remove",
            danger: true,
            onConfirm: function () {
              removeSize(s.id, szIdx);
              render();
            }
          });
        }
        break;
      case "clear-all":
        if (s) {
          var styleIdToClear = s.id;
          openConfirmDialog({
            title: "Clear Grid",
            message: "Reset all counts/flags for " + (s.name || "this style") + " to 0?",
            confirmText: "Clear All",
            danger: true,
            onConfirm: function () {
              if (state && state.activePage === "quick") {
                var activeCells = document.querySelectorAll(".quick-cell-btn.is-active-cell");
                if (activeCells.length > 0) {
                  activeCells.forEach(function (btn) {
                    btn.classList.add("cell-clearing-anim");
                  });
                  setTimeout(function () {
                    clearAll(styleIdToClear);
                    render();
                  }, 140);
                  return;
                }
              }
              clearAll(styleIdToClear);
              render();
            }
          });
        }
        break;
      case "cycle-cell":
        if (s) {
          var ci = parseInt(el.dataset.colorIdx, 10);
          var si = parseInt(el.dataset.sizeIdx, 10);
          var key = cellKey(ci, si);
          var cur = s.cells[key] === undefined ? STATE_OK : s.cells[key];

          var patchQuickCell = function (targetBtn, nextState) {
            if (!targetBtn) return;
            if (nextState === STATE_OK) {
              targetBtn.classList.remove("is-active-cell");
              targetBtn.style.border = "1.5px dashed var(--border-cell)";
              targetBtn.style.background = "transparent";
              targetBtn.style.boxShadow = "none";
              targetBtn.innerHTML = "";
            } else if (nextState === STATE_LOW) {
              targetBtn.classList.add("is-active-cell");
              targetBtn.style.border = "1.5px solid var(--cell-low-border)";
              targetBtn.style.background = "var(--cell-low-bg)";
              targetBtn.style.boxShadow = "var(--cell-low-glow)";
              targetBtn.innerHTML = '<span class="cell-label-anim" style="font-family:var(--font-mono);font-size:10px;font-weight:900;letter-spacing:0.05em;color:var(--cell-low-ink);">LOW</span>';
            } else if (nextState === STATE_CRIT) {
              targetBtn.classList.add("is-active-cell");
              targetBtn.style.border = "1.5px solid var(--cell-out-border)";
              targetBtn.style.background = "var(--cell-out-bg)";
              targetBtn.style.boxShadow = "var(--cell-out-glow)";
              targetBtn.innerHTML = '<span class="cell-label-anim" style="font-family:var(--font-mono);font-size:10px;font-weight:900;letter-spacing:0.05em;color:var(--cell-out-ink);text-shadow:var(--cell-out-text-shadow);">OUT</span>';
            }

            var bd = quickFlagBreakdown(activeShop());
            var totalBadge = document.getElementById("quick-total-badge");
            if (totalBadge) {
              totalBadge.textContent = (bd.low + bd.out) + " ITEMS";
            }
            var summaryTextarea = document.getElementById("summary-textarea");
            if (summaryTextarea) {
              summaryTextarea.value = buildSummary(activeShop(), "quick");
            }
          };

          if (cur === STATE_CRIT) { // OUT -> going to empty/OK: play dissipate/fade animation
            el.classList.add("cell-clearing-anim");
            setTimeout(function () {
              var next = cycleCell(s.id, ci, si);
              el.classList.remove("cell-clearing-anim");
              patchQuickCell(el, next);
            }, 130);
          } else {
            var next = cycleCell(s.id, ci, si);
            patchQuickCell(el, next);
          }
        }
        break;
      case "clear-count-search":
        ui.countSearchQuery = "";
        ui.countSearchChips = [];
        ui.countSearchExclusionChips = [];
        ui.countSearchInputText = "";
        syncCountSearchQuery();
        render();
        break;
      case "clear-all-flags-all-styles":
        ui.styleMenuOpen = false;
        var curShopFlags = activeShop();
        var shopTitleFlags = curShopFlags ? curShopFlags.name : "all styles";
        openConfirmDialog({
          title: "Clear All Flags",
          message: "Clear all flags across EVERY style in " + shopTitleFlags + "? This cannot be undone.",
          confirmText: "Clear All Flags",
          danger: true,
          onConfirm: function () {
            clearAllStyles("flags");
            render();
          }
        });
        break;
      case "clear-all-counts-all-styles":
        ui.styleMenuOpen = false;
        var curShopCounts = activeShop();
        var shopTitleCounts = curShopCounts ? curShopCounts.name : "all styles";
        openConfirmDialog({
          title: "Clear All Counts",
          message: "Reset all counts across EVERY style in " + shopTitleCounts + " to 0? This cannot be undone.",
          confirmText: "Clear All Counts",
          danger: true,
          onConfirm: function () {
            clearAllStyles("counts");
            render();
          }
        });
        break;
      case "toggle-color-browser":
        ui.colorBrowserOpen = !ui.colorBrowserOpen;
        ui.colorBrowserExcludeMode = false;
        render();
        break;
      case "set-color-browser-mode":
        var isEx = (el.dataset.mode === "exclude");
        ui.colorBrowserExcludeMode = isEx;
        updateColorBrowserModeDOM(isEx);
        break;
      case "close-color-browser":
        ui.colorBrowserOpen = false;
        ui.colorBrowserExcludeMode = false;
        render();
        break;
      case "toggle-color-term":
        var colorName = (el.dataset.colorName || "").trim();
        if (colorName) {
          var lower = colorName.toLowerCase();
          if (!ui.countSearchChips) ui.countSearchChips = [];
          if (!ui.countSearchExclusionChips) ui.countSearchExclusionChips = [];

          if (ui.colorBrowserExcludeMode) {
            // Exclude mode: toggle in exclusion chips
            var existingExIdx = ui.countSearchExclusionChips.findIndex(function (c) {
              return c.toLowerCase().trim() === lower;
            });
            if (existingExIdx !== -1) {
              ui.countSearchExclusionChips.splice(existingExIdx, 1);
            } else {
              ui.countSearchExclusionChips.push(colorName);
              // remove from inclusion chips if present
              ui.countSearchChips = ui.countSearchChips.filter(function (c) {
                return c.toLowerCase().trim() !== lower;
              });
            }
          } else {
            // Include mode: toggle in inclusion chips
            var existingIncIdx = ui.countSearchChips.findIndex(function (c) {
              return c.toLowerCase().trim() === lower;
            });
            if (existingIncIdx !== -1) {
              ui.countSearchChips.splice(existingIncIdx, 1);
            } else {
              ui.countSearchChips.push(colorName);
              // remove from exclusion chips if present
              ui.countSearchExclusionChips = ui.countSearchExclusionChips.filter(function (c) {
                return c.toLowerCase().trim() !== lower;
              });
            }
          }

          if (ui.countSearchInputText && ui.countSearchInputText.toLowerCase().trim() === lower) {
            ui.countSearchInputText = "";
          }
          syncCountSearchQuery();
          render();
        }
        break;
      case "remove-search-chip":
        var termToRemove = (el.dataset.chipTerm || "").toLowerCase().trim();
        ui.countSearchChips = (ui.countSearchChips || []).filter(function (c) {
          return c.toLowerCase().trim() !== termToRemove;
        });
        if (ui.countSearchInputText && ui.countSearchInputText.toLowerCase().trim() === termToRemove) {
          ui.countSearchInputText = "";
        }
        syncCountSearchQuery();
        render();
        break;
      case "remove-exclusion-chip":
        var exTermToRemove = (el.dataset.chipTerm || "").toLowerCase().trim();
        ui.countSearchExclusionChips = (ui.countSearchExclusionChips || []).filter(function (c) {
          return c.toLowerCase().trim() !== exTermToRemove;
        });
        syncCountSearchQuery();
        render();
        break;
      case "inc-count":
        var targetStyleId = el.dataset.styleId || (s && s.id);
        var targetColorIdx = parseInt(el.dataset.colorIdx, 10);
        var targetSizeIdx = parseInt(el.dataset.sizeIdx, 10);
        if (ui.justFinishedStepperRepeat &&
            ui.justFinishedStepperRepeat.styleId === targetStyleId &&
            ui.justFinishedStepperRepeat.colorIdx === targetColorIdx &&
            ui.justFinishedStepperRepeat.sizeIdx === targetSizeIdx) {
          return;
        }
        if (targetStyleId) {
          var newCount = incCount(targetStyleId, targetColorIdx, targetSizeIdx);
          var parentDiv = el.parentElement;
          var numDisplay = parentDiv ? parentDiv.querySelector(".count-num-btn, [data-role='count-input']") : null;
          if (numDisplay) {
            var text = (newCount === undefined || newCount === null) ? "-" : String(newCount);
            if (numDisplay.tagName === "INPUT") {
              numDisplay.value = text === "-" ? "" : text;
            } else {
              numDisplay.textContent = text;
            }
            var cellTd = el.closest(".count-cell-td");
            if (cellTd) {
              var isCounted = (newCount !== undefined && newCount !== null);
              cellTd.style.background = isCounted ? "var(--counted-bg)" : "transparent";
              cellTd.style.color = isCounted ? "var(--counted-text)" : "var(--ink-muted)";
            }
            var totalBadge = document.getElementById("count-total-badge");
            if (totalBadge) {
              totalBadge.textContent = "TOTAL: " + itemCount(null, "count");
            }
            var summaryTextarea = document.getElementById("summary-textarea");
            if (summaryTextarea) {
              summaryTextarea.value = buildSummary(null, "count");
            }
          } else {
            render();
          }
        }
        break;
      case "dec-count":
        var targetStyleId = el.dataset.styleId || (s && s.id);
        var targetColorIdx = parseInt(el.dataset.colorIdx, 10);
        var targetSizeIdx = parseInt(el.dataset.sizeIdx, 10);
        if (ui.justFinishedStepperRepeat &&
            ui.justFinishedStepperRepeat.styleId === targetStyleId &&
            ui.justFinishedStepperRepeat.colorIdx === targetColorIdx &&
            ui.justFinishedStepperRepeat.sizeIdx === targetSizeIdx) {
          return;
        }
        if (targetStyleId) {
          var newCount = decCount(targetStyleId, targetColorIdx, targetSizeIdx);
          var parentDiv = el.parentElement;
          var numDisplay = parentDiv ? parentDiv.querySelector(".count-num-btn, [data-role='count-input']") : null;
          if (numDisplay) {
            var text = (newCount === undefined || newCount === null) ? "-" : String(newCount);
            if (numDisplay.tagName === "INPUT") {
              numDisplay.value = text === "-" ? "" : text;
            } else {
              numDisplay.textContent = text;
            }
            var cellTd = el.closest(".count-cell-td");
            if (cellTd) {
              var isCounted = (newCount !== undefined && newCount !== null);
              cellTd.style.background = isCounted ? "var(--counted-bg)" : "transparent";
              cellTd.style.color = isCounted ? "var(--counted-text)" : "var(--ink-muted)";
            }
            var totalBadge = document.getElementById("count-total-badge");
            if (totalBadge) {
              totalBadge.textContent = "TOTAL: " + itemCount(null, "count");
            }
            var summaryTextarea = document.getElementById("summary-textarea");
            if (summaryTextarea) {
              summaryTextarea.value = buildSummary(null, "count");
            }
          } else {
            render();
          }
        }
        break;
      case "count-edit-start":
        var targetStyleId = el.dataset.styleId || (s && s.id);
        ui.editingCount = { styleId: targetStyleId, colorIdx: parseInt(el.dataset.colorIdx, 10), sizeIdx: parseInt(el.dataset.sizeIdx, 10) };
        ui.needsAutofocus = true;
        render();
        break;
      case "toggle-summary":
        ui.summaryOpen = !ui.summaryOpen;
        var collapseEl = document.querySelector("#check-summary-collapse, #count-summary-collapse");
        if (collapseEl) {
          collapseEl.classList.toggle("is-open", ui.summaryOpen);
          var rotIcons = document.querySelectorAll(".summary-header-btn .toggle-rot-icon");
          rotIcons.forEach(function (ico) {
            ico.classList.toggle("is-open", ui.summaryOpen);
          });
        } else {
          render();
        }
        break;
      case "copy-summary":
        handleCopy(buildSummary(), "summary-textarea", "copy-btn-label", ui.copyLabel);
        break;
      case "save-snapshot":
        saveSnapshot();
        break;
      case "toggle-history-date":
        var hDate = el.dataset.date;
        ui.expandedHistoryDates = ui.expandedHistoryDates || {};
        ui.expandedHistoryDates[hDate] = !ui.expandedHistoryDates[hDate];
        var isNowOpen = !!ui.expandedHistoryDates[hDate];
        var hCollapseEl = document.getElementById("history-date-collapse-" + hDate);
        if (hCollapseEl) {
          hCollapseEl.classList.toggle("is-open", isNowOpen);
          var cardEl = hCollapseEl.closest(".tap-card");
          if (cardEl) {
            var viewTextEl = cardEl.querySelector(".history-view-btn-text");
            var viewIconEl = cardEl.querySelector(".history-view-btn-icon");
            if (viewTextEl) viewTextEl.textContent = isNowOpen ? "HIDE " : "VIEW ";
            if (viewIconEl) viewIconEl.classList.toggle("is-open", isNowOpen);
            var badgeEls = cardEl.querySelectorAll(".history-badges-desktop, .history-badges-mobile");
            badgeEls.forEach(function (bEl) {
              bEl.style.display = isNowOpen ? "none" : "";
            });
          }
        } else {
          render();
        }
        break;
      case "delete-history-date":
        var dateToDelete = el.dataset.date;
        openConfirmDialog({
          title: "Delete Day's History",
          message: 'Delete all saved audit logs for ' + dateToDelete + '?',
          confirmText: "Delete",
          danger: true,
          onConfirm: function () {
            removeHistoryDateGroup(dateToDelete);
            render();
          }
        });
        break;
      case "history-date-group-edit-start":
        ui.editingHistoryDateId = "date-group:" + el.dataset.date;
        ui.needsAutofocus = true;
        render();
        break;
      case "toggle-history-entry":
        ui.expandedHistoryId = ui.expandedHistoryId === el.dataset.entryId ? null : el.dataset.entryId;
        render();
        break;
      case "delete-history-entry":
        var entryIdToDelete = el.dataset.entryId;
        openConfirmDialog({
          title: "Delete Snapshot",
          message: "Are you sure you want to delete this specific audit log snapshot?",
          confirmText: "Delete",
          danger: true,
          onConfirm: function () {
            removeHistoryEntry(entryIdToDelete);
            render();
          }
        });
        break;
      case "history-date-edit-start":
        ui.editingHistoryDateId = el.dataset.entryId;
        render();
        break;
      case "copy-history-entry":
        var entry = (state.history || []).filter(function (x) { return x.id === el.dataset.entryId; })[0];
        if (entry) handleCopy(entry.summaryText, "history-ta-" + entry.id, "history-copy-label-" + entry.id, "COPY LIST");
        break;
      case "toggle-notes-adjust-menu":
        ui.notesAdjustMenuOpen = !ui.notesAdjustMenuOpen;
        ui.notesPlusMenuOpen = false;
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        } else {
          render();
        }
        break;
      case "toggle-notes-plus-menu":
        ui.notesPlusMenuOpen = !ui.notesPlusMenuOpen;
        ui.notesAdjustMenuOpen = false;
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        } else {
          render();
        }
        break;
      case "set-notes-view":
        ui.notesViewMode = el.dataset.view;
        ui.notesAdjustMenuOpen = false;
        updateNotesGridColumnsDOM(true);
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        }
        break;
      case "set-notes-sort":
        ui.notesSort = el.dataset.sort;
        ui.notesAdjustMenuOpen = false;
        updateNotesGridColumnsDOM(true);
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        }
        break;
      case "clear-notes-search":
        ui.notesSearchQuery = "";
        updateNotesGridColumnsDOM(true);
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        }
        break;
      case "create-new-note":
        var nType = el.dataset.noteType || "text";
        var newNote = createNoteObj(nType);
        state.notes = state.notes || [];
        state.notes.unshift(newNote);
        save();
        ui.notesPlusMenuOpen = false;
        openNoteEditor(newNote.id, null);
        break;
      case "add-search-note":
        var newNote = createNoteObj("text", ui.notesSearchQuery);
        state.notes = state.notes || [];
        state.notes.unshift(newNote);
        save();
        ui.notesSearchQuery = "";
        openNoteEditor(newNote.id, null);
        break;
      case "open-note":
        if (dragData.isDragging || ui.justFinishedDrag) return;
        var noteId = el.dataset.noteId;
        var cardEl = el.closest(".note-card") || el;
        openNoteEditor(noteId, cardEl);
        break;
      case "toggle-note-done":
        var noteId = el.dataset.noteId;
        var note = (state.notes || []).find(function (n) { return n.id === noteId; });
        if (note) {
          note.done = !note.done;
          save();
          updateNotesGridColumnsDOM(false);
        }
        break;
      case "toggle-checklist-item-done":
        var noteId = el.dataset.noteId;
        var itIdx = parseInt(el.dataset.itemIdx, 10);
        var note = (state.notes || []).find(function (n) { return n.id === noteId; });
        if (note && note.items && note.items[itIdx]) {
          note.items[itIdx].done = !note.items[itIdx].done;
          save();
          updateNotesGridColumnsDOM(false);
        }
        break;
      case "note-editor-back":
        closeNoteEditor();
        break;
      case "note-editor-delete":
        openConfirmDialog({
          title: "Delete Note",
          message: "Are you sure you want to permanently delete this note?",
          confirmText: "Delete",
          danger: true,
          onConfirm: function () {
            deleteNoteFromEditor();
          }
        });
        break;
      case "toggle-editor-item-done":
        var itIdx = parseInt(el.dataset.itemIdx, 10);
        var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
        if (note && note.items && note.items[itIdx]) {
          note.items[itIdx].done = !note.items[itIdx].done;
          save();
          updateEditorChecklistDOM(note);
        }
        break;
      case "delete-checklist-item":
        var itIdx = parseInt(el.dataset.itemIdx, 10);
        var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
        if (note && note.items && note.items[itIdx] !== undefined) {
          var removedItem = note.items[itIdx];
          var currentNoteId = note.id;
          note.items.splice(itIdx, 1);
          save();
          updateEditorChecklistDOM(note);

          showUndoToast({
            text: "Item removed",
            actionLabel: "Undo",
            duration: 4500,
            onUndo: function () {
              var targetNote = (state.notes || []).find(function (n) { return n.id === currentNoteId; });
              if (targetNote) {
                if (!targetNote.items) targetNote.items = [];
                var insertPos = Math.min(itIdx, targetNote.items.length);
                targetNote.items.splice(insertPos, 0, removedItem);
                save();
                updateEditorChecklistDOM(targetNote);
                if (ui.activeNoteId !== targetNote.id) {
                  render();
                }
              }
            }
          });
        }
        break;
      case "add-checklist-item-btn":
        var addInp = document.getElementById("checklist-add-input");
        var val = addInp ? addInp.value.trim() : "";
        if (val) {
          var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
          if (note) {
            note.items = note.items || [];
            note.items.push({ text: val, done: false });
            save();
            updateEditorChecklistDOM(note);
            addInp.value = "";
            addInp.focus();
          }
        }
        break;
      case "set-note-color":
        var cKey = el.dataset.colorKey;
        var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
        if (note) {
          note.color = cKey;
          save();
          var editorContainer = document.getElementById("note-editor-container");
          if (editorContainer) {
            editorContainer.innerHTML = renderNoteEditorPanelHtml(note);
          }
        }
        break;
      case "toggle-note-trackable":
        var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
        if (note) {
          note.trackable = (note.trackable === false ? true : false);
          save();
          var editorContainer = document.getElementById("note-editor-container");
          if (editorContainer) {
            editorContainer.innerHTML = renderNoteEditorPanelHtml(note);
          }
        }
        break;
      case "export-backup":
        exportBackup();
        break;
      case "import-backup-trigger":
        document.getElementById("import-file-input").click();
        break;
    }
  });

  // Universal click-outside handler for all floating menus and popovers
  document.addEventListener("click", function (e) {
    var changed = false;

    // 1. Notes Page floating menus (Sort & + New Note menus)
    if (ui.notesAdjustMenuOpen || ui.notesPlusMenuOpen) {
      if (!e.target.closest(".notes-toolbar-icon-btn") && !e.target.closest(".notes-dropdown")) {
        ui.notesAdjustMenuOpen = false;
        ui.notesPlusMenuOpen = false;
        var toolbarRow = document.querySelector(".notes-search-bar-row");
        if (toolbarRow) {
          var temp = document.createElement("div");
          temp.innerHTML = renderNotesToolbarHtml();
          toolbarRow.parentNode.replaceChild(temp.firstElementChild, toolbarRow);
        }
      }
    }

    // 2. Shop Picker dropdown (on count or history or check pages)
    if (ui.shopPickerOpen) {
      if (!e.target.closest('[data-action="shop-picker-toggle"]') && !e.target.closest('.glass-dropdown-check') && !e.target.closest('.glass-dropdown')) {
        ui.shopPickerOpen = false;
        changed = true;
      }
    }

    // 3. Shop Menu popup (kebab menu)
    if (ui.shopMenuOpen) {
      if (!e.target.closest('[data-action="shop-menu-toggle"]') && !e.target.closest('.popover-menu') && !e.target.closest('.glass-dropdown')) {
        ui.shopMenuOpen = false;
        changed = true;
      }
    }

    // 4. Style Menu popup
    if (ui.styleMenuOpen) {
      if (!e.target.closest('[data-action="style-menu-toggle"]') && !e.target.closest('.popover-menu') && !e.target.closest('.glass-dropdown')) {
        ui.styleMenuOpen = false;
        changed = true;
      }
    }

    // 5. Color Browser Panel toggle
    if (ui.colorBrowserOpen) {
      if (!e.target.closest('[data-action="toggle-color-browser"]') &&
          !e.target.closest('#count-color-browser') &&
          !e.target.closest('.count-browser-item') &&
          !e.target.closest('.color-browser-container')) {
        ui.colorBrowserOpen = false;
        ui.colorBrowserExcludeMode = false;
        changed = true;
      }
    }

    if (changed) {
      render();
    }
  });

  app.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "auth-login-form") {
      e.preventDefault();
      var emailEl = document.getElementById("login-email");
      var passEl = document.getElementById("login-password");
      var email = emailEl ? emailEl.value : "";
      var password = passEl ? passEl.value : "";
      submitLogin(email, password);
    }
  });

  app.addEventListener("input", function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.role) return;

    if (t.dataset.role === "notes-search-input") {
      ui.notesSearchQuery = t.value;
      updateNotesGridColumnsDOM(true);
      return;
    }

    if (t.dataset.role === "note-title-input") {
      var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
      if (note) {
        note.title = t.value;
        save();
      }
      return;
    }

    if (t.dataset.role === "note-body-input") {
      var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
      if (note) {
        note.text = t.value;
        save();
      }
      return;
    }

    if (t.dataset.role === "checklist-item-input") {
      var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
      var idx = parseInt(t.dataset.itemIdx, 10);
      if (note && note.items && note.items[idx]) {
        note.items[idx].text = t.value;
        save();
      }
      return;
    }

    if (t.dataset.role === "count-input") {
      t.value = t.value.replace(/[^0-9]/g, "");
      return;
    }

    if (t.dataset.role === "count-search-input") {
      if (t.value.indexOf(",") !== -1) {
        var parts = t.value.split(",");
        var remainder = parts.pop();
        parts.forEach(function (part) {
          var p = part.trim();
          if (!p) return;
          if (p.toLowerCase().startsWith("excluded:")) {
            addExclusionChip(p);
          } else {
            addSearchChip(p);
          }
        });
        ui.countSearchInputText = remainder;
        t.value = remainder;
        syncCountSearchQuery();
        render();
        var searchInput = app.querySelector("#count-search-input");
        if (searchInput) searchInput.focus();
        return;
      }
      ui.countSearchInputText = t.value;
      syncCountSearchQuery();
      render();
      return;
    }

    var s = (state && state.activePage !== "history") ? activeStyle() : null;
    if (!s) return;

    if (t.dataset.role === "rgb-slider") {
      var ci = parseInt(t.dataset.colorIdx, 10);
      var currentHex = resolveColorHex(s.colors[ci], ci, s);
      var rgb = hexToRgb(currentHex);
      var channel = t.dataset.channel;
      rgb[channel] = parseInt(t.value, 10);
      var newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      updateLiveModalColor(s, ci, newHex, "rgb-slider");
    } else if (t.dataset.role === "color-hex-input") {
      var ci = parseInt(t.dataset.colorIdx, 10);
      var val = t.value.trim();
      if (val.charAt(0) !== "#") val = "#" + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
        updateLiveModalColor(s, ci, val, "hex-input");
      }
    }
  });

  app.addEventListener("focusout", function (e) {
    if (isRendering) return;
    var t = e.target;
    if (!t.dataset || !t.dataset.role) return;
    var s = (state && state.activePage !== "history") ? activeStyle() : null;
    switch (t.dataset.role) {
      case "shop-name-input": renameShop(t.dataset.shopId, t.value); ui.editingShopId = null; render(); break;
      case "add-shop-input": addShopObj(t.value); ui.addingShop = false; render(); break;
      case "style-name-input": if (t.dataset.styleId) renameStyle(t.dataset.styleId, t.value); else if (s) renameStyle(s.id, t.value); ui.editingStyleId = null; ui.renamingStyle = false; render(); break;
      case "color-name-input": if (s) renameColor(s.id, parseInt(t.dataset.colorIdx, 10), t.value); ui.editingColor = null; render(); break;
      case "size-name-input": if (s) renameSize(s.id, parseInt(t.dataset.sizeIdx, 10), t.value); ui.editingSize = null; render(); break;
      case "add-color-input":
        if (s && t.value) {
          var cTokens = t.value.split(",").map(function (tok) { return tok.trim(); }).filter(Boolean);
          cTokens.forEach(function (tok) {
            var formatted = formatColorName(tok);
            if (!formatted) return;
            var curS = (activeShop().styles || []).find(function (x) { return x.id === s.id; }) || s;
            var exists = curS.colors.some(function (c) { return c.toLowerCase() === formatted.toLowerCase(); });
            if (!exists) {
              addColor(s.id, formatted);
              ensureColorHex(s.id, formatted);
            }
          });
        }
        ui.addingColor = false;
        render();
        break;
      case "add-size-input":
        if (s && t.value) {
          var sTokens = t.value.split(",").map(function (tok) { return tok.trim(); }).filter(Boolean);
          sTokens.forEach(function (tok) {
            var formatted = formatSizeName(tok);
            if (!formatted) return;
            var curS = (activeShop().styles || []).find(function (x) { return x.id === s.id; }) || s;
            var exists = curS.sizes.some(function (sz) { return sz.toLowerCase() === formatted.toLowerCase(); });
            if (!exists) {
              addSize(s.id, formatted);
            }
          });
        }
        ui.addingSize = false;
        render();
        break;
      case "add-style-input": addStyleObj(t.value); ui.addingStyle = false; render(); break;
      case "count-input":
        var targetStyleId = t.dataset.styleId || (s && s.id);
        if (targetStyleId) setCountManual(targetStyleId, parseInt(t.dataset.colorIdx, 10), parseInt(t.dataset.sizeIdx, 10), t.value);
        ui.editingCount = null;
        render();
        break;
      case "history-date-input": renameHistoryDate(t.dataset.entryId, t.value); ui.editingHistoryDateId = null; render(); break;
      case "history-date-group-input": renameHistoryDateGroup(t.dataset.oldDate, t.value); ui.editingHistoryDateId = null; render(); break;
      case "color-hex-input":
        if (s) {
          var ci = parseInt(t.dataset.colorIdx, 10);
          var val = t.value.trim();
          if (val) {
            if (val.charAt(0) !== "#") val = "#" + val;
            if (/^#[0-9A-Fa-f]{3,6}$/.test(val)) {
              setColorHex(s.id, ci, val);
              updateLiveModalColor(s, ci, val, "hex-input");
            }
          }
        }
        break;
    }
  });

  document.addEventListener("keydown", function (e) {
    var role = (e.target && e.target.dataset && e.target.dataset.role) || "";

    // Color hex input: Enter commits value and blurs
    if (role === "color-hex-input") {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        var s = (state && state.activePage !== "history") ? activeStyle() : null;
        if (s) {
          var ci = parseInt(e.target.dataset.colorIdx, 10);
          var val = (e.target.value || "").trim();
          if (val) {
            if (val.charAt(0) !== "#") val = "#" + val;
            if (/^#[0-9A-Fa-f]{3,6}$/.test(val)) {
              setColorHex(s.id, ci, val);
              updateLiveModalColor(s, ci, val, "hex-input");
            }
          }
        }
        e.target.blur();
        return;
      }
    }

    // Plain note body textarea has NO custom Enter handling at all — Enter behaves completely normally
    // Return early for Enter/typing, but do NOT return early if pressing Escape so Escape can close the editor
    if ((role === "note-body-input" || (e.target && e.target.tagName === "TEXTAREA" && role === "note-body-input")) && e.key !== "Escape" && e.keyCode !== 27) {
      return;
    }

    // Checklist add item: Enter creates new item and clears input
    if (role === "checklist-add-input") {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        var val = (e.target.value || "").trim();
        if (val) {
          var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
          if (note) {
            note.items = note.items || [];
            note.items.push({ text: val, done: false });
            save();
            updateEditorChecklistDOM(note);
            e.target.value = "";
          }
        }
        return;
      }
    }

    // Add Color Input: Enter adds bulk comma-separated values, clears input and refocuses without blurring;
    // Empty Enter finishes and closes; Escape closes and discards partial input
    if (role === "add-color-input") {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.target.value = "";
        ui.addingColor = false;
        render();
        return;
      }
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        var rawVal = e.target.value || "";
        var tokens = rawVal.split(",").map(function (tok) { return tok.trim(); }).filter(Boolean);
        if (tokens.length === 0) {
          e.target.value = "";
          ui.addingColor = false;
          render();
          return;
        }
        var s = (state && state.activePage !== "history") ? activeStyle() : null;
        if (s) {
          tokens.forEach(function (token) {
            var formatted = formatColorName(token);
            if (!formatted) return;
            var currentS = (activeShop().styles || []).find(function (x) { return x.id === s.id; }) || s;
            var exists = currentS.colors.some(function (c) {
              return c.toLowerCase() === formatted.toLowerCase();
            });
            if (!exists) {
              addColor(s.id, formatted);
              ensureColorHex(s.id, formatted);
            }
          });
        }
        ui.addingColor = true;
        render();
        var inp = document.querySelector('[data-role="add-color-input"]');
        if (inp) {
          inp.value = "";
          inp.focus();
        }
        return;
      }
    }

    // Add Size Input: Enter adds bulk comma-separated values, clears input and refocuses without blurring;
    // Empty Enter finishes and closes; Escape closes and discards partial input
    if (role === "add-size-input") {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.target.value = "";
        ui.addingSize = false;
        render();
        return;
      }
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        var rawVal = e.target.value || "";
        var tokens = rawVal.split(",").map(function (tok) { return tok.trim(); }).filter(Boolean);
        if (tokens.length === 0) {
          e.target.value = "";
          ui.addingSize = false;
          render();
          return;
        }
        var s = (state && state.activePage !== "history") ? activeStyle() : null;
        if (s) {
          tokens.forEach(function (token) {
            var formatted = formatSizeName(token);
            if (!formatted) return;
            var currentS = (activeShop().styles || []).find(function (x) { return x.id === s.id; }) || s;
            var exists = currentS.sizes.some(function (sz) {
              return sz.toLowerCase() === formatted.toLowerCase();
            });
            if (!exists) {
              addSize(s.id, formatted);
            }
          });
        }
        ui.addingSize = true;
        render();
        var inp = document.querySelector('[data-role="add-size-input"]');
        if (inp) {
          inp.value = "";
          inp.focus();
        }
        return;
      }
    }

    if (role === "count-search-input") {
      if (e.key === "Enter" || e.keyCode === 13 || e.key === ",") {
        e.preventDefault();
        var val = (e.target.value || "").trim();
        if (val) {
          if (val.toLowerCase().startsWith("excluded:")) {
            var rawEx = val.slice(9).trim();
            rawEx.split(",").forEach(function (sub) {
              var sTrim = sub.trim();
              if (sTrim) addExclusionChip(sTrim);
            });
          } else {
            val.split(",").forEach(function (sub) {
              var sTrim = sub.trim();
              if (sTrim.toLowerCase().startsWith("excluded:")) {
                addExclusionChip(sTrim);
              } else if (sTrim) {
                addSearchChip(sTrim);
              }
            });
          }
          ui.countSearchInputText = "";
          e.target.value = "";
          syncCountSearchQuery();
          render();
          var inp = document.querySelector("#count-search-input");
          if (inp) inp.focus();
        }
        return;
      }
      if (e.key === "Backspace" && !e.target.value) {
        if (ui.countSearchExclusionChips && ui.countSearchExclusionChips.length > 0) {
          ui.countSearchExclusionChips.pop();
          syncCountSearchQuery();
          render();
          var inp = document.querySelector("#count-search-input");
          if (inp) inp.focus();
          return;
        } else if (ui.countSearchChips && ui.countSearchChips.length > 0) {
          ui.countSearchChips.pop();
          syncCountSearchQuery();
          render();
          var inp = document.querySelector("#count-search-input");
          if (inp) inp.focus();
          return;
        }
      }
      if (e.key === "Escape" || e.keyCode === 27) {
        if (ui.countSearchInputText) {
          ui.countSearchInputText = "";
          e.target.value = "";
        } else if (ui.colorBrowserOpen) {
          ui.colorBrowserOpen = false;
          ui.colorBrowserExcludeMode = false;
        } else {
          ui.countSearchChips = [];
          ui.countSearchExclusionChips = [];
        }
        syncCountSearchQuery();
        render();
        return;
      }
    }

    // Only blur single-line text inputs on Enter; NEVER blur note-body-input or textareas
    if (e.key === "Enter" || e.keyCode === 13) {
      if (e.target && e.target.tagName !== "TEXTAREA" && role !== "note-body-input" && typeof e.target.blur === "function") {
        e.target.blur();
      }
    }

    if (e.key === "Escape" || e.keyCode === 27) {
      // 1. Confirm dialog has highest priority
      if (ui.confirmDialog !== null) {
        ui.confirmDialog = null;
        render();
        return;
      }

      // 2. Color picker modal with smooth fade-out animation
      if (ui.colorPickerModal !== null) {
        closeColorPickerWithFade();
        return;
      }

      // 3. Full-screen / active note editor modal
      if (ui.activeNoteId) {
        closeNoteEditor();
        return;
      }

      // 4. Floating menus / dropdowns / popups: close any open floating menu FIRST
      var hasFloatingMenu = ui.shopMenuOpen ||
        ui.shopPickerOpen ||
        ui.styleMenuOpen ||
        ui.notesAdjustMenuOpen ||
        ui.notesPlusMenuOpen ||
        ui.colorBrowserOpen;

      if (hasFloatingMenu) {
        ui.shopMenuOpen = false;
        ui.shopPickerOpen = false;
        ui.styleMenuOpen = false;
        ui.notesAdjustMenuOpen = false;
        ui.notesPlusMenuOpen = false;
        ui.colorBrowserOpen = false;
        ui.colorBrowserExcludeMode = false;
        render();
        return;
      }

      // 5. In-flight adding / renaming sub-inputs
      var hasSubEditing = ui.addingColor ||
        ui.addingSize ||
        ui.editingColor !== null ||
        ui.editingSize !== null ||
        ui.addingStyle ||
        ui.editingStyleId !== null ||
        ui.renamingStyle ||
        ui.addingShop ||
        ui.editingShopId !== null ||
        ui.editingCount !== null ||
        ui.editingHistoryDateId !== null;

      if (hasSubEditing) {
        ui.addingColor = false;
        ui.addingSize = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingStyle = false;
        ui.editingStyleId = null;
        ui.renamingStyle = false;
        ui.addingShop = false;
        ui.editingShopId = null;
        ui.editingCount = null;
        ui.editingHistoryDateId = null;
        render();
        return;
      }

      // 6. Edit Matrix: closes when Escape is pressed if there are no floating menus or dialogs open
      if (ui.editStructure) {
        ui.editStructure = false;
        ui.editingColor = null;
        ui.editingSize = null;
        ui.addingColor = false;
        ui.addingSize = false;
        render();
        return;
      }

      // 7. Search filters / inputs
      if (role === "notes-search-input" && ui.notesSearchQuery) {
        ui.notesSearchQuery = "";
        if (e.target && e.target.value !== undefined) e.target.value = "";
        render();
        return;
      }
      if (role === "count-search-input") {
        ui.countSearchQuery = "";
        ui.countSearchChips = [];
        ui.countSearchExclusionChips = [];
        ui.countSearchInputText = "";
        if (e.target) e.target.value = "";
        syncCountSearchQuery();
        render();
        return;
      }

      if (e.target && typeof e.target.blur === "function") {
        e.target.blur();
      }
    }
  });

  // Pointer & Touch event listeners for card drag-to-reorder (Desktop + Mobile)
  var holdTimer = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var pendingTouchCard = null;

  // Touch drag initiation (retains 240ms hold timer and 8px threshold so mobile vertical scrolling is uninterrupted)
  function onTouchDragStartAttempt(card, clientX, clientY) {
    touchStartX = clientX;
    touchStartY = clientY;
    pendingTouchCard = card;
    dragData.startX = clientX;
    dragData.startY = clientY;

    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      if (pendingTouchCard && !dragData.isDragging) {
        startCardDrag(pendingTouchCard, touchStartX, touchStartY);
      }
    }, 240);
  }

  function onTouchDragMoveAttempt(clientX, clientY, e) {
    if (!dragData.isDragging) {
      if (holdTimer) {
        var dx = Math.abs(clientX - touchStartX);
        var dy = Math.abs(clientY - touchStartY);
        if (dx > 8 || dy > 8) {
          clearTimeout(holdTimer);
          holdTimer = null;
          pendingTouchCard = null;
        }
      }
      return;
    }

    if (e && e.cancelable) {
      e.preventDefault();
    }

    handleCardDragMove(clientX, clientY);
  }

  function onTouchDragEndAttempt(e) {
    clearTimeout(holdTimer);
    holdTimer = null;
    pendingTouchCard = null;

    if (dragData.isDragging) {
      if (e && e.cancelable) e.preventDefault();
      ui.justFinishedDrag = true;
      setTimeout(function () { ui.justFinishedDrag = false; }, 160);
      finishCardDrop();
    }
  }

  function onTouchDragCancelAttempt() {
    clearTimeout(holdTimer);
    holdTimer = null;
    pendingTouchCard = null;
    if (dragData.isDragging) {
      cancelCardDrag();
    }
  }

  // Non-touch Pointer events (Desktop mouse, trackpads, styluses):
  // Immediate drag initiation upon motion — no 240ms hold timer and no 8px threshold
  var mousePendingCard = null;
  var mouseStartX = 0;
  var mouseStartY = 0;

  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") return; // Handled by native touch events for 100% reliable cancelable gesture
    if (!state || state.activePage !== "notes") return;
    if (ui.activeNoteId) return;
    if (e.target.closest("button, input, textarea, .glass-dropdown, .tap-btn, .note-item-track-btn, .note-card-track-btn")) return;

    var card = e.target.closest(".note-card[data-note-id]");
    if (!card) return;

    mousePendingCard = card;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    dragData.startX = e.clientX;
    dragData.startY = e.clientY;
  });

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;

    if (!dragData.isDragging && mousePendingCard) {
      var dx = Math.abs(e.clientX - mouseStartX);
      var dy = Math.abs(e.clientY - mouseStartY);
      if (dx > 3 || dy > 3) {
        startCardDrag(mousePendingCard, e.clientX, e.clientY);
        mousePendingCard = null;
      }
    }

    if (dragData.isDragging) {
      if (e.cancelable) e.preventDefault();
      handleCardDragMove(e.clientX, e.clientY);
    }
  }, { passive: false });

  document.addEventListener("pointerup", function (e) {
    if (e.pointerType === "touch") return;
    mousePendingCard = null;

    if (dragData.isDragging) {
      if (e.cancelable) e.preventDefault();
      ui.justFinishedDrag = true;
      setTimeout(function () { ui.justFinishedDrag = false; }, 160);
      finishCardDrop();
    }
  });

  document.addEventListener("pointercancel", function (e) {
    if (e.pointerType === "touch") return;
    mousePendingCard = null;
    if (dragData.isDragging) {
      cancelCardDrag();
    }
  });

  // Native Touch events (Mobile iOS & Android finger drag)
  document.addEventListener("touchstart", function (e) {
    if (!state || state.activePage !== "notes") return;
    if (ui.activeNoteId) return;
    if (!e.touches || e.touches.length !== 1) return;
    if (e.target.closest("button, input, textarea, .glass-dropdown, .tap-btn, .note-item-track-btn, .note-card-track-btn")) return;

    var card = e.target.closest(".note-card[data-note-id]");
    if (!card) return;

    var touch = e.touches[0];
    onTouchDragStartAttempt(card, touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (!e.touches || e.touches.length === 0) return;
    var touch = e.touches[0];
    onTouchDragMoveAttempt(touch.clientX, touch.clientY, e);
  }, { passive: false });

  document.addEventListener("touchend", function (e) {
    onTouchDragEndAttempt(e);
  });

  document.addEventListener("touchcancel", function () {
    onTouchDragCancelAttempt();
  });

  // Prevent context menu bubble on cards and stepper buttons during long-press
  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest && e.target.closest(".count-stepper-btn")) {
      e.preventDefault();
      return;
    }
    if (e.target.closest && e.target.closest(".note-card")) {
      if (dragData.isDragging || holdTimer) {
        e.preventDefault();
      }
    }
  });

  // ---------- Count Page +/- Stepper Press-and-Hold Auto-Repeat ----------
  var stepperHold = {
    btn: null,
    pointerId: null,
    action: null,
    styleId: null,
    colorIdx: null,
    sizeIdx: null,
    numDisplay: null,
    holdTimer: null,
    repeatTimer: null,
    currentInterval: 240,
    ticksCount: 0
  };

  function cleanUpStepperHold(shouldReconcile) {
    if (stepperHold.holdTimer) {
      clearTimeout(stepperHold.holdTimer);
      stepperHold.holdTimer = null;
    }
    if (stepperHold.repeatTimer) {
      clearTimeout(stepperHold.repeatTimer);
      stepperHold.repeatTimer = null;
    }

    var hadRepeated = stepperHold.ticksCount > 0;
    var btn = stepperHold.btn;

    if (btn) {
      btn.classList.remove("is-pressed");
    }

    var lastStyleId = stepperHold.styleId;
    var lastColorIdx = stepperHold.colorIdx;
    var lastSizeIdx = stepperHold.sizeIdx;

    stepperHold.btn = null;
    stepperHold.pointerId = null;
    stepperHold.action = null;
    stepperHold.styleId = null;
    stepperHold.colorIdx = null;
    stepperHold.sizeIdx = null;
    stepperHold.numDisplay = null;
    stepperHold.ticksCount = 0;

    if (hadRepeated) {
      var finishedCell = {
        styleId: lastStyleId,
        colorIdx: lastColorIdx,
        sizeIdx: lastSizeIdx
      };
      ui.justFinishedStepperRepeat = finishedCell;
      setTimeout(function () {
        if (ui.justFinishedStepperRepeat === finishedCell) {
          ui.justFinishedStepperRepeat = null;
        }
      }, 250);

      if (shouldReconcile) {
        render();
      }
    }
  }

  function startStepperRepeat() {
    if (!stepperHold.btn) return;

    function executeTick() {
      if (!stepperHold.btn) return;

      var newCount;
      if (stepperHold.action === "inc-count") {
        newCount = incCount(stepperHold.styleId, stepperHold.colorIdx, stepperHold.sizeIdx);
      } else if (stepperHold.action === "dec-count") {
        newCount = decCount(stepperHold.styleId, stepperHold.colorIdx, stepperHold.sizeIdx);
      }

      stepperHold.ticksCount++;

      // Targeted DOM patch of sibling number display element without triggering a full page re-render
      if (stepperHold.numDisplay) {
        var text = (newCount === undefined || newCount === null) ? "-" : String(newCount);
        if (stepperHold.numDisplay.tagName === "INPUT") {
          stepperHold.numDisplay.value = text === "-" ? "" : text;
        } else {
          stepperHold.numDisplay.textContent = text;
        }
      }

      var holdCellTd = stepperHold.btn ? stepperHold.btn.closest(".count-cell-td") : null;
      if (holdCellTd) {
        var isCounted = (newCount !== undefined && newCount !== null);
        holdCellTd.style.background = isCounted ? "var(--counted-bg)" : "transparent";
        holdCellTd.style.color = isCounted ? "var(--counted-text)" : "var(--ink-muted)";
      }

      // Targeted DOM patch of total count badge and summary textarea to keep counts live during rapid hold
      var totalBadge = document.getElementById("count-total-badge");
      if (totalBadge) {
        totalBadge.textContent = "TOTAL: " + itemCount(null, "count");
      }
      var summaryTextarea = document.getElementById("summary-textarea");
      if (summaryTextarea) {
        summaryTextarea.value = buildSummary(null, "count");
      }

      // For dec-count specifically: stop auto-repeat early if count reaches empty floor ("-")
      if (stepperHold.action === "dec-count" && (newCount === undefined || newCount === null)) {
        if (stepperHold.repeatTimer) {
          clearTimeout(stepperHold.repeatTimer);
          stepperHold.repeatTimer = null;
        }
        return;
      }

      // Exponential acceleration: start at 240ms, multiply by 0.82 after each tick, clamped to minimum 40ms (~25 ticks/sec)
      stepperHold.currentInterval = Math.max(40, Math.round(stepperHold.currentInterval * 0.82));
      stepperHold.repeatTimer = setTimeout(executeTick, stepperHold.currentInterval);
    }

    executeTick();
  }

  document.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    var btn = e.target.closest && e.target.closest(".count-stepper-btn");
    if (!btn) return;

    var action = btn.dataset.action;
    if (action !== "inc-count" && action !== "dec-count") return;

    var s = (state && state.activePage !== "history") ? activeStyle() : null;
    var styleId = btn.dataset.styleId || (s && s.id);
    var colorIdx = parseInt(btn.dataset.colorIdx, 10);
    var sizeIdx = parseInt(btn.dataset.sizeIdx, 10);
    if (!styleId || isNaN(colorIdx) || isNaN(sizeIdx)) return;

    cleanUpStepperHold(false);

    var parentDiv = btn.parentElement;
    var numDisplay = parentDiv ? parentDiv.querySelector(".count-num-btn, [data-role='count-input']") : null;

    stepperHold.btn = btn;
    stepperHold.pointerId = e.pointerId;
    stepperHold.action = action;
    stepperHold.styleId = styleId;
    stepperHold.colorIdx = colorIdx;
    stepperHold.sizeIdx = sizeIdx;
    stepperHold.numDisplay = numDisplay;
    stepperHold.currentInterval = 240;
    stepperHold.ticksCount = 0;

    btn.classList.add("is-pressed");

    stepperHold.holdTimer = setTimeout(function () {
      stepperHold.holdTimer = null;
      startStepperRepeat();
    }, 220);
  });

  document.addEventListener("pointermove", function (e) {
    if (!stepperHold.btn) return;
    if (e.pointerId !== undefined && stepperHold.pointerId !== null && e.pointerId !== stepperHold.pointerId) return;

    var rect = stepperHold.btn.getBoundingClientRect();
    var pad = 12;
    if (
      e.clientX < rect.left - pad ||
      e.clientX > rect.right + pad ||
      e.clientY < rect.top - pad ||
      e.clientY > rect.bottom + pad
    ) {
      cleanUpStepperHold(true);
    }
  });

  document.addEventListener("pointerup", function (e) {
    if (!stepperHold.btn) return;
    if (e.pointerId !== undefined && stepperHold.pointerId !== null && e.pointerId !== stepperHold.pointerId) return;
    cleanUpStepperHold(true);
  });

  document.addEventListener("pointercancel", function (e) {
    if (!stepperHold.btn) return;
    if (e.pointerId !== undefined && stepperHold.pointerId !== null && e.pointerId !== stepperHold.pointerId) return;
    cleanUpStepperHold(true);
  });

  window.addEventListener("blur", function () {
    if (stepperHold.btn) {
      cleanUpStepperHold(true);
    }
  });

  app.addEventListener("focus", function (e) {
    if (e.target.tagName === "TEXTAREA" && e.target.dataset.role !== "note-body-input") e.target.select();
  }, true);

  document.getElementById("import-file-input").addEventListener("change", function (e) {
    handleImportFile(e.target.files[0]);
    e.target.value = "";
  });

  // ---------- Mobile Pull-To-Refresh Implementation (replaces default bounce with intentional cloud reload) ----------
  var ptrIndicator = document.getElementById("ptr-indicator");
  var ptrLabel = ptrIndicator ? ptrIndicator.querySelector(".ptr-label") : null;
  var ptrSpinner = ptrIndicator ? ptrIndicator.querySelector(".ptr-spinner") : null;
  var ptrStartY = 0;
  var ptrStartX = 0;
  var ptrDistance = 0;
  var ptrThreshold = 65;
  var isPtrPulling = false;
  var isRefreshing = false;

  window.addEventListener("touchstart", function (e) {
    if (isRefreshing) return;
    if (e.touches.length !== 1) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 0) {
      ptrStartY = e.touches[0].clientY;
      ptrStartX = e.touches[0].clientX;
      isPtrPulling = true;
      ptrDistance = 0;
    } else {
      isPtrPulling = false;
    }
  }, { passive: true });

  window.addEventListener("touchmove", function (e) {
    if (!isPtrPulling || isRefreshing) return;
    var currentY = e.touches[0].clientY;
    var currentX = e.touches[0].clientX;
    var deltaY = currentY - ptrStartY;
    var deltaX = currentX - ptrStartX;

    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 0) {
      isPtrPulling = false;
      if (ptrIndicator) {
        ptrIndicator.classList.remove("is-pulling");
        ptrIndicator.style.transform = "translateY(-60px)";
      }
      return;
    }

    if (deltaY > 6 && deltaY > Math.abs(deltaX) * 1.2) {
      ptrDistance = Math.min(deltaY * 0.42, 85);
      if (ptrIndicator) {
        ptrIndicator.classList.add("is-pulling");
        ptrIndicator.style.transform = "translateY(" + (ptrDistance - 54) + "px)";
        var progress = Math.min(ptrDistance / ptrThreshold, 1);
        if (ptrSpinner) {
          ptrSpinner.style.transform = "rotate(" + (progress * 320) + "deg)";
        }
        if (ptrLabel) {
          ptrLabel.textContent = ptrDistance >= ptrThreshold ? "RELEASE TO SYNC" : "PULL TO REFRESH";
        }
      }
      if (e.cancelable && ptrDistance > 16) {
        e.preventDefault();
      }
    } else if (deltaY <= 0) {
      if (ptrIndicator && ptrIndicator.classList.contains("is-pulling")) {
        ptrIndicator.classList.remove("is-pulling");
        ptrIndicator.style.transform = "translateY(-60px)";
      }
    }
  }, { passive: false });

  window.addEventListener("touchend", function () {
    if (!isPtrPulling || isRefreshing) return;
    isPtrPulling = false;
    if (ptrDistance >= ptrThreshold) {
      isRefreshing = true;
      if (ptrIndicator) {
        ptrIndicator.classList.remove("is-pulling");
        ptrIndicator.classList.add("is-refreshing");
        ptrIndicator.style.transform = "translateY(14px)";
      }
      if (ptrLabel) ptrLabel.textContent = "SYNCING WITH CLOUD...";

      setSyncStatus("saving");
      loadFromCloud().then(function (loaded) {
        var needsSave = migrateState(loaded);
        setState(loaded);
        render();
        if (needsSave) save();
        setSyncStatus("saved");
        if (ptrLabel) ptrLabel.textContent = "SYNC COMPLETE ✓";
        setTimeout(function () {
          if (ptrIndicator) {
            ptrIndicator.classList.remove("is-refreshing");
            ptrIndicator.style.transform = "translateY(-60px)";
          }
          isRefreshing = false;
          ptrDistance = 0;
        }, 650);
      }).catch(function () {
        setSyncStatus("offline");
        if (ptrLabel) ptrLabel.textContent = "SYNC OFFLINE";
        setTimeout(function () {
          if (ptrIndicator) {
            ptrIndicator.classList.remove("is-refreshing");
            ptrIndicator.style.transform = "translateY(-60px)";
          }
          isRefreshing = false;
          ptrDistance = 0;
        }, 800);
      });
    } else {
      if (ptrIndicator) {
        ptrIndicator.classList.remove("is-pulling");
        ptrIndicator.style.transform = "translateY(-60px)";
      }
      ptrDistance = 0;
    }
  }, { passive: true });

  window.addEventListener("touchcancel", function () {
    isPtrPulling = false;
    if (!isRefreshing && ptrIndicator) {
      ptrIndicator.classList.remove("is-pulling");
      ptrIndicator.style.transform = "translateY(-60px)";
      ptrDistance = 0;
    }
  }, { passive: true });

  // ---------- Mouse Wheel & Iframe Focus Handling ----------
  window.addEventListener("mouseenter", function () {
    window.focus();
  });
  window.addEventListener("pointerdown", function () {
    window.focus();
  });

  window.addEventListener("wheel", function (e) {
    if (ui.confirmDialog !== null || ui.colorPickerModal !== null) {
      if (e.cancelable) e.preventDefault();
      return;
    }

    if (ui.activeNoteId) {
      var el = e.target;
      var inNoteModal = false;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.classList && el.classList.contains("note-editor-modal")) {
          inNoteModal = true;
          break;
        }
        el = el.parentElement;
      }
      if (!inNoteModal && e.cancelable) {
        e.preventDefault();
      }
      return;
    }
  }, { passive: false });

  // Re-align bottom navigation active pill when viewport changes or device rotates
  window.addEventListener("resize", function () {
    var navContainer = document.querySelector("#bottom-nav-container");
    if (navContainer) {
      updateBottomNavState(navContainer);
    }
  });
}
