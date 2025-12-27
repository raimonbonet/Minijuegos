import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../../shared/email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private walletService: WalletService,
        private emailService: EmailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async googleLogin(req: any) {
        if (!req.user) {
            throw new InternalServerErrorException('No user from google');
        }

        let user = await this.usersService.findOneByGoogleId(req.user.googleId);
        let isNewUser = false;

        if (!user) {
            // Create user if it doesn't exist
            user = await this.usersService.create({
                email: req.user.email,
                googleId: req.user.googleId,
                nombre: req.user.firstName,
                apellidos: req.user.lastName,
                username: `user_${req.user.googleId.substr(0, 8)}`, // Generate a unique username
                profileCompleted: true,
            });

            isNewUser = true;

            // Initialize wallet for new user
            await this.walletService.createWallet(user.id);
        } else if (!user.profileCompleted) {
            // Ensure existing Google users have profileCompleted set
            user = await this.usersService.updateProfile(user.id, { profileCompleted: true });
        }

        return {
            message: 'User information from google',
            user,
            isNewUser,
            access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
        };
    }

    async getFullProfile(userId: string) {
        return this.usersService.findOne(userId);
    }

    async register(email: string, pass: string, username: string) {
        // Check if user already exists
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new InternalServerErrorException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        // Generate Verification Token (stateless)
        const verificationPayload = {
            email,
            username,
            passwordHash: hashedPassword,
            type: 'verification'
        };

        const token = this.jwtService.sign(verificationPayload, { expiresIn: '24h' });

        // Send Verification Email
        await this.emailService.sendVerificationEmail(email, username, token);

        return { message: 'Verification email sent' };
    }

    async verifyUser(token: string) {
        console.log('DEBUG: verifyUser called with token:', token.substring(0, 10) + '...');
        try {
            const payload = this.jwtService.verify(token);
            console.log('DEBUG: Token payload:', payload);

            if (payload.type !== 'verification') {
                console.error('DEBUG: Invalid token type:', payload.type);
                throw new Error('Invalid token type');
            }

            // Check if user exists (race condition check)
            const existingUser = await this.usersService.findOneByEmail(payload.email);
            if (existingUser) {
                return this.login(existingUser);
            }

            // Create User
            const user = await this.usersService.create({
                email: payload.email,
                password: payload.passwordHash,
                username: payload.username,
                nombre: null,
                apellidos: null,
                fechaNacimiento: null,
                sexo: null,
                dni: null,
                profileCompleted: false
            });

            // Initialize wallet
            await this.walletService.createWallet(user.id);

            // Login immediately
            return this.login(user);
        } catch (error) {
            throw new InternalServerErrorException('Invalid or expired verification token');
        }
    }

    async completeProfile(userId: string, data: {
        nombre: string;
        apellidos: string;
        fechaNacimiento: Date;
        dni: string;
        sexo: string;
        affiliateName?: string;
    }) {
        return this.usersService.updateProfile(userId, {
            ...data,
            profileCompleted: true
        });
    }

    async changeUsername(userId: string, newUsername: string) {
        const existingUser = await this.usersService.findOneByUsername(newUsername);
        if (existingUser && existingUser.id !== userId) {
            throw new InternalServerErrorException('El nombre de usuario ya está en uso');
        }

        return this.usersService.updateProfile(userId, {
            username: newUsername
        });
    }
}
