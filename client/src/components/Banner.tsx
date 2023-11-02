import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Banner = () => {
  const buttonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "#8d4533",
      color: "white",
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <section className="bg-white mt-4 md:mt-14 items-center">
      <div className="text-center pt-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl lg:text-5xl font-bold text-[#5f9231] mb-1 md:mb-3 lg:mb-5 tracking-wide"
        >
          Spread{" "}
          <span className="text-[#8d4533]">green</span> in your life.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm md:text-base lg:text-xl text-[#a14e3a] mb-2"
        >
          Find the Perfect Plant Companion for Your Space.
        </motion.p>
        <Link href="/plants">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="button"
            className="btn bg-[#5f9231] text-white py-1 md:py-2 lg:py-3 px-3 md:px-5 lg:px-7 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Discover Now
          </motion.button>
        </Link>
      </div>
    </section>
  );
};

export default Banner;
