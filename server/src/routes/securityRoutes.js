import { Router } from 'express';
import {
  getPendingCommunities,
  verifyCommunity,
  rejectCommunity,
  suspendUser,
  unsuspendUser,
  getSuspendedUsers,
  getSecurityStats,
  getCommunityById,
  getAllUsers,
  flagUser,
  getAllExperiences,
  flagExperience,
  approveExperience,
  suspendExperience,
} from '../controllers/securityController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

// All security routes: must be authenticated + security or admin role
router.use(authenticate, authorize('security', 'admin'));

// ── Dashboard ─────────────────────────────────────────────────
router.get('/stats', getSecurityStats);

// ── Community verification ────────────────────────────────────
router.get  ('/communities/pending',       getPendingCommunities);
router.get  ('/communities/:id',           getCommunityById);
router.patch('/communities/:id/verify',    verifyCommunity);
router.patch('/communities/:id/reject',    rejectCommunity);

// ── User moderation & monitoring ──────────────────────────────
router.get  ('/users',               getAllUsers);
router.get  ('/users/suspended',     getSuspendedUsers);
router.patch('/users/:id/flag',      flagUser);
router.patch('/users/:id/suspend',   suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);

// ── Experience monitoring ──────────────────────────────────────
router.get  ('/experiences',                  getAllExperiences);
router.patch('/experiences/:id/flag',         flagExperience);
router.patch('/experiences/:id/approve',      approveExperience);
router.patch('/experiences/:id/suspend',      suspendExperience);

export default router;