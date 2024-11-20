import React, { useState } from 'react';

const KnowledgeBase = () => {
  // Sample FAQ data (This can be dynamically fetched from an API in a real app)
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

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle the visibility of the answer for each FAQ
  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">Knowledge Base</h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search for common issues..."
          className="p-4 w-full max-w-2xl border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ List */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* No Results Message */}
        {filteredFaqs.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">No results found for your search.</p>
        )}

        {/* FAQ Items */}
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-2xl"
          >
            <div
              onClick={() => toggleAnswer(index)}
              className="cursor-pointer flex items-center justify-between text-lg font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>{faq.question}</span>
              <span className="text-indigo-500">
                {expandedIndex === index ? '-' : '+'}
              </span>
            </div>
            {expandedIndex === index && (
              <div className="mt-4 text-gray-700 text-sm leading-relaxed">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
