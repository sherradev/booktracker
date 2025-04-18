import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Modal from "./Modal";
import FormatDate from "../utils/time-formatter";
import {
  faUser,
  faStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "../components/Loading";

const ShareBook = ({ googleBookData, userBookData, user }) => {
  const shareRef = useRef(null);
  const fallback = "https://dummyimage.com/275x400?text=No+Image";
  const [imgURL, setImgURL] = useState(fallback);
  // const [isImgReady, setIsImgReady] = useState(false);
  const [showEditionsModal, setShowEditionsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editionList, setEditionList] = useState([]);
  const { volumeInfo } = googleBookData;
  // console.log('volumeInfo',volumeInfo) 

  const searchImgFronOpenLibrary = async () => {
    const author = volumeInfo.authors.length
      ? encodeURIComponent(volumeInfo.authors[0])
      : "";
    const authorQuery = author ? `&author=${author}` : "";

    let apiUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      volumeInfo.title
    )}${authorQuery}&lang=en&limit=5`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.docs.length) {
      const workId = data.docs[0].key.replace("/works/", "");
      let editionURL = `https://openlibrary.org/works/${workId}/editions.json`;
      const editionRes = await fetch(editionURL);
      const editionData = await editionRes.json();
      if (editionData) {
        const finalData = editionData.entries
          .map((bookItem) => ({
            coverId: bookItem.covers?.[0] ?? null, // Safe access with optional chaining
            imgUrl: `https://covers.openlibrary.org/b/id/${bookItem.covers?.[0]}-L.jpg`,
          }))
          .filter(
            (item) =>
              item.coverId !== null && String(Math.abs(item.coverId)).length > 1
          ); 
        return finalData;
      } else {
        return [];
      }
    } else {
      return [];
    }
  };

  const handleShareBtn = async () => {
    if (shareRef.current) {
      try {
        const entries = await searchImgFronOpenLibrary();
        setEditionList(entries);
        setShowEditionsModal(true);
      } catch (error) {
        console.error("Error capturing or downloading image:", error);
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

    return `rgb(${r}, ${g}, ${b})`;
  };

  const setupGradient = async (ref, bookImgUrl) => {
    if (ref.current && bookImgUrl) {
      try {
        const averageColor = await getAverageColor(bookImgUrl);
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
        ref.current.style.backgroundImage = gradient;
      } catch (error) {
        console.error("Gradient fallback triggered:", error);
        ref.current.style.backgroundImage = `linear-gradient(to top, #cccccc, rgba(255,255,255,0.8))`;
      }
    }
  };

  const downloadBook = async (book) => {
    setLoading(true);
    setImgURL(book.imgUrl);
    try {
      await setupGradient(shareRef, book.imgUrl); // Await gradient application

      if (shareRef.current) {
        const canvas = await html2canvas(shareRef.current, {
          letterRendering: 1,
          useCORS: true,
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
    } finally {
      setLoading(false);
    }
  };

  const rating = parseFloat(
    userBookData && userBookData.rating ? userBookData.rating : "0"
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
        style={{ fontSize: "1.2em", color: "#FFD500" }}
      />
    );
  }

  // const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
  // for (let i = 0; i < emptyStars; i++) {
  //   stars.push(
  //     <FontAwesomeIcon
  //       key={`empty-${i}`}
  //       icon={faStar}
  //       style={{ fontSize: "1.2em", color: "#D1D5DB" }} // Tailwind gray-300
  //     />
  //   );
  // }

  return (
    <div>
      {volumeInfo.authors && volumeInfo.authors.length ? (
        <button
          onClick={handleShareBtn}
          className={`w-full py-2  text-white rounded hover:bg-green-800 bg-green-600`}
        >
          Share
        </button>
      ) : (
        ""
      )}

      {showEditionsModal ? (
        <Modal>
          <div className="flex flex-col">
            {editionList.length ? (
              <h5>Select image to download</h5>
            ) : (
              <h5>No covers found in Open Library</h5>
            )}
            <div className="overflow-auto h-96">
              {loading ? <Loading /> : ""}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {editionList.length ? (
                  <>
                    {editionList.map((book) => {
                      return (
                        <a
                          className="flex flex-col justify-between w-full aspect-[2/3] h-[180px] border border-e-zinc-500 rounded shadow hover:shadow-md transition duration-200"
                          key={book.coverId}
                          onClick={() => {
                            downloadBook(book);
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
            <div className="flex mt-2">
              <button
                onClick={() => setShowEditionsModal(false)}
                className="ml-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : (
        ""
      )}

      <div className="flex flex-col items-center">
        {/* SHAREABLE LAYOUT - LIMITED TAILWIND CLASSES USAGE*/}
        <div
          ref={shareRef}
          id="share-el"
          className=""
          style={{
            width: 1080,
            height: 1920,
            position: "absolute",
            backgroundColor: "pink",
            overflow: "hidden",
            top: "-9999px",
            left: "-9999px",
            // top: "61px",
            // left: "0"
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
                    src={imgURL}
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
                      {volumeInfo.title}
                    </h1>
                    <div
                      style={{
                        fontSize: "1.5em",
                        color: "#686868",
                      }}
                    >
                      By{" "}
                      {volumeInfo.authors
                        ? volumeInfo.authors.join(", ")
                        : "Unknown"}
                    </div>
                    <div style={{ marginTop: "20px" }}>{stars}</div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.6em",
                      color: "#686868",
                      marginBottom: "15px",
                    }}
                  >
                    {userBookData && userBookData.readEnd
                      ? `Read on ${FormatDate(
                          userBookData.readEnd,
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
                {userBookData && userBookData.review ? (
                  <span style={{ color: "#686868" }}>
                    {userBookData.review}
                  </span>
                ) : (
                  <span style={{ color: "#686868" }}>No review to display</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareBook;
