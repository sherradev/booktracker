const Modal = ({children, container = 'h-auto w-80 p-6' }) =>{
  return (
      <>
      <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className={`bg-white  rounded shadow-lg z-50 ${container}`}>
            {children}
          </div>
        </div>
      </>
  );
}

export default Modal;