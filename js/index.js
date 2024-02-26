const APIController = (function () {
  const clientId = "60752f3b45744b0dabdd0c951db7f4c9";
  const clientSecret = "9c7c9480f1444094a80144e8da001055";

  // private methods
  const _getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
      },
      body: "grant_type=client_credentials",
    });

    const data = await result.json();
    console.log(data.access_token);
    return data.access_token;
  };

  const _getGenres = async (token) => {
    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories?locale=es_MX`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.categories.items;
  };

  const _getPlaylistByGenre = async (token, genreId) => {
    const limit = 50;

    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.playlists.items;
  };

  const _getTracks = async (token, tracksEndPoint) => {
    const limit = 20;

    const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    return data.items;
  };

  const _getTrack = async (token, trackEndPoint) => {
    const result = await fetch(`${trackEndPoint}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    return data;
  };

  return {
    getToken() {
      return _getToken();
    },
    getGenres(token) {
      return _getGenres(token);
    },
    getPlaylistByGenre(token, genreId) {
      return _getPlaylistByGenre(token, genreId);
    },
    getTracks(token, tracksEndPoint) {
      return _getTracks(token, tracksEndPoint);
    },
    getTrack(token, trackEndPoint) {
      return _getTrack(token, trackEndPoint);
    },
  };
})();

// UI Module
const UIController = (function () {
  //object to hold references to html selectors
  const DOMElements = {
    selectGenre: "#select_genre",
    selectPlaylist: "#select_playlist",
    buttonSubmit: "#btn_submit",
    divSongDetail: "#song-detail",
    hfToken: "#hidden_token",
    divSonglist: ".song-list",
  };

  //public methods
  return {
    //method to get input fields
    inputField() {
      return {
        genre: document.querySelector(DOMElements.selectGenre),
        playlist: document.querySelector(DOMElements.selectPlaylist),
        tracks: document.querySelector(DOMElements.divSonglist),
        submit: document.querySelector(DOMElements.buttonSubmit),
        songDetail: document.querySelector(DOMElements.divSongDetail),
      };
    },

    // need methods to create select list option
    createGenre(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectGenre)
        .insertAdjacentHTML("beforeend", html);
    },

    createPlaylist(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectPlaylist)
        .insertAdjacentHTML("beforeend", html);
    },

    // need method to create a track list group item
    createTrack(id, name, preview) {
      // const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name} - ${preview}</a>`;
      // const html = `<a href="#" class="flex flex-col" id="${id}">${name} - <img src="${preview}" alt="${name}"></a>`;
      const html = `<li class="flex flex-col justify-center align-center text-center "><a class="list-group-item flex flex-col ">${name} <img src="${preview}" alt="${name}" width="200" height="300" class="rounded-md"></a><a href="${id}">Escuchar</a></li>`;
      document
        .querySelector(DOMElements.divSonglist)
        .insertAdjacentHTML("beforeend", html);
    },

    // need method to create the song detail
    createTrackDetail(img, title, artist, preview_song) {
      const detailDiv = document.querySelector(DOMElements.divSongDetail);
      // any time user clicks a new song, we need to clear out the song detail div
      detailDiv.innerHTML = "";

      const html = `<audio src="${preview_song}" autoplay></audio>`;

      //   const html = `<iframe
      //   title="Spotify Embed: Recommendation Playlist "
      //   src="${url_song}utm_source=generator&theme=0"
      //   width="100%"
      //   height="100%"
      //   style={{ minHeight: '360px' }}
      //   frameBorder="0"
      //   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      //   loading="lazy"
      // />`

      // const html =
      // `
      // <div class="row col-sm-12 px-0">
      //     <img src="${img}" alt="">
      // </div>
      // <div class="row col-sm-12 px-0">
      //     <label for="Genre" class="form-label col-sm-12">${title}:</label>
      // </div>
      // <div class="row col-sm-12 px-0">
      //     <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
      // </div>
      // `;

      detailDiv.insertAdjacentHTML("beforeend", html);
    },

    resetTrackDetail() {
      this.inputField().songDetail.innerHTML = "";
    },

    resetTracks() {
      this.inputField().tracks.innerHTML = "";
      this.resetTrackDetail();
    },

    resetPlaylist() {
      this.inputField().playlist.innerHTML = "";
      this.resetTracks();
    },

    storeToken(value) {
      document.querySelector(DOMElements.hfToken).value = value;
    },

    getStoredToken() {
      return {
        token: document.querySelector(DOMElements.hfToken).value,
      };
    },
  };
})();

