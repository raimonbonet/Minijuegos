import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private walletService;
    constructor(usersService: UsersService, jwtService: JwtService, walletService: WalletService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    googleLogin(req: any): Promise<"No user from google" | {
        message: string;
        user: {
            name: string | null;
            email: string;
            password: string | null;
            id: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    register(email: string, pass: string, name: string): Promise<{
        name: string | null;
        email: string;
        id: string;
        googleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
