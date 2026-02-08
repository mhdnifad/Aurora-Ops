import { Router } from 'express';
import {
  getDashboardAnalytics,
  getBusinessInsights,
  getTeamPerformance,
  getProjectAnalytics,
  getTimeAnalytics,
} from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get comprehensive dashboard analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * @swagger
 * /api/analytics/insights:
 *   get:
 *     tags: [Analytics]
 *     summary: Get AI-powered business insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business insights generated successfully
 */
router.get('/insights', getBusinessInsights);

/**
 * @swagger
 * /api/analytics/team-performance:
 *   get:
 *     tags: [Analytics]
 *     summary: Get team performance metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team performance data retrieved successfully
 */
router.get('/team-performance', getTeamPerformance);

/**
 * @swagger
 * /api/analytics/projects/{projectId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get project-specific analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project analytics retrieved successfully
 */
router.get('/projects/:projectId', getProjectAnalytics);

/**
 * @swagger
 * /api/analytics/time-series:
 *   get:
 *     tags: [Analytics]
 *     summary: Get time-based analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Time-based analytics retrieved successfully
 */
router.get('/time-series', getTimeAnalytics);

export default router;
