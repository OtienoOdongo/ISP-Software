


import React from 'react';
import { FiCreditCard, FiZap, FiShield, FiEdit2, FiArrowLeft } from 'react-icons/fi';

const PaymentConfigurationHeader = ({ 
  savedConfig, 
  showEditForm, 
  onEdit, 
  onBack 
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiCreditCard className="mr-3 text-indigo-600" />
            Payment Configuration
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your payment gateway integrations
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
              <FiZap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Methods</p>
              <p className="text-xl font-semibold text-gray-900">
                {savedConfig ? savedConfig.paymentMethods.filter(m => m.isActive).length : '0'}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <FiShield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Security Status</p>
              <p className="text-xl font-semibold text-gray-900">
                {savedConfig ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Payment Gateway Dashboard</h2>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Configure and monitor all your payment integrations in one place
            </p>
          </div>
          
          {!showEditForm ? (
            <button
              onClick={onEdit}
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
            >
              <FiEdit2 className="mr-2 text-indigo-600" />
              Configure Payment Methods
            </button>
          ) : (
            <button
              onClick={onBack}
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
            >
              <FiArrowLeft className="mr-2" />
              Back to Main Page
            </button>
          )}
        </div>
      </div>
    </div>
  )
};

export default PaymentConfigurationHeader;