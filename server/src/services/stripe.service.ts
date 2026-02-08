import Stripe from 'stripe';
import config from '../config/env';
import logger from '../utils/logger';
import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import Project from '../models/Project';

class StripeService {
  private stripe: Stripe | null = null;
  private enabled: boolean = false;

  // Subscription plans
  public readonly PLANS = {
    FREE: {
      name: 'Free',
      price: 0,
      priceId: null,
      features: ['5 Projects', '10 Tasks per project', 'Basic Support'],
      limits: {
        projects: 5,
        tasksPerProject: 10,
        storageGB: 1,
      },
    },
    PRO: {
      name: 'Professional',
      price: 99,
      priceId: config.stripe.proPriceId,
      features: [
        'Unlimited Projects',
        'Unlimited Tasks',
        'AI Features',
        '24/7 Support',
        '100GB Storage',
        'Advanced Analytics',
      ],
      limits: {
        projects: -1,
        tasksPerProject: -1,
        storageGB: 100,
      },
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 299,
      priceId: config.stripe.enterprisePriceId,
      features: [
        'Everything in Professional',
        'Dedicated Account Manager',
        'Custom Integration',
        'SLA Guarantee',
        'Unlimited Storage',
        'White-label Options',
      ],
      limits: {
        projects: -1,
        tasksPerProject: -1,
        storageGB: -1, // unlimited
      },
    },
  };

  constructor() {
    if (config.stripe?.secretKey) {
      try {
        this.stripe = new Stripe(config.stripe.secretKey, {
          apiVersion: '2026-01-28.clover',
        });
        this.enabled = true;
        logger.info('✅ Stripe Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Stripe:', error);
        this.enabled = false;
      }
    } else {
      logger.warn('⚠️  Stripe API key not configured. Payment features will be disabled.');
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Create a customer in Stripe
   */
  async createCustomer(userData: {
    email: string;
    name: string;
    organizationId?: string;
  }): Promise<string | null> {
    if (!this.enabled || !this.stripe) {
      return null;
    }

    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          organizationId: userData.organizationId || '',
        },
      });

      logger.info(`Created Stripe customer: ${customer.id}`);
      return customer.id;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createCheckoutSession(data: {
    organizationId: string;
    planName: keyof typeof StripeService.prototype.PLANS;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    if (!this.enabled || !this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const plan = this.PLANS[data.planName];
    if (!plan.priceId) {
      throw new Error('Invalid plan selected');
    }

    try {
      const organizationId = data.organizationId;
      
      if (!organizationId) {
        throw new Error('Organization ID required');
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Create or get customer
      let customerId: string | undefined = organization.stripeCustomerId || undefined;
      if (!customerId) {
        const newCustomerId = await this.createCustomer({
          email: 'admin@' + organization.name.toLowerCase().replace(/\\s+/g, ''),
          name: organization.name,
          organizationId: data.organizationId,
        });

        if (newCustomerId) {
          customerId = newCustomerId;
          organization.stripeCustomerId = newCustomerId;
          await organization.save();
        } else {
          throw new Error('Failed to create Stripe customer');
        }
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId || undefined,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          organizationId: data.organizationId,
          planName: data.planName,
        },
      });

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Handle successful subscription creation
   */
  async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const organizationId = stripeSubscription.metadata.organizationId;
      const planName = stripeSubscription.metadata.planName as keyof typeof StripeService.prototype.PLANS;

      if (!organizationId || !planName) {
        logger.error('Missing metadata in subscription:', stripeSubscription.id);
        return;
      }

      // Create subscription record
      const subscription = await Subscription.create({
        organizationId: organizationId,
        plan: planName.toLowerCase(),
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
      });

      // Update organization
      await Organization.findByIdAndUpdate(organizationId, {
        plan: planName.toLowerCase(),
      });

      logger.info(`Subscription created: ${subscription._id} for org: ${organizationId}`);
    } catch (error) {
      logger.error('Error handling subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated
   */
  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSubscription.id },
        {
          status: stripeSubscription.status,
        }
      );

      logger.info(`Subscription updated: ${stripeSubscription.id}`);
    } catch (error) {
      logger.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted
   */
  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSubscription.id },
        { status: 'canceled' }
      );

      if (subscription) {
        // Downgrade organization to free plan
        await Organization.findByIdAndUpdate(subscription.organizationId, {
          plan: 'free',
        });
      }

      logger.info(`Subscription canceled: ${stripeSubscription.id}`);
    } catch (error) {
      logger.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Handle invoice paid
   */
  async handleInvoicePaid(stripeInvoice: Stripe.Invoice): Promise<void> {
    try {
      const subscriptionValue = stripeInvoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subscriptionValue === 'string' ? subscriptionValue : subscriptionValue?.id;

      if (!subscriptionId) {
        return;
      }

      const subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId,
      });

      if (!subscription) {
        logger.warn(`Subscription not found for invoice: ${stripeInvoice.id}`);
        return;
      }

      logger.info(`Invoice paid: ${stripeInvoice.id} for subscription: ${subscription._id}`);
    } catch (error) {
      logger.error('Error handling invoice paid:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment failed
   */
  async handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice): Promise<void> {
    try {
      const subscriptionValue = stripeInvoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subscriptionValue === 'string' ? subscriptionValue : subscriptionValue?.id;

      if (!subscriptionId) {
        return;
      }

      const subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId,
      });

      if (!subscription) {
        return;
      }

      logger.warn(
        `Invoice payment failed: ${stripeInvoice.id} for subscription: ${subscription._id}`
      );
    } catch (error) {
      logger.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.enabled || !this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      subscription.cancelAtPeriodEnd = true;
      await subscription.save();

      logger.info(`Subscription marked for cancellation: ${subscriptionId}`);
    } catch (error) {
      logger.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get customer portal URL
   */
  async createPortalSession(organizationId: string, returnUrl: string): Promise<string> {
    if (!this.enabled || !this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const organization = await Organization.findById(organizationId);
      if (!organization?.stripeCustomerId) {
        throw new Error('No Stripe customer found');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      logger.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Get organization usage stats
   */
  async getUsageStats(organizationId: string): Promise<{
    plan: string;
    limits: typeof StripeService.prototype.PLANS.FREE.limits;
    current: {
      projects: number;
      storageGB: number;
    };
    utilizationPercent: {
      projects: number;
      storage: number;
    };
  }> {
    const organization = await Organization.findById(organizationId)
      .lean();

    const planName = (organization?.plan || 'free').toUpperCase() as keyof typeof StripeService.prototype.PLANS;
    const plan = this.PLANS[planName] || this.PLANS.FREE;

    // Calculate current usage (simplified - you'd track this properly)
    const projects = await Project.find({ organizationId });
    const currentProjects = projects.length;
    const currentStorage = 0; // TODO: Calculate actual storage usage

    return {
      plan: planName,
      limits: plan.limits,
      current: {
        projects: currentProjects,
        storageGB: currentStorage,
      },
      utilizationPercent: {
        projects: plan.limits.projects === -1 ? 0 : (currentProjects / plan.limits.projects) * 100,
        storage: plan.limits.storageGB === -1 ? 0 : (currentStorage / plan.limits.storageGB) * 100,
      },
    };
  }
}

// Export singleton instance
export default new StripeService();
