import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, updateDoc, arrayRemove, arrayUnion, getDocs, addDoc, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { getDatabase, ref, set, onValue, push, get, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


// Check if the Firebase app is already initialized to avoid re-initializing
if (!getApps().length) {
    //   initializeApp(firebaseConfig);  // Initialize Firebase only if it hasn't been initialized yet
} else {
    console.log("Firebase is already initialized");
}

// // Continue with your other Firebase operations
// const auth = getAuth();
// const db = getFirestore();
// const database = getDatabase();

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAskGmap6r8i4vV-qKPNjiJyKZzw3HacyA",
    authDomain: "mainproject-6c353.firebaseapp.com",
    projectId: "mainproject-6c353",
    databaseURL: "https://mainproject-6c353-default-rtdb.firebaseio.com",  // Replace with your Realtime Database URL

    storageBucket: "mainproject-6c353.appspot.com",
    messagingSenderId: "527375204852",
    appId: "1:527375204852:web:8d2f8f62a242c8e6eab9a1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);


//====================================================COMMENTS==================================================

const addCommentToDatabase = (movieId, comment) => {
    const user = auth.currentUser;

    if (user) {
        // Retrieve the userName from Firestore or from user metadata
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
            .then(docSnap => {
                if (docSnap.exists()) {
                    const userName = docSnap.data().userName; // Assuming the user's name is stored in Firestore
                    console.log(userName)
                    // Prepare the comment data
                    const commentData = {
                        userId: user.uid,
                        username: userName,
                        userEmail: user.email,
                        comment: comment,
                        timestamp: new Date().toISOString()  // Add timestamp to the comment
                    };
                    // Push comment to the 'comments' node under the specific movie ID
                    const commentRef = ref(database, 'comments/' + movieId);
                    const newCommentRef = push(commentRef);
                    set(newCommentRef, commentData)
                        .then(() => {
                            fetchComments(movieId);
                            console.log("Comment added successfully!");
                        })
                        .catch((error) => {
                            console.error("Error adding comment: ", error);
                        });
                } else {
                    console.error("User document does not exist.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user data: ", error);
            });
    } else {
        console.log("User is not logged in.");
    }
};

// Example: Fetch Comments from Realtime Database
function fetchComments(movieId) {
    const commentsRef = ref(database, 'comments/' + movieId);

    onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Display comments
            // console.log("Comments:", data);
            // Clear the previous comments list before appending new ones
            const commentListElement = document.getElementById("comments_list");
            commentListElement.innerHTML = ""; // Reset previous content

            for (const key in data) {
                const comment = data[key];
                // Append each comment to the comment list
                let letter = comment.username;

                // Create a new div element to contain the comment
                const commentcolordiv = document.createElement("div");

                // Create the paragraph element that will hold the formatted comment
                const commentElement = document.createElement("p");
                commentElement.innerHTML = `
        <div style="display: flex; gap: 10px;">
            <div style="height: 30px; width: 30px; padding: 2px; text-align: center; border-radius: 50%; border: 2px solid black; background-color: #50d9eb;">
                ${comment.userEmail[0]}
            </div>
            <div style="display: flex; flex-wrap: wrap;">
                <div>${comment.userEmail}:</div>
                <div>${comment.comment}</div>
            </div>
        </div>
    `;

                // Append the created paragraph element to the color-div container
                commentcolordiv.appendChild(commentElement);

                // Finally, append the color-div container to the comment list element
                commentListElement.appendChild(commentcolordiv);

                const comments = document.getElementById('comments_list').children;

                for (let i = 0; i < comments.length; i++) {
                    // Alternate background color between gray and white
                    comments[i].style.backgroundColor = (i % 2 === 0) ? 'gray' : 'white';

                    // Alternate text color between white and gray
                    comments[i].style.color = (i % 2 === 0) ? 'white' : 'gray';

                    // Apply padding, border-radius, and ensure height is fit to content
                    comments[i].style.padding = "10px";
                    comments[i].style.borderRadius = "10px";
                    comments[i].style.height = "fit-content"; // Use correct fit-content for height

                    // Log the comment for debugging purposes
                    console.log(comments[i]);
                }



            }

        } else {
            const commentListElement = document.getElementById("comments_list");
            commentListElement.textContent = "No comments available.";
            // Reset previous content
            commentListElement.style.color = "#fff"
        
            console.log("No comments available.");
        }
    });
}

