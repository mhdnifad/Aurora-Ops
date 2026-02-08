import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { asyncHandler, paginationMeta } from '../utils/helpers';
import stripeService from '../services/stripe.service';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';
import { NotFoundError, ValidationError } from '../utils/errors';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * Get billing plans
 * GET /api/billing/plans
 */
router.get(
  '/plans',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const plans = [
      {
        id: 'free',
        name: stripeService.PLANS.FREE.name,
        description: 'Perfect for individuals and small teams getting started',
        price: stripeService.PLANS.FREE.price,
        currency: 'USD',
        billingPeriod: 'month',
        features: stripeService.PLANS.FREE.features.map((name) => ({ name, included: true })),
        popular: false,
      },
      {
        id: 'pro',
        name: stripeService.PLANS.PRO.name,
        description: 'For growing teams that need more power and flexibility',
        price: stripeService.PLANS.PRO.price,
        currency: 'USD',
        billingPeriod: 'month',
        features: stripeService.PLANS.PRO.features.map((name) => ({ name, included: true })),
        popular: true,
      },
      {
        id: 'enterprise',
        name: stripeService.PLANS.ENTERPRISE.name,
        description: 'Custom solutions for large organizations',
        price: stripeService.PLANS.ENTERPRISE.price,
        currency: 'USD',
        billingPeriod: 'custom',
        features: stripeService.PLANS.ENTERPRISE.features.map((name) => ({ name, included: true })),
        popular: false,
      },
    ];

    res.json({
      success: true,
      data: plans,
    });
  })
);

/**
 * Get current subscription
 * GET /api/billing/subscriptions/:organizationId
 */
router.get(
  '/subscriptions/:organizationId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params;
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const subscription = await Subscription.findOne({ organizationId, deletedAt: null });

    const planId = subscription?.plan || organization.plan || 'free';
    const planName = planId === 'enterprise' ? stripeService.PLANS.ENTERPRISE.name : planId === 'pro' ? stripeService.PLANS.PRO.name : stripeService.PLANS.FREE.name;

    const data = {
      planId,
      planName,
      status: subscription?.status || 'active',
      startDate: subscription?.currentPeriodStart || organization.createdAt,
      renewalDate: subscription?.currentPeriodEnd || null,
      cancelledAt: subscription?.canceledAt || null,
    };

    res.json({
      success: true,
      data,
    });
  })
);

// Backwards-compatible alias
router.get(
  '/subscription',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const organizationId = (req.headers['x-organization-id'] as string) || req.user?.organizationId;
    if (!organizationId) {
      throw new ValidationError('Organization ID is required');
    }
    req.params.organizationId = organizationId;
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }
    const subscription = await Subscription.findOne({ organizationId, deletedAt: null });
    const planId = subscription?.plan || organization.plan || 'free';
    const planName = planId === 'enterprise' ? stripeService.PLANS.ENTERPRISE.name : planId === 'pro' ? stripeService.PLANS.PRO.name : stripeService.PLANS.FREE.name;

    res.json({
      success: true,
      data: {
        planId,
        planName,
        status: subscription?.status || 'active',
        startDate: subscription?.currentPeriodStart || organization.createdAt,
        renewalDate: subscription?.currentPeriodEnd || null,
        cancelledAt: subscription?.canceledAt || null,
      },
    });
  })
);

/**
 * Create checkout session
 * POST /api/billing/checkout
 */
router.post(
  '/checkout',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      organizationId: z.string().min(1),
      plan: z.enum(['pro', 'enterprise']),
      billingPeriod: z.enum(['monthly', 'annual']).optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid checkout request');
    }

    const { organizationId, plan } = validation.data;
    if (!stripeService.isEnabled()) {
      const checkoutUrl = `https://checkout.auroraops.local/${plan}?org=${organizationId}`;
      res.json({ success: true, data: { checkoutUrl } });
      return;
    }

    const planName = plan === 'enterprise' ? 'ENTERPRISE' : 'PRO';
    const session = await stripeService.createCheckoutSession({
      organizationId,
      planName: planName as keyof typeof stripeService.PLANS,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?success=true`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
    });

    res.json({ success: true, data: { checkoutUrl: session.url, sessionId: session.sessionId } });
  })
);

/**
 * Get invoices
 * GET /api/billing/invoices/:organizationId
 */
router.get(
  '/invoices/:organizationId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const invoices = await Invoice.find({ organizationId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Invoice.countDocuments({ organizationId, deletedAt: null });

    res.json({
      success: true,
      data: invoices,
      pagination: paginationMeta(total, page, limit),
    });
  })
);

/**
 * Download invoice (placeholder)
 * GET /api/billing/invoices/:invoiceId/download
 */
router.get(
  '/invoices/:invoiceId/download',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: { url: null },
      message: 'Invoice download is not configured',
    });
  })
);

/**
 * Cancel subscription
 * POST /api/billing/subscriptions/:organizationId/cancel
 */
router.post(
  '/subscriptions/:organizationId/cancel',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params;
    const subscription = await Subscription.findOne({ organizationId, deletedAt: null });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (stripeService.isEnabled()) {
      await stripeService.cancelSubscription(subscription._id.toString());
    }

    res.json({ success: true, message: 'Subscription cancellation requested' });
  })
);

/**
 * Billing usage
 * GET /api/billing/usage/:organizationId
 */
router.get(
  '/usage/:organizationId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const organizationParam = req.params.organizationId;
    const organizationId = Array.isArray(organizationParam) ? organizationParam[0] : organizationParam;
    if (!organizationId) {
      throw new ValidationError('Organization ID is required');
    }
    const usage = await stripeService.getUsageStats(organizationId);
    res.json({ success: true, data: usage });
  })
);

/**
 * Update billing info
 * PUT /api/billing/billing-info/:organizationId
 */
router.put(
  '/billing-info/:organizationId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      billingName: z.string().min(1),
      billingEmail: z.string().email(),
      billingAddress: z.string().min(1),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid billing info');
    }

    const { organizationId } = req.params;
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      validation.data,
      { new: true }
    );

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    res.json({ success: true, data: organization });
  })
);

export default router;
