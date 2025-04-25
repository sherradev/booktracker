import {
  faBook,
  faBookOpen,
  faHeart as faSolidHeart,
  faCheck,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import writeToFirestore from "../utils/update-collection";
import { useState } from "react";
import { Timestamp } from "firebase/firestore"; 
import StarRating from "./StarRating"; 
import BookModal from "./BookModal";
import saveUserBookData from "../utils/save-data"; 

const BookMenu = ({ bookData, user, onUpdateBookData }) => {
  const { userBookData } = bookData;
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
 
  const updateData = (modifiedBookData) => {
    onUpdateBookData(modifiedBookData);
    saveUserBookData({
      bookData: { googleBookData: bookData.googleBookData, userBookData },
      updatedUserBookData: modifiedBookData,
      user,
    });
  }; 

  const handleRead = async () => {
    try {
      const toggledRead = !bookData.userBookData.read;
      const readDate = toggledRead ? Timestamp.now() : "";
      const modifiedBookData = {
        read: toggledRead,
        readStart: readDate,
        readEnd: readDate,
        inDB: true,
      };
      updateData(modifiedBookData);
    } catch (error) {
      console.error("Error in handling read state", error);
    }
  };

  const handleLike = async () => {
    try {
      const toggledLiked = !bookData.userBookData.liked;
      const modifiedBookData = {
        liked: toggledLiked,
        inDB: true,
      };
      updateData(modifiedBookData);
    } catch (error) {
      console.error("Error in handleLike", error);
    }
  };

  const handleAdd = async () => {
    try {
      const toggledtToRead = !bookData.userBookData.toRead;
      const modifiedBookData = {
        toRead: toggledtToRead,
        inDB: true,
      };
      updateData(modifiedBookData);
    } catch (error) {
      console.error("Error in handleAdd", error);
    }
  };

  const handleRatingChange = async (newRating) => {
    try {
      setRating(newRating);
      const modifiedBookData = {
        rating: newRating,
        inDB: true,
      };
      updateData(modifiedBookData);
    } catch (error) {
      console.error("Error in handleRate", error);
    }
  };

  const handleUpdateUserBookData = async (modifiedBookData) => {
    try {
      onUpdateBookData(modifiedBookData); 
    } catch (error) {
      console.error("Error in handleRate", error);
    }
  };

  return (
    <div className="w-full md:w-auto border rounded p-4 shadow self-start">
      {/* Icons */}
      <div className="flex justify-around mb-4">
        <FontAwesomeIcon
          icon={userBookData.read ? faBookOpen : faBook}
          className={`cursor-pointer text-xl ${
            userBookData.read ? "text-green-600" : ""
          }`}
          onClick={handleRead}
        />
        <FontAwesomeIcon
          icon={faSolidHeart}
          className={`cursor-pointer text-xl ${
            userBookData.liked
              ? "text-red-400"
              : "text-gray-300 hover:text-red-200"
          }`}
          onClick={handleLike}
        />
        <FontAwesomeIcon
          icon={userBookData.toRead ? faCheck : faListUl}
          className={`cursor-pointer text-xl ${
            userBookData.toRead ? "text-green-600" : ""
          }`}
          onClick={handleAdd}
        />
      </div>

      {/* Rating */}
      <div className="flex justify-center mb-4">
        <div className="star-rating">
          <StarRating
            max={5}
            initialRating={userBookData.rating ? userBookData.rating : rating}
            onRating={handleRatingChange}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={()=>setShowModal(true)}
          className="w-full py-2 text-white rounded bg-black hover:bg-gray-900 "
        >
          Review or Log
        </button>
       
      </div>

      {/* Modal */}
      {showModal ? (
        <>
          <BookModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            view={"log"} 
            googleBookData={bookData.googleBookData}
            userBookData={bookData.userBookData}
            onUpdateData={handleUpdateUserBookData}
          /> 
        </>
      ) : (
        "")} 
    </div>
  );
};

export default BookMenu;
