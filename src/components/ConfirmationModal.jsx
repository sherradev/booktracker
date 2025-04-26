const ConfirmationModal = ({ handleNo, handleYes, text }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-sm rounded-2xl">
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-full max-w-sm text-center">
        <p className="font-semibold">{text}</p>
        <div className="flex justify-center gap-4">
          <button variant="ghost" onClick={handleNo}>No</button>
          <button onClick={handleYes} className="px-3 py-1 text-white rounded bg-black hover:bg-gray-900 ">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
