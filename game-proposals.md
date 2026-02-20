# Math Game Proposals for High School Students

> Prepared by: Math Education Research Agent
> Purpose: 6-8 interactive game concepts for React/TypeScript + SVG implementation
> Target audience: High school students (grades 9-12)
> Key principle: **Math IS the gameplay mechanic** — not quizzes with decorations

---

## Game 1: "Vector Voyager"

### Math Concept
**Vectors & Linear Algebra (Pre-Calculus / Physics prep)**
- Vector addition and decomposition
- Magnitude and direction
- Scalar multiplication
- Component form (i, j notation)

### How It Works
The player controls a spaceship that can ONLY move by placing vectors. The ship is at a starting position and must reach a target zone, but there are obstacles (asteroids, gravity wells) in the way.

**Core mechanic:** The player draws vectors by clicking and dragging from the ship. Each vector they place gets added to a "flight plan" — a chain of vectors that compose together. The ship follows the resulting path when the player hits "Launch." The player can see the resultant vector update in real-time as they add/modify vectors.

**Levels progress:**
1. Simple: Place one vector to reach the target (learning magnitude + direction)
2. Medium: Reach the target using exactly 2 vectors (decomposition)
3. Hard: Navigate around obstacles using 3+ vectors with a total magnitude budget (optimization)
4. Expert: Wind currents add constant vectors to each segment — the player must compensate

**Scoring:** Stars based on: reaching the target (required), using fewer vectors (bonus), minimizing total distance traveled (bonus), staying under a magnitude budget (bonus).

### Why It's Fun
This is essentially a puzzle game with a satisfying "launch and watch" payoff. Students intuitively feel what vector addition means because they SEE the ship follow their composed path. The "aha moment" comes when they realize breaking a single long vector into two shorter ones lets them curve around obstacles. It feels like planning a heist getaway route, not doing math homework.

### Interaction Model
- **Click + drag** from the ship (or end of last vector) to place a new vector
- **Drag endpoints** to adjust existing vectors in the chain
- **Delete** individual vectors by clicking an X on them
- **Launch button** to execute the flight plan and watch the ship animate along the path
- **Reset** to try again
- Real-time preview shows the path as a dotted line

### Visual Style
- Dark space background with subtle star field (SVG circles with varying opacity)
- Ship as a small SVG triangle/arrow shape
- Vectors drawn as colored arrows with dashed component lines (x and y components shown in lighter color)
- Target zone as a glowing ring
- Obstacles as SVG asteroid shapes (irregular polygons)
- Resultant vector shown as a thicker, differently-colored arrow
- Animated launch sequence: ship slides along the path with a small trail

### Difficulty
**Easy → Hard**, scaling naturally:
- Easy: Open space, 1-2 vectors, generous target zone
- Medium: Obstacles appear, need 2-3 vectors, tighter targets
- Hard: Magnitude budgets, wind currents, narrow corridors
- Could extend to 3D perspective view for advanced students

---

## Game 2: "Curve Crafter"

### Math Concept
**Functions & Graphing (Algebra II / Pre-Calculus)**
- Understanding function behavior (slope, intercepts, asymptotes)
- Function transformations (shifts, stretches, reflections)
- Composing piecewise functions
- Comparing function families (linear, quadratic, exponential, sinusoidal, logarithmic)

### How It Works
The player sees a target curve (a highlighted path) on a coordinate plane. Their job is to recreate it by selecting and transforming mathematical functions. Think of it as a "function mixing board."

**Core mechanic:** The player has a toolbox of base functions (y=x, y=x^2, y=sin(x), y=e^x, y=|x|, etc.). They drag a function onto the canvas, then use sliders/handles to transform it:
- Vertical/horizontal shift (drag the curve)
- Vertical/horizontal stretch (drag handles on the curve)
- Reflection (flip button)
- Domain restriction (drag endpoints to clip the function to a range)

Multiple functions can be placed to create a piecewise approximation of the target.

**The scoring** is based on how closely the player's curve matches the target (calculated as the area between the curves — smaller is better). A real-time "match percentage" shows progress.

**Level types:**
1. "Match this parabola" — single function, just get the transformations right
2. "Build this wave" — combine sin functions with different frequencies
3. "Trace the mountain" — piecewise functions to match a complex natural shape
4. "Speed round" — match as many simple curves as possible in 60 seconds