const APPController = (function (UICtrl, APICtrl) {
  // get input field object ref
  const DOMInputs = UICtrl.inputField();

  // get genres on page load
  const loadGenres = async () => {
    //get the token
    const token = await APICtrl.getToken();
    //store the token onto the page
    UICtrl.storeToken(token);
    //get the genres
    const genres = await APICtrl.getGenres(token);
    //populate our genres select element
    genres.forEach((element) => UICtrl.createGenre(element.name, element.id));
  };

  // create genre change event listener
  DOMInputs.genre.addEventListener("change", async () => {
    //reset the playlist
    UICtrl.resetPlaylist();
    //get the token that's stored on the page
    const token = UICtrl.getStoredToken().token;
    // get the genre select field
    const genreSelect = UICtrl.inputField().genre;
    // get the genre id associated with the selected genre
    const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    // ge the playlist based on a genre
    const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
    // create a playlist list item for every playlist returned
    playlist.forEach((p) => UICtrl.createPlaylist(p.name, p.tracks.href));
  });

  // create submit button click event listener
  DOMInputs.submit.addEventListener("click", async (e) => {
    // prevent page reset
    e.preventDefault();
    // clear tracks
    UICtrl.resetTracks();
    //get the token
    const token = UICtrl.getStoredToken().token;
    // get the playlist field
    const playlistSelect = UICtrl.inputField().playlist;
    // get track endpoint based on the selected playlist
    const tracksEndPoint =
      playlistSelect.options[playlistSelect.selectedIndex].value;
    // get the list of tracks
    const tracks = await APICtrl.getTracks(token, tracksEndPoint);
    // tracks.forEach(el => console.log(el.track.album.images));
    // create a track list item
    tracks.forEach((el) =>
      UICtrl.createTrack(
        el.track.href,
        el.track.name,
        el.track.album.images[1].url
      )
    );
  });

  // create song selection click event listener
  DOMInputs.tracks.addEventListener("click", async (e) => {
    // prevent page reset
    e.preventDefault();
    UICtrl.resetTrackDetail();
    // get the token
    const token = UICtrl.getStoredToken().token;
    // get the track endpoint
    // console.log(e);
    // const trackEndpoint = e.target.id;
    const trackEndpoint = e.target.href;
    // console.log(token);
    // console.log(trackEndpoint);
    // console.log(e.target.href);
    //get the track object
    const track = await APICtrl.getTrack(token, trackEndpoint);
    console.log(track);
    // load the track details
    // console.log('aaaaa');
    UICtrl.createTrackDetail(
      track.album.images[2].url,
      track.name,
      track.artists[0].name,
      track.preview_url
    );
  });

  async function getRecommendationsAsync(token) {
    if (!token) {
      token = UICtrl.getStoredToken().token;
    }

    if (!token) {
      console.error("No token");
      return;
    }

    const popularGenres = ["rock", "pop", "hip-hop", "electronic", "country"];
    const randomGenre =
      popularGenres[Math.floor(Math.random() * popularGenres.length)];

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=${randomGenre}&market=US`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    const songs = data.tracks;
    const songTitles = songs.map((song) => song.name);
    const songURIs = songs.map((song) => song.uri);
    track.innerHTML = songTitles;
    artist.innerHTML = songs[0].artists[0].name;

    description.innerText = `
      Artista: ${songs[0].artists[0].name}
      Fecha de salida: ${songs[0].album.release_date}
      Cancion Nro: ${songs.indexOf(songs[0]) + 1}
      `;

    const albumURIs = songs.map((song) => song.album.images[0].url);
    album.src = albumURIs[0];

    let audio;
    play.addEventListener("click", () => {
      if (audio) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
          audio.remove();
          audio = null;
        }
      } else {
        audio = new Audio(songs[0].preview_url);
        audio.play();
      }
    });
  }

  const album = document.getElementById("album-cover");
  const track = document.getElementById("song-name");
  const play = document.getElementById("play");
  const like = document.getElementById("like");
  const quite = document.getElementById("quite");
  const artist = document.getElementById("artist-name");
  const description = document.getElementById("song-description");

  const descubrir = document.getElementById("descubrir");
  descubrir.addEventListener("click", () => {
    getRecommendationsAsync();
  });

  return {
    init() {
      console.log("App is starting");
      loadGenres();
    },
  };
})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();
