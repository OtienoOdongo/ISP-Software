import { CheckCircle, XCircle } from 'lucide-react'; 
import { planFeatures, basicDataPrice, plusDataPrices, premiumDataPrices } from "../constants"; 



const Prices = () => {
  return (
    <div className="mt-20 px-4">
      {/* Page Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text
         bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 my-2 text-center">
        Customized Data Plans for Every Lifestyle
      </h1>
      <br />
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl
       text-gray-400 leading-relaxed md:leading-loose tracking-wide text-center">
        Choose the data bundle that works best for you.
        Whether it's just for the day or for the whole month.
        Our plans are designed to be flexible and easy to purchase, ensuring you're connected in no time, 
        without the need to sign in.
      </p>

      {/* Pricing Section */}
      <div className="mt-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text
         bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 my-2 text-center">
          Pricing Plan
        </h2>

        {/* Basic Plan Pricing */}
        <div className="flex justify-center">
          <h2 className="mt-10 text-center text-base sm:text-lg md:text-xl lg:text-2xl
          bg-[#2AEF9C] border-2 border-lime-700 py-2 px-4 mx-auto rounded-full inline-block text-neutral-900 font-bold">
            Basic Plan
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {basicDataPrice.map((basic, index) => (
            <div key={index} className="flex justify-center">
              <div className="p-6 sm:p-8 lg:p-10 border border-neutral-700 rounded-xl bg-white 
              shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-[#2AEF9C] hover:text-white glow">
                <p className="text-3xl sm:text-4xl mb-2 text-neutral-900">{basic.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{basic.Price}</p>
                <p className="text-lg text-neutral-900">{basic.Validity}</p>
                <button className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 text-white 
                font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all mx-auto block">
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Plus Plan Pricing */}
        <div className="flex justify-center mt-10">
          <h2 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl
          bg-[#2AEF9C] border-2 border-lime-700 py-2 px-4 mx-auto rounded-full inline-block text-neutral-900 font-bold">
            Plus Plan
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {plusDataPrices.map((plus, index) => (
            <div key={index} className="flex justify-center">
              <div className="p-6 sm:p-8 lg:p-10 border border-neutral-700 rounded-xl bg-white shadow-lg
               transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-[#2AEF9C] hover:text-white glow">
                <p className="text-3xl sm:text-4xl mb-2 text-neutral-900">{plus.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{plus.Price}</p>
                <p className="text-lg text-neutral-900">{plus.Validity}</p>
                <button className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold 
                py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all mx-auto block">
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Plan Pricing */}
        <div className="flex justify-center mt-10">
          <h2 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl
          bg-[#2AEF9C] border-2 border-lime-700 py-2 px-4 mx-auto rounded-full inline-block text-neutral-900 font-bold">
            Premium Plan
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {premiumDataPrices.map((premium, index) => (
            <div key={index} className="flex justify-center">
              <div className="p-6 sm:p-8 lg:p-10 border border-neutral-700 rounded-xl bg-white
               shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-[#2AEF9C] hover:text-white glow">
                <p className="text-3xl sm:text-4xl mb-2 text-neutral-900">{premium.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{premium.Price}</p>
                <p className="text-lg text-neutral-900">{premium.Validity}</p>
                <button className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold
                 py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all mx-auto block">
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text
         bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 my-2 text-center">
          Plan Features
        </h2>
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full table-auto border-collapse border border-gray-600">
            <thead>
              <tr>
                <th className="border border-gray-600 px-4 py-2 text-lg md:text-xl text-white bg-[#2AEF9C]">Feature</th>
                {planFeatures.map((plan, index) => (
                  <th key={index} className="border border-gray-600 px-4 py-2 text-lg md:text-xl text-white bg-[#2AEF9C]">
                    {plan.plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Data Limit */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Data Limit</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.dataLimit}
                  </td>
                ))}
              </tr>

              {/* Speed */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Speed</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.speed}
                  </td>
                ))}
              </tr>

              {/* Streaming Quality */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Streaming Quality</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.streamingQuality}
                  </td>
                ))}
              </tr>

              {/* Customer Support */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Customer Support</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.customerSupport}
                  </td>
                ))}
              </tr>

              {/* Number of Devices */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Number of Devices</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.numberOfDevices}
                  </td>
                ))}
              </tr>

              {/* Data Rollover */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Data Rollover</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.dataRollover === "Yes" ? <CheckCircle className="text-green-500 inline" /> 
                    : <XCircle className="text-red-500 inline" />}
                  </td>
                ))}
              </tr>

              {/* Free Trial */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Free Trial</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.freeTrial}
                  </td>
                ))}
              </tr>

              {/* Installation Fees */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Installation Fees</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.installationFees}
                  </td>
                ))}
              </tr>

              {/* Advanced Features */}
              <tr>
                <td className="border border-gray-600 px-4 py-2 text-lg text-gray-300">Advanced Features</td>
                {planFeatures.map((plan, index) => (
                  <td key={index} className="border border-gray-600 px-4 py-2 text-lg text-gray-300">
                    {plan.advancedFeatures}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Prices;
