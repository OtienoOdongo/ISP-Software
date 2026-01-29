// import React, { useCallback } from 'react';
// import { FaSearch, FaDownload } from 'react-icons/fa';
// import { CSVLink } from 'react-csv';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { EnhancedSelect, EnhancedDatePicker } from '../../ServiceManagement/Shared/components'
// import api from '../../../api'

// const TransactionFilters = ({ filters, onFilterChange, onRefresh, loading, theme }) => {
//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'success', label: 'Success' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'failed', label: 'Failed' },
//     { value: 'refunded', label: 'Refunded' }
//   ];

//   const paymentMethodOptions = [
//     { value: 'all', label: 'All Methods' },
//     { value: 'mpesa', label: 'M-Pesa' },
//     { value: 'paypal', label: 'PayPal' },
//     { value: 'bank_transfer', label: 'Bank Transfer' }
//   ];

//   const accessTypeOptions = [
//     { value: 'all', label: 'All Access Types' },
//     { value: 'hotspot', label: 'Hotspot' },
//     { value: 'pppoe', label: 'PPPoE' },
//     { value: 'both', label: 'Both' }
//   ];

//   const sortOptions = [
//     { value: 'date_desc', label: 'Date (Newest First)' },
//     { value: 'date_asc', label: 'Date (Oldest First)' },
//     { value: 'amount_desc', label: 'Amount (High to Low)' },
//     { value: 'amount_asc', label: 'Amount (Low to High)' }
//   ];

//   const handleSearchChange = useCallback((value) => {
//     onFilterChange({ searchTerm: value });
//   }, [onFilterChange]);

//   const handleStatusChange = useCallback((value) => {
//     onFilterChange({ status: value });
//   }, [onFilterChange]);

//   const handlePaymentMethodChange = useCallback((value) => {
//     onFilterChange({ paymentMethod: value });
//   }, [onFilterChange]);

//   const handleAccessTypeChange = useCallback((value) => {
//     onFilterChange({ accessType: value });
//   }, [onFilterChange]);

//   const handleSortChange = useCallback((value) => {
//     onFilterChange({ sortBy: value });
//   }, [onFilterChange]);

//   const handleDateChange = useCallback((type, date) => {
//     onFilterChange({ [type]: date });
//   }, [onFilterChange]);

//   const generateReport = async () => {
//     try {
//       const params = {
//         start_date: filters.startDate.toISOString().split('T')[0],
//         end_date: filters.endDate.toISOString().split('T')[0],
//         status: filters.status !== 'all' ? filters.status : undefined,
//         payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
//         access_type: filters.accessType !== 'all' ? filters.accessType : undefined,
//         page_size: 1000
//       };

//       const cleanParams = Object.fromEntries(
//         Object.entries(params).filter(([_, value]) => value !== undefined)
//       );

//       const response = await api.get('/api/payments/transactions/', { params: cleanParams });
//       const data = response.data.transactions || [];

//       if (data.length === 0) {
//         alert('No data available for report generation');
//         return;
//       }

//       const doc = new jsPDF();
//       doc.setFontSize(16);
//       doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });

//       const headers = [[
//         'Transaction ID', 'User', 'Access Type', 'Amount (KES)', 'Status', 
//         'Payment Method', 'Plan', 'Reference', 'Date & Time'
//       ]];
      
//       const rows = data.map(tx => [
//         tx.transactionId || 'N/A',
//         tx.userName || 'N/A',
//         tx.accessTypeDisplay || tx.accessType || 'N/A',
//         (parseFloat(tx.amount) || 0).toLocaleString(),
//         tx.status?.toUpperCase() || 'N/A',
//         tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A',
//         tx.planName || 'N/A',
//         tx.referenceNumber || 'N/A',
//         new Date(tx.date || tx.created_at).toLocaleString()
//       ]);

//       doc.autoTable({
//         head: headers,
//         body: rows,
//         startY: 30,
//         styles: { fontSize: 7 },
//         headStyles: { fillColor: [59, 130, 246] },
//         columnStyles: {
//           0: { cellWidth: 25 },
//           1: { cellWidth: 20 },
//           2: { cellWidth: 15 },
//           3: { cellWidth: 15 },
//           4: { cellWidth: 15 },
//           5: { cellWidth: 20 },
//           6: { cellWidth: 20 },
//           7: { cellWidth: 20 },
//           8: { cellWidth: 25 }
//         }
//       });

//       doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
//     } catch (err) {
//       console.error('PDF generation error:', err);
//       alert('Failed to generate PDF report');
//     }
//   };

