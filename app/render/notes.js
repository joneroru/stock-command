import { state, ui, save } from "../state.js";
import { activeShop, pageData } from "../actions.js";
import { esc, cryptoId, formatNoteDate, createNoteObj, isNoteCompletelyEmpty } from "../helpers.js";
import { render } from "./index.js";
import { getNotePalette } from "../theme.js";
import {
  NOTE_PALETTE, NOTE_COLOR_KEYS, ICON_PIN, ICON_SEARCH, ICON_X, ICON_PLUS,
  ICON_NOTE_DOC, ICON_CHECKLIST_SQUARE, ICON_COLUMNS_2, ICON_COLUMNS_1,
  ICON_SORT_NEW, ICON_SORT_OLD, ICON_SORT_COLOR, ICON_ADJUSTMENTS,
  ICON_CHECK_SMALL, ICON_CHECK, ICON_TRASH_WHITE, ICON_NAV_NOTES, ICON_ARROW_LEFT
} from "../constants.js";

  // ---------- NOTES VIEW & EDITOR ----------

export function renderNoteCardHtml(note, idx) {
    var palette = getNotePalette(note.color);
    var isChecklist = Array.isArray(note.items);
    var isTrackable = (note.trackable !== false) && !isChecklist;

    var html = '<div class="note-card tap-card" id="note-card-' + note.id + '" data-action="open-note" data-note-id="' + note.id + '" style="position:relative;background:' + palette.bg + ';border:1px solid ' + (palette.border || 'transparent') + ';border-radius:8px;padding:16px 16px 12px;cursor:pointer;color:' + palette.text + ';overflow:visible;font-family:var(--font-sans);user-select:none;box-shadow:0 2px 6px rgba(0,0,0,0.06);">';

    // Straddling top edge Pin: 12px circle in palette.dot with 2px border in var(--bg)
    html += '<div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:12px;height:12px;border-radius:999px;background:' + palette.dot + ';border:2px solid var(--bg);z-index:2;pointer-events:none;box-sizing:border-box;"></div>';

    // Folded corner triangle at bottom-right
    html += '<div style="position:absolute;right:0;bottom:0;width:14px;height:14px;clip-path:polygon(100% 0, 100% 100%, 0% 100%);-webkit-clip-path:polygon(100% 0, 100% 100%, 0% 100%);background:var(--corner-fold, rgba(0,0,0,0.35));border-bottom-right-radius:8px;pointer-events:none;"></div>';

    // Top-right trackable checkbox for non-checklist notes (17x17 touch target)
    if (isTrackable) {
      html += '<button class="btn-reset note-card-track-btn touch-hit-44" data-action="toggle-note-done" data-note-id="' + note.id + '" title="' + (note.done ? "Mark undone" : "Mark done") + '" style="position:absolute;top:9px;right:9px;width:17px;height:17px;border-radius:4px;border:1.5px solid ' + palette.dot + ';background:' + (note.done ? palette.dot : 'transparent') + ';display:flex;align-items:center;justify-content:center;z-index:3;color:' + (palette.checkColor || '#FFFFFF') + ';cursor:pointer;transition:transform 0.12s ease;">' +
        (note.done ? ICON_CHECK_SMALL : '') +
        '</button>';
    }

    // Title
    if (note.title && note.title.trim()) {
      var titlePaddingRight = isTrackable ? 'padding-right:24px;' : '';
      html += '<div class="note-card-title" style="color:' + palette.text + ';' + titlePaddingRight + '">' + esc(note.title) + '</div>';
    }

    // Content: Checklist or Text Body
    if (isChecklist) {
      var items = note.items || [];
      var previewItems = items.slice(0, 6);
      if (previewItems.length > 0) {
        html += '<div style="margin-top:2px;">';
        previewItems.forEach(function (item, itIdx) {
          var itemDone = Boolean(item && item.done);
          var itemText = (item && item.text) || "";
          html += '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
            '<button class="btn-reset note-item-track-btn" data-action="toggle-checklist-item-done" data-note-id="' + note.id + '" data-item-idx="' + itIdx + '" style="flex-shrink:0;margin-top:2px;width:15px;height:15px;border-radius:4px;border:1.5px solid ' + palette.dot + ';background:' + (itemDone ? palette.dot : 'transparent') + ';display:flex;align-items:center;justify-content:center;color:' + (palette.checkColor || '#FFFFFF') + ';cursor:pointer;">' +
            (itemDone ? ICON_CHECK_SMALL : '') +
            '</button>' +
            '<span class="note-card-item-text" style="flex:1;min-width:0;' + (itemDone ? 'text-decoration:line-through;opacity:0.5;' : 'opacity:0.95;') + '">' + esc(itemText) + '</span>' +
            '</div>';
        });
        if (items.length > 6) {
          html += '<div class="note-card-more-label">+' + (items.length - 6) + ' more</div>';
        }
        html += '</div>';
      } else {
        html += '<div style="font-size:14px;opacity:0.5;font-style:italic;">Empty checklist</div>';
      }
    } else {
      var body = note.text || "";
      if (body.trim()) {
        var isStriked = isTrackable && note.done;
        html += '<div class="note-card-body" style="color:' + palette.text + ';' + (isStriked ? 'text-decoration:line-through;opacity:0.55;' : 'opacity:0.9;') + '">' + esc(body) + '</div>';
      } else if (!note.title || !note.title.trim()) {
        html += '<div style="font-size:14px;opacity:0.5;font-style:italic;">Empty note</div>';
      }
    }

    // Bottom Date Stamp
    html += '<div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;">' +
      '<span class="note-card-date" style="color:' + palette.text + ';">' + esc(note.date || "") + '</span>' +
      '</div>';

    html += '</div>';
    return html;
  }

