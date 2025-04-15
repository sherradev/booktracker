import Recommendations from "../components/Recommendations"; 

const HomePage = () => {  

  return ( 
    <div className="flex flex-col max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        
        {/* <div>Currently Reading</div> */}
        <div>
            <Recommendations/>
        </div>
    </div>
  );
};

export default HomePage;

 