/* @ds-bundle: {"format":3,"namespace":"FloodlightEditorialDesignSystem_29723e","components":[],"sourceHashes":{"slides/deck-stage.js":"214b4372b747","ui_kits/citizen-reporter/CitizenReporter.jsx":"5ad350c8ec71","ui_kits/citizen-reporter/Primitives.jsx":"d2f233a835b0","ui_kits/citizen-reporter/ios-frame.jsx":"be3343be4b51","ui_kits/command-desk/Chrome.jsx":"531972c3164c","ui_kits/command-desk/CrisisMap.jsx":"0791d9b0c62f","ui_kits/command-desk/Data.jsx":"19d34b23cb96","ui_kits/command-desk/Primitives.jsx":"cfe9fae6fb37","ui_kits/command-desk/Wire.jsx":"a4985dc7fe82"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FloodlightEditorialDesignSystem_29723e = window.FloodlightEditorialDesignSystem_29723e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// slides/deck-stage.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 *
 * Speaker notes stay in sync because the component posts {slideIndexChanged: N}
 * to the parent — just include the #speaker-notes script tag if asked for notes.
 *
 * Authoring guidance:
 *   - Write slide bodies as static HTML inside <deck-stage>, with sizing via
 *     CSS custom properties in a <style> block rather than JS constants.
 *     Static slide markup is what lets the user click a heading in edit mode
 *     and retype it directly; a slide rendered through <script type="text/babel">,
 *     React, or a loop over a JS array has to round-trip every tweak through a
 *     chat message instead. Reach for script-generated slides only when the
 *     content genuinely needs interactive behaviour static HTML can't express.
 *   - Do NOT set position/inset/width/height on the slide <section> elements —
 *     the component absolutely positions every slotted child for you.
 */
/* END USAGE */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/citizen-reporter/CitizenReporter.jsx
try { (() => {
// Floodlight Editorial — Citizen Reporter (mobile PWA) screens
// State machine: home → triage → compose → queued

function Masthead({
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: FL.paper,
      padding: '54px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: FL.ink
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '8px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 22,
      color: FL.ink,
      letterSpacing: '-0.01em'
    }
  }, "Floodlight", /*#__PURE__*/React.createElement("span", {
    style: {
      color: FL.emphasis
    }
  }, ".")), /*#__PURE__*/React.createElement(Kicker, null, sub || 'CITIZEN REPORTER')), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: FL.rule
    }
  }));
}
function OfflineBanner() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: FL.paperRaised,
      border: `1px solid ${FL.ruleSoft}`,
      borderLeft: `3px solid ${FL.sevModerate}`,
      borderRadius: 3,
      padding: '10px 12px',
      margin: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wifiOff",
    size: 17,
    color: FL.sevModerate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11.5,
      fontWeight: 500,
      letterSpacing: '0.06em',
      color: FL.ink
    }
  }, "OFFLINE \u2014 REPORTS QUEUE LOCALLY"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 12,
      color: FL.ink3,
      marginTop: 2
    }
  }, "Nothing is lost. We send the moment a signal returns.")));
}

