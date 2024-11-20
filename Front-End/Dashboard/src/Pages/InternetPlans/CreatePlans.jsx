// import React, { useState } from "react";

// const CreatePlans = () => {
//   // State to manage plans
//   const [plans, setPlans] = useState([
//     { id: 1, name: "Basic Plan", price: 10, duration: "1 Week", data: "5GB" },
//     { id: 2, name: "Plus Plan", price: 25, duration: "1 Month", data: "20GB" },
//     { id: 3, name: "Premium Plan", price: 50, duration: "3 Months", data: "Unlimited" },
//   ]);
//   const [newPlan, setNewPlan] = useState({
//     name: "",
//     price: "",
//     duration: "",
//     data: "",
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingPlanId, setEditingPlanId] = useState(null);

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewPlan((prevPlan) => ({ ...prevPlan, [name]: value }));
//   };

//   // Handle adding or editing a plan
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (isEditing) {
//       setPlans((prevPlans) =>
//         prevPlans.map((plan) =>
//           plan.id === editingPlanId ? { ...plan, ...newPlan } : plan
//         )
//       );
//       setIsEditing(false);
//       setEditingPlanId(null);
//     } else {
//       const newPlanId = plans.length + 1;
//       setPlans([...plans, { id: newPlanId, ...newPlan }]);
//     }
//     setNewPlan({ name: "", price: "", duration: "", data: "" });
//   };

//   // Handle editing a plan
//   const handleEdit = (plan) => {
//     setIsEditing(true);
//     setEditingPlanId(plan.id);
//     setNewPlan({ name: plan.name, price: plan.price, duration: plan.duration, data: plan.data });
//   };

//   // Handle deleting a plan
//   const handleDelete = (planId) => {
//     setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">Create Plans</h1>

//       {/* Form to Add/Edit Plan */}
//       <div className="bg-white shadow-md rounded-lg p-6 mb-6">
//         <h2 className="text-lg font-semibold mb-4">
//           {isEditing ? "Edit Plan" : "Add New Plan"}
//         </h2>
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block font-semibold mb-1">Plan Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={newPlan.name}
//                 onChange={handleInputChange}
//                 className="w-full border p-2 rounded-md"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block font-semibold mb-1">Price ($)</label>
//               <input
//                 type="number"
//                 name="price"
//                 value={newPlan.price}
//                 onChange={handleInputChange}
//                 className="w-full border p-2 rounded-md"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block font-semibold mb-1">Duration</label>
//               <input
//                 type="text"
//                 name="duration"
//                 value={newPlan.duration}
//                 onChange={handleInputChange}
//                 className="w-full border p-2 rounded-md"
//                 placeholder="e.g., 1 Week, 1 Month"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block font-semibold mb-1">Data</label>
//               <input
//                 type="text"
//                 name="data"
//                 value={newPlan.data}
//                 onChange={handleInputChange}
//                 className="w-full border p-2 rounded-md"
//                 placeholder="e.g., 5GB, Unlimited"
//                 required
//               />
//             </div>
//           </div>
//           <button
//             type="submit"
//             className={`${
//               isEditing ? "bg-green-500" : "bg-blue-500"
//             } text-white px-4 py-2 rounded-md`}
//           >
//             {isEditing ? "Update Plan" : "Add Plan"}
//           </button>
//         </form>
//       </div>

//       {/* Plan List */}
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-lg font-semibold mb-4">Existing Plans</h2>
//         {plans.length > 0 ? (
//           <table className="w-full text-left">
//             <thead>
//               <tr className="border-b">
//                 <th className="py-2 px-4">Name</th>
//                 <th className="py-2 px-4">Price</th>
//                 <th className="py-2 px-4">Duration</th>
//                 <th className="py-2 px-4">Data</th>
//                 <th className="py-2 px-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {plans.map((plan) => (
//                 <tr key={plan.id} className="border-b hover:bg-gray-50">
//                   <td className="py-2 px-4">{plan.name}</td>
//                   <td className="py-2 px-4">${plan.price}</td>
//                   <td className="py-2 px-4">{plan.duration}</td>
//                   <td className="py-2 px-4">{plan.data}</td>
//                   <td className="py-2 px-4">
//                     <button
//                       className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2"
//                       onClick={() => handleEdit(plan)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="bg-red-500 text-white px-3 py-1 rounded-md"
//                       onClick={() => handleDelete(plan.id)}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No plans available. Add a new plan to get started.</p>
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useState } from "react";

const CreatePlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: "Basic Plan", price: 10, duration: "1 Week", data: "5GB" },
    { id: 2, name: "Plus Plan", price: 25, duration: "1 Month", data: "20GB" },
    { id: 3, name: "Premium Plan", price: 50, duration: "3 Months", data: "Unlimited" },
  ]);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "",
    data: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan((prevPlan) => ({ ...prevPlan, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === editingPlanId ? { ...plan, ...newPlan } : plan
        )
      );
      setIsEditing(false);
      setEditingPlanId(null);
    } else {
      const newPlanId = plans.length + 1;
      setPlans([...plans, { id: newPlanId, ...newPlan }]);
    }
    setNewPlan({ name: "", price: "", duration: "", data: "" });
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setEditingPlanId(plan.id);
    setNewPlan({ name: plan.name, price: plan.price, duration: plan.duration, data: plan.data });
  };

  const handleDelete = (planId) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
  };

  const handleAddNewPlan = () => {
    setIsEditing(false);
    setEditingPlanId(null);
    setNewPlan({ name: "", price: "", duration: "", data: "" });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Create Plans</h1>

      {/* Button to Add New Plan */}
      <button
        onClick={handleAddNewPlan}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Add New Plan
      </button>

      {/* Form to Add/Edit Plan */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Plan" : "Add New Plan"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-1">Plan Name</label>
              <input
                type="text"
                name="name"
                value={newPlan.name}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Price (KES)</label>
              <input
                type="number"
                name="price"
                value={newPlan.price}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Duration</label>
              <input
                type="text"
                name="duration"
                value={newPlan.duration}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-md"
                placeholder="e.g., 1 Week, 1 Month"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Data</label>
              <input
                type="text"
                name="data"
                value={newPlan.data}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-md"
                placeholder="e.g., 5GB, Unlimited"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${
              isEditing ? "bg-green-500" : "bg-blue-500"
            } text-white px-4 py-2 rounded-md`}
          >
            {isEditing ? "Update Plan" : "Add Plan"}
          </button>
        </form>
      </div>

      {/* Plan List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Existing Plans</h2>
        {plans.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Duration</th>
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{plan.name}</td>
                  <td className="py-2 px-4">KES {plan.price}</td>
                  <td className="py-2 px-4">{plan.duration}</td>
                  <td className="py-2 px-4">{plan.data}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2"
                      onClick={() => handleEdit(plan)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No plans available. Add a new plan to get started.</p>
        )}
      </div>
    </div>
  );
};

export default CreatePlans;