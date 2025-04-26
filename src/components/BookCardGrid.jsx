import React, { useState } from "react";
import BookCard from "./BookCard";

const BOOKS_PER_PAGE = 12;
const BookCardGrid = React.memo(({ books, label }) => {

  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(books.length / BOOKS_PER_PAGE);
  const paginated = books.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);

  if (!books || books.length === 0) {
    return <p>No books yet.</p>;
  }

  return (
    <div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
      {paginated.map((book, index) => (
        <div
          key={`${label}-${book.userBookData.bookId}`}
          className={`${
            index >= 3 ? "hidden md:block" : ""
          } flex flex-col h-full overflow-hidden sm:p-2 rounded-xl shadow hover:shadow-lg transition duration-300`}
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
      

      {(label === "allRead" || label === "allLiked") ? 
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= pageCount - 1}
          className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>:""}
      
    </div>
    
    
  );
});

export default BookCardGrid;
