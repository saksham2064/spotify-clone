const currentSong = new Audio();

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch all files in albums folder
async function getAlbumFiles() {
    const res = await fetch("./albums/");
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const links = div.getElementsByTagName("a");

    const images = [];
    const songs = [];

    for (let link of links) {
        const file = decodeURIComponent(link.href.split("/albums/")[1]);
        if (!file) continue;
        if (file.endsWith(".mp3")) songs.push(file);
        else if (file.match(/\.(jpg|jpeg|png|gif)$/i)) images.push(file);
    }

    return { songs, images };
}

// Render albums as images/cards
async function showAlbums() {
    const { images } = await getAlbumFiles();
    const container = document.querySelector(".albumContainer");
    container.innerHTML = "";

    for (let img of images) {
        container.innerHTML += `
        <div class="albumCard" data-file="${img}">
            <img src="./albums/${img}" alt="${img}">
            <h3>${img.replace(/\.(jpg|jpeg|png|gif)/i, "")}</h3>
        </div>`;
    }
}

// Render songs in song list
async function showSongs() {
    const { songs } = await getAlbumFiles();
    const ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        ul.innerHTML += `
        <li class="songItem" data-track="${song}">
            <span>${song.replace(".mp3", "")}</span>
        </li>`;
    });

    document.querySelectorAll(".songItem").forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.dataset.track);
        });
    });
}

// Play a song
function playMusic(track) {
    currentSong.src = `./albums/${track}`;
    currentSong.play();
    document.querySelector(".songinfo").innerText = track.replace(".mp3", "");

    const playBtn = document.querySelector(".songbuttons img[src*='play']");
    if (playBtn) playBtn.src = "./pause.svg";
}

// MAIN
async function main() {
    await showAlbums();
    await showSongs();

    const playBtn = document.querySelector(".songbuttons img[src*='play']");
    const previousBtn = document.querySelector(".songbuttons img[src*='previous']");
    const nextBtn = document.querySelector(".songbuttons img[src*='nextsong']");

    // Play/Pause toggle
    playBtn?.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "./pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "./play.svg";
        }
    });

    // Update song time & circle
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = secondsToMinutesSeconds(currentSong.currentTime);
        const duration = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerText = `${currentTime} / ${duration}`;

        if (!isNaN(currentSong.duration)) {
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seek bar click
    document.querySelector(".seekbar")?.addEventListener("click", e => {
        const percent = (e.offsetX / e.target.clientWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Next/Previous buttons
    const songs = Array.from(document.querySelectorAll(".songItem")).map(li => li.dataset.track);

    previousBtn?.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    nextBtn?.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume slider
    const volumeInput = document.querySelector(".range input");
    volumeInput?.addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger")?.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close")?.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });
}

main();
