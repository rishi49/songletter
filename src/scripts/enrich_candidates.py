import json
import os
import requests
from dotenv import load_dotenv


load_dotenv()

LASTFM_API_KEY = os.getenv("VITE_LASTFM_API_KEY")

INPUT_FILE = r"E:\AI\Projects\music-recco-project\songletter\src\data\candidate-input.json"
OUTPUT_FILE = "candidateProfiles.json"


def get_track_tags(artist, track):
    params = {
        "method": "track.getTopTags",
        "artist": artist,
        "track": track,
        "api_key": LASTFM_API_KEY,
        "format": "json",
        "autocorrect": 1,
    }

    response = requests.get(
        "https://ws.audioscrobbler.com/2.0/",
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    return data.get("toptags", {}).get("tag", [])


def get_artist_tags(artist):
    params = {
        "method": "artist.getTopTags",
        "artist": artist,
        "api_key": LASTFM_API_KEY,
        "format": "json",
        "autocorrect": 1,
    }

    response = requests.get(
        "https://ws.audioscrobbler.com/2.0/",
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    return data.get("toptags", {}).get("tag", [])


def enrich_candidate(candidate):
    artist = candidate["artistName"]
    track = candidate["trackName"]

    print(f"Enriching: {artist} - {track}")

    tags = get_track_tags(artist, track)

    # Fallback to artist tags
    if not tags:
        tags = get_artist_tags(artist)

    # Keep only top 5 tag names
    tag_names = [
        tag["name"].lower()
        for tag in tags[:5]
    ]

    return {
        **candidate,
        "tags": tag_names,
    }


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        candidates = json.load(file)

    enriched_candidates = []

    for candidate in candidates:
        try:
            enriched = enrich_candidate(candidate)
            enriched_candidates.append(enriched)

        except Exception as error:
            print(
                f"Failed: "
                f"{candidate['artistName']} - "
                f"{candidate['trackName']}: "
                f"{error}"
            )

            # Still keep the track, just without tags
            enriched_candidates.append({
                **candidate,
                "tags": [],
            })

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            enriched_candidates,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print(
        f"\nDone. Wrote {len(enriched_candidates)} "
        f"candidates to {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()