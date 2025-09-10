


// import React from 'react';

// const Footer = () => {
//   return (
//     <footer className="bg-indigo-900/80 py-8" id="support">
//       <div className="container mx-auto px-4 text-center">
//         <p className="text-lg text-gray-200">
//           Need help? Reach us at{' '}
//           <a href="mailto:support@interlink.com" className="text-pink-300 hover:underline">
//             support@SurfZone.com
//           </a>
//         </p>
//         <p className="mt-2 text-sm text-gray-400">© 2025 SurfZone. Built for the future.</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;




// Updated components/Footer.jsx (full code with updates)

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-indigo-900/80 py-8" id="support">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xl text-gray-200 mb-4"> {/* Larger text */}
          Need help? Reach us at{' '}
          <a href="mailto:support@interlink.com" className="text-pink-300 hover:underline font-semibold">
            support@SurfZone.com
          </a>
        </p>
        <p className="mt-2 text-base text-gray-400">© 2025 SurfZone. Built for the future.</p> {/* Larger */}
      </div>
    </footer>
  );
};

export default Footer;