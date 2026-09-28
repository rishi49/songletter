const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.DEV
  ? 'http://127.0.0.1:5173/callback'
  : 'https://rishi49.github.io/songletter/'


function generateRandomString(length) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  const values =
    crypto.getRandomValues(new Uint8Array(length))

  return values.reduce(
    (acc, x) =>
      acc + possible[x % possible.length],
    ''
  )
}


async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)

  return window.crypto.subtle.digest(
    'SHA-256',
    data
  )
}


function base64encode(input) {
  return btoa(
    String.fromCharCode(
      ...new Uint8Array(input)
    )
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}


export async function loginWithSpotify() {
  const codeVerifier =
    generateRandomString(64)

  const hashed =
    await sha256(codeVerifier)

  const codeChallenge =
    base64encode(hashed)

  localStorage.setItem(
    'code_verifier',
    codeVerifier
  )


  const params =
    new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,

      scope:
        'user-top-read user-read-recently-played',

      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })


  const spotifyUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`


  const width = 500
  const height = 700

  const left =
    window.screenX +
    (window.outerWidth - width) / 2

  const top =
    window.screenY +
    (window.outerHeight - height) / 2


  const popup = window.open(
    spotifyUrl,
    'spotify-login',
    `width=${width},height=${height},left=${left},top=${top}`
  )


  if (!popup) {
    throw new Error(
      'Spotify login popup was blocked'
    )
  }


  popup.focus()
}


export async function getAccessToken(code) {
  const codeVerifier =
    localStorage.getItem('code_verifier')


  if (!codeVerifier) {
    throw new Error(
      'Missing Spotify PKCE code verifier'
    )
  }


  const params =
    new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })


  const response =
    await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body: params
      }
    )


  const data =
    await response.json()


  if (!response.ok) {
    throw new Error(
      data.error_description ||
      data.error ||
      'Failed to get Spotify access token'
    )
  }


  localStorage.setItem(
    'access_token',
    data.access_token
  )

  localStorage.removeItem(
    'code_verifier'
  )


  return data.access_token
}


export async function getTopArtists(
  accessToken
) {
  const response =
    await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=10&time_range=short_term',
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`
        }
      }
    )


  if (!response.ok) {
    throw new Error(
      'Failed to fetch top artists'
    )
  }


  return response.json()
}


export async function getPlaylistTracks(
  accessToken,
  playlistId
) {
  let url =
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=50`

  const allItems = []


  while (url) {
    const response =
      await fetch(url, {
        headers: {
          Authorization:
            `Bearer ${accessToken}`
        }
      })


    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist: ${response.status}`
      )
    }


    const data =
      await response.json()

    allItems.push(...data.items)

    url = data.next
  }


  return {
    items: allItems
  }
}


export async function getTopTracks(
  accessToken,
  timeRange = 'short_term',
  limit = 10
) {
  const response =
    await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`
        }
      }
    )


  if (!response.ok) {
    throw new Error(
      `Failed to fetch top tracks: ${response.status}`
    )
  }


  const data =
    await response.json()

  return data.items
}