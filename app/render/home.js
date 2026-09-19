import { state, ui } from "../state.js";
import { isLightTheme } from "../theme.js";
import {
  esc, quickFlagBreakdown, totalQuickCells, formatActivityTime, sectionLabelHtml
} from "../helpers.js";
import {
  ICON_ARROW_RIGHT, ICON_DISCREPANCY, ICON_CABINET_BOX, ICON_SUN, ICON_MOON, ICON_LOGOUT
} from "../constants.js";

// ---------- HOME VIEW ----------
export function renderHomeViewHtml() {
  var html = '<div class="page-view" style="padding:16px 16px 28px;">';
  
  // Top Section Label SHOPS STATUS with line
  html += '<div style="margin-bottom:18px;">' +
    '<div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);margin-bottom:8px;">SHOPS STATUS</div>' +
    '<div style="height:1px;background:var(--border-subtle);"></div>' +
    '</div>';

  state.shops.forEach(function (sh) {
    var breakdown = quickFlagBreakdown(sh);
    var total = totalQuickCells(sh);
    var flagTotal = breakdown.out + breakdown.low;

    if (total < flagTotal) {
      total = flagTotal;
    }

    var outPct = 0;
    var lowPct = 0;
    var okPct = 100;
    if (total > 0) {
      if (breakdown.out > 0) {
        outPct = Math.max(1, Math.round((breakdown.out / total) * 100));
      }
      if (breakdown.low > 0) {
        lowPct = Math.max(1, Math.round((breakdown.low / total) * 100));
      }
      if (outPct + lowPct > 100) {
        if (breakdown.out >= breakdown.low) {
          lowPct = Math.max(1, 100 - outPct);
        } else {
          outPct = Math.max(1, 100 - lowPct);
        }
      }
      okPct = Math.max(0, 100 - outPct - lowPct);
      if (flagTotal > 0 && okPct >= 100) {
        okPct = 99;
      }
    }

    var leftBorderColor = "var(--status-ok-accent)";
    var cardBg = "var(--status-ok-bg)";
    var cardBorder = "var(--status-ok-border)";
    var cardShadow = "var(--status-ok-shadow)";

    if (breakdown.out > 0) {
      leftBorderColor = "var(--status-out-accent)";
      cardBg = "var(--status-out-bg)";
      cardBorder = "var(--status-out-border)";
      cardShadow = "var(--status-out-shadow)";
    } else if (breakdown.low > 0) {
      leftBorderColor = "var(--status-low-accent)";
      cardBg = "var(--status-low-bg)";
      cardBorder = "var(--status-low-border)";
      cardShadow = "var(--status-low-shadow)";
    }

    html += '<div class="tap-card" style="border:' + cardBorder + ';border-left:var(--status-card-accent-w) solid ' + leftBorderColor + ';border-radius:12px;background:' + cardBg + ';padding:18px 20px;margin-bottom:16px;box-shadow:' + cardShadow + ';position:relative;overflow:hidden;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);">';

    // Top row: Shop name & badges on left, OPEN -> button on right
    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">';
    
    // Left: Shop Name & Status Badges (showing BOTH if both exist)
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-family:var(--font-sans);font-size:20px;font-weight:700;letter-spacing:-0.01em;color:var(--status-card-title-ink);line-height:1.2;">' + esc(sh.name) + '</div>';
    
    html += '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">';
    if (breakdown.out === 0 && breakdown.low === 0) {
      var allClearStyle = 'background:var(--badge-clear-bg);border:1px solid var(--badge-clear-border);color:var(--badge-clear-ink);';
      html += '<span style="display:inline-block;padding:4px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;' + allClearStyle + '">ALL CLEAR</span>';
    } else {
      if (breakdown.out > 0) {
        var outLabel = breakdown.out + (breakdown.out === 1 ? " ITEM OUT" : " ITEMS OUT");
        var outStyle = 'background:var(--badge-out-bg);border:1px solid var(--badge-out-border);color:var(--badge-out-ink);';
        html += '<span style="display:inline-block;padding:4px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;' + outStyle + '">' + outLabel + '</span>';
      }
      if (breakdown.low > 0) {
        var lowLabel = breakdown.low + (breakdown.low === 1 ? " ITEM LOW" : " ITEMS LOW");
        var lowStyle = 'background:var(--badge-low-bg);border:1px solid var(--badge-low-border);color:var(--badge-low-ink);';
        html += '<span style="display:inline-block;padding:4px 8px;border-radius:4px;font-family:var(--font-mono);font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;' + lowStyle + '">' + lowLabel + '</span>';
      }
    }
    html += '</div>';
    html += '</div>';

    // Right: OPEN -> button with outline and active inverted fill
    html += '<button class="btn-reset shop-open-btn" data-action="go-to-shop" data-shop-id="' + sh.id + '">';
    html += '<span>OPEN</span>' + ICON_ARROW_RIGHT;
    html += '</button>';

    html += '</div>';

    // Multi-segment glass progress bar with toned-down balanced container border
    var barTrackStyle = 'background:var(--progress-track-bg);border:var(--progress-track-border);box-shadow:var(--progress-track-shadow);';
    html += '<div style="margin-top:20px;padding:2px;border-radius:999px;' + barTrackStyle + '">';
    html += '<div style="height:6px;border-radius:999px;display:flex;overflow:hidden;gap:2px;position:relative;">';
    if (okPct > 0) {
      var okBarStyle = 'background:var(--progress-ok-bg);box-shadow:var(--progress-ok-shadow);';
      var okWidthStyle = (lowPct === 0 && outPct === 0) ? 'width:100%;' : 'flex:1 1 auto;width:' + okPct + '%;min-width:12px;';
      html += '<div style="' + okWidthStyle + okBarStyle + 'border-radius:999px;"></div>';
    }
    if (lowPct > 0) {
      var lowBarStyle = 'background:var(--progress-low-bg);box-shadow:var(--progress-low-shadow);';
      html += '<div style="width:' + lowPct + '%;min-width:6px;' + lowBarStyle + 'border-radius:999px;"></div>';
    }
    if (outPct > 0) {
      var outBarStyle = 'background:var(--progress-out-bg);box-shadow:var(--progress-out-shadow);';
      html += '<div style="width:' + outPct + '%;min-width:6px;' + outBarStyle + 'border-radius:999px;"></div>';
    }
    html += '</div></div>';

    // Stats row: % OK, % LOW, % OUT with subtle color-accented indicators
    var okColor = okPct > 0 ? "var(--primary)" : "var(--ink-faint)";
    var lowColor = lowPct > 0 ? "var(--stat-low-ink)" : "var(--ink-faint)";
    var outColor = outPct > 0 ? "var(--stat-out-ink)" : "var(--ink-faint)";

    var okDotShadow = okPct > 0 ? "var(--stat-ok-dot-shadow)" : "transparent";
    var lowDotShadow = lowPct > 0 ? "var(--stat-low-dot-shadow)" : "transparent";
    var outDotShadow = outPct > 0 ? "var(--stat-out-dot-shadow)" : "transparent";

    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.04em;">';
    html += '<div style="display:flex;align-items:center;gap:5px;color:' + okColor + ';"><span style="width:6px;height:6px;border-radius:50%;background:' + okColor + ';display:inline-block;box-shadow:' + okDotShadow + ';"></span>' + okPct + '% OK</div>';
    html += '<div style="display:flex;align-items:center;gap:5px;color:' + lowColor + ';"><span style="width:6px;height:6px;border-radius:50%;background:' + lowColor + ';display:inline-block;box-shadow:' + lowDotShadow + ';"></span>' + lowPct + '% LOW</div>';
    html += '<div style="display:flex;align-items:center;gap:5px;color:' + outColor + ';"><span style="width:6px;height:6px;border-radius:50%;background:' + outColor + ';display:inline-block;box-shadow:' + outDotShadow + ';"></span>' + outPct + '% OUT</div>';
    html += '</div>';

    html += '</div>';
  });

  // Recent Activity Section
  var recent = (state.history || []).slice(0, 4);
  html += '<div style="margin-top:28px;">';
  html += sectionLabelHtml("RECENT ACTIVITY");
  
  if (recent.length === 0) {
    html += '<div style="font-size:12px;color:var(--ink-muted);padding:14px 0;">No saved logs yet. Use "SAVE TO HISTORY" in Check or Count to record activity.</div>';
  } else {
    html += '<div style="background:var(--rec-card-bg);border:var(--rec-card-border);border-radius:12px;overflow:hidden;box-shadow:var(--rec-card-shadow);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);">';
    recent.forEach(function (entry, idx) {
      var isQuick = entry.page === "quick";
      var iconHtml = isQuick ? ICON_DISCREPANCY : ICON_CABINET_BOX;
      var iconBoxStyle = isQuick
        ? "background:var(--recent-quick-bg);border:var(--recent-quick-border);color:var(--recent-quick-color);"
        : "background:var(--recent-count-bg);border:var(--recent-count-border);color:var(--recent-count-color);";
      var subtext = isQuick ? "Discrepancy Logged" : "Stock Count Completed";
      var borderB = idx < recent.length - 1 ? "border-bottom:1px solid var(--border-subtle);" : "";
      var timeFormatted = formatActivityTime(entry);
      
      html += '<div style="display:flex;align-items:center;gap:14px;padding:12px 16px;' + borderB + '">';
      html += '<div style="width:38px;height:38px;border-radius:8px;' + iconBoxStyle + 'display:flex;align-items:center;justify-content:center;flex:0 0 auto;">' + iconHtml + '</div>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink);line-height:1.3;">' + esc(entry.shopName) + '</div>';
      html += '<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);margin-top:2px;">' + subtext + '</div>';
      html += '</div>';
      html += '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-muted);flex:0 0 auto;white-space:nowrap;letter-spacing:0.02em;">' + esc(timeFormatted) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Theme Switcher at bottom of Home View
  // Structural theme decision: selects the sun vs moon icon, tooltip title, and button label
  var isLight = isLightTheme();
  var toggleTitle = isLight ? "Switch to dark mode" : "Switch to light mode";
  var toggleIcon = isLight ? ICON_SUN : ICON_MOON;
  var toggleLabel = isLight ? "LIGHT MODE" : "DARK MODE";

  html += '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;margin-top:28px;margin-bottom:8px;gap:12px;">';
  html += '<button class="btn-reset tap-btn theme-footer-btn" data-action="toggle-theme" title="' + toggleTitle + '" aria-label="' + toggleTitle + '" style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:var(--theme-footer-bg);border:var(--theme-footer-border);color:var(--ink-muted);font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.06em;cursor:pointer;transition:transform 0.14s ease, color 0.14s ease, border-color 0.14s ease, background-color 0.14s ease;">';
  html += toggleIcon + '<span>THEME: ' + toggleLabel + '</span>';
  html += '</button>';
  html += '<button class="btn-reset tap-btn" data-action="auth-logout" title="Sign out of Stock Command" style="display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:10px;font-weight:600;letter-spacing:0.08em;color:var(--ink-faint);background:none;border:none;cursor:pointer;padding:6px 14px;border-radius:4px;transition:color 0.15s ease;">' + ICON_LOGOUT + '<span>LOG OUT</span></button>';
  html += '</div>';

  html += '</div>';
  return html;
}
