declare class EmailService {
    private transporter;
    private enabled;
    private fromEmail;
    constructor();
    /**
     * Check if email service is available
     */
    isEnabled(): boolean;
    /**
     * Send a simple HTML email
     */
    sendSimpleEmail(to: string, subject: string, html: string): Promise<boolean>;
    /**
     * Send welcome email
     */
    sendWelcomeEmail(to: string, name: string): Promise<boolean>;
    /**
     * Send email verification
     */
    sendVerificationEmail(to: string, name: string, verificationToken: string): Promise<boolean>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean>;
    /**
     * Send task assignment notification
     */
    sendTaskAssignmentEmail(to: string, assigneeName: string, taskTitle: string, projectName: string, taskUrl: string): Promise<boolean>;
    /**
     * Send team invitation email
     */
    sendTeamInvitationEmail(to: string, inviterName: string, organizationName: string, inviteUrl: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map