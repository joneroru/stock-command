import { sb, loadFromCloud, migrateState, setState, save, setCurrentSession, defaultData, loadLocalCache } from "./state.js";
import { render } from "./render/index.js";
import { ICON_ROBOTIC_ARM, ICON_WARN_TRIANGLE, ICON_LOCK } from "./constants.js";
import { esc } from "./helpers.js";

export var isAuthenticating = false;

/**
 * Renders the custom dark industrial login screen into #app-root.
 * @param {string} [errorMessage] - Optional inline error message to display.
 * @param {string} [emailValue] - Email value to prefill (preserves user typing).
 */
export function renderLoginScreen(errorMessage, emailValue) {
  var root = document.getElementById("app-root");
  if (!root) return;

  var errorHtml = "";
  if (errorMessage) {
    errorHtml =
      '<div id="login-error" role="alert" style="background:var(--red-bg);border:1px solid var(--red-border);color:var(--red-ink);border-radius:6px;padding:10px 12px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;font-family:var(--font-mono);font-size:11px;font-weight:600;line-height:1.4;">' +
      '<span style="flex-shrink:0;margin-top:1px;">' + ICON_WARN_TRIANGLE + '</span>' +
      '<span>' + esc(errorMessage) + '</span>' +
      '</div>';
  }

  var html =
    '<div class="auth-viewport" style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg);box-sizing:border-box;">' +
    '<div class="auth-card tap-card" style="width:100%;max-width:390px;background:var(--panel-card);border:1px solid var(--border-subtle);border-radius:12px;padding:28px 24px;box-shadow:0 8px 32px rgba(0,0,0,0.45);box-sizing:border-box;">' +

    // Header Branding: Logo + Title + Subtitle
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">' +
    ICON_ROBOTIC_ARM +
    '<div>' +
    '<div style="font-family:var(--font-sans);font-size:18px;font-weight:800;letter-spacing:-0.01em;color:var(--ink);text-transform:uppercase;line-height:1.2;">STOCK COMMAND</div>' +
    '<div style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);margin-top:2px;text-transform:uppercase;">COMMAND ACCESS • OPERATOR LOGIN</div>' +
    '</div>' +
    '</div>' +

    // Divider
    '<div style="height:1px;background:var(--border-subtle);margin:18px 0 20px;"></div>' +

    // Error alert (if any)
    errorHtml +

    // Login Form
    '<form id="auth-login-form" novalidate style="display:flex;flex-direction:column;gap:16px;">' +

    // Email Field
    '<div>' +
    '<label for="login-email" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);text-transform:uppercase;display:block;margin-bottom:6px;">Email Address</label>' +
    '<input id="login-email" name="email" type="email" required autocomplete="username email" placeholder="operator@domain.com" value="' + esc(emailValue || "") + '" class="auth-input" />' +
    '</div>' +

    // Password Field
    '<div>' +
    '<label for="login-password" style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.08em;color:var(--ink-muted);text-transform:uppercase;display:block;margin-bottom:6px;">Password</label>' +
    '<input id="login-password" name="password" type="password" required autocomplete="current-password" placeholder="••••••••••••" class="auth-input" />' +
    '</div>' +

    // Submit Button
    '<button type="submit" id="login-submit-btn" class="btn-reset tap-btn auth-btn" style="width:100%;background:var(--primary);color:var(--on-primary);font-family:var(--font-mono);font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:12px 16px;border-radius:6px;border:none;cursor:pointer;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:transform 0.1s ease, filter 0.15s ease;">' +
    'SIGN IN' +
    '</button>' +

    // Footer Security Notice
    '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;font-family:var(--font-mono);font-size:9px;font-weight:600;letter-spacing:0.08em;color:var(--ink-faint);text-transform:uppercase;">' +
    ICON_LOCK +
    '<span>SECURE SESSION • SUPABASE AUTH</span>' +
    '</div>' +

    '</form>' +

    '</div>' +
    '</div>';

  root.innerHTML = html;

  // Direct form submission binder
  var form = document.getElementById("auth-login-form");
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      var emailEl = document.getElementById("login-email");
      var passEl = document.getElementById("login-password");
      var email = emailEl ? emailEl.value : "";
      var password = passEl ? passEl.value : "";
      submitLogin(email, password);
    };
  }

  // Autofocus appropriately
  setTimeout(function () {
    var emailEl = document.getElementById("login-email");
    var passEl = document.getElementById("login-password");
    if (emailValue && passEl) {
      passEl.focus();
    } else if (emailEl) {
      emailEl.focus();
    }
  }, 50);
}

/**
 * Handles submission of login credentials via Supabase Auth signInWithPassword.
 * @param {string} email
 * @param {string} password
 */
