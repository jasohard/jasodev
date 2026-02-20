# Trig Turntable — Level Progression Redesign

> **Author:** Math Education Specialist
> **Purpose:** Fix the difficulty cliff between levels 3 and 4
> **Audience:** Engineering team implementing the level changes

---

## 1. Diagnosis: Why the Jump Is So Hard

### What changes between Level 3 and Level 4

| Aspect | Level 3 | Level 4 | Change |
|--------|---------|---------|--------|
| Circles | 1 | 2 | +1 (new concept) |
| Parameters to set | 3 (A, f, φ) | 6 (A₁, f₁, φ₁, A₂, f₂, φ₂) | Doubled |
| Concept | "One sine wave" | "Sum of two sine waves" | Superposition |
| Visual output | Smooth sine curve | Modulated compound curve | Qualitatively different |
| Strategy | Match by trial and error on 3 sliders | Must decompose a compound wave, then tune 6 sliders | Requires analytical thinking |

### The missing concepts (in order of importance)

**1. "What IS wave addition?"**
The student has never seen what happens when you add two waves together. They've only interacted with single sine waves. When the target suddenly looks "wobbly" or "bumpy" instead of smooth, they don't have a mental model for WHY it looks that way. They're expected to intuit that the wobbles come from a second, faster wave riding on top of the first — but nothing has taught them this.

**2. "How do I decompose a compound wave into parts?"**
Even if a student understands that two waves were added together, they have no strategy for figuring out the two components. In math education we call this the "inverse problem" — students can compose (add two waves and see what happens) long before they can decompose (see a compound wave and work backward to the components). The current level 4 jumps straight to the inverse problem without ever letting students practice the forward direction.

**3. "What does each circle contribute to the combined wave?"**
The existing UI shows individual wave traces when multiple circles are active (faded polylines per circle). But on level 3, the student only has one circle, so they've never seen these individual traces. When they add a second circle on level 4, they may not notice or understand the faded traces as decomposed components.

**4. "How do I know I need a second circle?"**
The hint says "Tap the + button to add a second circle" — but this is a procedural instruction, not conceptual understanding. The student doesn't know WHY they need a second circle. They might try to match the bumpy target with a single circle, get frustrated, and give up.

**5. Too many degrees of freedom at once.**
Going from 3 to 6 adjustable parameters doubles the search space. Each parameter interacts with the others in the combined wave. Without guidance about which parameters to fix first, students resort to random slider-wiggling.

### Pedagogical principle being violated

In math education, we follow a principle called **"one new variable at a time."** Every level should introduce exactly ONE new concept or skill. Level 4 introduces:
- The concept of wave addition (new)
- A second circle with 3 new parameters (new)
- The need to decompose a compound wave (new)
- Individual wave traces as a visual aid (new)

That's four new things at once. We need to spread them across 3-4 intermediate levels.

---

## 2. Intermediate Level Designs

I'm proposing **3 new levels** to insert between current Level 3 ("Shift It") and current Level 4 ("Two Circles"). These follow a careful scaffolding sequence:

### New Level 4: "Wave Cocktail" (Observation Level)

**Learning goal:** Understand that two sine waves can be added together to make a new shape. See the relationship between individual components and their sum.

**How it works:**
- The player does NOT adjust anything on this level. Instead, they WATCH.
- Two circles are pre-configured and spinning. The game shows:
  - Circle 1's individual wave trace (blue, faded)
  - Circle 2's individual wave trace (pink, faded)
  - The combined wave (bright, thick) — which is visibly the sum of the two
- A **"Show Components" toggle** is ON by default. When on, individual traces are shown alongside the sum. When toggled off, only the combined wave is shown.
- The player's only task: tap a **"I See It!"** button to confirm they understand, which auto-completes the level with 3 stars.
- Before the button appears, a brief animated sequence plays:
  1. First, only circle 1 and its wave appear (2 seconds)
  2. Then circle 2 and its wave fade in (2 seconds)
  3. Then the combined wave draws itself, visibly as the vertical sum of the two (2 seconds)
  4. A text overlay says: **"The thick wave = blue wave + pink wave, added together at every point"**

