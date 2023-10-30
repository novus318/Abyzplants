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

type Category = {
  _id?: number;
  name?: string | undefined;
};
export default function Home() {
  const [loading,setLoading] = useState(true)
  const [categories,setCategories] = useState<Category[]>([]);
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/category/get-category');
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
   <BestSellers/>
   <section className="bg-[#F9F9F9] text-[#333] py-12">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl font-bold text-[#a14e3a] mb-6 apple">Elevate Your Plants with Expert Repotting Services</h2>
    <p className="text-lg text-[#555] mb-8">
      At Abyzplants, we offer repotting services to help your plants thrive in their new homes.
    </p>
    <div className="flex flex-col md:flex-row justify-between items-center p-4">
      <div className="w-full md:w-1/2 text-left">
        <h3 className="text-2xl font-semibold mb-4 text-[#5f9231]">Services Include :</h3>
        <ul className="text-lg list-disc pl-4 mb-6 font-normal">
          <li>Expert selection of the perfect pot for your plant</li>
          <li>Careful repotting with utmost attention to your plant's roots</li>
          <li>High-quality soil and nutrients to promote growth</li>
        </ul>
      </div>
      <div className="w-full md:w-1/2 text-center mb-4">
        <img
          src={Repott.src} 
          alt="Repotting Services" 
          className="rounded-lg shadow-xl"
        />
      </div>
    </div>
    <p className="text-lg text-[#a14e3a] mb-8">
      Contact us to explore our repotting options and receive personalized guidance from our experts.
    </p>
    <a
      href="https://wa.me/+971589537998"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#5f9231] hover:bg-[#4c7c26] text-white py-3 px-6 rounded-md text-lg font-semibold inline-block"
    >
      Contact Us on WhatsApp
    </a>
  </div>
</section>

   <Footer/>
   </>)}
  </>
  )
}
