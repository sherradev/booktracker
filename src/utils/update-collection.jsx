import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

const writeToFirestore = async ({ pathSegments = [], data = {}, merge = true }) => {
  try {
    const ref = doc(db, ...pathSegments);
    await setDoc(ref, data, { merge });
    console.log(`Document written to ${pathSegments.join("/")} successfully.`);
  } catch (error) {
    console.error("Firestore write error:", error);
    throw error;
  }
};
export default writeToFirestore;