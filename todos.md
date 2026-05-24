# Project Todos

## Active

### 🎨 REDESIGN — Match Target Design (from screenshot 2026-05-24)

---

- [x] **[DESIGN TOKENS] Define new color palette, spacing scale, and typography system** | ✅ 2026-05-24
  - Blue #2563EB primary (CSS --blue-primary), --blue-light, --blue-hover tokens in app.css
  - Subtle grid-bg, lighter scrollbars, refined typography scale

- [x] **[LAYOUT] Convert 3-column layout to match target proportions** | ✅ 2026-05-24
  - App.jsx: flex-col (TopBar + content row + StatusBar)
  - Left nav: 200px default (was 480px), LEFT_MIN=160 LEFT_MAX=320
  - Right panel: 320px default, RIGHT_MIN=240 RIGHT_MAX=520
  - Workspace: top toolbar + canvas + bottom panels (Analysis & Steps | AI Tutor)

- [x] **[TOP BAR] Add a persistent top/title bar component** | ✅ 2026-05-24
  - Created `src/components/TopBar.jsx` — Pilot PRO logo, project name + Saved status, collaborator avatars, Run Simulation, Save, Share, dark-mode, bell, user profile
  - Created `src/components/StatusBar.jsx` — Simulator status, board selector, Auto Save
  - Moved btn-simulation and save/share/dark-toggle into TopBar

- [x] **[LEFT PANEL] Redesign LeftPanel as pure navigation sidebar** | ✅ 2026-05-24
  - MAIN: Dashboard, Projects, Virtual Lab (active)
  - LEARNING: AI Tutor, Learn
  - COMMUNITY: Community, Achievements
  - Bottom: Settings, Support
  - All AI/step controls moved to workspace bottom panels

- [x] **[RIGHT PANEL] Redesign RightPanel tabs and Parts Library** | ✅ 2026-05-24
  - Tabs: Components / Code / Serial Monitor / Scope (with icons, blue active state)
  - Accordion sections: Boards, Inputs, Outputs, Sensors, Power (collapsible, Boards open by default)
  - Search bar with filter icon, dark terminal style for Serial/Scope
  - Serial panel: dark bg with send input, Scope: time selector dropdown

- [x] **[WORKSPACE] Add canvas toolbar + split bottom panels** | ✅ 2026-05-24
  - Top toolbar: Select, Pan, Zoom −/100%/+, Fit, Undo/Redo, Mute, Wire, Color, Schematic, panel toggles
  - Bottom LEFT: Analysis & Steps (step-box, hardware controls, tip, prev/next nav)
  - Bottom RIGHT: AI Tutor (greeting, presets, suggestions, ai-input)

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