// ---------- HOME ----------
function HomeScreen({
  onReport
}) {
  const nearby = [{
    lvl: 'P0',
    sum: 'Elderly trapped, 2nd floor — Whitefield',
    meta: 'RPT-2048 · 0.4 km · 12 min ago'
  }, {
    lvl: 'P1',
    sum: 'Water entering ground-floor homes',
    meta: 'RPT-2051 · 0.9 km · 26 min ago'
  }, {
    lvl: 'P2',
    sum: 'Sarjapur junction impassable',
    meta: 'RPT-2053 · 1.2 km · 41 min ago'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 110
    }
  }, /*#__PURE__*/React.createElement(Masthead, null), /*#__PURE__*/React.createElement(OfflineBanner, null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    style: {
      marginBottom: 10
    }
  }, "BELLANDUR \xB7 WARD 174"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 30,
      lineHeight: 1.12,
      color: FL.ink,
      letterSpacing: '-0.01em'
    }
  }, "See something? Report it."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 15,
      lineHeight: 1.55,
      color: FL.ink2,
      marginTop: 10
    }
  }, "A voice note, a photo, or a line of text \u2014 with your location attached. It reaches the response desk even on a weak signal.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 9,
      borderBottom: `1px solid ${FL.rule}`
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    color: FL.ink
  }, "NEAR YOU"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.ink3
    }
  }, "3 ACTIVE")), nearby.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      padding: '13px 0',
      borderBottom: `1px solid ${FL.ruleSoft}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      background: SEV[r.lvl].c,
      borderRadius: 1,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontSize: 16,
      lineHeight: 1.25,
      color: FL.ink
    }
  }, r.sum), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.ink3,
      marginTop: 5
    }
  }, r.meta))))), /*#__PURE__*/React.createElement(EmergencyButton, {
    onClick: onReport
  }));
}

// ---------- TRIAGE ----------
function TriageScreen({
  onBack,
  onPick
}) {
  const opts = [{
    lvl: 'P0',
    t: 'Someone is trapped or in danger',
    d: 'Life threat — needs rescue now'
  }, {
    lvl: 'P1',
    t: 'Water rising fast / entering home',
    d: 'Urgent — situation worsening'
  }, {
    lvl: 'P2',
    t: 'Road blocked or impassable',
    d: 'Hazard — affects movement'
  }, {
    lvl: 'INFO',
    t: 'Standing water or general report',
    d: 'For the record — non-urgent'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 30
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    sub: "STEP 1 OF 2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 13,
      color: FL.accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "back",
    size: 16,
    color: FL.accent
  }), "Back"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 28,
      lineHeight: 1.12,
      color: FL.ink,
      marginTop: 14,
      letterSpacing: '-0.01em'
    }
  }, "What's happening?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 14,
      color: FL.ink3,
      marginTop: 8
    }
  }, "Pick the closest match. You can add detail next.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 0'
    }
  }, opts.map((o, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onPick(o.lvl),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '16px 0',
      background: 'none',
      border: 0,
      borderTop: i === 0 ? `1px solid ${FL.rule}` : 'none',
      borderBottom: `1px solid ${FL.ruleSoft}`,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 4,
      alignSelf: 'stretch',
      background: SEV[o.lvl].c,
      borderRadius: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontSize: 18,
      lineHeight: 1.25,
      color: FL.ink
    }
  }, o.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 12.5,
      color: FL.ink3,
      marginTop: 3
    }
  }, o.d)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron",
    size: 18,
    color: FL.ink4
  })))));
}

// ---------- COMPOSE ----------
function ComposeScreen({
  level,
  onBack,
  onSubmit
}) {
  const [mode, setMode] = React.useState('voice');
  const [recording, setRecording] = React.useState(false);
  const [hasMedia, setHasMedia] = React.useState(false);
  const modes = [{
    k: 'voice',
    icon: 'mic',
    label: 'Voice'
  }, {
    k: 'text',
    icon: 'type',
    label: 'Text'
  }, {
    k: 'photo',
    icon: 'camera',
    label: 'Photo'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 110
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    sub: "STEP 2 OF 2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 13,
      color: FL.accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "back",
    size: 16,
    color: FL.accent
  }), "Back"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SeverityTag, {
    level: level
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 24,
      color: FL.ink,
      letterSpacing: '-0.01em'
    }
  }, "Add detail"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      margin: '18px 16px 0',
      border: `1px solid ${FL.rule}`,
      borderRadius: 3,
      overflow: 'hidden'
    }
  }, modes.map((m, i) => /*#__PURE__*/React.createElement("button", {
    key: m.k,
    onClick: () => setMode(m.k),
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: '11px 0',
      background: mode === m.k ? FL.ink : FL.paper,
      color: mode === m.k ? FL.paper : FL.ink,
      border: 0,
      borderLeft: i > 0 ? `1px solid ${FL.rule}` : 'none',
      cursor: 'pointer',
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.icon,
    size: 16,
    color: mode === m.k ? FL.paper : FL.ink
  }), m.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '16px 16px 0',
      background: FL.card,
      border: `1px solid ${FL.ruleSoft}`,
      borderRadius: 4,
      padding: 18,
      minHeight: 150
    }
  }, mode === 'voice' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setRecording(!recording);
      setHasMedia(true);
    },
    style: {
      width: 76,
      height: 76,
      borderRadius: '50%',
      border: `2px solid ${recording ? FL.emphasis : FL.ink}`,
      background: recording ? FL.emphasisTint : FL.paper,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 30,
    color: recording ? FL.emphasis : FL.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 12,
      color: recording ? FL.emphasis : FL.ink3,
      marginTop: 14,
      letterSpacing: '0.06em'
    }
  }, recording ? '● RECORDING — 0:08' : hasMedia ? 'VOICE NOTE ATTACHED · 0:08' : 'TAP TO RECORD'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 13,
      color: FL.ink3,
      marginTop: 8
    }
  }, "Speak in any language. We transcribe on the desk.")), mode === 'text' && /*#__PURE__*/React.createElement("textarea", {
    defaultValue: "Two people on the terrace at 14 Lake Road, water past the gate.",
    placeholder: "Describe what you see\u2026",
    style: {
      width: '100%',
      minHeight: 120,
      border: 0,
      outline: 'none',
      resize: 'none',
      fontFamily: FL.ui,
      fontSize: 15,
      lineHeight: 1.55,
      color: FL.ink,
      background: 'transparent',
      boxSizing: 'border-box'
    }
  }), mode === 'photo' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 96,
      border: `1px dashed ${FL.ink4}`,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      color: FL.ink3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 26,
    color: FL.ink3
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.ui,
      fontSize: 13
    }
  }, "Tap to attach a photo")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '14px 16px 0',
      padding: '11px 13px',
      border: `1px solid ${FL.ruleSoft}`,
      borderRadius: 3,
      background: FL.paperRaised
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 18,
    color: FL.accent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 13,
      color: FL.ink
    }
  }, "Location attached"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.ink3,
      marginTop: 2
    }
  }, "12.9352\xB0N \xB7 77.6245\xB0E \xB7 \xB18 m")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10,
      color: FL.sevStable,
      letterSpacing: '0.06em'
    }
  }, "GPS LOCK")), /*#__PURE__*/React.createElement("button", {
    onClick: onSubmit,
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 30,
      height: 56,
      background: FL.emphasis,
      color: '#fff',
      border: 0,
      borderRadius: 3,
      fontFamily: FL.ui,
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: '0.04em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      cursor: 'pointer',
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 18,
    color: "#fff"
  }), "SUBMIT REPORT"));
}

// ---------- QUEUED ----------
function QueuedScreen({
  level,
  onDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 110
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    sub: "SUBMITTED"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 16px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      border: `2px solid ${FL.sevStable}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 30,
    color: FL.sevStable
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 28,
      color: FL.ink,
      marginTop: 18,
      letterSpacing: '-0.01em'
    }
  }, "Report queued"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.ui,
      fontSize: 15,
      lineHeight: 1.55,
      color: FL.ink2,
      marginTop: 10,
      maxWidth: 300,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }, "You're offline, so it's saved on this phone. It sends automatically the moment a signal returns.")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '26px 16px 0',
      border: `1px solid ${FL.ruleSoft}`,
      borderTop: `3px solid ${FL.ink}`,
      borderRadius: 4,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 11,
      borderBottom: `1px solid ${FL.ruleSoft}`
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    color: FL.ink
  }, "RECEIPT"), /*#__PURE__*/React.createElement(SeverityTag, {
    level: level
  })), [['Report ID', 'RPT-2061'], ['Location', '12.9352°N 77.6245°E'], ['Captured', 'T+04:21 · 18 MAY'], ['Status', 'QUEUED — 1 OF 1 PENDING']].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: i < 3 ? `1px solid ${FL.ruleSoft}` : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.ui,
      fontSize: 13,
      color: FL.ink3
    }
  }, r[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 12,
      color: i === 3 ? FL.sevModerate : FL.ink,
      fontVariantNumeric: 'tabular-nums'
    }
  }, r[1])))), /*#__PURE__*/React.createElement("button", {
    onClick: onDone,
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 30,
      height: 52,
      background: FL.paper,
      color: FL.ink,
      border: `1px solid ${FL.ink}`,
      borderRadius: 3,
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
      zIndex: 40
    }
  }, "Back to home"));
}
function CitizenApp() {
  const [screen, setScreen] = React.useState('home');
  const [level, setLevel] = React.useState('P1');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: FL.paper,
      fontFamily: FL.ui
    }
  }, screen === 'home' && /*#__PURE__*/React.createElement(HomeScreen, {
    onReport: () => setScreen('triage')
  }), screen === 'triage' && /*#__PURE__*/React.createElement(TriageScreen, {
    onBack: () => setScreen('home'),
    onPick: l => {
      setLevel(l);
      setScreen('compose');
    }
  }), screen === 'compose' && /*#__PURE__*/React.createElement(ComposeScreen, {
    level: level,
    onBack: () => setScreen('triage'),
    onSubmit: () => setScreen('queued')
  }), screen === 'queued' && /*#__PURE__*/React.createElement(QueuedScreen, {
    level: level,
    onDone: () => setScreen('home')
  }));
}
Object.assign(window, {
  Masthead,
  OfflineBanner,
  HomeScreen,
  TriageScreen,
  ComposeScreen,
  QueuedScreen,
  CitizenApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/citizen-reporter/CitizenReporter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/citizen-reporter/Primitives.jsx
try { (() => {
// Floodlight Editorial — shared primitives (Citizen Reporter)
// Inline Lucide-style stroke icons + editorial UI atoms. Exported to window.

const FL = {
  paper: '#F6F3EC',
  paperRaised: '#FBFAF5',
  card: '#FFFFFF',
  ink: '#16140F',
  ink2: '#3A362E',
  ink3: '#6B655A',
  ink4: '#9A9384',
  rule: '#16140F',
  ruleSoft: '#DAD4C6',
  accent: '#1B3FA0',
  accentPress: '#142F7A',
  accentTint: 'rgba(27,63,160,0.08)',
  emphasis: '#CC3B2B',
  emphasisTint: 'rgba(204,59,43,0.08)',
  sevCritical: '#CC3B2B',
  sevHigh: '#C9711B',
  sevModerate: '#B0860F',
  sevStable: '#2E7D5B',
  sevInfo: '#1B3FA0',
  serif: "'Newsreader', Georgia, serif",
  ui: "'Libre Franklin', Helvetica, Arial, sans-serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace"
};

// ---- Lucide-style stroke icons (1.75 stroke, currentColor) ----
function Icon({
  name,
  size = 20,
  stroke = 1.75,
  color = 'currentColor',
  style = {}
}) {
  const p = {
    mic: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "9",
      y: "2",
      width: "6",
      height: "11",
      rx: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 10v1a7 7 0 0 0 14 0v-1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "22"
    })),
    camera: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "3.5"
    })),
    pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    wifiOff: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M2 2l20 20"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8.5 16.5a5 5 0 0 1 7 0"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 8.8a16 16 0 0 1 5-3.1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 8.8a16 16 0 0 0-5.5-3.3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12.9a10 10 0 0 1 4-2.4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 12.9a10 10 0 0 0-3-2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "20",
      x2: "12.01",
      y2: "20"
    })),
    chevron: /*#__PURE__*/React.createElement("path", {
      d: "M9 18l6-6-6-6"
    }),
    back: /*#__PURE__*/React.createElement("path", {
      d: "M19 12H5M12 19l-7-7 7-7"
    }),
    check: /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    }),
    image: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "9",
      r: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 15l-5-5L5 21"
    })),
    send: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 2L11 13"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 2l-7 20-4-9-9-4 20-7Z"
    })),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    })),
    type: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 7V4h16v3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 20h6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 4v16"
    }))
  }[name];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style
  }, p);
}
function Kicker({
  children,
  color = FL.ink3,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, children);
}
const SEV = {
  P0: {
    c: FL.sevCritical,
    label: 'P0 SOS'
  },
  P1: {
    c: FL.sevHigh,
    label: 'P1 URGENT'
  },
  P2: {
    c: FL.sevModerate,
    label: 'P2 WATCH'
  },
  STABLE: {
    c: FL.sevStable,
    label: 'STABLE'
  },
  INFO: {
    c: FL.sevInfo,
    label: 'INFO'
  }
};
function SeverityTag({
  level
}) {
  const s = SEV[level];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: FL.mono,
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: '0.05em',
      color: s.c,
      background: 'rgba(0,0,0,0.015)',
      padding: '3px 7px',
      borderRadius: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 11,
      background: s.c,
      borderRadius: 1
    }
  }), s.label);
}

