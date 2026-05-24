# Project Todos

## Active

### 🎨 REDESIGN — Match Target Design (from screenshot 2026-05-24)

---

- [ ] **[DESIGN TOKENS] Define new color palette, spacing scale, and typography system** | Due: 05/26/2026
  - Extract exact colors, radii, font sizes from the target screenshot
  - Update `src/styles/app.css` with CSS custom properties (`--color-*`, `--radius-*`, `--space-*`)
  - Keep Plus Jakarta Sans + JetBrains Mono; adjust weight/size usage

- [ ] **[LAYOUT] Convert 3-column layout to match target proportions** | Due: 05/27/2026
  - Left panel: narrower icon-rail + expandable drawer (like VS Code Activity Bar)
  - Right panel: wider, card-based sections instead of flat list
  - Workspace: tighter inset padding, updated grid-bg subtle pattern

- [ ] **[TOP BAR] Add a persistent top/title bar component** | Due: 05/27/2026
  - Create `src/components/TopBar.jsx`
  - Contains: logo + app name (left), project name + breadcrumb (center), action buttons (right: share, export, dark mode)
  - Move save/load/export/share buttons out of LeftPanel header into TopBar
  - Mount it in `App.jsx` above the 3-panel row

- [ ] **[LEFT PANEL] Redesign LeftPanel header and control sections** | Due: 05/28/2026
  - Replace busy icon-button row with a clean icon-rail (vertical icon strip, tooltip on hover)
  - Make brand header more compact — just logo icon + "IoTify" wordmark
  - Move "Live IDE" status badge to TopBar or bottom of left rail
  - Section dividers: use subtle labels (`CONTROLS`, `PRESETS`, `SENSORS`) not just spacing
  - Rounded card containers for each sensor/control group

- [ ] **[RIGHT PANEL] Redesign RightPanel tabs and Parts Library** | Due: 05/28/2026
  - Replace pill/underline tabs with segmented control style tabs matching screenshot
  - Parts search bar: larger, pill-shaped with stronger contrast
  - Component cards: larger drag targets, show icon + label + category badge
  - Firmware IDE tab: add a cleaner code editor toolbar (run, copy, clear buttons as icon group)
  - Serial & Scope tabs: dark terminal-style background for content area

- [ ] **[WORKSPACE] Polish the 3D canvas area** | Due: 05/29/2026
  - Update `Workspace3D.jsx` toolbar (zoom, fit, reset) to match target icon style
  - Floating toolbar: pill-shaped container, frosted glass or solid background
  - Selection handles (`ResizeHandles.jsx`): thinner lines, accent-color corner dots
  - Empty state: centered illustration or message when canvas is empty

- [ ] **[CONTEXT MENU] Restyle ContextMenu to match target** | Due: 05/29/2026
  - Rounded corners (`rounded-xl`), subtle shadow, backdrop blur
  - Menu items: icon + label, hover state with accent background
  - Destructive actions (delete) in red tint

- [ ] **[MODALS & OVERLAYS] Redesign overlay components** | Due: 05/30/2026
  - `ShortcutsOverlay.jsx`: dark modal, two-column key-table layout, close on Escape
  - `TourOverlay.jsx`: floating tooltip style, step indicator dots, arrow pointer
  - `CommunityLibrary.jsx`: full-screen modal with grid card layout, search + filter bar

- [ ] **[TOAST] Restyle Toast notifications** | Due: 05/30/2026
  - `Toast.jsx`: position bottom-right, pill shape, icon + message, slide-up animation
  - Variants: success (green), error (red), info (blue), warning (amber)

- [ ] **[DARK MODE] Complete dark mode implementation** | Due: 05/31/2026
  - All components: ensure every `bg-white`, `text-slate-*`, `border-slate-*` has a dark: counterpart
  - Use `dark:` Tailwind prefix consistently or toggle a `data-theme="dark"` attribute
  - Verify workspace grid-bg is visible in dark mode

- [ ] **[RESPONSIVE] Mobile layout fixes** | Due: 05/31/2026
  - Left panel on mobile: full-width collapsed state with bottom sheet expand
  - Right panel on mobile: bottom drawer instead of side panel
  - TopBar on mobile: hamburger menu for action buttons

- [ ] **[ANIMATION] Add micro-interactions matching screenshot polish** | Due: 06/01/2026
  - Panel open/close: smooth width transition (already exists — tune easing)
  - Button hover: scale(1.02) + shadow lift
  - Tab switch: sliding underline indicator
  - Component drag start: ghost preview with opacity 0.6

- [ ] **[ICONS] Audit and unify icon usage** | Due: 06/01/2026
  - Ensure all icons are from Font Awesome Solid set (no mixing Regular/Light)
  - Replace any text-only buttons with icon + text or icon-only with tooltip
  - Check icon sizes are consistent: `text-sm` for toolbar, `text-base` for panel headers

- [ ] **[TYPOGRAPHY] Apply refined type scale** | Due: 06/02/2026
  - Panel headers: `text-sm font-bold` (14px 700)
  - Section labels: `text-[10px] font-semibold uppercase tracking-widest text-slate-400`
  - Body/controls: `text-xs font-medium` (12px 500)
  - Code/terminal: JetBrains Mono `text-xs`

- [ ] **[QA] Cross-browser visual review** | Due: 06/03/2026
  - Test in Chrome, Safari, Firefox
  - Check all panel resize interactions still work after style changes
  - Verify no layout shifts on initial load

## Completed
