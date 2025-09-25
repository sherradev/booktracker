const Modal = ({children, container = 'w-80 p-6' }) =>{
  return (
      <>
      <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className={`rounded-2xl shadow-xl w-[95%] max-w-lg ${container}  `}>
            {children}
          </div>
        </div>
      </>
  );
}

export default Modal;