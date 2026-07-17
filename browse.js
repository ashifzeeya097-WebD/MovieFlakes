const browseGrid = document.querySelector(".browse-grid");
const browseWrapper = document.querySelector(".browse-wrapper");
const browseTitle = document.querySelector("#browse-title");

let currentBrowseEndpoint = "";
let currentBrowsePage = 1;

async function enterBrowseMode(title, endpoint) {

    isBrowsing = true;

    homeContent.classList.add("hidden");
    searchWrapper.classList.add("hidden");
    browseWrapper.classList.remove("hidden");

    browseTitle.textContent = title;

    currentBrowseEndpoint = endpoint;
    currentBrowsePage = 1;

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

    await loadBrowsePage();
}

async function loadBrowsePage() {

    if (isLoading) return;

    isLoading = true;

    const separator = currentBrowseEndpoint.includes("?") ? "&" : "?";

    const endpoint =
        `${currentBrowseEndpoint}${separator}page=${currentBrowsePage}`;

    await fetchMovies(endpoint, ".browse-grid", false);

    currentBrowsePage++;

    isLoading = false;
}