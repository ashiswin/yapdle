export interface Video {
  id: string
  title: string
  thumbnailId: string
}

const videos: Video[] = [
  { id: "v1", title: "Fake CIA Agent Situation", thumbnailId: "-LPwdPn2Fj8" },
  { id: "v2", title: "Weirdo Gets Trapped in Porta Potty", thumbnailId: "2HQ1XWXPuCw" },
  { id: "v3", title: "Painful Interview Blunder", thumbnailId: "6uIgdC1rDNM" },
  { id: "v4", title: "ESPN Should Be Ashamed", thumbnailId: "8D_DpDo9o5c" },
  { id: "v5", title: "Explosive Diarrhea Update", thumbnailId: "98R1DFioK-4" },
  { id: "v6", title: "I'm Addicted to Fake Cops", thumbnailId: "9gNOAg_7ugU" },
  { id: "v7", title: "Traveling Bard Gets in Trouble", thumbnailId: "AlIHvL0Alv4" },
  { id: "v8", title: "Craziest Larping I've Ever Seen", thumbnailId: "Cc_rN_9pJZQ" },
  { id: "v9", title: "Boy Mom Situation", thumbnailId: "Cxi7-yzBPRs" },
  { id: "v10", title: "I Hate This Trash", thumbnailId: "EtuadQ2WekU" },
  { id: "v11", title: "Incredible Talent", thumbnailId: "KOBl7FB8GrA" },
  { id: "v12", title: "Serial Cop Larper Strikes Again", thumbnailId: "LPagG4XVO3k" },
  { id: "v13", title: "Shameful", thumbnailId: "MsDDK5OedII" },
  { id: "v14", title: "Is The Odyssey Any Good", thumbnailId: "NfLNcmbvFVs" },
  { id: "v15", title: "I'm Playing Every Grand Theft Auto Game", thumbnailId: "Nu8R3x-T3tA" },
  { id: "v16", title: "Do It", thumbnailId: "S7E08E7NnsY" },
  { id: "v17", title: "Explosive Diarrhea Situation", thumbnailId: "UlD-XCwzdyg" },
  { id: "v18", title: "EDP Documentary is Crazy", thumbnailId: "XZ0ZWYRQMHY" },
  { id: "v19", title: "No Choice", thumbnailId: "bySJ-oVGtvs" },
  { id: "v20", title: "Can't Believe I'm Talking About This Again", thumbnailId: "huzWOgnLxaY" },
  { id: "v21", title: "Airport Stalkers", thumbnailId: "jc7LlX-2vmQ" },
  { id: "v22", title: "Turns Out He Wasn't a Real Cop", thumbnailId: "nAEe0Jzic4Q" },
  { id: "v23", title: "LEGO Scandal Clown Keeps Embarrassing Himself", thumbnailId: "ou9dM4_OycA" },
  { id: "v24", title: "I Finally Watched the New Avatar Movie", thumbnailId: "pRO-Yn-Z-4I" },
  { id: "v25", title: "Old People Hate Her", thumbnailId: "qag5GlZdYuo" },
  { id: "v26", title: "Putting Delusion to the Test", thumbnailId: "uBtwY7_Zzm8" },
  { id: "v27", title: "Hardest I've Laughed at a Fake Cop", thumbnailId: "wao1D_EGEcw" },
  { id: "v28", title: "Why Would You Ever Post This", thumbnailId: "y2E50UqtMnI" },
  { id: "v29", title: "It's Actually Here", thumbnailId: "yhtBbTz3lGc" },
]

export function getAllVideos(): Video[] {
  return videos
}

export function getAllTitles(): string[] {
  return videos.map((v) => v.title)
}

export function getThumbnailUrl(thumbnailId: string): string {
  return `https://i.ytimg.com/vi/${thumbnailId}/maxresdefault.jpg`
}
