import React from "react";
import { Wifi, Zap, Clock, Smartphone } from "lucide-react";

const HotspotHero = ({ onGetStarted }) => {
  return (
    <section className="pt-28 pb-16 text-center">
      <div className="relative mb-8">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wide mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
            Instant WiFi Access
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
          Get connected in seconds with M-Pesa. Choose your plan and start browsing immediately. 
          No contracts, no hassle.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-3 text-gray-200">
            <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-300" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Instant Activation</p>
              <p className="text-sm text-gray-300">Connect immediately</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-gray-200">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-300" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">M-Pesa Payment</p>
              <p className="text-sm text-gray-300">Pay with your phone</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-gray-200">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Flexible Plans</p>
              <p className="text-sm text-gray-300">Choose your duration</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <Wifi className="w-5 h-5 group-hover:animate-pulse" />
            Get Connected Now
          </button>
          
          <a
            href="#hotspot-plans"
            className="px-8 py-4 bg-transparent border-2 border-pink-300 text-pink-300 rounded-xl font-semibold text-lg hover:bg-pink-300 hover:text-indigo-900 transition-all duration-300 flex items-center justify-center gap-3"
          >
            View All Plans
            <Zap className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Connection Instructions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Wifi className="w-5 h-5 text-green-400" />
          How to Connect
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-pink-300 font-bold text-lg">1</span>
            </div>
            <p className="text-white font-medium">Select Plan</p>
            <p className="text-gray-300 text-sm">Choose your preferred package</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-300 font-bold text-lg">2</span>
            </div>
            <p className="text-white font-medium">Pay with M-Pesa</p>
            <p className="text-gray-300 text-sm">Instant payment via phone</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-300 font-bold text-lg">3</span>
            </div>
            <p className="text-white font-medium">Start Browsing</p>
            <p className="text-gray-300 text-sm">Immediate access granted</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotspotHero;