import React from "react";
import BookCard from "./BookCard";

const BookCardGrid = React.memo(({ books, label }) => {
  if (!books || books.length === 0) {
    return <p>No books marked as {label} yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
      {books.map((book, index) => (
        <div
          key={`${label}-${book.userBookData.bookId}`}
          className={`${
            index >= 3 ? "hidden md:block" : ""
          } flex flex-col justify-between h-full max-h-[400px] border p-1 sm:p-2 rounded shadow hover:shadow-md transition duration-200`}
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
});

export default BookCardGrid;
