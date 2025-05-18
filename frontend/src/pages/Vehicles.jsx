import { useState } from "react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { Badge } from "./components/badge";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/dropdown-menu"; // Fixed import path

import data from "../vehicles.json";

function Vehicles() {
  const [searchQuery, setSearchQuery] = useState("");
  const vehicles = data.vehicles; // Fixed: define vehicles, assuming data.vehicles

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Maintenance":
        return "bg-blue-100 text-blue-800";
      case "Out of Service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search vehicles..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-slate-50">
          <div>Vehicle ID</div>
          <div className="col-span-2">Type</div>
          <div>Status</div>
          <div>Location</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="grid grid-cols-6 gap-4 p-4 items-center"
              >
                <div className="font-medium">{vehicle.id}</div>
                <div className="col-span-2">{vehicle.type}</div>
                <div>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {vehicle.status}
                  </Badge>
                </div>
                <div>{vehicle.location}</div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                      <DropdownMenuItem>Maintenance History</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Remove Vehicle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500">
              No vehicles found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vehicles;
