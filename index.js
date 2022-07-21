const autocompleteConfig = {
  renderOption(item) {
    return `<img src="${item.Poster === "N/A" ? "" : item.Poster}" />
           ${item.Title} ${item.Year}`;
  },

  inputValue(item) {
    return item.Title;
  },

  async fetchData(searchTerm) {
    const res = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: "5d2df049",
        s: searchTerm,
      },
    });
    if (res.data.Error) return [];
    return res.data.Search;
  },
};

createAutocomplete({
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(item) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(item.imdbID, document.querySelector("#left-summary"), "left");
  },
  ...autocompleteConfig,
});

createAutocomplete({
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(item) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(
      item.imdbID,
      document.querySelector("#right-summary"),
      "right"
    );
  },
  ...autocompleteConfig,
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (id, movieSummary, side) => {
  const res = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "5d2df049",
      i: id,
    },
  });
  movieSummary.innerHTML = movieTemplate(res.data);
  if (side === "left") {
    leftMovie = res.data;
  } else rightMovie = res.data;

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftStates = document.querySelectorAll("#left-summary .notification");
  const rightStates = document.querySelectorAll("#right-summary .notification");

  leftStates.forEach((leftData, index) => {
    let rightData = rightStates[index];
    let leftValue = parseInt(leftData.dataset.value);
    let rightValue = parseInt(rightData.dataset.value);

    if (leftValue > rightValue) {
      rightData.classList.remove("is-primary");
      rightData.classList.add("is-warning");
    } else {
      leftData.classList.remove("is-primary");
      leftData.classList.add("is-warning");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const boxOffice = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  const awards = movieDetail.Awards.split(" ").reduce((count, word) => {
    if (!isNaN(parseInt(word))) {
      return (count += parseInt(word));
    } else return count;
  }, 0);

  return `<article class="media">
    <figure class="media-left">
      <p class="image">
        <img src="${movieDetail.Poster}" />
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h1>${movieDetail.Title}</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </div>
  </article>
  <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${boxOffice} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
`;
};
