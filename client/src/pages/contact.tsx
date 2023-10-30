import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'
import contactImage from '@/images/contact.webp';
import ContactIcon from '@/components/ContactIcon';

const Page = () => {
  return (
    <>
      <Header />
      <ContactIcon/>
      <div className="bg-white py-24 px-4 sm:px-6 lg:px-8 text-[#35312f]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#a14e3a] mb-8">Contact Us</h1>
          <p className="text-lg text-[#a14e3a] mb-8">
            We value your feedback and inquiries. Feel free to get in touch with us through the form below.
          </p>
          <div className="max-w-md mx-auto">
            <form className="space-y-6">
              <div className="relative">
                <div className="mb-6">
                  <img
                    src={contactImage.src}
                    alt="Contact"
                    className="w-full h-auto"
                  />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-2 px-4 py-2 block w-full border border-[#5f9231] rounded-md shadow-sm focus:ring-[#a14e3a] focus:border-[#a14e3a] text-[#35312f] text-lg placeholder-[#a14e3a] placeholder-opacity-70"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-2 px-4 py-2 block w-full border border-[#5f9231] rounded-md shadow-sm focus:ring-[#a14e3a] focus:border-[#a14e3a] text-[#35312f] text-lg placeholder-[#a14e3a] placeholder-opacity-70"
                  placeholder="Your Email Address"
                  required
                />
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  className="mt-2 px-4 py-2 block w-full border border-[#5f9231] rounded-md shadow-sm focus:ring-[#a14e3a] focus:border-[#a14e3a] text-[#35312f] text-lg placeholder-[#a14e3a] placeholder-opacity-70"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#5f9231] hover:bg-[#a14e3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3a] transition-colors duration-300 ease-in-out"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Page