// Call the function with the movieId
// const movieId = "Nightmare House"; // Replace with the actual movie title or ID

// Flag to track if movies are uploaded
let moviesUploaded = false;

// Function to upload movies and movie posters
async function uploadMovies() {
    if (moviesUploaded) {
        console.log('Movies already uploaded, skipping upload.');
        return;
    }

    try {
        const response = await fetch('data/movies.json'); // Fetch the JSON file
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

        //         // Upload each movie to Firestore if it doesn't already exist
        for (const movie of movies) {
            if (!existingMovieIds.has(movie.id)) {
                await addDoc(moviesCollectionRef, movie);
                console.log(`Uploaded: ${movie.title}`);
            } else {
                console.log(`Skipped (already exists): ${movie.title}`);
            }
        }

        console.log("Movies upload process completed!");

        //         // Upload movie posters if not already uploaded
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

// // Function to retrieve and display movies
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
            moviesContainer.innerHTML = `<p style="color:#fff;margin-left:10%">No movies found.</p>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const movie = doc.data();
            const movieElement = document.createElement('div');
            movieElement.classList.add("row_box");
            movieElement.innerHTML = `
                <img src="${movie.poster}" class="movies_img"style="height:200px" alt="${movie.title} Poster" >
                <div class="tittle_and_details">
                    <h2>${movie.title}</h2>
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Rating:</strong> ${movie.rating}</p>
                </div>`;


            // Inside the event listener for each movieElement click
            movieElement.addEventListener('click', () => {
                const currentUser = localStorage.getItem('currently_loggedIn');

                if (currentUser == null) {
                    // Show login form if not logged in
                    const loginForm = document.querySelectorAll('.login-signup')[0];
                    loginForm.style.display = 'block';
                } else {
                    const close_player = document.getElementById("close_player");
                    const player_info_page = document.getElementById("player");
                    recommended(movie)
                    close_player.style.display = "block";
                    player_info_page.style.display = "block";

                    // Play the movie
                    const movieStreamUrl = movie.stream_url;  // Assuming each movie has a stream_url
                    const movieTitle = movie.title;
                    const movieDescription = movie.description;
                    const moviePoster = movie.poster;
                    const movieReleaseDate = movie.release_date;
                    const movieId = movie.title;

                    fetchComments(movieId);

                    // Call the playVideo function
                    // playVideo(movieStreamUrl, movieTitle, movieDescription, moviePoster, movieReleaseDate, movie.details);
                }
            });


            moviesContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error retrieving data: ", error);
    }
}









// document.getElementById("play_butt").addEventListener("click",
function recommended(clickedMovie) {
    retrieveMovies(clickedMovie)
    console.log(clickedMovie)



    // Function to retrieve and display movies
    async function retrieveMovies(clickedMovie) {
        try {
            // Reference to the movies collection
            let collectionRef = collection(db, "movies");

            // If you need to filter, sort, or limit results, add query conditions here
            // For example, orderBy("release_date") or limit(10)
            // collectionRef = query(collectionRef, orderBy("release_date"));

            const querySnapshot = await getDocs(collectionRef);
            const moviesContainer = document.getElementById('player_info_page');
            moviesContainer.innerHTML = ""; // Clear previous content

            querySnapshot.forEach(doc => {
                const movie = doc.data();
                const movieElement_playing = document.createElement('div');
                movieElement_playing.classList.add("row_box");

                // Dynamically add movie details to the movieElement_playing
                movieElement_playing.innerHTML = `
                <a href="#movie_details"><img src="${movie.poster}" class="movies_img"  style="width: 300px; height:200px; alt="${movie.title} Poster"></a>
                <div class="tittle_and_details">
                    <h2>${movie.title}</h2>
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <p><strong>Rating:</strong> ${movie.rating}</p>
                </div>
            `;

                // Append the movieElement to the container
                moviesContainer.appendChild(movieElement_playing);

                // Check if 'details' exists and is an array with at least one element
                let movieDetails = clickedMovie.details && Array.isArray(clickedMovie.details) && clickedMovie.details.length > 0 ? clickedMovie.details[0] : null;




                const movie_dis = document.createElement('div');
                movie_dis.classList.add("movie_dis");

                // Create the new movie details content, checking if movieDetails is valid
                movie_dis.innerHTML = `
<div id="movie_details">
    <div id="movie_poster_title" style="z-index:4; width:100%; padding:10px; box-sizing:border-box; text-align:center;">
        <div style="z-index:4; width:100%;">

            <!-- Movie Poster -->
            <img src="${clickedMovie.poster}" alt="${clickedMovie.title} Poster"
                 style="width:100%; height:auto; max-height:350px; z-index:4; margin-bottom:15px;" />

            <!-- Movie Title -->
            <h2 style="font-size:1.5rem; margin-bottom:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${clickedMovie.title}
            </h2>

            <!-- Play Button & Wishlist Icon -->
            <div style="display:flex; justify-content:left; align-items:center; gap:10px; margin-bottom:15px;">
                <button id="playNow" style="font-size:1rem;">PLAY</button>
                <p id="wish" class="wish" title="Add to Wishlist +" style="cursor:pointer;">
                    <i class="fa-regular fa-heart" style="background:#50d9eb; border-radius:50%; padding:5px; border:2px solid #fff;"></i>
                </p>
            </div>

            <!-- Description -->
            <div class="Description" style="text-align:left; display:flex; flex-wrap:wrap; margin-bottom:15px;">
                <h4 style="font-size:1.2rem; margin-bottom:5px;">Description:</h4>
                <p style="font-size:1rem; margin:0; width:800px;">
                    ${clickedMovie.description || "No description available."}
                </p>
            </div>
        </div>

        <!-- Additional Info (Cast, Director, etc.) -->
        <div class="movie_cast_title" style="text-align:left;">
            <h4 style="font-size:1.2rem; margin-bottom:5px;">Release Date:</h4>
            <p style="font-size:1rem; margin-bottom:10px;">${clickedMovie.release_date}</p>

            <h4 style="font-size:1.2rem; margin-bottom:5px;">Cast:</h4>
            <p style="font-size:1rem; margin-bottom:10px;">${movieDetails ? movieDetails.cast.join(", ") : "N/A"}</p>

            <h4 style="font-size:1.2rem; margin-bottom:5px;">Director:</h4>
            <p style="font-size:1rem; margin-bottom:10px;">${movieDetails ? movieDetails.director : "N/A"}</p>

            <h4 style="font-size:1.2rem; margin-bottom:5px;">Music Director:</h4>
            <p style="font-size:1rem; margin-bottom:10px;">${movieDetails ? movieDetails.music_director : "N/A"}</p>

            <h4 style="font-size:1.2rem; margin-bottom:5px;">Producer:</h4>
            <p style="font-size:1rem;">${movieDetails ? movieDetails.producer : "N/A"}</p>  <div id="comment_section">
        <h3>Comments:</h3>
        <div id="comments" class="comments">
            <div id="comments_list" class="comments_list"></div> <!-- Where comments will be displayed -->
            <textarea id="comment_input" placeholder="Add your comment"></textarea>
            <span id="submit_comment">
                <i class="fa-regular fa-paper-plane" style="position:relative; bottom:20px ; left:10px; border:2px solid #fff; padding:10px; border-radius:50%; color:white; background:#50d9eb;"></i>
            </span>
            <div class="View_Comments" style="cursor:pointer;">View Comments</div>
        </div>
    </div>
</div>
        </div>
    </div>

    <!-- Comment Section -->
  
`;

                const movieId = clickedMovie.title;

                // fetchComments(movieId);

                // console.log(movieDetails.producer)

                checkMovieInWishlist(clickedMovie.title)

                    ;
                const selectedMovieContainer = document.getElementById('selected_movie');
                selectedMovieContainer.innerHTML = "";
                selectedMovieContainer.style.backgroundImage = `url(${clickedMovie.poster})`;

                // Set background properties
                selectedMovieContainer.style.backgroundRepeat = "no-repeat"; // Ensure the image doesn't repeat
                selectedMovieContainer.style.backgroundSize = "cover"; // Optional: Make the background cover the entire container
                selectedMovieContainer.style.backgroundPosition = "center"; selectedMovieContainer.style.backgroundBlendMode = "darken"; // Correct blend mode
                selectedMovieContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // 50% opacity black
                selectedMovieContainer.style.position = "relative";  // Allow positioning of pseudo-elements
                const blurOverlay = document.createElement('div');
                blurOverlay.style.position = "absolute";
                blurOverlay.style.top = "0";
                blurOverlay.style.left = "0";
                blurOverlay.style.right = "0";
                blurOverlay.style.bottom = "0";
                blurOverlay.style.background = "radial-gradient(circle,transparent, rgba(0, 0, 0, 0), black)"; // Creates a fade effect around the edges
                blurOverlay.style.pointerEvents = "none"; // Ensure the overlay doesn't interfere with any mouse events or clicks

                // Append the overlay to the selected movie container
                selectedMovieContainer.appendChild(blurOverlay);

                // Set z-index to ensure the content is above the blurred background and overlay
                blurOverlay.style.zIndex = "1"; // Keeps the overlay under content

                // Append the new movie details to the selected_movie container
                selectedMovieContainer.appendChild(movie_dis);

                // Optionally, show the close button and player info page
                const closePlayer = document.getElementById('close_player');
                const playerInfoPage = document.getElementById('player_info_page');
                if (closePlayer && playerInfoPage) {
                    closePlayer.style.display = "block"; // Show the close button
                    playerInfoPage.style.display = "flex"; // Show the player info page
                }








                const close_player = document.getElementById("close_player");
                close_player.addEventListener("click", () => {
                    close_player.style.display = "none";
                    let player_info_page = document.getElementById("player")
                    player_info_page.style.display = "none";
                })
                document.getElementById("playNow").addEventListener("click", () => {


                    // Store the clicked movie details in sessionStorage


                    sessionStorage.setItem('videoStreamUrl', clickedMovie.stream_url);
                    sessionStorage.setItem('videoTitle', clickedMovie.title);
                    sessionStorage.setItem('videoDescription', clickedMovie.description);
                    sessionStorage.setItem('videoPoster', clickedMovie.poster);
                    sessionStorage.setItem('videoReleaseDate', clickedMovie.release_date);
                    sessionStorage.setItem('videoDetails', clickedMovie.details);
                    document.querySelector('.loadergif').classList.toggle('show'); // Make it visible


                    // Redirect to h.html
                    setTimeout(function () {
                    window.location.href = 'Playing.html';
                     document.querySelector('.loadergif').classList.toggle('show'); // Make it visible
                    }, 2000)




                });

                document.querySelector(".wish").addEventListener("click", () => {
                addToWish(clickedMovie.stream_url, clickedMovie.title, clickedMovie.description, clickedMovie.poster, clickedMovie.release_date, clickedMovie.details)


                })
                // ))
                // Optionally, call the playVideo function to start the video if needed
                // playVideo(movie.stream_url, movie.title, movie.description, movie.poster, movie.release_date, movie.details);
                // Comment Section Functionality
                let commentSubmitted = false; // Prevent multiple submissions

                auth.onAuthStateChanged(user => {
                    if (user) {
                        document.getElementById("submit_comment").addEventListener("click", () => {
                            const movieId = clickedMovie.title;  // Replace with the actual movie ID
                            const comment = document.getElementById("comment_input").value;

                            console.log(comment);
                            // console.log(movieId);

                            // Check if the comment is not empty and if the comment has not been submitted
                            if (comment && !commentSubmitted) {
                                commentSubmitted = true;  // Prevent multiple submissions

                                // Submit the comment to the database
                                addCommentToDatabase(movieId, comment);

                                // Clear the input field after submission
                                document.getElementById("comment_input").value = "";

                                // Optionally, re-enable the submit button after a short delay
                                setTimeout(() => {
                                    commentSubmitted = false;  // Allow next comment submission
                                }, 2000);  // 2 seconds timeout before enabling submission again
                            }
                        });



                    }
                });

                // Function to fetch the comments for a movie
                fetchComments(movieId);



                document.querySelector(".View_Comments").addEventListener("click", () => {
                    const commentsList = document.querySelector(".comments_list")
                    commentsList.classList.toggle('display_comments'); // Toggle the display class
                    if (document.querySelector(".View_Comments").textContent == "Close Comments"
                    ) {
                        document.querySelector(".View_Comments").textContent = "View Comments"
                    } else {
                        document.querySelector(".View_Comments").textContent = "Close Comments"
                    }
                });

                // Add click event listener to the movie element
                movieElement_playing.addEventListener('click', () => {
                    // Select the selected movie container
                    const selectedMovieContainer = document.getElementById('selected_movie');


                    // Remove any existing movie details (ensure only one movie is shown)
                    selectedMovieContainer.innerHTML = "";
                    recommended(movie)
                    
                }
                );






            });

        } catch (error) {
            console.error("Error retrieving movies: ", error);
        }
    }
}






// Initialize the carousel with the fetched images
function initializeCarousel(images) {
    const carouselInner = document.querySelector('#carousel_images');

    // Check if images exist before proceeding
    if (!images || images.length === 0) {
        console.error('No images to display in the carousel.');
        return;
    }

    // Clear existing images in the carousel container
    carouselInner.innerHTML = '';

    // Create carousel items and append images
    images.forEach((imageSrc, index) => {
        const div = document.createElement('div');
        div.classList.add('carousel-item');

        // Set the first image as active
        if (index === 0) {
            div.classList.add('active');
        }

        const img = document.createElement('img');
        img.src = imageSrc.src;  // Image source
        img.alt = imageSrc.alt;  // Alt text for image
        img.title = imageSrc.title;  // Title text for the image
        img.classList.add('d-block', 'w-100');  // Bootstrap classes for width
        div.appendChild(img);

        // Create carousel caption for title and description
        const caption = document.createElement('div');
        caption.classList.add('carousel-caption', 'd-none', 'd-md-block'); // Make it visible on larger screens
        caption.id = "carousel-caption-content"
        const title = document.createElement('h5');
        title.textContent = imageSrc.title;  // Display the title
        caption.appendChild(title);

        // Add description if available
        if (imageSrc.description) {
            const description = document.createElement('p');
            description.textContent = imageSrc.description;  // Display the description
            caption.appendChild(description);
        }

        // Append the caption to the carousel item
        div.appendChild(caption);

        // Append the image item to the carousel inner container
        carouselInner.appendChild(div);
    });

    // Initialize the Bootstrap carousel with automatic sliding
    const carousel = new bootstrap.Carousel(document.querySelector('#carouselExampleAutoplaying'), {
        interval: 3000,  // Slide every 3 seconds
        ride: 'carousel',  // Start the carousel automatically
    });
}

// Fetch movie posters from Firebase or another source
async function loadMoviePosters(genre = '') {
    const carouselImages = document.querySelector('#carousel_images');

    // Ensure carousel container is available
    if (!carouselImages) {
        console.error('Carousel container (#carousel_images) not found in the DOM');
        return;
    }

    try {
        const moviePostersSnapshot = await getDocs(collection(db, 'movies')); // Assuming db is already initialized

        const images = [];  // Store images to pass to initializeCarousel
        let counter = 0;  // Counter to track the number of images added

        moviePostersSnapshot.forEach(doc => {
            const poster = doc.data();

            // Filter posters by genre
            if (genre === '' || poster.genre === genre) {
                // Only append 3 images
                if (counter < 3) {
                    const imgData = {
                        src: poster.poster,  // Image URL
                        alt: poster.title,   // Alt text for image
                        title: poster.title,  // Title text for the image
                        description: poster.description || 'No description available'  // Add description if available
                    };
                    images.push(imgData);
                    counter++;  // Increment the counter
                }
            }
        });

        // Initialize carousel after images are added
        initializeCarousel(images);
    } catch (error) {
        console.error("Error loading movie posters:", error);
    }
}

// Call the loadMoviePosters function on page load, passing any genre if required
window.addEventListener('load', () => loadMoviePosters(''));  // Empty genre means all posters






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

            loadMoviePosters(); // Show all movie posters
            retrieveMovies(); // Show all movies
        } else {
            loadMoviePosters(genre); // Show movie posters for the selected genre
            retrieveMovies(genre); // Show movies for the selected genre
        }

        // Highlight the selected genre
        document.querySelectorAll('.cat').forEach(item => item.classList.remove('active'));
        catElement.classList.add('active');
    });
});




async function addToWish(stream_url, title, description, poster, release_date, details) {
    const user = auth.currentUser; // Get the current logged-in user

    if (user) {
        const userRef = doc(db, "users", user.uid);

        try {
            // Get the user's wishlist and check if the movie exists
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            const movieExists = userData?.wishlist?.some(movie => movie.title === title);

            const heartIcon = document.querySelector(".wish");

            // Toggle the movie's presence in the wishlist
            if (movieExists) {
                // Remove movie from wishlist
                await updateDoc(userRef, {
                    wishlist: arrayRemove({ stream_url, title, description, poster, release_date, details })
                }); alert("Movie removed from your wishlist!"); // Show alert
                heartIcon.title = " Add to Wishlist ";

                heartIcon.style.color = "white"; // Change icon to white
            } else {
                // Add movie to wishlist
                await updateDoc(userRef, {
                    wishlist: arrayUnion({ stream_url, title, description, poster, release_date, details })
                });
                alert("Movie added to your wishlist!"); // Show alert
                heartIcon.style.color = "red"; // Change icon to red
                heartIcon.title = "Remove from wishlist"
                heartIcon.style.color = "red"; // Change icon to red
            }
        } catch (error) {
            console.error("Error updating wishlist:", error);
        }
    } else {
        console.log("User not logged in.");
    }
}

// On page load or when displaying the movie, check if the movie is in the wishlist
async function checkMovieInWishlist(title) {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);

        try {
            // Get the user's wishlist and check if the movie is there
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            const movieExists = userData?.wishlist?.some(movie => movie.title === title);

            // Set heart icon color based on whether the movie is in the wishlist
            const heartIcon = document.querySelector(".wish");
            heartIcon.style.color = movieExists ? "red" : "white";
            heartIcon.title = movieExists ? "Remove from wishlist" : " Add to Wishlist ";

            // Red if in wishlist, white if not
        } catch (error) {
            console.error("Error checking wishlist:", error);
        }
    }
}

// // Call checkMovieInWishlist on page load or when displaying the movie


document.getElementById("viewWish").addEventListener("click", () => {
    document.getElementById("wishlist").style.display = "block"

    document.getElementById("wishlist").style.position = "fixed"
    document.getElementById("wishPage").style.display = "flex"

    getWishlist()
})
document.getElementById("close_wish").addEventListener("click", () => {
    document.getElementById("wishlist").style.display = "none"
    document.getElementById("wishPage").style.display = "none"

    // getWishlist()
})
async function getWishlist() {
    const user = auth.currentUser;  // Get the current logged-in user

    if (user) {
        const userRef = doc(db, "users", user.uid); // Get the user document using their UID
        try {
            // Get the user document
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                // Retrieve the wishlist from the document data
                const wishlist = docSnap.data().wishlist || [];  // Default to an empty array if no wishlist

                // Get the div where we want to display the wishlist
                const wishlistContainer = document.getElementById("wishlist-container");

                // Clear the previous wishlist content
                wishlistContainer.innerHTML = "";

                // Check if there are any movies in the wishlist
                if (wishlist.length > 0) {
                    wishlist.forEach(movie => {
                        // Check if the movie is already in the DOM to prevent duplicates
                        if (!isMovieInDOM(movie.title)) {
                            // Create a new div for each movie in the wishlist
                            const movieDiv = document.createElement("div");
                            movieDiv.classList.add("viewWish");
                            movieDiv.id = `${movie.title}`
                            // Insert the movie data into the div
                            movieDiv.innerHTML = ` 
                                <div class="movie-poster">
                                    <img src="${movie.poster}" alt="${movie.title} Poster">
                                </div>
                                <div class="tittle_dis">
                                    <h3>${movie.title}</h3>
                                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                                    
                                    <button class="remove-wish" data-title="${movie.title}">Remove from Wishlist</button>
                                </div>
                            `;

                            // Append the movie div to the wishlist container
                            wishlistContainer.appendChild(movieDiv);
                        } document.getElementById(`${movie.title}`).addEventListener("click", () => {
                            console.log(movie.title)
                            recommended(movie)

                            const close_player = document.getElementById("close_player");
                            const player_info_page = document.getElementById("player");
                            close_player.style.display = "block";
                            player_info_page.style.display = "block";
                            document.getElementById("wishlist").style.display = "none";;

                            // Play the movie
                            const movieStreamUrl = movie.stream_url;  // Assuming each movie has a stream_url
                            const movieTitle = movie.title;
                            const movieDescription = movie.description;
                            const moviePoster = movie.poster;
                            const movieReleaseDate = movie.release_date;
                            const movieId = movie.title;

                            fetchComments(movieId);


                        })

                    });

                    // Add event listeners to remove buttons
                    const removeButtons = document.querySelectorAll(".remove-wish");
                    removeButtons.forEach(button => {
                        button.addEventListener("click", () => removeFromWishlist(button.dataset.title));
                    });
                } else {
                    wishlistContainer.innerHTML = `<p class="nowish">No movies in your wishlist!</p>    `;
                }
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error retrieving wishlist:", error);
        }
    } else {
        console.log("User not logged in.");
    }
}

// Helper function to check if a movie is already in the DOM
function isMovieInDOM(movieTitle) {
    const wishlistContainer = document.getElementById("wishlist-container");
    const movieItems = wishlistContainer.getElementsByClassName("viewWish");

    for (let i = 0; i < movieItems.length; i++) {
        const titleElement = movieItems[i].querySelector("h3");
        if (titleElement && titleElement.textContent === movieTitle) {
            return true;  // Movie is already in the DOM
        }
    }
    return false;  // Movie is not in the DOM
}
async function removeFromWishlist(movieTitle) {
    const user = auth.currentUser;  // Get the current logged-in user

    if (user) {
        const userRef = doc(db, "users", user.uid);

        try {
            // Fetch the current wishlist to get the full object
            const userDoc = await getDoc(userRef);
            const wishlist = userDoc.data().wishlist;

            // Find the full movie object by matching the title (or other unique identifier)
            const movieToRemove = wishlist.find(movie => movie.title === movieTitle);

            if (movieToRemove) {
                // Update the wishlist by removing the full movie object
                await updateDoc(userRef, {
                    wishlist: arrayRemove(movieToRemove)
                });
                console.log(`Removed ${movieTitle} from wishlist`);

                // Reload the wishlist after removal
                getWishlist();
            }
        } catch (error) {
            console.error("Error removing movie from wishlist:", error);
        }
    }
}











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
            moviesContainer.innerHTML = `<p  style="color:#fff;margin-left:10%"</p>`;

            return;
        }

        // Display each filtered movie>No movies found.
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



            // Inside the event listener for each movieElement click
            movieElement.addEventListener('click', () => {
                const currentUser = localStorage.getItem('currently_loggedIn');

                if (currentUser == null) {
                    // Show login form if not logged in
                    const loginForm = document.querySelectorAll('.login-signup')[0];
                    loginForm.style.display = 'block';
                } else {
                    // Show player info page if logged in
                    const close_player = document.getElementById("close_player");
                    const player_info_page = document.getElementById("player");
                    recommended(movie)
                    close_player.style.display = "block";
                    player_info_page.style.display = "block";

                    // Play the movie
                    const movieStreamUrl = movie.stream_url;  // Assuming each movie has a stream_url
                    const movieTitle = movie.title;
                    const movieDescription = movie.description;
                    const moviePoster = movie.poster;
                    const movieReleaseDate = movie.release_date;

                    // Call the playVideo function
                    // playVideo(movieStreamUrl, movieTitle, movieDescription, moviePoster, movieReleaseDate, movie.details);
                }
            });



            moviesContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error searching movies: ", error);
    }
}

// Event listener for the search input field
document.getElementById("search-input").addEventListener("input", function () {
    const searchTerm = this.value.trim();  // Get the value from the input field and trim extra spaces
    searchMovies(searchTerm);  // Call searchMovies to display matching results
});






const user_letter = document.getElementById("user_letter");
document.getElementById("close_profile").addEventListener("click", close_profile);;

// Add event listener to toggle the 'lit' class on the profile
user_letter.addEventListener("click", close_profile);
function close_profile() {
    const user_profile = document.getElementById("profile");
    user_profile.classList.toggle('lit'); // Toggle the visibility of profile
}



// JavaScript to toggle the active class
document.querySelectorAll('.cat').forEach(item => {
    item.addEventListener('click', () => {
        // Remove 'active' class from all items
        document.querySelectorAll('.cat').forEach(navItem => navItem.classList.remove('active'));
        // Add 'active' class to the clicked item
        item.classList.add('active');
    });
});





// ============================================================================================================================================================================================================================= // OMDb API Key (sign up for an API key at https://www.omdbapi.com/)
const apiKey = '12a3a27b';  // Replace with your OMDb API Key




// Function to handle the search via text input
document.getElementById("searchButton").addEventListener("click", searchMovie)
function searchMovie() {
    var query = document.getElementById('textQuery').value.trim();

    if (!query) {
        query = document.getElementById('textQuery').value.trim();
    }

    if (query) {
        document.getElementById('output').innerHTML = `Searching for: "${query}"...`;
        fetchMovieData(query);
    } else {
        document.getElementById('output').innerHTML = 'Please enter a movie name.';
        const YoutubeVideoContainer = document.getElementById('YoutubeVideoContainer');
        YoutubeVideoContainer.innerHTML = '';
    }
}

// Function to fetch movie data from OMDb API
async function fetchMovieData(movieName) {
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(movieName)}&apikey=${apiKey}`;
    console.log(url);

    try {
        // Fetch data from OMDb API
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // If no movies are found
        if (data.Response === "False") {
            throw new Error(`No movie found for "${movieName}"`);
        }

        // Get the most relevant movie (first in the list)
        const movie = data.Search[0]; // Assuming the first result is the most relevant

        // Fetch detailed info for the most relevant movie
        fetchMovieDetails(movie.imdbID);

    } catch (error) {
        // Handle fetch or parsing errors
        console.error("Error fetching data:", error);
        document.getElementById('output').innerHTML = `Error: ${error.message}. Please try again with a different query.`;
    }
}

// Function to fetch detailed movie data using IMDb ID
async function fetchMovieDetails(imdbID) {
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    try {
        // Fetch detailed movie data
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "False") {
            throw new Error(`Movie details not found.`);
        }

        // Display detailed movie information
        document.getElementById('output').innerHTML = `
        <img src="${data.Poster}" width="200">
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Released:</strong> ${data.Released}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Actors:</strong> ${data.Actors}</p>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>Language:</strong> ${data.Language}</p>
        <p><strong>Awards:</strong> ${data.Awards}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        `;

        // Search YouTube for the trailer
        searchYouTubeVideos(`${data.Title} trailer`);

    } catch (error) {
        // Handle fetch or parsing errors
        console.error("Error fetching detailed data:", error);
        document.getElementById('output').innerHTML = `Error: ${error.message}. Please try again later.`;
    }
}

