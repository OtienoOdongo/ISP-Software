// import React, { useState, useEffect, useMemo } from "react";
// import {
//   CalendarDays,
//   CheckCircle,
//   AlertTriangle,
//   PauseCircle,
//   Download,
//   User,
//   Phone,
//   Search,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { throttle } from 'lodash';

// // Mock data for users and payments
// const mockUsers = [
//   { id: 1001, fullName: "Jane Mwangi", phoneNumber: "+254712345678" },
//   { id: 1002, fullName: "Abdul Rahim", phoneNumber: "+254723456789" },
//   { id: 1003, fullName: "Sarah Njeri", phoneNumber: "+254734567890" },
//   { id: 1004, fullName: "John Kimani", phoneNumber: "+254745678901" },
//   { id: 1005, fullName: "Lilian Atieno", phoneNumber: "+254756789012" },
//   ...Array.from({ length: 95 }, (_, i) => ({
//     id: 1006 + i,
//     fullName: `User ${i + 6}`,
//     phoneNumber: `+254${Math.floor(Math.random() * 90000000 + 10000000)}`,
//   }))
// ];

// const mockPayments = Object.fromEntries(mockUsers.map(user => [
//   user.id,
//   Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
//     id: i + 1,
//     date: `2025-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1}T00:00:00Z`,
//     amount: `$${Math.floor(Math.random() * 50)}.00`,
//     plan: ['Basic', 'Plus', 'Premium'][Math.floor(Math.random() * 3)],
//     status: ['Paid', 'Failed', 'Pending'][Math.floor(Math.random() * 3)]
//   }))
// ]));

// const PaymentHistory = () => {
//   const [users, setUsers] = useState([]);
//   const [payments, setPayments] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10); // Adjust based on UI needs

//   useEffect(() => {
//     // Simulate fetching users and payments, but in real scenario, this would be API calls
//     setTimeout(() => {
//       setUsers(mockUsers);
//       setPayments(mockPayments);
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   // Search functionality
//   const filteredUsers = useMemo(() =>
//     users.filter(user =>
//       user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.phoneNumber.includes(searchQuery)
//     ),
//     [users, searchQuery]
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= Math.ceil(filteredUsers.length / itemsPerPage)) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Throttle the PDF generation to prevent performance issues with rapid clicks
//   const generatePDFForUser = throttle(async (user) => {
//     const doc = new jsPDF();
//     doc.setFontSize(18);
//     doc.text(`${user.fullName}'s Billing and Payment Report`, 14, 20);

//     const userPayments = payments[user.id] || [];
//     if (userPayments.length > 0) {
//       doc.autoTable({
//         startY: 30,
//         head: [["Date", "Amount", "Plan", "Status"]],
//         body: userPayments.map((payment) => [
//           new Date(payment.date).toLocaleDateString(),
//           payment.amount,
//           payment.plan,
//           payment.status,
//         ]),
//       });
//     } else {
//       doc.text("No payment history available.", 14, 40);
//     }

//     doc.save(`${user.fullName}_Billing_Report.pdf`);
//   }, 1000); // Limit to one generation per second

//   if (isLoading) return <div className="text-center py-4">Loading...</div>;

//   return (
//     <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
//         <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-6 flex items-center">
//           <Download className="mr-2" /> Billing & Payment Dashboard
//         </h1>

//         {/* Search Bar */}
//         <div className="relative">
//           <div className="flex items-center border rounded-lg overflow-hidden">
//             <Search className="w-5 h-5 text-gray-400 ml-2" />
//             <input
//               type="text"
//               placeholder="Search users by name or phone..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
//             />
//           </div>
//         </div>

//         {/* User List */}
//         {currentUsers.map((user) => (
//           <div key={user.id} className="border-b border-gray-300 pb-4 mb-4">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center space-x-2">
//                 <User className="w-6 h-6 text-blue-500" />
//                 <h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
//                 <Phone className="w-5 h-5 text-gray-500" />
//                 <span className="text-gray-500">{user.phoneNumber}</span>
//               </div>
//               <button
//                 onClick={() => generatePDFForUser(user)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
//               >
//                 <Download className="w-5 h-5 mr-2" /> Download
//               </button>
//             </div>

//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {(payments[user.id] || []).map((payment) => (
//                   <tr key={payment.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
//                         {new Date(payment.date).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">{payment.plan}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {payment.status === "Paid" ? (
//                         <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
//                       ) : payment.status === "Failed" ? (
//                         <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2" />
//                       ) : (
//                         <PauseCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
//                       )}
//                       {payment.status}
//                     </td>
//                   </tr>
//                 ))}
//                 {!payments[user.id] && (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4 text-gray-500">
//                       No payment history available.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         ))}

