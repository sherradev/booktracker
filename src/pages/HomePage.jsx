import Recommendations from "../components/Recommendations"; 

const HomePage = () => {  

  return ( 
    <div className="flex flex-col max-w-screen-xl mx-auto px-2 sm:px-6 lg:px-8 mb-5 w-full">
         <div className="text-center text-gray-300 my-4">
          Track and share your reading journey.
         </div>
            <Recommendations/> 
    </div>
  );
};

export default HomePage;

 