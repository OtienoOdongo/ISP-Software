


import React, { useState } from 'react';

const KnowledgeBase = () => {
  const faqs = [
    {
      question: 'How to reset my password?',
      answer: 'To reset your password, go to the account settings page and click on "Reset Password". Follow the instructions sent to your email.',
    },
    {
      question: 'What to do if the internet is not working?',
      answer: 'If your internet is not working, please check the following:\n1. Ensure your router is plugged in.\n2. Verify that your Starlink service is active.\n3. Restart the router.',
    },
    {
      question: 'How do I change my payment method?',
      answer: 'To update your payment method, go to your billing section and click "Edit Payment Method". Follow the prompts to add a new payment method.',
    },
    {
      question: 'What is the data usage limit?',
      answer: 'Our data plans come with various limits based on your subscription. You can track your usage in the dashboard under "Usage Reports".',
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ensure only one FAQ is open at a time
  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-10">
        Knowledge Base
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search for common issues..."
            className="w-full p-4 pr-12 text-base border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2" />
              <circle cx="10" cy="10" r="7" />
            </svg>
          </span>
        </div>
      </div>

      {/* FAQ List */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaqs.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full text-lg font-medium">No results found for your search.</p>
        ) : (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              <button
                onClick={() => toggleAnswer(index)}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <span>{faq.question}</span>
                <span className="text-blue-500">
                  {expandedIndex === index ? '-' : '+'}
                </span>
              </button>
              {expandedIndex === index && (
                <div className="mt-4 text-gray-700 text-base leading-relaxed">
                  {faq.answer.split('\n').map((item, i) => (
                    <p key={i} className="mb-2">{item}</p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;