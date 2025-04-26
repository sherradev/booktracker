 import React, {createContext, useContext, useState } from "react";

 const BookCoversContext = createContext({
    covers: [],
    setCovers: () => {},
    prevBookId: null, 
    setPrevBookId: () => { }
 });

 const BookCoversProvider = ({children}) =>{
    const [covers, setCovers] = useState([]);
    const [prevBookId, setPrevBookId] = useState(0); 

    return (
        <BookCoversContext.Provider value={{covers, setCovers, prevBookId, setPrevBookId }}>
                {children}
        </BookCoversContext.Provider>
    )
 };

 const useBookCovers = ()=>{
    const context = useContext(BookCoversContext);
    if (!context){
        throw new Error('useBookCovers must be used within a BookCoversProvider');
    }
    return context;
 }

 export {BookCoversProvider, useBookCovers};
