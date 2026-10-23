// Movie detail page. Use the same OMDb API key as script.js.
const OMDB_API_KEY = "8e0ddfa0";
const movieDetail = document.querySelector("#movie-detail");
const params = new URLSearchParams(window.location.search);
const imdbID = params.get("id");
const API_BASE = "https://www.omdbapi.com/";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function valueOr(value, fallback = "Not available") { return value && value !== "N/A" ? value : fallback; }
function iconStar() { return '<svg viewBox="0 0 24 24" class="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true"><path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.36L12 17.36l-5.7 3 1.09-6.36-4.62-4.5 6.38-.93z"/></svg>'; }
function metadata(label, value) {
  if (!value || value === "N/A") return "";
  return `<div class="border-b border-white/10 py-3 last:border-0"><dt class="text-xs font-semibold uppercase tracking-wider text-zinc-500">${label}</dt><dd class="mt-1 text-sm leading-6 text-zinc-200">${escapeHtml(value)}</dd></div>`;
}
function showError(message) {
  movieDetail.innerHTML = `<div class="mx-auto max-w-2xl px-4 py-28 text-center"><div class="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-300"><svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg></div><h1 class="text-2xl font-bold">Movie details unavailable</h1><p class="mt-3 text-zinc-400">${escapeHtml(message)}</p><a href="index.html" class="mt-7 inline-flex rounded-xl bg-rose-600 px-5 py-3 font-semibold hover:bg-rose-500">Return to Movie Hub</a></div>`;
}
async function loadMovie(id) {
  try {
    const url = new URL(API_BASE);
    url.search = new URLSearchParams({ apikey: OMDB_API_KEY, i: id, plot: "full" }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error("The movie service could not be reached.");
    const data = await response.json();
    if (data.Response === "False") throw new Error(data.Error || "No movie was found for this ID.");
    renderMovie(data);
  } catch (error) { showError(error.message || "Something went wrong. Please try again."); }
}
function renderMovie(data) {
  const poster = data.Poster && data.Poster !== "N/A" ? data.Poster : "https://placehold.co/500x750/18181b/71717a?text=Poster+Unavailable";
  const backdrop = data.Poster && data.Poster !== "N/A" ? data.Poster : "";
  const rating = data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : "";
  document.title = `${data.Title} — Movie Hub`;
  movieDetail.innerHTML = `
    <section class="relative isolate overflow-hidden">
      <div class="detail-backdrop absolute inset-0 opacity-25 blur-sm" style="background-image:url('${escapeHtml(backdrop)}')" aria-hidden="true"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-ink/75" aria-hidden="true"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" aria-hidden="true"></div>
      <div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[260px_1fr] md:gap-12 md:py-20 lg:grid-cols-[320px_1fr] lg:px-8">
        <div class="mx-auto w-full max-w-[260px] md:max-w-none"><img src="${escapeHtml(poster)}" alt="${escapeHtml(data.Title)} poster" class="w-full rounded-2xl border border-white/10 shadow-2xl" onerror="this.src='https://placehold.co/500x750/18181b/71717a?text=Poster+Unavailable'"></div>
        <div class="self-center">
          <p class="mb-4 text-xs font-bold uppercase tracking-[.25em] text-rose-400">Movie details</p>
          <h1 class="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">${escapeHtml(valueOr(data.Title, "Untitled"))}</h1>
          <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300"><span>${escapeHtml(valueOr(data.Year))}</span>${data.Rated && data.Rated !== "N/A" ? `<span class="rounded border border-white/20 px-2 py-1 text-xs">${escapeHtml(data.Rated)}</span>` : ""}<span>${escapeHtml(valueOr(data.Runtime))}</span></div>
          <div class="mt-4 flex flex-wrap items-center gap-3">${data.Genre && data.Genre !== "N/A" ? data.Genre.split(",").map(g => `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">${escapeHtml(g.trim())}</span>`).join("") : ""}${rating ? `<span class="ml-1 inline-flex items-center gap-1.5 font-semibold">${iconStar()}<span>${escapeHtml(rating)}<span class="ml-1 text-xs font-normal text-zinc-500">/ 10 IMDb</span></span></span>` : ""}</div>
          <div class="mt-8 max-w-3xl"><h2 class="text-lg font-bold">Plot overview</h2><p class="mt-3 leading-7 text-zinc-300">${escapeHtml(valueOr(data.Plot, "A plot summary is not available for this title."))}</p></div>
          <div class="mt-8 flex flex-wrap gap-3"><a href="https://www.imdb.com/title/${encodeURIComponent(data.imdbID)}/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold transition hover:bg-rose-500">View on IMDb <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg></a><a href="index.html#discover" class="rounded-xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/10">Discover more</a></div>
        </div>
      </div>
    </section>
    <section class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
      <div><h2 class="mb-4 text-xl font-bold">Credits</h2><dl>${metadata("Director", data.Director)}${metadata("Writer", data.Writer)}${metadata("Cast", data.Actors)}</dl></div>
      <div><h2 class="mb-4 text-xl font-bold">More information</h2><dl>${metadata("Release date", data.Released)}${metadata("Awards", data.Awards)}${metadata("Language", data.Language)}${metadata("Country", data.Country)}${metadata("Box office", data.BoxOffice)}${metadata("Production", data.Production)}${metadata("DVD", data.DVD)}</dl></div>
    </section>`;
}
if (imdbID && /^tt\d+$/.test(imdbID)) loadMovie(imdbID);
else showError("The movie ID is missing or invalid. Search for a title and open its details.");
