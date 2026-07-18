// grabbing the trending movie section for scrolling

const STORAGE_KEY = "movieAppState";
const API_KEY = "3ea9b9899a266f601028fbdd3d760786";
const BASE_URL = "https://api.themoviedb.org/3";

const likedRow = document.querySelector(".liked-row");
const trendingRow = document.querySelector(".trending-row");
const popularRow = document.querySelector(".popular-row");

const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const likedNextBtn = document.querySelector(".liked-next-btn");
const likedPrevBtn = document.querySelector(".liked-prev-btn");

const likedWrapper = document.querySelector(".liked-wrapper");
const trendingWrapper = document.querySelector(".trending-wrapper");
const dropBtn = document.querySelector(".dropdown-btn");
const menu = document.querySelector(".dropdown-menu");
const logoBtn = document.querySelector(".title");

const homeContent = document.querySelector(".home-content");

let currentView = "trending";
let trendingMovies = [];
let likedMovies = [];

let isBrowsing = false;
let isLoading = false;

let searchTimeout;
const genreMap = {};
const appState = loadAppState();

function createEmptyState() {
  return {
    liked: {},
  };
}

function loadAppState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") {
      return createEmptyState();
    }

    return {
      liked: stored.liked || {},
    };
  } catch (error) {
    console.warn("Failed to load saved movie state:", error);
    return createEmptyState();
  }
}

function saveAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function getMovieState(movieId) {
  return {
    liked: !!appState.liked[movieId],
  };
}

function updateMovieState(movie, updates) {
  const id = movie.id;
  if (!id) return;

  if (updates.hasOwnProperty("liked")) {
    if (updates.liked) {
      appState.liked[id] = movie;
    } else {
      delete appState.liked[id];
    }
  }

  saveAppState();
}

function getMoviesEndpoint(category, timeWindow = "day") {
  const normalized = String(category).toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "popular":
      return "/movie/popular?";
    case "top_rated":
    case "top rated":
      return "/movie/top_rated?";
    case "upcoming":
      return "/movie/upcoming?";
    case "now_playing":
    case "now playing":
      return "/movie/now_playing?";
    case "trending":
      return `/trending/movie/${timeWindow}?`;
    default:
      return `/movie/${normalized}?`;
  }
}

async function fetchGenres() {
  const [movieRes, tvRes] = await Promise.all([
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`),
    fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`),
  ]);

  const movieData = await movieRes.json();
  const tvData = await tvRes.json();

  [...movieData.genres, ...tvData.genres].forEach((genre) => {
    genreMap[genre.id] = genre.name;
  });
}

async function fetchMovies(
  endpoint,
  rowSelector = ".trending-row",
  append = false,
) {
  const movieRow = document.querySelector(rowSelector);
  if (!movieRow) {
    console.error("Movie row selector not found:", rowSelector);
    return;
  }

  if (!append) {
    const skeletonCount =
      rowSelector === ".browse-grid" || rowSelector === ".search-grid" ? 12 : 8;

    showLoader(movieRow, skeletonCount);
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        "Failed to fetch movies:",
        response.status,
        response.statusText,
        url,
      );
      return;
    }

    const data = await response.json();
    const movies = Array.isArray(data.results) ? data.results : [];

    if (rowSelector === ".trending-row") {
      trendingMovies = movies;
    }

    if (rowSelector === ".popular-row") {
      popularMovies = movies;
    }

    if (rowSelector === ".search-grid") {
      searchMoviesList = append ? [...searchMoviesList, ...movies] : movies;
    }

    if (append) {
      appendMovies(movies, movieRow);
    } else {
      displayMovies(movies, movieRow);
    }

    return data;
  } catch (error) {
    console.error("Error fetching movies:", error, url);
  }
}

function displayMovies(movies, movieRow) {
  if (!movieRow) return;

  movieRow.innerHTML = "";

  if (!movies.length) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No movies available.";
    movieRow.appendChild(emptyMessage);
    return;
  }

  movies.forEach((movie) => {
    movieRow.appendChild(createMovieCard(movie));
  });
}

