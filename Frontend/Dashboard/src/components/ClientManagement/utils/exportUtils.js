// utils/exportUtils.js

/**
 * Converts data array to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Optional array of column definitions
 * @returns {string} CSV string
 */
export const convertToCSV = (data, columns = null) => {
  if (!data || !data.length) {
    return '';
  }

  // Determine columns if not provided
  const headers = columns || Object.keys(data[0]);
  
  // Create header row
  const csvRows = [];
  csvRows.push(headers.map(header => 
    typeof header === 'string' ? `"${header}"` : `"${header.label}"`
  ).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const key = typeof header === 'string' ? header : header.key;
      const value = row[key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Exports data as CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 * @param {Array} columns - Optional column configuration
 */
export const exportToCSV = (data, filename, columns = null) => {
  try {
    const csv = convertToCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('CSV export failed:', error);
    return { 
      success: false, 
      error: 'Failed to export CSV: ' + error.message 
    };
  }
};

/**
 * Exports data as JSON file
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 * @param {boolean} pretty - Pretty print JSON
 */
export const exportToJSON = (data, filename, pretty = true) => {
  try {
    const json = pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('JSON export failed:', error);
    return { 
      success: false, 
      error: 'Failed to export JSON: ' + error.message 
    };
  }
};

/**
 * Checks if Excel export is available
 * @returns {boolean}
 */
export const isExcelExportAvailable = () => {
  try {
    // Check if we're in a browser environment and if xlsx is available
    return typeof window !== 'undefined' && 
           window.XLSX !== undefined;
  } catch {
    return false;
  }
};

/**
 * Exports data as Excel (XLSX) file
 * Note: This requires the xlsx library to be installed
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 * @param {Array} columns - Optional column configuration
 * @returns {Promise<Object>} Result object with success/error
 */
export const exportToExcel = async (data, filename, columns = null) => {
  try {
    // Dynamically import xlsx with error handling
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch (importError) {
      return {
        success: false,
        error: 'Excel export requires the "xlsx" package. Please install it with: npm install xlsx',
        requiresInstall: true
      };
    }
    
    // Prepare data for export
    let exportData = data;
    
    if (columns && columns.length > 0) {
      // Map data according to column configuration
      exportData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          const key = typeof col === 'string' ? col : col.key;
          const label = typeof col === 'string' ? col : col.label;
          newRow[label] = row[key];
        });
        return newRow;
      });
    }
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and download
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xlsx`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Excel export failed:', error);
    return { 
      success: false, 
      error: 'Failed to export Excel: ' + error.message 
    };
  }
};

/**
 * Checks if PDF export is available
 * @returns {boolean}
 */
export const isPDFExportAvailable = () => {
  try {
    // Check if we're in a browser environment
    return typeof window !== 'undefined' && 
           window.jspdf !== undefined;
  } catch {
    return false;
  }
};

/**
 * Exports data as PDF file
 * Note: This requires jspdf and jspdf-autotable to be installed
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 * @param {string} title - Title of the PDF
 * @param {Array} columns - Optional column configuration
 * @returns {Promise<Object>} Result object with success/error
 */
export const exportToPDF = async (data, filename, title = 'Export', columns = null) => {
  try {
    // Dynamically import jspdf with error handling
    let jsPDFModule, autoTableModule;
    
    try {
      jsPDFModule = await import('jspdf');
      autoTableModule = await import('jspdf-autotable');
    } catch (importError) {
      return {
        success: false,
        error: 'PDF export requires "jspdf" and "jspdf-autotable" packages. Install with: npm install jspdf jspdf-autotable',
        requiresInstall: true
      };
    }
    
    const { jsPDF } = jsPDFModule;
    const autoTable = autoTableModule.default;
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    
    // Prepare columns and rows for table
    let tableColumns = [];
    let tableRows = [];
    
    if (columns && columns.length > 0) {
      tableColumns = columns.map(col => ({
        header: typeof col === 'string' ? col : col.label,
        dataKey: typeof col === 'string' ? col : col.key
      }));
      
      tableRows = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          const key = typeof col === 'string' ? col : col.key;
          newRow[key] = row[key];
        });
        return newRow;
      });
    } else if (data.length > 0) {
      tableColumns = Object.keys(data[0]).map(key => ({
        header: key,
        dataKey: key
      }));
      tableRows = data;
    }
    
    // Generate table
    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 }
    });
    
    // Save PDF
    doc.save(`${filename}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('PDF export failed:', error);
    return { 
      success: false, 
      error: 'Failed to export PDF: ' + error.message 
    };
  }
};

/**
 * Formats data for export based on configuration
 * @param {Array} data - Raw data
 * @param {Object} config - Export configuration
 * @returns {Array} Formatted data
 */
