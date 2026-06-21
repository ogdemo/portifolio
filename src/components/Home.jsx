import { useEffect, useState } from "react";

import heart from "../assets/heart.jpg";
import honey from "../assets/honey.png";
import meat from "../assets/meat.jpg";
import noodles from "../assets/noodles.jpg";
import pizaa from "../assets/pizaa.jpg";
import tea from "../assets/tea.jpg";
import wtea from "../assets/wtea.jpg";
import vegs from "../assets/vegs.jpg";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      url: heart,
      title: "Healthy Living Starts Here",
      description:
        "Discover nutritious foods carefully selected to support heart health, wellness, and a balanced lifestyle for you and your family.",
    },
    {
      url: honey,
      title: "Pure Organic Honey",
      description:
        "Enjoy natural honey harvested from trusted sources, packed with rich flavor, natural sweetness, and essential nutrients.",
    },
    {
      url: meat,
      title: "Premium Fresh Meat",
      description:
        "High-quality fresh meat prepared with care to provide exceptional taste, freshness, and nutrition in every meal.",
    },
    {
      url: noodles,
      title: "Delicious Noodles",
      description:
        "Satisfy your cravings with tasty noodles made from quality ingredients and perfect for quick and enjoyable meals.",
    },
    {
      url: pizaa,
      title: "Hot & Tasty Pizza",
      description:
        "Freshly baked pizzas topped with premium ingredients, delivering amazing flavor and a delightful dining experience.",
    },
    {
      url: tea,
      title: "Refreshing Green Tea",
      description:
        "A healthy and refreshing beverage rich in antioxidants, perfect for relaxation and maintaining daily wellness.",
    },
    {
      url: wtea,
      title: "Warm Herbal Tea",
      description:
        "Comforting herbal tea blends crafted to help you relax, recharge, and enjoy peaceful moments throughout the day.",
    },
    {
      url: vegs,
      title: "Farm Fresh Vegetables",
      description:
        "Fresh vegetables sourced directly from farms, providing essential vitamins and minerals for a healthy lifestyle.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
          transition-all
          duration-1000
        "
        style={{
          backgroundImage: `url(${images[currentIndex].url})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div
          className="
            max-w-4xl
            text-center
            bg-white/10
            backdrop-blur-md
            border
            border-white/20
            rounded-3xl
            p-8
            md:p-12
            shadow-2xl
          "
        >
          <span
            className="
              inline-block
              bg-green-600
              text-white
              px-5
              py-2
              rounded-full
              font-semibold
              text-sm
              mb-5
            "
          >
            Fresh • Healthy • Organic
          </span>

          <h1
            className="
              text-4xl
              md:text-6xl
              font-extrabold
              text-white
              mb-6
              leading-tight
            "
          >
            {images[currentIndex].title}
          </h1>

          <p
            className="
              text-gray-200
              text-lg
              md:text-xl
              leading-relaxed
              max-w-3xl
              mx-auto
              mb-8
            "
          >
            {images[currentIndex].description}
          </p>

          <button
            className="
              bg-green-600
              hover:bg-green-700
              text-white
              px-8
              py-3
              rounded-full
              font-bold
              transition-all
              duration-300
              hover:scale-105
            "
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              h-3
              w-3
              rounded-full
              transition-all
              duration-300
              ${
                currentIndex === index
                  ? "bg-green-500 w-8"
                  : "bg-white/50"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}