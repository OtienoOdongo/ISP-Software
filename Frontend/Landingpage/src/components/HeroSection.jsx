import smartphone from "../assets/smartphone.jpg";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";


const HeroSection = () => {
  return (
    <section className="mt-0 lg:mt-2">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between lg:space-x-10 ml-4">
        {/* Left Side: Text Content */}
        <div className="flex flex-col items-center lg:items-start lg:w-1/2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center lg:text-left tracking-wide
            bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text italic">
            Experience Unmatched Internet Access <br />
            <span className="text-gradient">No Matter Where You Live</span>
          </h1>
          <br />
          <p className="lg:text-base sm:text-2xl text-sm border rounded-lg mt-10 
            border-neutral-700/80 px-5 py-4 text-neutral-950 bg-blue-gradient">
            Stay connected anywhere with Interlink's flexible plans. 
            No contracts or sign-ins—just fast internet when you need it. 
            Pay via MPesa and get online instantly with Starlink's cutting-edge technology.  
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <img 
            src={smartphone}
            alt="SmartPhone Image" 
            className="w-full h-auto object-fill rounded-lg"
          />
        </div>
      </div>

      {/* Embedded Videos Section */}
      <div className="flex mt-12 justify-center">
        <video
          autoPlay
          loop
          muted
          className="rounded w-1/2 border border-orange-700 shadow-orange-400 mx-2 my-4"
        >
          <source src={video1} type="video/mp4" />
          Your browser does not support this video tag.
        </video>
        <video
          autoPlay
          loop
          muted
          className="rounded w-1/2 border border-orange-700 shadow-orange-400 mx-2 my-4"
        >
          <source src={video2} type="video/mp4" />
          Your browser does not support this video tag.
        </video>
      </div>
    </section>
  );
};

export default HeroSection;
