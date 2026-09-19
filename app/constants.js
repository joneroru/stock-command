// ---------- Constants & Iconography ----------
export var SUPABASE_URL = "https://fomhcyimdgpwcweertqg.supabase.co";
export var SUPABASE_KEY = "sb_publishable_HtKJXp7qYjFKtuuBV3O0rQ_kMOPlgmx";

export var LOCAL_CACHE_KEY = "stockcheck-cache-v1";

export var STATE_OK = 0;
export var STATE_LOW = 1;
export var STATE_CRIT = 2;
  
export var QUICK_STATE_STYLE = {
    0: { bg: "transparent", border: "1.5px dashed #2B2F36", label: "", ink: "transparent", glow: "none" },
    1: { bg: "rgba(226, 76, 0, 0.16)", border: "1.5px solid #d97706", label: "LOW", ink: "#fbbf24", glow: "0 0 8px rgba(217, 119, 6, 0.25)" },
    2: { bg: "rgba(187, 28, 28, 0.22)", border: "1.5px solid #ef4444", label: "OUT", ink: "#f87171", glow: "0 0 8px rgba(239, 68, 68, 0.25)" }
  };

export var ICON_ROBOTIC_ARM = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:block;flex-shrink:0;vertical-align:middle;" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="4" y="17.5" width="13" height="2.5" rx="0.5" fill="var(--primary)"/>' +
    '<path d="M7 17.5L6 7.5M12 17.5L9 7.5" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="8" cy="7.5" r="3.2" fill="var(--primary)"/>' +
    '<circle cx="8" cy="7.5" r="1.3" fill="var(--bg)"/>' +
    '<path d="M10.5 7.5H14.5" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<rect x="13.5" y="5" width="2" height="5" rx="0.5" fill="var(--primary)"/>' +
    '<path d="M15.5 6L18.2 3.5L22 5.6" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M15.5 9L18.2 11.5L22 9.4" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

export var ICON_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
export var ICON_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  
  // (10) Sync status cloud SVGs
export var ICON_CLOUD_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="8.5 12.5 11 15 15.5 9.5"/></svg>';
export var ICON_CLOUD_X = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="9" y1="10" x2="15" y2="16"/><line x1="15" y1="10" x2="9" y2="16"/></svg>';

  // Bottom Navigation Bar Icons (Matching Image 1: Bento Grid, Card Check, Clipboard Check, Counter-Clockwise History)
export var ICON_NAV_HOME = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.5"/><rect x="3" y="15" width="7.5" height="6" rx="1.5"/><rect x="13.5" y="11" width="7.5" height="10" rx="1.5"/></svg>';
export var ICON_NAV_CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="7" y1="9.5" x2="11" y2="9.5"/><line x1="7" y1="14" x2="11" y2="14"/><path d="M13.5 11.5L15.5 13.5L19 9.5" stroke-width="2.2"/></svg>';
export var ICON_NAV_COUNT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1.5"/><path d="M9 13.5L12 16.5L17 11.5" stroke-width="2.2"/></svg>';
export var ICON_NAV_NOTES = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
export var ICON_NAV_HISTORY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>';
export var ICON_PIN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
export var ICON_ADJUSTMENTS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
export var ICON_CHECK_SMALL = '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 6 4.5 9 10 3"/></svg>';

  // Functional Action SVGs
export var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5L6.5 12L13 4"/></svg>';
export var ICON_KEBAB = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
export var ICON_STYLE_TOOL = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4l2 2-7 7-3 1 1-3 7-7z"/><path d="M4 20l4-4"/></svg>';
export var ICON_STORE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
export var ICON_WARN_TRIANGLE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
export var ICON_ARROW_RIGHT = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
export var ICON_ARROW_LEFT = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 12l-4-4 4-4"/></svg>';
export var ICON_COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
export var ICON_SAVE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
export var ICON_DOWNLOAD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
export var ICON_UPLOAD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
export var ICON_CHEVRON_DOWN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
export var ICON_CHEVRON_UP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
export var ICON_BROOM = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12l-8-8-5 5 8 8"/><path d="M14 16l6 6"/><path d="M3 21l3-3"/><path d="M9 15l2 2"/></svg>';
export var ICON_LOGOUT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
export var ICON_LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  
  // (15) Filing cabinet / inventory box icon for COUNTED STOCK
export var ICON_CABINET_BOX = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="4" y="10" width="16" height="10" rx="1"/><line x1="10" y1="15" x2="14" y2="15"/></svg>';

  // (6) Icon for DISCREPANCY LOGGED
