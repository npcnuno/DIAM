import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Api from "./api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import { Card, CardHeader, CardTitle, CardContent } from "./components/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

function VehiclePage() {
  const { baseId } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [uniformStock, setUniformStock] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    type: "",
    capacity: "",
  });
  const [equipmentFormData, setEquipmentFormData] = useState({
    equipmentId: "",
    quantity: "",
  });
  const [stockFormData, setStockFormData] = useState({
    type: "",
    quantity_received: "",
    date_received: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      Api.getVehicles(baseId),
      Api.getUniformStock(baseId),
      Api.getEquipment(),
    ])
      .then(([vehiclesRes, stockRes, equipmentRes]) => {
        setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        setUniformStock(Array.isArray(stockRes.data) ? stockRes.data : []);
        setEquipmentList(
          Array.isArray(equipmentRes.data) ? equipmentRes.data : [],
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        setError("Falha ao carregar dados.");
        setLoading(false);
      });
  }, [baseId]);

  const openVehicleModal = (vehicle = null) => {
    setCurrentVehicle(vehicle);
    setVehicleFormData(
      vehicle
        ? { type: vehicle.type, capacity: vehicle.capacity }
        : { type: "", capacity: "" },
    );
    setVehicleModalOpen(true);
  };

  const handleVehicleSave = async () => {
    try {
      const vehicleData = {
        type: vehicleFormData.type,
        capacity: parseInt(vehicleFormData.capacity),
        base: parseInt(baseId),
      };
      if (currentVehicle) {
        await Api.updateVehicle(currentVehicle.id, vehicleData);
        setVehicles(
          vehicles.map((v) =>
            v.id === currentVehicle.id ? { ...v, ...vehicleData } : v,
          ),
        );
      } else {
        const response = await Api.createVehicle(vehicleData);
        setVehicles([...vehicles, response.data]);
      }
      setVehicleModalOpen(false);
      setCurrentVehicle(null);
      setVehicleFormData({ type: "", capacity: "" });
    } catch (err) {
      console.error("Erro ao salvar viatura:", err);
      setError("Falha ao salvar viatura.");
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (window.confirm("Tem certeza que deseja eliminar esta viatura?")) {
      try {
        await Api.deleteVehicle(vehicleId);
        setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      } catch (err) {
        console.error("Erro ao eliminar viatura:", err);
        setError("Falha ao eliminar viatura.");
      }
    }
  };

  const openEquipmentModal = (vehicle, equipment = null) => {
    setCurrentVehicle(vehicle);
    setCurrentEquipment(equipment);
    setEquipmentFormData(
      equipment
        ? { equipmentId: equipment.equipment.id, quantity: equipment.quantity }
        : { equipmentId: "", quantity: "" },
    );
    setEquipmentModalOpen(true);
  };

  const handleEquipmentSave = async () => {
    try {
      const equipmentData = {
        vehicle: currentVehicle.id,
        equipment: parseInt(equipmentFormData.equipmentId),
        quantity: parseInt(equipmentFormData.quantity),
      };
      if (currentEquipment) {
        // Assuming API supports updating vehicle equipment; if not, delete and create
        await Api.createVehicleEquipment(equipmentData); // Replace if update endpoint exists
      } else {
        await Api.createVehicleEquipment(equipmentData);
      }
      setEquipmentModalOpen(false);
      setCurrentVehicle(null);
      setCurrentEquipment(null);
      setEquipmentFormData({ equipmentId: "", quantity: "" });
    } catch (err) {
      console.error("Erro ao salvar equipamento:", err);
      setError("Falha ao salvar equipamento.");
    }
  };

  const openStockModal = () => {
    setStockFormData({ type: "", quantity_received: "", date_received: "" });
    setStockModalOpen(true);
  };

  const handleStockSave = async () => {
    try {
      const stockData = {
        type: stockFormData.type,
        quantity_received: parseInt(stockFormData.quantity_received),
        quantity_delivered: 0,
        date_received: stockFormData.date_received,
        base: parseInt(baseId),
      };
      const response = await Api.createUniformStock(stockData);
      setUniformStock([...uniformStock, response.data]);
      setStockModalOpen(false);
      setStockFormData({ type: "", quantity_received: "", date_received: "" });
    } catch (err) {
      console.error("Erro ao salvar stock:", err);
      setError("Falha ao salvar stock.");
    }
  };

  const calculateAvailableStock = () => {
    return uniformStock.reduce((acc, stock) => {
      const available =
        (stock.quantity_received || 0) - (stock.quantity_delivered || 0);
      acc[stock.type] = (acc[stock.type] || 0) + available;
      return acc;
    }, {});
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  const availableStock = calculateAvailableStock();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">
        Gestão de Viaturas - Base {baseId}
      </h2>
      <Button onClick={() => openVehicleModal()} className="mb-4">
        Adicionar Viatura
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              openEquipmentModal={openEquipmentModal}
              deleteVehicle={deleteVehicle}
              openVehicleModal={openVehicleModal}
            />
          ))
        ) : (
          <p>Sem viaturas registradas.</p>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock de Uniformes</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={openStockModal} className="mb-4">
            Adicionar Stock
          </Button>
          <h4 className="font-medium mb-2">Stock Disponível:</h4>
          {Object.entries(availableStock).length > 0 ? (
            <ul className="list-disc pl-5">
              {Object.entries(availableStock).map(([type, quantity]) => (
                <li key={type}>
                  {type}: {quantity} unidades
                </li>
              ))}
            </ul>
          ) : (
            <p>Sem stock disponível.</p>
          )}
          <h4 className="font-medium mt-4 mb-2">Histórico de Stock:</h4>
          {uniformStock.length > 0 ? (
            uniformStock.map((stock) => (
              <div key={stock.id} className="mb-2 p-2 border rounded">
                <p>Tipo: {stock.type}</p>
                <p>Quantidade Recebida: {stock.quantity_received}</p>
                <p>Quantidade Entregue: {stock.quantity_delivered}</p>
                <p>Data de Recebimento: {stock.date_received}</p>
              </div>
            ))
          ) : (
            <p>Sem registos de stock.</p>
          )}
        </CardContent>
      </Card>
      {vehicleModalOpen && (
        <Dialog open={vehicleModalOpen} onOpenChange={setVehicleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentVehicle ? "Editar Viatura" : "Adicionar Viatura"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={vehicleFormData.type}
                  onValueChange={(value) =>
                    setVehicleFormData({ ...vehicleFormData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carrinha Ambulância">
                      Carrinha Ambulância
                    </SelectItem>
                    <SelectItem value="Carro Ambulância">
                      Carro Ambulância
                    </SelectItem>
                    <SelectItem value="Helicóptero">Helicóptero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={vehicleFormData.capacity}
                  onChange={(e) =>
                    setVehicleFormData({
                      ...vehicleFormData,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="Capacidade"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setVehicleModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleVehicleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {equipmentModalOpen && (
        <Dialog open={equipmentModalOpen} onOpenChange={setEquipmentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentEquipment
                  ? "Editar Equipamento"
                  : "Adicionar Equipamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipmentId">Equipamento</Label>
                <Select
                  value={equipmentFormData.equipmentId}
                  onValueChange={(value) =>
                    setEquipmentFormData({
                      ...equipmentFormData,
                      equipmentId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={equipmentFormData.quantity}
                  onChange={(e) =>
                    setEquipmentFormData({
                      ...equipmentFormData,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="Quantidade"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEquipmentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleEquipmentSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {stockModalOpen && (
        <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Stock de Uniforme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={stockFormData.type}
                  onValueChange={(value) =>
                    setStockFormData({ ...stockFormData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Farda Completa">
                      Farda Completa
                    </SelectItem>
                    <SelectItem value="Calças">Calças</SelectItem>
                    <SelectItem value="Camisola">Camisola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity_received">Quantidade Recebida</Label>
                <Input
                  id="quantity_received"
                  type="number"
                  value={stockFormData.quantity_received}
                  onChange={(e) =>
                    setStockFormData({
                      ...stockFormData,
                      quantity_received: e.target.value,
                    })
                  }
                  placeholder="Quantidade Recebida"
                />
              </div>
              <div>
                <Label htmlFor="date_received">Data de Recebimento</Label>
                <Input
                  id="date_received"
                  type="date"
                  value={stockFormData.date_received}
                  onChange={(e) =>
                    setStockFormData({
                      ...stockFormData,
                      date_received: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStockModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleStockSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function VehicleCard({
  vehicle,
  openEquipmentModal,
  deleteVehicle,
  openVehicleModal,
}) {
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEquipmentOpen) {
      setLoading(true);
      Api.getVehicleEquipment(vehicle.id)
        .then((response) => {
          setEquipment(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar equipamentos:", error);
          setLoading(false);
        });
    }
  }, [isEquipmentOpen, vehicle.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{vehicle.type}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Capacidade: {vehicle.capacity} lugares</p>
        <div className="flex space-x-2 mb-4">
          <Button variant="outline" onClick={() => openVehicleModal(vehicle)}>
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteVehicle(vehicle.id)}
          >
            Eliminar
          </Button>
        </div>
        <Collapsible open={isEquipmentOpen} onOpenChange={setIsEquipmentOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer mb-2">
              <h4 className="font-medium">Equipamentos ({equipment.length})</h4>
              {isEquipmentOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Button
              variant="outline"
              onClick={() => openEquipmentModal(vehicle)}
              className="mb-2"
            >
              Adicionar Equipamento
            </Button>
            {loading ? (
              <p>Carregando equipamentos...</p>
            ) : equipment.length > 0 ? (
              equipment.map((eq) => (
                <div key={eq.id} className="mb-2 p-2 border rounded">
                  <p>
                    {eq.equipment.name}: {eq.quantity}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEquipmentModal(vehicle, eq)}
                  >
                    Editar
                  </Button>
                </div>
              ))
            ) : (
              <p>Sem equipamentos registrados.</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export default VehiclePage;
