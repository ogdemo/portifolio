import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  const highlights = [
    "Farm-picked freshness",
    "Carefully sourced organic staples",
    "Fast delivery, premium quality",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url(${images[currentIndex].url})`,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.82),rgba(2,6,23,0.52))]" />

      <div className="relative z-10 flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl sm:p-8 lg:p-10">
            <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
              Fresh • Healthy • Organic
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {images[currentIndex].title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
              {images[currentIndex].description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Shop Now
              </Link>

              <Link
                to="/gallery"
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Explore Gallery
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-2xl sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/15 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Crafted for wellness
                </p>
                <h2 className="mt-2 text-xl font-bold">Premium pantry picks</h2>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Better ingredients, better meals, and a calmer daily routine.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-500/20 p-4 text-white ring-1 ring-emerald-300/40">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">
                  Trusted quality
                </p>
                <h2 className="mt-2 text-xl font-bold">Freshly selected</h2>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Every item is chosen to bring freshness, taste, and balance to your home.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/50 p-4 text-white sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                      Feature spotlight
                    </p>
                    <h2 className="mt-2 text-xl font-bold">A healthier way to shop</h2>
                  </div>
                  <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                    New arrivals
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Browse organic essentials, comforting favorites, and everyday staples with a cleaner, more refined shopping experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentIndex === index ? "w-8 bg-emerald-400" : "w-3 bg-white/55"
            }`}
          />
        ))}
      </div>
    </section>
  );
}