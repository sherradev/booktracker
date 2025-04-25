// api/openLibrary.js
const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';

export const searchBooks = async (query, limit=20, subject) => {
  try {
    const q = query ? `&q=${encodeURIComponent(query)}`: '';
    const sub = subject ? `&subject=${encodeURIComponent(subject)}`: ''; 
    const response = await fetch(`${OPEN_LIBRARY_SEARCH_URL}?limit=${limit}${q}${sub}&sort=new&language=eng&fields=key,title,author_name,cover_i,cover_edition_key,first_publish_year`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const finalData = data.docs.filter(item=>item.cover_i); //return only with cover picture
    return finalData;
  } catch (error) {
    console.error('Error fetching books from Open Library:', error);
    return { docs: [] }; // Return an empty array in case of error
  }
};