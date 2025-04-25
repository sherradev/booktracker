const getCovers = async (volumeInfo) => {
  try {
    const author = volumeInfo.authors.length
      ? encodeURIComponent(volumeInfo.authors[0])
      : "";
    let apiUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      volumeInfo.title
    )}&author=${author}&lang=en&limit=5`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.docs.length) {
      const workId = data.docs[0].key.replace("/works/", "");
      let editionURL = `https://openlibrary.org/works/${workId}/editions.json`;
      const editionRes = await fetch(editionURL);
      const editionData = await editionRes.json(); 
      if (editionData) {
        // console.log('1', editionData.entries)
        const finalData = editionData.entries
          .filter((bookItem) => {
            if (
              !bookItem.covers?.length ||
              !bookItem.type?.key === "/type/edition"
            ) {
              return false;
            }
            return !( 
              bookItem.physical_format === "audio cassette" ||
              bookItem.physical_format === "Audio CD"
            );
          })
          .map((bookItem) => ({
            cover_i: bookItem.covers[0],
            imgUrl: `https://covers.openlibrary.org/b/id/${bookItem.covers[0]}-M.jpg`,
          }))
          .filter(
            (item) => (item.cover_i && String(Math.abs(item.cover_i)).length > 1)
          );
        // console.log('2', finalData);
        return finalData;
      }
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};
export default getCovers;
