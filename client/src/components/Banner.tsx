import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

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
    <section className="pt-24 pb-12 px-4 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
    <div className="container mx-auto text-center max-w-3xl px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
        <span className="text-primary">Spread</span> <span className="text-primary/80">green</span>{" "}
        <span className="text-secondary-foreground/90">in your life.</span>
      </h1>
      <p className="text-lg sm:text-xl text-secondary-foreground mb-6 sm:mb-8">
        Find the Perfect Plant Companion for Your Space.
      </p>
      <Button className="bg-primary hover:bg-primary/70 text-lg px-6 sm:px-8 h-12 sm:h-auto">
        Discover Now
      </Button>
    </div>
  </section>  
  );
};

export default Banner;
