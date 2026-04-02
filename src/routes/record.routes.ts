import { Router } from 'express';
import { listRecords, createRecord, updateRecord, deleteRecord } from '../controllers/record.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/errorAndValidation.middleware';
import { createRecordSchema, updateRecordSchema } from '../schemas';

const router = Router();

// Auth required for all record routes
router.use(requireAuth);

// Analysts and Admins can read records
router.get('/', requireRole(['ANALYST', 'ADMIN']), listRecords);

// Only Admins can modify records
router.post('/', requireRole(['ADMIN']), validate(createRecordSchema), createRecord);
router.put('/:id', requireRole(['ADMIN']), validate(updateRecordSchema), updateRecord);
router.delete('/:id', requireRole(['ADMIN']), deleteRecord);

export default router;
