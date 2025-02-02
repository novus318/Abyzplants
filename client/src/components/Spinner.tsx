import React from 'react';

const Spinner = () => {
  return (
    <>
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-primary border-opacity-60 border-b-4 h-10 w-10"></div>
    </div>
    </>
  );
};

export default Spinner;