// YouTube API Key (replace with your API key)
const youtubeApiKey = 'AIzaSyDNOInbeiY9g3cJ2y4JhhYBG0VnKZaeWfo'; // Replace with your actual API key

// Load the API client and auth2 library
function loadClient() {
    gapi.client.setApiKey(youtubeApiKey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest");
}

// Search YouTube Videos
function searchYouTubeVideos(query) {
    const request = gapi.client.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video'
    });

    request.execute(function (response) {
        displayVideo(response.items);
    });
}

// Display video in the video container
function displayVideo(videos) {
    const YoutubeVideoContainer = document.getElementById('YoutubeVideoContainer');
    YoutubeVideoContainer.innerHTML = '';  // Clear previous results

    if (videos && videos.length) {
        const videoId = videos[0].id.videoId;
        const iframe = document.createElement('iframe');
        iframe.width = '360';
        iframe.height = '215';
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameborder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowfullscreen = true;
        YoutubeVideoContainer.appendChild(iframe);
    } else {
        YoutubeVideoContainer.innerHTML = 'No videos found';
    }
}

// Initialize the client
gapi.load('client', loadClient);

document.getElementById("aiIcone").addEventListener("click", () => {
    document.getElementById("ai").classList.toggle("aishow")
})
document.getElementById("close_ai").addEventListener("click", () => {
    document.getElementById("ai").classList.toggle("aishow")

})


document.querySelector(".logo").addEventListener("click", () => { location.reload() })