// Bottom-fixed vermillion emergency button
function EmergencyButton({
  onClick,
  label = 'REPORT EMERGENCY'
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 30,
      height: 56,
      background: FL.emphasis,
      color: '#fff',
      border: 0,
      borderRadius: 3,
      fontFamily: FL.ui,
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: '0.04em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      cursor: 'pointer',
      zIndex: 40,
      boxShadow: '0 -10px 24px -18px rgba(20,18,15,0.4)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 18,
    color: "#fff"
  }), label);
}
Object.assign(window, {
  FL,
  Icon,
  Kicker,
  SeverityTag,
  SEV,
  EmergencyButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/citizen-reporter/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/citizen-reporter/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/citizen-reporter/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-desk/Chrome.jsx
try { (() => {
// Floodlight Editorial — Command Desk chrome (masthead + left rail)

function Masthead({
  dateline
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: FL.paper,
      borderBottom: `1px solid ${FL.rule}`,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: FL.ink
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '12px 24px 11px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 27,
      color: FL.ink,
      letterSpacing: '-0.01em',
      lineHeight: 1
    }
  }, "Floodlight", /*#__PURE__*/React.createElement("span", {
    style: {
      color: FL.emphasis
    }
  }, ".")), /*#__PURE__*/React.createElement(Kicker, {
    style: {
      fontSize: 11.5
    }
  }, "RESPONDER COMMAND DESK")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11.5,
      color: FL.ink2,
      letterSpacing: '0.04em'
    }
  }, dateline), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 16,
      background: FL.ruleSoft
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.sevStable
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: FL.sevStable
    }
  }), "SYNC OK"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 34,
      height: 34,
      border: `1px solid ${FL.ruleSoft}`,
      borderRadius: 3,
      background: FL.paper,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 16,
    color: FL.ink2
  })))));
}
function LeftRail({
  active,
  onSelect
}) {
  const items = [{
    k: 'situation',
    icon: 'activity',
    label: 'Situation'
  }, {
    k: 'map',
    icon: 'map',
    label: 'Crisis map'
  }, {
    k: 'reports',
    icon: 'list',
    label: 'Reports',
    badge: '14'
  }, {
    k: 'teams',
    icon: 'truck',
    label: 'Teams'
  }, {
    k: 'shelters',
    icon: 'home',
    label: 'Shelters'
  }, {
    k: 'query',
    icon: 'search',
    label: 'AI query desk'
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 224,
      flexShrink: 0,
      background: FL.paperRaised,
      borderRight: `1px solid ${FL.rule}`,
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    style: {
      padding: '0 20px 12px'
    }
  }, "SECTIONS"), items.map(it => {
    const on = active === it.k;
    return /*#__PURE__*/React.createElement("button", {
      key: it.k,
      onClick: () => onSelect(it.k),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 20px',
        background: on ? FL.paper : 'transparent',
        border: 0,
        borderLeft: `2px solid ${on ? FL.ink : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17,
      color: on ? FL.ink : FL.ink3
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: FL.ui,
        fontWeight: on ? 700 : 500,
        fontSize: 14,
        color: on ? FL.ink : FL.ink2
      }
    }, it.label), it.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: FL.mono,
        fontSize: 11,
        color: FL.emphasis,
        fontWeight: 500
      }
    }, it.badge));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 20px',
      paddingTop: 16,
      borderTop: `1px solid ${FL.ruleSoft}`
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    style: {
      marginBottom: 8
    }
  }, "OPERATOR"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontSize: 15,
      color: FL.ink
    }
  }, "Desk 02 \xB7 A. Rao"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10.5,
      color: FL.ink3,
      marginTop: 3
    }
  }, "SHIFT 18:00\u201306:00")));
}

// Pull-stat strip above the map
function StatStrip() {
  const stats = [{
    k: 'ACTIVE REPORTS',
    v: '48',
    emph: true
  }, {
    k: 'P0 / SOS OPEN',
    v: '6',
    emph: true
  }, {
    k: 'TEAMS DEPLOYED',
    v: '11'
  }, {
    k: 'SHELTERS · CAPACITY',
    v: '7 / 82%'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: FL.paper,
      borderBottom: `1px solid ${FL.rule}`
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      padding: '13px 20px',
      borderRight: i < stats.length - 1 ? `1px solid ${FL.ruleSoft}` : 'none'
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    style: {
      fontSize: 10
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontWeight: 600,
      fontSize: 30,
      lineHeight: 1,
      marginTop: 6,
      letterSpacing: '-0.02em',
      color: s.emph ? FL.emphasis : FL.ink,
      fontVariantNumeric: 'tabular-nums'
    }
  }, s.v))));
}
Object.assign(window, {
  Masthead,
  LeftRail,
  StatStrip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-desk/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-desk/CrisisMap.jsx
try { (() => {
// Floodlight Editorial — Crisis map (REAL desaturated Bengaluru basemap)
// Leaflet + CARTO light tiles, CSS-filtered to the warm paper palette, with
// Floodlight overlays: flood-depth polygons, ink-blue route, vermillion dashed
// blocked road, ochre teams, green shelters, severity report markers, serif
// place labels, and a boxed mono legend. Leaflet is loaded from CDN in index.html.

function CrisisMap({
  selected,
  onSelect
}) {
  const elRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const reportLayers = React.useRef({});
  const ringRef = React.useRef(null);
  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;
  const sevColor = l => SEV[l].c;
  React.useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: false,
      center: MAP_CENTER,
      zoom: MAP_ZOOM
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // ---- flood-depth polygons ----
    const floodFill = {
      1: FL.flood1,
      2: FL.flood2,
      3: FL.flood3,
      4: FL.flood4
    };
    FLOOD_ZONES.forEach(z => {
      L.polygon(z.ll, {
        stroke: false,
        fillColor: floodFill[z.depth],
        fillOpacity: 0.55,
        interactive: false
      }).addTo(map);
    });

    // ---- blocked road (vermillion dashed) ----
    L.polyline(BLOCKED, {
      color: FL.blocked,
      weight: 4,
      dashArray: '10 8',
      opacity: 0.95,
      interactive: false
    }).addTo(map);
    // ---- optimized rescue route (ink-blue) ----
    L.polyline(ROUTE, {
      color: FL.route,
      weight: 4,
      opacity: 0.95,
      interactive: false
    }).addTo(map);

    // ---- shelters (green house tick) ----
    SHELTERS.forEach(s => {
      const icon = L.divIcon({
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div style="width:16px;height:16px;background:${FL.card};border:2px solid ${FL.shelter};position:relative;">
           <div style="position:absolute;left:1px;right:1px;top:-5px;height:5px;border-top:2px solid ${FL.shelter};border-left:2px solid ${FL.shelter};border-right:2px solid ${FL.shelter};transform:skewX(0);"></div>
         </div>`
      });
      L.marker(s.ll, {
        icon,
        interactive: false
      }).addTo(map);
    });

    // ---- teams (ochre flag) ----
    TEAMS.forEach(t => {
      const icon = L.divIcon({
        className: '',
        iconSize: [16, 20],
        iconAnchor: [2, 20],
        html: `<div style="width:2px;height:20px;background:${FL.team};position:relative;">
           <div style="position:absolute;left:2px;top:0;width:0;height:0;border-left:11px solid ${FL.team};border-top:5px solid transparent;border-bottom:5px solid transparent;"></div>
         </div>`
      });
      L.marker(t.ll, {
        icon,
        interactive: false
      }).addTo(map);
    });

    // ---- serif place labels ----
    const labels = [{
      ll: [12.920, 77.666],
      text: 'Bellandur Lake'
    }, {
      ll: [12.953, 77.701],
      text: 'Whitefield'
    }];
    labels.forEach(l => {
      const icon = L.divIcon({
        className: '',
        iconSize: [140, 20],
        iconAnchor: [0, 10],
        html: `<div style="font-family:${FL.serif};font-style:italic;font-size:15px;color:${FL.ink2};text-shadow:0 0 3px ${FL.paper},0 0 3px ${FL.paper};white-space:nowrap;">${l.text}</div>`
      });
      L.marker(l.ll, {
        icon,
        interactive: false
      }).addTo(map);
    });

    // ---- selection ring (under markers) ----
    ringRef.current = L.circleMarker(MAP_CENTER, {
      radius: 13,
      color: FL.ink,
      weight: 1.5,
      opacity: 0,
      fill: false,
      interactive: false
    }).addTo(map);

    // ---- report markers (severity dots) ----
    REPORTS.forEach(r => {
      const m = L.circleMarker(r.ll, {
        radius: 7,
        fillColor: sevColor(r.lvl),
        fillOpacity: 1,
        color: FL.paper,
        weight: 2
      }).addTo(map);
      m.on('click', () => onSelectRef.current(r.id));
      reportLayers.current[r.id] = m;
    });

    // keep sized to its flex container
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // restyle on selection
  React.useEffect(() => {
    Object.entries(reportLayers.current).forEach(([id, m]) => {
      m.setStyle({
        radius: id === selected ? 9 : 7,
        weight: id === selected ? 2.5 : 2
      });
      if (id === selected) m.bringToFront();
    });
    const ring = ringRef.current;
    const r = REPORTS.find(x => x.id === selected);
    if (ring && r) {
      ring.setLatLng(r.ll);
      ring.setStyle({
        color: sevColor(r.lvl),
        opacity: 0.7
      });
    } else if (ring) {
      ring.setStyle({
        opacity: 0
      });
    }
  }, [selected]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      background: FL.paperRaised,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: elRef,
    className: "paper-map",
    style: {
      position: 'absolute',
      inset: 0,
      background: FL.paper
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      bottom: 16,
      zIndex: 500,
      background: FL.card,
      border: `1px solid ${FL.rule}`,
      borderRadius: 3,
      padding: 12,
      width: 186
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10,
      letterSpacing: '0.1em',
      color: FL.ink3,
      paddingBottom: 8,
      borderBottom: `1px solid ${FL.ruleSoft}`,
      marginBottom: 9
    }
  }, "LEGEND \xB7 BENGALURU SE"), [['sw', FL.flood4, 'Deep / inundated'], ['sw', FL.flood2, 'Shallow / rising'], ['ln', FL.route, 'Rescue route'], ['dash', FL.blocked, 'Blocked road']].map((row, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.ink2,
      marginBottom: 7
    }
  }, row[0] === 'sw' && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 10,
      background: row[1],
      borderRadius: 1
    }
  }), row[0] === 'ln' && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      borderTop: `2px solid ${row[1]}`
    }
  }), row[0] === 'dash' && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      borderTop: `2px dashed ${row[1]}`
    }
  }), row[2])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.ink2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: FL.team
    }
  }), "Team"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: FL.shelter
    }
  }), "Shelter"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 16,
      top: 14,
      zIndex: 500,
      fontFamily: FL.mono,
      fontSize: 10,
      letterSpacing: '0.08em',
      color: FL.ink3,
      background: FL.paper,
      border: `1px solid ${FL.ruleSoft}`,
      borderRadius: 2,
      padding: '4px 8px'
    }
  }, "FIG. 1 \xB7 INUNDATION + ACTIVE REPORTS \xB7 22:14 IST"));
}
Object.assign(window, {
  CrisisMap
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-desk/CrisisMap.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-desk/Data.jsx
try { (() => {
// Floodlight Editorial — Command Desk shared data
// Geo coords (lat,lng) drive the real Leaflet basemap overlays around
// Bellandur, Bengaluru SE. The wire list reads the same records.

const MAP_CENTER = [12.926, 77.658];
const MAP_ZOOM = 13;
const REPORTS = [{
  id: 'RPT-2048',
  lvl: 'P0',
  sum: 'Elderly trapped, 2nd floor',
  place: 'Whitefield',
  coord: '12.97°N 77.59°E',
  t: 'T+04:12',
  ll: [12.957, 77.706]
}, {
  id: 'RPT-2051',
  lvl: 'P0',
  sum: 'Family on rooftop, water rising',
  place: 'Bellandur',
  coord: '12.93°N 77.62°E',
  t: 'T+04:18',
  ll: [12.926, 77.668]
}, {
  id: 'RPT-2053',
  lvl: 'P1',
  sum: 'Vehicle submerged, 1 person',
  place: 'Sarjapur Rd',
  coord: '12.91°N 77.68°E',
  t: 'T+04:21',
  ll: [12.901, 77.692]
}, {
  id: 'RPT-2054',
  lvl: 'P1',
  sum: 'Ground-floor flooding, 8 homes',
  place: 'Kasavanahalli',
  coord: '12.90°N 77.66°E',
  t: 'T+04:24',
  ll: [12.909, 77.661]
}, {
  id: 'RPT-2057',
  lvl: 'P2',
  sum: 'Road impassable, debris',
  place: 'ORR Junction',
  coord: '12.94°N 77.61°E',
  t: 'T+04:29',
  ll: [12.944, 77.638]
}, {
  id: 'RPT-2059',
  lvl: 'INFO',
  sum: 'Standing water, ankle deep',
  place: 'HSR Layout',
  coord: '12.91°N 77.64°E',
  t: 'T+04:33',
  ll: [12.912, 77.642]
}];
const TEAMS = [{
  id: 'TM-04',
  ll: [12.933, 77.650]
}, {
  id: 'TM-07',
  ll: [12.938, 77.685]
}, {
  id: 'TM-09',
  ll: [12.910, 77.676]
}];
const SHELTERS = [{
  id: 'SH-1',
  name: 'Govt School',
  cap: 0.62,
  ll: [12.951, 77.636]
}, {
  id: 'SH-2',
  name: 'Community Hall',
  cap: 0.94,
  ll: [12.917, 77.700]
}];

// Flood-depth polygons (paths of [lat,lng]) — muted depth ramp over the lake basin.
const FLOOD_ZONES = [{
  depth: 2,
  ll: [[12.936, 77.648], [12.931, 77.672], [12.918, 77.684], [12.905, 77.678], [12.901, 77.660], [12.910, 77.644], [12.924, 77.640]]
}, {
  depth: 3,
  ll: [[12.930, 77.658], [12.926, 77.674], [12.916, 77.679], [12.908, 77.671], [12.908, 77.658], [12.918, 77.652]]
}, {
  depth: 4,
  ll: [[12.924, 77.662], [12.921, 77.671], [12.914, 77.672], [12.912, 77.663], [12.917, 77.658]]
}, {
  depth: 1,
  ll: [[12.955, 77.695], [12.948, 77.712], [12.938, 77.710], [12.940, 77.694], [12.949, 77.690]]
}];

// Optimized rescue route (ink-blue) — TM-07 → RPT-2051.
const ROUTE = [[12.938, 77.685], [12.934, 77.676], [12.930, 77.671], [12.926, 77.668]];

// Blocked road (vermillion dashed).
const BLOCKED = [[12.944, 77.638], [12.932, 77.640], [12.922, 77.643]];
Object.assign(window, {
  MAP_CENTER,
  MAP_ZOOM,
  REPORTS,
  TEAMS,
  SHELTERS,
  FLOOD_ZONES,
  ROUTE,
  BLOCKED
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-desk/Data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-desk/Primitives.jsx
try { (() => {
// Floodlight Editorial — Command Desk primitives
const FL = {
  paper: '#F6F3EC',
  paperRaised: '#FBFAF5',
  card: '#FFFFFF',
  ink: '#16140F',
  ink2: '#3A362E',
  ink3: '#6B655A',
  ink4: '#9A9384',
  rule: '#16140F',
  ruleSoft: '#DAD4C6',
  accent: '#1B3FA0',
  accentPress: '#142F7A',
  accentTint: 'rgba(27,63,160,0.08)',
  emphasis: '#CC3B2B',
  emphasisTint: 'rgba(204,59,43,0.08)',
  sevCritical: '#CC3B2B',
  sevHigh: '#C9711B',
  sevModerate: '#B0860F',
  sevStable: '#2E7D5B',
  sevInfo: '#1B3FA0',
  flood1: '#CBD7EE',
  flood2: '#93AEDC',
  flood3: '#5C84C8',
  flood4: '#2A4FA0',
  route: '#1B3FA0',
  blocked: '#CC3B2B',
  team: '#C9711B',
  shelter: '#2E7D5B',
  serif: "'Newsreader', Georgia, serif",
  ui: "'Libre Franklin', Helvetica, Arial, sans-serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace"
};
function Icon({
  name,
  size = 18,
  stroke = 1.75,
  color = 'currentColor',
  style = {}
}) {
  const p = {
    activity: /*#__PURE__*/React.createElement("path", {
      d: "M22 12h-4l-3 9L9 3l-3 9H2"
    }),
    map: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 3v16M15 5v16"
    })),
    list: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "18",
      x2: "21",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "3.01",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "3.01",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "18",
      x2: "3.01",
      y2: "18"
    })),
    truck: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M10 17h4V5H2v12h3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 9h4l3 3v5h-2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7.5",
      cy: "17.5",
      r: "2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17.5",
      cy: "17.5",
      r: "2"
    })),
    home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 21V12h6v9"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m21 21-4.3-4.3"
    })),
    pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    radio: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"
    })),
    moon: /*#__PURE__*/React.createElement("path", {
      d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
    }),
    send: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 2 11 13"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 2l-7 20-4-9-9-4 20-7Z"
    })),
    chevron: /*#__PURE__*/React.createElement("path", {
      d: "M9 18l6-6-6-6"
    }),
    arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 5l7 7-7 7"
    }))
  }[name];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style
  }, p);
}
function Kicker({
  children,
  color = FL.ink3,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, children);
}
const SEV = {
  P0: {
    c: FL.sevCritical,
    label: 'P0 SOS'
  },
  P1: {
    c: FL.sevHigh,
    label: 'P1 URGENT'
  },
  P2: {
    c: FL.sevModerate,
    label: 'P2 WATCH'
  },
  STABLE: {
    c: FL.sevStable,
    label: 'STABLE'
  },
  INFO: {
    c: FL.sevInfo,
    label: 'INFO'
  }
};
function SeverityTag({
  level,
  small
}) {
  const s = SEV[level];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: FL.mono,
      fontWeight: 500,
      fontSize: small ? 10 : 11,
      letterSpacing: '0.05em',
      color: s.c,
      padding: '2px 6px',
      borderRadius: 2,
      background: 'rgba(0,0,0,0.02)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: small ? 9 : 11,
      background: s.c,
      borderRadius: 1
    }
  }), s.label);
}
function Button({
  children,
  kind = 'primary',
  icon,
  onClick,
  style = {}
}) {
  const base = {
    height: 38,
    padding: '0 16px',
    borderRadius: 3,
    fontFamily: FL.ui,
    fontWeight: 600,
    fontSize: 13.5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'background 140ms, color 140ms',
    ...style
  };
  const kinds = {
    primary: {
      background: FL.accent,
      color: '#fff'
    },
    secondary: {
      background: FL.paper,
      color: FL.ink,
      borderColor: FL.ink
    },
    critical: {
      background: FL.emphasis,
      color: '#fff'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      ...base,
      ...kinds[kind]
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    color: kinds[kind].color
  }), children);
}
Object.assign(window, {
  FL,
  Icon,
  Kicker,
  SeverityTag,
  SEV,
  Button
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-desk/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-desk/Wire.jsx
try { (() => {
// Floodlight Editorial — Command Desk "wire" column
// Severity list (ruled rows) + AI query desk.

function ReportRow({
  r,
  selected,
  onSelect,
  onDispatch
}) {
  const c = SEV[r.lvl].c;
  const on = selected === r.id;
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onSelect(r.id),
    style: {
      display: 'flex',
      gap: 12,
      padding: '13px 18px',
      borderBottom: `1px solid ${FL.ruleSoft}`,
      background: on ? FL.accentTint : 'transparent',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      background: c,
      borderRadius: 1,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SeverityTag, {
    level: r.lvl,
    small: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10.5,
      color: FL.ink3
    }
  }, r.t)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontSize: 16,
      lineHeight: 1.25,
      color: FL.ink,
      marginTop: 6
    }
  }, r.sum, " \u2014 ", r.place), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10.5,
      color: FL.ink3
    }
  }, r.id, " \xB7 ", r.coord), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onDispatch(r);
    },
    style: {
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: FL.ui,
      fontWeight: 600,
      fontSize: 12.5,
      color: r.lvl === 'P0' ? FL.emphasis : FL.accent,
      textDecoration: 'underline',
      textUnderlineOffset: 2
    }
  }, r.lvl === 'P0' ? 'Dispatch SOS' : 'Dispatch'))));
}
function QueryDesk() {
  const [q, setQ] = React.useState('');
  const [asked, setAsked] = React.useState(false);
  const sample = 'which shelter exceeds capacity next?';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${FL.rule}`,
      background: FL.paperRaised,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    style: {
      marginBottom: 10
    }
  }, "AI QUERY DESK"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: FL.card,
      border: `1px solid ${asked ? FL.accent : FL.ruleSoft}`,
      borderRadius: 3,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 12,
      color: FL.ink3,
      flexShrink: 0
    }
  }, "QUERY \u2014"), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: sample,
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontFamily: q ? FL.ui : FL.serif,
      fontStyle: q ? 'normal' : 'italic',
      fontSize: 15,
      color: q ? FL.ink : FL.ink3,
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAsked(true),
    style: {
      width: 30,
      height: 30,
      borderRadius: 3,
      border: 0,
      background: FL.accent,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 14,
    color: "#fff"
  }))), asked && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      borderLeft: `3px solid ${FL.emphasis}`,
      paddingLeft: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.serif,
      fontSize: 16,
      lineHeight: 1.4,
      color: FL.ink
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: FL.emphasis,
      fontFamily: FL.serif
    }
  }, "Community Hall"), " reaches capacity in ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: FL.emphasis
    }
  }, "~40 min"), " at the current intake rate."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FL.mono,
      fontSize: 10.5,
      color: FL.ink3,
      marginTop: 8
    }
  }, "SH-2 \xB7 94% \xB7 INTAKE 12/HR \xB7 MODEL OSC-1.0")));
}
function WireColumn({
  selected,
  onSelect,
  onDispatch
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 392,
      flexShrink: 0,
      borderLeft: `1px solid ${FL.rule}`,
      background: FL.paper,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 18px 13px',
      borderBottom: `1px solid ${FL.rule}`
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    color: FL.ink
  }, "INCOMING WIRE \xB7 LIVE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FL.mono,
      fontSize: 11,
      color: FL.emphasis
    }
  }, "6 SOS")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, REPORTS.map(r => /*#__PURE__*/React.createElement(ReportRow, {
    key: r.id,
    r: r,
    selected: selected,
    onSelect: onSelect,
    onDispatch: onDispatch
  }))), /*#__PURE__*/React.createElement(QueryDesk, null));
}
Object.assign(window, {
  ReportRow,
  QueryDesk,
  WireColumn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-desk/Wire.jsx", error: String((e && e.message) || e) }); }

})();
