import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import aiService from '../services/ai.service';
import Task from '../models/Task';
import Project from '../models/Project';
import Membership from '../models/Membership';
import { TASK_STATUS, PROJECT_STATUS } from '../config/constants';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

const requireOrganizationId = (req: AuthRequest): string => {
  const orgId = (req.headers['x-organization-id'] as string) || req.user?.organizationId;
  if (!orgId) {
    throw new ValidationError('Organization ID is required');
  }
  return orgId;
};

const ensureAIEnabled = () => {
  if (!aiService.isEnabled()) {
    throw new AppError('AI service not configured', 503);
  }
};

/**
 * Get AI status
 * GET /api/ai/status
 */
router.get(
  '/status',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const model = aiService.getModel();
    const status = {
      enabled: aiService.isEnabled(),
      models: [
        {
          id: model,
          name: model,
          description: 'Configured primary model',
          status: aiService.isEnabled() ? 'available' : 'disabled',
          capabilities: ['text-generation', 'code-generation', 'analysis'],
          tokensUsed: 0,
          tokensLimit: 0,
        },
      ],
      features: {
        taskSuggestions: {
          enabled: aiService.isEnabled(),
          description: 'AI-powered task recommendations based on project context',
        },
        smartAssignments: {
          enabled: aiService.isEnabled(),
          description: 'Intelligent task assignment suggestions based on team expertise',
        },
        contentGeneration: {
          enabled: aiService.isEnabled(),
          description: 'Generate project descriptions, task details, and documentation',
        },
        sentimentAnalysis: {
          enabled: false,
          description: 'Analyze team communication patterns and sentiment',
        },
        predictiveAnalytics: {
          enabled: false,
          description: 'Forecast project completion dates and resource needs',
        },
      },
      usage: {
        requestsToday: 0,
        requestsThisMonth: 0,
        tokensUsedToday: 0,
        tokensUsedThisMonth: 0,
      },
      limits: {
        requestsPerDay: 0,
        requestsPerMonth: 0,
        tokensPerDay: 0,
        tokensPerMonth: 0,
      },
    };

    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * Generate AI suggestions
 * POST /api/ai/suggestions
 */
router.post(
  '/suggestions',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const schema = z.object({
      context: z.string().min(1),
      type: z.string().min(1),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid suggestion request');
    }

    const { context, type } = validation.data;
    const content = await aiService.generateContent(
      `Provide 3 actionable suggestions for: ${type}\nContext: ${context}\nReturn as short bullet points.`,
      'You are a helpful enterprise assistant focused on actionable project suggestions.',
      200,
      0.6
    );

    const suggestions = content
      .split('\n')
      .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 5)
      .map((text, idx) => ({
        id: String(idx + 1),
        title: text,
        description: text,
        priority: 'medium',
        estimatedTime: '30-60 minutes',
      }));

    res.json({
      success: true,
      data: suggestions,
    });
  })
);

/**
 * Generate content with AI
 * POST /api/ai/generate
 */
router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const schema = z.object({
      prompt: z.string().min(1),
      type: z.string().optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Prompt is required');
    }

    const { prompt, type } = validation.data;
    const generated = await aiService.generateContent(
      prompt,
      'You are a professional enterprise assistant producing concise, high-quality outputs.',
      300,
      0.7
    );

    const content = {
      prompt,
      type,
      generated,
      tokensUsed: 0,
      generatedAt: new Date(),
      model: aiService.getModel(),
    };

    res.json({
      success: true,
      data: content,
    });
  })
);

router.post(
  '/task-summary',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const schema = z.object({
      taskTitle: z.string().min(1),
      taskDescription: z.string().optional().default(''),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid task summary request');
    }

    const { taskTitle, taskDescription } = validation.data;
    const summary = await aiService.generateTaskSummary(taskDescription, taskTitle);

    res.json({
      success: true,
      data: { summary },
    });
  })
);

router.post(
  '/generate-task-title',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const schema = z.object({
      description: z.string().min(1),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Description is required');
    }

    const { description } = validation.data;
    const title = await aiService.generateTaskTitle(description);

    res.json({
      success: true,
      data: { title },
    });
  })
);

