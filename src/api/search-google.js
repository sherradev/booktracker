const API_KEY = import.meta.env.VITE_BOOKS_API_KEY; 
const SEARCH_URL = "https://www.googleapis.com/books/v1/volumes";

export const searchGoogleBooks = async (query, subject) => {
  try {
    const queryPart = query ? encodeURIComponent(query) : "";
    const subjectPart = subject ? `subject:${encodeURIComponent(subject)}` : "";
    const fullQuery =
      queryPart && subjectPart
        ? `${queryPart}+${subjectPart}`
        : queryPart || subjectPart || "all";

    const url = `${SEARCH_URL}?q=${fullQuery}&key=${API_KEY}&printType=books&orderBy=newest&maxResults=40`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching books from Google Books:", error);
    return { docs: [] }; // Return an empty array in case of error
  }
};
