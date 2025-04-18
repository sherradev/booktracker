import React, { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user-context";
import { db } from "../config/firebase-config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import BookCard from "../components/BookCard";
import Loading from "../components/Loading";

const Profile = () => {
  const { user } = useUser();
  const [allBooks, setAllBooks] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleSignOut = () => {
    // Renamed for clarity
    auth
      .signOut()
      .then(() => {
        // Handle the promise from auth.signOut()
        navigate("/");
      })
      .catch((error) => {
        // Handle any errors during sign-out
        console.error("Sign out error:", error);
      });
  };

  useEffect(() => { 
    if (user?.uid) { 
      const booksRef = collection(db, "users", user.uid, "books");
      const q = query(booksRef, orderBy("userBookData.readEnd", "desc")); // Initial sort by readDate for efficiency

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedBooks = []; 
          snapshot.forEach((doc) => { 
            fetchedBooks.push(doc.data());
          });
          setAllBooks(fetchedBooks);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching all books:", err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
      setAllBooks([]);
    }
  }, [user]); 
 
  const readBooks = allBooks
    .filter((book) => book.userBookData?.read)
    .sort(
      (a, b) =>
        (b.userBookData?.readDate?.toMillis() || 0) -
        (a.userBookData?.readDate?.toMillis() || 0)
    )
    .slice(0, 6);

  const likedBooks = allBooks
    .filter((book) => book.userBookData?.liked)
    .sort(
      (a, b) =>
        (b.userBookData?.likedDate?.toMillis() || 0) -
        (a.userBookData?.likedDate?.toMillis() || 0)
    )
    .slice(0, 6);

  console.log("profile");
  if (loading) {
    return <Loading message="Fetching your books..." />;
  }

  if (error) {
    return <div>Error fetching books. Please try again later.</div>;
  }
  return (
    <div className="max-w-screen-xl mx-auto px-1 sm:px-6 lg:px-8">
 
        <div className="flex items-center justify-end mb-2">
          <div className="relative">
          <img
            src={user.photoURL ? user.photoURL : `https://dummyimage.com/40x40/d2d3d9/d2d3d9`}
            alt={`${user.displayName}'s Profile`}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full mr-4"
          />
          {user.photoURL ? "" : <span className="absolute top-1/5 left-1/4">G</span>} 
          </div> 
          <h2>
          {user.displayName}</h2>
          <div className="ml-auto">
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        </div> 
      <h2>History</h2>
      <hr></hr>
      <div className="mt-4 mb-4">
        {readBooks.length > 0 ? ( 
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {readBooks.map((book, index) => (
            <div 
              key={`read-${book.userBookData.bookId}`}
              className={`  ${index >= 3 ? "hidden md:block" : ""}
                flex flex-col justify-between h-full border p-1 sm:p-2 rounded shadow hover:shadow-md transition duration-200`}
            >
                   <BookCard book={book} />
            </div>
          ))}
        </div>
        ) : (
          <p>No books marked as read yet.</p>
        )}
      </div>
      <h2>Liked Books</h2>
      <hr></hr>
      <div className="mt-4">
      {likedBooks.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {likedBooks.map((book, index) => (
            <div key={`liked-${book.userBookData.bookId}`} className={`${index >= 3 ? "hidden md:block" : ""}
            flex flex-col justify-between h-full border p-2 rounded shadow hover:shadow-md transition duration-200`}
        >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <p>No books marked as liked yet.</p>
      )}
      </div>
    </div>
  );
};

export default Profile;
