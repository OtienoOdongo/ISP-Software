





// import React from "react";

// const HeroSection = ({ onGetStarted, fullName }) => {
//   const displayName = fullName || "Guest";

//   return (
//     <section className="pt-24 pb-16 text-center">
//       <div className="relative mb-8 animate-fade-in">
//         <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 tracking-wide drop-shadow-sm">
//           Welcome, {displayName}
//         </h2>
//         <div className="absolute inset-x-0 bottom-[-4px] h-1 w-1/3 mx-auto bg-gradient-to-r from-teal-300 to-purple-500 rounded-full opacity-80 transform scale-x-90"></div>
//         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-400/10 to-purple-600/10 h-full w-full blur-2xl"></div>
//       </div>
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
//         Unleash lightning-fast internet anywhere with SurfZone. Pay with M-Pesa, pick your plan, and surf in seconds.
//       </p>
//       <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
//         <button
//           onClick={onGetStarted}
//           className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
//           title="Start by entering your details and choosing an amount"
//         >
//           Get Started
//         </button>
//         <a
//           href="#offers"
//           className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-full font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
//         >
//           See Plans
//         </a>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;




// // Updated components/HeroSection.jsx (full code with updates)

// import React from "react";

// const HeroSection = ({ onGetStarted, fullName }) => {
//   const displayName = fullName || "Guest";

//   return (
//     <section className="pt-24 pb-16 text-center">
//       <div className="relative mb-8 animate-fade-in">
//         <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 tracking-wide drop-shadow-sm">
//           Welcome, {displayName}
//         </h2>
//         <div className="absolute inset-x-0 bottom-[-4px] h-1 w-1/3 mx-auto bg-gradient-to-r from-teal-300 to-purple-500 rounded-full opacity-80 transform scale-x-90"></div>
//         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-400/10 to-purple-600/10 h-full w-full blur-2xl"></div>
//       </div>
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
//         Unleash lightning-fast internet anywhere with SurfZone. Pay with M-Pesa, pick your plan, and surf in seconds.
//       </p>
//       <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
//         <button
//           onClick={onGetStarted}
//           className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
//           title="Start by entering your details and choosing an amount"
//         >
//           Get Started
//         </button>
//         <a
//           href="#offers"
//           className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-full font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
//         >
//           See Plans
//         </a>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;




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