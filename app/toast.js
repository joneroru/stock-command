var toastTimer = null;
var activeToastData = null;

export function showUndoToast(options) {
  var text = (options && options.text) || "Item removed";
  var actionLabel = (options && options.actionLabel) || "Undo";
  var duration = (options && options.duration) || 4500;
  var onUndo = options && options.onUndo;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  activeToastData = {
    onUndo: onUndo
  };

  var toastEl = document.getElementById("app-undo-toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "app-undo-toast";
    toastEl.className = "app-undo-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.style.cssText = [
      "position: fixed",
      "bottom: calc(76px + env(safe-area-inset-bottom, 0px))",
      "left: 50%",
      "transform: translateX(-50%) translateY(10px)",
      "z-index: 1000",
      "display: inline-flex",
      "align-items: center",
      "gap: 14px",
      "background: var(--panel)",
      "border: 1px solid var(--border)",
      "border-radius: 8px",
      "padding: 8px 14px",
      "box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.15)",
      "color: var(--ink)",
      "font-family: var(--font-sans)",
      "font-size: 13px",
      "opacity: 0",
      "pointer-events: auto",
      "white-space: nowrap",
      "max-width: calc(100vw - 32px)",
      "box-sizing: border-box",
      "transition: opacity 180ms ease, transform 180ms cubic-bezier(0.2, 0, 0.2, 1)"
    ].join(";");
    document.body.appendChild(toastEl);
  }

  toastEl.innerHTML = 
    '<span style="font-weight:600;color:var(--ink);letter-spacing:0.01em;">' + text + '</span>' +
    '<button class="btn-reset tap-btn" id="app-undo-toast-btn" data-action="undo-delete-checklist-item" style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:var(--primary);letter-spacing:0.04em;background:var(--primary-pill-bg);border:1px solid var(--primary-pill-border);border-radius:4px;padding:4px 10px;cursor:pointer;line-height:1;margin-left:4px;">' +
    actionLabel.toUpperCase() +
    '</button>';

  var undoBtn = toastEl.querySelector("#app-undo-toast-btn");
  if (undoBtn) {
    undoBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleUndoClick();
    };
  }

  // Animate in
  requestAnimationFrame(function () {
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateX(-50%) translateY(0)";
  });

  // Auto-dismiss timer (~4.5 seconds)
  toastTimer = setTimeout(function () {
    dismissUndoToast();
  }, duration);
}

export function handleUndoClick() {
  if (activeToastData && typeof activeToastData.onUndo === "function") {
    var fn = activeToastData.onUndo;
    activeToastData = null;
    fn();
  }
  dismissUndoToast();
}

export function dismissUndoToast() {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  var toastEl = document.getElementById("app-undo-toast");
  if (toastEl) {
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(function () {
      if (toastEl && toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 200);
  }
  activeToastData = null;
}
