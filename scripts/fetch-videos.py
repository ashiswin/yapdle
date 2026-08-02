#!/usr/bin/env python3
"""Incrementally fetch new penguinz0 videos and update src/data/videos.ts.

Scrapes pages until we hit videos already in the list, then only fetches
titles for truly new ones. New videos get today's date in the `added` field.
"""

import json, urllib.request, ssl, re, sys, time, os
from datetime import datetime, timezone

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# ---------------------------------------------------------------------------
# 1. Read existing videos
# ---------------------------------------------------------------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "..", "src", "data", "videos.ts")

existing = {}  # thumbnailId -> {"title": str, "added": str, "id": str}
existing_ids = set()

if os.path.exists(output_path):
    with open(output_path) as f:
        content = f.read()

    # Try matching with added date first, then without (migration)
    for m in re.finditer(
        r'^\s*\{\s*id:\s*"([^"]+)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*thumbnailId:\s*"([^"]+)"(?:,\s*added:\s*"([^"]+)")?\s*\}',
        content, re.MULTILINE
    ):
        entry_id = m.group(1)
        title = m.group(2).replace('\\"', '"').replace("\\\\", "\\")
        vid = m.group(3)
        added = m.group(4) if m.group(4) else "2026-07-28"
        existing[vid] = {"title": title, "added": added, "id": entry_id}
        existing_ids.add(vid)

print(f"Existing videos: {len(existing)}", file=sys.stderr)

# ---------------------------------------------------------------------------
# 2. Get API credentials from channel page
# ---------------------------------------------------------------------------
print("Fetching channel page for API key...", file=sys.stderr)
html = urllib.request.urlopen("https://www.youtube.com/@penguinz0/videos", context=ssl_ctx).read().decode()

key_match = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
api_key = key_match.group(1)
ctx_match = re.search(r'"INNERTUBE_CONTEXT":({.*?}),"INNERTUBE_CONTEXT_CLIENT_NAME"', html)
context = json.loads(ctx_match.group(1))

def extract_video_ids(data):
    ids = []
    def walk(obj):
        if isinstance(obj, dict):
            if "videoId" in obj and isinstance(obj["videoId"], str) and len(obj["videoId"]) == 11:
                ids.append(obj["videoId"])
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for item in obj:
                walk(item)
    walk(data)
    return list(dict.fromkeys(ids))

def find_cont(obj):
    if isinstance(obj, dict):
        if "continuationItemRenderer" in obj:
            ct = obj["continuationItemRenderer"]
            if "continuationEndpoint" in ct and "continuationCommand" in ct["continuationEndpoint"]:
                return ct["continuationEndpoint"]["continuationCommand"]["token"]
        if "continuationCommand" in obj:
            return obj["continuationCommand"]["token"]
        for v in obj.values():
            r = find_cont(v)
            if r: return r
    elif isinstance(obj, list):
        for item in obj:
            r = find_cont(item)
            if r: return r
    return None

def api_call(body):
    url = f"https://www.youtube.com/youtubei/v1/browse?key={api_key}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req, context=ssl_ctx)
    return json.loads(resp.read())

# ---------------------------------------------------------------------------
# 3. Scrape pages until we hit known videos
# ---------------------------------------------------------------------------
yt_match = re.search(r'var ytInitialData\s*=\s*({.*?});', html)
yt = json.loads(yt_match.group(1))
token = find_cont(yt)

new_ids = []
page = 1

# For daily runs, stop after 2 consecutive empty pages
MAX_EMPTY_PAGES = 2
empty_streak = 0

while token and page <= 60:
    print(f"Page {page}...", file=sys.stderr)
    body = {"context": context, "continuation": token}
    result = api_call(body)
    ids = extract_video_ids(result)

    page_new = 0
    for vid in ids:
        if vid not in existing_ids and vid not in new_ids:
            new_ids.append(vid)
            page_new += 1

    print(f"  {page_new} new on this page, {len(new_ids)} total new", file=sys.stderr)

    if page_new == 0:
        empty_streak += 1
        if empty_streak >= MAX_EMPTY_PAGES:
            print(f"  {MAX_EMPTY_PAGES} consecutive empty pages — stopping", file=sys.stderr)
            break
    else:
        empty_streak = 0

    token = find_cont(result)
    page += 1
    time.sleep(0.3)

