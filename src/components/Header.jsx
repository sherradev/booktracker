import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => setShowSearch((prev) => !prev);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // optional: clear input
    }
  };

  return (
    <header className="w-full py-4 bg-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-gray-800">Book Tracker</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleSearch}>
              <FontAwesomeIcon
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
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full outline-none"
              />
            </div>
          </div>
        )}

        {/* Desktop Icons and Search */}
        <div className="hidden md:flex items-center gap-4 ml-auto relative">
          <Link to="/profile">
            <FontAwesomeIcon
              icon={faUser}
              size="lg"
              className="cursor-pointer"
            />
          </Link>

          {!showSearch && (
            <button onClick={toggleSearch}>
              <FontAwesomeIcon icon={faSearch} size="lg" />
            </button>
          )}

          {showSearch && (
            <div className="flex items-center border rounded-lg px-3 py-1">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
              <input
                type="text"
                value={searchTerm}
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
