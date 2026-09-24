import { useEffect, useState } from 'react'
import './App.css'

import {
  getAccessToken,
  getTopArtists,
  loginWithSpotify
} from './spotify'

import {
  buildTasteProfile
} from './lastfm'

import candidateProfiles from './data/candidateProfiles.json'
import { rankCandidates } from './recommendation'


function App() {
  const [artists, setArtists] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(0)

  const loadingMessages = [
    'READING YOUR LISTENING HISTORY...',
    'FIGURING OUT YOUR TASTE...',
    'DIGGING THROUGH THE CRATES...',
    'MAKING YOUR SONGLETTER...'
  ]


  // Change loading message every 800ms
  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingMessage(current =>
        (current + 1) % loadingMessages.length
      )
    }, 1400)

    return () => clearInterval(interval)
  }, [isLoading])


  // Spotify callback + recommendation generation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      setIsLoading(true)

      getAccessToken(code)
        .then(async token => {
          window.history.replaceState({}, document.title, '/')

          // Comment out when candidate-input.json does not need regenerating.
          // await createCandidateInput(token, '3Ie0Yb9bCbYX6kQM3MHvjn')

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
          setIsLoading(false)

          // console.log(
          //   'TOP ARTISTS:',
          //   artistsData.items.map(a => a.name)
          // )
          // console.log('TASTE PROFILE:', tasteProfile)
          // console.log(
          //   'TOP RECOMMENDATIONS:',
          //   ranked.slice(0, 10)
          // )
        })
        .catch(error => {
          console.error('ERROR:', error)
          setIsLoading(false)
        })
    }
  }, [])


  return (
    <div className="page">

      <header className="header">
        <h1>★ SONGLETTER ★</h1>
        <p>discover music you'll actually like</p>
      </header>
      <div className="ticker">
        <div className="ticker-track">
          <span>
            ★ 10 TRACKS SELECTED JUST 4 YOU ★
            POWERED BY YOUR SPOTIFY TASTE ★
            FRESH PICKS FROM THE INTERNET ★
            NO AI RECCOMENDATIONS, JUST BAD MATHS ★
            MADE WITH LOVE & QUESTIONABLE MUSIC TASTE ★
            WELCOME TO SONGLETTER ★
          </span>

          <span>
            ★ 10 TRACKS SELECTED JUST 4 YOU ★
            POWERED BY YOUR SPOTIFY TASTE ★
            FRESH PICKS FROM THE INTERNET ★
            NO AI RECCOMENDATIONS, JUST BAD MATHS ★
            MADE WITH LOVE & QUESTIONABLE MUSIC TASTE ★
            WELCOME TO SONGLETTER ★
          </span>
        </div>
      </div>


      {isLoading ? (

        <section className="loading-screen">
          <div className="loading-star">★</div>

          <p>
            {loadingMessages[loadingMessage]}
            <div className="loading-bar">
              <div className="loading-bar-fill"></div>
            </div>
          </p>
        </section>

      ) : recommendations.length === 0 ? (

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
                  <strong>
                    {track.trackName}
                  </strong>

                  <span>
                    {track.artistName}
                  </span>
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