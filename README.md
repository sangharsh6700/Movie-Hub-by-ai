# Movie Hub

A responsive movie discovery website built with HTML, Tailwind CSS CDN, vanilla JavaScript, and OMDb API.

## Run locally
1. Keep all five project files in the same folder.
2. Open `index.html` in a local development server (recommended: VS Code Live Server).
3. If OMDb requests fail, replace `OMDB_API_KEY` in both `script.js` and `movie-details.js` with a valid OMDb API key.

## Production notes
- This demo uses Tailwind's CDN for easy setup. For production, install Tailwind CSS and build static CSS.
- An API key in browser JavaScript is visible to visitors. For production, proxy OMDb requests through a backend and keep the key in an environment variable.
- Movie data and ratings are provided by OMDb and may be subject to its availability and limits.
