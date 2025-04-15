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

const MAX_API_RESULTS = 40; // Google Books API max results
const RESULTS_TO_SHOW = 18; // Number of results to display

const Recommendations = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");

  const fetchBooks = async (genre, startIndex) => {
    setLoading(true);
    try {
      let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${genre}&orderBy=relevance&maxResults=${MAX_API_RESULTS}&startIndex=${startIndex}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomIndex = () => {
    const maxPossibleStart = 200 - MAX_API_RESULTS;
    const randomStartIndex =
      Math.floor(Math.random() * (maxPossibleStart / MAX_API_RESULTS + 1)) *
      MAX_API_RESULTS;
    const safeStartIndex = Math.max(0, randomStartIndex); // Ensure startIndex is not negative
    return safeStartIndex;
  };
  const handleRefresh = () => {
    // Get a random genre
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex].value;

    setSelectedGenre(randomGenre);
    fetchBooks(randomGenre, getRandomIndex());
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
    fetchBooks(event.target.value, getRandomIndex());
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="flex flex-col max-w-screen-xl mx-auto px-2 sm:px-6 lg:px-8 mb-5">
      <div className="flex">
        <button onClick={handleRefresh}>Refresh</button>
        <div className="flex mb-4 ml-auto">
          <label className="mr-2 font-medium">Genre:</label>
          <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
            <option value="">All Genres</option>
            {genres.map((genreOption) => (
              <option key={genreOption.value} value={genreOption.value}>
                {genreOption.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 sm:gap-4 gap-2">
          {books.slice(0, RESULTS_TO_SHOW).map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              title={book.volumeInfo.title}
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
              <h2 className="text-sm font-semibold text-center line-clamp-2">
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