**Target wave parameters:**
```
Circle 1: amplitude=1.0, frequency=1, phase=0    (blue)
Circle 2: amplitude=0.5, frequency=3, phase=0    (pink)
```
(These are the same as the current Level 4 target, so the student has already seen this exact wave when they reach the "real" challenge.)

**Technical implementation:**
- `initialCircleCount: 2` (start with 2 circles)
- `maxCircles: 2`
- `lockedParams: ['amplitude', 'frequency', 'phase']` — everything locked
- `starThresholds: [0, 0, 0]` — auto-pass (any score earns 3 stars)
- Add a new optional field to `LevelConfig`: `observationMode: boolean` — when true, show the animated intro sequence and the "I See It!" button instead of normal scoring
- Hint: `"Watch how two waves combine! The bright wave is the sum of the blue and pink waves."`

**Why this level matters:**
It gives the student a mental model BEFORE asking them to act. They can stare at the compound wave and relate it to its parts. The toggle lets them practice "seeing" the components inside the sum. This is the single most important scaffolding step.

---

### New Level 5: "Wobble Match" (One Circle Free, One Pre-Set)

**Learning goal:** Practice matching a compound wave when you only need to adjust ONE circle. Reduce the search space from 6 parameters to 3.

**How it works:**
- The target is a compound wave made of two circles (same as Level 4's target).
- Circle 2 is **pre-configured and locked** with the correct values (amplitude=0.5, frequency=3, phase=0). The player can see Circle 2's wave trace (faded pink).
- Circle 1 starts with default values (amplitude=1.0, frequency=1, phase=0 — which are actually the correct values, but the player needs to verify/discover this).
- Wait — that would be too easy if the defaults happen to match. Let me adjust:
- Circle 1 starts with slightly WRONG values: amplitude=0.7, frequency=1, phase=0. The player must adjust amplitude (and only amplitude, since freq and phase happen to match) to get a good score.
- Actually, let's make it more interesting: the target should require non-trivial adjustment of circle 1.

**Revised target and setup:**
```
Target wave:
  Circle 1: amplitude=1.2, frequency=1, phase=π/4   (blue)
  Circle 2: amplitude=0.6, frequency=2, phase=0      (pink)

Player starts with:
  Circle 1: amplitude=1.0, frequency=1, phase=0      (needs adjustment: amplitude + phase)
  Circle 2: amplitude=0.6, frequency=2, phase=0      (LOCKED — already correct)
```

The player only needs to find the right amplitude and phase for Circle 1 — that's just 2 parameters, not 6. But they're doing it in the context of a compound wave, so they see how their changes to Circle 1 affect the combined output.

**Technical implementation:**
- `initialCircleCount: 2`
- `maxCircles: 2`
- Add a new optional field to `LevelConfig`: `lockedCircleIndices: number[]` — list of circle indices whose parameters are fully locked. Here: `[1]` (circle 2 is locked).
- `lockedParams: []` — Circle 1's parameters are free
- `starThresholds: [60, 80, 95]`
- Hint: `"The pink wave (circle 2) is already set correctly. Just adjust circle 1 (blue) to match the target!"`
- The individual wave traces should be **shown by default** (not just when toggled) to reinforce the decomposition.

**Why this level matters:**
The student is practicing the adjustment skill in the compound wave context, but with reduced complexity. They learn that "adjust circle 1" changes the combined wave in predictable ways. They also see that circle 2's contribution stays constant — building the mental model of independence.

---

### New Level 6: "Build the Wobble" (Add Circle 2 Yourself, Guided)

**Learning goal:** Practice adding a second circle and adjusting its parameters, with strong hints about what values to try.

**How it works:**
- The player starts with 1 circle (like levels 1-3).
- The target wave is clearly "wobbly" — it's a compound wave made of 2 circles.
- The hint says: **"This wave looks bumpy — one circle can't make those bumps. Tap + to add a second circle. Try making it smaller and faster!"**
- When the player adds Circle 2, a **follow-up hint** appears: **"Circle 2 makes the small rapid bumps. Try: amplitude ≈ 0.4, frequency ≈ 3. Then fine-tune circle 1 for the overall shape."**
- The target is chosen so that the two components are VERY different in character (one slow and large, one fast and small) — making decomposition intuitive.

**Target wave:**
```
Circle 1: amplitude=1.3, frequency=1, phase=0    (the big slow wave)
Circle 2: amplitude=0.4, frequency=4, phase=0    (the small fast ripple)
```

This target produces a clearly "rippled sine wave" — the dominant shape is an obvious sine, with small fast oscillations on top. Even without formal training, most students can see "big smooth curve + small fast wiggles."

**Technical implementation:**
- `initialCircleCount: 1` (player starts with 1 circle, must add the second)
- `maxCircles: 2`
- `lockedParams: []`
- `starThresholds: [55, 75, 90]` (slightly more forgiving since this is the first "real" 2-circle challenge)
- Add a new optional field to `LevelConfig`: `secondaryHint: string | null` — a hint that appears when the player adds a second circle
- Primary hint: `"This wave is bumpy — one circle can't make those bumps! Tap + to add a second circle."`
- Secondary hint: `"Nice! Circle 2 controls the small ripples. Try: amplitude ≈ 0.4, frequency ≈ 4. Then adjust circle 1 for the big shape."`

**Why this level matters:**
This is the first level where the player does the full workflow: see a compound wave, recognize it needs two circles, add one, and adjust both. But it's a much easier version than the old Level 4:
- The two components are very different (large/slow vs. small/fast), making decomposition obvious
- Explicit parameter suggestions in the hint reduce search space anxiety
- Phase is 0 for both circles, eliminating one dimension of complexity
- Forgiving star thresholds

---

## 3. In-Game Guidance Suggestions

### A. Show individual wave traces by default on multi-circle levels

**Current behavior:** Individual wave traces (faded polylines per circle) appear when `circles.length > 1`. This is good, but the traces are very faint (opacity 0.15-0.3) and students may not notice them.

**Recommendation:**
- On levels 4-7 (the new levels + the compound ones), increase the individual trace opacity to 0.35-0.5
- Add a subtle **label** near each trace: "Circle 1" / "Circle 2" in the matching color, positioned near the left edge of the wave area
- Add a **"Show Components" toggle button** in the transport bar that turns individual traces on/off. Default: ON for levels 4-7, OFF for Art Mode

### B. Animated "wave addition" visualization

On the observation level (new Level 4, "Wave Cocktail"), implement a brief animation showing how two waves combine. The sequence:

1. **Phase 1 (0-2s):** Show only Circle 1 spinning + its wave trace. Caption: "Wave 1"
2. **Phase 2 (2-4s):** Circle 2 fades in + its wave trace. Caption: "Wave 2"
3. **Phase 3 (4-6s):** A dotted vertical line sweeps across the wave area from left to right. At each position, it shows the two individual y-values and their sum. The combined wave draws itself as the line sweeps. Caption: "Wave 1 + Wave 2 = Combined Wave"
4. **Phase 4 (6s+):** Everything is visible. The "I See It!" button appears.

This is the most impactful single visualization we can add. It directly shows what "adding waves" means — at every x-position, you stack the two y-values.

### C. "Decomposition hint" visual

On levels where the player needs to figure out the composition, add an optional **"Show Decomposition" button** (maybe a 🔍 icon) that temporarily separates the target wave into its component waves with a smooth animation:

1. The compound target wave splits vertically into its components
2. Each component slides to a slightly different vertical position (offset by ±30px)
3. Labels appear: "Part 1: A=1.3, f=1" and "Part 2: A=0.4, f=4"
4. After 3 seconds, they merge back together

Using this hint could cost the player a star (max 2 stars if hint was used) — creating a trade-off between getting help and getting a perfect score.

### D. Contextual tooltips per parameter

When the player adjusts a parameter, show a brief tooltip explaining what's changing:

- **Amplitude slider moved:** "↕ Amplitude = height of the wave"
- **Frequency slider moved:** "↔ Frequency = how many cycles fit in the window"
- **Phase slider moved:** "← → Phase = where the wave starts"

These should only appear the FIRST time each slider is adjusted (not on every interaction).

### E. "Getting warmer" feedback

On compound levels, in addition to the overall match score, show a **per-circle mini-score** next to each circle tab:
- "Circle 1: 87% match" / "Circle 2: 42% match"
- This requires comparing each player circle against the closest target circle (by frequency matching, since amplitude and phase can vary)

This helps the student know WHICH circle needs more adjustment, rather than blindly wiggling all 6 sliders.

### F. Visual cues for wave superposition

Several additional visual approaches to make superposition intuitive:

1. **Vertical addition bars**: At 5-6 evenly spaced x-positions on the wave area, draw thin vertical bars showing: Circle 1's y-value (colored segment), Circle 2's y-value (colored segment stacked on top), and the combined y-value (bright dot at the top of the stack). This is the "stacking" visualization of wave addition.

2. **Color mixing metaphor**: When two circles are active, the combined wave could use a color that's a blend of the two circle colors (e.g., blue + pink = purple). The individual traces stay in their original colors. This subtly reinforces "this wave is made of those two."

3. **Amplitude envelope**: Show a faded "envelope" curve (the upper and lower bounds of the combined wave) as a hint about the overall amplitude. For a compound wave, the envelope shows the beat pattern, which helps students see the interaction.

---

## 4. Revised Full Level Progression

| # | Name | Circles | Free Params | New Concept Introduced | Difficulty |
|---|------|---------|-------------|----------------------|------------|
| 1 | Meet the Sine Wave | 1 | Amplitude only | What amplitude looks like | ⬜⬜⬜⬜⬜ |
| 2 | Speed It Up | 1 | Amplitude + Frequency | What frequency looks like | ⬜⬜⬛⬜⬜ |
| 3 | Shift It | 1 | All 3 (A, f, φ) | What phase looks like | ⬜⬜⬛⬛⬜ |
| 4 | Wave Cocktail | 2 (observe) | None (observation) | **Two waves add together** | ⬜⬜⬜⬜⬜ |
| 5 | Wobble Match | 2 (1 locked) | 3 (circle 1 only) | **Adjusting one circle in a compound wave** | ⬜⬜⬛⬛⬜ |
| 6 | Build the Wobble | 1 → 2 | All 6 (guided) | **Adding a circle + guided decomposition** | ⬜⬜⬛⬛⬛ |
| 7 | Two Circles | 1 → 2 | All 6 | Independent 2-circle matching (no parameter hints) | ⬜⬛⬛⬛⬛ |
| 8 | Make a Square Wave | 1 → 4 | All (4 circles) | Fourier series — many circles | ⬛⬛⬛⬛⬛ |
| 9 | Art Mode | 1 → 4 | All | Free creation | N/A |

### Rationale for each transition:

- **1→2:** One new parameter (frequency). Amplitude stays relevant.
- **2→3:** One new parameter (phase). Player already knows amplitude and frequency.
- **3→4:** One new CONCEPT (wave addition). Zero new controls — purely observational. This is the critical scaffolding step.
- **4→5:** One new SKILL (adjusting a circle in a compound context). Only 2-3 free parameters because circle 2 is pre-set. The player practices the motor skill of "tune one circle while the other stays fixed."
- **5→6:** One new SKILL (adding a circle + decomposing a target). Guided by hints with explicit parameter suggestions. Phase is 0 for both circles, reducing one dimension.
- **6→7:** Remove training wheels. Same task as Level 6 but without parameter hints, with non-zero phase on one circle, and with tighter star thresholds. This is the "real" two-circle challenge.
- **7→8:** Scaling up from 2 to 4 circles. The student already understands wave addition from levels 4-7, so adding more circles is a natural extension, not a conceptual leap.
- **8→9:** Open sandbox. No scoring pressure. Creative exploration.

---

## 5. Detailed New Level Specifications

### Level 4: "Wave Cocktail"

```typescript
{
  id: 4,
  name: 'Wave Cocktail',
  subtitle: 'Watch two waves become one',
  targetCircles: [
    { id: 'target-1', amplitude: 1.0, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
    { id: 'target-2', amplitude: 0.5, frequency: 3, phase: 0, color: CIRCLE_COLORS[1] },
  ],
  initialCircleCount: 2,
  maxCircles: 2,
  lockedParams: ['amplitude', 'frequency', 'phase'],
  starThresholds: [0, 0, 0],  // Auto-pass
  hint: 'Watch how two waves combine! The bright wave is the SUM of the blue and pink waves at every point.',
  artMode: false,
  // NEW FIELDS:
  observationMode: true,  // triggers animated intro + "I See It!" button
}
```

**What the player sees:**
1. Animated intro showing the waves building up (see Section 3B)
2. Two pre-configured circles spinning with visible individual traces
3. The combined wave clearly shown as the sum
4. A prominent "I See It! →" button to proceed

**Controls available:** Play/Pause, Speed (for replaying the animation). No parameter sliders.

**Star rating:** Automatic 3 stars upon clicking "I See It!"

---

### Level 5: "Wobble Match"

```typescript
{
  id: 5,
  name: 'Wobble Match',
  subtitle: 'One circle is set — match the other',
  targetCircles: [
    { id: 'target-1', amplitude: 1.2, frequency: 1, phase: Math.PI / 4, color: CIRCLE_COLORS[0] },
    { id: 'target-2', amplitude: 0.6, frequency: 2, phase: 0, color: CIRCLE_COLORS[1] },
  ],
  initialCircleCount: 2,
  maxCircles: 2,
  lockedParams: [],
  starThresholds: [60, 80, 95],
  hint: 'Circle 2 (pink) is already perfect! Just adjust circle 1 (blue) — tweak its amplitude and phase to match the target.',
  artMode: false,
  // NEW FIELDS:
  lockedCircleIndices: [1],  // Circle 2 is fully locked
}
```

**What the player sees:**
- Two circles spinning; circle 2 has a "lock" icon overlay
- Individual wave traces for both circles (higher opacity than normal, ~0.4)
- Circle 2's tab in the control panel shows "🔒 Locked" and cannot be selected
- Only circle 1's sliders are interactive

**Controls available:** Amplitude, Frequency, Phase sliders (circle 1 only). Play/Pause, Speed, Check, Reset.

**Player's initial state:**
- Circle 1: amplitude=1.0, frequency=1, phase=0 (needs: amplitude→1.2, phase→π/4)
- Circle 2: amplitude=0.6, frequency=2, phase=0 (locked, already correct)

**Star rating:** Based on match score vs thresholds [60, 80, 95].

---

### Level 6: "Build the Wobble"

```typescript
{
  id: 6,
  name: 'Build the Wobble',
  subtitle: 'This wave needs TWO circles',
  targetCircles: [
    { id: 'target-1', amplitude: 1.3, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
    { id: 'target-2', amplitude: 0.4, frequency: 4, phase: 0, color: CIRCLE_COLORS[1] },
  ],
  initialCircleCount: 1,
  maxCircles: 2,
  lockedParams: [],
  starThresholds: [55, 75, 90],
  hint: 'This wave is bumpy — one circle can\'t make those bumps! Tap + to add a second circle.',
  artMode: false,
  // NEW FIELDS:
  secondaryHint: 'Nice! Circle 2 controls the small ripples. Try amplitude ≈ 0.4, frequency ≈ 4. Then fine-tune circle 1 for the big shape.',
}
```

**What the player sees:**
- Initially: 1 circle, a clearly "bumpy" target wave
- The "+ Add" button is prominently visible
- After adding Circle 2, the secondary hint appears with parameter suggestions
- Individual wave traces appear once both circles are active
- Forgiving star thresholds encourage experimentation

**Controls available:** Full parameter controls for both circles. Play/Pause, Speed, Check, Reset.

**Player's initial state:**
- Circle 1: amplitude=1.0, frequency=1, phase=0 (default)
- After adding: Circle 2: amplitude=1.0, frequency=2, phase=0 (default — needs significant adjustment)

**Why this target works:**
- freq=1 vs freq=4 is a very clear difference — the "big smooth shape" vs "fast little ripples" decomposition is visually obvious
- Both phases are 0, reducing the parameter space
- The frequency ratio (1:4) means the ripples are clearly separate from the main wave, not interleaved in a confusing way

**Star rating:** [55, 75, 90] — more forgiving since this is the player's first fully independent 2-circle challenge.

---

### Revised Level 7: "Two Circles" (formerly Level 4)

```typescript
{
  id: 7,
  name: 'Two Circles',
  subtitle: 'The full challenge',
  targetCircles: [
    { id: 'target-1', amplitude: 1.0, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
    { id: 'target-2', amplitude: 0.5, frequency: 3, phase: Math.PI / 6, color: CIRCLE_COLORS[1] },
  ],
  initialCircleCount: 1,
  maxCircles: 4,
  lockedParams: [],
  starThresholds: [60, 80, 92],
  hint: 'Combine two waves to match the target. Look for the big shape (circle 1) and the small ripples (circle 2).',
  artMode: false,
}
```

**Changes from original Level 4:**
- Now at position 7 instead of 4
- Added a non-zero phase (π/6) on circle 2 — this is a meaningful difficulty increase that's now appropriate because the player has had 3 levels of compound wave practice
- Less hand-holding in the hint (no "tap the + button" instruction — they know this now)
- `maxCircles: 4` allows overcompensation (player could try to use 3+ circles, which is a valid learning experience about parsimony)

---

### Summary of all LevelConfig changes needed

**New fields to add to the `LevelConfig` type:**

```typescript
interface LevelConfig {
  // ... existing fields ...

  /** If true, this is a watch-only level with an animated intro and "I See It!" button */
  observationMode?: boolean

  /** Indices of circles whose parameters are fully locked (player can't adjust them) */
  lockedCircleIndices?: number[]

  /** A second hint that appears when the player adds a circle (for guided levels) */
  secondaryHint?: string | null
}
```

**Renumbered levels:**

| Old ID | New ID | Name |
|--------|--------|------|
| 1 | 1 | Meet the Sine Wave |
| 2 | 2 | Speed It Up |
| 3 | 3 | Shift It |
| (new) | 4 | Wave Cocktail |
| (new) | 5 | Wobble Match |
| (new) | 6 | Build the Wobble |
| 4 | 7 | Two Circles (modified) |
| 5 | 8 | Make a Square Wave |
| 6 | 9 | Art Mode |

---

## Appendix: What NOT to Do

Some approaches that seem tempting but would be pedagogically counterproductive:

1. **DON'T** just add more text hints to the existing Level 4. Text instructions don't replace experiential learning. The student needs to SEE wave addition before being asked to DO it.

2. **DON'T** make an intermediate level that's "two circles but easier numbers." The problem isn't the specific numbers — it's the conceptual leap of wave superposition itself.

3. **DON'T** add a formal "wave addition lesson" screen with equations and diagrams. This is a game, not a textbook. The observation level (Wave Cocktail) teaches the same concept through play.

4. **DON'T** hide the individual wave traces on compound levels. They're the most important visual scaffolding we have. Make them MORE prominent, not less.

5. **DON'T** auto-decompose the target wave for the player. The whole point is that they develop the skill of decomposition through guided practice (levels 5-6) before doing it independently (level 7).
