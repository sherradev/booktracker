import React, { useState, useEffect, useRef, useCallback } from "react";
// import { searchBooks } from "../api/open-library";
import BookCovers from "./BookCovers";
import BookReviewForm from "./BookReviewForm";
import Modal from "./Modal";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faSearch,
  faChevronLeft,
  faUser,
  faStarHalfAlt,
  faStar,
  faTimes,
  faHeart
} from "@fortawesome/free-solid-svg-icons";
import saveUserBookData from "../utils/save-data";
import { useUser } from "../contexts/user-context";
import FormatDate from "../utils/time-formatter";
import html2canvas from "html2canvas";
import { searchGoogleBooks } from "../api/search-google";
import getCovers from "../utils/get-covers";
import { useBookCovers } from "../contexts/covers-context";
import ConfirmationModal from "./ConfirmationModal";

const DEBOUNCE_DELAY = 1000;
const BookModal = ({
  isOpen,
  onClose,
  onUpdateData,
  view,
  googleBookData,
  userBookData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); 
  const [selectedBook, setSelectedBook] = useState(googleBookData ? googleBookData : null); 
  const [userData, setUserData] = useState(userBookData ? userBookData : {
    bookId: "",
    read: false,
    liked: false,
    toRead: false,
    inDB: false,
    rating: "",
    review: "",
    readStart: "",
    readEnd: "",
    bookCover: "",
    userId: "",
    displayName: "",
  });
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentView, setCurrentView] = useState(view ? view : "search"); // 'search', 'review'/'log', 'covers'/'pageCover'/'requiredCover'
  const [loading, setLoading] = useState(false);
  const [starDisplay, setStarDisplay] = useState([]);
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const { user } = useUser();
  const shareRef = useRef(null);
  const {setCovers} = useBookCovers();
  const [modalCover, setModalCover] = useState(userBookData ? userBookData.bookCover : "");

  useEffect(() => {
    if (isOpen && searchInputRef.current) { 
      searchInputRef.current.focus();
      setSearchQuery("");
      setSuggestions([]); 
      setSelectedBook(null);
    }
    return () => { 
      clearTimeout(debounceTimeout.current);
    };
  }, [isOpen]);

  useEffect(() => {
    const rating = parseFloat(
      userData && userData.rating ? userData.rating : "0"
    );
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          style={{ fontSize: "1.4em", color: "#FFD500" }}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key="half"
          icon={faStarHalfAlt}
          style={{ fontSize: "1.4em", color: "#FFD500" }}
        />
      );
    }

    setStarDisplay(stars);  
  }, [userData]);

  const clearSearch = () => {
    searchInputRef.current.focus();
    setSearchQuery("");
    setSuggestions([]); 
    setSelectedBook(null);
  }

  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    // Clear the previous timeout
    clearTimeout(debounceTimeout.current);

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      debouncedSearch(query);
    }, DEBOUNCE_DELAY);

    // Clear suggestions immediately on input change
    if (!query.trim()) {
      setSuggestions([]);
    }
  };

  // Debounce function
  const debouncedSearch = useCallback(
    async (query) => {
      if (query.trim() && isOpen) {
        setLoading(true);
        const data = await searchGoogleBooks(query);
        setSuggestions(data);
        setLoading(false);  
        if (searchInputRef.current){
          searchInputRef.current.blur();
        }
      } else {
        setSuggestions([]);
        setLoading(false);
      }
    },
    [isOpen]
  );

  const handleSuggestionClick = async (book) => {
    setSelectedBook(book);
    setLoading(true);
    const covers = await getCovers(book.volumeInfo);
    if (covers.length){
      setModalCover(covers[0].cover_i)
    }
    setCovers(covers);
    setLoading(false);
    setCurrentView("review");
  };

  const handleChangeCover = (bookCover) => {
    try { 
      if (bookCover){
        setModalCover(bookCover.cover_i);
        const modifiedBookData = {
          ...userBookData,
          bookCover: bookCover.cover_i
        }
        setLoading(true);
        if (onUpdateData) onUpdateData(modifiedBookData);
        saveUserBookData({
          bookData: { googleBookData: selectedBook },
          userBookData,
          updatedUserBookData: modifiedBookData,
          user
        });
  
        setLoading(false); 
      } 

      if (currentView === "covers" || currentView === "requiredCover"){ 
        setCurrentView("review");
      } else if (currentView === "pageCover"){
        onClose();
      }
      
    }catch(error){
      console.error("Can't change cover:", error);
    }

  };

  const handleSearchSubmit = async (query) => {
    if (query.trim()) {
      setLoading(true);
      const data = await searchGoogleBooks(query);
      setSuggestions(data);
      setLoading(false); 
      if (searchInputRef.current){
        searchInputRef.current.blur();
      }
    }
  };

  const onCloseModal = () => {
    setCurrentView("search");
    onClose();
  };

  const handleReviewSubmit = async (modifiedBookData, toDownload, showConfirmationModal, updateState) => {  
    if (showConfirmationModal){ 
      setShowConfirm(true);  
    } else{ 
      if (selectedBook) {
        try {
          setLoading(true); 
          const finalUserData = {
            ...userData,
            ...modifiedBookData
          }
          setUserData(finalUserData);
          if (onUpdateData || updateState) onUpdateData(modifiedBookData);
          saveUserBookData({
            bookData: { googleBookData: selectedBook },
            userBookData: finalUserData,
            updatedUserBookData: modifiedBookData,
            user
          });
  
          if (toDownload) {
            const url = modalCover
            ? `https://covers.openlibrary.org/b/id/${modalCover}-M.jpg`
            : "https://dummyimage.com/275x400?text=No+Image";
  
            await downloadBook(url);
            setLoading(false);
            setSelectedBook(null);
            onClose();
          }else{
            setLoading(false);
            setSelectedBook(null);
            onClose();
          }
        } catch (error) {
          setLoading(false);
          console.error("Error saving review:", error);
        }
      }
    } 
  };

  const handleYesConfirmationModal = async () => {
    setShowConfirm(false);
    await handleReviewSubmit({  
      liked: false,  
      rating: "", 
      review: "", 
      readEnd: "", 
    }, false, false, true);
  }

  const setupGradient = async (imgURL) => {
    if (shareRef && shareRef.current && imgURL) {
      try {
        const averageColor = await getAverageColor(imgURL);
        const [r, g, b] = averageColor.match(/\d+/g).map(Number);

        // const darker = `rgb(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)})`;
        // const lighter = `rgb(${Math.min(r + 25, 255)}, ${Math.min(g + 25, 255)}, ${Math.min(b + 25, 255)})`;
        const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(
          g - 40,
          0
        )}, ${Math.max(b - 40, 0)})`;
        const lighter = `rgb(${Math.min(r + 50, 255)}, ${Math.min(
          g + 50,
          255
        )}, ${Math.min(b + 50, 255)})`;

        const gradient = `linear-gradient(to top, ${darker}, ${averageColor}, ${lighter})`;

        shareRef.current.style.backgroundImage = gradient;
      } catch (error) {
        console.error("Gradient fallback triggered:", error);
        if (shareRef.current) {
          shareRef.current.style.backgroundImage = `linear-gradient(to top, #cccccc, rgba(255,255,255,0.8))`;
        }
      }
    }
  };

  const getAverageColor = async (url) => {
    const img = document.createElement("img");
    img.crossOrigin = "Anonymous";
    img.src = url;

    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // prevent hang if image fails
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let r = 0,
      g = 0,
      b = 0;
    const length = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    r = Math.floor(r / length);
    g = Math.floor(g / length);
    b = Math.floor(b / length);

    // console.log(`color:(${r}, ${g}, ${b})`)
    return `rgb(${r}, ${g}, ${b})`;
  };

  const downloadBook = async (imgURL) => {
    // setImgURL(book.imgUrl);
    try {
       await setupGradient(imgURL);
      if (shareRef.current) {
        const canvas = await html2canvas(shareRef.current, {
          useCORS: true,
          logging: false
        });
        const myImage = canvas.toDataURL();
        const link = document.createElement("a");
        link.download = "bookshelf_review.png";
        link.href = myImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error during download process:", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // w-full sm:w-3/4 lg:w-1/2 h-full sm:h-[700px] overflow-y-hidden
    <Modal container=" h-auto s-secondary text-gray-800 ">
      {loading ? <Loading /> : ""} 
      { showConfirm ?  <ConfirmationModal text={`Warning: If you uncheck Finished reading, 
      any changes on this book will be lost. Only the 'started reading' date will remain. Do you want to continue?`}
      handleNo={()=> setShowConfirm(false)}  handleYes={handleYesConfirmationModal} /> : ""}


      {/* Modal header start */}
      <div className="bg-white w-full flex border-b-[0.25px] p-2 rounded-t-lg">
        {/* Modal header left icon */}
        {currentView === "review" || currentView === "covers" ? (
          <button
            className="mr-2"
            onClick={() =>
              setCurrentView(currentView === "covers" ? view : "search")
            }
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
          </button>
        ) : (
          ""
        )}

        {/* Modal header label */}
        <h2 className="text-lg font-semibold ms-2">
          {currentView === "search" ? "Add book..." : ""}
          {currentView === "review" || currentView === "reviewNoDownload" || currentView === "log" ? "I read..." : ""}
          {currentView === "covers" || currentView === "requiredCover" || currentView === "pageCover" ? "Change Book Cover" : ""}
        </h2>

        {/* Modal header right icon */}
        <a onClick={onCloseModal} className="flex justify-center items-center ml-auto me-1">
          <FontAwesomeIcon
            icon={faClose}
            size="lg"
            className="cursor-pointer"
          />
        </a>
      </div>
      {/* Modal header end */}

      {/* Modal content start */}
      <div className="bg-white">
        {/* --- SEARCH VIEW --- */}
        {currentView === "search" && (
          <div className="max-h-screen p-3">
            <div className="flex items-center w-full border rounded-lg px-3 py-2">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              <input
                type="text"
                value={searchQuery}
                ref={searchInputRef}
                onChange={handleSearchInputChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearchSubmit(searchQuery)
                }
                placeholder="Search..."
                className="w-full outline-none"
              />
              {searchQuery ?  <button onClick={clearSearch} className="ml-2">
                              <FontAwesomeIcon icon={faTimes} />
                            </button> :''}
               
            </div>
            <div className="w-full"> 
              {suggestions.length > 0 ? (
                <ul className=" border rounded-lg mt-1 shadow-md overflow-auto max-h-[50vh]">
                  {suggestions.map((book) => (
                    <li
                      key={book.id}
                      onClick={() => handleSuggestionClick(book)}
                      className="h-full p-2 hover:bg-rose-400 hover:rounded-lg hover:cursor-pointer"
                    >
                      <span>{book.volumeInfo.title}</span>
                      {book.volumeInfo && book.volumeInfo.publishedDate
                        ? ` (${FormatDate(
                            book.volumeInfo.publishedDate,
                            "yyyy"
                          )})`
                        : ""}{" "}
                      <small className="text-gray-600">
                        by{" "}
                        {book.volumeInfo &&
                        book.volumeInfo.authors &&
                        book.volumeInfo.authors.length
                          ? book.volumeInfo.authors.join(", ")
                          : "Unknown"}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : <div className="min-h-96 justify-center h-full flex items-center"><div className="text-gray-500">Start searching</div></div>}
              
            </div>
          </div>
        )}

        {/* --- COVERS VIEW --- */}
        {(currentView === "covers" || currentView === "requiredCover" || currentView === "pageCover") &&
          selectedBook && <BookCovers onSelectCover={handleChangeCover} bookInfo={selectedBook} view={currentView}  onCancelCover={()=>setCurrentView('reviewNoDownload')}/>}

        {/* --- REVIEW VIEW --- */}
        {(currentView === "review" || currentView === "reviewNoDownload" || currentView === "log" || currentView === "covers" || currentView === "requiredCover") &&
          selectedBook && (
            <div className={`${(currentView === "covers" || currentView === "requiredCover") ? 'hidden':'block'}`}>
            <BookReviewForm
              userBookData={userData}
              googleBookData={selectedBook}
              onSubmit={handleReviewSubmit}
              modalCover={modalCover}
              currentView={currentView}
              onChangeView={(view) => setCurrentView(view)}
            />
            </div>
          )}
      </div>

      
      {/* Modal content end */}
      {selectedBook && (
        <div className="flex flex-col items-center">
          {/* SHAREABLE LAYOUT - LIMITED TAILWIND CLASSES USAGE*/}
          <div
            ref={shareRef}
            id="share-el"
            className=""
            style={{
              position: "absolute",
              backgroundColor: "pink",
              overflow: "hidden",
              width: 1080,
              height: 1920,
              top: "-9999px",
              left: "-9999px",
              // top: "10px",
              // left: "400px",
              // width: 500,
              // height: 700,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: "auto",
                width: 800,
                height: 750,
                backgroundColor: "#F6F6F6",
                borderRadius: "1rem",
                boxSizing: "border-box",
                zIndex: 1,
                padding: 40,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div
                    style={{
                      // height: "370px",
                      minWidth: "250px",
                      maxWidth: "370px",
                      minHeight: "360px",
                      maxHeight: "370px",
                      backgroundColor: "#fff",
                      padding: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`${
                        modalCover
                          ? `https://covers.openlibrary.org/b/id/${modalCover}-M.jpg`
                          : "https://dummyimage.com/275x400?text=No+Image"
                      }`}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop in some browsers
                        e.target.src =
                          "https://dummyimage.com/275x400?text=No+Image";
                      }}
                      alt="Book cover"
                      style={{ minWidth: 230 }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      paddingLeft: "20px",
                    }}
                  >
                    <div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <FontAwesomeIcon
                            style={{ fontSize: "1.75em", color: "#bebebe" }}
                            icon={faUser}
                          />
                          <div
                            style={{
                              marginLeft: "10px",
                              position: "relative",
                              top: "-15px",
                              fontSize: "1.5em",
                              color: "#686868",
                            }}
                          >
                            {user.displayName.toLowerCase()}
                          </div>
                        </div>
                      </div>

                      <h1
                        style={{
                          fontSize: "2.5em",
                          fontWeight: "bold",
                          color: "#2C2C2C",
                          marginTop: "-10px",
                          marginBottom: "10px",
                          lineHeight: 1,
                        }}
                      >
                        {selectedBook.volumeInfo.title}
                      </h1>
                      <div
                        style={{
                          fontSize: "1.5em",
                          color: "#686868",
                        }}
                      >
                        By{" "}
                        {selectedBook.volumeInfo.authors ? (
                          <span>{`By ${selectedBook.volumeInfo.authors.join(
                            ", "
                          )}`}</span>
                        ) : (
                          "Unknown"
                        )}
                      </div>
                      <div style={{ marginTop: "20px", display: "flex" }}>
                        <span
                          style={{
                            marginRight: "10px",
                          }}
                        >
                          {starDisplay}{" "}
                        </span>

                        {userData.liked ? (
                          <span>
                            <FontAwesomeIcon
                              style={{
                                fontSize: "1.4em",
                                color: "#ff6467",
                              }}
                              icon={faHeart}
                            />
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "1.6em",
                        color: "#686868",
                        marginBottom: "15px",
                      }}
                    >
                      {userData.readEnd
                        ? `Read on ${FormatDate(
                            userData.readEnd,
                            "mmm d, yyyy"
                          )}`
                        : ""}
                    </div>
                  </div>
                </div>
                <h1
                  style={{
                    fontSize: "1.9em",
                    fontWeight: "bold",
                    color: "#2C2C2C",
                    marginTop: "10px",
                  }}
                >
                  Review
                </h1>
                <div
                  style={{
                    fontSize: "1.7em",
                    color: "#2C2C2C",
                    marginTop: "10px",
                    height: 220,
                    overflow: "hidden",
                  }}
                >
                  {userData.review ? (
                    <span style={{ color: "#686868" }}>{userData.review}</span>
                  ) : (
                    <span style={{ color: "#686868" }}>
                      No review to display
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookModal;
