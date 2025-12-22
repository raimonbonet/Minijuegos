import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private walletService: WalletService,
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
            return 'No user from google';
        }

        let user = await this.usersService.findOneByGoogleId(req.user.googleId);

        if (!user) {
            // Create user if it doesn't exist
            user = await this.usersService.create({
                email: req.user.email,
                googleId: req.user.googleId,
                name: `${req.user.firstName} ${req.user.lastName}`,
            });

            // Initialize wallet for new user
            await this.walletService.createWallet(user.id);
        }

        return {
            message: 'User information from google',
            user,
            access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
        };
    }

    async register(email: string, pass: string, name: string) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        const user = await this.usersService.create({
            email,
            password: hashedPassword,
            name,
        });

        // Initialize wallet
        await this.walletService.createWallet(user.id);

        const { password, ...result } = user;
        return result;
    }
}
