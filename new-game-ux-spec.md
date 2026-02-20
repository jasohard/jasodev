# Slope Surfer — UX Specification

> **UX Designer:** Senior UX Designer (Mobile-First Interactive Applications)
> **Based on:** `new-game-design.md` (Game Design Spec)
> **Design Principle:** Every pixel earns its place. Every interaction has feedback. The derivative isn't abstract — it's something you *feel*.
> **Design System Ref:** `src/index.css` (global tokens), existing game CSS modules

---

## 1. Information Architecture

### Sitemap

```
jasodev.com
 └─ / (Home — Game Hub)
     ├─ /plinko
     ├─ /vectors
     ├─ /proof-pinball
     ├─ /trig
     └─ /slope-surfer         ← NEW
          ├─ Level Select      (phase: levelSelect)
          ├─ Planning Phase    (phase: planning)
          ├─ Ride Phase        (phase: riding)
          └─ Result Phase      (phase: success | failed)
```

### Screen States & What's Visible

| State | Primary Content | Secondary Content | Hidden |
|-------|----------------|-------------------|--------|
| **Level Select** | 8-cell level grid with stars | Game title, "Back to Hub" (via Layout) | All game UI |
| **Intro** (Level 1 first-visit only) | Tutorial overlay + auto-riding surfer | Dim background curve | Controls, HUD |
| **Planning** | Mountain curve + control points + gems + target | HUD (gems/timer placeholder), hint banner | Speed readout, derivative graph (until toggled) |
| **Riding** | Surfer on curve, tangent line rotating, speed particles | HUD (live speed, gem count, timer), optional f'(x) graph | Control points (non-interactive), SURF button |
| **Success** | Level complete overlay (stars, score, gems) | Faded game view behind overlay | Planning controls |
| **Failed** | Retry prompt with message ("Ran out of momentum") | Stopped surfer visible on curve | Score breakdown |

### Content Priority (What Draws the Eye)

**Planning Phase:**
1. Control points (bright cyan, pulsing — the primary interaction affordance)
2. Mountain curve (gradient, large, center screen)
3. Gems (gold, floating animation)
4. Target zone (green pulsing ring)
5. SURF button (bottom, green gradient, breathing animation)
6. Hint text (top, subtle)

**Riding Phase:**
1. Surfer + tangent line (white, center focus, moving)
2. Speed readout (large number, color-coded)
3. Gems being collected (burst animations)
4. Motion trail (speed feedback)
5. Timer + gem counter (HUD, secondary)

---

## 2. Mobile Layout (375px width)

### Above the Fold (No Scroll Required)

The game MUST fit entirely above the fold on a 375×667pt screen (iPhone SE through iPhone 15). The Layout nav header is 56px. That leaves 611px of vertical space.

```
┌─────────────────────────────────┐ 0px
│  jasodev          ← All Games  │ Layout nav (56px)
├─────────────────────────────────┤ 56px
│  Slope Surfer                  │ Game title (24px)
│  Level 2: The Hill  ⭐☆☆      │ Level + stars (18px)
│  ◇ 0/2    ── ──               │ Gem count + timer (16px)
├─────────────────────────────────┤ ~114px
│                                │
│      ╱╲         ◇             │
│     ╱  ╲   ╱╲                 │
│    ╱ ●  ╲ ╱  ╲   ◇           │ Main game SVG (340px)
│   ╱      ╲    ╲               │ viewBox="0 0 400 260"
│  ╱        ╲    ╲  🏁          │
│                  ╲             │
│                                │
├─────────────────────────────────┤ ~454px
│ Drag handles to reshape the... │ Hint (32px, one line)
├─────────────────────────────────┤ ~486px
│  [↻]  [f'(x)]  [ SURF! 🏄 ]  │ Controls bar (64px)
├─────────────────────────────────┤ ~550px
│ (f'(x) graph, if toggled)      │ Derivative graph (80px)
│  ═══════════════════            │ (only when toggled ON)
└─────────────────────────────────┘ ~630px
```

**Key dimensions (375px phone):**
- Nav header: 56px (sticky, existing Layout component)
- Game header: ~58px (title + level/stars + gem counter)
- Main SVG: **340px** tall (fills available width minus 16px padding each side = 343px wide). SVG viewBox `0 0 400 260`, aspect ratio ~1.54:1.
- Hint banner: 32px (one-line, collapsible after first read)
- Controls bar: 64px (SURF button + tool buttons)
- Derivative graph: 80px (hidden by default, toggled in)
- **Total without f'(x) graph: ~550px** — fits comfortably above the fold
- **Total with f'(x) graph: ~630px** — still fits on most devices; slight scroll on iPhone SE

### Not Scrollable in Normal Play

The game is designed so that **no scrolling is needed during active play**. The full curve, controls, and HUD are visible at all times. The derivative graph is the only element that pushes below the fold on very small screens, and it's an optional toggle.

### SVG ViewBox Strategy

- **ViewBox:** `0 0 400 260` — wider than tall, optimized for the curve to stretch horizontally
- SVG fills 100% width of the container (minus 16px padding), height auto-scales
- On 375px screen: SVG renders at 343×223px
- On 414px screen: SVG renders at 382×248px
- On 480px screen: SVG renders at 448×291px
- All touch targets inside SVG are defined in viewBox coordinates and scale proportionally

---

## 3. Desktop Layout (1024px+)

### Layout at 1024px

