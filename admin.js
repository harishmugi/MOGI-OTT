import { initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection,updateDoc,arrayRemove, arrayUnion,getDocs, addDoc, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { getDatabase, ref, set, onValue, push,  get , update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


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
                let letter=comment.username;
                const commentElement = document.createElement("p");
                commentElement.innerHTML = `<div style="display: flex;gap: 10px;
">
                <div style="    height: 30px;
    width: 30px;
    padding: 2px;
    text-align: center;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #50d9eb;" >${comment.userEmail[0]}</div><div style="    display: flex
;flex-wrap:wrap">
                <div>${comment.userEmail}:</div>
                <div> ${comment.comment}</div> </div>
 
                </div>
               `;;
                commentListElement.appendChild(commentElement);
            }
        } else {
            const commentListElement = document.getElementById("comments_list");
            commentListElement.textContent = "No comments available.";
            // Reset previous content

            // const commentElement = document.createElement("p");
            //     commentElement.textContent = "No comments available.";
            //     ;
            //     commentListElement.appendChild(commentElement);
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
            moviesContainer.innerHTML = "<p>No movies found.</p>";
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
                    const movieId  = movie.title;

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
    async function retrieveMovies(clickedMovie ) {
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
                        <div id="movie_poster_title"  style="z-index:4;">
                            <div style="z-index:4;">  
                                <img src="${clickedMovie.poster}" alt="${clickedMovie.title} Poster" style="width: 500px; height:350px;z-index:4;" />
                                <h2>${clickedMovie.title}</h2>
                               <div style="display:flex";> <button id="playNow"> PLAY</button>  <p id="wish" class="wish"title=" Add to Wishlist +" style="width:fit-content"
><i class="fa-regular fa-heart"style="margin-top:25\px;margin-left:10px;background:#50d9eb;border-radius:50%;padding:5px;border:2px solid #fff"></i></p>
</div>
                                <div class="Description">
                                    <br>
                                    <h4>Description: </h4>
                                    <p>${clickedMovie.description || "No description available."}</p>
                                </div>
                            </div>
                            <div class="movie_cast_title">
                                <h4><strong>Release Date:</strong><p> ${clickedMovie.release_date}</p></h4>
                                <h4>Cast:</h4>
                                <p>${movieDetails ? movieDetails.cast.join(", ") : "N/A"}</p>
                                <h4>Director:</h4>
                                <p>${movieDetails ? movieDetails.director : "N/A"}</p>
                                <h4>Music Director:</h4>
                                <p>${movieDetails ? movieDetails.music_director : "N/A"}</p>
                                <h4>Producer:</h4>
                                <p>${movieDetails ? movieDetails.producer : "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Comment Section -->
                    <div id="comment_section">
                        <h3>Comments:</h3>
                       <div id="comments" class="comments"> <div id="comments_list" class="comments_list"></div> <!-- Where comments will be displayed -->
                        <textarea id="comment_input" placeholder="Add your comment"></textarea>
                        <span id="submit_comment"><i class="fa-regular fa-paper-plane"style="position:relative;bottom:10px;left:10px;border:2px solid #fff;padding:10px;border-radius:50%;color:white;background:#50d9eb;"></i></span>
                        <div class="View_Comments" style="cursor:pointer;">View Comments</div></div>
                    </div>
                </div>
                
            
                

                `;
                
                const movieId  = clickedMovie.title;

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
                    close_player.addEventListener("click",()=>{       
                                     close_player.style.display = "none";
                               let player_info_page=document.getElementById("player")
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
                        
                        // Redirect to h.html
                        window.location.href = 'Playing.html';
                    });
                    
                    document.querySelector(".wish").addEventListener("click",()=>{
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
if(    document.querySelector(".View_Comments").textContent=="Close Comments"
){     document.querySelector(".View_Comments").textContent="View Comments"
}else{
    document.querySelector(".View_Comments").textContent="Close Comments"}
});



   
// Add click event listener to the movie element
movieElement_playing.addEventListener('click', () => {
    // Select the selected movie container
    const selectedMovieContainer = document.getElementById('selected_movie');

    // Remove any existing movie details (ensure only one movie is shown)
    selectedMovieContainer.innerHTML = "";
    recommended(movie) 
//     // Create the new movie details section
//     const movie_dis = document.createElement('div');
//     movie_dis.classList.add("movie_dis");

//     // Create the new movie details content, checking if movieDetails is valid
//     movie_dis.innerHTML = `
//     <div id="movie_details">
//         <div id="movie_poster_title" style="z-index:4;">
//             <div style="z-index:4;">
//                 <img src="${movie.poster}" alt="${movie.title} Poster" style="width: 500px; height:350px;z-index:4;" />
//                 <h2>${movie.title}</h2>
//                 <div style="display:flex";> 
//                     <button id="playNow"> PLAY</button>  
//                     <div id="wish"class="wish"><p title=" Add to Wishlist +"><i class="fa-regular fa-heart"></i></p>
//                     <p id="wishlistadded"></p></div>
//                 </div>
//                 <div class="Description">
//                     <br>
//                     <h4>Description: </h4>
//                     <p>${movie.description || "No description available."}</p>
//                 </div>
//             </div>
//             <div class="movie_cast_title">
//                 <h4><strong>Release Date:</strong><p> ${movie.release_date}</p></h4>
//                 <h4>Cast:</h4>
//                 <p>${movieDetails ? movieDetails.cast.join(", ") : "N/A"}</p>
//                 <h4>Director:</h4>
//                 <p>${movieDetails ? movieDetails.director : "N/A"}</p>
//                 <h4>Music Director:</h4>
//                 <p>${movieDetails ? movieDetails.music_director : "N/A"}</p>
//                 <h4>Producer:</h4>
//                 <p>${movieDetails ? movieDetails.producer : "N/A"}</p>
//             </div>
//         </div>

//         <!-- Comment Section -->
//         <div id="comment_section">
//             <h3>Comments:</h3>
//            <div id="comments" class="comments"> <div id="comments_list" class="comments_list"></div> <!-- Where comments will be displayed -->
//             <textarea id="comment_input" placeholder="Add your comment"></textarea>
//             <span id="submit_comment"><i class="fa-regular fa-paper-plane"></i></span        >
//                         <div class="View_Comments">View Comments</div>         </div>

//         </div>
//     </div>
//     `;

//     selectedMovieContainer.style.backgroundImage = `url(${movie.poster})`;

//     // Set background properties
//     selectedMovieContainer.style.backgroundRepeat = "no-repeat"; 
//     selectedMovieContainer.style.backgroundSize = "cover"; 
//     selectedMovieContainer.style.backgroundPosition = "center"; 
//     selectedMovieContainer.style.backgroundBlendMode = "darken"; 
//     selectedMovieContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; 
//     selectedMovieContainer.style.position = "relative";  

//     const blurOverlay = document.createElement('div');
//     blurOverlay.style.position = "absolute";
//     blurOverlay.style.top = "0";
//     blurOverlay.style.left = "0";
//     blurOverlay.style.right = "0";
//     blurOverlay.style.bottom = "0";
//     blurOverlay.style.background = "radial-gradient(circle,transparent, rgba(0, 0, 0, 0), black)";
//     blurOverlay.style.pointerEvents = "none"; 

//     // Append the overlay to the selected movie container
//     selectedMovieContainer.appendChild(blurOverlay);

//     // Set z-index to ensure the content is above the blurred background and overlay
//     blurOverlay.style.zIndex = "1"; 

//     // Append the new movie details to the selected_movie container
//     selectedMovieContainer.appendChild(movie_dis);

//     // Optionally, show the close button and player info page
//     const closePlayer = document.getElementById('close_player');
//     const playerInfoPage = document.getElementById('player_info_page');
//     if (closePlayer && playerInfoPage) {
//         closePlayer.style.display = "block"; // Show the close button
//         playerInfoPage.style.display = "flex"; // Show the player info page
//     }




// const movieId  = movie.title;

//                     fetchComments(movieId);  



//                     document.querySelector(".View_Comments").addEventListener("click", () => {
//                         const commentsList = document.querySelector(".comments_list")
//                                                 commentsList.classList.toggle('display_comments'); // Toggle the display class
//                     if(   document.querySelector(".View_Comments").textContent=="Close Comments"
//                     ){    document.querySelector(".View_Comments").textContent="View Comments"
//                     }else{
//                         document.querySelector(".View_Comments").textContent="Close Comments"}
//                     });


//     document.getElementById("playNow").addEventListener("click", () => {
//         playVideo(movie.stream_url, movie.title, movie.description, movie.poster, movie.release_date, movie.details);
//     });

//     document.querySelector(".wish").addEventListener("click",()=>{
//         addToWish(clickedMovie.stream_url, clickedMovie.title, clickedMovie.description, clickedMovie.poster, clickedMovie.release_date, clickedMovie.details)
            
            
//             }) 

//     // Comment Section Functionality
//     auth.onAuthStateChanged(user => {
//         if (user) {
//             const userName = user.displayName || user.email;
//             const userEmail = user.email;            
            
//             document.getElementById("submit_comment").addEventListener("click", () => {
//                 const movieId = movie.title;  // Replace with the actual movie ID
//                 const comment = document.getElementById("comment_input").value;
//                 console.log(comment) 
//                                console.log(movieId)


//                 if (comment) {
//                     addCommentToDatabase(movieId, comment);
//                 }
//             });

// const movieId  = movie.title


//         } else {
//             console.log("Please log in to comment.");
//         }
//     });
}
);



              


            });

        } catch (error) {
            console.error("Error retrieving movies: ", error);
        }
    }

    


    // const moviesContainer = document.getElementById('row');

    // moviesContainer.appendChild(movieElement);
}
// );










