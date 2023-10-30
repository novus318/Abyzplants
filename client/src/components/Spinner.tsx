import React from 'react';

const Spinner = () => {
  return (
    <>
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full border-t-8 border-[#5f9231] border-opacity-60 border-b-8 h-20 w-20"></div>
    </div>
    </>
  );
};

export default Spinner;
