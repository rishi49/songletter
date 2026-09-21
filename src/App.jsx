import { useEffect, useState } from 'react'
import './App.css'

import {
  loginWithSpotify,
  getAccessToken,
  getTopArtists,
  getPlaylistTracks
} from './spotify'

import {
  buildTasteProfile
} from './lastfm'

import candidateProfiles from './data/candidateProfiles.json'
import { rankCandidates } from './recommendation'

import { exportCandidates } from './exportCandidates'

function App() {
  const [artists, setArtists] = useState([])
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      getAccessToken(code)
        .then(async token => {
          window.history.replaceState({}, document.title, '/')

          // Fetch top artists
          const artistsData = await getTopArtists(token)
          setArtists(artistsData.items)

          // Build user taste profile using Last.fm
          const tasteProfile = await buildTasteProfile(
            artistsData.items
          )

          // Rank existing candidate profiles
          const ranked = rankCandidates(
            candidateProfiles,
            tasteProfile
          )

          setRecommendations(ranked.slice(0, 10))

          console.log(
            'RECOMMENDATIONS:',
            ranked.slice(0, 10)
          )

          console.log('TOP ARTISTS:', artistsData.items.map(a => a.name))
          console.log('TASTE PROFILE:', tasteProfile)
          console.log('TOP RECOMMENDATIONS:', ranked.slice(0, 10))
        })
        .catch(error => {
          console.error('ERROR:', error)
        })
    }
  }, [])

  return (
    <div className="page">

      <header className="header">
        <h1>★ SONGLETTER ★</h1>
        <p>discover music you'll actually like</p>
      </header>

      {recommendations.length === 0 ? (
        <button
          className="spotify-button"
          onClick={loginWithSpotify}
        >
          CONNECT SPOTIFY
        </button>
      ) : (
        <section className="newsletter">

          <div className="section-title">
            ♪ 10 PICKS 4 U ♪
          </div>

          <p className="subtitle">
            based on what you've been listening to...
          </p>

          <div className="recommendation-grid">

            {recommendations.map((track, index) => (

              <a
                key={track.spotifyTrackId}
                className="track-card"
                href={track.spotifyUrl}
                target="_blank"
                rel="noreferrer"
              >

                <div className="track-number">
                  #{index + 1}
                </div>

                <img
                  src={track.imageUrl}
                  alt={track.trackName}
                />

                <div className="track-info">
                  <strong>{track.trackName}</strong>
                  <span>{track.artistName}</span>
                </div>

              </a>

            ))}

          </div>

        </section>
      )}

    </div>
  )
}

export default App