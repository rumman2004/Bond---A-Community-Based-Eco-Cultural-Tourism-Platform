import { Router } from 'express';
import {
  getUserById,
  updateProfile,
  updateAvatar,
  getInterests,
  updateInterests,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }     from '../middlewares/roleMiddleware.js';
import { validate }      from '../middlewares/validateRequest.js';
import { uploadSingle }  from '../middlewares/uploadMiddleware.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────
router.get('/:id', getUserById);

// ── Protected: own profile ────────────────────────────────────
router.patch('/me/profile',  authenticate, updateProfile);
router.patch('/me/avatar',   authenticate, uploadSingle, updateAvatar);

// ── Interests (tourist) ───────────────────────────────────────
router.get  ('/me/interests', authenticate, authorize('tourist'), getInterests);
router.patch('/me/interests', authenticate, authorize('tourist'), updateInterests);

// ── Favorites (tourist) ───────────────────────────────────────
router.get   ('/me/favorites',                      authenticate, authorize('tourist'), getFavorites);
router.post  ('/me/favorites',                      authenticate, authorize('tourist'), addFavorite);
router.delete('/me/favorites/:target_type/:target_id', authenticate, authorize('tourist'), removeFavorite);

export default router;