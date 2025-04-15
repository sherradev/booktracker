import React, { useEffect, useState } from "react";
import {  onAuthStateChanged, signInAnonymously } from "firebase/auth"; 
import {
  auth,
  provider,
  signInWithPopup, 
} from "../config/firebase-config";
 
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Check if user is logged in when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      console.log("User Info:", loggedInUser); // Log user details 

      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      console.log('Signed in anonymously:', user.uid);
      navigate("/");
      // At this point, the user is signed in with a unique, temporary UID.
      // You can now proceed to interact with other Firebase services (Firestore, Realtime Database, etc.)
      // using this user's UID.
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      // Handle the error (e.g., display a message to the user)
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      {loading ? (
        <>
          {loading ? (
            <>
            <FontAwesomeIcon icon={faSpinner} spin={true} size="2xl"/>
            </>
          ) : ""}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </>
      ) : (
        <>
          <div className="text-center">
            <h1>Hi there!</h1>
            <p>Welcome to Fit Friends</p>

            {user && (
              <div>
                <button onClick={() => auth.signOut()}>Sign out</button>
              </div>
            )}

            <div>
              <button
                className="gsi-material-button"
                onClick={handleGoogleSignIn}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: "block" }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    Sign in with Google
                  </span>
                  <span style={{ display: "none" }}>Sign in with Google</span>
                </div>
              </button>
            </div>
            <div>
            <button onClick={signInGuest}>Continue as Guest</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
