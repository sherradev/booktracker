import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const genres = [
  { label: "Fiction", value: "fiction" },
  { label: "Science", value: "science" },
  { label: "History", value: "history" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Mystery", value: "mystery" },
  { label: "Romance", value: "romance" },
];

const Recommendations = () => {
  const [query, setQuery] = useState("fiction");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${query}&orderBy=relevance&maxResults=18`
        );
        const data = await res.json();
        setBooks(data.items || []);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query]);

  return (
    <div className="flex flex-col max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
      <div className="mb-4 self-end">
        <label className="mr-2 font-medium">Genre:</label>
        <select
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-1"
        >
          {genres.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
       <Loading />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="flex flex-col justify-between h-full border p-2 rounded shadow hover:shadow-md transition duration-200"
            >
              <div className="w-full aspect-[2/3] overflow-hidden mb-2">
                <img
                  src={
                    book.volumeInfo.imageLinks?.thumbnail ||
                    "https://dummyimage.com/128x192?text=No+Image"
                  }
                  alt={book.volumeInfo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-sm font-semibold truncate text-center">
                {book.volumeInfo.title}
              </h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
