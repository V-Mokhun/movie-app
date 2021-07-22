"use strict";
let page = 1;
let totalPages = 0;
let currentType;

const API_KEY = `api_key=04c35731a5ee918f014970082a0088b1`;
const TOP_MOVIES = `https://api.themoviedb.org/3/movie/top_rated?${API_KEY}&language=en-US&page=${page}`;
const UPCOMING_MOVIES = `https://api.themoviedb.org/3/movie/upcoming?${API_KEY}&language=en-US&page=${page}`;
const POPULAR_MOVIES = `http://api.themoviedb.org/3/discover/movie/?sort_by=popularity.desc&${API_KEY}&page=${page}`;
const IMAGE_PATH = `https://image.tmdb.org/t/p/w1280`;
const SEARCH_API = `http://api.themoviedb.org/3/search/movie/?&api_key=04c35731a5ee918f014970082a0088b1&query=`;

const main = document.querySelector(".main");
const moviesTypesContainer = document.querySelector(".types");
const form = document.querySelector(".form");
const preloader = document.querySelector(".preloader");
const pagination = document.querySelector(".pagination");
const paginationFirst = document.querySelector(".pagination-button--first");
const paginationPrev = document.querySelector(".pagination-button--prev");
const paginationCurr = document.querySelector(".pagination-button--curr");
const paginationNext = document.querySelector(".pagination-button--next");
const paginationLast = document.querySelector(".pagination-button--last");
const paginationDotsStart = document.querySelector(".dots-start");
const paginationDotsEnd = document.querySelector(".dots-end");

window.onload = function () {
  preloader.classList.add("hide");
};

getMovies(TOP_MOVIES);

function setPagination(numberOfPages) {
  // display all buttons
  [...pagination.children].forEach((child) => child.classList.remove("hide"));

  // set contents for all buttons
  paginationFirst.textContent = 1;
  paginationPrev.textContent = page - 1;
  paginationCurr.textContent = page;
  paginationNext.textContent = page + 1;
  paginationLast.textContent = numberOfPages;

  // hide some buttons if needed

  if (page === 1) {
    paginationFirst.classList.add("hide");
    paginationPrev.classList.add("hide");
  }

  if (page === 2) {
    paginationPrev.classList.add("hide");
  }

  if (page < 4) paginationDotsStart.classList.add("hide");

  if (page === numberOfPages - 1) paginationLast.classList.add("hide");

  if (page === numberOfPages) {
    paginationNext.classList.add("hide");
    paginationLast.classList.add("hide");
  }

  if (numberOfPages - page < 3) paginationDotsEnd.classList.add("hide");
}

pagination.addEventListener("click", (e) => {
  const paginationBtn = e.target.closest(".pagination-button");
  if (!paginationBtn) return;

  // logic for pagination and page changing

  if (paginationBtn === paginationFirst) {
    page = 1;
    getMovies(currentType + page);
  }
  if (paginationBtn === paginationPrev) {
    page--;
    getMovies(currentType + page);
  }
  if (paginationBtn === paginationCurr) return;

  if (paginationBtn === paginationNext) {
    page++;
    getMovies(currentType + page);
  }
  if (paginationBtn === paginationLast) {
    page = totalPages;
    getMovies(currentType + page);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = form.querySelector(".search");
  if (!searchInput.value) return;

  removeActiveClasses();
  page = 1;
  // get search result
  getMovies(SEARCH_API + searchInput.value);
  searchInput.value = "";
});

moviesTypesContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".types__btn");
  if (!btn) return;

  // to not reload page
  if (btn.classList.contains("active")) return;

  // give active to clicked btn
  removeActiveClasses();
  page = 1;
  btn.classList.add("active");

  // get proper movies
  if (btn.classList.contains("top-movies")) getMovies(TOP_MOVIES);
  else if (btn.classList.contains("upcoming-movies"))
    getMovies(UPCOMING_MOVIES);
  else if (btn.classList.contains("popular-movies")) getMovies(POPULAR_MOVIES);
});

function removeActiveClasses() {
  moviesTypesContainer
    .querySelectorAll(".types__btn")
    .forEach((btn) => btn.classList.remove("active"));
}

async function getMovies(typeOfMovies) {
  try {
    // get the data
    const response = await fetch(typeOfMovies);
    const responseData = await response.json();

    // if no movies found
    if (responseData.results.length < 1) {
      setErrorMessage("Could not find any movie with that name. Try Again!");
      return;
    }

    // display pagination properly
    totalPages = responseData.total_pages;
    setPagination(totalPages);

    // show movies
    showMovies(responseData.results);

    if (typeOfMovies.includes("&page=")) {
      currentType = typeOfMovies.replace(/\d+$/, ""); // normal situation
    } else {
      currentType = `${typeOfMovies}&page=`; // search result situtation
    }
  } catch (err) {
    // just in case
    console.error(err);
  }
}

function showMovies(data) {
  main.innerHTML = "";

  data.forEach((movie) => {
    // get needed info about movie
    const {
      vote_average: voteAverage,
      title,
      poster_path: posterPath,
      release_date: releaseDate,
      overview,
    } = movie;

    if (!posterPath || !releaseDate) return;

    // create movie element
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
				<span class="movie__rating">${voteAverage}</span>
				<div class="movie__img-wrapper">
				<img src="${IMAGE_PATH + posterPath}" alt="${title}" class="movie__img">
				<div class="movie__description">
					<h4>${title}</h4>
					<p>${overview}</p>
				</div>
				</div>
				<div class="movie__info">
					<div class="movie__date">${releaseDate.slice(0, 4)}</div>
					<h4 class="movie__title">${title}</h4>
				</div>
			`;

    // append movie element
    main.appendChild(movieEl);
  });
}

function setErrorMessage(message) {
  const errorMessage = document.createElement("h3");
  errorMessage.classList.add("error-message");
  errorMessage.textContent = message;

  main.innerHTML = "";
  main.appendChild(errorMessage);
}