router.post(
  '/team-performance',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const orgId = requireOrganizationId(req);
    const schema = z.object({
      teamData: z
        .object({
          members: z.array(
            z.object({
              name: z.string(),
              tasksCompleted: z.number(),
              avgCompletionTime: z.number(),
              overdueCount: z.number(),
            })
          ),
        })
        .optional(),
    });
    const validation = schema.safeParse(req.body || {});
    if (!validation.success) {
      throw new ValidationError('Invalid team performance request');
    }

    let teamData = validation.data.teamData;

    if (!teamData) {
      const orgObjectId = new mongoose.Types.ObjectId(orgId);
      const memberships = await Membership.find({ organizationId: orgObjectId, status: 'active' })
        .populate('userId', 'firstName lastName')
        .lean();
      const userIds = memberships
        .map((m) => (m.userId as { _id?: mongoose.Types.ObjectId })._id)
        .filter(Boolean) as mongoose.Types.ObjectId[];

      if (userIds.length === 0) {
        throw new NotFoundError('No team members found');
      }

      const completedAgg = await Task.aggregate([
        {
          $match: {
            organizationId: orgObjectId,
            assigneeId: { $in: userIds },
            status: TASK_STATUS.DONE,
            completedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$assigneeId',
            tasksCompleted: { $sum: 1 },
            avgCompletionTime: {
              $avg: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] },
            },
          },
        },
      ]);

      const overdueAgg = await Task.aggregate([
        {
          $match: {
            organizationId: orgObjectId,
            assigneeId: { $in: userIds },
            status: { $ne: TASK_STATUS.DONE },
            dueDate: { $lt: new Date() },
          },
        },
        {
          $group: {
            _id: '$assigneeId',
            overdueCount: { $sum: 1 },
          },
        },
      ]);

      const completedMap = new Map(
        completedAgg.map((item) => [item._id.toString(), item])
      );
      const overdueMap = new Map(
        overdueAgg.map((item) => [item._id.toString(), item])
      );

      teamData = {
        members: memberships.map((member) => {
          const user = member.userId as { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string };
          const key = user._id.toString();
          const completed = completedMap.get(key);
          const overdue = overdueMap.get(key);
          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
          return {
            name,
            tasksCompleted: completed?.tasksCompleted || 0,
            avgCompletionTime: completed?.avgCompletionTime ? Math.round(completed.avgCompletionTime * 10) / 10 : 0,
            overdueCount: overdue?.overdueCount || 0,
          };
        }),
      };
    }

    const analysis = await aiService.analyzeTeamPerformance(teamData);

    res.json({
      success: true,
      data: { analysis },
    });
  })
);

router.post(
  '/business-insights',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const orgId = requireOrganizationId(req);
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [
      completedTasks,
      pendingTasks,
      overdueTasks,
      activeProjects,
      teamSize,
      avgCompletion,
    ] = await Promise.all([
      Task.countDocuments({ organizationId: orgObjectId, status: TASK_STATUS.DONE }),
      Task.countDocuments({ organizationId: orgObjectId, status: { $ne: TASK_STATUS.DONE } }),
      Task.countDocuments({ organizationId: orgObjectId, status: { $ne: TASK_STATUS.DONE }, dueDate: { $lt: new Date() } }),
      Project.countDocuments({ organizationId: orgObjectId, status: PROJECT_STATUS.ACTIVE }),
      Membership.countDocuments({ organizationId: orgObjectId, status: 'active' }),
      Task.aggregate([
        { $match: { organizationId: orgObjectId, status: TASK_STATUS.DONE, completedAt: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } } } },
      ]),
    ]);

    const avgTaskCompletionDays = avgCompletion[0]?.avg ? Math.round(avgCompletion[0].avg * 10) / 10 : 0;

    const insights = await aiService.generateBusinessInsights({
      completedTasks,
      pendingTasks,
      overdueTasks,
      activeProjects,
      teamSize,
      avgTaskCompletionDays,
    });

    res.json({
      success: true,
      data: { insights },
    });
  })
);

router.post(
  '/project-recommendations',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    ensureAIEnabled();
    const orgId = requireOrganizationId(req);
    const schema = z.object({ projectId: z.string().min(1) });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Project ID is required');
    }

    const { projectId } = validation.data;
    const project = await Project.findOne({ _id: projectId, organizationId: orgId, deletedAt: null });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const tasksCount = await Task.countDocuments({ projectId: project._id, deletedAt: null });
    const memberIds = new Set<string>();
    memberIds.add(project.ownerId.toString());
    project.members.forEach((id) => memberIds.add(id.toString()));

    const recommendations = await aiService.generateProjectRecommendations({
      name: project.name,
      description: project.description || 'No description provided',
      tasksCount,
      teamSize: memberIds.size,
      startDate: project.startDate || project.createdAt,
      deadline: project.endDate || undefined,
    });

    res.json({
      success: true,
      data: { recommendations },
    });
  })
);

export default router;
