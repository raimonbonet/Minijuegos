
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
                from: process.env.SMTP_FROM || '"Zooplay" <info@zooplay.es>',
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
        const subject = '¡Bienvenido a Zooplay!';
        const html = `
            <h1>¡Hola, ${username}!</h1>
            <p>Gracias por registrarte y unirte a la diversión.</p>
            <p>Estamos emocionados de tenerte con nosotros en la arena de juegos.</p>
        `;
        return this.sendMail(to, subject, html);
    }

    async sendVerificationEmail(to: string, username: string, token: string, origin: string = process.env.FRONTEND_URL || 'http://localhost:5173') {
        const url = `${origin}/complete-profile?token=${token}`;
        const subject = 'Verifica tu cuenta en Zooplay';
        const html = `
            <h1>¡Hola ${username}!</h1>
            <p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta y completar tu perfil de jugador:</p>
            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #fbbf24; color: #1e1e1e; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 10px;">Verificar Cuenta</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">O pega este enlace en tu navegador: <br/>${url}</p>
        `;
        return this.sendMail(to, subject, html);
    }
}