// function playVideo(stream_url, title,description,poster,release_date) {




//     const movie_dis = document.createElement('div');
//     // movie_dis.classList.add("movie_dis");

//     movie_dis.innerHTML = `<div id="movie_details"><div>
       
//         <div class="tittle_dis">
//             <h2>${title}</h2>

//             <p><strong>Release Date:</strong> ${release_date}</p>
//                       <h4>Description :</h4><br>
//             <p>${description}</p>
//         </div></div>
        
        
//         </div>`;
        
   



     


    
//     // Check if the .video_player element exists in the DOM
//     const videoContainer = document.getElementById('video_player');
//     if (!videoContainer) {
//         console.error('Error: .video_player container not found');
//         return; // Prevent further execution if the container doesn't exist
//     }

//     videoContainer.style.display="block"
//     // Create a new video element
//     const videoElement = document.createElement('video');
//     videoElement.id = "my-live-video";
//     videoElement.classList.add("video-js", "vjs-big-play-centered", "movie-video");
//     videoElement.setAttribute("controls", "");
//     videoElement.setAttribute("autoplay", "");
//     videoElement.setAttribute("muted", ""); // For autoplay to work in most browsers
    
//     const videoSource = document.createElement('source');
//     videoSource.setAttribute("src", stream_url);
//     console.log('Stream URL:', stream_url);
//     videoSource.setAttribute("type", "application/x-mpegURL");
//     videoElement.appendChild(videoSource);
    
