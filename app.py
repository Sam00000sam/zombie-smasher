"""TikTok Clipper: cut clips out of a longer video and format them for TikTok (9:16).

Examples:
    python app.py input.mp4 --start 30 --end 55
    python app.py input.mp4 --split 30 --outdir clips
"""
import argparse
import os
import sys

from moviepy import VideoFileClip

TARGET_W, TARGET_H = 1080, 1920  # TikTok vertical 9:16


def to_vertical(clip):
    """Center-crop a clip to 9:16, then scale to 1080x1920."""
    target_ratio = TARGET_W / TARGET_H
    w, h = clip.size
    if w / h > target_ratio:
        new_w = int(h * target_ratio)
        clip = clip.cropped(x_center=w / 2, width=new_w)
    else:
        new_h = int(w / target_ratio)
        clip = clip.cropped(y_center=h / 2, height=new_h)
    return clip.resized((TARGET_W, TARGET_H))


def export(clip, path):
    clip.write_videofile(path, codec="libx264", audio_codec="aac", fps=30)
    print(f"Saved {path}")


def clip_range(video, start, end, outdir, name):
    end = min(end, video.duration)
    if start >= end:
        sys.exit(f"Start ({start}s) must be before end ({end}s).")
    export(to_vertical(video.subclipped(start, end)), os.path.join(outdir, f"{name}.mp4"))


def split_video(video, seconds, outdir, base):
    start, i = 0.0, 1
    while start < video.duration:
        end = min(start + seconds, video.duration)
        # skip a tiny leftover tail
        if end - start >= 1:
            clip_range(video, start, end, outdir, f"{base}_part{i:02d}")
            i += 1
        start = end


def main():
    p = argparse.ArgumentParser(description="Cut and reformat video clips for TikTok.")
    p.add_argument("input", help="path to the source video")
    p.add_argument("--start", type=float, default=0.0, help="clip start, in seconds")
    p.add_argument("--end", type=float, help="clip end, in seconds (default: end of video)")
    p.add_argument("--split", type=float, metavar="SECONDS",
                   help="split the whole video into chunks of this length instead")
    p.add_argument("--outdir", default="output", help="output folder (default: output)")
    args = p.parse_args()

    if not os.path.isfile(args.input):
        sys.exit(f"File not found: {args.input}")
    os.makedirs(args.outdir, exist_ok=True)
    base = os.path.splitext(os.path.basename(args.input))[0]

    with VideoFileClip(args.input) as video:
        if args.split:
            split_video(video, args.split, args.outdir, base)
        else:
            end = args.end if args.end is not None else video.duration
            clip_range(video, args.start, end, args.outdir, f"{base}_clip")


if __name__ == "__main__":
    main()
