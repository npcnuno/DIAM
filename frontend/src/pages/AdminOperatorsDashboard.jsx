import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Card, CardHeader, CardTitle, CardContent } from "./components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import Skeleton from "./components/skeleton";

function OperatorDashboard() {
  const [operators, setOperators] = useState([]);
  const [operatorBases, setOperatorBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    baseId: "",
  });

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
    if (user.role !== "AdminOperator") {
      navigate();
      return;
    }

    setLoading(true);
    Api.getOperatorBases()
      .then(async (response) => {
        const bases = Array.isArray(response.data) ? response.data : [];
        setOperatorBases(bases);
        // Fetch operators for all operator bases
        const operatorPromises = bases.map((base) => Api.getOperators(base.id));
        const operatorResults = await Promise.all(operatorPromises);
        // Flatten and deduplicate operators by ID
        const allOperators = operatorResults
          .flatMap((res) => (Array.isArray(res.data) ? res.data : []))
          .reduce((acc, op) => {
            acc[op.id] = op;
            return acc;
          }, {});
        setOperators(Object.values(allOperators));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar bases de operadores:", error);
        setError("Falha ao carregar dados.");
        setLoading(false);
      });
  }, []);

  const openModal = (operator = null) => {
    setCurrentOperator(operator);
    setFormData(
      operator
        ? {
            username: operator.username,
            password: "",
            baseId: operator.base?.id || "",
          }
        : { username: "", password: "", baseId: "" },
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const userData = {
        username: formData.username,
        role: "Operador",
        base: formData.baseId ? parseInt(formData.baseId) : null,
      };
      if (!currentOperator && formData.password) {
        userData.password = formData.password;
      }
      if (currentOperator) {
        await Api.updatePersonnel(currentOperator.id, userData);
        setOperators(
          operators.map((op) =>
            op.id === currentOperator.id
              ? {
                  ...op,
                  ...userData,
                  base:
                    operatorBases.find(
                      (b) => b.id === parseInt(formData.baseId),
                    ) || null,
                }
              : op,
          ),
        );
      } else {
        const response = await Api.createOperator(userData);
        setOperators([...operators, response.data]);
      }
      setModalOpen(false);
      setCurrentOperator(null);
      setFormData({ username: "", password: "", baseId: "" });
    } catch (err) {
      console.error("Erro ao salvar operador:", err);
      alert(
        "Falha ao salvar operador: " +
          (err.response?.data?.detail || err.message),
      );
    }
  };

  const deleteOperator = async (operatorId) => {
    if (window.confirm("Tem certeza que deseja eliminar este operador?")) {
      try {
        await Api.deleteOperator(operatorId);
        setOperators(operators.filter((op) => op.id !== operatorId));
      } catch (error) {
        console.error("Erro ao deletar operador:", error);
        alert("Falha ao deletar operador.");
      }
    }
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
        Painel do Administrador de Operadores
      </h2>
      <Button onClick={() => openModal()} className="mb-4">
        Adicionar Operador
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.length > 0 ? (
          operators.map((operator) => (
            <Card key={operator.id}>
              <CardHeader>
                <CardTitle>{operator.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Base: {operator.base?.name || "Sem base"}</p>
                <div className="space-y-2 mt-2">
                  <Button variant="outline" onClick={() => openModal(operator)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteOperator(operator.id)}
                  >
                    Eliminar
                  </Button>
                  <Link to={`/user/${operator.id}`}>
                    <Button variant="outline">Gerir Formação</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Nenhum operador disponível.</p>
        )}
      </div>

      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentOperator ? "Editar Operador" : "Adicionar Operador"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de Utilizador</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Nome de Utilizador"
                />
              </div>
              {!currentOperator && (
                <div>
                  <Label htmlFor="password">Palavra-passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Palavra-passe"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="baseId">Base Operador (Opcional)</Label>
                <Select
                  value={formData.baseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, baseId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma base</SelectItem>
                    {operatorBases.map((base) => (
                      <SelectItem key={base.id} value={base.id.toString()}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default OperatorDashboard;
