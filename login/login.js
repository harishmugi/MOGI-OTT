import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc,collection, setDoc, getDoc,addDoc  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const loginForm = document.querySelectorAll('.login-signup')[0];
const signupForm = document.querySelectorAll('.login-signup')[1];
const nav_to_signup = document.querySelector('#nav-to-signup');
const nav_to_login = document.querySelector('#nav-to-login');
const login_submit = document.querySelector('#login-submit');
const signup_submit = document.querySelector('#signup-submit');
const forgotpwd = document.querySelector('.forgot-pwd');
const details = document.querySelector('.user-details');

const userDetails = id => {
    localStorage.setItem('currently_loggedIn', id);
    const docRef = doc(db, 'users', id);

    getDoc(docRef).then(doc => {
        if (doc.exists()) {



// Function to get greeting based on time of day
function getTimeBasedGreeting() {
    const currentTime = new Date();  // Get the current time
    const hours = currentTime.getHours();  // Get the hours (0-23)

    let greeting = "";

    // Determine the greeting based on the time
    if (hours >= 5 && hours < 12) {
        greeting = "Good Morning!";
    } else if (hours >= 12 && hours < 17) {
        greeting = "Good Afternoon!";
    } else if (hours >= 17 && hours < 21) {
        greeting = "Good Evening!";
    } else {
        greeting = "Good Night!";
    }

    return greeting;
}



            const h1 = details.children[0];  // Access the first child of the 'details' element (likely an <h1> tag)
            h1.textContent = ` ${getTimeBasedGreeting()} ${doc.data().userName}`; 
            document.getElementById( "user_letter_div").style.display="block"
            document.getElementById( "profile").style.display="block"
            document.getElementById("viewWish").style.display="block"
            document.getElementById( "user_letter").style.display="block"


            // Set the h1 text to display the user's name
            let name = doc.data().userName;  // Get the user's name from the doc object
            let fletter= document.querySelector("#profile_letter")
            fletter.textContent=name[0];


            document.querySelector("#user_letter").textContent=name[0]


document.getElementById("profile_email").textContent=doc.data().email

document.getElementById("profile_name").textContent=doc.data().userName;


            details.style.display = 'block';
            const signout = document.getElementById("signout_butt");
    
            signout.style.display = "block";
    
            signout.addEventListener('click', signout_butt_func);


        } else {
            console.log('No such document');
        }
    }).catch(err => {
        console.error('Error getting document:', err);
    });
};

window.onload = () => {           const signout=document.getElementById( "signout_butt")

    try {
        const currentUser = localStorage.getItem('currently_loggedIn');
        if (currentUser === null) {
            document.getElementById( "user_letter_div").style.display="none"
            document.getElementById("viewWish").style.display="none"

            throw new Error('No Current User');
        } else {
            document.getElementById("user_letter").style.display="block"   

            userDetails(currentUser);
        }
    } catch (err) {
        

        // loginForm.style.display = 'block';
        // signout.textContent = "Signup"
     }
};
//  const currentUserletter = localStorage.getItem('currently_loggedIn');

// if(currentUserletter!==null){
    
//     }


// document.getElementById( "signout_butt").addEventListener("click",()=>{
//     loginForm.style.display = 'block';

// })
const close_login=document.getElementById("close_login").addEventListener("click",  ()=>{  loginForm.style.display = 'none'}
)
document.getElementById("close_signup").addEventListener("click",  ()=>{  signupForm.style.display = 'none'}
)


document.getElementById("loginanother").addEventListener("click",()=>{
    loginForm.style.display = 'block';

})
nav_to_signup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    document.querySelector('#login').reset();
});

nav_to_login.addEventListener('click', () => {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    document.querySelector('#signup').reset();
});signup_submit.addEventListener('click', event => {
    event.preventDefault();
    
    // Hide the submit button and show loader
    signup_submit.style.display = 'none';
    document.querySelectorAll('.loader')[1].style.display = 'block';
    
    // Get the form values
    const userName = document.querySelector('#signup-username').value;
    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-pwd').value;

    // Validate if username is provided
    if (!userName.trim()) {
        swal({
            title: 'Please provide a username.',
            icon: 'error'
        }).then(() => {
            signup_submit.style.display = 'block';
            document.querySelectorAll('.loader')[1].style.display = 'none';
        });
        return; // Stop further execution if username is not provided
    }

    // Validate email length
    if (email.length > 225) {
        swal({
            title: 'Email cannot be more than 225 characters.',
            icon: 'error'
        }).then(() => {
            signup_submit.style.display = 'block';
            document.querySelectorAll('.loader')[1].style.display = 'none';
        });
        return; // Stop further execution if email is too long
    }

    // Proceed with Firebase user creation
    createUserWithEmailAndPassword(auth, email, password)
        .then(cred => {
            // Create user in Firestore after successful account creation
            setDoc(doc(db, 'users', cred.user.uid), {
                userName: userName,
                email: email
            }).then(() => {
                swal({
                    title: 'Account Created Successfully',
                    icon: 'success'
                }).then(() => {
                    // Reset form and hide loader after successful signup
                    signup_submit.style.display = 'block';
                    document.querySelectorAll('.loader')[1].style.display = 'none';
                    document.querySelector('#signup').reset();
                    signupForm.style.display = 'none';
                    document.getElementById ("signup_butt").style.display="none"


                    // Auto login the user after sign-up
                    signInWithEmailAndPassword(auth, email, password)
                        .then(loginCred => {
                            swal({
                                title: 'Login Success',
                                icon: 'success'
                            }).then(() => {
                                // Show the submit button, hide loader, and reset the form
                                login_submit.style.display = 'block';
                                document.querySelectorAll('.loader')[0].style.display = 'none';
                                document.querySelector('#login').reset();
                                loginForm.style.display = 'none';
                                // Fetch user details after login
                                userDetails(loginCred.user.uid);
                            });
                        })
                        .catch(loginErr => {
                            // Handle login error (if any)
                            handleError(loginErr);
                        });
                });
            }).catch(err => {
                handleError(err);
            });
        })
        .catch(err => {
            handleError(err);
        });
});


