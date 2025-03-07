import React, { useState } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const CreatePlans = () => {
  const [plans, setPlans] = useState([
    {
      id: uuidv4(),
      name: "Basic Plan",
      price: 10,
      duration: "1 Week",
      data: "5GB",
      description: "An affordable plan for light users.",
      features: ["Access to basic internet", "5GB data cap"],
    },
    {
      id: uuidv4(),
      name: "Plus Plan",
      price: 25,
      duration: "1 Month",
      data: "20GB",
      description: "A plan for regular users.",
      features: ["Higher speed", "20GB data cap"],
    },
    {
      id: uuidv4(),
      name: "Premium Plan",
      price: 50,
      duration: "3 Months",
      data: "Unlimited",
      description: "Unlimited internet for heavy users.",
      features: ["Unlimited data", "Priority support"],
    },
  ]);

  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "",
    data: "",
    description: "",
    features: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 5;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    setNewPlan((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const handleRemoveFeature = (index) => {
    setNewPlan((prev) => {
      const updatedFeatures = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: updatedFeatures };
    });
  };

  const handleFeatureChange = (index, value) => {
    setNewPlan((prev) => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return { ...prev, features: updatedFeatures };
    });
  };

  const handleCreatePlan = () => {
    if (newPlan.name && newPlan.price && newPlan.duration && newPlan.data) {
      setPlans((prev) => [
        ...prev,
        { id: uuidv4(), ...newPlan },
      ]);
      setNewPlan({
        name: "",
        price: "",
        duration: "",
        data: "",
        description: "",
        features: [],
      });
      setErrorMessage("");
    } else {
      setErrorMessage("Please fill in all required fields.");
    }
  };

  const totalPages = Math.ceil(plans.length / plansPerPage);
  const paginatedPlans = plans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
        Create Internet Plans
      </h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md shadow-lg">
          {errorMessage}
        </div>
      )}

      <motion.div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Plan Name"
            value={newPlan.name}
            onChange={handleInputChange}
            className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="price"
            placeholder="Price (Ksh)"
            value={newPlan.price}
            onChange={handleInputChange}
            className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="duration"
            placeholder="Duration"
            value={newPlan.duration}
            onChange={handleInputChange}
            className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="data"
            placeholder="Data Limit"
            value={newPlan.data}
            onChange={handleInputChange}
            className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={newPlan.description}
          onChange={handleInputChange}
          className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        <div>
          <h3 className="text-xl font-semibold mb-3">Features</h3>
          {newPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="border-2 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Feature ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="text-red-500 hover:text-red-700 transition-all"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddFeature}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center space-x-2"
          >
            <FiPlus size={18} />
            <span>Add Feature</span>
          </button>
        </div>

        <motion.button
          onClick={handleCreatePlan}
          className="bg-green-500 text-white px-14 py-2 rounded-md w-auto hover:bg-green-600 transition-all mt-6 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Plan
        </motion.button>
      </motion.div>

      <h2 className="text-2xl font-bold mt-12 mb-6 text-center text-gray-900">
        Available Plans
      </h2>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-6 py-4">Name</th>
              <th className="border px-6 py-4">Price</th>
              <th className="border px-6 py-4">Duration</th>
              <th className="border px-6 py-4">Data</th>
              <th className="border px-6 py-4">Description</th>
              <th className="border px-6 py-4">Features</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlans.map((plan) => (
              <tr
                key={plan.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => alert(`Viewing details of ${plan.name}`)} // Just an example
              >
                <td className="border px-6 py-4">{plan.name}</td>
                <td className="border px-6 py-4">Ksh {plan.price}</td>
                <td className="border px-6 py-4">{plan.duration}</td>
                <td className="border px-6 py-4">{plan.data}</td>
                <td className="border px-6 py-4">{plan.description}</td>
                <td className="border px-6 py-4">
                  <ul className="list-disc pl-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePageChange("prev")}
          className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition-all"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange("next")}
          className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition-all"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CreatePlans;
