import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAskGmap6r8i4vV-qKPNjiJyKZzw3HacyA",
    authDomain: "mainproject-6c353.firebaseapp.com",
    projectId: "mainproject-6c353",
    storageBucket: "mainproject-6c353.appspot.com",
    messagingSenderId: "527375204852",
    appId: "1:527375204852:web:8d2f8f62a242c8e6eab9a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Flag to track if movies are uploaded
let moviesUploaded = false;

// Function to upload movies and movie posters
async function uploadMovies() {
    if (moviesUploaded) {
        console.log('Movies already uploaded, skipping upload.');
        return;
    }

    try {
        const response = await fetch('movies.json'); // Fetch the JSON file
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const jsonData = await response.json(); // Parse the JSON data
        const movies = jsonData.website.movies; // Access the movies array
        const moviePosters = jsonData.website.movie_posters; // Access the movie posters array

        const moviesCollectionRef = collection(db, "movies");
        const moviePostersCollectionRef = collection(db, 'movie_posters');

        // Fetch existing movies and posters to avoid duplicates
        const existingMoviesSnapshot = await getDocs(moviesCollectionRef);
        const existingMoviePostersSnapshot = await getDocs(moviePostersCollectionRef);

        const existingMovieIds = new Set();
        existingMoviesSnapshot.forEach(doc => {
            const movieData = doc.data();
            existingMovieIds.add(movieData.id);
        });

        const existingMoviePostersIds = new Set();
        existingMoviePostersSnapshot.forEach(doc => {
            const posterData = doc.data();
            existingMoviePostersIds.add(posterData.id);
        });

        // Upload each movie to Firestore if it doesn't already exist
        for (const movie of movies) {
            if (!existingMovieIds.has(movie.id)) {
                await addDoc(moviesCollectionRef, movie);
                console.log(`Uploaded: ${movie.title}`);
            } else {
                console.log(`Skipped (already exists): ${movie.title}`);
            }
        }

        console.log("Movies upload process completed!");

        // Upload movie posters if not already uploaded
        for (const poster of moviePosters) {
            if (!existingMoviePostersIds.has(poster.id)) {
                await addDoc(moviePostersCollectionRef, poster);
                console.log(`Uploaded poster: ${poster.title}`);
            } else {
                console.log(`Skipped poster (already exists): ${poster.title}`);
            }
        }

        console.log('Movie posters upload completed!');
        moviesUploaded = true;

        // Call retrieveMovies after uploading
        retrieveMovies();  // Display all movies initially
    } catch (error) {
        console.error("Error uploading data: ", error);
    }
}

// Function to retrieve and display movies
async function retrieveMovies(genre = '') {
    try {
        let collectionRef = collection(db, "movies");

        if (genre && genre !== 'For you') {
            collectionRef = query(collectionRef, where("genre", "==", genre));
        }

        const querySnapshot = await getDocs(collectionRef);
        const moviesContainer = document.getElementById('row');
        moviesContainer.innerHTML = ""; // Clear previous content

        if (querySnapshot.empty) {
            moviesContainer.innerHTML = "<p>No movies found.</p>";
            return;
        }

        querySnapshot.forEach(doc => {
            const movie = doc.data();
            const movieElement = document.createElement('div');
            movieElement.classList.add("row_box");

            movieElement.innerHTML = `
                <img src="${movie.poster}" class="movies_img" alt="${movie.title} Poster" >
                <div class="tittle_and_details">
                    <h2>${movie.title}</h2>
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <p><strong>Rating:</strong> ${movie.rating}</p>
                </div>`;

            movieElement.addEventListener('click', () => {
               

const player_page = document.getElementById("video_player");
const close_player=document.getElementById("close_player")
close_player.style.display = "block";

player_page.style.display = "block";
                playVideo(movie.stream_url, movie.title,movie.description,movie.poster,movie.release_date);
            });

            moviesContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error retrieving data: ", error);
    }
}

const close_player=document.getElementById("close_player")
close_player.addEventListener("click",()=>{
    const player_page = document.getElementById("video_player");
const movie_dis_close=document.getElementById("movie_details")



const existingVideo = document.querySelector('.movie-video');
existingVideo.remove();

movie_dis_close.remove()









    



    player_page.style.display = "none";
    close_player.style.display = "none";


})
 // Function to display video player
 function playVideo(stream_url, title,description,poster,release_date) {




    const movie_dis = document.createElement('div');
    // movie_dis.classList.add("movie_dis");

    movie_dis.innerHTML = `<div id="movie_details"><div>
       
        <div class="tittle_dis">
            <h2>${title}</h2>

            <p><strong>Release Date:</strong> ${release_date}</p>
                      <h4>Discription :</h4><br>
            <p>${description}</p>
        </div></div>
        
        
        </div>`;
        
   



     


    
    // Check if the .video_player element exists in the DOM
    const videoContainer = document.getElementById('video_player');
    if (!videoContainer) {
        console.error('Error: .video_player container not found');
        return; // Prevent further execution if the container doesn't exist
    }

    // Remove any existing video if it exists
    const existingVideo = document.querySelector('.movie-video');
    if (existingVideo) {
        existingVideo.remove();
    }

    // Create a new video element
    const videoElement = document.createElement('video');
    videoElement.id = "my-live-video";
    videoElement.classList.add("video-js", "vjs-big-play-centered", "movie-video");
    videoElement.setAttribute("controls", "");
    videoElement.setAttribute("autoplay", "");
    videoElement.setAttribute("muted", ""); // For autoplay to work in most browsers

    // Set up the source for the video
    const videoSource = document.createElement('source');
    videoSource.setAttribute("src", stream_url);
    videoSource.setAttribute("type", "application/x-mpegURL");

    // Append the source to the video element
    videoElement.appendChild(videoSource);

    // Append video element to the .video_player container
    videoContainer.appendChild(videoElement);

    // Initialize Video.js for enhanced controls
    videojs(videoElement); // Apply Video.js to the player

    
    video_player.appendChild(movie_dis)

}

// HLS.js setup (for browsers that do not support HLS natively)
function setupHLS(videoElement, stream_url) {
    if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(stream_url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
        });
    }
    else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari natively supports HLS
        videoElement.src = stream_url;
        videoElement.addEventListener('loadedmetadata', function () {
            videoElement.play();
        });
    }
}

