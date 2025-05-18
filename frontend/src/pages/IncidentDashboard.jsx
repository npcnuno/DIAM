import React, { useState, useEffect } from "react";
import Api from "./api";
import { Button } from "./components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import { Input } from "./components/input";
import { Label } from "./components/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/dialog";

function IncidentsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [patientTypeFilter, setPatientTypeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [bases, setBases] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    patient_location: "",
    destination: "",
    patient_type: "Doente Não Urgente",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const allowedRoles = [
    "Operador",
    "Pessoal",
    "Administrator",
    "AdminOperator",
  ];

  // Fetch incidents on mount
  useEffect(() => {
    setLoading(true);
    Api.getTransportRequests()
      .then((response) => {
        setIncidents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching incidents:", error);
        setError("Failed to load incidents.");
        setLoading(false);
      });
  }, []); // Empty dependency array means it runs only once on mount

  // Fetch bases when modal opens
  useEffect(() => {
    if (modalOpen) {
      Api.getBases()
        .then((response) => {
          setBases(response.data);
        })
        .catch((error) => {
          console.error("Error fetching bases:", error);
        });
    }
  }, [modalOpen]); // Runs whenever modalOpen changes

  // Early return for unauthorized users (after hooks)
  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="text-red-500 p-6">Acesso negado.</div>;
  }

  const handleBaseChange = (baseId) => {
    setSelectedBase(baseId);
    Api.getVehicles(baseId)
      .then((response) => {
        setVehicles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
      });
  };

  const handleCreateIncident = () => {
    const incidentData = {
      description: formData.description,
      patient_location: formData.patient_location,
      destination: formData.destination,
      patient_type: formData.patient_type,
      status: "Pendente",
      vehicle: selectedVehicle,
      base: selectedBase,
      requester: user.id,
    };
    Api.createTransportRequest(incidentData)
      .then((response) => {
        setIncidents([...incidents, response.data]);
        setModalOpen(false);
        setFormData({
          description: "",
          patient_location: "",
          destination: "",
          patient_type: "Doente Não Urgente",
        });
        setSelectedBase("");
        setSelectedVehicle("");
      })
      .catch((error) => {
        console.error("Error creating incident:", error);
        alert("Failed to create incident.");
      });
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter !== "All" && incident.status !== statusFilter)
      return false;
    if (
      patientTypeFilter !== "All" &&
      incident.patient_type !== patientTypeFilter
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">Incidents Dashboard</h2>
      {user.role === "Operador" && (
        <Button onClick={() => setModalOpen(true)} className="mb-4">
          Create New Incident
        </Button>
      )}
      <div className="flex space-x-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Atribuído">Atribuído</SelectItem>
            <SelectItem value="Em Progresso">Em Progresso</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={patientTypeFilter} onValueChange={setPatientTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Patient Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Doente Não Urgente">
              Doente Não Urgente
            </SelectItem>
            <SelectItem value="Doente Pouco Urgente">
              Doente Pouco Urgente
            </SelectItem>
            <SelectItem value="Doente Urgente">Doente Urgente</SelectItem>
            <SelectItem value="Doente Muito Urgente">
              Doente Muito Urgente
            </SelectItem>
            <SelectItem value="Doente Emergente">Doente Emergente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Request Date</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Patient Type</th>
              <th className="border border-gray-300 p-2">Destination</th>
              <th className="border border-gray-300 p-2">Vehicle</th>
              <th className="border border-gray-300 p-2">Assigned Crew</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => (
              <tr key={incident.id}>
                <td className="border border-gray-300 p-2">{incident.id}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(incident.request_date).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {incident.status}
                </td>
                <td className="border border-gray-300 p-2">
                  {incident.patient_type}
                </td>
                <td className="border border-gray-300 p-2">
                  {incident.destination}
                </td>
                <td className="border border-gray-300 p-2">
                  {incident.vehicle ? incident.vehicle.type : "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  {incident.tripulante ? incident.tripulante.username : "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  <Button variant="outline">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="base">Base</Label>
                <Select value={selectedBase} onValueChange={handleBaseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a base" />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.id} value={base.id.toString()}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  value={selectedVehicle}
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem
                        key={vehicle.id}
                        value={vehicle.id.toString()}
                      >
                        {vehicle.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  placeholder="Incident destination"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Incident description"
                />
              </div>
              <div>
                <Label htmlFor="patient_location">Patient Location</Label>
                <Input
                  id="patient_location"
                  value={formData.patient_location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patient_location: e.target.value,
                    })
                  }
                  placeholder="Patient location"
                />
              </div>
              <div>
                <Label htmlFor="patient_type">Patient Type</Label>
                <Select
                  value={formData.patient_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patient_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doente Não Urgente">
                      Doente Não Urgente
                    </SelectItem>
                    <SelectItem value="Doente Pouco Urgente">
                      Doente Pouco Urgente
                    </SelectItem>
                    <SelectItem value="Doente Urgente">
                      Doente Urgente
                    </SelectItem>
                    <SelectItem value="Doente Muito Urgente">
                      Doente Muito Urgente
                    </SelectItem>
                    <SelectItem value="Doente Emergente">
                      Doente Emergente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIncident}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default IncidentsDashboard;
