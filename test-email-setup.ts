
import * as nodemailer from 'nodemailer';
import 'dotenv/config';

// Load from .env.local if not loaded by default
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function sendTestEmail() {
    console.log('--- Configuración SMTP ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '******' : '(No definida)');

    if (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('YOUR_GMAIL_APP_PASSWORD')) {
        console.error('❌ ERROR: Debes configurar SMTP_PASS en .env.local con tu Contraseña de Aplicación de Google.');
        console.error('   Ve a: https://myaccount.google.com/apppasswords');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('📧 Enviando correo de prueba...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: 'raimonbonet@gmail.com', // Sending to self for test
            subject: 'Test Email from Project',
            html: '<h1>It Works!</h1><p>El sistema de correos está configurado correctamente.</p>',
        });
        console.log('✅ Correo enviado:', info.messageId);
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
    }
}

sendTestEmail();
