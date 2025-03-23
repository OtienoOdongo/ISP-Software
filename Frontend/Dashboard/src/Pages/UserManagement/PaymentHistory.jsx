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
// import { throttle } from "lodash";
// import { motion, AnimatePresence } from "framer-motion";
// import { Tooltip } from "react-tooltip";

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
//   })),
// ];

// const mockPayments = Object.fromEntries(
//   mockUsers.map((user) => [
//     user.id,
//     Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
//       id: i + 1,
//       date: `2025-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1}T00:00:00Z`,
//       amount: `$${Math.floor(Math.random() * 50)}.00`,
//       plan: ["Basic", "Plus", "Premium"][Math.floor(Math.random() * 3)],
//       status: ["Paid", "Failed", "Pending"][Math.floor(Math.random() * 3)],
//     })),
//   ])
// );

// // Loading Skeleton Component
// const LoadingSkeleton = () => (
//   <div className="space-y-4">
//     {Array.from({ length: 5 }).map((_, index) => (
//       <div key={index} className="animate-pulse bg-gray-200 rounded-lg p-6">
//         <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
//         <div className="space-y-2">
//           <div className="h-4 bg-gray-300 rounded w-full"></div>
//           <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// const PaymentHistory = () => {
//   const [users, setUsers] = useState([]);
//   const [payments, setPayments] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [filterStatus, setFilterStatus] = useState("All");

//   useEffect(() => {
//     // Simulate fetching users and payments
//     setTimeout(() => {
//       setUsers(mockUsers);
//       setPayments(mockPayments);
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   // Debounced search
//   const debouncedSearch = useMemo(
//     () =>
//       throttle((query) => {
//         setSearchQuery(query);
//       }, 300),
//     []
//   );

//   useEffect(() => {
//     return () => debouncedSearch.cancel();
//   }, [debouncedSearch]);

//   const handleSearchChange = (e) => {
//     debouncedSearch(e.target.value);
//   };

//   // Filter users and payments
//   const filteredUsers = useMemo(
//     () =>
//       users.filter(
//         (user) =>
//           user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           user.phoneNumber.includes(searchQuery)
//       ),
//     [users, searchQuery]
//   );

//   const filteredPayments = useMemo(() => {
//     if (filterStatus === "All") return payments;
//     return Object.fromEntries(
//       Object.entries(payments).map(([userId, userPayments]) => [
//         userId,
//         userPayments.filter((payment) => payment.status === filterStatus),
//       ])
//     );
//   }, [payments, filterStatus]);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= Math.ceil(filteredUsers.length / itemsPerPage)) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Generate PDF for a single user
//   const generatePDFForUser = throttle(async (user) => {
//     const doc = new jsPDF();
//     doc.setFontSize(18);
//     doc.text(`${user.fullName}'s Billing and Payment Report`, 14, 20);

//     const userPayments = filteredPayments[user.id] || [];
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
//   }, 1000);

//   // Generate PDF for all users
//   const generateAllPDFs = throttle(async () => {
//     const doc = new jsPDF();
//     let yPos = 20;

//     users.forEach((user, index) => {
//       const userPayments = filteredPayments[user.id] || [];
//       doc.setFontSize(18);
//       doc.text(`${user.fullName}'s Billing and Payment Report`, 14, yPos);
//       yPos += 10;

//       if (userPayments.length > 0) {
//         doc.autoTable({
//           startY: yPos,
//           head: [["Date", "Amount", "Plan", "Status"]],
//           body: userPayments.map((payment) => [
//             new Date(payment.date).toLocaleDateString(),
//             payment.amount,
//             payment.plan,
//             payment.status,
//           ]),
//         });
//         yPos = doc.lastAutoTable.finalY + 10;
//       } else {
//         doc.text("No payment history available.", 14, yPos);
//         yPos += 10;
//       }

//       if (index < users.length - 1) doc.addPage();
//     });

//     doc.save("All_Users_Billing_Reports.pdf");
//   }, 1000);

//   if (isLoading) return <LoadingSkeleton />;