//   const fetchExportData = async () => {
//     try {
//       const params = {
//         start_date: filters.startDate.toISOString().split('T')[0],
//         end_date: filters.endDate.toISOString().split('T')[0],
//         status: filters.status !== 'all' ? filters.status : undefined,
//         payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
//         access_type: filters.accessType !== 'all' ? filters.accessType : undefined,
//         page_size: 1000
//       };

//       const cleanParams = Object.fromEntries(
//         Object.entries(params).filter(([_, value]) => value !== undefined)
//       );

//       const response = await api.get('/api/payments/transactions/', { params: cleanParams });
//       return response.data.transactions || [];
//     } catch (err) {
//       console.error('Export data error:', err);
//       return [];
//     }
//   };

//   const themeClasses = {
//     card: theme === 'dark' 
//       ? 'bg-gray-800 border-gray-700' 
//       : 'bg-white border-gray-200',
//     input: theme === 'dark'
//       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
//       : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
//   };

//   return (
//     <div className={`p-6 rounded-xl shadow-lg mb-6 ${themeClasses.card}`}>
//       <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
//         {/* Search */}
//         <div className="relative flex-grow w-full lg:w-auto">
//           <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search transactions..."
//             className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${themeClasses.input}`}
//             value={filters.searchTerm}
//             onChange={(e) => handleSearchChange(e.target.value)}
//           />
//         </div>

//         {/* Status Filter */}
//         <EnhancedSelect
//           value={filters.status}
//           onChange={handleStatusChange}
//           options={statusOptions}
//           placeholder="All Status"
//           theme={theme}
//           className="w-full lg:w-40"
//         />

//         {/* Payment Method Filter */}
//         <EnhancedSelect
//           value={filters.paymentMethod}
//           onChange={handlePaymentMethodChange}
//           options={paymentMethodOptions}
//           placeholder="All Methods"
//           theme={theme}
//           className="w-full lg:w-40"
//         />

//         {/* Access Type Filter */}
//         <EnhancedSelect
//           value={filters.accessType}
//           onChange={handleAccessTypeChange}
//           options={accessTypeOptions}
//           placeholder="All Access Types"
//           theme={theme}
//           className="w-full lg:w-40"
//         />

//         {/* Sort Select */}
//         <EnhancedSelect
//           value={filters.sortBy}
//           onChange={handleSortChange}
//           options={sortOptions}
//           placeholder="Sort by"
//           theme={theme}
//           className="w-full lg:w-48"
//         />

//         {/* Date Pickers */}
//         <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
//           <EnhancedDatePicker
//             selected={filters.startDate}
//             onChange={(date) => handleDateChange('startDate', date)}
//             selectsStart
//             startDate={filters.startDate}
//             endDate={filters.endDate}
//             placeholderText="Start Date"
//             theme={theme}
//             className="w-full sm:w-40"
//           />
//           <EnhancedDatePicker
//             selected={filters.endDate}
//             onChange={(date) => handleDateChange('endDate', date)}
//             selectsEnd
//             startDate={filters.startDate}
//             endDate={filters.endDate}
//             minDate={filters.startDate}
//             placeholderText="End Date"
//             theme={theme}
//             className="w-full sm:w-40"
//           />
//         </div>

//         {/* Export Buttons */}
//         <div className="flex gap-2 w-full lg:w-auto">
//           <button 
//             onClick={generateReport}
//             disabled={loading}
//             className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//           >
//             <FaDownload />
//             PDF
//           </button>
//           <CSVLink
//             data={async () => {
//               const data = await fetchExportData();
//               return data.map(tx => ({
//                 'Transaction ID': tx.transactionId,
//                 'User': tx.userName,
//                 'Access Type': tx.accessTypeDisplay || tx.accessType,
//                 'Amount (KES)': parseFloat(tx.amount) || 0,
//                 'Status': tx.status,
//                 'Payment Method': tx.paymentMethod,
//                 'Plan': tx.planName || 'N/A',
//                 'Reference Number': tx.referenceNumber,
//                 'Date & Time': new Date(tx.date || tx.created_at).toLocaleString()
//               }));
//             }}
//             filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
//             className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
//           >
//             <FaDownload />
//             CSV
//           </CSVLink>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransactionFilters;











import React, { useState, useCallback, useEffect } from 'react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EnhancedSelect, DateRangePicker  } from '../../ServiceManagement/Shared/components';
import api from '../../../api';

