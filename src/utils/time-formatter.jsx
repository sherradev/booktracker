export default function FormatDate(date, type){
    if (!date) return ''; 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    if (type == "dd-mm-yyyy" || !type) return `${day}-${month}-${year}`; 
    if (type == "mm-dd-yyyy") return `${month}-${day}-${year}`; 
    if (type == "yyyy-mm-dd") return `${year}-${month}-${day}`; 
}