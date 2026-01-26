"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const helpers_1 = require("../utils/helpers");
const email_service_1 = __importDefault(require("../services/email.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Allow both authenticated and guest users
router.use(auth_middleware_1.optionalAuthenticate);
/**
 * Contact Sales
 * POST /api/contact/sales
 */
router.post('/sales', (0, helpers_1.asyncHandler)(async (req, res) => {
    const { subject, message, company } = req.body || {};
    if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }
    const fromEmail = req.user?.email || 'guest@auroraops.local';
    const name = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Guest User';
    const html = `
      <h2>Contact Sales Inquiry</h2>
      <p><strong>From:</strong> ${name} (${fromEmail})</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;
    if (email_service_1.default.isEnabled()) {
        try {
            await email_service_1.default.sendSimpleEmail(process.env.SALES_EMAIL || 'sales@auroraops.com', `[Aurora Ops] ${subject}`, html);
            logger_1.default.info(`Sales inquiry sent from ${fromEmail}`);
        }
        catch (err) {
            logger_1.default.warn('Failed to send sales email, logging only');
        }
    }
    else {
        logger_1.default.warn('Email service not configured; received sales inquiry');
        logger_1.default.info(html);
    }
    return res.json({ success: true, message: 'Your message has been sent' });
}));
exports.default = router;
//# sourceMappingURL=contact.routes.js.map