import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog";
import { Input } from "./components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import Api from "./api.ts";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModal] = useState(true); // Kept as true per your code
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Tripulante",
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "Administrator") {
      navigate("/dashboard");
      return;
    }
    const fetchUsers = async () => {
      try {
        const response = await Api.getUsers();
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleCreateOrUpdate = async () => {
    try {
      if (currentUser) {
        await Api.updateUser(currentUser.id, formData);
        alert("User updated successfully!");
      } else {
        await Api.createUser(formData);
        alert("User created successfully!");
      }
      setModal(false); // Fixed from setModalOpen
      setCurrentUser(null);
      setFormData({ username: "", password: "", role: "Tripulante" });
      const response = await Api.getUsers();
      setUsers(response.data);
    } catch (err) {
      alert(
        "Operation failed: " + (err.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await Api.deleteUser(id);
        alert("User deleted successfully!");
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        alert(
          "Delete failed: " + (err.response?.data?.error || "Unknown error"),
        );
      }
    }
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    setFormData(user || { username: "", password: "", role: "Tripulante" });
    setModal(true); // Fixed from setModalOpen
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">User Management</h2>
      <Button onClick={() => openModal()} className="mb-4">
        Create New User
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => openModal(user)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={modalOpen} onOpenChange={setModal}>
        {/* Fixed from setModalOpen */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Username"
              required
            />
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
              required={!currentUser}
            />
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Centralista">Centralista</SelectItem>
                <SelectItem value="Tripulante">Tripulante</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModal(false)}>
                {/* Fixed from setModalOpen */}
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {currentUser ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
