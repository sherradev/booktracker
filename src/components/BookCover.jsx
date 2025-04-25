import { useState } from "react";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BookCover = ({ editBookCover, coverId, title }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="bg-white p-0.5 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center cursor-pointer"
          onClick={editBookCover}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50"></div>
          <FontAwesomeIcon
            icon={faPencilAlt}
            className="text-white text-sm relative z-10"
          />
        </div>
      )}
      <img
        src={`${
          coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "https://dummyimage.com/275x400?text=No+Image"
        }`}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop in some browsers
          e.target.src = "https://dummyimage.com/275x400?text=No+Image";
        }}
        className="w-[100px] h-[150px] object-cover"
        alt={`Book Cover of ${title}`}
      />
    </div>
  );
};

export default BookCover;