// Function to load movie posters into the carousel
async function loadMoviePosters() {
    const carouselImages = document.querySelector('#carousel_images');
    if (!carouselImages) {
        console.error('Carousel container (#carousel_images) not found in the DOM');
        return;
    }

    try {
        const moviePostersSnapshot = await getDocs(collection(db, 'movie_posters'));

        carouselImages.innerHTML = ""; // Clear existing images

        moviePostersSnapshot.forEach(doc => {
            const poster = doc.data();
            const imgElement = document.createElement('img');
            imgElement.src = poster.poster_url;
            imgElement.alt = poster.title;
            imgElement.title = poster.title;

            carouselImages.appendChild(imgElement);
        });

        // Initialize carousel after images are added
        initializeCarousel();
    } catch (error) {
        console.error("Error loading movie posters:", error);
    }
}

// Initialize the carousel
function initializeCarousel() {
    const slides = document.querySelectorAll('#carousel_images img');
    const slideWidth = slides[0].clientWidth;

    let currentIndex = 0;

    function moveSlide(direction) {
        const totalSlides = slides.length;
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
        const carousel = document.querySelector('#carousel_images');
        carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    setInterval(() => moveSlide(1), 5000);  // Automatic sliding every 5 seconds

    document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
    document.querySelector('.next').addEventListener('click', () => moveSlide(1));
}

// Load the movie posters dynamically when the page is loaded
window.addEventListener('load', () => {
    loadMoviePosters(); // Load posters into carousel
    uploadMovies(); // Upload movies on page load
});

// Event listener for genre clicks
document.querySelectorAll('.cat').forEach(catElement => {
    catElement.addEventListener('click', () => {
        const genre = catElement.textContent.trim();
        if (genre === 'For you') {
            retrieveMovies(); // Show all movies
        } else {
            retrieveMovies(genre); // Show movies by genre
        }
    });
});



















// Function to search movies by title
async function searchMovies(queryText) {
    const collectionRef = collection(db, "movies");

    // If the search query is empty, display all movies
    if (queryText.trim() === "") {
        retrieveMovies(); // Calls retrieveMovies() to show all movies
        return;
    }

    try {
        // Normalize the query text to lowercase
        const normalizedQuery = queryText.trim().toLowerCase();

        // Fetch all movies (You may want to limit the number of movies in real applications)
        const querySnapshot = await getDocs(collectionRef);
        const moviesContainer = document.getElementById('row');
        moviesContainer.innerHTML = ""; // Clear previous results

        // Filter movies on the client side, comparing the lowercase title with the query
        let filteredMovies = [];
        querySnapshot.forEach(doc => {
            const movie = doc.data();
            const movieTitle = movie.title.toLowerCase(); // Normalize movie title to lowercase

            // If the movie title contains the query string, add it to filtered list
            if (movieTitle.includes(normalizedQuery)) {
                filteredMovies.push(movie);
            }
        });

        // If no movies match, display "No movies found"
        if (filteredMovies.length === 0) {
            moviesContainer.innerHTML = "<p>No movies found.</p>";
            return;
        }

        // Display each filtered movie
        filteredMovies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add("row_box");

            movieElement.innerHTML = `
                <img src="${movie.poster}" class="movies_img" alt="${movie.title} Poster">
                <div class="tittle_and_details">
                    <h2>${movie.title}</h2>
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <p><strong>Rating:</strong> ${movie.rating}</p>
                </div>`;

            // Add event listener to play video when clicked
            movieElement.addEventListener('click', () => {
                playVideo(movie.stream_url, movie.title);  // Optional: Play movie when clicked
            });

            moviesContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error searching movies: ", error);
    }
}

// Event listener for the search input field
document.getElementById("search-input").addEventListener("input", function() {
    const searchTerm = this.value.trim();  // Get the value from the input field and trim extra spaces
    searchMovies(searchTerm);  // Call searchMovies to display matching results
});










// var video = document.getElementById('my-video');

// if (Hls.isSupported()) {
//     var hls = new Hls();
//     hls.loadSource('https://stream-akamai.castr.com/5b9352dbda7b8c769937e459/live_2361c920455111ea85db6911fe397b9e/index.fmp4.m3u8'); // Your HLS stream URL
//     hls.attachMedia(video);
//     hls.on(Hls.Events.MANIFEST_PARSED, function () {
//         video.play();
//     });
// }
// else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//     // Safari natively supports HLS
//     video.src = 'https://stream-akamai.castr.com/5b9352dbda7b8c769937e459/live_2361c920455111ea85db6911fe397b9e/index.fmp4.m3u8';
//     video.addEventListener('loadedmetadata', function () {
//         video.play();
//     });
// }




