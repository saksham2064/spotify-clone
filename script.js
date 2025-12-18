const currentSong = new Audio();

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// -----------------------------
// Albums array with your images and random songs
const albums = [
    { image: "pexels-atomlaborblog-844923.jpg", song: "car%arif%track1.mp3" },
    { image: "pexels-edurawpro-34933950.jpg", song: "random%20song2.mp3" },
    { image: "pexels-edurawpro-34933960.jpg", song: "strange%name3.mp3" },
    { image: "pexels-edurawpro-34933966.jpg", song: "song%204.mp3" },
    { image: "pexels-edurawpro-34933970.jpg", song: "track5.mp3" },
    { image: "pexels-farhan-ishraq-rudra-122465-375751.jpg", song: "my%20song6.mp3" },
    { image: "pexels-garrettmorrow-1649771.jpg", song: "random7.mp3" },
    { image: "pexels-kinkate-205926.jpg", song: "song8.mp3" },
    { image: "pexels-ola-dapo-1754561-3345882.jpg", song: "weird%name9.mp3" },
    { image: "pexels-sound-on-3394648.jpg", song: "track10.mp3" }
];
// -----------------------------

// Render albums
function renderAlbums() {
    const container = document.querySelector(".albumContainer");
    container.innerHTML = "";

    albums.forEach((item, index) => {
        container.innerHTML += `
        <div class="albumCard" data-index="${index}">
            <img src="./albums/${item.image}" alt="${item.image}">
            <h3>${decodeURIComponent(item.image.replace(/\.(jpg|jpeg|png|gif)/i, ""))}</h3>
        </div>`;
    });

    document.querySelectorAll(".albumCard").forEach(card => {
        card.addEventListener("click", () => {
            const index = card.dataset.index;
            playMusic(albums[index]);
        });
    });
}

// Render songs list
function renderSongs() {
    const ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    albums.forEach((item, index) => {
        ul.innerHTML += `
        <li class="songItem" data-index="${index}">
            <span>${decodeURIComponent(item.song.replace(".mp3", ""))}</span>
        </li>`;
    });

    document.querySelectorAll(".songItem").forEach(item => {
        item.addEventListener("click", () => {
            const index = item.dataset.index;
            playMusic(albums[index]);
        });
    });
}

// Play music function
function playMusic(item) {
    currentSong.src = `./albums/${item.song}`;
    currentSong.play();
    document.querySelector(".songinfo").innerText = decodeURIComponent(item.song.replace(".mp3", ""));

    const playBtn = document.querySelector(".songbuttons img[src*='play']");
    if (playBtn) playBtn.src = "./pause.svg";

    const cover = document.querySelector(".currentCover");
    if (cover) cover.src = `./albums/${item.image}`;
}

// Main initialization
function main() {
    renderAlbums();
    renderSongs();

    const playBtn = document.querySelector(".songbuttons img[src*='play']");
    const prevBtn = document.querySelector(".songbuttons img[src*='previous']");
    const nextBtn = document.querySelector(".songbuttons img[src*='nextsong']");

    // Play/Pause
    playBtn?.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "./pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "./play.svg";
        }
    });

    // Previous/Next
    prevBtn?.addEventListener("click", () => {
        const index = albums.findIndex(a => a.song === currentSong.src.split("/").pop());
        if (index > 0) playMusic(albums[index - 1]);
    });

    nextBtn?.addEventListener("click", () => {
        const index = albums.findIndex(a => a.song === currentSong.src.split("/").pop());
        if (index < albums.length - 1) playMusic(albums[index + 1]);
    });

    // Volume
    const volumeInput = document.querySelector(".range input");
    volumeInput?.addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    // Seekbar
    const seekbar = document.querySelector(".seekbar");
    seekbar?.addEventListener("click", e => {
        const percent = e.offsetX / e.target.clientWidth;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Update song time
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = secondsToMinutesSeconds(currentSong.currentTime);
        const duration = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerText = `${currentTime} / ${duration}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
}

// Initialize
main();
