import React, { useState, useEffect } from "react";
import Api from "./api.ts";
import BaseCard from "./components/BaseCard";
import { Button } from "./components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/dialog";
import { Input } from "./components/input";
import { Label } from "./components/label";
import Skeleton from "./components/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "./components/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

function GestorBaseAmbulanciasDashboard() {
  const [bases, setBases] = useState([]);
  const [personnelByBase, setPersonnelByBase] = useState({});
  const [vehiclesByBase, setVehiclesByBase] = useState({});
  const [transportRequestsByBase, setTransportRequestsByBase] = useState({});
  const [trainingRecordsByBase, setTrainingRecordsByBase] = useState({});
  const [equipmentByBase, setEquipmentByBase] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  const navigate = () => (window.location.href = "/login");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate();
      return;
    }
    let user;
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Erro ao parsear user do localStorage:", error);
      navigate();
      return;
    }
    if (!user || !["Administrator", "AdminBase"].includes(user.role)) {
      navigate();
      return;
    }
    setLoading(true);

    const fetchAllData = async (baseId) => {
      try {
        const [
          personnelRes,
          vehiclesRes,
          requestsRes,
          trainingRes,
          equipmentRes,
        ] = await Promise.all([
          Api.getPersonnel(baseId),
          Api.getVehicles(baseId),
          Api.getTransportRequests(baseId),
          Api.getTrainingRecords(baseId),
          Api.getEquipment(baseId),
        ]);
        return {
          personnel: Array.isArray(personnelRes.data) ? personnelRes.data : [],
          vehicles: Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [],
          transportRequests: Array.isArray(requestsRes.data)
            ? requestsRes.data
            : [],
          trainingRecords: Array.isArray(trainingRes.data)
            ? trainingRes.data
            : [],
          equipment: Array.isArray(equipmentRes.data) ? equipmentRes.data : [],
        };
      } catch (error) {
        console.error(`Erro ao buscar dados da base ${baseId}:`, error);
        return {
          personnel: [],
          vehicles: [],
          transportRequests: [],
          trainingRecords: [],
          equipment: [],
        };
      }
    };

    if (user.role === "Administrator") {
      Api.getINEMBases()
        .then(async (response) => {
          const basesData = Array.isArray(response.data) ? response.data : [];
          setBases(basesData);
          const dataPromises = basesData.map((base) => fetchAllData(base.id));
          const results = await Promise.all(dataPromises);
          const personnelMap = {};
          const vehiclesMap = {};
          const requestsMap = {};
          const trainingMap = {};
          const equipmentMap = {};
          basesData.forEach((base, index) => {
            personnelMap[base.id] = results[index].personnel;
            vehiclesMap[base.id] = results[index].vehicles;
            requestsMap[base.id] = results[index].transportRequests;
            trainingMap[base.id] = results[index].trainingRecords;
            equipmentMap[base.id] = results[index].equipment;
          });
          setPersonnelByBase(personnelMap);
          setVehiclesByBase(vehiclesMap);
          setTransportRequestsByBase(requestsMap);
          setTrainingRecordsByBase(trainingMap);
          setEquipmentByBase(equipmentMap);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar bases:", error);
          setError("Falha ao carregar dados.");
          setLoading(false);
        });
    } else if (
      user.role === "AdminBase" &&
      user.base &&
      typeof user.base.id === "number"
    ) {
      Api.getINEMBase(user.base.id)
        .then(async (response) => {
          const baseData = response.data;
          setBases([baseData]);
          const data = await fetchAllData(baseData.id);
          setPersonnelByBase({ [baseData.id]: data.personnel });
          setVehiclesByBase({ [baseData.id]: data.vehicles });
          setTransportRequestsByBase({ [baseData.id]: data.transportRequests });
          setTrainingRecordsByBase({ [baseData.id]: data.trainingRecords });
          setEquipmentByBase({ [baseData.id]: data.equipment });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar base:", error);
          setError("Falha ao carregar dados.");
          setLoading(false);
        });
    } else {
      console.warn("Usuário AdminBase sem base válida:", user.base);
      setBases([]);
      setLoading(false);
    }
  }, []);

  const fetchPersonnel = (baseId) => {
    Api.getPersonnel(baseId)
      .then((response) => {
        setPersonnelByBase((prev) => ({
          ...prev,
          [baseId]: Array.isArray(response.data) ? response.data : [],
        }));
      })
      .catch((error) => console.error("Erro ao buscar pessoal:", error));
  };

  const deleteBase = (baseId) => {
    Api.deleteBase(baseId)
      .then(() => {
        setBases(bases.filter((b) => b.id !== baseId));
        setPersonnelByBase((prev) => ({ ...prev, [baseId]: undefined }));
        setVehiclesByBase((prev) => ({ ...prev, [baseId]: undefined }));
        setTransportRequestsByBase((prev) => ({
          ...prev,
          [baseId]: undefined,
        }));
        setTrainingRecordsByBase((prev) => ({ ...prev, [baseId]: undefined }));
        setEquipmentByBase((prev) => ({ ...prev, [baseId]: undefined }));
      })
      .catch((error) => {
        console.error("Erro ao deletar base:", error);
        alert("Falha ao deletar base.");
      });
  };

  const deletePersonnel = async (personnelId, baseId) => {
    if (window.confirm("Tem certeza que deseja eliminar este pessoal?")) {
      try {
        await Api.deletePersonnel(personnelId);
        setPersonnelByBase((prev) => ({
          ...prev,
          [baseId]: prev[baseId].filter((p) => p.id !== personnelId),
        }));
      } catch (error) {
        console.error("Erro ao deletar pessoal:", error);
        alert("Falha ao deletar pessoal.");
      }
    }
  };

  const deleteVehicle = async (vehicleId, baseId) => {
    if (window.confirm("Tem certeza que deseja eliminar este veículo?")) {
      try {
        await Api.deleteVehicle(vehicleId);
        setVehiclesByBase((prev) => ({
          ...prev,
          [baseId]: prev[baseId].filter((v) => v.id !== vehicleId),
        }));
      } catch (error) {
        console.error("Erro ao deletar veículo:", error);
        alert("Falha ao deletar veículo.");
      }
    }
  };

  const deleteTransportRequest = async (requestId, baseId) => {
    if (window.confirm("Tem certeza que deseja eliminar este pedido?")) {
      try {
        await Api.deleteTransportRequest(requestId);
        setTransportRequestsByBase((prev) => ({
          ...prev,
          [baseId]: prev[baseId].filter((r) => r.id !== requestId),
        }));
      } catch (error) {
        console.error("Erro ao deletar pedido:", error);
        alert("Falha ao deletar pedido.");
      }
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (modalType === "base") {
        const baseData = { name: formData.name, location: formData.location };
        if (currentItem) {
          await Api.updateBase(currentItem.id, baseData);
          setBases(
            bases.map((b) =>
              b.id === currentItem.id ? { ...b, ...baseData } : b,
            ),
          );
        } else {
          const newBaseResponse = await Api.createBase(baseData);
          setBases([...bases, newBaseResponse.data]);
        }
      } else if (modalType === "personnel") {
        const personnelData = {
          username: formData.username,
          role: "Pessoal",
          base: formData.baseId,
        };
        if (formData.password) personnelData.password = formData.password;
        if (currentItem) {
          await Api.updatePersonnel(currentItem.id, personnelData);
          fetchPersonnel(formData.baseId);
        } else {
          await Api.createPersonnel(personnelData);
          fetchPersonnel(formData.baseId);
        }
      } else if (modalType === "vehicle") {
        const vehicleData = {
          type: formData.type,
          capacity: parseInt(formData.capacity),
          base: formData.baseId,
        };
        if (currentItem) {
          await Api.updateVehicle(currentItem.id, vehicleData);
          const vehiclesRes = await Api.getVehicles(formData.baseId);
          setVehiclesByBase((prev) => ({
            ...prev,
            [formData.baseId]: vehiclesRes.data,
          }));
        } else {
          await Api.createVehicle(vehicleData);
          const vehiclesRes = await Api.getVehicles(formData.baseId);
          setVehiclesByBase((prev) => ({
            ...prev,
            [formData.baseId]: vehiclesRes.data,
          }));
        }
      } else if (modalType === "transportRequest") {
        const requestData = {
          date: formData.date,
          destination: formData.destination,
          patientType: formData.patientType,
          vehicleId: parseInt(formData.vehicleId),
          base: formData.baseId,
        };
        if (currentItem) {
          await Api.updateTransportRequest(currentItem.id, requestData);
          const requestsRes = await Api.getTransportRequests(formData.baseId);
          setTransportRequestsByBase((prev) => ({
            ...prev,
            [formData.baseId]: requestsRes.data,
          }));
        } else {
          await Api.createTransportRequest(requestData);
          const requestsRes = await Api.getTransportRequests(formData.baseId);
          setTransportRequestsByBase((prev) => ({
            ...prev,
            [formData.baseId]: requestsRes.data,
          }));
        }
      } else if (modalType === "adminBase") {
        await Api.register(
          formData.username,
          formData.password,
          "AdminBase",
          formData.base_name,
          formData.base_location,
        );
        if (JSON.parse(localStorage.getItem("user")).role === "Administrator") {
          const response = await Api.getINEMBases();
          setBases(Array.isArray(response.data) ? response.data : []);
        }
      }
      setModalOpen(false);
      setModalType(null);
      setCurrentItem(null);
      setFormData({});
    } catch (err) {
      console.error("Erro:", err);
      alert("Operação falhou: " + (err.response?.data || err.message));
    }
  };

  const openModal = (item, type, baseId) => {
    setModalType(type);
    setCurrentItem(item);
    if (type === "base") {
      setFormData(
        item
          ? { name: item.name, location: item.location }
          : { name: "", location: "" },
      );
    } else if (type === "personnel") {
      const personnelBaseId = item ? item.base : baseId;
      setFormData(
        item
          ? { username: item.username, baseId: personnelBaseId }
          : { username: "", password: "", baseId: personnelBaseId },
      );
    } else if (type === "vehicle") {
      setFormData(
        item
          ? { type: item.type, capacity: item.capacity, baseId: baseId }
          : { type: "", capacity: "", baseId: baseId },
      );
    } else if (type === "transportRequest") {
      setFormData(
        item
          ? {
              date: item.date,
              destination: item.destination,
              patientType: item.patientType,
              vehicleId: item.vehicleId,
              baseId: baseId,
            }
          : {
              date: "",
              destination: "",
              patientType: "",
              vehicleId: "",
              baseId: baseId,
            },
      );
    } else if (type === "adminBase") {
      setFormData({
        username: "",
        password: "",
        base_name: "",
        base_location: "",
      });
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">
        Painel do Gestor de Base de Ambulâncias
      </h2>
      <div className="mb-4 space-x-2">
        <Button onClick={() => openModal(null, "base")}>Adicionar Base</Button>
        <Button onClick={() => openModal(null, "adminBase")}>
          Adicionar AdminBase
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(bases) && bases.length > 0 ? (
          bases.map((base) => (
            <BaseCard
              key={base.id}
              base={base}
              personnel={personnelByBase[base.id]}
              vehicles={vehiclesByBase[base.id]}
              transportRequests={transportRequestsByBase[base.id]}
              trainingRecords={trainingRecordsByBase[base.id]}
              equipment={equipmentByBase[base.id]}
              openModal={openModal}
              deleteBase={deleteBase}
              deletePersonnel={deletePersonnel}
              deleteVehicle={deleteVehicle}
              deleteTransportRequest={deleteTransportRequest}
              fetchPersonnel={fetchPersonnel}
            />
          ))
        ) : (
          <p>Nenhuma base disponível.</p>
        )}
      </div>
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentItem ? "Editar" : "Criar"}{" "}
                {modalType === "base"
                  ? "Base"
                  : modalType === "personnel"
                    ? "Pessoal"
                    : modalType === "vehicle"
                      ? "Veículo"
                      : modalType === "transportRequest"
                        ? "Pedido de Transporte"
                        : "AdminBase"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {modalType === "base" && (
                <>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Localização"
                    />
                  </div>
                </>
              )}
              {modalType === "personnel" && (
                <>
                  <div>
                    <Label htmlFor="username">Nome de Utilizador</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Nome de Utilizador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Palavra-passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        currentItem
                          ? "Deixe em branco para não alterar"
                          : "Palavra-passe"
                      }
                    />
                  </div>
                </>
              )}
              {modalType === "vehicle" && (
                <>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      type="text"
                      value={formData.type || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      placeholder="Tipo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      placeholder="Capacidade"
                    />
                  </div>
                </>
              )}
              {modalType === "transportRequest" && (
                <>
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      type="text"
                      value={formData.destination || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                      placeholder="Destino"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientType">Tipologia do Doente</Label>
                    <Input
                      id="patientType"
                      type="text"
                      value={formData.patientType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          patientType: e.target.value,
                        })
                      }
                      placeholder="Tipologia do Doente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleId">ID do Veículo</Label>
                    <Input
                      id="vehicleId"
                      type="number"
                      value={formData.vehicleId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleId: e.target.value,
                        })
                      }
                      placeholder="ID do Veículo"
                    />
                  </div>
                </>
              )}
              {modalType === "adminBase" && (
                <>
                  <div>
                    <Label htmlFor="username">Nome de Utilizador</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Nome de Utilizador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Palavra-passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Palavra-passe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="base_name">Nome da Base</Label>
                    <Input
                      id="base_name"
                      type="text"
                      value={formData.base_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, base_name: e.target.value })
                      }
                      placeholder="Nome da Base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="base_location">Localização da Base</Label>
                    <Input
                      id="base_location"
                      type="text"
                      value={formData.base_location || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_location: e.target.value,
                        })
                      }
                      placeholder="Localização da Base"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {currentItem ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default GestorBaseAmbulanciasDashboard;
