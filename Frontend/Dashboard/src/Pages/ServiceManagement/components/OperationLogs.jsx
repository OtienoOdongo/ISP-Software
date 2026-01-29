// src/pages/ServiceOperations/components/OperationLogs.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api";
import { getThemeClasses } from "../../../components/ServiceManagement/Shared/components"
import { Terminal, AlertCircle, CheckCircle, Info } from "lucide-react";

const OperationLogs = ({ theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/service_operations/operation_logs/");
        setLogs(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getLevelIcon = (level) => {
    switch (level) {
      case "error": return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info": return <Info className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      <h2 className="text-2xl font-bold">Operation Logs</h2>

      {loading ? (
        <div className="text-center py-12">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">No logs available</p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className={`sticky top-0 ${themeClasses.bg.secondary}`}>
                <tr>
                  <th className="p-4 text-left">Level</th>
                  <th className="p-4 text-left">Timestamp</th>
                  <th className="p-4 text-left">Message</th>
                  <th className="p-4 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4 flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="capitalize text-sm">{log.level}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm max-w-md truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{log.source || "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationLogs;