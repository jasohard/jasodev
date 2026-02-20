# Game Design Specifications

> **Curated by:** Game Design Expert
> **Selected:** 4 of 8 proposals for implementation
> **Design Principle:** Math IS the gameplay — not decoration on a quiz

---

## Selection Rationale

### Why These 4?

| Game | Math Topic | Primary Interaction | Why Selected |
|------|-----------|--------------------|----|
| Probability Plinko | Statistics & Probability | Tap-adjust pegs, drop balls, observe | Universally appealing, incredible emergent visuals, simplest to implement well |
| Trig Turntable | Trigonometry & Unit Circle | Drag sliders, compose circles, watch patterns | Most visually stunning, perfect SVG showcase, genuine "wow" factor |
| Vector Voyager | Vectors & Linear Algebra | Drag-to-draw vectors, launch ship | Best puzzle mechanics, satisfying plan-then-execute loop |
| Proof Pinball | Geometry & Angles | Set angle, launch ball, place reflectors | Inherently fun (pool/pinball), teaches angles physically |

### Why NOT the others?

| Rejected Game | Reason |
|------|--------|
| **Curve Crafter** | Too many fiddly small draggable handles for mobile. Overlaps with Trig Turntable on "adjust parameters to match a curve." Implementation of multi-function piecewise editing is very complex for the payoff. |
| **Derivative Dash** | Highest implementation complexity (real-time terrain editing + physics simulation + synchronized derivative graph). The core "aha" is brilliant but requires too many moving parts to build well in scope. |
| **Tessellation Station** | Proper tessellation snap-to-grid geometry is deceptively hard to implement. Penrose tiles and Escher deformation mode would eat the entire dev budget. Tile placement without snapping feels terrible. |
| **Combinatorics Conquest** | Actually 4 separate mini-games — dilutes the experience. Graph coloring alone doesn't have enough depth for a full game. Would feel like a quiz collection, not a game. |

### Interaction Model Diversity Check
- **Plinko**: Tap to configure → batch-observe outcome (simulation/observation)
- **Trig Turntable**: Compose components → watch pattern emerge (creative/constructive)
- **Vector Voyager**: Plan multi-step path → execute (strategic/puzzle)
- **Proof Pinball**: Aim precisely → watch chain reaction (precision/physics)

✅ Four genuinely distinct interaction models. No two games feel like "drag things around."

---

## Game 1: Probability Plinko

### Elevator Pitch
*"Hack a Plinko board by tweaking the odds at each peg to match target distributions. Watch hundreds of balls prove you right (or wrong)."*

### Core Game Loop
1. **See the challenge**: A target histogram appears at the bottom of the board (e.g., "make a bell curve" or "make a uniform distribution" or "pile everything in bin 3")
2. **Adjust the board**: Tap any peg to cycle or drag its left/right probability. Color feedback shows the bias instantly.
3. **Drop balls**: Hit the drop button. Balls cascade down the board, bouncing at each peg according to the probabilities you set.
4. **Compare results**: Your histogram builds in real-time. A match percentage shows how close you are to the target.
5. **Iterate**: Reset and tweak pegs to improve your match. Each attempt costs "credits" — solve it in fewer drops for a higher score.

**Turn length**: ~30-60 seconds per attempt. Players typically try 3-5 times per level.

### Controls (Mobile-First)
| Action | Mobile | Desktop |
|--------|--------|---------|
| Select a peg | Tap the peg | Click the peg |
| Adjust probability | Drag left/right on selected peg (slider appears above it) | Same, or scroll wheel |
| Drop balls | Tap "DROP" button (big, bottom of screen) | Click or press Space |
| Change drop count | Tap toggle: 1 / 10 / 50 | Same |
| Speed control | Tap speed icon to cycle: 1x / 3x / 10x | Same |
| Reset bins | Tap "RESET" button | Same or press R |
| Show/hide theory overlay | Tap "📊" button | Same |

**Key mobile consideration**: Pegs must be large enough to tap accurately. Minimum 36px tap targets. On a 5-row board at 375px width, this works. On 8+ row boards, implement pinch-to-zoom or make the board scrollable/pannable.

### Scoring & Feedback
- **Match Score**: 0-100% based on chi-squared distance between player's histogram and target (normalized to percentage). Displayed as a prominent progress bar.
- **Star Rating** (per level):
  - ⭐ = Match ≥ 60%
  - ⭐⭐ = Match ≥ 80%
  - ⭐⭐⭐ = Match ≥ 95%
- **Bonus**: "Efficiency bonus" for matching with fewer total balls dropped
- **Instant feedback**:
  - Each ball that lands in the "right" bin area flashes green; "wrong" area flashes orange
  - Histogram bars that exceed the target outline turn red (overshoot warning)
  - Satisfying "ding" when match crosses 50%, 75%, 90%, 95%
- **Stats panel** (collapsible): Shows mean, standard deviation, total count, max bin — teaches statistical vocabulary by exposure

### Visual Design (SVG Elements)

