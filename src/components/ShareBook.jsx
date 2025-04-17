import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Modal from "./Modal";

const ShareBook = ({ googleBookData, userBookData }) => {
  const shareRef = useRef(null);
  const fallback = "https://dummyimage.com/275x400?text=No+Image";
  const [imgURL, setImgURL] = useState(fallback);
  const [isImgReady, setIsImgReady] = useState(false);
  const [showEditionsModal, setShowEditionsModal] = useState(false);
  const [editionList, setEditionList] = useState([]);
  const { volumeInfo } = googleBookData;
  // console.log('volumeInfo',volumeInfo)
  // console.log('userBookData',userBookData)

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
          .filter((item) => item.coverId !== null);
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
        setIsImgReady(true);
      } catch (error) {
        console.error("Gradient fallback triggered:", error);
        ref.current.style.backgroundImage = `linear-gradient(to top, #cccccc, rgba(255,255,255,0.8))`;
      }
    }
  };

  const downloadBook = async (book) => {
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
        link.download = "promo.png";
        link.href = myImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error during download process:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleShareBtn}
        className={`w-full py-2  text-black rounded hover:bg-gray-400 ${
          isImgReady ? "bg-gray-300" : "bg-red-500"
        }`}
      >
        Share
      </button>

      {showEditionsModal ? (
        <Modal>
          <div className="flex flex-col">
          {editionList.length ? (
                <h5>Select image to download</h5>
              ) : (
                <h5>No covers found in Open Library</h5>
              )}
            <div className="overflow-auto h-96">
            

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
                              src={book.imgUrl}
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

      {/* SHARABLE LAYOUT */}
      <div
        style={{
          display: "flex", //none
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          ref={shareRef}
          id="share-el"
          style={{
            width: 1080,
            height: 1920,
            position: "absolute",
            backgroundColor: "pink",
            // top: "61px",
            // left: "0",
            top: "-9999px",
            left: "-9999px",
            overflow: "hidden",
            fontFamily: "sans-serif",
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
              height: 800,
              backgroundColor: "#F6F6F6",
              borderRadius: "1rem",
              boxSizing: "border-box",
              boxShadow: "0 0 30px rgba(0,0,0,0.2)",
              zIndex: 1,
              padding: 40,
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
                    width: "275px",
                    backgroundColor: "#fff",
                    boxShadow: "0 0 30px rgba(0,0,0,0.2)",
                    padding: "10px",
                  }}
                >
                  <img src={imgURL} alt="Book cover" />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    paddingLeft: "15px",
                  }}
                >
                  <div>
                    <div>User</div>
                    <div>{volumeInfo.title}</div>
                    <div>
                     By {volumeInfo.authors ? volumeInfo.authors.join(", "): "Unknown"}
                    </div>
                    <div>Star</div>
                  </div>
                  <div>Read date</div>
                </div>
              </div>
              <h1>Review</h1>
              <div>Row 2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareBook;
