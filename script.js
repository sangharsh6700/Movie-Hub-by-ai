// Movie Hub homepage. Replace this key with your own OMDb API key.
const OMDB_API_KEY = "8e0ddfa0";
const API_BASE = "https://www.omdbapi.com/";
const movieForm = document.querySelector("#movieForm");
const movieInput = document.querySelector("#movieInput");
const movieHub = document.querySelector("#movieHub");
const statusMessage = document.querySelector("#statusMessage");
const pagination = document.querySelector("#pagination");
const sortSelect = document.querySelector("#sortSelect");
const favoriteCount = document.querySelector("#favoriteCount");
let currentQuery = "";
let currentPage = 1;
let currentMovies = [];
let viewingFavorites = false;
const FAVORITES_KEY = "movieHubFavorites";

function icon(name, classes = "h-4 w-4") {
  const paths = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>'
  };
  return `<svg viewBox="0 0 24 24" class="${classes}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}
function readFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}
function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  updateFavoriteCount();
}
function updateFavoriteCount() { if (favoriteCount) favoriteCount.textContent = readFavorites().length; }
function safeText(value, fallback = "Not available") {
  return value && value !== "N/A" ? String(value) : fallback;
}
function posterUrl(movie) {
  return movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "";
}
function showStatus(message, kind = "normal") {
  statusMessage.textContent = message;
  statusMessage.className = `mb-4 text-sm ${kind === "error" ? "text-rose-300" : "text-zinc-400"}`;
}
function showSkeletons() {
  movieHub.innerHTML = Array.from({ length: 10 }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");
  pagination.innerHTML = "";
}
async function apiRequest(params) {
  const url = new URL(API_BASE);
  url.search = new URLSearchParams({ apikey: OMDB_API_KEY, ...params }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error("The movie service could not be reached. Please try again.");
  const data = await response.json();
  if (data.Response === "False") throw new Error(data.Error || "No movies found.");
  return data;
}
async function searchMovies(query, page = 1) {
  currentQuery = query.trim();
  currentPage = page;
  viewingFavorites = false;
  if (!currentQuery) { showStatus("Enter a movie title to start exploring."); movieHub.innerHTML = ""; pagination.innerHTML = ""; return; }
  showSkeletons();
  showStatus(`Searching for “${currentQuery}”…`);
  try {
    const data = await apiRequest({ s: currentQuery, type: "movie", page: String(page) });
    currentMovies = data.Search || [];
    renderMovies();
    const total = Number(data.totalResults || currentMovies.length);
    showStatus(`${total.toLocaleString()} results for “${currentQuery}” · Page ${page}`);
    renderPagination(total);
  } catch (error) {
    currentMovies = [];
    movieHub.innerHTML = `<div class="col-span-full rounded-2xl border border-white/10 bg-panel px-6 py-12 text-center"><div class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-500/10 text-rose-300">${icon("arrow", "h-5 w-5 rotate-180")}</div><h3 class="text-lg font-semibold text-white">We couldn't find that title</h3><p class="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">${escapeHtml(error.message)} Check the spelling or try another search.</p></div>`;
    pagination.innerHTML = "";
    showStatus("Search complete.", "error");
  }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function renderMovies() {
  let movies = [...currentMovies];
  const sort = sortSelect?.value;
  if (sort === "year") movies.sort((a,b) => Number.parseInt(b.Year,10) - Number.parseInt(a.Year,10));
  if (sort === "title") movies.sort((a,b) => a.Title.localeCompare(b.Title));
  if (!movies.length) {
    movieHub.innerHTML = '<div class="col-span-full py-12 text-center text-zinc-400">No movies to display yet.</div>';
    return;
  }
  const favorites = readFavorites();
  movieHub.innerHTML = movies.map(movie => {
    const isFavorite = favorites.some(item => item.imdbID === movie.imdbID);
    const poster = posterUrl(movie);
    return `<article class="movie-card group">
      <div class="poster-wrap">
        <img src="${escapeHtml(poster || "https://placehold.co/400x600/18181b/71717a?text=Poster+Unavailable")}" alt="${escapeHtml(movie.Title)} poster" loading="lazy">
        <button type="button" class="favorite-toggle ${isFavorite ? "is-favorite" : ""}" data-favorite="${escapeHtml(movie.imdbID)}" aria-label="${isFavorite ? "Remove from" : "Add to"} favorites" aria-pressed="${isFavorite}">${icon("heart", "h-4 w-4")}</button>
        <div class="card-overlay"><a href="movie-details.html?id=${encodeURIComponent(movie.imdbID)}" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-rose-100">View details ${icon("arrow")}</a></div>
      </div>
      <div class="p-3.5 sm:p-4"><a href="movie-details.html?id=${encodeURIComponent(movie.imdbID)}" class="line-clamp-2 min-h-10 font-semibold leading-5 text-zinc-100 transition hover:text-rose-300">${escapeHtml(movie.Title)}</a><div class="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500"><span>${escapeHtml(safeText(movie.Year, "Year unknown"))}</span><span class="rounded-md border border-white/10 px-2 py-1 uppercase tracking-wide">${escapeHtml(safeText(movie.Type, "Movie"))}</span></div></div>
    </article>`;
  }).join("");
}
function renderPagination(total) {
  const pages = Math.min(100, Math.ceil(total / 10));
  if (pages <= 1) { pagination.innerHTML = ""; return; }
  pagination.innerHTML = `<button ${currentPage <= 1 ? "disabled" : ""} data-page="${currentPage-1}" class="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">Previous</button><span class="self-center text-sm text-zinc-500">Page ${currentPage} of ${pages}</span><button ${currentPage >= pages ? "disabled" : ""} data-page="${currentPage+1}" class="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">Next</button>`;
}
function showFavorites() {
  viewingFavorites = true;
  currentQuery = "";
  pagination.innerHTML = "";
  const favorites = readFavorites();
  if (!favorites.length) {
    movieHub.innerHTML = '<div class="col-span-full rounded-2xl border border-white/10 bg-panel px-6 py-12 text-center"><h3 class="text-lg font-semibold">Your watchlist is waiting</h3><p class="mt-2 text-sm text-zinc-400">Tap the heart on any movie to save it here.</p></div>';
    showStatus("Your saved movies are stored on this device.");
    return;
  }
  currentMovies = favorites;
  renderMovies();
  showStatus(`${favorites.length} saved ${favorites.length === 1 ? "movie" : "movies"}.`);
  document.querySelector("#discover")?.scrollIntoView({ behavior: "smooth" });
}
movieForm?.addEventListener("submit", event => { event.preventDefault(); searchMovies(movieInput.value); });
document.querySelector("#quickSearches")?.addEventListener("click", event => {
  const button = event.target.closest("[data-query]");
  if (!button) return;
  movieInput.value = button.dataset.query;
  searchMovies(button.dataset.query);
});
movieHub?.addEventListener("click", event => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;
  const id = button.dataset.favorite;
  const favorites = readFavorites();
  const existing = favorites.findIndex(item => item.imdbID === id);
  if (existing >= 0) favorites.splice(existing, 1);
  else {
    const movie = currentMovies.find(item => item.imdbID === id);
    if (movie) favorites.unshift({ ...movie });
  }
  saveFavorites(favorites);
  if (viewingFavorites) showFavorites(); else renderMovies();
});
pagination?.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");
  if (button && !button.disabled) searchMovies(currentQuery, Number(button.dataset.page));
});
sortSelect?.addEventListener("change", () => { if (viewingFavorites) renderMovies(); else renderMovies(); });
document.querySelector("#favoritesNav")?.addEventListener("click", showFavorites);
document.querySelector("#mobileFavoritesNav")?.addEventListener("click", () => { showFavorites(); document.querySelector("#mobileMenu")?.classList.add("hidden"); });
document.querySelector("#heroFavorites")?.addEventListener("click", showFavorites);
const mobileMenuButton = document.querySelector("#mobileMenuButton");
mobileMenuButton?.addEventListener("click", () => {
  const menu = document.querySelector("#mobileMenu");
  const isOpen = !menu.classList.contains("hidden");
  menu.classList.toggle("hidden", isOpen);
  mobileMenuButton.setAttribute("aria-expanded", String(!isOpen));
});
document.querySelectorAll("#mobileMenu a").forEach(link => link.addEventListener("click", () => document.querySelector("#mobileMenu")?.classList.add("hidden")));
updateFavoriteCount();
