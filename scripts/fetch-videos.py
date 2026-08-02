#!/usr/bin/env python3
"""Fetch penguinz0 video IDs/titles and update src/data/videos.ts.

New videos get today's date as their `added` field. Existing videos keep their
original `added` date. The daily challenge uses only videos with `added <= date`,
so past days are always stable — new videos only affect future days.
"""

import json, urllib.request, ssl, re, sys, time, os
from datetime import datetime, timezone

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# ---------------------------------------------------------------------------
# 1. Scrape video IDs
# ---------------------------------------------------------------------------
print("Fetching channel page...", file=sys.stderr)
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

yt_match = re.search(r'var ytInitialData\s*=\s*({.*?});', html)
yt = json.loads(yt_match.group(1))
token = find_cont(yt)

all_ids = []
page = 1
while token and page <= 30:
    print(f"Page {page}...", file=sys.stderr)
    body = {"context": context, "continuation": token}
    result = api_call(body)
    ids = extract_video_ids(result)
    all_ids.extend(ids)
    all_ids = list(dict.fromkeys(all_ids))
    token = find_cont(result)
    page += 1
    time.sleep(0.3)

print(f"Total IDs scraped: {len(all_ids)}", file=sys.stderr)

# ---------------------------------------------------------------------------
# 2. Read existing data to preserve added dates
# ---------------------------------------------------------------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "..", "src", "data", "videos.ts")

existing = {}  # thumbnailId -> {"title": str, "added": str}
if os.path.exists(output_path):
    with open(output_path) as f:
        content = f.read()
    for m in re.finditer(
        r'\{\s*id:\s*"[^"]+",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*thumbnailId:\s*"([^"]+)",\s*added:\s*"([^"]+)"\s*\}',
        content
    ):
        title = m.group(1).replace('\\"', '"').replace("\\\\", "\\")
        vid = m.group(2)
        added = m.group(3)
        existing[vid] = {"title": title, "added": added}

# ---------------------------------------------------------------------------
# 3. Fetch titles for NEW videos only
# ---------------------------------------------------------------------------
new_ids = [vid for vid in all_ids if vid not in existing]
print(f"Existing: {len(existing)}, New to fetch: {len(new_ids)}", file=sys.stderr)

for i, vid in enumerate(new_ids):
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, context=ssl_ctx)
        title = json.loads(resp.read())["title"]
        existing[vid] = {"title": title, "added": TODAY}
        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/{len(new_ids)}", file=sys.stderr)
        time.sleep(0.05)
    except Exception as e:
        print(f"  Skip {vid}", file=sys.stderr)

# ---------------------------------------------------------------------------
# 4. Build ordered list: existing videos first (by original added date), then new
# ---------------------------------------------------------------------------
# Preserve order from existing file for stability
old_order = []
new_order = []
if os.path.exists(output_path):
    with open(output_path) as f:
        content = f.read()
    in_array = False
    for line in content.split("\n"):
        m = re.search(r'thumbnailId:\s*"([^"]+)"', line)
        if m:
            vid = m.group(1)
            if vid in existing:
                if vid in [v for v in old_order]:
                    continue
                old_order.append(vid)

# Any existing not in old_order (shouldn't happen normally)
for vid in old_order:
    if vid not in existing:
        existing[vid] = existing.get(vid, {"title": "Unknown", "added": "2026-07-28"})

# New videos not in old_order
for vid in existing:
    if vid not in old_order:
        new_order.append(vid)

# Sort new videos by their added date (today)
new_order.sort(key=lambda vid: existing[vid]["added"])

# ---------------------------------------------------------------------------
# 5. First run: all scraped videos get origin date
# ---------------------------------------------------------------------------
if not old_order and new_ids:
    # First run - assign origin date to all
    for vid in existing:
        existing[vid]["added"] = "2026-07-28"
    old_order = list(existing.keys())

# ---------------------------------------------------------------------------
# 6. Generate output
# ---------------------------------------------------------------------------
def escape_ts(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

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

counter = 1
for vid in old_order:
    entry = existing.get(vid, {"title": "Unknown", "added": "2026-07-28"})
    title = escape_ts(entry["title"])
    added = entry["added"]
    lines.append(f'  {{ id: "v{counter}", title: "{title}", thumbnailId: "{vid}", added: "{added}" }},')
    counter += 1

for vid in new_order:
    entry = existing[vid]
    title = escape_ts(entry["title"])
    added = entry["added"]
    lines.append(f'  {{ id: "v{counter}", title: "{title}", thumbnailId: "{vid}", added: "{added}" }},')
    counter += 1

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

total = len(old_order) + len(new_order)
print(f"Wrote {len(old_order)} existing + {len(new_order)} new = {total} videos to {output_path}", file=sys.stderr)
