import { Route } from "react-router-dom";
import SecurityLayout from "../components/layouts/SecurityLayout";
import ProtectedRoute from "./ProtectedRoute";
import SecurityDashboard from "../pages/security/SecurityDashboard";
import VerifyCommunities from "../pages/security/VerifyCommunities";
import ReviewCommunityDetails from "../pages/security/ReviewComunityDetails";
import HandleComplaints from "../pages/security/HandleComplaints";
import SuspendedUsers from "../pages/security/SuspendedUsers";
import MonitorUsers from "../pages/security/MonitorUsers";
import MonitorExperiences from "../pages/security/MonitorExperiences";
import OfficerProfile from "../pages/security/OfficerProfile";

export default function SecurityRoutes() {
  return (
    <Route path="/security" element={<ProtectedRoute role="security"><SecurityLayout /></ProtectedRoute>}>
      <Route index element={<SecurityDashboard />} />
      <Route path="verify-communities" element={<VerifyCommunities />} />
      <Route path="verify-communities/:id" element={<ReviewCommunityDetails />} />
      <Route path="complaints" element={<HandleComplaints />} />
      <Route path="suspended-users" element={<SuspendedUsers />} />
      <Route path="monitor-users" element={<MonitorUsers />} />
      <Route path="monitor-experiences" element={<MonitorExperiences />} />
      <Route path="officer-profile" element={<OfficerProfile />} />
    </Route>
  );
}