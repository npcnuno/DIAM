import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Battery,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { FleetStatusChart } from "@/components/charts/fleet-status-chart";
import { IncidentResponseChart } from "@/components/charts/incident-response-chart";
import { VehicleTable } from "@/components/tables/vehicle-table";
import { UserManagementTable } from "@/components/tables/user-management-table";
import Api from "../api";

export function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, usersRes, transportRes] = await Promise.all([
          Api.getVehicles(),
          Api.getUsers(),
          Api.getTransportRequests(),
        ]);
        setVehicles(vehiclesRes.data);
        setUsers(usersRes.data);
        setTransportRequests(transportRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalVehicles = vehicles.length;
  const activePersonnel = users.filter(
    (user) => user.role === "Pessoal",
  ).length;
  const today = new Date().toISOString().split("T")[0];
  const incidentsToday = transportRequests.filter(
    (req) => req.request_date.startsWith(today) && req.status === "In Progress",
  ).length;
  const completedRequests = transportRequests.filter(
    (req) => req.status === "Completed",
  );
  const avgResponseTime = "N/A"; // Placeholder due to missing response_time field

  const recentActivities = transportRequests.slice(0, 5).map((req) => ({
    icon: Truck,
    text: `Transport request to ${req.destination} - ${req.status}`,
    time: new Date(req.request_date).toLocaleTimeString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Truck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-slate-500 mt-1">Updated today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePersonnel}</div>
            <p className="text-xs text-slate-500 mt-1">Updated today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Incidents Today
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentsToday}</div>
            <p className="text-xs text-slate-500 mt-1">Updated today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}</div>
            <p className="text-xs text-slate-500 mt-1">Updated today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
                <CardDescription>
                  Current status of all emergency vehicles
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FleetStatusChart vehicles={vehicles} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Incident Response Times</CardTitle>
                <CardDescription>
                  Average response times by incident type
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <IncidentResponseChart transportRequests={transportRequests} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="bg-slate-100 p-2 rounded-full">
                      <item.icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
              <CardDescription>
                Manage all emergency vehicles in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;