// Function to handle errors and show user-friendly messages
function handleError(err) {
    let errorMessage = '';

    // Check the specific Firebase error code
    if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use. Please try logging in or use a different email address.';
    } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Your password is too weak. Please choose a password with at least 6 characters.';
    } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid. Please enter a valid email address.';
    } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error occurred. Please check your internet connection and try again.';
    } else {
        errorMessage = 'An unknown error occurred. Please try again later.';
    }

    // Show error message to the user
    swal({
        title: errorMessage,
        icon: 'error'
    }).then(() => {
        // Reset UI elements after showing error
        signup_submit.style.display = 'block';
        document.querySelectorAll('.loader')[1].style.display = 'none';
    });
}




login_submit.addEventListener('click', event => {
    event.preventDefault();
    login_submit.style.display = 'none';


    document.getElementById ("signup_butt").style.display="none"
    
    document.querySelectorAll('.loader')[0].style.display = 'block';
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-pwd').value;
    signInWithEmailAndPassword(auth, email, password)
    .then(cred => {
        swal({
            title: 'Login Success',
            icon: 'success'
        }).then(() => {
            // Show the submit button, hide loader, and reset the form
            login_submit.style.display = 'block';
            document.querySelectorAll('.loader')[0].style.display = 'none';
            document.querySelector('#login').reset();
            loginForm.style.display = 'none';
            // Fetch user details after login
            userDetails(cred.user.uid);
        });
    })
    .catch(err => {
        let errorMessage = 'An unknown error occurred. Please try again.';
        
        // Handle specific error codes and provide user-friendly messages
        switch (err.code) {
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email.';
                break;
                case 'auth/invalid-credential':errorMessage='Please enter a valid email address.'
            // case 'auth/user-not-found':
            //     errorMessage = 'No user found with this email. Please check your email or sign up.';
            //     break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
            default:
                errorMessage = err.message || errorMessage; // Use the default error message if no match
                break;
        }
        
        // Show the error message using SweetAlert
        swal({
            title: errorMessage,
            icon: 'error'
        }).then(() => {
            // Restore the UI state
            login_submit.style.display = 'block';
            document.querySelectorAll('.loader')[0].style.display = 'none';
    document.getElementById("user_letter").style.display="block"   

        });
    });})


forgotpwd.addEventListener('click', () => {
    swal({
        title: 'Reset Password',
        content: {
            element: 'input',
            attributes: {
                placeholder: 'Type your Email',
                type: 'email'
            }
        }
    }).then(val => {
        if (val) {
            login_submit.style.display = 'none';
            document.querySelectorAll('.loader')[0].style.display = 'block';
            sendPasswordResetEmail(auth, val).then(() => {
                swal({
                    title: 'Check Your Email',
                    icon: 'success'
                }).then(() => {
                    login_submit.style.display = 'block';
                    document.querySelectorAll('.loader')[0].style.display = 'none';
                });
            }).catch(err => {
                swal({
                    title: err,
                    icon: 'error'
                }).then(() => {
                    login_submit.style.display = 'block';
                    document.querySelectorAll('.loader')[0].style.display = 'none';
                });
            });
        }
    });
});





function signout_butt_func(){
    // Show confirmation dialog
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");

    if (confirmSignOut) {
        signOut(auth).then(() => {
            localStorage.removeItem('currently_loggedIn');
            details.style.display = 'none';
            loginForm.style.display = 'block';
            const signout=document.getElementById( "signout_butt")
            document.getElementById( "signup_butt").style.display="block"
            document.getElementById( "user_letter").style.display="none"

            signout.style.display="none"
            document.getElementById( "profile").style.display="none"
            document.getElementById( "user_letter_div").style.display="none"
            document.getElementById("viewWish").style.display="none"

        }).catch(error => {
            console.error('Error occurred while signing out:', error);
        });
    }
}



const currentUser = localStorage.getItem('currently_loggedIn');
if(currentUser==null){ 
  document.getElementById("signout_butt").style.display="none"
    document.getElementById("signup_butt").style.display="block"
}else{    document.getElementById("signout_butt").style.display="block"


    document.getElementById("signup_butt").style.display="none"
   
}

  
document.getElementById("signup_butt").addEventListener("click",()=>{

    const loginForm = document.querySelectorAll('.login-signup')[0];
    loginForm.style.display = 'block';})




    
    






    //cat
    document.getElementById('categoryToggle').addEventListener('click', function() {
        var catContainer = document.getElementById('catContainer');
        
        // Toggle the 'show' class to handle the dropdown with animation
        catContainer.classList.toggle('show');
      });