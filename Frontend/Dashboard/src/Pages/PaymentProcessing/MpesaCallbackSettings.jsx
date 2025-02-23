import React, { useState, useCallback, useMemo } from 'react';
import {
  IoAddCircleOutline as AddIcon,
  IoSaveOutline as SaveIcon,
  IoPencilOutline as EditIcon,
  IoTrashOutline as DeleteIcon,
  IoSearchOutline as SearchIcon
} from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const MpesaCallbackSettings = () => {
  const [callbacks, setCallbacks] = useLocalStorage('mpesa-callbacks', []);
  const [newCallback, setNewCallback] = useState({ event: '', url: '' });
  const [editingId, setEditingId] = useState(null);
  const [eventOptions] = useState([
    'Payment Success', 'Payment Failure', 'Transaction Cancellation'
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleChange = useCallback((e, field) => {
    setNewCallback(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const addOrUpdateCallback = useCallback(() => {
    if (newCallback.event && newCallback.url) {
      if (editingId) {
        updateCallback();
      } else {
        addCallback();
      }
    } else {
      toast.error('Please fill in both event and URL fields.', {
        autoClose: 3000,
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }, [newCallback, editingId]);

  const addCallback = useCallback(() => {
    setCallbacks(prevCallbacks => [...prevCallbacks, { ...newCallback, id: Date.now() }]);
    setNewCallback({ event: '', url: '' });
    toast.success('New callback added successfully.', {
      autoClose: 3000,
      position: toast.POSITION.TOP_RIGHT
    });
  }, [newCallback]);

  const updateCallback = useCallback(() => {
    setCallbacks(prevCallbacks =>
      prevCallbacks.map(cb => cb.id === editingId ? { ...newCallback, id: cb.id } : cb)
    );
    setNewCallback({ event: '', url: '' });
    setEditingId(null);
    toast.success('Callback updated successfully.', {
      autoClose: 3000,
      position: toast.POSITION.TOP_RIGHT
    });
  }, [newCallback, editingId]);

  const editCallback = useCallback((id) => {
    const callbackToEdit = callbacks.find(cb => cb.id === id);
    if (callbackToEdit) {
      setNewCallback(callbackToEdit);
      setEditingId(id);
    }
  }, [callbacks]);

  const deleteCallback = useCallback((id) => {
    setCallbacks(prevCallbacks => prevCallbacks.filter(cb => cb.id !== id));
    toast.info('Callback deleted successfully.', {
      autoClose: 3000,
      position: toast.POSITION.TOP_RIGHT
    });
  }, []);

  const filteredCallbacks = useMemo(() => {
    return callbacks.filter(callback =>
      callback.event.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeFilter === 'all' || callback.event === activeFilter)
    );
  }, [callbacks, searchTerm, activeFilter]);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-indigo-900">M-Pesa Callback Settings</h1>

      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full md:w-2/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by event..."
          />
          <button
            className="ml-3 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none"
            onClick={() => { /* search logic if needed */ }}
          >
            <SearchIcon />
          </button>
        </div>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="ml-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Events</option>
          {eventOptions.map((event, index) => (
            <option key={index} value={event}>{event}</option>
          ))}
        </select>
      </div>

      {/* Callback Form */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Callbacks</h2>
        <div className="mb-4">
          <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">Event</label>
          <select
            id="event"
            value={newCallback.event}
            onChange={(e) => handleChange(e, 'event')}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select an event</option>
            {eventOptions.map((event, index) => (
              <option key={index} value={event}>{event}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
          <input
            id="url"
            type="url"
            value={newCallback.url}
            onChange={(e) => handleChange(e, 'url')}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter callback URL"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={addOrUpdateCallback}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none"
          >
            {editingId !== null ? <SaveIcon className="mr-2" /> : <AddIcon className="mr-2" />}
            {editingId !== null ? 'Update Callback' : 'Add Callback'}
          </button>
        </div>
      </div>

      {/* Callbacks Table */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Callbacks</h2>
        {filteredCallbacks.length === 0 ? (
          <p className="text-center text-gray-500">No callbacks match your criteria.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Event</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">URL</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCallbacks.map(callback => (
                <tr key={callback.id} className="border-b">
                  <td className="py-3 px-4">{callback.event}</td>
                  <td className="py-3 px-4">
                    <a href={callback.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {callback.url}
                    </a>
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => editCallback(callback.id)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => deleteCallback(callback.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default MpesaCallbackSettings;