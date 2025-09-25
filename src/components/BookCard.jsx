import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Safely access nested properties
  const title = book?.googleVolumeData?.title || 'No Title Available'; 
  const thumbnail = book?.userBookData?.bookCover ? `https://covers.openlibrary.org/b/id/${book?.userBookData?.bookCover}-M.jpg`:
      book?.googleVolumeData?.imageLinks?.thumbnail || "https://dummyimage.com/128x192?text=No+Image";

  // const authors = book?.googleVolumeData?.authors || [];
  const bookId = book?.userBookData?.bookId;

  return (
    
    <>
    <div className="overflow-hidden rounded-xl w-full aspect-[3/4]">
      {thumbnail && (
        <Link to={`/book/${bookId}`}>
          <img src={thumbnail} alt={title} className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition duration-300" 
          loading="lazy" />
        </Link>
      )}  
    </div>
    <div className='mt-2 flex-grow flex items-center justify-center px-2 pb-1 sm:pb-0'> 
        <Link to={`/book/${bookId}`}  className="text-center text-sm font-medium text-white truncate w-full">
                                {title}
                            </Link>
    </div>
    </>
  );
};

export default BookCard;