### Why It's Fun
It turns the abstract idea of function transformations into something tactile and visual. Instead of memorizing "f(x-3) shifts right by 3" as a rule, students DRAG the curve and see it happen. The matching mechanic creates a satisfying puzzle feeling — like a musical ear-training game, but for mathematical curves. The "how close can you get?" scoring creates a natural drive to perfect your answer.

### Interaction Model
- **Drag from toolbox** to place a function on the canvas
- **Drag the curve itself** to translate it (shift)
- **Drag control handles** to stretch/compress
- **Sliders** for precise parameter adjustment (a, b, h, k in y = a*f(b(x-h)) + k)
- **Toggle buttons** for reflection
- **Drag endpoints** to set domain restrictions
- **Match button** to calculate score

### Visual Style
- Clean coordinate grid with axis labels
- Target curve as a thick, semi-transparent colored path (glowing effect)
- Player's functions as solid colored lines (different color per function)
- Control handles as small circles on the curves
- Function equations update live in a panel as the student adjusts
- "Match percentage" as a prominent progress bar
- Satisfying particle burst when match exceeds 95%

### Difficulty
**Easy → Expert**, broad range:
- Easy: Match single transformed functions (shifted parabola, stretched sine)
- Medium: Match curves requiring 2-3 piecewise functions
- Hard: Match complex composite curves (modulated waves, etc.)
- Expert: Timed challenge rounds; matching 3D-projected curves

---

## Game 3: "Proof Pinball"

### Math Concept
**Geometry — Angles, Reflections, and the Properties of Shapes**
- Angle of incidence = angle of reflection
- Interior/exterior angles of polygons
- Properties of inscribed angles and circles
- Symmetry and congruence

### How It Works
A pinball-style game where the "table" is made of geometric shapes, and the ball bounces according to strict geometric rules. The player must use their understanding of angles to aim shots that reach a target.

**Core mechanic:** The player aims and launches a ball from a fixed point. The ball travels in a straight line and bounces off walls/shapes following the reflection law (angle in = angle out). Before launching, the player sees a protractor overlay at the launch point and can set the exact launch angle. The goal is to hit a target point after a specific number of bounces.

**The twist:** The "table" is made of geometric elements the player can manipulate:
- Rotate triangles to change bounce angles
- Extend/retract line segments
- Toggle which sides of a polygon are "active" (reflective)

**Level designs:**
1. Rectangle room — aim for the corner pocket (shows that angle of incidence = reflection)
2. Triangle room — find the angle that creates a closed orbit
3. Circle with inscribed polygon — hit all vertices in order
4. Irregular room — place your own mirror segments to guide the ball

### Why It's Fun
Pinball/pool is inherently satisfying — the "click" of a perfect geometric shot activating a chain of bounces is deeply rewarding. Students develop geometric intuition about angles naturally. The "place your own mirrors" levels turn it into a creative puzzle. It's the kind of game where you want to show your friends: "Look, I can make the ball hit all 5 targets in one shot!"

### Interaction Model
- **Drag a protractor/angle tool** to set launch angle precisely
- **Click "Launch"** to fire the ball
- **Click and drag** geometric elements to rotate/reposition them
- **Slider** to control launch speed (determines how far the ball goes)
- Ball path traces out in real-time with angle measurements displayed at each bounce
- **Ghost line** shows predicted path before launch

### Visual Style
- Geometric, clean table design — think Mondrian meets pinball
- Bright colored geometric shapes (triangles, rectangles, circles) as bumpers/walls
- Ball leaves a traced path showing its trajectory
- Angle measurements appear at each bounce point (small arc with degree label)
- Protractor overlay at the launch point — large, clear, interactive
- Target zones glow and pulse
- Satisfying "chain reaction" visual when ball hits multiple targets

### Difficulty
**Easy → Hard:**
- Easy: Simple rectangular rooms, generous targets, 1-2 bounces needed
- Medium: Polygonal rooms, must hit targets in order, 3-4 bounces
- Hard: Multiple moveable elements, tight angle requirements, 5+ bounces
- Bonus: "Design mode" where students create their own levels

---

## Game 4: "Derivative Dash"

### Math Concept
**Introduction to Calculus — Derivatives and Rates of Change**
- Slope of a curve at a point (tangent lines)
- Relationship between position, velocity, and acceleration
- Increasing/decreasing functions
- Local maxima and minima
- Inflection points

