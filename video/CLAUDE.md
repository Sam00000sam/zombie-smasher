# Video project — how to make these quickly and right the first time

Vertical (1080×1920, 30 fps) narrated explainers in Remotion, in the **neon-3D style** of the user's
TikTok references: black world, floor grid, neon line-art props on wireframe pedestals, light cones,
glossy white pawns with gold ties, one-word captions. The user's standing preferences:

- **No music.** Female narration (Kokoro `af_heart`, speed 1.08), also exported as a WAV. **A few clean
  SFX** (from `scripts/make_sfx.py`: whoosh on camera moves, pop on a key reveal, chime on a price,
  shimmer on a fill) via `SfxTrack` in `src/v12/ui.tsx` — about one every 3 s, ~15 dB under the voice.
- **No "illustrative" labels** on screen.
- **Visuals must match the narration** word-for-word; key words get a visual beat.
- **Clean motion**: one easing, fade + small settle, draw-on line art. No bounce, jitter or hopping.
- **The camera orbits** (360°-style arcs around each set), not just front-on dollies.
- **30 fps** (not 60). **Original palette only**: gold, white, black; red/green only on prices. No
  rainbow colours. **People are the original glossy white pawns with gold ties** (`pawn()` in the engine),
  not lathe/chess-piece figures. No bag-filled shelves or busy grids — keep every shot clean and simple.
- Finish: bloom (two blurred screen-blend copies of the scene layer), neon-tube edges (`tube: true`)
  and a moving light (`light: sweep(t)`) on `solid()` meshes — see `src/v14/Reel.tsx`.
- **TikTok-safe framing**: nothing important under the top tabs, the right-hand buttons or the
  bottom caption area. Don't add safety disclaimers about fakes; "illustrative" notes on prices are fine.

## Pipeline (run from `video/`)

1. Script → `voiceover/scripts/<name>.json` (lines with pauses), then
   `cd voiceover && .venv/bin/python make_voice.py scripts/<name>.json af_heart 1.08`
   and `HF_HUB_DISABLE_XET=1 .venv/bin/python align.py scripts/<name>.json`.
   Read the aligner's "missing/interpolated" output; numbers are handled (digits → words).
2. `src/vN/timing.ts`: `line()` / `word(w, after)` cues. **Always pass `after = line.start` for any
   word that appears more than once** ("tell", "three", "hundred", "another", "no"…) — the first
   match is often in an earlier line.
3. Camera: an **orbit rig** (`src/v10/camera.ts`): target point + distance + angle; interpolate the
   rig, not positions, so moves are arcs. `setView({ f: 1010, cx: 500, cy: 770, billboard: true })`
   and `floor(c, [], 1, true)` for orbit shots (labels face the camera; grid covers all directions).
4. **Layout check (no rendering, ~30 s):** `npx tsx scripts/layout.ts src/vN/<Comp>.tsx 2` — the
   module exports `layoutFrame(fr)` and `<NAME>_FRAMES`; every `slab`/`mesh` from `src/v11/three.tsx`
   registers its screen box. Fix until it prints `layout OK` (text×text, text×object, captions,
   TikTok zones, off-frame).
5. Review **before** a full render: `node scripts/stills.mjs <CompId> <scratchDir> [frames…]` →
   contact sheet with TikTok zones shaded red. Fix everything visible in one pass.
6. Render: `npx remotion render src/index.ts <CompId> deliverables/<name>.mp4
   --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --codec=h264 --crf=17`
7. Check: `voiceover/.venv/bin/python scripts/check.py deliverables/<name>.mp4 public/voice/<name>.wav <scratchDir>`
   Want: audio lag 0 / corr > 0.99, motion max < ~10, no long dark runs. It writes `spikes.png`
   around the worst frame — look at it before re-rendering.
8. Copy the narration WAV into `deliverables/`, commit, push, send.

## Full 3D — use the solid renderer (src/v12/solid.tsx)

`solid()` draws meshes with culled back faces, lit fills, crease/silhouette outlines, a contact shadow
and a floor reflection; builders `extrudeS`, `latheS` (figures, pedestals), `cylS`, `boxS`, `thicken`
(handles, rings), models in `src/v12/models.ts`; orbit rig `src/v12/rig.ts`; slabs, SFX and lens in
`src/v12/ui.tsx`. Close-up pans between two subjects need ~30 frames, not 16.

## Older 3D (src/v11/three.tsx)

Use real 3D for everything: `extrude` / `box` / `cylinder` meshes (lit translucent faces + glowing
edges, `decal` lines on the front face) and `slab` text — an HTML panel mapped onto a 3D plane with
a homography and extruded with darker layers. Slabs face `c.yaw - 0.22` so they trail the orbit and
show their depth; props sway around `c.yaw` instead of spinning (never edge-on). Models live in
`src/v11/models.ts` (bag, suitcase, phone, safe, clock).

## Mistakes already made — don't repeat them

- **Departing station swells into the lens.** Fade a station out within the first ~5 frames of the
  flight that leaves it (`fade(…, flightStart + 3..5)` with an 8-frame fade), never after.
- **Empty hand-offs.** The next station's set (frames, pedestals, axes, cards) must already be
  standing (dimmed/undrawn) while the camera flies in; cue-driven reveals are the details only.
- **Objects that travel with the camera** (a bag on a conveyor) must be locked to the rig's own
  progress (`rigAt(fr).tz`), not to a separate easing, or the camera overtakes them.
- **A flight's mid-key placed too far forward** makes the camera cover the distance in a few frames.
- **Layout collisions**: chips under signs, labels on top of other labels, text wider than ~860 px.
  Check every station on the contact sheet; keep side content within x ±420 at 1000 units away.
- **Right edge**: TikTok's buttons cover x > ~940 from y 600–1500; keep pop-ups and panels in.
- **Captions** sit in their own band below the scene: `CAPTION_TOP = 1400`, centred at x 500, with the
  lens `VIEW_TT` (cy 720) keeping the 3D content above ~y 1330. Never let captions cover the scene.
- **Bright floor-level lines near the camera** (belts, paths) streak through the caption area: fade
  them by near distance.
- `card` billboards only when `VIEW.billboard` is on; an explicit `yaw` on a card fights an orbit.
- For a side-on lane, lay cards out in the *screen* plane (helper `S(sx, y, depth, base)` in
  `src/v10/Journey.tsx`), or they stack in depth and overlap.
- A big bright object (a wall of cubes) fading out in 8 frames reads as a flash: start departure fades
  ~6 frames before the flight and run them over ~12 frames.
- Show a faint "ghost" of anything that fills up (cube walls, stacks) from the moment the station
  appears, so the frame isn't empty before the count starts.
- Don't start a hook price tag counting from $0 when the narration says the full price — land it on the word.
- The `rm` safety check blocks `rm $VAR/*`; use `"${VAR:?}"/…` or literal paths.