```
┌──────────────────────────────────────────────────────────┐
│  jasodev                                  ← All Games    │ Nav (56px)
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────┬──────────────────┐ │
│  │                                  │  Slope Surfer    │ │
│  │                                  │  Level 2: Hill   │ │
│  │    Mountain curve + surfer       │  ⭐☆☆            │ │
│  │    (SVG game area)               │                  │ │
│  │    viewBox 0 0 600 320           │  ◇ 0/2  ⏱ --   │ │
│  │                                  │                  │ │
│  │                                  │  Speed: ---      │ │
│  │                                  │  Slope: ---°     │ │
│  │                                  │                  │ │
│  │                                  │  [f'(x) toggle]  │ │
│  │                                  │  [Speed overlay]  │ │
│  │                                  │                  │ │
│  ├──────────────────────────────────┤  [ SURF! 🏄 ]   │ │
│  │  f'(x) derivative graph         │  [↻ Retry]       │ │
│  │  (shown if toggled on)          │  [Levels]         │ │
│  └──────────────────────────────────┴──────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Desktop changes (≥1024px):**
- Game area max-width: 800px (SVG viewBox widens to `0 0 600 320` for more horizontal space)
- Side panel (220px) appears to the right of the game area, containing: title, level info, stars, HUD readouts, toggle buttons, action buttons
- Derivative graph appears below the main SVG (not in side panel) — it needs horizontal width to be useful
- Controls are split: toggle buttons in side panel, SURF button at bottom of side panel (prominent placement)
- Keyboard shortcuts displayed as subtle badges on buttons (e.g., "Space" on SURF, "D" on f'(x), "R" on retry)

### Layout at 768px (Tablet)

Same as mobile layout but with more breathing room:
- SVG game area: 100% width up to 520px
- Controls bar gets a two-column layout for tool buttons
- Hint banner can be two lines
- Derivative graph: 100px tall (taller than mobile)

---

## 4. Touch Interactions

### Complete Gesture Map

| Element | Gesture | Action | Min Target | Feedback |
|---------|---------|--------|------------|----------|
| **Control point** | Tap + vertical drag | Reshape curve at that point | 52px visible circle + 26px invisible extension = **78px total hit area** | Glow brightens, rail appears, curve reshapes in real-time |
| **Control point** | Release | Snap to nearest notable y-value if within 6px | — | Brief brightness pulse at snap position |
| **SURF button** | Tap | Launch surfer | **64×64px** minimum | Scale 0.92 on press (150ms), spring back, button disappears during ride |
| **Retry button** | Tap | Reset surfer to start, keep terrain | **44×44px** | Scale 0.95, 100ms |
| **Retry button** | Long press (500ms) | Reset terrain AND surfer | **44×44px** | Progress ring fills around button over 500ms, then "pop" animation + terrain resets |
| **f'(x) toggle** | Tap | Show/hide derivative graph | **48×48px** | Button fills with green when active; graph slides in from below (200ms ease-out) |
| **Speed overlay toggle** | Tap | Show/hide speed coloring on curve | **48×48px** | Button fills with gradient (blue→red) when active; curve recolors (150ms crossfade) |
| **Level select button** | Tap | Open level select grid | **44×44px** | Standard button press feedback |
| **Level card** | Tap | Select and load level | **64×64px per card** | Scale 0.95 → spring to 1.0, card highlights |
| **During ride: Tap anywhere** | (CUT for MVP per design spec) | — | — | — |
| **Pre-launch: horizontal swipe** | Swipe left/right on SVG | Pan camera for wide levels (7-8 only) | Full SVG area | Inertial scrolling with spring-back at edges |
| **Gem (not interactive)** | — | — | — | Auto-collected on proximity during ride |
| **Target zone (not interactive)** | — | — | — | Glows brighter as surfer approaches |

### Touch Target Compliance (WCAG 2.5.5 — Enhanced)

All interactive targets meet or exceed **44×44px** minimum (WCAG AA). Primary action targets (SURF, control points) exceed **48px**.

- Control point handles: 52px visible + invisible tap extension to 78px total
- SURF button: 64px tall × full width of button area
- Tool buttons (f'(x), speed, retry): 48×48px each
- Level select cards: 64×64px minimum
- Layout back button: 44px (existing, compliant)

### Pointer Events, Not Mouse Events

Following the existing codebase pattern (all 4 games use `onPointerDown`/`onPointerMove`/`onPointerUp`):
- All drag interactions use `setPointerCapture` for reliable tracking
- SVG coordinate conversion via `getScreenCTM()` with null safety (as established in Plinko QA fix)
- `touch-action: none` on the game SVG to prevent browser scroll/zoom interference
- `touch-action: manipulation` on buttons (inherited from global CSS)

---

## 5. Visual Hierarchy

### Planning Phase — Eye Flow

```
         [1] Control Points (bright cyan, pulsing)
              ↓
    [2] Mountain Curve (gradient, large area)
              ↓
        [3] Gems (gold, floating)
              ↓
    [4] Target Zone (green, pulsing ring)
              ↓
  [5] SURF Button (green gradient, breathing)
              ↓
      [6] Hint Text (subtle, dismissible)
```

**Design rationale:**
1. **Control points FIRST** — they're the only interactive element. Bright cyan (#00e5ff) against the dark background (#0b0f1a) creates a contrast ratio of **10.5:1**. Pulsing glow ring draws the eye.
2. **Curve SECOND** — it's the largest visual element. The ice-blue to sunset-pink gradient (#a8edea → #fed6e3) is soft enough to not compete with control points but striking enough to orient the player.
3. **Gems THIRD** — gold (#ffd700) floating animation creates motion that catches peripheral vision. Positioned ON the curve, so the eye naturally finds them while tracing the mountain.
4. **Target zone FOURTH** — green (#4caf50) pulsing ring, positioned at the end of the curve. The eye follows the curve left-to-right and discovers the target.
5. **SURF button FIFTH** — bottom of screen, green gradient. It's large and obvious but not the first thing you interact with. Players need to plan before launching.
6. **Hint text LAST** — small, muted, at the top. Available if needed but not demanding attention.

### Riding Phase — Eye Flow

```
    [1] Surfer + Tangent Line (white, moving)
              ↓
      [2] Speed Readout (24px, color-coded)
              ↓
    [3] Gem Collection Bursts (gold explosions)
              ↓
     [4] Motion Trail (fading circles)
              ↓
   [5] Timer + Gem Counter (HUD, peripheral)
