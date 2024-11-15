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
    // Skip uploading if already uploaded
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

        const moviesCollectionRef = collection(db, "movies"); // Reference to "movies" collection
        const moviePostersCollectionRef = collection(db, 'movie_posters'); // Reference to "movie_posters" collection

        // Fetch existing movies and posters from Firestore to avoid duplicates
        const existingMoviesSnapshot = await getDocs(moviesCollectionRef);
        const existingMoviePostersSnapshot = await getDocs(moviePostersCollectionRef);

        const existingMovieIds = new Set();
        existingMoviesSnapshot.forEach(doc => {
            const movieData = doc.data();
            existingMovieIds.add(movieData.id); // Store existing movie IDs
        });

        const existingMoviePostersIds = new Set();
        existingMoviePostersSnapshot.forEach(doc => {
            const posterData = doc.data();
            existingMoviePostersIds.add(posterData.id); // Store existing movie poster IDs
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

        // Set flag to true after movies are uploaded to prevent re-upload
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
        let collectionRef = collection(db, "movies"); // Reference to "movies" collection

        // If a genre is selected, filter the movies by genre
        if (genre && genre !== 'For you') {
            collectionRef = query(collectionRef, where("genre", "==", genre));
        }

        const querySnapshot = await getDocs(collectionRef); // Get documents
        const moviesContainer = document.getElementById('row'); // Ensure 'row' exists in your HTML
        moviesContainer.innerHTML = ""; // Clear previous content

        // Check if there are any documents
        if (querySnapshot.empty) {
            moviesContainer.innerHTML = "<p>No movies found.</p>"; // Message if no movies are found
            return; // Exit if no movies are found
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

            // Add click event to play the video when movie is clicked
            movieElement.addEventListener('click', () => {
                playVideo(movie.stream_url, movie.title);
            });

            // Append movie to container
            moviesContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error retrieving data: ", error);
    }
}

// Function to display video player
function playVideo(stream_url, title) {
    // Remove any existing video player
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
    videoElement.innerHTML = `
        <source src="${stream_url}" type="application/x-mpegURL">
        <p class="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            <a href="https://www.google.com/intl/en/chrome/">supports HTML5 video</a>
        </p>
    `;

    // Append the video player to the body or any other container
    document.body.appendChild(videoElement);
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

        carouselImages.innerHTML = ""; // Clear any existing images in the carousel

        moviePostersSnapshot.forEach(doc => {
            const poster = doc.data();
            const imgElement = document.createElement('img');
            imgElement.src = poster.poster_url;  // Correct image source reference
            imgElement.alt = poster.title;      // Correct title for alt text
            imgElement.title = poster.title;    // Optional: Title on hover

            carouselImages.appendChild(imgElement);
        });

        // Initialize carousel
        const slides = document.querySelectorAll('#carousel_images img');
        const slideWidth = slides[0].clientWidth;
        initializeCarousel(slideWidth, slides.length);
    } catch (error) {
        console.error("Error loading movie posters:", error);
    }
}

// Initialize the carousel
function initializeCarousel(slideWidth, totalSlides) {
    let currentIndex = 0;

    // Function to move the carousel based on the current index
    window.moveSlide = function(direction) {
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
        const carouselImages = document.getElementById('carousel_images');
        carouselImages.style.transform = `translateX(-${currentIndex * slideWidth}px)`;  // Apply sliding
    };

    // Event listeners for the carousel navigation buttons
    document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
    document.querySelector('.next').addEventListener('click', () => moveSlide(1));

    // Optional: Auto-slide functionality (every 5 seconds)
    setInterval(() => moveSlide(1), 5000); // Auto-slide every 5 seconds
}

// Load the movie posters dynamically when the page is loaded
window.addEventListener('load', () => {
    loadMoviePosters(); // Load the movies in the carousel
});

// Call the upload function immediately (make sure 'movies.json' exists)
uploadMovies();

// Event listener for category clicks
document.querySelectorAll('.cat').forEach(catElement => {
    catElement.addEventListener('click', () => {
        const genre = catElement.textContent.trim(); // Get the genre text (e.g., "Funny")
        
        // If the "For you" category is clicked, display all movies
        if (genre === 'For you') {
            retrieveMovies(); // Show all movies
        } else {
            retrieveMovies(genre); // Show movies of the selected genre
        }
    });
});