### How It Works
The player controls a character (a little runner) moving along a curvy landscape (a function graph). The landscape IS the function y = f(x). The character's speed at any point is determined by the derivative f'(x) at that point.

**Core mechanic:** The player doesn't control the runner's speed directly — they control the SHAPE of the terrain ahead. Using tools, they can modify the upcoming section of the function to create slopes that speed up or slow down the runner. The goal is to reach the end within a time limit, but also collect "math gems" that appear at specific x-values.

**How terrain editing works:**
- The player sees the next "segment" of terrain as editable control points
- Dragging control points up creates positive slope (runner accelerates right)
- Dragging control points to create steep downslopes makes the runner go faster
- Flat sections = constant speed
- The derivative graph is shown below the main graph in real-time

**Key insight the student learns:** The runner's speed ISN'T about how high or low the terrain is — it's about how steep it is. A student who makes a tall hill thinking "height = speed" will see their runner slow to a crawl going uphill. The one who makes a smooth downward slope sees the runner zoom. This viscerally teaches the difference between f(x) and f'(x).

**Level types:**
1. "Race to the finish" — edit terrain to maximize speed
2. "Collect the gems" — must hit specific speeds at specific x-values
3. "Speed limit" — stay below a maximum speed (derivative constraint)
4. "Smooth landing" — reach x=10 with velocity = 0 (derivative = 0 at endpoint)

### Why It's Fun
The disconnect between "height" and "speed" is genuinely surprising and creates an "aha!" moment that's hard to get from a textbook. Students develop intuition about derivatives by playing with them physically. The real-time derivative graph below creates an instant visual connection. It's like a terrain-builder game crossed with a racing game, but the "cheat code" is understanding calculus.

### Interaction Model
- **Drag control points** on upcoming terrain segments to reshape the curve
- **Play/pause** to start/stop the runner
- **Speed slider** for simulation speed (watch in slow-mo or fast-forward)
- **Toggle** to show/hide the derivative graph below
- **Toggle** to show/hide tangent line at runner's current position
- Runner animates automatically based on the derivative

### Visual Style
- Side-scrolling landscape view — the function curve IS the ground
- Runner character as a simple SVG stick figure or geometric shape
- Terrain as a smooth SVG path with visible control points (when editing)
- Derivative graph shown in a lower panel (same x-axis, different y-axis)
- Tangent line at runner's position shown as a bright arrow (direction = velocity sign, length = speed)
- Gems as small glowing SVG diamonds at specific positions
- Speed-o-meter showing current f'(x) value
- Color gradient on terrain: red for steep positive slope, blue for steep negative, white for flat

### Difficulty
**Medium → Hard** (this is a calculus concept):
- Medium: Simple polynomial terrains, generous time limits, derivative graph always visible
- Hard: More complex functions, tighter constraints, derivative graph hidden (must intuit)
- Expert: Terrain editing disabled — must PREDICT the runner's behavior for a given function
- Extension: Second derivative (acceleration) challenges

---

## Game 5: "Tessellation Station"

### Math Concept
**Geometry — Symmetry, Transformations, and Tessellations**
- Geometric transformations: translation, rotation, reflection, glide reflection
- Regular and semi-regular tessellations
- Interior angles and why certain shapes tile the plane
- Symmetry groups
- Area calculation (filling a region efficiently)

### How It Works
The player is given a target region (like a floor plan or artistic frame) and a set of geometric tiles. They must fill the entire region with no gaps and no overlaps using transformations of the available tiles.

**Core mechanic:** Players select a tile shape and place it by clicking on the target region. They can apply transformations:
- **Rotate** the tile (by 60°, 90°, 120°, or 180° depending on the tile)
- **Reflect** the tile (flip horizontally/vertically)
- **Translate** (drag to position)

Tiles snap to valid positions (grid-aligned or vertex-aligned depending on the tile type).

**Level progression:**
1. "Square Dance" — fill a rectangle with squares and right triangles
2. "Hex Appeal" — fill a hexagonal region with regular hexagons and triangles
3. "Penrose Puzzle" — non-periodic tiling with two rhombus types (kites and darts)
4. "Escher's Workshop" — the player MODIFIES a base tile shape (pulling edges) and the game shows how copies of the modified shape still tessellate (this is how Escher created his famous tessellations!)
5. Free mode — create tessellation art

