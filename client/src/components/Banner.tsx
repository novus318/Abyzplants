import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";



const Banner = () => {


  return (
    <section className="bg-white py-12 items-center">
      <div className="text-center  pt-16 px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5f9231] mb-3 md:mb-4 lg:mb-6 tracking-wide">
          Spread{" "}
          <span className="text-[#8d4533]">green</span> in your life.
        </h1>
        <p className="text-md md:text-lg lg:text-xl text-[#a14e3a] mb-3">
          Find the Perfect Plant Companion for Your Space.
        </p>
        <Link href="/plants">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#8d4533", color: "white" }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn bg-[#5f9231] text-white py-2 md:py-3 lg:py-4 px-4 md:px-6 lg:px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Discover Now
          </motion.button>
        </Link>
      </div>
    </section>
  );
};

export default Banner;
