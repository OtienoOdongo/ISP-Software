// import smartphone from "../assets/smartphone.jpg";
// import video1 from "../assets/video1.mp4";
// import video2 from "../assets/video2.mp4";


// const HeroSection = () => {
//   return (
//     <section className="mt-0 lg:mt-2">
//       <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between lg:space-x-10 ml-4">
//         {/* Left Side: Text Content */}
//         <div className="flex flex-col items-center lg:items-start lg:w-1/2">
//           <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center lg:text-left tracking-wide
//             bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text italic">
//             Experience Unmatched Internet Access <br />
//             <span className="text-gradient">No Matter Where You Live</span>
//           </h1>
//           <br />
//           <p className="lg:text-base sm:text-2xl text-sm border rounded-lg mt-10 
//             border-neutral-700/80 px-5 py-4 text-neutral-950 bg-blue-gradient">
//             Stay connected anywhere with Interlink's flexible plans. 
//             No contracts or sign-ins—just fast internet when you need it. 
//             Pay via MPesa and get online instantly with Starlink's cutting-edge technology.  
//           </p>
//         </div>

//         {/* Right Side: Image */}
//         <div className="lg:w-1/2 mt-10 lg:mt-0">
//           <img 
//             src={smartphone}
//             alt="SmartPhone Image" 
//             className="w-full h-auto object-fill rounded-lg"
//           />
//         </div>
//       </div>

//       {/* Embedded Videos Section */}
//       <div className="flex mt-12 justify-center">
//         <video
//           autoPlay
//           loop
//           muted
//           className="rounded w-1/2 border border-orange-700 shadow-orange-400 mx-2 my-4"
//         >
//           <source src={video1} type="video/mp4" />
//           Your browser does not support this video tag.
//         </video>
//         <video
//           autoPlay
//           loop
//           muted
//           className="rounded w-1/2 border border-orange-700 shadow-orange-400 mx-2 my-4"
//         >
//           <source src={video2} type="video/mp4" />
//           Your browser does not support this video tag.
//         </video>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;



// import React from 'react';

// const HeroSection = () => {
//   return (
//     <section className="py-12 text-center">
//       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
//         Fast WiFi, Anywhere, Anytime
//       </h1>
//       <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
//         Connect effortlessly with InterLink. Pay via M-Pesa, choose your plan, and enjoy high-speed internet powered by Starlink.
//       </p>
//       <div className="mt-8 flex justify-center gap-4">
//         <a href="#pricing" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
//           Get Started
//         </a>
//         <a href="#features" className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-colors">
//           Learn More
//         </a>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;




// import React from 'react';

// const HeroSection = () => {
//   return (
//     <section className="pt-24 pb-16 text-center">
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
//         Unleash lightning-fast internet anywhere with InterLink. Pay with M-Pesa, pick your plan, and surf in seconds.
//       </p>
//       <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
//         <a
//           href="#offers"
//           className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
//         >
//           Explore Plans
//         </a>
//         <a
//           href="#features"
//           className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-full font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
//         >
//           Why Us?
//         </a>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;




// import React, { useState } from 'react';
// import AuthModal from './AuthModal';

// const HeroSection = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);

//   return (
//     <section className="pt-24 pb-16 text-center">
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
//         Unleash lightning-fast internet anywhere with InterLink. Pay with M-Pesa, pick your plan, and surf in seconds.
//       </p>
//       <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
//         <button
//           onClick={() => setIsAuthOpen(true)}
//           className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
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
//       {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
//     </section>
//   );
// };

// export default HeroSection;


// import React from 'react';

// const HeroSection = ({ onGetStarted }) => {
//   return (
//     <section className="pt-24 pb-16 text-center">
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
//         Unleash lightning-fast internet anywhere with InterLink. Pay with M-Pesa, pick your plan, and surf in seconds.
//       </p>
//       <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
//         <button
//           onClick={onGetStarted}
//           className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
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



// import React from "react";

// const HeroSection = ({ onGetStarted }) => {
//   return (
//     <section className="pt-24 pb-16 text-center">
//       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
//           WiFi That Follows You
//         </span>
//       </h1>
//       <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto">
//         Unleash lightning-fast internet anywhere with SurfZone. Pay with M-Pesa and surf in seconds.
//       </p>
//       <button
//         onClick={onGetStarted}
//         className="mt-10 px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transition-all"
//       >
//         Get Started
//       </button>
//     </section>
//   );
// };

// export default HeroSection;






// import React from "react";

// const HeroSection = ({ onGetStarted, fullName, selectedPlan }) => {
//   const displayName = fullName || "Guest";

//   // Log selectedPlan for debugging
//   console.log("Selected Plan:", selectedPlan);

//   // Strict check for promotional category and price of 0
//   const isPromotionalZero =
//     selectedPlan &&
//     selectedPlan.category === "promotional" &&
//     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

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
//           disabled={isPromotionalZero}
//           className={`px-8 py-4 rounded-full font-semibold text-lg shadow-lg transform transition-all duration-300 ${
//             isPromotionalZero
//               ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-75"
//               : "bg-pink-500 text-white hover:bg-pink-600 hover:scale-105"
//           }`}
//           title={
//             isPromotionalZero
//               ? "This promotional plan is free and cannot be purchased."
//               : "Start your SurfZone experience"
//           }
//         >
//           Get Started
//           {isPromotionalZero && (
//             <span className="ml-2 text-sm italic text-gray-500">(Free Plan)</span>
//           )}
//         </button>
//         <a
//           href="#offers"
//           className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-full font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
//         >
//           See Plans
//         </a>
//       </div>
//       {isPromotionalZero && (
//         <p className="mt-4 text-sm text-gray-400 italic">
//           This promotional plan is free and auto-applied. No payment required.
//         </p>
//       )}
//     </section>
//   );
// };

// export default HeroSection;






import React from "react";

const HeroSection = ({ onGetStarted, fullName }) => {
  const displayName = fullName || "Guest";

  return (
    <section className="pt-24 pb-16 text-center">
      <div className="relative mb-8 animate-fade-in">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 tracking-wide drop-shadow-sm">
          Welcome, {displayName}
        </h2>
        <div className="absolute inset-x-0 bottom-[-4px] h-1 w-1/3 mx-auto bg-gradient-to-r from-teal-300 to-purple-500 rounded-full opacity-80 transform scale-x-90"></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-400/10 to-purple-600/10 h-full w-full blur-2xl"></div>
      </div>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-wide animate-fade-in">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
          WiFi That Follows You
        </span>
      </h1>
      <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto animate-slide-up">
        Unleash lightning-fast internet anywhere with SurfZone. Pay with M-Pesa, pick your plan, and surf in seconds.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all duration-300"
          title="Start by entering your details and choosing an amount"
        >
          Get Started
        </button>
        <a
          href="#offers"
          className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-full font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300"
        >
          See Plans
        </a>
      </div>
    </section>
  );
};

export default HeroSection;