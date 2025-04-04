import React from 'react';
import { features } from '../constants';

const Features = () => {
  return (
    <section className="py-16" id="features">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
        What Makes SurfZone Shine
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-4xl mb-4 block">{feature.icon}</span>
            <h3 className="text-xl font-semibold text-pink-300 mb-2">{feature.title}</h3>
            <p className="text-gray-200">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;