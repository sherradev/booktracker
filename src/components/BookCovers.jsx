import { useBookCovers } from "../contexts/covers-context"; 

const BookCovers = ({ onSelectCover }) => { 
  const { covers } = useBookCovers();  
   
  const selectBookCover = (selectedBook) =>{ 
    onSelectCover(selectedBook);
  }

  return (
    <>
      <div className="flex flex-col p-2">
        {covers.length ? (
          <h5 className="font-bold">Select image to change</h5>
        ) : (
          <h5>No covers found in Open Library</h5>
        )}
        <div className="overflow-auto h-[600px]">
          {/* {loading ? <Loading /> : ""} */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2">
            {covers.length ? (
              <>
                {covers.map((book) => {
                  return (
                    <a
                      className="flex flex-col aspect-[2/3] h-[250px] md:h-[250px] lg:h-[320px] justify-between w-full border border-e-zinc-500 rounded shadow hover:shadow-md transition duration-200"
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
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        {/* <div className="flex mt-2">
          <button className="ml-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div> */}
      </div>
    </>
  );
};

export default BookCovers;
