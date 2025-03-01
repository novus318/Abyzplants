import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React, { useState } from 'react'
import contactImage from '@/images/contact.webp';
import ContactIcon from '@/components/ContactIcon';
import Layout from '@/components/Layout';
import emailjs from 'emailjs-com';
const Page = () => {
  const SERVICE_ID_EMAIL = 'service_l87oe7i';
  const EMAILJS_TEMPLATE_ID = 'template_ntrghpd';
  const EMAIL_USER_ID = '_qu2bpegrIX8h-mmQ';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  

    const form = document.createElement('form');
  
  
    form.method = 'post'; 
    form.action = ''; 
    const nameField = document.createElement('input');
    nameField.type = 'text';
    nameField.name = 'name';
    nameField.value = formData.name;
    form.appendChild(nameField);
  
    const emailField = document.createElement('input');
    emailField.type = 'text';
    emailField.name = 'email';
    emailField.value = formData.email;
    form.appendChild(emailField);
  
  
    const messageField = document.createElement('textarea');
    messageField.name = 'message';
    messageField.value = formData.message;
    form.appendChild(messageField);
  
    document.body.appendChild(form);
  
    setFormData({
      name: '',
    email: '',
    message: '',
    })
    emailjs.sendForm(SERVICE_ID_EMAIL, EMAILJS_TEMPLATE_ID, form, EMAIL_USER_ID)
      .then((result) => {
        console.log('Email sent successfully!', result.text);
        
      }, (error) => {
        console.error('Email could not be sent:', error);
      });
  
    document.body.removeChild(form);
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <Layout title='Abyzplants - Contact Us'
   description=
     'Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available,and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service.'
   keywords=
     'Abyzplants,Abyzplants UAE,abyzplants uae,Abyzplants dubai,abyzplants dubai,abyzplants,Buy indoor plants online,Buy outdoor plants online,where to buy indoor plants,where to buy outdoor plants,buy indoor plants in Dubai,buy indoor plants in Abu Dhabi,plant stores near me, what are the best indoor plants to buy,indoor plants for my home, flowering indoor plants for home,flowering indoor plants for my office,where can I buy indoor plants for my home,nearest online plant store in Dubai,indoor plant stores near me,online indoor plants,which are the best indoor plants to buy in winter,which are the best indoor plants to buy in summer,outdoor plants in Dubai,where to buy outdoor plants in Dubai,where to buy outdoor plants online,buy outdoor plants online,buy seeds online,buy soil & fertilizers online,buy indoor fertilizers online,buy potting soil online,buy soil for my home,buy plant insecticides,buy plant pesticides,where to buy plant food,where to buy indoor plant pots,where to buy plant pots, where to buy airplants,where to buy large indoor plants, how to water my plants,where to by plant care accessories,indoor plants online,outdoor plants online,flowering plants online,plants gifts online,plant pots online,buy plant pots in Dubai,buy tall indoor plants online,buy tall tree online,buy fertilizers online'
   author= 'Muhammed Nizamudheen M'
   canonicalUrl= 'https://abyzplants.com/contact' >
    <>
      <Header />
      <ContactIcon/>
      <div className="bg-white py-24 px-4 sm:px-6 lg:px-8 text-[#35312f]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-secondary-foreground mb-8">Contact Us</h1>
          <p className="text-lg text-secondary-foreground mb-8">
            We value your feedback and inquiries. Feel free to get in touch with us through the form below.
          </p>
          <div className="max-w-md mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit} >
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
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 px-4 py-2 block w-full border border-primary rounded-md shadow-sm focus:ring-sectext-secondary-foreground focus:border-secondary-foreground text-[#35312f] text-lg placeholder-sectext-secondary-foreground placeholder-opacity-70"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 px-4 py-2 block w-full border border-primary rounded-md shadow-sm focus:ring-sectext-secondary-foreground focus:border-secondary-foreground text-[#35312f] text-lg placeholder-sectext-secondary-foreground placeholder-opacity-70"
                  placeholder="Your Email Address"
                  required
                />
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 px-4 py-2 block w-full border border-primary rounded-md shadow-sm focus:ring-sectext-secondary-foreground focus:border-secondary-foreground text-[#35312f] text-lg placeholder-sectext-secondary-foreground placeholder-opacity-70"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-secondary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sectext-secondary-foreground transition-colors duration-300 ease-in-out"
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
    </Layout>
  )
}

export default Page
