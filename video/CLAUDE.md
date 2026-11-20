# Video project — how to make these quickly and right the first time

Vertical (1080×1920, 30 fps) narrated explainers in Remotion, in the **neon-3D style** of the user's
TikTok references: black world, floor grid, neon line-art props on wireframe pedestals, light cones,
glossy white pawns with gold ties, one-word captions. The user's standing preferences:

- **No music, no SFX.** Female narration only (Kokoro `af_heart`, speed 1.08), also exported as a WAV.
- **Visuals must match the narration** word-for-word; key words get a visual beat.
- **Clean motion**: one easing, fade + small settle, draw-on line art. No bounce, jitter or hopping.
- **The camera orbits** (360°-style arcs around each set), not just front-on dollies.
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
4. Review **before** a full render: `node scripts/stills.mjs <CompId> <scratchDir> [frames…]` →
   contact sheet with TikTok zones shaded red. Fix everything visible in one pass.
5. Render: `npx remotion render src/index.ts <CompId> deliverables/<name>.mp4
   --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --codec=h264 --crf=17`
6. Check: `voiceover/.venv/bin/python scripts/check.py deliverables/<name>.mp4 public/voice/<name>.wav <scratchDir>`
   Want: audio lag 0 / corr > 0.99, motion max < ~10, no long dark runs. It writes `spikes.png`
   around the worst frame — look at it before re-rendering.
7. Copy the narration WAV into `deliverables/`, commit, push, send.

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
- **Captions** sit at `top 1255`, centred at x 500. Content must stay above ~y 1200 on screen.
- **Bright floor-level lines near the camera** (belts, paths) streak through the caption area: fade
  them by near distance.
- `card` billboards only when `VIEW.billboard` is on; an explicit `yaw` on a card fights an orbit.
- For a side-on lane, lay cards out in the *screen* plane (helper `S(sx, y, depth, base)` in
  `src/v10/Journey.tsx`), or they stack in depth and overlap.
- Don't start a hook price tag counting from $0 when the narration says the full price — land it on the word.
- The `rm` safety check blocks `rm $VAR/*`; use `"${VAR:?}"/…` or literal paths.