**Scoring:** Based on coverage percentage, number of tiles used (fewer = bonus), and time.

### Why It's Fun
Tessellations are visually stunning — they're the reason Islamic art and Escher prints are mesmerizing. The puzzle of fitting shapes together is inherently satisfying (think Tetris, but geometric and spatial). The "Escher mode" where students deform a tile and watch copies automatically fill the plane is genuinely magical. Students are creating art while learning about symmetry and angle constraints.

### Interaction Model
- **Click tile** in toolbox to select it
- **Click on canvas** to place tile at that position
- **Drag** placed tile to reposition (snaps to valid positions)
- **Scroll/buttons** to rotate tile before or after placement
- **Flip button** to reflect tile
- **Undo** to remove last placed tile
- In Escher mode: **drag edge points** of a base tile to deform it — all copies update in real-time

### Visual Style
- Clean, bright geometric tiles with distinct colors per shape type
- Target region shown as a highlighted area with subtle grid lines
- Placed tiles have slight borders so the tiling pattern is visible
- Successfully filled regions "light up" with a satisfying glow
- Escher mode: the deformed tile copies create a mesmerizing pattern as the student edits
- Background could shift colors based on the symmetry group used
- Mini-map showing the full tessellation pattern

### Difficulty
**Easy → Expert:**
- Easy: Square grids, simple rectangular regions
- Medium: Hexagonal tiles, L-shaped regions
- Hard: Penrose tiles, irregular boundaries
- Expert: Escher deformation mode (open-ended creativity)

---

## Game 6: "Probability Plinko"

### Math Concept
**Statistics & Probability**
- Discrete probability distributions
- The binomial distribution and its connection to Pascal's triangle
- Expected value
- The normal distribution as a limit of binomial (Central Limit Theorem visualization)
- Conditional probability (modified boards)

### How It Works
A Plinko/Galton board where the player can modify the probabilities at each peg and must predict/achieve target distributions.

**Core mechanic:** Balls drop from the top and bounce left or right at each peg. In the default board, each peg is 50/50 — creating the classic binomial distribution. But the player can MODIFY individual pegs to change their probability (by clicking/dragging a slider on the peg). The player's goal is to match a target distribution shown at the bottom.

**Game modes:**
1. "Match the Shape" — Given a target histogram at the bottom (e.g., uniform, skewed, bimodal), adjust the peg probabilities to make the ball distribution match it. Drop 100 balls to test.
2. "Predict & Drop" — Given a board configuration, predict which bin will get the most balls, then watch 200 balls drop to verify.
3. "Expected Value Challenge" — Each bin has a point value. Adjust pegs to maximize your expected score.
4. "The Long Run" — Watch how the distribution gets smoother as you drop more and more balls (1, 10, 100, 1000) — visceral demonstration of the law of large numbers.

### Why It's Fun
Plinko is already a beloved game (Price is Right!). The modification mechanic makes it a genuine puzzle — "How do I make more balls go right? What if I change just this ONE peg?" The moment when 1000 balls drop and form a perfect bell curve is genuinely awe-inspiring. Students build intuition about probability by SEEING it emerge from simple rules. The expected value mode gamifies a concept that's usually pure calculation.

### Interaction Model
- **Click a peg** to select it, then **drag a slider** to change its L/R probability (50/50 default, adjustable from 0/100 to 100/0)
- **"Drop" button** to drop a batch of balls (1, 10, 50, or 100 at a time)
- **Speed slider** to control animation speed (watch one ball carefully, or blitz 1000)
- **Reset** to clear the collection bins
- **Overlay button** to show the theoretical distribution curve on top of the histogram
- Balls animate physically as they bounce down

### Visual Style
- Classic Galton board layout — triangular grid of pegs with collection bins at the bottom
- Pegs are SVG circles; color indicates their probability (blue = left-biased, red = right-biased, gray = 50/50)
- Balls are small colored circles that animate bouncing down
- Collection bins show a growing histogram in real-time
- Target distribution overlaid as a translucent colored curve
- Pascal's triangle numbers optionally shown at each peg position
- Smooth ball physics animation (not instant teleportation)
- Running statistics shown: mean, std dev, count per bin

