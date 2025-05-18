import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const getAccessToken = () => localStorage.getItem("token");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicEndpoints = ["login/", "register/"];

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.url && !publicEndpoints.includes(config.url)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const Api = {
  login: (username: string, password: string) =>
    api.post("login/", { username, password }),
  register: (
    username: string,
    password: string,
    role: string,
    baseName?: string,
    baseLocation?: string,
  ) => {
    const data: any = { username, password, role };
    if (role === "AdminBase" || role === "AdminOperator") {
      if (!baseName || !baseLocation) {
        throw new Error("Base name and location are required for AdminBase");
      }
      data.base_name = baseName;
      data.base_location = baseLocation;
    }
    return api.post("register/", data);
  },
  getTransportRequests: (baseId?: number) =>
    api.get("transport_requests/", { params: baseId ? { base: baseId } : {} }),
  createTransportRequest: (data: any) => api.post("transport_requests/", data),
  updateTransportRequest: (id: number, data: any) =>
    api.put(`transport_requests/${id}/`, data),
  deleteTransportRequest: (id: number) =>
    api.delete(`transport_requests/${id}/`),
  getVehicles: (baseId?: number) =>
    api.get("vehicles/", { params: baseId ? { base: baseId } : {} }),
  createVehicle: (data: any) => api.post("vehicles/", data),
  updateVehicle: (id: number, data: any) => api.put(`vehicles/${id}/`, data),
  deleteVehicle: (id: number) => api.delete(`vehicles/${id}/`),
  getMaintenanceRecords: (vehicleId?: number) =>
    api.get("maintenance_records/", {
      params: vehicleId ? { vehicle: vehicleId } : {},
    }),
  createMaintenanceRecord: (data: any) =>
    api.post("maintenance_records/", data),
  getInspectionRecords: (vehicleId?: number) =>
    api.get("inspection_records/", {
      params: vehicleId ? { vehicle: vehicleId } : {},
    }),
  createInspectionRecord: (data: any) => api.post("inspection_records/", data),
  getEquipment: () => api.get("equipment/"),
  getVehicleEquipment: (vehicleId?: number) =>
    api.get("vehicle_equipment/", {
      params: vehicleId ? { vehicle: vehicleId } : {},
    }),
  createVehicleEquipment: (data: any) => api.post("vehicle_equipment/", data),
  getUniformStock: (baseId?: number) =>
    api.get("uniform_stock/", { params: baseId ? { base: baseId } : {} }),
  createUniformStock: (data: any) => api.post("uniform_stock/", data),
  getINEMBases: () => api.get("bases/", { params: { type_of_base: "INEM" } }),
  getINEMBase: (id: number) =>
    api.get(`bases/${id}/`, { params: { type_of_base: "INEM" } }),
  createBase: (data: any) => api.post("bases/", data),
  updateBase: (id: number, data: any) => api.put(`bases/${id}/`, data),
  deleteBase: (id: number) => api.delete(`bases/${id}/`),
  getOperatorBases: () =>
    api.get("bases/", { params: { type_of_base: "Base Operador" } }),
  getOperatorBase: (id: number) =>
    api.get(`bases/${id}/`, { params: { type_of_base: "Base Operador" } }),
  getPersonnel: (baseId?: number) =>
    api.get("users/", { params: { role: "Pessoal", base: baseId } }),
  getOperator: (Id?: number) => api.get("users/", { params: { id: Id } }),
  getOperators: (baseId?: number) =>
    api.get("users/", { params: { role: "Operador", base: baseId } }),
  getOperatorById: (id: number) => api.get(`users/${id}/`),
  createOperator: (data: any) =>
    api.post("users/", { ...data, role: "Operador" }),
  deleteOperator: (id: number) => api.delete(`users/${id}/`),
  createPersonnel: (data: any) =>
    api.post("users/", { ...data, role: "Pessoal" }),
  updatePersonnel: (id: number, data: any) => api.put(`users/${id}/`, data),
  deletePersonnel: (id: number) => api.delete(`users/${id}/`),
  getTrainingRecords: (userId?: number) =>
    api.get("training_records/", { params: userId ? { user: userId } : {} }),
  createTrainingRecord: (data: any) => api.post("training_records/", data),
};

export default Api;