//   return (
//     <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
//         <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-6 flex items-center">
//           <Download className="mr-2" /> Billing & Payment Dashboard
//         </h1>

//         {/* Search and Filter */}
//         <div className="flex items-center space-x-4">
//           <div className="relative flex-1">
//             <div className="flex items-center border rounded-lg overflow-hidden">
//               <Search className="w-5 h-5 text-gray-400 ml-2" />
//               <input
//                 type="text"
//                 placeholder="Search users by name or phone..."
//                 onChange={handleSearchChange}
//                 className="px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="px-4 text-gray-500 hover:text-gray-700"
//                 >
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//           >
//             <option value="All">All</option>
//             <option value="Paid">Paid</option>
//             <option value="Failed">Failed</option>
//             <option value="Pending">Pending</option>
//           </select>
//         </div>

//         {/* User List */}
//         <AnimatePresence>
//           {currentUsers.map((user) => (
//             <motion.div
//               key={user.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="border-b border-gray-300 pb-4 mb-4"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center space-x-2">
//                   <User className="w-6 h-6 text-blue-500" />
//                   <h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
//                   <Phone className="w-5 h-5 text-gray-500" />
//                   <span className="text-gray-500">{user.phoneNumber}</span>
//                 </div>
//                 <button
//                   data-tooltip-id="download-tooltip"
//                   data-tooltip-content="Download Report"
//                   onClick={() => generatePDFForUser(user)}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
//                 >
//                   <Download className="w-5 h-5 mr-2" /> Download
//                 </button>
//                 <Tooltip id="download-tooltip" />
//               </div>

//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {(filteredPayments[user.id] || []).map((payment) => (
//                     <tr key={payment.id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
//                           {new Date(payment.date).toLocaleDateString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">{payment.plan}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {payment.status === "Paid" ? (
//                           <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
//                         ) : payment.status === "Failed" ? (
//                           <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2" />
//                         ) : (
//                           <PauseCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
//                         )}
//                         {payment.status}
//                       </td>
//                     </tr>
//                   ))}
//                   {!filteredPayments[user.id] && (
//                     <tr>
//                       <td colSpan="4" className="text-center py-4 text-gray-500">
//                         No payment history available.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {/* Pagination */}
//         <div className="flex justify-center items-center space-x-2">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
//           >
//             <ChevronLeft />
//           </button>
//           <span>
//             {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
//           </span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
//             className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
//           >
//             <ChevronRight />
//           </button>
//         </div>

//         {/* Download All Button */}
//         <div className="flex justify-center">
//           <button
//             onClick={generateAllPDFs}
//             className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center"
//           >
//             <Download className="w-5 h-5 mr-2" /> Download All Reports
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory;





// import React, { useState, useEffect } from "react";
// import { CalendarDays, CheckCircle, AlertTriangle, PauseCircle, Download, User, Phone, Search, ChevronLeft, ChevronRight } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../../api";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

// const PaymentHistory = () => {
//   const [users, setUsers] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [filterStatus, setFilterStatus] = useState("All");

//   // Fetch users and payments from the backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [usersResponse, paymentsResponse] = await Promise.all([
//           api.get("/api/user_management/user-profiles/"),
//           api.get("/api/user_management/payments/"),
//         ]);
//         setUsers(usersResponse.data);
//         setPayments(paymentsResponse.data);
//       } catch (error) {
//         setError("Unable to fetch payment history. Please try again later.");
//         setUsers([]);
//         setPayments([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle search input
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1); // Reset to first page on search
//   };

//   // Filter users and payments
//   const filteredUsers = users.filter(
//     (user) =>
//       user.client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.client.phonenumber.includes(searchQuery)
//   );

//   const filteredPayments = payments.filter(
//     (payment) => filterStatus === "All" || payment.status === filterStatus
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Generate PDF for a single user
//   const generatePDFForUser = (user) => {
//     const doc = new jsPDF();
//     doc.setFontSize(20);
//     doc.text(`${user.client.full_name}'s Payment History`, 14, 20);

