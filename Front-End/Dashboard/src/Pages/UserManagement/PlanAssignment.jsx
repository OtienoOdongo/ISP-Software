// import React, { useState } from 'react';

// const PlanAssignment = () => {
//   const [users] = useState([
//     { id: 1, name: 'Alice Johnson', currentPlan: 'Basic' },
//     { id: 2, name: 'Bob Smith', currentPlan: 'Plus' },
//     { id: 3, name: 'Charlie Brown', currentPlan: 'Premium' },
//   ]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newPlan, setNewPlan] = useState('');

//   const handlePlanAssignment = () => {
//     if (selectedUser && newPlan) {
//       console.log(`Plan assigned: ${selectedUser.name} -> ${newPlan}`);
//       setSelectedUser(null);
//       setNewPlan('');
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">Plan Assignment</h1>
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <label className="block mb-4">
//           Select User:
//           <select
//             className="w-full border p-2 rounded-md mt-2"
//             value={selectedUser?.id || ''}
//             onChange={(e) =>
//               setSelectedUser(users.find((user) => user.id === parseInt(e.target.value, 10)))
//             }
//           >
//             <option value="">-- Select User --</option>
//             {users.map((user) => (
//               <option key={user.id} value={user.id}>
//                 {user.name} (Current Plan: {user.currentPlan})
//               </option>
//             ))}
//           </select>
//         </label>

//         {selectedUser && (
//           <label className="block mb-4">
//             Select Plan:
//             <select
//               className="w-full border p-2 rounded-md mt-2"
//               value={newPlan}
//               onChange={(e) => setNewPlan(e.target.value)}
//             >
//               <option value="">-- Select Plan --</option>
//               <option value="Basic">Basic</option>
//               <option value="Plus">Plus</option>
//               <option value="Premium">Premium</option>
//             </select>
//           </label>
//         )}

//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
//           onClick={handlePlanAssignment}
//           disabled={!selectedUser || !newPlan}
//         >
//           Assign Plan
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PlanAssignment;


import React, { useState } from 'react';

// Assuming `plans` is fetched from an API or defined elsewhere
const plans = ['Basic', 'Plus', 'Premium'];

const PlanAssignment = () => {
  const [users] = useState([
    { id: 1, name: 'Alice Johnson', currentPlan: 'Basic' },
    { id: 2, name: 'Bob Smith', currentPlan: 'Plus' },
    { id: 3, name: 'Charlie Brown', currentPlan: 'Premium' },
  ]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const [message, setMessage] = useState('');

  const handlePlanAssignment = () => {
    if (selectedUser && newPlan) {
      // Simulate a successful plan assignment
      console.log(`Plan assigned: ${selectedUser.name} -> ${newPlan}`);
      setMessage(`Successfully assigned ${newPlan} plan to ${selectedUser.name}.`);
      setSelectedUser(null);
      setNewPlan('');
    } else {
      setMessage('Please select a user and a plan.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Plan Assignment</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <label className="block mb-4">
          Select User:
          <select
            className="w-full border p-2 rounded-md mt-2"
            value={selectedUser?.id || ''}
            onChange={(e) =>
              setSelectedUser(users.find((user) => user.id === parseInt(e.target.value, 10)))
            }
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} (Current Plan: {user.currentPlan})
              </option>
            ))}
          </select>
        </label>

        {selectedUser && (
          <label className="block mb-4">
            Select Plan:
            <select
              className="w-full border p-2 rounded-md mt-2"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
            >
              <option value="">-- Select Plan --</option>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
          onClick={handlePlanAssignment}
          disabled={!selectedUser || !newPlan}
        >
          Assign Plan
        </button>

        {message && <p className="mt-4 text-green-500">{message}</p>}
      </div>
    </div>
  );
};

export default PlanAssignment;