```

**Design rationale:**
1. **Surfer dominates** — the only moving element (besides particles). White against dark = maximum contrast. The tangent line extends 30px each direction, creating a 60px-wide visual element that's hard to miss.
2. **Speed readout** — large (24px) and color-coded. Positioned top-center during ride. Number smoothly interpolates (no jumps) so it reads like a speedometer.
3. **Gem bursts** — momentary fireworks that reward collection. Gold particles against dark sky.
4. **Motion trail** — fading circles behind the surfer reinforce the speed sensation.
5. **HUD** — peripheral info. Small, consistent position, updated but not distracting.

### Contrast Ratios (WCAG AA Compliance)

| Element | Foreground | Background | Ratio | Passes AA? |
|---------|-----------|------------|-------|------------|
| Game title | `#a8edea` (gradient start) | `#0a0a0f` | **12.2:1** | ✅ |
| Level label | `#e8e8f0` | `#0a0a0f` | **16.5:1** | ✅ |
| Muted text | `#8888a0` | `#0a0a0f` | **5.3:1** | ✅ (AA) |
| Control points | `#00e5ff` | `#0b0f1a` | **10.5:1** | ✅ |
| Gems | `#ffd700` | `#0b0f1a` | **11.9:1** | ✅ |
| Target zone | `#4caf50` | `#0b0f1a` | **6.1:1** | ✅ |
| Surfer/board | `#ffffff` | `#0b0f1a` | **19.4:1** | ✅ |
| f'(x) graph | `#76ff03` | `rgba(0,0,0,0.4)` on `#0b0f1a` | **11.1:1** | ✅ |
| Speed slow | `#4fc3f7` | `#0b0f1a` | **8.3:1** | ✅ |
| Speed fast | `#ff5252` | `#0b0f1a` | **5.0:1** | ✅ (AA) |
| Stars (earned) | `#ffd32a` | `#141420` (surface) | **10.2:1** | ✅ |
| Stars (empty) | `rgba(255,255,255,0.2)` | `#141420` | **1.8:1** | ⚠️ Decorative only, not info-critical |

---

## 6. Microinteractions

### Button Press Feedback

| Button | Press (Active) | Release | Hover (Desktop) |
|--------|---------------|---------|------------------|
| **SURF!** | `scale(0.92)` over 100ms ease-out | Spring back to `scale(1.0)` — overshoot to 1.03 then settle (300ms spring) | `translateY(-2px)`, box-shadow intensifies, subtle glow |
| **Retry** | `scale(0.95)` over 80ms | Snap to `scale(1.0)` over 150ms ease-out | Border brightens, icon rotates 45° |
| **f'(x) toggle** | `scale(0.93)` + background fills to active color over 120ms | Active state: green-tinted background persists. Inactive: background fades over 200ms | Background tint at 30% opacity |
| **Speed overlay** | Same as f'(x) | Active: gradient background persists | Same as f'(x) |
| **Level card** | `scale(0.95)` + border glows cyan over 100ms | Selected card: cyan border + elevated shadow | Subtle lift (`translateY(-2px)`) + border glow |
| **Tool buttons (general)** | `scale(0.95)` over 80ms ease-out | `scale(1.0)` over 120ms ease-out | `border-color: #00e5ff` transition 150ms |

### Control Point Interactions

