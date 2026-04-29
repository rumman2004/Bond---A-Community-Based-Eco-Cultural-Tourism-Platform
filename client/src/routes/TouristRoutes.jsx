import { Route } from "react-router-dom";
import TouristLayout from "../components/layouts/TouristLayout";
import ProtectedRoute from "./ProtectedRoute";
import TouristDashboard from "../pages/tourist/TouristDashboard";
import TouristProfile from "../pages/tourist/TouristProfile";
import MyBookings from "../pages/tourist/MyBookings";
import Favorites from "../pages/tourist/Favorites";
import Interests from "../pages/tourist/Interests";
import Explore from "../components/common/Explore";
import CommunityDetails from "../components/common/CommunityDetails";
import ExperienceDetails from "../components/common/ExperienceDetails";
import StoryView from "../components/common/StoryView";


export default function TouristRoutes() {
  return (
    <Route path="/tourist" element={<ProtectedRoute role="tourist"><TouristLayout /></ProtectedRoute>}>
      <Route index element={<TouristDashboard />} />
      <Route path="profile" element={<TouristProfile />} />
      <Route path="bookings" element={<MyBookings />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="interests" element={<Interests />} />
      <Route path="explore" element={<Explore />} />
      <Route path="community/:id" element={<CommunityDetails />} />
      <Route path="experience/:id" element={<ExperienceDetails />} />
      <Route path="story/:id" element={<StoryView />} />
    </Route>
  );
}
