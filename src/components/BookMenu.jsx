import {
  faBook,
  faBookOpen,
  faHeart as faSolidHeart,
  faPlus,
  faCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import writeToFirestore from "../utils/update-collection";
import { useState, useCallback, useRef, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import FormatDate from "../utils/time-formatter";
import html2canvas from "html2canvas";

const BookMenu = ({ bookData, bookId, user, onUpdateBookData }) => {
  const { googleBookData, userBookData } = bookData;

  const [showModal, setShowModal] = useState(false);
  // const [bookImgColor, setBookImgColor] = useState('');
  const shareRef = useRef(null);
  const bookImg = "https://covers.openlibrary.org/b/id/12738706-M.jpg";

  useEffect(()=>{ 
    // const imgRGB = getAverageColor(bookImg);  
    // setBookImgColor(imgRGB);

    const setGradient = async () => {
      if (shareRef.current && bookImg) {
          try {
              const averageColor = await getAverageColor(bookImg);
              // Create a subtle gradient using the average color
              const gradient = `linear-gradient(to bottom, ${averageColor}, rgba(255,255,255,0.8))`;
              shareRef.current.style.backgroundImage = gradient;
              shareRef.current.style.backgroundColor = 'transparent'; 
          } catch (error) {
              console.error("Failed to calculate average color:", error); 
              shareRef.current.style.backgroundImage = 'linear-gradient(to bottom, #cccccc, rgba(255,255,255,0.8))';
          }
      }
  };
  setGradient();
  },[googleBookData]);
 

  const getDataToSave = useCallback(
    (updatedUserBookData) => {
      const {
        authors = [],
        categories = [],
        imageLinks = null,
        industryIdentifiers = [],
        infoLink = "",
        maturityRating = "",
        pageCount = 0,
        publishedDate = "",
        title = "",
      } = bookData.googleBookData.volumeInfo;
      const baseUserData = {
        ...bookData.userBookData,
        ...updatedUserBookData,
        bookId: bookId,
        inDB: true,
        userId: user.uid,
        displayName: user.displayName,
      };

      if (!bookData.userBookData.inDB || !bookData.googleBookData) {
        //First time saving or googleBookData isnt saved
        return {
          googleVolumeData: {
            authors,
            categories,
            imageLinks,
            industryIdentifiers,
            infoLink,
            maturityRating,
            pageCount,
            publishedDate,
            title,
          },
          userBookData: baseUserData,
        };
      }

      return { userBookData: { ...updatedUserBookData } };
    },
    [bookData, bookId, user?.uid, user?.displayName]
  );

  const saveUserBookDataToFirestore = useCallback(
    async (updatedUserBookData) => {
      if (!user?.uid || !bookId) return;

      try {
        const dataToSave = getDataToSave(updatedUserBookData);
        console.log("dataToSave", dataToSave);

        await writeToFirestore({
          pathSegments: ["users", user.uid, "books", bookId],
          data: dataToSave,
          merge: true,
        });
      } catch (error) {
        console.error("Error saving book data to Firestore:", error);
      }
    },
    [user?.uid, bookId, getDataToSave]
  );

  const handleRead = async () => {
    try {
      const toggledRead = !bookData.userBookData.read;
      const readDate = toggledRead ? Timestamp.now() : "";

      onUpdateBookData({
        read: toggledRead,
        readStart: readDate,
        readEnd: readDate,
        inDB: true,
      });

      await saveUserBookDataToFirestore({
        read: toggledRead,
        readStart: readDate,
        readEnd: readDate,
      });
    } catch (error) {
      console.error("Error in handling read state", error);
    }
  };

  const handleLike = async () => {
    try {
      const toggledLiked = !bookData.userBookData.liked;
      onUpdateBookData({
        liked: true,
        inDB: true,
      });
      await saveUserBookDataToFirestore({ liked: toggledLiked });
    } catch (error) {
      console.error("Error in handleLike", error);
    }
  };

  const handleAdd = async () => {
    try {
      const toggledtToRead = !bookData.userBookData.toRead;
      onUpdateBookData({
        toRead: toggledtToRead,
        inDB: true,
      });
      await saveUserBookDataToFirestore({ toRead: toggledtToRead });
    } catch (error) {
      console.error("Error in handleAdd", error);
    }
  };

  const handleRate = async (value) => {
    try {
      const newValue = String(value);
      onUpdateBookData({
        rating: newValue,
        inDB: true,
      });
      await saveUserBookDataToFirestore({ rating: newValue });
    } catch (error) {
      console.error("Error in handleRate", error);
    }
  };

  const handleLogDateModal = () => {
    onUpdateBookData({
      readStart: FormatDate(new Date(), "yyyy-mm-dd"),
      readEnd: FormatDate(new Date(), "yyyy-mm-dd"),
    });
    setShowModal((prev) => !prev);
  };

  const handleDateChange = (event, field) => {
    const newValue = event.target.value;
    console.log("val", newValue);
    onUpdateBookData({
      [field]: newValue,
    });
  };

  const handleShareBtn = async () => {
    if (shareRef.current) {
      try { 
        const canvas = await html2canvas(shareRef.current, {
          letterRendering: 1,
          useCORS: true,
        });
        const myImage = canvas.toDataURL();
        const link = document.createElement("a");
  
        link.download = "promo.png";
        link.href = myImage; 
        document.body.appendChild(link);
        link.click(); 
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error capturing or downloading image:", error); 
      }
    }
  };

  const handleLogDate = async () => {
    try {
      await saveUserBookDataToFirestore({
        readStart: userBookData.readStart,
        readEnd: userBookData.readEnd,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  
  const getAverageColor = async (url) => {
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.src = url;
   
    await new Promise(resolve => {
      img.onload = resolve;
    });
  
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const length = data.length / 4;
  
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
  
    r = Math.floor(r / length);
    g = Math.floor(g / length);
    b = Math.floor(b / length);
  
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
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
          onClick={handleLogDateModal}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log
        </button>
        <button
          onClick={handleShareBtn}
          className="w-full py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Share
        </button>
      </div>

      

      {/* Modal */}
      {showModal && userBookData ? (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-80 z-50">
              <h2 className="text-lg font-semibold mb-4">Started Reading</h2>
              <input
                type="date"
                value={userBookData.readStart}
                onChange={(e) => handleDateChange(e, "readStart")}
                className="w-full border p-2 rounded mb-4"
              />
              <h2 className="text-lg font-semibold mb-4">Finsihed Reading</h2>
              <input
                type="date"
                value={userBookData.readEnd}
                onChange={(e) => handleDateChange(e, "readEnd")}
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
      ) : (
        ""
      )}

      {/* Shareable/Downloadable content start */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        ref={shareRef}
        style={{
          width: 1080,
          height: 1920,
          position: "absolute",
          top: "-9999px",
          left: "-9999px", 
          overflow: 'hidden',
          fontFamily: 'sans-serif'
        }}
      >
       

        {/* White Container Over Background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            height: 800,
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            boxShadow: '0 0 30px rgba(0,0,0,0.2)',
            zIndex: 1
          }}
        >
          {/* Row 1 */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img
            src={bookImg}
              alt={googleBookData.volumeInfo?.title || "Book Cover"}
              style={{ width: '33%', height: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
              }}
            />

            <div style={{ marginLeft: '2rem', flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {googleBookData.volumeInfo.title}
              </h1>
              <h2 style={{ fontSize: '1.5rem' }}>
                by {googleBookData.volumeInfo.authors ? googleBookData.volumeInfo.authors.join(", ") : "Unknown"}
              </h2>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{userBookData.liked ? "Liked" : "Nope"}</p>
            <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam corporis asperiores mollitia ullam,
              quas atque illum. Placeat maxime odit at beatae facere, architecto blanditiis in similique laudantium,
              corporis sapiente dolorum.
            </p>
          </div>
        </div>
      </div>
      </div>
      {/* Shareable/Downloadable content end */}
 
    </div>
  );
};
  
export default BookMenu;
