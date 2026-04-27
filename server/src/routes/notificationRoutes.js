import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate }     from '../middlewares/validateRequest.js';
import { notificationPreferencesSchema } from '../validators/notificationValidator.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// ── Notifications feed ────────────────────────────────────────
router.get   ('/',             getNotifications);
router.patch ('/read-all',     markAllAsRead);
router.patch ('/:id/read',     markAsRead);
router.delete('/:id',          deleteNotification);

// ── Preferences ───────────────────────────────────────────────
router.get  ('/preferences',  getPreferences);
router.patch('/preferences',  validate(notificationPreferencesSchema), updatePreferences);

export default router;