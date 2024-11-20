// import React, { useState, useEffect } from "react";

// const AutoRenewalSettings = () => {
//   const [settings, setSettings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch settings from backend API
//   useEffect(() => {
//     const fetchSettings = async () => {
//       setIsLoading(true);
//       try {
//         // Example API call
//         const response = await fetch("/api/auto-renewal-settings");
//         const data = await response.json();
//         setSettings(data);
//       } catch (error) {
//         console.error("Error fetching settings:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSettings();
//   }, []);

//   // Handle auto-renewal toggle
//   const toggleAutoRenewal = (planId) => {
//     setSettings((prev) =>
//       prev.map((plan) =>
//         plan.id === planId ? { ...plan, autoRenew: !plan.autoRenew } : plan
//       )
//     );
//     // Send updated data to backend
//     // fetch(`/api/auto-renewal-settings/${planId}`, { method: "PATCH", body: JSON.stringify({ autoRenew: !autoRenew }) });
//   };

//   // Handle frequency change
//   const updateFrequency = (planId, frequency) => {
//     setSettings((prev) =>
//       prev.map((plan) =>
//         plan.id === planId ? { ...plan, frequency } : plan
//       )
//     );
//     // Update backend with new frequency
//   };

//   // Handle notification toggle
//   const toggleNotifications = (planId) => {
//     setSettings((prev) =>
//       prev.map((plan) =>
//         plan.id === planId ? { ...plan, notifyBeforeRenew: !plan.notifyBeforeRenew } : plan
//       )
//     );
//   };

//   if (isLoading) {
//     return <div>Loading settings...</div>;
//   }

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">Auto-Renewal Settings</h1>

//       <div className="bg-white shadow-md rounded-lg p-6">
//         {settings.length === 0 ? (
//           <p>No plans found.</p>
//         ) : (
//           <div className="space-y-6">
//             {settings.map((plan) => (
//               <div key={plan.id} className="p-4 border rounded-lg bg-gray-50">
//                 <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
//                 <div className="mt-4 space-y-4">
//                   {/* Auto-Renewal Toggle */}
//                   <div className="flex items-center justify-between">
//                     <label className="font-medium">Auto-Renewal</label>
//                     <input
//                       type="checkbox"
//                       checked={plan.autoRenew}
//                       onChange={() => toggleAutoRenewal(plan.id)}
//                       className="toggle-checkbox"
//                     />
//                   </div>

//                   {/* Renewal Frequency */}
//                   {plan.autoRenew && (
//                     <div className="flex items-center justify-between">
//                       <label className="font-medium">Renewal Frequency</label>
//                       <select
//                         value={plan.frequency}
//                         onChange={(e) =>
//                           updateFrequency(plan.id, e.target.value)
//                         }
//                         className="border p-2 rounded-lg"
//                       >
//                         <option value="daily">Daily</option>
//                         <option value="weekly">Weekly</option>
//                         <option value="monthly">Monthly</option>
//                       </select>
//                     </div>
//                   )}

//                   {/* Notifications */}
//                   {plan.autoRenew && (
//                     <div className="flex items-center justify-between">
//                       <label className="font-medium">Notify Before Renewal</label>
//                       <input
//                         type="checkbox"
//                         checked={plan.notifyBeforeRenew}
//                         onChange={() => toggleNotifications(plan.id)}
//                         className="toggle-checkbox"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AutoRenewalSettings;


import React, { useState, useEffect } from "react";

const AutoRenewalSettings = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for testing
  const mockData = [
    {
      id: 1,
      name: "Basic",
      autoRenew: true,
      frequency: "monthly",
      notifyBeforeRenew: true,
    },
    {
      id: 2,
      name: "Premium",
      autoRenew: false,
      frequency: "weekly",
      notifyBeforeRenew: false,
    },
  ];

  // UseEffect to simulate fetching data
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSettings(mockData);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle auto-renewal toggle
  const toggleAutoRenewal = (planId) => {
    setSettings((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, autoRenew: !plan.autoRenew } : plan
      )
    );
  };

  // Handle frequency change
  const updateFrequency = (planId, frequency) => {
    setSettings((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, frequency } : plan
      )
    );
  };

  // Handle notification toggle
  const toggleNotifications = (planId) => {
    setSettings((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, notifyBeforeRenew: !plan.notifyBeforeRenew } : plan
      )
    );
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Auto-Renewal Settings</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {settings.length === 0 ? (
          <p>No plans found.</p>
        ) : (
          <div className="space-y-6">
            {settings.map((plan) => (
              <div key={plan.id} className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
                <div className="mt-4 space-y-4">
                  {/* Auto-Renewal Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Auto-Renewal</label>
                    <input
                      type="checkbox"
                      checked={plan.autoRenew}
                      onChange={() => toggleAutoRenewal(plan.id)}
                      className="toggle-checkbox"
                    />
                  </div>

                  {/* Renewal Frequency */}
                  {plan.autoRenew && (
                    <div className="flex items-center justify-between">
                      <label className="font-medium">Renewal Frequency</label>
                      <select
                        value={plan.frequency}
                        onChange={(e) =>
                          updateFrequency(plan.id, e.target.value)
                        }
                        className="border p-2 rounded-lg"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}

                  {/* Notifications */}
                  {plan.autoRenew && (
                    <div className="flex items-center justify-between">
                      <label className="font-medium">Notify Before Renewal</label>
                      <input
                        type="checkbox"
                        checked={plan.notifyBeforeRenew}
                        onChange={() => toggleNotifications(plan.id)}
                        className="toggle-checkbox"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoRenewalSettings;