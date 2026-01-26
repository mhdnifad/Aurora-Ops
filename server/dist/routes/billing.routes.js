"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
/**
 * Get billing plans
 * GET /api/billing/plans
 */
router.get('/plans', (0, helpers_1.asyncHandler)(async (_req, res) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            description: 'Perfect for individuals and small teams getting started',
            price: 0,
            currency: 'USD',
            billingPeriod: 'month',
            features: [
                { name: 'Up to 3 team members', included: true },
                { name: 'Up to 5 projects', included: true },
                { name: 'Unlimited tasks', included: true },
                { name: 'Basic reporting', included: true },
                { name: 'Email support', included: true },
                { name: 'Advanced analytics', included: false },
                { name: 'Priority support', included: false },
                { name: 'Custom integrations', included: false },
            ],
            popular: false,
        },
        {
            id: 'pro',
            name: 'Professional',
            description: 'For growing teams that need more power and flexibility',
            price: 29,
            currency: 'USD',
            billingPeriod: 'month',
            features: [
                { name: 'Up to 20 team members', included: true },
                { name: 'Unlimited projects', included: true },
                { name: 'Unlimited tasks', included: true },
                { name: 'Advanced reporting', included: true },
                { name: 'Priority email support', included: true },
                { name: 'Advanced analytics', included: true },
                { name: 'Custom fields', included: true },
                { name: 'Custom integrations', included: false },
            ],
            popular: true,
        },
        {
            id: 'business',
            name: 'Business',
            description: 'For large teams requiring enterprise-grade features',
            price: 99,
            currency: 'USD',
            billingPeriod: 'month',
            features: [
                { name: 'Unlimited team members', included: true },
                { name: 'Unlimited projects', included: true },
                { name: 'Unlimited tasks', included: true },
                { name: 'Advanced reporting', included: true },
                { name: '24/7 priority support', included: true },
                { name: 'Advanced analytics', included: true },
                { name: 'Custom fields', included: true },
                { name: 'Custom integrations', included: true },
                { name: 'Dedicated account manager', included: true },
                { name: 'SLA guarantee', included: true },
                { name: 'SSO/SAML authentication', included: true },
            ],
            popular: false,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Custom solutions for large organizations',
            price: null,
            currency: 'USD',
            billingPeriod: 'custom',
            features: [
                { name: 'Everything in Business', included: true },
                { name: 'Custom pricing', included: true },
                { name: 'Dedicated infrastructure', included: true },
                { name: 'Advanced security features', included: true },
                { name: 'Custom contract terms', included: true },
                { name: 'On-premise deployment option', included: true },
                { name: 'Personalized onboarding', included: true },
                { name: 'Compliance support', included: true },
            ],
            popular: false,
        },
    ];
    res.json({
        success: true,
        data: plans,
    });
}));
/**
 * Get current subscription
 * GET /api/billing/subscription
 */
router.get('/subscription', (0, helpers_1.asyncHandler)(async (_req, res) => {
    // Mock subscription data
    const subscription = {
        planId: 'free',
        planName: 'Free',
        status: 'active',
        startDate: new Date('2026-01-01'),
        renewalDate: null,
        cancelledAt: null,
        usage: {
            teamMembers: 1,
            projects: 2,
            tasks: 15,
            storage: '125 MB',
        },
        limits: {
            teamMembers: 3,
            projects: 5,
            tasks: null,
            storage: '1 GB',
        },
    };
    res.json({
        success: true,
        data: subscription,
    });
}));
/**
 * Create checkout session (mock)
 * POST /api/billing/checkout
 */
router.post('/checkout', (0, helpers_1.asyncHandler)(async (req, res) => {
    const { planId } = req.body || {};
    if (!planId) {
        return res.status(400).json({ success: false, message: 'planId is required' });
    }
    const checkoutUrl = `https://checkout.auroraops.local/${planId}?user=${req.user?.email || 'guest'}`;
    return res.json({ success: true, data: { checkoutUrl } });
}));
exports.default = router;
//# sourceMappingURL=billing.routes.js.map