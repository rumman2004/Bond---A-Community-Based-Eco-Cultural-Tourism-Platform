import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layouts/PublicLayout';
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Explore from '../components/common/Explore';
import Stories from '../components/common/Stories';
import CommunityDetails from '../components/common/CommunityDetails';
import ExperienceDetails from '../components/common//ExperienceDetails';
import NotFound from '../pages/public/NotFound';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import TouristRoutes from './TouristRoutes';
import CommunityRoutes from './CommunityRoutes';
import SecurityRoutes from './SecurityRoutes';
import AdminRoutes from './AdminRoutes';
import StoryView from '../components/common/StoryView';
import ProtectedRoute from './ProtectedRoute';
import ConfirmBooking from '../pages/tourist/ConfirmBooking';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/community/:id" element={<CommunityDetails />} />
        <Route path="/experience/:id" element={<ExperienceDetails />} />
        <Route path="/story/:id" element={<StoryView />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/booking/:id" element={<ProtectedRoute><ConfirmBooking /></ProtectedRoute>} />
      </Route>

      {TouristRoutes()}
      {CommunityRoutes()}
      {SecurityRoutes()}
      {AdminRoutes()}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
