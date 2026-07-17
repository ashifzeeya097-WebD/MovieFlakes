/* ===========================================
   MOVIE DETAILS MODAL MODULE
=========================================== */

const movieModal = document.querySelector(".movie-modal");

const modalBackdrop = document.querySelector("#modalBackdrop");
const modalTitle = document.querySelector("#modalTitle");
const modalRating = document.querySelector("#modalRating");
const modalRuntime = document.querySelector("#modalRuntime");
const modalYear = document.querySelector("#modalYear");
const modalGenres = document.querySelector("#modalGenres");
const modalOverview = document.querySelector("#modalOverview");
const modalCast = document.querySelector("#modalCast");
const trailerButton = document.querySelector("#watchTrailerBtn");

let currentTrailer = null;


/* --------------------------
    Runtime Formatter
-------------------------- */

function formatRuntime(minutes){

    if(!minutes) return "N/A";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;

}


/* --------------------------
    Open Modal
-------------------------- */

function openMovieModal(){

    movieModal.classList.remove("hidden");

    requestAnimationFrame(() => {

        movieModal.classList.add("show");

    });

    document.body.style.overflow = "hidden";

}


/* --------------------------
    Close Modal
-------------------------- */

function closeMovieModal(){

    movieModal.classList.remove("show");

    document.body.style.overflow = "";

    setTimeout(() => {

        movieModal.classList.add("hidden");

    },300);

}


/* --------------------------
    Fetch Complete Movie
-------------------------- */

async function fetchMovieDetails(movieId){

    try{

        const [detailsRes, creditsRes, videosRes] =
            await Promise.all([

                fetch(
                    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
                ),

                fetch(
                    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
                ),

                fetch(
                    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
                )

            ]);

        const details = await detailsRes.json();
        const credits = await creditsRes.json();
        const videos = await videosRes.json();

        populateMovieModal(details,credits,videos);

        openMovieModal();

    }

    catch(error){

        console.error(error);

    }

}


/* --------------------------
    Populate Modal
-------------------------- */

function populateMovieModal(details,credits,videos){

    /* Banner */

    modalBackdrop.src =

        details.backdrop_path

        ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}`

        : "";



    /* Title */

    modalTitle.textContent = details.title;



    /* Rating */

    modalRating.textContent =

        `⭐ ${details.vote_average.toFixed(1)} (${details.vote_count.toLocaleString()} votes)`;



    /* Runtime */

    modalRuntime.textContent =

        formatRuntime(details.runtime);



    /* Year */

    modalYear.textContent =

        details.release_date
        ? details.release_date.slice(0,4)
        : "N/A";



    /* Overview */

    modalOverview.textContent =

        details.overview || "No overview available.";



    /* Genres */

    modalGenres.innerHTML = "";

    details.genres.forEach(genre=>{

        const pill = document.createElement("span");

        pill.className = "genre-pill";

        pill.textContent = genre.name;

        modalGenres.appendChild(pill);

    });



    /* Cast */

    modalCast.innerHTML = "";

    credits.cast
        .slice(0,5)
        .forEach(actor=>{

            const li = document.createElement("li");

            li.textContent = actor.name;

            modalCast.appendChild(li);

        });



    /* Trailer */

    currentTrailer = null;

    const trailer =

        videos.results.find(video=>

            video.site==="YouTube" &&
            video.type==="Trailer" &&
            video.official

        )

        ||

        videos.results.find(video=>

            video.site==="YouTube" &&
            video.type==="Trailer"

        )

        ||

        videos.results.find(video=>

            video.site==="YouTube"

        );



    if(trailer){

        currentTrailer =
            `https://www.youtube.com/watch?v=${trailer.key}`;

        trailerButton.disabled = false;

    }

    else{

        trailerButton.disabled = true;

    }

}


/* --------------------------
    Trailer Button
-------------------------- */

trailerButton.addEventListener("click",()=>{

    if(currentTrailer){

        window.open(currentTrailer,"_blank");

    }

});


/* --------------------------
    Close Events
-------------------------- */

document
.querySelector(".modal-overlay")
.addEventListener("click",closeMovieModal);

document
.querySelector(".modal-close")
.addEventListener("click",closeMovieModal);

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeMovieModal();

    }

});