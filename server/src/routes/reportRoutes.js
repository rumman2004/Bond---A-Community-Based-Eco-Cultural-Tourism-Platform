import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  assignReport,
  resolveReport,
  dismissReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// ── Any logged-in user: submit a report ───────────────────────
router.post('/', createReport);

// ── Security + Admin: manage reports ─────────────────────────
router.get('/',      authorize('security', 'admin'), getReports);
router.get('/:id',   authorize('security', 'admin'), getReportById);

router.patch('/:id/assign',  authorize('security', 'admin'), assignReport);
router.patch('/:id/resolve', authorize('security', 'admin'), resolveReport);
router.patch('/:id/dismiss', authorize('security', 'admin'), dismissReport);

export default router;