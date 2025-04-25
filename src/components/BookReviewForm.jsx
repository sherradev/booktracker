import React, { useState } from "react";
import {
  faHeart,
  faSquare,
  faCheckSquare 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StarRating from "./StarRating";
import FormatDate from "../utils/time-formatter";
import { Timestamp } from "firebase/firestore";
import { parseISO } from "date-fns";
import BookCover from "./BookCover";

const CHAR_LIMIT = 280;

const BookReviewForm = ({
  onSubmit,
  onChangeView,
  userBookData,
  googleBookData,
  modalCover
}) => { 
  const [reviewText, setReviewText] = useState(
    userBookData != undefined ? userBookData.review : ""
  );
  const [isLiked, setIsLiked] = useState(
    userBookData != undefined ? userBookData.liked : false
  );
  const [rating, setRating] = useState(
    userBookData != undefined ? userBookData.rating : false
  );
  const [isDownloadChecked, setIsDownloadChecked] = useState(false);
  const [readStart, setReadStart] = useState(
    userBookData != undefined && userBookData.readStart
      ? FormatDate(userBookData.readStart, "yyyy-mm-dd")
      : FormatDate(new Date(), "yyyy-mm-dd")
  );
  const [readEnd, setReadEnd] = useState(
    userBookData != undefined && userBookData.readEnd
      ? FormatDate(userBookData.readEnd, "yyyy-mm-dd")
      : FormatDate(new Date(), "yyyy-mm-dd")
  ); 
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const reviewTextStyle = {
    color: reviewText.length > CHAR_LIMIT ? "red" : "inherit",
  };

  // const handleMouseEnter = () => {
  //   setIsHovered(true);
  // };

  // const handleMouseLeave = () => {
  //   setIsHovered(false);
  // };

  const handleClickPencil = () => {
    onChangeView("covers");
  };

  const handleChange = () => {
    setIsDownloadChecked((prev) => !prev);
  };

  const handleRatingChange = async (newRating) => {
    try {
      setRating(newRating);
    } catch (error) {
      console.error("Error in handleRate", error);
    }
  };

  const handleChangeReview = (event) => {
    const newValue = event.target.value;
    setReviewText(newValue);

    if (newValue.length > CHAR_LIMIT) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(newValue.length === 0);
    }
  };

  const handleSubmitReview = () => {
    onSubmit(
      {
        inDB: true,
        read: true,
        liked: isLiked,
        rating: rating,
        review: reviewText,
        readStart: Timestamp.fromDate(parseISO(readStart)),
        readEnd: Timestamp.fromDate(parseISO(readEnd)),
      },
      isDownloadChecked
    );
  };

  return (
    <div>
      <div className="flex bg-gray-100 p-3">
        <BookCover
        editBookCover={handleClickPencil}
        coverId={modalCover}
        title={googleBookData.volumeInfo.title}
        /> 
        <div className="ms-3">
          <h2
            className="text-lg font-semibold"
            dangerouslySetInnerHTML={{
              __html: googleBookData.volumeInfo.title,
            }}
          />
          <h3 className="text-gray-600 text-sm">
            by{" "}
            {googleBookData.volumeInfo.authors ? (
              <span>{`By ${googleBookData.volumeInfo.authors.join(
                ", "
              )}`}</span>
            ) : (
              "Unknown"
            )}
          </h3>
        </div>
      </div>

      <div className="flex mt-2 py-2 px-3">
        <div>
          <h2 className="font-semibold">Started</h2>
          <input
            type="date"
            value={readStart}
            onChange={(e) => setReadStart(e.target.value)}
            className="  border p-2 rounded "
          />
        </div>
        <div className="ml-auto">
          <h2 className="font-semibold">Finished</h2>
          <input
            type="date"
            value={readEnd}
            onChange={(e) => setReadEnd(e.target.value)}
            className="  border p-2 rounded  "
          />
        </div>
      </div>

      <div className="flex mt-2 py-2 px-3">
        <div className="">
          <h2 className="font-semibold">Rating</h2>
          <div>
            <StarRating
              max={5}
              initialRating={rating}
              onRating={handleRatingChange}
            />
          </div>
        </div>
        <div className="ml-auto text-center">
          <h2 className="font-semibold">Like</h2>
          <div>
            <FontAwesomeIcon
              icon={faHeart}
              className={`cursor-pointer text-xl ${
                isLiked ? "text-red-400" : "text-gray-300 hover:text-red-200"
              }`}
              onClick={() => setIsLiked((prev) => !prev)}
            />
          </div>
        </div>
      </div>

      <div className="py-2 px-3">
        <h2 className="font-semibold">Review</h2>
        <textarea
          value={reviewText}
          onChange={handleChangeReview}
          placeholder="Write your review here..."
          className="w-full border rounded-lg mt-1 h-[40vh] sm:h-[15vh] resize-none p-2"
        />
        <label style={reviewTextStyle}>
          {reviewText.length} / {CHAR_LIMIT} characters
        </label>
      </div>

      <div className="py-2 px-3 flex">
        <div className="flex items-center">
          <div className="cursor-pointer text-xl" onClick={handleChange}>
            <FontAwesomeIcon
              icon={isDownloadChecked ? faCheckSquare : faSquare}
              className={`text-gray-300 ${
                isDownloadChecked ? "text-green-500" : ""
              }`}
            />
          </div>
          <label
            className="ml-2 text-gray-700 cursor-pointer select-none"
            onClick={handleChange}
          >
            Download on Save
          </label>
        </div>

        <div className="ml-auto">
          <button
            disabled={isSubmitDisabled}
            onClick={() => handleSubmitReview()}
            className=" px-2 py-1 text-white border-1 rounded border-green-600 hover:border-green-800 ml-auto hover:bg-green-800 bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookReviewForm;
