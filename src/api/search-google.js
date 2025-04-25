 
const SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchGoogleBooks = async (query, subject) => {
  try {
    const q = query ? `&q=${encodeURIComponent(query)}`: '';
    const sub = subject ? `subject=${encodeURIComponent(subject)}`: ''; 
    const response = await fetch(`${SEARCH_URL}?${q}${sub}&printType=books&orderBy=newest&maxResults=40`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); 
    return (data.items || []);;
  } catch (error) {
    console.error('Error fetching books from Google Books:', error);
    return { docs: [] }; // Return an empty array in case of error
  }
};