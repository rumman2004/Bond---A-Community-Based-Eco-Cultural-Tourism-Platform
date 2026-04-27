import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getCommunityBookings,
  getBookingById,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from '../controllers/bookingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';
import { validate }     from '../middlewares/validateRequest.js';
import { createBookingSchema } from '../validators/bookingValidator.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// ── Tourist ───────────────────────────────────────────────────
router.post('/',        authorize('tourist'), validate(createBookingSchema), createBooking);
router.get ('/my',      authorize('tourist'), getMyBookings);

// ── Community owner ───────────────────────────────────────────
router.get('/community', authorize('community'), getCommunityBookings);

// ── Single booking (tourist + community + admin/security) ─────
router.get('/:id', getBookingById);

// ── Booking actions (community owner) ────────────────────────
router.patch('/:id/confirm',   authorize('community'), confirmBooking);
router.patch('/:id/reject',    authorize('community'), rejectBooking);
router.patch('/:id/complete',  authorize('community'), completeBooking);

// ── Cancel (tourist OR community) ─────────────────────────────
// Authorization logic inside controller (both roles allowed)
router.patch('/:id/cancel',    authorize('tourist', 'community'), cancelBooking);

export default router;