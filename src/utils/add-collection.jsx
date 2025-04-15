import React from 'react';
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../config/firebase-config";

const AddDataToFirestore = ({ collectionName, data, onSuccess, onError }) => {
  React.useEffect(() => {
    const addData = async () => {
      try {
        if (Array.isArray(data)) {
          for (const item of data) {
            const id = uuidv4();
            await setDoc(doc(db, collectionName, id), { ...item, id });
            console.log(`Document added to ${collectionName} successfully.`);
          }
        } else {
          const id = uuidv4();
          await setDoc(doc(db, collectionName, id), { ...data, id });
          console.log(`Document added to ${collectionName} successfully.`);
        }
        console.log(`Data added to ${collectionName} successfully.`);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error(`Error adding data to ${collectionName}:`, error);
        if (onError) {
          onError(error);
        }
      }
    };

    addData();
  }, [collectionName, data, onSuccess, onError]);

  return null; // This component doesn't render anything
};

export default AddDataToFirestore;