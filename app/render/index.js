import { state, ui } from "../state.js";
import { activeStyle } from "../actions.js";
import { renderHeaderHtml, renderBottomNavHtml, updateBottomNavState, renderSyncPillHtml } from "./navigation.js";
import { getModalHtml } from "./modals.js";
import { renderHomeViewHtml } from "./home.js";
import { renderCheckPageHtml } from "./check.js";
import { renderCountPageHtml } from "./count.js";
import { renderNotesPageHtml } from "./notes.js";
import { renderHistoryPageHtml } from "./history.js";

export var lastRenderedPageKey = "";

export function getMainPageHtml() {
    var activePage = (state && state.activePage) || "quick";
    if (ui.showHome) {
      return renderHomeViewHtml();
    } else if (activePage === "quick") {
      return renderCheckPageHtml();
    } else if (activePage === "count") {
      return renderCountPageHtml();
    } else if (activePage === "notes") {
      return renderNotesPageHtml();
    } else if (activePage === "history") {
      return renderHistoryPageHtml();
    }
    return "";
  }


export var isRendering = false;
export var renderQueued = false;

export function render() {
    if (isRendering) {
      renderQueued = true;
      return;
    }
    isRendering = true;

    try {
      var app = document.getElementById("app-root");
      if (!app || !state) {
        isRendering = false;
        return;
      }
      var activePage = (state && state.activePage) || "quick";
      var curPageKey = ui.showHome ? "home" : activePage;
      var isNewPage = (curPageKey !== lastRenderedPageKey);
      lastRenderedPageKey = curPageKey;

      var mainContainer = app.querySelector("#main-content-container");
      var navContainer = app.querySelector("#bottom-nav-container");
      var modalContainer = app.querySelector("#modal-container");
      var headerContainer = app.querySelector("#header-container");

      if (!mainContainer || !navContainer || !modalContainer || !headerContainer) {
        var html = '<div id="header-container">' + renderHeaderHtml() + '</div>';
        var pageHtml = getMainPageHtml();

        html += '<div id="main-content-container" class="' + (isNewPage ? 'page-enter-anim' : '') + '">' + pageHtml + '</div>';
        html += '<div id="modal-container">' + getModalHtml() + '</div>';
        html += '<div id="bottom-nav-container">' + renderBottomNavHtml() + '</div>';
        app.innerHTML = html;
        var freshNav = app.querySelector("#bottom-nav-container");
        if (freshNav) {
          updateBottomNavState(freshNav);
          requestAnimationFrame(function () {
            updateBottomNavState(freshNav);
          });
        }
      } else {
        if (headerContainer) {
          headerContainer.innerHTML = renderHeaderHtml();
        }

        // Capture scroll positions and search focus before DOM replacement (to avoid scroll jumping on mobile)
        var scrollStates = {};
        var searchInputWasFocused = (document.activeElement && document.activeElement.id === "count-search-input");
        var searchCursorPos = searchInputWasFocused ? document.activeElement.selectionStart : null;
        var notesSearchWasFocused = (document.activeElement && document.activeElement.id === "notes-search-input");
        var notesSearchCursorPos = notesSearchWasFocused ? document.activeElement.selectionStart : null;

        // Proactively blur any non-preserved active element inside containers BEFORE innerHTML replacement
        // to prevent the browser from firing synchronous blur/focusout events while tearing down child nodes
        if (!searchInputWasFocused && !notesSearchWasFocused && document.activeElement && document.activeElement !== document.body) {
          try { document.activeElement.blur(); } catch (err) {}
        }

        if (!isNewPage && mainContainer) {
          mainContainer.querySelectorAll('.style-tabs-scroll, .matrix-table-scroll, [data-preserve-scroll]').forEach(function (el, idx) {
            var key = el.getAttribute('data-preserve-scroll') || (el.className ? el.className.split(' ')[0] : '') || ('scroll_' + idx);
            scrollStates[key] = { left: el.scrollLeft, top: el.scrollTop };
          });
        }

        if (isNewPage) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          mainContainer.className = "";
          void mainContainer.offsetWidth; // trigger reflow for smooth animation restart
          mainContainer.className = "page-enter-anim";
        }

        var pageHtml = getMainPageHtml();
        mainContainer.innerHTML = pageHtml;

        // Restore scroll positions seamlessly
        if (!isNewPage && mainContainer) {
          mainContainer.querySelectorAll('.style-tabs-scroll, .matrix-table-scroll, [data-preserve-scroll]').forEach(function (el, idx) {
            var key = el.getAttribute('data-preserve-scroll') || (el.className ? el.className.split(' ')[0] : '') || ('scroll_' + idx);
            if (scrollStates[key]) {
              el.scrollLeft = scrollStates[key].left;
              el.scrollTop = scrollStates[key].top;
            }
          });
        }

        if (searchInputWasFocused) {
          var newSearchInput = app.querySelector("#count-search-input");
          if (newSearchInput) {
            newSearchInput.focus();
            if (searchCursorPos !== null) {
              try {
                newSearchInput.setSelectionRange(searchCursorPos, searchCursorPos);
              } catch (err) {}
            }
          }
        } else if (notesSearchWasFocused) {
          var newNotesSearchInput = app.querySelector("#notes-search-input");
          if (newNotesSearchInput) {
            newNotesSearchInput.focus();
            if (notesSearchCursorPos !== null) {
              try {
                newNotesSearchInput.setSelectionRange(notesSearchCursorPos, notesSearchCursorPos);
              } catch (err) {}
            }
          }
        }

        modalContainer.innerHTML = getModalHtml();
        updateBottomNavState(navContainer);
      }

      if (!searchInputWasFocused && !notesSearchWasFocused) {
        var needsAutofocus = Boolean(
          ui.needsAutofocus ||
          ui.addingStyle ||
          ui.addingColor ||
          ui.addingSize ||
          ui.addingShop ||
          ui.renamingStyle ||
          ui.editingColor !== null ||
          ui.editingSize !== null ||
          ui.editingCount !== null ||
          ui.editingShopId !== null ||
          ui.editingStyleId !== null ||
          ui.editingHistoryDateId !== null
        );
        if (needsAutofocus) {
          var af = app.querySelector(".js-autofocus");
          if (af) { af.focus(); if (af.select) af.select(); }
          ui.needsAutofocus = false;
        }
      }
    } finally {
      isRendering = false;
      if (renderQueued) {
        renderQueued = false;
        render();
      }
    }
  }
