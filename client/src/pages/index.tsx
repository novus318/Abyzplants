import Header from '@/components/Header'
import Banner from '@/components/Banner'
import Categories from '@/components/categories'
import BestSellers from '@/components/BestSellers'
import Footer from '@/components/Footer'
import ContactIcon from '@/components/ContactIcon'
import Repott from '@/images/repott.webp'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from '@/components/Spinner'
import CategoriesScroll from '@/components/CategoriesScroll'
import BannerSlider from '@/components/Banner1'
import Layout from '@/components/Layout'
import BestPots from '@/components/BestPots'

type Category = {
  _id?: number;
  name?: string | undefined;
};
export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading,setLoading] = useState(true)
  const [categories,setCategories] = useState<Category[]>([]);
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/category/get-category`);
      setCategories(response.data.category);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
   <Layout title='Abyzplants - Home'
   description=
     'Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available,and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service.'
   keywords=
     'Abyzplants,Abyzplants UAE,abyzplants uae,Abyzplants dubai,abyzplants dubai,abyzplants,Buy indoor plants online,Buy outdoor plants online,where to buy indoor plants,where to buy outdoor plants,buy indoor plants in Dubai,buy indoor plants in Abu Dhabi,plant stores near me, what are the best indoor plants to buy,indoor plants for my home, flowering indoor plants for home,flowering indoor plants for my office,where can I buy indoor plants for my home,nearest online plant store in Dubai,indoor plant stores near me,online indoor plants,which are the best indoor plants to buy in winter,which are the best indoor plants to buy in summer,outdoor plants in Dubai,where to buy outdoor plants in Dubai,where to buy outdoor plants online,buy outdoor plants online,buy seeds online,buy soil & fertilizers online,buy indoor fertilizers online,buy potting soil online,buy soil for my home,buy plant insecticides,buy plant pesticides,where to buy plant food,where to buy indoor plant pots,where to buy plant pots, where to buy airplants,where to buy large indoor plants, how to water my plants,where to by plant care accessories,indoor plants online,outdoor plants online,flowering plants online,plants gifts online,plant pots online,buy plant pots in Dubai,buy tall indoor plants online,buy tall tree online,buy fertilizers online'
   author= 'Muhammed Nizamudheen M'
   canonicalUrl= 'https://abyzplants.com/' >
     <>
  {loading ? (<Spinner/>):( <>
   <Header/>
   <ContactIcon/>
   <Banner/>
   <BannerSlider/>
   <Categories/>
   {categories?.map((c) =>(
    <CategoriesScroll categoryName={c.name} categoryId={c._id} key={c._id}/>
   ))}
   <BestPots/>
   <BestSellers/>
   <section className="py-12 bg-gradient-to-b from-primary/5 to-secondary">
  <div className="max-w-4xl mx-auto text-center px-4">
  <h2 className="text-3xl font-bold mb-4 font-sans">
  Elevate Your <span className="text-primary">Plants</span> with Expert Repotting Services
</h2>
<p className="text-sm text-gray-600 mb-8 font-sans">
  At <span className="font-semibold text-gray-800">Abyzplants</span>, we offer repotting services to help your plants thrive in their new homes.
</p>
    <div className="flex flex-col md:flex-row justify-between items-center  p-6">
      <div className="w-full md:w-1/2 text-left">
        <h3 className="text-xl font-semibold  mb-4">Services Include:</h3>
        <ul className="text-sm list-disc pl-5 space-y-2">
          <li>Expert selection of the perfect pot for your plant</li>
          <li>Careful repotting with utmost attention to your plant's roots</li>
          <li>High-quality soil and nutrients to promote growth</li>
        </ul>
      </div>
      <div className="w-full md:w-1/3 mt-6 md:mt-0">
        <img
          src={Repott.src}
          alt="Repotting Services"
          className="rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
    <p className="text-sm text-gray-600 mt-8 mb-6">
      Contact us to explore our repotting options and receive personalized guidance from our experts.
    </p>
    <a
      href="https://wa.me/+971523653085"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-primary text-white py-2 px-6 rounded-full text-sm font-semibold hover:bg-primary/70 transition-colors duration-300 inline-flex items-center"
    >
      <span>Contact Us on WhatsApp</span>
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>
    </a>
  </div>
</section>
   <Footer/>
   </>)}
  </>
   </Layout>
  )
}
  