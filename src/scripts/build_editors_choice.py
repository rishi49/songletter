import json
import os
import requests
from dotenv import load_dotenv


load_dotenv()


PLAYLIST_ID = "0TVXjvVUeoMfxkoyxDrBHh"

OUTPUT_FILE = (
    r"E:\AI\Projects\music-recco-project"
    r"\songletter\src\data\editorsChoice.json"
)

SPOTIFY_ACCESS_TOKEN = os.getenv(
    "SPOTIFY_OWNER_ACCESS_TOKEN"
)


def get_playlist_tracks():

    if not SPOTIFY_ACCESS_TOKEN:
        raise Exception(
            "SPOTIFY_OWNER_ACCESS_TOKEN is missing from .env"
        )

    url = (
        f"https://api.spotify.com/v1/playlists/"
        f"{PLAYLIST_ID}/items"
    )

    headers = {
        "Authorization":
            f"Bearer {SPOTIFY_ACCESS_TOKEN}"
    }

    params = {
        "limit": 50
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    return response.json()


def convert_track(item):

    # Spotify's playlist response may use
    # "item" in newer responses or "track"
    # in older/legacy-shaped responses.
    track = item.get("item") or item.get("track")

    if not track:
        return None

    album = track.get("album", {})

    images = album.get("images", [])

    image_url = (
        images[0]["url"]
        if images
        else None
    )

    artists = track.get("artists", [])

    artist_name = ", ".join(
        artist["name"]
        for artist in artists
    )

    return {
        "spotifyTrackId":
            track.get("id"),

        "trackName":
            track.get("name"),

        "artistName":
            artist_name,

        "imageUrl":
            image_url,

        "spotifyUrl":
            track
            .get("external_urls", {})
            .get("spotify")
    }


def main():

    print("Fetching Editor's Choice playlist...")

    playlist_data = get_playlist_tracks()

    editors_choice = []

    for item in playlist_data.get("items", []):

        track = convert_track(item)

        if track:
            editors_choice.append(track)

            print(
                f"Added: "
                f"{track['artistName']} - "
                f"{track['trackName']}"
            )


    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            editors_choice,
            file,
            indent=2,
            ensure_ascii=False
        )


    print(
        f"\nDone. Wrote "
        f"{len(editors_choice)} tracks "
        f"to editorsChoice.json"
    )


if __name__ == "__main__":
    main()