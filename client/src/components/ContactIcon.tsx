import React from 'react'
import { FaWhatsapp } from 'react-icons/fa';

const ContactIcon = () => {
    const handleClick = () => {
        window.open('https://wa.me/+971523653085', '_blank');
      };
  return (
    <div className="fixed bottom-28 right-2 cursor-pointer z-50">
        <div onClick={handleClick} className="bg-primary text-secondary p-3 rounded-full cursor-pointer">
          <FaWhatsapp size={24} />
        </div>
    </div>
  )
}

export default ContactIcon;