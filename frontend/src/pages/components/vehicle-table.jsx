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

export function VehicleTable() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await Api.getVehicles();
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Maintenance</TableHead>
          <TableHead>Next Inspection</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>{vehicle.id}</TableCell>
            <TableCell>{vehicle.type}</TableCell>
            <TableCell>{vehicle.status}</TableCell>
            <TableCell>{vehicle.last_maintenance_date}</TableCell>
            <TableCell>{vehicle.next_inspection_date}</TableCell>
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
