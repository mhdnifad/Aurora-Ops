import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import aiService from '../services/ai.service';
import logger from '../utils/logger';

/**
 * Get organization dashboard analytics
 */
export const getDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      res.status(400).json({
        success: false,
        message: 'Organization ID is required',
      });
      return;
    }

    // Get date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentTasks,
      projectProgress,
      teamActivity,
    ] = await Promise.all([
      // Total projects
      Project.countDocuments({ organization: organizationId, deletedAt: null }),

      // Active projects
      Project.countDocuments({
        organization: organizationId,
        status: { $in: ['planning', 'in-progress'] },
        deletedAt: null,
      }),

      // Total tasks
      Task.countDocuments({ organization: organizationId, deletedAt: null }),

      // Completed tasks
      Task.countDocuments({
        organization: organizationId,
        status: 'completed',
        deletedAt: null,
      }),

      // Overdue tasks
      Task.countDocuments({
        organization: organizationId,
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
        deletedAt: null,
      }),

      // Tasks by priority
      Task.aggregate([
        { $match: { organization: organizationId, deletedAt: null } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Tasks by status
      Task.aggregate([
        { $match: { organization: organizationId, deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Recent tasks (last 7 days)
      Task.find({
        organization: organizationId,
        createdAt: { $gte: last7Days },
        deletedAt: null,
      })
        .limit(10)
        .sort({ createdAt: -1 })
        .populate('assignedTo', 'firstName lastName email')
        .populate('project', 'name')
        .lean(),

      // Project progress
      Project.aggregate([
        { $match: { organization: organizationId, deletedAt: null } },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'project',
            as: 'tasks',
          },
        },
        {
          $project: {
            name: 1,
            totalTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: { $eq: ['$$task.deletedAt', null] },
                },
              },
            },
            completedTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: {
                    $and: [
                      { $eq: ['$$task.status', 'completed'] },
                      { $eq: ['$$task.deletedAt', null] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            progress: {
              $cond: [
                { $eq: ['$totalTasks', 0] },
                0,
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              ],
            },
          },
        },
        { $limit: 10 },
      ]),

      // Team activity (last 30 days)
      AuditLog.aggregate([
        {
          $match: {
            organization: organizationId,
            timestamp: { $gte: last30Days },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
        { $limit: 30 },
      ]),
    ]);

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

    // Format data for charts
    const priorityDistribution = tasksByPriority.reduce((acc, item) => {
      acc[item._id || 'none'] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = tasksByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Activity trend (fill missing days)
    const activityTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const activity = teamActivity.find(a => a._id.date === dateStr);
      activityTrend.push({
        date: dateStr,
        count: activity?.count || 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: parseFloat(completionRate),
        },
        charts: {
          priorityDistribution,
          statusDistribution,
          activityTrend,
          projectProgress,
        },
        recentTasks,
      },
    });
  } catch (error) {
    logger.error('Error getting dashboard analytics:', error);
    next(error);
  }
};

/**
 * Get AI-powered business insights
 */
export const getBusinessInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;

    if (!aiService.isEnabled()) {
      res.status(200).json({
        success: true,
        data: {
          insights: 'AI insights are not configured. Please add your OpenAI API key.',
        },
      });
      return;
    }

    // Gather data
    const [totalProjects, totalTasks, completedTasks, activeUsers, avgCompletionTime] =
      await Promise.all([
        Project.countDocuments({ organization: organizationId, deletedAt: null }),
        Task.countDocuments({ organization: organizationId, deletedAt: null }),
        Task.countDocuments({ organization: organizationId, status: 'completed', deletedAt: null }),
        User.countDocuments({ 'organizations.organization': organizationId, isActive: true, deletedAt: null }),
        Task.aggregate([
          {
            $match: {
              organization: organizationId,
              status: 'completed',
              completedAt: { $exists: true },
              deletedAt: null,
            },
          },
          {
            $project: {
              duration: {
                $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgHours: { $avg: '$duration' },
            },
          },
        ]).then(result => result[0]?.avgHours || 0),
      ]);

    // Generate AI insights
    const insights = await aiService.generateBusinessInsights({
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      overdueTasks: 0,
      activeProjects: totalProjects,
      teamSize: activeUsers,
      avgTaskCompletionDays: avgCompletionTime / 24,
    });

    res.status(200).json({
      success: true,
      data: {
        insights,
        metadata: {
          totalProjects,
          totalTasks,
          completedTasks,
          activeUsers,
          avgCompletionTime: avgCompletionTime.toFixed(1),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting business insights:', error);
    next(error);
  }
};

/**
 * Get team performance metrics
 */
export const getTeamPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;

    // Get team members performance
    const teamPerformance = await User.aggregate([
      {
        $match: {
          'organizations.organization': organizationId,
          isActive: true,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'tasks',
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          totalTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $eq: ['$$task.deletedAt', null] },
              },
            },
          },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: {
                  $and: [
                    { $eq: ['$$task.status', 'completed'] },
                    { $eq: ['$$task.deletedAt', null] },
                  ],
                },
              },
            },
          },
          overdueTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: {
                  $and: [
                    { $ne: ['$$task.status', 'completed'] },
                    { $lt: ['$$task.dueDate', new Date()] },
                    { $eq: ['$$task.deletedAt', null] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
            ],
          },
        },
      },
      { $sort: { completedTasks: -1 } },
      { $limit: 20 },
    ]);

    res.status(200).json({
      success: true,
      data: teamPerformance,
    });
  } catch (error) {
    logger.error('Error getting team performance:', error);
    next(error);
  }
};

/**
 * Get project analytics
 */
export const getProjectAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, deletedAt: null })
      .populate('team.user', 'firstName lastName email');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Task statistics
    const [totalTasks, tasksByStatus, tasksByPriority, overdueTasks] = await Promise.all([
      Task.countDocuments({ project: projectId, deletedAt: null }),
      Task.aggregate([
        { $match: { project: projectId, deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: projectId, deletedAt: null } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        project: projectId,
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() },
        deletedAt: null,
      }),
    ]);

    const completedTasks = tasksByStatus.find(t => t._id === 'completed')?.count || 0;
    const progress = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          teamSize: 0,
        },
        metrics: {
          totalTasks,
          completedTasks,
          overdueTasks,
          progress: parseFloat(progress),
        },
        distribution: {
          byStatus: tasksByStatus,
          byPriority: tasksByPriority,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting project analytics:', error);
    next(error);
  }
};

/**
 * Get time-based analytics
 */
export const getTimeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;
    const { period = '30' } = req.query; // days

    const days = parseInt(period as string, 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Tasks created over time
    const tasksCreated = await Task.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: { $gte: startDate },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tasks completed over time
    const tasksCompleted = await Task.aggregate([
      {
        $match: {
          organization: organizationId,
          status: 'completed',
          completedAt: { $gte: startDate },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: days,
        tasksCreated,
        tasksCompleted,
      },
    });
  } catch (error) {
    logger.error('Error getting time analytics:', error);
    next(error);
  }
};