//     videoElement.onerror = (e) => {
//         console.error("Video playback error:", e);
//     };
    
//     // const videoContainer = document.getElementById('video_player');
//     if (videoContainer) {
//         videoContainer.appendChild(videoElement);
//     } else {
//         console.error('Error: Video container not found');
//     }
    
//     // Initialize Video.js for enhanced controls (if available)
//     if (window.videojs) {
//         videojs(videoElement);
//     } else {
//         console.error('Video.js not loaded');
//     }
    
//     // Call HLS setup if needed
//     setupHLS(videoElement, stream_url);
    

// }
// document.getElementById("close_video_player").addEventListener("click",()=>{
//    // Remove any existing video if it exists
//    const existingVideo = document.querySelector('.movie-video');
//    if (existingVideo) {
//        existingVideo.remove();
//    }
//    const videoContainer =  document.getElementById('video_player');

//    videoContainer.style.display="none"

// })










// HLS.js setup (for browsers that do not support HLS natively)
// function setupHLS(videoElement, stream_url) {
//     if (Hls.isSupported()) {
//         var hls = new Hls();
//         hls.loadSource(stream_url);
//         hls.attachMedia(videoElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, function () {
//             videoElement.play();
//         });
//     }
//     else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
//         // Safari natively supports HLS
//         videoElement.src = stream_url;
//         videoElement.addEventListener('loadedmetadata', function () {
//             videoElement.play();
//         });
//     }
// }// Initialize the carousel with the fetched images
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
        img.src = imageSrc.src;  // Use the image source from the array of images
        img.alt = imageSrc.alt;
        img.title = imageSrc.title;
        img.classList.add('d-block', 'w-100');  // Bootstrap classes to make the image fill the width
        div.appendChild(img);
        
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
                        title: poster.title  // Title text for the image
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








// // Initialize the carousel
// function initializeCarousel() {
//     const slides = document.querySelectorAll('#carousel_images img');
//     const slideWidth = slides[0].clientWidth;

//     let currentIndex = 0;

//     function moveSlide(direction) {
//         const totalSlides = slides.length;
//         currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
//         const carousel = document.querySelector('#carousel_images');
//         carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
//     }

//     setInterval(() => moveSlide(1), 3000);  // Automatic sliding every 5 seconds

