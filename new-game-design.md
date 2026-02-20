# Slope Surfer — Game Design Specification

> **Game Designer:** Expert Game Designer
> **Math Topic:** Introduction to Calculus — Derivatives, Slope, Tangent Lines, Rate of Change
> **Design Principle:** The derivative isn't a formula you calculate — it's a wave you RIDE.

---

## 1. Game Concept + Math It Teaches

### Elevator Pitch
*"Ride a tangent line down a mountain. Your board always follows the slope — steep curves send you flying, flat sections slow you to a crawl. Master the shape of the mountain to nail the perfect landing."*

### The Core Idea
The player is a surfer on a mathematical curve. The surfer's board IS the tangent line at the current point. The surfer moves along the curve and their **speed is determined by the absolute value of the derivative** at their current position. Steep parts = fast. Flat parts = slow. The player doesn't control speed directly — they control the **shape of upcoming terrain** by dragging control points, which changes the derivative, which changes their speed.

The game makes the relationship between a function and its derivative **visceral**. Students feel f'(x) in their gut before they ever see a formula.

### Math Concepts Taught (By Exposure, Not Lecture)
1. **Slope of a curve at a point** — the surfer's board angle IS the tangent line, rotating in real-time
2. **Derivative = rate of change** — surfer speed is visibly proportional to steepness
3. **Sign of the derivative** — going downhill (negative slope) vs uphill (positive slope) changes the surfer's direction/momentum
4. **Local maxima and minima** — the surfer slows to near-zero at peaks and valleys (f'(x) ≈ 0)
5. **Inflection points** — where the curve changes from "cupping up" to "cupping down," the surfer feels a shift
6. **Relationship between f(x) and f'(x)** — a live derivative graph below the main curve makes the connection explicit
7. **Steepness vs height** — the critical insight: being HIGH on the curve doesn't mean going fast. Being on a STEEP part means going fast. This is the #1 misconception about derivatives, and the game destroys it through play.

### Why This Concept?
The original "Derivative Dash" proposal was rejected because it tried to do too much — real-time terrain editing + physics simulation + synchronized derivative graph. Slope Surfer solves this by:
- **Pre-built terrain** with a few adjustable control points (not full terrain editing)
- **No separate physics simulation** — the surfer's position IS the curve, speed IS the derivative
- **The derivative graph is a reward, not a requirement** — it appears as an optional overlay that students can toggle
- **One clear goal per level** — collect gems, hit a target zone, or achieve a target speed

---

## 2. Core Loop (Moment-to-Moment Gameplay)

### The 30-Second Loop
1. **Survey the mountain** (2-3s): Player sees the curve, the gems/targets, and the draggable control points. Terrain scrolls into view with a smooth pan.
2. **Shape the terrain** (5-15s): Player drags 1-3 control points to reshape the curve. A preview ghost-surfer shows the approximate path. Speed indicators (color-coded sections) update in real-time.
3. **Launch** (instant): Tap the big "SURF!" button. The surfer starts moving along the curve from left to right.
4. **Watch & feel the ride** (5-10s): The surfer accelerates on steep sections, slows at flat sections, and collects gems along the way. The camera follows smoothly. The tangent line board rotates with the slope. Speed particles trail behind.
5. **Score & iterate** (2-3s): Results appear — gems collected, time, landing accuracy. Stars awarded. "Try Again" or "Next Level."

### What Makes This Loop Satisfying
- **Planning → Execution → Payoff**: Same structure as Vector Voyager's "plan then launch" but with continuous feedback during the ride
- **The speed sensation**: When the surfer hits a steep section, particles burst, motion blur kicks in, and the camera zooms out slightly — it FEELS fast
- **The slow-mo moments**: At peaks (f'(x) ≈ 0), the surfer slows dramatically, the board levels out, and there's a tension beat before the next descent
- **The tangent line rotating**: Watching the board smoothly rotate as the surfer traverses the curve is hypnotic and directly teaches the concept

---

## 3. Detailed Controls

### Mobile Controls (Primary)

| Action | Gesture | Details |
|--------|---------|---------|
| Drag control point | Touch + drag | Large 52px circular handle. Vertical drag changes the y-value of the control point. Curve reshapes in real-time with smooth cubic interpolation. Haptic-like visual pulse on grab. |
| Survey terrain | Swipe left/right | Pans the camera to preview the full mountain. Only available before launch. Spring-back if released past bounds. |
| Launch surfer | Tap "SURF!" button | 64px tall, bottom-center. Gradient fill (green → teal). Subtle breathing animation when ready. |
| Toggle derivative graph | Tap "f'(x)" button | 48px, bottom-right. Shows/hides the derivative trace below the main curve. |
| Toggle speed overlay | Tap "🏔️" button | 48px, bottom-right stack. Color-codes the curve by steepness (red=fast, blue=slow, white=medium). |
| Retry level | Tap "↻" button | 44px, top-right. Resets surfer to start with current terrain shape preserved. |
| Reset terrain | Long-press "↻" | 500ms hold resets control points to default positions. Brief rumble animation. |
| Pause mid-ride | Tap anywhere during ride | Pauses the animation. Tap again to resume. Shows current speed and slope readout. |

### Desktop Controls

| Action | Input | Details |
|--------|-------|---------|
| Drag control point | Click + drag | Same as mobile but with mouse |
| Survey terrain | Arrow keys or scroll | Horizontal scroll pans the view |
| Launch surfer | Click "SURF!" or press Space | Keyboard shortcut |
| Toggle derivative graph | Click button or press D | |
| Toggle speed overlay | Click button or press S | |
| Retry | Click or press R | |
| Reset terrain | Shift+R | |
| Pause | Press Space during ride | |

### Control Point Behavior
- Control points are **vertically constrained** — player can only drag up/down, not left/right. This prevents them from breaking the curve's x-monotonicity.
- Each control point has a **valid range** (min-y to max-y) shown as a subtle vertical track/rail.
- When dragging, the curve updates in real-time using **cubic Hermite interpolation** between fixed endpoints and the control point(s).
- A **snap zone** at notable y-values (0, ±1, ±2, etc.) provides tactile feedback with a slight resistance.
- Control points glow brighter when within snap range.

---

## 4. Visual Design (Every SVG Element)

### Overall Layout

**Mobile (Portrait):**
```
┌────────────────────┐
│  Level 5  ⭐⭐☆   │  ← Header (40px)
│  ◇ 2/4  ⏱ --.-s  │  ← Gem count + timer
├────────────────────┤
│                    │
│   ╱╲    ◇         │  ← Main game area (65% of height)
│  ╱  ╲  ╱╲  ◇     │     Mountain curve with gems
│ ╱    ╲╱  ╲╱╲     │     Control points visible as circles
│╱   ●       ╲  🏁  │     Surfer on curve, target flag
│              ╲    │
├────────────────────┤
│ f'(x): ═══════    │  ← Derivative graph (optional, 15%)
├────────────────────┤
│ [↻] [f'(x)] [🏔️] │  ← Tool buttons
│                    │
│     [ SURF! 🏄 ]   │  ← Launch button (64px tall)
└────────────────────┘
```

**Desktop (Landscape):**
```
┌──────────────────────────────────────────┐
│  Slope Surfer  │  Level 5  ⭐⭐☆  │ ◇ 2/4 │
├──────────────────────────────────────────┤
│                                          │
│      ╱╲         ◇                        │
│     ╱  ╲   ╱╲       ◇                   │
│    ╱    ╲ ╱  ╲  ╱╲                      │
│   ╱  ●   ╲    ╲╱  ╲     🏁              │
│  ╱         ╲       ╲                    │
│                       ╲                  │
├──────────────────────────────────────────┤
│  f'(x) graph (toggle)                   │
├──────────────────────────────────────────┤
│  [↻ Reset] [f'(x)] [🏔️ Speed]  [SURF!] │
└──────────────────────────────────────────┘
```

### SVG Elements — Complete Inventory

#### Background
- **Sky gradient**: `<linearGradient>` from deep navy (#0b0f1a) at top to dark purple (#1a0f2e) at bottom. Fills the full viewBox `<rect>`.
- **Stars**: 25-40 `<circle>` elements, r=0.5-1.5px, random positions in upper 60% of viewport, opacity 0.2-0.7. Static. Generated via `useMemo`.
- **Ambient glow**: `<radialGradient>` centered behind the mountain peak — very subtle purple/blue glow (opacity 0.08) that gives depth.

#### The Mountain / Function Curve
- **Curve path**: `<path>` using cubic Bezier commands (`C`). Stroke: 3px, color gradient from ice-blue (#a8edea) at left to sunset-pink (#fed6e3) at right via `<linearGradient>`. This gradient makes the curve feel alive and premium.
- **Curve fill below**: Same `<path>` but closed at the bottom with a `<linearGradient>` fill from very subtle blue (rgba 168, 237, 234, 0.08) to transparent. Creates a subtle "mountain body" effect.
- **Grid lines** (optional toggle): Horizontal `<line>` elements at y = -2, -1, 0, 1, 2 with very low opacity (#333, 0.15). Vertical grid every ~50px. Helps spatial reasoning.

#### Control Points
- **Handle circle**: `<circle>` r=18px (visible), r=26px (invisible tap target on top). Fill: bright cyan (#00e5ff) with a white center dot (r=4px).
- **Glow ring**: `<circle>` r=22px, no fill, stroke: cyan 2px, opacity pulsing 0.3→0.7→0.3 (CSS animation, 2s loop). Indicates interactivity.
- **Vertical rail**: `<line>` from min-y to max-y of the control point's valid range. Stroke: dashed white, opacity 0.15. Only visible when control point is being dragged.
- **Snap indicators**: Small `<line>` tick marks at notable y-values along the rail. Opacity 0.3 normally, 0.8 when control point is within snap distance.
- **Grabbed state**: On grab, the glow ring expands to r=28px and brightens to opacity 0.9. The handle gains a `<filter>` drop shadow (feGaussianBlur stdDeviation=3, color cyan).

#### The Surfer
- **Board/tangent line**: `<line>` element, centered on the surfer position, extending 30px in each direction along the tangent. Stroke: white (#ffffff), width 3px, linecap round. Rotates with `transform: rotate(θ)` where θ = atan(f'(x)).
- **Surfer body**: Small `<g>` group on top of the tangent line center:
  - Body: `<rect>` 6x10px, rounded corners 2px, fill white
  - Head: `<circle>` r=4px, fill white, positioned above body
  - Arms: Two short `<line>` elements, angled based on speed (arms back at high speed, neutral at low speed)
- **Speed glow**: `<circle>` r=8px behind the surfer, fill with radial gradient: bright core to transparent. Radius scales with speed (8px at rest, up to 20px at max speed). Color shifts from cool blue (slow) to hot orange/white (fast).
- **Motion trail**: Array of 8-12 `<circle>` elements behind the surfer, decreasing in opacity (0.6 → 0.05) and size (r=3 → r=1). Only visible when speed > threshold. Color matches the curve gradient at their position.

#### Gems (Collectibles)
- **Diamond shape**: `<polygon>` with 4 points forming a diamond. Fill: gold (#ffd700). Stroke: darker gold (#b8860b), 1px.
- **Inner sparkle**: `<polygon>` smaller diamond inside, fill white, opacity 0.6.
- **Glow**: `<filter>` with feGaussianBlur stdDeviation=2, color gold. Applied to outer polygon.
- **Float animation**: CSS `translateY` oscillation, ±3px, 1.5s ease-in-out loop. Each gem has a random phase offset so they don't bob in sync.
- **Collection animation** (on hit): Diamond scales up to 1.5x over 150ms, bursts into 6 small `<circle>` particles (gold, r=2px) that fly outward and fade over 400ms. Then a "+100" `<text>` element floats upward and fades.

#### Target Zone / Landing Zone
- **Flag**: `<g>` group:
  - Pole: `<line>` vertical, stroke #888, width 2px, height 30px
  - Flag: `<polygon>` triangle/pennant shape, fill checkered pattern or solid green (#4caf50)
  - Pulse ring: `<circle>` r=25px, no fill, stroke green, dashed, rotating dash-offset animation
- **Landing zone**: `<rect>` below the flag, width 40px, height full to bottom of play area, fill green with very low opacity (0.05). Edges glow when surfer approaches.
- **Hit animation**: On successful landing — flag waves vigorously (CSS rotate oscillation), zone flashes bright green, ring of particles burst outward.

#### Speed Overlay (Optional Toggle)
When enabled, the curve path is re-rendered with a **multi-stop gradient** based on |f'(x)|:
- |f'(x)| < 0.3: Ice blue (#4fc3f7) — slow zones
- |f'(x)| 0.3-1.0: White (#ffffff) — medium zones
- |f'(x)| 1.0-2.0: Warm orange (#ffb74d) — fast zones
- |f'(x)| > 2.0: Hot red (#ff5252) — extreme zones

Implemented as a second `<path>` on top of the main curve with segment-wise coloring using `<linearGradient>` with precise `offset` stops, or as multiple short `<path>` segments each with their own stroke color.

#### Derivative Graph (Optional Toggle)
- **Graph area**: `<rect>` with semi-transparent dark background (rgba 0,0,0,0.4), rounded corners. Height ~80px on mobile, ~120px on desktop. Positioned below the main curve.
- **Zero line**: `<line>` y=0 reference, stroke white, opacity 0.3.
- **f'(x) curve**: `<path>` showing the derivative of the current mountain. Stroke: electric green (#76ff03), width 2px. Updates in real-time as control points are dragged.
- **Current position marker**: `<circle>` on the f'(x) curve at the surfer's current x-position. Same green, r=5px, with glow. Moves during the ride.
- **Label**: `<text>` "f'(x)" in the corner, font-size 11px, fill green, opacity 0.6.
- **Vertical connection line**: `<line>` from the surfer's x-position on the main curve down to the same x on the f'(x) graph. Dashed, opacity 0.2. Shows the correspondence.

#### HUD Elements
- **Speed readout**: `<text>` showing current |f'(x)| value during the ride. Large font (24px), positioned top-center. Color matches speed overlay colors. Number animates smoothly (no jumps).
- **Slope angle readout**: `<text>` showing θ° next to the surfer during the ride. Smaller (14px). Updates in real-time.
- **Gem counter**: `<text>` "◇ 3/5" with collected diamonds shown as filled gold vs unfilled gray.
- **Timer**: `<text>` showing elapsed ride time. Format: "12.3s". Starts on launch, stops on landing or level end.
- **Star display**: Three `<polygon>` star shapes. Filled gold for earned, outlined gray for unearned. Scale-pop animation when earned.

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Sky (top) | Deep navy | #0b0f1a |
| Sky (bottom) | Dark purple | #1a0f2e |
| Curve (left) | Ice blue | #a8edea |
| Curve (right) | Sunset pink | #fed6e3 |
| Control points | Bright cyan | #00e5ff |
| Surfer/board | White | #ffffff |
| Gems | Gold | #ffd700 |
| Target zone | Green | #4caf50 |
| f'(x) graph | Electric green | #76ff03 |
| Slow speed | Cool blue | #4fc3f7 |
| Medium speed | White | #ffffff |
| Fast speed | Hot orange | #ffb74d |
| Extreme speed | Red | #ff5252 |
| Stars (earned) | Gold | #ffd32a |
| Text | White | #ffffff |
| Muted text | Gray | #888888 |

---

## 5. Reward/Feedback System

### On Success (Collecting a Gem)
1. **Instant** (0ms): Gem freezes in place
2. **Burst** (0-150ms): Gem scales to 1.5x and shatters — 6 gold particles fly outward in a circle pattern (60° apart) with initial velocity 200px/s, decelerating, fading from opacity 1.0 to 0 over 400ms
3. **Score pop** (50-300ms): "+100" text appears at gem position, rises 30px over 250ms with ease-out, fading from white to transparent
4. **Board flash** (0-100ms): The surfer's tangent line board flashes gold for 100ms, then fades back to white
5. **Screen pulse** (0-50ms): Subtle vignette flash — edges of the screen brighten very slightly (0.03 opacity white overlay) for 50ms. Almost subliminal but adds "oomph."
6. **Gem counter update**: Counter animates — the newly filled diamond icon scales up 1.2x then settles, with a tiny gold particle burst

### On Gem Combo (Collecting gems within 1.5 seconds of each other)
1. **Combo text**: "x2!", "x3!", "COMBO x4!" appears larger and more dramatic with each consecutive gem
2. **Combo multiplier color**: x2 = gold, x3 = orange glow, x4+ = rainbow gradient text
3. **Trail intensifies**: Motion trail becomes more prominent, longer, and shifts to gold/rainbow
4. **Screen shake**: Very subtle — 1px offset for x2, 2px for x3, 3px for x4+. Duration 80ms. Direction perpendicular to travel.

### On Success (Reaching Target Zone)
1. **Landing impact** (0ms): Brief screen shake — 3px, 120ms, dampened sine wave
2. **Particle explosion** (0-400ms): 16 particles burst from landing point. Mix of white, green, and gold circles. Radial burst with randomized velocities (150-300px/s). Gravity pulls them down. Fade over 400ms.
3. **Flag celebration** (0-800ms): Flag waves vigorously (CSS rotate: -10° to 10°, 3 cycles over 600ms). Flag color shifts to bright gold.
4. **Surfer celebration** (100-500ms): Surfer character does a brief "arms up" pose change
5. **Speed flash ring** (0-300ms): Expanding ring of light from landing point, radius 0→100px over 300ms, opacity 0.5→0, stroke white 2px
6. **Score tally** (500ms+): Stars fill in one at a time with 200ms delays. Each star: scale 0→1.2→1.0, rotation 0→15°→0°, gold particle burst. Satisfying "ding" (visual pulse substitute).
7. **Level complete overlay** (800ms+): Slides up from bottom with spring easing. Shows time, gems collected, stars, "Next Level" button.

### On Failure (Surfer Stops Before Target)
1. **Slow down** (gradual): Surfer naturally decelerates on flat/uphill section. Speed readout drops to 0.
2. **Surfer slouch** (at speed 0): Board levels flat. Character's arms drop. Subtle gray overlay.
3. **"Ran out of momentum"** text appears above surfer (after 1s of being stopped), red tint, fade in over 300ms.
4. **Retry prompt** (after 1.5s): "Reshape the mountain and try again!" with "↻ Retry" button that has a gentle pulse animation.
5. **NO harsh failure**: No explosion, no sad sound. The surfer just... stops. It's clear and instructive without being punishing. The curve shape makes it obvious WHY they stopped (not steep enough).

### On Failure (Surfer Goes Off-Screen / Too Fast)
1. **Speed warning** (approaching max): Screen edges pulse red, speed readout flashes, slight camera shake
2. **Wipeout** (if speed exceeds limit): Surfer flies off the tangent line. Brief spin animation (720° rotation over 300ms). Small puff of white particles. Lands off the curve.
3. **"Too steep!"** text appears. Retry prompt.

---

## 6. Scoring + Star Ratings

### Score Components
| Component | Points | Details |
|-----------|--------|---------|
| Level completion | 500 base | Reaching the target zone |
| Gem collection | 100 each | Collected during the ride |
| Combo bonus | +50 per combo level | x2=+50, x3=+100, x4=+150, etc. |
| Time bonus | 0-300 | Faster completion = more points. Threshold per level. |
| Precision bonus | 0-200 | Landing closer to the center of the target zone. |

### Star Thresholds (Per Level)
Stars are based on **objectives met**, not raw score:

| Stars | Requirement |
|-------|------------|
| ⭐ | Reach the target zone |
| ⭐⭐ | Reach target zone + collect ≥ 50% of gems |
| ⭐⭐⭐ | Reach target zone + collect ALL gems + time under par |

**Par times** are generous for 3 stars — designed so that a student who understands the level's calculus concept can achieve it in 1-2 attempts, but blind trial-and-error takes 4-5.

### Score Display
- During ride: Gem counter + timer visible in HUD
- Post-ride: Score breakdown with animated tally (each component counts up with satisfying tick)
- Best score per level saved in `levelStars` state

---

## 7. Level Designs (8 Levels)

### Level 1: "First Descent" (Tutorial)
**Concept taught**: What a tangent line is; speed comes from steepness
**Curve**: Simple downhill slope — starts high left, ends low right. Basically f(x) = -0.5x + 3 but with slight curvature.
**Control points**: 0 (no editing). Player just taps SURF and watches.
**Gems**: 3 gems along the path (auto-collected since the path is fixed)
**Target**: Large landing zone at the end
**Tutorial overlay**: Arrow pointing to the surfer's board: "This is the tangent line — it always matches the slope!" → Arrow pointing to speed: "The steeper the mountain, the faster you go!"
**What the player learns**: The surfer moves along the curve. The board rotates with the slope. Speed changes with steepness.
**Par time**: 8s. Very generous.
**Auto-pass**: Level completes automatically. 3 stars guaranteed for watching.
**Derivative graph**: Shown by default. The f'(x) line is almost flat (constant slope ≈ -0.5). Labels point out "The slope is constant, so the speed is constant!"

### Level 2: "The Hill"
**Concept taught**: Speed approaches zero at peaks (f'(x) = 0 at max)
**Curve**: A single smooth hill — parabolic-ish. f(x) ≈ -0.3(x-5)² + 4
**Control points**: 1 — controls the peak height. Higher peak = more dramatic slowdown at the top. Must be high enough for the surfer to clear the hill and reach the far side.
**Gems**: 2 gems — one on each side of the peak
**Target**: Landing zone on the right, downhill from the peak
**What the player learns**: The surfer SLOWS DOWN dramatically approaching the peak (f'(x) → 0), nearly stops at the exact top, then accelerates again going down the other side. Critical insight: the surfer's height doesn't matter — the CHANGE in height matters.
**Hint**: "The surfer slows down at the top of the hill. Watch the slope flatten out!"
**Par time**: 10s
**Derivative graph**: Suggested ON. Shows f'(x) crossing zero at the peak — a clear visual "aha."

### Level 3: "Roller Coaster"
**Concept taught**: Multiple sections of varying slope create a rhythm of fast-slow-fast
**Curve**: Two hills and a valley — sinusoidal-ish. Has sections of steep descent, flat bottom, ascent, flat top, descent again.
**Control points**: 2 — one controls the depth of the valley between the hills, one controls the height of the second hill. The challenge: if the second hill is too tall, the surfer doesn't have enough momentum to clear it.
**Gems**: 4 gems — placed at the fast sections (steep parts) and one at the top of the first hill (tricky to collect because the surfer is slow there)
**Target**: Landing zone at the far right, past the second hill
**What the player learns**: Downhill sections GIVE momentum. Uphill sections COST momentum. The surfer needs enough steep downhill before an uphill section to make it over. This is the kinetic/potential energy connection.
**Hint**: "Make the valley deep enough to build speed for the next climb!"
**Par time**: 12s
**Key moment**: The surfer dramatically slowing at each hilltop, the tension of "will they make it over?" — this is the moment students fall in love with the game.

### Level 4: "The Launch Pad"
**Concept taught**: Steep slopes create extreme speed; controlling slope magnitude
**Curve**: Starts with a plateau, then has a steep cliff section, then a flat landing area. The cliff's steepness is adjustable.
**Control points**: 2 — one controls the cliff's steepness (how quickly the curve drops), one controls where the flat landing area begins.
**Gems**: 3 gems — two in the fast descent zone, one at the transition to flat (hard to get because the surfer is decelerating rapidly)
**Target**: A precise small landing zone on the flat area. Must land within it — overshooting (too fast) or undershooting (curve not right) fails.
**What the player learns**: The derivative's magnitude matters. A gentle slope gives moderate speed. A cliff gives extreme speed. The student must find the "Goldilocks" steepness.
**New mechanic**: **Speed zones visible** — the speed overlay is turned on by default for this level, color-coding the curve sections. The student sees red (dangerous) and blue (safe) zones.
**Hint**: "Too steep = too fast! Find the right balance."
**Par time**: 9s

### Level 5: "Gem Gauntlet"
**Concept taught**: Reading the derivative to predict where speed will be optimal
**Curve**: A longer course with multiple ups and downs. S-curve shape.
**Control points**: 3 — one for each major section of the curve. Player must craft the curve so the surfer passes through all gem positions at the right speed.
**Gems**: 5 gems — placed at varying heights along the curve. Some are slightly off the curve path (above or below) — the surfer can only reach them if moving at the right speed (fast enough to "jump" to higher gems via tangent line extension, or slow enough to not overshoot lower ones).
**Target**: Landing zone at the end
**What the player learns**: The derivative determines not just speed but trajectory. Planning the shape of the curve to control where f'(x) is large vs small is the core skill.
**Hint**: "Position control points so the surfer is fast at steep sections and slow at flat sections. Gems in flat areas need a gentle approach!"
**Par time**: 14s
**Derivative graph**: Shown by default. Students start correlating: "When the green line is far from zero, the surfer goes fast."

### Level 6: "Concavity Cruise"
**Concept taught**: The second derivative / concavity — how the CURVE curves
**Curve**: A long smooth S-curve with a clear inflection point. Left side curves one way (concave up), right side curves the other (concave down).
**Control points**: 2 — one controls the curvature intensity on the left, one on the right. The challenge: the inflection point is where the gems are, and the surfer needs specific speed there.
**Gems**: 4 gems — clustered near the inflection point
**Target**: End of the curve
**New mechanic**: **Concavity indicators** — small arrows along the curve pointing up or down, showing which way the curve is bending. At the inflection point, the arrows flip direction.
**What the player learns**: It's not just about slope — the CHANGE in slope matters. A concave-up section means "slope is increasing" (speeding up even on flat-ish terrain). Concave-down means "slope is decreasing" (slowing down even before the peak).
**Hint**: "Watch how the curve bends. When it cups upward ∪, the surfer accelerates. When it cups downward ∩, the surfer decelerates."
**Par time**: 13s

### Level 7: "Precision Landing"
**Concept taught**: Using derivative knowledge to solve a precise optimization problem
**Curve**: Complex terrain with a very small target zone. Multiple possible paths (different control point configurations) can reach the target, but only one configuration collects all gems AND lands in the zone.
**Control points**: 3 — each controls a different section of the terrain
**Gems**: 5 gems — spread across the course at key positions
**Target**: Very small landing zone (width 25px instead of the usual 40px)
**What the player learns**: This is "applied calculus" — using everything they've learned about slope, speed, and curve shape to solve a multi-constraint optimization. It's the "final exam" disguised as a puzzle.
**Hint**: "Think about what speed you need at the target. Then work backwards — what slope gives that speed?"
**Par time**: 15s
**Special**: The derivative graph is OFF by default. Students who toggle it on have a significant advantage — rewarding those who've internalized the f(x)/f'(x) connection.

### Level 8: "Freestyle Mountain"
**Concept**: Creative expression + open-ended exploration
**Curve**: Player builds the ENTIRE mountain from 5 control points. No fixed terrain shape.
**Control points**: 5 — full freedom to create any curve shape
**Gems**: 6 gems at fixed positions in space (not on any particular curve). Player must craft a curve that passes through or near each gem.
**Target**: Large landing zone at the end
**Scoring**: No par time. Stars based on gems collected: ⭐ = 3 gems, ⭐⭐ = 5 gems, ⭐⭐⭐ = all 6 gems.
**What the player learns**: Creative application. Students discover that building an interesting curve IS designing a function. They're doing function design without knowing it.
**Special**: After completing, a "Share Your Mountain" button appears (generates a URL-encoded state of control point positions). Fun for sharing solutions.
**Derivative graph**: Available as toggle. Students often turn it on here to see how their creative curve translates to f'(x).

---

## 8. "Juice" Details — The Polish That Makes It Feel Premium

### Screen Shake
- **Gem collection**: 1px offset, 60ms, perpendicular to travel direction
- **Combo x3+**: 2px offset, 80ms, random direction
- **Landing impact**: 3px offset, 120ms, dampened sine wave (starts at 3px, decays to 0)
- **Wipeout**: 5px offset, 200ms, violent random shake
- **Implementation**: CSS transform on the main SVG `<g>` container. Use `translate(shakeX, shakeY)` animated via requestAnimationFrame with exponential decay.

### Particle Bursts
- **Gem collect**: 6 particles, gold, circular burst, 400ms lifetime
- **Landing success**: 16 particles, mixed white/green/gold, large burst, 500ms lifetime
- **Combo collect**: 8 particles per gem, increasingly intense (more particles, brighter, faster)
- **Speed burst** (entering fast zone): 3-4 tiny white particles shed backward from surfer every 100ms while speed > threshold
- **Implementation**: Array of particle objects `{x, y, vx, vy, life, maxLife, r, color}`. Updated each frame. Rendered as `<circle>` elements. Removed when life ≤ 0. Capped at 60 particles max for performance.

### Easing Curves
| Animation | Easing | Duration | Notes |
|-----------|--------|----------|-------|
| Control point drag | None (immediate) | — | Must feel 1:1 responsive |
| Curve reshape | Cubic ease-out | 50ms | Smooth but fast response to control point changes |
| Surfer along curve | Linear (speed = |f'(x)|) | Continuous | Speed IS the derivative — no artificial easing |
| Gem collection burst | Ease-out | 400ms | Particles decelerate naturally |
| Score pop "+100" | Ease-out + fade | 250ms | Quick pop, slow fade |
| Star fill-in | Spring (overshoot) | 300ms | Scale 0→1.2→1.0 |
| Level complete overlay | Spring (slight overshoot) | 400ms | Slides up from bottom |
| Camera follow surfer | Smooth damp | 100ms | Slight lag behind surfer for "cinematic" feel |
| Speed readout number | Lerp | 50ms | Smooth number transitions, never jumps |

### Timing
- **Pre-launch phase**: No time pressure. Player can take as long as they want shaping terrain.
- **Ride duration**: Typically 5-15 seconds depending on curve length and slope
- **Post-ride score display**: 300ms delay before overlay appears (let the player absorb the landing)
- **Star animation**: 200ms per star, staggered 200ms between stars
- **Total score screen time**: Stars animate over ~1.2s, then buttons appear
- **"Try Again" availability**: Immediate — even during score animation, player can tap retry

### Transitions
- **Level entry**: Curve draws itself from left to right over 600ms (like a line being drawn with a pen). Then control points pop in with scale animation (0→1.1→1.0, 200ms each, staggered 100ms). Then "SURF!" button fades in.
- **Level exit**: Curve fades out from right to left over 400ms. Quick black fade (150ms).
- **Level select ↔ Game**: Standard slide transition (level select slides left, game slides right), 300ms with ease-in-out.
- **Derivative graph toggle**: Slides up/down from below the main curve area, 200ms ease-in-out. The f'(x) curve draws itself on first appearance (500ms, like being sketched).

### Camera Behavior
- **Pre-launch**: Static view showing the full curve. If the curve is wider than the viewport, the camera starts centered and the player can pan left/right.
- **During ride**: Camera smoothly tracks the surfer's x-position with a slight lag (smooth damp, τ=100ms). Vertical framing stays fixed (shows full curve height). If the surfer is in the left third of the screen, camera doesn't pan yet. Camera only starts tracking once the surfer reaches center-screen position.
- **Speed zoom**: At high speeds (|f'(x)| > 2.0), camera zooms out very slightly (scale 1.0 → 0.95) to give a sense of velocity and show more of the upcoming terrain. Zooms back in when speed decreases.
- **Implementation**: `<g transform="translate(cameraX, cameraY) scale(cameraZoom)">` wrapping all game elements. Camera position updated each frame with lerp/smooth damp.

---

## 9. What Makes This Game ADDICTIVE

### The "One More Tweak" Loop
The planning phase is where addiction lives. "What if I just made this hill a LITTLE steeper?" The curve reshapes instantly, the speed overlay updates, and the student can see the consequence before launching. This instant feedback + low cost of iteration creates a loop that's hard to break.

### The Speed Sensation
When the surfer hits a steep section and the particles burst, the trail stretches, and the camera subtly zooms — it FEELS like going fast. This is the "juice" that turns a math concept into an experience. Students will make curves steeper just to see the surfer go fast, and in doing so, they're developing intuition about derivatives.

### The Hilltop Tension
The moment where the surfer approaches a peak and slows... and slows... and almost stops... and then JUST barely tips over the edge and starts accelerating again — this is pure game design gold. It's a cliffhanger every time. Students start cheering for their surfer to make it over hills. That emotional investment is what makes the derivative concept stick.

### The "Aha" Progression
- **Level 1-2**: "Oh, steep = fast! Cool."
- **Level 3**: "Wait, I need downhill BEFORE uphill to build speed..."
- **Level 4**: "There's a sweet spot of steepness..."
- **Level 5**: "I can read the curve and predict where I'll be fast or slow!"
- **Level 6**: "It's not just the slope — it's how the slope CHANGES..."
- **Level 7**: "I can use all of this to solve a real puzzle!"
- **Level 8**: "I can BUILD anything! I understand curves now!"

Each level adds one insight. By level 8, the student has internalized the concept of derivatives through 20 minutes of play — something that normally takes a week of lectures.

### The Derivative Graph Reward
The f'(x) toggle is deliberately optional. Students who discover it and learn to read it gain a real advantage. This creates a pull: "What does that graph do?" → "Oh, it shows the slope at every point!" → "I can use this to plan my route!" The graph goes from mysterious to indispensable, and the student chose that journey themselves.

### Social Sharing (Level 8)
"Check out my mountain!" — Level 8's freestyle mode creates unique curves that students want to share. Each mountain has a personality. This social element extends play beyond the initial session.

---

## 10. Scope Notes (What to Cut vs Keep for MVP)

### MUST KEEP (Core Experience)
- ✅ **Surfer riding on a curve with tangent line rotation** — this IS the game
- ✅ **Speed from |f'(x)|** — the core educational mechanic
- ✅ **Draggable control points** — the core interaction
- ✅ **Gem collection** — provides concrete goals and moment-to-moment engagement
- ✅ **Landing zone/target** — gives each level a clear win condition
- ✅ **Star ratings** — drives replayability
- ✅ **8 levels with progression** — the "aha" curve is essential
- ✅ **Screen shake + particles on gem collect** — bare minimum juice for satisfaction
- ✅ **Speed overlay (color-coded curve)** — intuitive derivative visualization
- ✅ **Motion trail behind surfer** — conveys speed visually

### SHOULD KEEP (High Impact, Moderate Effort)
- 🔶 **Derivative graph toggle** — huge educational value, moderate implementation effort
- 🔶 **Combo system** — makes gem collection more exciting
- 🔶 **Camera follow during ride** — improves immersion significantly
- 🔶 **Landing success particle burst** — reward moment needs to feel big
- 🔶 **Level entry "curve draw" animation** — sets the mood, worth the effort

### CUT FOR MVP (Add in V2)
- ❌ **Speed zoom** (camera zoom at high speed) — nice but adds complexity to camera system
- ❌ **Concavity indicators** (Level 6) — can simplify that level to not need them
- ❌ **Share Your Mountain** (Level 8 share feature) — cool but not MVP
- ❌ **Pause mid-ride** — let the ride play out; retry is cheap
- ❌ **Snap zones** on control points — nice tactile detail but not necessary
- ❌ **Wipeout animation** (too-fast failure) — just stop the surfer and show retry for MVP. No separate failure mode needed.
- ❌ **Ambient glow behind mountain** — subtle visual, skip it
- ❌ **Arms animation on surfer** — keep the surfer body simple for MVP

### SIMPLIFY FOR MVP
- 🔄 **Surfer model**: Just the tangent line board + a circle on top. No body/arms/head. Iconic and easy to implement.
- 🔄 **Curve interpolation**: Use monotone cubic interpolation (standard, well-documented) instead of custom Hermite. Libraries available.
- 🔄 **Camera**: Fixed viewport for levels 1-6 (design curves to fit). Only implement scrolling camera for levels 7-8.
- 🔄 **Particle system**: Cap at 40 particles. Simple circle elements. No complex physics — just initial velocity + gravity + fade.
- 🔄 **Derivative graph**: Pre-compute sampled points of f'(x) using finite differences. No need for analytical derivatives.
- 🔄 **Score tally**: Simple text display, skip the animated counting-up. Just show final numbers.
- 🔄 **Speed overlay**: Instead of a multi-stop gradient, render 30-50 short `<path>` segments each with a solid color. Simpler to implement than SVG gradient stops at arbitrary positions.

---

## UX Specification

### Information Architecture
```
Home Page
  └── Slope Surfer (card: thumbnail, title, description)
        ├── Level Select (grid of 8 levels with stars)
        │     └── Level N
        │           ├── Planning Phase (drag control points)
        │           ├── Ride Phase (watch surfer)
        │           └── Result Phase (score + stars)
        └── Back to Home
```

### First-Time User Experience (FTUE)
1. **Level 1 auto-starts** on first visit — no level select screen on first play
2. **Tutorial overlays** appear during Level 1 (dismissable, never re-appear):
   - "This is your surfer. The board always matches the mountain's slope." (arrow to surfer)
   - "Watch the speed change — steep sections = fast!" (arrow to speed readout)
   - "Collect gems for bonus points!" (arrow to first gem)
3. **Level 2 introduces control points** with a highlight: "Drag this handle up or down to reshape the mountain!"
4. **Level 4 introduces speed overlay**: "Toggle the speed view to see which sections are fast (red) and slow (blue)!"
5. After Level 3, the **derivative graph button** appears for the first time with a subtle pulse animation, but no tutorial text. Let the curious student discover it.

### Accessibility
- **All interactive elements**: `aria-label` on buttons, `role="button"` on SVG tap targets
- **Color not sole indicator**: Speed overlay uses both color AND the speed number readout
- **Touch targets**: All buttons ≥ 44px, control point handles 52px visible + 26px invisible extension
- **Reduced motion**: Respect `prefers-reduced-motion` — disable particles, screen shake, and reduce animation durations by 80%. Keep core surfer movement.
- **Keyboard support**: Tab through control points, arrow keys to adjust, Space to launch, D for derivative, R for retry

### Error States
- **Control point dragged off-screen**: Clamp to valid range, show boundary flash
- **All gems missed**: No penalty — just fewer points. Encouraging retry text.
- **Surfer stuck** (edge case: exactly flat section): Auto-nudge after 2s of zero speed. Show hint: "The slope is zero — the surfer has no momentum!"
- **Browser resize during ride**: Pause ride, recalculate viewport, resume

### Performance Targets
- **60fps** during ride animation on mid-range phones (2020+ devices)
- **< 100ms** response time on control point drag (curve + overlay update)
- **< 50 SVG elements** in the active scene at any time (excluding particles)
- **Particles capped** at 40 simultaneous elements
- **Derivative graph**: Pre-sampled at 100 points, rendered as a single `<path>`

### Responsive Breakpoints
| Breakpoint | Layout Changes |
|-----------|---------------|
| < 375px | Hide timer from HUD. Reduce control point handle to 44px. Stack all buttons vertically. |
| 375-480px | Standard mobile layout. One column of controls. |
| 480-768px | Slightly larger game area. Two-column button layout. |
| 768-1024px | Side controls panel appears next to game area. |
| > 1024px | Full desktop layout. Game area max-width 800px. Derivative graph beside main curve instead of below. |

---

## Technical Implementation Notes

### Curve Mathematics
The mountain curve should be implemented as a **monotone cubic interpolation** through a set of knot points:
- Fixed start point (left edge)
- Fixed end point (right edge)
- 0-5 draggable control points in between
- Use Fritsch-Carlson method for monotone cubic — ensures no overshoots and smooth curves

The derivative at any point can be computed via:
- **Analytical**: The cubic polynomial's derivative between knots (3ax² + 2bx + c for each segment)
- **Numerical (simpler for MVP)**: Central difference: f'(x) ≈ (f(x+h) - f(x-h)) / (2h) where h = 0.5px

### Surfer Physics
The surfer's position along the curve is parameterized by x:
```
dx/dt = baseSpeed * |f'(x)| * speedMultiplier + minSpeed
```
Where:
- `baseSpeed` = 30 (px per second per unit slope)
- `|f'(x)|` = absolute derivative at current position
- `speedMultiplier` = level-specific tuning parameter
- `minSpeed` = 5 (px/s) — prevents complete stops, keeps the game flowing

Direction is always left-to-right (x always increases). The surfer is "surfing downhill" regardless of curve direction — think of it as time flowing forward.

### Gem Collision Detection
Simple distance check: if surfer's (x, y) is within 18px of gem center, it's collected. Check every frame during the ride.

### File Structure (Following Existing Patterns)
```
src/games/slopeSurfer/
├── types.ts                 (Vec2, ControlPoint, Gem, Level, GamePhase, Particle, etc.)
├── engine.ts                (curve math, derivative computation, surfer physics, scoring)
├── levels.ts                (8 level definitions)
├── gameState.ts             (useReducer: actions, state shape, reducer)
├── SlopeSurfer.tsx          (main component)
├── SlopeSurfer.module.css   (mobile-first responsive styles)
└── components/
    ├── MountainCurve.tsx    (SVG path rendering, speed overlay, gradient)
    ├── ControlPoints.tsx    (draggable handles with rails)
    ├── Surfer.tsx           (tangent line + body, motion trail)
    ├── Gems.tsx             (diamond shapes, float animation)
    ├── TargetZone.tsx       (flag, landing zone)
    ├── DerivativeGraph.tsx  (f'(x) trace, position marker)
    ├── HUD.tsx              (speed readout, gem counter, timer, stars)
    ├── Particles.tsx        (particle system for bursts/trail)
    ├── Controls.tsx         (buttons: SURF, retry, toggles)
    ├── LevelSelect.tsx      (level grid with stars)
    ├── LevelComplete.tsx    (overlay with score breakdown)
    └── *.module.css
```

### State Shape (useReducer)
```typescript
interface GameState {
  phase: 'intro' | 'planning' | 'riding' | 'success' | 'failed' | 'levelSelect'
  levelId: number
  levelStars: Record<number, 0 | 1 | 2 | 3>
  controlPoints: ControlPoint[]  // draggable positions
  surferX: number                // current x position on curve
  surferSpeed: number            // current |f'(x)|
  gemsCollected: Set<number>     // ids of collected gems
  comboCount: number
  rideTime: number
  particles: Particle[]
  showDerivGraph: boolean
  showSpeedOverlay: boolean
}
```

### Integration
- Route: `/slope-surfer`
- HomePage card: Custom SVG thumbnail showing a mountain curve with a surfer silhouette and gradient
- Title: "Slope Surfer"
- Description: "Ride the tangent line! Shape mountains and feel how steepness controls speed. An intuitive intro to derivatives."