export function getFilteredAndSortedNotes() {
    var allNotes = (state.notes || []).slice();
    var q = (ui.notesSearchQuery || "").trim().toLowerCase();

    // Filter
    var filtered = allNotes.filter(function (n) {
      if (!q) return true;
      if (n.title && n.title.toLowerCase().indexOf(q) !== -1) return true;
      if (n.text && n.text.toLowerCase().indexOf(q) !== -1) return true;
      if (Array.isArray(n.items) && n.items.some(function (it) { return it && it.text && it.text.toLowerCase().indexOf(q) !== -1; })) return true;
      return false;
    });

    // Sort: manual keeps exact array order
    if (ui.notesSort === "oldest") {
      filtered.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    } else if (ui.notesSort === "color") {
      filtered.sort(function (a, b) {
        var aIdx = NOTE_COLOR_KEYS.indexOf(a.color || "none");
        var bIdx = NOTE_COLOR_KEYS.indexOf(b.color || "none");
        return aIdx - bIdx;
      });
    } else if (ui.notesSort === "manual") {
      // Retain manual user-ordered placement in state.notes
    } else {
      // Default: "newest"
      filtered.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    }

    return filtered;
  }

export function renderNotesEmptyAllHtml() {
    return '<div style="text-align:center;padding:48px 20px;background:var(--panel-card);border:1px dashed var(--border-subtle);border-radius:12px;margin-top:8px;">' +
      '<div style="width:44px;height:44px;border-radius:999px;background:rgba(174,210,134,0.12);border:1px solid rgba(174,210,134,0.25);color:var(--primary);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">' + ICON_NAV_NOTES + '</div>' +
      '<div style="font-family:var(--font-sans);font-size:16px;font-weight:700;color:var(--ink);margin-bottom:8px;">No notes yet</div>' +
      '<div style="font-size:12px;color:var(--ink-muted);max-width:280px;margin:0 auto 20px;line-height:1.45;">Create quick notes, reminders, or checklists across all shops.</div>' +
      '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">' +
      '<button class="btn-reset tap-btn" data-action="create-new-note" data-note-type="text" style="padding:8px 16px;border-radius:4px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);font-family:var(--font-mono);font-size:11px;font-weight:700;cursor:pointer;">+ NEW NOTE</button>' +
      '<button class="btn-reset tap-btn" data-action="create-new-note" data-note-type="checklist" style="padding:8px 16px;border-radius:4px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);font-family:var(--font-mono);font-size:11px;font-weight:700;cursor:pointer;">+ NEW CHECKLIST</button>' +
      '</div></div>';
  }

export function renderNotesEmptyFilteredHtml() {
    return '<div style="text-align:center;padding:48px 20px;background:var(--panel-card);border:1px solid var(--border-subtle);border-radius:8px;margin-top:8px;">' +
      '<div style="font-size:14px;color:var(--ink-muted);margin-bottom:12px;">No notes matching &ldquo;<span style="color:var(--ink);">' + esc(ui.notesSearchQuery) + '</span>&rdquo;</div>' +
      '<button class="btn-reset tap-btn" data-action="add-search-note" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:4px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);font-family:var(--font-mono);font-size:11px;font-weight:800;cursor:pointer;">' +
      ICON_PLUS + '<span>CREATE NOTE &ldquo;' + esc(ui.notesSearchQuery) + '&rdquo;</span></button>' +
      '</div>';
  }

