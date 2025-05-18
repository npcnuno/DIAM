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
import { Card, CardHeader, CardTitle, CardContent } from "./components/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

function UserPage() {
  const { baseId } = useParams();
  const [personnel, setPersonnel] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
  });
  const [trainingFormData, setTrainingFormData] = useState({
    course_name: "",
    course_date: "",
    certification: "",
  });

  useEffect(() => {
    Promise.all([Api.getPersonnel(baseId), Api.getTrainingRecords(baseId)])
      .then(([personnelRes, trainingRes]) => {
        setPersonnel(Array.isArray(personnelRes.data) ? personnelRes.data : []);
        setTrainingRecords(
          Array.isArray(trainingRes.data) ? trainingRes.data : [],
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        setError("Falha ao carregar dados.");
        setLoading(false);
      });
  }, [baseId]);

  const openUserModal = (user = null) => {
    setCurrentUser(user);
    setUserFormData(
      user
        ? { username: user.username, password: "" }
        : { username: "", password: "" },
    );
    setUserModalOpen(true);
  };

  const handleUserSave = async () => {
    try {
      const userData = {
        username: userFormData.username,
        role: "Pessoal",
        base: parseInt(baseId),
      };
      if (!currentUser && userFormData.password) {
        userData.password = userFormData.password;
      }
      if (currentUser) {
        await Api.updatePersonnel(currentUser.id, userData);
        setPersonnel(
          personnel.map((p) =>
            p.id === currentUser.id ? { ...p, ...userData } : p,
          ),
        );
      } else {
        const response = await Api.createPersonnel(userData);
        setPersonnel([...personnel, response.data]);
      }
      setUserModalOpen(false);
      setCurrentUser(null);
      setUserFormData({ username: "", password: "" });
    } catch (err) {
      console.error("Erro ao salvar pessoal:", err);
      setError("Falha ao salvar pessoal.");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Tem certeza que deseja eliminar este pessoal?")) {
      try {
        await Api.deletePersonnel(userId);
        setPersonnel(personnel.filter((p) => p.id !== userId));
      } catch (err) {
        console.error("Erro ao eliminar pessoal:", err);
        setError("Falha ao eliminar pessoal.");
      }
    }
  };

  const openTrainingModal = (user, training = null) => {
    setCurrentUser(user);
    setCurrentTraining(training);
    setTrainingFormData(
      training
        ? {
            course_name: training.course_name,
            course_date: training.course_date,
            certification: training.certification,
          }
        : { course_name: "", course_date: "", certification: "" },
    );
    setTrainingModalOpen(true);
  };

  const handleTrainingSave = async () => {
    try {
      const trainingData = {
        user: currentUser.id,
        course_name: trainingFormData.course_name,
        course_date: trainingFormData.course_date,
        certification: trainingFormData.certification,
      };
      if (currentTraining) {
        await Api.updateTrainingRecord(currentTraining.id, trainingData);
        setTrainingRecords(
          trainingRecords.map((t) =>
            t.id === currentTraining.id ? { ...t, ...trainingData } : t,
          ),
        );
      } else {
        const response = await Api.createTrainingRecord(trainingData);
        setTrainingRecords([...trainingRecords, response.data]);
      }
      setTrainingModalOpen(false);
      setCurrentUser(null);
      setCurrentTraining(null);
      setTrainingFormData({
        course_name: "",
        course_date: "",
        certification: "",
      });
    } catch (err) {
      console.error("Erro ao salvar registo de formação:", err);
      setError("Falha ao salvar registo de formação.");
    }
  };

  const deleteTraining = async (trainingId) => {
    if (
      window.confirm(
        "Tem certeza que deseja eliminar este registo de formação?",
      )
    ) {
      try {
        await Api.deleteTrainingRecord(trainingId);
        setTrainingRecords(trainingRecords.filter((t) => t.id !== trainingId));
      } catch (err) {
        console.error("Erro ao eliminar registo de formação:", err);
        setError("Falha ao eliminar registo de formação.");
      }
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">
        Gestão de Pessoal - Base {baseId}
      </h2>
      <Button onClick={() => openUserModal()} className="mb-4">
        Adicionar Pessoal
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.length > 0 ? (
          personnel.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              trainingRecords={trainingRecords.filter(
                (t) => t.user === user.id,
              )}
              openTrainingModal={openTrainingModal}
              deleteTraining={deleteTraining}
              openUserModal={openUserModal}
              deleteUser={deleteUser}
            />
          ))
        ) : (
          <p>Sem pessoal registrado.</p>
        )}
      </div>
      {userModalOpen && (
        <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentUser ? "Editar Pessoal" : "Adicionar Pessoal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de Utilizador</Label>
                <Input
                  id="username"
                  type="text"
                  value={userFormData.username}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      username: e.target.value,
                    })
                  }
                  placeholder="Nome de Utilizador"
                />
              </div>
              {!currentUser && (
                <div>
                  <Label htmlFor="password">Palavra-passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userFormData.password}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Palavra-passe"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUserSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {trainingModalOpen && (
        <Dialog open={trainingModalOpen} onOpenChange={setTrainingModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentTraining ? "Editar Formação" : "Adicionar Formação"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course_name">Nome do Curso</Label>
                <Input
                  id="course_name"
                  type="text"
                  value={trainingFormData.course_name}
                  onChange={(e) =>
                    setTrainingFormData({
                      ...trainingFormData,
                      course_name: e.target.value,
                    })
                  }
                  placeholder="Nome do Curso"
                />
              </div>
              <div>
                <Label htmlFor="course_date">Data do Curso</Label>
                <Input
                  id="course_date"
                  type="date"
                  value={trainingFormData.course_date}
                  onChange={(e) =>
                    setTrainingFormData({
                      ...trainingFormData,
                      course_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="certification">Certificação</Label>
                <Input
                  id="certification"
                  type="text"
                  value={trainingFormData.certification}
                  onChange={(e) =>
                    setTrainingFormData({
                      ...trainingFormData,
                      certification: e.target.value,
                    })
                  }
                  placeholder="Certificação"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTrainingModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleTrainingSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function UserCard({
  user,
  trainingRecords,
  openTrainingModal,
  deleteTraining,
  openUserModal,
  deleteUser,
}) {
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button variant="outline" onClick={() => openUserModal(user)}>
            Editar
          </Button>
          <Button variant="destructive" onClick={() => deleteUser(user.id)}>
            Eliminar
          </Button>
        </div>
        <Collapsible open={isTrainingOpen} onOpenChange={setIsTrainingOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer mb-2">
              <h4 className="font-medium">
                Registos de Formação ({trainingRecords.length})
              </h4>
              {isTrainingOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Button
              variant="outline"
              onClick={() => openTrainingModal(user)}
              className="mb-2"
            >
              Adicionar Formação
            </Button>
            {trainingRecords.length > 0 ? (
              trainingRecords.map((record) => (
                <div key={record.id} className="mb-2 p-2 border rounded">
                  <p>Curso: {record.course_name}</p>
                  <p>Data: {record.course_date}</p>
                  <p>Certificação: {record.certification || "N/A"}</p>
                  <div className="mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTrainingModal(user, record)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTraining(record.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>Sem formações registradas.</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export default UserPage;
