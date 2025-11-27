const currentSong = new Audio();

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,'0')}:${String(remainingSeconds).padStart(2,'0')}`;
}

// Fetch songs from server
async function getSongs() {
    console.log("Fetching songs...");
    const res = await fetch("http://127.0.0.1:5500/songs/");
    const text = await res.text();
    const div = document.createElement("div");
    div.innerHTML = text;
    const as = div.getElementsByTagName("a");

    const songs = [];
    for (let i = 0; i < as.length; i++) {
        const el = as[i];
        if (el.href.endsWith(".mp3")) {
            songs.push(el.href.split("songs/")[1]);
        }
    }
    console.log("Songs found:", songs);
    return songs;
}

// Fetch album images from albums folder
async function getAlbumImages() {
    console.log("Fetching album images...");
    const res = await fetch("http://127.0.0.1:5500/albums/");
    const text = await res.text();
    const div = document.createElement("div");
    div.innerHTML = text;
    const as = div.getElementsByTagName("a");

    const images = [];
    for (let i = 0; i < as.length; i++) {
        const el = as[i];
        if (el.href.endsWith(".jpg") || el.href.endsWith(".jpeg") || el.href.endsWith(".png")) {
            images.push("albums/" + el.href.split("albums/")[1]);
        }
    }
    console.log("Album images found:", images);
    return images;
}

// Play song by filename
function playMusic(track) {
    currentSong.src = "/songs/" + track;
    currentSong.play();
    document.querySelector(".songinfo").innerText = track.replaceAll("%20"," ").replace(".mp3","");
}

// Render songs in sidebar
function renderSongs(songs) {
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    console.log("Rendering songs:", songs);

    for (const song of songs) {
        const li = document.createElement("li");
        li.className = "songItem";
        li.innerHTML = `
            <img class="invert" src="play.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Skm</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="playlist.svg" alt="">
            </div>
        `;
        li.addEventListener("click", () => playMusic(song));
        songUL.appendChild(li);
    }
}

// Render album cards dynamically
async function renderAlbums() {
    const images = await getAlbumImages();
    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";
    console.log("Rendering albums...");

    for (const img of images) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="play"><i class="fa-solid fa-play"></i></div>
            <img src="${img}" alt="album">
            <h1>Album</h1>
            <p>Listen to this album</p>
        `;
        container.appendChild(card);

        card.addEventListener("click", () => {
            alert(`Clicked album: ${img}`);
        });
    }
}

// Initialize player controls
function initPlayerControls(songs) {
    const previous = document.querySelector(".songbuttons img[src*='previous.svg']");
    const next = document.querySelector(".songbuttons img[src*='nextsong.svg']");
    const playBtn = document.querySelector(".songbuttons img[src*='play.svg']");

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "play.svg";
        }
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Update time
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = secondsToMinutesSeconds(currentSong.currentTime);
        const duration = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerText = `${currentTime} / ${duration}`;
        if (!isNaN(currentSong.duration)) {
            let percent = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = `${percent}%`;
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });
}

// MAIN FUNCTION
async function main() {
    const songs = await getSongs();
    renderSongs(songs);
    initPlayerControls(songs);
    await renderAlbums();
    console.log("Player initialized.");
}

main();
