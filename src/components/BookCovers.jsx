import React, { useEffect, useCallback, useState } from "react";
import Loading from "../components/Loading";
import { useBookCovers } from "../contexts/covers-context";
import getCovers from "../utils/get-covers";

const BookCovers = ({ onSelectCover, bookInfo, view, onCancelCover }) => {
  const { covers, setCovers, prevBookId, setPrevBookId } = useBookCovers();
  const [loading, setLoading] = useState(false);
  const [displayCovers, setDisplayCovers] = useState([]);

  const fetchCovers = useCallback(
    async (bookInfo) => {
      try {
        const newCovers = await getCovers(bookInfo.volumeInfo);
        setPrevBookId(bookInfo.id);
        setCovers(newCovers);
        setDisplayCovers(newCovers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch covers:", error);
        setDisplayCovers([]);
        setLoading(false);
      }
    },
    [setCovers, setPrevBookId]
  );

  useEffect(() => {
    setLoading(true);
    if (bookInfo?.id) {
      if (bookInfo.id !== prevBookId) {
        setDisplayCovers([]);
        fetchCovers(bookInfo);
      } else {
        if (covers && covers.length > 0) {
          setDisplayCovers(covers);
        }
        setLoading(false);
      }
    }
  }, [bookInfo, fetchCovers, prevBookId, setPrevBookId]);

  const selectBookCover = (selectedBook) => {
    onSelectCover(selectedBook);
  };

  return (
    <>
      <div className="flex flex-col p-2">
        {displayCovers.length ? (
          <h5 className="font-bold">
            {view === "requiredCover"
              ? "Kindly select a book cover to continue with the download."
              : "Select cover to change"}
          </h5>
        ) : (
          ""
        )}
        <div className="overflow-auto h-[85vh] sm:h-[60vh]">
          {loading ? <Loading /> : ""}
          
            {displayCovers.length ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2">
                {covers.map((book) => {
                  return (
                    <a
                      className="flex flex-col aspect-[2/3] h-[250px] md:h-[225px]  justify-between w-full border border-e-zinc-500 rounded shadow hover:shadow-md transition duration-200"
                      key={book.cover_i}
                      onClick={() => {
                        selectBookCover(book);
                      }}
                    >
                      <div className="rounded overflow-hidden">
                        <img
                          alt="Book Cover"
                          src={book.imgUrl}
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop in some browsers
                            e.target.src =
                              "https://dummyimage.com/130x200?text=No+Image";
                          }}
                          className="w-full h-full object-cover transform transition duration-200 hover:scale-105"
                        />
                      </div>
                    </a>
                  );
                })}
          </div>
            ) :  (
              view === "requiredCover" ? <div>
                
               <div className="mb-2"><button className="bg-gray-200 px-3 py-1  rounded" onClick={()=> onCancelCover()}>Back</button> </div>
               Sorry we couldn't find any covers on Open Library so unfortunately this book can't be downloaded. 
                </div>: "We couldn't find any covers on Open Library."
            )}
        </div> 
      </div>
    </>
  );
};

export default BookCovers;