//         {/* Pagination */}
//         <div className="flex justify-center items-center space-x-2">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
//           >
//             <ChevronLeft />
//           </button>
//           <span>{currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}</span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
//             className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
//           >
//             <ChevronRight />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
  Download,
  User,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { throttle } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";

// Mock data for users and payments
const mockUsers = [
  { id: 1001, fullName: "Jane Mwangi", phoneNumber: "+254712345678" },
  { id: 1002, fullName: "Abdul Rahim", phoneNumber: "+254723456789" },
  { id: 1003, fullName: "Sarah Njeri", phoneNumber: "+254734567890" },
  { id: 1004, fullName: "John Kimani", phoneNumber: "+254745678901" },
  { id: 1005, fullName: "Lilian Atieno", phoneNumber: "+254756789012" },
  ...Array.from({ length: 95 }, (_, i) => ({
    id: 1006 + i,
    fullName: `User ${i + 6}`,
    phoneNumber: `+254${Math.floor(Math.random() * 90000000 + 10000000)}`,
  })),
];

const mockPayments = Object.fromEntries(
  mockUsers.map((user) => [
    user.id,
    Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      id: i + 1,
      date: `2025-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1}T00:00:00Z`,
      amount: `$${Math.floor(Math.random() * 50)}.00`,
      plan: ["Basic", "Plus", "Premium"][Math.floor(Math.random() * 3)],
      status: ["Paid", "Failed", "Pending"][Math.floor(Math.random() * 3)],
    })),
  ])
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="animate-pulse bg-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const PaymentHistory = () => {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    // Simulate fetching users and payments
    setTimeout(() => {
      setUsers(mockUsers);
      setPayments(mockPayments);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      throttle((query) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Filter users and payments
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber.includes(searchQuery)
      ),
    [users, searchQuery]
  );

  const filteredPayments = useMemo(() => {
    if (filterStatus === "All") return payments;
    return Object.fromEntries(
      Object.entries(payments).map(([userId, userPayments]) => [
        userId,
        userPayments.filter((payment) => payment.status === filterStatus),
      ])
    );
  }, [payments, filterStatus]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  // Generate PDF for a single user
  const generatePDFForUser = throttle(async (user) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${user.fullName}'s Billing and Payment Report`, 14, 20);

    const userPayments = filteredPayments[user.id] || [];
    if (userPayments.length > 0) {
      doc.autoTable({
        startY: 30,
        head: [["Date", "Amount", "Plan", "Status"]],
        body: userPayments.map((payment) => [
          new Date(payment.date).toLocaleDateString(),
          payment.amount,
          payment.plan,
          payment.status,
        ]),
      });
    } else {
      doc.text("No payment history available.", 14, 40);
    }

    doc.save(`${user.fullName}_Billing_Report.pdf`);
  }, 1000);

  // Generate PDF for all users
  const generateAllPDFs = throttle(async () => {
    const doc = new jsPDF();
    let yPos = 20;

    users.forEach((user, index) => {
      const userPayments = filteredPayments[user.id] || [];
      doc.setFontSize(18);
      doc.text(`${user.fullName}'s Billing and Payment Report`, 14, yPos);
      yPos += 10;

      if (userPayments.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [["Date", "Amount", "Plan", "Status"]],
          body: userPayments.map((payment) => [
            new Date(payment.date).toLocaleDateString(),
            payment.amount,
            payment.plan,
            payment.status,
          ]),
        });
        yPos = doc.lastAutoTable.finalY + 10;
      } else {
        doc.text("No payment history available.", 14, yPos);
        yPos += 10;
      }

      if (index < users.length - 1) doc.addPage();
    });

    doc.save("All_Users_Billing_Reports.pdf");
  }, 1000);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-6 flex items-center">
          <Download className="mr-2" /> Billing & Payment Dashboard
        </h1>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search users by name or phone..."
                onChange={handleSearchChange}
                className="px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* User List */}
        <AnimatePresence>
          {currentUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-b border-gray-300 pb-4 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500">{user.phoneNumber}</span>
                </div>
                <button
                  data-tooltip-id="download-tooltip"
                  data-tooltip-content="Download Report"
                  onClick={() => generatePDFForUser(user)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" /> Download
                </button>
                <Tooltip id="download-tooltip" />
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredPayments[user.id] || []).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.status === "Paid" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
                        ) : payment.status === "Failed" ? (
                          <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2" />
                        ) : (
                          <PauseCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
                        )}
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                  {!filteredPayments[user.id] && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">
                        No payment history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <ChevronLeft />
          </button>
          <span>
            {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center">
          <button
            onClick={generateAllPDFs}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center"
          >
            <Download className="w-5 h-5 mr-2" /> Download All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;