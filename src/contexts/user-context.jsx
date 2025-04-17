// In UserProvider
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) { 
        setUser({
          uid: firebaseUser.uid, 
          displayName: firebaseUser.displayName ? firebaseUser.displayName.split(" ")[0] : "Guest", 
          photoURL: firebaseUser.photoURL ? firebaseUser.photoURL : "https://dummyimage.com/96x96", 
        });
      } else {
        setUser(null);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []); 

  // Memoize both user and checking
  const contextValue = useMemo(() => ({ user, checking }), [user, checking]);

  return (
    <UserContext.Provider value={contextValue}>
      {!checking && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
