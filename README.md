# Stock Command

A fast, keyboard-friendly inventory command center designed for retail apparel operations and real-time stock control. Built with a responsive industrial dark-mode aesthetic, Stock Command enables operators to perform rapid inventory checks, physical matrix counts, discrepancy logging, operational note-taking, and historical audit tracking across multiple shop locations.

---

## Live App

Stock Command is deployed and live at:
**[https://stock-command.jonero.workers.dev/](https://stock-command.jonero.workers.dev/)**

---

## Mobile App

A signed Android APK is available for download directly from the repository's [Releases](../../releases) page.

New production releases and signed APK binaries are built and published automatically via GitHub Actions whenever a version tag is pushed to the repository.

---

## Features

- **Check Mode**: Fast visual stock-level status checks (`OK`, `LOW`, `CRITICAL`) organized by style, color, and size.
- **Count Mode**: Matrix-style physical inventory counting grid with one-tap increments, count exclusions, instant search, and exportable summaries.
- **Operational Notes**: Multi-column board for operational checklists, quick logs, color-coded tags, and drag-and-drop card sorting.
- **Audit History**: Snapshot recording with timestamped audit logs, date grouping, style tracking, and diff review.
- **Multi-Location Management**: Seamlessly manage and switch between multiple shop or store locations.
- **Offline-First & Cloud Sync**: Instant local persistence with background cloud synchronization via Supabase, complete with sync indicators and pull-to-refresh.
- **Operator Access Gate**: Secure authentication gate powered by Supabase Auth with long-lived session persistence.

---

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules) with modular functional rendering
- **Styling**: Native CSS custom properties with responsive industrial dark and light themes
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/) (Android native wrapper)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **Hosting & CI/CD**: [Cloudflare Pages / Workers](https://workers.cloudflare.com/) (Static Assets) & [GitHub Actions](https://github.com/features/actions)
- **Fonts**: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) and [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stock-command.git
   cd stock-command
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Web Build

Create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### Android Native Build

To sync web assets into the Capacitor Android container and build:

```bash
# Build web assets and sync to native Android project
npm run build
npx cap sync android

# Build release APK locally via Gradle (or open in Android Studio)
cd android
./gradlew assembleRelease
```

---

## Deployment (Cloudflare Pages / Workers)

Stock Command is configured as a fully static SPA that runs directly on Cloudflare Pages / Workers Static Assets via `wrangler.jsonc`:

- Built output is served from `./dist`
- Single-page application fallback routing is enabled (`"not_found_handling": "single-page-application"`)
- The client-side application communicates directly with Supabase, requiring no server-side Worker runtime code

### Deploy via Wrangler

```bash
npx wrangler deploy
```

> **Note on Package Management**: This project uses `npm` exclusively. Ensure `package-lock.json` remains tracked in version control for consistent and deterministic CI/CD builds with `npm ci`.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── build-android.yml # Automated Android APK build & signing workflow
├── android/                # Native Android Capacitor wrapper project
├── app/
│   ├── actions.js          # State mutation operations
│   ├── auth.js             # Supabase Auth gate and login view
│   ├── constants.js        # Global configuration, presets, and SVG icons
│   ├── events.js           # Central event delegation
│   ├── helpers.js          # Formatting, clipboard, and computation utilities
│   ├── main.js             # Application entry point
│   ├── state.js            # Reactive state, cloud sync, and persistence
│   ├── theme.js            # Theme switching and storage
│   ├── toast.js            # Toast and undo notifications
│   └── render/             # Modular HTML view rendering
│       ├── check.js        # Quick check view
│       ├── count.js        # Matrix counting view
│       ├── history.js      # Audit log and snapshot view
│       ├── home.js         # Operations dashboard
│       ├── modals.js       # Dialogs and color pickers
│       ├── navigation.js   # Top bar, bottom navigation, and popovers
│       └── notes.js        # Operational notes board
├── public/                 # Favicons, app icons, and web manifest
├── capacitor.config.ts     # Capacitor cross-platform configuration
├── index.html              # Single-page application shell and styles
├── package.json            # Project configuration and dependencies
├── package-lock.json       # Deterministic npm dependency lockfile
├── tsconfig.json           # TypeScript configuration for type checking
├── vite.config.ts          # Vite bundler configuration
└── wrangler.jsonc          # Cloudflare Workers static assets configuration
```

---

## License

Private / Internal Utility.

