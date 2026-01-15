// src/pages/ServiceOperations/components/ClientOperations.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api";
import { getThemeClasses } from "../../Shared/components";
import { FileText, Clock, Check, X, AlertTriangle } from "lucide-react";

const ClientOperations = ({ theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOps = async () => {
      try {
        const res = await api.get("/api/service_operations/client_operations/");
        setOperations(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOps();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <Check className="w-5 h-5 text-green-600" />;
      case "failed": return <X className="w-5 h-5 text-red-600" />;
      case "pending": return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      <h2 className="text-2xl font-bold">Client Operations Log</h2>

      {loading ? (
        <div className="text-center py-12">Loading operations...</div>
      ) : operations.length === 0 ? (
        <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">No client operations recorded</p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <table className="w-full">
            <thead className={`${themeClasses.bg.secondary}`}>
              <tr>
                <th className="p-4 text-left">Client</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {operations.map(op => (
                <tr key={op.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">{op.client_name || op.client_phone || "Anonymous"}</td>
                  <td className="p-4">{op.operation_type}</td>
                  <td className="p-4 flex items-center gap-2">
                    {getStatusIcon(op.status)}
                    <span className="capitalize">{op.status}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(op.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-gray-600 truncate max-w-xs">
                    {op.details || op.error_message || "No details"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientOperations;