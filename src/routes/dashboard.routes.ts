import { Router } from 'express';
import { getSummary, getCategoryTotals, getRecentTransactions, getMonthlyTrend } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Auth required for all dashboard routes. All roles (VIEWER, ANALYST, ADMIN) can view dashboard.
router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/category-totals', getCategoryTotals);
router.get('/recent', getRecentTransactions);
router.get('/monthly-trend', getMonthlyTrend);

export default router;
