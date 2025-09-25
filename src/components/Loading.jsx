import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function Loading() {
  return (
  <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center  z-50">
               <FontAwesomeIcon icon={faSpinner} spin={true} size="2xl" color={'#2b7fff'}/>
  </div>
  );
 }