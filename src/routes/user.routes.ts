import { Router } from 'express';
import { listUsers, createUser, updateUserRole, updateUserStatus } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/errorAndValidation.middleware';
import { createUserSchema, updateUserRoleSchema, updateUserStatusSchema } from '../schemas';

const router = Router();

// Only ADMIN can manage users
router.use(requireAuth, requireRole(['ADMIN']));

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.put('/:id/status', validate(updateUserStatusSchema), updateUserStatus);

export default router;
