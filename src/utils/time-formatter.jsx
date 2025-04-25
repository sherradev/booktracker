export default function FormatDate(date, type) {
  if (!date) return '';
  let jsDate;

  if (date.seconds !== undefined && date.nanoseconds !== undefined) {
    jsDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  } else if (date instanceof Date) {
    jsDate = date;
  } else if (typeof date === "string") {
    //handle "2023-09-26" or "2023"
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      jsDate = new Date(date);
    }
    else if(date.match(/^\d{4}$/)){
        jsDate = new Date(date + "-01-01"); // Treat "2023" as Jan 1st, 2023
    }
     else {
      jsDate = new Date(date);
    }
  } else {
    return '';
  }

  // Check if jsDate is a valid date.
  if (isNaN(jsDate.getTime())) {
    return '';
  }

  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const day = String(jsDate.getDate()).padStart(2, '0');
  const monthName = jsDate.toLocaleString('en-US', { month: 'short' });

  if (type == "dd-mm-yyyy" || !type) return `${day}-${month}-${year}`;
  if (type == "mm-dd-yyyy") return `${month}-${day}-${year}`;
  if (type == "yyyy-mm-dd") return `${year}-${month}-${day}`;
  if (type == "mmm d, yyyy") return `${monthName} ${day}, ${year}`;
    if (type == "yyyy") return `${year}`;
}
