import React from 'react'
import NavBar from './components/NavBar'; 
import HeroSection from './components/HeroSection';
import Prices from './components/Prices';

const App = () => {
  return (
    <div>
     <NavBar />
     <div className="mx-auto pt-20 px-6 max-w-7xl">
      <HeroSection />
      <Prices />
     </div>
    </div>
  )
}

export default App