import React from "react";
import { Wifi, Loader } from "lucide-react";

const ConnectionDetector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center max-w-md w-full mx-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader className="w-12 h-12 text-white animate-spin" />
            <Wifi className="w-6 h-6 text-white absolute top-3 left-3" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Detecting Your Connection
        </h2>
        
        <p className="text-gray-200 mb-6">
          We're automatically detecting whether you're connecting via WiFi Hotspot or PPPoE...
        </p>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>WiFi Hotspot: For wireless connections</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>PPPoE: For wired Ethernet connections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetector;