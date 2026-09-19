import { state, ui } from "../state.js";
import { activeShop } from "../actions.js";
import { esc, formatActivityTime, buildSummary, sectionLabelHtml } from "../helpers.js";
import { ICON_COPY, ICON_PENCIL_WHITE, ICON_TRASH_WHITE, ICON_SAVE, ICON_CHEVRON_DOWN, ICON_NAV_HISTORY } from "../constants.js";

export function renderHistoryEmptyHtml() {
  return '<div style="text-align:center;padding:48px 20px;background:var(--panel-card);border:1px dashed var(--border-subtle);border-radius:12px;margin-top:8px;">' +
    '<div style="width:44px;height:44px;border-radius:999px;background:rgba(174,210,134,0.12);border:1px solid rgba(174,210,134,0.25);color:var(--primary);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">' + ICON_NAV_HISTORY + '</div>' +
    '<div style="font-family:var(--font-sans);font-size:16px;font-weight:700;color:var(--ink);margin-bottom:8px;">No audit history yet</div>' +
    '<div style="font-size:12px;color:var(--ink-muted);max-width:320px;margin:0 auto 20px;line-height:1.45;">Saved Quick Checks and Actual Counts will appear here.</div>' +
    '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">' +
    '<button class="btn-reset tap-btn" data-action="set-page" data-page="quick" style="padding:8px 16px;border-radius:4px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);font-family:var(--font-mono);font-size:11px;font-weight:700;cursor:pointer;">+ QUICK CHECK</button>' +
    '<button class="btn-reset tap-btn" data-action="set-page" data-page="count" style="padding:8px 16px;border-radius:4px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);font-family:var(--font-mono);font-size:11px;font-weight:700;cursor:pointer;">+ ACTUAL COUNT</button>' +
    '</div></div>';
}

  // ---------- HISTORY / AUDIT LOG VIEW ----------
export function renderHistoryPageHtml() {
    var sh = activeShop();
    var allEntries = state.history || [];
    var entries = allEntries.filter(function (e) {
      return !e.shopId || (sh && e.shopId === sh.id);
    });
    var html = '<div class="page-view" style="padding:16px 16px 24px;">';
    
    html += '<div style="font-size:20px;font-weight:800;letter-spacing:-0.01em;color:var(--ink);margin-bottom:8px;">Audit Log</div>';
    html += '<div style="font-size:14px;color:var(--ink-muted);margin-bottom:20px;">Review past stock checks and inventory counts.</div>';

    if (entries.length === 0) {
      html += renderHistoryEmptyHtml();
    } else {
      // Group entries by date
      var dateGroups = [];
      var seenDates = {};
      entries.forEach(function (e) {
        var d = e.date || "Unknown Date";
        if (!seenDates[d]) {
          seenDates[d] = [];
          dateGroups.push({ date: d, entries: seenDates[d] });
        }
        seenDates[d].push(e);
      });

      dateGroups.forEach(function (grp, idx) {
        html += renderHistoryDateCardHtml(grp, idx);
      });
    }

    html += '</div>';
    return html;
  }

export function renderHistoryDateCardHtml(grp, cardIdx) {
    var date = grp.date;
    ui.expandedHistoryDates = ui.expandedHistoryDates || {};
    var expanded = !!ui.expandedHistoryDates[date];

    // Collect all unique shop names on this date
    var shopNamesSet = [];
    grp.entries.forEach(function (e) {
      if (e.shopName && shopNamesSet.indexOf(e.shopName) === -1) {
        shopNamesSet.push(e.shopName);
      }
    });
    var shopsLabel = shopNamesSet.join(", ");

    // Check if at least one Quick Check or Actual Count was done on this day
    var hasQuick = grp.entries.some(function (e) { return e.page === "quick"; });
    var hasCount = grp.entries.some(function (e) { return e.page === "count"; });

    // Total item count across all entries on this date
    var totalItems = grp.entries.reduce(function (sum, e) {
      return sum + (Number(e.itemCount) || 0);
    }, 0);

    var isEditingDate = ui.editingHistoryDateId === ("date-group:" + date);
    var dateHtml;
    if (isEditingDate) {
      dateHtml = '<input class="js-autofocus" data-role="history-date-group-input" data-old-date="' + esc(date) + '" value="' + esc(date) + '" style="width:110px;font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink);padding:4px 8px;border:1px solid var(--primary);border-radius:4px;background:var(--bg-deep);line-height:1;white-space:nowrap;" />';
    } else {
      dateHtml = '<button class="btn-reset" data-action="history-date-group-edit-start" data-date="' + esc(date) + '" style="font-family:var(--font-mono);font-size:14px;font-weight:800;color:var(--ink);letter-spacing:0.02em;line-height:1;display:inline-flex;align-items:center;white-space:nowrap;">' + esc(date) + '</button>';
    }

    var histCardPadding = expanded ? "16px 16px" : "12px 16px";
    var html = '<div class="tap-card history-date-card" style="border:1px solid var(--border-subtle);border-radius:8px;background:var(--panel);margin-bottom:8px;padding:' + histCardPadding + ';box-shadow:var(--shadow-card);">';
    
    // Status badges HTML (for Quick Check / Actual Count)
    var badgesHtml = "";
    if (hasQuick) {
      badgesHtml += '<span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.03em;padding:4px 8px;border-radius:4px;background:var(--amber-bg);border:1px solid var(--amber-border);color:var(--amber-ink);display:inline-flex;align-items:center;line-height:1;white-space:nowrap;">QUICK CHECK</span>';
    }
    if (hasCount) {
      badgesHtml += '<span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.03em;padding:4px 8px;border-radius:4px;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green-ink);display:inline-flex;align-items:center;line-height:1;white-space:nowrap;">ACTUAL COUNT</span>';
    }

    // Top card header: 1-line on wide screens, 2-line on mobile with status badges beneath
    html += '<div class="history-card-header">';
    
    // Main header row
    html += '<div class="history-header-row">';
    html += '<div class="history-header-left">';
    html += '<div style="white-space:nowrap;flex-shrink:0;">' + dateHtml + '</div>';
    html += '<span class="history-shop-label">' + esc(shopsLabel) + '</span>';
    if (badgesHtml) {
      html += '<span class="history-badges-desktop"' + (expanded ? ' style="display:none;"' : '') + '>' + badgesHtml + '</span>';
    }
    html += '</div>';
    
    // Right side: items count + VIEW/HIDE toggle + delete entire day X button
    html += '<div style="display:inline-flex;align-items:center;gap:8px;flex-shrink:0;">' +
      '<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);line-height:1;white-space:nowrap;">' + totalItems + ' items</span>' +
      '<button class="btn-reset tap-btn history-view-btn" data-action="toggle-history-date" data-date="' + esc(date) + '" style="font-size:11px;font-weight:700;color:var(--primary);display:inline-flex;align-items:center;gap:4px;line-height:1;padding:4px 8px;white-space:nowrap;">' +
      '<span class="history-view-btn-text">' + (expanded ? "HIDE " : "VIEW ") + '</span>' +
      '<span class="toggle-rot-icon history-view-btn-icon ' + (expanded ? "is-open" : "") + '" style="display:inline-flex;align-items:center;">' + ICON_CHEVRON_DOWN + '</span>' +
      '</button>' +
      '<button class="btn-reset tap-btn history-delete-btn touch-hit-44" data-action="delete-history-date" data-date="' + esc(date) + '" title="Delete this day\'s audit" style="color:var(--ink-faint);cursor:pointer;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
      '</div></div>';

    // Mobile badges on 2nd line beneath date & name (visible on mobile screens when collapsed)
    if (badgesHtml) {
      html += '<div class="history-badges-mobile"' + (expanded ? ' style="display:none;"' : '') + '>' + badgesHtml + '</div>';
    }

    html += '</div>';

    // Collapsible inner detail section
    html += '<div class="collapsible-grid ' + (expanded ? "is-open" : "") + '" id="history-date-collapse-' + esc(date) + '">';
    html += '<div class="collapsible-inner">';
    html += '<div style="border-top:1px solid var(--border-subtle);padding-top:12px;margin-top:12px;">';

    // Group entries by shopId/shopName
    var shopGroups = [];
    var seenShops = {};
    grp.entries.forEach(function (e) {
      var sName = e.shopName || "Default Shop";
      if (!seenShops[sName]) {
        seenShops[sName] = [];
        shopGroups.push({ shopName: sName, entries: seenShops[sName] });
      }
      seenShops[sName].push(e);
    });

    shopGroups.forEach(function (sg, sIdx) {
      var isMultiShop = shopGroups.length > 1;
      
      // Sort entries: QUICK CHECK on top, ACTUAL COUNT on bottom
      var sortedEntries = sg.entries.slice().sort(function (a, b) {
        if (a.page === "quick" && b.page !== "quick") return -1;
        if (a.page !== "quick" && b.page === "quick") return 1;
        return 0;
      });

      // If multiple shops exist on the same date, frame each shop inside its own dedicated subtle container with shop badge
      if (isMultiShop) {
        html += '<div style="background:var(--bg);border:1px solid var(--border-subtle);border-radius:4px;padding:8px 12px;margin-top:' + (sIdx === 0 ? '0' : '12px') + ';">';
        html += '<div style="display:flex;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle);">';
        html += '<span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:var(--ink);letter-spacing:0.04em;text-transform:uppercase;">' + esc(sg.shopName) + '</span>';
        html += '</div>';
      } else {
        html += '<div style="margin-top:' + (sIdx === 0 ? '0' : '12px') + ';">';
      }

      sortedEntries.forEach(function (entry, eIdx) {
        var isQuick = entry.page === "quick";
        var badgeLabel = isQuick ? "QUICK CHECK" : "ACTUAL COUNT";
        var badgeStyle = isQuick
          ? "background:var(--amber-bg);border:1px solid var(--amber-border);color:var(--amber-ink);"
          : "background:var(--green-bg);border:1px solid var(--green-border);color:var(--green-ink);";
        
        var taId = "history-ta-" + entry.id;
        var labelId = "history-copy-label-" + entry.id;

        // Space between Quick Check and Actual Count for same shop (no dividing line)
        var entrySpacing = eIdx > 0 ? 'margin-top:12px;' : '';

        html += '<div style="' + entrySpacing + '">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
        html += '<span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.04em;padding:4px 8px;border-radius:4px;' + badgeStyle + '">' + badgeLabel + '</span>';
        
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);">' + entry.itemCount + (isQuick ? " items" : " pcs") + '</span>';
        html += '<button class="btn-reset tap-btn history-delete-btn touch-hit-44" data-action="delete-history-entry" data-entry-id="' + entry.id + '" title="Delete this snapshot" style="color:var(--ink-faint);cursor:pointer;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
        html += '</div>';
        html += '</div>';

        html += '<textarea id="' + taId + '" readonly rows="' + Math.min(8, Math.max(2, (entry.summaryText || "").split("\n").length)) + '" style="width:100%;font-family:var(--font-mono);font-size:12px;line-height:1.6;white-space:pre-wrap;color:var(--ink-primary);padding:8px 12px;background:var(--bg-deep);border:1px solid var(--border-subtle);border-radius:4px;resize:none;box-sizing:border-box;">' + esc(entry.summaryText) + '</textarea>';

        html += '<button class="btn-reset tap-btn action-btn-secondary" data-action="copy-history-entry" data-entry-id="' + entry.id + '" style="margin-top:8px;width:100%;padding:8px 12px;background:var(--panel-alt);border:1px solid var(--border);color:var(--ink);border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:8px;">' +
          ICON_COPY + '<span id="' + labelId + '">COPY LIST</span></button>';
        html += '</div>';
      });

      html += '</div>'; // End shop container
    });

    html += '</div>'; // End inner border-top wrapper
    html += '</div>'; // End collapsible-inner
    html += '</div>'; // End collapsible-grid

    html += '</div>'; // End tap-card
    return html;
  }

