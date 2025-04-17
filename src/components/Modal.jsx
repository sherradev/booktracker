const Modal = ({children}) =>{
    return (
        <>
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-80 z-50">
              {children}
            </div>
          </div>
        </>
    );
}

export default Modal;