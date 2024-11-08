
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, collection, setDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
// Function to upload movies
async function uploadMovies() {
    try {
        const response = await fetch('movies.json'); // Fetch the JSON file
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const jsonData = await response.json(); // Parse the JSON data
        const movies = jsonData.website.movies; // Access the movies array

        const collectionRef = collection(db, "movies"); // Create reference to "movies" collection

        // Fetch existing movies from Firestore to avoid duplicates
        const existingMoviesSnapshot = await getDocs(collectionRef);
        const existingMovieIds = new Set();

        existingMoviesSnapshot.forEach(doc => {
            const movieData = doc.data();
            existingMovieIds.add(movieData.id); // Store existing movie IDs
        });

        // Upload each movie to Firestore if it doesn't already exist
        for (const movie of movies) {
            if (!existingMovieIds.has(movie.id)) {
                await addDoc(collectionRef, movie);
                console.log(`Uploaded: ${movie.title}`);
            } else {
                console.log(`Skipped (already exists): ${movie.title}`);
            }
        }
        console.log("Movies upload process completed!");

        // Call retrieveMovies after uploading
        retrieveMovies();
    } catch (error) {
        console.error("Error uploading data: ", error);
    }
}


// Function to retrieve and display movies
async function retrieveMovies() {
    try {
        const collectionRef = collection(db, "movies"); // Reference to "movies" collection
        const querySnapshot = await getDocs(collectionRef); // Get documents
        const moviesContainer = document.getElementById('row'); // Ensure 'row' exists in your HTML

        moviesContainer.innerHTML = ""; // Clear previous content


        // Check if there are any documents
        if (querySnapshot.empty) {
            moviesContainer.innerHTML = "<p>No movies found.</p>"; // Message if no movies are found
            return; // Exit if no movies are found
        }
        const big = document.getElementById("big_poster")

        querySnapshot.forEach(doc => {

            const movie = doc.data();
            const movieElement = document.createElement('div');

            const big_img = document.createElement("div")

            big_img.innerHTML = `<img src="${movie.poster}" class="posters_big" alt="${movie.title}" title="${movie.title}" >`

            big_img.classList.add("bigg")
            big.appendChild(big_img)

            movieElement.classList.add("row_box")

            movieElement.innerHTML = `
                            <img src="${movie.poster}"class="movies_img" alt="${movie.title} Poster" >
               <div class="tittle_and_details"> <h2>${movie.title}</h2>
                <p><strong>Genre:</strong> ${movie.genre}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.rating}</p></div>
                
            `;
            moviesContainer.appendChild(movieElement); // Append movie to container
        });
    } catch (error) {
        console.error("Error retrieving data: ", error);
    }
}

// Call the upload function immediately
uploadMovies();








document.addEventListener('DOMContentLoaded', function() {
    let currentIndex = 0;

    function moveSlide(direction) {
        const slides = document.querySelectorAll('#big_poster img'); // Get all images in the carousel
        const totalSlides = slides.length;

        // Calculate new index, wrapping around if necessary
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;

        // Move the carousel by changing its transform property
        const carousel = document.querySelector('#big_poster');
        const slideWidth = slides[0].clientWidth; // Get the width of a single image
        carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`; // Move carousel
    }

    // Optional: Auto-slide functionality (every 5 seconds)
    setInterval(() => moveSlide(1), 5000);               // Automatic sliding

    // Ensure buttons work
    document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
    document.querySelector('.next').addEventListener('click', () => moveSlide(1));
});

