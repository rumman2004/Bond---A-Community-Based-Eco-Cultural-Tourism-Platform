import { Router } from 'express';
import {
  getDashboardStats,
  getBookingTrend,
  getUsers,
  createUser,
  updateUser,
  getActivityLogs,
  getAnalytics,
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

// All admin routes: must be authenticated + admin role
router.use(authenticate, authorize('admin'));

// ── Dashboard ─────────────────────────────────────────────────
router.get('/stats',         getDashboardStats);
router.get('/booking-trend', getBookingTrend);
router.get('/analytics',     getAnalytics);

// ── User management ───────────────────────────────────────────
router.get  ('/users',      getUsers);
router.post ('/users',      createUser);   // Create new user (e.g. security officer)
router.patch('/users/:id',  updateUser);

// ── Audit logs ────────────────────────────────────────────────
router.get('/logs', getActivityLogs);

export default router;