function createMovieCard(movie) {
  const state = getMovieState(movie.id);
  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : " ";
  const releaseDate = movie.release_date || movie.first_air_date;
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : "N/A";
  const genre = movie.genre_ids?.length ? genreMap[movie.genre_ids[0]] : "N/A";
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");

  movieCard.innerHTML = `
    <div class="movie-actions">
        <button
            class="icon-btn like-btn ${state.liked ? "active liked" : "liked"}"
            title="${state.liked ? "Remove from Watchlist" : "Add to Watchlist"}">
            ${state.liked ? "❤️" : "🤍"}
        </button>
    </div>

    <img src="${posterPath}" alt="${movie.title || "Movie Poster"}" />

    <div class="movie-info">
        <h3 class="movie-title">${movie.title || movie.name || "Untitled"}</h3>

        <div class="details">
            <span>${genre}</span>
            <span>${releaseYear}</span>
            <span>⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
        </div>
    </div>
`;

  movieCard.addEventListener("click", () => {
    fetchMovieDetails(movie.id);
  });

  const likeButton = movieCard.querySelector(".like-btn");

  likeButton.addEventListener("click", (event) => {
    event.stopPropagation();

    state.liked = !state.liked;

    updateMovieState(movie, { liked: state.liked });

    likeButton.classList.toggle("active", state.liked);
    likeButton.textContent = state.liked ? "❤️" : "🤍";
    likeButton.title = state.liked
      ? "Remove from Watchlist"
      : "Add to Watchlist";

    renderLikedMovies();
  });

  return movieCard;
}

function renderLikedMovies() {
  if (!likedRow) return;
  displayMovies(Object.values(appState.liked), likedRow);
}

renderLikedMovies();

document.querySelectorAll(".carousel-section").forEach((section) => {
  const prevBtn = section.querySelector(".prev, .prev-btn");
  const nextBtn = section.querySelector(".next, .next-btn");
  const row = section.querySelector(".movie-row");

  if (!row) return;

  prevBtn?.addEventListener("click", () => {
    row.scrollBy({
      left: -500,
      behavior: "smooth",
    });
  });

  nextBtn?.addEventListener("click", () => {
    row.scrollBy({
      left: 500,
      behavior: "smooth",
    });
  });
});

document.querySelectorAll(".segmented-control").forEach((control) => {
  const buttons = control.querySelectorAll("button");
  const slider = control.querySelector(".slider");

  buttons.forEach((button, index) => {
    button.addEventListener("click", async () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      if (slider) {
        slider.style.transform = `translateX(${index * 100}%)`;
      }

      const endpoint = button.dataset.endpoint;

      const section = control.closest(".carousel-section");

      let rowSelector = "";

      if (section.classList.contains("trending-wrapper")) {
        rowSelector = ".trending-row";
      } else if (section.classList.contains("popular-wrapper")) {
        rowSelector = ".popular-row";
      }

      if (endpoint && rowSelector) {
        await fetchMovies(endpoint, rowSelector);
      }
    });
  });
});

dropBtn.addEventListener("click", () => {
  menu.classList.toggle("show");
  dropBtn.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !dropBtn.contains(e.target)) {
    menu.classList.remove("show");
    dropBtn.classList.remove("active");
  }
});

const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.querySelector(".navbar-mobile");
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  menuBtn.classList.toggle("active");
  mobileNav.classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
    mobileNav.classList.remove("show");
    menuBtn.classList.remove("active");
  }
});

function resetHome() {
  searchInput.value = "";

  isBrowsing = false;

  browseWrapper.classList.add("hidden");
  searchWrapper.classList.add("hidden");

  homeContent.classList.remove("hidden");

  exitSearchMode();

  displayMovies(trendingMovies, trendingRow);

  displayMovies(popularMovies, popularRow);
}

logoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  resetHome();
});

function renderAllRows() {
  displayMovies(trendingMovies, trendingRow);

  displayMovies(popularMovies, popularRow);

  renderLikedMovies();
}

const switcher = document.querySelector(".segmented-control");
const buttons = switcher.querySelectorAll("button");
const slider = switcher.querySelector(".slider");

const windows = ["day", "week"];

buttons.forEach((btn, index) => {
  btn.addEventListener("click", async () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    slider.style.transform = `translateX(${index * 100}%)`;

    const endpoint = getMoviesEndpoint("trending", windows[index]);

    await fetchMovies(endpoint, ".trending-row");
  });
});

async function init() {
  await fetchGenres();

  await fetchMovies(getMoviesEndpoint("trending", "day"), ".trending-row");

  await fetchMovies(
    "/discover/movie?with_watch_monetization_types=flatrate",
    ".popular-row",
  );

  renderLikedMovies();

  exitSearchMode();
}

init();
