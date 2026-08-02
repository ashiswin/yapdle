#!/usr/bin/env python3
"""Fetch all penguinz0 video IDs and titles, regenerate src/data/videos.ts.

Usage: python3 scripts/fetch-videos.py
"""

import json, urllib.request, ssl, re, sys, time, os

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

print("Fetching channel page...", file=sys.stderr)
html = urllib.request.urlopen("https://www.youtube.com/@penguinz0/videos", context=ssl_ctx).read().decode()

key_match = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
if not key_match:
    print("ERROR: Could not find API key", file=sys.stderr)
    sys.exit(1)
api_key = key_match.group(1)

ctx_match = re.search(r'"INNERTUBE_CONTEXT":({.*?}),"INNERTUBE_CONTEXT_CLIENT_NAME"', html)
if not ctx_match:
    print("ERROR: Could not find context", file=sys.stderr)
    sys.exit(1)
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

# Get initial continuation token
yt_match = re.search(r'var ytInitialData\s*=\s*({.*?});', html)
if not yt_match:
    print("ERROR: Could not find ytInitialData", file=sys.stderr)
    sys.exit(1)
yt = json.loads(yt_match.group(1))
token = find_cont(yt)

all_ids = []
page = 1

while token and page <= 20:
    print(f"Page {page}...", file=sys.stderr)
    body = {"context": context, "continuation": token}
    result = api_call(body)
    ids = extract_video_ids(result)
    all_ids.extend(ids)
    all_ids = list(dict.fromkeys(all_ids))
    print(f"  {len(ids)} new, {len(all_ids)} total", file=sys.stderr)
    token = find_cont(result)
    page += 1
    time.sleep(0.3)

print(f"Total IDs: {len(all_ids)}", file=sys.stderr)

# Fetch titles
print("Fetching titles...", file=sys.stderr)
results = []
for i, vid in enumerate(all_ids):
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, context=ssl_ctx)
        title = json.loads(resp.read())["title"]
        results.append({"videoId": vid, "title": title})
        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/{len(all_ids)}", file=sys.stderr)
        time.sleep(0.05)
    except:
        pass

print(f"Done: {len(results)} videos with titles", file=sys.stderr)

# Generate TypeScript file
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "..", "src", "data", "videos.ts")

lines = []
lines.append("export interface Video {")
lines.append("  id: string")
lines.append("  title: string")
lines.append("  thumbnailId: string")
lines.append("}")
lines.append("")
lines.append("const videos: Video[] = [")

for i, v in enumerate(results):
    title = v["title"].replace("\\", "\\\\").replace('"', '\\"')
    vid = v["videoId"]
    lines.append(f'  {{ id: "v{i+1}", title: "{title}", thumbnailId: "{vid}" }},')

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

with open(output_path, "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"Wrote {len(results)} videos to {output_path}", file=sys.stderr)
