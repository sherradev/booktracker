import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import BookModal from "./BookModal";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const mobileSearchInputRef = useRef(null); // Ref for the mobile input
  const desktopSearchInputRef = useRef(null); // Ref for the desktop input
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBookModal = () => setIsModalOpen(true);
  const closeBookModal = () => setIsModalOpen(false);

  const navigate = useNavigate();

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);  
  };
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // optional: clear input
      setShowSearch(false);
    }
  }; 

   useEffect(() => {
    if (showSearch) {
      if (window.innerWidth < 768 && mobileSearchInputRef.current) {
        mobileSearchInputRef.current.focus();
      } else if (window.innerWidth >= 768 && desktopSearchInputRef.current) {
        desktopSearchInputRef.current.focus();
      }
    }
  }, [showSearch]);

  return (
    <header className="w-full py-4 s-secondary text-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-white">Book Tracker</h1>
            </Link>
          </div>
          {isModalOpen ?  <BookModal isOpen={isModalOpen} onClose={closeBookModal} view="search" />:''} 
          
        {/* Mobile View */}
          <div className="flex items-center md:hidden">
            <a className="mr-2 " onClick={openBookModal}>
              <FontAwesomeIcon
                icon={faPlus}
                size="lg"
                className="cursor-pointer "
              />
            </a>
            <Link to="/profile" className="mr-2">
              <FontAwesomeIcon
                icon={faUser}
                size="lg"
                className="cursor-pointer"
              />
            </Link>
            <button onClick={toggleSearch}>
              <FontAwesomeIcon
              className=""
                icon={showSearch ? faTimes : faSearch}
                size="lg"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Box */}
        {showSearch && (
          <div className="w-full mt-4 md:hidden">
            <div className="flex items-center w-full border rounded-lg px-3 py-2">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              <input
                type="text"
                value={searchTerm}
                ref={mobileSearchInputRef} // Use the mobile ref
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full outline-none"
              />
            </div>
          </div>
        )}

        {/* Web Icons and Search */}
        <div className="hidden md:flex items-center gap-4 ml-auto relative">
        <a className="mr-1">
              <FontAwesomeIcon onClick={openBookModal}
                icon={faPlus}
                size="lg"
                className="cursor-pointer text-white hover:text-rose-400"
              />
            </a>
          <Link to="/profile">
            <FontAwesomeIcon
              icon={faUser}
              size="lg"
              className="cursor-pointer text-white hover:text-rose-400"
            />
          </Link>

          {!showSearch && (
            <button onClick={toggleSearch}>
              <FontAwesomeIcon icon={faSearch} size="lg" className="text-white hover:text-rose-400"/>
            </button>
          )}

          {showSearch && (
            <div className="flex items-center border rounded-lg px-3 py-1">
              <FontAwesomeIcon icon={faSearch} className="mr-2 text-white hover:text-rose-400" />
              <input
                type="text"
                value={searchTerm}
                ref={desktopSearchInputRef} // Use the desktop ref
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="px-3 py-1 rounded outline-none w-48"
              />
              <button onClick={toggleSearch} className="ml-2">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
