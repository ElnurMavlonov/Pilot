# Share Circuit Link — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Encode the full circuit state (preset, step, custom firmware, placed components) into a URL query parameter so anyone with the link can open the exact same circuit instantly.

**Architecture:** The circuit state object already exists — `saveProject()` constructs it. We'll reuse that shape, base64-encode it into a `?c=` query parameter, and copy the resulting URL to the clipboard. On page load, `window.onload` checks for that param and hydrates the circuit before the default `applyPreset("blink")` runs.

**Tech Stack:** Vanilla JS, `btoa`/`atob` (no extra deps), `navigator.clipboard`, `URLSearchParams`, existing `showToast()`.

---

## Key files

- **Modify only:** `index.html` (everything lives in one file — 2827 lines, all JS is inside a `<script>` block near the bottom, HTML above it)

---

## Task 1: Add `shareCircuitLink()` function

**Files:**
- Modify: `index.html` — JS section, after `loadProject()` (~line 2781)

**What to do:**

Add a new function right after the closing `}` of `loadProject()` and before the `// Entry point` comment (around line 2782):

```js
// ========================================================
// SHARE CIRCUIT LINK
// ========================================================
function shareCircuitLink() {
    const codeEl = document.getElementById('code-content');
    const state = {
        version: '1.0',
        preset: activePreset,
        step: activeStep,
        customCode: codeEl ? codeEl.value : '',
        placedComponents: placedComponents.map(g => ({
            type: g.userData.type,
            variant: g.userData.variant || null,
            x: parseFloat(g.position.x.toFixed(3)),
            z: parseFloat(g.position.z.toFixed(3))
        }))
    };

    let encoded;
    try {
        encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    } catch(e) {
        showToast("Failed to encode circuit.", false);
        return;
    }

    const url = `${location.origin}${location.pathname}?c=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast("Share link copied to clipboard! 🔗", false);
    }).catch(() => {
        // Fallback: prompt the user to copy manually
        window.prompt("Copy this link:", url);
    });
}
```

**Why `btoa(unescape(encodeURIComponent(...)))`:**  
`btoa` only handles Latin-1. If the firmware code contains non-ASCII chars (accents, arrows), plain `btoa(JSON.stringify(...))` throws. The `unescape(encodeURIComponent(...))` trick converts to a safe byte string first.

**Step 1:** Open `index.html`, find the `// Entry point` comment (search: `// Entry point`).

**Step 2:** Insert the entire block above (including the comment banner) immediately before that comment.

**Step 3:** Verify the function is reachable by opening browser console and typing `shareCircuitLink()` — you should see the toast and find `?c=...` in your clipboard.

**Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add shareCircuitLink() — encodes state to base64 URL param"
```

---

## Task 2: Restore circuit from URL on page load

**Files:**
- Modify: `index.html` — `window.onload` block (~line 2784)

**What to do:**

Replace the current `window.onload`:

```js
// BEFORE:
window.onload = () => {
    initPanels();
    initTheme();
    initGraphics();
    applyPreset("blink");
    buildPartsLibraryUI();
};
```

With:

```js
// AFTER:
window.onload = () => {
    initPanels();
    initTheme();
    initGraphics();
    buildPartsLibraryUI();

    // Restore shared circuit from URL param
    const params = new URLSearchParams(location.search);
    const encoded = params.get('c');
    if (encoded) {
        try {
            const state = JSON.parse(decodeURIComponent(escape(atob(encoded))));
            if (state.preset && PRESETS[state.preset]) {
                applyPreset(state.preset);
                if (typeof state.step === 'number') {
                    activeStep = state.step;
                    renderCurrentStep();
                }
                if (state.customCode) {
                    const codeEl = document.getElementById('code-content');
                    if (codeEl) codeEl.value = state.customCode;
                }
                if (Array.isArray(state.placedComponents)) {
                    state.placedComponents.forEach(c => {
                        createComponent(c.type, c.variant, c.x, c.z);
                    });
                }
                showToast("Circuit loaded from shared link! 🎉", false);
            } else {
                applyPreset("blink");
                showToast("Shared link has an unknown preset — loaded default.", false);
            }
        } catch(e) {
            applyPreset("blink");
            // Silently fall back — don't alarm the user for a bad link
        }
    } else {
        applyPreset("blink");
    }
};
```

**Why `decodeURIComponent(escape(atob(...)))`:** Mirror image of the encode side — reverses the `unescape/encodeURIComponent` trick.

**Step 1:** Find `window.onload` in the file (search: `window.onload = () => {`).

**Step 2:** Replace the entire block as shown above.

**Step 3:** Test:
- Load the page normally → "blink" preset loads, no toast.
- Call `shareCircuitLink()` from the console, copy the URL, open it in a new tab → same preset/step loads with the "Circuit loaded from shared link!" toast.

**Step 4: Commit**
```bash
git add index.html
git commit -m "feat: restore circuit state from ?c= URL param on load"
```

---

## Task 3: Add Share button to the header

**Files:**
- Modify: `index.html` — header button group (~line 412)

**What to do:**

In the header's `<div class="flex items-center gap-1.5">` block, add a Share button right after the Load button (after the `<input id="load-file-input" ...>` line, before the dark-mode toggle):

```html
<!-- Share circuit link -->
<button onclick="shareCircuitLink()" title="Share Circuit Link" class="panel-close-btn" style="display:flex;">
    <i class="fa-solid fa-share-nodes text-xs"></i>
</button>
```

**Step 1:** Find the line `<input id="load-file-input" type="file"` (around line 419).

**Step 2:** Insert the new `<button>` block on the very next line after the `<input>`.

**Step 3:** Verify the button appears in the header between the folder-open and moon icons.

**Step 4:** Click it — toast should say "Share link copied to clipboard! 🔗" and the URL bar should now contain `?c=...`.

**Step 5: Commit**
```bash
git add index.html
git commit -m "feat: add Share button to header (fa-share-nodes icon)"
```

---

## Task 4: Add keyboard shortcut `S` for sharing

**Files:**
- Modify: `index.html` — keyboard shortcut handler

**What to do:**

Search for the existing keyboard handler (search: `document.addEventListener('keydown'`). It should look something like:

```js
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === '?') toggleShortcutsOverlay();
    // ... other shortcuts ...
});
```

Add `S` (shift+s or lowercase s) to call `shareCircuitLink()`:

```js
if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey) shareCircuitLink();
```

**Step 1:** Find the `keydown` listener.

**Step 2:** Add the `s`/`S` case alongside the others.

**Step 3:** Also update the **Keyboard Shortcuts Overlay** HTML (search for the overlay `<div id="shortcuts-overlay"`). Add a row:

```html
<div class="shortcut-row">
    <kbd>S</kbd>
    <span>Copy share link</span>
</div>
```

Place it near the Save/Load rows in the overlay list.

**Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add S keyboard shortcut for share circuit link"
```

---

## Task 5: Smoke-test end-to-end

**Manual checklist — do each item, check it off:**

1. **Clean load (no param):** Open `http://localhost:5173` (or the Vite dev server). LED Blink loads, no toast.
2. **Share from blink:** Press `S`. URL updates to `?c=...`. Open that URL in incognito → LED Blink loads with "Circuit loaded from shared link!" toast.
3. **Share from a different preset:** Click "Siren Alarm". Press `S`. Open link → Siren Alarm loads.
4. **Share mid-step:** Go to Step 2 of Night Light. Press `S`. Open link → Night Light on Step 2 loads.
5. **Share with custom firmware:** Edit the code in the IDE. Press `S`. Open link → custom code is present.
6. **Share with placed components:** Drag a capacitor from the Parts Library. Press `S`. Open link → placed component reappears.
7. **Bad param:** Manually corrupt the `?c=` value in the URL. Page loads, falls back to blink silently.
8. **Header button:** The share-nodes icon appears between the folder-open and moon icons in the header.
9. **Shortcuts overlay:** Press `?` — `S` shortcut appears in the list.

**Step 1:** Run `npm run dev` (or however the project is served — check `package.json` scripts).

**Step 2:** Work through the checklist above.

**Step 3:** Fix anything that fails before final commit.

**Step 4: Final commit**
```bash
git add index.html
git commit -m "docs: mark Share Circuit Link as done in TODO.md"
```

Then update `TODO.md`:
```markdown
- [x] **Share Circuit Link** — Encode circuit state in a URL query parameter for one-click sharing
```
