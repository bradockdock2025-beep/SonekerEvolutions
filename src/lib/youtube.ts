// Tracking params YouTube appends that carry no content value
const YOUTUBE_STRIP_PARAMS = ['si', 'feature', 'pp', 'list', 'index', 'ab_channel', 't', 'start', 'time_continue']

/** Normalize a YouTube URL — strip tracking params, canonicalize to watch?v= */
export function normalizeYoutubeUrl(input: string): string {
  const raw = input.trim()
  if (!raw) return raw

  try {
    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const videoId = extractVideoId(raw)
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`

    // Not a direct video link — just strip junk params and return
    parsed.hash = ''
    YOUTUBE_STRIP_PARAMS.forEach(p => parsed.searchParams.delete(p))
    return parsed.toString()
  } catch {
    return raw
  }
}

/** Extract YouTube video ID from any URL format */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,          // youtube.com/watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,       // youtu.be/ID
    /\/embed\/([a-zA-Z0-9_-]{11})/,         // youtube.com/embed/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/,        // youtube.com/shorts/ID
    /\/v\/([a-zA-Z0-9_-]{11})/,             // youtube.com/v/ID
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim()
  return null
}

export interface VideoMetadata {
  title: string
  channel: string
  thumbnailUrl?: string
}

/** Fetch video title, channel and thumbnail via YouTube oEmbed (no API key needed) */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('oEmbed failed')
    const data = await res.json()
    return {
      title: data.title ?? 'Vídeo do YouTube',
      channel: data.author_name ?? 'YouTube',
      thumbnailUrl: data.thumbnail_url,
    }
  } catch {
    return { title: 'Vídeo do YouTube', channel: 'YouTube' }
  }
}