export function renderNotesColumnsHtml(filtered) {
    var numCols = (ui.notesViewMode === "full") ? 1 : 2;
    var cols = [];
    for (var c = 0; c < numCols; c++) cols.push([]);

    // Explicit JS-driven round-robin column assignment:
    // 1st note -> col 0, 2nd note -> col 1, 3rd note -> col 0 (below 1st), 4th note -> col 1 (below 2nd)
    filtered.forEach(function (note, idx) {
      cols[idx % numCols].push(note);
    });

    var html = '<div id="notes-grid-columns" class="notes-grid-columns" data-num-cols="' + numCols + '">';
    for (var c = 0; c < numCols; c++) {
      html += '<div id="notes-column-' + c + '" class="notes-column" data-col-idx="' + c + '">';
      cols[c].forEach(function (note) {
        html += renderNoteCardHtml(note);
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

export function renderNotesGridInnerHtml() {
    var allNotes = state.notes || [];
    if (allNotes.length === 0) {
      return renderNotesEmptyAllHtml();
    }
    var filtered = getFilteredAndSortedNotes();
    if (filtered.length === 0) {
      return renderNotesEmptyFilteredHtml();
    }
    return renderNotesColumnsHtml(filtered);
  }

export function renderNotesToolbarHtml() {
    var html = '<div class="notes-search-bar-row" style="display:flex;align-items:center;background:var(--panel-alt);border:1px solid var(--border);border-radius:8px;padding:4px 8px 4px 12px;position:relative;margin-bottom:32px;box-sizing:border-box;">';
    
    // Search icon
    html += '<div style="color:var(--ink-muted);display:flex;align-items:center;margin-right:8px;flex-shrink:0;pointer-events:none;">' + ICON_SEARCH + '</div>';
    
    // Search input
    html += '<input id="notes-search-input" data-role="notes-search-input" placeholder="Search notes..." value="' + esc(ui.notesSearchQuery) + '" style="flex:1;min-width:0;font-family:var(--font-sans);font-size:14px;color:var(--ink);background:transparent;border:none;outline:none;padding:8px 0;" />';
    
    // Clear search button
    if (ui.notesSearchQuery) {
      html += '<button class="btn-reset tap-btn touch-hit-44" data-action="clear-notes-search" title="Clear search" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:var(--ink-muted);cursor:pointer;flex-shrink:0;margin-right:4px;">' + ICON_X + '</button>';
    }

    // Subtle divider
    html += '<div style="width:1px;height:18px;background:var(--border-subtle);margin:0 8px 0 4px;flex-shrink:0;"></div>';

    // Adjustments (sort/columns) icon & dropdown
    html += '<div style="position:relative;flex-shrink:0;">';
    html += '<button class="btn-reset tap-btn action-btn-icon notes-toolbar-icon-btn touch-hit-44" data-action="toggle-notes-adjust-menu" title="View & Sort Options" style="width:32px;height:32px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:' + (ui.notesAdjustMenuOpen ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;background:transparent;">' +
      ICON_ADJUSTMENTS +
      '</button>';
    if (ui.notesAdjustMenuOpen) {
      html += renderNotesAdjustDropdownHtml();
    }
    html += '</div>';

    // Plus create icon & dropdown (Monochrome neutral white/light-gray tone, no green!)
    html += '<div style="position:relative;flex-shrink:0;">';
    html += '<button class="btn-reset tap-btn action-btn-icon notes-toolbar-icon-btn touch-hit-44" data-action="toggle-notes-plus-menu" title="Create Note" style="width:32px;height:32px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:' + (ui.notesPlusMenuOpen ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;background:transparent;">' +
      ICON_PLUS +
      '</button>';
    if (ui.notesPlusMenuOpen) {
      html += renderNotesPlusDropdownHtml();
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

export function renderNotesAdjustDropdownHtml() {
    var html = '<div id="notes-adjust-menu" class="glass-dropdown notes-dropdown" style="position:absolute;right:0;top:calc(100% + 8px);z-index:50;min-width:180px;border-radius:8px;background:var(--panel);border:1px solid var(--border);box-shadow:var(--shadow-card);padding:8px 0;font-family:var(--font-mono);">';
    
    html += '<div style="padding:4px 16px;font-size:10px;font-weight:800;letter-spacing:0.06em;color:var(--ink-faint);text-transform:uppercase;">COLUMNS</div>';
    
    // 2 COLUMNS
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="set-notes-view" data-view="grid" style="width:100%;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:' + (ui.notesViewMode !== 'full' ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;">' +
      '<div style="display:flex;align-items:center;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:' + (ui.notesViewMode !== 'full' ? 'var(--ink)' : 'var(--ink-muted)') + ';">' + ICON_COLUMNS_2 + '</span>' +
      '<span>2 COLUMNS</span>' +
      '</div>' +
      (ui.notesViewMode !== 'full' ? '<span style="color:var(--ink);">' + ICON_CHECK + '</span>' : '') +
      '</button>';

    // 1 COLUMN
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="set-notes-view" data-view="full" style="width:100%;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:' + (ui.notesViewMode === 'full' ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;">' +
      '<div style="display:flex;align-items:center;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:' + (ui.notesViewMode === 'full' ? 'var(--ink)' : 'var(--ink-muted)') + ';">' + ICON_COLUMNS_1 + '</span>' +
      '<span>1 COLUMN</span>' +
      '</div>' +
      (ui.notesViewMode === 'full' ? '<span style="color:var(--ink);">' + ICON_CHECK + '</span>' : '') +
      '</button>';

    html += '<div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>';

    html += '<div style="padding:4px 16px;font-size:10px;font-weight:800;letter-spacing:0.06em;color:var(--ink-faint);text-transform:uppercase;">SORT BY</div>';

    // NEWEST FIRST
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="set-notes-sort" data-sort="newest" style="width:100%;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:' + (ui.notesSort === 'newest' ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;">' +
      '<div style="display:flex;align-items:center;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:' + (ui.notesSort === 'newest' ? 'var(--ink)' : 'var(--ink-muted)') + ';">' + ICON_SORT_NEW + '</span>' +
      '<span>NEWEST FIRST</span>' +
      '</div>' +
      (ui.notesSort === 'newest' ? '<span style="color:var(--ink);">' + ICON_CHECK + '</span>' : '') +
      '</button>';

    // OLDEST FIRST
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="set-notes-sort" data-sort="oldest" style="width:100%;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:' + (ui.notesSort === 'oldest' ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;">' +
      '<div style="display:flex;align-items:center;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:' + (ui.notesSort === 'oldest' ? 'var(--ink)' : 'var(--ink-muted)') + ';">' + ICON_SORT_OLD + '</span>' +
      '<span>OLDEST FIRST</span>' +
      '</div>' +
      (ui.notesSort === 'oldest' ? '<span style="color:var(--ink);">' + ICON_CHECK + '</span>' : '') +
      '</button>';

    // BY COLOR
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="set-notes-sort" data-sort="color" style="width:100%;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:' + (ui.notesSort === 'color' ? 'var(--ink)' : 'var(--ink-muted)') + ';cursor:pointer;">' +
      '<div style="display:flex;align-items:center;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:' + (ui.notesSort === 'color' ? 'var(--ink)' : 'var(--ink-muted)') + ';">' + ICON_SORT_COLOR + '</span>' +
      '<span>BY COLOR</span>' +
      '</div>' +
      (ui.notesSort === 'color' ? '<span style="color:var(--ink);">' + ICON_CHECK + '</span>' : '') +
      '</button>';

    html += '</div>';
    return html;
  }

export function renderNotesPlusDropdownHtml() {
    var html = '<div id="notes-plus-menu" class="glass-dropdown notes-dropdown" style="position:absolute;right:0;top:calc(100% + 8px);z-index:50;min-width:160px;border-radius:8px;background:var(--panel);border:1px solid var(--border);box-shadow:var(--shadow-card);padding:8px 0;font-family:var(--font-mono);">';
    
    // NOTE option
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="create-new-note" data-note-type="text" style="width:100%;padding:8px 16px;display:flex;align-items:center;font-size:12px;font-weight:700;color:var(--ink);cursor:pointer;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:var(--ink);">' + ICON_NOTE_DOC + '</span>' +
      '<span>NOTE</span>' +
      '</button>';

    // CHECKLIST option
    html += '<button class="btn-reset tap-btn notes-dropdown-item" data-action="create-new-note" data-note-type="checklist" style="width:100%;padding:8px 16px;display:flex;align-items:center;font-size:12px;font-weight:700;color:var(--ink);cursor:pointer;">' +
      '<span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px;color:var(--ink);">' + ICON_CHECKLIST_SQUARE + '</span>' +
      '<span>CHECKLIST</span>' +
      '</button>';

    html += '</div>';
    return html;
  }

export function renderEditorChecklistItemsListHtml(note) {
    var palette = getNotePalette(note.color);
    var itemBg = "var(--note-item-bg)";
    var html = '';
    (note.items || []).forEach(function (item, idx) {
      var itemDone = Boolean(item && item.done);
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;background:' + itemBg + ';border-radius:4px;padding:8px 8px;box-sizing:border-box;">' +
        '<button class="btn-reset note-item-track-btn" data-action="toggle-editor-item-done" data-item-idx="' + idx + '" style="flex-shrink:0;width:16px;height:16px;border-radius:4px;border:1.5px solid ' + palette.dot + ';background:' + (itemDone ? palette.dot : 'transparent') + ';display:flex;align-items:center;justify-content:center;color:' + (palette.checkColor || '#FFFFFF') + ';cursor:pointer;">' +
        (itemDone ? ICON_CHECK_SMALL : '') +
        '</button>' +
        '<input data-role="checklist-item-input" data-item-idx="' + idx + '" value="' + esc(item.text || "") + '" placeholder="List item..." style="flex:1;min-width:0;font-family:var(--font-sans);font-size:14px;color:' + palette.text + ';background:transparent;border:none;outline:none;' + (itemDone ? 'text-decoration:line-through;opacity:0.5;' : '') + '" />' +
        '<button class="btn-reset tap-btn" data-action="delete-checklist-item" data-item-idx="' + idx + '" title="Remove item" style="opacity:0.5;color:' + palette.text + ';cursor:pointer;padding:4px;display:flex;align-items:center;">' + ICON_X + '</button>' +
        '</div>';
    });
    return html;
  }

export function updateEditorChecklistDOM(note) {
    var listEl = document.getElementById("editor-checklist-items-list");
    if (listEl) {
      listEl.innerHTML = renderEditorChecklistItemsListHtml(note);
    }
  }

export function renderNoteEditorPanelHtml(note) {
    var palette = getNotePalette(note.color);
    var isChecklist = Array.isArray(note.items);
    var isTrackable = (note.trackable !== false) && !isChecklist;
    var btnBg = "var(--note-btn-bg)";
    var addBoxBg = "var(--note-add-box-bg)";
    var switchOffBg = "var(--note-switch-off-bg)";

    var html = '<div id="note-editor-panel" style="background:' + palette.bg + ';min-height:480px;border-radius:12px;border:1px solid var(--border);padding:16px 16px 24px;color:' + palette.text + ';position:relative;box-sizing:border-box;">';

    // Top Navigation & Action Bar
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">';
    
    // Left: Back button
    html += '<button class="btn-reset tap-btn" data-action="note-editor-back" title="Back to notes" style="display:inline-flex;align-items:center;gap:8px;color:' + palette.text + ';font-family:var(--font-mono);font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px;background:' + btnBg + ';border:1px solid var(--border-subtle);cursor:pointer;">' +
      ICON_ARROW_LEFT + '<span>NOTES</span></button>';

    // Center: Date stamp
    html += '<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;opacity:0.75;letter-spacing:0.04em;">' + esc(note.date || "") + '</span>';

    // Right: Delete button
    html += '<button class="btn-reset tap-btn touch-hit-44" data-action="note-editor-delete" title="Delete note" style="display:inline-flex;align-items:center;justify-content:center;color:' + palette.text + ';opacity:0.8;padding:4px 8px;border-radius:4px;background:' + btnBg + ';border:1px solid var(--border-subtle);cursor:pointer;">' +
      ICON_TRASH_WHITE + '</button>';

    html += '</div>';

    // Title input
    html += '<div style="margin-bottom:12px;">' +
      '<input data-role="note-title-input" placeholder="Title (optional)" value="' + esc(note.title || "") + '" style="width:100%;font-family:var(--font-sans);font-size:20px;font-weight:800;color:' + palette.text + ';border:none;outline:none;background:transparent;letter-spacing:-0.01em;padding:4px 0;line-height:1.25;" />' +
      '</div>';

    // Body content: Checklist items vs Multiline textarea
    if (isChecklist) {
      html += '<div id="editor-checklist-items" style="margin-bottom:16px;">';
      html += '<div id="editor-checklist-items-list">';
      html += renderEditorChecklistItemsListHtml(note);
      html += '</div>';

      // Add item row (Press Enter adds item)
      html += '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 12px;background:' + addBoxBg + ';border-radius:4px;border:1px dashed var(--border);">' +
        '<span style="color:' + palette.dot + ';font-size:16px;font-weight:bold;line-height:1;">+</span>' +
        '<input id="checklist-add-input" data-role="checklist-add-input" placeholder="Add item (press Enter)..." style="flex:1;min-width:0;font-family:var(--font-sans);font-size:14px;color:' + palette.text + ';background:transparent;border:none;outline:none;" />' +
        '<button class="btn-reset tap-btn" data-action="add-checklist-item-btn" style="font-family:var(--font-mono);font-size:10px;font-weight:800;color:' + (palette.checkColor || '#FFFFFF') + ';background:' + palette.dot + ';border-radius:4px;padding:4px 8px;cursor:pointer;">ADD</button>' +
        '</div>';

      html += '</div>';
    } else {
      // Plain note body textarea has NO custom Enter handling at all — Enter behaves completely normally
      html += '<div style="margin-bottom:16px;">' +
        '<textarea data-role="note-body-input" placeholder="Note text..." rows="9" style="width:100%;font-family:var(--font-sans);font-size:14px;line-height:1.6;color:' + palette.text + ';border:none;outline:none;resize:none;background:transparent;min-height:200px;box-sizing:border-box;">' + esc(note.text || "") + '</textarea>' +
        '</div>';
    }

    // Bottom Controls: 10 Color Swatches + Trackable Switch
    html += '<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:16px;">';

    // 10 jewel-tone swatches
    html += '<div>' +
      '<div style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.06em;opacity:0.75;margin-bottom:8px;text-transform:uppercase;">COLOR PALETTE</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';

    NOTE_COLOR_KEYS.forEach(function (cKey) {
      var cPal = getNotePalette(cKey);
      var isSelected = (note.color === cKey) || (!note.color && cKey === "none");
      var borderStyle = isSelected ? '3px solid var(--ink)' : '1.5px solid var(--border)';
      var transformStyle = isSelected ? 'scale(1.15)' : 'scale(1)';
      html += '<button class="btn-reset tap-btn" data-action="set-note-color" data-color-key="' + cKey + '" title="' + cKey + '" style="width:25px;height:25px;border-radius:999px;background:' + cPal.dot + ';border:' + borderStyle + ';transform:' + transformStyle + ';transition:transform 0.12s ease;cursor:pointer;display:flex;align-items:center;justify-content:center;">' +
        (isSelected ? '<span style="width:5px;height:5px;border-radius:999px;background:var(--ink);"></span>' : '') +
        '</button>';
    });

    html += '</div></div>';

    // Track completion toggle (for non-checklist notes)
    if (!isChecklist) {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;">' +
        '<div>' +
        '<div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">TRACK COMPLETION</div>' +
        '<div style="font-size:11px;opacity:0.65;margin-top:2px;">Display a done checkbox on the note card</div>' +
        '</div>' +
        '<button class="btn-reset tap-btn touch-hit-44" data-action="toggle-note-trackable" style="width:40px;height:22px;border-radius:999px;background:' + (isTrackable ? palette.dot : switchOffBg) + ';position:relative;cursor:pointer;transition:background 0.18s ease;">' +
        '<span style="position:absolute;top:2px;left:' + (isTrackable ? '20px' : '2px') + ';width:18px;height:18px;border-radius:999px;background:#FFFFFF;transition:left 0.18s cubic-bezier(0.2,0,0.2,1);box-shadow:0 1px 3px rgba(0,0,0,0.35);"></span>' +
        '</button>' +
        '</div>';
    }

    html += '</div>'; // End bottom controls

    html += '</div>'; // End note-editor-panel
    return html;
  }

export function renderNotesPageHtml() {
    var html = '<div id="notes-page-root" class="page-view" style="padding:16px 16px 80px;position:relative;">';

    // Notes Grid View (contains single row search/action bar and columns grid)
    var gridStyle = ui.activeNoteId ? 'display:none;' : 'display:block;';
    html += '<div id="notes-grid-view" style="' + gridStyle + '">';
    html += renderNotesToolbarHtml();
    html += '<div id="notes-grid-content">';
    html += renderNotesGridInnerHtml();
    html += '</div>';
    html += '</div>';

    // Note Editor View Container
    var editorStyle = ui.activeNoteId ? 'display:block;' : 'display:none;';
    html += '<div id="note-editor-container" style="' + editorStyle + '">';
    if (ui.activeNoteId) {
      var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
      if (note) {
        html += renderNoteEditorPanelHtml(note);
      }
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // FLIP reflow animation for notes cards
export function animateNotesFLIP(firstRects) {
    if (!firstRects) return;
    var cards = document.querySelectorAll("#notes-grid-columns .note-card[data-note-id]");
    var animated = [];

    cards.forEach(function (card) {
      var id = card.getAttribute("data-note-id");
      if (!id || !firstRects[id]) return;
      var prev = firstRects[id];
      var cur = card.getBoundingClientRect();
      var dx = prev.left - cur.left;
      var dy = prev.top - cur.top;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        card.style.transition = "none";
        card.style.transform = "translate(" + dx + "px, " + dy + "px)";
        card.style.zIndex = "5";
        animated.push(card);
      }
    });

    if (animated.length === 0) return;

    void document.body.offsetWidth; // Force layout reflow

    requestAnimationFrame(function () {
      animated.forEach(function (card) {
        card.style.transition = "transform 250ms cubic-bezier(0.2, 0, 0.2, 1)";
        card.style.transform = "translate(0px, 0px)";
      });

      setTimeout(function () {
        animated.forEach(function (card) {
          card.style.transition = "";
          card.style.transform = "";
          card.style.zIndex = "";
        });
      }, 260);
    });
  }

export function updateNotesGridColumnsDOM(withFLIP) {
    var gridContainer = document.getElementById("notes-grid-content");
    if (!gridContainer) return;

    var firstRects = {};
    if (withFLIP) {
      var existingCards = gridContainer.querySelectorAll(".note-card[data-note-id]");
      existingCards.forEach(function (card) {
        var nId = card.getAttribute("data-note-id");
        if (nId) firstRects[nId] = card.getBoundingClientRect();
      });
    }

    gridContainer.innerHTML = renderNotesGridInnerHtml();

    if (withFLIP && Object.keys(firstRects).length > 0) {
      animateNotesFLIP(firstRects);
    }
  }

export function openNoteEditor(noteId, cardEl) {
    if (cardEl) {
      var r = cardEl.getBoundingClientRect();
      ui.originNoteRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    } else {
      ui.originNoteRect = null;
    }
    ui.activeNoteId = noteId;

    var note = (state.notes || []).find(function (n) { return n.id === noteId; });
    if (!note) return;

    var editorContainer = document.getElementById("note-editor-container");
    var gridView = document.getElementById("notes-grid-view");

    if (editorContainer && gridView) {
      editorContainer.innerHTML = renderNoteEditorPanelHtml(note);
      editorContainer.style.cssText = "display:block;";
      gridView.style.display = "none";
    } else {
      render();
    }

    var panel = document.getElementById("note-editor-panel");
    if (!panel) return;

    if (ui.originNoteRect && ui.originNoteRect.width > 0 && ui.originNoteRect.height > 0) {
      var curRect = panel.getBoundingClientRect();
      var dx = ui.originNoteRect.left - curRect.left;
      var dy = ui.originNoteRect.top - curRect.top;
      var sx = ui.originNoteRect.width / curRect.width;
      var sy = ui.originNoteRect.height / curRect.height;

      panel.style.transformOrigin = "top left";
      panel.style.transition = "none";
      panel.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")";
      panel.style.opacity = "0.75";
      panel.style.borderRadius = "8px";
      void panel.offsetWidth;

      requestAnimationFrame(function () {
        panel.style.transition = "transform 240ms cubic-bezier(0.2, 0, 0.2, 1), opacity 220ms ease-out, border-radius 240ms ease";
        panel.style.transform = "translate(0px, 0px) scale(1, 1)";
        panel.style.opacity = "1";
        panel.style.borderRadius = "12px";
      });
    } else {
      panel.style.transformOrigin = "center center";
      panel.style.transition = "none";
      panel.style.transform = "scale(0.92)";
      panel.style.opacity = "0";
      void panel.offsetWidth;

      requestAnimationFrame(function () {
        panel.style.transition = "transform 220ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms ease-out";
        panel.style.transform = "scale(1)";
        panel.style.opacity = "1";
      });
    }

    setTimeout(function () {
      var titleInp = document.querySelector('[data-role="note-title-input"]');
      if (titleInp && !titleInp.value) {
        titleInp.focus();
      }
    }, 250);
  }

export function closeNoteEditor() {
    var note = (state.notes || []).find(function (n) { return n.id === ui.activeNoteId; });
    if (note && isNoteCompletelyEmpty(note)) {
      state.notes = (state.notes || []).filter(function (n) { return n.id !== note.id; });
      save();
    }

    var panel = document.getElementById("note-editor-panel");
    var editorContainer = document.getElementById("note-editor-container");
    var gridView = document.getElementById("notes-grid-view");

    function cleanupAndShowGrid() {
      if (editorContainer) {
        editorContainer.innerHTML = "";
        editorContainer.style.cssText = "display:none;";
      }
      if (gridView) {
        gridView.style.display = "block";
      }
      ui.activeNoteId = null;
      ui.originNoteRect = null;
      updateNotesGridColumnsDOM(false);
    }

    if (!panel || !editorContainer || !gridView) {
      ui.activeNoteId = null;
      ui.originNoteRect = null;
      render();
      return;
    }

    var curRect = panel.getBoundingClientRect();

    // Re-render grid view in DOM and display it so target destination card has valid bounds
    updateNotesGridColumnsDOM(false);
    gridView.style.display = "block";

    var targetCard = note ? document.getElementById("note-card-" + note.id) : null;
    var targetRect = targetCard ? targetCard.getBoundingClientRect() : ui.originNoteRect;

    // Pin editorContainer as a fixed overlay at curRect so it does not push gridView down or shift during transition
    editorContainer.style.position = "fixed";
    editorContainer.style.left = curRect.left + "px";
    editorContainer.style.top = curRect.top + "px";
    editorContainer.style.width = curRect.width + "px";
    editorContainer.style.height = curRect.height + "px";
    editorContainer.style.margin = "0";
    editorContainer.style.zIndex = "40";
    editorContainer.style.pointerEvents = "none";

    if (targetRect && targetRect.width > 0 && targetRect.height > 0) {
      var dx = targetRect.left - curRect.left;
      var dy = targetRect.top - curRect.top;
      var sx = targetRect.width / curRect.width;
      var sy = targetRect.height / curRect.height;

      panel.style.transformOrigin = "top left";
      panel.style.transition = "transform 240ms cubic-bezier(0.2, 0, 0.2, 1), opacity 220ms ease, border-radius 240ms ease";
      panel.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")";
      panel.style.opacity = "0.7";
      panel.style.borderRadius = "8px";
      setTimeout(cleanupAndShowGrid, 240);
    } else {
      panel.style.transformOrigin = "center center";
      panel.style.transition = "transform 220ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms ease-in";
      panel.style.transform = "scale(0.92)";
      panel.style.opacity = "0";
      setTimeout(cleanupAndShowGrid, 220);
    }
  }

export function deleteNoteFromEditor() {
    var noteId = ui.activeNoteId;
    if (noteId) {
      state.notes = (state.notes || []).filter(function (n) { return n.id !== noteId; });
      save();
    }
    var editorContainer = document.getElementById("note-editor-container");
    var gridView = document.getElementById("notes-grid-view");
    if (editorContainer && gridView) {
      editorContainer.innerHTML = "";
      editorContainer.style.cssText = "display:none;";
      gridView.style.display = "block";
      ui.activeNoteId = null;
      ui.originNoteRect = null;
      updateNotesGridColumnsDOM(true);
    } else {
      ui.activeNoteId = null;
      ui.originNoteRect = null;
      render();
    }
  }

  // Drag-to-Reorder state & controller
export var dragData = {
    isDragging: false,
    targetNoteId: null,
    sourceCardEl: null,
    ghostEl: null,
    startX: 0,
    startY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    lastX: 0,
    lastTime: 0,
    currentTilt: 0,
    currentOrder: [],
    currentDragIdx: -1
  };

export function startCardDrag(card, clientX, clientY) {
    if (dragData.isDragging) return;
    dragData.isDragging = true;
    dragData.targetNoteId = card.getAttribute("data-note-id");
    dragData.sourceCardEl = card;
    dragData.lastX = clientX;
    dragData.lastTime = performance.now();
    dragData.currentTilt = 0;

    if (navigator.vibrate) {
      try { navigator.vibrate(35); } catch (err) {}
    }

    var rect = card.getBoundingClientRect();
    dragData.dragOffsetX = clientX - rect.left;
    dragData.dragOffsetY = clientY - rect.top;

    // Create floating drag ghost
    var ghost = card.cloneNode(true);
    ghost.id = "notes-drag-ghost";
    ghost.style.position = "fixed";
    ghost.style.left = "0px";
    ghost.style.top = "0px";
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.margin = "0";
    ghost.style.zIndex = "99999";
    ghost.style.pointerEvents = "none";
    ghost.style.transformOrigin = "center center";
    var curX = clientX - dragData.dragOffsetX;
    var curY = clientY - dragData.dragOffsetY;
    ghost.style.transform = "translate3d(" + curX + "px, " + curY + "px, 0) scale(1.05) rotate(0deg)";
    ghost.style.boxShadow = "0 18px 36px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.5)";
    ghost.style.opacity = "0.96";
    document.body.appendChild(ghost);
    dragData.ghostEl = ghost;

    // Dim source card and lock scrolling
    card.classList.add("is-dragging-card");
    document.body.classList.add("is-notes-dragging");

    var filtered = getFilteredAndSortedNotes();
    dragData.currentOrder = filtered.map(function (n) { return n.id; });
    dragData.currentDragIdx = dragData.currentOrder.indexOf(dragData.targetNoteId);
  }

export function handleCardDragMove(clientX, clientY) {
    if (!dragData.isDragging || !dragData.ghostEl) return;

    var now = performance.now();
    var dt = Math.max(1, now - (dragData.lastTime || now));
    var dx = clientX - (dragData.lastX !== undefined ? dragData.lastX : clientX);
    var vx = dx / dt; // pixels per millisecond
    dragData.lastX = clientX;
    dragData.lastTime = now;

    // Dynamic tilt based on horizontal velocity, clamped to -8deg to 8deg
    var targetTilt = Math.max(-8, Math.min(8, vx * 8));
    dragData.currentTilt = (dragData.currentTilt || 0) * 0.65 + targetTilt * 0.35;
    var tilt = Math.max(-8, Math.min(8, Math.round(dragData.currentTilt * 10) / 10));

    var curX = clientX - dragData.dragOffsetX;
    var curY = clientY - dragData.dragOffsetY;
    dragData.ghostEl.style.transform = "translate3d(" + curX + "px, " + curY + "px, 0) scale(1.05) rotate(" + tilt + "deg)";

    var cards = Array.from(document.querySelectorAll("#notes-grid-columns .note-card[data-note-id]"));
    if (cards.length <= 1) return;

    var closestCard = null;
    var minDistance = Infinity;

    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var centerX = r.left + r.width / 2;
      var centerY = r.top + r.height / 2;
      var dist = Math.hypot(clientX - centerX, clientY - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestCard = c;
      }
    });

    if (!closestCard) return;
    var targetId = closestCard.getAttribute("data-note-id");
    if (!targetId || targetId === dragData.targetNoteId) return;

    var targetIdx = dragData.currentOrder.indexOf(targetId);
    if (targetIdx === -1 || targetIdx === dragData.currentDragIdx) return;

    // FLIP reflow: capture rects BEFORE moving DOM elements
    var firstRects = {};
    cards.forEach(function (c) {
      var id = c.getAttribute("data-note-id");
      if (id) firstRects[id] = c.getBoundingClientRect();
    });

    var order = dragData.currentOrder.slice();
    order.splice(dragData.currentDragIdx, 1);
    order.splice(targetIdx, 0, dragData.targetNoteId);
    dragData.currentOrder = order;
    dragData.currentDragIdx = targetIdx;

    // Re-slot EXISTING DOM elements without destroying them (maintains touch/pointer events!)
    var numCols = (ui.notesViewMode === "full") ? 1 : 2;
    var colDivs = [];
    for (var c = 0; c < numCols; c++) {
      colDivs.push(document.getElementById("notes-column-" + c));
    }
    if (colDivs[0]) {
      order.forEach(function (id, idx) {
        var cardEl = document.getElementById("note-card-" + id);
        var targetCol = colDivs[idx % numCols];
        if (cardEl && targetCol) {
          targetCol.appendChild(cardEl);
        }
      });
      animateNotesFLIP(firstRects);
    }
  }

export function finishCardDrop() {
    var ghost = dragData.ghostEl;
    var droppedId = dragData.targetNoteId;
    var sourceCard = dragData.sourceCardEl || (droppedId ? document.getElementById("note-card-" + droppedId) : null);

    document.body.classList.remove("is-notes-dragging");

    function completeDrop() {
      if (ghost && ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
      dragData.ghostEl = null;
      dragData.isDragging = false;
      dragData.targetNoteId = null;
      if (sourceCard) {
        sourceCard.classList.remove("is-dragging-card");
      }
      dragData.sourceCardEl = null;

      if (dragData.currentOrder && dragData.currentOrder.length > 0) {
        var currentOrderIds = dragData.currentOrder;
        var noteMap = {};
        (state.notes || []).forEach(function (n) { noteMap[n.id] = n; });

        var reordered = [];
        currentOrderIds.forEach(function (id) {
          if (noteMap[id]) {
            reordered.push(noteMap[id]);
            delete noteMap[id];
          }
        });
        (state.notes || []).forEach(function (n) {
          if (noteMap[n.id]) {
            reordered.push(n);
          }
        });

        state.notes = reordered;
        ui.notesSort = "manual";
        save();
      }

      updateNotesGridColumnsDOM(true);
    }

    if (ghost && sourceCard) {
      var rect = sourceCard.getBoundingClientRect();
      ghost.style.transition = "transform 200ms cubic-bezier(0.2, 0, 0.2, 1), opacity 180ms ease";
      ghost.style.transform = "translate3d(" + rect.left + "px, " + rect.top + "px, 0) scale(1) rotate(0deg)";
      ghost.style.boxShadow = "none";
      setTimeout(completeDrop, 200);
    } else {
      completeDrop();
    }
  }

export function cancelCardDrag() {
    document.body.classList.remove("is-notes-dragging");
    if (dragData.ghostEl && dragData.ghostEl.parentNode) {
      dragData.ghostEl.parentNode.removeChild(dragData.ghostEl);
    }
    dragData.ghostEl = null;
    dragData.isDragging = false;
    dragData.targetNoteId = null;
    if (dragData.sourceCardEl) {
      dragData.sourceCardEl.classList.remove("is-dragging-card");
    }
    dragData.sourceCardEl = null;
    updateNotesGridColumnsDOM(true);
  }

