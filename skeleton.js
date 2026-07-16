function showLoader(movieRow, count = 8) {
    movieRow.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "movie-card skeleton-card";

        skeleton.innerHTML = `
            <div class="skeleton-poster"></div>

            <div class="skeleton-info">
                <div class="skeleton-title"></div>

                <div class="skeleton-details">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        movieRow.appendChild(skeleton);
    }
}