export function submitLogin(email, password) {
  if (isAuthenticating) return;

  var trimmedEmail = (email || "").trim();
  var trimmedPassword = (password || "").trim();

  if (!trimmedEmail || !trimmedPassword) {
    renderLoginScreen("Please enter both email and password.", trimmedEmail);
    return;
  }

  if (!sb) {
    renderLoginScreen("Authentication service unavailable. Please refresh.", trimmedEmail);
    return;
  }

  isAuthenticating = true;

  var submitBtn = document.getElementById("login-submit-btn");
  var emailInput = document.getElementById("login-email");
  var passInput = document.getElementById("login-password");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="ptr-spinner" style="display:inline-block;width:12px;height:12px;stroke:var(--on-primary);animation:ptrSpin 0.75s linear infinite;flex-shrink:0;"></span>' +
      '<span>AUTHENTICATING...</span>';
    submitBtn.style.opacity = "0.85";
    submitBtn.style.cursor = "wait";
  }
  if (emailInput) emailInput.disabled = true;
  if (passInput) passInput.disabled = true;

  var existingErr = document.getElementById("login-error");
  if (existingErr) existingErr.remove();

  sb.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword
  }).then(function (res) {
    isAuthenticating = false;

    if (res.error) {
      var msg = "Incorrect email or password";
      if (res.error.message) {
        var lower = res.error.message.toLowerCase();
        if (lower.indexOf("invalid login credentials") !== -1 || lower.indexOf("invalid credential") !== -1 || lower.indexOf("wrong password") !== -1) {
          msg = "Incorrect email or password";
        } else {
          msg = res.error.message;
        }
      }
      renderLoginScreen(msg, trimmedEmail);
      var pwd = document.getElementById("login-password");
      if (pwd) {
        pwd.focus();
        pwd.select();
      }
      return;
    }

    var session = res.data && res.data.session;
    if (!session) {
      renderLoginScreen("Unable to establish session. Please try again.", trimmedEmail);
      return;
    }

    // Success! Update session, show loading transition, and proceed into app
    setCurrentSession(session);

    var root = document.getElementById("app-root");
    if (root) {
      root.innerHTML =
        '<div style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--bg);">' +
        '<div style="font-family:var(--font-mono);color:var(--primary);font-size:12px;font-weight:700;letter-spacing:.08em;">AUTHENTICATED • LOADING DATA...</div></div>';
    }

    startApp();
  }).catch(function (err) {
    isAuthenticating = false;
    var errMsg = (err && err.message) || "Authentication failed. Please check your network.";
    renderLoginScreen(errMsg, trimmedEmail);
  });
}

/**
 * Loads cloud data, migrates, sets state, and renders main command center.
 */
export function startApp() {
  return loadFromCloud().then(function (loaded) {
    var validData = loaded || defaultData();
    var needsSave = migrateState(validData);
    setState(validData);
    render();
    if (needsSave) save();
  }).catch(function (err) {
    console.error("Failed loading data from cloud:", err);
    var fallback = loadLocalCache() || defaultData();
    migrateState(fallback);
    setState(fallback);
    render();
  });
}

/**
 * Handles signing out via Supabase Auth and returns to the login screen.
 */
export function handleLogout() {
  if (!sb) {
    setCurrentSession(null);
    setState(null);
    renderLoginScreen("Signed out.");
    return;
  }

  // Set loading state briefly during sign out
  var root = document.getElementById("app-root");
  if (root) {
    root.innerHTML =
      '<div style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--bg);">' +
      '<div style="font-family:var(--font-mono);color:var(--ink-muted);font-size:12px;letter-spacing:.08em;">SIGNING OUT...</div></div>';
  }

  sb.auth.signOut().then(function () {
    setCurrentSession(null);
    setState(null);
    renderLoginScreen();
  }).catch(function (err) {
    console.warn("Sign out encountered an issue:", err);
    setCurrentSession(null);
    setState(null);
    renderLoginScreen();
  });
}

/**
 * Initial startup authentication gate:
 * 1. Checks existing session via supabase.auth.getSession()
 * 2. If valid session exists, proceeds to startApp() without showing login screen
 * 3. If no session exists, renders login screen
 */
export function initAuthGate() {
  if (!sb) {
    renderLoginScreen("Supabase client is not initialized.");
    return;
  }

  sb.auth.getSession().then(function (res) {
    var session = res && res.data && res.data.session;
    if (session && session.user) {
      // Valid session exists! Proceed directly as normal
      setCurrentSession(session);
      startApp();
    } else {
      // No valid session -> display login screen
      setCurrentSession(null);
      renderLoginScreen();
    }
  }).catch(function (err) {
    console.warn("Session check error:", err);
    setCurrentSession(null);
    renderLoginScreen();
  });
}