| State | Visual |
|-------|--------|
| **Default** | 18px cyan circle (#00e5ff), white center dot (4px), pulsing glow ring (22px, opacity 0.3→0.7→0.3, 2s CSS loop) |
| **Hovered** (desktop) | Glow ring brightens to opacity 0.8, cursor: grab |
| **Grabbed** | Glow ring expands to 28px, opacity 0.9, drop-shadow filter activates (cyan blur 3px), cursor: grabbing, vertical rail appears (dashed white line, opacity 0.15→0.5, 150ms fade-in) |
| **Near snap zone** | Snap tick mark brightens (opacity 0.3→0.8), control point subtly "magnetizes" toward snap value (ease-in deceleration) |
| **Snapped** | Brief brightness flash (100ms white overlay at 30%, then fade), tick mark stays bright |
| **Released** | Glow ring contracts to 22px (200ms ease-out), rail fades out (200ms), drop shadow removed |
| **Invalid position** (at range limits) | Glow ring turns red (#ff5252), gentle bounce-back when released at boundary (spring animation, 200ms) |

### Loading / Transition States

| Transition | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| **Level enter** | Curve draws left-to-right (SVG `stroke-dashoffset` animation) | 600ms | ease-out |
| | Control points pop in (scale 0 → 1.1 → 1.0) staggered 100ms apart | 200ms each | spring (overshoot 10%) |
| | SURF button fades in | 200ms | ease-in, 400ms delay after last control point |
| | Gems fade in with float start | 300ms | ease-out, concurrent with control points |
| **Level exit** | All elements fade out simultaneously | 300ms | ease-in |
| **Level select → Game** | Level select slides left (translateX 0 → -100%), game slides in from right (translateX 100% → 0) | 300ms | ease-in-out |
| **Game → Level select** | Reverse of above | 300ms | ease-in-out |
| **Derivative graph show** | Slides up from below game area (translateY 100% → 0), f'(x) curve "draws itself" (stroke-dashoffset) | 200ms slide + 500ms draw | ease-out slide, ease-in-out draw |
| **Derivative graph hide** | Slides down (translateY 0 → 100%) | 200ms | ease-in |
| **Speed overlay on** | Curve color crossfades from gradient to speed-colored segments | 150ms | linear crossfade |
| **Speed overlay off** | Reverse crossfade | 150ms | linear |
| **Result overlay appear** | Delay 300ms after landing, then slide up from bottom with spring easing | 400ms | spring (overshoot 5%) |
| **Star fill-in** | Each star: scale 0 → 1.2 → 1.0, rotate 0° → 15° → 0°, gold particle burst (4 particles) | 300ms per star | spring (overshoot 20%) |
| | Stars stagger: 200ms delay between each star | — | — |

---

## 7. Accessibility

### WCAG AA Compliance Checklist

- [x] **Color contrast**: All text ≥ 4.5:1 against background (verified in Section 5)
- [x] **Color not sole indicator**: Speed is communicated via number readout + color + particle density. Gems use shape (diamond) + color. Stars use filled vs outlined + count text.
- [x] **Touch targets**: All interactive elements ≥ 44px (Section 4)
- [x] **Focus visible**: `:focus-visible` outline (2px solid `--color-accent`, 2px offset) — inherited from global CSS
- [x] **No seizure risk**: No flashing faster than 3Hz. Particle bursts are brief (400ms) and localized.

### ARIA Labels

```html
<!-- Control points -->
<circle aria-label="Control point 1: drag up or down to reshape the mountain" role="slider"
        aria-valuemin="-3" aria-valuemax="3" aria-valuenow="1.5"
        aria-orientation="vertical" />

<!-- SURF button -->
<button aria-label="Launch the surfer">SURF!</button>

<!-- Toggle buttons -->
<button aria-label="Toggle derivative graph" aria-pressed="false">f'(x)</button>
<button aria-label="Toggle speed overlay" aria-pressed="false">Speed View</button>

<!-- Retry -->
<button aria-label="Retry level">↻</button>

<!-- Gems (decorative during ride) -->
<polygon aria-hidden="true" />

<!-- Speed readout (live region) -->
<div role="status" aria-live="polite" aria-label="Current speed">
  Speed: 1.4
</div>

<!-- Level select -->
<button aria-label="Level 3: Roller Coaster. Best: 2 stars">
  Level 3 ⭐⭐☆
</button>

<!-- Star rating -->
<span role="img" aria-label="2 out of 3 stars earned">⭐⭐☆</span>
```

### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| **Tab** | Move focus between control points → SURF → tool buttons → level select | Planning phase |
| **Arrow Up/Down** | Adjust focused control point value (step: 0.1 units) | When control point is focused |
| **Shift + Arrow Up/Down** | Adjust control point value (step: 0.5 units, coarse) | When control point is focused |
| **Space** | Launch surfer (planning phase) / Pause & resume (CUT for MVP) | Any |
| **D** | Toggle derivative graph | Any |
| **S** | Toggle speed overlay | Any |
| **R** | Retry level (reset surfer, keep terrain) | Any |
| **Shift + R** | Reset terrain and surfer | Planning phase |
| **N** | Next level (when available) | Result phase |
| **Escape** | Open level select / Close overlay | Any |
| **1-8** | Quick-jump to level N | Level select phase |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable particles */
  .particle { display: none; }

  /* Disable screen shake */
  .gameContainer { animation: none !important; }

  /* Reduce animation durations by 80% */
  .controlPoint { animation-duration: 0.4s; } /* Was 2s pulse */
  .gemFloat { animation: none; } /* Remove floating */

  /* Keep surfer movement but remove trail */
  .motionTrail { display: none; }

  /* Simplify transitions */
  * {
    transition-duration: 0.05s !important;
  }

  /* Keep: surfer position updates (functional, not decorative) */
  /* Keep: tangent line rotation (educational — shows derivative) */
  /* Keep: curve reshape on drag (interactive feedback, essential) */
  /* Keep: score display (informational) */
}
```

### Focus Management

- On level load, focus moves to the first control point (or SURF! button if Level 1 has no control points)
- On phase transition to Success, focus moves to "Next Level" button
- On phase transition to Failed, focus moves to "Retry" button
- Tab trap within score overlay when open — Tab cycles through Retry / Next / Levels only
- `focus-visible` outline: 2px solid `var(--color-accent)` with 2px offset (matches global `:focus-visible` style from `src/index.css`)
- Focus ring uses existing design token — no custom focus styles needed

### Screen Reader Experience

For screen reader users, the game provides a text-based alternative:
- Level description read aloud on entry via page title update (`document.title = "Slope Surfer - Level 2: The Hill"`)
- Control point values announced as they change (aria-live region, debounced to 200ms to avoid flooding)
- Speed readout announced periodically during ride (polite, every 2s)
- Gem collection announced ("Gem collected! 2 of 4")
- Level result announced ("Level complete! 2 stars. Retry or next level.")
- Decorative SVG elements (stars, particles, grid lines) use `aria-hidden="true"`

---

## 8. Onboarding — How Level 1 Teaches Without a Tutorial Popup

### Level 1: "First Descent" — Zero-Friction Learning

**No modal popups. No "Got it!" buttons. No blocking UI.** The player learns through observation.

#### Step 1: The Curve Draws Itself (0–600ms)

The mountain curve draws itself from left to right (stroke-dashoffset animation). This establishes: "this is the playing field." The surfer appears at the start point with a gentle scale-in animation.

**What the player perceives:** "OK, there's a mountain/slope."

#### Step 2: Contextual Labels Float In (600ms–1200ms)

Three small, semi-transparent labels fade in near key elements:
- Near the surfer: **"Your surfer"** (10px, white, opacity 0.5)
- Near the surfer's board: **"Tangent line → matches slope"** (10px, white, opacity 0.4)
- Near the first gem: **"Collect!"** (10px, gold, opacity 0.5)

Labels are part of the SVG (not overlays). They don't block interaction. They fade to 0 opacity over 4 seconds after the ride starts. **They never reappear.**

**What the player perceives:** "The board thing follows the slope. I should collect those diamond things."

#### Step 3: SURF Button Breathes (1200ms+)

The SURF button appears with a "breathing" animation: scale oscillates 1.0 → 1.02 → 1.0 over 2s. This is the only pulsing CTA. The player taps it.

**What the player perceives:** "I should press this."

#### Step 4: The Ride (Auto-Success)

The surfer rides down the simple slope. Speed is moderate and constant (simple linear-ish curve). The tangent line rotates gently. Three gems are auto-collected (they're on the path). Gold particle bursts reward each collection.

**What the player observes (without being told):**
- The board matches the slope angle → "Oh, it follows the curve!"
- Speed doesn't change much → "It goes at a steady pace on this slope."
- Gems burst satisfyingly → "Collecting gems is fun."

#### Step 5: Auto-Win

The surfer reaches the target zone. Landing celebration plays. 3 stars awarded automatically.

**The insight planted (not stated):** "The surfer's angle changes with the mountain. I wonder what happens with a curvier mountain..."

### Level 2: "The Hill" — First Interaction

The player now sees **one control point** (bright cyan, pulsing). The curve has a hill.

**Discovery moment:** The player drags the control point and watches the hill reshape in real-time. The speed overlay is suggested (hint: "Try the speed view 🏔️").

**The critical teaching beat:** The surfer slows to near-zero at the hilltop. The speed readout drops. The tangent line flattens. If the player toggled the derivative graph, they see f'(x) cross zero at the peak. This is the "aha" moment — steep = fast, flat = slow.

### Level 3: First Real Challenge

Two control points. The player must ensure the surfer builds enough speed downhill to clear the second hill. This is where the game transitions from "watching" to "planning."

**No explicit tutorial needed.** The mechanics are now internalized:
1. I can reshape the curve → drag control points
2. Steep = fast → make downhill steeper before uphills
3. Flat = slow → peaks are danger zones
4. Collect gems + reach target → win

---

## 9. Error States & Recovery

### During Planning Phase

| Error | Detection | Response | Recovery |
|-------|-----------|----------|----------|
| **Control point dragged to boundary** | Position === min or max y-value | Rail boundary marker flashes red (100ms), control point stops at limit with subtle bounce-back (80ms spring) | Player releases and repositions |
| **All control points at same height** (flat line) | All y-values within 0.2 units | Hint text changes to: "The mountain is too flat! The surfer needs slopes to build speed." Color: amber (#ffb74d) | Player drags points to create slope |
| **Impossible configuration** (surfer can't reach target) | N/A — not pre-validated | Discovered during ride (surfer stops). Becomes a "failed" state. | Retry with terrain preserved |

### During Ride Phase

| Error | Detection | Response | Recovery |
|-------|-----------|----------|----------|
| **Surfer stops (zero momentum)** | `surferSpeed < 0.5` for > 1.5 seconds | After 1.5s: "Ran out of momentum" text fades in (300ms) above surfer, red tint. After 2.5s: retry prompt appears with gentle pulse animation. | Tap "Retry" (terrain preserved) or "Reshape" (resets to planning with current terrain) |
| **Surfer passes target** (edge case on wide levels) | `surferX > targetX + targetWidth` | "Missed the landing!" text. Same retry flow. | Retry |
| **Animation frame drop** | `dt > 50ms` (cap already in place) | Cap dt at 50ms as per existing pattern in all 4 games. No visible glitch. | Automatic |

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| **Browser resize during ride** | SVG viewBox handles this automatically — the SVG scales to new container width. No pause needed. Tested pattern: all existing games use viewBox and handle resize gracefully. |
| **Rapid tap on SURF** | Ignore taps when `phase !== 'planning'`. Button is hidden during ride. |
| **Double-tap on control point** | `setPointerCapture` prevents multiple simultaneous drags. Only one point draggable at a time. |
| **Device rotation mid-game** | SVG rescales. Controls reflow. No state lost. Game continues in current phase. |
| **JS error during animation** | `try/catch` in animation loop. On error: cancel animation frame, set phase to 'failed', show retry. |
| **Zero gems on a level** | Gem counter hidden. Stars based only on reaching target + time. |

### Failure Tone: Encouraging, Never Punishing

Critical UX principle: **Failure is a learning moment, not a punishment.**

- No explosion animations on failure (reserved for other games like Vector Voyager collision)
- The surfer simply stops. Visually clear why (flat terrain, not enough momentum)
- Retry button is immediately available — even before the failure message finishes animating
- Terrain shape is PRESERVED on retry — the player's work isn't lost
- "Reshape" option available to go back to planning with current terrain
- Hint text updates to give a subtle nudge: "Try making the slopes steeper!" / "The surfer needs more downhill before that climb."

---

## 10. Consistency with Existing Games

### Shared Patterns (Must Match)

| Pattern | Existing Implementation | Slope Surfer Implementation |
|---------|------------------------|---------------------------|
| **Navigation** | Layout component with sticky header, "← All Games" back link | Same Layout component wrapping Slope Surfer page |
| **Page structure** | `.page` flex column, centered, max-width (520-540px) | `.page` flex column, centered, max-width 540px mobile, 800px desktop |
| **Title style** | Gradient text (`background-clip: text`), unique gradient per game | Gradient: ice-blue to sunset-pink (#a8edea → #fed6e3), matching curve colors |
| **Level label** | `"Level N: Name"` below title, 0.85rem, `--color-text` | Same format: "Level 2: The Hill" |
| **Stars** | `★★☆` using Unicode ★/☆, filled gold (#ffd32a), empty rgba white 0.2 | Same Unicode stars, same colors |
| **Level select** | Grid of buttons with level number, name, stars. Collapsible. | Same grid pattern. 4 columns mobile (2 rows for 8 levels), 8 columns desktop. |
| **Level button style** | `--color-surface` bg, `--color-border` border, 1.5px, 10px radius, min-height 64px | Same styles, reusing existing CSS patterns |
| **SURF button** | Matches Plinko "DROP" and Vector Voyager "LAUNCH" pattern: gradient, 48px+ height, centered, scale-on-press | Same pattern. Green gradient (#4caf50 → #388e3c). 64px tall. |
| **Hint banner** | Plinko: colored box with 8px radius, subtle background. VV: italic colored text. | Match Plinko pattern: rounded box, 0.75rem, `rgba(76,175,80,0.08)` background, `rgba(76,175,80,0.15)` border. Green theme to match game's color. |
| **Keyboard shortcuts** | Space (primary action), R (reset), level-specific keys | Space=launch, R=retry, D=derivative, S=speed, N=next |
| **SVG viewBox** | All games use viewBox for responsive scaling | Same pattern: `viewBox="0 0 400 260"` |
| **Dark theme** | `#0a0a0f` page bg, `#0d1117` SVG bg, `#141420` surface | SVG bg: `#0b0f1a` (sky top — slightly warmer than other games for the night sky feel, but compatible) |
| **CSS modules** | `.module.css` files per component, mobile-first, breakpoints at 480/768/1024 | Same file structure and breakpoint system |
| **Design tokens** | `var(--color-text)`, `var(--space-md)`, `var(--transition-fast)`, etc. | All standard tokens used. No custom variables that could be standard ones. |
| **Hover gating** | `@media (hover: hover)` wrapping all hover states | Same pattern for all desktop hover enhancements |
| **Active states** | `transform: scale(0.95)` on `:active` for buttons | Same scale-on-active pattern |
| **Animation cleanup** | `cancelAnimationFrame` in `useEffect` return, `isMountedRef` pattern | Same cleanup pattern |
| **State management** | `useReducer` for complex state (Trig, Pinball), `useState` for simpler (Plinko, VV) | `useReducer` — game has 6 phases and complex state interactions |

### Unique to Slope Surfer

While maintaining consistency, Slope Surfer has visual identity through:
- **Night sky background** (#0b0f1a → #1a0f2e gradient) — unique among the games
- **Ice-blue to sunset-pink curve** — distinct from Plinko's cyan, VV's space blue, Pinball's geometric white, Trig's multi-color
- **Green accent for actions** (#4caf50) — unique. Other games use cyan (#00bcd4) or blue (#4fc3f7). Green here represents "nature/mountain/go"
- **Gold gems** (#ffd700) — the only game with collectible objects
- **Derivative graph** — unique educational feature

---

## 11. Animation Timing — Comprehensive Reference

### Core Gameplay Animations

| Animation | Easing | Duration | Stagger | Notes |
|-----------|--------|----------|---------|-------|
| **Control point drag** | None (1:1 tracking) | Instant | — | Must feel direct. No lag. |
| **Curve reshape** | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out) | 50ms | — | Fast but smooth response to control point changes |
| **Surfer movement** | Linear (speed = \|f'(x)\|) | Continuous | — | Speed IS the derivative — no artificial easing |
| **Tangent line rotation** | Linear | Continuous | — | Directly coupled to f'(x). Must feel physically accurate. |
| **Speed readout** | Lerp (interpolated) | 50ms between values | — | Smooth number transitions, never jumps |

### Entry/Exit Animations

| Animation | Easing | Duration | Stagger | Notes |
|-----------|--------|----------|---------|-------|
| **Curve draw-in** | `ease-out` | 600ms | — | `stroke-dashoffset` from full length to 0 |
| **Control point pop-in** | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot) | 200ms | 100ms per point | Scale: 0 → 1.1 → 1.0. Left-to-right order. |
| **SURF button fade-in** | `ease-in` | 200ms | 400ms after last control point | Opacity: 0 → 1 |
| **Gem fade-in** | `ease-out` | 300ms | Concurrent with control points | Opacity 0→1 + float animation begins |
| **Level exit** | `ease-in` | 300ms | — | All elements opacity 1→0 simultaneously |
| **Level select transition** | `ease-in-out` | 300ms | — | Slide left/right |
| **Result overlay slide up** | `cubic-bezier(0.34, 1.2, 0.64, 1)` (spring, slight overshoot) | 400ms | 300ms delay after landing | `translateY(100%) → translateY(0)` |

### Reward Animations

| Animation | Easing | Duration | Stagger | Notes |
|-----------|--------|----------|---------|-------|
| **Gem collect burst** | `ease-out` (deceleration) | 400ms | — | 6 particles, radial, gold. Initial velocity ~200px/s, decelerating. |
| **Gem "+100" text** | `ease-out` | 250ms | 50ms after burst | Rise 30px, fade 1.0→0 |
| **Board flash (gold)** | Linear fade | 100ms bright, 200ms fade back | — | Tangent line: white → gold → white |
| **Landing celebration** | `ease-out` (burst), `spring` (flag wave) | 400ms particles, 600ms flag | — | 16 particles + flag oscillation (3 cycles) |
| **Star fill-in** | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) | 300ms per star | 200ms between stars | Scale: 0 → 1.2 → 1.0, rotate: 0° → 15° → 0° |
| **Star particle burst** | `ease-out` | 300ms | Concurrent with star scale | 4 gold particles per star, small radial burst |
| **Speed flash ring** (landing) | Linear expand + fade | 300ms | — | radius 0→100px, opacity 0.5→0, stroke white 2px |
| **Combo text** | `spring` (overshoot 30%) | 400ms | — | Scale 0→1.3→1.0. Larger text for higher combos. |

### Particle System Timing

| Particle Type | Count | Lifetime | Size (start→end) | Velocity | Gravity |
|--------------|-------|----------|-------------------|----------|---------|
| **Gem burst** | 6 | 400ms | r=3→0 | 200px/s radial | None |
| **Landing burst** | 16 | 500ms | r=4→0 | 150-300px/s radial (random) | 200px/s² downward |
| **Combo burst** | 8 per gem | 400ms | r=3→0 | 250px/s radial | None |
| **Speed trail** | 3-4 per 100ms | 300ms | r=2→0 | 0 (shed behind surfer) | None |
| **Star burst** | 4 per star | 300ms | r=2→0 | 100px/s radial | None |

**Max simultaneous particles: 40** (matching existing codebase cap in Vector Voyager and Plinko).

### Screen Shake Timing

| Trigger | Offset | Duration | Decay | Direction |
|---------|--------|----------|-------|-----------|
| **Gem collect** | 1px | 60ms | Instant | Perpendicular to surfer travel |
| **Combo x3+** | 2px | 80ms | Linear | Random direction |
| **Landing impact** | 3px | 120ms | Dampened sine (exponential decay, τ=40ms) | Vertical |

Implementation: CSS `transform: translate(shakeX, shakeY)` on main game `<g>` container. Updated via `requestAnimationFrame`. In `prefers-reduced-motion`: all shake disabled.

---

## 12. Color Palette — Complete Reference

### Primary Game Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Sky (top) | Deep Navy | `#0b0f1a` | SVG background gradient top |
| Sky (bottom) | Dark Purple | `#1a0f2e` | SVG background gradient bottom |
| Curve (left) | Ice Blue | `#a8edea` | Mountain curve start, gradient |
| Curve (right) | Sunset Pink | `#fed6e3` | Mountain curve end, gradient |
| Curve fill | Subtle Blue | `rgba(168, 237, 234, 0.08)` | Mountain body below curve |
| Control point | Bright Cyan | `#00e5ff` | Handles, rails, grabbed state |
| Control glow | Cyan dim | `rgba(0, 229, 255, 0.3)` | Pulsing ring default |
| Surfer/board | White | `#ffffff` | Tangent line, surfer body |
| Speed glow (slow) | Cool Blue | `#4fc3f7` | Speed aura at low speed |
| Speed glow (fast) | Hot Orange | `#ffb74d` | Speed aura at high speed |
| Speed glow (extreme) | Red | `#ff5252` | Speed aura at max |
| Gems | Gold | `#ffd700` | Diamond collectibles |
| Gem stroke | Dark Gold | `#b8860b` | Diamond outline |
| Target zone | Green | `#4caf50` | Flag, landing zone |
| Target glow | Bright Green | `rgba(76, 175, 80, 0.3)` | Pulse ring around target |

### Derivative Graph Colors

| Role | Hex | Usage |
|------|-----|-------|
| f'(x) curve | `#76ff03` | Derivative trace |
| f'(x) marker | `#76ff03` | Current position dot on f'(x) |
| f'(x) background | `rgba(0, 0, 0, 0.4)` | Graph area background |
| Zero line | `rgba(255, 255, 255, 0.3)` | f'(x) = 0 reference |
| Connection line | `rgba(118, 255, 3, 0.2)` | Vertical dashed line linking curves |

### Speed Overlay Colors

| \|f'(x)\| Range | Color | Hex | Meaning |
|----------------|-------|-----|---------|
| < 0.3 | Cool Blue | `#4fc3f7` | Slow — surfer crawls |
| 0.3 – 1.0 | White | `#ffffff` | Medium — comfortable pace |
| 1.0 – 2.0 | Hot Orange | `#ffb74d` | Fast — exhilarating |
| > 2.0 | Red | `#ff5252` | Extreme — approaching wipeout danger |

### UI Chrome Colors (from existing design system)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0a0a0f` | Page background |
| `--color-surface` | `#141420` | Cards, panels |
| `--color-surface-hover` | `#1c1c30` | Hovered surfaces |
| `--color-border` | `#2a2a3e` | Borders |
| `--color-text` | `#e8e8f0` | Primary text |
| `--color-text-muted` | `#8888a0` | Secondary text |
| `--color-accent` | `#7c5cbf` | Focus rings, links |
| Stars (earned) | `#ffd32a` | Star fill |
| Stars (empty) | `rgba(255, 255, 255, 0.2)` | Star outline |

### Gradient Definitions for SVG

```xml
<!-- Sky background -->
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#0b0f1a" />
  <stop offset="100%" stop-color="#1a0f2e" />
</linearGradient>

<!-- Mountain curve stroke -->
<linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0%" stop-color="#a8edea" />
  <stop offset="100%" stop-color="#fed6e3" />
</linearGradient>

<!-- Mountain fill (below curve) -->
<linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="rgba(168, 237, 234, 0.08)" />
  <stop offset="100%" stop-color="transparent" />
</linearGradient>

<!-- Control point glow -->
<radialGradient id="cpGlow">
  <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.6" />
  <stop offset="100%" stop-color="#00e5ff" stop-opacity="0" />
</radialGradient>

<!-- Speed glow (dynamic, generated in code) -->
<radialGradient id="speedGlow">
  <stop offset="0%" stop-color="currentSpeedColor" stop-opacity="0.8" />
  <stop offset="100%" stop-color="currentSpeedColor" stop-opacity="0" />
</radialGradient>

<!-- SURF button -->
<linearGradient id="surfBtn" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#4caf50" />
  <stop offset="100%" stop-color="#388e3c" />
</linearGradient>
```

---

## 13. Responsive Breakpoint Details

### 375px (iPhone SE / Small Phone)

| Element | Size/Position |
|---------|--------------|
| SVG viewBox | `0 0 400 260` |
| SVG rendered size | 343 × 223px |
| Control point visible radius | 18px (52px with tap extension) |
| SURF button | Full width (minus 32px margin), 56px tall |
| Tool buttons | Row of 3, each 44×44px |
| Title | 1.1rem |
| Level label | 0.8rem |
| Gem counter | 0.75rem |
| Hint banner | Single line, 0.7rem, may truncate with "..." |
| f'(x) graph height | 70px |
| Level select grid | 4 columns, 2 rows |
| Derivative graph | Below SVG, full width |

### 414px (Standard iPhone)

Same as 375px but with slightly more horizontal padding. SVG renders 382×248px.

### 480px (Large Phone / Small Tablet)

| Change from 375px |
|-------------------|
| Title → 1.25rem |
| Tool buttons → Row of 4 (add "Levels" button to row) |
| Hint banner → Two lines allowed |
| f'(x) graph height → 80px |
| SURF button width → 200px centered (not full width) |
| Page padding → `var(--space-md) var(--space-lg)` |

### 768px (Tablet)

| Change from 480px |
|-------------------|
| SVG viewBox → `0 0 500 300` (slightly wider aspect) |
| SVG max-width → 520px |
| Title → 1.5rem |
| Tool buttons → Two-column layout |
| f'(x) graph height → 100px |
| Level select grid → 8 columns, 1 row |
| Page padding → `var(--space-lg) var(--space-xl)` |

### 1024px+ (Desktop)

| Change from 768px |
|-------------------|
| **Layout shifts to side panel** |
| SVG viewBox → `0 0 600 320` (wider for more terrain) |
| SVG max-width → 600px |
| Side panel → 220px, right of SVG |
| Side panel contains: title, level info, HUD, toggles, SURF, retry, levels button |
| Title → 1.75rem |
| f'(x) graph → Below SVG, full width of SVG area |
| Keyboard shortcut badges → Visible on buttons |
| Hover states → Active (gated behind `@media (hover: hover)`) |

### 1280px+ (Large Desktop)

| Change from 1024px |
|-------------------|
| Max content width → 900px (600px SVG + 220px panel + gap) |
| Centered in page with generous margins |
| Stars in level select → Slightly larger (0.9rem vs 0.7rem) |

---

## 14. Performance Budget

Following the patterns established across all 4 existing games:

| Metric | Target | Strategy |
|--------|--------|----------|
| **SVG elements in scene** | < 60 at any time | Memoize static elements (stars, grid). Cap particles at 40. Gems max 6. |
| **Re-renders per frame** | Minimal | Use `refs` for animation loop values (timeRef, speedRef), dispatch only for phase changes. Same pattern as Plinko. |
| **Animation loop** | 60fps | `requestAnimationFrame` with dt cap at 50ms. Speed multiplier via ref. |
| **Curve computation** | < 2ms per update | Pre-compute 100 sample points. Cache in useMemo. Recompute only when control points change. |
| **Derivative computation** | < 1ms | Central difference (numerical) at 100 points. Cached. Recomputed with curve. |
| **Particle system** | 40 max | Array with lifetime tracking. Remove dead particles each frame. |
| **Memory** | No unbounded arrays | Particle array capped. Trail capped at 12 elements. No growing state. |
| **Cleanup** | No leaks | `cancelAnimationFrame` in useEffect return. `isMountedRef` check in loop. Same as all existing games. |

---

## 15. Implementation Checklist — CSS Module Structure

Following the exact file naming and structure conventions from the existing games:

```
src/games/slopeSurfer/
├── SlopeSurfer.module.css      ← Main page layout (matches PlinkoGame.module.css pattern)
└── components/
    ├── Controls.module.css      ← Button styles
    ├── LevelSelect.module.css   ← Level grid styles
    └── LevelComplete.module.css ← Overlay styles
```

### CSS Module Conventions (From Existing Codebase)

```css
/* 1. Mobile-first base styles */
.element { /* mobile default */ }

/* 2. Active states (touch) */
.element:active { transform: scale(0.95); }

/* 3. Desktop hover states ALWAYS behind media query */
@media (hover: hover) {
  .element:hover { /* desktop hover */ }
}

/* 4. Breakpoints: 480px → 768px → 1024px */
@media (min-width: 480px) { /* large phone */ }
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }

/* 5. Use design tokens */
padding: var(--space-md);
transition: transform var(--transition-fast);
min-height: var(--tap-target-min);
font-family: var(--font-mono);
color: var(--color-text-muted);
```

---

## Appendix A: SVG Filter Definitions

These SVG filters are defined once in a `<defs>` block and referenced by `filter="url(#name)"`:

```xml
<!-- Control point glow when grabbed -->
<filter id="controlGlow">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
  <feFlood flood-color="#00e5ff" flood-opacity="0.6" result="color"/>
  <feComposite in="color" in2="blur" operator="in" result="glow"/>
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<!-- Gem golden glow -->
<filter id="gemGlow">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
  <feFlood flood-color="#ffd700" flood-opacity="0.5" result="color"/>
  <feComposite in="color" in2="blur" operator="in" result="glow"/>
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<!-- Speed aura behind surfer -->
<filter id="speedGlow">
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
  <feFlood flood-color="currentColor" flood-opacity="0.4" result="color"/>
  <feComposite in="color" in2="blur" operator="in" result="glow"/>
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

## Appendix B: On-Screen Element Count Per Phase

To stay within the 60-element SVG budget:

| Phase | Static Elements | Dynamic Elements | Total (max) |
|-------|----------------|-----------------|-------------|
| Planning | Sky rect (1) + stars (30) + grid (10) + curve path (2) + fill (1) = 44 | Control points (3×3=9) + gems (6×2=12) + target (3) + surfer (3) = 27 | ~71 — **optimize**: skip grid when not toggled, reduce stars to 20 |
| Planning (optimized) | Sky (1) + stars (20) + curve (2) + fill (1) = 24 | Control points (9) + gems (12) + target (3) + surfer (3) = 27 | **51** ✅ |
| Riding | Sky (1) + stars (20) + curve (2) + fill (1) = 24 | Surfer (3) + trail (12) + gems (12) + target (3) + particles (up to 40) + speed readout (1) = 71 | ~95 — **optimize**: reduce trail to 8, particles realistically peak at ~20 |
| Riding (optimized) | 24 | Surfer (3) + trail (8) + gems (6) + target (3) + particles (20) + HUD (3) = 43 | **67** — acceptable with particle cap |

**Key optimization strategies:**
- Stars: Generate 20 (not 40) — memoized via `useMemo`
- Grid lines: Only render when speed overlay is active
- Gems: `memo` wrap, remove from DOM after collection (not just hidden)
- Trail: Cap at 8 circles (not 12)
- Particles: Hard cap at 40, FIFO removal

---

## Summary

Slope Surfer's UX is designed around one core principle: **the derivative should be felt, not calculated**. Every interaction — from the 1:1 responsiveness of dragging control points, to the surfer's speed changing with slope, to the satisfying burst of collecting a gem at the perfect moment — reinforces the mathematical concept through physical intuition.

The game fits naturally alongside the existing four games. It uses the same Layout, the same level select pattern, the same star system, the same dark theme, the same mobile-first responsive approach. But it establishes its own visual identity through its night-sky gradient, ice-pink mountain curve, and gold gem collectibles.

Most importantly: Level 1 teaches without a single tutorial popup. The player watches, learns, and by Level 3, they're manipulating derivatives with confidence — and they might not even know they're doing calculus.
