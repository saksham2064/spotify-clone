const currentSong = new Audio();

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}



async function getAlbums() {
    let a = await fetch("http://127.0.0.1:5500/albums/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let albums = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        // Skip parent directory link
        if (element.href.endsWith("/")) {
            albums.push(element.href.split("albums/")[1].replace("/", ""));
        }
    }
    return albums;
}


// Fetch songs from server
async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("songs/")[1]);
        }
    }
    return songs;
}

// Play song by file name
function playMusic(track) {
    currentSong.src = "/songs/" + track;
    currentSong.play();

    // Show song name in playbar
    const songName = track.replaceAll("%20", " ").replace(".mp3", "");
    document.querySelector(".songinfo").innerText = songName;
}

// MAIN
async function main() {

    let songs = await getSongs();

    const previous = document.querySelector(".songbuttons img[src*='previous.svg']")
    const next = document.querySelector(".songbuttons img[src*='nextsong.svg']")
    // playMusic(songs[0], true)

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li class="songItem">
            <img class="invert" src="play.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Skm</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="playlist.svg" alt="">
            </div>
        </li>`;
    }

    // Add click listener to each song
    Array.from(document.querySelectorAll(".songItem")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    // Play/Pause button
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




    

    // Update song time
    // Update song time and circle position
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = secondsToMinutesSeconds(currentSong.currentTime);
        const duration = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerText = `${currentTime} / ${duration}`;

        // Update circle position
        if (!isNaN(currentSong.duration)) { // avoid NaN when song not loaded
            let z = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = `${z}%`;
        }
    });


    //add event listenrer to seek bar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })


    //for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })



    //add eventlistener to previous and next 
    previous.addEventListener("click", () => {
        console.log("Previous ")
        console.log(currentSong)
         let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){

        playMusic(songs[index-1])
        }
    })



    next.addEventListener("click", () => {
        console.log("Next Clicked")
       let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){

        playMusic(songs[index+1])
        }
    })

///ad an evnt to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    // console.log(e.target.value, e.target, e)
    currentSong.volume = parseInt(e.target.value)/100
})



    
}

main();
