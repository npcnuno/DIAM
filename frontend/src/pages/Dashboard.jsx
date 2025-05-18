import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/button";
import { Input } from "./components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog";
import Api from "./api";

export function Dashboard() {
  const [transportRequests, setTransportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    destination: "",
    patient_type: "",
    status: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }
    setUserRole(user.role);
    setUserId(user.id);

    const fetchData = async () => {
      try {
        const response = await Api.getTransportRequests();
        let requests = response.data;
        if (user.role === "Pessoal") {
          requests = requests.filter((req) => req.tripulante?.id === user.id);
        }
        setTransportRequests(requests);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch transport requests");
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateOrUpdate = async () => {
    try {
      if (currentRequest) {
        await Api.updateTransportRequest(currentRequest.id, formData);
        alert("Request updated successfully!");
      } else {
        await Api.createTransportRequest(formData);
        alert("Request created successfully!");
      }
      setModalOpen(false);
      setCurrentRequest(null);
      setFormData({ date: "", destination: "", patient_type: "", status: "" });
      const response = await Api.getTransportRequests();
      let requests = response.data;
      if (userRole === "Pessoal") {
        requests = requests.filter((req) => req.tripulante?.id === userId);
      }
      setTransportRequests(requests);
    } catch (err) {
      alert(
        "Operation failed: " + (err.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await Api.deleteTransportRequest(id);
        alert("Request deleted successfully!");
        setTransportRequests(transportRequests.filter((req) => req.id !== id));
      } catch (err) {
        alert(
          "Delete failed: " + (err.response?.data?.error || "Unknown error"),
        );
      }
    }
  };

  const openModal = (request = null) => {
    setCurrentRequest(request);
    setFormData(
      request || { date: "", destination: "", patient_type: "", status: "" },
    );
    setModalOpen(true);
  };

  const openViewModal = (request) => {
    setViewRequest(request);
    setViewModalOpen(true);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-3xl font-bold text-white mb-6">
        Transport Requests Dashboard
      </h2>
      {(userRole === "Operador" || userRole === "Administrator") && (
        <Button onClick={() => openModal()} className="mb-4">
          Create New Request
        </Button>
      )}
      <div className="rounded-md border bg-gray-800 text-white">
        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-gray-700">
          <div>Date</div>
          <div>Destination</div>
          <div>Patient Type</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {transportRequests.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-700"
            >
              <div>{request.date}</div>
              <div>{request.destination}</div>
              <div>{request.patient_type}</div>
              <div>{request.status}</div>
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => openViewModal(request)}>
                  View
                </Button>
                {(userRole === "Operador" || userRole === "Administrator") && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => openModal(request)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(request.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRequest ? "Edit Request" : "Create Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
            <Input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              placeholder="Destination"
              required
            />
            <Input
              type="text"
              value={formData.patient_type}
              onChange={(e) =>
                setFormData({ ...formData, patient_type: e.target.value })
              }
              placeholder="Patient Type"
              required
            />
            <Input
              type="text"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              placeholder="Status"
              required
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {currentRequest ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>Date:</strong> {viewRequest?.date}
            </p>
            <p>
              <strong>Destination:</strong> {viewRequest?.destination}
            </p>
            <p>
              <strong>Patient Type:</strong> {viewRequest?.patient_type}
            </p>
            <p>
              <strong>Status:</strong> {viewRequest?.status}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