const TransactionFilters = ({ filters, onFilterChange, onRefresh, loading, theme }) => {
  const [csvData, setCsvData] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const accessTypeOptions = [
    { value: 'all', label: 'All Access Types' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' },
    { value: 'both', label: 'Both' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'amount_desc', label: 'Amount (High to Low)' },
    { value: 'amount_asc', label: 'Amount (Low to High)' }
  ];

  const handleSearchChange = useCallback((value) => {
    onFilterChange({ searchTerm: value });
  }, [onFilterChange]);

  const handleStatusChange = useCallback((value) => {
    onFilterChange({ status: value });
  }, [onFilterChange]);

  const handlePaymentMethodChange = useCallback((value) => {
    onFilterChange({ paymentMethod: value });
  }, [onFilterChange]);

  const handleAccessTypeChange = useCallback((value) => {
    onFilterChange({ accessType: value });
  }, [onFilterChange]);

  const handleSortChange = useCallback((value) => {
    onFilterChange({ sortBy: value });
  }, [onFilterChange]);

  const handleDateChange = useCallback((type, date) => {
    onFilterChange({ [type]: date });
  }, [onFilterChange]);

  const fetchExportData = async () => {
    try {
      const params = {
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        status: filters.status !== 'all' ? filters.status : undefined,
        payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        access_type: filters.accessType !== 'all' ? filters.accessType : undefined,
        page_size: 1000
      };

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await api.get('/api/payments/transactions/', { params: cleanParams });
      return response.data.transactions || [];
    } catch (err) {
      console.error('Export data error:', err);
      return [];
    }
  };

  // Update CSV data when filters change
  useEffect(() => {
    const updateCSVData = async () => {
      const data = await fetchExportData();
      const formattedData = data.map(tx => ({
        'Transaction ID': tx.transactionId || 'N/A',
        'User': tx.userName || 'N/A',
        'Access Type': tx.accessTypeDisplay || tx.accessType || 'N/A',
        'Amount (KES)': parseFloat(tx.amount) || 0,
        'Status': tx.status?.toUpperCase() || 'N/A',
        'Payment Method': tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A',
        'Plan': tx.planName || 'N/A',
        'Reference Number': tx.referenceNumber || 'N/A',
        'Date & Time': new Date(tx.date || tx.created_at).toLocaleString()
      }));
      setCsvData(formattedData);
    };

    updateCSVData();
  }, [filters]);

  const generateReport = async () => {
    try {
      const data = await fetchExportData();

      if (data.length === 0) {
        alert('No data available for report generation');
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });

      const headers = [[
        'Transaction ID', 'User', 'Access Type', 'Amount (KES)', 'Status', 
        'Payment Method', 'Plan', 'Reference', 'Date & Time'
      ]];
      
      const rows = data.map(tx => [
        tx.transactionId || 'N/A',
        tx.userName || 'N/A',
        tx.accessTypeDisplay || tx.accessType || 'N/A',
        (parseFloat(tx.amount) || 0).toLocaleString(),
        tx.status?.toUpperCase() || 'N/A',
        tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A',
        tx.planName || 'N/A',
        tx.referenceNumber || 'N/A',
        new Date(tx.date || tx.created_at).toLocaleString()
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 30,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: 25 }
        }
      });

      doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF report');
    }
  };

  const themeClasses = {
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg mb-6 ${themeClasses.card}`}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="relative flex-grow w-full lg:w-auto">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${themeClasses.input}`}
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <EnhancedSelect
          value={filters.status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder="All Status"
          theme={theme}
          className="w-full lg:w-40"
        />

        {/* Payment Method Filter */}
        <EnhancedSelect
          value={filters.paymentMethod}
          onChange={handlePaymentMethodChange}
          options={paymentMethodOptions}
          placeholder="All Methods"
          theme={theme}
          className="w-full lg:w-40"
        />

        {/* Access Type Filter */}
        <EnhancedSelect
          value={filters.accessType}
          onChange={handleAccessTypeChange}
          options={accessTypeOptions}
          placeholder="All Access Types"
          theme={theme}
          className="w-full lg:w-40"
        />

        {/* Sort Select */}
        <EnhancedSelect
          value={filters.sortBy}
          onChange={handleSortChange}
          options={sortOptions}
          placeholder="Sort by"
          theme={theme}
          className="w-full lg:w-48"
        />

        {/* Date Pickers */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <DateRangePicker 
            selected={filters.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            selectsStart
            startDate={filters.startDate}
            endDate={filters.endDate}
            placeholderText="Start Date"
            theme={theme}
            className="w-full sm:w-40"
          />
          <DateRangePicker 
            selected={filters.endDate}
            onChange={(date) => handleDateChange('endDate', date)}
            selectsEnd
            startDate={filters.startDate}
            endDate={filters.endDate}
            minDate={filters.startDate}
            placeholderText="End Date"
            theme={theme}
            className="w-full sm:w-40"
          />
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button 
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaDownload />
            PDF
          </button>
          <CSVLink
            data={csvData}
            filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
          >
            <FaDownload />
            CSV
          </CSVLink>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;