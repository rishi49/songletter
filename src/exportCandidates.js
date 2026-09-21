import { getPlaylistTracks } from './spotify'

export async function createCandidateInput(
  accessToken,
  playlistId = '3Ie0Yb9bCbYX6kQM3MHvjn'
) {
  const playlistData = await getPlaylistTracks(accessToken, playlistId)
  exportCandidates(playlistData.items)
}

export function exportCandidates(playlistItems) {
  const candidates = playlistItems.map(item => {
    const track = item.item ?? item.track

    return {
      spotifyTrackId: track.id,
      trackName: track.name,
      artistName: track.artists[0].name,

      albumId: track.album.id,
      albumName: track.album.name,

      spotifyUrl: track.external_urls.spotify,
      imageUrl: track.album.images[0]?.url
    }
  })

  const blob = new Blob(
    [JSON.stringify(candidates, null, 2)],
    { type: 'application/json' }
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'candidate-input.json'
  link.click()

  URL.revokeObjectURL(url)
}
