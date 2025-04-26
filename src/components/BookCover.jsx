import { useState } from "react";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BookCover = ({ editBookCover, imgURL, title, imgClasses = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="bg-white p-0.5 relative overflow-hidden rounded-xl w-full aspect-[3/4]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <div
          className="absolute  top-0 left-0 w-full h-full flex items-center justify-center cursor-pointer"
          onClick={editBookCover}
        >
          <div className="absolute p-0.5 top-0 left-0 w-full h-full rounded-xl  bg-gray-500 opacity-50"></div>
          <FontAwesomeIcon
            icon={faPencilAlt}
            className="text-white text-sm relative z-10"
          />
        </div>
      )}
      <img
        src={imgURL}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop in some browsers
          e.target.src = "https://dummyimage.com/275x400?text=No+Image";
        }}
        className={`w-full h-full object-cover rounded-xl  ${imgClasses}`}
        alt={`Book Cover of ${title}`}
      />
    </div>
  );
};

export default BookCover;
