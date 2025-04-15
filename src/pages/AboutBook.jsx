import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase-config";
import { doc, getDoc, Timestamp } from "firebase/firestore";  
import { useUser } from "../contexts/user-context";
import Loading from "../components/Loading"; 
 import writeToFirestore from "../utils/update-collection";

import {
  faBook,
  faBookOpen,
  faHeart as faSolidHeart,
  faPlus,
  faCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AboutBook() { 
  const { id: bookId } = useParams();
  const { user } = useUser(); 
  const [loading, setLoading] = useState(false);
  // const [hoverRating, setHoverRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // const [isFirstBookSave, setIsFirstBookSave] = useState(false);
  const [logDate, setLogDate] = useState("");

  const [bookData, setBookData] = useState({
    googleBookData: null,
    userBookData: {
      bookId: bookId, 
      read: false,
      liked: false,
      toRead: false,
      inDB: false,
      rating: "",
      readDate: "",
      readStart: "",
      readEnd: "",
      userId: "",
      displayName: ""
    },
  });
  const {googleBookData, userBookData} = bookData;
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

  const getDataToSave = useCallback((updatedUserBookData) => {  
    const {authors, categories, imageLinks, industryIdentifiers, infoLink, maturityRating, pageCount, publishedDate, title} = bookData.googleBookData.volumeInfo;
    const baseUserData = {
      ...bookData.userBookData,
      ...updatedUserBookData,
      bookId: bookId,
      inDB: true,
      userId: user.uid,
      displayName: user.displayName 
    };
 
    if (!bookData.userBookData.inDB) {//First time saving 
      return {
        googleVolumeData: { authors, categories, imageLinks, industryIdentifiers, infoLink, maturityRating, pageCount, publishedDate, title },
        userBookData: baseUserData,
      };
    }
    
    return { userBookData:{...updatedUserBookData} };
  }, [bookData, bookId, user?.uid]);


  const saveUserBookDataToFirestore = useCallback(async (updatedUserBookData) => {
    if (!user?.uid || !bookId) return;
  
    try { 
      const dataToSave = getDataToSave(updatedUserBookData);
      console.log('dataToSave', dataToSave)
    
      await writeToFirestore({
        pathSegments: ["users", user.uid, "books", bookId],
        data: dataToSave,
        merge: true,
      });

    } catch (error) {
      console.error("Error saving book data to Firestore:", error);
    }
  }, [user?.uid, bookId, getDataToSave]);
  

  const handleRead = async () => {
    try {  
    const toggledRead = !bookData.userBookData.read;
    const readDate = toggledRead ? Timestamp.now() : "";

    setBookData((prev) => ({
      ...prev,
      userBookData: {
        ...prev.userBookData,
        read: toggledRead,
        readDate,
        inDB: true
      },
    }));

    await saveUserBookDataToFirestore({ read: toggledRead, readDate });
    } catch (error) {
      console.error("Error in handling read state", error); 
    }
  };
  
  const handleLike = async () => {
    try {
      const toggledLiked = !bookData.userBookData.liked;
      setBookData((prev) => ({
        ...prev,
        userBookData: {
          ...prev.userBookData,
          liked: toggledLiked,
          inDB: true 
        },
      })); 
    await saveUserBookDataToFirestore({ liked: toggledLiked });
    } catch (error) { 
      console.error("Error in handleLike", error); 
    }
  };

  const handleAdd = async () => {
    try {
      const toggledtToRead = !bookData.userBookData.toRead;
      setBookData((prev) => ({
        ...prev,
        userBookData: {
          ...prev.userBookData,
          toRead: toggledtToRead,
          inDB: true
        },
      })); 
    await saveUserBookDataToFirestore({ toRead: toggledtToRead }); 
    } catch (error) { 
      console.error("Error in handleAdd", error); 
    }
  }; 

  const handleRate = async(value) => {
    try {
      const newValue = String(value);
      setBookData((prev) => ({
        ...prev,
        userBookData: {
          ...prev.userBookData,
          rating: newValue,
          inDB: true
        },
      }));
      await saveUserBookDataToFirestore({ rating: newValue });
      } catch (error) { 
        console.error("Error in handleRate", error); 
      } 
  };

  const handleLogDate = async () => {
    try {
      await console.log("u"); // Placeholder for your save logic
      setShowModal(false);
      setLogDate("");
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };
  

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
              readDate: userState?.userBookData.readDate ?? "",
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
 

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-start">
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

        {/*-------- Second Column: Text Data --------*/}
        <div className="flex-grow px-4">
          {/* Add some horizontal padding */}
          <h1 className="text-2xl font-bold mb-4">
            {googleBookData.volumeInfo.title}
          </h1>
          <p className="text-lg font-semibold mb-2">
            Authors: {googleBookData.volumeInfo.authors?.join(", ")}
          </p>
        </div>

        {/*-------- Third Column: Button with Content-Based Width --------*/}
        <div className="ml-auto">
          {" "}
          {/* Push to the right */}
          <div className="w-full md:w-auto border rounded p-4 shadow self-start">
            {/* Icons */}
            <div className="flex justify-around mb-4">
              <FontAwesomeIcon
                icon={userBookData.read ? faBookOpen : faBook}
                className="cursor-pointer text-xl"
                onClick={handleRead}
              />
              <FontAwesomeIcon
                icon={
                  userBookData.liked
                    ? faSolidHeart
                    : faSolidHeart /* Use regular heart if desired */
                }
                className={`cursor-pointer text-xl ${
                  userBookData.liked ? "text-red-600" : "text-red-300"
                }`}
                onClick={handleLike}
              />
              <FontAwesomeIcon
                icon={userBookData.added ? faCheck : faPlus}
                className={`cursor-pointer text-xl ${
                  userBookData.added ? "text-green-600" : "text-green-400"
                }`}
                onClick={handleAdd}
              />
            </div>

            {/* Rating */}
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <FontAwesomeIcon
                  key={value}
                  icon={faStar}
                  className={`star-icon cursor-pointer text-xl ${
                    Number(bookData.userBookData.rating) >= value
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => handleRate(value)}
                  style={{
                    "--rating-value": Number(bookData.userBookData.rating),
                    "--hover-value": 0 /* Initialize hover value */,
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Log
              </button>
              <button className="w-full py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                Share
              </button>
            </div>
          </div>
        </div>
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

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-80 z-50">
              <h2 className="text-lg font-semibold mb-4">Log this book</h2>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogDate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
