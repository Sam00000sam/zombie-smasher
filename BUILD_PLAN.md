# TikTok Clipper: Build Plan (draft for review)

## Goal
Turn long videos into short, vertical (9:16, 1080x1920) clips ready to post on TikTok.

## Phase 1: CLI MVP (this commit)
- `app.py` cuts a time range or auto-splits a video into N-second parts.
- Center-crops to 9:16 and exports H.264/AAC MP4 at 30 fps via MoviePy.
- Dependency: `moviepy` (needs FFmpeg, which MoviePy bundles via `imageio-ffmpeg`).

## Phase 2: Better clips
- Smarter crop: face/subject tracking instead of a fixed center crop; optional blurred-background letterbox.
- Auto-pick highlights: loudness peaks or scene-change detection (`scenedetect`).
- Burned-in captions via Whisper transcription.

## Phase 3: Interface
- Simple GUI to preview the video and drag start/end markers (Tkinter or a small web UI). Pygame is only worth adding if we want a custom preview player; MoviePy doesn't need it.
- Batch processing of a folder.

## Phase 4: Polish
- Presets (duration caps, bitrate), progress reporting, error handling for odd codecs.
- Tests with a tiny sample video; README with usage.
- Optional upload/export helpers.

## Open questions
1. Source: local files only, or also download from URLs (e.g. YouTube)? That brings legal and `yt-dlp` considerations.
2. Manual clipping vs. auto-highlight detection: which matters first?
3. CLI, desktop GUI, or web app as the main interface?
4. Do captions and music/overlays belong in scope?

## Status
- Smoke-tested on a generated 640x360 clip: range mode and `--split` both produce 1080x1920 MP4s. Not yet tried on real-world footage.
