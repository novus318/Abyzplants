import React from 'react';

const CardSpinner = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="group relative bg-secondary/20 rounded-lg transition-all duration-300 overflow-hidden h-full flex flex-col animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="relative pt-[90%] bg-gray-300" />
          
          {/* Product Info Placeholder */}
          <div className="p-4 flex flex-col flex-grow">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-300 rounded w-5/6 mb-3" />
            
            {/* Price Section Placeholder */}
            <div className="mt-auto flex items-center gap-2">
              <div className="h-3 bg-gray-300 rounded w-1/3" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSpinner;
