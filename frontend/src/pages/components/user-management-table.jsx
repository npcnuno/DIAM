import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import Api from "../api";

export function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Api.getUsers();
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
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
              <Button variant="outline">Edit</Button>
              <Button variant="destructive">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