//     document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
//     document.querySelector('.next').addEventListener('click', () => moveSlide(1));

















// function initializeCarousel() {
//     const carouselImages = document.querySelector('#carousel_images');
//     const images = carouselImages.querySelectorAll('img');
    
//     if (images.length === 0) return; // Exit if no images are available

//     const slideWidth = images[0].clientWidth;
//     let currentIndex = 0;

//     // Function to move the slide
//     function moveSlide(direction) {
//         const totalSlides = images.length;
//         currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
//         carouselImages.style.transition = 'transform 0.5s ease'; // Smooth transition
//         carouselImages.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
//     }

//     // Automatic sliding every 3 seconds
//     setInterval(() => moveSlide(1), 3000);  // Automatic sliding every 3 seconds

//     // Event listeners for prev/next buttons
//     document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
//     document.querySelector('.next').addEventListener('click', () => moveSlide(1));
// }

// // Call the function to initialize the carousel
// window.addEventListener('load', initializeCarousel);



// function initializeCarousel(images) {
//     // const images = ['img1.jpg', 'img2.jpg', 'img3.jpg']; // List of images you want to use in the carousel
//     const carouselInner = document.querySelector('#carousel_images');
// console.log(images)
//     images.forEach((imageSrc, index) => {
//         const div = document.createElement('div');
//         div.classList.add('carousel-item');
        
//         if (index === 0) {
//             div.classList.add('active'); // Make the first image active
//         }

//         const img = document.createElement('img');
//         img.src = imageSrc;
//         img.classList.add('d-block', 'w-100');  // Bootstrap classes to make the image fill the width
//         div.appendChild(img);
        
//         carouselInner.appendChild(div);
//     });

//     // Initialize the carousel with Bootstrap JS (this is optional, Bootstrap handles it via data attributes)
//     const carousel = new bootstrap.Carousel(document.querySelector('#carouselExampleAutoplaying'), {
//         interval: 3000,  // Slide every 3 seconds
//         ride: 'carousel',  // Start the carousel automatically
//     });
// }

// // Call the function after the page is loaded to initialize the carousel
// window.addEventListener('load', initializeCarousel);






// }
// // Initialize the carousel
// function initializeCarousel() {
//     const slides = document.querySelectorAll('#carousel_images img');
//     const slideWidth = slides[0].clientWidth;

//     let currentIndex = 0;

//     function moveSlide(direction) {
//         const totalSlides = slides.length;
//         currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
//         const carousel = document.querySelector('#carousel_images');
//         carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
//     }

//     setInterval(() => moveSlide(1), 5000);  // Automatic sliding every 5 seconds

//     document.querySelector('.prev').addEventListener('click', () => moveSlide(-1));
//     document.querySelector('.next').addEventListener('click', () => moveSlide(1));
// }

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
                });                alert("Movie removed from your wishlist!"); // Show alert
                heartIcon.title = " Add to Wishlist ";

                heartIcon.style.color = "white"; // Change icon to white
            } else {
                // Add movie to wishlist
                await updateDoc(userRef, {
                    wishlist: arrayUnion({ stream_url, title, description, poster, release_date, details })
                });               
                 alert("Movie added to your wishlist!"); // Show alert
                heartIcon.style.color = "red"; // Change icon to red
                heartIcon.title="Remove from wishlist"
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
// checkMovieInWishlist("Movie Title"); // Replace with actual movie title


document.getElementById("viewWish").addEventListener("click",()=>{
    document.getElementById("wishlist").style.display="block"

    document.getElementById("wishlist").style.position="fixed"
    document.getElementById("wishPage").style.display="flex"

    getWishlist()
})
document.getElementById("close_wish").addEventListener("click",()=>{
    document.getElementById("wishlist").style.display="none"
    document.getElementById("wishPage").style.display="none"

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
                            movieDiv.id=`${movie.title}`
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
                        } document.getElementById(`${movie.title}`).addEventListener("click",()=>{
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
                    const movieId  = movie.title;

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
                    recommended()
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


            //             // Add event listener to play video when clicked
            //             movieElement.addEventListener('click', () => {
            //                 const currentUser = localStorage.getItem('currently_loggedIn');


            //                 if(currentUser==null){


            // const loginForm = document.querySelectorAll('.login-signup')[0];
            // const signupForm = document.querySelectorAll('.login-signup')[1];
            //                     loginForm.style.display = 'block'

            //                 }else{
            //                 playVideo(movie.stream_url, movie.title);  // Optional: Play movie when clicked
            //         }});

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
