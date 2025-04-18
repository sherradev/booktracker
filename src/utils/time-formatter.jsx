export default function FormatDate(date, type) { 
    if (!date) return ''; 
    let jsDate;
  
    if (date.seconds !== undefined && date.nanoseconds !== undefined) {
      jsDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
    } else if (date instanceof Date) { 
      jsDate = date; 
    } else if (typeof date =="string") {  
      jsDate = new Date(date);
    } else {  
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
  }