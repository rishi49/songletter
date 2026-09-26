import { useEffect, useState } from 'react'
import './App.css'

import {
  getAccessToken,
  getTopArtists,
  getTopTracks,
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

  const [activeTab, setActiveTab] =
    useState('recommendations')

  const [accessToken, setAccessToken] =
    useState(null)


  const [topTracks, setTopTracks] = useState({
    short_term: null,
    medium_term: null,
    long_term: null
  })

  const [topTracksRange, setTopTracksRange] =
    useState('short_term')

  const [topTracksLoading, setTopTracksLoading] =
    useState(false)


  const loadingMessages = [
    'READING YOUR LISTENING HISTORY...',
    'FIGURING OUT YOUR TASTE...',
    'DIGGING THROUGH THE CRATES...',
    'MAKING YOUR SONGLETTER...'
  ]


  /*
    LOADING MESSAGE LOOP
  */

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingMessage(current =>
        (current + 1) % loadingMessages.length
      )
    }, 2500)

    return () =>
      clearInterval(interval)

  }, [isLoading])


  /*
    GENERATE RECOMMENDATIONS
  */

  const generateRecommendations =
    async token => {

      const artistsData =
        await getTopArtists(token)

      setArtists(
        artistsData.items
      )


      const tasteProfile =
        await buildTasteProfile(
          artistsData.items
        )


      const ranked =
        rankCandidates(
          candidateProfiles,
          tasteProfile
        )


      setRecommendations(
        ranked.slice(0, 10)
      )
    }


  /*
    SPOTIFY POPUP CALLBACK

    The popup gets redirected to:

    /callback?code=...

    It sends that code back to this
    original window and closes.
  */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      )

    const code =
      params.get('code')


    /*
      THIS WINDOW IS THE POPUP
    */

    if (code && window.opener) {
      window.opener.postMessage(
        {
          type: 'SPOTIFY_AUTH_CODE',
          code: code
        },
        window.location.origin
      )

      window.close()

      return
    }


    /*
      THIS WINDOW IS THE MAIN APP
    */

    const handleSpotifyMessage =
      async event => {

        if (
          event.origin !==
          window.location.origin
        ) {
          return
        }


        if (
          event.data?.type !==
          'SPOTIFY_AUTH_CODE'
        ) {
          return
        }


        try {
          setIsLoading(true)

          const token =
            await getAccessToken(
              event.data.code
            )


          /*
            This triggers the wallpaper
            colour transition.
          */

          setAccessToken(token)


          await generateRecommendations(
            token
          )


        } catch (error) {
          console.error(
            'SPOTIFY LOGIN ERROR:',
            error
          )

        } finally {
          setIsLoading(false)
        }
      }


    window.addEventListener(
      'message',
      handleSpotifyMessage
    )


    return () => {
      window.removeEventListener(
        'message',
        handleSpotifyMessage
      )
    }

  }, [])


  /*
    TOP TRACKS

    Only fetch when:
      - Spotify is connected
      - user opens Top Tracks
      - selected range hasn't been cached
  */

  useEffect(() => {
    if (
      activeTab !== 'topTracks'
    ) {
      return
    }

    if (!accessToken) return

    if (
      topTracks[topTracksRange]
    ) {
      return
    }


    const loadTopTracks =
      async () => {

        try {
          setTopTracksLoading(true)


          const tracks =
            await getTopTracks(
              accessToken,
              topTracksRange,
              10
            )


          setTopTracks(current => ({
            ...current,

            [topTracksRange]:
              tracks
          }))


        } catch (error) {
          console.error(
            'TOP TRACKS ERROR:',
            error
          )

        } finally {
          setTopTracksLoading(false)
        }
      }


    loadTopTracks()

  }, [
    activeTab,
    accessToken,
    topTracksRange,
    topTracks
  ])


  const currentTopTracks =
    topTracks[topTracksRange] || []


  /*
    POPUP CALLBACK PAGE

    Don't render the entire Songletter UI
    inside the Spotify popup.
  */

  const params =
    new URLSearchParams(
      window.location.search
    )

  const callbackCode =
    params.get('code')


  if (
    callbackCode &&
    window.opener
  ) {
    return (
      <div className="popup-callback">
        CONNECTING TO SONGLETTER...
      </div>
    )
  }


  return (
    <div className={accessToken ? 'page connected' : 'page'}>


      {/* HEADER */}

      <header className="header">

        <h1>
          ★ SONGLETTER ★
        </h1>

        <p>
          discover music you'll actually like
        </p>

      </header>


      {/* TICKER */}

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


      {/* MAIN TABS */}

      <nav className="tabs">

        <button
          className={
            activeTab ===
              'recommendations'
              ? 'active'
              : ''
          }

          onClick={() =>
            setActiveTab(
              'recommendations'
            )
          }
        >
          RECOMMENDATIONS
        </button>


        <button
          className={
            activeTab === 'editors'
              ? 'active'
              : ''
          }

          onClick={() =>
            setActiveTab('editors')
          }
        >
          EDITOR'S CHOICE
        </button>


        <button
          className={
            activeTab === 'topTracks'
              ? 'active'
              : ''
          }

          onClick={() =>
            setActiveTab('topTracks')
          }
        >
          YOUR TOP TRACKS
        </button>

      </nav>


      {/* LOADING */}

      {isLoading && (

        <section className="loading-screen">

          <div className="loading-star">
            ★
          </div>

          <p>
            {
              loadingMessages[
              loadingMessage
              ]
            }
          </p>

          <div className="loading-bar">

            <div className="loading-bar-fill">
            </div>

          </div>

        </section>

      )}


      {/* NOT CONNECTED */}

      {!accessToken &&
        !isLoading && (

          <div className="connect-screen">

            <button
              className="spotify-button"
              onClick={
                loginWithSpotify
              }
            >
              CONNECT SPOTIFY
            </button>

          </div>

        )}


      {/* CONNECTED */}

      {accessToken &&
        !isLoading && (
          <>


            {/* RECOMMENDATIONS */}

            {activeTab ===
              'recommendations' && (

                <section className="newsletter">

                  <div className="section-title">
                    ♪ 10 PICKS 4 U ♪
                  </div>

                  <p className="subtitle">
                    based on what you've been listening to...
                  </p>


                  <div className="recommendation-grid">

                    {recommendations.map(
                      (track, index) => (

                        <a
                          key={
                            track.spotifyTrackId
                          }

                          className="track-card"

                          href={
                            track.spotifyUrl
                          }

                          target="_blank"

                          rel="noreferrer"
                        >

                          <div className="track-number">
                            #{index + 1}
                          </div>


                          <img
                            src={
                              track.imageUrl
                            }

                            alt={
                              track.trackName
                            }
                          />


                          <div className="track-info">

                            <strong>
                              {
                                track.trackName
                              }
                            </strong>

                            <span>
                              {
                                track.artistName
                              }
                            </span>

                          </div>

                        </a>

                      )
                    )}

                  </div>

                </section>

              )}


            {/* EDITOR'S CHOICE */}

            {activeTab ===
              'editors' && (

                <section className="tab-page">

                  <div className="section-title">
                    ♪ EDITOR'S CHOICE ♪
                  </div>

                  <p className="subtitle">
                    handpicked tracks from songletter
                  </p>

                </section>

              )}


            {/* TOP TRACKS */}

            {activeTab ===
              'topTracks' && (

                <section className="tab-page">

                  <div className="section-title">
                    ♪ YOUR TOP TRACKS ♪
                  </div>


                  <div className="time-range-tabs">

                    <button
                      className={
                        topTracksRange ===
                          'short_term'
                          ? 'active'
                          : ''
                      }

                      onClick={() =>
                        setTopTracksRange(
                          'short_term'
                        )
                      }
                    >
                      RECENT
                    </button>


                    <button
                      className={
                        topTracksRange ===
                          'medium_term'
                          ? 'active'
                          : ''
                      }

                      onClick={() =>
                        setTopTracksRange(
                          'medium_term'
                        )
                      }
                    >
                      6 MONTHS
                    </button>


                    <button
                      className={
                        topTracksRange ===
                          'long_term'
                          ? 'active'
                          : ''
                      }

                      onClick={() =>
                        setTopTracksRange(
                          'long_term'
                        )
                      }
                    >
                      LONG TERM
                    </button>

                  </div>


                  {topTracksLoading ? (

                    <p className="top-tracks-loading">
                      LOADING TRACKS...
                    </p>

                  ) : (

                    <div className="recommendation-grid">

                      {currentTopTracks.map(
                        (track, index) => (

                          <a
                            key={track.id}

                            className="track-card"

                            href={
                              track
                                .external_urls
                                .spotify
                            }

                            target="_blank"

                            rel="noreferrer"
                          >

                            <div className="track-number">
                              #{index + 1}
                            </div>


                            <img
                              src={
                                track.album
                                  .images[0]
                                  ?.url
                              }

                              alt={
                                track.name
                              }
                            />


                            <div className="track-info">

                              <strong>
                                {
                                  track.name
                                }
                              </strong>

                              <span>
                                {
                                  track.artists
                                    .map(
                                      artist =>
                                        artist.name
                                    )
                                    .join(', ')
                                }
                              </span>

                            </div>

                          </a>

                        )
                      )}

                    </div>

                  )}

                </section>

              )}

          </>
        )}

    </div>
  )
}


export default App