import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

const AutomatedAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  // Mock API to fetch automated alerts history
  const fetchAlertHistory = () => {
    setAlerts([
      { id: 1, type: 'Data Usage', message: '90% of data limit reached.', status: 'Sent', phone: '+1234567890', timestamp: '2024-11-20 14:35' },
      { id: 2, type: 'Payment Failure', message: 'Payment failed for Plan Plus.', status: 'Sent', phone: '+1234567891', timestamp: '2024-11-20 14:00' },
      { id: 3, type: 'Network Issue', message: 'Router disconnected.', status: 'Pending', phone: '+1234567892', timestamp: '2024-11-20 13:45' },
    ]);
  };

  useEffect(() => {
    fetchAlertHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Automated Alerts History
      </h2>
      <p className="text-gray-600 text-center mb-6">
        View logs of alerts automatically sent to clients for issues like data depletion, payment failures, or network disruptions.
      </p>

      {/* Alert Logs */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow ${
              alert.status === 'Sent'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6" />
              <div>
                <p className="font-bold">{alert.type}</p>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-gray-500">
                  Sent to: {alert.phone} at {alert.timestamp}
                </p>
              </div>
            </div>
            <div>
              {alert.status === 'Sent' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Alerts */}
      {alerts.length === 0 && (
        <div className="text-center text-gray-600 mt-6">
          <p>No alerts to display.</p>
        </div>
      )}
    </div>
  );
};

export default AutomatedAlerts;
