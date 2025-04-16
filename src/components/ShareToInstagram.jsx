import React, { useRef } from "react";  
const ShareToInstagram = ({ bookData }) => {
    // const [bgColor, setBgColor] = useState('');
    // const [imgURL, setImgURL] = useState('');
    const shareRef = useRef(null);
    const { googleBookData, userBookData } = bookData;
    // const [localCoverUrl, setLocalCoverUrl] = useState(null);
    console.log('googleBookData',googleBookData)
 
   
  
    
    return (
      <div className="flex flex-col items-center"> 
        <div
          ref={shareRef}
          style={{
            width: 1080,
            height: 1920,  
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            background: `linear-gradient(135deg, ${`#cccccc`}, #ffffff)`
          }}
          className="flex flex-col justify-center items-center text-black p-8 rounded shadow-lg"
        >
          <div className="flex flex-row items-center w-full">
          {googleBookData?.volumeInfo && (
          <img  
            src={
                'https://covers.openlibrary.org/b/id/12738706-M.jpg'
              }
            alt={googleBookData.volumeInfo?.title || "Book Cover"}
            className="w-1/3 h-auto object-contain"
            onError={(e) => {
              // Optional: Handle image loading errors, e.g., set a fallback image
              e.target.onerror = null; // Prevent infinite loop 
            }}
          />
        )}
        {!googleBookData?.volumeInfo && (
          <div className="w-1/3 h-auto flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">No Book Info</p>
          </div>
        )}
            <div className="ml-8 flex-1">
              <h1 className="text-4xl font-bold">{googleBookData.volumeInfo.title}</h1>
              <h2 className="text-2xl mt-2">by  {googleBookData.volumeInfo.authors ? googleBookData.volumeInfo.authors.join(", "): "Unknown"}</h2>
            </div>
          </div>
          <p>{userBookData.liked ? "Liked":"Nope"}</p>
          <p className="mt-12 text-xl text-center max-w-lg">
            
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam corporis asperiores mollitia ullam, quas atque illum. Placeat maxime odit at beatae facere, architecto blanditiis in similique laudantium, corporis sapiente dolorum.
            </p>
        </div>
      </div>
    );
  };

//   const getAverageColor = async (bookInfo) => {
//     const img = document.createElement('img');
//     img.crossOrigin = 'Anonymous';
//     img.src = getOpenLibraryCoverUrlFromGoogleBook(bookInfo);
//     // img.src = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;

  
//     await new Promise(resolve => {
//       img.onload = resolve;
//     });
  
//     const canvas = document.createElement('canvas');
//     canvas.width = img.width;
//     canvas.height = img.height;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return '#000000';
//     ctx.drawImage(img, 0, 0);
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     const data = imageData.data;
//     let r = 0, g = 0, b = 0;
//     const length = data.length / 4;
  
//     for (let i = 0; i < data.length; i += 4) {
//       r += data[i];
//       g += data[i + 1];
//       b += data[i + 2];
//     }
  
//     r = Math.floor(r / length);
//     g = Math.floor(g / length);
//     b = Math.floor(b / length);
  
//     return `rgb(${r}, ${g}, ${b})`;
//   };
  
//   const getOpenLibraryCoverUrlFromGoogleBook = (book) => {
//     const identifiers = book.volumeInfo.industryIdentifiers;
//     const isbn13 = identifiers?.find((id) => id.type === 'ISBN_13');
//     const isbn10 = identifiers?.find((id) => id.type === 'ISBN_10');
  
//     const isbn = isbn13?.identifier || isbn10?.identifier;
//     if (!isbn) return null;
  
//     return `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`;
//   };
  

  export default ShareToInstagram;
  