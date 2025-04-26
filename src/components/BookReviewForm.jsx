import React, { useEffect, useState } from "react";
import {
  faHeart,
  faSquare,
  faCheckSquare,
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
  modalCover,
  currentView
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
  const [isDownloadCheckedDisabled, setIsDownloadCheckedDisabled] = useState(false);
  const [isFinishedChecked, setIsFinishedChecked] = useState(false);
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

  const handleClickPencil = () => {
    onChangeView("covers");
  };

  const toggleDownloadCheckbox = () => {
    setIsDownloadChecked((prev) => !prev);
  };

  const toggleFinishedCheckbox = () => {
    setIsFinishedChecked((prev) => !prev);
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
      setIsSubmitDisabled(false);
    }
  };

  const handleSubmitReview = () => { 
    const showConfirmationModal = Boolean(!isFinishedChecked && (isLiked || rating || reviewText))
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
      isDownloadChecked, showConfirmationModal
    );
  };

  useEffect(() => {
    if (isDownloadChecked && !modalCover && currentView != "reviewNoDownload") { 
      onChangeView("requiredCover");
    }
    if (currentView === "reviewNoDownload" && isDownloadChecked){
      setIsDownloadCheckedDisabled(true);
      setIsDownloadChecked(false); 
    }
  }, [isDownloadChecked, modalCover, onChangeView, currentView]);

  useEffect(() => { 
    if (userBookData.read && userBookData.readEnd) {
      setIsFinishedChecked(true);
    }
  }, [userBookData]);

  return (
    <div className="max-h-[95vh] overflow-x-hidden overflow-y-auto">
      <div className="flex p-3">
        <div className="w-60 max-w-52 min-w-30">
          <BookCover
            imgClasses="max-h-70"
            editBookCover={handleClickPencil}
            imgURL={
              modalCover
                ? `https://covers.openlibrary.org/b/id/${modalCover}-M.jpg`
                : googleBookData.volumeInfo.imageLinks?.thumbnail ||
                  "https://dummyimage.com/128x192?text=No+Image"
            }
            title={googleBookData.volumeInfo.title}
          />
        </div>
        <div className="ms-3  flex flex-col justify-between">
          <div>
            <h2
              className="text-lg font-semibold"
              dangerouslySetInnerHTML={{
                __html: googleBookData.volumeInfo.title,
              }}
            />
            <h3 className="text-gray-600 text-sm">
              {googleBookData.volumeInfo.authors ? (
                <span>{`by ${googleBookData.volumeInfo.authors.join(
                  ", "
                )}`}</span>
              ) : (
                "Unknown"
              )}
            </h3>
          </div>

          <div className="flex mt-4 flex-col sm:flex-row">
            <div className=" sm:me-3">
              <h2 className="font-semibold text-sm h-7 flex items-center">
                Started
              </h2>
              <input
                type="date"
                value={readStart}
                onChange={(e) => setReadStart(e.target.value)}
                className="border p-1 rounded w-30 text-sm border-gray-400"
              />
            </div>

            <div className="mt-2 sm:mt-0 sm:ms-3">
              <div className="h-7">
                <div className="flex items-center">
                  <div
                    className="cursor-pointer text-xl"
                    onClick={toggleFinishedCheckbox}
                  >
                    <FontAwesomeIcon
                      icon={isFinishedChecked ? faCheckSquare : faSquare}
                      className={`me-2 text-gray-300 ${
                        isFinishedChecked ? "text-green-500" : ""
                      }`}
                    />
                  </div>
                  <label
                    className="font-semibold text-sm cursor-pointer select-none"
                    onClick={toggleFinishedCheckbox}
                  >
                    Finished
                  </label>
                </div>
              </div>
              <input
                type="date"
                value={readEnd}
                onChange={(e) => setReadEnd(e.target.value)}
                className={`border p-1 rounded w-30 border-gray-400 text-sm ${
                  isFinishedChecked ? "visible" : "hidden"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
 
      <div className={`${isFinishedChecked ? 'block':'hidden'}`}>
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
                  isLiked
                    ? "text-red-400"
                    : "text-gray-300 hover:text-red-200"
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
            className="w-full border rounded-lg mt-1 h-[20vh] sm:h-[15vh] resize-none p-2"
          />
          <label style={reviewTextStyle}>
            {reviewText.length} / {CHAR_LIMIT} characters
          </label>
        </div>
      </div>
       
      <div className="py-2 px-3 flex mb-3 border-t-gray-300 border-t">
        {isFinishedChecked ? (
          <>
            <div className={`flex items-center mt-2 ${isDownloadCheckedDisabled ? 'opacity-50 hover:cursor-not-allowed pointer-events-none' : ''}`}>
              <div
                className="cursor-pointer text-xl"
                onClick={toggleDownloadCheckbox}
              >
                <FontAwesomeIcon
                  icon={isDownloadChecked ? faCheckSquare : faSquare}
                  className={`text-gray-300 ${
                    isDownloadChecked ? "text-green-500" : ""
                  }`}
                />
              </div>
              <label
                className="ml-2 text-gray-700 cursor-pointer select-none"
                onClick={toggleDownloadCheckbox}
              >
                Download on Save
              </label>
            </div>
          </>
        ) : (
          ""
        )}

        <div className="ml-auto mt-2">
          <button
            disabled={isSubmitDisabled}
            onClick={() => handleSubmitReview()}
            className={`${isSubmitDisabled ? 'bg-gray-300 ':'bg-black hover:bg-gray-900'} px-3 py-1 text-white rounded  ml-auto`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookReviewForm;
