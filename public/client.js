const API_BASE_URL = "http://localhost:9999/";
const YOUTUBE_PAGE_URL = "https://www.youtube.com/watch";
const INITIAL_THRESHOLD_OF_NOTIFICATION = 7;
const FAVORITE_MOVIES_STORAGE_KEY = "tsundokuAppFavoriteMovies";
const THRESHOLD_OF_NOTIFICATION_STORAGE_KEY = "tsundokuAppThresholdOfNotification";
const MAX_FAVORITE_MOVIE_COUNT = 50;

const favoriteMovieListElement = document.querySelector(".favorite-movie__list");
const notificationToastElement = document.querySelector(".notification-toast");
const maxAlertElement = document.querySelector(".favorite-movie__max_alert");
const searchInputElement = document.querySelector(".search-input");
const searchOrderElement = document.querySelector(".search-order");
const searchResultsElement = document.querySelector(".search-results");
const thresholdInputElement = document.querySelector(".favorite-movie__threshold-input");

initializePage();

function createFavoriteMovies() {
    const favoriteMovies = getMoviesFromLocalStorage();

    if (favoriteMovies.length === 0) {
        const emptyMoviesElement = createEmptyMoviesElement();
        favoriteMovieListElement.appendChild(emptyMoviesElement);
        return;
    }

    favoriteMovies.forEach((movie) => {
        const favoriteMovieItemElement = createFavoriteMovieItemElement(movie);
        const titleElement = createMovieTitleElement(
            "favorite-movie__item-title",
            movie
        );
        const imageElement = createMovieImageElement(
            "favorite-movie__item-image",
            movie
        );
        const flexContainerElement = createFlexContainerElement("favorite-movie__flex-container");
        const containerContentsElement = createContainerContentsElement("favorite-movie__container-contents");
        const memoElement = createMemoElement(movie);
        const dateElement = createDateElement(movie);
        const removeButtonElement = createRemoveButtonElement(movie);

        favoriteMovieItemElement.appendChild(titleElement);
        flexContainerElement.appendChild(imageElement);
        containerContentsElement.appendChild(dateElement);
        containerContentsElement.appendChild(removeButtonElement);
        flexContainerElement.appendChild(containerContentsElement);
        favoriteMovieItemElement.appendChild(flexContainerElement);
        if(movie.memo !== "") {
            favoriteMovieItemElement.appendChild(memoElement);
        }
        favoriteMovieListElement.appendChild(favoriteMovieItemElement);
    });
}

function createSearchResults(movies) {
    movies.forEach((movie) => {
        const favoriteButtonElement = createFavoriteButtonElement(movie);
        const flexContainerElement = createFlexContainerElement("search-results__flex-container");
        const imageElement = createMovieImageElement(
            "search-results__item-image",
            movie
        );
        const searchResultItemElement = createSearchResultItemElement();
        const memoInputElement = createMemoInputElement();
        const containerContentsElement = createContainerContentsElement("search-results__container-contents");
        const titleElement = createMovieTitleElement(
            "search-results__item-title",
            movie
        );

        searchResultsElement.appendChild(titleElement);
        flexContainerElement.appendChild(imageElement);
        containerContentsElement.appendChild(memoInputElement);
        containerContentsElement.appendChild(favoriteButtonElement);
        flexContainerElement.appendChild(containerContentsElement);
        searchResultItemElement.appendChild(flexContainerElement);
        searchResultsElement.appendChild(searchResultItemElement);
    });
}

function removeFavoriteMovie(movie) {
    const favoriteMoviesInLocalStorage = getMoviesFromLocalStorage();

    if (favoriteMoviesInLocalStorage.length === MAX_FAVORITE_MOVIE_COUNT) {
        maxAlertElement.classList.remove("display");
    }

    addMoviesToLocalStorage(
        favoriteMoviesInLocalStorage.filter((favoriteMovie) => {
            return favoriteMovie.id !== movie.id;
        })
    );
    updateFavoriteMovies();
}

function initializePage() {
    initializeThresholdInput();
    const emptySearchResultsElement = createEmptySearchResultsElement();
    searchResultsElement.appendChild(emptySearchResultsElement);
    updateFavoriteMovies();
    showNotificationToastIfNeeded();
}

function initializeThresholdInput() {
    const threshold = getThresholdFromLocalStorage();

    if (threshold === null) {
        saveThresholdToLocalStorage(INITIAL_THRESHOLD_OF_NOTIFICATION);
        thresholdInputElement.value = INITIAL_THRESHOLD_OF_NOTIFICATION;
    } else {
        thresholdInputElement.value = threshold;
    }
}

function showNotificationToast() {
    notificationToastElement.classList.add("display");
    notificationToastElement.addEventListener("animationend", () => {
        notificationToastElement.classList.remove("display");
    });
}

function showNotificationToastIfNeeded() {
    const favoriteMovies = getMoviesFromLocalStorage();
    const filteredMovies = favoriteMovies.filter((movie) => {
        return isBeforeDays(movie.date, Number(thresholdInputElement.value));
    });

    if (filteredMovies.length === 0) {
        return;
    }

    filteredMovies.forEach((movie) => {
        const movieTitleElement = createMovieTitleElement(
            "notification-toast__item-title",
            movie
        );
        notificationToastElement.appendChild(movieTitleElement);
    });

    showNotificationToast();
}

function updateFavoriteMovies() {
    removeChildElements(favoriteMovieListElement);
    createFavoriteMovies();
}

