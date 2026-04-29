import { Route } from "react-router-dom";
import CommunityLayout from "../components/layouts/CommunityLayout";
import ProtectedRoute from "./ProtectedRoute";
import CommunityDashboard     from "../pages/community/CommunityDashboard";
import CommunityProfileSetup  from "../pages/community/CommunityProfileSetup";
import CommunityRegistration  from "../pages/community/CommunityRegistration";
import ManageExperiences      from "../pages/community/ManageExperiences";
import ManageBookings         from "../pages/community/ManageBookings";
import ManageStories          from "../pages/community/ManageStories";
import Earnings               from "../pages/community/Earnings";
import ExperienceDetails      from "../components/common/ExperienceDetails"
import StoryView              from "../components/common/StoryView";

export default function CommunityRoutes() {
  return (
    <>
      {/* ── Registration wizard — full-page, no sidebar ── */}
      <Route
        path="/community/register"
        element={<ProtectedRoute role="community"><CommunityRegistration /></ProtectedRoute>}
      />

      {/* ── All other community pages with the sidebar layout ── */}
      <Route path="/community" element={<ProtectedRoute role="community"><CommunityLayout /></ProtectedRoute>}>
        <Route index element={<CommunityDashboard />} />
        <Route path="profile" element={<CommunityProfileSetup />} />
        <Route path="experiences" element={<ManageExperiences />} />
        <Route path="experience/:id" element={<ExperienceDetails />} />
        <Route path="story/:id" element={<StoryView />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="stories" element={<ManageStories />} />
        <Route path="earnings" element={<Earnings />} />
      </Route>
    </>
  );
}