print(f"Reached page limit ({page-1} pages)", file=sys.stderr)

# ---------------------------------------------------------------------------
# 4. Fetch titles for new videos only
# ---------------------------------------------------------------------------
if new_ids:
    print(f"\nFetching titles for {len(new_ids)} new videos...", file=sys.stderr)
    for i, vid in enumerate(new_ids):
        try:
            url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            resp = urllib.request.urlopen(req, context=ssl_ctx)
            title = json.loads(resp.read())["title"]
            existing[vid] = {"title": title, "added": TODAY, "id": f"v{len(existing) + 1}"}
            if (i + 1) % 10 == 0:
                print(f"  {i + 1}/{len(new_ids)}", file=sys.stderr)
            time.sleep(0.1)
        except Exception as e:
            print(f"  Skip {vid}: {e}", file=sys.stderr)
else:
    print("\nNo new videos found.", file=sys.stderr)

# ---------------------------------------------------------------------------
# 5. Generate output (preserve order of existing, append new)
# ---------------------------------------------------------------------------
def escape_ts(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

# Preserve order from existing file
ordered_ids = []
with open(output_path) as f:
    for line in f:
        m = re.search(r'thumbnailId:\s*"([^"]+)"', line)
        if m and m.group(1) in existing:
            if m.group(1) not in ordered_ids:
                ordered_ids.append(m.group(1))

# Add any existing not captured by line parse
for vid in existing:
    if vid not in ordered_ids:
        ordered_ids.append(vid)

# Sort new videos consistently
ordered_new = sorted(new_ids)
ordered_ids.extend(ordered_new)

lines = []
lines.append("export interface Video {")
lines.append("  id: string")
lines.append("  title: string")
lines.append("  thumbnailId: string")
lines.append("  added: string")
lines.append("}")
lines.append("")
lines.append("// Append-only list sorted by added date. New videos get today's date.")
lines.append("// Daily challenges use only videos with added <= the challenge date.")
lines.append("const videos: Video[] = [")

for counter, vid in enumerate(ordered_ids, 1):
    entry = existing.get(vid, {"title": "Unknown", "added": "2026-07-28"})
    title = escape_ts(entry["title"])
    added = entry["added"]
    lines.append(f'  {{ id: "v{counter}", title: "{title}", thumbnailId: "{vid}", added: "{added}" }},')

lines.append("]")
lines.append("")
lines.append("export function getAllVideos(): Video[] {")
lines.append("  return videos")
lines.append("}")
lines.append("")
lines.append("export function getAllTitles(): string[] {")
lines.append("  return videos.map((v) => v.title)")
lines.append("}")
lines.append("")
lines.append("export function getThumbnailUrl(thumbnailId: string): string {")
lines.append('  return "https://i.ytimg.com/vi/" + thumbnailId + "/hqdefault.jpg"')
lines.append("}")
lines.append("")
lines.append("export function getPoolSizeOnDate(dateStr: string): number {")
lines.append("  let count = 0")
lines.append("  for (const v of videos) {")
lines.append("    if (v.added <= dateStr) count++")
lines.append("    else break")
lines.append("  }")
lines.append("  return count")
lines.append("}")

with open(output_path, "w") as f:
    f.write("\n".join(lines) + "\n")

new_count = len(new_ids)
print(f"\nDone: {len(ordered_ids)} total videos ({new_count} new today)", file=sys.stderr)
if new_count > 0:
    print(f"Dates: origin 2026-07-28 ({len(ordered_ids) - new_count}), today {TODAY} ({new_count})", file=sys.stderr)