function createFavoriteButtonElement(movie) {
    const favoriteButtonElement = document.createElement("button");
    favoriteButtonElement.innerText = "積む";
    favoriteButtonElement.onclick = (element) => {
        const memo = element.target.parentNode.querySelector(".search-results__save-textarea").value;

        saveFavoriteMovie({
            id: movie.id,
            title: movie.title,
            imageUrl: movie.imageUrl,
            date: moment().format("YYYY-MM-DD"),
            memo: memo,
        });

        updateFavoriteMovies();
    };

    return favoriteButtonElement;
}

function createDateElement(movie) {
    const dateElement = document.createElement("div");
    dateElement.innerText = `登録日時:${movie.date}`;

    return dateElement;
}

function createEmptyMoviesElement() {
    const emptyMoviesElement = document.createElement("div");
    emptyMoviesElement.innerText = "積み動画はありません";

    return emptyMoviesElement;
}

function createEmptySearchResultsElement() {
    const emptySearchResultsElement = document.createElement("div");
    emptySearchResultsElement.innerText = "検索欄に検索したいキーワードを入力し、検索ボタンを押してください";

    return emptySearchResultsElement;
}

function createFavoriteMovieItemElement(movie) {
    const isRegisteredPast = isBeforeDays(
        movie.date,
        Number(thresholdInputElement.value)
    );
    const favoriteMovieItemElement = document.createElement("div");

    if (isRegisteredPast) {
        favoriteMovieItemElement.className = "favorite-movie__item-old";
    } else {
        favoriteMovieItemElement.className = "favorite-movie__item";
    }

    return favoriteMovieItemElement;
}

function createFlexContainerElement(className) {
    const flexContainerElement = document.createElement("div");
    flexContainerElement.className = className;

    return flexContainerElement;
}

function createMemoElement(movie) {
    const memoElement = document.createElement("div");
    memoElement.innerText = `メモ${movie.memo}`;
    memoElement.className = "favorite-movie__memo";

    return memoElement;
}

function createMemoInputElement() {
    const memoInputElement = document.createElement("textarea");
    memoInputElement.placeholder = "メモ欄";
    memoInputElement.className = "search-results__save-textarea";

    return memoInputElement;
}

function createMovieImageElement(className, movie) {
    const imageElement = document.createElement("img");
    imageElement.className = className;
    imageElement.src = movie.imageUrl;
    imageElement.onclick = () => {
        openYoutubePage(movie.id);
    };

    return imageElement;
}

function createMovieTitleElement(className, movie) {
    const titleElement = document.createElement("div");
    titleElement.className = className;
    titleElement.innerText = movie.title;

    return titleElement;
}

function createRemoveButtonElement(movie) {
    const removeButtonElement = document.createElement("button");
    removeButtonElement.innerText = "削除";
    removeButtonElement.onclick = () => {
        removeFavoriteMovie(movie);
    };

    return removeButtonElement;
}

function createSearchResultItemElement() {
    const searchResultItemElement = document.createElement("div");
    searchResultItemElement.className = "search-results__item";

    return searchResultItemElement;
}

function createContainerContentsElement(className) {
    const containerContentsElement = document.createElement("div");
    containerContentsElement.className = className;

    return containerContentsElement;
}

function addMoviesToLocalStorage(movies) {
    localStorage.setItem(FAVORITE_MOVIES_STORAGE_KEY, JSON.stringify(movies));
}

function getMoviesFromLocalStorage() {
    const favoriteMovies = JSON.parse(
        localStorage.getItem(FAVORITE_MOVIES_STORAGE_KEY)
    );
    return favoriteMovies ? favoriteMovies : [];
}

function getThresholdFromLocalStorage() {
    const threshold = localStorage.getItem(THRESHOLD_OF_NOTIFICATION_STORAGE_KEY);
    return threshold ? threshold : null;
}

function saveFavoriteMovie(movie) {
    const favoriteMoviesInLocalStorage = getMoviesFromLocalStorage();

    if (!favoriteMoviesInLocalStorage) {
        addMoviesToLocalStorage([movie]);
        return;
    }

    const targetIndex = favoriteMoviesInLocalStorage.findIndex((favorite) => {
        return favorite.id === movie.id;
    });

    if (targetIndex !== -1) {
        const newFavoriteMovies = favoriteMoviesInLocalStorage.filter((favoriteMovie, index) => {
            return index !== targetIndex;
        });
        newFavoriteMovies.unshift(movie);
        addMoviesToLocalStorage(newFavoriteMovies);
        return;
    }

    if (favoriteMoviesInLocalStorage.length >= MAX_FAVORITE_MOVIE_COUNT) {
        maxAlertElement.classList.add("display");
        return;
    }

    addMoviesToLocalStorage([movie].concat(favoriteMoviesInLocalStorage));
}

function saveThresholdToLocalStorage(threshold) {
    localStorage.setItem(THRESHOLD_OF_NOTIFICATION_STORAGE_KEY, threshold);
}

function isBeforeDays(dateString, days) {
    return moment(dateString).isSameOrBefore(moment().subtract(days, "days"), "day");
}

async function onClickSearch() {
    if (searchInputElement.value.length === 0) {
        return;
    }

    const param = new URLSearchParams({
        word: searchInputElement.value,
        order: searchOrderElement.value,
    });
    const response = await fetch(API_BASE_URL + "search?" + param);
    const movies = await response.json();
    removeChildElements(searchResultsElement);
    createSearchResults(movies);
}

function onInputThreshold() {
    thresholdInputElement.value = thresholdInputElement.value.replace(/[^0-9]+/, "");
    if (thresholdInputElement.value.length === 0) {
        return;
    }

    saveThresholdToLocalStorage(thresholdInputElement.value);
    updateFavoriteMovies();
}

function openYoutubePage(movieId) {
    window.open(`${YOUTUBE_PAGE_URL}?v=${movieId}`, "_blank");
}

function removeChildElements(parentElement) {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}