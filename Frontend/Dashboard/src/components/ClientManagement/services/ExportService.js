



// /**
//  * Export Service
//  * Handles all export-related functionality
//  */
// import { saveAs } from 'file-saver';
// import ClientService from './ClientService'

// class ExportService {
//   /**
//    * Export clients data
//    */
//   async exportClients(filters = {}, format = 'csv') {
//     try {
//       const blob = await ClientService.exportClients(filters, format);
//       const filename = `clients_export_${new Date().toISOString().split('T')[0]}.${format}`;
//       saveAs(blob, filename);
//       return { success: true };
//     } catch (error) {
//       console.error('Export failed:', error);
//       throw error;
//     }
//   }

//   /**
//    * Export as JSON from data
//    */
//   async exportAsJSON(data, filename) {
//     const jsonString = JSON.stringify(data, null, 2);
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     saveAs(blob, `${filename}.json`);
//     return { success: true };
//   }

//   /**
//    * Export as CSV from array of objects
//    */
//   exportAsCSV(data, filename) {
//     if (!data || data.length === 0) return { success: false, error: 'No data to export' };

//     const headers = Object.keys(data[0]);
//     const csvRows = [];
    
//     csvRows.push(headers.join(','));
    
//     for (const row of data) {
//       const values = headers.map(header => {
//         const value = row[header];
//         if (value === null || value === undefined) return '';
//         if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
//         return value;
//       });
//       csvRows.push(values.join(','));
//     }
    
//     const csvString = csvRows.join('\n');
//     const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, `${filename}.csv`);
    
//     return { success: true };
//   }

//   /**
//    * Prepare data for export from clients
//    */
//   prepareClientExportData(clients) {
//     return clients.map(client => ({
//       ID: client.id,
//       Username: client.username,
//       'Phone Number': client.phone_number,
//       'Connection Type': client.connection_type,
//       Status: client.status,
//       Tier: client.tier,
//       'Lifetime Value': client.lifetime_value,
//       'Monthly Revenue': client.monthly_recurring_revenue,
//       'Total Data (GB)': client.total_data_used_gb,
//       'Churn Risk': client.churn_risk_score,
//       'Engagement Score': client.engagement_score,
//       'Customer Since': client.customer_since,
//       'Last Login': client.last_login_date,
//       'Last Payment': client.last_payment_date,
//       'Days Active': client.days_active,
//       'Referral Code': client.referral_code,
//       'Is Marketer': client.is_marketer ? 'Yes' : 'No',
//       'Marketer Tier': client.marketer_tier
//     }));
//   }

//   /**
//    * Prepare data for export from transactions
//    */
//   prepareTransactionExportData(transactions) {
//     return transactions.map(tx => ({
//       ID: tx.id,
//       Reference: tx.reference_id,
//       Marketer: tx.marketer_name,
//       Type: tx.transaction_type,
//       Amount: tx.amount,
//       Status: tx.status,
//       Date: tx.transaction_date,
//       'Payment Method': tx.payment_method,
//       'Payment Reference': tx.payment_reference,
//       Description: tx.description
//     }));
//   }
// }

// export default new ExportService();








/**
 * Export Service
 * Handles all export-related functionality
 */
import { saveAs } from 'file-saver';
import ClientService from '../services/ClientService';

class ExportService {
  /**
   * Export clients data
   */
  async exportClients(filters = {}, format = 'csv') {
    try {
      const blob = await ClientService.exportClients(filters, format);
      const filename = `clients_export_${new Date().toISOString().split('T')[0]}.${format}`;
      saveAs(blob, filename);
      return { success: true };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Export as JSON from data
   */
  async exportAsJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
    return { success: true };
  }

  /**
   * Export as CSV from array of objects
   */
  exportAsCSV(data, filename) {
    if (!data || data.length === 0) return { success: false, error: 'No data to export' };

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === 'string') return value;
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    
    return { success: true };
  }

  /**
   * Prepare data for export from clients
   */
  prepareClientExportData(clients) {
    return clients.map(client => ({
      ID: client.id,
      Username: client.username,
      'Phone Number': client.phone_number,
      'Connection Type': client.connection_type,
      Status: client.status,
      Tier: client.tier,
      'Lifetime Value': client.lifetime_value,
      'Monthly Revenue': client.monthly_recurring_revenue,
      'Total Data (GB)': client.total_data_used_gb,
      'Churn Risk': client.churn_risk_score,
      'Engagement Score': client.engagement_score,
      'Customer Since': client.created_at || client.customer_since,
      'Last Login': client.last_login_date,
      'Last Payment': client.last_payment_date,
      'Days Active': client.days_active,
      'Referral Code': client.referral_code,
      'Is Marketer': client.is_marketer ? 'Yes' : 'No',
      'Marketer Tier': client.marketer_tier
    }));
  }

  /**
   * Prepare data for export from transactions
   */
  prepareTransactionExportData(transactions) {
    return transactions.map(tx => ({
      ID: tx.id,
      Reference: tx.reference_id,
      Marketer: tx.marketer_name,
      Type: tx.transaction_type,
      Amount: tx.amount,
      Status: tx.status,
      Date: tx.transaction_date || tx.created_at,
      'Payment Method': tx.payment_method,
      'Payment Reference': tx.payment_reference,
      Description: tx.description
    }));
  }
}

export default new ExportService();