**Board Layout:**
```
┌─────────────────────────┐
│      ● (ball dropper)   │  ← Top: ball entry point
│                         │
│    ○   ○   ○   ○   ○   │  ← Row 1: 5 pegs
│      ○   ○   ○   ○     │  ← Row 2: 4 pegs (offset)
│    ○   ○   ○   ○   ○   │  ← Row 3: 5 pegs
│      ○   ○   ○   ○     │  ← Row 4: 4 pegs
│    ○   ○   ○   ○   ○   │  ← Row 5: 5 pegs
│                         │
│  ┃█ ┃██┃███┃██┃█ ┃  ┃  │  ← Histogram bins (filling up)
│  ┃──┃──┃───┃──┃──┃──┃  │  ← Target distribution (line overlay)
└─────────────────────────┘
   [DROP ▼]  [1x ⚡]       ← Controls
```

**SVG Elements Needed:**
- **Pegs**: `<circle>` elements. Fill color maps to probability:
  - Gray (#888) = 50/50 (neutral)
  - Blue gradient (hsl 210-240) = left-biased (more blue = more left)
  - Orange gradient (hsl 20-40) = right-biased (more orange = more right)
  - Subtle pulse animation on selected peg
- **Balls**: Small `<circle>` elements (r=4-6px). Animated along calculated paths using CSS transitions or requestAnimationFrame.
  - Ball color: cycling through a palette to distinguish individual balls
  - Trail: Optional short `<line>` trail behind each ball (fade out)
- **Bins**: `<rect>` elements at the bottom. Height grows with count.
  - Fill: Gradient from light to saturated as count increases
  - Target overlay: `<path>` as a dashed line showing the target distribution shape
- **Board frame**: `<rect>` with rounded corners, subtle gradient background
- **Slider (when peg selected)**: Horizontal `<rect>` + `<circle>` handle that appears above the selected peg
- **Match bar**: `<rect>` progress bar, color transitions from red → yellow → green as match improves

**Color Palette:**
- Background: Dark navy (#1a1a2e) — makes the colorful elements pop
- Pegs: Gray/Blue/Orange spectrum (see above)
- Balls: Bright white with colored glow (#fff, with drop-shadow)
- Bins: Soft purple-blue (#6c5ce7) fill, white text labels
- Target line: Bright cyan (#00d2d3) dashed
- Accents: Gold (#ffd32a) for stars and achievements

**Animations:**
- Ball drop: Physics-like cascade with slight randomness. Each peg collision triggers a tiny "bounce" (translate + scale pulse on the peg). Ball path computed on drop — animated over 1-3 seconds.
- Bin fill: Bars grow upward with a spring-ease animation
- Match percentage: Number counter animates up smoothly
- Star reveal: Scale-up with rotation on achievement

### Difficulty Progression

**Level 1: "Bell Curve Basics"** (Tutorial)
- 3 rows of pegs, all locked at 50/50
- Target: default binomial distribution (you just drop balls and watch)
- Purpose: Learn the interface, see how 50/50 pegs naturally create a bell curve
- Win condition: Drop 50 balls (automatic pass)

**Level 2: "Lean Left"**
- 4 rows of pegs, all adjustable
- Target: Left-skewed distribution (most balls should land in left bins)
- Players learn: biasing top pegs has the biggest cascade effect
- Win condition: ≥ 70% match

**Level 3: "Uniform Distribution"**
- 5 rows of pegs
- Target: Flat/uniform distribution (equal balls in all bins)
- This is surprisingly hard! Requires careful balancing.
- Win condition: ≥ 75% match

**Level 4: "Bimodal"**
- 5 rows of pegs
- Target: Two-humped distribution (bimodal)
- Players discover: middle pegs need extreme bias to split the stream
- Win condition: ≥ 75% match

**Level 5: "The Expected Value Challenge"**
- 6 rows of pegs. Each bin has a point value (some negative!)
- Goal: Maximize expected value (not match a shape)
- New mechanic: Score shown per-ball-drop, total accumulates
- Win condition: Achieve expected value ≥ X after 100 balls

**Level 6+: "Custom Targets" (Procedural)**
- 7-8 rows, randomly generated target distributions
- Increasing match threshold requirements (80%, 85%, 90%)
- Endless mode for replayability

### What Makes It Addictive
- **The "one more try" loop**: Each attempt only takes 15-20 seconds. "I bet if I just tweak that one peg..."
- **Visible emergence**: Watching individual random balls create statistical order is mesmerizing. Students watch every single ball, silently cheering "go left... go LEFT!"
- **The 95% wall**: Getting from 80% to 95% match feels like a real accomplishment. The last 5% requires deep understanding.
- **Speed mode satisfaction**: Watching 100 balls cascade simultaneously in fast mode is pure visual dopamine.
- **Surprise factor**: Students discover that small peg changes cascade into huge distribution changes (butterfly effect feeling).

### Scope Notes (What to Cut)
- **CUT**: Conditional probability / multi-stage boards — too complex, save for v2
- **CUT**: Sound effects — nice-to-have, not MVP
- **CUT**: Pascal's triangle overlay — interesting but clutters the UI. Could be a toggle.
- **SIMPLIFY**: Ball physics — don't simulate real physics. Pre-compute the path at each peg (left or right based on probability), then animate along the predetermined path. Much simpler than real-time physics.
- **SIMPLIFY**: Start with 5-row boards max. 8 rows can come in later levels.
- **KEEP**: The core peg-adjustment mechanic — this IS the game
- **KEEP**: Real-time histogram building — this is the magic moment
- **KEEP**: Match percentage feedback — essential motivation

---

## Game 2: Trig Turntable

### Elevator Pitch
*"Stack spinning circles to create mesmerizing patterns. One circle makes a sine wave. Two make music. Five make art. You'll accidentally learn Fourier analysis."*

### Core Game Loop
1. **Start with one circle**: A radius arm spins on the unit circle. A point on the tip traces a sine wave on the timeline to the right.
2. **Adjust parameters**: Drag to change amplitude (radius), use slider to change frequency (speed), drag starting position for phase shift.
3. **See the challenge**: A target waveform or pattern appears (ghosted).
4. **Match it**: Adjust your circle's parameters to match. In later levels, stack multiple circles (epicycles) to create compound waves.
5. **Score**: How closely does your traced wave/pattern match the target?

**Turn length**: 30-90 seconds per level. Creative mode is open-ended.

### Controls (Mobile-First)
| Action | Mobile | Desktop |
|--------|--------|---------|
| Adjust amplitude | Drag the radius arm endpoint in/out | Same |
| Adjust frequency | Drag horizontal slider below circle | Same |
| Adjust phase | Drag the starting dot around the circle rim | Same |
| Add epicycle | Tap "+" button | Click or press + |
| Remove epicycle | Tap the "×" on a circle's label | Click |
| Select circle to edit | Tap the circle or its label in the stack list | Click |
| Play/Pause animation | Tap ▶/⏸ button | Space bar |
| Speed control | Drag speed slider | Same |
| Reset | Tap reset button | Press R |

**Key mobile consideration**: The main circle display should take up ~60% of screen height on mobile. The wave timeline can scroll horizontally or wrap. Parameter controls should be in a collapsible bottom panel. Use large drag handles (minimum 44px touch targets on the radius endpoint and phase dot).

### Scoring & Feedback
- **Wave Match Score**: 0-100% based on mean squared error between player's wave and target wave (sampled at 100+ points over one period). Displayed as a circular progress indicator around the main circle.
- **Star Rating** (per level):
  - ⭐ = Match ≥ 60%
  - ⭐⭐ = Match ≥ 80%
  - ⭐⭐⭐ = Match ≥ 95%
- **Parameter display**: Real-time equation shown: `y = 2.3·sin(3x + π/4)` updates as you drag. Students absorb the notation by seeing it change.
- **Instant feedback**:
  - Your wave overlays the target. Matching sections glow green. Diverging sections show red gap shading.
  - When amplitude is correct, a subtle checkmark appears on the amplitude readout
  - Same for frequency and phase — each "locks in" with a satisfying snap when correct
- **Creative mode score**: No score — just beauty. A "complexity" counter shows how many circles you're using.

### Visual Design (SVG Elements)

**Screen Layout:**
```
┌─────────────────────────────────────┐
│  ┌─────────┐   ┌──────────────────┐ │
│  │         │   │ ∿∿∿∿∿ (wave)    │ │
│  │  (○)    │→→→│ target: ----     │ │
│  │ circle  │   │ yours: ────      │ │
│  │         │   │                  │ │
│  └─────────┘   └──────────────────┘ │
│                                     │
│  Circle 1: [amp] [freq] [phase]     │
│  Circle 2: [amp] [freq] [phase]     │
│  [+ Add Circle]                     │
│                                     │
│  [▶ Play]  [Speed: ━━●━━]  [Reset] │
└─────────────────────────────────────┘
```

**Mobile Layout (stacked):**
```
┌──────────────┐
│    (○)       │  ← Circle display (square, ~60% width)
│  spinning    │
│              │
├──────────────┤
│ ∿∿∿∿∿∿∿∿∿∿  │  ← Wave timeline (full width, scrolls)
│ ──────────── │  ← Target overlay
├──────────────┤
│ ▶  ━━●━━  ↺  │  ← Transport controls
├──────────────┤
│ Amp:  ◄━●━━► │  ← Parameter sliders
│ Freq: ◄━━●►  │    (for selected circle)
│ Phase: drag  │
│ [+ Add] [×]  │
└──────────────┘
```

**SVG Elements Needed:**
- **Main circle(s)**: `<circle>` with `stroke` (no fill). Each epicycle is a circle positioned at the tip of the previous radius arm.
  - Radius arm: `<line>` from center to circumference point, with a circular handle `<circle>` at the endpoint
  - Rotating dot: `<circle>` at the tip, brightly colored, with a subtle glow (`<filter>` with feGaussianBlur)
- **Epicycle stack**: Nested `<g>` groups with `transform: rotate(angle)`. Each circle orbits on the previous one's rim.
- **Wave trace**: `<polyline>` or `<path>` that extends rightward. Points added each animation frame. Stroke with gradient from bright (recent) to faded (older).
- **Target wave**: `<path>` with dashed stroke in contrasting color
- **Difference shading**: `<path>` between player wave and target, filled with translucent red/green
- **Grid lines**: Light `<line>` elements for x and y axes, with subtle tick marks
- **Parameter readouts**: `<text>` elements showing current values
- **Connection lines**: Horizontal `<line>` from the rotating tip to the wave timeline (shows the y-value being traced)

**Color Palette:**
- Background: Very dark blue-black (#0d1117)
- Circle 1: Electric blue (#4fc3f7)
- Circle 2: Hot pink (#f06292)
- Circle 3: Lime green (#aed581)
- Circle 4: Gold (#ffd54f)
- Wave trace: Matches the color of its source circle
- Target wave: White with 50% opacity
- Grid lines: Very subtle gray (#333)
- Connection line: Dotted, same color as the active circle

**Animations:**
- Continuous rotation of radius arms (driven by requestAnimationFrame)
- Wave traces extending in real-time
- Smooth transitions when adjusting parameters (radius arm length interpolates, wave re-renders)
- "Lock-in" animation: when a parameter matches the target, a brief ring-pulse animation on the circle

### Difficulty Progression

**Level 1: "Meet the Sine Wave"** (Tutorial)
- One circle, one slider (amplitude only)
- Target: a sine wave with specific amplitude
- Frequency and phase are pre-set and locked
- Purpose: Understand what amplitude means visually
- Win: Match amplitude within 10%

**Level 2: "Speed It Up"**
- One circle, two controls (amplitude + frequency)
- Target: a sine wave with different amplitude AND frequency
- Purpose: Understand frequency = how "squished" the wave is
- Win: Match both within 10%

**Level 3: "Shift It"**
- One circle, all three controls (amplitude + frequency + phase)
- Target: a phase-shifted sine wave
- Purpose: Understand phase = where the wave "starts"
- Win: Match all three parameters (≥ 85% overall match)

**Level 4: "Two Circles"**
- Unlock the "+" button. Target is a compound wave (sum of two sine waves)
- Player must add a second circle and set all 6 parameters
- Key insight: The compound wave is the SUM of the individual waves
- Win: ≥ 80% match

**Level 5: "Make a Square Wave"**
- Target: approximate square wave (needs 3-4 harmonics)
- Player discovers that odd harmonics (1, 3, 5...) with decreasing amplitude create a square wave
- This is Fourier series in action!
- Win: ≥ 70% match (square waves are hard to approximate perfectly)

**Level 6: "Art Mode Unlocked"**
- Free creation mode — no target, no score
- Lissajous figure mode: trace the combined x,y position of epicycles (not just y-vs-time)
- Students can create spirograph patterns, roses, and complex curves
- Share button: exports the pattern as SVG data

### What Makes It Addictive
- **Visual spectacle**: The spinning circles creating smooth waves is hypnotic. Students will play with this just because it's beautiful.
- **"I made that" feeling**: The patterns they create feel like personal art. They'll screenshot and share.
- **The square wave moment**: When students discover that stacking sine waves can approximate ANY shape, it's a genuine mind-blow moment. This is one of the deepest ideas in mathematics, delivered through play.
- **Endless creative ceiling**: Art mode has no upper limit. Students can keep adding circles and discover new patterns indefinitely.
- **Parameter intuition builds unconsciously**: After 20 minutes of play, students can look at a wave and estimate its frequency, amplitude, and phase without thinking. This is the kind of deep intuition that normally takes weeks of drill.

### Scope Notes (What to Cut)
- **CUT**: Lissajous / parametric mode — save for v2. The basic y-vs-time wave is enough for MVP.
- **CUT**: Audio/tone generation — cool idea but adds Web Audio complexity. Not worth it for MVP.
- **CUT**: SVG export — nice-to-have, not MVP.
- **SIMPLIFY**: Max 4 circles for MVP. Fourier approximation with 10+ circles can come later.
- **SIMPLIFY**: Wave matching uses sampled-point comparison, not analytical. Much easier to implement.
- **SIMPLIFY**: The "connection line" from circle to wave can be a simple horizontal line — don't need fancy animated particles.
- **KEEP**: The spinning circle → wave trace visualization — this IS the game's soul
- **KEEP**: The ability to add multiple circles — epicycles are where the magic happens
- **KEEP**: Real-time parameter equation display — essential for learning transfer

---

## Game 3: Vector Voyager

### Elevator Pitch
*"Plan a spaceship's course by drawing vectors. Your ship can only move along the vector path you build. Navigate around asteroids, thread narrow gaps, and feel like a mathematical pilot."*

### Core Game Loop
1. **See the level**: Spaceship at start position, target zone highlighted, obstacles visible.
2. **Plan the path**: Draw vectors by dragging from the ship (or the end of your last vector). Each vector is an arrow showing direction and magnitude. The chain of vectors forms your flight plan.
3. **Preview**: A dotted line shows the ship's path in real-time as you compose vectors. The resultant vector is also displayed.
4. **Launch**: Hit the launch button. Watch the ship animate along each vector segment in sequence.
5. **Score**: Did you reach the target? How efficient was your path? Stars awarded.

**Turn length**: 30-120 seconds for planning, 3-10 seconds for the launch animation.

### Controls (Mobile-First)
| Action | Mobile | Desktop |
|--------|--------|---------|
| Draw a new vector | Tap and drag from the ship / last vector endpoint | Click and drag |
| Adjust a vector | Drag its arrowhead to reposition | Same |
| Delete a vector | Tap the vector, then tap the ✕ that appears | Click ✕ |
| Launch | Tap "LAUNCH 🚀" button (large, prominent) | Click or press Space |
| Reset flight plan | Tap "CLEAR" button | Press R |
| Undo last vector | Tap "↩" button | Ctrl+Z |

**Key mobile consideration**:
- Vectors must have fat touch targets — the arrowhead should have an invisible `<circle>` with r=24px for touch detection, even if the visible arrowhead is smaller.
- Pinch-to-zoom on the play field so players can plan precisely.
- Consider a "snap to grid" toggle for easier mobile placement (grid lines every 50px in game-space).
- The launch button should be large, fixed at the bottom of the screen, and visually prominent (this is the payoff moment).

### Scoring & Feedback
- **Completion**: Binary — did the ship reach the target zone? (Required for any stars)
- **Star Rating**:
  - ⭐ = Reached the target
  - ⭐⭐ = Reached target with ≤ N vectors (level-specific par)
  - ⭐⭐⭐ = Reached target with optimal vector count AND under total magnitude budget
- **Magnitude budget**: Each level has a "fuel budget" (maximum total magnitude across all vectors). Shown as a fuel gauge that depletes as vectors are drawn.
- **Vector count display**: "Vectors used: 3 / Par: 2"
- **Instant feedback**:
  - Valid path (reaches target): path preview turns green
  - Path hits an obstacle: collision point shown with a warning icon
  - Path exits bounds: endpoint turns red
  - Over budget: fuel gauge turns red, "LAUNCH" button disabled
- **Launch animation**: Ship slides along each vector with a small engine trail. Speed proportional to vector magnitude (longer vectors = faster animation). Camera follows the ship.

### Visual Design (SVG Elements)

**Screen Layout:**
```
┌─────────────────────────────────┐
│  Score: ⭐⭐☆   Fuel: ████░░  │
│                                 │
│            🎯 (target)         │
│       ☄️                        │
│  🚀→→→→↗                       │
│  (ship)  ↘→→→→→               │
│            ☄️    ☄️             │
│                                 │
│  Vectors: 2   Resultant: (5,3) │
│                                 │
│  [↩ Undo] [CLEAR] [🚀 LAUNCH] │
└─────────────────────────────────┘
```

**SVG Elements Needed:**
- **Background**: Dark rectangle (#0a0a23). Star field: 30-50 tiny `<circle>` elements with random positions, sizes (r=0.5-2), and opacity (0.3-0.8). Static — no animation needed.
- **Ship**: `<polygon>` or `<path>` forming a small triangular ship shape (~20x16px). Filled bright white or light cyan. Rotates to face the direction of the current vector during launch animation.
- **Target zone**: `<circle>` with animated dashed stroke (CSS `stroke-dashoffset` animation for a "pulsing ring" effect). Fill with very low opacity. Color: gold/amber (#ffd700).
- **Vectors (the core interactive element)**:
  - Shaft: `<line>` with a colored stroke (width 3-4px)
  - Arrowhead: `<polygon>` (small triangle at the endpoint)
  - Component lines: `<line>` elements showing x and y components as dotted/dashed lines in lighter color (only shown when dragging/selected)
  - Label: `<text>` showing magnitude and angle (or component form) near the midpoint
  - Touch target: Invisible `<circle>` (r=24) at the arrowhead for mobile interaction
  - Color: Each vector gets a distinct color from a predefined palette (blue, green, pink, orange, etc.)
- **Resultant vector**: Thicker `<line>` + `<polygon>` from start to final position. Dashed style. Color: bright white.
- **Path preview**: `<polyline>` connecting all vector chain points. Dashed stroke, semi-transparent.
- **Obstacles (asteroids)**: `<polygon>` with 6-8 random-ish vertices to create irregular shapes. Fill: dark gray with slight gradient. Stroke: lighter gray. Varying sizes.
- **Fuel gauge**: `<rect>` background + `<rect>` fill that shrinks. Color transitions from green → yellow → red.
- **Engine trail** (during launch): Series of small `<circle>` elements that fade out behind the ship (opacity decreasing, placed at intervals along the traveled path).

**Color Palette:**
- Background: Deep space (#0a0a23)
- Stars: White with varying opacity
- Ship: Cyan-white (#e0f7fa)
- Vectors: Color cycle — #4fc3f7 (blue), #81c784 (green), #f48fb1 (pink), #ffb74d (orange)
- Resultant: White dashed
- Target: Gold (#ffd700) with glow
- Asteroids: Dark gray (#555) with lighter stroke (#888)
- UI elements: White text, dark semi-transparent panels

**Animations:**
- **Launch sequence**: Ship translates along each vector segment in order. Duration proportional to magnitude. Easing: ease-in at start of each segment, ease-out at end. Ship rotates to face movement direction.
- **Engine trail**: Small circles spawn at ship position during launch, then fade out over 0.5s.
- **Target pulse**: Continuous subtle scale pulse on the target ring (1.0 → 1.05 → 1.0, 2s loop).
- **Collision**: If ship hits an obstacle, a small burst of `<circle>` particles (explosion effect) and ship shakes.
- **Victory**: When ship reaches target, gold particle burst + target ring fills solid + zoom out.

### Difficulty Progression

**Level 1: "First Flight"** (Tutorial)
- Open space. Ship on left, target directly right.
- Player must draw ONE vector pointing right to reach the target.
- Purpose: Learn the drag-to-draw mechanic. See that vector direction = movement direction.
- Grid visible, generous target zone (r=40px).
- Win: Reach the target.

**Level 2: "Diagonal"**
- Target is up-and-to-the-right.
- Player draws one diagonal vector.
- Component lines are shown: "See how your diagonal is made of horizontal and vertical parts?"
- Purpose: Introduce magnitude + direction concept.
- Win: Reach the target.

**Level 3: "Detour"**
- One large asteroid directly between ship and target.
- Player must use 2 vectors to go AROUND the obstacle.
- Purpose: Learn vector addition — two vectors compose into a path.
- Par: 2 vectors.
- Win: Reach target without hitting asteroid.

**Level 4: "Tight Squeeze"**
- Two asteroids creating a narrow corridor. Target on the other side.
- Player must use 2-3 vectors with precise magnitudes and directions.
- Fuel budget introduced (generous).
- Par: 3 vectors.
- Win: Navigate through the corridor.

**Level 5: "Fuel Crunch"**
- Open field but tight fuel budget.
- Player must find the MOST EFFICIENT path (fewest total magnitude).
- This teaches that the resultant vector is always ≤ the sum of magnitudes.
- Key insight: going diagonally is more fuel-efficient than going right-then-up.
- Par: 2 vectors, tight fuel budget.

**Level 6: "Asteroid Field"**
- Multiple obstacles, winding path required.
- 4-5 vectors needed. Moderate fuel budget.
- Par: 4 vectors.

**Level 7: "Headwind"** (Advanced)
- Wind vectors are visualized as ambient arrows.
- Each segment, a constant wind vector is added to the player's vector.
- Player must compensate: "I want to go right, but wind pushes left, so I need to aim right-and-up."
- This is vector subtraction / solving v + w = target.
- Par: 3 vectors.

**Level 8+: Procedurally generated asteroid fields with increasing complexity.**

### What Makes It Addictive
- **The launch payoff**: Planning is cerebral and tense. Launching and watching the ship execute your plan is the reward. When it threads through a narrow gap between asteroids — *chef's kiss*.
- **The "almost" factor**: Missing by just a tiny bit makes you want to immediately retry with a small adjustment. "If I just angle this vector a little more to the right..."
- **Optimization drive**: Completing a level in 4 vectors, then seeing "Par: 2" makes you think "How is that even possible?!" and try again.
- **Visual intuition building**: After 10 levels, students START to see vectors as physical things. They can eyeball "that's about a magnitude 5 vector pointing 30° north of east" without calculating.
- **Component decomposition "aha"**: The moment a student realizes they can hit a diagonal target by going right-then-up (two vectors) = the moment they understand vector decomposition.

### Scope Notes (What to Cut)
- **CUT**: 3D perspective view — way too complex for MVP.
- **CUT**: Wind currents / headwind — save for v2 (levels 7+ can be added later).
- **CUT**: Pinch-to-zoom — start with fixed viewport and design levels to fit. Add zoom if needed.
- **SIMPLIFY**: Component visualization — show x/y component dotted lines only when a vector is being dragged, not all the time. Reduces visual clutter.
- **SIMPLIFY**: Launch animation doesn't need camera following. Just animate the ship along the path in the existing viewport.
- **SIMPLIFY**: Asteroids are `<circle>` elements with irregular stroke, not complex polygons. Collision detection is simpler with circles.
- **KEEP**: The drag-to-draw vector mechanic — this IS the game.
- **KEEP**: The launch animation — this is the reward that makes planning feel worth it.
- **KEEP**: Fuel/magnitude budget — without this, there's no optimization challenge.
- **KEEP**: Resultant vector display — essential for understanding vector addition.

---

## Game 4: Proof Pinball

### Elevator Pitch
*"Geometry meets billiards. Set your angle, launch the ball, and watch it ricochet through geometric environments. The math of reflection IS the physics of the game."*

### Core Game Loop
1. **See the level**: A geometric environment (room made of lines/shapes), a launch point, and one or more target zones.
2. **Aim**: Drag the protractor to set your launch angle precisely. A ghost line shows the predicted first bounce (and optionally more).
3. **Launch**: Ball fires in a straight line, bouncing off walls following the reflection law.
4. **Watch**: Ball traces its path, angle measurements appear at each bounce point.
5. **Score**: Based on targets hit, bounces used, and precision.

**Turn length**: 5-15 seconds per shot. Multiple shots per level. ~2-5 minutes per level total.

### Controls (Mobile-First)
| Action | Mobile | Desktop |
|--------|--------|---------|
| Aim | Drag finger around the launch point (protractor follows) | Move mouse around launch point |
| Fine-tune angle | Drag further from launch point = finer control (like a slingshot) | Same |
| Launch | Release finger (slingshot-style) OR tap "LAUNCH" button | Release mouse or press Space |
| Adjust reflectors (later levels) | Tap a reflector to select, then drag to rotate | Click and drag |
| Reset ball | Tap "RESET" button | Press R |
| Toggle prediction line | Tap "👁" button | Press P |

**Key mobile consideration**:
- The "slingshot" aiming mechanic is inherently mobile-friendly — it's the same gesture as Angry Birds.
- Dragging AWAY from the launch point to set angle (farther = finer control) gives precision without needing tiny UI.
- Protractor arc should be large (r=80-100px) with clear degree markings every 5°.
- Show the angle numerically in large text next to the protractor.

### Scoring & Feedback
- **Primary**: Hit all targets to complete the level
- **Star Rating**:
  - ⭐ = All targets hit (any number of shots)
  - ⭐⭐ = All targets hit in ≤ N shots (level-specific par)
  - ⭐⭐⭐ = All targets hit in a SINGLE shot (where possible) or under par
- **Angle display**: At each bounce, a small arc shows the incidence and reflection angles. Both are labeled. If they match (which they always do), both flash green briefly.
- **Bounce counter**: Shows current bounces in the shot
- **Instant feedback**:
  - Ball hitting a target: target explodes with particle effect, satisfying "ding"
  - Ball hitting a wall: small flash at contact point, angle measurement appears
  - Ball going out of bounds or running out of energy: fades away with "fizzle"
- **Angle readout**: The exact launch angle is shown prominently: "Launch angle: 37.2°"
- **Prediction line**: Shows the first 1-2 bounces as dotted lines (can be toggled off in harder levels)

### Visual Design (SVG Elements)

**Screen Layout:**
```
┌───────────────────────────────┐
│  Level 3   Shots: 1/3  ⭐☆☆  │
│                               │
│  ┌─────────────────────────┐  │
│  │            ⬡ (target)   │  │
│  │     ╱╲                  │  │
│  │    ╱  ╲     ───────     │  │
│  │   ╱    ╲                │  │
│  │  ●·····→  (launch)      │  │
│  │  └protractor arc┘       │  │
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│  Angle: 42°   [👁] [LAUNCH]  │
└───────────────────────────────┘
```

**SVG Elements Needed:**
- **Walls/Boundaries**: `<line>` or `<polyline>` elements with thick stroke (4-6px). Color: bright white or light gray on dark background. These are the reflective surfaces.
- **Launch point**: `<circle>` (r=8-10px) with a glow effect. Color: bright green (#4caf50).
- **Protractor arc**: `<path>` drawing an arc centered on the launch point. Tick marks every 5°, labeled every 15°. Semi-transparent background fill. Color: cyan ticks on dark semi-transparent background.
- **Aim line (ghost)**: `<line>` from launch point in the aimed direction. Dashed stroke. Color: white, 50% opacity. If prediction is enabled, continues with reflection off the first wall.
- **Ball**: `<circle>` (r=6-8px). Color: bright white with colored glow. Animated along the path after launch.
- **Ball trail**: `<polyline>` showing the path taken. Color: gradient from bright to faded. Persists after the ball stops.
- **Angle arcs at bounce points**: `<path>` drawing small arcs at each bounce. Two arcs shown: incidence (one color) and reflection (another color). `<text>` labels with degree values.
- **Normal line at bounce**: `<line>` perpendicular to the wall at the bounce point. Dashed, light gray. Shown briefly during/after bounce.
- **Targets**: `<circle>` or `<polygon>` (stars/gems). Color: gold (#ffd700) with pulse animation. When hit: particle burst (8-12 small `<circle>` elements flying outward, fading).
- **Moveable reflectors** (later levels): `<line>` segments with a rotation handle (`<circle>` at one end). Color: bright blue (#2196f3). Distinct from walls.
- **Geometric shapes** (decorative/structural): `<polygon>` elements forming triangles, rectangles, etc. These serve as obstacles and visual interest. Color: semi-transparent fills with visible strokes.

**Color Palette:**
- Background: Dark charcoal (#1a1a2e)
- Walls: White (#ffffff) with slight glow
- Ball: White core with colored glow halo
- Trail: Cyan-to-transparent gradient (#00bcd4)
- Targets: Gold (#ffd700)
- Angle arcs: Green (#4caf50) for incidence, blue (#2196f3) for reflection
- Normal lines: Gray dashed (#666)
- Reflectors: Bright blue (#2196f3)
- Protractor: Cyan ticks (#00bcd4) on semi-transparent dark panel

**Animations:**
- **Ball movement**: Constant speed along straight segments. At each bounce: brief pause (50ms) + flash at the contact point + angle arc draws in. Ball speed should be fast enough to be exciting but slow enough to follow the geometry (~300-500px/sec).
- **Bounce flash**: Small radial burst of 4-6 `<line>` elements at the contact point, fading over 200ms.
- **Target hit**: Target scales up briefly, then explodes into 8 particles that fly outward and fade. Very satisfying.
- **Angle arc draw-in**: Arcs animate from 0 to their full angle over 200ms. Numbers fade in.
- **Protractor**: Follows finger/mouse smoothly. Aim line rotates in real-time.
- **Reflector rotation**: Smooth rotation following drag gesture. Prediction line updates in real-time.

### Difficulty Progression

**Level 1: "Straight Shot"** (Tutorial)
- Rectangular room. Launch point on the left wall. Target on the right wall, directly across.
- No bounces needed — just aim straight.
- Purpose: Learn the aiming/launch mechanic.
- Prediction line: ON (full path shown).

**Level 2: "First Bounce"**
- Rectangular room. Target is NOT in line-of-sight — must bounce off the top or bottom wall.
- The angle measurement appears at the bounce: "See? Angle in = angle out!"
- Purpose: Learn the reflection law.
- Prediction line: Shows first bounce.

**Level 3: "Corner Pocket"**
- Rectangular room. Target in the far corner. Must bounce off one wall to reach it.
- Multiple valid solutions with different angles.
- Purpose: Practice aiming with reflection.
- Par: 1 shot.

**Level 4: "Triangle Room"**
- Equilateral triangle boundary. Launch from one vertex, target at another.
- Must use 2-3 bounces. Interior angles of 60° create interesting reflection patterns.
- Purpose: Explore how room shape affects bounces.
- Par: 1 shot, 2-3 bounces.

**Level 5: "Two Targets"**
- Rectangular room with two targets. Must hit both in one shot.
- Requires planning the full bounce path: "If I hit target A on the way, will the ball continue to target B?"
- Prediction line: Shows only first bounce (player must reason about subsequent bounces).
- Par: 1 shot hitting both targets.

**Level 6: "Mirror Master"**
- Irregular room with one moveable reflector segment.
- Player must PLACE the reflector (by rotating it to the right angle) AND aim the shot.
- Two-step puzzle: geometry of placement + geometry of aiming.
- Par: 1 shot.

**Level 7: "The Pentagon"**
- Pentagonal room. 3 targets on different walls.
- Multiple reflectors available to place.
- Complex multi-bounce solution needed.
- Prediction line: OFF (must reason about angles).
- Par: 1-2 shots.

**Level 8+: Increasingly complex rooms with more targets, more reflectors, and curved walls (circular arcs) for advanced geometry.**

### What Makes It Addictive
- **Billiards satisfaction**: The "click" of a perfect bank shot is universally satisfying. This taps into the same pleasure center as pool/billiards.
- **"I can see it!" moments**: When a student visualizes the exact angle needed and nails it on the first try, it feels like a superpower. Geometry becomes spatial intuition.
- **The chain reaction fantasy**: Multi-bounce shots that hit 3 targets feel INCREDIBLE. Students will try to maximize bounces just for the style points.
- **Easy to understand, hard to master**: Everyone understands "ball bounces off wall." But predicting 4 bounces through a pentagon requires real geometric thinking.
- **Visual proof**: The angle arcs at each bounce are a continuous, ambient proof that incidence = reflection. Students absorb this fact through play, not memorization.
- **Replay value**: Most levels have multiple solutions. "Can I do it in fewer bounces?" or "Can I hit all targets in one shot?" are natural challenges.

### Scope Notes (What to Cut)
- **CUT**: Curved walls (circular arcs) — reflection off curves is MUCH harder to implement correctly. Keep all walls as straight line segments.
- **CUT**: Variable launch speed / ball energy that depletes — keep the ball going until it hits all targets or a max bounce count (e.g., 20 bounces).
- **CUT**: "Design your own level" mode — cool but not MVP.
- **SIMPLIFY**: Reflection physics — use the standard geometric reflection formula: reflect the velocity vector across the wall's normal. This is exact for straight walls and mathematically clean.
- **SIMPLIFY**: Limit to 1-2 moveable reflectors per level max. More creates combinatorial explosion that's frustrating, not fun.
- **SIMPLIFY**: Prediction line shows 1-2 bounces max in medium levels, 0 in hard levels. Don't implement full-path prediction.
- **SIMPLIFY**: Max bounces per shot = 15-20. Ball fades out after that to prevent infinite loops.
- **KEEP**: The angle measurement display at bounces — this is the educational core.
- **KEEP**: The slingshot/protractor aiming mechanic — this is what makes it feel good.
- **KEEP**: Multi-target levels — this is what makes it a puzzle, not just aiming practice.
- **KEEP**: Moveable reflectors (in later levels) — this adds the strategic puzzle layer.

---

## Implementation Priority

If the engineering team needs to prioritize, build in this order:

1. **Probability Plinko** — Easiest to implement well. Peg grid is a simple data structure. Ball animation is pre-computed paths. Histogram is basic bar chart. High reward-to-effort ratio.

2. **Vector Voyager** — Clear data model (array of vectors). Drag interaction is standard. Launch animation is straightforward path following. Collision detection with circular obstacles is simple.

3. **Proof Pinball** — Moderate complexity. Line-line intersection and reflection math is well-documented. Main challenge: smooth ball animation along computed path. The aiming UX needs polish.

4. **Trig Turntable** — Most visually complex. Requires smooth continuous animation (requestAnimationFrame loop). Epicycle math is straightforward but rendering stacked rotating circles needs care. Wave trace rendering needs performance attention.

---

## Shared UI Components

All four games should share:
- **Score display**: Star rating + level indicator
- **Level selector**: Grid of levels with star counts
- **Controls panel**: Consistent placement of action buttons (bottom of screen on mobile)
- **Tutorial overlay**: First-level tooltips that point to interactive elements
- **Responsive container**: SVG viewBox-based scaling that works from 320px to 1440px+
- **Back to hub button**: Consistent navigation back to the game selection screen
