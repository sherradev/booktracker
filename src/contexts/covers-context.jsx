 import React, {createContext, useContext, useState } from "react";

 const BookCoversContext = createContext({
    covers: [],
    setCovers: () => {}
 });

 const BookCoversProvider = ({children}) =>{
    const [covers, setCovers] = useState([]);

    return (
        <BookCoversContext.Provider value={{covers, setCovers}}>
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