### Difficulty
**Easy → Hard:**
- Easy: 4-5 rows, match simple symmetric distributions
- Medium: 7-8 rows, match skewed or bimodal distributions
- Hard: Expected value optimization, conditional probability challenges
- Expert: Multi-stage boards with dependent paths (conditional probability)

---

## Game 7: "Trig Turntable"

### Math Concept
**Trigonometry — Unit Circle, Sine/Cosine, and Harmonic Motion**
- The unit circle and how it generates sine and cosine
- Relationship between angle, coordinates, and trig values
- Amplitude, frequency, and phase shifts of sinusoidal functions
- Parametric equations and Lissajous curves
- Superposition of waves (constructive/destructive interference)

### How It Works
A "music visualizer meets math tool" where the player composes visual patterns by combining rotating circles (think Spirograph meets Fourier series).

**Core mechanic:** The player starts with a point on a rotating circle (the unit circle). This traces out a sine wave on a timeline to the right. The player can:
- Adjust the circle's **radius** (amplitude)
- Adjust the **rotation speed** (frequency)
- Adjust the **starting angle** (phase shift)
- **Stack circles**: attach a second rotating circle to the tip of the first (epicycles!)

The resulting compound motion traces beautiful patterns:
- One circle → sine wave
- Two circles → modulated wave (AM/FM patterns)
- Circle + circle at right angles → Lissajous figures (figure-8, bowties, stars)
- Many circles → approximation of ANY shape (intro to Fourier series!)

**Challenge modes:**
1. "Match the Wave" — given a target waveform, set amplitude/frequency/phase to recreate it
2. "Draw the Shape" — combine epicycles to trace a target shape (square wave, triangle wave)
3. "Frequency Challenge" — listen to a tone (using Web Audio) and match the waveform visually
4. "Art Mode" — free creation of Lissajous figures and spirograph patterns

### Why It's Fun
The visual connection between a spinning circle and a wave is one of the most beautiful ideas in math, and most students never get to SEE it. The epicycle mechanic is endlessly fascinating — it's the same math behind planetary orbits and Fourier analysis. The spirograph-like patterns are gorgeous and share-worthy. Students create stunning mathematical art while building deep intuition about trig functions.

### Interaction Model
- **Drag** the radius handle to change amplitude
- **Slider** for frequency (rotation speed)
- **Drag** the starting point around the circle to change phase
- **"Add Circle" button** to stack a new epicycle
- **Play/Pause** for animation
- **Speed control** for rotation
- In challenge mode: parameters are locked until the student inputs the correct values
- **Export** button to save their creation as an SVG

### Visual Style
- Large unit circle on the left with a rotating radius arm
- Sine wave traces out to the right in real-time (scrolling timeline)
- Epicycles shown as concentric/stacked circles with visible radius arms
- Traced patterns shown as smooth SVG paths in vibrant colors
- Lissajous figures drawn in the center when in parametric mode
- Subtle grid lines for reference
- Glowing trace line with fade-out trail
- Color encodes phase position (hue rotates with angle)

### Difficulty
**Easy → Expert:**
- Easy: Single circle, match basic sine/cosine waves (learn amplitude, frequency, phase)
- Medium: Two circles, match compound waves
- Hard: Match complex waveforms using 3-4 epicycles
- Expert: Fourier art mode — approximate arbitrary shapes with many circles

---

## Game 8: "Combinatorics Conquest"

### Math Concept
**Combinatorics & Discrete Math**
- Permutations vs. combinations
- The multiplication principle
- Pascal's triangle and binomial coefficients
- Pigeonhole principle
- Graph coloring (intro to graph theory)

### How It Works
A territory-control strategy game where the player must use combinatorial reasoning to make optimal decisions.

**Core mechanic:** The player sees a map divided into regions (like a simplified Risk board). Each turn, they must assign colors/resources to regions following specific constraints. The challenge is fundamentally a **graph coloring problem** disguised as a conquest game.

**Game modes:**

1. **"Color Commander"** — Given a map, color all regions using the FEWEST colors possible such that no two adjacent regions share a color. The map is secretly a planar graph. Starts simple (3 regions) and builds to complex maps requiring 4 colors (leading to the famous Four Color Theorem).

2. **"Arrangement Arena"** — Place numbered tokens (1 through N) in a grid such that each row and column meets certain sum/product constraints. This is permutation/arrangement puzzles. Essentially Sudoku-like but with mathematical constraints.