export var ICON_DISCREPANCY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
    '<path d="M3 3v5h5"/>' +
    '<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>' +
    '<path d="M21 21v-5h-5"/>' +
    '<line x1="12" y1="8" x2="12" y2="12" stroke-width="2.2"/>' +
    '<circle cx="12" cy="15.5" r="0.75" fill="currentColor"/>' +
    '</svg>';

  // Minimal white/light SVGs for Menus (Image 3)
export var ICON_PENCIL_WHITE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e2e2e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
export var ICON_TRASH_WHITE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
export var ICON_TRIANGLE_UP = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l-8 10h16z"/></svg>';
export var ICON_TRIANGLE_DOWN = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19l-8-10h16z"/></svg>';
export var ICON_TRIANGLE_LEFT = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12l10-8v16z"/></svg>';
export var ICON_TRIANGLE_RIGHT = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 12l-10-8v16z"/></svg>';
export var ICON_PLUS_LIGHT = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
export var ICON_PALETTE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
export var ICON_SEARCH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
export var ICON_X = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
export var ICON_PLUS = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
export var ICON_NOTE_DOC = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
export var ICON_CHECKLIST_SQUARE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>';
export var ICON_COLUMNS_2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1.5"></rect><rect x="14" y="3" width="7" height="18" rx="1.5"></rect></svg>';
export var ICON_COLUMNS_1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"></rect></svg>';
export var ICON_SORT_NEW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>';
export var ICON_SORT_OLD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
export var ICON_SORT_COLOR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9V3z" fill="currentColor"></path></svg>';

export var NOTE_PALETTE_DARK = {
    none:      { bg: "#20242B", text: "#CBD5E1", dot: "#6B7280", checkColor: "#14161A" },
    crimson:   { bg: "#5C1420", text: "#FFB8C2", dot: "#E0435E", checkColor: "#14161A" },
    tangerine: { bg: "#5C3210", text: "#FFD1A3", dot: "#E08A2E", checkColor: "#14161A" },
    amber:     { bg: "#5C4210", text: "#FFDE9E", dot: "#E0A82E", checkColor: "#14161A" },
    emerald:   { bg: "#0F4A32", text: "#A8F5CE", dot: "#2ED98F", checkColor: "#14161A" },
    teal:      { bg: "#0F4A4A", text: "#AEF2EA", dot: "#2FC2B4", checkColor: "#14161A" },
    sapphire:  { bg: "#14335C", text: "#BFDBFF", dot: "#4C8FE0", checkColor: "#14161A" },
    indigo:    { bg: "#241F5C", text: "#C9C4FF", dot: "#6B5EE0", checkColor: "#14161A" },
    violet:    { bg: "#3A1F5C", text: "#E4CBFF", dot: "#A56FE0", checkColor: "#14161A" },
    rose:      { bg: "#5C1F45", text: "#FFC7E6", dot: "#E0559E", checkColor: "#14161A" }
  };

export var NOTE_PALETTE_LIGHT = {
    none:      { bg: "#FFFFFF", text: "#0F172A", dot: "#64748B", border: "#CBD5E1", checkColor: "#FFFFFF" },
    crimson:   { bg: "#FFD4D8", text: "#7F1D1D", dot: "#DC2626", border: "#F87171", checkColor: "#FFFFFF" },
    tangerine: { bg: "#FED7AA", text: "#7C2D12", dot: "#EA580C", border: "#FB923C", checkColor: "#FFFFFF" },
    amber:     { bg: "#FEF08A", text: "#713F12", dot: "#D97706", border: "#FACC15", checkColor: "#FFFFFF" },
    emerald:   { bg: "#BBF7D0", text: "#064E3B", dot: "#16A34A", border: "#4ADE80", checkColor: "#FFFFFF" },
    teal:      { bg: "#99F6E4", text: "#134E4A", dot: "#0D9488", border: "#2DD4BF", checkColor: "#FFFFFF" },
    sapphire:  { bg: "#BAE6FD", text: "#0C4A6E", dot: "#0284C7", border: "#38BDF8", checkColor: "#FFFFFF" },
    indigo:    { bg: "#C7D2FE", text: "#312E81", dot: "#4F46E5", border: "#818CF8", checkColor: "#FFFFFF" },
    violet:    { bg: "#DDD6FE", text: "#4C1D95", dot: "#7C3AED", border: "#A78BFA", checkColor: "#FFFFFF" },
    rose:      { bg: "#FBCFE8", text: "#701A75", dot: "#DB2777", border: "#F472B6", checkColor: "#FFFFFF" }
  };

export var NOTE_PALETTE = NOTE_PALETTE_DARK;
export var NOTE_COLOR_KEYS = ["none", "crimson", "tangerine", "amber", "emerald", "teal", "sapphire", "indigo", "violet", "rose"];
