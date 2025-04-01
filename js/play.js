
const videoPlayer = document.createElement('video');
const videoContainer = document.getElementById('video_player');
const closeButton = document.getElementById('close_video_player');
const voiceResult = document.getElementById('voiceResult');
const aiResponse = document.getElementById('aiResponse');
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');
const commands = document.getElementById('commands');
let isRecognitionActive = false;

// Initialize SpeechRecognition (webkitSpeechRecognition for cross-browser support)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;

startButton.addEventListener('click', () => {
    recognition.start();
    voiceResult.style.display = 'block';
    aiResponse.style.display = 'block';
    stopButton.style.display = 'block';
    startButton.style.display = 'none';
    commands.style.display = 'block';
    isRecognitionActive = true;
    console.log("Speech recognition started");
});

stopButton.addEventListener('click', () => {
    recognition.stop();
    voiceResult.style.display = 'none';
    aiResponse.style.display = 'none';
    commands.style.display = 'none';
    stopButton.style.display = 'none';
    startButton.style.display = 'block';
    isRecognitionActive = false;
    console.log("Speech recognition stopped");
});

recognition.onresult = function(event) {
    console.log( event.results)
    const voiceCommand = event.results[event.results.length - 1][0].transcript;
    voiceResult.innerText = "You said: " + voiceCommand;
    console.log("You said: " + voiceCommand);
    processCommand(voiceCommand);
};
function processCommand(command) {
const commandLower = command.toLowerCase();
aiResponse.innerText = 'AI Response: ';

// Volume Up or Down based on user command
if (commandLower.includes("volume up")) {
let volume = videoPlayer.volume + 0.1;  
if (volume > 1) volume = 1; 
videoPlayer.volume = volume;
aiResponse.innerText += `Volume increased to ${Math.round(volume * 100)}%.`;
} else if (commandLower.includes("volume down")) {
let volume = videoPlayer.volume - 0.1;  
if (volume < 0) volume = 0; 
videoPlayer.volume = volume;
aiResponse.innerText += `Volume decreased to ${Math.round(volume * 100)}%.`;
} 

// Play video
else if (commandLower.includes("play")) {
videoPlayer.play();
aiResponse.innerText += 'Playing video.';
}

else if (commandLower.includes("pause") || commandLower.includes("stop") || commandLower.includes("hold")) {
videoPlayer.pause();
aiResponse.innerText += 'Video paused.';
} 

else if (commandLower.includes('forward')) {
const match = commandLower.match(/forward (\d+)/);  
if (match) {
const seconds = parseInt(match[1]);
videoPlayer.currentTime += seconds;
aiResponse.innerText += `Video forwarded by ${seconds} seconds.`;
} else {
aiResponse.innerText += 'Please specify the number of seconds to forward.';
}
} else if (commandLower.includes('backward')) {
const match = commandLower.match(/backward (\d+)/); 
if (match) {
const seconds = parseInt(match[1]);
videoPlayer.currentTime -= seconds;
aiResponse.innerText += `Video rewinded by ${seconds} seconds.`;
} else {
aiResponse.innerText += 'Please specify the number of seconds to rewind.';
}
}

// Mute the video
// else if (commandLower.includes("mute")) {
//     videoPlayer.volume = 0;
//     aiResponse.innerText += 'Video muted.';
// }

// // Unmute the video
// else if (commandLower.includes("unmute")) {
//     videoPlayer.volume = 1;
//     aiResponse.innerText += 'Video unmuted.';
// }

// Default response for unrecognized command
else {
aiResponse.innerText += 'Command not recognized.';
}
}

recognition.onerror = function(event) {
    aiResponse.innerText = 'AI Response: Error in voice recognition.';
    console.log('Error in voice recognition: ' + event.error);
};

recognition.onend = function() {
    if (isRecognitionActive) {
        recognition.start();
    }
};

// Video setup from sessionStorage
const streamUrl = sessionStorage.getItem('videoStreamUrl');
const title = sessionStorage.getItem('videoTitle');
const description = sessionStorage.getItem('videoDescription');
const poster = sessionStorage.getItem('videoPoster');

document.getElementsByTagName("body")[0].style.background = `url(${poster}) no-repeat center center`;
document.getElementsByTagName("body")[0].style.backgroundSize = "cover";
document.getElementsByTagName("body")[0].style.backgroundAttachment = "fixed"; // Optional: for parallax effect
if (streamUrl && title && description) {
    playVideo(streamUrl, title, description);
} else {
    console.error('Error: Missing video data.');
}

function playVideo(streamUrl, title, description) {
    const movieDis = document.createElement('div');
    movieDis.innerHTML = `
        <div id="movie_details">
            <div class="tittle_dis">
                <h2>${title}</h2>
                <h4>Description:</h4><br>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    videoContainer.style.display = "block";
    videoPlayer.id = "my-live-video";
    videoPlayer.classList.add("video-js", "vjs-big-play-centered", "movie-video");
    videoPlayer.setAttribute("controls", "");
    videoPlayer.setAttribute("autoplay", "");
    videoPlayer.setAttribute("muted", "");

    const videoSource = document.createElement('source');
    videoSource.setAttribute("src", streamUrl);
    videoSource.setAttribute("type", "application/x-mpegURL");
    videoPlayer.appendChild(videoSource);

    videoPlayer.onerror = (e) => {
        console.error("Video playback error:", e);
    };

    videoContainer.appendChild(videoPlayer);
    videoContainer.appendChild(movieDis);

    setupHLS(videoPlayer, streamUrl);
}

function setupHLS(videoElement, streamUrl) {
    if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
        });
    } else {
        console.error("HLS is not supported by this browser.");
    }
}

// Close video player
closeButton.addEventListener('click', function() {
    videoPlayer.pause();
    const confirmExit = window.confirm("Do you want to leave?");
    if (confirmExit) {
        window.location.href = 'INDEX.html';
        videoContainer.style.display = 'none';
        videoPlayer.src = ''; // Clear video source
    }
});
