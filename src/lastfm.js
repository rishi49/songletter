const API_KEY = import.meta.env.VITE_LASTFM_API_KEY

export async function getTrackTags(artist, track) {
    const params = new URLSearchParams({
        method: 'track.getTopTags',
        artist: artist,
        track: track,
        api_key: API_KEY,
        format: 'json',
    })

    const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`
    )

    if (!response.ok) {
        throw new Error('Failed to fetch Last.fm tags')
    }

    return response.json()
}

export async function getArtistTags(artist) {
    const params = new URLSearchParams({
        method: 'artist.getTopTags',
        artist: artist,
        api_key: API_KEY,
        format: 'json',
        autocorrect: '1'
    })

    const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`
    )

    if (!response.ok) {
        throw new Error('Failed to fetch Last.fm artist tags')
    }

    return response.json()
}

export async function buildTasteProfile(artists) {
  const tagScores = {}

  for (const artist of artists) {
    const data = await getArtistTags(artist.name)
    const tags = data.toptags?.tag ?? []

    // Only take the strongest tags for each artist
    const topTags = tags.slice(0, 5)

    for (const tag of topTags) {
      const name = tag.name.toLowerCase()

      tagScores[name] = (tagScores[name] || 0) + 1
    }
  }

  return tagScores
}