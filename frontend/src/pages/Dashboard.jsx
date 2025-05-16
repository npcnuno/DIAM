import { useState, useEffect } from 'react';
import Api from './components/home/api.ts';

function Dashboard() {
  const [transportRequests, setTransportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    destination: '',
    patient_type: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.getTransportRequests();
        setTransportRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch transport requests');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      if (currentRequest) {
        await Api.updateTransportRequest(currentRequest.id, formData);
        alert('Request updated successfully!');
      } else {
        await Api.createTransportRequest(formData);
        alert('Request created successfully!');
      }
      setModalOpen(false);
      setCurrentRequest(null);
      setFormData({ date: '', destination: '', patient_type: '', status: '' });
      const response = await Api.getTransportRequests();
      setTransportRequests(response.data);
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await Api.deleteTransportRequest(id);
        alert('Request deleted successfully!');
        setTransportRequests(transportRequests.filter((req) => req.id !== id));
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const openModal = (request = null) => {
    setCurrentRequest(request);
    setFormData(request || { date: '', destination: '', patient_type: '', status: '' });
    setModalOpen(true);
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Transport Requests Dashboard</h2>
      <button
        onClick={() => openModal()}
        className="mb-4 p-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Create New Request
      </button>
      <table className="w-full bg-gray-800 text-white rounded-lg">
        <thead>
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Destination</th>
            <th className="p-3">Patient Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transportRequests.map((request) => (
            <tr key={request.id}>
              <td className="p-3">{request.date}</td>
              <td className="p-3">{request.destination}</td>
              <td className="p-3">{request.patient_type}</td>
              <td className="p-3">{request.status}</td>
              <td className="p-3">
                <button
                  onClick={() => openModal(request)}
                  className="mr-2 p-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(request.id)}
                  className="p-2 bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {currentRequest ? 'Edit Request' : 'Create Request'}
            </h3>
            <div className="space-y-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded"
              />
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Destination"
                className="w-full p-3 bg-gray-700 text-white rounded"
              />
              <input
                type="text"
                value={formData.patient_type}
                onChange={(e) => setFormData({ ...formData, patient_type: e.target.value })}
                placeholder="Patient Type"
                className="w-full p-3 bg-gray-700 text-white rounded"
              />
              <input
                type="text"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Status"
                className="w-full p-3 bg-gray-700 text-white rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {currentRequest ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
