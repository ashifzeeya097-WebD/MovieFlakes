const searchWrapper = document.querySelector(".search-wrapper");
const searchGrid = document.querySelector(".search-grid");
const sectionTitle = document.querySelector("#section-title");
const searchInput = document.querySelector("#inputText");
const loadMoreBtn = document.querySelector(".load-more-btn");
const clearSearchBtn = document.querySelector(".clear-search-btn");

let isSearching = false;
let currentSearchQuery = "";
let currentSearchPage = 1;
let totalSearchPages = 1;

async function searchMovies(query, append = false) {
  const endpoint = `/search/movie?query=${encodeURIComponent(query)}&page=${currentSearchPage}`;

  const data = await fetchMovies(endpoint, ".search-grid", append);

  totalSearchPages = data.total_pages;

  loadMoreBtn.classList.toggle("hidden", currentSearchPage >= totalSearchPages);
}

async function enterSearchMode(query) {
  isSearching = true;
  isBrowsing = false;
  currentSearchQuery = query;
  currentSearchPage = 1;

  browseWrapper.classList.add("hidden");
  homeContent.classList.add("hidden");
  searchWrapper.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  sectionTitle.textContent = `🔍 Search Results for "${query}"`;
}

function exitSearchMode() {
  isSearching = false;

  searchWrapper.classList.add("hidden");
  loadMoreBtn.classList.add("hidden");

  if (!isBrowsing) {
    homeContent.classList.remove("hidden");
  }

  searchInput.value = "";
  searchGrid.innerHTML = "";
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearTimeout(searchTimeout);

  // Search cleared
  if (query.length === 0) {
    exitSearchMode();

    return;
  }

  // Wait until user types at least 3 characters
  if (query.length < 3) {
    return;
  }

  searchTimeout = setTimeout(() => {
    enterSearchMode(query);

    searchMovies(query);
  }, 500);
});

searchInput.addEventListener("input", () => {
  clearSearchBtn.classList.toggle("hidden", searchInput.value.trim() === "");
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";

  exitSearchMode();

  clearSearchBtn.classList.add("hidden");

  searchInput.focus();
});

loadMoreBtn.addEventListener("click", async () => {
  if (currentSearchPage >= totalSearchPages) return;

  currentSearchPage++;

  await searchMovies(currentSearchQuery, true);
});
