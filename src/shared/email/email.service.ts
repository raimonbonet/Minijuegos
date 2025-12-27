
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        // Configure transport based on environment variables
        // If no SMTP vars are present, it will default to a console logger mock in verify step,
        // but here we try to set it up for real usage.
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'user',
                pass: process.env.SMTP_PASS || 'pass',
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"No Reply" <noreply@example.com>',
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`Error sending email to ${to}`, error);
            // In dev, maybe we don't want to throw hard if SMTP isn't configured,
            // but for "making it work", logging the error is crucial.
        }
    }

    async sendWelcomeEmail(to: string, username: string) {
        const subject = 'Welcome to Our Platform!';
        const html = `
            <h1>Welcome, ${username}!</h1>
            <p>Thank you for registering with us.</p>
            <p>We are excited to have you on board.</p>
        `;
        return this.sendMail(to, subject, html);
    }

    async sendVerificationEmail(to: string, username: string, token: string) {
        const url = `http://localhost:5173/complete-profile?token=${token}`;
        const subject = 'Verify your Account';
        const html = `
            <h1>Hello ${username},</h1>
            <p>Please click the link below to verify your account and complete your profile:</p>
            <a href="${url}">Verify Account</a>
            <p>Or paste this link in your browser: ${url}</p>
        `;
        return this.sendMail(to, subject, html);
    }
}
