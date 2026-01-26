import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import config from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean = false;
  private fromEmail: string;

  constructor() {
    this.fromEmail = config.email.from;

    if (config.email.smtp.host && config.email.smtp.user && config.email.smtp.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.pass,
        },
      });

      this.enabled = true;
      logger.info('✅ Email Service initialized');
    } else {
      logger.warn('⚠️  Email service not configured - emails will not be sent');
    }
  }

  /**
   * Check if email service is available
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send a simple HTML email
   */
  async sendSimpleEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to} with subject: ${subject}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject: 'Welcome to Aurora Ops! 🚀',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Aurora Ops! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for joining Aurora Ops! We're excited to have you on board.</p>
                <p>Aurora Ops is your all-in-one platform for managing projects, tasks, and team collaboration in real-time.</p>
                <p><strong>Get started:</strong></p>
                <ul>
                  <li>Create your first organization</li>
                  <li>Invite team members</li>
                  <li>Set up your first project</li>
                  <li>Start managing tasks efficiently</li>
                </ul>
                <a href="${config.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Aurora Ops. All rights reserved.</p>
                <p>Need help? Contact us at support@auroraops.com</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, name: string, verificationToken: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Please verify your email address to complete your registration.</p>
                <a href="${verificationUrl}" class="button">Verify Email</a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                  Or copy and paste this link in your browser:<br>
                  ${verificationUrl}
                </p>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  This link will expire in 24 hours.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Aurora Ops. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Verification email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject: 'Reset Your Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>We received a request to reset your password for your Aurora Ops account.</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                  Or copy and paste this link in your browser:<br>
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Aurora Ops. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send task assignment notification
   */
  async sendTaskAssignmentEmail(to: string, assigneeName: string, taskTitle: string, projectName: string, taskUrl: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .task-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📌 New Task Assignment</h1>
              </div>
              <div class="content">
                <p>Hi ${assigneeName},</p>
                <p>You've been assigned a new task!</p>
                <div class="task-box">
                  <h3 style="margin-top: 0; color: #667eea;">${taskTitle}</h3>
                  <p><strong>Project:</strong> ${projectName}</p>
                </div>
                <a href="${taskUrl}" class="button">View Task</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Aurora Ops. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Task assignment email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending task assignment email:', error);
      return false;
    }
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitationEmail(to: string, inviterName: string, organizationName: string, inviteUrl: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `Aurora Ops <${this.fromEmail}>`,
        to,
        subject: `You've been invited to join ${organizationName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Team Invitation</h1>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Aurora Ops.</p>
                <p>Join your team to collaborate on projects, manage tasks, and boost productivity together.</p>
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  This invitation will expire in 7 days.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Aurora Ops. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Team invitation email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending team invitation email:', error);
      return false;
    }
  }
}

export default new EmailService();
