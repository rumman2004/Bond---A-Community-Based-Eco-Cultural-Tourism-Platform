import { Route } from "react-router-dom";
import CommunityLayout from "../components/layouts/CommunityLayout";
import ProtectedRoute from "./ProtectedRoute";
import CommunityDashboard from "../pages/community/CommunityDashboard";
import CommunityProfileSetup from "../pages/community/CommunityProfileSetup";
import ManageExperiences from "../pages/community/ManageExperiences";
import ManageBookings from "../pages/community/ManageBookings";
import ManageStories from "../pages/community/ManageStories";
import Earnings from "../pages/community/Earnings";

export default function CommunityRoutes() {
  return (
    <Route path="/community" element={<ProtectedRoute><CommunityLayout /></ProtectedRoute>}>
      <Route index element={<CommunityDashboard />} />
      <Route path="profile" element={<CommunityProfileSetup />} />
      <Route path="experiences" element={<ManageExperiences />} />
      <Route path="bookings" element={<ManageBookings />} />
      <Route path="stories" element={<ManageStories />} />
      <Route path="earnings" element={<Earnings />} />
    </Route>
  );
}
