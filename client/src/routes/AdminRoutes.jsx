import { Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ActivityLogs from "../pages/admin/ActivityLogs";
import Reports from "../pages/admin/Reports";
import Analytics from "../pages/admin/Analytics";
import AdminProfile from "../pages/admin/AdminProfile";
import ManageSecurities from "../pages/admin/ManageSecurities";

export default function AdminRoutes() {
  return (
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="logs" element={<ActivityLogs />} />
      <Route path="reports" element={<Reports />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="account" element={<AdminProfile />} />
      <Route path="manage-securities" element={<ManageSecurities />} />

    </Route>
  );
}
