import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Safely access nested properties
  const title = book?.googleVolumeData?.title || 'No Title Available';
  const authors = book?.googleVolumeData?.authors || [];
  const thumbnail = book?.googleVolumeData?.imageLinks?.thumbnail || '';
  const bookId = book?.userBookData?.bookId;

  return (
    <div className="overflow-hidden">
      {thumbnail && (
        <Link to={`/book/${bookId}`}>
          <img src={thumbnail} alt={title} className="w-full h-48 object-cover" loading="lazy" />
        </Link>
      )}
      <div className="p-1 sm:p-4">
        <Link to={`/book/${bookId}`} className="hover:underline">
          <h3 className="text-sm sm:text-lg font-semibold mb-2">{title}</h3>
        </Link>
        {authors.length > 0 && (
          <p className="text-sm text-gray-600">
            By {authors.join(', ')}
          </p>
        )}
      </div>
      {/* You can add more details or interactive elements here if needed */}
    </div>
  );
};

export default BookCard;