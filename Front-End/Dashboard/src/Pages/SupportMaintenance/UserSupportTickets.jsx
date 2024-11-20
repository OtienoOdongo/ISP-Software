import React, { useState } from 'react';

const UserSupportTickets = () => {
  // Sample ticket data (In a real app, this would be fetched from an API)
  const initialTickets = [
    { id: 1, user: 'John Doe', issue: 'Unable to connect to internet', status: 'Pending', date: '2024-11-01' },
    { id: 2, user: 'Jane Smith', issue: 'Slow internet speed', status: 'In Progress', date: '2024-11-02' },
    { id: 3, user: 'Mike Ross', issue: 'Intermittent disconnections', status: 'Resolved', date: '2024-11-03' },
  ];

  const [tickets, setTickets] = useState(initialTickets);

  // Function to handle ticket status update
  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Support Tickets</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Ticket Management</h2>

        {/* Tickets Table */}
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">Ticket ID</th>
              <th className="py-2 px-4 text-left">User</th>
              <th className="py-2 px-4 text-left">Issue</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Date Created</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-b">
                <td className="py-2 px-4">{ticket.id}</td>
                <td className="py-2 px-4">{ticket.user}</td>
                <td className="py-2 px-4">{ticket.issue}</td>
                <td className="py-2 px-4">
                  <span
                    className={`inline-block py-1 px-3 rounded-full text-white ${
                      ticket.status === 'Pending' ? 'bg-yellow-500' :
                      ticket.status === 'In Progress' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="py-2 px-4">{ticket.date}</td>
                <td className="py-2 px-4">
                  {/* Action buttons */}
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'In Progress')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                    disabled={ticket.status === 'In Progress' || ticket.status === 'Resolved'}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'Resolved')}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    disabled={ticket.status === 'Resolved'}
                  >
                    Resolved
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSupportTickets;
