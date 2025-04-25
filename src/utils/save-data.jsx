import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
const saveUserBookData = async ({
  bookData, updatedUserBookData, user, onSuccess
}) => {
  const bookId = `${bookData.googleBookData.id}`;
  const getDataToSave = () => {
    const {
      authors = [],
      categories = [],
      imageLinks = null,
      industryIdentifiers = [],
      infoLink = "",
      maturityRating = "",
      pageCount = 0,
      publishedDate = "",
      title = "",
    } = bookData.googleBookData.volumeInfo || {}; // Added null check
 
    const baseUserData = {
      ...bookData?.userBookData, // Added null check
      ...updatedUserBookData,
      bookId: bookId,
      inDB: true,
      userId: user?.uid,  
      displayName: user?.displayName
    };

    if (!bookData?.userBookData?.inDB || !bookData?.googleBookData) {
      // Added null checks
      // First time saving or apiBookData isn't saved
      return {
        googleVolumeData: {
          authors,
          categories,
          imageLinks,
          industryIdentifiers,
          infoLink,
          maturityRating,
          pageCount,
          publishedDate,
          title,
        },
        userBookData: baseUserData,
      };
    }

    return { userBookData: { ...updatedUserBookData } };
  };

  if (!user?.uid) {
    console.warn("User UID not available, skipping save.");
    return;
  }

  try {
    const dataToSave = getDataToSave(bookData);

   //console.log(`dataToSave`, dataToSave);
    await setDoc(doc(db, "users", user.uid, "books", bookId), dataToSave, {
      merge: true,
    });
    if (onSuccess) {
      onSuccess();
      }
       
    console.log(`Book data saved  successfully.`);
   
  } catch (error) {
    console.error("Error saving book data to Firestore:", error);
     
  }
};

export default saveUserBookData;
