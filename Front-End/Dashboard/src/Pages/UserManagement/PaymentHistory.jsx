

import React, { useState, useEffect } from "react";

const PaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    // Mock Data or Fetch from Backend
    const mockData = [
      {
        id: 1,
        user: "Alice Johnson",
        date: "2024-11-10",
        amount: "$50.00",
        method: "Credit Card",
        status: "Completed",
      },
      {
        id: 2,
        user: "Bob Smith",
        date: "2024-11-09",
        amount: "$30.00",
        method: "PayPal",
        status: "Completed",
      },
      {
        id: 3,
        user: "Charlie Brown",
        date: "2024-11-08",
        amount: "$40.00",
        method: "MPesa",
        status: "Pending",
      },
    ];
    setPaymentHistory(mockData);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Billing & Payment History</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Payment Method</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{payment.user}</td>
                  <td className="py-2 px-4">{payment.date}</td>
                  <td className="py-2 px-4">{payment.amount}</td>
                  <td className="py-2 px-4">{payment.method}</td>
                  <td
                    className={`py-2 px-4 ${
                      payment.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {payment.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4 text-center" colSpan="5">
                  No payment history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
