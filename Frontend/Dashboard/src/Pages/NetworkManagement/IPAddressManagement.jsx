



import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiEdit, FiTrash } from 'react-icons/fi';

const IPAddressList = () => {
  const [ipAddresses, setIPAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ip_address', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIP, setEditIP] = useState(null);
  const [newIP, setNewIP] = useState({
    ip_address: '',
    status: 'available',
    assigned_to: '',
    description: '',
    subnet: { network_address: '', netmask: '' },
  });

  const mockIPAddresses = [
    { id: 1, ip_address: '192.168.1.1', status: 'assigned', assigned_to: 'Router', description: 'Main network router', subnet: { network_address: '192.168.1.0', netmask: '255.255.255.0' } },
    { id: 2, ip_address: '192.168.1.2', status: 'available', assigned_to: '', description: 'Free IP for new device', subnet: { network_address: '192.168.1.0', netmask: '255.255.255.0' } },
    { id: 3, ip_address: '192.168.1.3', status: 'reserved', assigned_to: 'Server', description: 'Reserved for server maintenance', subnet: { network_address: '192.168.1.0', netmask: '255.255.255.0' } },
  ];

  useEffect(() => {
    setIPAddresses(mockIPAddresses);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedIPAddresses = React.useMemo(() => {
    return [...ipAddresses].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [ipAddresses, sortConfig]);

  const filteredIPAddresses = sortedIPAddresses.filter(
    (ip) =>
      ip.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ip.assigned_to && ip.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIPAddresses.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddOrEdit = () => {
    if (editIP) {
      setIPAddresses(ipAddresses.map((ip) => (ip.id === editIP.id ? { ...ip, ...newIP } : ip)));
    } else {
      setIPAddresses([...ipAddresses, { ...newIP, id: ipAddresses.length + 1 }]);
    }
    setNewIP({ ip_address: '', status: 'available', assigned_to: '', description: '', subnet: { network_address: '', netmask: '' } });
    setEditIP(null);
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'netmask' || name === 'network_address') {
      setNewIP(prev => ({
        ...prev,
        subnet: {
          ...prev.subnet,
          [name]: value
        }
      }));
    } else {
      setNewIP(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDelete = (id) => setIPAddresses(ipAddresses.filter((ip) => ip.id !== id));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">IP Address Management</h1>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          className="p-2 border rounded-md w-1/2"
          placeholder="Search IP or Assigned To..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <FaPlus className="inline-block mr-2" /> Add IP
        </button>
      </div>
      <table className="w-full bg-white rounded-md shadow-md border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('ip_address')}>IP Address</th>
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('status')}>Status</th>
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('assigned_to')}>Assigned To</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Subnet</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((ip) => (
            <tr key={ip.id} className="border-b">
              <td className="py-2 px-4">{ip.ip_address}</td>
              <td className="py-2 px-4">
                <span className={
                  ip.status === 'available' ? 'text-green-500' :
                    ip.status === 'assigned' ? 'text-blue-500' :
                      'text-yellow-500'
                }>
                  {ip.status}
                </span>
              </td>
              <td className="py-2 px-4">{ip.assigned_to || '-'}</td>
              <td className="py-2 px-4">{ip.description || '-'}</td>
              <td className="py-2 px-4">{`${ip.subnet.network_address}/${ip.subnet.netmask}`}</td>
              <td className="py-2 px-4 flex space-x-2">
                <button
                  onClick={() => { setEditIP(ip); setNewIP(ip); setShowAddModal(true); }}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit IP Address"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(ip.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete IP Address"
                >
                  <FiTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">{editIP ? "Edit IP Address" : "Add New IP Address"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddOrEdit(); }}>
              <input
                type="text"
                name="ip_address"
                value={newIP.ip_address}
                onChange={handleInputChange}
                placeholder="IP Address"
                className="mb-2 p-2 border w-full rounded-md"
              />
              <select
                name="status"
                value={newIP.status}
                onChange={handleInputChange}
                className="mb-2 p-2 border w-full rounded-md"
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="reserved">Reserved</option>
              </select>
              <input
                type="text"
                name="assigned_to"
                value={newIP.assigned_to}
                onChange={handleInputChange}
                placeholder="Assigned To"
                className="mb-2 p-2 border w-full rounded-md"
              />
              <input
                type="text"
                name="description"
                value={newIP.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="mb-2 p-2 border w-full rounded-md"
              />
              <input
                type="text"
                name="network_address"
                value={newIP.subnet.network_address}
                onChange={handleInputChange}
                placeholder="Network Address"
                className="mb-2 p-2 border w-full rounded-md"
              />
              <input
                type="text"
                name="netmask"
                value={newIP.subnet.netmask}
                onChange={handleInputChange}
                placeholder="Netmask"
                className="mb-2 p-2 border w-full rounded-md"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => { setShowAddModal(false); setEditIP(null); setNewIP({ ip_address: '', status: 'available', assigned_to: '', description: '', subnet: { network_address: '', netmask: '' } }); }}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-green-500 text-white p-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPAddressList;
