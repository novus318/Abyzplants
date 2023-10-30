import React from 'react'
import { FaWhatsapp } from 'react-icons/fa';

const ContactIcon = () => {
    const handleClick = () => {
        window.open('https://wa.me/+971589537998', '_blank');
      };
  return (
    <div className="fixed bottom-44 right-4 cursor-pointer z-50">
        <div onClick={handleClick} className="bg-[#5a9626] text-white p-3 rounded-full cursor-pointer">
          <FaWhatsapp size={24} />
        </div>
    </div>
  )
}

export default ContactIcon;