//     const userPayments = filteredPayments.filter((payment) => payment.user === user.id);
//     if (userPayments.length > 0) {
//       doc.autoTable({
//         startY: 30,
//         head: [["Date", "Amount", "Plan", "Status"]],
//         body: userPayments.map((payment) => [
//           new Date(payment.date).toLocaleDateString(),
//           payment.amount,
//           payment.plan ? payment.plan.name : "N/A",
//           payment.status,
//         ]),
//         theme: "striped",
//         headStyles: { fillColor: [67, 56, 202] }, // Indigo
//       });
//     } else {
//       doc.setFontSize(12);
//       doc.text("No payment history available.", 14, 40);
//     }

//     doc.save(`${user.client.full_name}_Payment_History.pdf`);
//   };

//   // Generate PDF for all users
//   const generateAllPDFs = () => {
//     const doc = new jsPDF();
//     let yPos = 20;

//     filteredUsers.forEach((user, index) => {
//       const userPayments = filteredPayments.filter((payment) => payment.user === user.id);
//       doc.setFontSize(20);
//       doc.text(`${user.client.full_name}'s Payment History`, 14, yPos);
//       yPos += 10;

//       if (userPayments.length > 0) {
//         doc.autoTable({
//           startY: yPos,
//           head: [["Date", "Amount", "Plan", "Status"]],
//           body: userPayments.map((payment) => [
//             new Date(payment.date).toLocaleDateString(),
//             payment.amount,
//             payment.plan ? payment.plan.name : "N/A",
//             payment.status,
//           ]),
//           theme: "striped",
//           headStyles: { fillColor: [67, 56, 202] },
//         });
//         yPos = doc.lastAutoTable.finalY + 20;
//       } else {
//         doc.setFontSize(12);
//         doc.text("No payment history available.", 14, yPos);
//         yPos += 20;
//       }

//       if (index < filteredUsers.length - 1) doc.addPage();
//     });

//     doc.save("All_Payment_History.pdf");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
//           <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md flex items-center justify-center">
//             <Download className="w-10 h-10 mr-4" />
//             Payment History
//           </h1>
//           <p className="text-center text-indigo-100 mt-3 text-xl font-light">
//             Track Client Payments with Precision
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="p-10 space-y-10">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-20">
//               <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
//               <span className="ml-4 text-gray-700 text-xl font-medium">Loading Payment Records...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <AlertTriangle className="w-20 h-20 text-red-500 mx-auto" />
//               <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 We're optimizing our payment system. Data will be available soon!
//               </p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <User className="w-20 h-20 text-indigo-500 mx-auto" />
//               <p className="text-gray-800 text-2xl font-semibold mt-6">No Payment Records Yet</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Add clients and payments to start tracking history.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Search and Filter */}
//               <div className="flex items-center space-x-6 bg-gray-100 p-6 rounded-2xl shadow-inner">
//                 <div className="relative flex-1">
//                   <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden shadow-sm">
//                     <Search className="w-6 h-6 text-gray-400 ml-4" />
//                     <input
//                       type="text"
//                       placeholder="Search by name or phone..."
//                       value={searchQuery}
//                       onChange={handleSearchChange}
//                       className="px-4 py-3 w-full focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700 placeholder-gray-400"
//                     />
//                     {searchQuery && (
//                       <button
//                         onClick={() => setSearchQuery("")}
//                         className="px-4 text-gray-500 hover:text-gray-700"
//                       >
//                         Clear
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
//                 >
//                   <option value="All">All Statuses</option>
//                   <option value="Paid">Paid</option>
//                   <option value="Failed">Failed</option>
//                   <option value="Pending">Pending</option>
//                 </select>
//               </div>

