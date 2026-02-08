import { Router, Response } from 'express';
import { optionalAuthenticate, AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import emailService from '../services/email.service';
import logger from '../utils/logger';

const router = Router();

// Allow both authenticated and guest users
router.use(optionalAuthenticate);

/**
 * Contact Sales
 * POST /api/contact/sales
 */
router.post(
  '/sales',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subject, message, company } = req.body || {};

    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and message are required' });
      return;
    }

    const fromEmail = req.user?.email || 'guest@auroraops.local';
    const name = req.user ? `${(req as { user: { firstName?: string; lastName?: string } }).user.firstName || ''} ${(req as { user: { firstName?: string; lastName?: string } }).user.lastName || ''}`.trim() : 'Guest User';

    const html = `
      <h2>Contact Sales Inquiry</h2>
      <p><strong>From:</strong> ${name} (${fromEmail})</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    if (emailService.isEnabled()) {
      try {
        await emailService.sendSimpleEmail(
          process.env.SALES_EMAIL || 'sales@auroraops.com',
          `[Aurora Ops] ${subject}`,
          html
        );
        logger.info(`Sales inquiry sent from ${fromEmail}`);
      } catch {
        logger.warn('Failed to send sales email, logging only');
      }
    } else {
      logger.warn('Email service not configured; received sales inquiry');
      logger.info(html);
    }

    res.json({ success: true, message: 'Your message has been sent' });
  })
);

export default router;
