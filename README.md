# Songletter

A music discovery app built with React and Vite. Connect Spotify to get 10 song recommendations based on your top artists and Last.fm tags.

V1 builds a taste profile from artist tags, then ranks a fixed candidate dataset by summing matching tag weights.

## Run locally

1. Install dependencies from this folder:

   ```sh
   npm install
   ```

2. Create a `.env` file with your API credentials:

   ```dotenv
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_LASTFM_API_KEY=your_lastfm_api_key
   ```

3. Register `http://127.0.0.1:5173/callback` as the redirect URI in your Spotify app settings.

4. Start the app:

   ```sh
   npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
   ```

   Open `http://127.0.0.1:5173` and click **Connect Spotify**.

Run `npm run build` for a production build or `npm run lint` to check the code.
