



import React from "react";

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="pt-24 pb-16 text-center">
      <div className="relative mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
            Fast, Reliable WiFi
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto">
          Get instant internet access with M-Pesa. Choose your plan and start browsing in seconds.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
          >
            Get Started
          </button>
          <a
            href="#offers"
            className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-xl font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
          >
            View Plans
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;