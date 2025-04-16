import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";  
import { useUser } from "../contexts/user-context";
import Loading from "../components/Loading"; 
import BookMenu from "../components/BookMenu";
 

export default function AboutBook() { 
  const { id: bookId } = useParams();
  const { user } = useUser(); 
  const [loading, setLoading] = useState(false); 
  const [expanded, setExpanded] = useState(false); 

  const [bookData, setBookData] = useState({
    googleBookData: null,
    userBookData: {
      bookId: bookId, 
      read: false,
      liked: false,
      toRead: false,
      inDB: false,
      rating: "", 
      readStart: "",
      readEnd: "",
      userId: "",
      displayName: ""
    },
  });
  const {googleBookData} = bookData;
  const description = googleBookData?.volumeInfo.description || "No description available.";

  const fetchGoogleBookDetails = useCallback(async (bookId) => {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    if (!res.ok) throw new Error("Failed to fetch book details");
    const data = await res.json();
    return data;
  }, []);

  const fetchBookUserState = useCallback(async (bookId, userId) => {
    if (!userId || !bookId) return null;
    try {
      const docRef = doc(db, 'users', userId, 'books', bookId);
      const docSnap = await getDoc(docRef); 
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching user book state:', error); 
      return null;
    }
  }, []);

  

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user?.uid || !bookId) {
        setLoading(false);
        return;
      } 
      setLoading(true); 
      try {
        const [bookData, userState] = await Promise.all([
          fetchGoogleBookDetails(bookId),
          fetchBookUserState(bookId, user.uid),
        ]);

        if (isMounted) {

          setBookData({
            googleBookData: bookData,
            userBookData: {
              bookId: userState?.userBookData.bookId ?? bookId, 
              read: userState?.userBookData.read ?? false,
              liked: userState?.userBookData.liked ?? false,
              toRead: userState?.userBookData.toRead ?? false,
              inDB: userState?.userBookData.inDB ?? false,
              rating: userState?.userBookData.rating ?? "", 
              readStart: userState?.userBookData.readStart ?? "",
              readEnd: userState?.userBookData.readEnd ?? "",
              userId: userState?.userBookData.userId ?? user.uid,
              displayName: userState?.userBookData.displayName ?? "",
            }
          });
        }
      } catch (err) {
        console.error("Error fetching book or user state:", err); 
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [bookId, user?.uid, fetchGoogleBookDetails, fetchBookUserState]);

  

  if (loading || !googleBookData) {
    return <Loading />;
  }
 
  const handleUpdateBookData = (newUserData) => {
    setBookData((prev) => ({
      ...prev,
      userBookData: {
        ...prev.userBookData,
        ...newUserData, // Merge the new user data with the existing one
      },
    }));
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-start flex-row">
        {/*-------- First Column: Image with Set Width --------*/}
        <div className="w-40 shrink-0">
          <img
            src={
              googleBookData.volumeInfo.imageLinks?.thumbnail ||
              "https://dummyimage.com/128x192?text=No+Image"
            }
            alt={googleBookData.volumeInfo.title}
            className="w-32 h-48 object-cover mr-4"
          />
        </div>

        {/*-------- Second Column: Title & Auuthor --------*/}
        <div className="flex-grow px-4">
          {/* Add some horizontal padding */}
          <h1 className="text-2xl font-bold mb-4">
            {googleBookData.volumeInfo.title}
          </h1>
          <p className="text-lg font-semibold mb-2">
            Authors: {googleBookData.volumeInfo.authors ? googleBookData.volumeInfo.authors.join(", "): "Unknown"}
          </p>
        </div>

        {/*-------- Third Column: Button with Content-Based Width --------*/}
        <div className="ml-auto hidden sm:block">  
          {bookData ?  <BookMenu onUpdateBookData={handleUpdateBookData} bookData={bookData} bookId={bookId} user={user}/>  : ''}
        </div>
      </div>

      <div className="block sm:hidden mt-3">
      {bookData ?  <BookMenu onUpdateBookData={handleUpdateBookData} bookData={bookData} bookId={bookId} user={user}/>  : ''}
      </div>

      {/* {Description} */}
      <div className="mt-6">
        {/* Mobile view */}
        <div className="mb-4 block md:hidden">
          <div className="text-gray-700">
            <p
              className={
                expanded ? "" : "line-clamp-4 max-h-32 overflow-hidden"
              }
            >
              <span
                className="book-description mb-4"
                dangerouslySetInnerHTML={{ __html: description }}
              ></span>
            </p>
            <button
              className="text-blue-500 hover:underline mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Read Less" : "Read More"}
            </button>
          </div>
        </div>

        {/* Web view */}
        <div className="hidden md:block">
          <div className="text-gray-700">
            <span
              className="book-description mb-4"
              dangerouslySetInnerHTML={{ __html: description }}
            ></span>
          </div>
        </div>

        <a
          href={googleBookData.volumeInfo.infoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Learn more
        </a>
      </div> 

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Additional Details:</h3>
        <ul className="list-disc pl-5">
          <li>
            <strong>Publisher:</strong> {googleBookData.volumeInfo.publisher}
          </li>
          <li>
            <strong>Published Date:</strong>{" "}
            {googleBookData.volumeInfo.publishedDate}
          </li>
          <li>
            <strong>Page Count:</strong> {googleBookData.volumeInfo.pageCount}
          </li>
          <li>
            <strong>Categories:</strong>{" "}
            {googleBookData.volumeInfo.categories?.join(", ")}
          </li>
        </ul>
      </div>

    
    </div>
  );
}
