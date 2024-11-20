import React, { useState } from 'react';
import { toast } from 'react-toastify';

const PaymentGatewaySettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [lipaNaMpesaShortcode, setLipaNaMpesaShortcode] = useState('');
  const [lipaNaMpesaShortcodeKey, setLipaNaMpesaShortcodeKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you would typically send the API keys and webhook URLs to your backend for saving in the database
    toast.success('M-Pesa Integration settings updated successfully.');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">M-Pesa Payment Gateway Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-600">M-Pesa API Key</label>
          <input
            type="text"
            id="apiKey"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-600">M-Pesa API Secret</label>
          <input
            type="text"
            id="apiSecret"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="shortcode" className="block text-sm font-medium text-gray-600">M-Pesa Shortcode</label>
          <input
            type="text"
            id="shortcode"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lipaNaMpesaShortcode" className="block text-sm font-medium text-gray-600">Lipa Na M-Pesa Shortcode</label>
          <input
            type="text"
            id="lipaNaMpesaShortcode"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={lipaNaMpesaShortcode}
            onChange={(e) => setLipaNaMpesaShortcode(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lipaNaMpesaShortcodeKey" className="block text-sm font-medium text-gray-600">Lipa Na M-Pesa Shortcode Key</label>
          <input
            type="text"
            id="lipaNaMpesaShortcodeKey"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={lipaNaMpesaShortcodeKey}
            onChange={(e) => setLipaNaMpesaShortcodeKey(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-600">Webhook URL</label>
          <input
            type="url"
            id="webhookUrl"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentGatewaySettings;
