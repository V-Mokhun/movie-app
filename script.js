"use strict";
let page = 1;
const API_KEY = `api_key=04c35731a5ee918f014970082a0088b1`;
const TOP_MOVIES = `https://api.themoviedb.org/3/movie/top_rated?${API_KEY}&language=en-US&page=${page}`;
const UPCOMING_MOVIES = `https://api.themoviedb.org/3/movie/upcoming?${API_KEY}&language=en-US&page=${page}`;
const POPULAR_MOVIES = `http://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&${API_KEY}&page=${page}`;
const IMAGE_PATH = `https://image.tmdb.org/t/p/w1280`;
const SEARCH_API = `http://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=`;

const main = document.querySelector(".main");
const moviesTypesContainer = document.querySelector(".types");
const form = document.querySelector(".form");
const preloader = document.querySelector(".preloader");

window.onload = function () {
  preloader.classList.add("hide");
};

getMovies(TOP_MOVIES);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = form.querySelector(".search");
  if (!searchInput.value) return;

  removeActiveClasses();
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

    if (responseData.results.length < 1) {
      setErrorMessage("Could not find any movie with that name. Try Again!");
      return;
    }

    // show movies
    showMovies(responseData.results);
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
    } = movie;

    // create movie element
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
				<span class="movie__rating">${voteAverage}</span>
				<div class="movie__img-wrapper">
				<img src="${IMAGE_PATH + posterPath}" alt="${title}" class="movie__img">
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
