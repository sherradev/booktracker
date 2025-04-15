import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase-config";

const GetDataFromFirestore = ({ collectionName, queryConstraints }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dataCollection = collection(db, collectionName);
        const q = query(dataCollection, ...(queryConstraints || []));
        const querySnapshot = await getDocs(q);
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push(doc.data());
        });
        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching data from ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, queryConstraints]);

  return { data, loading, error };
};

export default GetDataFromFirestore;