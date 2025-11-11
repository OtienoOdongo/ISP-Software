// components/SessionHistory.jsx
import React from 'react';
import { Clock, Wifi, User, HardDrive, Calendar, Zap } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext'
import { formatDuration, formatBytesToGB } from '../../UserManagement/components/utils/clientDataFormatter'

const SessionHistory = ({ sessions, theme }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className={`text-center py-8 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <Clock size={24} className="mx-auto mb-2 opacity-50" />
        <p>No session history found</p>
      </div>
    );
  }

  const getSessionIcon = (type) => {
    return type === 'hotspot' ? Wifi : User;
  };

  const getSessionColor = (type) => {
    return type === 'hotspot' ? 'orange' : 'purple';
  };

  return (
    <div className="space-y-3">
      <h4 className={`font-medium mb-3 flex items-center gap-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <Zap size={16} />
        Connection Sessions ({sessions.length})
      </h4>
      
      {sessions.map((session, index) => {
        const SessionIcon = getSessionIcon(session.type);
        const color = getSessionColor(session.type);
        
        return (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' 
                    ? `bg-${color}-900/20 text-${color}-400`
                    : `bg-${color}-100 text-${color}-600`
                }`}>
                  <SessionIcon size={16} />
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    theme === 'dark' 
                      ? `bg-${color}-900/20 text-${color}-400`
                      : `bg-${color}-100 text-${color}-700`
                  }`}>
                    {session.type.toUpperCase()}
                  </span>
                  {session.active && (
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      theme === 'dark' 
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(session.connected_at).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {session.type === 'hotspot' ? session.mac : session.username}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Wifi size={14} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {session.router || 'Unknown Router'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={14} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {session.duration_formatted || formatDuration(session.duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap size={14} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {formatBytesToGB(session.data_used || 0)} GB
                </span>
              </div>
            </div>

            {session.ip_address && (
              <div className={`mt-2 text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                IP: {session.ip_address}
                {session.router_ip && ` • Router: ${session.router_ip}`}
              </div>
            )}

            {session.disconnected_at && (
              <div className={`mt-2 text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Disconnected: {new Date(session.disconnected_at).toLocaleString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionHistory;