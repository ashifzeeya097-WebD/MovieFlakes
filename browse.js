const browseGrid = document.querySelector(".browse-grid");
const browseWrapper = document.querySelector(".browse-wrapper");
const browseTitle = document.querySelector("#browse-title");

const scrollTopBtn = document.querySelector(".scroll-top-btn");

let currentBrowseEndpoint = "";
let currentBrowsePage = 1;
let totalBrowsePages = 1;

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

    if (currentBrowsePage > totalBrowsePages) return;

    isLoading = true;

    try{

        const separator =
            currentBrowseEndpoint.includes("?")
                ? "&"
                : "?";

        const endpoint =
            `${currentBrowseEndpoint}${separator}page=${currentBrowsePage}`;

        const append = currentBrowsePage > 1;

        const data =
            await fetchMovies(
                endpoint,
                ".browse-grid",
                append
            );

        totalBrowsePages = data.total_pages;

        currentBrowsePage++;

    }

    finally{

        isLoading = false;

    }

}

let scrollTimeout;

window.addEventListener("scroll", () => {

    if (!isBrowsing || isLoading) return;

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        if (

            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 600

        ){

            loadBrowsePage();

        }

    },200);

});

document
.querySelectorAll("[data-browse]")
.forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        enterBrowseMode(

            link.textContent.trim(),

            link.dataset.browse

        );

    });

});

document
.querySelectorAll("[data-genre]")
.forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        enterBrowseMode(

            link.textContent.trim(),

            `/discover/movie?with_genres=${link.dataset.genre}`

        );

    });

});

function appendMovies(movies, movieRow){

    movies.forEach(movie=>{

        movieRow.appendChild(

            createMovieCard(movie)

        );

    });

}

// Scroll to top button functionality

window.addEventListener("scroll", () => {

    const shouldShow =
        (isBrowsing || isSearching) &&
        window.scrollY > 500;

    scrollTopBtn.classList.toggle(
        "hidden",
        !shouldShow
    );

});

scrollTopBtn.addEventListener("click", () => {

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});