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
          `https://www.googleapis.com/books/v1/volumes?q="${query}"&printType=books&orderBy=newest&maxResults=40`
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
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {paginatedBooks.map((book) => (
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
