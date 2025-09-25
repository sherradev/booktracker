import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const genres = [
  { label: "Fiction", value: "fiction" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Mystery", value: "mystery" },
  { label: "Romance", value: "romance" },
  { label: "Horror", value: "horror" },
  { label: "Science Fiction", value: "science fiction" },
  { label: "Biography", value: "biography" },
  { label: "History", value: "history" },
  { label: "Cooking", value: "cooking" },
  { label: "Children's", value: "children's" },
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
      let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${genre}&printType=books&orderBy=newest&maxResults=${MAX_API_RESULTS}&startIndex=${startIndex}`;
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
    const maxPossibleStart =  MAX_API_RESULTS;
    const randomValue = Math.floor(Math.random() * (maxPossibleStart + 1));  
    const safeStartIndex = Math.max(0, randomValue);  
    return safeStartIndex;
  };

  const handleRefresh = () => {
    // Get a random genre
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex].value;

    setSelectedGenre(randomGenre);
    fetchBooks(randomGenre, getRandomIndex());

    // setLoading(true)
  };

  const handleGenreChange = (value) => { 
    setSelectedGenre(value);
    fetchBooks(value, getRandomIndex());
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="flex flex-col max-w-screen-xl px-2 sm:px-6 lg:px-8 mb-5">
      <div className="">
        {/* <button onClick={handleRefresh}>Refresh</button> */}
        {/* <div className="flex mb-4 ml-auto">
          <label className="mr-2 font-medium">Genre:</label>
          <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
    
            {genres.map((genreOption) => (
              <option key={genreOption.value} value={genreOption.value}>
                {genreOption.label}
              </option>
            ))}
          </select>
        </div> */}
        <div className="w-full ml-auto"> 
          <label className="mr-2 font-medium">Genres:</label>
        </div>
        <div  className="w-full  *:">
        <div className="flex flex-wrap gap-1 mt-3 mb-5">
          {genres.map((genre) => (
            <button
              key={genre.value}
              onClick={() => handleGenreChange(genre.value)}
              className={`
                px-3 py-1 rounded-full font-medium text-sm transition-all duration-300 
                transform  hover:shadow-lg  
                ${
                  selectedGenre === genre.value
                    ? "bg-rose-400"
                    : "bg-white text-gray-700 shadow-md border-2 border-gray-200 hover:border-rose-300 hover:text-rose-600"
                }
              `}
            >
              {genre.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-1 flex">
          <Loading />
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 sm:gap-4 gap-2">
          {books.slice(0, RESULTS_TO_SHOW).map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              title={book.volumeInfo.title}
              className="flex flex-col h-full overflow-hidden sm:p-2 rounded-xl shadow hover:shadow-lg transition duration-300 s-secondary text-white"
            >
              <div className="overflow-hidden rounded-xl w-full aspect-[3/4]">
                <img
                  src={
                    book.volumeInfo.imageLinks?.thumbnail ||
                    "https://dummyimage.com/128x192?text=No+Image"
                  }
                  alt={book.volumeInfo.title}
                  className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition duration-300"
                />
              </div>
              <div className="mt-2 flex-grow flex items-center justify-center px-2 pb-1 sm:pb-0">
                <p className="text-center text-sm font-medium text-white truncate w-full">
                  {book.volumeInfo.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