//               {/* User List */}
//               {currentUsers.length === 0 ? (
//                 <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//                   <Search className="w-20 h-20 text-indigo-500 mx-auto" />
//                   <p className="text-gray-800 text-2xl font-semibold mt-6">No Matching Records</p>
//                   <p className="text-gray-600 mt-3 text-lg">
//                     Adjust your search or filter to find payment history.
//                   </p>
//                 </div>
//               ) : (
//                 currentUsers.map((user) => (
//                   <div key={user.id} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                     <div className="flex items-center justify-between mb-6">
//                       <div className="flex items-center space-x-4">
//                         <User className="w-8 h-8 text-indigo-600" />
//                         <h3 className="text-2xl font-semibold text-gray-900">{user.client.full_name}</h3>
//                         <Phone className="w-6 h-6 text-gray-500" />
//                         <span className="text-gray-600">{user.client.phonenumber}</span>
//                       </div>
//                       <button
//                         onClick={() => generatePDFForUser(user)}
//                         className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl"
//                       >
//                         <Download className="w-5 h-5 mr-2" /> Download PDF
//                       </button>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-indigo-50">
//                           <tr>
//                             <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Date</th>
//                             <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Amount</th>
//                             <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Plan</th>
//                             <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Status</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {filteredPayments
//                             .filter((payment) => payment.user === user.id)
//                             .map((payment) => (
//                               <tr key={payment.id}>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   <div className="flex items-center">
//                                     <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
//                                     {new Date(payment.date).toLocaleDateString()}
//                                   </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-gray-700">{payment.amount}</td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-gray-700">
//                                   {payment.plan ? payment.plan.name : "N/A"}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   {payment.status === "Paid" ? (
//                                     <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
//                                   ) : payment.status === "Failed" ? (
//                                     <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2" />
//                                   ) : (
//                                     <PauseCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
//                                   )}
//                                   <span
//                                     className={`font-semibold ${
//                                       payment.status === "Paid"
//                                         ? "text-green-600"
//                                         : payment.status === "Failed"
//                                         ? "text-red-600"
//                                         : "text-yellow-600"
//                                     }`}
//                                   >
//                                     {payment.status}
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                           {filteredPayments.filter((payment) => payment.user === user.id).length === 0 && (
//                             <tr>
//                               <td colSpan="4" className="px-6 py-4 text-center text-gray-600">
//                                 No payment history available for this user.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 ))
//               )}

//               {/* Pagination */}
//               {currentUsers.length > 0 && (
//                 <div className="flex justify-center items-center space-x-4 mt-8">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-md"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <span className="text-gray-700 font-medium">
//                     Page {currentPage} of {totalPages}
//                   </span>
//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-md"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
//               )}

//               {/* Download All Button */}
//               {filteredUsers.length > 0 && (
//                 <div className="flex justify-center mt-8">
//                   <button
//                     onClick={generateAllPDFs}
//                     className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
//                   >
//                     <Download className="w-6 h-6 mr-3" /> Download All Reports
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory;







import React, { useState, useEffect } from "react";
import { CalendarDays, CheckCircle, AlertTriangle, PauseCircle, Download, User, Phone, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import api from "../../../api";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PaymentHistory = () => {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch users and payments from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, paymentsResponse] = await Promise.all([
          api.get("/api/user_management/user-profiles/"),
          api.get("/api/user_management/payments/"),
        ]);
        setUsers(usersResponse.data);
        setPayments(paymentsResponse.data);
      } catch (error) {
        setError("Unable to fetch payment history. Please try again later.");
        setUsers([]);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Filter users and payments
  const filteredUsers = users.filter(
    (user) =>
      user.client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.client.phonenumber.includes(searchQuery)
  );

  const filteredPayments = payments.filter(
    (payment) => filterStatus === "All" || payment.status === filterStatus
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate PDF for a single user
  const generatePDFForUser = (user) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${user.client.full_name}'s Payment History`, 14, 20);

    const userPayments = filteredPayments.filter((payment) => payment.user === user.id);
    if (userPayments.length > 0) {
      doc.autoTable({
        startY: 30,
        head: [["Date", "Amount", "Plan", "Status"]],
        body: userPayments.map((payment) => [
          new Date(payment.date).toLocaleDateString(),
          payment.amount,
          payment.plan ? payment.plan.name : "N/A",
          payment.status,
        ]),
        theme: "striped",
        headStyles: { fillColor: [67, 56, 202] }, // Indigo
      });
    } else {
      doc.setFontSize(12);
      doc.text("No payment history available.", 14, 40);
    }

    doc.save(`${user.client.full_name}_Payment_History.pdf`);
  };

  // Generate PDF for all users
  const generateAllPDFs = () => {
    const doc = new jsPDF();
    let yPos = 20;

    filteredUsers.forEach((user, index) => {
      const userPayments = filteredPayments.filter((payment) => payment.user === user.id);
      doc.setFontSize(20);
      doc.text(`${user.client.full_name}'s Payment History`, 14, yPos);
      yPos += 10;

      if (userPayments.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [["Date", "Amount", "Plan", "Status"]],
          body: userPayments.map((payment) => [
            new Date(payment.date).toLocaleDateString(),
            payment.amount,
            payment.plan ? payment.plan.name : "N/A",
            payment.status,
          ]),
          theme: "striped",
          headStyles: { fillColor: [67, 56, 202] },
        });
        yPos = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(12);
        doc.text("No payment history available.", 14, yPos);
        yPos += 20;
      }

      if (index < filteredUsers.length - 1) doc.addPage();
    });

    doc.save("All_Payment_History.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
          <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md flex items-center justify-center">
            <Download className="w-10 h-10 mr-4" />
            Payment History
          </h1>
          <p className="text-center text-indigo-100 mt-3 text-xl font-light">
            Track Client Payments with Precision
          </p>
        </div>

        {/* Main Content */}
        <div className="p-10 space-y-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
              <span className="ml-4 text-gray-700 text-xl font-medium">Loading Payment Records...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto" />
              <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
              <p className="text-gray-600 mt-3 text-lg">
                We're optimizing our payment system. Data will be available soon!
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <User className="w-20 h-20 text-indigo-500 mx-auto" />
              <p className="text-gray-800 text-2xl font-semibold mt-6">No Payment Records Yet</p>
              <p className="text-gray-600 mt-3 text-lg">
                Add clients and payments to start tracking history.
              </p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="flex items-center space-x-6 bg-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="relative flex-1">
                  <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden shadow-sm">
                    <Search className="w-6 h-6 text-gray-400 ml-4" />
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="px-4 py-3 w-full focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700 placeholder-gray-400"
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
                  className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* User List */}
              {currentUsers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
                  <Search className="w-20 h-20 text-indigo-500 mx-auto" />
                  <p className="text-gray-800 text-2xl font-semibold mt-6">No Matching Records</p>
                  <p className="text-gray-600 mt-3 text-lg">
                    Adjust your search or filter to find payment history.
                  </p>
                </div>
              ) : (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <User className="w-8 h-8 text-indigo-600" />
                        <h3 className="text-2xl font-semibold text-gray-900">{user.client.full_name}</h3>
                        <Phone className="w-6 h-6 text-gray-500" />
                        <span className="text-gray-600">{user.client.phonenumber}</span>
                      </div>
                      <button
                        onClick={() => generatePDFForUser(user)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-5 h-5 mr-2" /> Download PDF
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Plan</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPayments
                            .filter((payment) => payment.user === user.id)
                            .map((payment) => (
                              <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
                                    {new Date(payment.date).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{payment.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                  {payment.plan ? payment.plan.name : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {payment.status === "Paid" ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
                                  ) : payment.status === "Failed" ? (
                                    <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2" />
                                  ) : (
                                    <PauseCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
                                  )}
                                  <span
                                    className={`font-semibold ${
                                      payment.status === "Paid"
                                        ? "text-green-600"
                                        : payment.status === "Failed"
                                        ? "text-red-600"
                                        : "text-yellow-600"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          {filteredPayments.filter((payment) => payment.user === user.id).length === 0 && (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-gray-600">
                                No payment history available for this user.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {currentUsers.length > 0 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Download All Button */}
              {filteredUsers.length > 0 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={generateAllPDFs}
                    className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Download className="w-6 h-6 mr-3" /> Download All Reports
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;