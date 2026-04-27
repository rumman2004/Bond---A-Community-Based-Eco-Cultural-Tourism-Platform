import { Router } from 'express';
import authRoutes         from './authRoutes.js';
import userRoutes         from './userRoutes.js';
import communityRoutes    from './communityRoutes.js';
import experienceRoutes   from './experienceRoutes.js';
import bookingRoutes      from './bookingRoutes.js';
import reviewRoutes       from './reviewRoutes.js';
import storyRoutes        from './storyRoutes.js';
import reportRoutes       from './reportRoutes.js';
import adminRoutes        from './adminRoutes.js';
import securityRoutes     from './securityRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import uploadRoutes       from './uploadRoutes.js';

const router = Router();

// ── Health check ──────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────
router.use('/auth',          authRoutes);
router.use('/users',         userRoutes);
router.use('/communities',   communityRoutes);
router.use('/experiences',   experienceRoutes);
router.use('/bookings',      bookingRoutes);
router.use('/reviews',       reviewRoutes);
router.use('/stories',       storyRoutes);
router.use('/reports',       reportRoutes);
router.use('/admin',         adminRoutes);
router.use('/security',      securityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload',        uploadRoutes);

export default router;