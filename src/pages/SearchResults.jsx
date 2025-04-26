import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Loading from "../components/Loading";

export default function SearchResults() {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const maxResults = 18;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q="${query}"&printType=books&orderBy=newest&maxResults=40&langRestrict=en&projection=lite`
        );
     
        const data = await res.json();
        setAllBooks(data.items || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchBooks();
    }
  }, [query]);

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage });
  };

  // Pagination logic
  const startIndex = (page - 1) * maxResults;
  const paginatedBooks = allBooks.slice(startIndex, startIndex + maxResults);
  const totalPages = Math.ceil(allBooks.length / maxResults);

  return (
    <div className="flex flex-col max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold mb-4">Search results for "{query}"</h1>

      {loading ? (
        <Loading />
      ) : (
        
        <>
          {paginatedBooks.length === 0 ? (
            <p>No results found.</p>
          ) : ( 
            <div className="grid grid-cols-3 md:grid-cols-6 sm:gap-4 gap-2">
              {paginatedBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                   className="flex flex-col h-full overflow-hidden sm:p-2 rounded-xl shadow hover:shadow-lg transition duration-300"
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
                  <div className='mt-2 flex-grow flex items-center justify-center px-2 pb-1 sm:pb-0'>
                <p className="text-center text-sm font-medium text-gray-700 truncate w-full">
                  {book.volumeInfo.title}
                </p>
              </div> 
                </Link>
              ))}
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="self-center font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
