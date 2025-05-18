import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Layout } from "react-router-dom";
import Home from "./pages/Home";
import OperatorDashboard from "./pages/OperatorDashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import reportWebVitals from "./reportWebVitals";
import VehiclePage from "./pages/VehiclePage";
import UserManagement from "./pages/UserManagement";
import Messaging from "./pages/Messaging";
import UserPage from "./pages/UserPage";
import IncidentDashboard from "./pages/IncidentDashboard.jsx";
import GestorBaseAmbulanciasDashboard from "./pages/BaseAmbulanciaDashboard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/OperatorDashboard" element={<OperatorDashboard />} />
        <Route path="/Incidents" element={<IncidentDashboard />} />
        <Route path="/base/:baseId/vehicles" element={<VehiclePage />} />
        <Route path="/base/:baseId/users" element={<UserPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/OperatorDashboard/user/:baseId/" element={<UserPage />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route
          path="/BaseDashboard"
          element={<GestorBaseAmbulanciasDashboard />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

reportWebVitals();
