import {
  faBook,
  faBookOpen,
  faHeart as faSolidHeart,
  faPlus,
  faCheck,
  faStar,
  faStarHalfAlt
} from "@fortawesome/free-solid-svg-icons"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import writeToFirestore from "../utils/update-collection";
import { useState, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import FormatDate from "../utils/time-formatter";
import ShareBook from "./ShareBook";
import Modal from "./Modal";

const BookMenu = ({ bookData, bookId, user, onUpdateBookData }) => {
  const { googleBookData, userBookData } = bookData;
  const [showModal, setShowModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const characterLimit = 280, max = 5; 
  const [hoverValue, setHoverValue] = useState(null);

  const reviewTextStyle = {
    color: reviewText.length > characterLimit ? "red" : "inherit",
  };

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

  const openLogDateModal = () => {
    const rev = userBookData.review ? userBookData.review : "";
    onUpdateBookData({
      readStart: FormatDate(new Date(), "yyyy-mm-dd"),
      readEnd: FormatDate(new Date(), "yyyy-mm-dd"),
      review: rev
    });
    setReviewText(rev); 
    setShowModal(true);
  };

  const handleDateChange = (event, field) => {
    const newValue = event.target.value;
    onUpdateBookData({
      [field]: newValue,
    });
  };

  const submitLogValues = async () => {
    try {
      // await saveUserBookDataToFirestore({
      //   readStart: userBookData.readStart,
      //   readEnd: userBookData.readEnd,
      //   review: reviewText ? reviewText : ""
      // });
      console.log('test', {
        readStart: userBookData.readStart,
        readEnd: userBookData.readEnd,
        review: reviewText ? reviewText : ""
      })
      setShowModal(false);
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const handleChangeReview = (event) => {
    const newValue = event.target.value;
    setReviewText(newValue);

    if (newValue.length > characterLimit) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(newValue.length === 0); // Disable if empty
    }
  };
 
  const handleMouseMove = (e, index) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const hoverVal = x < width / 2 ? index + 0.5 : index + 1;
    setHoverValue(hoverVal);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
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
          icon={userBookData.toRead ? faCheck : faPlus}
          className={`cursor-pointer text-xl ${
            userBookData.toRead ? "text-green-600" : "text-green-400"
          }`}
          onClick={handleAdd}
        />
      </div>

      {/* Rating */}
      <div className="flex justify-center mb-4">
      <div className="star-rating">
      {[...Array(max)].map((_, i) => {
        const value = i + 1;
        const current = hoverValue ?? Number(userBookData.rating);

        let icon = faStar;
        let colorClass = "text-gray-300";

        if (current >= value) {
          colorClass = "text-yellow-400";
        } else if (current >= value - 0.5) {
          icon = faStarHalfAlt;
          colorClass = "text-yellow-400";
        }

        return (
          <span
            key={i}
            className="cursor-pointer text-xl"
            onClick={() => handleRate(current >= value ? value : value - 0.5)}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={handleMouseLeave}
          >
            <FontAwesomeIcon icon={icon} className={colorClass} />
          </span>
        );
      })}
    </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={openLogDateModal}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Review or Log
        </button>
        <ShareBook
          googleBookData={googleBookData}
          userBookData={userBookData}
          user={user}
        />
      </div>

      {/* Modal */}
      {showModal && userBookData ? (
        <>
          <Modal>
            <h2 className="text-lg font-semibold mb-4">Started</h2>
            <input
              type="date"
              value={userBookData.readStart}
              onChange={(e) => handleDateChange(e, "readStart")}
              className="w-full border p-2 rounded mb-4"
            />
            <h2 className="text-lg font-semibold mb-4">Finished</h2>
            <input
              type="date"
              value={userBookData.readEnd}
              onChange={(e) => handleDateChange(e, "readEnd")}
              className="w-full border p-2 rounded mb-4"
            />
            <h2 className="text-lg font-semibold mb-4">Review</h2>
            <textarea
              onChange={handleChangeReview}
              className="w-full border p-2 rounded mb-4 h-[258px] resize-none"
              value={reviewText}
            />
            <label style={reviewTextStyle}>
              {reviewText.length} / {characterLimit} characters
            </label>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitDisabled}
                onClick={submitLogValues}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </Modal>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default BookMenu;
