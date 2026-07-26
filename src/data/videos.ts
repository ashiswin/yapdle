export interface Video {
  id: string
  title: string
  thumbnailId: string
}

const videos: Video[] = [
  { id: "v1", title: "The Most Disturbing Video on the Internet", thumbnailId: "dQw4w9WgXcQ" },
  { id: "v2", title: "I Can't Believe This Exists", thumbnailId: "jNQXAC9IVRw" },
  { id: "v3", title: "The Worst Game Ever Made", thumbnailId: "9bZkp7q19f0" },
  { id: "v4", title: "Reacting to the Cringiest TikToks", thumbnailId: "kJQP7kiw5Fk" },
  { id: "v5", title: "This YouTuber Got Arrested", thumbnailId: "hT_nvWreIhg" },
  { id: "v6", title: "The Dumbest Drama on the Internet", thumbnailId: "JGwWNGJdvx8" },
  { id: "v7", title: "I Watched the Worst Movie Ever", thumbnailId: "CevxZvSJLk8" },
  { id: "v8", title: "This Game is Physically Painful to Play", thumbnailId: "RgKAFK5djSk" },
  { id: "v9", title: "The Most Insane Reddit Story", thumbnailId: "YQHsXMglC9A" },
  { id: "v10", title: "Destroying a Scammer's Entire Operation", thumbnailId: "kXYiU_JCYtU" },
  { id: "v11", title: "The Internet's Biggest Liar", thumbnailId: "HPJwV5zC5sI" },
  { id: "v12", title: "Reacting to the Worst Life Hacks", thumbnailId: "60ItHLz5WEA" },
  { id: "v13", title: "This Kick Streamer Went Too Far", thumbnailId: "uelHwf8o7_U" },
  { id: "v14", title: "The World's Laziest Scammer", thumbnailId: "L_jWHffIx5E" },
  { id: "v15", title: "I Played the Most Hated Game of 2024", thumbnailId: "fJ9rUzIMcZQ" },
  { id: "v16", title: "The Creepiest Thing I've Ever Seen", thumbnailId: "OPf0YbXqDm0" },
  { id: "v17", title: "This Speedrun is Impossible", thumbnailId: "rY0WxgSXdEE" },
  { id: "v18", title: "Reacting to the Dumbest Conspiracy Theories", thumbnailId: "V-_O7nl0Ii0" },
  { id: "v19", title: "The Most Pathetic Apology Video", thumbnailId: "2Vv-BfVoq4g" },
  { id: "v20", title: "I Tried the Worst Reviewed Restaurant", thumbnailId: "fRh_vgS2dFE" },
  { id: "v21", title: "The Biggest Fail in YouTube History", thumbnailId: "kffacxfA7G4" },
  { id: "v22", title: "This Mobile Game Ad is Unhinged", thumbnailId: "QH2-TGUlwu4" },
  { id: "v23", title: "The Most Cursed Video on YouTube", thumbnailId: "ZZ5LpwO-An4" },
  { id: "v24", title: "Reacting to the Worst Cooking Videos", thumbnailId: "MtN1YnoL46Q" },
  { id: "v25", title: "The Internet's Weirdest Rabbit Hole", thumbnailId: "dQw4w9WgXcQ" },
  { id: "v26", title: "This NFT Guy Lost Everything", thumbnailId: "6Dh-RL__uN4" },
  { id: "v27", title: "The Most Unhinged Streamer Meltdown", thumbnailId: "gm5o7XO6KZM" },
  { id: "v28", title: "I Got Scammed by an AI Voice", thumbnailId: "LDU_Txk06tM" },
  { id: "v29", title: "The Worst Tech Product I've Ever Reviewed", thumbnailId: "Fklxo2f8_7s" },
  { id: "v30", title: "Reacting to Your Terrible Confessions", thumbnailId: "MBdVXk6xNik" },
  { id: "v31", title: "The Most Embarrassing E3 Moment", thumbnailId: "pcbU6002R1s" },
  { id: "v32", title: "This AI Generated Video is Horrifying", thumbnailId: "9W8UvE22pAI" },
  { id: "v33", title: "I Found the Worst Kick Streamer", thumbnailId: "aAkMkVFwRoo" },
  { id: "v34", title: "The Most Tone-Deaf YouTuber Apology", thumbnailId: "EoGYHDVuVo0" },
  { id: "v35", title: "Reacting to the Most Delusional People", thumbnailId: "qpgTCJCMpJA" },
  { id: "v36", title: "This Game Review Made Me Lose Brain Cells", thumbnailId: "6HZNvgrRk7E" },
  { id: "v37", title: "The Worst Kick Streamer Got What He Deserved", thumbnailId: "8SbUC-UaAxE" },
  { id: "v38", title: "Reacting to Awful Kickstarter Projects", thumbnailId: "A6XUVjK9W4o" },
  { id: "v39", title: "The Most Obnoxious YouTuber Right Now", thumbnailId: "wtH4quSxjYQ" },
  { id: "v40", title: "The Biggest Scam on the Internet Right Now", thumbnailId: "BDjVDUy2Rt4" },
  { id: "v41", title: "Reacting to the Most Toxic Gaming Moments", thumbnailId: "arPUhqQqQtM" },
  { id: "v42", title: "This Reddit Story Keeps Getting Worse", thumbnailId: "Oa_2EFt8KnY" },
  { id: "v43", title: "I Can't Believe People Fall for This", thumbnailId: "N6jVjjpZQKE" },
  { id: "v44", title: "The Dumbest Controversy of the Week", thumbnailId: "rtP3kLGnkq4" },
  { id: "v45", title: "Reacting to Horrible Tech Reviews", thumbnailId: "8SZyid4I1WY" },
  { id: "v46", title: "This is the Worst Game I've Ever Played", thumbnailId: "dpjRGhHj6Xg" },
  { id: "v47", title: "The Most Insane DMs I've Ever Received", thumbnailId: "S0QjSd0gENI" },
  { id: "v48", title: "Reacting to the Worst Tattoos on the Internet", thumbnailId: "FSfRfNWShDE" },
  { id: "v49", title: "This TikTok Trend Needs to Stop", thumbnailId: "qfxB8fRkOqU" },
  { id: "v50", title: "The Internet is Losing Its Mind Over This", thumbnailId: "9lb0Kq2EHGg" },
]

export function getAllVideos(): Video[] {
  return videos
}

export function getAllTitles(): string[] {
  return videos.map((v) => v.title)
}

export function getThumbnailUrl(thumbnailId: string): string {
  return `https://img.youtube.com/vi/${thumbnailId}/maxresdefault.jpg`
}