export const formatDataForExport = (data, config = {}) => {
  const {
    fields = null,
    formatters = {},
    filters = null,
    sortBy = null,
    sortOrder = 'asc',
    limit = null
  } = config;

  let processedData = [...data];

  // Apply filters
  if (filters) {
    processedData = processedData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'function') return value(item[key]);
        return item[key] === value;
      });
    });
  }

  // Apply sorting
  if (sortBy) {
    processedData.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply limit
  if (limit && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  // Select fields and apply formatters
  if (fields) {
    processedData = processedData.map(item => {
      const newItem = {};
      fields.forEach(field => {
        const fieldName = typeof field === 'string' ? field : field.name;
        const fieldKey = typeof field === 'string' ? field : field.key || field.name;
        
        let value = item[fieldKey];
        
        // Apply formatter if exists
        if (formatters[fieldName]) {
          value = formatters[fieldName](value, item);
        }
        
        newItem[fieldName] = value;
      });
      return newItem;
    });
  }

  return processedData;
};

/**
 * Common column configurations for different data types
 */
export const ColumnPresets = {
  clients: [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Name' },
    { key: 'phone_number', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'connection_type', label: 'Connection' },
    { key: 'tier', label: 'Tier' },
    { key: 'monthly_revenue', label: 'Monthly Revenue' },
    { key: 'lifetime_value', label: 'Lifetime Value' },
    { key: 'total_data_used', label: 'Data Used (GB)' },
    { key: 'churn_risk_score', label: 'Risk Score' },
    { key: 'customer_since', label: 'Customer Since' },
    { key: 'last_active', label: 'Last Active' },
    { key: 'location', label: 'Location' },
    { key: 'referral_code', label: 'Referral' }
  ],
  
  transactions: [
    { key: 'id', label: 'Transaction ID' },
    { key: 'client_name', label: 'Client' },
    { key: 'amount', label: 'Amount' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'created_at', label: 'Date' },
    { key: 'reference', label: 'Reference' }
  ],
  
  commissions: [
    { key: 'id', label: 'ID' },
    { key: 'marketer_name', label: 'Marketer' },
    { key: 'client_name', label: 'Client' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paid_at', label: 'Paid Date' },
    { key: 'created_at', label: 'Created' },
    { key: 'notes', label: 'Notes' }
  ],
  
  analytics: [
    { key: 'date', label: 'Date' },
    { key: 'total_clients', label: 'Total Clients' },
    { key: 'active_clients', label: 'Active' },
    { key: 'new_clients', label: 'New' },
    { key: 'churned_clients', label: 'Churned' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'avg_revenue_per_client', label: 'Avg Revenue' },
    { key: 'total_data_used', label: 'Data Used' }
  ]
};

/**
 * Common formatters for export data
 */
export const ExportFormatters = {
  currency: (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },
  
  date: (value, format = 'short') => {
    if (!value) return '';
    const date = new Date(value);
    if (format === 'short') {
      return date.toLocaleDateString();
    }
    return date.toLocaleString();
  },
  
  percentage: (value) => {
    if (value === null || value === undefined) return '';
    return `${value}%`;
  },
  
  boolean: (value) => value ? 'Yes' : 'No',
  
  status: (value) => {
    const statusMap = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      paid: 'Paid',
      unpaid: 'Unpaid'
    };
    return statusMap[value] || value;
  },
  
  dataSize: (value) => {
    if (!value) return '0 GB';
    return `${value.toFixed(1)} GB`;
  },
  
  phoneNumber: (value) => {
    if (!value) return '';
    // Format as +254 XXX XXX XXX
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return `+${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6,9)} ${cleaned.slice(9)}`;
    }
    return value;
  }
};

/**
 * Validates export data
 * @param {Array} data - Data to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateExportData = (data, options = {}) => {
  const {
    maxRows = 10000,
    requiredFields = [],
    allowedTypes = {}
  } = options;

  const errors = [];

  // Check if data exists
  if (!data || !Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Data must be an array'],
      warnings: []
    };
  }

  // Check row limit
  if (data.length > maxRows) {
    errors.push(`Data exceeds maximum row limit of ${maxRows}`);
  }

  // Check each row
  const warnings = [];
  data.forEach((row, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Check field types
    Object.entries(allowedTypes).forEach(([field, type]) => {
      if (row[field] !== undefined && row[field] !== null) {
        const actualType = typeof row[field];
        if (actualType !== type) {
          warnings.push(`Row ${index + 1}: Field '${field}' should be ${type}, got ${actualType}`);
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Splits large dataset into chunks for export
 * @param {Array} data - Data to split
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of data chunks
 */
export const chunkDataForExport = (data, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Creates a zip file containing multiple export files
 * Note: Requires JSZip library
 * @param {Array} files - Array of file configurations
 * @param {string} zipName - Name of the zip file
 * @returns {Promise<Object>} Result object with success/error
 */
export const createExportZip = async (files, zipName = 'export') => {
  try {
    // Dynamically import JSZip with error handling
    let JSZip;
    try {
      JSZip = (await import('jszip')).default;
    } catch (importError) {
      return {
        success: false,
        error: 'ZIP creation requires "jszip" package. Install with: npm install jszip',
        requiresInstall: true
      };
    }
    
    const zip = new JSZip();

    // Add each file to zip
    files.forEach(file => {
      const { data, filename, type, columns } = file;
      
      if (type === 'csv') {
        const csv = convertToCSV(data, columns);
        zip.file(`${filename}.csv`, csv);
      } else if (type === 'json') {
        const json = JSON.stringify(data, null, 2);
        zip.file(`${filename}.json`, json);
      }
    });

    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download zip
    const link = document.createElement('a');
    const url = URL.createObjectURL(content);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${zipName}.zip`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Zip creation failed:', error);
    return { 
      success: false, 
      error: 'Failed to create zip: ' + error.message 
    };
  }
};

// Export all functions as a default object
export default {
  convertToCSV,
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  isExcelExportAvailable,
  isPDFExportAvailable,
  formatDataForExport,
  validateExportData,
  chunkDataForExport,
  createExportZip,
  ColumnPresets,
  ExportFormatters
};