3. **"Path Counter"** — Given a grid city, count the number of shortest paths from corner A to corner B (combinatorics! it's C(m+n, m)). The player visualizes paths by clicking through the grid, and the game tracks unique paths found. Can you find them all?

4. **"The Handshake Problem"** — N people are at a party. The player must draw all possible handshakes (edges in a complete graph). How many handshakes for N people? The answer is C(N,2). Player drags lines between people and counts — building intuition for the formula.

### Why It's Fun
Graph coloring is an NP-hard problem in general — even small cases feel like real puzzles. The territory conquest theme makes it feel strategic rather than mathematical. The path-counting mode turns a formula (C(m+n,m)) into an exploration game. The handshake problem makes abstract counting concrete. Each mode targets a different combinatorial concept but they all feel like strategy/puzzle games, not homework.

### Interaction Model
- **Color Commander:** Click a region, then click a color from a palette. Invalid colorings flash red.
- **Arrangement Arena:** Drag numbered tokens into grid cells. Constraint satisfaction shown in real-time (green checkmarks / red X).
- **Path Counter:** Click grid intersections to trace paths. Counter shows "Found X of Y paths."
- **Handshake Problem:** Drag lines between SVG person icons. Running count shows progress.

### Visual Style
- **Color Commander:** Map-style regions with bold outlines, flat colors. Think Google Maps meets political map. Adjacency shown clearly.
- **Arrangement Arena:** Clean grid with number tokens as circles/chips. Constraint equations shown on row/column headers.
- **Path Counter:** Grid city from above, with streets as lines. Traced paths highlighted in different colors. Pascal's triangle overlay available as a hint.
- **Handshake Problem:** People arranged in a circle as SVG icons. Handshake lines drawn between them. Counter and formula shown.

### Difficulty
**Easy → Hard:**
- Easy: 3-5 regions (Color Commander), 3x3 grids (Arrangement), 2x2 path grid
- Medium: 8-12 regions, 4x4 grids, 3x4 path grid
- Hard: Complex maps requiring 4 colors, constraints with products/primes, 5x5+ grids
- Expert: "Prove it" mode — after solving, the student must predict the count before revealing

---

## Summary Comparison Table

| # | Game | Math Topic | Interaction Type | Visual Appeal | Difficulty Range |
|---|------|-----------|-----------------|---------------|-----------------|
| 1 | Vector Voyager | Vectors & Linear Algebra | Drag to place vectors, launch & watch | Space theme, arrow graphics | Easy → Hard |
| 2 | Curve Crafter | Functions & Graphing | Drag curves, adjust parameters | Coordinate plane, glowing curves | Easy → Expert |
| 3 | Proof Pinball | Geometry & Angles | Aim angles, place mirrors | Geometric pinball table | Easy → Hard |
| 4 | Derivative Dash | Intro to Calculus | Edit terrain control points | Side-scrolling landscape | Medium → Hard |
| 5 | Tessellation Station | Symmetry & Transformations | Place and transform tiles | Colorful geometric patterns | Easy → Expert |
| 6 | Probability Plinko | Statistics & Probability | Adjust peg probabilities | Galton board with histogram | Easy → Hard |
| 7 | Trig Turntable | Trigonometry & Unit Circle | Adjust circles, watch waves form | Spirograph-like patterns | Easy → Expert |
| 8 | Combinatorics Conquest | Combinatorics & Graph Theory | Color regions, count paths | Map/graph visuals | Easy → Hard |

## Recommendations for Top 4

If we're narrowing to 3-4 games, my top picks for the best combination of **math coverage, visual impact, and fun factor** would be:

1. **Probability Plinko** — Universally appealing, easy to understand, stunning emergent visuals, covers a topic students often find dry
2. **Trig Turntable** — The most visually spectacular, creates genuine "wow" moments, perfect for SVG
3. **Vector Voyager** — Great puzzle mechanics, satisfying gameplay loop, teaches a foundational concept
4. **Curve Crafter** OR **Derivative Dash** — Either covers the function/calculus space beautifully. Curve Crafter is more accessible; Derivative Dash has a stronger "aha" moment.

**Why these 4?** They cover 4 distinct areas of math (probability, trig, vectors, functions/calculus), they all have strong visual identities for SVG, and they each have a fundamentally different interaction model (adjust & observe, compose & create, aim & solve, edit & simulate). None of them are quizzes — math IS the game in every case.
