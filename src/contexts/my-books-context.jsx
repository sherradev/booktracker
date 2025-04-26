import { createContext, useContext, useState } from "react";

const MyBooksContext = createContext({
  books: [],
  setBooks: () => {},
});

const MyBooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);

  return (
    <MyBooksContext.Provider value={{ books, setBooks }}>
      {children}
    </MyBooksContext.Provider>
  );
};

const useMyBooks = () => {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error("useMyBooks must be used within a MyBooksContext");
  }
  return context;
};

export { MyBooksProvider, useMyBooks };
